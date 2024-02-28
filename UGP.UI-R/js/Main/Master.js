var version = 103;


var AccountInfo = null;

var EumPage = {
    Start: "Start",
    Select: "Select",
    SelectNo: "SelectNo",
    Savabegh: "Savabegh",
    WorkFlow: "WorkFlow",
    Account: "Account",
    Upload: "Upload",
    Avarez: "Avarez",
    AvarezDaramad: "AvarezDaramad",
    SaveRequest: "SaveRequest",
    SelectBazdid: "SelectBazdid",
    PPayKarshenasi: "PPayKarshenasi",
    ElamZabete: "ElamZabete",
    ShFani: "ShFani",
    ShZabete: "ShZabete",
    Tavafoghat: "Tavafoghat",
    Zavabet: "Zavabet",
    ShZabeteYazd: "ShZabeteYazd",
    Estelam: "Estelam",
    Export: "Export",

    Mokatebat: "Mokatebat",
    ArchitectMaps: "ArchitectMaps",
    Commission: 'Commission',
    PishFactor: 'PishFactor',
    CheckShahrsaz: 'CheckShahrsaz',
    Engineer: "Engineer",
    EngineerInfo: 'EngineerInfo',
    EngineerYazdDafater: 'EngineerYazdDafater',
    EngineerQuata: 'EngineerQuata',
    MapControl: 'MapControl',
    Bime: 'Bime',
    UploadNewNosazi: 'UploadNewNosazi',
    GetNewNosaziCode: 'GetNewNosaziCode',
};

var UpBtHideForce = false;
var IsSharNamaRun = false;
//--------------------------------------Menu
if (typeof App === "undefined")
    App = angular.module('App', []);

//--------------------------------------Menu
function CheckMapHeight() {

    var tmpTopheigth = $('#DivTop').height();
    var tmpTop1heigth = $('#DivTop1').height();

    if (tmpTopheigth == null) {
        tmpTopheigth = $('#MainGam').height();
        if (tmpTopheigth == null)
            tmpTopheigth = 200;
    }
    tmpTopheigth = tmpTopheigth + tmpTop1heigth;

    var tmpHeaderheigth = $('#MainHeader').height();

    var DivStep = $("#divStep").height();

    var bodyHeight = $("body").height();
    var tmpMapHeight = bodyHeight - (tmpHeaderheigth + tmpTopheigth + DivStep + 50);
    if (tmpMapHeight > 300 && !$('#m').hasClass('fix')) {
        {
            $('#m').height(tmpMapHeight);
            if ($('#m1').length > 0)
                $('#m1').height(tmpMapHeight);
        }
    }
    MyMap.DoResize();
}
try {

    function CheckBrowser() {
        var tmpWindowMode = "width=700,height=500";
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            window.open('uBrowser.aspx?b=Opera', '_blank', tmpWindowMode);
        } else if (navigator.userAgent.indexOf("Chrome") != -1) {
            window.open('uBrowser.aspx?b=Chrome', '_blank', tmpWindowMode);
        } else if (navigator.userAgent.indexOf("Safari") != -1) {
            window.open('uBrowser.aspx?b=Safari', '_blank', tmpWindowMode);
        } else if (navigator.userAgent.indexOf("Firefox") != -1) {
            window.open('uBrowser.aspx?b=Firefox', '_blank', tmpWindowMode);
        } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
        {
            if (document.documentMode < 11)
                window.open('uBrowser.aspx?b=IE' + document.documentMode, '_blank', tmpWindowMode);
        } else {

        }
    }
    $(window).resize(function () {
        try {
            var tmpHeaderheigth = $('#MainHeader').height();
            $("body").get(0).style.setProperty("--Headerheight2", tmpHeaderheigth + 20 + 'px');
            MyMap.DoResize();

            CheckMapHeight();
        }
        catch (ex) {

        }
    });

    LoadSelected();
} catch (ex) { }

function getBaseUrl() {
    if (window.location.href.indexOf('Config/Pages') > -1) {
        var tmpU = window.location.href.match(/^.*\//)[0];
        tmpU = (tmpU).replace('Config/Pages/', '');
        return tmpU;
    }
    else
        return '';
}
function ShowPage(page, pTarget, pShowAfterLogin, pGamID) {

    if (!ClsAccount.AccountInfo && pShowAfterLogin) {
        var param = '';
        if (pGamID != undefined && pGamID != '')
            param = "?ID=" + pGamID;
        GoLoginPage(page + param);
        return
    }
    if (page == "")
        return
    if (pTarget == '' || pTarget == undefined)
        pTarget = '_self';

    if (pTarget != '_blank')
        StartBusy('form1', 'در حال بارگذاری صفحه');

    //window.open(page + "?NosaziCode=" + NosaziCode + "&Title=" + s.innerText, "_self");
    var param = "";
    if (NosaziCode != "" && NosaziCode != 'undefined' && NosaziCode != undefined) {
        param = "?NosaziCode=" + NosaziCode;
        param += "&ID=" + pGamID;
    }
    else if (pGamID != undefined && pGamID != '')
        param += "?ID=" + pGamID;

    var tmpBase = "";
    if (pTarget != '_blank')
        tmpBase = getBaseUrl();

    window.open(tmpBase + page + param, pTarget);
}

function openNav() {
    document.getElementById("mySidenav").style.width = "490px";
}

function closeNav() {
    //    document.getElementById("mySidenav").style.width = "0";
    //    $("#SearchMenu").delay(280).show(0); //$("#SearchResult").delay(280).show(0);
}

// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) {
    return p.toString() === "[object SafariRemoteNotification]";
})(!window['safari'] || safari.pushNotification);

// Internet Explorer 6-11
var isIE = /*@cc_on!@*/ false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;

// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

function openUrlNewTab(url, _target, _Feature) {
    if (_target == undefined)
        _target = '_self';

    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) ||
        (!!window.MSInputMethodContext && !!document.documentMode) || navigator.userAgent.indexOf("MSIE") > -1) {
        var el = document.createElement('a');
        el.href = url;
        el.target = _target;

        document.body.appendChild(el);
        el.click();
    } else {
        window.open(url, _target, _Feature);
    }
}

//======================================================NosaziCode
function LoadNosaziCode(pStrNosaziCode) {
    try {
        if (pStrNosaziCode != '' && pStrNosaziCode != "undefined" && pStrNosaziCode != undefined) {
            var arr = pStrNosaziCode.split('-');
            document.getElementById("txtDistrict1").value = arr[0];
            document.getElementById("txtRegion1").value = arr[1];
            document.getElementById("txtBlock1").value = arr[2];
            document.getElementById("txtHouse1").value = arr[3];
            document.getElementById("txtBuilding1").value = arr[4];
            document.getElementById("txtApartment1").value = arr[5];
            document.getElementById("txtShop1").value = arr[6];
            NosaziCode = pStrNosaziCode;
        } else {

            var StrNosaziCode = getParameterByName('NosaziCode');
            if (StrNosaziCode != '' && StrNosaziCode != "undefined") {
                var arr = StrNosaziCode.split('-');
                document.getElementById("txtDistrict1").value = arr[0];
                document.getElementById("txtRegion1").value = arr[1];
                document.getElementById("txtBlock1").value = arr[2];
                document.getElementById("txtHouse1").value = arr[3];
                document.getElementById("txtBuilding1").value = arr[4];
                document.getElementById("txtApartment1").value = arr[5];
                document.getElementById("txtShop1").value = arr[6];
                NosaziCode = StrNosaziCode;
            }
            //else {
            //    document.getElementById("txtDistrict1").value = '';
            //    document.getElementById("txtRegion1").value = '';
            //    document.getElementById("txtBlock1").value = '';
            //    document.getElementById("txtHouse1").value = '';
            //    document.getElementById("txtBuilding1").value = '';
            //    document.getElementById("txtApartment1").value = '';
            //    document.getElementById("txtShop1").value = '';
            //    NosaziCode = pStrNosaziCode;
            //}
        }
    } catch (ex) { }
}

function LoadDefaultCode() {
    try {
        var StrNosaziCode = getParameterByName('NosaziCode');
        if (StrNosaziCode == '' || StrNosaziCode == "undefined") {
            if (localStorage.getItem('LastNosaziCode') != null && localStorage.getItem('LastNosaziCode') != '') {
                StrNosaziCode = localStorage.getItem('LastNosaziCode');
            }
        }

        if (StrNosaziCode != '' && StrNosaziCode != "undefined") {
            var arr = StrNosaziCode.split('-');
            document.getElementById("txtDistrict1").value = arr[0];
            document.getElementById("txtRegion1").value = arr[1];
            document.getElementById("txtBlock1").value = arr[2];
            document.getElementById("txtHouse1").value = arr[3];
            document.getElementById("txtBuilding1").value = arr[4];
            document.getElementById("txtApartment1").value = arr[5];
            document.getElementById("txtShop1").value = arr[6];
        }

        NosaziCode = StrNosaziCode;
    } catch (ex) { }
}

function GetMapNosaziCode(pNosaziCode) {
    try {
        var NosaziSplit = pNosaziCode.split('-');
        var MapNosaziCode = NosaziSplit[0] + '-';
        MapNosaziCode += NosaziSplit[1] + '-';
        MapNosaziCode += NosaziSplit[2] + '-';
        MapNosaziCode += NosaziSplit[3] + '-0-0-0';
        return MapNosaziCode;
    } catch (ex) { }
}

LoadDefaultCode();
//================================================================
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParameterByName2(name, Url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(Url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function setCookie(cname, cvalue, exdays) {

    var d = new Date();

    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    var NewCookie = cname + "=" + cvalue + ";";

    document.cookie = NewCookie;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var ClsAccount = {
    IsLogin: false,
    AccountInfo: null,
    UserInfo: {
        NidUser: null
    },
    SessionId: '',
};

function GetAccountInfo(resolve) {
    //var d = { pNidAccount: SessionId };
    //var c = JSON.stringify(d);
    //$.ajax({
    //    type: "POST",
    //    data: c,
    //    url: "UTransferGam.aspx/GetAccountInfo",
    //    contentType: "application/json; charset=utf-8",
    //    dataType: "json",
    //    success: function (response) {
    //        AccountInfo = response.d;

    //        if (AccountInfo != null) {
    //            AccountInfo.AccountFullName = AccountInfo.OwnerFirstName + ' ' + AccountInfo.OwnerLastName + "( " + AccountInfo.AccountName + " )";
    //        }
    //        $(document).triggerHandler("onLoadAccount", AccountInfo);
    //    },
    //    failure: function (response) {
    //    }
    //});

    //var tmpAccountInfo = null; // $('#hfAccount').val();


    if (AccountInfo != '' && AccountInfo != undefined && AccountInfo != null) {
        ClsAccount.AccountInfo = (AccountInfo);
        ClsAccount.SessionId = ClsAccount.AccountInfo.SessionId;
        ClsAccount.IsLogin = true;
    }
    else
        ClsAccount.IsLogin = false;


    //if (AccountInfo != '' && AccountInfo != undefined && AccountInfo != null) {
    //    ClsAccount.IsLogin = true;
    //    if (AccountInfo != undefined) {
    //        ClsAccount.AccountInfo = JSON.parse(AccountInfo);
    //        ClsAccount.SessionId = ClsAccount.AccountInfo.SessionId;
    //        alert(ClsAccount.SessionId)
    //    }
    //} else
    //    ClsAccount.IsLogin = false;

    if (resolve != undefined)
        resolve(true);


    try {
        var tmphfShManager = $('#hfShManager').val();
        if (tmphfShManager != '') {

            var tmpShManagerList = JSON.parse(tmphfShManager);
            ClsAccount.Sh_ManagerConfirm_List = tmpShManagerList;
            //    GetScope().GamInputData.Sh_ManagerConfirm_List = tmpShManagerList;
            //GetScope().$apply();
        }
    }
    catch (ex) { }

}

$(document).ready(function () {

    if (typeof AppConfig !== 'undefined') {

        AppConfig.LoadObj(function () {
            $(document).triggerHandler("onLoadArchive");
        });
    }
    $(window).scroll(function () {
        if ($(window).scrollTop() > 450 && !UpBtHideForce) {
            //$('#GoUpBt').css("display", "block");
            $('#GoUpBt').fadeIn(500); //$('#GoUpBt').fadeTo(1500, 0.7);
        } else {
            $('#GoUpBt').fadeOut(500);
        }
    });

    $("input[type=number]").focus(function () {
        $('#GoUpBt').hide(); //hide when type
    });
    $("input[type=text]").focus(function () {
        $('#GoUpBt').hide(); //hide when type
    });
    $("input[type=number]").keypress(function () {
        $('#GoUpBt').hide(); //hide when type
    });
    $("input[type=number]").keyup(function () {
        $('#GoUpBt').hide(); //hide when type
    });
    $("input[type=number]").keydown(function () {
        $('#GoUpBt').hide(); //hide when type
    });

    GetAccountInfo();

    $('body').on('DOMNodeInserted', 'div', function (ev) {
        if (ev.currentTarget.id == 'DivTop') {
            CheckMapHeight();
        }
    });

    $('#DivTop').ready(function () {
        CheckMapHeight();
    });

    $('body').on('DOMNodeInserted', 'div', function (ev) {
        if (ev.currentTarget.id == 'DivTop1') {
            CheckMapHeight();
        }
    });

    $('#imgLogo').attr('title', $('#hfVersion').val() + '.' + version);

    //$("input.numbers").keypress(function (event) {
    //    return /\d/.test(String.fromCharCode(event.keyCode));
    //});


    $('#DivFooter').css('height', $(window).height() - $('html').height() + 'px');


});
function ReEvent() {

    $("input.numbers").keypress(function (event) {
        if (event.keyCode == 45 || event.keyCode == 46)
            return true;
        else
            return /\d/.test(String.fromCharCode(event.keyCode));
    });
    $("input.numbersLeft").keypress(function (event) {
        if (event.keyCode == 45 || event.keyCode == 46)
            return true;
        else
            return /\d/.test(String.fromCharCode(event.keyCode));
    });


}
function ShowError(ErrorResult) {
    try {
        $('#lblError').css("color", "red");
        if (ErrorResult != null) {
            $('#lblError').text(ErrorResult.BizErrors[0].ErrorTitel);
        } else {
            $('#lblError').text('خطا در اجرای سرویس');
        }
    } catch (ex) { }
}

//sh
function OpenUrlExternal(pgname) {
    if (!pgname || pgname == '')
        return

    var url = baseUrl + "?pgname=" + pgname;
    window.open(url, "_self");//_blank
}
function OpenUrlExternal2(pUrl, pTarget) {
    if (!pUrl || pUrl == '')
        return
    if (pTarget == '' || pTarget == undefined)
        pTarget = '_self';

    window.open(pUrl, pTarget);//_blank
}
function ClearLocalStorage(pKey) {
    localStorage.removeItem(pKey);
}

function ClearSomeLocalStorage(startsWith) {
    var myLength = startsWith.length;
    Object.keys(localStorage)
        .forEach(function (key) {
            if (key.substring(0, myLength) == startsWith) {
                localStorage.removeItem(key);
            }
        });
}


function GetFormIndex(pFormName) {
    var FormIndex = Enumerable.From(GamsArray)
        .Where(function (x) { return x.Name == pFormName })
        .Select(function (x) { return x.Index }).FirstOrDefault();
    return FormIndex;
}

function ShowPaymentUrl(pPrice, pFicheType, pDutyType, pNidFK, pNidNosaziCode, pDistrict, pBillID, pPaymenyId, pFicheNo) {
    var tmpNosaziCode = '';
    var tmpNidWorkItem = '';

    try {
        tmpNosaziCode = GetScope().GamInputData.CurrentNosaziCode;
        tmpNidWorkItem = GetScope().GamInputData.NidWorkItem;

        if (typeof BankInfo !== 'undefined') {
            tmpSelectedBankID = BankInfo.SelectedID;
        }
        else
            tmpSelectedBankID = 0;
    }
    catch (ex) { }
    if (tmpNosaziCode == '')
        tmpNosaziCode = NosaziCode;


    var tmpUrl = 'UShowFishj-Pay3.aspx?ExportFiche=false&Price=' + pPrice + '&FicheType=' + pFicheType + '&DutyType=' + pDutyType
        + '&NidFK=' + pNidFK + '&NidFiche=' + pNidFK + '&NidNosaziCode=' + pNidNosaziCode + '&Districk=' + pDistrict
        + '&BillID=' + pBillID + '&PayID=' + pPaymenyId + '&PaymentID=' + pPaymenyId
        + '&NosaziCode=' + tmpNosaziCode + '&NidWorkItem=' + tmpNidWorkItem + '&FicheNo=' + pFicheNo
        + '&SelectedBank=' + tmpSelectedBankID
        ;
    openUrlNewTab(tmpUrl);
}

var ClsSMS2 = {
    NumOfWord: 5,
    ConfirmCodeOk: false,

    SendConfirmSMS: function (pNumber, pBizCode) {
        if (pNumber == undefined)
            pNumber = GetScope().GamInputData.OwnerPhone;
        if (pBizCode == undefined)
            pBizCode = '';

        $('#lblSMS2').text('');
        $('#lblSMS2').css('color', 'red');
        if (!pNumber.startsWith("09")) {
            $('#lblSMS2').text('شماره همراه را به صورت صحیح وارد نمایید');
            return;
        }
        else if (pNumber.length < 11) {
            $('#lblSMS2').text("شماره تماس همراه باید ۱۱ رقمی باشد");
            return;
        }

        var tmpNumber = pNumber;
        var d = {
            pNumber: tmpNumber,
            pNosaziCode: pBizCode,
            FormuleMode: false
        };
        var c = JSON.stringify(d);
        StartBusy('btnSend');
        $request = $.ajax({
            type: "POST",
            url: "UTransferGam.aspx/SendConfirmSMS",
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy('btnSend');

                if (msg.d.ErrorResult.BizErrors.length > 0) {
                    $('#lblSMS2').text(msg.d.ErrorResult.BizErrors[0].ErrorTitle);
                    $('#lblSMS2').css('color', 'red');
                } else {
                    $('#txtConfirmCode2').show();
                    $('#txtOwnerPhone').prop('disabled', 'true');
                    $('#btnSend').prop('disabled', 'true');

                    $('#lblSMS2').text('کد تاییدیه با موفقیت ارسال شد');
                    $('#lblSMS2').css('color', 'green');
                }
            },

            error: function (ex) {
                $('#lblSMS2').text(msg.d.ErrorResult.BizErrors[0].ErrorTitle);
                StopBusy();
            }
        });
    },
    ConfirmCode_keypress: function (e) {

        if ($('#txtConfirmCode2').val().length == ClsSMS2.NumOfWord)
            this.CheckConfirmCode();
    },


    CheckConfirmCode: function () {

        var tmpConfirmCode = $('#txtConfirmCode2').val();
        var d = {
            pNumber: tmpConfirmCode
        };
        var c = JSON.stringify(d);

        $('#lblSMS2').text('');
        $('#imgError').hide();

        StartBusy('txtConfirmCode2');
        $request = $.ajax({
            type: "POST",
            url: "UTransferGam.aspx/CheckConfirmCode",
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy('txtConfirmCode2');

                if (msg.d == true) {
                    ClsSMS2.ConfirmCodeOk = true;

                    if (GetScope().GamInputData != undefined)
                        GetScope().GamInputData.ConfirmCodeOk = true;
                    $('#txtConfirmCode2').attr("disabled", "disabled");
                    $('#txtConfirm').css('color', 'green');
                    $('#lblSMS2').css('color', 'green');

                    $('#lblSMS2').text('کد تاییدیه صحیح می باشد');
                    $('#imgConfirmStatus').prop('src', 'Images/tik.png');
                    $('#btnSave').removeClass('disabled');
                    $('#btnSave').prop('disabled', false);
                    $('#imgError2').hide();
                    $('#imgTick2').show();
                } else {
                    $('#imgError2').show();
                    $('#imgTick2').hide();

                    $('#txtConfirm').css('color', 'red');
                    $('#lblSMS2').css('color', 'red');
                    $('#lblSMS2').text('کد تاییدیه معتبر نمی باشد');
                    $('#imgConfirmStatus').prop('src', 'Images/Error.png');
                }
            },

            error: function (c) {
                StopBusy('txtConfirmCode');
            }
        });
    }
}

//function InsertLog(pGamNo) {
//    var tmpNidAccount = '';
//    var tmpAccountName = '';
//    if (ClsAccount.AccountInfo != null) {
//        tmpNidAccount = ClsAccount.AccountInfo.NidAccount;
//        tmpAccountName = ClsAccount.AccountInfo.FullName;
//    }
//    var d = { pGamState: pGamNo, NidAccount: tmpNidAccount, AccountName: tmpAccountName, NosaziCode: GetScope().GamInputData.CurrentNosaziCode };
//    var c = JSON.stringify(d);
//    $.ajax({
//        type: "POST",
//        url: "UTransferGam.aspx/InsertLog",
//        data: c,
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//    });
//}

function InsertLog(pGamNo) {
    try {
        var tmpEstateName = GamsArray[pGamNo].Title;
        var tmpNosaziCode = null;

        if (GetScope().GamInputData.CurrentNosaziCode != undefined)
            tmpNosaziCode = GetScope().GamInputData.CurrentNosaziCode;

        var d = { pGamState: pGamNo + 1, pEstateName: tmpEstateName, pNosaziCode: tmpNosaziCode };
        var c = JSON.stringify(d);
        $.ajax({
            type: "POST",
            url: "UTransferGam.aspx/InsertLog",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        });
    }
    catch (ex) { }
}
var resCi2 = false;
function CheckIsDoneManagerConfirmAll(resolve, pBusy, pCI, pCI2, pGOTO) {


    if (GetScope().GamInputData.NidProc == undefined || pCI == 0) {
        resolve(true);
        return;
    }

    //if (GetScope().GamInputData.Sh_ManagerConfirm_List == null || GetScope().GamInputData.Sh_ManagerConfirm_List == undefined || GetScope().GamInputData.Sh_ManagerConfirm_List.length == 0) {
    //    var d = {
    //        pNidProc: GetScope().GamInputData.NidProc,
    //        pDistrict: GetScope().GamInputData.District
    //    };
    //    var c = JSON.stringify(d);

    //    StartBusy(pBusy, 'درحال بررسی تایید مدیر');
    //    $.ajax({
    //        type: "POST",
    //        url: ServiceAddress + "CheckIsDoneManagerConfirm",
    //        data: c,
    //        crossDomin: true,
    //        contentType: "application/json; charset=utf-8",
    //        dataType: "json",
    //        processdata: true,

    //        success: function (msg) {
    //            StopBusy(pBusy);
    //            GetScope().GamInputData.Sh_ManagerConfirm_List = msg.Sh_ManagerConfirm_List;

    //            var res = false;

    //            if (msg.Sh_ManagerConfirm_List != null)
    //                res = AnalystConfirm(pCI);

    //            resolve(res);
    //        },
    //        error: function (c) {
    //            var g = c;
    //            StopBusy(pBusy);
    //        }
    //    });
    //}
    //else {
    var res = false;

    res = AnalystConfirm(pCI);
    if (pCI2 != undefined) {
        var res2 = AnalystConfirm(pCI2);
        if (res2 == true) {
            // GamPlugin.CurrentStep = pGOTO;
            // CurrentStep = pGOTO;
            resCi2 = true;
            res = true;
        }
    }
    resolve(res);
    // }
}
function AnalystConfirm(pCI) {
    var res = false;
    var breakFor = false;
    var ConfirmationDate = '';
    var ConfirmationTime = '';
    if (ClsAccount.Sh_ManagerConfirm_List != undefined && ClsAccount.Sh_ManagerConfirm_List != null && ClsAccount.Sh_ManagerConfirm_List.length > 0 && (GetScope().GamInputData.Sh_ManagerConfirm_List.length == 0))
        GetScope().GamInputData.Sh_ManagerConfirm_List = ClsAccount.Sh_ManagerConfirm_List;

    if (GetScope().GamInputData.Sh_ManagerConfirm_List != undefined)
        GetScope().GamInputData.Sh_ManagerConfirm_List.forEach(function (item, index) {
            if (!breakFor) {
                //var CurretnCi = (pCI > 300) ? item.CI_ResourceManagerConfirmDetails : item.EumManagerConfirmLicence;
                var CurretnCi = item.CI_ResourceManagerConfirmDetails;
                if (CurretnCi == pCI) {
                    if (item.EumManagerConfirmLicence == 3 || item.EumManagerConfirmLicence == 2) {
                        ConfirmationDate = item.ConfirmationDate;
                        ConfirmationTime = item.ConfirmationTime;
                        return false;
                    }
                    else if (item.ConfirmationDate + item.ConfirmationTime > ConfirmationDate + ConfirmationTime) {
                        res = true;
                        breakFor = true;
                        return res;
                    }
                }
                else return false;
            }
        });

    return res;
}

function CallConfirmManagerService() {

    var d = {
        pNidProc: GetScope().GamInputData.NidProc,
        pDistrict: GetScope().GamInputData.District
    };
    var c = JSON.stringify(d);

    $.ajax({
        type: "POST",
        url: ServiceAddress + "CheckIsDoneManagerConfirm",
        data: c,
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        success: function (msg) {
            GetScope().GamInputData.Sh_ManagerConfirm_List = msg.Sh_ManagerConfirm_List;
        },
    });
}

//=====================================================
var GamPlugin = new function () {
    this.Config = {
        currentStepName: '',
    },
        this.CurrentStep,
        CurrentStep = 0,
        AllStep = 0,
        this.removeStep = null;
    this.AllStep = function () {
        return GetScope().GamsArray.length - 1;
    }
    this.init = function () {

        LoadGam();
    }
    this.SkipGam = function () {
        if (isPreStep)
            GamPlugin.preStep();
        else
            GamPlugin.nextStep();
    }
    this.nextStep = function () {
        isPreStep = false;
        if (CurrentStep < this.AllStep()) {
            var CheckGamData = { CurrentStep: 0 };
            var res = $(document).triggerHandler("onCheckGam", CheckGamData);

            if (res.AllowNextPage == true) {
                $(".active").removeClass('active');
                var tmpNextGam = this.CurrentStep + 1;
                if (tmpNextGam == this.removeStep)
                    tmpNextGam = tmpNextGam + 1;

                GamPlugin.GoStep(tmpNextGam);
            }
        }
    }
    this.preStep = function () {
        isPreStep = true;
        if (CurrentStep > 0) {
            $(".active").removeClass('active');
            $("#G" + CurrentStep).addClass('active');
            $('.btnNext').val('گام بعدی');
        }

        var tmpNextGam = CurrentStep - 1;
        if (tmpNextGam == this.removeStep)
            tmpNextGam = tmpNextGam - 1;

        GamPlugin.GoStep(tmpNextGam);

        //  GetScope().GamInputData.AllowNextPage = true;
        //   GetScope().$apply();
    }
    this.nextStepWithOutCheck = function () {
        isPreStep = false;
        if (CurrentStep < this.AllStep()) {
            var CheckGamData = { CurrentStep: 0 };

            $(".active").removeClass('active');
            var tmpNextGam = CurrentStep + 1;
            if (tmpNextGam == this.removeStep)
                tmpNextGam = tmpNextGam + 1;

            GamPlugin.GoStep(tmpNextGam);

        }
    }
    this.SelectStepById = function (pStep) {
        SelectStepById(pStep);
    }
    this.GoStep = function (pStep, pFromLoad) {
        try {
            if (pStep > GetScope().GamsArray.length - 1)
                pStep = pStep - 1;

            $(".active").removeClass('active');

            $("#Step" + CurrentStep).slideToggle();
            CurrentStep = pStep;
            $("#Step" + CurrentStep).slideToggle()
            {

            };

            $("#G" + pStep).addClass('active');

            if (CurrentStep > 0) {
                $(".btnPre").show();
                $(".btnPre").removeAttr("disabled");
            }
            else if (CurrentStep == 0)
                $("#btnPre").hide();

            SelectStepById(CurrentStep);

            //GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, CurrentStep);
            GamPlugin.CurrentStep = CurrentStep;

            var tmpStepData = { CurrentStep: 0, pFromLoad: pFromLoad };
            $(document).triggerHandler("onLoadStep", tmpStepData);

            $('#StepTextNum').text(CurrentStep + 1);
            $('#StepTextMobile').text(GetScope().GamsArray[CurrentStep].Title);
            $('#TotalGam').text(GetScope().GamsArray.length);

            InsertLog(pStep);
        }
        catch (ex) {

        }
    }
    this.End = function () {
        $("#btnPre").hide();
    }

    this.SavelocalStorage = function (pKey, pObject) {
        var tmpLS = JSON.stringify(pObject);
        var tmpEnc = EncryptData(tmpLS);
        localStorage.setItem(pKey, tmpEnc);
        SaveGamInfoToDB(tmpLS);
    }
    this.GetlocalStorage = function (pKey) {
        try {
            var tmpEncStr = localStorage.getItem(pKey);
            if (tmpEncStr != null && tmpEncStr != 'null') {
                var tmpDec = DecryptData(tmpEncStr);
                var tmpRes = JSON.parse(tmpDec);
                return tmpRes;
            }
        }
        catch {
            return null;
        }
    }
    this.RemovelocalStorage = function (pKey) {
        localStorage.removeItem(pKey);
    }

    this.ResetGam = function () {
        ClearLocalStorage(GetScope().Config.ScopeName);
        $("#btnPre").hide();
        $("#btnNext").hide();
    }
    this.ResetGamAndRedirect = function () {
        ClearLocalStorage(GetScope().Config.ScopeName);
        $("#btnPre").hide();
        GetScope().ResetScope();
        GamPlugin.CurrentStep = 0;
        GamPlugin.GoStep(0);
    }
    this.HidePreButton = function (index) {
        $('#btnPre').hide();
    }
    this.HideNextButton = function (index) {
        $('#btnNext').hide();
    }
    this.ShowNextButton = function (index) {
        $('#btnNext').show();
    }
    this.ShowPreButton = function (index) {
        $('#btnPre').show();
    }
    function SelectStepById(step) {
        try {
            $('img[id^="divDeskShap"]:not(:last)').prop('src', 'images/norm.png');
            $('img[id^="divDeskShap"]').last().prop('src', 'images/end-norm.png');

            //$($('img[id^="divDeskShap"]')[GamsArray.length - 1]).prop('src', 'images/end-norm.png');

            if (this.CurrentStep == GamsArray.length - 1)
                document.getElementById("divDeskShap" + this.CurrentStep).src = "images/end-active.png";
            else {
                document.getElementById("divDeskShap" + this.CurrentStep).src = "images/active.png";
                $("#divDeskShap" + this.CurrentStep).parent().parent().addClass('active');
            }
            //گام آخر
            if (step == GamPlugin.AllStep() || step == undefined) {
                $('#btnNext').hide();
                //$('#btnPre').hide();
            }
            else
                $('#btnNext').show();
        }
        catch (ex) { }
    }
    function LoadGam() {
        var tmpres = GamPlugin.GetlocalStorage(GetGamInfo());

        if (tmpres != null && tmpres != undefined) {
            GamPlugin.GoStep(tmpres.CurrentStep, true);
        }
        else
            GamPlugin.GoStep(0, true);
    }

    var SaveGamInfoToDB = function (pGamInputDataStr) {
        if (GetScope().GamInputData.NidProc != undefined) {
            var d = { pNidProc: GetScope().GamInputData.NidProc, pGamInputDataStr: pGamInputDataStr };
            var c = JSON.stringify(d);
            $.ajax({
                type: "POST",
                url: 'UTransferGam.aspx/SaveGam',
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {

                },
                error: function (c) {
                }
            });
        }
    }

}

var GetUrlByDomain = function (pUrl, pDomain) {
    var SrvDomain = pUrl;
    if (pUrl.indexOf('#') > -1) {
        var SplitText = '#' + pDomain + '#';
        SrvDomain = pUrl.substring(
            pUrl.indexOf(SplitText) + 3,
            pUrl.lastIndexOf(SplitText));
        return SrvDomain;
    }
    else return pUrl;
}


//================================================================

function getQueryVariable(url, variable) {
    var query = url.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == variable) {
            return pair[1];
        }
    }

    return false;
}


function GetScopeMenu() {
    return angular.element(document.getElementById('MainMenu')).scope();
}

var ClsMenu = {
    ID: null,
    CurrentTitle: null,
};
function StartBusy1(pMessage) {
    if (pMessage == undefined)
        pMessage = 'لطفا منتظر بمانید...';

    StartBusy('MainGam', pMessage);
}
function StopBusy1() {
    StopBusy('MainGam');
}

function AfterSaveRequest(response, isRequireBazdid = 'false') {
    if (response.d != null && response.d.ErrorResult.BizErrors.length > 0) {
        GetScope().GamInputData.NextDisable = true;
        if (response.d.ErrorResult.BizErrors[0].ErrorTitel.indexOf('حساب کاربری') > -1)
            GetScope().Prop.ErrorMessage = 'کاربر گرامی ابتدا باید وارد حساب کاربری خود شوید';
        else if (response.d.ErrorResult.BizErrors[0].ErrorTitel.indexOf('سیاه') > -1)
            GetScope().Prop.ErrorMessage = "شهروند محترم کد مورد نظر در لیست سیاه میباشد. جهت تعیین تکلیف به شهرداری منطقه مراجعه فرمایید";
        else if (response.d.ErrorResult.BizErrors[0].ErrorKey == 1000)//Formule
            GetScope().Prop.ErrorMessage = response.d.ErrorResult.BizErrors[0].ErrorTitel;
        else
            GetScope().Prop.ErrorMessage = ErrorMessageSaveStep;
    }
    else if (response.d != null && response.d.ErrorResult.HasErrors == false && response.d.Result.IsTruSave && response.d.Result.NidWorkItem > 0) {
        GetScope().GamInputData.NidWorkItem = response.d.Result.NidWorkItem;
        GetScope().GamInputData.NidProc = response.d.Result.NidProc;
        GetScope().GamInputData.NidAccount = response.d.Result.NidAccount;
        GetScope().$apply();
        GamPlugin.End();

        if (isRequireBazdid == true)
            AddBazdidToSara();

        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
        CallConfirmManagerService();

        $('#btnShowRevisitReport').show();
    }
    else {
        GetScope().Prop.ErrorMessage = "خطا در ثبت درخواست ، لطفا به راهبر سیستم اطلاع دهید";
    }
    GetScope().$apply();
}

function ShowRevisitReport() {
    var tmpNidRevisitAgent = '';
    //if (GetScope().GamInputData.Sh_RevisitAgentRandom != null)
    //    tmpNidRevisitAgent = GetScope().GamInputData.Sh_RevisitAgentRandom.NidRevisitAgent;

    var tmpStr = "RptRevisitAgent&ReportParameter=NidProc;" + GetScope().GamInputData.NidProc + ",District;" + GetScope().GamInputData.District
        + ",TokenKey;"

    window.open(FactorUrl + tmpStr, '_blank');
}

function PrintElem(elem) {
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');

    mywindow.document.write('<html><head><title>' + document.title + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title + '</h1>');
    mywindow.document.write(document.getElementById(elem).innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    mywindow.close();

    return true;
}
function GetCurrentDate(pDay) {//add by sheykhi
    var dayArray = [];
    if (pDay == undefined)
        pDay = 0;

    pDay = Number(pDay);
    now = persianDate().add('days', 0);
    var MaxDate = persianDate().add('days', pDay);

    dayArray.push(now.pDate.year + "/" + padLeft(now.pDate.month, 2) + "/" + padLeft(now.pDate.date, 2))
    dayArray.push(MaxDate.pDate.year + "/" + padLeft(MaxDate.pDate.month, 2) + "/" + padLeft(MaxDate.pDate.date, 2))

    return dayArray;
}

function GenerateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function DeleteArchive(p) {
    var tmpRes = confirm('ایا مطمئن هستید ؟');
    if (tmpRes) {
        var tmpImg = $(p).parent().prev();
        var tmpImgSrc = $(tmpImg)[0].childNodes["0"].currentSrc;
        var NidFile = getParameterByName2('FName', tmpImgSrc);
        var tmpDistrict = 1;
        try {
            tmpDistrict = District;
            tmpDistrict = GetScope().GamInputData.District;
        }
        catch (ex) { }
        var d1 = {
            PDeleteFile: {
                NidFiles: [NidFile],
            },
            pDomainName: tmpDistrict,
            pNidCategory: 0
        }
        
        var tmpProviderurl = Object.getOwnPropertyDescriptor(AppConfig.Params, 'ArcService_1').value;
        ArchiveService = AppConfig.GetParam(tmpProviderurl, tmpDistrict);
        ArchiveService += '/json2/';
        //var d = { PDeleteFile: { NidFiles: [{ NidFile }], BizCode: GetScope().GamInputData.ArchiveBizCode, pDomainName: GetScope().GamInputData.District, pNidCategory: 0 } };
        var c = JSON.stringify(d1);
        StartBusy('divUploader', 'در حال دریافت کد آرشیو');

        $request = $.ajax({
            type: "POST",
            url: ArchiveService + "DeleteDataFile",
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy('divUploader');
                $(tmpImg).parent().parent().remove();
            },
            error: function (c) {
                StopBusy('divUploader');
                var g = c;
            }
        });
    }

}

function CallRequestToken(callback) {
    $request = $.ajax({
        type: "POST",
        url: SecurityService + "RequestToken",
        crossDomin: true,
        dataType: "json",
        processdata: true,
        success: function (msg) {
            callback();
        },
        error: function (c) {

        }
    });
}

var HasEnglish = /^[A-Za-z0-9]*$/;

function isEmpty(s) {
    return !s.length;
}

function isBlank(s) {
    return isEmpty(s.trim()) || s == '&nbsp;' || s == 'undefined';
}
