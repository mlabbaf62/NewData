var AccountFullName = '';
var NidAccount = '';

function UpdateLogin() {
    var d = {
        NidAccount: ClsAccount.AccountInfo.NidAccount,
    };
    var c = JSON.stringify(d);

    $.ajax({
        type: "Post",
        url: ApiControllerConfig + "Session/UpdateLogin",
        data: c,
        crossDomin: true,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        processdata: true,
        success: function (msg) {
            CrowdSignature = msg;
        },
        error: function (c) {

        }
    });
}

$(document).ready(function () {

});

function Login() {
    try {
        var res = false;

        var aspauth = getCookie("LT");
        if (aspauth != null && aspauth != "null" && aspauth != undefined) {
            var OldDate = new Date(aspauth);
            var OldDay = OldDate.getDay();

            var CurrentDate = new Date();
            var CurrentDay = CurrentDate.getDay();

            if (CurrentDay == OldDay)
                res = true;
        }

        if (res == false) {
            var CurrentDate = new Date();

            setCookie("LT",CurrentDate,1);

            $('#mybody').hide();

            var tmpUserName = 'SafaEncryptService';
            var tmpPassWord = '2f5+M&mTx*BeES';
            var RequestId = SafaSecurity.GetRequestId();
            tmpUserName = SafaSecurity.Encrypt(tmpUserName, RequestId, "SfSLbf"),
            tmpPassWord = SafaSecurity.Encrypt(tmpPassWord, RequestId, RequestId.substring(0, 6));

            var d = {
                "username": tmpUserName, "password": tmpPassWord,
                "customCredential": RequestId,
                "isPersistent": "false"
            }
            var c = JSON.stringify(d);
            $request = $.ajax({
                type: "POST",
                url: UGPSafaAuth,

                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: c,
                success: function (msg) {
                    $('#mybody').show();

                },
                error: function (c) {
                    $('#mybody').show();
                }
            });
        }
    }
    catch (ex) {
        alert(ex);
    }
}

