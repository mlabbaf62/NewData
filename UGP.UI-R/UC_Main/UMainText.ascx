<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UMainText.ascx.cs" Inherits="UGP.UI.UC_Main.UMainText" %>

<style>
    .panel {
        margin-bottom: 3px;
    }

    .form-group {
        margin-bottom: 0;
    }

    .ucmaintxt div img {
        width: 25px;
        margin-left: 10px;
    }

    .ucmaintxt ul.Col2 {
        list-style-type: none;
        columns: 2;
    }

    .ucmaintxt ul.Col1 {
        list-style-type: none;
        columns: 4;
    }

    .m1 img {
        width: 19% !important;
    }

    .m1[disabled="disabled"] a {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }

    .m1 a[disabled="disabled"] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
</style>

<div class="headerTitleText">
    <p>
        انجام امور شهرداری شما به راحتی چند کلیک!!!
    </p>
</div>
<div class="headerText">
    <p>
        <span>خدمت            </span>مورد نظر خود را انتخاب و شروع کنید
    </p>
</div>
<div class="headerSearchBox hidden-xs">
    <input type="text" onkeyup="findItemMenu(this.value)" placeholder="نام خدمت مورد نظر را وارد کنید" />
    <img src="Images\Path 46@2x.png" />
</div>
<div class="col-xs-12 hidden-sm hidden-md hidden-lg headerSearchBox">
    <input class="col-xs-12" type="text" onkeyup="findItemMenu(this.value)" style="width: 100%" placeholder="نام خدمت مورد نظر را وارد کنید" />
    <img src="Images\Path 46@2x.png" style="position: absolute; left: 19px; top: 9px;" />
</div>
<script src="UC_Main/searchItemMain.js" type="text/javascript"></script>

<div class="loginReq"><span>جهت استفاده از خدمات اختصاصی  لطفاً به حساب کاربری خود وارد شوید</span> </div>
<div class="serviceNotActice"><span id="serviceNotActice">خدمت فوق فعال نمیباشد</span> </div>

<div class="panel panel-success">
    <div class="panel-heading" style="clear: both">
    </div>
    <div class="panel-body " style="padding-bottom: 10px; margin-bottom: 10px;">

        <%--title="ابتدا وارد سیستم شوید تا بتوانید از خدمات اختصاصی استفاده نمایید"--%>
        <div class="m1  col-lg-10   col-md-10   col-sm-12 col-xs-12 col-sm-offset-1 col-lg-offset-1 col-md-offset-1 nopad" style="text-align: center" ng-disabled="!m.IsLogin" style="padding: 0;">

            <div ng-include="'Config/UMainText.html'"></div>

        </div>


        <script>
            try {
                if (ClsAccount != undefined && ClsAccount.AccountInfo != null) {
                    $('.m1').prop('title', '');
                }
            }
            catch (ex) { }

        </script>
    </div>

</div>
<div class="  col-lg-12   col-md-12   col-sm-12 col-xs-12 MainPageDes">
    <img class="hidden-xs" src="Config/Images/abount-sharvand.png?v=1" style="width: 100%;">
    <img class="hidden-sm hidden-md hidden-lg" src="Config/Images/Mobile-SharvandSepari-Info.png" style="width: 100%;">
</div>
<%--<div class="  col-lg-12   col-md-12   col-sm-12 col-xs-12 MainPageDes" style="text-align: center" ng-include="'Config/UFooter.html'">
 </div>--%>
<script>
    $(document).ready(function () {
        $(".loginReq").hide();
        $(".serviceNotActice").hide();
        var currentMousePos = { x: -1, y: -1 };

        $(document).on('mouseover', 'div.itemSpecialBox', function (event) {
            if (ClsAccount.AccountInfo == null)
                $(".loginReq").show();
            //console.log("itemSpecialBox mouseover");
        });
        $(document).on('mouseout', 'div.itemSpecialBox', function (event) {
            $(".loginReq").hide();
            //console.log("itemSpecialBox mouseout");
        });


        $(document).on('mouseover', 'div.NotActice', function (event) {
            $(".loginReq").hide();
            $(".serviceNotActice").show();
            //console.log("itemSpecialBox mouseover");
        });
        $(document).on('mouseout', 'div.NotActice', function (event) {
            $(".serviceNotActice").hide();
            //console.log("itemSpecialBox mouseout");
        });


        $(document).mousemove(function (event) {//
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
            $(".loginReq").css("left", currentMousePos.x);
            $(".loginReq").css("top", currentMousePos.y - 50);

            $(".serviceNotActice").css("left", currentMousePos.x);
            $(".serviceNotActice").css("top", currentMousePos.y - 50);
        });

        $(document).on('click', 'div.itemSpecialBox', function (event, p) {
            var pgAdd = $(this).attr('itemname');
            var url = window.location.href
            var temp = url.split("Default.aspx");
            if (pgAdd != "" && ClsAccount.AccountInfo) {
                var postFix = (temp.length > 1) ? temp[1] : '';
               //window.open(pgAdd + postFix, "_parent");
                //به دلیل اینکه SessionId ارسال میشد برداشته شد - و با session برگشت بانک تداخل میخورد
                window.open(pgAdd , "_parent");

            }
            else if (pgAdd != "")
                GoLoginPage(pgAdd)
        });
    })
</script>
