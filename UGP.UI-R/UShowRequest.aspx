<%@ Page Title="درخواست های من" Language="C#" AutoEventWireup="true" CodeBehind="UShowRequest.aspx.cs" Inherits="UGP.UI.UShowRequest" MasterPageFile="~/UGPMaster.Master" %>

<%@ Register Src="~/UC/Req/RequestComments.ascx" TagName="Req" TagPrefix="Step" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>

<%--
0=شروع نشده
1=در جریان
2=منتظر
3=کامل شده
4=ابطال شده--%>


<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script type="text/javascript" src="Archive/SafaArchive.min.js?p=00032"></script>

    <style>
        .GridView {
            border-bottom: solid 2px silver;
        }

            .GridView > tbody > tr:hover:nth-child(even) {
                background-color: #f8f5ed;
            }

            .GridView > tbody > tr:hover:nth-child(odd) {
                background-color: #f8f5ed;
            }

        thead td:hover {
            cursor: pointer;
            text-decoration: underline;
        }

        .GridView tr {
            height: 30px;
            background-color: #fcfcfc;
            cursor: pointer;
        }

            .GridView tr.active {
                /*background-color: #33cde9!important;*/
                background-color: #f3c512 !important;
            }

            .GridView tr:nth-child(even) {
                background: #f5f5f5;
            }

        .GridViewMobile.active {
            background-color: #cdead1 !important;
        }
        /*.Grid tr:nth-child(odd) {
            background: #FFF;
        }*/


        .grid1 {
            font-size: 12px;
        }

            .grid1 div > span > span {
                font-weight: bold;
                font-size: 13px;
            }

            .grid1 div > span > a {
                cursor: pointer;
            }

                .grid1 div > span > a:hover {
                    cursor: pointer;
                    font-weight: bold;
                }

        .cell1 {
            border: 1px solid lightgray;
            margin-bottom: 5px;
            border-radius: 2px;
        }

            .cell1:hover {
                border: 1px solid #cccccc;
                background-color: #fafafa;
            }

                .cell1:hover * {
                    color: #3408cc !important;
                    /*font-size: 13px !important;*/
                }

        .btn0 {
            margin-left: 10px;
            background-color: #8391af !important;
        }
    </style>

    <style>
        .pagination {
            display: inline-block;
            float: left;
        }

            .pagination a {
                color: black;
                float: left;
                padding: 1px 6px;
                text-decoration: none;
                cursor: pointer;
            }

                .pagination a.active {
                    background-color: #4CAF50;
                    color: white;
                }

                .pagination a:hover:not(.active) {
                    background-color: #ddd;
                }
    </style>

    <style>
        .cart {
            width: 100%;
        }

        .hasTooltip {
        }

            .hasTooltip span {
                display: none;
                color: #000;
                text-decoration: none;
                padding: 3px;
            }

            .hasTooltip:hover span {
                display: block;
                position: absolute;
                border: 1px solid #CCC;
                margin: 2px 10px;
                max-width: 300px;
                background-color: black;
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 15px 10px;
                position: absolute;
                z-index: 1;
                border-bottom: 1px dotted black;
            }

        /*.hasTooltip span:after {
            content: "";
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #555 transparent
        }*/
    </style>
    <fieldset class="GamBox col-sm-12 col-xs-12  col-md-12" style="margin: 0; width: 100%!important">
        <div class="GamBoxFrame col-sm-12 col-xs-12  col-md-12">
            <h3>لیست درخواست های پیشین</h3>

            <div ng-app="App" ng-controller="myCtrl" id="MainRequest">
                <div id="" class="panel panel-success" style="max-height: 70%;">

                    <div id="Mainp1" class="panel-body nopadding">
                        <div class="hidden-lg hidden-md">
                            <div id="divList" class="grid1 table table-striped" style="/*height: 450px; overflow-y: scroll; */">
                                <div>
                                     <span class="col-md-12">جستجو بر اساس کد نوسازی و شماره پیگیری</span>

                                    <input  type="text" id="txtSearch1" title="جستجو بر اساس کد نوسازی و شماره پیگیری" style="direction: ltr" onsubmit="return false" />
                                    <input  type="button" value="جستجو" ng-click="SearchInRequestList(1)" />
                                </div>

                                <div runat="server" id="divAccounts2" visible="false">
                                    <span class="col-md-6">انتخاب کاربران</span>
                                    <div class="col-md-6">
                                        <asp:DropDownList runat="server" ClientIDMode="Static" ID="cmbAccounts2" Width="130"></asp:DropDownList>
                                    </div>
                                </div>
                                <div runat="server" id="divWorkFlow2" visible="false" style="padding-bottom:10px" >
                                    <span class=" col-md-6">نوع درخواست</span>
                                    <div class="col-md-6">
                                        <asp:DropDownList runat="server" ClientIDMode="Static" ID="cmbW2"></asp:DropDownList>
                                    </div>
                                </div>


                                <div ng-repeat="x in GridData">
                                    <div class="col-md-12 col-xs-12 col-lg-12 nopadding cell1 GridViewMobile" ng-class="x.stylefilde" title="{{x.NosaziCode}}" onclick='ShowOnMap("{{x.NosaziCode}}")'>

                                        <span class="col-sm-6 col-xs-12  fltr ">کد ارجاع:<span ng-bind="x.NidKartablItem"></span></span>


                                        <div class="col-sm-6 col-xs-12 fltr">
                                            <span style="float: right">کدنوسازی :</span>
                                            <span ng-bind="x.NosaziCode" class="fltr" style="font-weight: bold; float: right; text-align: right"></span>
                                        </div>

                                        <span class="col-sm-6 col-xs-12  fltr">نوع درخواست : <span ng-bind="x.WorkflowTitel"></span></span>
                                        <span class="col-sm-6 col-xs-6  fltr " style="padding-left: 0;">تاریخ ثبت :<span ng-bind="x.RequestDate"></span></span>
                                        <span class="col-sm-6 col-xs-6  fltr">زمان ثبت :<span ng-bind="x.RequestTime"></span></span>
                                        <span class="col-sm-6 col-xs-12 lblRefer fltr">ارجاع داده شده به :<span ng-bind="x.AssingToUserName"></span></span>
                                        <span class="col-sm-6 col-xs-12  fltr">مرحله :<span ng-bind="x.TaskTitel"></span></span>
                                        <span class="col-sm-6 col-xs-12  fltr">وضعیت پرونده :
                                        <span ng-show="x.EumProcStatus==0">شروع</span>
                                            <span ng-show="x.EumProcStatus==1">در جریان</span>
                                            <span ng-show="x.EumProcStatus==2">منتظر</span>
                                            <span ng-show="x.EumProcStatus==3">کامل شده</span>
                                            <img ng-show="x.EumProcStatus==4" title="ابطال شده" src="Images/Revoke.png" style="width: 28px" />
                                            <span ng-show="x.EumProcStatus==4" style="color: red!important">ابطال شده</span>
                                        </span>
                                        <div>
                                            <input ng-hide="x.EumProcStatus==3 || x.EumProcStatus==4 || x.SysCI_ProcState==7" type="button" class="btn btn-success col-md-2 col-sm-2  col-xs-4 fltr" style="float: right; width: auto" value="نمایش پرونده" onclick="loadpg('{{x.NidWorlflowDeff}}', '{{x.NidProc}}', '{{x.MenuID}}')" />
                                            <input <%--ng-disabled="x.SysCI_ProcState!=7"--%> type="image" src="images/Cert.png" style="padding-top: 10px; float: right" title="نمایش تصویر گواهی" onclick="loadPage('FrmArchive.aspx?NidProc={{x.NidProc}}', true)" onsubmit="return false" />
                                            <input ng-hide="ShowArchiveButton==false" type="image" src="images/Archive.png" style="padding-top: 10px; float: right" title="بارگذاری مدارک" onclick="loadPage('FrmArchive.aspx?NosaziCode={{x.NosaziCode}}&id={{x.NidWorlflowDeff}}&BizCode={{x.ArchiveBizCode}}', true)" onsubmit="return false" />

                                            <input ng-show="ShowReportButton==true" type="image" src="images/export.png" style="padding-top: 10px" title="نمایش گزارشات" onclick="loadPage('FrmAllReport.aspx?NosaziCode={{x.NosaziCode}}&NidProc={{x.NidProc}}', true)" onsubmit="return false" />
                                        </div>
                                    </div>
                                </div>

                                <div ng-show="GridData==null">
                                    <span style="color: red; margin-right: 10px">موردی یافت نشد</span>
                                </div>

                            </div>
                        </div>



                        <div class="GridViewDesktop hidden-xs hidden-sm">
                            <div id="divList2" class=" grid1 table table-striped" style="/*height: 450px; overflow-y: scroll; */">
                                <div>
                                    <div style="float: right">
                                        <span>جستجو بر اساس کد نوسازی و شماره پیگیری</span>
                                        <div>
                                            <input type="text" style="width: 180px; direction: ltr" id="txtSearch2" onsubmit="return false" />
                                            <input type="button" value="جستجو" ng-click="SearchInRequestList(2)" />
                                        </div>
                                    </div>

                                    <div runat="server" id="divAccounts" visible="false" style="float: right; margin-right: 50px">
                                        <span>انتخاب کاربران</span>
                                        <div>
                                            <asp:DropDownList runat="server" ClientIDMode="Static" ID="cmbAccounts" Width="130"></asp:DropDownList>
                                        </div>
                                    </div>
                                    <div runat="server" id="divWorkFlow" visible="false" style="float: right; margin-right: 50px">
                                        <span>نوع درخواست</span>
                                        <div>
                                            <asp:DropDownList runat="server" ClientIDMode="Static" ID="cmbW"></asp:DropDownList>
                                        </div>
                                    </div>

                                    <%--  <div runat="server" id="divAccounts" visible="false" style="float: right">
                                            <span>انتخاب کاربران 
                                            </span>
                                            <asp:DropDownList runat="server" ClientIDMode="Static" ID="cmbAccounts" Width="130" ng-change="loadGridData()"></asp:DropDownList>
                                        </div>--%>
                                </div>


                                <div style="overflow-y: auto; max-height: 500px; clear: both">
                                    
                                  
                                    <table id="GridView1" class="GridView" style="overflow-x: auto">
                                        <thead>
                                            <tr>
                                                <td onclick="sortTable(0)" class="" style="border-left: 1px solid white;">کد ارجاع</td>
                                                <td onclick="sortTable(0)" class="" style="border-left: 1px solid white;">نام کاربر</td>
                                                   <td onclick="sortTable(1)" ng-show="ClsAccount.AccountInfo.EumAccountType == 3" class="" style="border-left: 1px solid white;">کد ملی</td>
                                                <td onclick="sortTable(2)" class="" style="border-left: 1px solid white;">کدنوسازی</td>
                                                <td onclick="sortTable(3)" class="" style="border-left: 1px solid white;">نوع درخواست</td>
                                                <td onclick="sortTable(4)" class="" style="border-left: 1px solid white;">تاریخ ثبت</td>
                                                <td onclick="sortTable(5)" style="border-left: 1px solid white;">زمان ثبت</td>

                                                <td class="lblRefer" style="border-left: 1px solid white;">ارجاع داده شده به</td>
                                                <td onclick="sortTable(7)" class="" style="border-left: 1px solid white;">مرحله</td>
                                                <td class="" style="border-left: 1px solid white; max-width: 150px"></td>
                                                <td onclick="sortTable(9)" class="" style="border-left: 1px solid white;">وضعیت پرونده</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr ng-repeat="x in GridData" onclick='ShowOnMap("{{x.NosaziCode}}")'>

                                                <td class="" ng-bind="x.NidKartablItem"></td>
                                                <td style="width: auto" ng-bind="x.AssingToUserName"></td>
                                                        <td style="width: auto"  ng-show="ClsAccount.AccountInfo.EumAccountType == 3" ng-bind="x.NationalCode"></td>
                                                <td class="" ng-bind="x.NosaziCode"></td>
                                                <td class="" ng-bind="x.WorkflowTitel"></td>
                                                <td class="" ng-bind="x.RequestDate"></td>
                                                <td class="" ng-bind="x.RequestTime"></td>
                                                <td class="lblRefer" ng-bind="x.AssingToUserName"></td>
                                                <td class="" ng-bind="x.TaskTitel"></td>
                                                <td style="padding: 3px; width: 250px">
                                                    <input ng-disabled="x.EumProcStatus==3 || x.EumProcStatus==4 || x.SysCI_ProcState==7" type="button" class="btn btn-success" style="float: right" value="نمایش پرونده" title="نمایش تصویر گواهی و چاپ" onclick="loadpg('{{x.NidWorlflowDeff}}', '{{x.NidProc}}', '{{x.MenuID}}')" onsubmit="return false" />
                                                    <input <%--ng-disabled="x.SysCI_ProcState!=7"--%> type="image" src="images/Cert.png" style="padding-top: 10px" title="نمایش تصویر گواهی" onclick="loadPage('FrmArchive.aspx?NidProc={{x.NidProc}}', true)" onsubmit="return false" />

                                                    <input ng-hide="ShowArchiveButton==false" type="image" src="images/Archive.png" style="padding-top: 10px" title="بارگذاری مدارک" onclick="loadPage('FrmArchive.aspx?NosaziCode={{x.NosaziCode}}&id={{x.NidWorlflowDeff}}&BizCode={{x.ArchiveBizCode}}', true)" onsubmit="return false" />
                                                    <%--<input type="image" src="images/export.png" style="padding-top: 10px" title="نمایش گزارشات" onclick="loadPage('FrmAllReport.aspx?NosaziCode={{x.NosaziCode}}&NidProc={{x.NidProc}}', true)" onsubmit="return false" />--%>
                                                    <input type="image" src="images/export.png" style="padding-top: 10px" title="سوابق پرداختی" onclick="loadPage('UShowFishj-History.aspx?NosaziCode={{x.NosaziCode}}&NidProc={{x.NidProc}}', true)" onsubmit="return false" />

                                                    <input ng-show="ShowReportButton==true" type="image" src="images/export.png" style="padding-top: 10px" title="نمایش گزارشات" onclick="loadPage('FrmAllReport.aspx?NosaziCode={{x.NosaziCode}}&NidProc={{x.NidProc}}', true)" onsubmit="return false" />

                                                </td>
                                                <td>

                                                    <span ng-show="x.EumProcStatus==0">در جریان</span>
                                                    <span ng-show="x.EumProcStatus==1">در جریان</span>
                                                    <span ng-show="x.EumProcStatus==2">در جریان</span>
                                                    <span ng-show="x.EumProcStatus==3">کامل شده</span>
                                                    <div ng-show="x.EumProcStatus==4">
                                                        <%--<img title="ابطال شده" src="Images/Revoke.png" style="width: 28px; cursor: default" />--%>
                                                        <%--    <a href="productdetails.htm" class="hasTooltip" >ggg  
                                                            <span>New visual experience!</span>
                                                        </a>--%>
                                                        <div id="tooltip">
                                                            <img title="ابطال شده" ng-click="GetGarbageComment($event, x.NidKartablItem,x.District)" src="Images/Revoke.png" style="width: 28px; cursor: pointer" />

                                                            <%--<input type="button" value="علت ابطال" ng-click="GetGarbageComment($event, x.NidKartablItem,x.District)" />--%>
                                                            <span></span>
                                                        </div>
                                                        <%-- <div class="tooltip">
                                                            <input type="button" value="علت ابطال" ng-click="GetGarbageComment($event, x.NidKartablItem,x.District)" />

                                                            <span class="tooltiptext">Tooltip text</span>
                                                        </div>--%>
                                                    </div>

                                                    <span ng-show="x.EumProcStatus==6">موقت</span>

                                                    <%--   <span ng-show="x.EumProcStatus==4" style="color: red">
                                             
                                                ابطال شده:</span>--%>
                                                </td>

                                            </tr>
                                            <tr ng-show="GridData==null">
                                                <td colspan="8" style="text-align: center">
                                                    <span style="color: red">موردی یافت نشد</span>
                                                </td>
                                            </tr>

                                            <tr id="DivChild" style="display: none">
                                                <td colspan="9" style="padding-right: 0; padding-bottom: 10px; padding-top: 10px; background-color: #7b7b7b">
                                                    <div ng-include="'Uc/UProcInfo.html'">
                                                    </div>
                                                </td>
                                            </tr>

                                        </tbody>

                                    </table>

                                </div>

                                <ul>
                                    <%--                                    <li ng-repeat="i in getNumber(number)">
    <span>{{ $index+1 }}</span>
</li>
                                    --%>
                                </ul>

                                <div class="pagination">
                                    <a href="#">&laquo;</a>
                                    <a ng-class="{'active': $index == 0}" href="#" ng-repeat="i in PageArray" onclick="GoPage({{$index}},this)">{{$index+1}}</a>
                                    <a href="#">&raquo;</a>
                                </div>

                                <%--                                <div class="pagination">
                                    <a href="#">&laquo;</a>
                                    <a class="active" onclick="GoPage(0,this)">1</a>
                                    <a onclick="GoPage(1,this)">2</a>
                                    <a href="#">3</a>
                                    <a href="#">4</a>
                                    <a href="#">5</a>
                                    <a href="#">6</a>
                                    <a href="#">&raquo;</a>
                                </div>--%>
                            </div>
                        </div>

                    </div>

                </div>

                <div class="panel panel-success" style="clear: both">
                    <div class="panel-heading">
                        <span>موقعیت ملک بروی نقشه</span>
                    </div>
                    <div class="panel-body nopadding">
                        <div class="GridView2">
                            <div id="m"></div>

                        </div>

                    </div>
                </div>
            </div>
            <script>
                function loadpg(pNidWorkFlowDeff, pNidProc, pMenuID) {
                    var Param = '?NidProc=' + pNidProc;

                    var pPageUrl = '';
                    if (pNidWorkFlowDeff.toLowerCase() == RequestTypeGuid.toLowerCase())
                        pPageUrl = "UStepGam.aspx";
                    else if (pNidWorkFlowDeff.toLowerCase() == RequestTypeTransferGuid.toLowerCase())
                        pPageUrl = "UTransferGam.aspx";
                    //else if (pNidWorkFlowDeff.toLowerCase() == RequestTypeBazdidGuid.toLowerCase())
                    //    pPageUrl = "UStepGamNew.aspx";
                    else if (pNidWorkFlowDeff.toLowerCase() == NidWorkFlowDeff_Payankar.toLowerCase())
                        pPageUrl = "FrmPayankar.aspx";
                    else if (pNidWorkFlowDeff.toLowerCase() == NidWorkFlowDeff_Hardening.toLowerCase())
                        pPageUrl = "FrmHardening.aspx";
                    else if (pNidWorkFlowDeff.toLowerCase() == NidWorkFlowDeff_Parvaneh.toLowerCase())
                        pPageUrl = "FrmParvaneh.aspx";
                    //else if (typeof (NidWorkFlowDeff_ParvanehSh) !== 'undefined' && pNidWorkFlowDeff.toLowerCase() == NidWorkFlowDeff_ParvanehSh.toLowerCase())
                    //    pPageUrl = "FrmParvanehSh.aspx";
                    else {
                        

                        var tmpList = GetScope().WorkflowList;
                        var tmpRes = tmpList.find(x =>
                            x.NidWorkflowDeff === pNidWorkFlowDeff);

                        if (tmpRes != null && tmpRes.PageName != null && tmpRes.PageName != '')
                            pPageUrl = tmpRes.PageName;
                        else
                            pPageUrl = "FrmParvaneh.aspx";

                        ///////////////////////////////////
                    }

                    if (pMenuID != undefined && pMenuID != '')
                        Param += '&ID=' + pMenuID;
                    else {
                        var tmpMenuSelected = Enumerable.From(GetScopeMenu().Menu[1].SubMenu).Where(function (x) { return (x.NidWorkflowDeff != undefined && x.NidWorkflowDeff.toLowerCase() == pNidWorkFlowDeff.toLowerCase()) }).FirstOrDefault();
                        if (tmpMenuSelected != undefined) {
                            Param += '&ID=' + tmpMenuSelected.ID;
                        }
                    }

                    //////////////////////////////////


                    if (pPageUrl == null)
                        alert('درخواست مورد نظر تعریف نشده است');
                    else {
                        StartBusy('MainBody');
                        window.open(pPageUrl + Param, '_self');
                    }
                }
                function loadPage(str, pNewTab) {
                    var target = '_self';
                    if (pNewTab != undefined)
                        target = '_blank';
                    window.open(str, target);
                    console.log(str)
                }
                function ShowOnMap(pNosaziCode) {
                    try {

                        var p1 = pNosaziCode.split('-');
                        var tmpMapCode = p1[0] + '-' + p1[1] + '-' + p1[2] + '-' + p1[3] + '-0-0-0';
                        MapNosaziCode = tmpMapCode;
                        MapFind();
                    }
                    catch (ex) { }
                }
            </script>

        </div>
    </fieldset>
    <div>
        <link rel="stylesheet" href="Style/w3.css">
        <div id="id01" class="w3-modal">
            <div class="w3-modal-content" style="width: 500px; min-height: 150px;">
                <div class="w3-container" style="padding: 20px">
                    <span onclick="document.getElementById('id01').style.display='none'" class="w3-button w3-display-topright" style="color: red">&times;</span>

                    <div class="headerText">
                        نمایش دلیل ابطال 
                    </div>
                    <hr />
                    <div style="float: right!important">
                        <span style="float: right; color: red" id="lblMessage"></span>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <script>

        function Accept(cb) {
            var form = document.getElementsByTagName("form")[0];
            var y = form[0].form[20].name;
            var x = document.getElementsByName(y);
            x[0].style.visibility = 'hidden';
        }
    </script>

    <br />

    <script>
        var tpdata

        $(document).ready(function () {
            LoadMap();
        });

        function PrintInquery(NidProc, District, pType) {
            var ReportName = 'RptInquiry';
            if (pType.toLowerCase() == RequestTypeTransferGuid.toLowerCase())
                ReportName = 'RptInquiry';

            //var ReportName = 'RptInquiry';
            //if (pType == 'گواهی انتقال') {
            //    ReportName = 'RptPayankar';
            //}
            var tmpStr = ReportName + "&ReportParameter=NidProc;" + NidProc + ",District;" + District + ",TokenKey;";
            window.open(FactorUrl + tmpStr, '_blank');
        }
    </script>

    <script>
        var App = angular.module('App', []);
        App.controller('myCtrl', function ($scope) {

            $scope.RequestTypeBazdidGuid = RequestTypeBazdidGuid;
            var CurrentNidAccount = null;
            var CurrentNidWorkFlowDeff = null;

            //GetAccountInfo((result) => {

            //    CurrentNidAccount = ClsAccount.AccountInfo.NidAccount;
            //    $scope.loadGridData(0);
            //});



            $scope.loadGridData = function (pIndex, pNidAccount) {

                var pSearchText = $('#txtSearch1').val();
                if (pSearchText == '' || pSearchText == undefined)
                    pSearchText = $('#txtSearch2').val();

                if (pSearchText == undefined)
                    pSearchText = '';


                StartBusy('MainBody', 'در حال دریافت اطلاعات درخواست های پیشین');
                var d = { PageIndex: pIndex, pSearchText: pSearchText, pNidAccount: CurrentNidAccount, pNidWorkflowDeff: CurrentNidWorkFlowDeff };
                var c = JSON.stringify(d);
                $.ajax({
                    type: "POST",
                    data: c,
                    url: "UShowRequest.aspx/LoadObj",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        $scope.GridData = response.d.RequestList
                        $scope.WorkflowList = response.d.WorkflowList;

                        $scope.PageArray = new Array(response.d.PageCount);

                        StopBusy('MainBody');

                        $scope.$apply();
                        SetClickEvent();


                        if (typeof (HideReferFiled) != "undefined" && HideReferFiled)
                            $('.lblRefer').hide();
                    },
                    failure: function (response) {
                        StopBusy('MainBody');
                        response;
                    }
                });
            }

            $('#cmbAccounts').change(function () {
                CurrentNidAccount = $(this).val();
                GetScope().loadGridData(0);
            })
            $('#cmbW').change(function () {
                CurrentNidWorkFlowDeff = $(this).val();
                GetScope().loadGridData(0);
            })
            GetAccountInfo();
            CurrentNidAccount = ClsAccount.AccountInfo.NidAccount;
            

            $scope.ClsAccount = ClsAccount; 
           
            $scope.loadGridData(0);
            SetClickEvent2();

            $scope.SearchInRequestList = function (pIndex) {
                try {
                    $scope.loadGridData(0);

                    //pSearchText = $('#txtSearch' + pIndex).val();
                    //if (pSearchText == undefined)
                    //    pSearchText = '';

                    //StartBusy('MainBody', 'در حال دریافت اطلاعات درخواست های پیشین');
                    //var d = { PageIndex: pIndex, pSearchText: pSearchText };
                    //var c = JSON.stringify(d);
                    //$.ajax({
                    //    type: "POST",
                    //    data: c,
                    //    url: "UShowRequest.aspx/LoadObj",
                    //    contentType: "application/json; charset=utf-8",
                    //    dataType: "json",
                    //    success: function (response) {
                    //        $scope.GridData = response.d.RequestList
                    //        $scope.WorkflowList = response.d.WorkflowList;
                    //        $scope.PageArray = new Array(response.d.PageCount);
                    //        StopBusy('MainBody');
                    //        $scope.$apply();
                    //        SetClickEvent();
                    //    },
                    //    failure: function (response) {
                    //        StopBusy('MainBody');
                    //        response;
                    //    }
                    //});


                }
                catch (ex) {
                    alert(ex);
                }
            }
            $scope.GetProcInfo = function (pNidProc, pParentRow) {

                StartBusy('GridView', '');
                var d = { PNidProc: pNidProc };

                var c = JSON.stringify(d);
                $('#DivChild').show();
                $.ajax({
                    type: "POST",
                    data: c,
                    url: TaskService + "GetProcessInfo",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {

                        StopBusy('GridView');
                        $scope.GridDataProcInfo = response.Task;
                        $scope.$apply();

                        var tmpRow = $(pParentRow.currentTarget).parent().parent();

                        var Child = $('#DivChild');
                        $(tmpRow).after(Child);
                    },
                    failure: function (response) {
                        StopBusy('MainBody');
                        response;
                    }
                });

            }
            $scope.GetTaskInfo = function (pNidProc, pParentRow) {

                StartBusy('GridView', '');
                var d = { PNidProc: pNidProc };

                var c = JSON.stringify(d);
                $('#DivChild').show();
                $.ajax({
                    type: "POST",
                    data: c,
                    url: TaskService + "GetTaskInfo",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {

                        StopBusy('GridView');
                        $scope.GridDataProcInfo = response.Task;
                        $scope.$apply();

                        var tmpRow = $(pParentRow.currentTarget).parent().parent();

                        var Child = $('#DivChild');
                        $(tmpRow).after(Child);
                    },
                    failure: function (response) {
                        StopBusy('MainBody');
                        response;
                    }
                });

            }

            $scope.GetWorkFlowList = function () {


                $.ajax({
                    type: "POST",
                    url: "FrmParvaneh.aspx/GetAllWorkFlowList",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,

                    success: function (msg) {


                        $scope.WorkflowList = msg.d.WorkflowList;
                        $scope.$apply();

                    },
                    error: function (c) {
                    }
                });
            }
            $scope.ShowArchiveButton = (typeof (ShowArchiveButton) !== 'undefined') ? ShowArchiveButton : true;
            $scope.ShowReportButton = (typeof (ShowReportButton) !== 'undefined') ? ShowReportButton : false;

            $scope.GetGarbageComment = function (pthis, pNidWorkItem, pDomain) {
                var control = $($(pthis.target).next());
                document.getElementById('id01').style.display = 'block'
                var d = { pNidWorkItem: pNidWorkItem, pDomain: pDomain };
                var c = JSON.stringify(d);
                control.text('');
                $.ajax({
                    type: "POST",
                    url: ServiceAddress + "GetRequestGarbageComment",
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: c,
                    processdata: true,
                    success: function (msg) {
                        if (msg.RequestGarbageComment != '' && msg.RequestGarbageComment != null)
                            $('#lblMessage').text(msg.RequestGarbageComment);
                        else {
                            $('#lblMessage').text('موردی ثبت نشده است');
                            $('#lblMessage').css('color', 'red');
                        }
                    },
                    error: function (c) {
                    }
                });
            }
        });
        var tmpOldData = null;
        function GetScope() {
            return angular.element(document.getElementById('MainRequest')).scope();
        }
        var SetClickEvent = function () {

            $(".GridView > tbody tr").mousedown(function () {
                $(".GridView > tbody tr").removeClass("active");
                $(this).addClass("active");
            });
            $(".GridViewMobile").mousedown(function () {
                $(".GridViewMobile").removeClass("active");
                $(this).addClass("active");
            });
        }
        var SetClickEvent2 = function () {

            $("#txtSearch1,#txtSearch2").keypress(function (evt) {
                if (evt.keyCode == 13) {
                    var index = (evt.currentTarget.id == 'txtSearch1') ? 1 : 2;
                    GetScope().SearchInRequestList(index);
                    evt.preventDefault();
                }
            });
        }
    </script>

    <script>
        function sortTable(n) {
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
        }
        function GoPage(pIndex, pthis) {
            $('.pagination').children().removeClass('active');
            pthis.className = ("active")
            GetScope().loadGridData(pIndex);
        }
    </script>
</asp:Content>
