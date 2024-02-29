<%@ Page Title="" Language="C#" MasterPageFile="~/UGPMaster.Master" AutoEventWireup="true" %>


<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <div id="MainDiv" ng-app="App" ng-controller="CtlZabteh">

        <style>
            .grid td {
                text-align: center;
            }

            .auto-style1 {
                text-align: right;
            }
        </style>
        <div>
            <h3>
                <img width="20" class="" src="Images/pays.png">
                پرونده من</h3>


            <div id="DivTop" class="panel panel-success">

                <div class="panel-body nopadding">

                    <p class="info">
                        <span>ابتدا شماره تلفن همراه خود را وارد نموده سپس کد نوسازی را وارد نمایید
                        </span>
                    </p>
                    <style>
                        .GridView2 tr td:first-child {
                            width: 150px;
                        }

                        input[type=tel] {
                            unicode-range: U+30-39;
                        }

                        .DataEntry input[type=text], input[type=tel] {
                            width: 99%;
                            text-align: right;
                            padding: 8px;
                        }

                        .DataEntry div {
                            direction: rtl;
                            float: right;
                        }


                        .DataEntry > div > div:first-child {
                            margin-top: 10px;
                        }

                        .DataEntry span {
                            color: black;
                            padding-top: 10px;
                        }
                    </style>
                    <div class="FloatRightDiv">
                        <div class="form-group col-md-12">
                            <div class="col-md-12">
                                <div style="float: right">
                                    <span>شماره تلفن همراه:</span>
                                </div>

                                <div style="float: right; clear: both">

                                    <input type="text" tabindex="0" class="numbers" ng-model="Data.Mobile" maxlength="11" style="width: 206px; direction: ltr; text-align: left" />

                                </div>
                            </div>

                            <div class="col-lg-5 col-md-6">
                                <div ng-include="'Common/UNosaziCodeJNew.html'">
                                </div>

                            </div>

                            <%--   <div class="col-md-12">
                            <div style="float: right">
                                شماره تلفن همراه
                            </div>
                            <div style="float: right">
                                <input type="text" ng-model="Data.Mobile" style="width: 206px; text-align: left" />
                            </div>

                        </div>--%>




                            <div class="col-md-12 col-sm-12 FloatRightDiv">
                                <input id="btnInfo" type="button" tabindex="8" class="btn btn-success" ng-click="GetInfo()" value="بررسی اطلاعات" />
                                <span style="color: green; padding-right: 10px" class="Error" ng-bind="ErrorMessage"></span>

                            </div>
                            <div class="col-md-12 col-sm-12 FloatRightDiv" id="divConfirm" style="display: none">
                                <div style="margin-bottom: 0px!important; float: right" ng-include="'Parvaneh/UConfirmSMS2.htm'"></div>
                            </div>






                        </div>
                    </div>
                </div>

                <hr />




            </div>

            <div class="col-md-12" style="clear: both; height: auto; width: 100%">
                <hr style="height: 5px; background-color: #bf2b2b; width: 100%" />
                <div id="Danesh" style="width: 100%; background-color: white; padding: 5px; margin: 5px" />

            </div>

            <div style="clear: both" class="panel panel-success">
                <div class="panel-heading">
                    <span>نقشه</span>
                </div>
                <div class="panel-body nopadding">
                    <div id="m"></div>
                </div>
            </div>

            <script>
                LoadMap();
            //MapDefaultCheckedLayerTafzilifn()
            </script>


        </div>


        <script>


            $(document).ready(function () {
                var elements = $('.Digits');
                elements.each(function (index) {
                    var element = elements[index];
                    element.oninput = function (id) {
                        var element = $(id.currentTarget);
                        var regex = /[^0-9]/gi;
                        var org = element.val();
                        element.val(org.replace(regex, ""));
                        if (org != element.val()) {
                            element.prop('title', 'فقط اعداد انگلیسی وارد نمایید');
                        }
                        else
                            element.prop('title', '');
                    }
                });

                AppConfig.LoadObj(function () { });
            });
            var index = 0;
            var App = angular.module('App', []);
            App.controller('CtlZabteh', function ($scope, $http) {
                $scope.ShowNosaziCodeSearchButton = false;

                $scope.Data = {};
                $scope.GetInfo = function () {
                    ResetConfirm();
                    if ($scope.Data.Mobile == undefined || ($scope.Data.Mobile == '' || $scope.Data.Mobile.length < 11)) {
                        $scope.ErrorMessage = 'شماره همراه را وارد نمایید';
                        $scope.$apply();
                    }
                    else {

                        $scope.ErrorMessage = '';
                        search();

                        var tmpPay = $('#txtPaymentID').val();
                        var d = { pMobileNo: $scope.Data.Mobile, pCode: NosaziCode };
                        var c = JSON.stringify(d);
                        $scope.ErrorMessage = null;

                        StartBusy('MainDiv', BusyTextDefualt);
                        $.ajax({
                            type: "POST",
                            url: ServiceAddress + "ValidateNosaziCodeAndMobileNumber",
                            data: c,
                            crossDomin: true,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            processdata: true,

                            success: function (msg) {
                                if (msg.ErrorResult.BizErrors.length > 0) {
                                    $scope.ErrorMessage = msg.ErrorResult.BizErrors[0].ErrorTitel;
                                    $('#ErrorMessage').css('color', 'red');
                                    // $scope.GetBizCode(msg.NosaziCode.NidNosaziCode);
                                }
                                else {
                                  //  $('#btnInfo').hide();
                                    $('#divConfirm').show();
                                    $('#ErrorMessage').css('color', 'green');
                                    $scope.ErrorMessage = "اطلاعات صحیح است . کد تائیدیه که به شماره همراه شما ارسال میگردد را وارد نمائید";
                                    $scope.NidNosaziCode = msg.NosaziCode.NidNosaziCode;
                                    if (DebugMode)
                                    $.each(CI_ArchivegroupList, function (index, value) {
                                         $scope.GetBizCode(msg.NosaziCode.NidNosaziCode,value);
                                     });
                                }
                                $scope.$apply();
                                StopBusy('MainDiv');
                            },
                            error: function (c) {
                                var g = c;
                                $scope.ErrorMessage = 'اطلاعات معتبر نمیباشد';
                                StopBusy('MainDiv');
                                $scope.$apply();
                            }
                        });
                    }
                    //if Null
                };
                $scope.ConfirmCodeOk = function ()
                {
                    $.each(CI_ArchivegroupList, function (index, value) {
                        $scope.GetBizCode($scope.NidNosaziCode, value);
                    });
                };
                $scope.GetBizCode = function (pNidNosaziCode, pCi) {
                    var d = { pNidNosaziCode: pNidNosaziCode, pCI_ArchiveGroup: pCi, pDistrict: District1 };
                    var c = JSON.stringify(d);
                    StartBusy('divUploader', 'در حال دریافت کد آرشیو');
                    var tt = pCi;
                    $request = $.ajax({
                        type: "POST",
                        url: ServiceAddress + "GetArchiveWrapper",
                        data: c,
                        crossDomin: true,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        processdata: true,
                        success: function (msg, tt) {
                            StopBusy('divUploader');

                            if (msg.ArchiveWrapper != null) {
                                tmpBizCode = msg.ArchiveWrapper.BizCode;
                                $scope.ShowArchive(tmpBizCode, pCi);
                            }
                        },
                        error: function (c) {
                            StopBusy('divUploader');
                            var g = c;
                        }
                    });
                };


                $scope.ShowArchive = function (pArchiveBizCode, pci) {
                    var divName = 'div' + pci;
                    $('#Danesh').append('<div class="GamBoxFrame" id=' + divName + ' style=\'clear:both;padding:5px;margin:5px\'></div>');
                    var Dan = $('#' + divName).AsSafaArchive();
                    Dan.LoadObj(pArchiveBizCode, District1, 1,
                        {
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
                        }, callback = function (c) {
                            if (typeof(c)=='string')
                                $(c).hide();
                        });
                };


            });

            function GetScope() {
                return angular.element(document.getElementById('MainDiv')).scope();
            }

        </script>
    </div>
</asp:Content>

