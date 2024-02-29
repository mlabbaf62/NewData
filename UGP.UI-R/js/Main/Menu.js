var NewRequest = function () {
    var GamName = GetGamInfo();
    localStorage.removeItem(GamName);
    var tmpID = getParameterByName("ID");
    var tmpParam = (tmpID != '' ? 'ID=' + tmpID : '');
    window.open('?' + tmpParam, '_self');
}


var tabID = sessionStorage.tabID && sessionStorage.closedLastTab !== '2'
    ? sessionStorage.tabID
    : (sessionStorage.tabID = Math.floor(1000 + Math.random() * 9000), sessionStorage.Login = true);
sessionStorage.closedLastTab = '2';
$(window).on('unload beforeunload', function () {
    sessionStorage.closedLastTab = '1';
    //ClearLocalStorage(GetGamInfo());
    //if (localStorage.length > 3) { localStorage.clear() }
});


//alert(sessionStorage.tabID);
function GetGamInfo() {
    var url = window.location.pathname;
    var myPageName = url.substring(url.lastIndexOf('/') + 1);
    myPageName = myPageName.replace("2", '').toLowerCase();

    if (ClsAccount.AccountInfo == null) {
        window.open(LoginPage + '&ReturnPage=' + myPageName, '_self');
    }

  var GamName = myPageName + '-' + ClsAccount.AccountInfo.NidAccount.split('-')[0] + '-' + sessionStorage.tabID + '-ID' + getParameterByName("ID");

    return GamName;
}
//function LoadMenu(page) {
//    StartBusy('MainBody', 'بارگذاری'); //page
//    if (!ClsAccount.AccountInfo) {
//        GoLoginPage();
//        return
//    }
//    var random = ClsAccount.AccountInfo.NidAccount;
//    window.open(page, '_self');
//}

function GoLoginPage(ReturnUrl) {
    StartBusy('MainBody', ' '); //page
    var tmpReturnUrl = '';
    if (ReturnUrl != undefined)
        tmpReturnUrl = '&ReturnPage=' + ReturnUrl;


    if (typeof (EnableSSO) != 'undefined' && EnableSSO == 'Authin') {
        window.location.assign('.?LoginMode=StartSSO' + tmpReturnUrl);
    }
    else if (typeof (EnableSSO) != 'undefined' && EnableSSO == 'SSOIsfahan') {
        window.location.assign(LoginPage + tmpReturnUrl + '&LoginMode=SSOIsfahan');
    }
    else
        window.location.assign(LoginPage + tmpReturnUrl);
}
function GoLoginPageSSO(ReturnUrl) {
    StartBusy('MainBody', ' '); //page
    var tmpReturnUrl = '';
    if (ReturnUrl != undefined)
        tmpReturnUrl = '&ReturnPage=' + ReturnUrl;

    if (typeof (EnableSSO) != 'undefined' && EnableSSO.startsWith('SSO')) {

        url = ".";
        if (window.location.href.indexOf('SSO') == -1)
            url = window.location.href;

        url += '?LoginMode=' + EnableSSO + tmpReturnUrl;
        window.location.assign(url);
    }
}

function Logout() {
    //For ManMail
    if (LoginPage.indexOf('SafaLoginNew') > -1)
        window.open('logout.aspx', '_blank', 'width=5, height=5');
    else {
        var tmpBase = getBaseUrl();
        $('#UMenu2_LblAccount').remove();
        if (typeof (EnableSSO) != 'undefined' && EnableSSO != '')
            window.open(tmpBase + 'default.aspx?Page=Logout' + EnableSSO, '_self')
        else
            window.open(tmpBase + 'default.aspx?Page=Logout', '_self')
    }
}
function LogoutSSOGov() {

    if (typeof (EnableSSO) != 'undefined' && EnableSSO == 'SSOGov') {
        var tmpBase = getBaseUrl();
        //window.open('https://sso.my.gov.ir/logout', '_blank');
        window.open(tmpBase + 'default.aspx?Page=Logout' + EnableSSO, "_self");
    }
}





function GoEditAccount(tmpSession) {
    
    StartBusy('MainBody', ' '); //page
    var NidAccount = ClsAccount.AccountInfo.NidAccount;//.split("").reverse().join("");//ClsAccount.AccountInfo.NidAccountEnc;
    NidAccount = NidAccount + tmpSession;
    NidAccount = window.btoa(NidAccount);
    //window.location.assign(LoginPage + '&EditAccount=' + NidAccount);
    window.location.assign(LoginPage + '&EditAccount=true');

}

function GoChangePass() {
    StartBusy('MainBody', ' '); //page

    var NidAccount = ClsAccount.AccountInfo.NidAccountEnc;
    window.location.assign(LoginPage + '&ChangePassword=' + NidAccount);
}

if (logingMenu == true) {
    $("#logingMenu").css("display", "block");
} else
    $("#logingMenu").css("display", "none");





//function setCookie(cname, cvalue, exdays) {
//    var d = new Date();
//    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
//    var expires = "expires=" + d.toGMTString();
//    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
//}
//function getCookie(cname) {
//    var name = cname + "=";
//    var decodedCookie = decodeURIComponent(document.cookie);
//    var ca = decodedCookie.split(';');
//    for (var i = 0; i < ca.length; i++) {
//        var c = ca[i];
//        while (c.charAt(0) == ' ') {
//            c = c.substring(1);
//        }
//        if (c.indexOf(name) == 0) {
//            return c.substring(name.length, c.length);
//        }
//    }
//    return "";
//}


function navbarScrolldn() {
    $('#navbarScroll').hide();
    var myVar = setInterval(function () {
        var nh = $('#navbar').height();
        var nhb = $('.navbar').height();
        var wh = $(window).height()
        /*console.log('#navbar ' + nh);
        console.log('.navbar ' + nhb);
        console.log('window ' + wh);*/
        if (nhb > wh)
            $('#navbarScroll').fadeIn();
        else
            $('#navbarScroll').fadeOut();

        clearInterval(myVar);
    }, 2000);
}

$(document).ready(function () {

    if (IsShowLoginPageAdmin == true) {
        $('#btnLoginAdmin').show();
        $('#btnLoginAdmin2').show();
        $('#btnLoginAdminInMenuT').show();
    }
    $('#btnLoginAdmin').attr('href', LoginPageAdmin);
    $('#btnLoginAdmin2').attr('href', LoginPageAdmin);

    //////////////////////////////////////////
    //نمایش راهنمای برای منو روزی یکبار
    var user = getCookie("NavbarHelp");
    if (user != "") {
        $('.icon-bar').removeClass('shadow-pulse');
        //alert("Welcome again " + user);
    } else {
        //user = prompt("Please enter your name:", "");
        if (user != "" && user != null) { }
        //setCookie("NavbarHelp", 1, 1);
        $('#NavbarHelp').fadeIn(2000);
        var myVar = setInterval(function () {
            clearInterval(myVar);
            $('#NavbarHelp').fadeOut(500);
            $('.icon-bar').removeClass('shadow-pulse');
            setCookie("NavbarHelp", 1, 365);
        }, 15000);
    }
    //////////////////////////////////////////
    $('#navbar').on('click', function () {
        navbarScrolldn()
    })
    $('.navbar-toggle').on('click', function () {
        navbarScrolldn()
    })
    $('#navbarScroll').on('click', function () {
        //navbarScrolldn()
        $('html, body').animate({
            scrollTop: $("#navbar")[0].scrollHeight
        }, 1000);
    })
    $('#navbarScroll').hide();
    $('.icon-bar').on('click', function () {
        $('.icon-bar').removeClass('shadow-pulse');
        $('#NavbarHelp').fadeOut();
        setCookie("NavbarHelp", 1, 365);
    })
    //$('#NavbarHelp').fadeIn(2000);

    //var cc = $('.navbar-toggle collapsed').offset();
    //var hh = $('.navbar-toggle collapsed').height();
    //console.log('top ' + hh + 'left ' + cc.left)
    //$('#NavbarHelp').css('left', cc.left );
    //$('#NavbarHelp').css('top', hh+50);
    $(document).click(function (event) { //بستن منوی موبایل وقتی جای دیگه کلیک میخوره
        var clickover = $(event.target);
        var $navbar = $(".navbar-collapse");
        var _opened = $navbar.hasClass("in");
        if (_opened === true && !clickover.hasClass("navbar-toggle")) {
            $navbar.collapse('hide');
        }
    });

    //Menu------------------------------------------------
    function getBaseUrl() {
        if (window.location.href.indexOf('Config/Pages') > -1) {
            var tmpU = window.location.href.match(/^.*\//)[0];
            tmpU = (tmpU).replace('Config/Pages/', '');
            return tmpU;
        }
        else
            return '';
    }
    var Menu = [];
    var tmpU = getBaseUrl();

    $.ajax({
        type: "GET",
        url: tmpU + "Config/UgpMenu.xml",
        dataType: "xml",
        success: function (xml) {
            LoadXML(xml);
        }
    });

    $.ajax({
        type: "POST",
        url: "USHowFishj.aspx/GetUgpMenu",

        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,

        success: function (msg) {

            var tmpRes = msg.d.Item2;
            let shiftedString = shiftBytes(tmpRes, 0);
            var $xml = $(shiftedString);
            LoadXML($xml);
        },
        error: function (c) {

        }
    });


    function LoadXML(xml) {

        $(xml).find("MenuItem").each(function (it, jj) {
            var IsLogin = ClsAccount.IsLogin;

            //var tmpMenuCountShow = $(xml).find("MenuItem[Caption='خدمات اختصاصی']").find("Item[IsShow='true']").length;
            var tmpMenuCountShow = $(xml).find("MenuItem[Caption='" + $(this).attr("Caption") + "']").find("Item[IsShow='true']").length;;

            if ($(this).children().length) {
                var SubMenu = [];

                var tmpShowAfterLogin = stringToBoolean($(this).attr("ShowAfterLogin"));
                var tmpTarget = $(this).attr("Target");
                var tmpIsShow = stringToBoolean($(this).attr("IsShow"));
                Menu.push({
                    ID: $(this).attr("ID"),
                    Caption: $(this).attr("Caption"),
                    Url: $(this).attr("Url"),
                    IsShow: tmpIsShow,
                    ImagePath: GetImagePath(this),
                    SubMenu: SubMenu,
                    Col: 'Col' + ($(this).attr("Col") != undefined ? $(this).attr("Col") : tmpMenuCountShow > 15 ? 2 : 0),
                    IsLogin: IsLogin,
                    ShowAfterLogin: tmpShowAfterLogin,
                    ShowInMainPage: $(this).attr("ShowInMainPage"),
                    Target: tmpTarget,
                    Enable: $(this).attr("Enable"),
                });

                //SubMenu List
                $(this).children().each(function (pIndex, pItemSub) {
                    //if ($(this).attr("IsShow").toString().toLowerCase() == 'true') {
                    var tmpShowAfterLogin = stringToBoolean($(this).attr("ShowAfterLogin"));
                    var tmpTarget = $(this).attr("Target");
                    var SubMenu2 = [];
                    SubMenu.push({
                        ID: $(this).attr("ID"),
                        Caption: $(this).attr("Caption"),
                        Url: $(this).attr("Url"),
                        IsShow: stringToBoolean($(this).attr("IsShow")),
                        ImagePath: GetImagePath(this),
                        ShowAfterLogin: tmpShowAfterLogin,
                        ShowInMainPage: stringToBoolean($(this).attr("ShowInMainPage")),
                        Target: tmpTarget,
                        Enable: $(this).attr("Enable"),
                        SubMenu2: SubMenu2,
                        GamState: $(this).attr("GamState"),
                        NidWorkflowDeff: $(this).attr("NidWorkflowDeff"),
                        Archive_NidEntity: $(this).attr("Archive_NidEntity"),
                    });

                    $(pItemSub).children().each(function () {
                        if (stringToBoolean($(this).attr("IsShow")) == true) {
                            var tmpShowAfterLogin = stringToBoolean($(this).attr("ShowAfterLogin"));
                            var tmpTarget = $(this).attr("Target");

                            SubMenu2.push({
                                ID: $(this).attr("ID"),
                                Caption: $(this).attr("Caption"),
                                Url: $(this).attr("Url"),
                                IsShow: stringToBoolean($(this).attr("IsShow")),
                                ImagePath: GetImagePath(this),
                                ShowAfterLogin: tmpShowAfterLogin,
                                ShowInMainPage: stringToBoolean($(this).attr("ShowInMainPage")),
                                Target: tmpTarget,
                                Enable: $(this).attr("Enable"),
                                GamState: $(this).attr("GamState"),
                                NidWorkflowDeff: $(this).attr("NidWorkflowDeff"),
                                Archive_NidEntity: $(this).attr("Archive_NidEntity"),
                            });
                        }
                        else {
                            var tmpID = $(this).attr("ID");
                            $('#' + tmpID).hide();
                        }
                    });




                    //} 

                });
                // }
            } else { //MainMenu
                // if ($(this).attr("IsShow").toString().toLowerCase() == 'true') {
                var tmpSendNidAccount = stringToBoolean($(this).attr("SendNidAccount"));
                var tmpPost = '';
                if (tmpSendNidAccount == true && ClsAccount.AccountInfo != null) {
                    tmpPost = 'NidAccount=' + ClsAccount.AccountInfo.NidAccount + '&AccountName=' + ClsAccount.AccountInfo.AccountName;
                    tmpPost = '?p=' + window.btoa(tmpPost);
                }
                Menu.push({
                    ID: $(this).attr("ID"),
                    Caption: $(this).attr("Caption"),
                    Url: getBaseUrl() + $(this).attr("Url") + tmpPost,
                    IsShow: stringToBoolean($(this).attr("IsShow")),
                    ImagePath: GetImagePath(this),
                    IsLogin: IsLogin,
                    ShowAfterLogin: stringToBoolean($(this).attr("ShowAfterLogin")),
                    ShowInMainPage: stringToBoolean($(this).attr("ShowInMainPage")),
                    Target: $(this).attr("Target"),
                    Enable: $(this).attr("Enable"),
                });
                //  }
            }
        });
        GetScopeMenu().Menu = Menu;
        GetScopeMenu().$apply();

        try {
            var tmpMenuID = getParameterByName('ID');
            var tmpMenuSelected = Enumerable.From(GetScopeMenu().Menu[1].SubMenu).Where(function (x) { return x.ID == tmpMenuID }).FirstOrDefault();
            if (tmpMenuSelected != undefined) {
                ClsMenu.ID = tmpMenuID;
                ClsMenu.CurrentTitle = tmpMenuSelected.Caption;
                ClsMenu.NidWorkflowDeff = tmpMenuSelected.NidWorkflowDeff;
                ClsMenu.Archive_NidEntity = tmpMenuSelected.Archive_NidEntity;

                GetScopeMenu().Header = tmpMenuSelected.Caption;

                var tmpState = tmpMenuSelected.GamState;
                if (tmpState != '') {
                    if (tmpState != null && tmpState != undefined) {
                        try {
                            GamsArray = eval(tmpState);
                        }
                        catch { }

                    }
                }
            }
            if (GetScope() != undefined) {
                GetScope().GamsArray = GamsArray;
                GetScope().$apply();
                //GamPlugin.CurrentStep = 0;
                GamPlugin.init();
            }
        }
        catch (ex) {

        }
    }
    var stringToBoolean = function (string) {
        if (string == undefined) return false;
        else
            switch (string.toLowerCase().trim()) {
                case "true": case "yes": case "1": return true;
                case "false": case "no": case "0": case null: return false;
            }
    }

    function GetImagePath(pthis) {
        var tmpPath = $(pthis).attr("ImagePath");
        if (tmpPath == undefined || tmpPath == '')
            tmpPath = 'images/space.png';
        return tmpPath;
    }

    function GetScopeMenu() {
        return angular.element(document.getElementById('MainMenu')).scope();
    }

});

function DecryptXml(MethodName, callback) {
    $.ajax({
        type: "POST",
        url: "USHowFishj.aspx/"+MethodName,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (xml) {

            var tmpRes = xml.d;
            let shiftedString = shiftBytes(tmpRes, 0);

            var $xml = $(shiftedString);
            callback($xml);
        },
        error: function (ex) {
            console.log("LoadObj " + ex);
        }
    });
}
function shiftBytes(jsCompatibleString, shiftAmount) {
    // Convert the JavaScript compatible string back to bytes
    let hexBytes = jsCompatibleString.match(/.{1,2}/g) || [];
    let shiftedBytes = new Uint8Array(hexBytes.map(byte => parseInt(byte, 16)));

    // Perform bitwise right shift on each byte
    for (let i = 0; i < shiftedBytes.length; i++) {
        shiftedBytes[i] = shiftedBytes[i] >> shiftAmount;
    }

    // Convert bytes back to string
    let originalString = new TextDecoder().decode(shiftedBytes);
    return originalString;
}
