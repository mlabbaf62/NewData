<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>سامانه متمرکز ورود کاربران</title>

    <link rel="stylesheet" href="css/Style1.css" />
    <script type="text/javascript" src="../Token/obj.js"></script>
    <script type="text/javascript" src="../Token/js/loginE.js"></script>
    <script type="text/javascript" src="../Token/js/parskitwebapi.js"></script>

    <script type="text/javascript" src="../js/jquery.min.js"></script>
    <script type="text/javascript" src="../js/busy.js"></script>
    <script type="text/javascript" src="../Token/LoginSec.js?v=1"></script>

    <script src='../js/Camera/Silverlight.js'></script>
    <script src='../js/Camera/cv.min.js'></script>
    <script src='../js/Camera/FaceDetector.min.js'></script>

    <script src='../Token/safaSecurity.min.js'></script>
    <script src='../Token/AppConfig.js'></script>
    <script>
        var slCtl = null;
        function pluginLoaded(sender, args) {
            slCtl = sender.getHost();
        }
    </script>

    <style>
        .cc {
            width: 250px;
        }

        .rr {
            width: 200px;
        }
    </style>

</head>
<body>
    <form id="form1" runat="server" style="height: 100%">
        <asp:HiddenField ID="hfImg" runat="server" ClientIDMode="Static" />
        <asp:ScriptManager ID="ScriptManager1" runat="server">
        </asp:ScriptManager>
        <asp:HiddenField ID="hfToken" runat="server" ClientIDMode="Static" />

        <div class="panel panel-success">
            <div class="panel-heading" style="text-align: center; background-color: #70aaf3; color: white">
                <span>سامانه متمرکز ورود کاربران</span>
            </div>
            <div class="panel-body">

                <asp:UpdateProgress style="position: absolute; height: 100%; width: 100%; background-color: #e6ebde; opacity: 0.9; top: 0; left: 0" AssociatedUpdatePanelID="UpdatePanel1" ID="UpdateProgress1" runat="server">
                    <ProgressTemplate>
                        <div style="text-align: center; top: 30%; vertical-align: middle">
                            <asp:Image ImageUrl="~/Images/ajax-loading.gif" Width="50" runat="server" />
                            <p style="direction: rtl">در حال پردازش..</p>
                        </div>

                    </ProgressTemplate>
                </asp:UpdateProgress>

                <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                    <ContentTemplate>
                        <div style="font-family: Tahoma; vertical-align: central; font-size: 11px" align="center">
                            <table id="LoginDiv" class="table2" style="width: 440px; text-align: center; vertical-align: central; height: 257px;">

                                <tr style="height: 40px; vertical-align: central">
                                    <td style="text-align: center; vertical-align: top" colspan="3">


                                        <img id="imgFace" runat="server" src="../Images/Login.png" style="width: 70px; height: 70px;" />



                                    </td>


                                </tr>
                                <tr>
                                    <td style="text-align: center" colspan="3">
                                        <span id="FaceErrorMessage" style="text-align: center"></span>
                                    </td>
                                </tr>


                                <tr id="trUserName">
                                    <td class="cc">&nbsp;</td>
                                    <td>
                                        <asp:TextBox ID="txtUserName" ClientIDMode="Static" runat="server" Width="250px"></asp:TextBox>
                                    </td>
                                    <td class="rr"><strong>نام کاربری</strong></td>
                                </tr>
                                <tr>
                                    <td class="cc">&nbsp;</td>
                                    <td>
                                        <asp:TextBox TextMode="Password" ClientIDMode="Static" ID="txtPassword" runat="server" Width="250px"></asp:TextBox>
                                    </td>
                                    <td class="rr"><strong>کلمه عبور</strong></td>
                                </tr>
                                <tr>
                                    <td style="text-align: right; vertical-align: bottom">
                                        <img alt="تشخیص چهره" id="btnCamera" src="../Images/webcam.png" style="width: 29px; cursor: pointer" onclick="initCameraNew()" />
                                        <img alt="شناسایی شناسه" src="../Images/SmartCard.png" style="width: 29px; cursor: pointer" onclick="DetectToken()" />
                                    </td>

                                    <td class="cc">
                                        <asp:TextBox Font-Size="Medium" ReadOnly="true" ID="txtToken" runat="server" Width="250px"></asp:TextBox>
                                    </td>
                                    <td class="rr"><strong>شناسه</strong></td>
                                </tr>

                                <tr>
                                    <td class="auto-style1" style="direction: rtl" colspan="3">

                                        <table style="width: 100%; text-align: center">
                                            <tr>
                                                <td style="text-align: center;">
                                                    <%--<asp:Button ID="btnLogin" runat="server" class="LoginIcons" OnClientClick="Login()" Font-Names="tahoma" Style="background-position: -50px -217px !important; border: none; width: 99px; height: 39px;" />--%>
                                                    <input type="button" id="btnLogin" class="LoginIcons" onclick="LoginSSO()" style="background-position: -50px -217px !important; border: none; width: 99px; height: 39px;" />
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>

                                <tr>
                                    <td colspan="3">
                                        <asp:Label ID="LMessage" ClientIDMode="Static" ForeColor="Red" runat="server" Text="" Font-Names="tahoma" />
                                    </td>
                                </tr>

                                <tr style="width: 100%">
                                    <td style="width: 100%" colspan="3">
                                        <div style="text-align: center">
                                            <%--<img id="imgFace" style="width: 150px; height: 120px; display: inline-block; text-align: center;" />--%>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <a onclick="history.back()" style="float: left">بازگشت</a>

                        </div>
                    </ContentTemplate>
                </asp:UpdatePanel>
            </div>

            <%--<div w3-include-html="CameraJS.html"></div>--%>

            <div id="face" style="width: 700px; height: 610px; overflow: hidden; display: none; position: absolute; top: 25px; left: 25%; text-align: center" class="panel panel-success">
                <div class="panel-heading" style="text-align: center">
                    <span style="color: white; text-align: center">تشخیص چهره کاربر</span>
                    <input type="button" onclick="hideCamera()" style="background-image: url('../Images/Close.png'); border: 0; background-repeat: no-repeat; background-size: contain; float: right; width: 17px; background-color: transparent; border-radius: 5px; cursor: pointer" />
                </div>
                <div class="panel-body" style="padding: 10px">

                    <div id="Waiting1" style="display: none; text-align: center; vertical-align: middle; position: absolute; left: 50%; top: 50%; z-index: 10000000">
                        <asp:Image ImageUrl="~/Images/ajax-loading.gif" Width="50" runat="server" />
                        <p style="direction: rtl; color: white; width: 150px">در حال پردازش..</p>
                    </div>
                    <div id="silverlightControl" class="panel-body" style="background-color: transparent!important">
                        <object data="data:application/x-silverlight-2," type="application/x-silverlight-2"
                            width="1010" height="660" style="text-align: center">
                            <param name="source" value="../Form/Silverlight/SafaCamera.xap?ver=1" />
                            <param name="onError" value="onSilverlightError" />
                            <param name="background" value="transparent" />
                            <param name="minRuntimeVersion" value="4.0.50826.0" />
                            <param name="autoUpgrade" value="true" />
                            <param name="Windowless" value="true" />
                            <param name="onLoad" value="pluginLoaded" />
                            <param name="initParams" value="  securityService=http://192.168.100.50/security8.web/service/SecurityWCF.svc,
            URLAuthenticationService=http://192.168.100.50/security8.web/service/Authentication.svc,
            AuthService=http://192.168.100.50/security8.web/service/Authentication.svc
                                ,TryDetectFace=1," />

                            <a href="http://go.microsoft.com/fwlink/?LinkID=149156&v=4.0.50401.0" style="text-decoration: none">
                                <img src="http://go.microsoft.com/fwlink/?LinkId=161376" alt="Get Microsoft Silverlight"
                                    style="border-style: none" />
                            </a>
                        </object>
                    </div>
                </div>
            </div>

        </div>

    </form>

    <object style="visibility: collapse" id="PKEActivexPKI" classid="CLSID:98AFDD58-115E-4D1E-B611-1ECA18982EF3">
    </object>
    <object style="visibility: collapse" id="oCAPICOM" classid="clsid:22A85CE1-F011-4231-B9E4-7E7A0438F71B">
    </object>



</body>
</html>

<script>
    var EnableCamera = false;

    if (EnableCamera == false)
    { $('#btnCamera').hide(); }

</script>
