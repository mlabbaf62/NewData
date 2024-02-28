<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Logout.aspx.cs" Inherits="UGP.UI.Logout" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <iframe src="http://login.mashhad.ir/logout.aspx" onload="LoadEnded()" onloadeddata="LoadEnded()"></iframe>
        </div>
        <script>
            function LoadEnded()
            {
                window.close();
            }
        </script>
    </form>
</body>
</html>
