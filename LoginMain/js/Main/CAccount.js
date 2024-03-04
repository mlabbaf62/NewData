
$(document).ready(function () {

    kamaDatepicker('txt_OwenrBirthDate', { buttonsColor: "red" });
    kamaDatepicker('txt_CEOBirhDate', { buttonsColor: "red" });
    //kamaDatepicker('txt_OwenrBirthDate', { buttonsColor: "red" });

    Config.ValidateBySms && Config.ValidateBySms == true ? $(".smsValidate").show() : $(".smsValidate").hide()

    if (Config.CheckUserNameASMelliCode && Config.CheckUserNameASMelliCode == true) {
        $("#txt_Username").addClass("number");
        $("#txt_Username").prop("maxlength", "10");

        $("#divNationalCode").addClass('disabled');
        $("#divNationalCode2").addClass('disabled');
    }
    else {
        $("#txt_Username").addClass("engtxt ");
    }

    setTimeout(function () {
        try {
            $(".pdatePiker").persianDatepicker();
        } catch (e) { }
    }, 300)

    //$('input[type="textbox"]').enter(function () { $(this).next().focus(); });
    $('input[type="textbox"]').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).next().focus();
        }
    });

    $(".number").inputFilter(function (value) {
        return /^\d*$/.test(value);
    });


    $(".phone").on("change keyup paste keydown", validate);
    $(".email").on("change", function () {
        var res = emailIsValid($(this).val())
        if (res == false)
            $(this).val("");
    });//emailIsValid

    $(".persiantxt").on('keypress', function (e) {//change keyup paste keydown

        if ((event.keyCode >= 1777 && event.keyCode <= 1785) || (event.keyCode >= 48 && event.keyCode <= 57) || (e.charCode >= 65 && e.charCode <= 90) || (e.charCode >= 97 && e.charCode <= 122)) {
            //console.log("Language is english");
            e.preventDefault();
            $('#NewError').remove();
            $(e.currentTarget).after('<span id=\'NewError\'>لطفا حروف فارسی تایپ نمایید</span>');
        }
        else {
            $('#NewError').remove();
        }
        //if (just_persian(e.key) === false)
        //    e.preventDefault();
    });

    $(".persiantxtNum").on('keypress', function (e) {//change keyup paste keydown

        if ((event.keyCode >= 1777 && event.keyCode <= 1785) || (e.charCode >= 65 && e.charCode <= 90) || (e.charCode >= 97 && e.charCode <= 122)) {
            //console.log("Language is english");
            e.preventDefault();
            $('#NewError').remove();
            $(e.currentTarget).after('<span id=\'NewError\'>لطفا حروف فارسی تایپ نمایید</span>');
        }
        else {
            $('#NewError').remove();
        }

    });



    $(".engtxt").on('input', function (e) {//change keyup paste keydown

        var tmpChar = $(e.currentTarget).val();
        var tmpKey = tmpChar.substr(tmpChar.length - 1);


        if (tmpKey != 'Backspace' && tmpKey != 'Delete' && tmpKey != '') {
            if (just_englishComplex(tmpKey) === false) {

                $(e.currentTarget).val(tmpChar.slice(0, -1));
                e.preventDefault();
                $('#NewError').remove();
                $(e.currentTarget).after('<span id=\'NewError\'>لطفا اعداد و حروف انگلیسی تایپ نمایید</span>');
            }
            else {
                $('#NewError').remove();
            }
        }
    });

    $(".engtxt").on('keypress', function (e) {//change keyup paste keydown

        if (just_englishComplex(e.key) === false) {
            e.preventDefault();
            $('#NewError').remove();
            $(e.currentTarget).after('<span id=\'NewError\'>لطفا اعداد و حروف انگلیسی تایپ نمایید</span>');
        }
        else {
            $('#NewError').remove();
        }
    });


    $(':file').filestyle({
        text: ' انتخاب فایل',
        btnClass: 'btn-success',
        placeholder: 'فایل را انتخاب کنید',
        size: 'sm'
    });

    $("#txt_OwnerTell,#txt_CEOCellNo").keyup(function (e) {
        Mobile_IsValid = false;
        var target = $(e.currentTarget);
        if (target.val().length == 11) {
            MobileCheckEvent(e);
        }
    });

    $("#txt_Username").keyup(function (e) {
        $('#NewErrortxt_Username').remove();
    });

    $("#txt_OwnerTell,#txt_Username,#txt_NCode,#txt_CEOCellNo").focusout(function (e) {

        MobileCheckEvent(e);
    });
    function MobileCheckEvent(e) {

        var target = $(e.currentTarget);
        var tmpId = target[0].id;
        $('#NewError' + tmpId).remove();
        if (tmpId == 'txt_Username') {
            if (target.val() != '')
                MobileCheck(e, target.val(), '', '');

            if (Config.CheckUserNameASMelliCode) {
                tmpres = checkMelliCode($("#txt_Username").val());
                if (!tmpres) {
                    ShowMessageTarget(target, 'نام کاربری یا کد ملی صحیح نمی باشد');
                    return;
                }
            }
        }
        //else if (Config.CheckValidMelliCode) {
        //    var tmpMeliiCode = $('#txt_NCode').val();
        //    tmpVal = checkMelliCode(tmpMeliiCode);
        //    if (!tmpVal) {
        //        ShowMessageTarget(target, 'کد ملی صحیح نمی باشد');
        //        return;
        //    }
        //    else 
        //        MobileCheck(e, '', target.val(), '');
        //}

        else if (target[0].id == 'txt_NCode') {

            if (Config.CheckValidMelliCode) {
                var tmpMeliiCode = $('#txt_NCode').val();

                if (target.val().length == 10)
                    MobileCheck(e, '', target.val(), '');


                tmpVal = checkMelliCode(tmpMeliiCode);
                if (!tmpVal) {
                    ShowMessageTarget(target, 'کد ملی صحیح نمی باشد');
                    return;
                }

            }
            else if (target.val().length == 10)
                MobileCheck(e, '', target.val(), '');
        }
        else if (target[0].id == 'txt_OwnerTell' || target[0].id == 'txt_CEOCellNo') {
            if (target.val().length == 11)
                if (!target.val().startsWith("09"))
                    ShowMessageTarget(target, 'شماره همراه صحیح نیست');
                else
                    MobileCheck(e, '', '', target.val());
            else {
                ShowMessageTarget(target, 'شماره همراه باید 11 رقم باشد');
            }
        }
    }
    $("#txtPassword").focusout(function (e) {
        if (Config.PassWordComplex == true) {
            if (PasswordComplexValid == false) {
                // $('#NewError_txtPassword').remove();
                target = $('#Progress1');
                ShowMessageTarget(target, 'رمز عبور باید شامل حروف و اعداد و کلمات پیچیده باشد');

                //$(".progress").after('<span style=\'color:red;margin-right:10px;font-size:small\' id=\'NewError_txtPassword' + '\'>' + 'رمز عبور باید شامل حروف و اعداد و کلمات پیچیده باشد' + '</span>')

                // $("#LMessage").css('color', 'red');
                //  $("#LMessage").text('رمز عبور باید شامل حروف و اعداد و کلمات پیچیده باشد');
                return;
            }
            else {
                $('#NewErrorProgress1').hide();
            }
        }
    });


    function ShowMessageTarget(pTarget, pMessage) {
        var tmpId = pTarget[0].id;
        $('#NewError' + tmpId).remove();
        pTarget.after('<span class="info-panel" style=\'color:red;margin-right:10px;font-size:small\' id=\'NewError' + tmpId + '\'>' + pMessage + '</span>')
    }
    function MobileCheck(e, a, b, c) {

        var d = { pAccountName: a, pNationalCode: b, pMobileNo: c, NidAccount: GetScope().Account_Info.NidAccount != undefined ? GetScope().Account_Info.NidAccount : null };
        var c1 = JSON.stringify(d);

        $('#LMessage').text('');
        StartBusy('txtConfirmCode', 'در حال چک کردن شماره موبایل');

        $request = $.ajax({
            type: "POST",
            url: "CreateAccount.aspx/MobileCheck",
            data: c1,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy('txtConfirmCode');

                if (msg != null && msg.d != null && msg.d.BizErrors.length > 0) {
                    // $('#NewError').remove();
                    var target = $(e.currentTarget);

                    if (msg.d.BizErrors[0].ErrorKey == 'DuplicateAccount')
                        ShowMessageTarget(target, 'شهروند گرامی; این کد ملی قبلا در سامانه ثبت عضویت شده است. در صورت فراموش کردن رمزعبور از کلید بازآوری رمز عبور استفاده کنید');
                    else if (msg.d.BizErrors[0].ErrorKey == 'DuplicateNationalCode') {
                        ShowMessageTarget(target, 'شهروند گرامی; این کد ملی قبلا در سامانه ثبت عضویت شده است. در صورت فراموش کردن رمزعبور از کلید بازآوری رمز عبور استفاده کنید');
                    }
                    else
                        ShowMessageTarget(target, msg.d.BizErrors[0].ErrorTitel);

                    $('#btnSend').prop('disabled', true);
                }
                else if (msg == null || msg.d == null) {
                    Mobile_IsValid = false;
                    MelliCodeIsValid = false;
                }
                else if (a != '' || b != '') {
                    MelliCodeIsValid = true;
                }
                else if (c != '') {
                    Mobile_IsValid = true;
                    var tmpMobile = $('#txt_OwnerTell').val();
                    if (GetScope().LegalPerson)
                        tmpMobile = $('#txt_CEOCellNo').val();

                    var tmpNationalCode = $('#txt_Username').val();
                    $('#btnSend').prop('disabled', false);
                    if (Config.CheckShahkar)
                        ShahkarCheck(e, tmpNationalCode, tmpMobile);
                    else {
                        $('#btnSend').prop('disabled', false);
                        shahkar_IsValid = true;
                    }
                }
            },

            error: function (c) {
                // StopBusy('txtConfirmCode');
            }
        });
    }



    function ShahkarCheck(e, pNationalCode, pMobile) {

        var d = { pNationalCode: pNationalCode, pMobile: pMobile };
        var c1 = JSON.stringify(d);
        $('#btnSend').prop('disabled', true);
        $('#LMessage').text('');
        StartBusy('txtConfirmCode', 'در حال چک کردن شماره موبایل');
        $request = $.ajax({
            type: "POST",
            url: AppConfig.Params.SecurityUrl + "CheckShahkar",
            data: c1,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy('txtConfirmCode');

                if (msg == false) {
                    var target = $(e.currentTarget);
                    ShowMessageTarget(target, 'کد ملی با شماره همراه همخوانی ندارد');

                    $('#btnSave').prop('disabled', true);
                    shahkar_IsValid = false;
                }
                else {
                    $('#btnSave').prop('disabled', false);
                    shahkar_IsValid = true;
                    $('#btnSend').prop('disabled', false);
                }
            },

            error: function (c) {
                // StopBusy('txtConfirmCode');
            }
        });
    }



})



var UserData = {}
function checkMelliJob(p, meli_code) {
    if (p == false) {
        if (meli_code.length > 0)
            alert("کد ملی معتبر نمی باشد");
    }
}
function checkMelliCode(varmellicode) {
    var meli_code;
    meli_code = varmellicode;
    if (meli_code.length == 10) {
        if (meli_code == '1111111111' ||
            meli_code == '0000000000' ||
            meli_code == '2222222222' ||
            meli_code == '3333333333' ||
            meli_code == '4444444444' ||
            meli_code == '5555555555' ||
            meli_code == '6666666666' ||
            meli_code == '7777777777' ||
            //meli_code == '8888888888' ||
            meli_code == '9999999999') {
            //checkMelliJob(false, meli_code);
            return false;
        }
        c = parseInt(meli_code.charAt(9));
        n = parseInt(meli_code.charAt(0)) * 10 +
            parseInt(meli_code.charAt(1)) * 9 +
            parseInt(meli_code.charAt(2)) * 8 +
            parseInt(meli_code.charAt(3)) * 7 +
            parseInt(meli_code.charAt(4)) * 6 +
            parseInt(meli_code.charAt(5)) * 5 +
            parseInt(meli_code.charAt(6)) * 4 +
            parseInt(meli_code.charAt(7)) * 3 +
            parseInt(meli_code.charAt(8)) * 2;
        r = n - parseInt(n / 11) * 11;
        if ((r == 0 && r == c) || (r == 1 && c == 1) || (r > 1 && c == 11 - r)) {
            //checkMelliJob(true, meli_code);
            return true;
        }
        else {
            //checkMelliJob(false, meli_code);
            return false;
        }
    }
    else {
        // checkMelliJob(false, meli_code);
        return false;
    }
}

function ToggleShowPass() {
    var x = document.getElementById("txtPassword");
    var x1 = document.getElementById("txtConfirmPassword");

    if (x.type === "password") {
        x.type = "text";
        if (x1 != null)
            x1.type = "text";
        $('#imgShowPass').prop('src', '../images/showpass.png');
        $('#imgShowPass').prop('title', 'پنهان کردن رمز عبور');


    } else {
        x.type = "password";
        if (x1 != null)
            x1.type = "password";
        $('#imgShowPass').prop('src', '../images/showpassOff.png');
        $('#imgShowPass').prop('title', 'نمایش رمز عبور');
    }
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
/*************************************************/
String.prototype.toEnglishDigits = function () {
    return this.replace(/[۰-۹]/g, function (chr) {
        var persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return persian.indexOf(chr);
    });
};
/*************************************************/
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

// Restricts input for each element in the set of matched elements to the given inputFilter.
(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
                $('#NewError').remove();
            } else if (this.hasOwnProperty("oldValue")) {
                $('#NewError').remove();
                $(this).after('<span id=\'NewError\'>لطفا اعداد انگلیسی تایپ نمایید</span>');

                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
        });
    };
}(jQuery));
function just_persian(str) {
    var p = /^[\u0600-\u06FF\s]+$/;
    if (!p.test(str)) {
        return false
    }
    return true;
}
function just_english(str) {
    var p = /^[A-Za-z0-9]$/i;
    if (!p.test(str)) {
        return false
    }

    return true;
}
function just_englishComplex(str) {
    var p = /^[A-Za-z0-9]$/i;
    var p1 = /([.,!,%,&,@,#,$,^,*,?,_,~,(,),+,=,_,/])/i;


    if (!p.test(str) && !p1.test(str)) {

        return false
    }
    return true;
}



function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


function validate() {
    var $result = $("#result");
    var email = $("#email").val();
    $result.text("");

    if (validateEmail(email)) {
        $result.text(email + " is valid :)");
        $result.css("color", "green");
    } else {
        $result.text(email + " is not valid :(");
        $result.css("color", "red");
    }
    return false;
}


function validatePhone() {
    if ($(".phone").val() == "") {
        phoneerror = "Please enter phone number";
    } else if ($(".phone").val().length !== 10) {
        phoneerror = "Must be 10 Digits";
    } else if (!($.isNumeric($(".phone").val())) && $(".phone").val() != "") {
        phoneerror = "this field cannot contain letters";

    } else {
        phoneerror = "";
    }
    console.log(phoneerror);
    return phoneerror;
}
//validate
var EditMode = false;
var shahkar_IsValid = true;
var TrustToken = "";
function OnClientClick() {


    var tmpEditAccount = getParameterByName('EditAccount');
    if (tmpEditAccount != '') {
        EditMode = true;
        // tmpEditAccount = tmpEditAccount.split("").reverse().join("");
    }
    $("#LMessage").text('');
    if (!$("input[id=ChAccept]").prop("checked")) {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('کاربر گرامی ، لطفا صحت اطلاعات را تایید نمایید ، تا اعمال تغییرات انجام شود');
        return;
    }

    var tmpVal = $("#txt_Username").val();

    if (Config.CheckUserNameASMelliCode) {
        tmpres = checkMelliCode($("#txt_Username").val());
        if (!tmpres) {
            $("#LMessage").text('نام کاربری یا کد ملی صحیح نمی باشد');
            return;
        }
    }

    else {
        var tmpMeliiCode = $("#txt_NCode").val();
        if (GetScope().LegalPerson) {
            tmpMeliiCode = $("#txt_CEONationalCode").val();
        }
        if (tmpMeliiCode.length < 10) {
            $("#LMessage").text('کد ملی باید ۱۰ رقمی باشد');
            return;
        }

        tmpres = checkMelliCode(tmpMeliiCode);
        if (!tmpres) {
            $("#LMessage").text('کد ملی صحیح نمی باشد');
            return;
        }

    }
    //======================================================

    if (tmpVal == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('نام کاربری را وارد نمایید');
        return;
    }
    if (EditMode != true) {
        if ($("#txtPassword").val() == '') {
            $("#LMessage").css('color', 'red');
            $("#LMessage").text('رمز عبور را وارد نمایید');
            return;
        }
        if ($("#txt_ConfirmPass").val() == '') {
            $("#LMessage").css('color', 'red');
            $("#LMessage").text('تکرار رمز عبور را وارد نمایید');
            return;
        }
        if ($("#txtPassword").val().length < 5) {
            $("#LMessage").text('رمز عبور باید حداقل ۵ کاراکتر باشد');
            return;
        }
        if ($("#txt_ConfirmPass").val() != $("#txtPassword").val()) {
            $("#LMessage").css('color', 'red');
            $("#LMessage").text('رمز عبور و تکرار آن باید شبیه هم باشند');
            return;
        }

        if (Config.PassWordComplex == true) {
            if (PasswordComplexValid == false) {
                $("#LMessage").css('color', 'red');
                $("#LMessage").text('رمز عبور باید شامل حروف و اعداد و کلمات پیچیده باشد');
                return;
            }
        }
    }
    //---------------------------
    var tmpId = $('.rtsSelected').attr('id');
    var tmpName = $("#txt_owername").val().trim();
    var tmpFamily = $("#txt_OwnerFamilyName").val().trim();
    var tmpCellNo = $("#txt_OwnerTell").val().trim();
    var tmpEmail = $("#txtEmail").val().trim();
    var tmpFatherName = $("#txt_OwnerFatherName").val().trim();
    var txt_RegIDNoHaghighi = $("#txt_RegIDNoHaghighi").val().trim();
    var txt_OwenrBirthDate = $("#txt_OwenrBirthDate").val().trim();

    if (GetScope().LegalPerson) { //حقوقی
        tmpEumAccountType = 2;
        tmpName = $("#txt_CEOName").val();
        tmpFamily = $("#txt_CEOFamily").val();
        tmpCellNo = $("#txt_CEOCellNo").val();
        tmpEmail = $("#txt_CEOEmail").val();

        tmpFatherName = $("#txt_CEOFatherName").val();
        txt_RegIDNoHaghighi = $("#txt_CEOIDNo").val();
        txt_OwenrBirthDate = $("#txt_CEOBirhDate").val().trim();

        //var tmpShenaseMelli = $("#txt_RequestNationalCode").val();

        //if (tmpShenaseMelli == '') {
        //    $("#LMessage").css('color', 'red');
        //    $("#LMessage").text('شناسه ملی را وارد نمایید');
        //    return;
        //}
        //else {
        //    var tmpres= checkShenaseMelli(tmpShenaseMelli);
        //    if (tmpres == false) {
        //        $("#LMessage").css('color', 'red');
        //        $("#LMessage").text('شناسه ملی را صحیح وارد نمایید');
        //        return;
        //    }
        //}

        if ($("#txt_companyname").val() == '') {
            $("#LMessage").css('color', 'red');
            $("#LMessage").text('نام شرکت را وارد نمایید');
            return;
        }

    }
    else {
        tmpEumAccountType = 1;

    }
    if (tmpName == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('نام کاربر را وارد نمایید');
        return;
    }
    if (tmpFamily.trim() == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('نام خانوادگی را وارد نمایید');
        return;
    }

    if (tmpFatherName.trim() == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('نام پدر را وارد نمایید');
        return;
    }
    if (txt_RegIDNoHaghighi.trim() == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('شماره شناسنامه را وارد نمایید');
        return;
    }


    //if (!MelliCodeIsValid && !EditMode) {
    //    $("#LMessage").text('کد ملی صحیح نیست');
    //    $('#LMessage').css('color', 'red');
    //    return;
    //}

    if (txt_OwenrBirthDate.match(/\//g) == null || txt_OwenrBirthDate.match(/\//g).length != 2 || txt_OwenrBirthDate.length != 10) {
        $("#LMessage").text('تاریخ تولد را کامل وارد نمایید');
        return;
    }
    if (GetScope().Account_Info.OwnerDegree == undefined && GetScope().Account_Info.CEOCI_Degree == undefined) {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('تحصیلات را وارد نمایید');
        return;
    }


    if ($('#txt_postcode').val().length < 10) {
        $("#LMessage").text('کد پستی باید ۱۰ رقمی باشد');
        return;
    }

    if (GetScope().Account_Info.Address == '' || GetScope().Account_Info.Address == undefined) {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('آدرس را وارد نمایید');
        return;
    }



    //if (tmpEmail == '' || tmpEmail.indexOf('صحیح') > -1) {
    //    $("#LMessage").css('color', 'red');
    //    $("#LMessage").text('ایمیل را وارد نمایید');
    //    return;
    //}
    var tmpMobileNumber = tmpCellNo;
    if (tmpMobileNumber == undefined || tmpMobileNumber == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('شماره همراه را وارد نمایید');
        return;
    }

    if (!shahkar_IsValid && !EditMode) {
        $("#LMessage").text('کد ملی با شماره همراه همخوانی ندارد');
        $('#LMessage').css('color', 'red');
        return;
    }



    //if (!Mobile_IsValid && !EditMode) {
    //    $("#LMessage").text('اعتبار سنجی شماره همراه انجام نشده است');
    //    $('#LMessage').css('color', 'red');
    //    return;
    //}

    //tmpMobileNumber = tmpMobileNumber.replaceAll('-', '').replaceAll('_', '');;

    //---------------------------

    if ($('#RadCaptcha1_CaptchaTextBox').val() == '') {
        $("#LMessage").css('color', 'red');
        $("#LMessage").text('کد امنیتی را وارد نمایید');
        return;
    }


    if (!EditMode) {
        if ($('#DivSmsConfirm').length > 0 && $('#DivSmsConfirm').is(":visible") && !ConfirmCodeIsTrue) {
            $("#LMessage").text('کد تاییدیه را به صورت صحیح وارد نمایید');
            $("#LMessage").css('color', 'red');
            return;
        }
    }
    if (imageDataBase64 == null && Config.ShowUploadButton && !EditMode) {
        $("#LMessage").text('تصویر کارت ملی را بارگذاری نمایید');
        return;
    }



    StartBusy('MainDIv', 'در حال ذخیره اطلاعات');

    debugger

    GetScope().SaveAccountInfo();

    //Savefn()
}

//function LoadForm() {

//    $request = $.ajax({
//        type: "POST",
//        url: AppConfig.Params.SecurityUrl + "RequestToken",

//        crossDomin: true,
//        contentType: "application/json; charset=utf-8",
//        dataType: "json",
//        processdata: true,
//        success: function (msg, xmLHttpRequest, xmLHttpRequest) {
//            TrustToken = msg;
//        },
//        error: function (c) {

//        }
//    });
//}


function RequestToken() {

    $request = $.ajax({
        type: "POST",
        url: "CreateAccount.aspx/RequestToken",

        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        success: function (msg, xmLHttpRequest) {
            TrustToken = msg;
        },
        error: function (c) {

        }
    });
}

var tmpEumAccountType = 1;
var tmpEumAccessType = 1;
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
var ipsex = null;
var psex = null;
//console.log(generateUUID())
function CurrentShamsiDateString() {
    var t = new persianDate().format();
    var a = t.toEnglishDigits()
    var b = a.replaceAll("-", "/");
    b = b.split(" ")
    return b
}
function Savefn(user) {

    //var t = new persianDate().format();
    //var t = new persianDate();
    //var b= t.format();
    var curentDate = CurrentShamsiDateString()//a.replaceAll("-", "/");
    if (curentDate) {
        //var a = t.toEnglishDigits()

        curentDate[0] ? curentDate[0] = curentDate[0].replace("-", "/") : ""
        //curentDate[1]&&curentDate[2]  ? curentDate[1] =curentDate[1] (curentDate[2]=="" ? )
    }

    var tmpNidAccount = EditAccount ? GetScope().Account_Info.NidAccount : '00000000-0000-0000-0000-000000000000';// generateUUID();
    //GetScope().Account_Info
    if (EditAccount) {
        var TmpAccountInfo = {
            pAccount: GetScope().Account_Info
        }

        delete TmpAccountInfo.pAccount.__type;
    }

    else
        var TmpAccountInfo =
        {
            pAccount: {
                NidAccount: tmpNidAccount.toLowerCase(),
                Address: $("#txt_address").val(),
                Fax: $("#txt_Fax").val(),
                AccountPassword: $("#txtPassword").val(), // user.password,
                EumAccountType: tmpEumAccountType,

                CEOCellNo: $("#txt_CEOCellNo").val(),
                CEOCI_Degree: GetScope().Account_Info.CEOCI_Degree,// $("#CEODegree").val(),
                CEOEmail: $("#txt_CEOEmail").val(),
                CEOFamily: $("#txt_CEOFamily").val(),
                CEOFatherName: $("#txt_CEOFatherName").val(),
                CEOIDNo: $("#txt_CEOIDNo").val(),
                CEOName: $("#txt_CEOName").val(),
                //CEONationality = btnCEONationality_Iranian.Checked,
                CEOPhoneNo: $("#txt_CEOPhoneNo").val(),
                CEOSex: ipsex, //? 1 : 0 /*btnSex_Men.Checked*/,
                CEOBirthDate: $("#txt_CEOBirhDate").val(),
                CEONationalCode: $("#txt_CEONationalCode").val(),

                Codes: $("#txt_Codes").val(),
                CompanyName: $("#txt_companyname").val(),
                EumAccessType: tmpEumAccessType,
                MailBox: (tmpEumAccountType == 1) ? $("#txtEmail").val() : $("#txt_mailbox").val(),
                PostCode: $("#txt_postcode").val(),
                RegNo: $("#txt_RegNo").val(),
                RequestNationalCode: $("#txt_RequestNationalCode").val(),
                Telephone: $("#txt_Tell").val(),
                AccountName: $("#txt_Username").val(),// ,user.username
                Vilage: $("#txt_vilage").val(),

                OwnerBirthDate: $("#txt_OwenrBirthDate").val(),

                OwnerDegree: GetScope().Account_Info.OwnerDegree,//$("#OwnerDegree").val(),// !string.IsNullOrWhiteSpace(Combo_OwnerDegree.SelectedValue) ? int.Parse(Combo_OwnerDegree.SelectedValue) : 0,
                OwnerLastName: $("#txt_OwnerFamilyName").val(),
                OwnerFirstName: $("#txt_owername").val(),
                OwnerTell: $("#txt_OwnerTell").val(),
                OwnerSex: psex,//? 1 : 0/* BtnSexHaghighiMen.Checked*/,
                //OwnerNationalCode : txt_Username.Text, // txt_RequestNationalCode.Text,
                OwnerNationalCode: (Config.CheckUserNameASMelliCode ? $("#txt_Username").val() : $("#txt_NCode").val()),
                ImageUrlVirtualPath: imageDataBase64,
                //OwnerNationality : !btnCEONationality_IranianHaghighi.Checked,
                OwnerFatherName: $("#txt_OwnerFatherName").val(),
                OwnerIDNO: $("#txt_RegIDNoHaghighi").val(),
                // RecongnizeState : !string.IsNullOrWhiteSpace(ComboTashkhisState.SelectedValue) ? int.Parse(ComboTashkhisState.SelectedValue) : 0,
                //Image = tmpImage,
                StrDate: curentDate[0],
                StrTime: curentDate[1],
            }
        };
    if (EditMode)
        TmpAccountInfo.pAccount.Image = null;


    var c = JSON.stringify(TmpAccountInfo);

    $request = $.ajax({
        type: "POST",

        url: "CreateAccount.aspx/CreateNewAccount",
        data: c,
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        success: function (msg) {
            msg = msg.d;
            StopBusy('MainDIv');

            if (msg == null)
                alert("خطای دسترسی");
            else {
                if (msg != null && msg.error != null)
                    alert(msg.error);
            }
            if (msg != null) {
                if (msg.ErrorResult.BizErrors.length > 0) {
                    var error = msg.ErrorResult.BizErrors[0].ErrorTitel
                    if (msg.ErrorResult.BizErrors[0].ErrorKey == 'DuplicateUser')
                        $("#LMessage").html('شهروند گرامی; این کد ملی قبلا در سامانه ثبت عضویت شده است. در صورت فراموش کردن رمزعبور از کلید بازآوری رمز عبور استفاده کنید');
                    else
                        $("#LMessage").html(error)

                    RequestToken();
                }
                else {
                    if (EditAccount)
                        $("#msgSuccess").html("ویرایش اطلاعات با موفقیت انجام شد");
                    else
                        $("#LMessage").html("ثبت عضویت با موفقیت انجام شد");

                    ExportToIsfahanApi(TmpAccountInfo.pAccount);
                    $("#MainDIv").slideToggle();
                    $("#SecDIv").slideToggle();
                }
            }



        },
        error: function (c) {

            RequestToken();
            StopBusy('MainDIv');
            $("#LMessage").html('خطای دسترسی . لطفا دوباره صفحه را بازآوری نمایید')
            console.log("خطای دسترسی . لطفا دوباره صفحه را بازآوری نمایید");
        }
    });

}





function ExportToIsfahanApi(TmpAccountInfo) {

    var d = {
        Gender: TmpAccountInfo.OwnerSex,
        NationCode: TmpAccountInfo.OwnerNationalCode,
        FirstName: TmpAccountInfo.OwnerFirstName,
        LastName: TmpAccountInfo.OwnerLastName,
        Email: TmpAccountInfo.CEOEmail,
        FatherName: TmpAccountInfo.OwnerFatherName,
        MobileNumber: TmpAccountInfo.OwnerTell,
        BirthDate: TmpAccountInfo.OwnerBirthDate,
    }
    var c = JSON.stringify(d);

    $request = $.ajax({
        type: "POST",
        url: 'https://profile.isfahan.ir/api/citizens/RegisterUser',
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
//End Func

var AccountInfo = null;
var Mobile_IsValid = false;
var MelliCodeIsValid = false;

function Accept(p) {
    var boxes = $('#ChAccept:checked');

    if (boxes.length > 0 && (Config.ValidateBySms && Config.ValidateBySms == true && ConfirmCodeIsTrue == true))
        $("#BtnSave").prop("disabled", false); //.removeProp("disabled")
    else if (boxes.length > 0 && Config.ValidateBySms == false)
        $("#BtnSave").prop("disabled", false); //.removeProp("disabled")
    else
        $("#BtnSave").attr('disabled', 'disabled');
}

var ConfirmCodeIsTrue = false;
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var SmsValidateState = false;
var tmpCode = null;
function SendConfirmSMS() {
    var tmpBizCode = $('#txt_Username').val();
    var tmpId = $('.rtsSelected').attr('id');
    var tmpMobileNumber = $("#txt_OwnerTell").val();

    if (GetScope().LegalPerson)
        tmpMobileNumber = $("#txt_CEOCellNo").val();

    tmpMobileNumber = tmpMobileNumber.replaceAll('-', '').replaceAll('_', '');;

    if (tmpBizCode == '') {
        $("#LMessage").text('نام کاربری را وارد نمایید');
        $('#LMessage').css('color', 'red');
        return;
    }

    if (tmpMobileNumber == undefined || tmpMobileNumber == '') {
        $("#LMessage").text('شماره همراه را وارد نمایید');
        $('#LMessage').css('color', 'red');
        return;
    }

    //if (!Mobile_IsValid) {
    //    $("#LMessage").text('اعتبار سنجی شماره همراه انجام نشده است');
    //    $('#LMessage').css('color', 'red');
    //    return;
    //}
    var d = { pBizCode: tmpBizCode, pNumber: tmpMobileNumber };
    var c = JSON.stringify(d);
    $('#btnSend').prop('disabled', true);
    /*******************************************/
    StartBusy('DivSmsConfirm');
    $request = $.ajax({
        type: "POST",
        url: "CreateAccount.aspx/SendConfirmSMS",
        data: c,
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        success: function (msg) {
            StopBusy('DivSmsConfirm');
            if (msg.d == '') {
                $('#LRecoveryError').text('خطا در ارسال کد');
                $('#LRecoveryError').css('color', 'red');
            }
            else {
                $('#LRecoveryError').text('کد تاییدیه با موفقیت به شماره همراه شما ارسال شد');
                $('#LRecoveryError').css('color', 'green');
                $('#txtConfirmCode').show();
                $('#txt_OwnerTell').prop('disabled', true);
                if (GetScope().LegalPerson)
                    $('#txt_CEOCellNo').prop('disabled', true);


                $('#txtConfirmCode').prop('disabled', false);

                $('#btnSend').prop('disabled', false);

                StartTimer();
            }
        },

        error: function (ex) {
            $('#btnSend').prop('disabled', false);
            StopBusy('DivSmsConfirm');
            $('#LRecoveryError').text('خطا در ارسال کد');
            $('#LRecoveryError').css('color', 'red');
            // StopBusy('btnSend');

        }
    });
}

function ConfirmCode_keypress(e) {

    if ($('#txtConfirmCode').val().length == 5)
        CheckConfirmCode();
};

function CheckConfirmCode() {

    var tmpConfirmCode = $('#txtConfirmCode').val();
    var tmpBizCode = $('#txt_Username').val();

    var d = { pBizCode: tmpBizCode, pConfirmCode: tmpConfirmCode };
    var c = JSON.stringify(d);

    $('#LRecoveryError').text('');
    $('#imgError').hide();

    StartBusy('txtConfirmCode');
    $request = $.ajax({
        type: "POST",
        url: "CreateAccount.aspx/CheckConfirmCode",
        data: c,
        crossDomin: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        processdata: true,
        success: function (msg) {
            StopBusy('txtConfirmCode');
            $('#txtConfirmCode').prop('disabled', true);
            if (msg.d == true) {
                ConfirmCodeIsTrue = true;
                $('#txtConfirm').css('color', 'green');
                $('#LRecoveryError').css('color', 'green');
                $('#LRecoveryError').text('کد تاییدیه صحیح می باشد');
                $('#imgTick').show();
                $('#imgError').hide();
                //  $('#txtConfirmCode').prop('disabled', true);
                $('#btnSend').prop('disabled', true);
                if ($('#ChAccept').is(':checked'))
                    $("#BtnSave").prop("disabled", false);
            }
            else {
                $('#txtConfirm').css('color', 'red');
                $('#LRecoveryError').css('color', 'red');
                $('#LRecoveryError').text('کد تاییدیه معتبر نمی باشد');
                $('#imgError').show();
                $('#imgTick').hide();
                $('#btnSend').prop('disabled', false);
            }
        },

        error: function (c) {
            StopBusy('txtConfirmCode');
        }
    });
}

function StartTimer() {

    var TimerTime = 60;
    if (typeof (Config.TimerTime) != 'undefined')
        TimerTime = Config.TimerTime;

    $('#btnSend').attr("disabled", true);
    $('#btnSend').css("opacity", 0.5);
    var tmpMessage = '<p id=\'lblComment\' style="font-size:small">در صورت ارسال نشدن پیامک ، بعد از ' + TimerTime +
        ' ثانیه میتوانید دوباره دکمه دریافت کد تایید را بزنید</p > ';

    $('#lblComment').remove();
    $('#LRecoveryError').after(tmpMessage);
    $('#lblComment').css('color', 'red');

    indexTime = TimerTime;
    Counter = setInterval(myFunction, 1000);
}


var imageDataBase64 = null;
function encodeImageFileAsURL(element, isCeo) {
    var file = element.files[0];
    //check size
    if (file.size > Config.UploadSize) {
        alert("حجم فایل باید کمتر از " + Config.UploadSize / 1024 + " کیلو بایت باشد");
        return
    }
    var fname = file.name;
    if (fname.split(".")[1].toLowerCase().indexOf("jpg") == -1 && fname.split(".")[1].toLowerCase().indexOf("png") == -1 && fname.split(".")[1].toLowerCase().indexOf("jpeg") == -1) {
        alert("نوع فایل باید از نوع عکس باشد")
        return
    }

    var reader = new FileReader();
    reader.onloadend = function () {
        var tmpData = reader.result;
        if (isCeo)
            $("#ceoImage").attr("src", tmpData);
        else
            $("#ownerImage").attr("src", tmpData);

        var a = tmpData.search("base64");
        imageDataBase64 = tmpData.substr(a + 7, tmpData.length);
        //console.log('RESULT', reader.result)
    }
    reader.readAsDataURL(file);
}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}



//$(function () {
//    $(".btn").on("click", function () {
//        $.notify({
//            title: '<strong>44</strong>',
//            icon: 'glyphicon glyphicon-star',
//            message: "444!"
//        }, {
//            type: 'info',
//            animate: {
//                enter: 'animated fadeInUp',
//                exit: 'animated fadeOutRight'
//            },
//            placement: {
//                from: "bottom",
//                align: "left"
//            },
//            offset: 20,
//            spacing: 10,
//            z_index: 1031,
//        });
//    });
//});












function SetLeganPersion(pIsLegalPerson) {
    GetScope().LegalPerson = pIsLegalPerson;
}



function GetScope() {//GetScope().Account_Info
    return angular.element(document.getElementById('myCtrlID')).scope();
}
var EditAccount
//var app = angular.module('myApp', []);
////app.controller('myCtrl', function ($scope) {

//app.controller('myCtrl', ['$scope', '$http', function ($scope, $http) {



//    $scope.name = "";
//    $scope.Account_Info = {
//        CEOCI_Degree: 0,
//        OwnerSex: 'true',
//    };
//    $scope.LegalPerson = false;

//    $scope.ShowInquiryButton = Config.ShowInquiryButton;

//    $scope.Degree = [
//        { Id: 0, Title: "متوسطه " },
//        { Id: 0, Title: "دیپلم" },
//        { Id: 2, Title: "کاردانی" },
//        { Id: 3, Title: "کارشناسی" },
//        { Id: 3, Title: "کارشناسی ارشد" },
//        { Id: 4, Title: "دکترا" },
//    ]
//    $scope.ShowUploadButton = Config.ShowUploadButton;

//    EditAccount = getParameterByName("EditAccount");

//    if (EditAccount) {
//        $scope.FormTitle = "ثبت عضویت کاربر جدید";
//        $("#headertxt").html("ویرایش عضویت در سامانه شهروند سپاری");
//        StartBusy("myCtrlID", "دریافت اطلاعات");
//        Config.ValidateBySms = false;
//        $(document).ready(function () {
//            $('#lblfooterText').text(Config.FooterText);
//        });

//        setTimeout(function () {
//            SafaSecurity.GetAccountInfo(function (res) {
//                StopBusy("myCtrlID", "دریافت اطلاعات");
//                $scope.Account_Info = res.d;

//                if ($scope.Account_Info == null) {
//                    alert('اطلاعات کاربر یافت نشد');
//                }
//                else {

//                    $scope.EditDisable = true;
//                    $("#BtnSave").html("اعمال تغییرات");

//                    if ($scope.Account_Info.EumAccountType == 2) {
//                        //     $("#legalTab").click();
//                        $('.nav-tabs > li.active').removeClass('active');
//                        $('#personTab').removeClass('active in');

//                        $("#legalTab1").addClass('active');
//                        $("#legalTab").addClass('active in');
//                        $scope.LegalPerson = true;
//                    }
//                    if ($scope.Account_Info) {
//                        $scope.Account_Info.OwnerSex = $scope.Account_Info.OwnerSex == false ? "false" : "true";
//                        $scope.Account_Info.CEOSex = $scope.Account_Info.CEOSex == false ? "false" : "true";
//                        $scope.$apply();
//                    }
//                    if ($scope.Account_Info.Image != null)
//                        $("#ownerImage").attr("src", 'data:image/jpg;base64,' + btoa($scope.Account_Info.Image));
//                    else { $("#ownerImage").hide(); }
//                }
//            })
//        }, 1000)

//    }

//}]);

function checkShenaseMelli(code) {

    var L = code.length;

    if (L < 11 || parseInt(code, 10) == 0) return false;

    if (parseInt(code.substr(3, 6), 10) == 0) return false;
    var c = parseInt(code.substr(10, 1), 10);
    var d = parseInt(code.substr(9, 1), 10) + 2;
    var z = new Array(29, 27, 23, 19, 17);
    var s = 0;
    for (var i = 0; i < 10; i++)
        s += (d + parseInt(code.substr(i, 1), 10)) * z[i % 5];
    s = s % 11; if (s == 10) s = 0;
    return (c == s);

}


//});


  //  var r = getParameterByName("r")

   // EditAccount = window.atob(EditAccount);
   // EditAccount = EditAccount.replace(r, '');

    // EditAccount = EditAccount.split("").reverse().join("");







//////////////////////////////////////////////////////////////////////
//function checkCodeMeli(code) {

//    var L = code.length;

//    if (L < 11 || parseInt(code, 10) == 0) return false;

//    if (parseInt(code.substr(3, 6), 10) == 0) return false;
//    var c = parseInt(code.substr(10, 1), 10);
//    var d = parseInt(code.substr(9, 1), 10) + 2;
//    var z = new Array(29, 27, 23, 19, 17);
//    var s = 0;
//    for (var i = 0; i < 10; i++)
//        s += (d + parseInt(code.substr(i, 1), 10)) * z[i % 5];
//    s = s % 11; if (s == 10) s = 0;
//    return (c == s);

//}
