
var RequestGuid = '3786055d-5875-4e79-b1e2-07dbff0578da';
var PEncryptCode = 'RgnyspwPLUSxnXDKGbYb9vkOwEQUALEQUAL';




var tmpSelectedBank = null;

var ClsPaymentInfo = {
    PaymentType: 1,
    FicheType: 1,
    PaymentTitle: '',
    Price: '',
    NidAccount: '',
    AccountName: '',
    NidUser: '',
    FullUserName: '',
    NidVisitor: '',
    VisitorName: '',
    NidWorkItem: '',
    TrackingCode: '',
    IsTruePayment: false,
    Description: '',
    NosaziCode: '',
    SelectedBankId: BankInfo.SelectedID,
    BankName: '',
    IsBackFromBank: false,
    BillID: '',
    PaymentID: '',
    ReturnUrl: '',
    FicheNo: '',
    NidNosaziCode: '',
    IbanNumber: ''
}
var EumFicheType = {
    'Nosazi': 1,
    'Senfi': 2,
    'Pasmand': 3,
    'Daramad': 4,
    'HK': 0,
};
//public enum PaymentType {
//    [Description("پرداخت قبض")]
//Bill = 1,
//    [Description("خرید")]
//Purchase = 2
//}

$(document).ready(function () {
    debugger;
    ClsPaymentInfo.NidAccount = ClsAccount.AccountInfo != null ? ClsAccount.AccountInfo.NidAccount : '';
    ClsPaymentInfo.AccountName = ClsAccount.AccountInfo != null ? ClsAccount.AccountInfo.OwnerFirstName + ' ' + ClsAccount.AccountInfo.OwnerLastName + "( " + ClsAccount.AccountInfo.AccountName + " )" : '';
    ClsPaymentInfo.NidUser = ClsAccount.UserInfo.NidUser != null ? ClsAccount.UserInfo.NidUser : '';
    ClsPaymentInfo.FullUserName = ClsAccount.UserInfo.NidUser != null ? ClsAccount.UserInfo.FirstName + ' ' + ClsAccount.UserInfo.LastName + "( " + ClsAccount.UserInfo.UserName + " )" : '';
    ClsPaymentInfo.SessionId = ClsAccount.SessionId;

    ClsPaymentInfo.BillID = getParameterByName("BillID");
    ClsPaymentInfo.PaymentID = getParameterByName("PayID");
    ClsPaymentInfo.Price = getParameterByName("Price");
    if (ClsPaymentInfo.Price == '')
        ClsPaymentInfo.Price = getParameterByName("Amount");

    ClsPaymentInfo.FicheType = getParameterByName("DutyType");
    ClsPaymentInfo.PaymentTitle = string_of_enum(EumFicheType, ClsPaymentInfo.FicheType);
    ClsPaymentInfo.NosaziCode = getParameterByName("NosaziCode");
    ClsPaymentInfo.NidWorkItem = getParameterByName("NidWorkItem");
    ClsPaymentInfo.FicheNo = getParameterByName("FicheNo");
    ClsPaymentInfo.NidNosaziCode = getParameterByName("NidNosaziCode");
    if (ClsPaymentInfo.NidNosaziCode == '')
        ClsPaymentInfo.NidNosaziCode = getParameterByName("NidFK");


    if (ClsPaymentInfo.FicheType == EumFicheType.HK)
        ClsPaymentInfo.PaymentType = 2;

    ClsPaymentInfo.IbanNumber = getParameterByName("IbanNumber");


    var SelectdId = BankInfo.SelectedID;
    var paramBankId = getParameterByName("SelectedBank");
    if (paramBankId != '' && paramBankId != undefined && paramBankId != 'undefined')
        SelectdId = paramBankId;
    tmpSelectedBank = BankInfo.BankList.find(x => x.ID == SelectdId);
    if (tmpSelectedBank != null) {
        BankPaymentAddress = tmpSelectedBank.BankUrl;
        ClsPaymentInfo.BankName = tmpSelectedBank.BankName;
    }

    CallPayment3();
});


function CallPayment3() {

    var IsBackFromBank = false;
    var IsPayment = false;
    try {
        // var UGPReturnUrl = getParameterByName("UGPReturnUrl");

        if (getParameterByName("RequestId") != '' || getParameterByName("PaymentResultKey") != '')
            IsBackFromBank = true;

        if (!IsBackFromBank) {
            if (typeof (BankPaymentNew) == 'undefined')
                GetSignature();//Then GotoBank();
            else
                GetEsupSignatureEnc();//Then GotoBank();
        }
        else {//برگشت از بانک
            StartBusy('DivPayment', 'در حال ارجاع به سایت...');
            var RequestId = getParameterByName("RequestId");
            var PaymentResultKey = getParameterByName("PaymentResultKey");

            if (RequestId != '') {
                var d = {
                    RequestId: RequestId,
                    EncUrl: getParameterByName2("ReturnValue"),
                }

                var c = JSON.stringify(d);

                $.ajax({
                    type: "POST",
                    url: "USHowFishj.aspx/GetDecryptUrl",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        var tmpRes = msg.d.Result;


                        var tmpClsPaymentInfo = GetLocalStorage("ClsPaymentInfo");
                        if (tmpClsPaymentInfo != null && tmpClsPaymentInfo != 'null')
                            ClsPaymentInfo = JSON.parse(tmpClsPaymentInfo);

                        ClsPaymentInfo.TrackingCode = tmpRes.TrackingCode;
                        ClsPaymentInfo.IsTruePayment = tmpRes.IsPayment;
                        if (ClsPaymentInfo.FicheNo == undefined || ClsPaymentInfo.FicheNo == '')
                            ClsPaymentInfo.FicheNo = tmpRes.FicheNo;

                        ClsPaymentInfo.NidFK = tmpRes.NidFK;

                        ClsPaymentInfo.BackFromBank = tmpRes.BackFromBank;
                        //ClsPaymentInfo.ResCode = tmpRes.ResCode;
                        //ClsPaymentInfo.SystemTraceNo = tmpRes.SystemTraceNo;


                        var tmpLS = JSON.stringify(ClsPaymentInfo);
                        localStorage.removeItem("ClsPaymentInfo");
                        SetLocalStorage("ClsPaymentInfo-" + RequestId, tmpLS);

                        BackFunc();
                    },
                    error: function (c) {

                    }
                });
            }
            else if (PaymentResultKey != '') {
                verifyApiKey(PaymentResultKey);
            }
        }
    }
    catch (ex) {
    }
}

function EncryptInput(d) {

    const passphrase = './../store/index';
    var c = JSON.stringify(d);

    const encryptedText = CryptoJS.AES.encrypt(c, passphrase).toString();

    var EncData = {
        "pdata1": encryptedText
    }
    c = JSON.stringify(EncData);
    return c;
}

function verifyApiKey(PaymentResultKey) {
    var d = {
        ApiKey: PaymentResultKey,
    }

    var c = EncryptInput(d);

    //var c = JSON.stringify(d);

    $.ajax({
        type: "POST",
        url: WEsupAddress + '/verifyApiKey',
        data: c,
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,

        success: function (msg) {
            var tmpRes = msg.data;
            
            var tmpClsPaymentInfo = GetLocalStorage("ClsPaymentInfo");
            if (tmpClsPaymentInfo != null && tmpClsPaymentInfo != 'null')
                ClsPaymentInfo = JSON.parse(tmpClsPaymentInfo);

            if (tmpRes.Status == 'verified') {
                var tmpResJson = JSON.parse(tmpRes.item.StrValue)

                if (tmpResJson.paymentStatus == true) {
                    ClsPaymentInfo.TrackingCode = tmpResJson.rahgiriCode;
                    ClsPaymentInfo.IsTruePayment = true;
                    if (tmpResJson.ficheNo != null && tmpResJson.ficheNo != '')
                        ClsPaymentInfo.FicheNo = tmpResJson.ficheNo;
                    ClsPaymentInfo.NidFK = tmpResJson.bizCode;
                }
            }
            ClsPaymentInfo.BackFromBank = true;
            var tmpLS = JSON.stringify(ClsPaymentInfo);
            localStorage.removeItem("ClsPaymentInfo");
            SetLocalStorage("ClsPaymentInfo-" + PaymentResultKey, tmpLS);

            BackFunc();
        },
        error: function (ex) {
            console.log(ex);
            console.log(WEsupAddress + "/verifyApiKey");
            console.log(c);
        }
    });
}

function GetSignature() {
    StartBusy('DivPayment', 'در حال ارجاع به صفحه بانک...');
    $.ajax({
        type: "POST",
        url: "USHowFishj.aspx/GetSignature",
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,

        success: function (msg) {
            //StopBusy('DivPayment');
            RequestGuid = msg.d.Result.RequestID;
            EncryptCode = msg.d.Result.EncryptCode;
            GotoBank();
        },
        error: function (c) {
            GotoBank();
        }
    });
}
function GetEsupSignature() {

    var tmpDistrict = ClsPaymentInfo.NosaziCode.split('-')[0];

    //if (ClsPaymentInfo.FicheType == 0)
    //    ClsPaymentInfo.FicheType = 4; // در سیستم جدید هزینه کارشناسی 4 هست

    StartBusy('DivPayment', 'در حال ارجاع به صفحه بانک...');
    //var d = {"StrValue": "{\"GateWayId\":1,\"ProjectId\":\"1\",\"DutyId\":" + ClsPaymentInfo.PaymentType + ",\"PaymentTypeId\":1,\"UserId\":\"f797e621-5776-4c81-9155-265ec4c7d89e\",\"District\":" + tmpDistrict + ",\"BillId\":\"" + ClsPaymentInfo.BillID + "\",\"PaymentId\":\"" + ClsPaymentInfo.PaymentID + "\",\"CallBackURL\":\"http://localhost/ugpnew/UShowFishj-Pay3.aspx\",\"Amount\":" + ClsPaymentInfo.Price + "}" }
    // var d = {"StrValue": "{\"GateWayId\":1,\"ProjectId\":\"1\",\"DutyId\":1,\"PaymentTypeId\":1,\"UserId\":\"f797e621-5776-4c81-9155-265ec4c7d89e\",\"District\":1,\"BillId\":\"9699871879768\",\"PaymentId\":\"0000000103329\",\"CallBackURL\":\"http://dev.safarayaneh.com:7000/DeveloperTest/LabbafM/ugpnew2/UShowFishj-Pay3.aspx\",\"Amount\":1000}" }
    var d =
    {

        "StrValue": "{\"Price\":\"" + ClsPaymentInfo.Price + "\"" +
            ",\"billID\":\"" + ClsPaymentInfo.BillID + "\"" + ",\"paymentID\":\"" + ClsPaymentInfo.PaymentID + "\""
            + ",\"paymentType\":\"" + ClsPaymentInfo.PaymentType + "\""
            + ",\"ficheType\":\"" + ClsPaymentInfo.FicheType + "\""
            + ",\"IbanNumber\":\"" + ClsPaymentInfo.IbanNumber + "\""
            + ",\"district\":\"" + tmpDistrict + "\""
            + ",\"gatewayName\":\"" + GatewayName + "\""
            + ",\"ficheNo\":\"" + ClsPaymentInfo.FicheNo + "\""
            + ",\"requesterKey\":\"" + ClsPaymentInfo.NidNosaziCode + "\""
            + ",\"bizCode\":\"" + ClsPaymentInfo.NidNosaziCode + "\""
            + ",\"appNameId\":\"" + '1' + "\""
            + ",\"userId\":\"" + ClsAccount.AccountInfo.NidAccount + "\""
            + ",\"mobile\":\"" + ClsAccount.AccountInfo.OwnerTell + "\""
            + ",\"siteCallBackUrl\":\"" + window.location.origin + "/" + window.location.pathname + "\"" + "}"


    }

    var c = JSON.stringify(d);
    $.ajax({
        type: "POST",
        url: WEsupAddress + "/GenerateApiKey",
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        data: c,

        success: function (msg) {
            //StopBusy('DivPayment');
            
            ClsPaymentInfo.TokenGuid = msg.data;
            RequestId = ClsPaymentInfo.TokenGuid;
            GotoBankNew();
        },
        error: function (c) {
            GotoBankNew();
        }
    });
}
function GetEsupSignatureEnc() {
    var tmpDistrict = ClsPaymentInfo.NosaziCode.split('-')[0];
    StartBusy('DivPayment', 'در حال ارجاع به صفحه بانک...');
    var d =
    {
        "StrValue": "{\"Price\":\"" + ClsPaymentInfo.Price + "\"" +
            ",\"billID\":\"" + ClsPaymentInfo.BillID + "\"" + ",\"paymentID\":\"" + ClsPaymentInfo.PaymentID + "\""
            + ",\"paymentType\":\"" + ClsPaymentInfo.PaymentType + "\""
            + ",\"ficheType\":\"" + ClsPaymentInfo.FicheType + "\""
            + ",\"IbanNumber\":\"" + ClsPaymentInfo.IbanNumber + "\""
            + ",\"district\":\"" + tmpDistrict + "\""
            + ",\"gatewayName\":\"" + GatewayName + "\""
            + ",\"ficheNo\":\"" + ClsPaymentInfo.FicheNo + "\""
            + ",\"requesterKey\":\"" + ClsPaymentInfo.NidNosaziCode + "\""
            + ",\"bizCode\":\"" + ClsPaymentInfo.NidNosaziCode + "\""
            + ",\"appNameId\":\"" + '1' + "\""
            + ",\"userId\":\"" + ClsAccount.AccountInfo.NidAccount + "\""
            + ",\"mobile\":\"" + ClsAccount.AccountInfo.OwnerTell + "\""
            + ",\"siteCallBackUrl\":\"" + window.location.origin + "/" + window.location.pathname + "\"" + "}"

    }

    const passphrase = './../store/index';
    var c = JSON.stringify(d);

    const encryptedText = CryptoJS.AES.encrypt(c, passphrase).toString();

    var EncData = {
        "pdata1": encryptedText
    }

    //var c = JSON.stringify(d);
    var c = JSON.stringify(EncData);

    $.ajax({
        type: "POST",
        url: WEsupAddress + "/GenerateApiKey",
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        data: c,

        success: function (msg) {
            
            if (msg.success == true) {
                ClsPaymentInfo.TokenGuid = msg.data;
                RequestId = ClsPaymentInfo.TokenGuid;
                GotoBankNew();
            }
            else
                alert('خطا در تابع GenerateApiKey، لطفا به راهبر سیستم اطلاع دهید');
        },
        error: function (c) {
            GotoBankNew();
        }
    });
}

function GotoBank() {
    var tmpR = document.referrer;
    //این خط برای این است که اگر چند بار از صفحه بانک برگشت بزنیم پارامترها تکرار میشد
    if (tmpR.indexOf('IsPayment=') > -1)
        tmpR = tmpR.substr(0, tmpR.indexOf('IsPayment=') - 1);
    if (tmpR.indexOf('RequestId=') > -1)
        tmpR = tmpR.substr(0, tmpR.indexOf('RequestId=') - 1);

    // var prmType = getParameterByName("Type");
    // var prmNosaziCode = getParameterByName("NosaziCode");

    UGPReturnUrl = tmpR;
    ClsPaymentInfo.ReturnUrl = tmpR;

    var tmpLS = JSON.stringify(ClsPaymentInfo);
    SetLocalStorage("ClsPaymentInfo", tmpLS);

    var tmplocationSearch = location.search.replace("DutyType=5", "DutyType=4");

    if (ClsPaymentInfo.FicheType == EumFicheType.HK) {
        var tmpPath = location.origin + location.pathname;
        window.open(BankPaymentKarshenasi + location.search + '&RequestGuid=' + RequestGuid + '&PEncryptCode=' + EncryptCode + '&Comment=', "_self", "width =800, height =600 ,resizable=yes");
    }


    //else if (ClsPaymentInfo.PaymentType == EumFicheType.Nosazi || ClsPaymentInfo.PaymentType == EumFicheType.Pasmand || ClsPaymentInfo.NosaziCode != '')
    else if (ClsPaymentInfo.FicheType == EumFicheType.Nosazi || ClsPaymentInfo.FicheType == EumFicheType.Pasmand)
        window.open(BankPaymentAddress + location.search + '&RequestGuid=' + RequestGuid + '&PEncryptCode=' + EncryptCode, "_self");
    else
        window.open(BankPaymentDarAmad + tmplocationSearch + '&RequestGuid=' + RequestGuid + '&PEncryptCode=' + EncryptCode, "_self");
}
function GotoBankNew() {
    var tmpR = document.referrer;
    //این خط برای این است که اگر چند بار از صفحه بانک برگشت بزنیم پارامترها تکرار میشد
    if (tmpR.indexOf('IsPayment=') > -1)
        tmpR = tmpR.substr(0, tmpR.indexOf('IsPayment=') - 1);
    if (tmpR.indexOf('RequestId=') > -1)
        tmpR = tmpR.substr(0, tmpR.indexOf('RequestId=') - 1);


    UGPReturnUrl = tmpR;
    ClsPaymentInfo.ReturnUrl = tmpR;

    var tmpLS = JSON.stringify(ClsPaymentInfo);
    SetLocalStorage("ClsPaymentInfo", tmpLS);

    var createBankAddress = BankPaymentNew + '?ApiKey=' + ClsPaymentInfo.TokenGuid;
    //var createBankAddress = BankPaymentNew + location.search + '&ApiKey=' + ClsPaymentInfo.TokenGuid;

    window.open(createBankAddress, "_self");
}
function BackFunc() {
    // alert('return From Bank');
    var UGPReturnUrl = ClsPaymentInfo.ReturnUrl;

    var CurrentUrlParams = location.search;

    if (UGPReturnUrl.indexOf("?") > -1)
        CurrentUrlParams = CurrentUrlParams.replace('?', '&');

    var MakeReturnUrl = UGPReturnUrl + CurrentUrlParams;

    if (ClsPaymentInfo.NosaziCode != '')
        MakeReturnUrl += '&NosaziCode=' + ClsPaymentInfo.NosaziCode;

    var tmpSessionId = ClsPaymentInfo.SessionId + "Lsppp";
    MakeReturnUrl += '&S=' + window.btoa(tmpSessionId);

    SavePaymentLog();

    MakeReturnUrl = MakeReturnUrl.replace("PaymentResultKey", "RequestId");

    if (UGPReturnUrl != '')
        window.open(MakeReturnUrl, '_self');
}

function SavePaymentLog() {
    if (ClsPaymentInfo.TrackingCode != null && ClsPaymentInfo.TrackingCode != '' && ClsPaymentInfo.FicheType != '0') {
        var d = { pPaymentLog: ClsPaymentInfo };
        var c = JSON.stringify(d);
        $request = $.ajax({
            type: "POST",
            url: 'UShowPayments.aspx/InsertPaymentLog',
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
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function getParameterByName2(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1]);
}

function string_of_enum(EumFicheType, value) {
    for (var k in EumFicheType)
        if (EumFicheType[k] == value) {
            if (k == 'Nosazi')
                k = 'عوارض نوسازی';
            else if (k == 'Pasmand')
                k = 'عوارض پسماند';
            else if (k == 'Daramad')
                k = 'عوارض درآمد';
            else if (k == 'HK')
                k = 'هزینه کارشناسی';
            else if (k == 'Senfi')
                k = 'عوارض صنفی';
            return k;
        }
    return null;
}
