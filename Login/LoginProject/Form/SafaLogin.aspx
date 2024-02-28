<%@ Page Language="C#" AutoEventWireup="true" CodeFile="SafaLogin.aspx.cs" Inherits="LoginProject.SafaLogin" EnableViewState="true" ViewStateEncryptionMode="Always" %>

<%@ Register Src="~/Form/UCaptcha.ascx" TagPrefix="uc1" TagName="UCaptcha" %>


<!DOCTYPE html>

<html lang="fa" xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script type="text/javascript" src="../Token/Account.js"></script> 
    <link rel="stylesheet" href="css/Style1.css" />

    <script type="text/javascript" src="../Token/obj.js"></script>
    <script type="text/javascript" src="../Token/js/loginE.js"></script>
    <script type="text/javascript" src="../Token/js/parskitwebapi.js"></script>

    <script type="text/javascript" src="../js/busy.js"></script>
    <script type="text/javascript" src="../js/jquery.min.js"></script>
    <script type="text/javascript" src="../Token/AppConfig.js"></script>
    <link rel="stylesheet" href="css/bootstrap.min.css" />
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/Main.js"></script>

    <style>
        .cc {
            width: 250px;
        }

        .rr {
            width: 200px;
        }

        .contentRight * {
            float: right;
        }

        body {
            background-color: #ffffff;
            background-size: auto;
            background-image: url('../Images/backLogin1.jpg');
        }
    </style>
    <style>
        .floatRight {
        }

            .floatRight > div {
                padding-top: 10px;
                font-size: 2vh;
            }

            .floatRight > input {
                font-size: 2vh;
            }

        col-xs-12 {
            padding: 5px;
        }

        body {
            background-color: #ffffff;
            background-position: right top;
            /*background-image: url(../Images/circle-1-4.png);*/
            background-image: url(../Images/backgrong-ugp.png);
            background-repeat: repeat;
            /*background-size: 300px 300px;*/
            background-size: 100% 100%;
            overflow-x: hidden;
        }

        nopadding {
            padding: 0 !important;
        }

        .table3 input[type="text"], .table3 input[type="password"] {
            border: 0;
            box-shadow: initial;
            border-bottom: 1px silver solid;
            text-align: right;
            padding: 25px;
        }

        .LoginIcons {
            background: none;
            background-color: #AF88E7;
            border-radius: 5px;
            color: white;
            font-size: 16px;
        }

        .loginBox {
            box-shadow: 0 0 20px 4px #d8d7d7;
            border: 0;
            border-radius: 5px;
            padding: 40px 20px;
            background-color: #ffffff;
            opacity: 1;
            margin-top: 50px;
        }

        #DivRecovery legend {
            font-size: 1.7vh;
            padding: 1px;
            color: #999ba9;
            text-align: right;
            color: #999ba9;
            text-align: right;
            border: 0;
        }

        #txtRecoveryMobile {
            /*width: 150px;*/
            height: 30px !important;
            font-family: 'BYekan',Tahoma !important;
            direction: ltr;
            border: 0;
            margin-bottom: 10px;
            text-align: center;
            box-shadow: initial;
            border-bottom: 1px silver solid;
            text-align: center;
            padding: 25px;
            padding: 25px;
            font-size: 14px;
            /*color: gainsboro !important;*/
            color: black !important;
        }

        #btnSend {
            /*font-family: Tahoma;
                     height: 30px!important*/
            padding: 8px;
        }


        .footer {
            clear: both;
            position: fixed;
            /* height: 200px; */
            /* margin-top: 25px; */
            bottom: 0;
        }

            .footer img {
                width: 100%;
            }

        .RecveryPassBox {
            display: none;
            background-color: rgb(255, 255, 255);
            padding: 10px;
            margin-bottom: 290px;
        }


        #txtUserName, #txtPassword {
            text-align: left;
        }
    </style>
</head>
<body class="body">
    <form id="form1" runat="server" style="height: 100%" class="container" autocomplete="off">
        <%-- <div class="col-md-12 nopadding" style="text-align: center; height: 7vh; font-size: 4vh; background-color: white; opacity: 0.8; margin-top: 20px; font-family: B Nazanin, sans-serif !important">

            <div class="col-md-4 col-xs-0">
            </div>
            <div class="col-md-4 col-xs-12" style="vertical-align: central">
                <span style="font-size: 3.2vh; max-width: 200px">به سامانه شهروند سپاری خوش آمدید</span>
            </div>
            <div class="col-md-4 col-xs-0">
            </div>

        </div>--%>

        <%--        <div class="col-md-12 nopadding" style="text-align: center; height: 7vh; font-size: 4vh; opacity: 0.8; margin-top: 20px; font-family: B 'B Yekan', sans-serif !important">

           <img src="../Images/MainText.png" class="col-lg-4 col-lg-offset-4 col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-12"/>

        </div>--%>
        <div class="col-md-2 col-xs-12" style="text-align: center; padding-top: 10px">
            <a id="lblBack" runat="server" style="font-size: 2vh; cursor: pointer"></a>
            <%--بازگشت--%>
        </div>

        <div class="col-md-12 col-xs-12 nopadding" style="text-align: center; padding-top: 90px;padding-bottom: 200px!important">

            <div class="col-lg-6 col-lg-offset-3 col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-12 table3 loginBox" id="loginBox">
                <h2 id="lblVersion">ورود به سیستم</h2>

                <div class="col-md-12 col-xs-12 floatRight nopadding" style="vertical-align: central">
                    <div class="col-md-2 col-sm-2 col-xs-0">
                    </div>

                    <div class="col-md-12 col-sm-12 col-xs-12">

                        <%--     <div class="col-md-12" style="text-align: right">
                            <strong>نام کاربری</strong>
                        </div>--%>

                        <div class="col-md-12">
                            <input class="form-control" type="text" id="txtUserName" style="width: 100%" autocomplete="off" placeholder="نام کاربری" />
                            <img src="../images/userLoginIcon.png" style="width: 20px; position: absolute; margin-top: 12px; right: 15px; top: 0" />

                            <asp:HiddenField ID="UNEnc" ClientIDMode="Static" runat="server"></asp:HiddenField>
                        </div>

                    </div>
                    <%--<div class="col-md-2 col-sm-2 col-xs-0">
                    </div>--%>
                </div>

                <div class="col-md-12 col-xs-12 floatRight nopadding">
                    <%--    <div class="col-md-2 col-sm-2 col-xs-0">
                    </div>--%>

                    <div class="col-md-12 col-sm-12 col-xs-12">

                        <%--      <div class="col-md-12" style="text-align: right">
                            <strong>کلمه عبور</strong>
                        </div>--%>

                        <div class="col-md-12">
                            <div class="col-md-12 nopadding" style="padding: 0">
                                <input class="form-control" type="password" autocomplete="off" id="txtPassword" style="width: 100%" placeholder="کلمه عبور" />
                                <img id="imgShowPass" alt="نمایش رمز عبور" src="../images/showpassOff.png" style="width: 20px; cursor: pointer; position: absolute; margin-top: 12px; right: 0; top: 10px" onclick="ToggleShowPass()" />
                                <%--<img src="../images/userPassIcon.png" style="width: 20px; cursor: pointer; position: absolute; margin-top: 12px; right: 0; top: 0" />--%>
                            </div>
                            <asp:HiddenField ID="PEnc" ClientIDMode="Static" runat="server"></asp:HiddenField>
                        </div>
                        <div style="font-size: 12px; padding: 16px; text-align: right;"
                            class="col-md-12">
                            <a style="color: blue" href="#" onclick="ShowRecoveryPassDiv();">[ بازیابی رمز عبور ]</a>
                        </div>
                        <div class="col-lg-10 col-lg-offset-1 col-md-12" style="padding: 20px 0 20px 0">
                            <div style="text-align: center">
                                <input type="button" class="LoginIcons" value="عضویت" onclick="window.open('CreateAccount.html', '_self')" style="background-position: -17px -353px !important; border: none; width: 49%; height: 39px; background-color: #FECF2F;" />

                                <asp:Button ID="btnLogin" ClientIDMode="Static" runat="server" OnClientClick="fncsave" OnClick="btnLogin_Click" Style="display: none; background-position: -50px -217px !important; border: none; width: 99px; height: 39px;" />
                                <input type="button" class="LoginIcons" value="ورود" onclick="fncsave()" style="background-position: -50px -217px !important; border: none; width: 49%; height: 39px;" />
                            </div>


                        </div>

                        <div class="col-md-12">
                            <asp:Label ID="LMessage" ClientIDMode="Static" ForeColor="Red" runat="server" Text="" Font-Names="tahoma" />
                        </div>
                    </div>
                    <div class="col-md-2 col-sm-2 col-xs-0">
                    </div>

                </div>
                <div class="col-md-3 col-sm-3  col-xs-1"></div>
                <div class="col-md-6   col-sm-6  col-xs-10 floatRight" style="text-align: center">
                    <uc1:UCaptcha runat="server" ID="UCaptcha" Visible="false" />
                </div>
                <div class="col-md-3 col-sm-3 col-xs-1 "></div>


            </div>

        </div>

        <div class="col-lg-6 col-lg-offset-3 col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 col-xs-12 loginBox RecveryPassBox">
            <div class="col-md-1 col-sm-1 col-xs-0">
            </div>

            <div class="col-md-10 col-sm-10 col-xs-12 nopadding " style="text-align: center;">

                <%--<div>
                    <a style="color: blue" href="#" onclick="ShowRecoveryPassDiv()">[ بازیابی رمز عبور ]</a>
                </div>--%>
                <fieldset class="col-md-12 col-xs-12 nopadding" id="DivRecovery" runat="server" style="direction: rtl; border-color: #e1e1e1; display: none">
                    <legend style="font-size: 15px; padding: 1px; text-align: center;">شماره تلفن همراه ثبت شده در سامانه را وارد نمایید</legend>
                    <div class="col-md-1 col-sm-1"></div>
                    <div style="padding: 5px; text-align: center; align-content: center" class="col-md-12 col-sm-12 col-xs-12 col-lg-12">
                        <%--<img src="../images/Mobile.png" style="height: 30px; vertical-align: top" />--%>
                        <input runat="server" id="txtRecoveryMobile" type="text" class="col-md-12 col-sm-12 col-xs-12 col-lg-12"
                            placeholder="شماره همراه را وارد کنید" />
                        <input id="btnSend" value="ارسال رمز عبور" type="button" onclick="SendSMS()" class="LoginIcons" class="col-md-12 col-sm-12 col-xs-12 col-lg-12" />
                    </div>
                    <div class="col-md-1 col-sm-1"></div>

                    <div class="col-md-12" style="clear: both">
                        <asp:Label ID="LRecoveryError" ClientIDMode="Static" ForeColor="Red" runat="server" Text="" Style="font-family: 'B Yekan'" />

                    </div>
                </fieldset>

            </div>
            <div class="col-md-1 col-sm-1">
            </div>

        </div>
    </form>
    <div class="col-md-12 footer nopadding">
        <img src="../images/footer.png" />
    </div>
</body>


</html>



<script>
 $(document).ready(function () {
        $(window).keydown(function (event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                return false;
            }
        });

    
    });


    var input = document.getElementById("txtPassword");
    input.addEventListener("keyup", function (event) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            fncsave();
        }
    });

    var input2 = document.getElementById("txtUserName");
    input2.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            input.focus();
        }
    });


    $.ajax({
        type: "Get",
        url: "SafaLogin.aspx/GetKey",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            SessionId = response.d;
            //alert(SessionId +'222')
        },
        failure: function (response) {
         
        }
    });


  <%--  SessionId ='<%=Session.SessionID %>'
    --%>

  <%--  SessionId ='<%=HttpContext.Current.Request.Cookies["ASP.NET_SessionId"].Value%>'
    alert(SessionId)--%>
</script>
