<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UUserInfoAdmin.ascx.cs" Inherits="UGP.UI.UC_Main.UUserInfoAdmin" %>
<style>
    a:hover {
        text-decoration:underline!important;
    }
</style>

<div style="" id="UserPanel">
<asp:Panel runat="server" ID="panel1" Font-Bold="true">
  
 &nbsp;
   <a id="btnLoginAdmin" style="color:#006dbd;font-size:15px;display:none" href="">ورود دفاتر</a>
    
</asp:Panel> 

<table cellspacing="0" cellpadding="0" runat="server" id="tblUserInfo" visible="false" style="margin-top:-5px; float: left;text-align:left; margin-left: 5px;text-wrap:none; direction: ltr;">
    <tr>
        <td style="text-align:left">
            <asp:LinkButton OnClick="Logout_Click" ID="BtnExit" runat="server" ForeColor="Red" Font-Bold="true" Text=" [ خروج دفاتر] " />
            
            <asp:Label runat="server" ID="LblUserAdmin" ClientIDMode="Static" Font-Bold="true" ForeColor="#292929" Font-Names="BNazanin" Text="" />
            <asp:HiddenField runat="server" ID="hfIsAdminLogin" ClientIDMode="Static" Value="false" />

             <asp:HiddenField runat="server" ID="hfNidUser" ClientIDMode="Static"/>

        </td>

        <td style="text-align: left;">
            <%--<img runat="server" style="width: 40px; height: 30px; box-shadow: 0 1px 7px 2px #9aac00;" visible="false" id="imgManMail" title="کاربر من میل" src="~/Images/ManMail.png" />--%>
            &nbsp;<img runat="server" src="~/Images/Login.png" alt="کاربر دفاتر" id="imgLogin" style="width: 25px;" />
        </td>

    </tr>
</table>
</div>

