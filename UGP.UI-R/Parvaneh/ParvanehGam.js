//==================================================Angular 
var app = angular.module("AppTransfer", []);

var CtlTransfer = ['$scope', '$http', function ($scope, $http) {
    $scope.ArchiveProvide = (typeof (ArchiveProvide) != 'undefined' ? ArchiveProvide : '');
    $scope.GreenColor = false;
    $scope.IsValidNosaziCode = false;
    $scope.LoadFromRequest = function (pNidProc) {
        $scope.LoadFromRequestMain(pNidProc);
    };
    $scope.LoadObj = function () {

        if (ClsAccount.AccountInfo != null) {
            $scope.p = ClsAccount.AccountInfo.NidAccount;
            if ($scope.p == undefined || $scope.p == "")
                $scope.p = getParameterByName('p');

            $scope.ClsAccount = ClsAccount;
            $scope.Config = { ScopeName: GetGamInfo() };

            $scope.GetCI_List('CI_UsingGroup');
            $scope.GetCI_List('CI_UsingType');
            $scope.GetCI_List('CI_DocType');
            $scope.GetCI_List2('CI_UsingType', function (p) {


                $scope.CI_UsingType = p;

                //$.each(p, function (i, el) {
                //    $('#cmbCI_UsingType' + i).append(new Option(el.Title, el.Id));
                //});


            });

            $scope.GetCI_List2('CI_RequirmentForZabeteh', function (p) {
                $scope.CI_list = p;
            });
            $scope.GetADP_List();
            $scope.GamInputData.SessionId = ClsAccount.SessionId;
        }

        $scope.Prop.ErrorMessage = "";
        var tmpNidProc = getParameterByName('NidProc');
        if (tmpNidProc != '') {
            $scope.LoadFromRequest(tmpNidProc);
            if ($(GamsArray).last()[0].Name == 'SaveRequest') {
                alert('گردشکار این پرونده به پایان رسیده است');
                GamPlugin.ResetGamAndRedirect();
            }
        }
        else if ($scope.p != undefined && $scope.p != "") {
            var tmpGamScope = GamPlugin.GetlocalStorage($scope.Config.ScopeName);
            if (tmpGamScope != null) {
                $scope.GamInputData = tmpGamScope;
                LoadNosaziCode($scope.GamInputData.CurrentNosaziCode);
                if ($scope.GamInputData.CurrentNosaziCode != '')
                    $scope.GamInputData.District = $scope.GamInputData.CurrentNosaziCode.split('-')[0];
                GamPlugin.removeStep = $scope.GamInputData.removeStep;
                $scope.Functions.LoadPage($scope.GamInputData.CurrentStep);
            }
        } else
            alert('ابتدا باید وارد حساب کاربری خود شوید');
    };

    //ng-init
    $scope.init = function () {
        $scope.DoEvents();
        $scope.StyleFunc.Load();
    };
    $scope.initUpload = function (e) {
        $("[id^='btnLoad']").hide();

        $scope.LetterList_OUT.forEach(function (item, index) {
            item.IsConfirmStr = (item.Sh_OfficeLetter.EumConfirm == 1) ? "تایید" : "عدم تایید";

            var tmpNidTag = Archive_NidEntityLetter;
            var u1 = $('#DivLetter2' + index).AsSafaArchiveUploder();
            u1.LoadObjSimple($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, {
                UserName: ClsAccount.AccountInfo.FullName,
                UserCode: ClsAccount.AccountInfo.NidAccount,
                FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg",
                Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter
                , OnCompleteUpload: function (args, sender) {
                    $scope.Functions.Gam5Func_Upload.AddNidFileLetter(args.NidFile, args.OtherFiled);
                    $scope.Functions.ShowArchiveLetter();
                }
            });

        });

    };

    $scope.DoEvents = function () {
        $(document).on("onCheckGam", { CurrentStep: 0, ErrorMessage: '', AllowNextPage: false }, function (event) {
            var res = $scope.Functions.CheckGam(event.data);
            return res;
        });

        $(document).on("onLoadStep", function (event, pInputParam) {
            if (pInputParam.pFromLoad) {
                $scope.LoadObj();
            }
            else
                //بعد از زدن دکمه بعدی فراخوانی میشود
                $scope.Functions.LoadPage(CurrentStep);
        });
        //$(document).on("onLoadAccount", {}, function (event) {
        //    $scope.LoadObj();
        //    $scope.Functions.LoadPage(CurrentStep);
        //});
    }
    $scope.ResetScope = function () {

        $scope.GamInputData = {
            IsAccept: false,
            NidBase: "",
            //SelectedWorkFlow: { NidWorkflowDeff: NidWorkFlowDeff_Parvaneh, WorkflowTitel: 'ثبت درخواست پروانه ساختمانی' },
            SelectedWorkFlow: {},
            RequestGroup: "Transfer",
            Address: "",
            EstateOwner: "",
            OwnerType: "مالک",
            Comment: "",
            CurrentNosaziCode: "",
            AllowNextPage: false,

            Nahad: '',
            FicheRes: {
                PaymentMessage: null,
                PaymentMessageDaramad: null,
                CurrentNidFiche: null,
                CurrentNidFicheDaramad: null,
                isHKTruePayment: false,
                TrackingCode: '',
                isLoaded: false,
            },

            NidWorkItem: '',
            NidWorkItemText: "",
            UploadCount: 0,
            UploadCountRequire: 0,
            MustUploadCount: 0,
            IsVakil: false,
            CurrentStep: 1,
            BazdidDate: "",
            BazdidTime: "",
            ResourceId: null,
            Sh_RevisitAgentRandom: { Name: '', Family: '', UserName: '', Phone: '' },
            LetterNo: "",
            LetterDate: "",
            District: null,
            NidNosaziCode: '',
            OldNidProc: '',
            OwnerPhone: '',
            ShowTransferPayment: ShowTransferPayment,
            ShowFicheNosazi: true,
            ShowFicheDarAmad: ShowFicheDarAmad,
            ShowFichePasmand: ShowFichePasmand,
            CostKarshenasi: CostKarshenasi,
            CurrentJobLocation: null,
            AccountTell: '',
            MustUploadLetterCountCom: 0,
            MustUploadLetterCountNew: 0,
            CommentTask: '',
            SessionId: ClsAccount.SessionId,
        };
        if ($scope.GamInputData.SelectedWorkFlow.WorkflowTitel != undefined)
            GetScopeMenu().Header = $scope.GamInputData.SelectedWorkFlow.WorkflowTitel;
        else
            GetScopeMenu().Header = "ثبت درخواست پروانه اینترنتی";
    }
    $scope.ResetScope();

    $scope.ClsAccount = {
        UserInfo: { NidUser: null },
    };

    $scope.Functions =
    {
        DownloadDWG: function (pType) {

            if (pType == undefined)
                pType = 0;

            var d = {

                pCode: $scope.GamInputData.CurrentNosaziCode, pDWGFileType: pType, pDistrict: $scope.GamInputData.District
            }

            var c = JSON.stringify(d);
            StartBusy1();
            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetCadWsFileUrl",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    StopBusy1();
                    if (response.CadWsFileUrl != '') {
                        window.open(response.CadWsFileUrl, '_blank');
                    }
                    else alert('فایلی یافت نشد');
                },
                failure: function (response) {
                    StopBusy1();
                    alert('فایلی یافت نشد');
                },
                error: function (c) {
                    StopBusy1();
                    alert('فایلی یافت نشد');
                }
            });
        },
        CheckConfirmManager: function (pGamStep) {
            var tmpCurrentStep = GamsArray[pGamStep];
            var tmpCi_Confirm = 0; // احتیاج به تایید مدیر ندارد
            //#335 $scope.GamInputData.IsRequireBazdid == true طبق گفته یزد . اگر بازدید نداشت تایید مدیران هم چک نشه
            if (tmpCurrentStep.IsConfirmManager != undefined && tmpCurrentStep.IsConfirmManager == true) {
                if (tmpCurrentStep.CI_Confirm != undefined)
                    tmpCi_Confirm = tmpCurrentStep.CI_Confirm;
                else
                    tmpCi_Confirm = 5;//Default 

                if (AnalystConfirm(tmpCi_Confirm)) {
                    return true
                }
                else {
                    if (tmpCurrentStep.ConfirmManagerMessage != undefined)
                        $scope.Prop.ErrorMessage = tmpCurrentStep.ConfirmManagerMessage;
                    else
                        $scope.Prop.ErrorMessage = 'پرونده تایید نشده است . بعد از تایید ، پیامکی برای شما ارسال میشود ';
                    $scope.GreenColor = false;
                }

                $scope.$apply();
            }
            else return true;
        },
        CheckConfirmManagerOnly: function (pGamStep) {
            var tmpCurrentStep = GamsArray[pGamStep];
            var tmpCi_Confirm = 0; // احتیاج به تایید مدیر ندارد
            //#335 $scope.GamInputData.IsRequireBazdid == true طبق گفته یزد . اگر بازدید نداشت تایید مدیران هم چک نشه

            if (tmpCurrentStep.CI_Confirm != undefined)
                tmpCi_Confirm = tmpCurrentStep.CI_Confirm;
            else
                tmpCi_Confirm = 5;//Default 

            if (AnalystConfirm(tmpCi_Confirm)) {
                return true
            }
            else {
                return false;
            }
            $scope.$apply();
        },
        FirstCall: false,
        CheckGamPre: function (pDataStep) {
            var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];
            $scope.GreenColor = false;
            $scope.Prop.ErrorMessage = '';
            if (tmpCurrentStep.Name == EumPage.Start) {
                if ($scope.GamInputData.IsAccept == true) {
                    pDataStep.AllowNextPage = true;
                }
                else {
                    $scope.Prop.ErrorMessage = 'لطفا تعهدات را تایید نمایید';
                }
            }
            if (tmpCurrentStep.Name == EumPage.Select) {
                if (NosaziCode != '') {
                    if ($scope.IsValidNosaziCode) {
                        $scope.GamInputData.CurrentNosaziCode = NosaziCode;


                        if ($scope.Prop.ErrorMessageZabeteh != '' && $scope.Prop.ErrorMessageZabeteh != undefined) {
                            $scope.Prop.ErrorMessage = $scope.Prop.ErrorMessageZabeteh;
                            pDataStep.AllowNextPage = false
                        }
                        else if ($scope.GamInputData.IsAccept2 != undefined && $scope.GamInputData.IsAccept2 != true && $scope.Base_PlanMosavab != null) {
                            $scope.Prop.ErrorMessage = 'لطفا تعهدات پروانه را انتخاب نمایید';
                            pDataStep.AllowNextPage = false;
                        }
                        else
                            pDataStep.AllowNextPage = true;


                        if ($('#chIsMapOk').length > 0) {
                            if ($scope.GamInputData.IsMapOk != true) {
                                $scope.Prop.ErrorMessage = 'لطفا تعهدات جانمایی ملک را انتخاب نمایید';
                                pDataStep.AllowNextPage = false;
                            } else
                                pDataStep.AllowNextPage = true;
                        }

                    }
                }
                else
                    $scope.Prop.ErrorMessage = 'لطفا کد نوسازی را وارد نمایید';
            }
            else if (tmpCurrentStep.Name == EumPage.SelectNo) {

                if ($scope.GamInputData.District == null || $scope.GamInputData.District == '') {
                    $scope.Prop.ErrorMessage = 'لطفا منطقه را مشخص نمایید';
                    pDataStep.AllowNextPage = false;
                }
                if ($scope.GamInputData.HaveNosaziCode == true && $scope.GamInputData.CurrentNosaziCode == '') {
                    $scope.Prop.ErrorMessage = 'لطفا کد نوسازی را مشخص نمایید';
                    pDataStep.AllowNextPage = false;
                }

                else {
                    GetScope().GetNosaziReaseon();
                    pDataStep.AllowNextPage = true;
                }
                //else if ($scope.GamInputData.Wkt != undefined && $scope.GamInputData.Wkt != '')
                //    pDataStep.AllowNextPage = true;
                //else
                //    $scope.Prop.ErrorMessage = 'لطفا محدوده ملک را در نقشه مشخص نمایید';
            }
            if (tmpCurrentStep.Name == EumPage.WorkFlow) {

                $.each($("#WorkFlowDiv:visible >>> .validate"), function (index, value) {
                    if ($(value).val().trim() == '') {
                        $(value).attr("placeholder", "مقادیر را وارد نمایید");
                        GetScope().Prop.ErrorMessage = ("لطفا مقادیر مشخص شده را وارد نمایید");
                        res = false;
                    }
                });
                if (res == false)
                    pDataStep.AllowNextPage = false;
                else {

                    if (typeof ($scope.WorkFlowSelect) != 'undefined' && $("#DivWorkFlow input[type='radio']:checked").val() != undefined) {
                        $scope.GamInputData.SelectedWorkFlow = {
                            NidWorkflowDeff: $("#DivWorkFlow input[type='radio']:checked").val(),
                            WorkflowTitel: $("#DivWorkFlow input[type='radio']:checked").data('bind')
                        };
                    }
                    GetScope().GamInputData.LetterDate = $('#txtLetterDateS1').val();

                    if (GetScope().GamInputData.LetterDate == '' || GetScope().GamInputData.LetterDate == undefined)
                        GetScope().GamInputData.LetterDate = $('#txtLetterDateS').val();



                    if (($("#cmbWorkFlowDeff").prop('selectedIndex') > -1 && $scope.GamInputData.SelectedWorkFlow != undefined && $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff != undefined)
                        || ($("#cmbWorkFlowDeff").length == 0 && $scope.GamInputData.SelectedWorkFlow != undefined && $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff != undefined)) {
                        var select = true;
                        if ($scope.GamInputData.WorkFlowComments != undefined && $scope.GamInputData.WorkFlowComments != null)
                            $.each($scope.GamInputData.WorkFlowComments, function (key, value) {
                                if (!value.IsChecked)
                                    select = false;
                            });
                        if (select) {

                            if ($scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff == '00000000-0000-0000-0000-000000000000')
                                $scope.Prop.ErrorMessage = 'نوع درخواست به درستی مشخص نشده است ';
                            else {
                                pDataStep.AllowNextPage = true;
                                $scope.Functions.Gam3Func.GetGamList();
                            }
                        }
                        else
                            $scope.Prop.ErrorMessage = 'لطفا موارد را تایید نمایید';
                    }
                    else {
                        pDataStep.AllowNextPage = false;
                        $scope.Prop.ErrorMessage = 'لطفا درخواست مورد نظر را انتخاب نمایید';
                    }
                    $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = Archive_NidEntityParvaneh;

                    if ($scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff != undefined) {
                        var tmpWS = Enumerable.From($scope.AllWorkflowList)
                            .Where(function (x) { return x.NidWorkflowDeff.toLowerCase() == $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff.toLowerCase() }).FirstOrDefault();

                        if (tmpWS != null && tmpWS.ArchiveEntity != undefined && tmpWS.ArchiveEntity != '')
                            $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = tmpWS.ArchiveEntity;
                    }
                }
            }
            if (tmpCurrentStep.Name == EumPage.Account) {

                var requiredFields = $('input[required]')

                pDataStep.AllowNextPage = true;


                if ($scope.GamInputData.HaveSanad && $scope.GamInputData.DocType == undefined) {
                    $scope.Prop.ErrorMessage = 'نوع سند را مشخص نمایید';
                    pDataStep.AllowNextPage = false;
                }
                requiredFields.each(function () {
                    if ($(this).val() == '') {
                        pDataStep.AllowNextPage = false;
                        $(this)[0].style.setProperty('border-color', 'red', 'important');
                    }
                });

            }
            if (tmpCurrentStep.Name == EumPage.Avarez) {

                if (GetScope().GamInputData.IsDoneManagerConfirm == false) {
                    GetScope().Prop.ErrorMessage = ConfirmManagerForAvarezMessage;
                    pDataStep.AllowNextPage = false;
                }
                else {
                    if (FishFunc.CheckPayFish())
                        pDataStep.AllowNextPage = true;
                    else
                        $scope.Prop.ErrorMessage = 'کاربر گرامی ، ابتدا باید عوارض  شهرداری را پرداخت نمایید';
                }

            }
            if (tmpCurrentStep.Name == EumPage.AvarezDaramad) {
                $scope.Prop.ErrorMessage = '';

                if (FishFunc.CheckPayFish()) {
                    pDataStep.AllowNextPage = true;
                }
                else
                    $scope.Prop.ErrorMessage = 'کاربر گرامی ، ابتدا باید عوارض  شهرداری را پرداخت نمایید';
            }

            if (tmpCurrentStep.Name == EumPage.Upload || tmpCurrentStep.Name == EumPage.UploadNewNosazi) {
                pDataStep.AllowNextPage = true;
                var res = true;
                $.each($(":visible.validate"), function (index, value) {
                    if ($(value).val().trim() == '') {
                        $(value).attr("placeholder", "مقادیر را وارد نمایید");
                        GetScope().Prop.ErrorMessage = ("لطفا مقادیر مشخص شده را وارد نمایید");
                        res = false;
                        pDataStep.AllowNextPage = false;
                    }
                });

                GetScope().GamInputData.G5r1 = $('input[Name="G5r1"]:checked').val();

                if ($('.EstelamType').length > 0 && GetScope().GamInputData.G5r1 == undefined || GetScope().GamInputData.G5r1 == '') {
                    GetScope().Prop.ErrorMessage = ("نوع استعلام را مشخص نمایید");
                    res = false;
                    pDataStep.AllowNextPage = false;
                }

                if (res == true) {
                    if (UploadPlugin.CheckArchiveValidity())
                        pDataStep.AllowNextPage = true;
                    else
                        pDataStep.AllowNextPage = false;
                }

            }
            if (tmpCurrentStep.Name == EumPage.SelectBazdid) {
                if ($scope.GamInputData.BazdidDate == '')
                    $scope.Prop.ErrorMessage = 'تاریخ بازدید را  وارد نمایید';
                else if ($scope.GamInputData.Sh_RevisitAgentRandom == null)
                    $scope.Prop.ErrorMessage = 'مامور بازدید را  انتخاب نمایید';
                else if ($scope.GamInputData.NidProc != undefined && GetScope().GamInputData.ConfirmBazdid != true)
                    $scope.Prop.ErrorMessage = 'تاریخ بازدید و مامور بازدید را تایید نمایید';
                else {
                    pDataStep.AllowNextPage = true;
                }
            }
            if (tmpCurrentStep.Name == EumPage.SaveRequest) {
                if ($scope.GamInputData.NidWorkItem <= 0)
                    $scope.Prop.ErrorMessage = 'ابتدا باید ثبت درخواست انجام شود';
                else
                    pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.ShFani) {
                pDataStep.AllowNextPage = false;
                if ($scope.GamInputData.ShFaniOk == 'true') {
                    if ($scope.GamInputData.SendToShahrsazOk != true)
                        $scope.Prop.ErrorMessage = 'باید دکمه ارسال به شهرساز را بزنید و منتظر تایید شهرساز باشید ';
                    else
                        pDataStep.AllowNextPage = true;
                }
                else if ($scope.GamInputData.ShFaniOk == 'false') {
                    $scope.Prop.ErrorMessage = 'مدارک لازم برای دلیل عدم تایید را ارسال نمایید';
                }
                else {
                    $scope.Prop.ErrorMessage = 'وضعیت شناسنامه فنی را مشخص نمایید ';
                }
            }
            if (tmpCurrentStep.Name == "ShFaniNew") {
                pDataStep.AllowNextPage = true;
                //if ($scope.GamInputData.ShFaniOk == 'true') {
                //    if ($scope.GamInputData.SendToShahrsazOk != true)
                //        $scope.Prop.ErrorMessage = 'باید دکمه ارسال به شهرساز را بزنید و منتظر تایید شهرساز باشید ';
                //    else
                //        pDataStep.AllowNextPage = true;
                //}
                //else if ($scope.GamInputData.ShFaniOk == 'false') {
                //    $scope.Prop.ErrorMessage = 'مدارک لازم برای دلیل عدم تایید را ارسال نمایید';
                //}
                //else {
                //    $scope.Prop.ErrorMessage = 'وضعیت شناسنامه فنی را مشخص نمایید ';
                //}
            }

            if (tmpCurrentStep.Name == EumPage.ElamZabete) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.Tavafoghat) {

                if ($scope.Sh_Agreement_List != null && $scope.Sh_Agreement_List.length > 0 || $scope.GamInputData.rw == 0) {
                    pDataStep.AllowNextPage = true;
                }
                else
                    $scope.Prop.ErrorMessage = 'پرونده شما در مرحله توافقات شهرسازی قرار دارد، نتایج توافقات بزودی اعلام خواهد شد';
            }

            if (tmpCurrentStep.Name == EumPage.ShZabete) {
                pDataStep.AllowNextPage = false;
                if ($scope.GamInputData.ParvanehOk == 'true') {
                    pDataStep.AllowNextPage = true;
                }
                else if ($scope.GamInputData.ParvanehOk == 'false') {
                    $scope.Prop.ErrorMessage = 'وضعیت ضابطه فنی را مشخص نمایید';
                }
                else {
                    $scope.Prop.ErrorMessage = 'وضعیت ضابطه فنی را مشخص نمایید';
                }
            }
            if (tmpCurrentStep.Name == "ShZabeteNew") {
                pDataStep.AllowNextPage = false;
                if ($scope.Functions.CheckConfirmManagerOnly(GamPlugin.CurrentStep)) {
                    pDataStep.AllowNextPage = true;
                }
                //else {
                //if ($scope.GamInputData.ParvanehOk == 'true') {
                //    pDataStep.AllowNextPage = true;
                //}
                //else if ($scope.GamInputData.ParvanehOk == 'false') {
                //    $scope.Prop.ErrorMessage = 'وضعیت ضابطه فنی را مشخص نمایید';
                //}
                //else {
                //    $scope.Prop.ErrorMessage = 'وضعیت ضابطه فنی را مشخص نمایید';
                //}

            }

            if (tmpCurrentStep.Name == EumPage.ShZabeteYazd) { // ضابطه یزد چک نمیشود
                pDataStep.AllowNextPage = true;
            }

            if (tmpCurrentStep.Name == EumPage.Estelam) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.Zavabet) {

                if ($scope.ZabetehChideman == null || $scope.ZabetehChideman != null && $scope.ZabetehChideman.length == 0) {
                    $scope.Prop.ErrorMessage = 'اعتبارسنجی  ضابطه ساختمانی انجام نشده است';
                }
                else {
                    //از گام توافقات رد میشود
                    if ($scope.GamInputData.rw == 0 && $scope.GamInputData.ZabeteCommit == true) {
                        pDataStep.AllowNextPage = true;
                    }
                    else if ($scope.GamInputData.rw == 1) {
                        if ($scope.GamInputData.FormConfirmationOK == true) {
                            pDataStep.AllowNextPage = true;
                        }
                        else
                            $scope.Prop.ErrorMessage = 'اعتبارسنجی  ضابطه ساختمانی انجام نشده است';
                    }
                    else if ($scope.GamInputData.rw == 2) {
                        if ($scope.GamInputData.FormConfirmationOK == true) {
                            pDataStep.AllowNextPage = true;
                        }
                        else
                            $scope.Prop.ErrorMessage = 'اعتبارسنجی  ضابطه ساختمانی انجام نشده است';
                    }

                    else
                        $scope.Prop.ErrorMessage = 'در صورت تایید نهایی میتوانید به گام بعدی بروید';
                }
            }
            if (tmpCurrentStep.Name == EumPage.Engineer) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.EngineerQuata) {

                if ($scope.EngList == undefined)//اگر سرویس خطا داشت به جلو برود
                    pDataStep.AllowNextPage = true;
                else {
                    if ($scope.EngList.length == 0)
                        $scope.Prop.ErrorMessage = 'ابتدا باید مهندسین ناظر تعریف شوند ';
                    else {
                        var tmpConfirmLetterComOrgCount = Enumerable.From($scope.LetterList_Com)
                            .Where(function (x) { return x.Sh_OfficeLetter.EumConfirmOrganization == 1 }).Count();
                        if (tmpConfirmLetterComOrgCount < 2) {
                            $scope.Prop.ErrorMessage += '\r\n' + 'نقشه های سازه و تاسیسات باید مورد تایید شهرساز قرارگیرد';
                        }
                        else
                            pDataStep.AllowNextPage = true;
                    }
                }
            }

            if (tmpCurrentStep.Name == EumPage.Commission) {



                if ($scope.LetterList_Com != null && $scope.LetterList_Com.length > 0) {


                    ////1185
                    //var tmpLetterList_Com = Enumerable.From($scope.LetterList_Com)
                    //    .Where(function (x) { return x.LetterName == "ارائه نقشه معماري / کميسيون شهرسازي" }).ToArray();

                    //var tmpConfirmLetterComCount = Enumerable.From(tmpLetterList_Com)
                    //    .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 }).Count();
                    //if (tmpConfirmLetterComCount < tmpLetterList_Com.length) {
                    //    $scope.Prop.ErrorMessage += '\r\n' + ' نقشه های معماري باید مورد تایید شهرساز قرار گیرد';
                    //}
                    //else
                    //    pDataStep.AllowNextPage = true;
                    //////////////////////////////////////////////////////////////////////

                    var tmpLetterList_Com = Enumerable.From($scope.LetterList_Com)
                        .Where(function (x) { return x.LetterName == "ارائه نقشه معماري / کميسيون شهرسازي" }).ToArray();
                    var tmpConfirmLetterComCount = Enumerable.From(tmpLetterList_Com)
                        .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 }).Count();

                    var tmpLetterList_Com2 = Enumerable.From($scope.LetterList_Com)
                        .Where(function (x) { return x.Sh_OfficeLetter.CI_OfficeLetter == 49 }).ToArray();
                    var tmpConfirmLetterComCount2 = Enumerable.From(tmpLetterList_Com2)
                        .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 }).Count();


                    //گام قبلی دوباره چک میشود
                    if ($scope.Functions.CheckConfirmManager(GamPlugin.CurrentStep)) {
                        if (tmpConfirmLetterComCount >= 1 && tmpConfirmLetterComCount2 >= 1) {
                            pDataStep.AllowNextPage = true;
                        }
                        else
                            pDataStep.AllowNextPage = false;
                    }
                }
                else
                    pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.PishFactor) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.Mokatebat) {
                pDataStep.AllowNextPage = false;

                var tmpRes = $scope.Functions.CheckLetters();
                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
                if (tmpRes) {
                    pDataStep.AllowNextPage = true;
                }
                else {
                    //$scope.Prop.ErrorMessage = 'باید دکمه ارسال به شهرساز را بزنید و منتظر تایید شهرساز باشید ';
                    pDataStep.AllowNextPage = false;
                    $('#btnSendToShahrsaz3').show();
                }
            }
            if (tmpCurrentStep.Name == "MokatebatDastoor") {
                pDataStep.AllowNextPage = false;

                var tmpRes = $scope.Functions.CheckLetters();
                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
                if (tmpRes) {
                    pDataStep.AllowNextPage = true;
                }
                else {
                    //$scope.Prop.ErrorMessage = 'باید دکمه ارسال به شهرساز را بزنید و منتظر تایید شهرساز باشید ';
                    pDataStep.AllowNextPage = false;
                    $('#btnSendToShahrsaz3').show();
                }
            }

            if (tmpCurrentStep.Name == EumPage.CheckShahrsaz) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.Bime) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.EngineerYazdDafater) {
                if ($scope.GamInputData.SelectDaftar == undefined)
                    $scope.Prop.ErrorMessage = 'ابتدا باید دفتر مورد نظر را انتخاب نمایید';
                else if ($scope.GamInputData.SelectDaftar.IsConfirm == true) {
                    pDataStep.AllowNextPage = true;
                    //$scope.EngFunc.OfficeSelection($scope.GamInputData.SelectDaftar);
                }
                else {
                    $scope.Prop.ErrorMessage = 'بعد از تایید دفاتر میتوانید به گام بعدی بروید';
                }
            }
            if (tmpCurrentStep.Name == EumPage.EngineerInfo) {
                if ($scope.EngInfoList != null && $scope.EngInfoList.length > 0)
                    pDataStep.AllowNextPage = true;
                else
                    $scope.Prop.ErrorMessage = 'بعد از اختصاص مهندسین ناظر میتوانید به گام بعدی بروید';
            }
            if (tmpCurrentStep.Name == EumPage.MapControl) {
                pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == "POwner_EditType") {

                if ($scope.GamInputData.EditName) {
                    
                    //===============================================================================================
                    //https://trello.com/c/FUtp6H4w

                    //if ($scope.GamInputData.UGP_OwnerListOld[0].OwnerName == "") {
                    //    $scope.Prop.ErrorMessage = 'نام مالک قبلی را وارد نمایید';
                    //    return pDataStep;
                    //}

                    //if ($scope.GamInputData.UGP_OwnerListOld[0].OwnerLastName == "") {
                    //    $scope.Prop.ErrorMessage = 'نام خانوادگی مالک قبلی را وارد نمایید';
                    //    return pDataStep;
                    //}
                    //if ($scope.GamInputData.UGP_OwnerListOld[0].OwnerNationalCode == "") {
                    //    $scope.Prop.ErrorMessage = 'کد ملی مالک قبلی را وارد نمایید';
                    //    return pDataStep;
                    //}
                    //if ($scope.GamInputData.UGP_OwnerListOld[0].OwnerMobile == "") {
                    //    $scope.Prop.ErrorMessage = 'شماره همراه مالک قبلی را وارد نمایید';
                    //    return pDataStep;
                    //}

                    ///////////////////==============================================================================
                    if ($scope.GamInputData.UGP_OwnerListNew[0].OwnerName == "") {
                        $scope.Prop.ErrorMessage = 'نام مالک جدید را وارد نمایید';
                        return pDataStep;
                    }

                    if ($scope.GamInputData.UGP_OwnerListNew[0].OwnerLastName == "") {
                        $scope.Prop.ErrorMessage = 'نام خانوادگی مالک جدید را وارد نمایید';
                        return pDataStep;
                    }
                    if ($scope.GamInputData.UGP_OwnerListNew[0].OwnerNationalCode == "") {
                        $scope.Prop.ErrorMessage = 'کد ملی مالک جدید را وارد نمایید';
                        return pDataStep;
                    }

                    if ($scope.GamInputData.UGP_OwnerListNew[0].OwnerMobile == "") {
                        $scope.Prop.ErrorMessage = 'شماره همراه مالک جدید را وارد نمایید';
                        return pDataStep;
                    }

                    if ($scope.GamInputData.UGP_Owner_Comment == undefined || $scope.GamInputData.UGP_Owner_Comment == '') {
                        $scope.Prop.ErrorMessage = 'توضیحات مالکین را وارد نمایید';
                        return pDataStep;
                    }
                }

                //if ($scope.GamInputData.EditTell) {
                //    if ($scope.GamInputData.Base_Owner.CellPhone == "" || $scope.GamInputData.Base_Owner.CellPhone == undefined) {
                //        $scope.Prop.ErrorMessage = 'شماره همراه مالک را بارگذاری نمایید';
                //        return pDataStep;
                //    }
                //}
                if ($scope.GamInputData.EditFich) {
                    if ($scope.GamInputData.POwner_Upload != true) {
                        $scope.Prop.ErrorMessage = 'اطلاعات فیش را بارگذاری نمایید';
                        return pDataStep;
                    }
                }
                if ($scope.GamInputData.EditFich || $scope.GamInputData.EditName)
                    pDataStep.AllowNextPage = true;
                else {
                    $scope.Prop.ErrorMessage = 'لطفا یک مورد را انتخاب نمایید';
                    return pDataStep;
                }
            }
            if (tmpCurrentStep.Name == "EditAccount") {

                if ($scope.ClsAccount.AccountInfo.OwnerTell == '' || $scope.ClsAccount.AccountInfo.OwnerTell == undefined)
                    $scope.Prop.ErrorMessage = 'تلفن همراه را وارد نمایید';
                else if ($scope.GamInputData.Comment == '' || $scope.GamInputData.Comment == undefined)
                    $scope.Prop.ErrorMessage = 'توضیحات را وارد نمایید';
                else
                    pDataStep.AllowNextPage = true;
            }
            if (tmpCurrentStep.Name == EumPage.PPayKarshenasi) {
                if (GetScope().GamInputData.FicheRes.isHKTruePayment != true) {
                    GetScope().Prop.ErrorMessage = "ابتدا باید هزینه کارشناسی را پرداخت نمایید";
                    res = false;
                }
                else
                    pDataStep.AllowNextPage = true;
            }

            if (tmpCurrentStep.Name == '') {
                pDataStep.AllowNextPage = true;
            }

            return pDataStep;

        },
        CheckGam: function (pDataStep) {
            pDataStep.AllowNextPage = DebugMode;

            var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];

            var tmpCi_Confirm = 0; // احتیاج به تایید مدیر ندارد
            if (tmpCurrentStep.IsConfirmManager != undefined && tmpCurrentStep.IsConfirmManager == true) {
                if (tmpCurrentStep.CI_Confirm != undefined)
                    tmpCi_Confirm = tmpCurrentStep.CI_Confirm;
                else
                    tmpCi_Confirm = 5;//Default 
            }

            CheckIsDoneManagerConfirmAll((result) => {
                if (result == true) {
                    if (tmpCurrentStep.Goto != undefined && resCi2 == true) {
                        pDataStep.AllowNextPage = true;
                        GamPlugin.CurrentStep = tmpCurrentStep.Goto - 1;
                    }
                    else
                        pDataStep = $scope.Functions.CheckGamPre(pDataStep);
                }
                else if (tmpCurrentStep.ConfirmManagerMessage != undefined)
                    $scope.Prop.ErrorMessage = tmpCurrentStep.ConfirmManagerMessage;
                else {
                    $scope.Prop.ErrorMessage = 'بعد از تایید مدیران میتوانید به گام بعدی بروید';
                }
                $scope.GreenColor = false;
                $scope.$apply();
            }, 'GridView1', tmpCi_Confirm, tmpCurrentStep.CI_Confirm2, tmpCurrentStep.Goto);

            //---------------------------------------------------------------------------
            if (pDataStep.AllowNextPage == true) {
                $scope.GamInputData.CurrentStep = GamPlugin.CurrentStep + 1;
                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
            }
            else {
                if ($scope.Prop.ErrorMessage == '')
                    $scope.Prop.ErrorMessage = 'لطفا اطلاعات مربوط به این مرحله را کامل نمایید';
                pDataStep.ErrorMessage = $scope.Prop.ErrorMessage;
            }
            $scope.$apply();
            return pDataStep;
        },
        /////////////////////////////////////////////////////////////////////////////////////////////===========================================
        LoadPage: function () {
            var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];
            if (tmpCurrentStep.btnPreHide != undefined && tmpCurrentStep.btnPreHide == true)
                $('#btnPre').hide();


            if (ClsMenu.Archive_NidEntity != undefined)
                $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = ClsMenu.Archive_NidEntity;

            if (tmpCurrentStep.Archive_NidEntity != undefined)
                $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = tmpCurrentStep.Archive_NidEntity;

            if (tmpCurrentStep.ReportName != undefined)
                $scope.GamInputData.ReportName = tmpCurrentStep.ReportName;

            // در این گام تایید مدیران چک نمیشود 
            if (tmpCurrentStep.Name != "ShFaniNew") {
                //گام قبلی دوباره چک میشود
                if (!$scope.Functions.CheckConfirmManager(GamPlugin.CurrentStep - 1)) {
                    $('#Step' + GamPlugin.CurrentStep).detach();
                    $scope.$apply();
                }
            }
            if (tmpCurrentStep.Name == "ShFaniNew") {
                //تایید مدیران گام بعدی چک میشود
                if ($scope.Functions.CheckConfirmManagerOnly(GamPlugin.CurrentStep)) {
                    $('#ShFaniNotOk').detach();
                    $scope.$apply();
                }
            }
            if (tmpCurrentStep.Name == "ShZabeteNew") {
                //تایید مدیران گام بعدی چک میشود
                if ($scope.Functions.CheckConfirmManagerOnly(GamPlugin.CurrentStep)) {
                    $('#ShZabeteNotOk').detach();
                    $scope.$apply();
                }

                $scope.GetOwnerZabetehComment();
            }

            $scope.Prop.CurrentPageName = tmpCurrentStep.Title;
            if ($scope.GamInputData.SelectedWorkFlow != undefined && $scope.GamInputData.SelectedWorkFlow.WorkflowTitel != '' && $scope.GamInputData.SelectedWorkFlow.WorkflowTitel != undefined)
                $scope.Prop.CurrentPageName = $scope.Prop.CurrentPageName.replace('پروانه', $scope.GamInputData.SelectedWorkFlow.WorkflowTitel);
            //---------------------------------------------------------------------------1
            if (tmpCurrentStep.Name == EumPage.WorkFlow) {
                $scope.Functions.Gam3Func.GetWorkFlowList();
                $scope.Functions.Gam3Func.GetAllWorkFlowList();
                $scope.Quize.GetWorkFlowQuestion();

                //اینجا پاک میشه تا از طریق دکمه انتخاب شود و پیش فرض به گام بعدی نرود
                $scope.GamInputData.SelectedWorkFlow = {};

                $scope.Functions.GetNahadList();
            }
            //---------------------------------------------------------------------------2
            if (tmpCurrentStep.Name == EumPage.Select || tmpCurrentStep.Name == EumPage.SelectNo) {
                LoadMap();
                LoadNosaziCode($scope.GamInputData.CurrentNosaziCode);

                //باید قبل از انتخاب نوع پروانه ست شود
                if (ClsMenu != undefined) {
                    if (ClsMenu.NidWorkflowDeff != undefined)
                        $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff = ClsMenu.NidWorkflowDeff;
                    if (ClsMenu.Caption != undefined)
                        $scope.GamInputData.SelectedWorkFlow.WorkflowTitel = ClsMenu.Caption;

                    if (ClsMenu.Archive_NidEntity != undefined)
                        $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = ClsMenu.Archive_NidEntity;
                }

                $scope.GamInputData.MenuID = getParameterByName('ID');
            }
            if (tmpCurrentStep.Name == EumPage.SelectNo) {
                LoadMap();
                if (ClsMenu != undefined) {
                    if (ClsMenu.NidWorkflowDeff != undefined)
                        $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff = ClsMenu.NidWorkflowDeff;
                    if (ClsMenu.Caption != undefined)
                        $scope.GamInputData.SelectedWorkFlow.WorkflowTitel = ClsMenu.Caption;
                    if (ClsMenu.Archive_NidEntity != undefined)
                        $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = ClsMenu.Archive_NidEntity;
                }
                MyMap.SetDarwingCallBack(SetSelectionChange);
            }
            function SetSelectionChange(p) {

                $scope.GamInputData.Wkt = p;
                alert('محدوده انتخاب شد');
            }
            //---------------------------------------------------------------------------3
            //---------------------------------------------------------------------------5
            if (tmpCurrentStep.Name == EumPage.Upload) {

                if ($scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff == undefined) {
                    $scope.GamInputData.SelectedWorkFlow = { NidWorkflowDeff: NidWorkFlowDeff_Parvaneh, WorkflowTitel: 'ثبت درخواست پروانه ساختمانی' };
                }

                UploadPlugin.LoadObj($scope.GamInputData.SelectedWorkFlow.Archive_NidEntity);
                //باید در این مرحله باشد تا کد منطقه هم داشته باشیم 
                $scope.Functions.Gam3Func.SelectUserOfWorkFlow();
            }
            if (tmpCurrentStep.Name == EumPage.UploadNewNosazi) {

                if ($scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff == undefined) {
                    $scope.GamInputData.SelectedWorkFlow = { NidWorkflowDeff: NidWorkFlowDeff_Parvaneh, WorkflowTitel: 'ثبت درخواست پروانه ساختمانی' };
                }
                LoadLastUploadedFile = false;
                if ($scope.GamInputData.HaveNosaziCode)
                    UploadPlugin.LoadObj($scope.GamInputData.SelectedWorkFlow.Archive_NidEntity);
                else
                    UploadPlugin.LoadObjNewNosazi($scope.GamInputData.SelectedWorkFlow.Archive_NidEntity);

                //باید در این مرحله باشد تا کد منطقه هم داشته باشیم 
                $scope.Functions.Gam3Func.SelectUserOfWorkFlow();
            }


            if (tmpCurrentStep.Name == EumPage.SelectBazdid) {
                $scope.GamInputData.ShowRevisitAgentName = (typeof (ShowRevisitAgentName) == 'undefined' ? true : ShowRevisitAgentName);
                $scope.GamInputData.ShowRevisitAgentTell = (typeof (ShowRevisitAgentTell) == 'undefined' ? true : ShowRevisitAgentTell);

                DateBazdidPlugin.LoadCalender();
            }
            if (tmpCurrentStep.Name == EumPage.Avarez) {

                $scope.GamInputData.CalculateDarAmad = ClaculateDarAmad;
                if (tmpCurrentStep.CalculateDarAmad != undefined)
                    $scope.GamInputData.CalculateDarAmad = tmpCurrentStep.CalculateDarAmad;

                if (tmpCurrentStep.AlwaysCalculate == true)
                    $scope.GamInputData.AlwaysCalculate = true;
                else
                    $scope.GamInputData.AlwaysCalculate = false;

                $scope.GamInputData.ShowFicheNosazi = true;

                ////فعلا برداشته شد تا معلوم شود برای کدام شهر است 
                FishFunc.LoadFich();
                ////#1231
                //if ($scope.GamInputData.Owner2 != true)
                //    FishFunc.LoadFich();
                //else
                //    GamPlugin.nextStepWithOutCheck();
            }
            if (tmpCurrentStep.Name == EumPage.SaveRequest) {
                if ($scope.GamInputData.NidWorkItem > 0)
                    $('#btnPre').hide();

                //if ($scope.Prop.WorkflowList == null && $scope.GamInputData.SelectedWorkFlow.AssignUser == undefined) {
                //    $scope.Functions.Gam3Func.SelectWorkFlowForAssignUser();
                //}

                if ($scope.GamInputData.SelectedWorkFlow.AssignUser == undefined) {
                    $scope.Functions.Gam3Func.SelectWorkFlowForAssignUser();
                }
            }

            if (tmpCurrentStep.Name == EumPage.ElamZabete) {

                if (!FishFunc.CheckPayFish()) {
                    $scope.Prop.ErrorMessage = "عوارض به طور کامل پرداخت نشده است .";
                    $('#divExport').detach();
                    $('#btnPre').show();
                }
                else
                    $('#divExport').show();

                if ($scope.GamInputData.IsExport == true) {
                    $('#btnExport').hide();
                    var tmpBizCode = $scope.GamInputData.NidProc;
                    $scope.Functions.LoadInqueryArchive(tmpBizCode);
                }
            }


            if (tmpCurrentStep.Name == EumPage.Export) {

                if (!FishFunc.CheckPayFish()) {
                    $scope.Prop.ErrorMessage = "عوارض به طور کامل پرداخت نشده است .";
                    $('#divExport').detach();
                    $('#btnPre').show();
                }
                else
                    $('#divExport').show();

                if ($scope.GamInputData.IsExport == true) {
                    $('#btnExport').hide();
                    var tmpBizCode = $scope.GamInputData.NidProc;
                    $scope.Functions.LoadInqueryArchive(tmpBizCode);
                }
            }

            if (tmpCurrentStep.Name == EumPage.ShFani) {
                $('#divShFani').show();
                $scope.GetOwnerZabetehComment();
                $scope.Functions.Gam5Func_Upload.LoadArchiveForSendDoc(GetScope().GamInputData.ArchiveBizCode, '#divUploaderSend', 'ارسال مدارک به شهرساز');
                $('#btnNext').prop('disabled', false);
                $scope.Functions.ShowArchive();
            }
            if (tmpCurrentStep.Name == EumPage.ShZabete || tmpCurrentStep.Name == EumPage.ShZabeteYazd) {
                if ($('.tablinks')[0] != undefined)
                    $('.tablinks')[0].className += " active";

                //Then  $scope.GetOwnerZabetehComment();
                $scope.Functions.LoadZabeteh();

                rwClick($scope.GamInputData.rw);

                if (tmpCurrentStep.Name == EumPage.ShZabeteYazd) {
                    //   $scope.Functions.CalculateZabeteh_AndSave();
                }
            }

            if (tmpCurrentStep.Name == EumPage.AvarezDaramad) {

                $scope.GamInputData.ShowFicheDarAmad = false;
                $scope.GamInputData.ShowFichePasmand = false;
                $scope.GamInputData.ShowFicheNosazi = false;
                $scope.GamInputData.ShowFicheAvarezDarAmad = true;
                $scope.GamInputData.CalculateDarAmad = false;
                ClaculateDarAmad = false;

                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
                FishFunc.LoadFich();
            }
            if (tmpCurrentStep.Name == EumPage.Estelam) {
                SendSMSGam(6);
            }

            if (tmpCurrentStep.Name == EumPage.Zavabet) {
                $scope.Functions.EstelamzabeteCrowd();
                $scope.GetOwnerZabetehComment();
            }
            if (tmpCurrentStep.Name == EumPage.Tavafoghat) {
                if ($scope.GamInputData.rw != 2) {
                    if (typeof (isPreStep) != 'undefined' && isPreStep == true)
                        GamPlugin.preStep();
                    else
                        GamPlugin.nextStepWithOutCheck();
                }
                else {
                    $scope.Prop.ErrorMessage = 'پرونده شما در مرحله توافقات شهرسازی قرار دارد، نتایج توافقات بزودی اعلام خواهد شد';
                    $scope.Functions.GetTavafoghat();
                }
            }
            if (tmpCurrentStep.Name == EumPage.Engineer) {
                $scope.EngFunc.GetEnginner();
            }
            if (tmpCurrentStep.Name == EumPage.EngineerInfo) {//Yazd
                $scope.EngFunc.GetEngInfo();
            }
            if (tmpCurrentStep.Name == EumPage.EngineerQuata) {
                $scope.EngFunc.GetEnginnerQuata();
            }


            if (tmpCurrentStep.Name == EumPage.EngineerYazdDafater) {
                $scope.EngFunc.GetEngineerYazdDafater();
                $scope.EngFunc.GetOffice();
            }

            if (tmpCurrentStep.Name == EumPage.Taahodat) {
                $scope.Functions.GamTahodatFunc.GetCommitmentCitizen();
                $scope.Functions.GamTahodatFunc.GetUGPFormName();
            }
            if (tmpCurrentStep.Name == EumPage.Commission) {
                $scope.LoadLetter();
                $('#btnPre').hide();

                openCity(event, 'DivCommission');
                $('#t1').addClass('active');
            }
            if (tmpCurrentStep.Name == EumPage.Mokatebat) {

                if (tmpCurrentStep.IsNew != undefined && tmpCurrentStep.IsNew == true)
                    $scope.GamInputData.IsNew = true;

                $scope.LoadLetter();
            }
            if (tmpCurrentStep.Name == "MokatebatDastoor") {

                if (tmpCurrentStep.IsNew != undefined && tmpCurrentStep.IsNew == true)
                    $scope.GamInputData.IsNew = true;

                $scope.LoadLetter();
            }


            if (tmpCurrentStep.Name == EumPage.MapControl) {
                $scope.Functions.LoadMapControl();
            }

            if (tmpCurrentStep.Name == EumPage.GetNewNosaziCode) {
                $scope.Functions.GetNewNosaziCode();
            }

            if (tmpCurrentStep.Name == "POwner_EditType") {
                
                $UploaderCount = 0;

                if ($('#divUploaderEditOwner').children().length == 0)
                    UploadPlugin.GetBizCodeCallback(function (pBizCode) {
                        UploadPlugin.NidTag = tmpCurrentStep.NidTag;

                        var u2 = $('#divUploaderEditOwner').AsSafaArchiveUploder();
                        u2.LoadObj(pBizCode, UploadPlugin.Domain, {
                            UserName: ClsAccount.AccountInfo.FullName,
                            UserCode: ClsAccount.AccountInfo.NidAccount,
                            Multiply: true, NidTag: UploadPlugin.NidTag, SaveOrginalFile: (typeof (SaveOrginalFile) != 'undefined') ? SaveOrginalFile : true, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                            , Title: 'اطلاعات فیش نوسازی', IsRequire: true
                            , FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg"
                            , OnCompleteUpload: function (args, sender) {
                                UploadPlugin.AddNidFile(args.NidFile, true, '', args.OtherFiled);
                                $scope.GamInputData.POwner_Upload = true;
                            }
                        });
                    });

                $UploaderCount = 1;

                if ($scope.GamInputData.UGP_OwnerListOld == undefined) {
                    $scope.GamInputData.UGP_OwnerListOld = [];
                    $scope.GamInputData.UGP_OwnerListOld.push({

                        OwnerName: '',
                        OwnerLastName: '',
                        OwnerNationalCode: '',
                        OwnerMobile: '',
                        OwnerAddress: '',
                    });
                }
                if ($scope.GamInputData.UGP_OwnerListNew == undefined) {
                    $scope.GamInputData.UGP_OwnerListNew = [];
                    $scope.GamInputData.UGP_OwnerListNew.push({

                        OwnerName: '',
                        OwnerLastName: '',
                        OwnerNationalCode: '',
                        OwnerMobile: '',
                        OwnerAddress: '',
                        OwnerPostCode: '',
                    });
                }
            }

            if (tmpCurrentStep.Name == EumPage.PPayKarshenasi) {
                FishFunc.LoadFichKarshenasi();
                //FishFunc.GetCostKarshenasi();
            }
            //if (Curr

            //---------------------------------------------------------------------------5

            $scope.$apply();
        },

        AddOwnerOld: function () {

            $scope.GamInputData.UGP_OwnerListOld.push({
                OwnerName: '',
                OwnerLastName: '',
                OwnerNationalCode: '',
                OwnerMobile: '',
                OwnerAddress: '',
            });
        },
        RemoveOwnerOld: function (x) {

            dictionary = Enumerable.From($scope.GamInputData.UGP_OwnerListOld).ToDictionary();
            dictionary.Remove(x);
            $scope.GamInputData.UGP_OwnerListOld = dictionary.ToEnumerable().Select(s => s.Key).ToArray();
        },
        AddOwnerNew: function () {

            $scope.GamInputData.UGP_OwnerListNew.push({
                OwnerName: '',
                OwnerLastName: '',
                OwnerNationalCode: '',
                OwnerMobile: '',
                OwnerAddress: '',
                OwnerPostCode: '',
            });
        },
        RemoveOwnerNew: function (x) {

            dictionary = Enumerable.From($scope.GamInputData.UGP_OwnerListNew).ToDictionary();
            dictionary.Remove(x);
            $scope.GamInputData.UGP_OwnerListNew = dictionary.ToEnumerable().Select(s => s.Key).ToArray();
        },
        onNosaziCodeClick: function () {
            $scope.Functions.Gam2Func.CheckRequestValidity();
        },
        ///////////////////////////////////////Gam2
        Gam2Func: {
            inProgress: false,
            CheckRequestValidity: function () {
                if (this.inProgress)
                    return;

                this.inProgress = true;
                $scope.IsValidNosaziCode = false;
                $scope.Prop.ErrorMessage = '';
                //if (d6 > 0 || d5 > 0) {
                //    $scope.Prop.ErrorMessage = 'کد آپارتمان یا صنف را نمیتوانید وارد نمایید';
                //    return;
                //}
                var tmpNid = $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff;
                if (tmpNid == undefined)
                    tmpNid = NidWorkFlowDeff_Parvaneh;
                StartBusy1('در حال استعلام کد نوسازی');
                var d = { pCode: NosaziCode, pNidWorkItem: '', pNidWorkflowDeffNew: tmpNid, pNidAccount: ClsAccount.AccountInfo.NidAccount, pNationalCode: ClsAccount.AccountInfo.OwnerNationalCode, pelakType: $scope.GamInputData.SelectType };
                var c = JSON.stringify(d);
                var erMessage = 'کد نوسازی معتبر نمیباشد،خواهشمند است با در دست داشتن مدارک به شهرداری منطقه مراجعه فرمایید"';

                $request = $.ajax({
                    type: "POST",

                    url: ServiceAddress + "CheckRequestValidity",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {
                        try {
                            StopBusy1();
                            $scope.Functions.Gam2Func.inProgress = false;
                            var isErrorStop = false;
                            var tmpErrors = '';
                            $scope.GamInputData.NidNosaziCode = msg.RequestValidity.Sh_RequestInfo.NidNosaziCode;
                            if (msg.Base_Owner != null && msg.Base_Owner.length > 0) {
                                $scope.GamInputData.Base_Owner = msg.Base_Owner[0];
                                $scope.GamInputData.Base_Owner.Base_RegisterPlack = msg.Base_RegisterPlack;

                                if (msg.Base_Owner.length > 1 && msg.Base_Owner[0].ToftDang != 6)
                                    $scope.GamInputData.Owner2 = true;
                            }
                            $scope.GamInputData.ShowReport = msg.RequestValidity.ShowReport;

                            if (msg.ErrorResult.BizErrors.length > 0) {
                                $.each(msg.ErrorResult.BizErrors, function (index, value) {
                                    if (value.ErrorAction > -1 && value.ErrorKey !=1000) {
                                        if (value.ErrorTitel != '')
                                            tmpErrors += value.ErrorTitel + '\r\n';
                                    }
                                    if (value.ErrorAction == 0)//Stop
                                        isErrorStop = true;
                                });

                                if (isErrorStop == true) {
                                    $scope.Prop.ErrorMessage = tmpErrors;
                                    $scope.IsValidNosaziCode = false;
                                }
                                else {//warning
                                    $scope.Prop.ErrorMessage = tmpErrors;
                                }
                            }
                            else {

                                if (CheckBaygani == false || msg.RequestValidity.Sh_RequestInfo.EumRequestStatus == 2) {
                                    $scope.GamInputData.NidBase = msg.RequestValidity.NidBase;
                                    $scope.GamInputData.District = District1;
                                    $scope.GamInputData.Address = msg.RequestValidity.Sh_RequestInfo.RequesterAddress;
                                    $scope.GamInputData.EstateOwner = msg.RequestValidity.Sh_RequestInfo.RequesterName;
                                    $scope.GamInputData.NidNosaziCode = msg.RequestValidity.Sh_RequestInfo.NidNosaziCode;
                                    $scope.GamInputData.OldNidProc = msg.RequestValidity.Sh_RequestInfo.NidProc;
                                    $scope.GamInputData.CurrentNosaziCode = NosaziCode;
                                    //$scope.GamInputData.IsRequireBazdid = msg.RequestValidity.IsRequireBaziz;
                                    $scope.GamInputData.FloorDone = msg.Base_CommonEstate.FloorDone;

                                    $scope.GreenColor = true;
                                    $scope.Prop.ErrorMessage = "کد نوسازی معتبر می باشد , برای ادامه روند کار بر روی گام بعدی کلیک نمایید";
                                    $scope.IsValidNosaziCode = true;
                                    $scope.$apply();
                                    $scope.Functions.Estelamzabete(true);


                                }
                                else {
                                    $scope.GreenColor = false;
                                    //[Description("جاری")]
                                    //Current = 0,
                                    //[Description("موقت")]
                                    //Temporary = 1,
                                    //[Description("دائم")]
                                    //Permanent = 2,
                                    //[Description("حذف شده ها")]
                                    //Garbage = 3

                                    $scope.Prop.ErrorMessage = 'پرونده شما در شهرسازی باید به مرحله تایید و بایگانی رسیده باشد';
                                }
                            }

                            $scope.$apply();
                        }
                        catch (ex) {
                            $scope.Prop.ErrorMessage = 'خطایی در اطلاعات وجود دارد . لطفا با راهبر سیستم هماهنگ نمایید';
                            $scope.$apply();
                        }
                    },
                    error: function (c) {
                        $scope.Functions.Gam2Func.inProgress = false;
                        $scope.Prop.ErrorMessage = erMessage;
                        $scope.GreenColor = false;
                        StopBusy1();
                        GetScope().$apply();
                    }
                });
            },
            FillEngineerInfo: function () {
                var d = {
                    pNidNosazicode: $scope.GamInputData.NidNosaziCode,
                    pNidProc: $scope.GamInputData.NidProc,
                    pDomain: $scope.GamInputData.District
                };
                var c = JSON.stringify(d);

                $request = $.ajax({
                    type: "POST",
                    url: ServiceAddress + "FillEngineerInfo",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {
                        if (msg.FillEngineerInfo != null) {
                            if (msg.FillEngineerInfo.foundation != null)
                                $scope.GamInputData.foundation = msg.FillEngineerInfo.foundation;
                            if (msg.FillEngineerInfo.BuildingType != null)
                                $scope.GamInputData.BuildingType = msg.FillEngineerInfo.BuildingType;
                            if (msg.FillEngineerInfo.FloorDone != null)
                                $scope.GamInputData.FloorDone = msg.FillEngineerInfo.FloorDone;
                        }
                    },
                    error: function (c) {

                    }
                });
            },
            FillEngineerInfo2: function () {
                var d = {
                    pDistrict: $scope.GamInputData.District, pNidProc: $scope.GamInputData.NidProc,
                };
                var c = JSON.stringify(d);

                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "GetMapControl",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {
                        $scope.Functions.Gam2Func.FillEngineerInfo();
                    },
                    error: function (c) {
                        StopBusy('GridViewTarakom');
                    }
                });
            }
        },
        ///////////////////////////////////////Gam3

        Gam3Func: {
            GetGamList: function () {
                var tmpMenuSelected = Enumerable.From(GetScopeMenu().Menu[1].SubMenu).Where(function (x) {
                    return x.NidWorkflowDeff != undefined && x.NidWorkflowDeff.toLowerCase() == $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff.toLowerCase()
                }).FirstOrDefault();
                if (tmpMenuSelected != undefined && (typeof (WorkflowReadonly) != 'undefined' && WorkflowReadonly != true)) {
                    var tmpvar = getQueryVariable(window.location.search, 'ID');
                    var params = { 'ID': tmpMenuSelected.ID };
                    var NewUrl = window.location.href.replace(window.location.search, '');
                    var new_url = NewUrl + '?' + jQuery.param(params);

                    var NewKey = $scope.Config.ScopeName.replace('-ID' + getParameterByName("ID"), '-ID' + tmpMenuSelected.ID);
                    GamPlugin.CurrentStep++;
                    $scope.GamInputData.CurrentStep = GamPlugin.CurrentStep;

                    GamPlugin.SavelocalStorage(NewKey, $scope.GamInputData);
                    window.history.pushState("object or string", "Title", new_url);
                    GamPlugin.RemovelocalStorage($scope.Config.ScopeName);
                    location.reload();
                }
            },
            GetWorkFlowList: function () {
                $scope.Prop.ErrorMessage = null;

                $.ajax({
                    type: "POST",
                    url: "FrmParvaneh.aspx/GetWorkFlowList",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {

                        if ($scope.Functions.CheckError(msg)) {
                            $scope.Prop.WorkflowList = msg.d.WorkflowList;

                            var tmpNidWorkFlow = getParameterByName('NidWorkFlow');
                            if (tmpNidWorkFlow != null && tmpNidWorkFlow != '') {
                                $('#cmbWorkFlowDeff').prop('disabled', 'disabled');
                                $scope.GamInputData.SelectedWorkFlow = $scope.Prop.WorkflowList[tmpNidWorkFlow];
                            }
                            $scope.$apply();
                        }
                    },
                    error: function (c) {
                    }
                });
            },
            GetAllWorkFlowList: function () {


                $.ajax({
                    type: "POST",
                    url: "FrmParvaneh.aspx/GetAllWorkFlowList",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {


                        $scope.AllWorkflowList = msg.d.WorkflowList;
                        $scope.$apply();

                    },
                    error: function (c) {
                    }
                });
            },
            SelectUserOfWorkFlow: function () {
                try {
                    var tmpProcInitiator = '';
                    var tmpProcInitiatorUserName = '';

                    if ($scope.GamInputData.SelectedWorkFlow.AssignUser != undefined && $scope.GamInputData.SelectedWorkFlow.AssignUser != '') {
                        var tmpAssignUserList = $scope.GamInputData.SelectedWorkFlow.AssignUser.split(',');
                        var tmpUserSelected = Enumerable.From(tmpAssignUserList)
                            .Where(function (x) { return x.split(':')[0] == $scope.GamInputData.District }).FirstOrDefault();

                        if (tmpUserSelected != null && tmpUserSelected != undefined)
                            tmpProcInitiator = tmpUserSelected.split(':')[1];
                        tmpProcInitiatorUserName = '';

                        var FormIndex = Enumerable.From(GamsArray)
                            .Where(function (x) { return x.Name == EumPage.JobLocation })
                            .Select(function (x) { return x.Index }).FirstOrDefault();

                        GamPlugin.removeStep = FormIndex - 1;
                        $scope.GamInputData.removeStep = GamPlugin.removeStep;
                    }
                    $scope.GamInputData.ProcInitiator = tmpProcInitiator,
                        $scope.GamInputData.ProcInitiatorUserName = tmpProcInitiatorUserName;

                    if ($scope.GamInputData.SelectedWorkFlow.ArchiveEntity != undefined)
                        Archive_NidEntityParvaneh = $scope.GamInputData.SelectedWorkFlow.ArchiveEntity;

                }
                catch (ex) { }
            },
            SelectWorkFlowForAssignUser: function () {
                $scope.Prop.ErrorMessage = null;
                StartBusy1();
                $.ajax({
                    type: "POST",
                    url: "FrmParvaneh.aspx/GetAllWorkFlowList",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        StopBusy1();
                        if ($scope.Functions.CheckError(msg)) {
                            $scope.Prop.AllWorkflowList = msg.d.WorkflowList;

                            var tmpNidWorkFlow = $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff;

                            try {
                                var tmpSelectW = Enumerable.From($scope.Prop.AllWorkflowList)
                                    .Where(
                                        function (x) { return x.NidWorkflowDeff.toLowerCase() == tmpNidWorkFlow.toLowerCase() }).FirstOrDefault();
                            }
                            catch (ex) { }

                            if (tmpSelectW != null && tmpSelectW.AssignUser != null) {
                                $scope.GamInputData.SelectedWorkFlow.AssignUser = tmpSelectW.AssignUser;

                                var tmpAssignUserList = $scope.GamInputData.SelectedWorkFlow.AssignUser.split(',');
                                var tmpUserSelected = Enumerable.From(tmpAssignUserList)
                                    .Where(
                                        function (x) {
                                            return x.split(':')[0] == $scope.GamInputData.District
                                        }).FirstOrDefault();

                                if (tmpUserSelected != null && tmpUserSelected != undefined) {
                                    tmpProcInitiator = tmpUserSelected.split(':')[1];
                                    $scope.GamInputData.ProcInitiator = tmpProcInitiator;
                                }
                            }


                            $scope.$apply();
                        }
                    },
                    error: function (c) {
                    }
                });
            },
        },
        Gam5Func_Upload: {
            AddNidFileLetter: function (pArchiveNidFile, pNidNidOfficeLetter, pIsDwg = false) {

                if (pIsDwg != true)
                    $scope.GamInputData.MustUploadLetterCount++;

                $scope.$apply();
                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);

                var d = { pNidNidOfficeLetter: pNidNidOfficeLetter, pArchiveNidFile: pArchiveNidFile, pDistrict: $scope.GamInputData.District };
                var c = JSON.stringify(d);
                $request = $.ajax({
                    type: "POST",
                    url: ServiceAddress + "UpdateUploadTime",
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
            },
            AddNidFileLetterCom: function (pArchiveNidFile, pNidNidOfficeLetter, pIsDwg = false) {

                $scope.GamInputData.MustUploadLetterCountCom++;


                $('#btnSendToShahrsazCom').show();


                $scope.$apply();
                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);

                var d = { pNidNidOfficeLetter: pNidNidOfficeLetter, pArchiveNidFile: pArchiveNidFile, pDistrict: $scope.GamInputData.District };
                var c = JSON.stringify(d);
                $request = $.ajax({
                    type: "POST",
                    url: ServiceAddress + "UpdateUploadTime",
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
            },
            AddNidFileLetterNew: function (pArchiveNidFile, pNidNidOfficeLetter, tmpNidTag) {

                $scope.GamInputData.MustUploadLetterCountNew++;

                $scope.$apply();
                GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);

                var d = { pNidNidOfficeLetter: pNidNidOfficeLetter, pArchiveNidFile: pArchiveNidFile, pDistrict: $scope.GamInputData.District };
                var c = JSON.stringify(d);
                $request = $.ajax({
                    type: "POST",
                    url: ServiceAddress + "UpdateUploadTime",
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


                
                var d = { pDistrict: $scope.GamInputData.District, pNidWorkItem: $scope.GamInputData.NidWorkItem, pBizCodeArchive: $scope.GamInputData.ArchiveBizCode, pArchive_NidEntity: tmpNidTag };
                var c = JSON.stringify(d);
                $request = $.ajax({
                    type: "POST",
                    url: "UTransferGam.aspx/" + "ChangeArchiveFolder",
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
            },

            LoadArchiveForSendDoc: function (pNewBizCode, Pname, pTitle) {

                $(Pname).empty();
                var tmpNidTag = Archive_NidEntitySend;
                var Domain = $scope.GamInputData.District;
                var u1 = $(Pname).AsSafaArchiveUploder();
                u1.LoadObj(pNewBizCode, Domain, {
                    UserName: ClsAccount.AccountInfo.FullName,
                    UserCode: ClsAccount.AccountInfo.NidAccount,
                    FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg",
                    Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                    , Title: pTitle, IsRequire: true
                    , OnCompleteUpload: function (args, sender) {
                        $scope.Functions.ShowArchive();
                        $scope.GamInputData.UploadShFaniOk = true;
                        GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
                        $scope.Functions.Gam5Func_Upload.AddNidFile(args.NidFile, args.IsRequire);
                    }
                });
            },
        },

        ///////////////////////////////////////Gam3

        //-------------------------------------------Gam5

        //-------------------------------------------Gam7
        Gam7Func: {
            SaveRequest: function (event, x) {
                var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];

                if (!(typeof ClsSMS === "undefined") && ClsSMS.ConfirmCodeOk != true && $scope.GamInputData.ConfirmCodeOk != true
                    && (typeof DontCheckSMS == 'undefined' || (typeof DontCheckSMS != 'undefined' && DontCheckSMS == false))) {
                    $scope.Prop.ErrorMessage = 'کد تاییدیه صحیح نمی باشد';
                    return
                }
                $scope.Prop.ErrorMessage = '';
                var CurrentDate = GetCurrentEnDate();
                if ($scope.GamInputData.BazdidDate != '') {
                    var tmpSplit = $scope.GamInputData.BazdidDate.split('/');
                    var tmpDate = ToGregorian(parseInt(tmpSplit[0]), parseInt(tmpSplit[1]), parseInt(tmpSplit[2]));
                    if (tmpDate < CurrentDate) {
                        $scope.Prop.ErrorMessage = "تاریخ مامور بازدید گذشته است . دوباره انتخاب نمایید";
                        return;
                    }
                }

                //در صورتی که در گردشکار کاربر ایجاد کننده درخواست تعریف شده بود 
                //نام مامور بازدید به عنوان کاربر ثبت نمیشود 

                if ($scope.GamInputData.SelectedWorkFlow.AssignUser == undefined || $scope.GamInputData.SelectedWorkFlow.AssignUser == ''
                    || $scope.GamInputData.ProcInitiator == undefined || $scope.GamInputData.ProcInitiator == '') {
                    if ($scope.GamInputData.Sh_RevisitAgentRandom != null && $scope.GamInputData.Sh_RevisitAgentRandom.NidRevisitAgent != undefined) {
                        $scope.GamInputData.ProcInitiator = $scope.GamInputData.Sh_RevisitAgentRandom.NidUser;
                        $scope.GamInputData.ProcInitiatorUserName = $scope.GamInputData.Sh_RevisitAgentRandom.Name + ' ' + $scope.GamInputData.Sh_RevisitAgentRandom.LastName;
                    }
                }
                if ($scope.GamInputData.ProcInitiator == undefined || $scope.GamInputData.ProcInitiator == '')
                    $scope.GamInputData.ProcInitiator = '00000000-0000-0000-0000-000000000000';

                if (tmpCurrentStep.DontAddRevisitAgent != undefined) {
                    $scope.GamInputData.DontAddRevisitAgent = tmpCurrentStep.DontAddRevisitAgent;
                }

                if (GetScope().GamInputData.LetterDate == '' || GetScope().GamInputData.LetterDate == undefined)
                    GetScope().GamInputData.LetterDate = $('#txtLetterDate').val();

                if (GetScope().GamInputData.LetterDate == '' || GetScope().GamInputData.LetterDate == undefined)
                    GetScope().GamInputData.LetterDate = $('#txtLetterDateS').val();

                if (GetScope().GamInputData.LetterDate == '' || GetScope().GamInputData.LetterDate == undefined)
                    GetScope().GamInputData.LetterDate = $('#txtLetterDateS1').val();

                if (GetScope().GamInputData.MandateDate == '' || GetScope().GamInputData.MandateDate == undefined)
                    GetScope().GamInputData.MandateDate = $('#txtLetterDateV').val();

                $scope.GamInputData.NidAccount = ClsAccount.AccountInfo.NidAccount;
                //#383  برای اصفهان برداشته شد
                //$scope.GamInputData.Comment += "\r\n" + $scope.GamInputData.SelectedWorkFlow.WorkflowTitel;

                if (typeof (AddCommentTask) == 'undefined' || AddCommentTask != false && ($scope.GamInputData.SelectedWorkFlow.WorkflowTitel != undefined && $scope.GamInputData.SelectedWorkFlow.WorkflowTitel != ''))
                    $scope.GamInputData.CommentTask = $scope.GamInputData.SelectedWorkFlow.WorkflowTitel;

                //برای درخواست کد نوسازی شیراز
                if ($scope.GamInputData.HaveBuilding)
                    $scope.GamInputData.CommentTask += "\r\n" + 'ملک دارای ساختمان است';

                if ($scope.GamInputData.DocType != undefined)
                    $scope.GamInputData.CommentTask += "\r\n" + 'نوع سند:' + $scope.GamInputData.DocType;

                if ($scope.GamInputData.HaveSanad)
                    $scope.GamInputData.CommentTask += "\r\n" + 'پلاک ثبتی:' + $scope.GamInputData.RegisterPelakAsli + '/' + $scope.GamInputData.RegisterPelakFaree + '/' + $scope.GamInputData.RegisterPelakBakhsh;


                if ($scope.GamInputData.SelectedWorkFlow.WorkflowTitel != undefined)
                    $scope.GamInputData.Comment += "\r\n" + $scope.GamInputData.SelectedWorkFlow.WorkflowTitel;


                if ($scope.GamInputData.FullLable != undefined && $scope.GamInputData.FullLable != '')
                    $scope.GamInputData.CommentTask += "\r\n" + $scope.GamInputData.FullLable;


                if ($scope.GamInputData.EditName == true) {

                    if ($scope.GamInputData.UGP_OwnerListOld.length > 0) {

                        $scope.GamInputData.Comment += "\r\n" + ' نام مالک قدیم :  ';
                        $scope.GamInputData.Comment += $scope.GamInputData.UGP_OwnerListOld[0].OwnerName;
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[0].OwnerLastName;

                        $scope.GamInputData.Comment += "  |  " + ' کد ملی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[0].OwnerNationalCode;

                        $scope.GamInputData.Comment += "  |  " + ' شماره همراه :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[0].OwnerMobile;

                        $scope.GamInputData.Comment += "  |  " + ' کد پستی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[0].OwnerPostCode;

                        $scope.GamInputData.Comment += "  |  " + ' آدرس :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[0].OwnerAddress;
                    }


                    if ($scope.GamInputData.UGP_OwnerListOld.length > 1) {

                        $scope.GamInputData.Comment += "\r\n" + ' نام مالک قدیم :  ';
                        $scope.GamInputData.Comment += $scope.GamInputData.UGP_OwnerListOld[1].OwnerName;
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[1].OwnerLastName;

                        $scope.GamInputData.Comment += "  |  " + ' کد ملی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[1].OwnerNationalCode;

                        $scope.GamInputData.Comment += "  |  " + ' شماره همراه :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[1].OwnerMobile;

                        $scope.GamInputData.Comment += "  |  " + ' کد پستی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[1].OwnerPostCode;

                        $scope.GamInputData.Comment += "  |  " + ' آدرس :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListOld[1].OwnerAddress;
                    }

                    ///***********************************************************************************************************

                    $scope.GamInputData.Comment += "\r\n" + "-------------------------------------------------------------" + "\r\n";

                    if ($scope.GamInputData.UGP_OwnerListNew.length > 0) {

                        $scope.GamInputData.Comment += "\r\n" + ' نام مالک جدید :  ';
                        $scope.GamInputData.Comment += $scope.GamInputData.UGP_OwnerListNew[0].OwnerName;
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[0].OwnerLastName;

                        $scope.GamInputData.Comment += "  |  " + ' کد ملی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[0].OwnerNationalCode;

                        $scope.GamInputData.Comment += "  |  " + ' شماره همراه :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[0].OwnerMobile;

                        $scope.GamInputData.Comment += "  |  " + ' کد پستی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[0].OwnerPostCode;

                        $scope.GamInputData.Comment += "  |  " + ' آدرس :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[0].OwnerAddress;
                    }


                    if ($scope.GamInputData.UGP_OwnerListNew.length > 1) {

                        $scope.GamInputData.Comment += "\r\n" + ' نام مالک جدید :  ';
                        $scope.GamInputData.Comment += $scope.GamInputData.UGP_OwnerListNew[1].OwnerName;
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[1].OwnerLastName;

                        $scope.GamInputData.Comment += "  |  " + ' کد ملی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[1].OwnerNationalCode;

                        $scope.GamInputData.Comment += "  |  " + ' شماره همراه :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[1].OwnerMobile;

                        $scope.GamInputData.Comment += "  |  " + ' کد پستی :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[1].OwnerPostCode;

                        $scope.GamInputData.Comment += "  |  " + ' آدرس :  ';
                        $scope.GamInputData.Comment += " " + $scope.GamInputData.UGP_OwnerListNew[1].OwnerAddress;
                    }



                }

                if ($scope.GamInputData.EditFich == true)
                    $scope.GamInputData.Comment += "\r\n" + 'تغییر اطلاعات فیش نوسازی';



                //shiraz 1109
                if (typeof (AddCommentTask) == 'undefined' || AddCommentTask != false && $scope.GamInputData.CommentTask == '')
                    $scope.GamInputData.CommentTask = $scope.GamInputData.Comment;

                if (GetScope().GamInputData.G5r1 != undefined && GetScope().GamInputData.G5r1 != '') {
                    $scope.GamInputData.CommentTask += '\r\n نوع استعلام : ' + GetScope().GamInputData.G5r1;
                }
                if ($scope.GamInputData.UGP_Owner_Comment != undefined)
                    $scope.GamInputData.CommentTask = $scope.GamInputData.UGP_Owner_Comment;


                if ($scope.GamInputData.NidBase == '') {
                    $scope.GamInputData.NidBase = '00000000-0000-0000-0000-000000000000';
                    $scope.GamInputData.NidNosaziCode = '11041298-6050-435F-B863-FDC966021ADB';//for shiraz


                    if (typeof (NewNidNosaziCode) != 'undefined')
                        $scope.GamInputData.NidNosaziCode = NewNidNosaziCode;

                    //$scope.GamInputData.Nahad = $scope.GamInputData.OwnerName;

                    if ($scope.GamInputData.OwnerName != undefined)
                        $scope.GamInputData.Comment += "\r\n" + 'نام مالک:' + $scope.GamInputData.OwnerName;
                }
                if ($scope.GamInputData.CurrentNosaziCode == '') {
                    $scope.GamInputData.HideCurrentNosaziCode = true;
                    var d = $scope.GamInputData.District;
                    $scope.GamInputData.CurrentNosaziCode = d + '-1000-1000-1000-0-0-0';
                }

                $scope.GamInputData.ArchiveEntity = $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity;

                if ($scope.GamInputData.QuestionnaireDetailFinal != undefined)
                    $scope.GamInputData.CI_ShahrsazRequestType = $scope.GamInputData.QuestionnaireDetailFinal.CI_ShahrsazRequestType;

                if ($scope.GamInputData.CI_DocType != undefined && $scope.GamInputData.CI_DocType != null)
                    $scope.GamInputData.Comment += "\r\n" + 'نوع سند : ' + $scope.GamInputData.CI_DocType.Title + "/" + $scope.GamInputData.DocType;

                if ($scope.GamInputData.NosaziReasionsString != null && $scope.GamInputData.NosaziReasionsString.length > 0)
                    $scope.GamInputData.Comment += "\r\n" + $scope.GamInputData.NosaziReasionsString;

                var d = {
                    pInputData: $scope.GamInputData, PRequestType: 4
                }

                var c = JSON.stringify(d);
                StartBusyCheckMark('mybody', '<p> درحال بررسی سوابق مدارک در سیستم شهرسازی' + '</p>' +
                    '<p>درحال محاسبه بدهی عوارض نوسازی' + '</p>' +
                    '<p> درحال ثبت درخواست ' + '</p>' +

                    '<p style="Color:Red">در حال انجام کنترل های نهایی ، جهت ثبت درخواست .... </p>'
                );

                $.ajax({
                    type: "POST",
                    url: "UTransferGam.aspx/StepSaveRequest",
                    data: c,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        StopBusyCheckMark('mybody');
                        AfterSaveRequest(response, !$scope.GamInputData.DontAddRevisitAgent);

                        //بعد از ثبت درخواست این اطلاعات دریافت میشود 
                        $scope.Functions.Gam2Func.FillEngineerInfo2();

                        if ($scope.GamInputData.Wkt != undefined && $scope.GamInputData.Wkt != '') {
                            $scope.Functions.SaveWkt();
                        }
                    },
                    failure: function (response) {
                        $scope.GamInputData.Comment = "";
                        StopBusyCheckMark('mybody');
                        $scope.Prop.ErrorMessage = 'اطلاعات وارد شده اشتباه است . لطفا مجددا اقدام نمایید';
                        $scope.$apply();
                    },
                    error: function (c) {
                        $scope.GamInputData.Comment = "";

                        StopBusyCheckMark('mybody');
                        if (c.responseText.indexOf('Cannot convert null to a value type') > -1
                            || c.responseText.indexOf('Unrecognized Guid format') > -1
                        ) {
                            $scope.Prop.ErrorMessage = 'اطلاعات وارد شده اشتباه است . لطفا مجددا اقدام نمایید';
                            $scope.$apply();
                        }
                    }
                });
            },
        },

        CheckError: function (msg) {
            if (msg.d != undefined)
                msg = msg.d;
            if (msg.ErrorResult.BizErrors.length > 0) {
                $scope.Prop.ErrorMessage = msg.ErrorResult.BizErrors[0].ErrorTitel;
                $scope.$apply();
                return false;
            }
            else {
                return true;
            }
        },
        ExportInquery: function () {

            $scope.Prop.ErrorMessage = "";
            // $scope.$apply();
            if ($scope.GamInputData.SelectedWorkFlow.Archive_NidEntity == undefined)
                $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity = Archive_NidEntityParvaneh;

            var d = {
                pNosaziCode: $scope.GamInputData.CurrentNosaziCode,
                NidProc: $scope.GamInputData.NidProc,
                NidAccount: ClsAccount.AccountInfo.NidAccount,
                ReportName: $scope.GamInputData.ReportName != undefined ? $scope.GamInputData.ReportName : '',
                pBizCodeArchive: $scope.GamInputData.ArchiveBizCode,
                pArchive_NidEntity: $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity
            }

            var c = JSON.stringify(d);
            StartBusy('divExport', 'در حال صدور گواهی ');
            $.ajax({
                type: "POST",
                url: "UStepGam.aspx/ExportInqueryWithChangeArchive",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    StopBusy('divExport');
                    if (response.d.ErrorResult.BizErrors.length > 0) {
                        $scope.Prop.ErrorMessage = response.d.ErrorResult.BizErrors[0].ErrorTitel;
                    }
                    else if (response.d.ErrorResult.HasErrors == false) {
                        var tmpBizCode = $scope.GamInputData.NidProc;
                        $scope.Functions.LoadInqueryArchive(tmpBizCode);
                        $scope.GamInputData.NidProc = $scope.GamInputData.NidProc;
                        $('#divShowArchive').show();
                        $('#btnExport').hide();
                        $scope.GreenColor = true;
                        $scope.GamInputData.IsExport = true;
                        GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);

                        if (typeof (ExportMessage) == 'undefined')
                            $scope.Prop.ErrorMessage = "مالک محترم شماره درخواست ملک " + $scope.GamInputData.NidWorkItem + " می باشد.خواهشمند است جهت طراحی و بارگذاری نقشه های ساختمانی خود ، شماره درخواست را در اختیار طراح خود قرار دهید ";
                        else
                            $scope.Prop.ErrorMessage = ExportMessage;

                        GamPlugin.ResetGam();
                    }
                    else {
                        $scope.Prop.ErrorMessage = ExportInquiryErrorMessage;
                        $scope.GreenColor = false;
                    }

                    $scope.$apply();
                },
                failure: function (response) {
                    StopBusy('divExport');
                },
                error: function (response) {
                    StopBusy('divExport');
                    $scope.Prop.ErrorMessage = "خطا در ارسال اطلاعات";
                    $scope.GreenColor = false;
                    $scope.$apply();
                }
            });

            $scope.$apply();
        },
        LoadInqueryArchive: function (NidProc) {

            var ObjSafaArchive = $('#divArchiveCert').AsSafaArchive();
            ObjSafaArchive.LoadObj(NidProc, 'ApprovalCertificate', 1, {
                backgroundColor: 'rgb(170, 219, 170)',
                FullpageBgColor: 'rgb(170, 219, 170)',
                thumbnailGutterHeight: 10,
                thumbnailGutterWidth: 5,
                colorScheme: {
                    navigationbar: { background: 'yellow', border: '1px dotted #00cc00', color: 'black', colorHover: '#fff' },
                    thumbnail: {
                        background: 'rgb(180, 230, 190)',
                        border: '1px solid yellow',
                        labelBackground: 'rgba(242, 242, 219, 0.33);',
                        titleColor: 'darkgreen',
                        descriptionColor: '#ccc',
                        descriptionShadow: '',
                        paginationDotBorder: '2px solid #0c0',
                        paginationDotBack: '#008500',
                        paginationDotSelBack: '#0c0'
                    }
                }
            });
            StartBusyTimer('divExport');
        },
        OnCheckedChanges: function (pWorkFlow) {
            $scope.GamInputData.WorkFlowComments = [];
            if (pWorkFlow.Comments != null && pWorkFlow.Comments != undefined) {
                var List = pWorkFlow.Comments.split(';');
                if (List.length > 1)
                    $.each(List, function (key, value) {
                        $scope.GamInputData.WorkFlowComments.push({ Name: value, IsChecked: false });
                    });
            }
            if (SelectWorkFlowDeffByCombo)
                $scope.GamInputData.SelectedWorkFlow = pWorkFlow;
        },

        Estelamzabete: function (pWithCheck) {
            // $scope.Prop.ErrorMessage = '';

            $scope.ZabetehDetails = null;
            $scope.ZabetehChideman = null;

            StartBusy('GridViewTarakom', 'در حال دریافت اطلاعات کاربری');
            var d = { pCode: $scope.GamInputData.CurrentNosaziCode };
            var c = JSON.stringify(d);

            $scope.myVar = false;
            $scope.isBusy = true;
            $scope.MapInfo = null;

            $scope.$apply();

            $request = $.ajax({
                type: "POST",
                url: ServiceAddress + "GetZabeteh_MapInfoAndPlan",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('GridViewTarakom');
                    $scope.isBusy = false;


                    if (pWithCheck) {
                        if (msg.ErrorResult.BizErrors.length > 0 && msg.ErrorResult.BizErrors[0].ErrorAction == 1)//Stop 
                            $scope.Prop.ErrorMessageZabeteh = msg.ErrorResult.BizErrors[0].ErrorTitel;
                    }
                    $scope.Base_PlanMosavab = msg.Base_PlanMosavab;
                    $scope.Base_PlanMojaz = msg.Base_PlanMojaz;
                    $scope.MapInfo = msg.MapInfo;
                    $scope.myVar = !$scope.myVar;

                    $(".LowOpacity").css("opacity", "1");

                    $scope.$apply();

                },
                error: function (c) {
                    $scope.isBusy = false;
                    $scope.MapInfo = null;
                    $scope.$apply();
                    //  $scope.Prop.ErrorMessage = "خطا در اجرای سرویس";
                }
            });
        },
        Estelamzabete2: function () {
            $scope.Prop.ErrorMessage = '';
            document.getElementById("divZavabeh").style.display = "block";

            // $('divZavabeh').css("visibility", 'visible');

            StartBusy('CtlZabtehId', '');
            var d = { pCode: $scope.GamInputData.CurrentNosaziCode };
            var c = JSON.stringify(d);
            $scope.Prop.ErrorMessage = null;

            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetZabeteh_DetailsAndChideman",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('CtlZabtehId');
                    if (msg.ErrorResult.BizErrors.length > 0)
                        $scope.Prop.ErrorMessage = msg.ErrorResult.BizErrors[0].ErrorTitel;
                    else {
                        $scope.Base_FrontList = msg.ZabetehChideman.Base_FrontList;
                        $scope.Base_UsingList = msg.ZabetehChideman.Base_UsingList;
                        $scope.ZabetehChideman = msg.ZabetehChideman;

                        $scope.ZabetehDetails = msg.ZabetehDetails;

                    }
                    //$scope.ParvanehAnalysis = msg.ParvanehAnalysis;

                    //var total = 0;
                    //for (var i = 0; i < $scope.ParvanehAnalysis.IncomeParvaneh.length; i++) {
                    //    var product = $scope.ParvanehAnalysis.IncomeParvaneh[i];
                    //    total += Number(product.CalcValue);
                    //}
                    //$scope.SumPrice = total;14006027

                    $scope.$apply();
                },
                error: function (c) {
                    $scope.Prop.ErrorMessage = "خطا در اجرای سرویس";
                }
            });
        },
        EstelamzabeteCrowd: function () {
            $scope.Prop.ErrorMessage = '';
            document.getElementById("divZavabeh").style.display = "block";
            StartBusy('CtlZabtehId', '');
            var d = { pCode: $scope.GamInputData.CurrentNosaziCode };
            var c = JSON.stringify(d);
            $scope.Prop.ErrorMessage = null;

            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetZabeteh",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('CtlZabtehId');
                    if (msg.ErrorResult.BizErrors.length > 0)
                        $scope.Prop.ErrorMessage = msg.ErrorResult.BizErrors[0].ErrorTitel;
                    else {
                        $scope.Base_FrontList = msg.ZabetehChideman.Base_FrontList;
                        $scope.Base_UsingList = msg.ZabetehChideman.Base_UsingList;
                        $scope.ZabetehChideman = msg.ZabetehChideman;
                        $scope.ZabetehDetails = msg.ZabetehDetails;
                    }

                    $scope.$apply();
                },
                error: function (c) {
                    $scope.Prop.ErrorMessage = "خطا در اجرای سرویس";
                }
            });
        },
        LoadZabeteh: function (x) {
            var d = {
                pDistrict: $scope.GamInputData.District,
                pNidProc: $scope.GamInputData.NidProc,
            }
            $('#Zabete').hide();
            $scope.Functions.LoadZabetehMapInfo();
            var c = JSON.stringify(d);
            StartBusy('divZabeteMain', 'در حال دریافت اطلاعات');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "LoadZabeteh",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {

                    if (response.ErrorResult.BizErrors.length > 0) {
                        $scope.Prop.ErrorMessage = 'شهروند گرامی اعلام ضابطه بروی درخواست شما از طرف شهرداری انجام نشده است';
                        $('#Zabete').hide();
                        $scope.$apply();
                        StopBusy('divZabeteMain');
                    }
                    else {
                        $scope.Functions.GetPlanOrder();

                        //$('#Zabete').show();
                        //$scope.Base_PlanMosavab = response.ZabetehLastRow.Base_PlanMosavabs[0];
                        //$scope.Base_PlanMojaz = response.ZabetehLastRow.Base_PlanMojazs[0];

                        //$scope.Base_UsingList = response.ZabetehLastRow.Base_Usings;
                        //$scope.Base_FrontList = response.ZabetehLastRow.Base_Front;
                        //$scope.GetOwnerZabetehComment();

                        //$scope.$apply();

                        //ReEvent();
                    }
                },
                failure: function (response) {
                    StopBusy('divZabeteMain');
                },
                error: function (response) {
                    StopBusy('divZabeteMain');
                }
            });
        },
        LoadZabetehMapInfo: function () {
            var d = { pCode: $scope.GamInputData.CurrentNosaziCode };
            var c = JSON.stringify(d);
            $scope.MapInfo = null;

            $request = $.ajax({
                type: "POST",
                url: ServiceAddress + "GetZabeteh_MapInfoAndPlan",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    $scope.MapInfo = msg.MapInfo;
                    $scope.Base_PlanMosavab = msg.Base_PlanMosavab;
                    $scope.Base_PlanMojaz = msg.Base_PlanMojaz;

                    $scope.$apply();
                },
                error: function (c) {
                    $scope.MapInfo = null;
                    $scope.$apply();
                }
            });
        },
        GetPlanOrder: function (x) {
            var d = {
                pDistrict: $scope.GamInputData.District,
                pNidProc: $scope.GamInputData.NidProc,
            }
            $('#Zabete').hide();
            $scope.Functions.LoadZabetehMapInfo();
            var c = JSON.stringify(d);

            StartBusy('divZabeteMain', 'در حال دریافت اطلاعات');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetPlanOrder",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {

                    if (response.ErrorResult.BizErrors.length > 0) {
                        $scope.Prop.ErrorMessage = 'شهروند گرامی اعلام ضابطه بروی درخواست شما از طرف شهرداری انجام نشده است';
                        $('#Zabete').hide();
                        $scope.$apply();
                    }
                    else {
                        $('#Zabete').show();
                        if (response.Base_PlanMosavab != null)
                            $scope.Base_PlanMosavab = response.Base_PlanMosavab[0];
                        if (response.Base_PlanMojaz != null)
                            $scope.Base_PlanMojaz = response.Base_PlanMojaz[0];

                        $scope.Base_UsingList = response.Base_Using_MapContol;
                        $scope.Base_FrontList = response.Base_Front_MapContol;

                        $scope.GetOwnerZabetehComment();

                        $scope.$apply();

                        ReEvent();
                    }
                    StopBusy('divZabeteMain');
                },
                failure: function (response) {
                    StopBusy('divZabeteMain');
                },
                error: function (response) {
                    StopBusy('divZabeteMain');
                }
            });
        },

        CalculateZabeteh_AndSave: function () {
            $scope.Prop.ErrorMessage = '';
            var d = { pNidProc: $scope.GamInputData.NidProc, pDistrict: $scope.GamInputData.District, };
            var c = JSON.stringify(d);
            $scope.Prop.ErrorMessage = null;

            $.ajax({
                type: "POST",
                url: ServiceAddress + "CalculateZabeteh_AndSave",
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
        },

        GetTavafoghat: function () {

            document.getElementById("divZavabeh").style.display = "block";

          

            StartBusy('grdTavafoghat', '');
            var d = { pNidProc: $scope.GamInputData.NidProc };
            var c = JSON.stringify(d);
            $scope.Prop.ErrorMessage = null;
            var tmpService = GetUrlByDomain(SrvSC, $scope.GamInputData.District);

            $.ajax({
                type: "POST",
                url: tmpService + "GetSh_Agreement_ListWithHistory",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('grdTavafoghat');
                    if (msg.ErrorResult.BizErrors.length > 0)
                        $scope.Prop.ErrorMessage = msg.ErrorResult.BizErrors[0].ErrorTitel;
                    else {
                        $scope.Sh_Agreement_List = msg.Sh_Agreement_List;
                    }

                    $scope.$apply();
                },
                error: function (c) {
                    $scope.Prop.ErrorMessage = "خطا در اجرای سرویس";
                }
            });
        },
        SendSmsRevisitAgent: function () {

            try {
                var d = {
                    pInputData: $scope.GamInputData,
                }
                var c = JSON.stringify(d);
                $.ajax({
                    type: "POST",
                    url: "UTransferGam.aspx/SendSMSAgent",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {
                    },
                    error: function (c) {

                    }
                });//ajax
            }
            catch (ex) {

            }
        },

        ShowArchive: function () {

            $("#DivArchiveSend").show();
            var Dan = $('#DivArchiveSend').AsSafaArchive();
            Dan.LoadObj($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, 1, {
                backgroundColor: 'rgb(170, 219, 170)',
                FullpageBgColor: 'rgb(170, 219, 170)',
                thumbnailGutterHeight: 10,
                thumbnailGutterWidth: 5,
                Archive_NidEntity: Archive_NidEntitySend,
                colorScheme: {
                    navigationbar: { background: 'yellow', border: '1px dotted #00cc00', color: 'black', colorHover: '#fff' },
                    thumbnail: {
                        background: 'rgb(180, 230, 190)',
                        border: '1px solid yellow',
                        labelBackground: 'rgba(242, 242, 219, 0.33);',
                        titleColor: 'darkgreen',
                        descriptionColor: '#ccc',
                        descriptionShadow: '',
                        paginationDotBorder: '2px solid #0c0',
                        paginationDotBack: '#008500',
                        paginationDotSelBack: '#0c0'
                    }
                }

            }, function () {
            });
        },
        ShowArchiveReport: function () {

            var Dan = $('#DivArchiveShfaniReport').AsSafaArchive();
            Dan.LoadObj($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, 1, {
                backgroundColor: 'rgb(170, 219, 170)',
                FullpageBgColor: 'rgb(170, 219, 170)',
                thumbnailGutterHeight: 10,
                thumbnailGutterWidth: 5,
                Archive_NidEntity: 0,
                colorScheme: {
                    navigationbar: { background: 'yellow', border: '1px dotted #00cc00', color: 'black', colorHover: '#fff' },
                    thumbnail: {
                        background: 'rgb(180, 230, 190)',
                        border: '1px solid yellow',
                        labelBackground: 'rgba(242, 242, 219, 0.33);',
                        titleColor: 'darkgreen',
                        descriptionColor: '#ccc',
                        descriptionShadow: '',
                        paginationDotBorder: '2px solid #0c0',
                        paginationDotBack: '#008500',
                        paginationDotSelBack: '#0c0'
                    }
                }

            }, function () {
            });
        },

        ShowArchiveLetter: function () {

            var Dan = $('#DivArchiveLetter').AsSafaArchive();

            Dan.LoadObj($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, 1, {
                backgroundColor: 'rgb(170, 219, 170)',
                FullpageBgColor: 'rgb(170, 219, 170)',
                thumbnailGutterHeight: 10,
                thumbnailGutterWidth: 5,
                Archive_NidEntity: Archive_NidEntityLetter,
                colorScheme: {
                    navigationbar: { background: 'yellow', border: '1px dotted #00cc00', color: 'black', colorHover: '#fff' },
                    thumbnail: {
                        background: 'rgb(180, 230, 190)',
                        border: '1px solid yellow',
                        labelBackground: 'rgba(242, 242, 219, 0.33);',
                        titleColor: 'darkgreen',
                        descriptionColor: '#ccc',
                        descriptionShadow: '',
                        paginationDotBorder: '2px solid #0c0',
                        paginationDotBack: '#008500',
                        paginationDotSelBack: '#0c0'
                    }
                }

            }, function () {
            });
        },
        GamTahodatFunc: {
            GetCommitmentCitizen: function () {
                $scope.Prop.ErrorMessage = null;
                var d = {
                    pDistrict: $scope.GamInputData.District,
                    pNidProc: $scope.GamInputData.NidProc,
                }
                var c = JSON.stringify(d);

                StartBusy1('درحال دریافت اطلاعات');
                $.ajax({
                    data: c,
                    type: "POST",
                    url: ServiceAddress + "GetSh_CommitmentCitizen",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        StopBusy1();
                        if ($scope.Functions.CheckError(msg)) {
                            $scope.Sh_CommitmentCitizenList = msg.Sh_CommitmentCitizenList;

                            $scope.$apply();
                        }
                    },
                    error: function (c) {
                        StopBusy1();
                    }
                });
            },

            SaveCommitmentCitizen: function () {
                $scope.Prop.ErrorMessage = null;

                $scope.Sh_CommitmentCitizenList = Enumerable.From($scope.Sh_CommitmentCitizenList)
                    .Select(function (x) {
                        return ((x.Sh_CommitmentCitizen));
                    }).ToArray()


                $scope.Sh_CommitmentCitizenList = JSON.parse(angular.toJson($scope.Sh_CommitmentCitizenList));

                var d = {
                    pDistrict: $scope.GamInputData.District,
                    pNidProc: $scope.GamInputData.NidProc,
                    pSh_CommitmentCitizenList: $scope.Sh_CommitmentCitizenList
                }
                var c = JSON.stringify(d);

                StartBusy1('درحال دریافت اطلاعات');
                $.ajax({
                    data: c,
                    type: "POST",
                    url: ServiceAddress + "SaveSh_CommitmentCitizen",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        StopBusy1();
                        if ($scope.Functions.CheckError(msg)) {
                            $scope.Functions.GamTahodatFunc.GetCommitmentCitizen();
                            $scope.Prop.ErrorMessageComment = 'اطلاعات با موفقیت ذخیره شد';

                            $scope.ErrorColor = 'Green';
                        }
                    },
                    error: function (c) {
                        StopBusy1();
                    }
                });
            },

            ConfirmCitizen: function (x) {
                x.Sh_CommitmentCitizen.IsConfirmByCitizen = 1;
                var tmpDate = persianDate().pDate;
                x.Sh_CommitmentCitizen.CitizenConfirmDate = tmpDate.year + "/" + tmpDate.month + "/" + tmpDate.date;
                x.Sh_CommitmentCitizen.CitizenConfirmTime = tmpDate.hours + ":" + tmpDate.minutes + ":" + tmpDate.seconds
                x.Sh_CommitmentCitizen.NidUserCitizen = ClsAccount.AccountInfo.NidAccount;
                x.Sh_CommitmentCitizen.CitizenUserName = ClsAccount.AccountInfo.FullName;
                x.Sh_CommitmentCitizen.CitizenNationalCode = ClsAccount.AccountInfo.OwnerNationalCode;
            },
            ShowHistory: function (x) {
                $('#GridHistory').show();
                $scope.Prop.ErrorMessage = null;
                var d = {
                    pDistrict: $scope.GamInputData.District,
                    pNidProc: $scope.GamInputData.NidProc,
                }
                var c = JSON.stringify(d);

                StartBusy1('درحال دریافت اطلاعات');
                $.ajax({
                    data: c,
                    type: "POST",
                    url: ServiceAddress + "GetSh_CheckList",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        StopBusy1();
                        if ($scope.Functions.CheckError(msg)) {
                            $scope.Sh_CheckList = msg.Sh_CheckList;

                            $scope.$apply();
                        }
                    },
                    error: function (c) {
                        StopBusy1();
                    }
                });
            },
        },
        ConfirmOnFormsConfirmation: function (pType) {

            var d = { pFormsConfirmationType: pType, pNidProc: $scope.GamInputData.NidProc, pDistrict: $scope.GamInputData.District, IsConfirmByCitizen: true, EumUrbanPlannerOpinion: 1, CitizenComments: 'تایید شهروند' };
            var c = JSON.stringify(d);
            StartBusy('Div5', 'در حال بررسی سوابق');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "ConfirmOnFormsConfirmation",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {



                },
                error: function (c) {

                }
            });//ajax
        },
        CheckLetters: function () {

            var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];

            var LetterRes = true;
            var tmpConfirmLetterCount = Enumerable.From($scope.LetterList_OUT)
                .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 && x.Sh_OfficeLetter.CI_OfficeLetter }).Count();


            // tmpConfirmLetterCount = tmpConfirmLetterCount + tmpConfirmLetterCountStandard;

            var tmpConfirmLetterCountNot = Enumerable.From($scope.LetterList_OUT)
                .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 2 && x.Sh_OfficeLetter.ArchiveNidFile != null }).Count();
            if (tmpConfirmLetterCountNot != undefined && tmpConfirmLetterCountNot > 0)
                $scope.GamInputData.MustUploadLetterCount = $scope.GamInputData.MustUploadLetterCount - tmpConfirmLetterCountNot;

            var tmpConfirmLetterInCount = Enumerable.From($scope.LetterList_IN)
                .Where(function (x) { return x.Sh_OfficeLetter.EumConfirmOrganization == 1 }).Count();

            var tmpLetterInCount = Enumerable.From($scope.LetterList_IN)
                .Where(function (x) {
                    return (x.Sh_OfficeLetter.CI_OfficeLetter != 25 || x.Sh_OfficeLetter.CI_OfficeLetter != 26)
                }).Count();

            $scope.tmpConfirmLetterIn = true;
            if (tmpConfirmLetterInCount < tmpLetterInCount) {
                $scope.Prop.ErrorMessage += '\r\n' + 'تمام نامه های درون سازمانی باید مورد تایید شهرساز قرار گیرند';
                LetterRes = false;
                $('#btnSendToShahrsaz3').prop("disabled", true);
                $scope.GreenColor = false;
                $scope.tmpConfirmLetterIn = false;
            }
            else if (tmpCurrentStep.Name != "MokatebatDastoor" && (tmpConfirmLetterCount < $scope.LetterList_OUT.length) && ($scope.GamInputData.MustUploadLetterCount == undefined || $scope.GamInputData.MustUploadLetterCount < $scope.LetterList_OUT.length)) {
                $scope.Prop.ErrorMessage = 'لطفا نامه های برون سازمانی را بارگذاری نمایید';
                LetterRes = false;
            }
            else if (tmpCurrentStep.Name != "MokatebatDastoor" && tmpConfirmLetterCount < $scope.LetterList_OUT.length) {
                $scope.Prop.ErrorMessage += '\r\n' + 'تمام نامه های برون سازمانی باید مورد تایید شهرساز قرار گیرند - پرونده را به شهرداری ارسال نمایید';
                LetterRes = false;
            }//برای نامه استاندارد نیاز به تایید مدیر نیست 

            else if ($scope.GamInputData.UploadDwg != true) {
                $scope.Prop.ErrorMessage += '\r\n' + 'فایل پیش نقشه باید بارگذاری شود';
                LetterRes = false;
            }
            else if (tmpLetterInCount > 0 && tmpConfirmLetterInCount >= tmpLetterInCount) {
                $('#btnSendToShahrsaz3').show();
            }
            //#836
            else {
                $('#btnSendToShahrsaz3').hide();
            }

            if ($scope.LetterList_New.length > 0 && $scope.GamInputData.SendToShahrsazOk5 != true) {
                $scope.Prop.ErrorMessage = 'ابتدا دکمه ارسال به شهرداری را بزنید ';
                $('#btnSendToShahrsaz5').prop("disabled", false);
                LetterRes = false;
            }
            else {
                var tmpConfirmLetterNewCount = Enumerable.From($scope.LetterList_New)
                    .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 }).Count();

                if ((tmpConfirmLetterNewCount < $scope.LetterList_New.length)) {
                    $scope.Prop.ErrorMessage = 'تمامی مدارک باید مورد تایید شهرداری قرار گیرد';
                    LetterRes = false;
                }
                else
                    $scope.GamInputData.tmpConfirmLetterNewOk = true;
            }
            $scope.$apply();
            return LetterRes;
        },

        CheckLettersLoad: function () {

            var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];

            var tmpConfirmLetterInCount = Enumerable.From($scope.LetterList_IN)
                .Where(function (x) { return x.Sh_OfficeLetter.EumConfirmOrganization == 1 && x.Sh_OfficeLetter.CI_OfficeLetter != 25 && x.Sh_OfficeLetter.CI_OfficeLetter != 26 }).Count();

            var tmpLetterInCount = Enumerable.From($scope.LetterList_IN)
                .Where(function (x) {
                    return (x.Sh_OfficeLetter.CI_OfficeLetter != 25 && x.Sh_OfficeLetter.CI_OfficeLetter != 26)
                }).Count();

            $scope.tmpConfirmLetterIn = true;

            if (tmpConfirmLetterInCount < tmpLetterInCount) {
                $scope.Prop.ErrorMessage += '\r\n' + 'تمام نامه های درون سازمانی باید مورد تایید شهرساز قرار گیرند';
                $('#btnSendToShahrsaz3').prop("disabled", true);
                $('#btnSendToShahrsaz3').hide();
                $scope.GreenColor = false;
            }

            else if (tmpLetterInCount > 0 && tmpConfirmLetterInCount >= tmpLetterInCount) {
                $('#btnSendToShahrsaz3').show();
                $('#btnSendToShahrsaz3').prop("disabled", false);
            }

            if ($scope.LetterList_IN.length == 0 && $scope.LetterList_OUT == 0) {
                $('#btnSendToShahrsaz3').show();
                $('#btnSendToShahrsaz3').prop("disabled", false);
            }
            //https://trello.com/c/d8V3aQeu
            ////#1086 For Gorgan CI_City=2
            if (typeof (CI_City) != undefined && CI_City == 2 && $scope.GamInputData.MustUploadLetterCountCom < $scope.LetterList_Com.length
                || (tmpCurrentStep.MustUploadLetterComThenSendToShahsaz != undefined && tmpCurrentStep.MustUploadLetterComThenSendToShahsaz == true)
            ) {
                $('#btnSendToShahrsazCom').hide();
            }

            //در شیراز هم قبل از بارگذاری نباید ارسال دیده شود

            if (tmpCurrentStep.Name == EumPage.Commission) {
                if ($scope.LetterList_Com != null && $scope.LetterList_Com.length > 0) {

                    var tmpLetterList_Com = Enumerable.From($scope.LetterList_Com)
                        .Where(function (x) { return x.LetterName == "ارائه نقشه معماري / کميسيون شهرسازي" }).ToArray();
                    var tmpConfirmLetterComCount = Enumerable.From(tmpLetterList_Com)
                        .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 }).Count();

                    var tmpLetterList_Com2 = Enumerable.From($scope.LetterList_Com)
                        .Where(function (x) { return x.Sh_OfficeLetter.CI_OfficeLetter == 49 }).ToArray();
                    var tmpConfirmLetterComCount2 = Enumerable.From(tmpLetterList_Com2)
                        .Where(function (x) { return x.Sh_OfficeLetter.EumConfirm == 1 }).Count();


                    //گام قبلی دوباره چک میشود
                    if ($scope.Functions.CheckConfirmManager(GamPlugin.CurrentStep)) {
                        if (tmpConfirmLetterComCount >= 1 && tmpConfirmLetterComCount2 >= 1) {
                            $('#btnSendToShahrsazCom').show();
                        }
                        else
                            $('#btnSendToShahrsazCom').hide();
                    }
                }
            }

            if (tmpCurrentStep.Name == EumPage.Mokatebat) {
                if ($scope.LetterList_New.length > 0) {
                    var tmpConfirmLetterCountUpload = Enumerable.From($scope.LetterList_New)
                        .Where(function (x) { return x.Sh_OfficeLetter.ArchiveNidFile != null }).Count();

                    if (tmpConfirmLetterCountUpload != undefined && tmpConfirmLetterCountUpload == $scope.LetterList_New.length) {
                        $('#btnSendToShahrsaz3').show();
                        $('#btnSendToShahrsaz3').prop("disabled", false);
                    }
                }
            }
            // if (tmpConfirmLetterComCount == $scope.LetterList_Com.length)
            // $('#btnSendToShahrsazCom').hide();

            $scope.$apply();
        },

        ShowShReport: function () {

            //var tmpStr = "RptShMojod&ReportParameter=NidProc;" + GetScope().GamInputData.NidProc + ",District;" + GetScope()
            //    .GamInputData.District + ",TokenKey;"

            //window.open(FactorUrl + tmpStr, '_blank');

            this.ShowShReport2();
        },
        ShowShReport2: function () {
            StartBusyTimer();
            if ($scope.GamInputData.RenderNames != undefined && $scope.GamInputData.RenderNames.length > 0 && false) {
                $scope.Functions.ShowArchiveReport();
                $('html, body').animate({
                    scrollTop: $("#DivArchiveSend").offset().top
                }, 2000);
            }

            else {
                StartBusy1();
                var d = {
                    NidProc: GetScope().GamInputData.NidProc, pNidEntity: 0,
                    NosaziCode: GetScope().GamInputData.CurrentNosaziCode,
                    pArchiveBizCode: GetScope().GamInputData.ArchiveBizCode != undefined ? GetScope().GamInputData.ArchiveBizCode : "",
                    NidNosaziCode: GetScope().GamInputData.NidNosaziCode,
                    pFileName: 'Output_Parvaneh' + GetScope().GamInputData.NidProc.split('-')[1],
                }
                $scope.Prop.ErrorMessage = '';
                var c = JSON.stringify(d);
                StartBusy('divArchiveCert', 'در حال ایجاد گزارش');
                $.ajax({
                    type: "POST",
                    url: "UTransferGam.aspx/RenderReport",
                    data: c,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        StopBusy1();
                        if (response.d.ErrorResult.BizErrors.length > 1)
                            $scope.Prop.ErrorMessage = response.d.ErrorResult.BizErrors[1].ErrorTitel;
                        else if (response.d.ErrorResult.BizErrors.length > 0)
                            $scope.Prop.ErrorMessage = response.d.ErrorResult.BizErrors[0].ErrorTitel;
                        else {
                            $scope.Functions.ShowArchiveReport();

                            $scope.GamInputData.RenderNames = response.d.renderNames;
                        }
                        $scope.$apply();
                        GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);

                        $('html, body').animate({
                            scrollTop: $("#DivArchiveSend").offset().top
                        }, 2000);

                    },
                });
            }
        },
        ShowZabeteReport: function () {

            var tmpStr = "RptZabeteSh&ReportParameter=NidProc;" + GetScope().GamInputData.NidProc + ",District;" + GetScope()
                .GamInputData.District + ",TokenKey;"

            window.open(FactorUrl + tmpStr, '_blank');
        },
        ShowPreAvarez: function (pNidFiche) {

            var tmpStr = "RptPreAvarez&ReportParameter=NosaziCode;" + GetScope().GamInputData.CurrentNosaziCode + ",District;" + GetScope()
                .GamInputData.District + ",NidFiche;" + pNidFiche + ",TokenKey;"

            window.open(FactorUrl + tmpStr, '_blank');
        },
        RevokeRequest: function () {
            var d = {
                pDomain: $scope.GamInputData.District, pComments: $('#reasonComment').val(), pNidProc: $scope.GamInputData.NidProc,
            };
            var c = JSON.stringify(d);
            StartBusy('Div5', 'در حال بررسی سوابق');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "SendToGarbageKartabl",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    GamPlugin.ResetGamAndRedirect();
                },
                error: function (c) {

                }
            });
        },
        LoadMapControl: function () {
            var d = {
                pDistrict: $scope.GamInputData.District, pNidProc: $scope.GamInputData.NidProc,
            };
            var c = JSON.stringify(d);
            StartBusy('MainGam', 'در حال بازآوری اطلاعات');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetMapControl",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {

                    $scope.Base_FrontList = msg.Base_Front_MapContol;
                    $scope.Base_UsingList = msg.Base_Using_MapContol;
                    $scope.$apply();
                    StopBusy('MainGam');
                },
                error: function (c) {
                    StopBusy('GridViewTarakom');
                }
            });
        },

        GetNewNosaziCode: function () {
            var d = {
                pDomain: $scope.GamInputData.District, pNidProc: $scope.GamInputData.NidProc,
            };
            var c = JSON.stringify(d);
            StartBusy('MainGam', 'در حال دریافت کد نوسازی');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetSh_NewNosaziCode",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {

                    var tmpCode = msg.Sh_NewNosaziCode;
                    $scope.GamInputData.CurrentNosaziCode = tmpCode.District + '-' + tmpCode.Region + '-' + tmpCode.Block + '-' + tmpCode.House + '-' + tmpCode.Building + '-' + tmpCode.Apartment + '-' + tmpCode.Shop;

                    $scope.$apply();
                    StopBusy('MainGam');
                },
                error: function (c) {
                    StopBusy('MainGam');
                }
            });
        },
        SaveWkt: function () {

            var d = { NidProc: $scope.GamInputData.NidProc, WKT: $scope.GamInputData.Wkt, pDomain: $scope.GamInputData.District };
            var c = JSON.stringify(d);
            $.ajax({
                type: "POST",
                url: ServiceAddress + "SaveSh_NewNosaziCode",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {

                },
                error: function (c) {

                }
            });//ajax
        },
        GetNahadList: function () {

            $request = $.ajax({
                type: "POST",
                url: "UStepGam.aspx/GetNahadList",

                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    if (msg.d != null) {
                        $scope.GamInputData.CI_EntityList = msg.d.CI_EntityList;
                        $scope.$apply();
                    }
                },
                error: function (c) {
                    StopBusy('divUploader');
                    var g = c;
                }
            });
        },
    }
    $scope.SetDisableButton = function () {
        $scope.GamInputData.AllowNextPage = false;
    }
    $scope.Prop =
    {
        ErrorMessage: null,
        CurrentPageName: null,
        WorkflowList: null,
    }

    $scope.StyleFunc =
    {
        tmpWidthGam: 0,
        GamWidth: 0,
        GamWidth2: 0,
        IsGraet: false,
        GetDefaultWidth: function (pIndex) {
            if (typeof (GamsArray) !== 'undefined') {
                this.GamWidth = (100 / (GamsArray.length)).toFixed(1);
                this.GamWidth2 = (document.body.clientWidth * ((100 / (GamsArray.length - 1)).toFixed(1)) / 100);
            }
            else return '10';
        },

        GetWidth: function (pIndex) {
            var tmpWidth = '10%';
            var tmpFloat = 'right';
            var tmpalign = 'right';

            if (pIndex == GamsArray.length - 1) {
                tmpWidth = '70px';
                tmpFloat = 'left';
                tmpalign = 'left';
            }
            else if (pIndex == GamsArray.length - 2) {
                tmpWidth = this.GamWidth2 + 'px';
                tmpWidthGam = tmpWidth;
            }
            else {
                var tmpW = this.GamWidth;
                //if (GamsArray[pIndex].PageTitle.length > 25) {
                //    tmpW = parseFloat(tmpW) + 2;
                //    IsGraet = true;
                //}


                tmpWidth = tmpW + '%';
            }

            styles = {
                'width': tmpWidth,
                'text-align': tmpalign,
                'float': tmpFloat,
            };
            return styles;
        },
        Getalign: function (pIndex) {
            var tmpalign = 'center';
            if (pIndex == GamsArray.length - 1)
                tmpalign = 'left';
            if (pIndex == 0)
                tmpalign = 'right';

            styles = {
                'text-align': tmpalign,
                'direction': 'ltr',
            };
            return styles;
        },

        Getalign2: function (pIndex) {
            var tmpalign = 'center';
            var tmpMarginLeft = '0';
            var tmpalign = 'right';

            if (pIndex == 0)
                tmpalign = 'right';

            if (pIndex == GamsArray.length - 1) {
                tmpalign = 'left';
                tmpMarginLeft = '5px';
                tmpFloat = 'left';
            }
            styles = {
                'text-align': tmpalign,
                'direction': 'ltr',
                'margin-left': tmpMarginLeft,
            };
            return styles;
        },
        GetFloat: function (pIndex) {
            var tmpFloat = 'none';
            var tmpalign = 'right';

            if (pIndex == GamsArray.length - 1)
                tmpFloat = 'left';

            if (pIndex > 0 && pIndex < GamsArray.length - 1)
                var tmpalign = 'center';

            styles = {
                'float': tmpFloat,
                'text-align': tmpalign,
            };
            return styles;
        },

        Load: function () {
            if (typeof (GamsArray) !== 'undefined') {
                this.tmpWidthGam = 100;
                this.GetDefaultWidth();
                if ($('.step-div').length == GamsArray.length)
                    $(window).resize(function () {

                        //$scope.StyleFunc.GamWidth2 = (document.body.clientWidth * ((100 / (GamsArray.length - 1)).toFixed(1)) / 100) - 60,
                        //$('#step-div' + (GamsArray.length - 2)).css('width', $scope.StyleFunc.GamWidth2);

                    });
            }
        },
    }

    ///////////////////////////////////////OnLoad

    $scope.templateUrl = function (pPage) {
        if (pPage == null || pPage == '')
            pPage = '.htm';
        return "Parvaneh/" + pPage;
    }


    $scope.ShowPrint = (typeof (ShowPrint) !== "undefined" && ShowPrint == true);
    $scope.HideFishDarAmadDetail = (typeof (HideFishDarAmadDetail) !== "undefined" && HideFishDarAmadDetail == false);

    //==========================================================================================

    $scope.ChangeShFani = function (p) {

        //$('#divUploaderSend').empty();
        // if (p == 'false') {
        //$scope.GamInputData.ShFaniOk = false;
        //$scope.Functions.Gam5Func_Upload.LoadArchiveForSendDoc(GetScope().GamInputData.ArchiveBizCode, '#divUploaderSend', 'ارسال مدارک به شهرساز');
        // }
    }
    $scope.ChangeZabeteOk = function (p) {

        //$('#divUploaderSendParvaneh').empty();
        //if (p == 'false') {
        //   $scope.Functions.Gam5Func_Upload.LoadArchiveForSendDoc(GetScope().GamInputData.ArchiveBizCode, '#divUploaderSendParvaneh', 'بارگذاری فایل DWG');
        //}
    }

    //$scope.RequestType = ['درخواست اضافه بنا', 'اضافه واحد', 'اضافه طبقه', 'کاهش بنا', 'کاهش واحد', 'کاهش طبقه'];
    $scope.RequestType = [{ index: 1, id: 1, Name: 'کاهش بنا' }, { index: 1, id: 2, Name: 'کاهش واحد' }, { index: 1, id: 3, Name: 'کاهش طبقه' },
    { index: 2, id: 4, Name: 'اضافه بنا' }, { index: 2, id: 5, Name: 'اضافه واحد' }, { index: 2, id: 6, Name: 'اضافه طبقه' }
    ];

    $scope.EumFloor = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    $scope.LetterList = [
        //{ OrganName: 'املاک', Show: '', Comment: '', OkAdmin: 'تایید' },
        //{ OrganName: 'فضای سبز', Show: '', Comment: '', OkAdmin: 'عدم تایید' },
        //{ OrganName: 'باغات', Show: '', Comment: 'توضیحات شهرساز', OkAdmin: 'تایید' },
    ]

    $scope.ShowLetterReport = function (pLeterName) {
        var pUrl = FactorUrl + pLeterName + "&ReportParameter=NidProc;" + GetScope().GamInputData.NidProc + ",District;" + GetScope()
            .GamInputData.District + ",TokenKey;,NIdUser;" + GetScope().NidUser + "";

        window.open(pUrl, '_blank');
    }
    $scope.ShowReport = function (pLeterName) {
        var tmpStr = pLeterName + "&ReportParameter=NidProc;" + GetScope().GamInputData.NidProc + ",District;" + GetScope()
            .GamInputData.District + ",TokenKey;,NIdUser;" + GetScope().NidUser + "";

        window.open(FactorUrl + tmpStr, '_blank');
    }
    $scope.ShowReportValidity = function (pReportName) {
        var tmpStr = pReportName + "&ReportParameter=District;" + GetScope().GamInputData.District + "NosaziCode;" + GetScope().GamInputData.CurrentNosaziCode;
        window.open(FactorUrl + tmpStr, '_blank');
    }

    $scope.LoadLetter = function () {

        $scope.Prop.ErrorMessage = "";

        var d = {
            pDistrict: $scope.GamInputData.District,
            pNidProc: $scope.GamInputData.NidProc,
        }

        var c = JSON.stringify(d);
        StartBusy('divLetters', 'در حال بارآوری نامه ها');
        $.ajax({
            type: "POST",
            url: ServiceAddress + "GetSh_OfficeLetter",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('divLetters');
                if (response.ErrorResult.BizErrors.length > 0) {
                    $scope.Prop.ErrorMessage = 'خطا در دریافت اطلاعات';
                }
                else {
                    $scope.LetterList_IN = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 1;
                        }).ToArray();

                    $scope.LetterList_OUT = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 2;
                        }).ToArray();

                    $scope.LetterList_PZ = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 3;
                        }).ToArray();


                    $scope.LetterList_Ag = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 4;

                        }).ToArray();

                    $scope.LetterList_New = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 6;

                        }).ToArray();
                    $scope.$apply();


                    //نقص مدارک کد ملک جدید 
                    if ($scope.GamInputData.IsNew == true) {
                        $scope.LetterList_New.forEach(function (item, index) {
                            var tmpNidTag = $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity;
                            var u1 = $('#DivUploadNew' + index).AsSafaArchiveUploder();
                            u1.LoadObjSimple(ClsAccount.AccountInfo.NidAccount, 'UGP', {
                                UserName: ClsAccount.AccountInfo.FullName,
                                UserCode: ClsAccount.AccountInfo.NidAccount,
                                LoadNidFile: item.Sh_OfficeLetter.ArchiveNidFile,
                                Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                                , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter,
                                FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg",
                                SaveOrginalFile: true
                                , OnCompleteUpload: function (args, sender) {
                                    $scope.Functions.Gam5Func_Upload.AddNidFileLetterNew(args.NidFile, args.OtherFiled, tmpNidTag);
                                    // $scope.Functions.ShowArchiveLetter();
                                }
                            });
                        });
                    }
                    else {
                        $scope.LetterList_New.forEach(function (item, index) {
                            var tmpNidTag = $scope.GamInputData.SelectedWorkFlow.Archive_NidEntity;
                            var u1 = $('#DivUploadNew' + index).AsSafaArchiveUploder();
                            u1.LoadObjSimple($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, {
                                UserName: ClsAccount.AccountInfo.FullName,
                                UserCode: ClsAccount.AccountInfo.NidAccount,
                                LoadNidFile: item.Sh_OfficeLetter.ArchiveNidFile,
                                Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                                , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter,
                                FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg",
                                SaveOrginalFile: true
                                , OnCompleteUpload: function (args, sender) {
                                    $scope.Functions.Gam5Func_Upload.AddNidFileLetterNew(args.NidFile, args.OtherFiled, tmpNidTag);
                                    // $scope.Functions.ShowArchiveLetter();
                                }
                            });
                        });
                    }

                    $scope.$apply();



                    var tmpLetterConfirmCount = Enumerable.From($scope.LetterList_OUT)
                        .Where(function (e) {
                            return e.Sh_OfficeLetter.EumConfirm == 1;
                        }).ToArray().length;

                    $scope.LetterList_OUT.forEach(function (item, index) {
                        item.IsConfirmStr = (item.Sh_OfficeLetter.EumConfirm == 1) ? "تایید" : "عدم تایید";

                        if (tmpLetterConfirmCount != $scope.LetterList_OUT.length) {
                            var tmpNidTag = Archive_NidEntityLetter;
                            var u1 = $('#DivLetter' + index).AsSafaArchiveUploder();
                            u1.LoadObjSimple($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, {
                                UserName: ClsAccount.AccountInfo.FullName,
                                UserCode: ClsAccount.AccountInfo.NidAccount,
                                FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg",
                                Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                                , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter
                                , OnCompleteUpload: function (args, sender) {
                                    $scope.Functions.Gam5Func_Upload.AddNidFileLetter(args.NidFile, args.OtherFiled, item);
                                    $scope.Functions.ShowArchiveLetter();
                                }
                            });
                        }
                    });

                    if ($scope.LetterList_PZ == undefined || $scope.LetterList_PZ.length == 0)
                        $scope.GamInputData.UploadDwg = true;

                    $scope.LetterList_PZ.forEach(function (item, index) {
                        var tmpNidTag = Archive_NidEntityDwg;
                        var u1 = $('#DivLetterDWG' + index).AsSafaArchiveUploder();
                        u1.LoadObjSimple($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, {
                            UserName: ClsAccount.AccountInfo.FullName,
                            UserCode: ClsAccount.AccountInfo.NidAccount,
                            Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                            , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter, FilterExtensions: ".dwg,.Rvt", SaveOrginalFile: true
                            , OnCompleteUpload: function (args, sender) {
                                $scope.GamInputData.UploadDwg = true;
                                $scope.Functions.Gam5Func_Upload.AddNidFileLetter(args.NidFile, args.OtherFiled, true);
                                $scope.Functions.ShowArchiveLetter();
                            }
                        });
                    });


                    $scope.LetterList_Com = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 5;
                        }).ToArray();

                    $scope.$apply();

                    $scope.LetterList_Com.forEach(function (item, index) {
                        item.IsConfirmStr = item.Sh_OfficeLetter.IsConfirm ? "تایید" : "عدم تایید";
                        var tmpNidTag = Archive_NidEntityDwg;
                        var u1 = $('#DivLetterCom' + index).AsSafaArchiveUploder();
                        u1.LoadObjSimple($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, {
                            UserName: ClsAccount.AccountInfo.FullName,
                            UserCode: ClsAccount.AccountInfo.NidAccount,
                            LoadNidFile: item.Sh_OfficeLetter.ArchiveNidFile,
                            Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: typeof (Upload_MinFileSizeCad) != 'undefined' ? Upload_MinFileSizeCad : Upload_MinFileSize,

                            MaxFileSize: typeof (Upload_MaxFileSizeCad) != 'undefined' ? Upload_MaxFileSizeCad : Upload_MaxFileSize
                            , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter, FilterExtensions: ".dwg,.Rvt"
                            , OnCompleteUpload: function (args, sender) {
                                $scope.Functions.Gam5Func_Upload.AddNidFileLetterCom(args.NidFile, args.OtherFiled);
                            }
                        });
                    });

                    $scope.Functions.CheckLettersLoad();

                    $scope.$apply();
                }
            },
            failure: function (response) {
                StopBusy('divLetters');
            },
            error: function (response) {
                StopBusy('divLetters');
            }
        });

    }

    $scope.LoadLetterCom = function () {

        $scope.Prop.ErrorMessage = "";
        var d = {
            pDistrict: $scope.GamInputData.District,
            pNidProc: $scope.GamInputData.NidProc,
        }

        var c = JSON.stringify(d);
        StartBusy('divSendData', 'در حال نمایش نامه ها');
        $.ajax({
            type: "POST",
            url: ServiceAddress + "GetSh_OfficeLetter",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('divSendData');
                if (response.ErrorResult.BizErrors.length > 0) {
                    $scope.Prop.ErrorMessage = 'خطا در دریافت اطلاعات';
                }
                else {
                    $scope.LetterList = response.Sh_OfficeLetterResult;
                    $scope.LetterList_Com = Enumerable.From(response.Sh_OfficeLetterResult)
                        .Where(function (e) {
                            return e.EumOfficeLetterType == 5;
                        }).ToArray();

                    $scope.$apply();
                    $scope.LetterList_Com.forEach(function (item, index) {
                        item.IsConfirmStr = item.Sh_OfficeLetter.IsConfirm ? "تایید" : "عدم تایید";
                        var tmpNidTag = Archive_NidEntityDwg;
                        var u1 = $('#DivLetterCom' + index).AsSafaArchiveUploder();
                        u1.LoadObjSimple($scope.GamInputData.ArchiveBizCode, $scope.GamInputData.District, {
                            UserName: ClsAccount.AccountInfo.FullName,
                            UserCode: ClsAccount.AccountInfo.NidAccount,
                            LoadNidFile: item.Sh_OfficeLetter.ArchiveNidFile,
                            Multiply: true, NidTag: tmpNidTag, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                            , Title: '', IsRequire: true, OtherFiled: item.Sh_OfficeLetter.NidOfficeLetter, FilterExtensions: ".dwg,.Rvt"
                            , OnCompleteUpload: function (args, sender) {
                                $scope.Functions.Gam5Func_Upload.AddNidFileLetterCom(args.NidFile, args.OtherFiled);
                            }
                        });
                    });
                }
            },
            failure: function (response) {
                StopBusy('divSendData');
            },
            error: function (response) {
                StopBusy('divSendData');
            }
        });
    }
    $scope.AddRequestType = function () {

        $scope.UGP_FormsConfirmationListZabete.push({ UGP_FormsConfirmation: { EumFormsConfirmationType: 1, IsNew: true } });
        $('#btnZabeteComment').prop('disabled', false);
        ReEvent();
    }
    $scope.RemoveRequestType = function (x) {
        // $scope.UGP_FormsConfirmationListZabete.pop(x);

        if (x.UGP_FormsConfirmation.NidFormsConfirmation == undefined) {
            dictionary = Enumerable.From($scope.UGP_FormsConfirmationListZabete).ToDictionary();
            dictionary.Remove(x);
            $scope.UGP_FormsConfirmationListZabete = dictionary.ToEnumerable().Select(s => s.Key).ToArray();
        }
        else
            $scope.DeleteUgpConfirmation(x.UGP_FormsConfirmation.NidFormsConfirmation, x);
    }
    $scope.SaveOwnerComment = function (x) {
        $scope.Prop.ErrorMessageComment = "";
        if ($scope.GamInputData.ReasonComment == undefined || $scope.GamInputData.ReasonComment == '') {
            $scope.Prop.ErrorMessageComment = 'توضیحات را وارد نمایید';
            $scope.$apply();
            return;
        }
        var d = {
            pDistrict: $scope.GamInputData.District,
            pNidProc: $scope.GamInputData.NidProc,
            pUGP_FormsConfirmationlist: [{ CitizenComments: $scope.GamInputData.ReasonComment }],
        }

        var c = JSON.stringify(d);
        StartBusy('divSendData', 'در حال دریافت اطلاعات');
        $.ajax({
            type: "POST",
            url: ServiceAddress + "SaveUGP_FormsConfirmation",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('divSendData');
                if (response.ErrorResult.BizErrors.length > 0) {
                    var tmpErrors = '';
                    $.each(response.ErrorResult.BizErrors, function (index, value) {
                        tmpErrors += value.ErrorTitel + '\r\n';
                    });
                    $scope.Prop.ErrorMessageComment = tmpErrors;
                }
                else {
                    $scope.Prop.ErrorMessageComment = 'اطلاعات با موفقیت ذخیره شد';
                    $scope.GetOwnerZabetehComment();
                    $scope.GamInputData.ReasonComment = '';

                    if ($scope.GamInputData.EumRequestStatus == 5) {
                        $('#btnSendToKartable').show();
                    }
                    GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
                }
                $scope.$apply();
            },
            failure: function (response) {
                StopBusy('divSendData');
            },
            error: function (response) {
                StopBusy('divSendData');
            }
        });
    }
    $scope.GetOwnerZabetehComment = function (x) {
        var d = {
            pDistrict: $scope.GamInputData.District,
            pNidProc: $scope.GamInputData.NidProc,
        }

        var c = JSON.stringify(d);
        StartBusy('divSendData', 'در حال دریافت اطلاعات');
        $.ajax({
            type: "POST",
            url: ServiceAddress + "GetUGP_FormsConfirmationList",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('divSendData');
                if (response.ErrorResult.BizErrors.length > 0) {
                    $scope.Prop.ErrorMessage = 'خطا در دریافت اطلاعات';
                }
                else {

                    //به خاطر این برداشته شد چون بعضی شهرها این مورد را ندارند
                    //if ($scope.GamInputData.rw == null)
                    //    $scope.GamInputData.rw = 0;

                    if ($scope.GamInputData.rw == 0 && response.UGP_FormsConfirmationList.length == 0) {
                        $scope.UGP_FormsConfirmationListZabete = [];

                        if ($scope.Base_UsingList != null)
                            //$scope.Base_UsingList.slice(0,5).forEach(element =>
                            $scope.Base_UsingList.forEach(element =>
                                $scope.UGP_FormsConfirmationListZabete.push({
                                    UGP_FormsConfirmation: {
                                        BuildingNo: (element.OutBase_Using != null ? element.OutBase_Using.BuildingNo : element.BuildingNo),
                                        FloorNoForZabeteh: (element.OutBase_Using != null ? element.OutBase_Using.FloorNo : element.FloorNo),
                                        CI_UsingGroup: (element.OutBase_Using != null ? element.OutBase_Using.CI_UsingGroup : element.CI_UsingGroup),
                                        CI_UsingType: (element.OutBase_Using != null ? element.OutBase_Using.CI_UsingType : element.CI_UsingType),
                                        InfrastructureArea: (element.OutBase_Using != null ? element.OutBase_Using.UsingArea : element.UsingArea),
                                        UnitCount: (element.OutBase_Using != null ? element.OutBase_Using.UnitCount : element.UnitCount),
                                        InfrastructureArea: (element.OutBase_Using != null ? element.OutBase_Using.UsingArea : element.UsingArea),
                                        EumFormsConfirmationType: 1,
                                        CI_RequirmentForZabeteh: 0,
                                    }
                                })
                            );
                    }
                    else {
                        $scope.UGP_FormsConfirmationList = Enumerable.From(response.UGP_FormsConfirmationList)
                            .Where(function (x) {
                                return ((x.UGP_FormsConfirmation.EumFormsConfirmationType == 0))
                            }).Select(function (x) {
                                return ((x.UGP_FormsConfirmation))
                            }).OrderBy("$.CreateDate").ThenBy("$.CreateTime").ToArray();
                        $scope.UGP_FormsConfirmationListZabete = Enumerable.From(response.UGP_FormsConfirmationList)
                            .Where(function (x) {
                                return ((x.UGP_FormsConfirmation.EumFormsConfirmationType == 1))
                            }).OrderByDescending("$.UGP_FormsConfirmation.FloorNoForZabeteh")
                            .OrderByDescending("$.CI_RequirmentForZabeteh")
                            .ToArray();

                        ({ UGP_FormsConfirmation: { EumFormsConfirmationType: 1, IsNew: true } });


                        if ($scope.UGP_FormsConfirmationListZabete.length == 0) {
                            $scope.UGP_FormsConfirmationListZabete = [
                                {
                                    UGP_FormsConfirmation: { EumFormsConfirmationType: 1, IsNew: true },
                                },
                            ]
                            $('#btnZabeteComment').prop('disabled', false);
                        }
                    }
                    $scope.$apply();

                    //$.each($scope.UGP_FormsConfirmationListZabete, function (ind, a) {
                    //    $.each($scope.CI_UsingType, function (i, el) {
                    //        $('#cmbCI_UsingType' + ind).append(new Option(el.Title, el.Id));
                    //    });
                    //});           

                    ReEvent();
                }
            },
            failure: function (response) {
                StopBusy('divSendData');
            },
            error: function (response) {
                StopBusy('divSendData');
            }
        });
    }
    $scope.SaveZabeteComment = function (x) {
        $scope.Prop.ErrorMessageComment = "";


        $scope.UGP_FormsConfirmationListZabeteNew = $scope.UGP_FormsConfirmationListZabete;

        //$scope.UGP_FormsConfirmationListZabeteNew = Enumerable.From($scope.UGP_FormsConfirmationListZabete)
        //    .Where(function (x) {
        //        return ((x.IsNew == true))
        //    }).ToArray();

        if ($scope.UGP_FormsConfirmationListZabeteNew.length == 0) {
            $scope.Prop.ErrorMessageComment = "نوع درخواست را مشخص نمایید ";
            return;
        }

        var LastIndex = $scope.UGP_FormsConfirmationListZabeteNew.length - 1;
        if ($scope.GamInputData.rw > 0 && $scope.UGP_FormsConfirmationListZabeteNew.length > 0 && ($scope.UGP_FormsConfirmationListZabeteNew[LastIndex].UGP_FormsConfirmation == null || $scope.UGP_FormsConfirmationListZabeteNew[LastIndex].UGP_FormsConfirmation.CI_RequirmentForZabeteh == null || $scope.UGP_FormsConfirmationListZabeteNew[LastIndex].UGP_FormsConfirmation.CI_RequirmentForZabeteh == undefined)) {
            $scope.Prop.ErrorMessageComment = "نوع درخواست را مشخص نمایید ";
            return;
        }



        $scope.UGP_FormsConfirmationListZabeteNew = Enumerable.From($scope.UGP_FormsConfirmationListZabeteNew)
            .Select(function (x) {
                return ((x.UGP_FormsConfirmation))
            }).ToArray();

        if ($scope.GamInputData.rw == 0) {
            $scope.UGP_FormsConfirmationListZabeteNew.forEach(element => element.CI_RequirmentForZabeteh = 0);
        }



        var tmpUgpZabete = JSON.parse(angular.toJson($scope.UGP_FormsConfirmationListZabeteNew))
        $scope.UGP_FormsConfirmationListZabeteNew = tmpUgpZabete;

        var d = {
            pDistrict: $scope.GamInputData.District,
            pNidProc: $scope.GamInputData.NidProc,
            pUGP_FormsConfirmationlist: $scope.UGP_FormsConfirmationListZabeteNew,
            pZabetehChideman: $scope.ZabetehChideman,
        }

        var c = JSON.stringify(d);
        StartBusy('divSendDatap', 'در حال ذخیره اطلاعات');
        $.ajax({
            type: "POST",
            url: ServiceAddress + "SaveUGP_FormsConfirmation",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('divSendDatap');
                if (response.ErrorResult.BizErrors.length > 0) {

                    var tmpErrors = '';
                    $.each(response.ErrorResult.BizErrors, function (index, value) {
                        tmpErrors += value.ErrorTitel + '\r\n';
                    });
                    $scope.Prop.ErrorMessageComment = tmpErrors;
                }
                else {
                    $scope.Prop.ErrorMessageComment = 'اطلاعات با موفقیت ذخیره شد';
                    $scope.GetOwnerZabetehComment();
                    $scope.GamInputData.FormConfirmationOK = true;
                    //$('#btnSendToKartable2').show();
                    //$('#btnZabeteComment').prop('disabled', true);
                    $scope.ErrorColor = 'green';
                }
                $scope.$apply();
            },
            failure: function (response) {
                StopBusy('divSendDatap');
                $scope.Prop.ErrorMessageComment = 'خطا در ذخیره اطلاعات';
                $scope.ErrorColor = 'red';
                $scope.$apply();
            },
            error: function (response) {
                StopBusy('divSendDatap');
                $scope.Prop.ErrorMessageComment = 'اطلاعات را صحیح وارد نمایید';
                $scope.ErrorColor = 'red';
                $scope.$apply();
            }
        });
    }
    $scope.ZabeteCommit = function (x) {
        StartBusyTimer('divSelect');
        $scope.GamInputData.ZabeteCommit = true;
        $scope.ErrorMessageCommit = 'پرونده تایید شد . میتوانید به گام بعدی بروید';
    }

    $scope.Quize = {
        FullLable: '',
        GetQuestionnaire: function (pIndex) {
            var tmpNidWorkflowDeff = $scope.GamInputData.NidWorkflowDeff;
            if (tmpNidWorkflowDeff == undefined)
                tmpNidWorkflowDeff = ClsMenu.ID;

            StartBusy1('در حال دریافت اطلاعات');
            var d = { pCode: $scope.GamInputData.CurrentNosaziCode, pNidNosaziCode: $scope.GamInputData.NidNosaziCode, pSelectedOptions: pIndex, pNidWorkFlowDeff: tmpNidWorkflowDeff };
            var c = JSON.stringify(d);
            var erMessage = ErrorMessageGam;

            $request = $.ajax({
                type: "POST",
                url: ServiceAddress + "GetQuestionnaire",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy1();

                    if ($scope.Functions.CheckError(msg)) {

                        $scope.$apply();
                        $scope.Questionnaire = msg.Questionnaire;

                    }

                    $scope.$apply();
                },
                error: function (c) {
                    $scope.Prop.ErrorMessage = erMessage;
                    StopBusy1();
                    GetScope().$apply();
                }
            });
        },

        NextQuiz: function (pId) {

            if (pId == undefined) {
                var selectdS2 = $('input[name=rdbQ]:checked').val();
                if (selectdS2 != undefined) {
                    {
                        $('#LMessageQ').text('');
                        var index = selectdS2.split('-')[1];

                        if ($scope.QuestionnaireHierarchy[index].HasNextLevel == true) {
                            $scope.QuestionnaireHierarchy = $scope.QuestionnaireHierarchy[index].NextLevel;
                            $scope.$apply();
                            $('#DivFinal').hide();
                        }
                        else {
                            $scope.GamInputData.QuestionnaireDetailFinal = $scope.QuestionnaireHierarchy[index];

                            $('#DivFinal').show();
                            $('#btnSelectWorkFlowOk').show();
                            $('#btnNext1').hide();
                        }
                    }
                }
                else {
                    $('#LMessageQ').text('لطفا یک مورد را انتخاب نمایید');
                    return;
                }
            }
            else {
                //--------------------------Old
                if (pId == 1) {
                    var selectdS2 = $('input[name=s1]:checked').val();
                    var label = $('input[value=' + selectdS2 + ']').next()[0].innerText;
                    this.FullLable += label + '   |    ';
                    if (selectdS2 == 's1-0')
                        $scope.Quize.GetQuestionnaire(0);
                    //$scope.QuestionnaireDetail = $scope.Questionnaire[0].AnswerQuestionMessageContractlist;
                    else if (selectdS2 == 's1-1')
                        $scope.Quize.GetQuestionnaire(1);
                    else if (selectdS2 == 's1-2')
                        $scope.Quize.GetQuestionnaire(2);
                    else {
                        $('#LMessageQ').text('لطفا یک مورد را انتخاب نمایید');
                        return;
                    }
                }

                if (pId == 2) {
                    var selectdS2 = $('input[name=s2]:checked').val();
                    var label = $('input[value=' + selectdS2 + ']').next()[0].innerText;
                    this.FullLable += label + '   |    ';

                    if (selectdS2 != undefined) {
                        var index = selectdS2.split('-')[1];
                        $scope.QuestionnaireDetail = $scope.Questionnaire[index].AnswerQuestionMessageContractlist;
                    }
                    else {
                        $('#LMessageQ').text('لطفا یک مورد را انتخاب نمایید');
                        return;
                    }
                }

                if (pId == 3) {
                    var selectdS3 = $('input[name=s3]:checked').val();
                    var label = $('input[value=' + selectdS3 + ']').next()[0].innerText;
                    this.FullLable += label + '   |    ';

                    if (selectdS3 != undefined) {
                        var index = selectdS3.split('-')[1];
                        $scope.GamInputData.QuestionnaireDetailFinal = $scope.QuestionnaireDetail[index];

                        $('#btnSelectWorkFlowOk').show();
                    }
                    else {
                        $('#LMessageQ').text('لطفا یک مورد را انتخاب نمایید');
                        return;
                    }
                }
                $('#DivQ' + pId).slideToggle();
                $('#DivQ' + (pId + 1)).slideToggle();
                $('#LMessageQ').text('')
                $scope.$apply();
            }
            //-------------------------------------
        },
        PreQuiz: function (pId) {
            $('#DivQ' + pId).slideToggle();
            $('#DivQ' + (pId - 1)).slideToggle();
        },
        Cancel: function (pId) {
            $scope.QuestionnaireHierarchy = $scope.QuestionnaireHierarchyOrg;
            $('#DivFinal').hide();
            $('#btnNext1').show();
        },
        SelectWorkFlow: function () {

            $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff = GetScope().GamInputData.QuestionnaireDetailFinal.NidWorkFlowDeff;
            $scope.GamInputData.SelectedWorkFlow.WorkflowTitel = GetScope().GamInputData.QuestionnaireDetailFinal.Answer;
            $scope.QuestionnaireHierarchy = $scope.QuestionnaireHierarchyOrg;
            $('#DivFinal').hide();
            $('#btnNext1').show();
            $('#exampleModal').modal('toggle');
            $scope.GamInputData.FullLable = this.FullLable;
        },

        GetWorkFlowQuestion: function () {
            StartBusy('SelectWorkFlow');
            var d = { pCode: $scope.GamInputData.CurrentNosaziCode, pNidNosaziCode: $scope.GamInputData.NidNosaziCode, pSelectedOptions: 0 };
            var c = JSON.stringify(d);
            $request = $.ajax({
                type: "POST",
                url: ServiceAddress + "GetQuestionnaire",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,
                success: function (msg) {
                    StopBusy('SelectWorkFlow');

                    if ($scope.Functions.CheckError(msg)) {
                        if (msg.Questionnaire.length > 0)
                            $scope.WorkFlowSelect = msg.Questionnaire;
                        //else
                        //if (msg.Questionnaire.length > 0)
                        //    $scope.WorkFlowSelect = msg.Questionnaire[0].AnswerQuestionMessageContractlist;
                        $scope.$apply();
                    }
                    else {
                        if (msg.ErrorResult.BizErrors.length > 0) {
                            if (msg.ErrorResult.BizErrors[0].ErrorKey == 'Stop')
                                $scope.WorkFlowSelect = null;
                        }
                    }

                    if ($scope.Functions.CheckError(msg)) {
                        if (msg.QuestionnaireHierarchy.length > 0) {
                            $scope.QuestionnaireHierarchyOrg = msg.QuestionnaireHierarchy;
                            $scope.QuestionnaireHierarchy = $scope.QuestionnaireHierarchyOrg;

                            $scope.$apply();


                            //$scope.FillArray(msg.QuestionnaireHierarchy,0);


                        }
                    }
                },
                error: function (c) {
                }
            });
        },
    };
    var Dic = {};
    $scope.QuestionnaireHierarchyList = [];

    $scope.FillArray = function (pList, pLevel, pl = 0) {
        angular.forEach(pList, function (parent, pIndex) {
            $scope.QuestionnaireHierarchyList.push({
                index: pLevel + '-' + pl + '-' + pIndex,
                Class: parent
            })

            if (parent.HasNextLevel == true) {
                pl = pLevel + 1;
                $scope.FillArray(parent.NextLevel, pLevel, pl);
            }

        });
    }

    $scope.EngFunc = {
        //لیست مهندسین ناظر
        GetEnginner: function (pNidProc) {
            $('#DivMohandes').removeClass('disabled');
            StartBusy1('در حال دریافت لیست مهندسین ناظر');
            $scope.$apply();
            var d = {
                pNidProc: $scope.GamInputData.NidProc,
            }
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetBase_ControllerInfo_EngineerSubSys",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    StopBusy1();

                    if (response.ErrorResult.BizErrors.length > 0) {
                        $scope.Prop.ErrorMessage = 'خطا در دریافت لیست مهندسین ناظر';
                        $scope.GreenColor = false;
                    }
                    else {
                        $scope.EngList = response.Base_ControllerInfo_EngineerSubSys;
                        var tmpEngInfoList = Enumerable.From($scope.EngList)
                            .Select("employee => { Name: employee.EngName + ' ' + employee.EngFamily ,Tell:employee.MobileNo,CI_Ability:employee.CI_Ability}")
                            .ToArray();
                        if ($scope.EngList.length > 0) {
                            $('btnOkEnginner').show();
                            $scope.GamInputData.ProcInitiator = $scope.EngList[0].ReferNidUser;
                            $scope.GamInputData.ProcInitiatorUserName = $scope.EngList[0].EngName + ' ' + $scope.EngList[0].EngFamily;
                            //$scope.GamInputData.EngMobileNo = $scope.EngList[0].MobileNo;

                            $scope.GamInputData.EngInfoList = tmpEngInfoList;

                            $scope.GreenColor = true;
                            $('#DivMohandes').removeClass('disabled');
                        }
                        else {
                            $scope.GreenColor = false;
                            $scope.Prop.ErrorMessage = 'مالک محترم ، جهت  اصلاح  ناظرین ساختمانی،  به شهرداری منطقه، اداره شهرسازی ، مراجعه نمایید';
                        }
                    }

                    $scope.$apply();
                },
                failure: function (response) {
                    StopBusy1();
                },
                error: function (response) {
                    StopBusy1();
                    $scope.Prop.ErrorMessage = "اطلاعات مهندس یافت نشد";
                    $scope.GreenColor = false;
                    $scope.$apply();
                }
            });

            $scope.$apply();
        },
        //لیست مهندسین . کسر سهمیه شیراز
        GetEnginnerQuata: function (pNidProc) {
            $('#DivMohandes').removeClass('disabled');
            StartBusy1('در حال دریافت لیست مهندسین ناظر');
            $scope.$apply();
            var d = {
                pNidProc: $scope.GamInputData.NidProc,
            }
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetBase_ControllerInfo_EngineerSubSys",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    StopBusy1();

                    if (response.ErrorResult.BizErrors.length > 0) {
                        $scope.Prop.ErrorMessage = 'خطا در دریافت لیست مهندسین ناظر';
                        $scope.GreenColor = false;
                    }
                    else {
                        $scope.EngList = response.Base_ControllerInfo_EngineerSubSys;
                        var tmpEngInfoList = Enumerable.From($scope.EngList)
                            .Select("employee => { Name: employee.EngName + ' ' + employee.EngFamily ,Tell:employee.MobileNo,CI_Ability:employee.CI_Ability}")
                            .ToArray();

                        $scope.GamInputData.EngInfoList = tmpEngInfoList;
                        if ($scope.EngList.length > 0) {

                            $scope.GreenColor = true;
                            //اگر کسر سهمیه انجام شود به شهرساز باید ارسال شود
                            $scope.SendToShahrsaz();
                        }
                        else {
                            $scope.GreenColor = false;
                            $scope.Prop.ErrorMessage = 'مالک محترم ، جهت  اصلاح  ناظرین ساختمانی،  به شهرداری منطقه، اداره شهرسازی ، مراجعه نمایید';
                        }
                    }

                    $scope.$apply();
                },
                failure: function (response) {
                    StopBusy1();
                },
                error: function (response) {
                    StopBusy1();
                    $scope.Prop.ErrorMessage = "خطا در ارسال اطلاعات";
                    $scope.GreenColor = false;
                    $scope.$apply();
                }
            });

            $scope.$apply();
        },
        //لیست مهندسین ذخیره شده در EngInfo
        GetEngInfo: function (x) {
            var d = {
                NidWorkItem: $scope.GamInputData.NidWorkItem,
            }

            var c = JSON.stringify(d);
            StartBusy('divSendData', 'در حال دریافت اطلاعات');
            $.ajax({
                type: "POST",
                url: 'Frmparvaneh.aspx/' + "GetEngInfo",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    StopBusy('divSendData');
                    if (response.d == null) {
                        $scope.Prop.ErrorMessage = 'خطا در دریافت اطلاعات';
                    }
                    else {
                        $scope.EngInfoList = response.d;
                        $scope.$apply();
                        $('#btnPre').hide();
                    }
                },
                failure: function (response) {
                    StopBusy('divSendData');
                },
                error: function (response) {
                    StopBusy('divSendData');
                }
            });
        },
        //لیست مهندسین ناظر یزد 
        GetEngineerYazdDafater: function () {
            $('#DivMohandes').removeClass('disabled');
            StartBusy1('در حال دریافت لیست مهندسین ناظر');
            $scope.$apply();
            if ($scope.GamInputData.FloorDone == undefined || $scope.GamInputData.FloorDone == '' || $scope.GamInputData.FloorDone == null)
                $scope.GamInputData.FloorDone = "0";
            if ($scope.GamInputData.BuildingType == undefined || $scope.GamInputData.BuildingType == '' || $scope.GamInputData.BuildingType == null)
                $scope.GamInputData.BuildingType = "0";
            if ($scope.GamInputData.foundation == undefined || $scope.GamInputData.foundation == '' || $scope.GamInputData.foundation == null)
                $scope.GamInputData.foundation = "0";

            var settings = {
                "url": "https://46.100.249.195:7000/shahrvand_separi/",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json",
                },

                "data": JSON.stringify({
                    "renovation_code": $scope.GamInputData.CurrentNosaziCode,
                    "secretariat_number": $scope.GamInputData.NidWorkItem,
                    "foundation": $scope.GamInputData.foundation,
                    "number_of_floors": $scope.GamInputData.FloorDone,
                    "building_type": $scope.GamInputData.BuildingType,
                    "owner_contact_number": $scope.ClsAccount.AccountInfo.OwnerTell, "owner_national_code": $scope.ClsAccount.AccountInfo.OwnerNationalCode,
                    "is_urban_planning_license_active": $scope.GamInputData.EumRequestStatus,
                    "urban_planning_license_type": $scope.GamInputData.SelectedWorkFlow.NidWorkflowDeff + ' | ' + $scope.GamInputData.SelectedWorkFlow.WorkflowTitel,
                    "owner_national_code": ClsAccount.AccountInfo.OwnerNationalCode,
                    "owner_firstname_and_lastname": ClsAccount.AccountInfo.OwnerFirstName + ' ' + ClsAccount.AccountInfo.OwnerLastName,
                    "license_issuer_reference": 'شهرداری منطقه ' + $scope.GamInputData.District,
                    "area": $scope.GamInputData.District

                }),
            };

            $.ajax(settings).done(function (response) {
                StopBusy1();

                $scope.EngDafaterList = shuffleArray(response);
                $scope.EngDafaterListAll = $scope.EngDafaterList;
                $scope.$apply();
            });
            $.ajax(settings).fail(function (response) {
                StopBusy1();
            });

            $scope.$apply();
        },
        //انتخاب دفتر 
        SelectDaftar: function (x, pthis) {
            $scope.GamInputData.SelectDaftar = x;
            x.IsSelect = true;
        },
        //ارسال دفتر انتخاب شده به سرویس مهندسین ناظر
        OfficeSelection: function () {
            $('#DivMohandes').removeClass('disabled');
            StartBusy1('در حال ارسال دفاتر به سرویس مهندس ناظر');
            $scope.$apply();
            var settings = {
                "url": "https://46.100.249.195:7000/office_celection/",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json",
                },

                "data": JSON.stringify({ "secretariat_number": $scope.GamInputData.NidWorkItem, "owner_national_code": $scope.ClsAccount.AccountInfo.OwnerNationalCode, "office_id": $scope.GamInputData.SelectDaftar.daf_id }),
            };

            $.ajax(settings).done(function (response) {
                StopBusy1();
                $scope.Prop.ErrorMessage = "دفتر مورد نظر انتخاب شد . تا 48 ساعت دیگر نتیجه آن اعلام میگردد";

                $scope.EngFunc.SaveOffice($scope.GamInputData.SelectDaftar);
                $scope.$apply();
            });
            $.ajax(settings).fail(function (response) {
                StopBusy1();
            });
        },
        //دریافت دفتر ذخیره شده در دیتابیس UGP
        GetOffice: function (pOffice) {

            var d = {
                pNidWorkItem: $scope.GamInputData.NidWorkItem
            }
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: "UTransferGam.aspx/GetOffice",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    $scope.GamInputData.SelectDaftar = response.d;
                    $scope.$apply();
                },
            });
        },
        //ذخیره دفتر در دیتابیس
        SaveOffice: function (pOffice) {
            pOffice.NidWorkItem = $scope.GamInputData.NidWorkItem;

            var d = {
                pEngOffice: pOffice
            }
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: "UTransferGam.aspx/SaveOffice",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {

                },
            });
        },
    }

    $scope.GetCI_List = function (pCI_Name, pCI) {
        var CurrentDic = Dic[pCI_Name];
        if (CurrentDic == undefined) {
            var d = {
                PCiName: pCI_Name
            }

            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: CI_Service + "GetCI",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {
                    Dic[pCI_Name] = msg;

                    $scope.$apply();
                },
                error: function (c) {

                }
            });
        }
        else {
            var CurrentDic = Dic[pCI_Name];
            $scope.CI_list = CurrentDic;
            var tmpTile = Enumerable.From($scope.CI_list)
                .Where(function (x) { return x.Id == pCI })
                .Select(function (x) { return (x.Title) })
                .FirstOrDefault();
            return tmpTile;
        }
    }
    $scope.GetCI = function (pCI_Name, pCIData) {
        var CurrentDic = Dic[pCI_Name];
        if (CurrentDic == undefined) {
            var d = {
                PCiName: pCI_Name
            }

            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: CI_Service + "GetCI",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {
                    Dic[pCI_Name] = msg;
                    $scope.$apply();
                },
                error: function (c) {

                }
            });
        }
        else {
            var CurrentDic = Dic[pCI_Name];
            $scope.CI_list = CurrentDic;
            var tmpTile = Enumerable.From($scope.CI_list)
                .Where(function (x) { return x.Id == pCIData })
                .Select(function (x) { return (x.Title) })
                .FirstOrDefault();
            return tmpTile;
        }
    }
    $scope.GetCI_ListCombo = function (pCI_Name) {
        var tmpList = Dic[pCI_Name];
        return tmpList;
    }

    $scope.GetCI_ListCombo2 = function (pCI_Name) {
        var tmpList = Dic[pCI_Name];
        if (tmpList != undefined) {
            if (tmpList.GetCIResult != undefined)
                return tmpList.GetCIResult;
            else
                return tmpList;
        }
        else return null;
    }


    $scope.GetCI_List2 = function (pCI_Name, callback) {
        var CurrentDic = Dic[pCI_Name];
        if (CurrentDic == undefined) {
            var d = {
                PCiName: pCI_Name
            }

            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: CI_Service + "GetCI",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {
                    Dic[pCI_Name] = msg;

                    $scope.$apply();
                    callback(Dic[pCI_Name]);
                },
                error: function (c) {

                }
            });
        }
        else {
            var CurrentDic = Dic[pCI_Name];
            callback(CurrentDic);
        }
    }


    $scope.GetADP_List = function () {


        var tmpSC = GetUrlByDomain(SrvSC, 1);
        $.ajax({
            type: "POST",
            url: tmpSC + "GetADP_UsingTypeList",

            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,

            success: function (msg) {
                $scope.ADP = msg.ADP_UsingTypeList;
                $scope.$apply();
            },
            error: function (c) {

            }
        });

    }





    LoadOutSideFunction();
    // $scope.WorkFlowSelect = (typeof (WorkFlowSelect) != 'undefined' ? WorkFlowSelect : null);
    $scope.ShowPishFactor = function (x) {
        var tmpStr = "RptInvoice&ReportParameter=NidProc;" + GetScope().GamInputData.NidProc + ",District;" + GetScope()
            .GamInputData.District + ",TokenKey;"

        window.open(FactorUrl + tmpStr, '_blank');
    }
    $scope.SendToShahrsaz = function (x, pOk = true) {

        var tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];

        if (x == 3) { // مکاتبات
            if (tmpCurrentStep.Name != "MokatebatDastoor") {//اگر این گام بود چک نشود برای شیراز
                //اگر نامه های برون سازمانی وجود نداشته باشد باید ارسال به شهرداری کار کند 
                if ($scope.GamInputData.MustUploadLetterCount != undefined && $scope.GamInputData.MustUploadLetterCount < $scope.LetterList_OUT.length
                    || (($scope.GamInputData.MustUploadLetterCount == undefined || $scope.GamInputData.MustUploadLetterCount == null) && $scope.LetterList_OUT.length > 0)
                ) {
                    $scope.Prop.ErrorMessage = 'لطفا نامه های برون سازمانی را بارگذاری نمایید';

                    return;
                }
                else if ($scope.GamInputData.UploadDwg != true) {
                    $scope.Prop.ErrorMessage += '\r\n' + 'فایل پیش نقشه باید بارگذاری شود';
                    LetterRes = false;
                }
            }
        }
        if (x == 1 && pOk == false) { // عدم تایید شناسنامه فنی- چک ک ردن بارگذاری مدارک
            if ($scope.GamInputData.UploadShFaniOk != true) {
                $scope.Prop.ErrorMessageComment = 'مدارک لازم برای دلیل عدم تایید را ارسال نمایید';
                $scope.ErrorColor = 'red';
                return;
            }
        }

        //در گام ارایه نقشه ارسال به شهرداری - اگر نقشه بارگذاری نشده بود هم باید کار کند 
        //if (x == 4) { 
        //    if ($scope.GamInputData.MustUploadLetterCountCom == undefined || $scope.GamInputData.MustUploadLetterCountCom < $scope.LetterList_Com.length) {
        //        $scope.Prop.ErrorMessage = 'لطفا نقشه های ساختمانی را بارگذاری نمایید';
        //        return;
        //    }
        //}
        if (x == 5) { // عدم تایید شناسنامه فنی- چک ک ردن بارگذاری مدارک
            if ($scope.GamInputData.MustUploadLetterCountNew == undefined || $scope.GamInputData.MustUploadLetterCountNew < $scope.LetterList_New.length) {
                $scope.Prop.ErrorMessage = 'لطفا نقصی مدارک را کامل نمایید';
                return;
            }
        }

        $scope.Prop.ErrorMessage = null;
        var d = {
            pDomain: $scope.GamInputData.District,
            pNidProc: $scope.GamInputData.NidProc,
        }
        var c = JSON.stringify(d);

        StartBusy('MainGam', 'در حال ارسال پرونده');
        $.ajax({
            data: c,
            type: "POST",
            url: ServiceAddress + "ExitFromTemporaryKartabl",
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,

            success: function (response) {
                StopBusy('MainGam');

                if (response.ErrorResult.BizErrors.length > 0) {
                    $scope.Prop.ErrorMessageComment = 'خطا در ارسال پرونده';
                    $scope.ErrorColor = 'red';
                }
                else {
                    $scope.ErrorColor = 'green';
                    $scope.Prop.ErrorMessageComment = 'پرونده با موفقیت ارسال شد';
                    $('#btnSendToKartable').prop('disabled', true);
                    $('#btnSendToKartable2').prop('disabled', true);
                    $('#DivExport').addClass('disabled');
                    $('#divLetters').addClass('disabled', true);
                    $('#divShZabete').addClass('disabled');
                    $('#DivComm').addClass('disabled');

                    if (pOk) {
                        if ($scope.GamInputData.ShFaniOk == 'true' && $scope.GamInputData.SendToShahrsazOk != true) {
                            $scope.GamInputData.SendToShahrsazOk = true;
                            $scope.Functions.ConfirmOnFormsConfirmation(0);
                        }
                        else if (x == 2) {
                            $scope.GamInputData.SendToShahrsazOk2 = true;
                            $scope.Functions.ConfirmOnFormsConfirmation(1);//zabete

                            //Yazd #377
                            $scope.Prop.ErrorMessageComment = 'تغییرات مورد نظر شما توسط کارشناس شهرداری بررسی و نتیجه پیامک می شود';
                        }
                        if (x == 3) {
                            $scope.GamInputData.SendToShahrsazOk3 = true;
                        }
                        if (x == 4) {
                            $scope.GamInputData.SendToShahrsazOk4 = true;
                        }
                        if (x == 5) {
                            $scope.GamInputData.SendToShahrsazOk5 = true;
                        }

                    }

                    GamPlugin.SavelocalStorage($scope.Config.ScopeName, $scope.GamInputData);
                }
                $scope.$apply();
            },
            error: function (c) {
                StopBusy('MainGam');
                $scope.Prop.ErrorMessageComment = 'خطا در اجرای عملیات';
                $scope.$apply();
            }
        });
    }

    $scope.SearchDaftar = function () {

        var tmpVal = $('#txtSearchDaftar').val();

        if (tmpVal == '')
            $scope.EngDafaterList = $scope.EngDafaterListAll;
        else {
            $scope.EngDafaterList = Enumerable.From($scope.EngDafaterListAll)
                .Where(function (x) {
                    return ((x.ozv_name.indexOf(tmpVal) > -1 || x.daf_name.indexOf(tmpVal) > -1))
                }).ToArray();
        }
        $scope.$apply();
    }

    $scope.DeleteUgpConfirmation = function (pNid, x) {
        var txt;
        var r = confirm("آیا مطمئن هستید؟");
        if (r == true) {
            var d = {
                pNidFormsConfirmation: pNid,
                pDistrict: $scope.GamInputData.District,
            }
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: ServiceAddress + "DeleteUGP_FormsConfirmation ",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    dictionary = Enumerable.From($scope.UGP_FormsConfirmationListZabete).ToDictionary();

                    dictionary.Remove(x);
                    $scope.UGP_FormsConfirmationListZabete = dictionary.ToEnumerable().Select(s => s.Key).ToArray();
                    $scope.$apply();
                },
            });
        } else {

        }
    }
    $scope.myFunction = function (p, index) {

        var tmpWS = Enumerable.From(GetScope().ADP)
            .Where(function (x) { return x.CI_UsingGroup == p })
            .Select(function (x) { return x.CI_UsingType }).ToArray();

        var tmpWS1 = Enumerable.From(GetScope().CI_UsingType)
            .Where(function (x) {
                return Enumerable.From(tmpWS).Contains(x.Id)
            }).ToArray();

        $('#cmbCI_UsingType' + index).empty();
        $.each(tmpWS1, function (i, el) {
            $('#cmbCI_UsingType' + index).append(new Option(el.Title, el.Id));
        });


        //GetScope().CI_UsingType = tmpWS1;
        GetScope().$apply();
    }
}];
//----------------------------------------------------------

//==================================================Gam Plugin


//$(window).load(function () {
//    GamPlugin.init();
//});
function onLoadDivMap() {
    if (CurrentStep == 1)
        GetScope().Functions.LoadPage(CurrentStep);
}

//==================================================
function GetScope() {
    return angular.element(document.getElementById('MainGam')).scope();
}
var shuffleArray = function (array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}
function StartBusy1(pMessage) {
    if (pMessage == undefined)
        pMessage = 'لطفا منتظر بمانید...';

    StartBusy('MainGam', pMessage);
}
function StopBusy1() {
    StopBusy('MainGam');
}

//========================================================
function rwClick(pIndex) {

    GetScope().ErrorMessageCommit = '';
    $('#rw2Div').hide();
    $('#rw3Div').hide();
    $('#btnFinalApproval').hide();

    if (pIndex == 0) {

        //$('#divSendDatap').hide();
        $('#btnFinalApproval').show();
        GetScope().GamInputData.ParvanehOk = 'true';
    }
    else if (pIndex == 1) {
        $('#rw2Div').show();
        $('#divSendDatap').show();
        GetScope().GamInputData.ParvanehOk = 'false';
        GetScope().RequestType2 = Enumerable.From(GetScope().RequestType)
            .Where(function (x) {
                return ((x.index == pIndex))
            }).ToArray();
    }
    else if (pIndex == 2) {
        $('#rw3Div').show();
        $('#divSendDatap').show();
        GetScope().GamInputData.ParvanehOk = 'false';
        //GetScope().RequestType2 = ['درخواست اضافه بنا', 'اضافه واحد', 'اضافه طبقه'];
        GetScope().RequestType2 = Enumerable.From(GetScope().RequestType)
            .Where(function (x) {
                return ((x.index == pIndex))
            }).ToArray();

        GetScope().Functions.GetTavafoghat();
    }
    GetScope().$apply();
    GetScope().GamInputData.rw = pIndex;
    GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
}

function openCity(evt, pDiv) {

    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(pDiv).style.display = "block";
    evt.currentTarget.className += " active";

    if (pDiv == 'Letter2')
        GetScope().Functions.ShowArchiveLetter();
    if (pDiv == 'Sh')
        GetScope().Functions.ShowArchive();
}

var s1 = 'asc';
var s2 = 'asc';
function EnterDaftar(p) {

    if (p.key == 'Enter') {
        GetScope().SearchDaftar();
    }
}
function sortTable(n) {

    StartBusyTimer();

    var SortField = '';
    if (n == 1) {
        SortField = '$.daf_id';
        if (s1 == 'asc')
            s1 = 'desc';
        else s1 = 'asc';

    }

    if (n == 2) {
        SortField = '$.daf_name';
        if (s2 == 'asc')
            s2 = 'desc';
        else s2 = 'asc';
    }
    if (n == 1) {
        if (s1 == "asc")
            GetScope().EngDafaterList = Enumerable.From(GetScope().EngDafaterList)
                .OrderBy(SortField)
                .ToArray();
        else
            GetScope().EngDafaterList = Enumerable.From(GetScope().EngDafaterList)
                .OrderByDescending(SortField)
                .ToArray();
        GetScope().$apply()
    }
    if (n == 2) {
        if (s2 == "asc")
            GetScope().EngDafaterList = Enumerable.From(GetScope().EngDafaterList)
                .OrderBy(SortField)
                .ToArray();
        else
            GetScope().EngDafaterList = Enumerable.From(GetScope().EngDafaterList)
                .OrderByDescending(SortField)
                .ToArray();
        GetScope().$apply()
    }

    return;


    StartBusy('GridView1');
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("GridView1");
    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc";
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 1; i < (rows.length - 1); i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /*check if the two rows should switch place,
            based on the direction, asc or desc:*/

            if (dir == "asc" && y != undefined && x != undefined) {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc" && x != undefined && y != undefined) {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /*If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again.*/
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }

    StopBusy('GridView1');
}


function myFunction(p) {

    var tmpWS = Enumerable.From(GetScope().ADP)
        .Where(function (x) { return x.CI_UsingGroup == p })
        .Select(function (x) { return x.CI_UsingType }).ToArray();

    var tmpWS1 = Enumerable.From(GetScope().CI_UsingType)
        .Where(function (x) {
            return Enumerable.From(tmpWS).Contains(x.Id)
        }).ToArray();


    GetScope().CI_UsingType = tmpWS1;
    GetScope().$apply();


    //var tmpl = $(document.getElementById('cmbCI_UsingType').options);

    //var tmpWS1 = Enumerable.From(tmpl)
    //    .Where(function (x) {
    //        return Enumerable.From(tmpWS).Contains(x.value)
    //    }).ToArray();

    //var tmpWS2 = Enumerable.From(tmpl)
    //    .Where(function (x) {
    //        return Enumerable.From(tmpWS).Contains(404)
    //    }).ToArray();



    //var tmpWS211 = Enumerable.From(tmpl)
    //    .Where(function (x) {
    //        return Enumerable.From(tmpWS).Contains(404)
    //    }).ToArray();



    //var tmpWS21 = Enumerable.From(tmpl)
    //    .Where(function (x) {
    //        return x.value==(404)
    //    }).ToArray();


    //var tmpWS3 = Enumerable.From(tmpl)
    //    .Where(function (x) {
    //        return Enumerable.From(tmpWS).Contains("404")
    //    }).ToArray();


}

