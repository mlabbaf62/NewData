// 0: check token call is not completed
// 1: check token is called and an error is occurred
// 2: check token is called and token is not present
// 3: check token is called and token is present

var parskeyToken = {
    tokenInfo: "",
    tokenSlotIdx: -1
};

var ctr = 0;
var users = [];
var maxValidCertCtr = 0;
var certCheck = false;
var signerKeyID = "";
var ServerCallenge = "8DF3E7714672E0C6608893EC74393590AD55418606EF97A4A949E35C66C83222";

var parskeyTokens = new Array();
var g_checkParskeyTokenFlg = 0;
var i = 0;


var check = false;

var HiddenClientActivityLog = "";
var HiddenClientChallengeSigned = "";
var HiddenClientCertificate = "";
var HiddenUserChecked = "";
var HiddenClientUserList = "";
var HiddenClientRandomNumber = "";
var HiddenClientActivityInfo = "";
//var HiddenServerChallenge = "";
var CurrentCertName = "";

// this function check all tokens of different vendors such as parskey
function Check_ClassE_Tokens() {
    /*--- define variable ---*/
    var rootMethod = " Check_ClassE_Tokens ()";
    ////////////////////////////////////////

    if (g_checkParskeyTokenFlg == 0)
        checkParskeyToken(rootMethod);

    else if (g_checkParskeyTokenFlg == '')
            ;// alert('Connected token has a problem');
    else if (g_checkParskeyTokenFlg == 2) // Parskey token is not connected
    {
        TokenComplete(null);
    }
    else if (g_checkParskeyTokenFlg == 3) // Parskey token is connected
    {
        showCerts();
    }
}

function checkParskeyToken(rootMethod1) {
    var rootMethod = "checkParskeyToken ('" + rootMethod1 + "')";
    var present = -1;

    // --- Service Connection Operation ---
    if (!PK_ServiceConnection.isCalled) {
        PK_ServiceConnection.rootMethod = rootMethod;
        PK_ServiceConnection.showErrorAlert = false;
        PK_ServiceConnection.call("https");
        return true;
    }
    else if (PK_ServiceConnection.isCalled && !PK_ServiceConnection.success) {
        PK_ServiceConnection.reset();
        methodIsCalled = false;
        //document.getElementById(rfreshBtnHtmlID).disabled = false;
        alert("signing operation has been failed due to : " + PK_ServiceConnection.pk_opErrorMessage + ' (' + PK_ServiceConnection.pk_opErrorCode + ')');
        return false;
    }
    // --- End of Service Connection Operation ---

    // --- Load Cryptoki Operation ---

    if (!PK_SetCryptoki.isCalled) {
        PK_SetCryptoki.rootMethod = rootMethod;
        PK_SetCryptoki.showErrorAlert = false;

        PK_SetCryptoki.pk_ipCryptokiType = 0;
        PK_SetCryptoki.pk_ipCryptoki = "parskey11.dll";

        PK_SetCryptoki.call();
        return true;
    }
    else if (PK_SetCryptoki.isCalled && !PK_SetCryptoki.success) {
        PK_SetCryptoki.reset();
        PK_ServiceConnection.reset();
        alert("signing operation has been failed due to : " + PK_SetCryptoki.pk_opErrorMessage + ' (' + PK_SetCryptoki.pk_opErrorCode + ')');
        document.getElementById("HiddenClientActivityLog").value = "0401";
        return false;
    }

    // ---- End of Load Cryptoki Operation ---

    // --- Get Slot count ---
    if (!PK_GetSlotCount.isCalled) {
        PK_GetSlotCount.rootMethod = rootMethod;
        PK_GetSlotCount.showErrorAlert = false;
        PK_GetSlotCount.call();
        return true;
    }
    else if (PK_GetSlotCount.isCalled && !PK_GetSlotCount.success) {
        //PK_GetSlotCount.reset();
        //PK_SetCryptoki.reset();
        //PK_ServiceConnection.reset();

        if (PK_GetSlotCount.pk_opSlotCount == 0)
            g_checkParskeyTokenFlg = 2;
        else if (PK_GetSlotCount.pk_opSlotCount == 1)
            g_checkParskeyTokenFlg = 3

        if (rootMethod1 == undefined)
            rootMethod1 = "Check_ClassE_Tokens()";
        eval(rootMethod1); //callback

        //alert("signing operation has been failed due to : " + PK_GetSlotCount.pk_opErrorMessage + ' (' + PK_GetSlotCount.pk_opErrorCode + ')');
        //return false;
    }
    else if (PK_GetSlotCount.isCalled && (PK_GetSlotCount.pk_opErrorCode == 0)) {
        nSlot = PK_GetSlotCount.pk_opSlotCount;
        g_checkParskeyTokenFlg = 3
        eval(rootMethod1); //callback
    }
}

function showCerts() {
    var rootMethod = "showCerts()";

    while (i < nSlot) {
        // --- is the token is present? ---
        if (!PK_CheckToken.isCalled) {
            PK_CheckToken.rootMethod = rootMethod;
            PK_CheckToken.showErrorAlert = false;
            PK_CheckToken.pk_ipSlotId = i;
            PK_CheckToken.call();
            return true;
        }
        else if (PK_CheckToken.isCalled && !PK_CheckToken.success) {
            PK_CheckToken.reset();
            i++;
            continue;
        }
        else if (PK_CheckToken.isCalled && (PK_CheckToken.pk_opErrorCode == 0)) {
            present = PK_CheckToken.pk_opPresent;
        }
        ////////////////////////////////////////

        if (present) {
            var tokenInfo = "";
            var ipJSONtmp;
            var label = "";
            var manufacturerID = "";
            var model = "";
            var serialNum = "";

            // --- Get Slot Information ---
            if (!PK_GetSlotInfo.isCalled) {
                PK_GetSlotInfo.rootMethod = rootMethod;
                PK_GetSlotInfo.showErrorAlert = false;
                PK_GetSlotInfo.pk_ipSlotId = i;
                PK_GetSlotInfo.call();
                return true;
            }
            else if (PK_GetSlotInfo.isCalled && !PK_GetSlotInfo.success) {
                PK_GetSlotInfo.reset();
                PK_CheckToken.reset();
                i++;
                continue;
            }
            else if (PK_GetSlotInfo.isCalled && PK_GetSlotInfo.success) {
                label = PK_GetSlotInfo.pk_opLabel;
                manufacturerID = PK_GetSlotInfo.pk_opManufacturerID;
                model = PK_GetSlotInfo.pk_opModel;
                serialNum = PK_GetSlotInfo.pk_opSerialNumber;
                tokenInfo = label + "::" + serialNum;
            }
            ////////////////////////////////////////

            // --- Get Slot Information ---
            var strSubject = "";
            var strPubKeys = "";

            if (!PK_GetPubKeys.isCalled) {
                PK_GetPubKeys.rootMethod = rootMethod;
                PK_GetPubKeys.showErrorAlert = false;
                PK_GetPubKeys.pk_ipSlotId = i;
                PK_GetPubKeys.call();
                return true;
            }
            else if (PK_GetPubKeys.isCalled && !PK_GetPubKeys.success) {
                PK_GetPubKeys.reset();
                PK_GetSlotInfo.reset();
                PK_CheckToken.reset();
                i++;
                continue;

            }
            else if (PK_GetPubKeys.isCalled && PK_GetPubKeys.success) {
                strSubject = PK_GetPubKeys.pk_opSubjects;
                strPubKeys = PK_GetPubKeys.pk_opPublicKeys;
            }
            ////////////////////////////////////////

            var arrSubjects = strSubject.split(";");
            var arrPubKeys = strPubKeys.split(";");

            while (ctr < arrPubKeys.length) {

                if (arrPubKeys[ctr] != "") {
                    // --- Get certificate ---
                    var cert = "";

                    if (!PK_GetCertById.isCalled) {
                        PK_GetCertById.rootMethod = rootMethod;
                        PK_GetCertById.showErrorAlert = false;
                        PK_GetCertById.pk_ipPubKey = arrPubKeys[ctr];
                        PK_GetCertById.call();
                        return true;
                    }
                    else if (PK_GetCertById.isCalled && !PK_GetCertById.success) {
                        PK_GetCertById.reset();
                        ctr++;
                        continue;

                    }
                    else if (PK_GetCertById.isCalled && (PK_GetCertById.pk_opErrorCode == 0)) {
                        cert = PK_GetCertById.pk_opCertificate;
                    }
                    ////////////////////////////////////////

                    // --- check certificate usage ---
                    //var usage = "KeyUsage::C=T,DIGITAL_SIGNATURE=T,NON_REPUDIATION=T,KEY_ENCIPHERMENT=F,DATA_ENCIPHERMENT=F,KEY_AGREEMENT=F,KEY_CERT_SIGN=F,CRL_SIGN=F,ENCIPHER_ONLY=F,DECIPHER_ONLY=F;ExtendedKeyUsage::C=T,SERVER_AUTH=F,CLIENT_AUTH=F,CODE_SIGN=F,EMAIL_PROTECTION=F,TIME_STAMPING=F,OCSP_SIGN=F,SMART_CARD_LOGIN=F";
                    var usage = "";

                    if (usage != "") {
                        if (!PK_CheckCertUsage.isCalled) {
                            PK_CheckCertUsage.rootMethod = rootMethod;
                            PK_CheckCertUsage.showErrorAlert = false;
                            PK_CheckCertUsage.pk_ipUsage = usage;
                            PK_CheckCertUsage.pk_ipCertificate = cert;
                            PK_CheckCertUsage.call();
                            return true;
                        }
                        else if (PK_CheckCertUsage.isCalled && !PK_CheckCertUsage.success) {
                            PK_CheckCertUsage.reset();
                            PK_GetCertById.reset();
                            ctr++;
                            continue;

                        }
                    }

                    ////////////////////////////////////////

                    // --- Get certificate info ---
                    var subject = "";
                    var pubkey = "";
                    var keyId = "";

                    if (!PK_GetCertInfo.isCalled) {
                        PK_GetCertInfo.rootMethod = rootMethod;
                        PK_GetCertInfo.showErrorAlert = false;
                        PK_GetCertInfo.pk_ipCertificate = cert;
                        PK_GetCertInfo.pk_ipSel = 1;
                        PK_GetCertInfo.call();
                        return true;
                    }
                    else if (PK_GetCertInfo.isCalled && !PK_GetCertInfo.success) {
                        PK_CheckCertUsage.reset();
                        PK_GetCertById.reset();
                        PK_GetCertInfo.reset();
                        ctr++;
                        continue;

                    }
                    else if (PK_GetCertInfo.isCalled && (PK_GetCertInfo.pk_opErrorCode == 0)) {
                        subject = PK_GetCertInfo.pk_opSubject;
                        pubkey = PK_GetCertInfo.pk_opPubKey;
                        keyId = PK_GetCertInfo.pk_opKeyId;
                    }
                    ////////////////////////////////////////

                    // --- Get certificate common name ---
                    var certCN = "";

                    if (!PK_GetCN.isCalled) {
                        PK_GetCN.rootMethod = rootMethod;
                        PK_GetCN.showErrorAlert = false;
                        PK_GetCN.pk_ipCertificate = cert;
                        PK_GetCN.call();
                        return true;
                    }
                    else if (PK_GetCN.isCalled && !PK_GetCN.success) {
                        PK_CheckCertUsage.reset();
                        PK_GetCertById.reset();
                        PK_GetCertInfo.reset();
                        PK_GetCN.reset();
                        ctr++;
                        continue;

                    }
                    else if (PK_GetCN.isCalled && (PK_GetCN.pk_opErrorCode == 0)) {
                        certCN = PK_GetCN.pk_opCN;
                    }

                    ///////////////////////////////////

                    users.push({
                        certificate: cert,
                        pubKey: arrPubKeys[ctr],
                        keyId: keyId,
                        tokenInfo: tokenInfo,
                        certCN: certCN,
                        certInfoIdex: maxValidCertCtr.toString() + "-" + certCN + "-" + tokenInfo,
                        pincode: "",
                        tokenSlotIdx: i
                    });

                    maxValidCertCtr++;
                    PK_GetCertById.reset();
                    PK_CheckCertUsage.reset();
                    PK_GetCertInfo.reset();
                    PK_GetCN.reset();
                }
                else {
                    PK_GetSlotInfo.reset();
                    PK_CheckToken.reset();
                    PK_GetPubKeys.reset();
                }

                ctr++;
            }
            ctr = 0;//end of certificates of a token
        }
        i++;
    }
    i = 0;
    maxValidCertCtr = 0;
    // --- create certificate combo-box ---
    if (users.length > 0) {
        CurrentCertName = users[0].certCN;
        // alert(CurrentCertName);

        login();

    }
    else if (users.length == 0) {
        alert("هیچ گواهی مناسبی بر روی توکن های متصل به سیستم وجود ندارد");
        return false;
    }

    return true;
}

function login() {

    /*--- define variable ---*/

    var rootMethod = "login()";

    ////////////////////////////////////////
    /*--- Check Challenge ---*/
    //var challenge = ServerCallenge;

    if (ServerCallenge == "") {
        alert("مقدار چلنج ارسال شده از سمت سرور خالی می باشد");
        return false;
    }
    /*--- Check PIN ---*/
    if (pincode == "") {
        alert("پين‌كد وارد نشده است");
        HiddenClientActivityLog = "1";
        //document.form1.submit();
        return false;
    }

    /*--- Load Cryptoki Operation ---*/
    if (!PK_SetCryptoki.isCalled) {
        PK_SetCryptoki.rootMethod = rootMethod;
        PK_SetCryptoki.showErrorAlert = false;
        //PK_SetCryptoki.pk_ipCryptokiType = 1;
        //PK_SetCryptoki.pk_ipCryptoki = "[Log]\nACTIVE=false\nPATH=\n\n[Cryptoki]\nLIBRARY_0=pk8000p11.dll\nLIBRARY_1=pk9000p11.dll\n";

        PK_SetCryptoki.pk_ipCryptokiType = 0;
        PK_SetCryptoki.pk_ipCryptoki = "parskey11.dll";

        PK_SetCryptoki.call();
        return true;
    }
    else if (PK_SetCryptoki.isCalled && !PK_SetCryptoki.success) {
        PK_SetCryptoki.isCalled = false;
        alert("signing operation has been failed due to : " + PK_SetCryptoki.pk_opErrorMessage + ' (' + PK_SetCryptoki.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;

    }

    ////////////////////////////////////////

    var signerIdex = 0;


    /*--- Login to token ---*/
    if (!PK_Login.isCalled) {
        PK_Login.rootMethod = rootMethod;
        PK_Login.showErrorAlert = false;
        PK_Login.pk_ipUserType = 1;
        PK_Login.pk_ipSlotId = users[signerIdex].tokenSlotIdx;
        PK_Login.pk_ipPincode = pincode;
        PK_Login.call();
        return true;
    }
    else if (PK_Login.isCalled && !PK_Login.success) {
        PK_Login.reset();
        alert("signing operation has been failed due to : " + PK_Login.pk_opErrorMessage + ' (' + PK_Login.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;

    }

    ////////////////////////////////////////	

    /*--- Random Generation ---*/
    if (!PK_GenRandom.isCalled) {
        PK_GenRandom.rootMethod = rootMethod;
        PK_GenRandom.showErrorAlert = false;
        PK_GenRandom.pk_ipSlotId = users[signerIdex].tokenSlotIdx;
        PK_GenRandom.pk_ipSize = 32;
        PK_GenRandom.call();
        return true;
    }
    else if (PK_GenRandom.isCalled && !PK_GenRandom.success) {
        PK_GenRandom.reset();
        PK_SetCryptoki.reset();
        PK_Login.reset();
        alert("signing operation has been failed due to : " + PK_GenRandom.pk_opErrorMessage + ' (' + PK_GenRandom.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;

    }
    else if (PK_GenRandom.isCalled && (PK_GenRandom.success)) {
        rndNum = PK_GenRandom.pk_opHexRnadomString;
        HiddenClientRandomNumber = rndNum;
    }
    ////////////////////////////////////////

    /*--- make message ---*/
    var msg = ServerCallenge.concat(rndNum);

    /*--- get certificate info ---*/
    if (!PK_GetCertInfo.isCalled) {
        PK_GetCertInfo.rootMethod = rootMethod;
        PK_GetCertInfo.showErrorAlert = false;
        PK_GetCertInfo.pk_ipCertificate = users[signerIdex].certificate;
        PK_GetCertInfo.pk_ipSel = 1;
        PK_GetCertInfo.call();
        return true;
    }
    else if (PK_GetCertInfo.isCalled && !PK_GetCertInfo.success) {
        PK_GetCertInfo.reset();
        PK_SetCryptoki.reset();
        PK_Login.reset();
        alert("signing operation has been failed due to : " + PK_GetCertInfo.pk_opErrorMessage + ' (' + PK_GetCertInfo.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;

    }
    else if (PK_GetCertInfo.isCalled && (PK_GetCertInfo.success)) {
        signerKeyID = PK_GetCertInfo.pk_opKeyId;
    }
    ////////////////////////////////////////

    /*--- Set Sign Mechanism Operation ---*/
    if (!PK_SetSignMech.isCalled) {
        PK_SetSignMech.rootMethod = rootMethod;
        PK_SetSignMech.showErrorAlert = false;
        PK_SetSignMech.pk_ipSignatureFormat = 2;
        PK_SetSignMech.pk_ipSignHashAlg = 2;
        PK_SetSignMech.pk_ipSignMechanism = 1;
        PK_SetSignMech.pk_ipSaltLen = 0;
        PK_SetSignMech.pk_ipMgf = 0;
        PK_SetSignMech.call();
        return true;
    }
    else if (PK_SetSignMech.isCalled && !PK_SetSignMech.success) {
        PK_SetSignMech.reset();
        PK_GetCertInfo.reset();
        PK_SetCryptoki.reset();
        PK_Login.reset();
        alert("signing operation has been failed due to : " + PK_SetSignMech.pk_opErrorMessage + ' (' + PK_SetSignMech.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;

    }

    ////////////////////////////////////////

    /*--- Sign Operation ---*/
    var toBeSignBase64 = btoa(unescape(encodeURIComponent(msg)));
    if (!PK_Sign.isCalled) {
        PK_Sign.rootMethod = rootMethod;
        PK_Sign.showErrorAlert = false;
        PK_Sign.pk_ipSignMethodType = 0;
        PK_Sign.pk_ipLogoutAfterSign = 0;
        PK_Sign.pk_ipTbsType = 0;
        PK_Sign.pk_ipTbsHashAlg = 0;
        PK_Sign.pk_ipTbs = toBeSignBase64;
        PK_Sign.pk_ipUsage = "";
        PK_Sign.pk_ipSignerKeyId = signerKeyID;
        PK_Sign.call();
        return true;
    }
    else if (PK_Sign.isCalled && !PK_Sign.success) {
        PK_SetSignMech.reset();
        PK_GetCertInfo.reset();
        PK_SetCryptoki.reset();
        PK_Login.reset();
        PK_Sign.reset();

        certCheck = false;
        alert("signing operation has been failed due to : " + PK_Sign.pk_opErrorMessage + ' (' + PK_Sign.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;
    }
    else if (PK_Sign.isCalled && PK_Sign.success) {
        check = "true";
        HiddenClientChallengeSigned = PK_Sign.pk_opSignature;
        HiddenClientCertificate = PK_Sign.pk_opSignerCertificate;

        HiddenClientActivityLog = "1000";
    }
    ////////////////////////////////////////		

    /*--- logout operation ---*/
    if (!PK_Logout.isCalled) {
        PK_Logout.rootMethod = rootMethod;
        PK_Logout.showErrorAlert = false;
        PK_Logout.pk_ipSlotId = users[signerIdex].tokenSlotIdx;
        PK_Logout.call();
        return true;
    }
    else if (PK_Logout.isCalled && !PK_Logout.success) {
        PK_SetSignMech.reset();
        PK_GetCertInfo.reset();
        PK_SetCryptoki.reset();
        PK_Login.reset();
        PK_Sign.reset();
        PK_Logout.reset();
        alert("signing operation has been failed due to : " + PK_Logout.pk_opErrorMessage + ' (' + PK_Logout.pk_opErrorCode + ')');
        HiddenClientActivityLog = "0401";
        return false;
    }
    else if (PK_Logout.isCalled && PK_Logout.success) {
        PK_SetSignMech.reset();
        PK_GetCertInfo.reset();
        PK_SetCryptoki.reset();
        PK_Login.reset();
        PK_Sign.reset();
        PK_Logout.reset();
        // document.form1.submit();
        //  alert('sign Ok');

        var Result = new Array(8);

        Result[0] = HiddenClientActivityLog;
        Result[1] = HiddenClientChallengeSigned;
        Result[2] = HiddenClientCertificate;
        Result[3] = HiddenClientUserList;
        Result[4] = HiddenClientRandomNumber;
        Result[5] = HiddenClientActivityInfo;
        Result[6] = ServerCallenge;
        Result[7] = CurrentCertName;

        TokenComplete(CurrentCertName,Result);
    }

    return true;
}

var HashCode = function () {

    var serialize = function (object) {

        var type, serializedCode = "";

        type = typeof object;

        if (type === 'object') {

            var element;

            for (element in object) {

                serializedCode += "[" + type + ":" + element + serialize(object[element]) + "]";

            }


        } else if (type === 'function') {

            serializedCode += "[" + type + ":" + object.toString() + "]";

        } else {

            serializedCode += "[" + type + ":" + object + "]";

        }



        return serializedCode.replace(/\s/g, "");

    };


    // Public, API

    return {

        value: function (object) {

            return MD5(serialize(object));

        }

    };

}();

String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
