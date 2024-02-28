var ServiceAddress0 = 'http://safatest.mashhad.ir:7777/CrowdsourcingSrv/srvCrowdsourcing.svc/json/';
var ServiceAddress00 = 'http://shahr.mashhad.ir:8072/CrowdsourcingSrv/srvCrowdsourcing.svc/json/';
var ServiceAddress000 = 'http://safatest.mashhad.ir:9003/CrowdsourcingSrv/srvCrowdsourcing.svc/json/';
var ServiceAddress9 = 'http://shahr.mashhad.ir:8072/CrowdsourcingSrv/srvCrowdsourcing.svc/json/';
var ServiceAddress = 'http://shahr1.mashhad.ir:8072/CrowdsourcingSrvNew2/SrvCrowdNew.svc/json/';
    ServiceAddress = 'http://shahr1.mashhad.ir:8072/CrowdsourcingSrvNew2/SrvCrowdNew.svc/json/';
var RevisitAddress = 'http://192.168.100.199/Calendar/CalendarService.svc/JSON/';

var CaptchaAddress = 'http://localhost/UGP.UI/PanoService/Authorize';
var CaptchaIndex = 1;
var UCFService = 'http://safatest.mashhad.ir:7777/Sara8/SC/srvSC.svc';

//var UgpService0 = 'http://localhost/UGPwcf/srvUGP.svc/json/';
var UgpService = 'http://shahr1.mashhad.ir:8055/UgpService/srvUGP.svc/json/';

//var LoginPage = 'http://safatest.mashhad.ir:7777/ManMail/Form/SafaLoginNew.aspx?Domain=Local';
var LoginPage = 'http://shahr1.mashhad.ir/ManMail/Form/SafaLoginNew.aspx?Domain=LocalSh';//'http://localhost/SafaManMail/Form/SafaLogin2.aspx?Domain=Local';
//LoginPage = 'http://shahr1.mashhad.ir/ManMail/Form/SafaLoginNew.aspx?Domain=Local';

//var LoginPage0 = 'http://shahr1.mashhad.ir/ManMail/Form/SafaLoginNew.aspx?Domain=Local';

var LoginPageAdmin = 'http://localhost/SafaManMail/Form/SafaLoginMainSec.aspx?Domain=Local';

//"استعلام آنی جمع سپاری";
var RequestTypeGuid = '83406869-9A8B-4B80-9A13-F74F946FF84F';
var RequestTypeBazdidGuid = '83406869-9A8B-4B80-9A13-F74F946FF84F';
var RequestTypeTransferGuid = 'BDA49CCE-DFE8-4ECC-8EEC-C6D6A1EB6A76';

var FactorUrl = 'http://esupt.isfahan.ir/ReportManager/RptViewer/Viewer/RptViewer.aspx?ReportPath=/Sara8Reports/';
function isEmpty(s) {
    return !s.length;
}

function isBlank(s) {
    return isEmpty(s.trim()) || s == '&nbsp;' || s == 'undefined';
}
var BankPaymentAddress = 'http://shahr1.mashhad.ir/Bank/payment.aspx';
var BankPaymentDarAmad = 'http://shahr1.mashhad.ir/BankDaramad/payment.aspx';

var SrvSD = "http://safatest.mashhad.ir:9003/SDORG/srvSD.svc/json/";
SrvSD0 = "http://192.168.100.24/WCF.SD/srvSD.svc/json/";


var RevisitAgentGuid = '888d316c-5056-4c6c-83ec-6c70dbe33c35';
var SrvSC = 'http://esupservice.mashhad.ir:8048/srvSC.svc/json/';
var DebugMode = true;
var logingMenu = true;
var LayerID = "5";

var SrvSA = 'http://sarasafa.mashhad.ir:8041/srvSA.svc/json/';

var TmpTel = '31291513';
var BusyTextDefualt = "دریافت اطلاعات";
var StatisticsIsShow = true;

String.prototype.toEnglishDigits = function () {
    var charCodeZero = '۰'.charCodeAt(0);
    return parseInt(this.replace(/[۰-۹]/g, function (w) {
        return w.charCodeAt(0) - charCodeZero;
    }));
}



try {

    function LoadMap() {

        var AppInfo = "";
        L.Icon.Default.imagePath = 'images/';

        MyMap.SetMapMode(EumMapModeS.Pan);
        MyMap.LoadMap('m', [36.30, 59.60], 12);

        MyMap.ShowLayer(652, ' طرح تفصیلی خازنی');
        MyMap.ShowLayer(844, 'طرح تفصیلی مهرازان 13');
        MyMap.ShowLayer(653, 'طرح تفصیلی مهرازان 14-15-16');
        MyMap.ShowLayer(667, 'طرح تفصیلی تاش مرکز شهر');
        MyMap.ShowLayer(3942, 'سایر طرح های تفصیلی');
        MyMap.ShowLayer(3711, 'طرح تفصیلی ثامن');
        MyMap.LoadLayer(3, 'شبکه معابر');
        MyMap.ShowLayer(5, 'قطعه بندی املاک');

        MyMap.ShowLayerBox();

        MyMap.LoadBaseMap('Map2');

        MyMap.ShowMapToolBar();

        //SafaMapLayer.prototype.SetOnOffLayer(650, 'http://smap.mashhad.ir:8006/TileProvider.ashx?x={x}&amp;y={y}&amp;z={z}&amp;mapType=SqlLayer&amp;LayerIds=650&amp;k=0&amp;requestId=a02994f3-a690-4e7a-87c8-65684b3b0d83');
    }

    function LoadMap2() {

        try {
            var AppInfo = "";
            L.Icon.Default.imagePath = 'images/';

            MyMap.SetMapMode(EumMapModeS.Pan);
            MyMap.LoadMap('m', [36.30, 59.60], 13);

            MyMap.ShowLayer(5, 'قطعه بندی املاک');
            MyMap.ShowLayer(3, 'شبکه معابر');

            MyMap.ShowLayerBox();
            MyMap.LoadBaseMap();
        }
        catch (ex) { alert(ex); }
    }

    function LoadMap3() {

        MyMap.LoadMap('m', [36.30, 59.60], 13);
        MyMap.ShowLayer(3928, 'قیمت منطقه ای');
        MyMap.ShowLayer(5, 'قطعه بندی املاک');

        MyMap.ShowLayerBox();
        MyMap.LoadBaseMap();
    }


    function LoadAndShow(pwkt) {
        LoadMap();
        MyShowWkt(pwkt);
    }

    function MyShowWkt(pwkt, header) {
        try {
            MyMap.ShowWkt(pwkt, 'blue', header)
        } catch (ex) { }
    }

    var NosaziCode = "";
    var MapNosaziCode = "";

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var IsMapSelectedMode = true;

}
catch (ex) { }