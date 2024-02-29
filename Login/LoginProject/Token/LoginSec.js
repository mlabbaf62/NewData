var TryDetectFace = 1;
var RecognizeIndex = 0;
var isInServiceCall = false;

function DetectToken() {
    StartBusyTimer('form1', 'در حال شناسایی شناسه');
    var tmpNovin = GetTokenSerial();
    if (tmpNovin != '')
        TokenComplete(tmpNovin, tmpNovin);
    else
        CheckToken('1234');
}
var Result = new Array(8);
function TokenComplete(e, pAr) {
    $('#txtToken').val(e);
    Result = pAr;

    $('#hfToken').val(Result);
}
var FaceSession = "";
// A $( document ).ready() block.
$(document).ready(function () {
    FaceSession = SafaSecurity.GetRequestId();
});
////////////////////////////////////////////////////////Camera
window.initCamera = function () {

    //UserFaceStr = "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";

    //ShowImage(UserFaceStr);
    //return;

    var LoginDiv = document.getElementById('LoginDiv');
    var divFace = document.getElementById('face');
    var showCamera = function () {
        //LoginDiv.style.display= 'none';
        // LoginDiv.width = '0';
        // LoginDiv.height= '0';
        $('#face').show("slow");
        isInServiceCall = false;
        // divFace.style.display = '';
    };
    window.hideCamera = function () {
        //  LoginDiv.style.display = 'block';
        $('#face').hide(500);
        isInServiceCall = true;

        window.faceDetector.stop();
    };
    if (!window.faceDetector) {
        divFace.addEventListener('facedetected', function (event) {
            ShowImage(event.detail.face64);
        });
        window.faceDetector = new FaceDetector({ divContainer: divFace, blinksThreshold: 0 });
    }
    showCamera();

    window.ShowMessage = function (m) {
        document.getElementById("lMessage").textContent = m;
    };
};



window.initCameraNew = function () {
    RecognizeIndex = 0;

    var LoginDiv = document.getElementById('LoginDiv');
    var divFace = document.getElementById('face');
    var showCamera = function () {

        $('#face').show("slow");
        isInServiceCall = false;
        $('iframe').show();
        $('iframe').parent().show();

        try {
            var tmpFrame = document.getElementsByTagName('iframe');
            if (tmpFrame != null) {
                var tmpFrameContent = tmpFrame[0].contentWindow;
                tmpFrameContent.StartCapture();
            }
        }
        catch (e) { }
    };
    window.hideCamera = function () {

        $('#face').hide(500);
        $('iframe').hide();
        $('iframe').parent().hide();
        var tmpFrame = document.getElementsByTagName('iframe');
        if (tmpFrame != null) {
            var tmpFrameContent = tmpFrame[0].contentWindow;
            tmpFrameContent.StopCapture();
        }
    };

    showCamera();


    StartCapture();
};
function hideCameraAndShowImage(pImage) {

    $('#face').hide(500);
    $('iframe').hide();
    $('iframe').parent().hide();
    GetFrame().StopCapture();

    ShowImage(pImage);
}

var isInServiceCall = false;
var UserFaceStr = "";

function ShowImage(pFaceStr) {
    var Base64 = 'data:image/png;base64,' + pFaceStr;
    $('#imgFace').prop('src', Base64);
    $('#imgFace').show();
    $("#hfImg").val(pFaceStr);
}

function ServiceCall(pFaceStr) {

    if (!isInServiceCall) {
        if (CheckFaceDetection(pFaceStr)) {
            RecognizeIndex++;
            var Base64 = 'data:image/png;base64,' + pFaceStr;
            UserFaceStr = pFaceStr;
            RecognizeFace(pFaceStr);
        }
    }
}
function CheckFaceDetection(pImageStr) {

    if (TryDetectFace <= RecognizeIndex) {
        hideCameraAndShowImage(pImageStr);
        return false;
    }
    else return true;
}



function RecognizeFace(pImageStr) {

    // SafaSecurity.RecognizeFace(pImageStr);
    //return;
    $('#Waiting1').show();

    isInServiceCall = true;
    var d = { pFaceStr: pImageStr, pSessionID: FaceSession };
    var c = JSON.stringify(d);
    $.ajax({
        type: "POST",
        url: AppConfig.Params.SecurityUrl + "RecognizeFaceWithSession",
        data: c,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            $('#Waiting1').hide();

            RecognizeIndex++;
            isInServiceCall = false;
            if (response != null && response != "") {
                //FaceSession = response;

                $('trUserName').prop('disabled');
                $('#FaceErrorMessage').text('چهره شناسایی شد ، رمز عبور را وارد نمایید');
                $('#FaceErrorMessage').css('color', 'green');
                hideCameraAndShowImage(pImageStr);
                $("#trUserName").prop("disabled", true);
            }
            else {
                $('#FaceErrorMessage').text('چهره شناسایی نشد');
                $('#FaceErrorMessage').css('color', 'red');
                ShowImage(pImageStr);
                GetFrame().reset();
                CheckFaceDetection(pImageStr);
            }
        },
        failure: function (response) {
            alert(response.d);
        }
    });
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function Login() {

    var tmpUserName = $('#txtUserName').val();
    var tmpPassword = $('#txtPassword').val();

    if (tmpUserName == '' || tmpPassword == '') {
        $('#LMessage').text('لطفا اطلاعات را وارد نمایید');
        return;
    }
    var tmpToken = $('#hfToken').val();

    if (tmpToken != "")
        tmpToken = tmpToken.replaceAll(",", "$");

    var tmpCustomCredential = FaceSession;
    tmpCustomCredential += '#' + tmpToken;

    if (UserFaceStr != "")
        tmpCustomCredential += "#True";

    $('#LMessage').text('');
    StartBusy('LoginDiv', 'در حال احراز هویت');

    SafaSecurity.Login(tmpUserName, tmpPassword, tmpCustomCredential, function (a) {
        if (a.Result) {
            $('#LMessage').text(tmpMes);
            $('#LMessage').css('color', 'green');

            //DoLogin(tmpUserName, FaceSession);

            SafaSecurity.CheckOtherUserLogin(tmpUserName, FaceSession, function (res) {
                StopBusy('LoginDiv');
                if (res.User != null)
                    DoAfterLogin(res.User.GUID, '(' + res.User.UserName + ')' + ' ' + res.User.FirstName + ' ' + res.User.LastName, FaceSession);
                else
                    $('#LMessage').text('نام کاربری یا کلمه عبور اشتباه است');
            });

        } else {
            StopBusy('LoginDiv');
            var tmpRes = $.parseXML(a.Message.responseText);
            var tmpMessage = $(tmpRes).find('p')[1].innerHTML;
            var i1 = tmpMessage.indexOf("'");
            var i2 = tmpMessage.lastIndexOf("'");
            var tmpMes = tmpMessage.substring(i1 + 1, i2);

            if (tmpMes != '')
                $('#LMessage').text(tmpMes);//'نام کاربری یا کلمه عبور اشتباه است');
            else
                $('#LMessage').text('نام کاربری یا کلمه عبور اشتباه است');
        }
    }, function (a) {
    }, false, tmpCustomCredential, FaceSession);
}

function LoginSSO() {

    var tmpUserName = $('#txtUserName').val();
    var tmpPassword = $('#txtPassword').val();

    if (tmpUserName == '') {
        $('#LMessage').text('نام کاربری را وارد نمایید');
        return;
    }
    if (tmpPassword == '') {
        $('#LMessage').text('رمز عبور را وارد نمایید');
        return;
    }

    var tmpToken = $('#hfToken').val();

    if (tmpToken != "")
        tmpToken = tmpToken.replaceAll(",", "$");

    var tmpCustomCredential = FaceSession;
    tmpCustomCredential += '#' + tmpToken;

    if (UserFaceStr != "")
        tmpCustomCredential += "#True";

    $('#LMessage').text('');
    StartBusy('LoginDiv', 'در حال احراز هویت');

    SafaSecurity.Login(tmpUserName, tmpPassword, tmpCustomCredential, function (a) {
        StopBusy('LoginDiv');
        if (a.Result) {
            $('#LMessage').text(tmpMes);
            $('#LMessage').css('color', 'green');

            //TrueLogin
            var tmpReturnUrl = getParameterByName('ReturnUrl');
            if (tmpReturnUrl == null || tmpReturnUrl == '') {
                alert('مقدار برگشتی تعریف نشده است');
                $('#LMessage').text('ورود با موفقیت انجام شد');
            }
            else {
                var simbol = '?';
                if (tmpReturnUrl.indexOf('?') > -1)
                    simbol = '&';
                window.open(tmpReturnUrl + simbol + 'Ticket=' + FaceSession, '_self');
            }

        } else {
            var tmpRes = $.parseXML(a.Message.responseText);
            var tmpMessage = $(tmpRes).find('p')[1].innerHTML;
            var i1 = tmpMessage.indexOf("'");
            var i2 = tmpMessage.lastIndexOf("'");
            var tmpMes = tmpMessage.substring(i1 + 1, i2);
            $('#LMessage').css('color', 'red');
            if (tmpMes != '')
                $('#LMessage').text(tmpMes);//'نام کاربری یا کلمه عبور اشتباه است');
            else
                $('#LMessage').text('نام کاربری یا کلمه عبور اشتباه است');
        }
    }, function (a) {
    }, false, tmpCustomCredential, FaceSession);
}

function DoLogin(pUserName, pSessionID) {
    StartBusy('LoginDiv', 'در حال دریافت اطلاعات کاربر');
    var d = { pFaceStr: UserFaceStr, UserName: pUserName, pSessionID: pSessionID };
    var c = JSON.stringify(d);
    $.ajax({
        type: "POST",
        url: "SafaLoginMainSec.aspx/DoLogin",
        data: c,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            StopBusy('LoginDiv');
            if (response.d != null && response.d != "") {
                window.open(response.d, '_self');
            }
            else {
                $('#LMessage').text(response.d);
            }
        },
        failure: function (response) {
            alert(response.d);
            StopBusy('LoginDiv');
        }
    });
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function DoAfterLogin(pUserGuid, pFullName, pSessionID) {

    StartBusy('LoginDiv', 'در حال ارجاع به سایت اصلی');

    var tmpDomain = getParameterByName('Domain');

    var d = { pUserGuid: pUserGuid, pFullName: pFullName, pSessionID: pSessionID, Domain: tmpDomain };
    var c = JSON.stringify(d);
    $.ajax({
        type: "POST",
        url: "SafaLoginMainSec.aspx/DoAfterLogin",
        data: c,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            StopBusy('LoginDiv');
            if (typeof(Config) != 'undefined' && Config.NewCamReturnUrl != undefined)
                window.open(Config.NewCamReturnUrl, '_self');
            else if (response.d != null && response.d != "") {
                window.open(response.d, '_self');
            }
            else {
                $('#LMessage').text(response.d);
            }
        },
        failure: function (response) {
            alert(response.d);
            StopBusy('LoginDiv');
        }
    });
}


function LoginTest() {
    var d = { username: "saw", password: "123", customCredetial: "4b13e58f-68a3-4bae-affe-26e11e3e5322", isPersistent: false };
    var c = JSON.stringify(d);
    $.ajax({
        type: "POST",
        url: "http://localhost/Security8.Web/service/Authentication.svc/json/Login",
        data: c,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {

            var tt = response;

        },
        error: function (response) {
            alert(response);
        }
    });
}

function GetFrame() {
    var tmpFrame = document.getElementsByTagName('iframe');
    if (tmpFrame != null) {
        if (tmpFrame[0] != null) {
            var tmpFrameContent = tmpFrame[0].contentWindow;
            return tmpFrameContent;
        }
        else return null;
    }
    else return null;
}