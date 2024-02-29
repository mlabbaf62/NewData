

function StartBusy(PDivName, Ptext) {

    var tmpDiv = '#' + PDivName;
    if (Ptext == undefined)
        Ptext = "";

    var c = PDivName + 'Busy';
    var ShC = '#' + c;
    if (jQuery(tmpDiv).find(ShC).attr('id') != c) {
        jQuery(tmpDiv).append('<div class="MainDivBusy " id="' + c + '" style="display:none"><div><img class="busyImgPos" height="40" src="image/ajax-loader.gif"><div class="TextBusy ">' + Ptext + '</div></div><div class="bg"></div></div>');
    }

    jQuery(ShC).css({
        'width': '100%',
        'height': '100%',
        'position': 'fixed',
        'z-index': '10000000',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'margin': 'auto'
    });

    jQuery(ShC + ' .bg').css({
        'background': '#67A098',
        'opacity': '0.7',
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'top': '0'
    });

    jQuery(ShC + '>div:first').css({
        //'width': '250px',
        'height': '75px',
        'text-align': 'center',
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'margin': 'auto',
        'font-size': '16px',
        'z-index': '10',
        'color': 'black'

    });

    jQuery(ShC + ' .bg').height('100%');
    jQuery(ShC).fadeIn(300);
    jQuery(tmpDiv).css('cursor', 'wait');
}


function StopBusy(PDivName) {
    var tmpDiv = '#' + PDivName;
    var c = PDivName + 'Busy';
    var ShC = '#' + c;
    jQuery(ShC + ' .bg').height('100%');
    jQuery(ShC).fadeOut(300);
    jQuery(tmpDiv).css('cursor', 'default');
}
var timer = null;

function StartBusyCheckMark(PDivName, Ptext) {

    var tmpDiv = '#' + PDivName;
    if (Ptext == undefined)
        Ptext = "";

    var c = PDivName + 'Busy';
    var ShC = '#' + c;
    if (jQuery(tmpDiv).find(ShC).attr('id') != c) {
        //sh
        //jQuery(tmpDiv).append('<div class="MainDivBusy" id="' + c + '" style="display:none"><div><img class="busyImgPos" src="Images/ajax-loader.gif"><div class="TextBusy "><p id="BusyCheckMarkStep"> ' + Ptext.length + '  / 1 </p><p id="BusyCheckMarktxt" class="blink_me">' + Ptext[0] + '</p></div></div><div class="bg"></div></div>');
        //labaf
        jQuery(tmpDiv).append('<div class="MainDivBusy" id="' + c + '" style="display:none"><div><img class="busyImgPos" src="Images/ajax-loader.gif"><div class="TextBusy "><p class="blink_me">' + Ptext + '</p></div></div><div class="bg"></div></div>');

    }
    //sh
    //var yy = $('#BusyCheckMarktxt');
    //var step = $('#BusyCheckMarkStep');
    //var index = 0;
    //var interval = 2000;
    //try {
    //    var myVar = setInterval(function () {
    //        //timer = myVar;
    //        if (index > Ptext.length - 2) {
    //            clearInterval(myVar);
    //        }
    //        else {
    //            index += 1;
    //            yy["0"].innerHTML = Ptext[index];
    //            step["0"].innerHTML =  Ptext.length+" / " + (index+1);
    //         }
    //    }, interval);
    //} catch (e) {
    //    alert(e)
    //}



    //labaf
    //var yy = $('.TextBusy').children("p");
    //var index = -1;
    //yy[0].className = "blink_me";
    //var interval = 2000;
    //var myVar = setInterval(function () {
    //    timer = myVar;
    //    if (index >= yy.length - 2) {
    //        clearInterval(myVar);
    //        // yy[index + 1].className = "";
    //    }
    //    else {
    //        index += 1;
    //        yy[index].className = "";
    //        yy[index].className = ('TextBusyCurrent');

    //        yy[index + 1].className = "blink_me";

    //        this.img = document.createElement("img");
    //        this.img.src = "Images/tik.png";
    //        this.img.tagName = "BusyTik";
    //        yy[index].appendChild(this.img);
    //    }
    //    //myVar.interval = 2000;
    //}, interval);
    var yy = $('.TextBusy').children("p");
    var index = -1;
    yy[0].className = "blink_me";
    var interval = 2000;
    var myVar = setInterval(function () {
        timer = myVar;
        if (index >= yy.length - 2) {
            clearInterval(myVar);
            // yy[index + 1].className = "";
        }
        else {
            index += 1;
            yy[index].className = "";
            yy[index].className = 'TextBusyCurrent';
            // Internet Explorer 6-11
            isIE = /*@cc_on!@*/false || !!document.documentMode;
            if (!isIE)
                yy[index + 1].className = "blink";
            else
                yy[index + 1].className = "blinknoie";

            //console.log(index);

            this.img = document.createElement("img");
            this.img.src = "Images/tik.png";
            this.img.tagName = "BusyTik";
            if (index > 0)
                yy[index].appendChild(this.img);
        }
        //myVar.interval = 2000;
    }, interval);

    jQuery(ShC).css({
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'z-index': '10000000',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'margin': 'auto'
    });

    jQuery(ShC + ' .bg').css({
        'background': '#67A098',
        'opacity': '0.7',
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'top': '0'
    });

    jQuery(ShC + '>div:first').css({
        //'width': '560px',
        //'height': '75px',
        'text-align': 'center',
        'padding': '15px',
        'position': 'absolute',
        'top': '20%',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'margin': 'auto',
        'font-size': '12px',
        'z-index': '10',
        'color': 'black'

    });

    jQuery(ShC + ' .bg').height('100%');
    jQuery(ShC).fadeIn(300);
    jQuery(tmpDiv).css('cursor', 'wait');
}

function StopBusyCheckMark(PDivName) {


    var tmpDiv = '#' + PDivName;
    var c = PDivName + 'Busy';
    var ShC = '#' + c;

    $(ShC + " img").remove();
    $('.TextBusy').children("p").removeClass("blink_me");

    jQuery(ShC + ' .bg').height('100%');
    jQuery(ShC).fadeOut(300);
    jQuery(tmpDiv).css('cursor', 'default');

    clearInterval(timer);

    // $(ShC).find("img").children;
}
function StartBusyTimer(PDivName, Ptext) {

    var tmpDiv = '#' + PDivName;
    var left = jQuery(tmpDiv).position().left;
    var top = jQuery(tmpDiv).position().top;
    var height = jQuery(tmpDiv).height();

    if (Ptext == undefined)
        Ptext = "";

    var c = PDivName + 'Busy';
    var ShC = '#' + c;
    if (jQuery(tmpDiv).find(ShC).attr('id') != c) {
        jQuery(tmpDiv).append('<div id="' + c + '" style="display:none"><div><img src="Images/ajax-loader.gif"><div>' + Ptext + '</div></div><div class="bg"></div></div>');
    }

    jQuery(ShC).css({
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'z-index': '10000000',
        'top': 0,
        'left': left,
        'right': '0',
        'bottom': '0',
        'margin': 'auto'
    });

    jQuery(ShC + ' .bg').css({
        'background': '#67A098',
        'opacity': '0.7',
        'width': '100%',
        'height': '100%',
        'position': 'absolute',
        'top': 0,
    });

    jQuery(ShC + '>div:first').css({
        'width': '250px',
        'height': '75px',
        'text-align': 'center',
        'position': 'absolute',
        'top': 0,
        'left': '0',
        'right': '0',
        'bottom': '0',
        'margin': 'auto',
        'font-size': '16px',
        'z-index': '10',
        'color': '#ffffff'

    });

    jQuery(ShC + ' .bg').height('100%');
    jQuery(ShC).fadeIn(300);
    jQuery(tmpDiv).css('cursor', 'wait');

    var myVar = setInterval(function () {
        StopBusy(PDivName);
        clearInterval(myVar);
    }, 2000);

}


