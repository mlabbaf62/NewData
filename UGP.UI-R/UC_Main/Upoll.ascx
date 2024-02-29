<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Upoll.ascx.cs" Inherits="UGP.UI.UC_Main.Upoll" %>


<script type="text/javascript" src="js/jquery.jqplot.js"></script>

    <link rel="stylesheet" href="Style/jqx.base.css" type="text/css" />
    <script type="text/javascript" src="js/jqwidgets/jqxcore.js"></script>
    <script type="text/javascript" src="js/jqwidgets/jqxprogressbar.js"></script>
<style>
    .jqplot-table-legend {
        font-size: 14px;
        padding: 3px;
        padding-left: 10px;
    }

    .jqplot-data-label, .jqplot-point-label, .jqplot-xaxis-tick, .jqplot-yaxis-tick {
        font-size: 14px;
    }

    .rate_widget {
        /*float:right;*/
        border: 1px solid #CCC;
        overflow: visible;
        /* padding: 10px; */
        position: relative;
        width: 83px;
        height: 22px;
        margin-bottom: 5px;
    }

    .ratings_stars {
        background: url(Images/star_empty.png) no-repeat;
        float: left;
        height: 18px;
        /* padding: 5px; */
        width: 18px;
        margin: 0 1px 0 1px;
        /* border-right: 1px solid black; */
    }

    .ratings_vote {
        background: url('Images/star_full.png') no-repeat;
    }

    .ratings_over {
        background: url('Images/star_highlight.png') no-repeat;
        height: 22px;
    }

    .total_votes {
        background: #eaeaea;
        top: 58px;
        left: 0;
        padding: 5px;
        position: absolute;
    }

    .movie_choice {
        font: 10px verdana, sans-serif;
        /*margin: 0 auto 40px auto;*/
        margin: 0 0 40px 0;
        /*width: 190px;*/
    }

        .movie_choice > a:hover .movie_choice > a {
            text-decoration: underline;
        }
</style>

<style type="text/css">
    a {
        cursor: pointer;
    }
</style>
<!-- Modal -->
<div class="modal fade" id="starsmodal" role="dialog" style="margin-top: 5%;">
    <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <img src="Images/graphics-s.png" style="float: left" />
                <span style="font-size: 14px; padding: 3px" class="modal-title">ثبت امتیاز سامانه</span>
            </div>
            <div class="modal-body col-md-12 col-xs-12">
                <div id="" class="col-md-12 ">
                    <%--<div class="col-md-3"></div>--%>
                    <div class="col-md-10 fltr">
                        <div id="r1" style="" class="   ">
                            <div class="star_4 ratings_stars" onclick="SetStarfn('4')" title="ضعیف"></div>
                            <div class="star_3 ratings_stars" onclick="SetStarfn('3')" title="متوسط"></div>
                            <div class="star_2 ratings_stars" onclick="SetStarfn('2')" title="خوب"></div>
                            <div class="star_1 ratings_stars" onclick="SetStarfn('1')" title="عالی"></div>

                            <%--<div class="total_votes" id="voteBtn" runat="server">vote data</div>--%>
                        </div>
                        <span class=" " style="">لطفاً به میزان رضایت خود از عملکرد سامانه امتیازی انتخاب کنید : </span>

                    </div>
                    <%--<div class="col-md-3"></div>--%>

                    <div class="col-md-12">
                        <center>
            <span id="ratingMsg" class=" blink nopadding "></span>
                </center>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">بستن</button>
            </div>
        </div>

    </div>
</div>
<!-- Modal -->
<div class="modal fade" id="ResultModal" role="dialog" style="margin-top: 5%;">
    <div class="modal-dialog">

        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <img src="Images/graphics-s.png" style="float: left" />
                <span style="font-size: 14px; padding: 3px" class="modal-title">نمایش گزارشات</span>
            </div>
            <div class="modal-body col-md-12 col-xs-12">
                <div id="VisitorLogChart" class="example-chart col-md-12 col-xs-12 nopadding" style="height: 300px; /*width: 500px; */ margin-bottom: 100px"></div>
                <div id="AllPollChart" class="example-chart col-md-12 col-xs-12 nopadding" style="height: 300px; /*width: 500px; */"></div>

        <%--<div style='margin-top: 10px;' id='jqxProgressBar2'></div>--%>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">بستن</button>
            </div>
        </div>

    </div>
</div>


<div class='col-md-12 movie_choice' style="/*width: 100%*//*background-color:#eaeaea;*/ border-radius: 10px; padding: 10px" id="StatisticsDiv">

    <div class="col-md-4"><span></span></div>
    <div class="col-md-4">
        <div class="col-md-10 " style="">
            <a style="padding: 5px" onclick="$('#starsmodal').modal('show');">
                <img src="Images/Quest-s.png" />
                ثبت امتیاز
            </a>
            <a style="padding: 5px" onclick="ShowVisitorLog(); AllPollChart.innerHTML = ''; AllPollChart.style.display = 'none'; VisitorLogChart.innerHTML = ''; VisitorLogChart.style.display = 'none';">
                <img src="Images/bar-s.png" />
                مشاهد آمار بازدید</a>
            <a style="padding: 5px" onclick="GetAllPoll(); AllPollChart.innerHTML = ''; AllPollChart.style.display = 'none'; VisitorLogChart.innerHTML = ''; VisitorLogChart.style.display = 'none';">
                <img src="Images/poll-s.png" />
                مشاهد نتیجه نظر سنجی</a>

        </div>


    </div>
    <div class="col-md-4"><span></span></div>


</div>



<script>
    $('#ratings_stars').fadeToggle();
    //$("#").click(function () {
    //    $("#").slideToggle();
    //});
    var IsPollOk = false;
    if (StatisticsIsShow == true)
        $("#StatisticsDiv").show();//  StatisticsDiv.style.display = 'block';
    else
        $("#StatisticsDiv").hide();//StatisticsDiv.style.display = 'none;'
    //console.log(StatisticsIsShow);
    //
    $('.ratings_stars').hover(

    // Handles the mouseover
    function () {
        if (IsPollOk || (getCookie("IsPollOk")) == 1) { ratingMsg.innerHTML = "نظر شما قبلا ثبت شده"; ratingMsg.style.color = "red"; return; }
        $(this).prevAll().andSelf().addClass('ratings_over');
        $(this).nextAll().removeClass('ratings_vote');
    },
    // Handles the mouseout
    function () {
        if (IsPollOk || (getCookie("IsPollOk")) == 1) { ratingMsg.innerHTML = "نظر شما قبلا ثبت شده"; ratingMsg.style.color = "red"; return; }
        $(this).prevAll().andSelf().removeClass('ratings_over');
        set_votes($(this).parent());
    }
    );

    var starnum = 0;
    function set_votes(widget) {

        var startxt = widget.context.className;
        startxt = startxt.replace(" ratings_stars", "");
        startxt = startxt.replace("star_", "");
        starnum = Number(startxt);

    }
    function SetStarfn(i) {
        if (IsPollOk || (getCookie("IsPollOk")) == 1) return;
        i = Number(i);
        for (j = 4; j >= i; j--) {
            $(".star_" + j).addClass("ratings_over");
        }
        SendPollfn(i);

    }
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var AllPollData = [];
    function GetAllPoll() {
        $('#ResultModal').modal('show');// 
        StartBusy('ResultModal', BusyTextDefualt);

        $.ajax({
            type: "POST",
            url: "Default.aspx/GetAllPoll",
            //data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('ResultModal');
                AllPollData = response.d;
                //console.log(response);
                //console.log(AllPollData);
                //AllPollChart.style.display = 'block';

                //l1 = [['Seoul', 1], ['Paris', 7], ['Singapore', 3], ['Hong  Kong', 5], ['Chicago', 2], ['New York', 9]];
                l1 = [[AllPollData[0].Name, AllPollData[0].Value], [AllPollData[1].Name, AllPollData[1].Value], [AllPollData[2].Name, AllPollData[2].Value], [AllPollData[3].Name, AllPollData[3].Value]];
                //l1 = [["", AllPollData[0].Value], ["", AllPollData[1].Value], ["", AllPollData[2].Value], ["", AllPollData[3].Value], ["", AllPollData[4].Value]];
                AllPollChart.style.display = 'block';
                var plot1 = jQuery.jqplot('AllPollChart', [l1],
                  {
                      seriesDefaults: {
                          // Make this a pie chart.
                          renderer: jQuery.jqplot.PieRenderer,
                          rendererOptions: {
                              // Put data labels on the pie slices.
                              // By default, labels show the percentage of the slice.
                              showDataLabels: true
                          }
                      },
                      legend: { show: true, location: 'e' }
                  }
                );
            },
            error: function (response) {
                StopBusy('ResultModal');
            }
        });
    }
    function SendPollfn(snum) {
        var d = {
            num: snum
        }

        var c = JSON.stringify(d);
        StartBusy('MainBody', 'ثبت امتیاز');
        $.ajax({
            type: "POST",
            url: "Default.aspx/SendPoll",
            data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                StopBusy('MainBody');
                IsPollOk = true;
                setCookie("IsPollOk", 1, 1);
                for (j = 4; j >= snum; j--) {
                    $(".star_" + j).addClass("ratings_over");
                }

                ratingMsg.innerHTML = "ثبت شد";
                ratingMsg.style.color = "green";
            },
            error: function (response) {
                ratingMsg.innerHTML = "خطا در ثبت";
                ratingMsg.style.color = "red";
                StopBusy('MainBody');
            }
        });
    }


    var AllVisitorLog = null;
    var todayVisitorLog = null;
    var LastWeekVisitorLog = null;
    var LastMonthVisitorLog = null;
    //GetLastWeek
    function ShowVisitorLog() {
        $('#ResultModal').modal('show');
        StartBusy('ResultModal', BusyTextDefualt);

        $.ajax({
            type: "POST",
            url: "Default.aspx/GetLogVisitor",
            //data: c,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                //StopBusy('ResultModal');
                AllVisitorLog = response.d[0].Count;
                //console.log("AllVisitorLog " + AllVisitorLog);

                $.ajax({
                    type: "POST",
                    url: "Default.aspx/GeLogVisitortToday",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        todayVisitorLog = response.d[0].Count;
                        //console.log("todayVisitorLog " + todayVisitorLog);
                        $.ajax({
                            type: "POST",
                            url: "Default.aspx/GetLogVisitorMonth",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (response) {
                                LastMonthVisitorLog = response.d[0].Count;
                                //console.log("LastMonthVisitorLog " + LastMonthVisitorLog);
                                $.ajax({
                                    type: "POST",
                                    url: "Default.aspx/GetLogVisitorLastWeek",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    success: function (response) {
                                        StopBusy('ResultModal');
                                        LastWeekVisitorLog = response.d[0].Count;
                                        //console.log("LastWeekVisitorLog " + LastMonthVisitorLog);
                                        ShowLog(AllVisitorLog, LastMonthVisitorLog, LastWeekVisitorLog, todayVisitorLog);
                                    },
                                    error: function (response) {
                                        StopBusy('ResultModal');
                                    }
                                });
                            },
                            error: function (response) {
                                StopBusy('ResultModal');
                            }
                        });
                    },
                    error: function (response) {
                        StopBusy('ResultModal');
                    }
                });
            },
            error: function (response) {
                StopBusy('ResultModal');
            }
        });


    }
</script>
<script>

    function ShowLog(total, month, week, today) {
        //console.log("total " + total);
        //console.log("month " + month);
        //console.log("week " + week);
        //console.log("today " + today);
        //var line1 = [['بازدید کل', total], ['بازید یک ماه ', month], ['بازید یک هفته', week], ['بازید یک روز قبل', today] ];

        $.jqplot.config.enablePlugins = true;
        var s1 = [total, month, week, today];
        var ticks = ['بازدید کل', 'بازید یک ماه', 'بازید یک هفته', 'بازدید امروز'];
        VisitorLogChart.style.display = 'block';
        //$('#ResultModal').modal('show');

        plot1 = $.jqplot('VisitorLogChart', [s1], {
            // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
            animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer,
                pointLabels: { show: true }
            },
            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks
                }
            },
            highlighter: { show: false }
        });

        $('#chart1').bind('jqplotDataClick',
            function (ev, seriesIndex, pointIndex, data) {
                $('#info1').html('series: ' + seriesIndex + ', point: ' + pointIndex + ', data: ' + data);
            }
        );

    }
    $(document).ready(function () {
        //plot6 = $.jqplot('AllPollChart', [[1, 2, 3, 4]], { seriesDefaults: { renderer: $.jqplot.PieRenderer } });
    });
    /////////////////////////////////////////////////////
    // Create jqxProgressBar.
    $(document).ready(function () {
        // Create jqxProgressBar.
        var renderText = function (text, value) {
            if (value < 55) {
                return "<span style='color: #333;'>" + text + "</span>";
            }
            return "<span style='color: #fff;'>" + text + "</span>";
        }
        //$("#jqxProgressBar2").jqxProgressBar({ animationDuration: 0, showText: true, renderText: renderText, template: "primary", width: 250, height: 30, value: 0 });
    });

    var values = {};
    var addInterval = function (id, intervalStep, pvalue) {
        values[id] = { value: 0 };
        values[id].interval = setInterval(function () {
            values[id].value++;
            if (values[id].value == 100 || values[id].value == pvalue) {
                clearInterval(values[id].interval);
            }
            $("#" + id).val(values[id].value);
        }, intervalStep);
    }
    addInterval("jqxProgressBar2", 20, 1);
    /////////////////////////////////////////////////////


</script>


<script type="text/javascript" src="js/plugins/jqplot.barRenderer.min.js"></script>
<script type="text/javascript" src="js/plugins/jqplot.pieRenderer.min.js"></script>
<script type="text/javascript" src="js/plugins/jqplot.categoryAxisRenderer.min.js"></script>
<script type="text/javascript" src="js/plugins/jqplot.pointLabels.min.js"></script>

<telerik:RadAjaxPanel ID="RadAjaxPanel2" runat="server" LoadingPanelID="RadAjaxLoadingPanel1" Font-Names="Tahoma" Font-Size="Small" Width="16px">

    <%--    <fieldset class="Date" style="width: 225px">
        <legend>
            <img src="Style/images/poll.png" width="25px" />

            <span style="vertical-align: top">نظر سنجی</span>
        </legend>

        <asp:Panel ID="p1" class="info" runat="server">
            <table style="font-family: tahoma; font-size: small">
            <tr>
                <td>نظر شما درباره سامانه چگونه می باشد ؟
                </td>
            </tr>
            <tr>
                <td>
                    <asp:RadioButton ID="RadioButton1" Text="عالی" GroupName="Poll" runat="server" />
                </td>
            </tr>
            <tr>
                <td>
                    <asp:RadioButton ID="RadioButton2" Text="خوب" GroupName="Poll" runat="server" />
                </td>
            </tr>
            <tr>
                <td>
                    <asp:RadioButton ID="RadioButton3" Text="متوسط" Checked="true" GroupName="Poll" runat="server" />
                </td>
            </tr>
            <tr>
                <td>
                    <asp:RadioButton ID="RadioButton4" Text="ضعیف" GroupName="Poll" runat="server" />
                </td>
            </tr>

            <tr>
                <td style="direction: ltr">
                    <asp:Button ID="Button1" runat="server" Font-Names="Tahoma" OnClick="RadButton5_Click" Text="ارسال" ValidationGroup="Login" />
                </td>
            </tr>
        </table>
         </asp:Panel>

        <asp:Panel ID="p2" runat="server" Visible="false"> 
                نظر شما با موفقیت ثبت گردید. باتشکر
        </asp:Panel>

    </fieldset>--%>




    <div style="width: 255px; display: none">


        <div class="panel panel-success" style="background-color: #eaeaea">
            <div class="panel-heading2" style="background-color: #ef7047; color: #2b2b2b">
                <table style="width: 100%">
                    <tr>
                        <td>
                            <span style="vertical-align: top">نظر سنجی</span>
                        </td>
                        <td style="text-align: left">

                            <img src="images/menu/vote.png" width="25" />
                        </td>
                    </tr>
                </table>


            </div>
            <div class="panel-body">
                <asp:Panel ID="p1" runat="server">
                    <table style="font-family: tahoma; font-weight: normal; font-size: 12px">
                        <tr>
                            <td colspan="2">نظر شما درباره سامانه چگونه می باشد ؟
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <asp:RadioButton ID="RBWeak4" CssClass="radio" Font-Bold="false" Text="ضعیف" GroupName="Poll" runat="server" />

                            </td>
                            <td>
                                <asp:RadioButton ID="RBGood2" CssClass="radio" Font-Bold="false" Text="خوب" Checked="true" GroupName="Poll" runat="server" />

                            </td>

                        </tr>
                        <tr>
                            <td>
                                <asp:RadioButton ID="RBMiddle3" CssClass="radio" Font-Bold="false" Text="متوسط" GroupName="Poll" runat="server" />
                            </td>

                            <td>
                                <asp:RadioButton ID="RBAli1" CssClass="radio" Font-Bold="false" Text="عالی" GroupName="Poll" runat="server" />
                            </td>
                        </tr>


                        <tr>
                            <td colspan="2" style="direction: ltr">
                                <asp:Button Style="background-image: none!important; background-color: #ef7047" ID="Button1" runat="server" Font-Names="Tahoma" OnClick="SavePoll_Click" Text="ثبت نظر" ValidationGroup="Login" />
                            </td>
                        </tr>
                    </table>
                </asp:Panel>

                <asp:Panel ID="p2" runat="server" Visible="false">
                    نظر شما با موفقیت ثبت گردید. باتشکر

                    <hr />
                    <input type="button" onclick="window.open('UVote.aspx', '_self')" style="background-color: #645151; background-image: none!important; color: white; cursor: pointer" value="نتایج نظرسنجی" />

                    <%--<a href="UVote.aspx" >نمایش نظرات</a>--%>
                </asp:Panel>

            </div>
        </div>





    </div>

</telerik:RadAjaxPanel>

<telerik:RadAjaxLoadingPanel HorizontalAlign="Center" Width="100%" ID="RadAjaxLoadingPanel1" runat="server" Skin="Default" EnableAjaxSkinRendering="False" EnableSkinTransparency="False" EnableEmbeddedSkins="False" EnableEmbeddedScripts="False" EnableEmbeddedBaseStylesheet="False" Enabled="False" EnableTheming="False" EnableViewState="False">

    <asp:Image ID="Image3" Width="100px" Height="100px" ImageAlign="Middle" runat="server" AlternateText="Loading..."
        ImageUrl="~/Images/ajax-loader3.gif" Style="vertical-align: central" />



</telerik:RadAjaxLoadingPanel>
