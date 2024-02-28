var ServiceAddress = 'http://192.168.100.170:7000/DeveloperTest/LabbafM/CrowdUgp/SrvCrowdNew.svc/json/';
ServiceAddress_ = 'https://esup.yazd.ir/Jamsepari/Crowd/SrvCrowdNew.svc/json/';


var SrviceDig0 = 'http://192.168.100.198/DigServices/DigService.svc/json/';
var SrviceDig = 'https://saraweb.shiraz.ir/DigService/Srv/DigService.svc/json/';
var CI_ServiceDig = 'https://saraweb.shiraz.ir/DigService/CIDIG/CiServices.svc/json/';
var CI_ServiceCom = 'http://192.168.100.170:7000/SaraM1/CiSrvSara/CiServices.svc/json/';
var FeedBackAddress = 'http://localhost/Chat/UFeedBack.html';
var HideNidWorkitem = true;
var SecurityService = 'http://localhost/Security8.Web/Service/Securitywcf.svc/json/';
//SecurityService = 'http://shahr1.mashhad.ir:8200/SecurityWCF.svc/json/';
//------------------------------Bank
var BankPaymentAddress = 'http://dev.safarayaneh.com:7000/DeveloperTest/LabbafM/PaymentProjectForTestBank/paymentTest.aspx';
var BankPaymentDarAmad = 'http://dev.safarayaneh.com:7000/DeveloperTest/LabbafM/PaymentProjectForTestBank/paymentTest.aspx';
var BankPaymentKarshenasi = 'http://dev.safarayaneh.com:7000/DeveloperTest/LabbafM/PaymentProjectForTestBank/PaymentTest.aspx';


var BankPaymentNew = 'http://dev.safarayaneh.com:7000/UGP/SafaPayment/api/Payment';
BankPaymentNew = 'http://192.168.100.194:5007/api/Payment';
var PaymentType = '1';
var GatewayName = '7';
var WEsupAddress = 'http://dev.safarayaneh.com:7000/Api_workflow';


var TaskService = 'http://192.168.100.170:7000/Task/TaskService.svc/json/';


var PaymentType = '1';
var GatewayName = '1';


var EstelamBankList = ["بانک مسکن", "بانک ملی", "بانک مهر اقتصاد", "مهر اقتصاد"];
//--------------------------------------UgpService
var UCFService = 'http://192.168.100.170:7000/UGP/Site/SC/srvSC.svc';
var UgpService = 'http://192.168.100.170:7000/UGP/Ugp/srvUGP.svc/json/';
UgpService = 'http://localhost/UGPwcf/srvUGP.svc/json/';

//--------------------------------------Login

var LoginPage = 'http://localhost/LoginProject/Form/SafaLogin.aspx?Domain=UGPNew';
//var LoginPage = 'http://labbafm/LoginProject/Form/SafaLogin.aspx?Domain=UGPNew205';

var LoginPageAdmin = 'http://localhost/SafaManMail/Form/SafaLoginMainSec.aspx?Domain=UGPNew';
var IsShowLoginPageAdmin = false;
var UGPSafaAuth = 'http://localhost/UGPNew/Secure/SafaAuth.svc/json/Login';//'http://dev.safarayaneh.com:7000/UGP/UGPSafaAuth/SafaAuth.svc/json/Login';
//--------------------------------------Captcha
var CaptchaAddress = 'http://localhost/SafaManmail/PanoService/Authorize';
var CaptchaIndex = 1;

//--------------------------------------WorkFlow
var RequestTypeGuid = '285dae48-808d-4eba-89af-93f53e28ac6c';
var RequestTypeBazdidGuid = 'a0b245cc-4ec3-4fdd-9031-08762d871b94';
var RequestTypeTransferGuid = '643f71dd-d05f-4663-9e9c-52815a7b5cc8';
var NidWorkFlowDeff_Payankar = 'feffdb44-12fd-45dc-986f-105c5a4b018d';
var NidWorkFlowDeff_PayankarNew = 'feffdb44-12fd-45dc-986f-105c5a4b018d';
var NidWorkFlowDeff_Hardening = '9435aa8a-cc82-43f0-a2b9-d0ef37103270';
var NidWorkFlowDeff_Parvaneh = '646a2101-a0c5-431b-8723-05ed7fd1eac1';
NidWorkFlowDeff_Parvaneh = 'bb0854be-4002-4c0c-975c-04b4b8485334';

var NidWorkFlowDeff_ParvanehSh = '212a86cd-08de-45a3-ae15-52631dd0fcc5';

var CheckBaygani = false; //پرونده شما در شهرسازی باید به مرحله تایید و بایگانی رسیده باشد

//--------------------------------------گام انتقال
var ShowTransferPayment = true; //پرداخت هزینه کارشناسی
var CostKarshenasi = 1000; // هزینه کارشناسی

var WaitAgentTime = 2; //In Minute زمان انتظار از انتخاب مامور بازدید تا ثبت درخواست
var CheckValidateLetterDate = true; // چک کردن تاریخ نامه که از امروز بزرکتر نباشد
var CheckManagerConfirm = true; //چک کردن تایید مدیر
var CheckManagerConfirmEstelam = true;
var FirstAvarez = false; //
var SenfiAllowed = false;

var ShowFichePasmand = true; //نمایش و محاسبه فیش پسماند
var ShowFicheDarAmad = true; //نمایش و محاسبه فیش درآمد
var ClaculateDarAmad = true; //فیش درآمد لحظه ای محاسبه میشود
var IsCalcInRevisit = false;  //محاسبه عوارض بدون بازدید


var DontCheckSMS = true;
var ConfirmSMSReadOnly = true;
var ConfirmCodeCheck = false; // چک کردن شماره تماس مالک در گام انتخاب کارشناس بازدید
var ShowDafater = true;
//--------------------------------------Archive & Upload
var ArchiveService = 'http://192.168.100.170:7000/Archive/ArchiveService/ArchiveM1/ArchiveService.svc/json2/';
var CI_Archivegroup = 10; //کد گروه
var Archive_NidEntity = 130; //گروه ارشیو مثلا شهروند سپاری-استعلام
var Archive_NidEntitySend = 131; //گروه ارشیو مثلا شهروند سپاری ارسال مدارک
var Archive_NidEntityLetter = 132; //گروه ارشیو شهروند سپاری نامه ها
var Archive_NidEntityTransfer = 133; //شهروندسپاری - انتقال
var Archive_NidEntityPayankar = 134; //شهروندسپاری - پایانکار
var Archive_NidEntityHardening = 135; //شهروندسپاری - سفتکاری
var Archive_NidEntityParvaneh = 136; //شهروندسپاری - پروانه
var Archive_NidEntityDwg = 132; //گروه ارشیو شهروند سپاری نقشه DWG

var ShowEntity = [0, 5, 130, 131, 132, 133, 134, 135, 136];

var CI_ArchivegroupList = [10, 1, 2];
var Upload_MinFileSize = 2;
var Upload_MaxFileSize = 2000;
var ShowOldArchive = true;
var CanDeleteArchiveFile = true;
//--------------------------------------Report Print
var FactorUrl = 'http://192.168.100.170:7000/ReportService/RptViewer/Viewer/RptViewer.aspx?ReportPath=/Sara8Reports/';
FactorUrl = 'http://192.168.100.170:7000/ReportService/RptViewer14/Viewer/RptViewer.aspx?ReportPath=/Sara8Reports/';

var ShowPrint = true;
//--------------------------------------Map LoadLayer With UserCode
var UserCode = '7bc16d9a-9ac4-47af-bc28-adad1622a054'; // لایه های دسترسی داده شده به این کاربر لود میشود

//--------------------------------------Shahrsazi
var SrvSA = 'http://192.168.100.170:7000/UGP/Site/SA/srvSA.svc/json/';
//SrvSA = 'http://esup.shiraz.ir/Sara8_M1/SA/srvSA.svc/json/';
SrvSA = '#1#http://dev.safarayaneh.com:7000/SaraM1/SA/srvSA.svc/json/#1#\
#2#http://dev.safarayaneh.com:7000/SaraM2/SA/srvSA.svc/json/#2#\
#3#http://dev.safarayaneh.com:7000/SaraM3/SA/srvSA.svc/json/#3#'


var SrvSK = 'http://dev.safarayaneh.com:7000/SK/Srv/srvSK.svc/json/'
var SrvSC = '#1#http://dev.safarayaneh.com:7000/SaraM1/SC/srvSC.svc/json/#1# #2#http://dev.safarayaneh.com:7000/SaraM1/SC/srvSC.svc/json/#2#';
var CI_Service1 = 'http://192.168.100.170:7000/SaraM1/CiSrvSara/CiServices.svc/json/';
var CI_Service = 'http://localhost/CiSrvUgp2/CiServices.svc/json/';

var SrvSD = "http://192.168.100.24/WCF.SD/srvSD.svc/json/";

//--------------------------------------Setting
var DebugMode = false;
var logingMenu = true;

var BusyTextDefualt = "دریافت اطلاعات";
var StatisticsIsShow = false;
var TmpTel = '31291513';
var ErrorMessageSaveStep = 'کاربر گرامی ٬ مجدد تلاش کنید، در صورت نیاز به راهنمایی بیشتر با شماره 31291513  تماس حاصل فرمایید';
var ErrorMessageGam = 'شهروند محترم ، درخواستی با این مشخصات در سامانه یافت نشد . خواهشمند است با در دست داشتن مدارک به نزدیک ترین دفتر پیشخوان دولت مراجعه فرمایید .';

var CheckCertificateForRequestMessage = 'بدلیل مسکونی نبودن آپارتمان امکان پاسخگویی وجود ندارد';
var ConfirmManagerMessage = 'پرونده ، تایید  شد.';
var ConfirmManagerForAvarezMessage = 'ابتدا باید تایید مدیر انجام شود';

var ExportInquiryErrorMessage = 'خطا در صدور پرونده ، لطفا به راهبر سیستم اطلاع دهید';
var ExportMessage = 'صدور پروانه با موفقیت انجام شد';  //پیغام بعد از صدور گواهی

//--------------------------------------Map & Pano
//کد لایه وضع موجود
var LayerID = "32";
//وقتی روی نقشه ملک انتخاب میشود در بین کد لایه های زیر جستجو میشود
var SelectionLayerList = "32";
//کد لایه های پیش فرض که باید روشن شوند
var MapDefaultCheckedLayerTafziliId = ["32", "220"];

var CurrentLocation = [36.28, 50.01];
var Map_ZoomLevel = 13;
var Map_MaxZoom = 22;

var tmpPanoServer = "http://EsupService.mashhad.ir:8105/";
var GisProxyService = 'http://EsupService.mashhad.ir:8104/PanoService/';
var copyrightText = "� Mashhad Municipality";
var panoLayerSets = {
    "92a": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
};
var panoLayerSet = "92a";
var TileLayer = "";
var SharNampage = false;


var CommissionServiceUrl = 'http://dev.safarayaneh.com:7000/Com100/CommissionService/Services/CommissionService.svc/json/';
//var CommissionServiceUrl = 'http://esupt.isfahan.ir/Com100/CommissionServices/Services/CommissionService.svc/json/';
var UPeigiriMode = 3; //1-NidWorkItem / 2-NosaziCode / 3-Both
var PeigiriReportUrl = 'http://192.168.100.170:7000/ReportService/RptViewer/Viewer/RptViewer.aspx?ReportPath=/PeigiriReports/';

var SliderTimer = 5000;
var UgpPublicAddress = 'http://esup.isfahan.ir/ugp/new/desk.html';

var ShowArchiveButton = true;
var ShowReportButton = true;

var HideReferFiled = true;//حذف فیلد ارجاع داده شده در درخواست های پیسشین
var NoValidateNidWorkitem = true;//میتوان شماره درخواست خالی ارسال کرد

var ArchiveProvide = 'http://192.168.100.170:7000/Archive/ArchiveSite/Handlers/ImagePivotProvider.ashx?';
var SaveOrginalFile = true;
//--------------------------------Public Functions


// لود نقشه در گام ها

var IsMapSelectedMode = true;


var baseUrl = "http://192.168.100.191/UGP-Isf2/desk.html"; //آدرس شهروندسپاری

//var ShowRevisitAgentName = true;
var WorkflowReadonly = true;
var StartDayBazdid = 2;


var EnableSSO = 'SSOMyCity'; // 'SSOGov';// 'Authin0';// 'SSOIsfahan----'; // 'Authin';
var SSoLable = 'ورود به یزد من';
var AddCommentTask = true;
var MaxRequestDafater = 4;
var CalenderLimit = 7;
var EnableCaptcha = false;
var CheckGhetee = false;
var LoadLastUploadedFile = true;
var FileExt = '.png,.jpg,.dwg';
var CI_City = '1';  // Shiraz:1  Gorgan:2 Yazd:3
var NewNidNosaziCode = 'B0209DB9-F2F9-4B6F-947C-72C2B3D2E385';

var AddBuyerToComment = true;
var AddNahadToComment = true;


    var IsMapSelectedMode = true;
var BankInfo = {
    BankList: [
        {
            ID: 'B1',
            BankName: 'مبنا',
            ImageUrl: 'Images/BankAp.png',
            BankUrl: 'http://78.38.56.150:9001/Epayment_UGP/payment.aspx',
        },
        {
            ID: 'B2',
            BankName: 'فن آوا',
            ImageUrl: 'Images/bankFanAva.png',
            BankUrl: 'http://78.38.56.150:9001/Epayment_UGP/payment.aspx',
        },
        {
            ID: 'B3',
            BankName: 'تستی شرکت',
            ImageUrl: 'Images/bankFanAva.png',
            BankUrl: 'http://dev.safarayaneh.com:7000/UGP/PaymentProjectForTestBank/paymentTest.aspx',
            //BankUrl: 'http://dev.safarayaneh.com:7000/DeveloperTest/LabbafM/PaymentProjectForTestBank/paymentTest.aspx',


        },
    ],
    SelectedID: 'B3',
};

var DateHoliday = [
    , "1399/03/04", "1399/03/05"
    , "1400/03/16", "1399/03/28", "1399/03/28"
    , "1399/05/18", "1399/05/18"
    , "1399/06/08", "1399/06/09"
    , "1399/07/17", "1399/07/17"
    , "1399/07/26", "1399/07/26"
    , "1399/08/04", "1399/08/04"
    , "1399/08/13", "1399/08/13"
    , "1399/10/28", "1399/10/28"
    , "1399/12/07", "1399/12/07"
    , "1399/12/21", "1399/12/21"]
var BazdidTime = [{
    Time: "08-10",
    isActive: true,
    isPreTime: false
}, {
    isActive: true,
    Time: "10-12",
    isPreTime: false
}, {
    Time: "12-14",
    isActive: true,
    isPreTime: false
}, {
    Time: "14-16",
    isActive: true,
    isPreTime: false
}, {
    Time: "16-18",
    isActive: true,
    isPreTime: false
}];