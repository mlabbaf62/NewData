<%@ Page Title="لیست پیامک ها " Language="C#" AutoEventWireup="true" CodeBehind="UShowSMS.aspx.cs" Inherits="UGP.UI.UShowSMS" MasterPageFile="~/UGPMaster.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <script type="text/javascript" src="Archive/SafaArchive.min.js?p=00032"></script>

    <style>
        a.pcalBtn {
            display: none
        }

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
            <h3>لیست پیامک ها</h3>

            <div ng-app="App" ng-controller="myCtrl" id="MainRequest">
                <div id="" class="panel panel-success" style="max-height: 70%;">

                    <div id="Mainp1" class="panel-body nopadding">

                        <div class="GridViewDesktop hidden-xs hidden-sm">

                            <div class="col-md-4" style="float: right; direction: rtl">

                                <input type="text" style="width: 150px; float: right" id="txtDate" ng-keyup="$event.keyCode == 13 && loadGridData()" class="form-control" placeholder="تاریخ را وارد نمایید" />
                                <input type="text" style="width: 270px; float: right" id="txtNosaziCode" ng-keyup="$event.keyCode == 13 && loadGridData()" class="form-control" placeholder="کد نوسازی یا شماره درخواست را وارد نمایید" />

                                <input type="button" style="float: right; width: 130px" class="btn btn-success" ng-click="loadGridData()" value="جستجو" />

                            </div>
                            <div id="divList2" class=" grid1 table table-striped" style="/*height: 450px; overflow-y: scroll; */">

                                <div style="overflow-y: auto; max-height: 500px; clear: both">


                                    <table id="GridView1" class="GridView" style="overflow-x: auto">
                                        <thead>
                                            <tr>
                                                <td onclick="sortTable(0)" class="" style="border-left: 1px solid white; width: 200px">شماره همراه</td>
                                                <td onclick="sortTable(1)" class="" style="border-left: 1px solid white;">متن</td>
                                                <td onclick="sortTable(2)" class="" style="border-left: 1px solid white; width: 150px">تاریخ</td>

                                                <td onclick="sortTable(3)" class="" style="border-left: 1px solid white; width: 350px">کد</td>
                                                <%-- <td onclick="sortTable(1)" class="" style="border-left: 1px solid white;width:200px">شماره درخواست</td>
                                                --%>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr ng-repeat="x in GridData">

                                                <td class="" ng-bind="x.Number"></td>
                                                <td style="width: auto" ng-bind="x.Text"></td>
                                                <td class="" ng-bind="x.CreateDate"></td>
                                                <td class="" ng-bind="x.BizCode"></td>



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

                                <div class="pagination">
                                    <a href="#">&laquo;</a>
                                    <a ng-class="{'active': $index == 0}" href="#" ng-repeat="i in PageArray" onclick="GoPage({{$index}},this)">{{$index+1}}</a>
                                    <a href="#">&raquo;</a>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>


            </div>

        </div>
    </fieldset>


    <br />


    <script>
        var App = angular.module('App', []);
        App.controller('myCtrl', function ($scope) {


            $scope.loadGridData = function (pNumber) {

                StartBusy('MainBody', 'در حال دریافت اطلاعات پیامک ها ');
                var d = { Number: ClsAccount.AccountInfo.OwnerTell, SendDate: $('#txtDate').val(), Bizcode: $('#txtNosaziCode').val()};
                var c = JSON.stringify(d);
                $.ajax({
                    type: "POST",
                    data: c,
                    url: ServiceAddress + 'GetSMSListByNumber',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        $scope.GridDataBase = response.SMSListByNumber;
                        $scope.GridData = $scope.GridDataBase;

                        $scope.GridData = Enumerable.From($scope.GridData)
                            .OrderByDescending("$.ScheduleSendDate || '0000'")
                            .ToArray();

                        StopBusy('MainBody');

                        $scope.$apply();
                        SetClickEvent();

                    },
                    failure: function (response) {
                        StopBusy('MainBody');
                        response;
                    }
                    ,
                    error: function (response) {
                        StopBusy('MainBody');
                        response;
                    }

                });

            }

            $scope.SearchData = function () {

                var tmpNosaziCode = $('#txtNosaziCode').val();
                var tmpDate = $('#txtDate').val();

                $scope.GridData = Enumerable.From($scope.GridDataBase)
                    .OrderByDescending("$.ScheduleSendDate")
                    .ToArray();
                
                if (tmpNosaziCode != '') {

                    $scope.GridData = Enumerable.From($scope.GridData)
                        .Where(function (x) {
                            return Enumerable.From(tmpNosaziCode).Contains(x.BizCode)
                        }).ToArray();

                    }


                    if (tmpDate != '')
                        $scope.GridData = Enumerable.From($scope.GridData)
                            .Where(function (x) {
                                return Enumerable.From([tmpDate]).Contains(x.CreateDate)
                            })
                            .ToArray();

                    $scope.$apply();

                
            };


            GetAccountInfo();


            if (ClsAccount.AccountInfo != null)
                $scope.loadGridData(0);
            else
                alert('ابتدا وارد حساب کاربری شوید')

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


        var objCalSG6 = new AMIB.persianCalendar('txtDate', null, 'p');

    </script>
</asp:Content>
