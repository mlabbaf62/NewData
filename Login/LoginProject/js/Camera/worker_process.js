importScripts('jsfeat.js');
importScripts('objectdetect.js');
importScripts('cv.min.js');
importScripts('objectdetect.frontalface_default.js');
importScripts('objectdetect.eye2.js');
importScripts('jsfeat_haar_eye.js');

var FACE_MIN_LENGTH = 180;
var EYE_MIN_LENGTH = 5;

var detectorFace;

var detectEyeRects = function (imageData, faceRect) {
    var faceCropGray = toGrayscale(cropImageData(imageData, faceRect[0], faceRect[1], faceRect[2], Math.round(faceRect[3] / 2)));
    jsfeat.imgproc.equalize_histogram(faceCropGray, faceCropGray);
    jsfeat.imgproc.gaussian_blur(faceCropGray, faceCropGray, 3, 0);
    var ii_sum = new Int32Array((faceRect[2] + 1) * (faceRect[3] + 1));
    var ii_sqsum = new Int32Array((faceRect[2] + 1) * (faceRect[3] + 1));
    jsfeat.imgproc.compute_integral_image(faceCropGray, ii_sum, ii_sqsum, null);
    var rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, null, null, faceCropGray.cols, faceCropGray.rows, jsfeat.haar.eye, 1.15, 2);
    rects = jsfeat.haar.group_rectangles(rects, 1);
    var eyeRects = [];
    for (var j = 0; j < rects.length; j++)
        eyeRects.push([
            Math.round(rects[j].x + rects[j].width / 8),
            Math.round(rects[j].y + rects[j].height / 4),
            Math.round(rects[j].width * 3 / 4),
            Math.round(rects[j].height / 2)]);
    return eyeRects;
};

var getEyeBlobs = function (imageData) {
    var blobs = [];
    var gray = toGrayscale(imageData);
    jsfeat.imgproc.equalize_histogram(gray, gray);
    jsfeat.imgproc.gaussian_blur(gray, gray, 8, 0);
    var binary = toBinary(gray, 0, 20);
    var cc = getConnectedComponents(binary, 50);
    for (var k = 0; k < cc.length; k++) {
        rectRound(cc[k].bbox);
        //console.log(cc[k].bbox[2] + ' ' + cc[k].bbox[3] + ' ' + (imageData.height / cc[k].bbox[3]) + ' ' + (cc[k].bbox[2] / cc[k].bbox[3]));
        if (cc[k].bbox[2] < EYE_MIN_LENGTH || cc[k].bbox[3] < EYE_MIN_LENGTH || imageData.height / cc[k].bbox[3] < 2.0 || cc[k].bbox[2] / cc[k].bbox[3] > 1.5) continue;
        blobs.push(cc[k]);
    }
    for (var k = blobs.length - 1; k > 0; k--) {
        if (blobs[k - 1].centroid.y > blobs[k].centroid.y)
            blobs[k - 1] = blobs[k];
        blobs.splice(k, 1);
    }
    return blobs;
};

var getEye = function (imageData, faceRect, eyeRect) {
    return {
        rect: eyeRect,
        blobs: getEyeBlobs(cropImageData(imageData, eyeRect[0] + faceRect[0], eyeRect[1] + faceRect[1], eyeRect[2], eyeRect[3]))
    }
};

var filterEyes = function (faceRect, eyes) {
    var hw = faceRect[2] / 2;
    for (var j = eyes.length - 1; j >= 0; j--) {
        for (var k = j - 1; k >= 0; k--) {
            if ((getRectCenter(eyes[k].rect)[0] < hw && getRectCenter(eyes[j].rect)[0] < hw) ||
                (getRectCenter(eyes[k].rect)[0] > hw && getRectCenter(eyes[j].rect)[0] > hw)) {
                if (eyes[k].blobs.length > 0 && eyes[j].blobs.length === 0) {
                    eyes.splice(j, 1);
                    break;
                }
                else if (eyes[j].blobs.length > 0 && eyes[k].blobs.length === 0) {
                    eyes[k] = eyes[j];
                    eyes.splice(j, 1);
                    break;
                }
                else if (eyes[k].rect[1] + eyes[k].rect[3] > eyes[j].rect[1] + eyes[j].rect[3]) {
                    eyes.splice(j, 1);
                    break;
                }
                else if (eyes[k].rect[1] + eyes[k].rect[3] < eyes[j].rect[1] + eyes[j].rect[3]) {
                    eyes[k] = eyes[j];
                    eyes.splice(j, 1);
                    break;
                }
            }
        }
    }
    var result = eyes.slice(0, 2);
    if (result.length === 2 && getRectCenter(result[1].rect)[0] < getRectCenter(result[0].rect)[0]) {
        var tmpEye = result[0];
        result[0] = result[1];
        result[1] = tmpEye;
    }
    return result;
};

addEventListener('message', function (event) {

    var start = new Date();
    var imageData = event.data.imageData;
    var isSilverlight = event.data.isSilverlight;
    var silverData = event.data.silverData;
    var faces = [];
    var faceRects = [];

    if (!isSilverlight) {
        if (!detectorFace)
            detectorFace = new objectdetect.detector(imageData.width, imageData.height, 1.3, objectdetect['frontalface_default']);
        faceRects = detectorFace.detect(imageData.data, 2, 1, null, true);
        for (var i = 0; i < faceRects.length; i++)
            rectRound(faceRects[i]);
        groupRects(faceRects);
    } else {
        for (var i = 0; i < silverData.faces.length; i++)
            faceRects.push(silverData.faces[i].rect);
    }

    for (var i = 0; i < faceRects.length; i++) {
        if (faceRects[i][2] < FACE_MIN_LENGTH || faceRects[i][3] < FACE_MIN_LENGTH) continue;
        var eyes = [];
        if (!isSilverlight) {
            var eyeRects = detectEyeRects(imageData, faceRects[i]);
            groupRects(eyeRects);
            for (var j = 0; j < eyeRects.length; j++)
                eyes.push(getEye(imageData, faceRects[i], eyeRects[j]));
        } else {
            for (var j = 0; j < silverData.faces[i].eyes.length; j++)
                eyes.push(getEye(imageData, faceRects[i], silverData.faces[i].eyes[j].rect));
        }

        faces.push({ rect: faceRects[i], eyes: filterEyes(faceRects[i], eyes) });
    }

    postMessage({ startTime: start, endTime: new Date(), faces: faces });

}, false);
