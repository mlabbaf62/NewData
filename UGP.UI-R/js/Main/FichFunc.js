//ضعیت فیش EumFicheStatus
//0 = صدور موقتی
//1 = صدور قطعی
//2 = چاپ فیش
//3 = تایید
//4 = ابطال

var FishFunc = new function () {
    var MustCheckConfirmManager = false;
    var ResPay = null;
    this.LoadFich = function () {

        var RequestId = getParameterByName("RequestId");
        if (RequestId != '') {
            var tmpResPay = FishFunc.GetPaymentInfo(RequestId);
            if (tmpResPay != null) {
                FishFunc.ResPay = tmpResPay;
                if (tmpResPay.BackFromBank == true) {
                    FishFunc.BackFromBank = true;
                    var tmpGamScope = GamPlugin.GetlocalStorage(GetScope().Config.ScopeName);
                    if (tmpGamScope != null)
                        GetScope().GamInputData = tmpGamScope;

                    GetScope().GamInputData.FicheRes.TrackingCode = tmpResPay.TrackingCode;
                    var tmpIsTruePayment = false;
                    var tmpPaymentMessage = 'پرداخت انجام نشده است';
                    if (tmpResPay.IsTruePayment == true || (tmpResPay.TrackingCode != '' && tmpResPay.TrackingCode != null)) {
                        tmpIsTruePayment = true;
                        tmpPaymentMessage = 'پرداخت با موفقیت انجام شد';
                    }

                    var tmpCurrentFich = null;
                    if (tmpResPay.FicheType == 1)
                        tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishList)
                            .Where(function (x) {
                                return ((x.Duty_fiche.FicheNo == tmpResPay.FicheNo));
                            }).FirstOrDefault();
                    else if (tmpResPay.FicheType == 2)
                        tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListSenfi)
                            .Where(function (x) {
                                return ((x.Duty_fiche.FicheNo == tmpResPay.FicheNo));
                            }).FirstOrDefault();

                    else if (tmpResPay.FicheType == 3)
                        tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListPasmand)
                            .Where(function (x) {
                                return ((x.Duty_fiche.FicheNo == tmpResPay.FicheNo));
                            }).FirstOrDefault();
                    else if (tmpResPay.FicheType == 4)
                        tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListDarAmad)
                            .Where(function (x) {
                                return ((x.FicheNo == tmpResPay.FicheNo || (x.Income_Fiche != undefined && x.Income_Fiche.FicheNo == tmpResPay.FicheNo)));
                            }).FirstOrDefault();

                    else if (tmpResPay.FicheType == 5)
                        tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListAvarezDarAmad)
                            .Where(function (x) {
                                return ((x.FicheNo == tmpResPay.FicheNo || (x.Income_Fiche != undefined && x.Income_Fiche.FicheNo == tmpResPay.FicheNo)));
                            }).FirstOrDefault();

                    //if (tmpResPay.FicheType == 1)
                    //    tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishList)
                    //        .Where(function (x) {
                    //            return ((x.Duty_fiche.PaymentID == tmpResPay.PaymentID));
                    //        }).FirstOrDefault();
                    //else if (tmpResPay.FicheType == 3)
                    //    tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListPasmand)
                    //        .Where(function (x) {
                    //            return ((x.Duty_fiche.PaymentID == tmpResPay.PaymentID));
                    //        }).FirstOrDefault();
                    //else if (tmpResPay.FicheType == 4)
                    //    tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListDarAmad)
                    //        .Where(function (x) {
                    //            return ((x.PaymentID == tmpResPay.PaymentID || (x.Income_Fiche != undefined && x.Income_Fiche.PaymentID == tmpResPay.PaymentID)));
                    //        }).FirstOrDefault();

                    //else if (tmpResPay.FicheType == 5)
                    //    tmpCurrentFich = Enumerable.From(GetScope().GamInputData.FishListAvarezDarAmad)
                    //        .Where(function (x) {
                    //            return ((x.PaymentID == tmpResPay.PaymentID || (x.Income_Fiche != undefined && x.Income_Fiche.PaymentID == tmpResPay.PaymentID)));
                    //        }).FirstOrDefault();





                    if (tmpCurrentFich != null && tmpIsTruePayment) {
                        //   GetScope().GamInputData.FicheRes.HasError = false;
                        tmpCurrentFich.Result = {};
                        tmpCurrentFich.Result.isTruePayment = true;
                        tmpCurrentFich.Result.PaymentMessage = tmpPaymentMessage;
                        tmpCurrentFich.Result.BillID = tmpResPay.BillID;
                        tmpCurrentFich.Result.PaymentID = tmpResPay.PaymentID;
                        tmpCurrentFich.Result.SaleReferenceId = tmpResPay.TrackingCode;
                        tmpCurrentFich.Result.Price = tmpResPay.Price;
                        tmpCurrentFich.Result.Price = tmpResPay.Price;

                        SendSMSGam(tmpResPay.FicheType, tmpResPay.Price, tmpResPay.TrackingCode);
                    }

                    GetScope().$apply();
                    GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    //FishFunc.ClearPaymentInfo(RequestId);

                }
            }
        }
        //if (FirstAvarez)
        //    ShowAvarez();
        //else {
        //تایید مدیر بعد از ثبت درخواست است
        var tmpCurrentStep = null;
        if (typeof (GamsArray) != 'undefined') {
            tmpCurrentStep = GamsArray[GamPlugin.CurrentStep];//بعضی فرم ها 2 تا عوارض دارند
            //    tmpCurrentStep = Enumerable.From(GamsArray).Where(function (x) { return ((x.Name == EumPage.Avarez)) }).FirstOrDefault();

            //=============================================================================
            if (tmpCurrentStep != null && tmpCurrentStep.AvarezType != undefined) {
                if (tmpCurrentStep.AvarezType.toString().indexOf(1) > -1) {
                    GetScope().GamInputData.ShowFicheNosazi = true;
                    GetScope().GamInputData.ShowFichePasmand = false;
                    GetScope().GamInputData.ShowFicheDarAmad = false;
                }
                if (tmpCurrentStep.AvarezType.toString().indexOf(2) > -1)
                    GetScope().GamInputData.ShowFichePasmand = true;
                if (tmpCurrentStep.AvarezType.toString().indexOf(3) > -1)
                    GetScope().GamInputData.ShowFicheDarAmad = true;
                if (tmpCurrentStep.AvarezType.toString().indexOf(4) > -1)
                    GetScope().GamInputData.ShowFicheAvarezDarAmad = true;
                if (tmpCurrentStep.AvarezType.toString().indexOf(5) > -1)
                    GetScope().GamInputData.ShowFicheSenfi = true;

            }
            if (tmpCurrentStep.CalculateDarAmad != undefined)
                GetScope().GamInputData.CalculateDarAmad = tmpCurrentStep.CalculateDarAmad;
            else GetScope().GamInputData.CalculateDarAmad = false;

            if (tmpCurrentStep.AlwaysCalculate != undefined)
                GetScope().GamInputData.AlwaysCalculate = tmpCurrentStep.AlwaysCalculate;
            else GetScope().GamInputData.AlwaysCalculate = false
        }
        //=============================================================================
        ////اگر احتیاج به بازدید نباشد تایید مدیر نمیشود - برای اصفهان
        //if ((tmpCurrentStep != null && tmpCurrentStep.IsConfirmManager == true) && (GetScope().GamInputData.IsRequireBazdid == undefined || (GetScope().GamInputData.IsRequireBazdid != undefined && GetScope().GamInputData.IsRequireBazdid == true)))
        //    CheckIsDoneManagerConfirm(tmpCurrentStep.CI_Confirm);
        //else {
        //    if (FishFunc.ResPay == null || (FishFunc.BackFromBank == true && FishFunc.ResPay != null && FishFunc.ResPay.FicheType == 0))
        //        ShowAvarez();
        //    if (GetScope().GamInputData.NidWorkItem > 0)
        //        GamPlugin.HidePreButton();
        //}


        if (FishFunc.ResPay == null || (FishFunc.BackFromBank == true && FishFunc.ResPay != null && FishFunc.ResPay.FicheType == 0))
            ShowAvarez();
        if (GetScope().GamInputData.NidWorkItem > 0)
            GamPlugin.HidePreButton();


    };
    this.LoadFichKarshenasi = function () {

        var RequestId = getParameterByName("RequestId");
        var tmpResPay = FishFunc.GetPaymentInfo(RequestId);
        if (tmpResPay != null) {
            if (tmpResPay.BackFromBank == true) {

                GetScope().GamInputData.FicheRes.TrackingCode = tmpResPay.TrackingCode;
                var tmpIsTruePayment = false;
                var tmpPaymentMessage = 'پرداخت انجام نشده است';
                if (tmpResPay.IsTruePayment == true || (tmpResPay.TrackingCode != '' && tmpResPay.TrackingCode != null)) {
                    tmpIsTruePayment = true;
                    tmpPaymentMessage = 'پرداخت با موفقیت انجام شد';
                }

                if (tmpResPay.FicheType == 0) {//HKc

                    if (tmpResPay.IsTruePayment == true) {
                        GetScope().GamInputData.FicheRes.isHKTruePayment = true;
                        GetScope().GamInputData.FicheRes.PaymentMessage = 'پرداخت با موفقیت انجام شد';
                        GetScope().InsertPaymentLog(true, tmpResPay.TrackingCode);
                        SendSMSGam(0, tmpResPay.Price, tmpResPay.TrackingCode);
                    }
                    else {
                        GetScope().InsertPaymentLog(false, tmpResPay.TrackingCode);
                        GetScope().GamInputData.FicheRes.isHKTruePayment = false;
                    }
                }

                GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                FishFunc.ClearPaymentInfo(RequestId);

            }
        }
    };

    this.BackFromBank = false;

    var GetSignature = function () {
        $.ajax({
            type: "POST",
            url: "USHowFishj.aspx/GetSignature",
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                RequestGuid = msg.d.Result.RequestID;
                EncryptCode = msg.d.Result.EncryptCode;

                ShowFichDarAmad();
                ShowFichAvarezDarAmad();
            },
            error: function () {

            }
        });
    };
    var ShowAvarez = function () {
        GetScope().GamInputData.FicheRes.ErrorMessageNosazi = '';

        if (GetScope().GamInputData.CurrentNosaziCode == undefined || GetScope().GamInputData.CurrentNosaziCode == '')
            return;

        GetScope().GamInputData.FicheRes.HasError = false;

        ShowFichNosazi();
        GetSignature();//Daramad
        ShowFichPasmand();
        ShowFichSenfi();
    };
    var ShowFichNosazi = function () {

        if (FishFunc.BackFromBank == false) {
            var tmpNidWorkItem = 0;
            if (GetScope().GamInputData.NidWorkItem != '')
                tmpNidWorkItem = GetScope().GamInputData.NidWorkItem;

            //  GetScope().GamInputData.FishList = null;
            var tmpIsCalcInRevisit = false;
            if (tmpNidWorkItem == 0)
                IsCalcInRevisit = false;
            else
                tmpIsCalcInRevisit = IsCalcInRevisit;
            if (GetScope().GamInputData.ShowFicheNosazi == false) {
                return;
            }

            //برای اینکه اگه پرداخت شده بود دوباره فیش لود نشود
            if (GetScope().GamInputData.FishList != undefined && GetScope().GamInputData.FishList != null && GetScope().GamInputData.FishList.length > 0)
                if (GetScope().GamInputData.FishList[0].Result != undefined && GetScope().GamInputData.FishList[0].Result.isTruePayment == true)
                    return;

            //برای این برداشه شد چون فیش پرداخت شده بود و دوباره فیش را میاورد
            //گاهی اوقات فیش از شهرداری پرداخت میشود . باید هر سری کال شود 
            //if (GetScope().GamInputData.FishList != null) {
            //    CheckPayFich(GetScope().GamInputData.FishList);
            //    return;
            //}


            var d = { pCode: GetScope().GamInputData.CurrentNosaziCode, pDutyType: 1, pNidWorkItem: tmpNidWorkItem, pIsCalcInRevisit: tmpIsCalcInRevisit, pNidWorkFlowDeff: GetScope().GamInputData.SelectedWorkFlow.NidWorkflowDeff };
            var c = JSON.stringify(d);
            GetScope().Prop.ErrorMessage = null;
            GetScope().Prop.ErrorMessage2 = null;

            GetScope().isBusy = true;
            GetScope().$apply();
            GetScope().GamInputData.FishList = null;
            StartBusy('MainGam', 'درحال محاسبه بدهی عوارض نوسازی');
            $.ajax({
                type: "POST",
                url: ServiceAddress + "CalculateDutyNosaziAndFicheList",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {
                    GetScope().isBusy = false;
                    StopBusy('MainGam');
                    if (msg.ErrorResult.BizErrors.length > 0) {

                        $(msg.ErrorResult.BizErrors).each(function (index, item) {
                            if (item.ErrorAction == 0)//stop
                                GetScope().GamInputData.FicheRes.HasError = true;
                        });



                        GetScope().GamInputData.FicheRes.ErrorMessageNosazi = msg.ErrorResult.BizErrors[0].ErrorTitel;
                        GetScope().ErrorColorN = 'red';
                    }
                    else if (msg.CalculateDutyAndFicheList == null) {
                        GetScope().GamInputData.FicheRes.HasError = true;
                        GetScope().GamInputData.FicheRes.ErrorMessageNosazi = 'کد نوسازی معتبر نمیباشد';
                        GetScope().ErrorColorN = 'red';
                    }
                    else if (msg.CalculateDutyAndFicheList.length == 0) {
                        GetScope().GamInputData.FicheRes.ErrorMessageNosazi = 'این کد نوسازی فاقد بدهی است';
                        GetScope().ErrorColorN = 'green';
                    }
                    else {
                        GetScope().GamInputData.FishList = msg.CalculateDutyAndFicheList;
                    }
                    GetScope().$apply();
                    GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                },
                error: function () {

                    StopBusy('MainGam');
                    alert('خطا در اجرای سرویس عوارض');
                    GetScope().GamInputData.FicheRes.HasError = true;
                }
            });
        }
    };
    var ShowFichPasmand = function () {
        GetScope().GamInputData.FicheRes.ErrorMessagePasmand = '';
        if (GetScope().GamInputData.ShowFichePasmand) {


            //برای اینکه اگه پرداخت شده بود دوباره فیش لود نشود
            if (GetScope().GamInputData.FishListPasmand != undefined && GetScope().GamInputData.FishListPasmand != null && GetScope().GamInputData.FishListPasmand.length > 0)
                if (GetScope().GamInputData.FishListPasmand[0].Result != undefined && GetScope().GamInputData.FishListPasmand[0].Result.isTruePayment == true)
                    return;


            if (FishFunc.BackFromBank == false) {

                //فیش جدید لود میشود
                GetScope().GamInputData.FishListPasmand = null;

                var tmpNidWorkItem = 0;
                if (GetScope().GamInputData.NidWorkItem != '')
                    tmpNidWorkItem = GetScope().GamInputData.NidWorkItem;

                var d = { pCode: GetScope().GamInputData.CurrentNosaziCode, pDutyType: 3, pIsCalcInRevisit: IsCalcInRevisit, pNidWorkItem: tmpNidWorkItem };
                var c = JSON.stringify(d);
                GetScope().Prop.ErrorMessage = null;

                StartBusy('DivFichPasmand', 'درحال محاسبه فیش پسماند');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "CalculateDutyNosaziAndFicheList",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        GetScope().isBusy = false;
                        StopBusy('DivFichPasmand');
                        if (msg.ErrorResult.BizErrors.length > 0) {

                            $(msg.ErrorResult.BizErrors).each(function (index, item) {
                                if (item.ErrorAction == 0)//stop
                                    GetScope().GamInputData.FicheRes.HasError = true;
                            });

                            GetScope().GamInputData.FicheRes.ErrorMessagePasmand = msg.ErrorResult.BizErrors[0].ErrorTitel;
                            GetScope().ErrorColorP = 'red';
                        }
                        else {
                            if (msg.CalculateDutyAndFicheList == null) {
                                GetScope().GamInputData.FicheRes.HasError = true;
                                GetScope().GamInputData.FicheRes.ErrorMessagePasmand = 'کد نوسازی معتبر نمیباشد';
                                GetScope().ErrorColorP = 'red';
                            }
                            else if (msg.CalculateDutyAndFicheList.length == 0) {
                                GetScope().GamInputData.FicheRes.ErrorMessagePasmand = 'این کد نوسازی فاقد بدهی است';
                                GetScope().ErrorColorP = 'Green';
                                GetScope().GamInputData.NextDisable = false;
                            }
                            else {
                                if (msg.CalculateDutyAndFicheList.length > 0) {
                                    //var tmpFich = msg.CalculateDutyAndFicheList[0].Duty_fiche;
                                    //if (tmpFich.EumDutyFicheStatus != 3 && tmpFich.EumDutyFicheStatus != 5) {
                                    //}
                                }
                                GetScope().GamInputData.FishListPasmand = msg.CalculateDutyAndFicheList;

                                //if (GetScope().GamInputData.FishListPasmand[0].PaymentBreakDate != '' && GetScope().GamInputData.FishListPasmand[0].PaymentBreakDate < GetCurrentDate()[0]) {
                                //    GetScope().BreakePaymentPasmand = true;
                                //}
                            }
                        }
                        GetScope().$apply();
                        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    },
                    error: function () {

                        StopBusy('DivFichPasmand');
                        GetScope().GamInputData.FicheRes.HasError = true;
                    }
                });
            }
        }
    };
    var ShowFichSenfi = function () {
        GetScope().GamInputData.FicheRes.ErrorMessageSenfi = '';

        var tmpSenfiCode = GetScope().GamInputData.CurrentNosaziCode.split('-')[6];
        if (tmpSenfiCode == 0)
            GetScope().GamInputData.ShowFicheSenfi = false;

        if (GetScope().GamInputData.ShowFicheSenfi) {

            //برای اینکه اگه پرداخت شده بود دوباره فیش لود نشود
            if (GetScope().GamInputData.FishListSenfi != undefined && GetScope().GamInputData.FishListSenfi != null && GetScope().GamInputData.FishListSenfi.length > 0)
                if (GetScope().GamInputData.FishListSenfi[0].Result != undefined && GetScope().GamInputData.FishListSenfi[0].Result.isTruePayment == true)
                    return;


            if (FishFunc.BackFromBank == false) {

                //فیش جدید لود میشود
                GetScope().GamInputData.FishListSenfi = null;

                var tmpNidWorkItem = 0;
                if (GetScope().GamInputData.NidWorkItem != '')
                    tmpNidWorkItem = GetScope().GamInputData.NidWorkItem;

                var d = { pCode: GetScope().GamInputData.CurrentNosaziCode, pDutyType: 2, pIsCalcInRevisit: IsCalcInRevisit, pNidWorkItem: tmpNidWorkItem };
                var c = JSON.stringify(d);
                GetScope().Prop.ErrorMessage = null;

                StartBusy('DivFichSenfi', 'درحال محاسبه فیش صنفی');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "CalculateDutyNosaziAndFicheList",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        GetScope().isBusy = false;
                        StopBusy('DivFichSenfi');
                        if (msg.ErrorResult.BizErrors.length > 0) {

                            $(msg.ErrorResult.BizErrors).each(function (index, item) {
                                if (item.ErrorAction == 0)//stop
                                    GetScope().GamInputData.FicheRes.HasError = true;
                            });

                            GetScope().GamInputData.FicheRes.ErrorMessageSenfi = msg.ErrorResult.BizErrors[0].ErrorTitel;
                            GetScope().ErrorColorP = 'red';
                        }
                        else {
                            if (msg.CalculateDutyAndFicheList == null) {
                                GetScope().GamInputData.FicheRes.HasError = true;
                                GetScope().GamInputData.FicheRes.ErrorMessageSenfi = 'کد صنفی معتبر نمیباشد';
                                GetScope().ErrorColorP = 'red';
                            }
                            else if (msg.CalculateDutyAndFicheList.length == 0) {
                                GetScope().GamInputData.FicheRes.ErrorMessageSenfi = 'این کد صنفی فاقد بدهی است';
                                GetScope().ErrorColorP = 'Green';
                                GetScope().GamInputData.NextDisable = false;
                            }
                            else {
                                if (msg.CalculateDutyAndFicheList.length > 0) {
                                    //var tmpFich = msg.CalculateDutyAndFicheList[0].Duty_fiche;
                                    //if (tmpFich.EumDutyFicheStatus != 3 && tmpFich.EumDutyFicheStatus != 5) {
                                    //}
                                }
                                GetScope().GamInputData.FishListSenfi = msg.CalculateDutyAndFicheList;
                            }
                        }
                        GetScope().$apply();
                        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    },
                    error: function () {

                        StopBusy('DivFichSenfi');
                        GetScope().GamInputData.FicheRes.HasError = true;
                    }
                });
            }
        }
    };
    var ShowFichDarAmad = function () {
        //درخواست های استعلام بانک، عدم خلاف، پایانکار، نقل و انتقال،
        //اگر IsRequreBazdid = 0
        //باشه، توی گام تسویه عوارض، خود شهروند سپاری محاسبه و صدور فیش انجام میده

        GetScope().GamInputData.FicheRes.ErrorMessageDaramad = '';
        var tmpNidWorkItem = 0;
        if (GetScope().GamInputData.NidWorkItem != '')
            tmpNidWorkItem = GetScope().GamInputData.NidWorkItem;

        if (GetScope().GamInputData.ShowFicheDarAmad != true) {
            return;
        }

        if (GetScope().GamInputData.FishListDarAmad != null) {
            if (GetScope().GamInputData.FishListDarAmad[0].Income_Fiche != undefined) {
                if (GetScope().GamInputData.FishListDarAmad[0].Income_Fiche.PaymentBreakDate != '' && GetScope().GamInputData.FishListDarAmad[0].Income_Fiche.PaymentBreakDate < GetCurrentDate()[0]) {
                    GetScope().BreakePaymentDaramad = true;
                    GetScope().$apply();
                }
            }
            else {
                if (GetScope().GamInputData.FishListDarAmad[0].PaymentBreakDate != '' && GetScope().GamInputData.FishListDarAmad[0].PaymentBreakDate < GetCurrentDate()[0]) {
                    GetScope().BreakePaymentDaramad = true;
                    GetScope().$apply();
                }
            }

            if (GetScope().GamInputData.FishListDarAmad.length > 0)
                if (GetScope().GamInputData.FishListDarAmad[0].Result != undefined && GetScope().GamInputData.FishListDarAmad[0].Result.isTruePayment == true)
                    return;

            //CheckPayFichDaramad(GetScope().GamInputData.FishListDarAmad);
            //return;
        }

        if (FishFunc.BackFromBank == false) {
            //باید فیش جدید لود شود

            GetScope().GamInputData.FishListDarAmad = null;

            if ((GetScope().GamInputData.CalculateDarAmad != true || GetScope().GamInputData.IsRequireBazdid == true) && GetScope().GamInputData.AlwaysCalculate != true) {

                var d = { pNidProc: GetScope().GamInputData.NidProc, pDistrict: GetScope().GamInputData.District, pNidWorkItem: tmpNidWorkItem };
                var c = JSON.stringify(d);
                GetScope().Prop.ErrorMessage = null;

                StartBusy('DivFichDaramad', 'درحال محاسبه فیش درآمد');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "GetIncomeFicheByCI_IncomeCalculation",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        GetScope().isBusy = false;
                        StopBusy('DivFichDaramad');
                        if (msg.ErrorResult.BizErrors.length > 0) {

                            $(msg.ErrorResult.BizErrors).each(function (index, item) {
                                if (item.ErrorAction == 0)//stop
                                    GetScope().GamInputData.FicheRes.HasError = true;
                            });
                            GetScope().GamInputData.FicheRes.ErrorMessageDaramad = msg.ErrorResult.BizErrors[0].ErrorTitel;
                            GetScope().ErrorColorD = 'red';
                        }
                        else if (msg.IncomeFicheByCI_IncomeCalculation == null || (msg.IncomeFicheByCI_IncomeCalculation != null && msg.IncomeFicheByCI_IncomeCalculation.length == 0)) {
                            GetScope().GamInputData.FicheRes.ErrorMessageDaramad = 'این کد نوسازی فاقد بدهی است';
                        }
                        else {

                            GetScope().GamInputData.FishListDarAmad = msg.IncomeFicheByCI_IncomeCalculation;

                            if (GetScope().GamInputData.FishListDarAmad[0].Income_Fiche.PaymentBreakDate != '' && GetScope().GamInputData.FishListDarAmad[0].Income_Fiche.PaymentBreakDate < GetCurrentDate()[0]) {
                                GetScope().BreakePaymentDaramad = true;
                            }
                            if (msg.Income != null)
                                GetScope().FishListDarAmadDetail = msg.Income.Income_LogMethod;

                            //if (msg.Income_FicheSubList != null)
                            //    GetScope().GamInputData.Income_FicheSubList = msg.Income_FicheSubList;

                            GetScope().$apply();
                            var tmpHeight = $('#Step6').height();
                            $('#Step6').height(tmpHeight + GetScope().GamInputData.FishListDarAmad.length * 150);
                        }
                        GetScope().$apply();
                        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    },
                    error: function () {

                        StopBusy('DivFichDaramad');
                        GetScope().GamInputData.FicheRes.HasError = true;
                    }
                });
            }

            //Calculate Fiche--------------------------------------------
            else {
                var d = {
                    pNidProc: GetScope().GamInputData.NidProc, pCode: GetScope().GamInputData.CurrentNosaziCode, pSecurity_RequestGuid: RequestGuid, pSecurity_EncryptCode: EncryptCode, pNidWorkItem: tmpNidWorkItem
                };
                var c = JSON.stringify(d);
                GetScope().Prop.ErrorMessage = null;

                StartBusy('DivFichDaramad', 'درحال محاسبه فیش درآمد');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "CreateIncomeRowAndCalcAndExport",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        GetScope().isBusy = false;
                        StopBusy('DivFichDaramad');
                        if (msg.ErrorResult.BizErrors.length > 0) {

                            $(msg.ErrorResult.BizErrors).each(function (index, item) {
                                if (item.ErrorAction == 0)//stop
                                    GetScope().GamInputData.FicheRes.HasError = true;
                            });

                            GetScope().GamInputData.FicheRes.ErrorMessageDaramad = msg.ErrorResult.BizErrors[0].ErrorTitel;
                            GetScope().ErrorColorD = 'red';
                        }
                        else if (msg.Income.UGPIncomeFiche == null ||
                            msg.Income.UGPIncomeFiche != null && msg.Income.UGPIncomeFiche.length == 0) {
                            GetScope().GamInputData.FicheRes.ErrorMessageDaramad = 'این کد نوسازی فاقد بدهی است';
                            var tmpHeight = $('#Step7').height();
                            GetScope().ErrorColorD = 'green';
                            $('#Step7').height(tmpHeight);
                        }
                        else {
                            GetScope().GamInputData.FishListDarAmad = msg.Income.UGPIncomeFiche;
                            GetScope().GamInputData.FishListDarAmadDetail = msg.Income.Income_LogMethod;

                            GetScope().$apply();
                            var tmpHeight = $('#Step7').height();
                            $('#Step7').height(tmpHeight + (GetScope().GamInputData.FishListDarAmad.length * 50));
                            //GetScope().GamInputData.FishListDarAmad[0].PaymentBreakDate = '1400/02/11';
                            if (GetScope().GamInputData.FishListDarAmad[0].PaymentBreakDate != '' && GetScope().GamInputData.FishListDarAmad[0].PaymentBreakDate < GetCurrentDate()[0]) {
                                GetScope().BreakePaymentDaramad = true;
                            }
                            if (GetScope().GamInputData.FishListDarAmad[0].EumFicheStatus == 3) {
                                GetScope().GamInputData.FishListDarAmad[0].Result = {};
                                GetScope().GamInputData.FishListDarAmad[0].Result.isTruePayment = true;
                            }

                        }
                        GetScope().$apply();
                        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    },
                    error: function (c) {
                        var g = c;
                        StopBusy('DivFichDaramad');
                        GetScope().GamInputData.FicheRes.HasError = true;
                    }
                });
            }
        }
    }
    var ShowFichAvarezDarAmad = function () {

        GetScope().GamInputData.FicheRes.ErrorMessageAvarezDaramad = '';
        var tmpNidWorkItem = 0;
        if (GetScope().GamInputData.NidWorkItem != '')
            tmpNidWorkItem = GetScope().GamInputData.NidWorkItem;

        if (GetScope().GamInputData.ShowFicheAvarezDarAmad != true) {
            return;
        }
        if (GetScope().GamInputData.FishListAvarezDarAmad != null && GetScope().GamInputData.FishListAvarezDarAmad != undefined && GetScope().GamInputData.FishListAvarezDarAmad.length > 0) {
            var tmpPaymentCountAvarezDarAmadCount = Enumerable.From(GetScope().GamInputData.FishListAvarezDarAmad)
                .Where(function (x) {
                    return (x.Result != undefined && x.Result.isTruePayment)
                }).Count();

            if (tmpPaymentCountAvarezDarAmadCount == GetScope().GamInputData.FishListAvarezDarAmad.length)
                return;

        }


        if (FishFunc.BackFromBank == false) {
            //باید فیش جدید لود شود

            GetScope().GamInputData.FishListAvarezDarAmad = null;

            if ((GetScope().GamInputData.CalculateDarAmad != true || GetScope().GamInputData.IsRequireBazdid == true)) {

                var d = { pNidProc: GetScope().GamInputData.NidProc, pDistrict: GetScope().GamInputData.District, pNidWorkItem: tmpNidWorkItem };
                var c = JSON.stringify(d);
                GetScope().Prop.ErrorMessage = null;

                StartBusy('DivFichDaramad', 'درحال محاسبه فیش درآمد');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "GetIncomeFicheByCI_IncomeCalculation",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        GetScope().isBusy = false;
                        StopBusy('DivFichDaramad');
                        if (msg.ErrorResult.BizErrors.length > 0) {
                            $(msg.ErrorResult.BizErrors).each(function (index, item) {
                                if (item.ErrorAction == 0)//stop
                                    GetScope().GamInputData.FicheRes.HasError = true;
                            });
                            GetScope().GamInputData.FicheRes.ErrorMessageAvarezDaramad = msg.ErrorResult.BizErrors[0].ErrorTitel;
                            GetScope().ErrorColorD = 'red';
                        }
                        else if (msg.IncomeFicheByCI_IncomeCalculation == null || (msg.IncomeFicheByCI_IncomeCalculation != null && msg.IncomeFicheByCI_IncomeCalculation.length == 0)) {
                            GetScope().GamInputData.FicheRes.ErrorMessageAvarezDaramad = 'این کد نوسازی فاقد بدهی است';
                        }
                        else {

                            GetScope().GamInputData.FishListAvarezDarAmad = msg.IncomeFicheByCI_IncomeCalculation;


                            if (GetScope().GamInputData.FishListAvarezDarAmad[0].Income_Fiche.PaymentBreakDate != '' && GetScope().GamInputData.FishListAvarezDarAmad[0].Income_Fiche.PaymentBreakDate < GetCurrentDate()[0]) {
                                GetScope().BreakePaymentAvarezDaramad = true;
                            }
                            if (msg.Income != null)
                                GetScope().FishListAvarezDarAmadDetail = msg.Income.Income_LogMethod;

                            //if (msg.Income_FicheSubList != null)
                            //    GetScope().GamInputData.Income_FicheSubList = msg.Income_FicheSubList;

                            GetScope().$apply();
                            var tmpHeight = $('#Step6').height();
                            $('#Step6').height(tmpHeight + GetScope().GamInputData.FishListAvarezDarAmad.length * 150);
                        }
                        GetScope().$apply();
                        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    },
                    error: function (c) {
                        var g = c;
                        StopBusy('DivFichDaramad');
                        GetScope().GamInputData.FicheRes.HasError = true;
                    }
                });
            }
            //Calculate Fiche--------------------------------------------
            else {
                var d = {
                    pNidProc: GetScope().GamInputData.NidProc, pCode: GetScope().GamInputData.CurrentNosaziCode
                    , pSecurity_RequestGuid: RequestGuid, pSecurity_EncryptCode: EncryptCode, pNidWorkItem: tmpNidWorkItem
                };
                var c = JSON.stringify(d);
                GetScope().Prop.ErrorMessage = null;

                StartBusy('DivFichDaramad', 'درحال محاسبه فیش درآمد');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "CreateIncomeRowAndCalcAndExport",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {
                        GetScope().isBusy = false;
                        StopBusy('DivFichDaramad');
                        if (msg.ErrorResult.BizErrors.length > 0) {
                            $(msg.ErrorResult.BizErrors).each(function (index, item) {
                                if (item.ErrorAction == 0)//stop
                                    GetScope().GamInputData.FicheRes.HasError = true;
                            });
                            GetScope().GamInputData.FicheRes.ErrorMessageAvarezDaramad = msg.ErrorResult.BizErrors[0].ErrorTitel;
                            GetScope().ErrorColorD = 'red';
                        }
                        else if (msg.Income.UGPIncomeFiche == null ||
                            msg.Income.UGPIncomeFiche != null && msg.Income.UGPIncomeFiche.length == 0) {
                            GetScope().GamInputData.FicheRes.ErrorMessageAvarezDaramad = 'این کد نوسازی فاقد بدهی است';
                            var tmpHeight = $('#Step7').height();
                            GetScope().ErrorColorD = 'green';
                            $('#Step7').height(tmpHeight);
                        }
                        else {
                            GetScope().GamInputData.FishListAvarezDarAmad = msg.Income.UGPIncomeFiche;

                            GetScope().GamInputData.FishListAvarezDarAmadDetail = msg.Income.Income_LogMethod;

                            GetScope().$apply();
                            var tmpHeight = $('#Step7').height();
                            $('#Step7').height(tmpHeight + (GetScope().GamInputData.FishListAvarezDarAmad.length * 50));

                            if (GetScope().GamInputData.FishListAvarezDarAmad[0].Income_Fiche.PaymentBreakDate != '' && GetScope().GamInputData.FishListAvarezDarAmad[0].Income_Fiche.PaymentBreakDate < GetCurrentDate()[0]) {
                                GetScope().BreakePaymentAvarezDaramad = true;
                            }

                        }
                        GetScope().$apply();
                        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
                    },
                    error: function (c) {
                        var g = c;
                        StopBusy('DivFichDaramad');
                        GetScope().GamInputData.FicheRes.HasError = true;
                    }
                });
            }
        }
    }

    var CheckIsDoneManagerConfirm = function (pCI_Confirm) {
        if (pCI_Confirm == undefined)
            pCI_Confirm = 5;

        MustCheckConfirmManager = true;
        CheckIsDoneManagerConfirmAll((result) => {
            if (result == true) {
                GetScope().GamInputData.IsDoneManagerConfirm = true;
                ShowAvarez();
            }
            else {
                GetScope().Prop.ErrorMessage = ConfirmManagerForAvarezMessage;
                GetScope().IsReadOnly = true;
                $('#AllFiche').hide();
                GetScope().GamInputData.IsDoneManagerConfirm = false;
            }
            GetScope().$apply();
        }, 'GridView1', pCI_Confirm);
    }
    var CheckPayFich = function (pFichList) {
        StartBusy('GrdPay');

        pFichList.forEach(function (tmpCurrentFich, index) {
            var d = {
                pBillID: (tmpCurrentFich.Duty_fiche != undefined) ? tmpCurrentFich.Duty_fiche.BillID : tmpCurrentFich.BillID,
                pPaymentID: (tmpCurrentFich.Duty_fiche != undefined) ? tmpCurrentFich.Duty_fiche.PaymentID : tmpCurrentFich.PaymentID,
                pDistrict: GetScope().GamInputData.District,
            };
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetFicheByBillAndPayID ",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {
                    StopBusy('GrdPay');

                    var tmpRes = msg;

                    if (tmpRes.FicheByBillAndPayID.Duty_fiche.EumDutyFicheStatus == 1) {
                        if (tmpCurrentFich.Result == undefined)
                            tmpCurrentFich.Result = {};

                        tmpCurrentFich.Result.isTruePayment = true;
                        tmpCurrentFich.Result.BillID = tmpRes.FicheByBillAndPayID.Duty_fiche.BillID;
                        tmpCurrentFich.Result.PaymentID = tmpRes.FicheByBillAndPayID.Duty_fiche.PaymentID;
                        tmpCurrentFich.Result.SaleReferenceId = tmpRes.FicheByBillAndPayID.Duty_fiche.PaymentReferenceNo;
                        tmpCurrentFich.Result.Price = tmpRes.FicheByBillAndPayID.Duty_fiche.TotalPrice;
                    }
                },
                error: function (c) {
                    var g = c;
                }
            });
        })
    }

    var CheckPayFichDaramad = function (pFichList) {
        StartBusy('GrdPay');

        pFichList.forEach(function (tmpCurrentFich, index) {
            var d = {
                pBillID: (tmpCurrentFich.Duty_fiche != undefined) ? tmpCurrentFich.Duty_fiche.BillID : tmpCurrentFich.BillID,
                pPaymentID: (tmpCurrentFich.Duty_fiche != undefined) ? tmpCurrentFich.Duty_fiche.PaymentID : tmpCurrentFich.PaymentID,
                District: GetScope().GamInputData.District,
            };

            if (tmpCurrentFich.Income_Fiche != undefined) {
                d = {
                    BillID: (tmpCurrentFich.Income_Fiche != undefined) ? tmpCurrentFich.Income_Fiche.BillID : tmpCurrentFich.BillID,
                    PaymentID: (tmpCurrentFich.Income_Fiche != undefined) ? tmpCurrentFich.Income_Fiche.PaymentID : tmpCurrentFich.PaymentID,
                    District: GetScope().GamInputData.District,
                };
            }
            var c = JSON.stringify(d);

            $.ajax({
                type: "POST",
                url: ServiceAddress + "GetIncome_FicheByBillIDAndPayID ",
                data: c,
                crossDomin: true,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                processdata: true,

                success: function (msg) {
                    StopBusy('GrdPay');

                    var tmpRes = msg;
                    if (tmpRes.Income_FicheByBillIDAndPayID != null) {
                        if (tmpRes.Income_FicheByBillIDAndPayID.EumFicheStatus == 1) {
                            // if (tmpRes.Income_FicheByBillIDAndPayID.EumFicheStatus == 1) {

                            if (tmpCurrentFich.Result == undefined)
                                tmpCurrentFich.Result = {};

                            tmpCurrentFich.Result.isTruePayment = true;
                            tmpCurrentFich.Result.BillID = tmpRes.Income_FicheByBillIDAndPayID.BillID;
                            tmpCurrentFich.Result.PaymentID = tmpRes.Income_FicheByBillIDAndPayID.PaymentID;
                            tmpCurrentFich.Result.SaleReferenceId = tmpRes.Income_FicheByBillIDAndPayID.PaymentReferenceNo;
                            tmpCurrentFich.Result.Price = tmpRes.Income_FicheByBillIDAndPayID.TotalPrice;
                        }
                        else if (tmpRes.Income_FicheByBillIDAndPayID.EumFicheStatus == 4) {
                            //GetScope().GamInputData.FishListDarAmad = GetScope().GamInputData.FishListDarAmad.remove(tmpCurrentFich);

                            var dictionary = Enumerable.From(GetScope().GamInputData.FishListDarAmad).ToDictionary();

                            dictionary.Remove(tmpCurrentFich);
                            GetScope().GamInputData.FishListDarAmad = dictionary.ToEnumerable().Select(s => s.Key).ToArray();
                        }
                    }
                },
                error: function (c) {
                    var g = c;
                }
            });
        })


        GetScope().$apply();

    }

    //1Nosazi 2 Senfi
    this.PayFish = function (pPrice, pFichType, pDutyType, pNidFK, pNidNosaziCode, pNosaziCode, pBillID, pPaymenyId, pFicheNo) {
        StartBusyTimer();
        if (pNosaziCode == undefined)
            pNosaziCode = GetScope().GamInputData.CurrentNosaziCode;

        var district = pNosaziCode.split('-')[0];
        if (pNidNosaziCode == undefined)
            pNidNosaziCode = GetScope().GamInputData.NidNosaziCode;

        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);


        ShowPaymentUrl(pPrice, pFichType, pDutyType, pNidFK, pNidNosaziCode, district, pBillID, pPaymenyId, pFicheNo);


    }
    this.PrintFiche = function (pNidFiche) {

        var tmpFichNo = getParameterByName("FicheNo");

        var tmpStr = "RptReconFiche&ReportParameter=NidFiche;" + pNidFiche + ",FicheNo;" + tmpFichNo + ",District;" + GetScope().GamInputData.District;
        window.open(FactorUrl + tmpStr, '_blank');
    }
    this.PrintFicheDaramad = function (pNidFiche) {

        var tmpFichNo = getParameterByName("FicheNo");

        var tmpStr = "RptIncomeFiche&ReportParameter=NidFiche;" + pNidFiche + ",FicheNo;" + tmpFichNo + ",District;" + GetScope().GamInputData.District;
        window.open(FactorUrl + tmpStr, '_blank');
    }



    //ریز محاسبات برای یزد
    this.PrintFicheDetail = function (pNidIncome) {
        var tmpStr = "RptShahrsaziIncomeFactor&ReportParameter=NidIncome;" + pNidIncome + ",District;" + GetScope().GamInputData.District;
        window.open(FactorUrl + tmpStr, '_blank');
    }

    //وضعیت فیش
    //0 = صدور موقتی
    //1 = صدور قطعی
    //2 = چاپ فیش
    //3 = تایید
    //4 = ابطال



    this.CheckPayFish = function () {
        var res = false

        var tmpPaymentCountNosazi = 0;
        var tmpPaymentCountPasmand = 0;
        var tmpPaymentCountDarAmad = 0;
        var tmpPaymentCountAvarezDarAmad = 0;
        var tmpPaymentCountSenfi = 0;

        if (GetScope().GamInputData.FishList != undefined) {
            tmpPaymentCountNosazi = Enumerable.From(GetScope().GamInputData.FishList)
                .Where(function (x) {
                    return (x.Result != undefined && x.Result.isTruePayment)
                }).Count();
        }
        if (GetScope().GamInputData.FishListPasmand != undefined) {
            tmpPaymentCountPasmand = Enumerable.From(GetScope().GamInputData.FishListPasmand)
                .Where(function (x) {
                    return (x.Result != undefined && x.Result.isTruePayment)
                }).Count();
        }
        if (GetScope().GamInputData.FishListDarAmad != undefined) {
            tmpPaymentCountDarAmad = Enumerable.From(GetScope().GamInputData.FishListDarAmad)
                .Where(function (x) {
                    return ((x.Result != undefined && x.Result.isTruePayment) || x.EumFicheStatus == 3)
                }).Count();
        }
        if (GetScope().GamInputData.FishListAvarezDarAmad != undefined) {
            tmpPaymentCountAvarezDarAmad = Enumerable.From(GetScope().GamInputData.FishListAvarezDarAmad)
                .Where(function (x) {
                    return (x.Result != undefined && x.Result.isTruePayment || x.EumFicheStatus == 3)
                }).Count();
        }
        if (GetScope().GamInputData.FishListSenfi != undefined) {
            tmpPaymentCountSenfi = Enumerable.From(GetScope().GamInputData.FishListSenfi)
                .Where(function (x) {
                    return (x.Result != undefined && x.Result.isTruePayment)
                }).Count();
        }

        if (GetScope().GamInputData.FicheRes.HasError != true && (
            (GetScope().GamInputData.FishList == undefined || tmpPaymentCountNosazi == GetScope().GamInputData.FishList.length)
            && (GetScope().GamInputData.FishListPasmand == undefined || tmpPaymentCountPasmand == GetScope().GamInputData.FishListPasmand.length)
            && (GetScope().GamInputData.FishListSenfi == undefined || tmpPaymentCountSenfi == GetScope().GamInputData.FishListSenfi.length)

            && (GetScope().GamInputData.FishListDarAmad == undefined || tmpPaymentCountDarAmad == GetScope().GamInputData.FishListDarAmad.length)
            && (GetScope().GamInputData.FishListAvarezDarAmad == undefined || tmpPaymentCountAvarezDarAmad == GetScope().GamInputData.FishListAvarezDarAmad.length)
        ))
            res = true;


        return res;
    }

    this.GetCostKarshenasi = function () {
        StartBusy('GrdPay');

        var d = {
            pCode: GetScope().GamInputData.CurrentNosaziCode,
        };
        var c = JSON.stringify(d);

        $.ajax({
            type: "POST",
            url: ServiceAddress + "CalculateJudgeCost",
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,

            success: function (msg) {
                StopBusy('GrdPay');

                GetScope().isBusy = false;
                if (msg.ErrorResult.BizErrors.length > 0)
                    GetScope().Prop.ErrorMessage = msg.ErrorResult.BizErrors[0].ErrorTitel;
                else {
                    if (msg.JudgeCost > 0) {
                        GetScope().GamInputData.CostKarshenasi = msg.JudgeCost;
                        GetScope().$apply();
                    }
                }
            },
            error: function (c) {
                var g = c;
            }
        });
    }

    this.GetPaymentInfo = function (pRequestId) {

      
        var tmpResPay = GetLocalStorage("ClsPaymentInfo-" + pRequestId);

        if (tmpResPay != null && tmpResPay != 'null') {
            tmpResPay = JSON.parse(tmpResPay);
            return tmpResPay
        }
        else return null;
    }

    this.ClearPaymentInfo = function (pRequestId) {
        ClearLocalStorage("ClsPaymentInfo-" + pRequestId);
    }
}

Array.prototype.remove = function (item) {
    var i = this.indexOf(item);
    if (i != -1)
        this.splice(i, 1);
};


var UploadPlugin = {
    NidTag: 0,
    Domain: "1",
    BizCode: '',
    LoadObj: function (pNidTag) {
        UploadPlugin.NidTag = pNidTag;
        this.Domain = GetScope().GamInputData.District;
        AppConfig.LoadObj(function () {
            if (GetScope().Prop.WorkFlowArchive == undefined)
                UploadPlugin.GetBizCode();
        });
    },
    LoadObjNewNosazi: function (pNidTag) {

        this.NidTag = pNidTag;
        this.Domain = 'UGP';
        this.BizCode = ClsAccount.AccountInfo.NidAccount;

        AppConfig.LoadObj(function () {
            Domain = 'UGP';
            UploadPlugin.GetWorkFlowArchive(ClsAccount.AccountInfo.NidAccount);
        });
    },


    dic: {},
    dicRequire: {},
    AddNidFile: function (pFileKey, pIsRequire, pNidWorkFlowArchive, pOtherField) {
        if (pFileKey && pFileKey != null) {


            if (pOtherField == 'vakil')
                GetScope().GamInputData.VakilUpload = true;

            if (pIsRequire && pOtherField != 'vakil')
                UploadPlugin.dicRequire[pNidWorkFlowArchive] = true;

            UploadPlugin.dic[pNidWorkFlowArchive] = true;

            GetScope().GamInputData.UploadCount = Object.keys(UploadPlugin.dic).length;
            GetScope().GamInputData.UploadCountRequire = Object.keys(UploadPlugin.dicRequire).length;
            GetScope().$apply();

            GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
            UploadPlugin.ShowArchive();

            if (pNidWorkFlowArchive == undefined)
                pNidWorkFlowArchive = '00000000-0000-0000-0000-000000000000';

            var d = { pFileKey: pFileKey, BizCode: UploadPlugin.BizCode, pDomain: UploadPlugin.Domain, pNidEntity: UploadPlugin.NidTag, pNidWorkFlowArchive: pNidWorkFlowArchive };
            var c = JSON.stringify(d);
            $.ajax({
                type: "POST",
                url: "UStepGam.aspx/AddNidFile",
                data: c,
                contentType: "application/json; charset=utf-8",
                dataType: "json",

            });

        }
    },
    GetBizCode: function () {
        var d = { pNidNosaziCode: GetScope().GamInputData.NidNosaziCode, pCI_ArchiveGroup: CI_Archivegroup, pDistrict: GetScope().GamInputData.District };
        var c = JSON.stringify(d);
        StartBusy1('در حال دریافت کد آرشیو');

        $request = $.ajax({
            type: "POST",
            url: ServiceAddress + "GetArchiveWrapper",
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy1();
                if (msg.ArchiveWrapper == null)
                    msg.ArchiveWrapper = 'test';
                if (msg.ArchiveWrapper != null) {
                    var tmpBizCode = msg.ArchiveWrapper.BizCode;
                    UploadPlugin.BizCode = tmpBizCode;
                    UploadPlugin.GetWorkFlowArchive(tmpBizCode);
                }
            },
            error: function (c) {
                StopBusy1();
                var g = c;

                UploadPlugin.GetWorkFlowArchive(ClsAccount.AccountInfo.NidAccount);
            }
        });
    },
    GetBizCodeCallback: function (callback) {
        var d = { pNidNosaziCode: GetScope().GamInputData.NidNosaziCode, pCI_ArchiveGroup: CI_Archivegroup, pDistrict: GetScope().GamInputData.District };
        var c = JSON.stringify(d);
        StartBusy1('در حال دریافت کد آرشیو');

        $request = $.ajax({
            type: "POST",
            url: ServiceAddress + "GetArchiveWrapper",
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
            success: function (msg) {
                StopBusy1();
                if (msg.ArchiveWrapper == null)
                    msg.ArchiveWrapper = 'test';
                if (msg.ArchiveWrapper != null) {
                    var tmpBizCode = msg.ArchiveWrapper.BizCode;
                    UploadPlugin.BizCode = tmpBizCode;
                    UploadPlugin.Domain = GetScope().GamInputData.District;

                    callback(tmpBizCode);

                }
            },
            error: function (c) {
                StopBusy1();
            }
        });
    },
    LoadArchiveWithDbData: function (pNewBizCode) {

        $('#divUploader').empty();

        //var tmpLoadArchive = Enumerable.From(GetScope().Prop.WorkFlowArchive)
        //            .Where(function (x) {return  x.Comment != 'vakil' }).ToArray();

        var tmpLoadArchive = GetScope().Prop.WorkFlowArchive;


        $.each(tmpLoadArchive, function (index, data) {
            var u1 = $('#divUploader').AsSafaArchiveUploder();
            if (index == 0) {
                u1.ResetCount();
                GetScope().GamInputData.MustUploadCount = 0;
            }
            var tmpIsRequire = data.ArchiveCount > 0;

            if (tmpIsRequire)
                GetScope().GamInputData.MustUploadCount++;

            if (typeof (LoadLastUploadedFile) == 'undefined' || LoadLastUploadedFile == true) {

                if (data.NidFile > 0)
                    UploadPlugin.dic[data.WorkFlowArchive1] = true;

                if (data.NidFile > 0 && tmpIsRequire)
                    UploadPlugin.dicRequire[data.WorkFlowArchive1] = true;
            }

            u1.LoadObj(pNewBizCode, UploadPlugin.Domain, {
                UserName: ClsAccount.AccountInfo.FullName,
                UserCode: ClsAccount.AccountInfo.NidAccount, OtherFiled: data.Comment,
                Multiply: true, NidTag: UploadPlugin.NidTag, SaveOrginalFile: (typeof (SaveOrginalFile) != 'undefined') ? SaveOrginalFile : true, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                , Title: data.ArchiveTitle, IsRequire: tmpIsRequire, LoadNidFile: (typeof (LoadLastUploadedFile) != 'undefined' && LoadLastUploadedFile == false ? 0 : data.NidFile)
                , FilterExtensions: typeof (FileExt) != 'undefined' ? FileExt : ".png,.jpg"
                , OnCompleteUpload: function (args, sender) {
                    UploadPlugin.AddNidFile(args.NidFile, tmpIsRequire, data.WorkFlowArchive1, args.OtherFiled);
                }
            });
        });




        //if (typeof (LoadLastUploadedFile) != 'undefined' && LoadLastUploadedFile == false) {
        //    GetScope().GamInputData.UploadCount = 0;
        //    GetScope().GamInputData.UploadCountRequire = 0;
        //    GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);
        //}
        //else {
        //    if (data.NidFile > 0)
        //        UploadPlugin.dic[data.WorkFlowArchive1] = true;

        //    if (data.NidFile > 0 && tmpIsRequire)
        //        UploadPlugin.dicRequire[data.WorkFlowArchive1] = true;


        GetScope().GamInputData.UploadCount = Object.keys(UploadPlugin.dic).length;
        GetScope().GamInputData.UploadCountRequire = Object.keys(UploadPlugin.dicRequire).length;
        // }
        GetScope().$apply();
        UploadPlugin.ShowArchive();
    },

    GetWorkFlowArchive: function (tmpBizCode) {
        StartBusy1('در حال بارگذاری اطلاعات');
        var d = {
            pNidWorkflowDeff: GetScope().GamInputData.SelectedWorkFlow.NidWorkflowDeff
            , pNidAccount: ClsAccount.AccountInfo.NidAccount,
            pBizCode: tmpBizCode
        };
        var c = JSON.stringify(d);
        $.ajax({
            type: "POST",
            data: c,
            url: "FrmParvaneh.aspx/GetWorkFlowArchive",
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,

            success: function (msg) {
                StopBusy1();

                if (typeof (UploadConfig) != 'undefined') {
                    GetScope().Prop.WorkFlowArchive = UploadConfig;
                }
                else {
                    GetScope().Prop.WorkFlowArchive = msg.d;
                }


                GetScope().GamInputData.ArchiveBizCode = tmpBizCode;
                UploadPlugin.LoadArchiveWithDbData(tmpBizCode);
            },
            error: function (c) {
                StopBusy1();
            }
        })
    },

    AddLegend: function (pindex, pText, isRequire) {
        var RequireClass = '';

        if (isRequire == true) {
            pText = pText + " *";
            RequireClass = ' Require';
        }
        var parentMainDiv = $('[id^=SafaArchive_Container]')[pindex];
        $(parentMainDiv).wrapAll("<fieldset><legend class='Uploader" + RequireClass + "'>" + pText + "</legend></fieldset>");
    },
    ShowArchive: function () {
        if (ShowOldArchive == false)
            return;

        $("#DaneshDiVMain").show();
        var Dan = $('#Danesh').AsSafaArchive();
        Dan.LoadObj(GetScope().GamInputData.ArchiveBizCode, UploadPlugin.Domain, 1,
            {
                backgroundColor: 'rgb(170, 219, 170)',
                FullpageBgColor: 'rgb(170, 219, 170)',
                thumbnailGutterHeight: 10,
                thumbnailGutterWidth: 5,
                Archive_NidEntity: UploadPlugin.NidTag,
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
    },

    CheckArchiveValidity: function () {

        if (GetScope().GamInputData.UploadCountRequire >= GetScope().GamInputData.MustUploadCount) {

            if (GetScope().GamInputData.IsVakil == true) {
                if (GetScope().GamInputData.VakilUpload != true) {
                    GetScope().Prop.ErrorMessage = 'کاربر گرامی ، تصویر وکالت نامه را بارگذاری نمایید';
                    return false;
                }
                else
                    return true;
            }
            else
                return true;
        }
        else {
            GetScope().Prop.ErrorMessage = 'کاربر گرامی ، مدارک لازم را بارگذاری نمایید';
            return false;
        }
    },
}


function LoadOutSideFunction() {
    GetScope().PayFish = function (pPrice, pFichType, pDutyType, pNidFK, pNidNosaziCode, pNosaziCode, pBillID, pPaymenyId, pFicheNo) {
        if (pFichType == undefined)
            pFichType = 1;

        FishFunc.PayFish(pPrice, pFichType, pDutyType, pNidFK, pNidNosaziCode, pNosaziCode, pBillID, pPaymenyId, pFicheNo);
    }
    GetScope().PrintFiche = function (pNidFiche) {
        FishFunc.PrintFiche(pNidFiche);
    }
    GetScope().PrintFicheDaramad = function (pNidFiche) {
        FishFunc.PrintFicheDaramad(pNidFiche);
    }
    GetScope().PrintFicheDetail = function (pNidIncome) {
        FishFunc.PrintFicheDetail(pNidIncome);
    }

    if (typeof BankInfo !== 'undefined') {
        GetScope().BankInfo = BankInfo;
    }

    GetScope().ShowPrintDetail = typeof (ShowPrintDetail) != 'undefined' ? ShowPrintDetail : false;
    GetScope().PayKarshenasi = function () {
        GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);

        if (GetScope().GamInputData.CurrentJobLocation == null && GetScope().ShowDafater && GetScope().JobLocationList != null)
            GetScope().Prop.ErrorMessage = 'دفاتر انتخاب نشده است';
        else {
            var district = GetScope().GamInputData.CurrentNosaziCode.split('-')[0];
            var url = 'UShowFishj-Pay3.aspx?Type=HK&DutyType=0&Amount=' + GetScope().GamInputData.CostKarshenasi + '&District=' + district + '&NidNosaziCode=' + GetScope().GamInputData.NidNosaziCode;
            if (GetScope().ShowDafater)
                url = 'UShowFishj-Pay3.aspx?Type=HK&DutyType=0&Amount=' + GetScope().GamInputData.CostKarshenasi + '&District=' + district + '&NidNosaziCode=' + GetScope().GamInputData.NidNosaziCode + '&IbanNumber=' + ((GetScope().GamInputData.CurrentJobLocation != undefined) ? GetScope().GamInputData.CurrentJobLocation.Altitude : '');

            url += '&NosaziCode=' + GetScope().GamInputData.CurrentNosaziCode + '&NidWorkItem=' + GetScope().GamInputData.NidWorkItem;

            if (GetScope().GamInputData.Sh_RevisitAgentRandom != undefined) {
                url += '&Comment=' + GetScope().GamInputData.Sh_RevisitAgentRandom.Name + ' ' + GetScope().GamInputData.Sh_RevisitAgentRandom.LastName + '#'
                    + GetScope().GamInputData.Sh_RevisitAgentRandom.NidRevisitAgent;
            }


            openUrlNewTab(url);
        }

    };

    GetScope().InsertPaymentLog = function (isOK, pTrackingCode, pBankName, pDescription) {
        //Hazine Karshenasi =0 
        //Nosazi=1 
        //Senfi=2 
        //Pasmand=3  
        //Daramad=4 

        var d = {
            pPaymentLog: {
                FicheType: 0, PaymentTitle: "هزینه کارشناسی",
                Price: GetScope().GamInputData.CostKarshenasi,
                NidAccount: ClsAccount.AccountInfo.NidAccount,
                AccountName: ClsAccount.AccountInfo.OwnerFirstName + ' ' + ClsAccount.AccountInfo.OwnerLastName + "( " + ClsAccount.AccountInfo.AccountName + " )",
                NidUser: GetScope().NidUser, FullUserName: GetScope().FullUserName,
                NidVisitor: (GetScope().GamInputData.Sh_RevisitAgentRandom != undefined) ? GetScope().GamInputData.Sh_RevisitAgentRandom.NidRevisitAgent : '',
                VisitorName: (GetScope().GamInputData.Sh_RevisitAgentRandom != undefined) ? GetScope().GamInputData.Sh_RevisitAgentRandom.Name + ' ' + GetScope().GamInputData.Sh_RevisitAgentRandom.LastName : '',
                NidWorkItem: GetScope().GamInputData.NidWorkItemText,
                TrackingCode: pTrackingCode,
                IsTruePayment: isOK,
                Description: location.search + '\r\n' + pDescription,
                NosaziCode: GetScope().GamInputData.CurrentNosaziCode,
                BankName: pBankName,
            }
        };
        var c = JSON.stringify(d);

        $.ajax({
            type: "POST",
            url: 'UShowPayments.aspx/InsertPaymentLog',
            data: c,
            crossDomin: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            processdata: true,
        });
    }



    GetScope().LoadFromRequestMain = function (pNidProc, result) {

        StartBusy1('درحال بارگذاری اطلاعات');
        var d = { pNidProc: pNidProc, pNidAccount: ClsAccount.AccountInfo.NidAccount };
        var c = JSON.stringify(d);
        $.ajax({
            type: "POST",
            data: c,
            url: "UTransferGam.aspx/StepGetRequest",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy1();
                var tmpRes = response.d;

                if (tmpRes.Request_Info == null) {
                    alert('این درخواست متعلق به این کاربر نمی باشد');
                    return;
                }

                //if (tmpRes.Request_Info.MenuID != null && tmpRes.Request_Info.MenuID != getParameterByName('ID')) {
                //    alert('دسترسی به این صفحه مجاز نمی باشد');
                //    return;
                //}

                if (tmpRes.Request_Info.EumRequestStatus == 8) {
                    alert('این درخواست ابطال شده است');
                    GamPlugin.ResetGamAndRedirect();
                    return;
                }
                if (tmpRes.Request_Info.EumRequestStatus == 7) {
                    alert('این درخواست به مرحله پایان رسیده است');
                    GamPlugin.ResetGamAndRedirect();
                    return;
                }
                if (tmpRes.Request_Info.EumRequestStatus == 10) {
                    alert('این درخواست در وضعیت بایگانی موقت است');
                    GamPlugin.ResetGamAndRedirect();
                    return;
                }

                GetScope().p = tmpRes.Request_Info.NidAccount;

                if (tmpRes.Request_Info.GamInputData != null && tmpRes.Request_Info.GamInputData != '' && tmpRes.Request_Info.GamInputData != ' ') {
                    try {
                        GetScope().GamInputData = JSON.parse(tmpRes.Request_Info.GamInputData);
                    }
                    catch (ex) { }
                    GetScope().IsReadOnly = true;
                    GetScope().GamInputData.EumRequestStatus = tmpRes.Request_Info.EumRequestStatus;
                    // GetScope().GamInputData.Sh_ManagerConfirm_List = tmpRes.ManagerConfirmList;
                    GetScope().GamInputData.IsRequireBazdid = tmpRes.Request_Info.IsRequireBazdid;
                    GetScope().GamInputData.ProcInitiator = tmpRes.ProcInitiator;
                    GetScope().GamInputData.CurrentNosaziCode = tmpRes.Request_Info.NosaziCode;
                    GetScope().GamInputData.District = tmpRes.Request_Info.District;

                    if (GetScope().GamInputData.ArchiveBizCode == undefined)
                        GetScope().GamInputData.ArchiveBizCode = tmpRes.Request_Info.ArchiveBizCode;

                }
                else {
                    GetScope().GamInputData.EumRequestStatus = tmpRes.Request_Info.EumRequestStatus;

                    GetScope().GamInputData.NidAccount = tmpRes.Request_Info.NidAccount;
                    GetScope().GamInputData.District = tmpRes.Request_Info.District;
                    GetScope().GamInputData.NidProc = tmpRes.Request_Info.NidProc;
                    GetScope().GamInputData.Address = tmpRes.Request_Info.RequesterAddress;
                    GetScope().GamInputData.FicheRes.isTruePaymentNosazi = false;
                    GetScope().GamInputData.NidWorkItem = tmpRes.Request_Info.NidWorkItem;
                    if (tmpRes.Bazdid != null) {
                        GetScope().GamInputData.CurrentNosaziCode = tmpRes.Bazdid.NosaziCode;
                        GetScope().GamInputData.OwnerType = tmpRes.Bazdid.OwnerType;
                        GetScope().GamInputData.NidWorkItemText = tmpRes.Bazdid.NidWorkItem;
                        GetScope().GamInputData.BazdidDate = tmpRes.Bazdid.BazdidDate;
                        GetScope().GamInputData.BazdidTime = tmpRes.Bazdid.BazdidTime;
                        GetScope().GamInputData.ResourceId = tmpRes.Bazdid.ResourceId;
                        if (tmpRes.Bazdid.VisitOfficerFullName != null && tmpRes.Bazdid.VisitOfficerFullName != '') {
                            if (GetScope().GamInputData.Sh_RevisitAgentRandom != undefined) {
                                GetScope().GamInputData.Sh_RevisitAgentRandom.Name = tmpRes.Bazdid.VisitOfficerFullName.split(' ')[0];
                                GetScope().GamInputData.Sh_RevisitAgentRandom.LastName = tmpRes.Bazdid.VisitOfficerFullName.split(' ')[1];
                                GetScope().GamInputData.Sh_RevisitAgentRandom.UserName = tmpRes.Bazdid.VisitOfficerUserName;
                                GetScope().GamInputData.Sh_RevisitAgentRandom.Phone = tmpRes.Bazdid.VisitOfficerTel;
                            }
                        }
                    }
                    GetScope().GamInputData.CurrentNosaziCode = tmpRes.Request_Info.NosaziCode;
                    GetScope().GamInputData.LetterNo = tmpRes.Request_Info.LetterNo;
                    GetScope().GamInputData.LetterDate = tmpRes.Request_Info.LetterDate;
                    GetScope().GamInputData.EstateOwner = tmpRes.Request_Info.RequesterName;
                    GetScope().GamInputData.ArchiveBizCode = tmpRes.Request_Info.ArchiveBizCode;
                    GetScope().GamInputData.ProcInitiator = tmpRes.ProcInitiator;
                    GetScope().GamInputData.AllowNextPage = true;
                    GetScope().GamInputData.LoadFromOld = true;
                    GetScope().IsReadOnly = true;
                }

                if (GetScope().GamInputData.NidNosaziCode == '')
                    GetScope().GamInputData.NidNosaziCode = tmpRes.Request_Info.NidNosaziCode;

                GetScope().GamInputData.Sh_ManagerConfirm_List = tmpRes.ManagerConfirmList;

                if (tmpRes.Request_Info.EumRequestStatus != 5)
                    GetScope().GamInputData.IsCouncil = true;
                else
                    GetScope().GamInputData.IsCouncil = false;

                try {
                    //var tmpCurrentStep = Enumerable.From(GamsArray)
                    //    .Where(function (x) {
                    //        return ((x.Name == EumPage.SaveRequest))
                    //    }).FirstOrDefault().Index - 1;

                    var tmpCurrentGam = Enumerable.From(GamsArray)
                        .Where(function (x) {
                            return ((x.Name == EumPage.SaveRequest))
                        }).FirstOrDefault();

                    var tmpCurrentStep = $(GamsArray).index(tmpCurrentGam);

                    //=========================================================GetCurrentStep
                    var tmpres = GamPlugin.GetlocalStorage(GetGamInfo());
                    if (tmpres != undefined && tmpres.CurrentStep > tmpCurrentStep)
                        tmpCurrentStep = tmpres.CurrentStep;

                    if (GetScope().GamInputData.CurrentStep != undefined && GetScope().GamInputData.CurrentStep != null && GetScope().GamInputData.CurrentStep > tmpCurrentStep)
                        tmpCurrentStep = GetScope().GamInputData.CurrentStep;

                    GamPlugin.SavelocalStorage(GetScope().Config.ScopeName, GetScope().GamInputData);

                    GamPlugin.GoStep(tmpCurrentStep);

                    GetScope().GamInputData.CurrentStep = tmpCurrentStep;
                    GetScope().$apply();


                }
                catch (ex) { }//بعضی مواقع Gamsarray خالی است

                //if (tmpRes.UGPFormName != undefined) {
                //    GetScope().GamInputData.UGPFormName = tmpRes.UGPFormName.UGPFormName;
                //    if (GetScope().GamInputData.UGPFormName.UGPFormName == 'Council')
                //        GetScope().GamInputData.IsCouncil = true;
                //    else 
                //        GetScope().GamInputData.IsCouncil = false;
                //}
                if (result != undefined)
                    result(true, tmpRes);
            }
        });
    }



}

function SendSMSGam(pType, pPrice, pPeygiriCode) {

    try {
        var d = {
            pCode: pType,
            pInputData: {
                NidWorkItem: GetScope().GamInputData.NidWorkItem, CurrentNosaziCode: GetScope().GamInputData.CurrentNosaziCode
            },
            Price: (pPrice != null && pPrice != undefined) ? pPrice : 0,
            PeygiriCode: (pPeygiriCode != null && pPeygiriCode != undefined) ? pPeygiriCode : 0,
        }
        var c = JSON.stringify(d);
        $.ajax({
            type: "POST",
            url: "UTransferGam.aspx/SendSMSForGam",
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
}


const SKey = 'SafaUGPMenu12345';

function EncryptData(pText) {
    const encryptedText = CryptoJS.AES.encrypt(pText, SKey).toString();
    return (encryptedText);
}
function DecryptData(encryptedText) {

    const bytes = CryptoJS.AES.decrypt(encryptedText, SKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
}
function SetLocalStorage(key, pObject) {

    var tmpRes = JSON.stringify(pObject);
    var tmpEnc = EncryptData(tmpRes);

    localStorage.setItem(key, tmpEnc);
}
function GetLocalStorage(key) {

    var tmpEncStr = localStorage.getItem(key);
    var tmpDec = DecryptData(tmpEncStr);
    var tmpObject = JSON.parse(tmpDec);
    return tmpObject;
}
