<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UHelp.ascx.cs" Inherits="UGP.UI.UC_Main.UHelp" %>

<h3>راهنمای سایت</h3>
<div class="panel panel-success" id="GridView">
   
    <div id="divHelp" style="text-align: center; padding: 10px">
            <img src="Images/Help/InfoGraphy.jpg" style="width:100%;height:100%" />
    </div>
</div>
<script>
    var st = 0;
    var h = $("#divHelp").height();
    $("#btnHelp").click(function () {
        if (st == 0) {
            $("#divHelp").animate({ height: "10px" }, function () {
                $("#divHelp").hide();
            });
            st = 1;
        }
        else {
            $("#divHelp").animate({ height: h + 'px' });
            $("#divHelp").show();
            st = 0;
        }
    });
</script>