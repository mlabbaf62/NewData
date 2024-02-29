<%@ Page Title="" Language="C#" MasterPageFile="~/UGPMaster.Master" AutoEventWireup="true" CodeBehind="UVote.aspx.cs" Inherits="UGP.UI.UVote" %>


<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <link rel="stylesheet" href="Style/style.css" />

    <div ng-app="App" ng-controller="CtlZabteh" style="box-sizing: content-box!important">


        <h3 style="font-family: Tahoma; color: white">نتایج نظرسنجی</h3>
        <fieldset>

            <div id="GridView">
           
                    <div class="progress" ng-repeat="n in PoolingList">
                        <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
                            aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="box-shadow: none" ng-style="{ 'width': n.Percent + '%' }"
                            title="تعداد نظرات {{n.Value}}">

                            <span ng-bind="n.Name"></span> <span>&nbsp;&nbsp;</span><span ng-bind="n.Percent"></span><span>%</span>
                            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <span>تعداد : </span><span ng-bind="n.Value"></span>
                        </div>

                    </div>

            
            </div>
        </fieldset>

    </div>


    <script>

        var App = angular.module('App', []);
        App.controller('CtlZabteh', function ($scope, $http) {

            $scope.GetVote = function () {
                $scope.ErrorMessage = null;
                StartBusy('GridView');
                $request = $.ajax({
                    type: "POST",
                    url: UgpService + "GetPooling",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {

                        StopBusy('GridView');

                        if (msg.PoolingList == null)
                            $scope.ErrorMessage = "اطلاعاتی یافت نشد";
                        else {

                            $scope.PoolingList = msg.PoolingList;
                            $scope.w = 50;
                        }

                        $scope.$apply();

                    },
                    error: function (c) {

                    }
                });

            };

            $scope.GetPooling = function (item, event) {
                StartBusy('GridView');
                $http.post('UVote.aspx/GetPooling', { data: {} })
                  .success(function (data, status, headers, config) {
                      StopBusy('GridView');
                      $scope.PoolingList = data.d;
                  })
                  .error(function (data, status, headers, config) {
                      alert('ww'); StopBusy('GridView');
                      $scope.status = status;
                  });
            }
            $scope.GetPooling();
            // $scope.GetVote();
        });





    </script>

</asp:Content>
