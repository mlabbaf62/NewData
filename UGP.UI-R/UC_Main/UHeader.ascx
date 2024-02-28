<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UHeader.ascx.cs" Inherits="UGP.UI.UC_Main.UHeader" %>


<%@ Register src="UUserInfoAdmin.ascx" tagname="UUserInfoAdmin" tagprefix="uc1" %>


<style>
    .r1 {
        height: 25px;
    }

    .t1 {
        /*width: 100px;*/
    }

    .t2 {
        margin: 2px 0;
        padding-right: 5px;
        text-align: center;
    }

    .t3 {
        /*width: 100px;*/
    }
</style>

<div class="col-md-12 headerDiv hidden-xs col-xs-12 nopadding" style="height:43px; z-index:999999; position:fixed">
    <div class="row"  style="height:43px; border-bottom: 1px solid white;background: url(Images/background.png) repeat-x right top;background-repeat: no-repeat;background-size: 100%;/*background-color:#727272*/">
        <center>

        <%-- برای موبایل --%>
		<div class="col-md-10 col-sm-10   col-xs-10 hidden-md hidden-sm hidden-lg" >
            <div class="  col-md-3   col-xs-2"></div>
            <span class="  " style="color: white;font-size:20px ">سامانه خدمات اینترنتی سیستم یکپارچه شهرسازی</span>
            
            <%--<img class="col-md-8 col-sm-8 col-lg-8 col-xs-10" id="imgtxtHeader" style="" src="Images/mashhad.png">--%>
           <div class="  col-md-3   col-xs-1"></div>

        </div>
            <div class="hidden-md hidden-sm hidden-lg col-xs-2" style="float: right;">
            <%--<img style="" src="Images/Armw-m.png"id="imgImgHeaderArmMob">--%>
        </div>

		
		<%-- دسکتاپ --%>
		<div class="col-md-11    col-xs-11 hidden-xs"  >
            <%--<div class="  col-md-3  col-xs-1"></div>--%>
            
            <%--<img class="col-md-8 col-sm-8 col-lg-8 col-xs-10 lg-img-header" style="width: 100%; padding-top: 2%; max-width: 414px;" src="Images/mashhad.png">--%>
           <div class="  col-md-3   col-xs-1"></div>
            <span class=" col-md-7  " style="/*color: white;*/font-size:20px   "> <img style="width: 45px;padding:5px" src="Images/Arm.png"> سامانه خدمات اینترنتی سیستم یکپارچه شهرسازی </span>

        </div>
      
		<div class="col-md-1 col-xs-1   hidden-xs " style="padding-right: 0;    text-align: right;">
            <img src="Images/iranglag4r.png" width="60" />

            <%--<img style="width: 40px;padding:5px" src="Images/Armw-m.png">--%>
        </div>
            <uc1:UUserInfoAdmin ID="UUserInfoAdmin1" runat="server" />
    </center>

    </div>



</div>
