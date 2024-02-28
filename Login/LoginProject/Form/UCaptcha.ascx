<%@ Control Language="C#" AutoEventWireup="true" %>

<style>
    .imgCaptcha {
        width: 100%;
        height: 100%;
        textAlign: center;
    }
</style>
<div id="MainCaptcha">
</div>

<script>
    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
    })();

    $(document).ready(function () {

        $('#txtInputCaptcha').keyup(function (evt) {

            var len = $('#txtInputCaptcha').val().length;

            if (len >= 6) {

                submitCaptcha();
            }
        });
    });
    //var PreUrl ="http://";
    //if (document.URL.indexOf('https') > -1)
    //    PreUrl="https://";

    var tmpMainUrl = document.URL.substring(0, document.URL.indexOf('/Form'));
    var authUrl = tmpMainUrl + '/Authorize';

    var okCaptcha = false;
    var id = guid();
    var img = new Image();
    img.alt = 'Captcha';
    img.className = 'imgCaptcha';

    img.crossOrigin = true;
    img.onerror = function () {
    };

    var LoadCaptcha = function () {
        id = guid();
        img.src = authUrl + '?action=GetCaptcha&id=' + id;
        $('#MainCaptcha').append(img);
    }

    LoadCaptcha();

    var submitCaptcha = function () {
        document.getElementById('txtInputCaptcha').disabled = true;
        document.getElementById('txtInputCaptcha').style.cursor = "wait";
        $.ajax({
            crossDomain: true,
            type: 'POST',
            url: authUrl + '?action=VerifyCaptcha&id=' + id,
            data: '{"phrase":"' + $('#txtInputCaptcha').val() + '"}',
            success: function () {
                document.getElementById('txtInputCaptcha').style.cursor = "default";
                var matches = /{"token":"(.*?)"}/.exec(arguments[0]);
                document.getElementById('txtInputCaptcha').disabled = false;
                if (matches) {
                    var token = matches[1];
                    okCaptcha = true;
                    document.getElementById('txtInputCaptcha').style.borderColor = 'Green';
                    document.getElementById('imgCheck').style.display = 'block';
                }
                else {
                    document.getElementById('txtInputCaptcha').style.borderColor = 'Red';
                    LoadCaptcha();
                }
                //sendRequest();
            },
            error: function (ex) {
                LoadCaptcha();
                document.getElementById('txtInputCaptcha').style.cursor = "default";
                document.getElementById('txtInputCaptcha').disabled = false;
                document.getElementById('txtInputCaptcha').style.borderColor = 'Red';
                // alert(ex.error);
                //Safa.Utils.showMessage('کد شناسایی نادرست است.');
                // self.raiseClose();
            }
        });
    };

    function resetCaptcha(p) {
        // GetCaptcha();

        okCaptcha = false;
        document.getElementById('imgCheck').style.display = 'none';
        //p.value = '';
        document.getElementById('txtInputCaptcha').style.borderColor = 'silver';
        document.getElementById('txtInputCaptcha').value = '';
    }
    var GetNewCaptcha = function () {
        try {
            resetCaptcha();

            id = guid();
            img.src = authUrl + '?action=GetCaptcha&id=' + id;
        }
        catch (ex) {
        }
    }



</script>
<style>
    ::-webkit-input-placeholder { /* Chrome/Opera/Safari */

  font-size:12px;
}

</style>
<div>
    <table>
        <tr>
            <td>
                <input type="text" style="width: 150px;padding-right:0; padding-left:0" id="txtInputCaptcha"  placeholder="کد امنیتی را وارد نمایید" onfocus="resetCaptcha(this)" />
            </td>
            <td>
                <img width="25" src="../Images/refresh.png" style="cursor: pointer" onclick="GetNewCaptcha()" title="نمایش تصویر جدید" />
            </td>
            <td>
                <img src="../Images/check.png" id="imgCheck" style="display: none" />
            </td>
        </tr>
    </table>
    <%-- <span>کد امنیتی مورد نظر را وارد نمایید</span>--%>
    <%-- <input type="button" id="btn" onclick="submitCaptcha()" value="test" />--%>
</div>

