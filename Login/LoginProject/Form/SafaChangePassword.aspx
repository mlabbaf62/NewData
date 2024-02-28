<%@ Page Language="C#" AutoEventWireup="true" CodeFile="SafaChangePassword.aspx.cs" Inherits="LoginProject.Form_SafaChangePassword" %>


<%@ Register Src="~/Form/UCaptcha.ascx" TagPrefix="uc1" TagName="UCaptcha" %>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>

    <script type="text/javascript" src="../Token/Account.js"></script>
        <script src="js/angular.min.js"></script>

    <script type="text/javascript" src="../Token/obj.js"></script>
    <script type="text/javascript" src="../Token/js/loginE.js"></script>
    <script type="text/javascript" src="../Token/js/parskitwebapi.js"></script>


    <script type="text/javascript" src="../js/busy.js"></script>
    <script type="text/javascript" src="../js/jquery.min.js"></script>
    <script type="text/javascript" src="../Token/AppConfig.js"></script>
    <script type="text/javascript" src="js/PassWordCheck.js"></script>
    <script type="text/javascript" src="../Config/Config.js?v=1"></script>

    <style>
        .cc {
            width: 250px;
        }

        .rr {
            width: 200px;
        }

        body {
            background-image: url("../images/background.png");
            background-size: cover;
        }

        #imgShowPass {
    width: 20px; /* Or however long you'd like your button to be, matches padding-right above */
    background-repeat: no-repeat;
    background-position: 50% 50%;
    border: none;
    background-color: transparent;
    position: absolute;
    cursor: pointer;
    margin-left:-20px;
    margin-top:5px;
}
    </style>

</head>
<body class="body">
    <form id="form1" runat="server" style="height: 100%">

        <div style="width: 100%; height: 35px; text-align: center; font-size: 25px; background-color: white; opacity: 0.8; padding: 5px; margin-top: 20px; font-family: B Nazanin, sans-serif !important">
            تغییر کلمه عبور</div>
        <br />
        <div>
            <a runat="server" id="btnBack" style="float: left; font-family: Tahoma; font-size: 9px; cursor: pointer">بازگشت</a>

            <div style="font-family: Tahoma; vertical-align: central; font-size: 11px" align="center">
                <table class="table3" runat="server" id="MainTable" style="width: 550px; text-align: center; vertical-align: central; height: 230px;">

                    <tr style="height: 40px; vertical-align: central">
                        <td style="text-align: center; vertical-align: top">&nbsp;</td>

                        <td style="text-align: center; vertical-align: top">
                            <img src="../Images/changePass.png" style="height: 70px;" />
                        </td>
                    </tr>

                    <tr style="height:30px; border-bottom:1px solid silver">
                        <td class="cc">&nbsp;</td>
                        <td>
                            <%--<input type="text" runat="server" id="txtUserName" style="width: 250px" />--%>
                            <asp:Label ID="txtUserName" Font-Bold="true" Font-Size="14" AutoCompleteType="None" runat="server" Width="250px"></asp:Label>


                        </td>
                        <td class="rr"><strong>نام کاربری</strong></td>
                    </tr>
                     <tr style="height:30px; border-bottom:1px solid silver">
                        <td colspan="3">
                            <hr />
                        </td>
                        
                    </tr>

                    <tr>
                        <td class="cc">&nbsp;</td>
                        <td>
                            <div style="width:100%">
                                  <input  type="password" id="txtPassword" style="width: 250px"  autocomplete="off"/>
                             <img id="imgShowPass" alt="نمایش رمز عبور" style="" src="../images/showpassOff.png" onclick="ToggleShowPass('txtOldPassword')" title="نمایش رمز عبور" />
                          
                            </div>
                            <%--<asp:TextBox TextMode="Password" ID="txtOldPassword" runat="server" Width="250px"></asp:TextBox>--%>
                            <asp:HiddenField ClientIDMode="Static" ID="txtOldPasswordEnc" runat="server"></asp:HiddenField>

                        </td>
                        <td class="rr"><strong>کلمه عبور قبلی</strong></td>
                    </tr>
                    <tr>
                        <td class="cc">&nbsp;</td>
                        <td>
                            <input type="password" id="txtPasswordNew" style="width: 250px" />
                            <%--<asp:TextBox TextMode="Password" ID="txtPassword" runat="server" Width="250px"></asp:TextBox>--%>
                            <asp:HiddenField ClientIDMode="Static" ID="PEnc" runat="server"></asp:HiddenField>

                        </td>
                        <td class="rr"><strong>کلمه عبور جدید</strong></td>
                    </tr>
                    <tr>
                        <td class="cc">&nbsp;</td>
                        <td>
                            <input type="password" id="txtConfirmPassword" style="width: 250px" />
                            <%--<asp:TextBox TextMode="Password" ID="txtReNewPassword" runat="server" Width="250px"></asp:TextBox>--%>
                            <asp:HiddenField ClientIDMode="Static" ID="txtReNewPasswordEnc" runat="server"></asp:HiddenField>
                        </td>
                        <td class="rr"><strong>تکرار کلمه عبور جدید</strong></td>
                    </tr>

                    <tr>

                        <td class="cc">&nbsp;</td>
                        <td>
                            <%--<div ng-include="'Form/UCaptcha.html'"></div>--%>
                            <uc1:UCaptcha runat="server" ID="UCaptcha" />
                        </td>
                        <td class="rr"></td>

                    </tr>

                    <tr>

                        <td colspan="3" class="auto-style1" style="direction: rtl">

                            <table style="width: 100%; text-align: center">
                                <tr>
                                    <td style="text-align: center; width: 100%">
                                        <asp:Button runat="server" ID="btnSave" Style="display: none" OnClick="btnSave_Click" />
                                        <input type="button" onclick="fncChangePassword()" style="width: 99px; height: 39px; font-family: Tahoma" value="ذخیره رمز عبور" />
                                    </td>

                                </tr>
                            </table>

                        </td>
                    </tr>

                    <tr>
                        <td colspan="3">
                            <asp:Label Font-Size="Medium" ID="LMessage" ClientIDMode="Static" ForeColor="Red" runat="server" Text="" Font-Names="tahoma" />
                        </td>
                    </tr>

                    <tr>
                        <td colspan="3">&nbsp;</td>
                    </tr>
                </table>
            </div>
        </div>

    </form>
</body>
</html>

