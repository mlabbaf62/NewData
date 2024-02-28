<%@ Page Title="ثبت درخواست پروانه" EnableEventValidation="false" Language="C#" MasterPageFile="~/UGPMaster2.Master" AutoEventWireup="true" CodeBehind="FrmParvaneh.aspx.cs" Inherits="UGP.UI.FrmParvaneh"%>


<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <script type="text/javascript" src="parvaneh/parvanehGam.js?v=23"></script>
 

    <script type="text/javascript" src="Config/Parvaneh/GamState.js?v=23"></script>
    <script type="text/javascript" src="TransferGam/Bazdid.js?v=23"></script>
    <link href="css/js-persian-cal.css?v=23" rel="stylesheet" />
    <link href="js/js-persian-cal.js?v=23" rel="stylesheet" />
    <script src="js/JSPdate.js?v=23"></script>
             <script type="text/javascript" src="Archive/SafaArchive.js?v=23"></script>

    <div ng-app="AppTransfer" id="ScopeTId">

          <h3><span ng-bind="Header"></span>
            <span class="separator" style="margin: 0 10px 0 10px">| </span>
            <a  onclick="NewRequest()" style="color: #ca4646; cursor: pointer; font-weight: normal">ثبت درخواست جدید</a>
        </h3>

        <style>
            .green {
                color: red;
            }
        </style>
        <div id="MainGam" class="MainGam" ng-controller="CtlTransfer" ng-init="init()">

            <div id='divStep'>
                <div class="col-md-12 col-sm-12 col-xs-12 hidden-sm hidden-xs" style="padding: 0px; padding-right: 15px; float: right;">

                    <div ng-init="StyleFunc.Load()" id="step-div{{$index}}" ng-style="StyleFunc.GetWidth($index)" style="direction: rtl; float: right" class="step-div form-inline" ng-repeat="A in GamsArray">

                        <div class="divDeskShap"  ng-style="StyleFunc.GetFloat($index)">
                            <img id="divDeskShap{{$index}}">
                        </div>
                        <span class="col-md-12 col-lg-12 divDeskShap-span" ng-style="StyleFunc.Getalign($index)" style="color: black;" ng-bind="A.PageTitle"></span>

                    </div>

                    <div class="" style="background: rgb(202, 202, 202); width: 97%; height: 2px; margin-top: 24px; margin-right: 15px;"></div>

                </div>

                <%-- موبایل --%>

                <div class="col-xs-12  col-sm-12 hidden-md hidden-lg" style="padding: 0px; float: right;">

                    <div class="col-xs-12  col-sm-12 nopadding ">

                        <%-- متن مرحله--%>
                        <div class="col-xs-12 nopadding MainStepTextMobile" style="padding-top: 0px !important; margin-top: -5px; font-size: 130%!important">

                            <div style="float: right" class="bold">
                                <div style="float: right">
                                    <span>گام</span>
                                    <span style="margin-right: 10px; margin-left: 10px" id="StepTextNum"></span>
                                    <span>از:</span>
                                    <span style="margin-right: 10px; margin-left: 10px" id="TotalGam"></span>
                                </div>

                                <div style="margin-right: 20px; margin-top: 2px; float: right; font-size: 0.8em">
                                    <span>[</span>
                                    <span id="StepTextMobile"></span>
                                    <span>]</span>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>

                <%-- دکمه مرحله --%>
                <div class="col-lg-12 col-xs-12 nopadding">
                    <div class="col-md-4 col-sm-6 col-xs-12 col-lg-4 nopadding GamNextPre" >
                        <input class="btn btn-success btnPre" id="btnPre" style="margin-left: 5px;" onclick="GamPlugin.preStep()" type="button" value="گام قبلی" />
                        <input class="btn btn-success btnNext" id="btnNext" style="" onclick="GamPlugin.nextStep()" type="button" value="گام بعدی" />
                    </div>
                    <%--     <div class=" col-lg-3" style="padding-top: 5px!important; padding-left: 0!important; float: left; text-align: left">
                        <input class="btn btn-success" id="" style="margin: 0; width: 80px;" onclick="window.open('https://ec.mashhad.ir', '_self')" type="button" value="بازگشت" />

                    </div>--%>
                </div>
                 <div class="DivError GamBox">

                    <h4 class="Error" id="ErrorMessage" ng-style="GreenColor && {'color':'#2aa02d','border-color':'#2aa02d'} || {'color': 'red','border-color':'red'}" ng-bind="Prop.ErrorMessage"></h4>


                </div>
                <div style="padding: 0 35px  0 35px">
                    <div class="GamBoxFrame2 col-md-12" ng-show="GamInputData.CurrentNosaziCode!=''" style="color: black; font-weight: bold; float: right;">
                        <span style="float: right">کدنوسازی : </span>
                        <span ng-bind="GamInputData.CurrentNosaziCode" style="direction: ltr; float: right; letter-spacing: 4px" class="ng-binding"></span>

                        <div ng-show="GamInputData.NidWorkItem!=''" style="color: black; font-weight: bold; float: right; padding-right: 30px; margin-right: 20px; display: none;">
                            <span>شماره درخواست : </span>
                            <span ng-bind="GamInputData.NidWorkItem" style="direction: ltr; float: left; letter-spacing: 4px" class="ng-binding"></span>
                        </div>

                    </div>
                </div>
            </div>

            <div style="clear: both">
                <div ng-include="templateUrl(A.Page)" ng-style="$index==0 && {'display':'block'} || {'display': 'none'}" id="Step{{ $index }}" ng-repeat="A in GamsArray">
                </div>
            </div>

        </div>
    </div>

    <style>
        .modal-backdrop {
        z-index:0;
        }
    </style>
</asp:Content>
