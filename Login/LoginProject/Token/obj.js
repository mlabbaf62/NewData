var TokenTypeEum = {"Novin":0, "ParsKey":2 ,"PayamPardaz":3}
var TokenType = TokenTypeEum.ParsKey;
var pincode = 'pincode';
//pincode = '1234';

var nl;
var TrueDevice;
var HiddenClientActivityLog = -1;
//-----------------------------------------Novin
var devSerials = new Array();

function LoadDevice() {
    try {
        nl = new ActiveXObject("NovinAfzar.clsLocalDevice");
        nl.init();
        TrueDevice = true;
        return TrueDevice;
    }
    catch (ex) {
        //alert(ex)
        return TrueDevice;
    }
}

function GetTokenSerial() {
    try {
        //return '1.2.3.4';
        LoadDevice();
        nl.GetFirstDevice();
        var DeviceSerial = nl.DeviceSerial;

        return (DeviceSerial);
    }
    catch (ex) {
        //alert(ex);
        return "";
    }
}

function GetNovinSerial() {
    try {
        LoadDevice();

        nl.GetFirstDevice();
        var i = 0;
        while (nl.ErrNo == 0) {
            devSerials[i++] = nl.DeviceSerial;
            nl.GetNextDevice();
        }

        return (devSerials);
    }
    catch (ex) {

    }
}

//-----------------------------------------Novin

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {

    var i, x, y, ARRcookies = document.cookie.split(";");

    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}

//////////////////////////////////////////////////////////////////NewTokenParsKey

function CheckToken(tmpServerCallenge) {

    try {

        if (TokenType==TokenTypeEum.PayamPardaz)
        return null;
        //This Code Swich Between Class E & C Token

        try {
            i = 0;
            users = [];
            nSlot = 0;
            g_checkParskeyTokenFlg = 0;
            PK_ServiceConnection.reset();
            PK_SetCryptoki.reset();
            PK_GetSlotCount.reset();
            ServerCallenge = tmpServerCallenge;
            Check_ClassE_Tokens();
            return;
        }
        catch (ex) { }

        var nRet = new Array(1);
        var retVal;
        nRet[0] = 0;

        PKEActivexPKI.initPKE("sswPKE.dll", nRet);
        retVal = nRet[0];
        if (retVal > 0) {
            alert("خطا در تابع initPKE. شماره خطا : " + nRet.toString());

            return;
        }

        nRet[0] = 0;
        PKEActivexPKI.initCryptoki("parskey11.dll", nRet);
        retVal = nRet[0];
        if (retVal > 0) {
            alert("خطا در تابع initCryptoki. شماره خطا : " + nRet.toString());

            return;
        }

        PKEActivexPKI.initToken(pincode, 0, nRet);
        retVal = nRet[0];

        if (retVal == 0) {
            HiddenClientActivityLog = 0;
            TokenLogin(pincode, tmpServerCallenge);
            return HiddenClientActivityLog;
        }
        else if (retVal == 4 | retVal == 57349 | retVal == 773) {
            HiddenClientActivityLog = 2;

            return HiddenClientActivityLog;
            throw ("توکن متصل نیست");
        }

        else if (retVal == 40969) {
            throw ("پين‌كد اشتباه است. توجه داشته باشيد كه در صورتي كه چندين بار پين‌كد را اشتباه وارد نماييد، توكن قفل مي‌گردد");
            HiddenClientActivityLog = 3;

            return HiddenClientActivityLog;
        }
        else if (retVal == 41481) {
            throw ("پين‌كد مي‌بايست بين 4 تا 32 كاركتر باشد");
            HiddenClientActivityLog = 3;

            return HiddenClientActivityLog;
        }
        else if (retVal == 41991) {
            throw ("توكن به دليل اشتباه وارد كردن مكرر پين‌كد، قفل شده‌است");
            HiddenClientActivityLog = 4;

            return HiddenClientActivityLog;
        }
        else if (retVal == 66057) {
            throw ("توکن آماده سازی نشده است. لطفاً توکن را آماده سازی کنید");
            HiddenClientActivityLog = 5;

            return HiddenClientActivityLog;
        }
        else if (retVal == 1) {
            throw ("لطفاً کتابخانه پارسکی را نصب کنید");
            HiddenClientActivityLog = 6;

            return HiddenClientActivityLog;
        }
        else {
            throw ("خطا در برقراري ارتباط با توكن!  شماره خطا : " + retVal.toString());
            HiddenClientActivityLog = 7;
            return HiddenClientActivityLog;
        }
    }
    catch (ex) { return -1; }
}

function GetTokenUser(pincode) {
    try {
        var pincode;
        var nRet = new Array(1);
        var retVal;
        nRet[0] = 0;
        PKEActivexPKI.initToken(pincode, 0, nRet);

        var labels = new Array();
        labels[0] = "";
        nRet[0] = 0;
        PKEActivexPKI.getCertsLabels(labels, nRet);
        var retLabels = labels[0];

        return retLabels;
    }
    catch (ex) { alert(ex); }
}

function TokenLogin(pincode, ServerCallenge) {

    var pincode;
    var nRet = new Array(1);
    var retVal;

    var HiddenClientActivityLog = "";
    var HiddenClientChallengeSigned = "";
    var HiddenClientCertificate = "";
    var HiddenUserChecked = "";
    var HiddenClientUserList = "";
    var HiddenClientRandomNumber = "";
    var HiddenClientActivityInfo = "";

    var HiddenServerChallenge = ServerCallenge;

    if (pincode == "") {
        alert("پين‌كد وارد نشده است");
        HiddenClientActivityLog = "1";

        return;
    }
    else {
        nRet[0] = 0;
        PKEActivexPKI.initToken(pincode, 0, nRet);
        retVal = nRet[0];

        if (retVal == 0)
        { }

        else if (retVal == 4 | retVal == 57349 | retVal == 773) {
            //alert("توکن متصل نیست");
            HiddenClientActivityLog = "2";

            return;
        }
        else if (retVal == 40969) {
            alert("پين‌كد اشتباه است. توجه داشته باشيد كه در صورتي كه چندين بار پين‌كد را اشتباه وارد نماييد، توكن قفل مي‌گردد");
            HiddenClientActivityLog = "3";

            return;
        }
        else if (retVal == 41481) {
            alert("پين‌كد مي‌بايست بين 4 تا 32 كاركتر باشد");
            HiddenClientActivityLog = "3";

            return;
        }
        else if (retVal == 41991) {
            alert("توكن به دليل اشتباه وارد كردن مكرر پين‌كد، قفل شده‌است");
            HiddenClientActivityLog = "4";

            return;
        }
        else if (retVal == 66057) {
            alert("توکن آماده سازی نشده است. لطفاً توکن را آماده سازی کنید");
            HiddenClientActivityLog = "5";

            return;
        }
        else if (retVal == 1) {
            alert("لطفاً کتابخانه پارسکی را نصب کنید");
            HiddenClientActivityLog = "6";

            return;
        }
        else {
            alert("خطا در برقراري ارتباط با توكن!  شماره خطا : " + retVal.toString());
            HiddenClientActivityLog = "7";
            HiddenClientActivityInfo = retVal.toString();

            return;
        }
    }

    var labels = new Array();
    labels[0] = "";
    nRet[0] = 0;
    PKEActivexPKI.getCertsLabels(labels, nRet);
    var retLabels = labels[0];
    retVal = nRet[0];

    if (retVal == 0) {
        if (retLabels == "") {
            alert("هیچ شناسه کاربری در توکن یافت نشد. لطفاً توکن را شخصی سازی کنید.");
            HiddenClientActivityLog = "31";

            return;
        }
    }
    else {
        alert("خطا در خواندن لیست کاربران درون توکن! شماره خطا:" + retVal.toString());
        HiddenClientActivityLog = "32";

        return;
    }

    if (HiddenUserChecked == "") {
        if (retLabels.indexOf(";") == (retLabels.length - 1)) {
            KeyIdx = retLabels.slice(0, retLabels.length - 1);
            HiddenUserChecked = "oneuser"
        }
        else if (retLabels.indexOf(";") < (retLabels.length - 1)) {
            alert("بر روی توکن بیش از یک شناسه کاربری وجود دارد. برای ورود، یک شناسه را از لیست انتخاب کنید");
            retLabels = retLabels.slice(0, retLabels.length - 1);
            HiddenClientUserList = retLabels;
            HiddenUserChecked = "checked"

            usersDNarray = retLabels.split(";");

            var select = document.getElementById("selectNumber");
            select.style.visibility = 'visible';

            for (var i = 0; i < usersDNarray.length; i++) {
                var first = usersDNarray[i].indexOf("/CN=");
                var end = usersDNarray[i].indexOf("/E=");
                var opt = usersDNarray[i].slice(first + 4, end);
                var el = document.createElement("option");
                //el.textContent = "adasd";
                el.text = opt;
                select.options.add(el);
            }

            //
            return;
        }
    }

    if (HiddenUserChecked == "checked" || HiddenUserChecked == "oneuser") {
        if (HiddenUserChecked == "checked") {
            var userslist = HiddenClientUserList;
            var count = document.getElementById("selectNumber").selectedIndex;
            if (count == 0) {
                alert("لطفاً کاربر را از لیست انتخاب کنید");
                return;
            }
            var usersArray = userslist.split(";");
            KeyIdx = usersArray[count - 1];
        }

        HiddenUserChecked = ""

        challenge = HiddenServerChallenge;
        if (challenge == "") {
            alert("مقدار چلنج ارسال شده از سمت سرور خالی می باشد");
            HiddenUserChecked = ""
            return;
        }

        var cert = new Array(1);
        cert[0] = "";
        PKEActivexPKI.getCertById(KeyIdx, cert, nRet)
        var rCert = cert[0];
        retVal = nRet[0];
        if (retVal == 0) {
            HiddenClientCertificate = rCert;

        }
        else {
            alert("خطا در بدست آوردن گواهي ديجيتال : " + nRet.toString());
            HiddenClientActivityLog = "21";

            return;
        }

        //rndNum = oCAPICOM.GetRandom(32,0);
        rndNum = "asdaasdaasdaasdaasdaasdaasda";

        HiddenClientRandomNumber = rndNum;

        var msg = challenge.concat(rndNum);

        var sign = new Array();
        sign[0] = "";
        PKEActivexPKI.signById(KeyIdx, msg, sign, nRet);
        var clientSign = sign[0];
        var retVal = nRet[0];

        if (retVal == 0) {
            HiddenClientChallengeSigned = clientSign;
            HiddenClientActivityLog = "10";

        }
        else if (retVal == 2) {
            alert("كليد خصوصي موردنظر يافت نشد");
            HiddenClientActivityLog = "11";

            return;
        }
        else if (retVal == 3) {
            alert("خطا در توليد چکيده داخلي");
            HiddenClientActivityLog = "12";

            return;
        }
        else if (retVal == 4) {
            alert("خطا در انجام امضاي ديجيتال");
            HiddenClientActivityLog = "13";

            return;
        }
        else if (retVal == 5) {
            alert("خطا در تبديل مقدار باينري به Base64");
            HiddenClientActivityLog = "14";

            return;
        }
        else if (retVal == 6) {
            alert("خطا در توليد خروجي امضا(نوع نامناسب)");
            HiddenClientActivityLog = "15";

            return;
        }
        else {
            alert("خطا در عمليات امضا! شماره خطا:" + retVal.toString());
            HiddenClientActivityLog = "16";

            return;
        }
    }

    var Result = new Array(8);

    Result[0] = HiddenClientActivityLog;
    Result[1] = HiddenClientChallengeSigned;
    Result[2] = HiddenClientCertificate;
    Result[3] = HiddenClientUserList;
    Result[4] = HiddenClientRandomNumber;
    Result[5] = HiddenClientActivityInfo;
    Result[6] = HiddenServerChallenge;
    Result[7] = retLabels;

    TokenComplete(retLabels, Result);

    return Result;
}

///////////////////////////////

function GetTokenCertificate(pincode) {

    var nRet = new Array(1);
    var retVal;

    var HiddenClientActivityLog = "";
    var HiddenClientCertificate = "";
    var HiddenUserChecked = "";
    var HiddenClientUserList = "";
    var HiddenClientRandomNumber = "";
    var HiddenClientActivityInfo = "";

    if (pincode == "") {
        alert("پين‌كد وارد نشده است");
        HiddenClientActivityLog = "1";

        return;
    }
    else {
        nRet[0] = 0;
        PKEActivexPKI.init(pincode, nRet);
        retVal = nRet[0];
        if (retVal == 0)
        { }
        else if (retVal == 4 | retVal == 57349 | retVal == 773) {
            //alert("توکن متصل نیست");
            HiddenClientActivityLog = "2";

            return;
        }
        else if (retVal == 40969) {
            alert("پين‌كد اشتباه است. توجه داشته باشيد كه در صورتي كه چندين بار پين‌كد را اشتباه وارد نماييد، توكن قفل مي‌گردد");
            HiddenClientActivityLog = "3";

            return;
        }
        else if (retVal == 41481) {
            alert("پين‌كد مي‌بايست بين 4 تا 32 كاركتر باشد");
            HiddenClientActivityLog = "3";

            return;
        }
        else if (retVal == 41991) {
            alert("توكن به دليل اشتباه وارد كردن مكرر پين‌كد، قفل شده‌است");
            HiddenClientActivityLog = "4";

            return;
        }
        else if (retVal == 66057) {
            alert("توکن آماده سازی نشده است. لطفاً توکن را آماده سازی کنید");
            HiddenClientActivityLog = "5";

            return;
        }
        else if (retVal == 1) {
            alert("لطفاً کتابخانه پارسکی را نصب کنید");
            HiddenClientActivityLog = "6";

            return;
        }
        else {
            alert("خطا در برقراري ارتباط با توكن!  شماره خطا : " + retVal.toString());
            HiddenClientActivityLog = "7";
            HiddenClientActivityInfo = retVal.toString();

            return;
        }
    }

    var labels = new Array();
    labels[0] = "";
    nRet[0] = 0;
    PKEActivexPKI.getCertsLabels(labels, nRet);
    var retLabels = labels[0];
    retVal = nRet[0];

    if (retVal == 0) {
        if (retLabels == "") {
            alert("هیچ شناسه کاربری در توکن یافت نشد. لطفاً توکن را شخصی سازی کنید.");
            HiddenClientActivityLog = "31";

            return;
        }
    }
    else {
        alert("خطا در خواندن لیست کاربران درون توکن! شماره خطا:" + retVal.toString());
        HiddenClientActivityLog = "32";

        return;
    }

    if (HiddenUserChecked == "") {
        if (retLabels.indexOf(";") == (retLabels.length - 1)) {
            KeyIdx = retLabels.slice(0, retLabels.length - 1);
            HiddenUserChecked = "oneuser"
        }
        else if (retLabels.indexOf(";") < (retLabels.length - 1)) {
            alert("بر روی توکن بیش از یک شناسه کاربری وجود دارد. برای ورود، یک شناسه را از لیست انتخاب کنید");
            retLabels = retLabels.slice(0, retLabels.length - 1);
            HiddenClientUserList = retLabels;
            HiddenUserChecked = "checked"

            usersDNarray = retLabels.split(";");

            var select = document.getElementById("selectNumber");
            select.style.visibility = 'visible';

            for (var i = 0; i < usersDNarray.length; i++) {
                var first = usersDNarray[i].indexOf("/CN=");
                var end = usersDNarray[i].indexOf("/E=");
                var opt = usersDNarray[i].slice(first + 4, end);
                var el = document.createElement("option");
                //el.textContent = "adasd";
                el.text = opt;
                select.options.add(el);
            }

            //
            return;
        }
    }

    if (HiddenUserChecked == "checked" || HiddenUserChecked == "oneuser") {
        if (HiddenUserChecked == "checked") {
            var userslist = HiddenClientUserList;
            var count = document.getElementById("selectNumber").selectedIndex;
            if (count == 0) {
                alert("لطفاً کاربر را از لیست انتخاب کنید");
                return;
            }
            var usersArray = userslist.split(";");
            KeyIdx = usersArray[count - 1];
        }

        HiddenUserChecked = ""

        var cert = new Array(1);
        cert[0] = "";
        PKEActivexPKI.getCertById(KeyIdx, cert, nRet)
        var rCert = cert[0];
        retVal = nRet[0];
        if (retVal == 0) {
            HiddenClientCertificate = rCert;
        }
        else {
            alert("خطا در بدست آوردن گواهي ديجيتال : " + nRet.toString());
            HiddenClientActivityLog = "21";

            return;
        }
    }

    return HiddenClientCertificate;
}


/////////////////////////////////////Shiraz Token

var cerCount = 0;
var devSerials = new Array();
function GetAllTokenSerial() {
    try {

        if (devSerials.length > 0)
            return devSerials;

        var userN = GetNovinSerial();
        if (userN != null && userN.length > 0) {
            devSerials = userN;
            return devSerials;
        }
        //  CheckToken('1234');
        i = 0;
        users = [];
        nSlot = 0;

        if (TokenType == TokenTypeEum.ParsKey)
            GetAllTokenUserE('GetAllTokenUserE');
        else if (TokenType == TokenTypeEum.PayamPardaz)
            GetKeyA3User('123');

        return devSerials;
    }
    catch (ex) {

    }
}

function GetSingleTokenSerial() {
    try {
        devSerials = new Array();
        //alert('single');
        var userN = GetNovinSerial();
        if (userN != null && userN.length > 0) {
            devSerials = userN;
            return devSerials;
        }

        i = 0;
        users = [];
        nSlot = 0;

        if (TokenType == TokenTypeEum.ParsKey)
            GetAllTokenUserE('GetAllTokenUserE');
        else if (TokenType == TokenTypeEum.PayamPardaz)
            GetKeyA3UserSingle('123');

        return devSerials;
    }
    catch (ex) {

    }
}

function GetKeyA3User(challenge) {
    try {
        // alert('GetKeyA3User');
        CAPICOM_CURRENT_USER_STORE = 2;
        CAPICOM_STORE_OPEN_READ_ONLY = 0;
        CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 0;
        CAPICOM_ENCODE_BASE64 = 0;

        var store = new ActiveXObject("CAPICOM.Store");
        store.Open(CAPICOM_CURRENT_USER_STORE, "My", CAPICOM_STORE_OPEN_READ_ONLY);

        var ff = store.Certificates;

        var certificates = ff.Item(1);

        certificates = store.Certificates.Select("KeyA3 Sample PKI Authentication", "Please select a certificate to authenticate.");

        var tmpSubject = "";

        if (certificates.Count > 0) {

            var signer = new ActiveXObject("CAPICOM.Signer");
            signer.Certificate = certificates.Item(1);

            //-----------------Sign

            var timeAttrib = new ActiveXObject("CAPICOM.Attribute");
            timeAttrib.Name = CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME;
            var date = new Date('Tuesday, May 3, 2016 10:24:04 AM');
            timeAttrib.Value = date.getVarDate();
            signer.AuthenticatedAttributes.Add(timeAttrib);

            var signedData = new ActiveXObject("CAPICOM.SignedData");

            signedData.Content = challenge;

            try {
                var response = signedData.Sign(signer, true, CAPICOM_ENCODE_BASE64);
            }
            catch (ex) {
                alert("شناسه نا معتبر می باشد");
                return "";
            }

            //----------------------
            var UserName = "KeyA3" + signer.Certificate.Thumbprint;

            if (devSerials.length > 0 && devSerials[cerCount - 1] == UserName) {
                alert('اطلاعات توکن تکراری می باشد  \r\n ابتدا توکن بعدی را وارد نمایید سپس تایید نمایید');
                GetKeyA3User(challenge);
            }
            else if (UserName != '') {
                devSerials.push(UserName);
                cerCount++;
                var res = confirm('امضاء توکن دریافت شد \r\n ابتدا توکن بعدی را وارد نمایید سپس تایید نمایید');
                if (res == true) {
                    GetKeyA3User('123');
                }
            }

            return UserName;
        }
        return '';
    } catch (e) {
        alert(e.description);
        return '';
    }
}

function GetKeyA3UserSingle(challenge) {
    try {
        // alert('GetKeyA3User');
        CAPICOM_CURRENT_USER_STORE = 2;
        CAPICOM_STORE_OPEN_READ_ONLY = 0;
        CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME = 0;
        CAPICOM_ENCODE_BASE64 = 0;

        var store = new ActiveXObject("CAPICOM.Store");
        store.Open(CAPICOM_CURRENT_USER_STORE, "My", CAPICOM_STORE_OPEN_READ_ONLY);

        var ff = store.Certificates;

        var certificates = ff.Item(1);

        certificates = store.Certificates.Select("KeyA3 Sample PKI Authentication", "Please select a certificate to authenticate.");

        var tmpSubject = "";

        if (certificates.Count > 0) {

            var signer = new ActiveXObject("CAPICOM.Signer");
            signer.Certificate = certificates.Item(1);

            //-----------------Sign

            var timeAttrib = new ActiveXObject("CAPICOM.Attribute");
            timeAttrib.Name = CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME;
            var date = new Date('Tuesday, May 3, 2016 10:24:04 AM');
            timeAttrib.Value = date.getVarDate();
            signer.AuthenticatedAttributes.Add(timeAttrib);

            var signedData = new ActiveXObject("CAPICOM.SignedData");

            signedData.Content = challenge;

            try {
                var response = signedData.Sign(signer, true, CAPICOM_ENCODE_BASE64);
            }
            catch (ex) {
                alert("شناسه نا معتبر می باشد");
                return "";
            }

            //----------------------
            var UserName = "KeyA3" + signer.Certificate.Thumbprint;
            if (UserName != '')
                devSerials.push(UserName);

            return UserName;
        }
        return '';
    } catch (e) {
        alert(e.description);
        return '';
    }
}


