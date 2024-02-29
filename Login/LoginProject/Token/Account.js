function fncsave() {
    var tmpUserName = $('#txtUserName').val();
    var tmpPassword = $('#txtPassword').val();





    if (tmpUserName.length == 0)
        $('#LMessage').text('نام کاربری را وارد نمایید');
    else if (tmpPassword.length == 0)
        $('#LMessage').text('کلمه عبور را وارد نمایید');
    else
        if ($('#MainCaptcha').length > 0) {
            if (okCaptcha)
                DoLogin(tmpUserName, tmpPassword);
            else
                $('#LMessage').text('کد امنیتی را وارد نمایید');
        }
        else {

            DoLogin(tmpUserName, tmpPassword);
        }
}
function fncChangePassword() {
    
    // var tmpUserNameEnc = window.btoa($('#txtUserName').val());
    var tmpOldPassword = window.btoa($('#txtPassword').val());
    var tmpPassword = window.btoa($('#txtPasswordNew').val());
    var tmpReNewPassword = window.btoa($('#txtConfirmPassword').val());

    $('#txtOldPasswordEnc').val(tmpOldPassword);
    $('#PEnc').val(tmpPassword);
    $('#txtReNewPasswordEnc').val(tmpReNewPassword);

    var validClient = true;

    if ($("#txtConfirmPassword").val() != $("#txtPasswordNew").val()) {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('رمز عبور و تکرار آن باید شبیه هم باشند');
        validClient = false; return;
    }

    if (Config.PassWordComplex == true) {
        checkStrength($('#txtPasswordNew').val());
        if (PasswordComplexValid== false) {
            $("#LMessage").css('color', 'red');
            $("#LMessage").text('رمز عبور باید شامل حروف و اعداد و کلمات پیچیده باشد');
            validClient = false; return;
        }
    }


    if ($('#MainCaptcha').length > 0) {
        if (!okCaptcha) {
            $('#LMessage').text('کد امنیتی را وارد نمایید');
            validClient = false; return;
        }
    }

    if (validClient)
        document.getElementById('btnSave').click();
}
var SessionId = '';


function DoLogin(tmpUserName, tmpPassword) {
    try {
        StartBusy('loginBox', 'در حال احراز هویت کاربر');



        var tmpUserNameEnc = window.btoa(tmpUserName);
        var tmpPasswordEnc = window.btoa(tmpPassword);
        tmpUserNameEnc = tmpUserNameEnc + SessionId;
        tmpPasswordEnc = tmpPasswordEnc + SessionId;

        tmpUserNameEnc = window.btoa(tmpUserNameEnc);
        tmpPasswordEnc = window.btoa(tmpPasswordEnc);

        $('#UNEnc').val(tmpUserNameEnc);
        $('#PEnc').val(tmpPasswordEnc);

        document.getElementById('btnLogin').click();
    }
    catch (ex) {
        StopBusy('loginBox');
        alert('صفحه کلید را در حالت انگلیسی قرار دهید');
    }
}
function DetectToken() {
    StartBusyTimer('form1', 'در حال شناسایی شناسه');

    CheckToken('1234');
}
function TokenComplete(e) {
    $('#txtToken').val(e);
}

function ShowRecoveryPassDiv() {
    $('.RecveryPassBox').show()
    $('#DivRecovery').show();

    $('html, body').animate({
        scrollTop: $(".RecveryPassBox").offset().top
    }, 1000);
}
function SendSMS0() {

    StartBusy('DivRecovery', 'در حال پردازش اطلاعات');
    CallRequestToken(function (xvalue) {

        $('#LRecoveryError').text('');
        if ($('#txtRecoveryMobile').val() == '') {
            $('#LRecoveryError').text('شماره همراه را وارد نمایید');
            $('#LRecoveryError').css('Color', 'red');
            return;
        }
     
        var d = { pMobileNo: $('#txtRecoveryMobile').val() };
        var c = JSON.stringify(d);

        $.ajax({
            type: "POST",
            url: AppConfig.Params.SecurityUrl + "RecoveryAccountPassword",
            data: c,
            beforeSend: function (request) {
                request.setRequestHeader("TrustToken", xvalue);
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('DivRecovery');
                if (response.BizErrors.length > 0) {
                    ShowError(response);
                }
                else {
                    $('#LRecoveryError').text('رمز عبور با موفقیت ارسال شد');
                    $('#LRecoveryError').css('color', 'green');
                    StartTimer();
                }
            },
            failure: function (response) {
                alert(response.d);
                StopBusy('DivRecovery');
            }
            , error: function (response) {
                alert('درخواست نامعتبر است ، لطفا صفحه را بازآوری کنید');
                StopBusy('DivRecovery');
            }
        });

    });
 
}
function SendSMS() {

    StartBusy('DivRecovery', 'در حال پردازش اطلاعات');
    //CallRequestToken(function (xvalue) {

        $('#LRecoveryError').text('');
        if ($('#txtRecoveryMobile').val() == '') {
            $('#LRecoveryError').text('شماره همراه را وارد نمایید');
            $('#LRecoveryError').css('Color', 'red');
            return;
        }

        var d = { pMobileNo: $('#txtRecoveryMobile').val() };
        var c = JSON.stringify(d);

        $.ajax({
            type: "POST",
            url: "SafaLogin.aspx/RecoveryAccountPassword",
            data: c,

            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('DivRecovery');
                if (response.d.BizErrors.length > 0) {
                    ShowError(response.d);
                }
                else {
                    $('#LRecoveryError').text('رمز عبور با موفقیت ارسال شد');
                    $('#LRecoveryError').css('color', 'green');
                    StartTimer();
                }
            },
            failure: function (response) {
                alert(response.d);
                StopBusy('DivRecovery');
            }
            , error: function (response) {
                alert('درخواست نامعتبر است ، لطفا صفحه را بازآوری کنید');
                StopBusy('DivRecovery');
            }
        });

   // });

}

function CallRequestToken(callback) {

    $request = $.ajax({
        type: "POST",
        url: AppConfig.Params.SecurityUrl + "RequestToken",

        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        success: function (msg, xmLHttpRequest, xmLHttpRequest) {
            //TrustToken = msg;
            callback(msg);
        },
        error: function (c) {
            alert('لطفا بعد از 1 دقیقه امتحان نمایید')
        }
    });
}




var Counter = null;
function StartTimer() {
    $('#btnSend').attr("disabled", true);
    $('#btnSend').css("opacity", 0.5);
    var tmpMessage = '<p id=\'lblComment\' style="font-size:small">در صورت ارسال نشدن پیامک ، بعد از ۶۰ ثانیه میتوانید دوباره دکمه ارسال رمز را بزنید</p>';
    $('#lblComment').remove();
    $('#LRecoveryError').after(tmpMessage);

    indexTime = 60;
    Counter = setInterval(myFunction, 1000);
}
var indexTime =60;
function myFunction() {
    indexTime--;
    $('#LRecoveryError').text(indexTime);
    if (indexTime == 0) {
        $('#btnSend').attr("disabled", false);
        $('#btnSend').css("opacity", 1);
       
        clearInterval(Counter);

    }
}


function ToggleShowPass() {
    var x = document.getElementById("txtPassword");
    var x1 = document.getElementById("txtPasswordNew");
    var x2 = document.getElementById("txtConfirmPassword");

    if (x.type === "password") {
        x.type = "text";
        if (x1 != null)
            x1.type = "text";
        if (x2 != null)
            x2.type = "text";

        $('#imgShowPass').prop('src', '../images/showpass.png');
        $('#imgShowPass').prop('title', 'پنهان کردن رمز عبور');


    } else {
        x.type = "password";
        if (x1 != null)
            x1.type = "password";
        if (x2 != null)
            x2.type = "password";

        $('#imgShowPass').prop('src', '../images/showpassOff.png');
        $('#imgShowPass').prop('title', 'نمایش رمز عبور');
    }
}
function ShowError(ErrorResult) {
    try {
        $('#LRecoveryError').css("color", "red");
        if (ErrorResult != null) {
            $('#LRecoveryError').text(ErrorResult.BizErrors[0].ErrorTitel);
        }
        else {
            $('#LRecoveryError').text('خطا در اجرای سرویس');
        }
    }
    catch (ex) { }
}

function checkStrength(password) {
    PasswordComplexValid = false;
    var strength = 0
    if (password.length < 5) {
        $('#result').removeClass()
        $('#result').addClass('short');
        $('#progressBar').removeClass();
        $('#progressBar').width('30%');
        $('#progressBar').addClass('progress-bar progress-bar-danger');

        return 'رمز عبور باید حداقل 5 کاراکتر باشد'
    }
    if (password.length > 7) strength += 1
    // If password contains both lower and uppercase characters, increase strength value.
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
    // If it has numbers and characters, increase strength value.
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
    // If it has one special character, increase strength value.
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
    // If it has two special characters, increase strength value.
    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
    // Calculated strength value, we can return messages
    // If value is less than 2
    if (strength < 2) {
        $('#result').removeClass()
        $('#result').addClass('weak')
        $('#progressBar').removeClass();
        $('#progressBar').width('30%');
        $('#progressBar').addClass('progress-bar progress-bar-danger');
        return 'ضعیف';
    }
    else if (strength == 2) {
        $('#result').removeClass()
        $('#result').addClass('good')
        $('#progressBar').removeClass();
        $('#progressBar').width('70%');
        $('#progressBar').addClass('progress-bar progress-bar-blue');
        return 'خوب'
    }
    else {
        PasswordComplexValid = true;
        $('#result').removeClass()
        $('#result').addClass('strong');
        $('#progressBar').removeClass();
        $('#progressBar').width('100%');
        $('#progressBar').addClass('progress-bar progress-bar-success');
        return 'پیچیده'
    }
}