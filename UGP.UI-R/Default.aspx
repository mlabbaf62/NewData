 <%@ Page  Language="C#"     Async="true" AutoEventWireup="true" CodeBehind="~/Default.aspx.cs" Inherits="UGP.UI.Default" MasterPageFile="~/UGPMaster.Master" %>

<%@ Register Src="~/UC_Main/USlider.ascx" TagPrefix="uc1" TagName="USlider" %>
<%@ Register Src="~/UC_Main/UMainText.ascx" TagPrefix="uc1" TagName="UMainText" %>
<%--<%@ Register Src="~/UC_Main/Upoll.ascx" TagPrefix="uc1" TagName="Upoll" %>--%>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
  
    <div style="/*height:100%; background-color:#ead0ad*/">
      <uc1:USlider runat="server" ID="USlider" />
        <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';"/>

    <meta http-equiv="content-type" content="text/html; charset=utf-8" />

    <uc1:UMainText runat="server" id="UMainText" />
    
    <%--<p class="col-xs-12 col-md-12 col-sm-12" align="center" style="font-size: 11px;font-family:W_nazanin; background-color: #C1CC73" backcolor="#FCC674">
        جهت استفاده از سایت از مرورگرهای IE10 به بالا ،Chrome،Firefox استفاده نمائید
    </p>--%>
<%--    <uc1:Upoll runat="server" ID="Upoll" />--%>
 </div>

    <script>
        try {
            // Opera 8.0+
            var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

            // Firefox 1.0+
            var isFirefox = typeof InstallTrigger !== 'undefined';

            // Safari 3.0+ "[object HTMLElementConstructor]" 
            var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) {
                return p.toString() === "[object SafariRemoteNotification]";
            })(!window['safari'] || safari.pushNotification);

            // Internet Explorer 6-11
            var isIE = /*@cc_on!@*/ false || !!document.documentMode;

            // Edge 20+
            var isEdge = !isIE && !!window.StyleMedia;

            // Chrome 1+
            var isChrome = !!window.chrome && !!window.chrome.webstore;

            // Blink engine detection
            var isBlink = (isChrome || isOpera) && !!window.CSS;

            $('#page').hide();
            if (isIE || isEdge) {
                alert('کاربر گرامی ، لطفا از مرورگر Chrome استفاده نمایید');
            }
            else
                $('#page').show();
        }
        catch(ex) { }
    </script>


 
    
</asp:Content>


