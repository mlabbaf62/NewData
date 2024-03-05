
var app = angular.module('myApp', [])
    .controller('myCtrl', function ($scope, $http) {

        this.handleFileSelect = function () {
            const file = document.querySelector('input[type=file]').files[0];
            const reader = new FileReader();

            reader.onloadend = function () {
                $scope.$apply(function () {
                    this.displayFirst = reader.result;
                });
            }

            if (file) {
                reader.readAsDataURL(file);
            }
        }



        $scope.currentStep = 0;

        // Fetch JSON data from file
        $http.get('formData.json')
            .then(function (response) {
                $scope.formData = response.data;
            })
            .catch(function (error) {
                console.error('Error fetching formData:', error);
            });


        $scope.setCurrentStep = function (index) {
            $scope.currentStep = index;
        };


        $scope.Account_Info = {}
        $scope.SaveAccountInfo = function () {
            debugger
            $scope.Account = {}
            if (EditAccount != '')
                $scope.Account.NidAccount = EditAccount;
            else
                $scope.Account.NidAccount = '00000000-0000-0000-0000-000000000000';


            $scope.Account.UserName = $scope.Account_Info.AccountName
           
            $scope.Account.FullName = $scope.Account_Info.OwnerFirstName + ' ' + $scope.Account_Info.OwnerLastName

            $scope.Account.Mobile = $scope.Account_Info.OwnerTell;
            $scope.Account.Email = $scope.Account_Info.OwnerEmail;


            $scope.Account.Address = $scope.Account_Info.Address
            $scope.Account.Json = JSON.stringify($scope.Account_Info);
            ;


            var d = { pAccount: $scope.Account };
            var c = JSON.stringify(d);

            StartBusy('exampleModal', 'در حال ذخیره اطلاعات');
            $request = $.ajax({
                type: "POST",
                url: "Method.aspx/SaveAccount",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('exampleModal');

                    if (msg.d == true) {

                        $('#LMessage').css('color', 'green');
                        $('#LMessage').text('اطلاعات صحیح می باشد');

                        if (EditAccount)
                            $("#msgSuccess").html("ویرایش اطلاعات با موفقیت انجام شد");
                        else
                            $("#LMessage").html("ثبت عضویت با موفقیت انجام شد");

                        $("#MainDIv").slideToggle();
                        $("#SecDIv").slideToggle();

                        GetScope().$apply();
                    }
                    else {

                        $('#LMessage').css('color', 'red');
                        $('#LMessage').text('اطلاعات نادرست می باشد');
                    }
                },

                error: function (c) {
                    StopBusy('exampleModal');
                }
            });


        };

        $scope.GetAccountInfo = function (EditAccount) {

            var d = { NidAccount: EditAccount };
            var c = JSON.stringify(d);

            StartBusy('exampleModal', 'در حال ذخیره اطلاعات');
            $request = $.ajax({
                type: "POST",
                url: "Method.aspx/GetAccount",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('exampleModal');

                    if (msg.d != null) {

                        $scope.Account_Info = JSON.parse(msg.d.Json);
                        $scope.$apply();
                    }
                    else {

                        $('#LMessage').css('color', 'red');
                        $('#LMessage').text('اطلاعات نادرست می باشد');
                    }
                },

                error: function (c) {
                    StopBusy('exampleModal');
                }
            });


        };
        $scope.CheckData = function () {

            //$scope.SaveAccountInfo();
            var tmpEditAccount = getParameterByName('EditAccount');
            if (tmpEditAccount != '') {
                EditMode = true;

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

            

            $scope.SaveAccountInfo();

            //Savefn()
        }


        $scope.name = "";
        $scope.Account_Info = {
            CEOCI_Degree: 0,
            OwnerSex: 'true',
        };
        $scope.LegalPerson = false;

        $scope.ShowInquiryButton = Config.ShowInquiryButton;

        $scope.Degree = [
            { Id: 0, Title: "متوسطه " },
            { Id: 0, Title: "دیپلم" },
            { Id: 2, Title: "کاردانی" },
            { Id: 3, Title: "کارشناسی" },
            { Id: 3, Title: "کارشناسی ارشد" },
            { Id: 4, Title: "دکترا" },
        ]
        $scope.ShowUploadButton = Config.ShowUploadButton;

        var EditAccount = getParameterByName("EditAccount");

        if (EditAccount != '') {
            
            $scope.GetAccountInfo(EditAccount);
        }
    
    });



app.directive('childComponent', function () {
    return {
        restrict: 'E',
        scope: {
            displayFirst: '=',
            title: '@'
        },
        templateUrl: 'Img.html',
        link: function (scope, element, attrs) {
            scope.onFileSelected = function (event) {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = function (event) {
                    const base64Image = event.target.result;
                    scope.displayFirst = base64Image;
                    scope.$apply();
                };
                reader.readAsDataURL(file);
            };
        }
    };
});




function GetScope() {//GetScope().Account_Info
    return angular.element(document.getElementById('myCtrlID')).scope();
}
