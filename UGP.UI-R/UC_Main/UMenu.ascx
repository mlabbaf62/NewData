<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="UMenu.ascx.cs" Inherits="UGP.UI.UC_Main.UMenu" %>


<%-- Mob desk menu--%>
<nav class="navbar navbar-default navbar-fixed-top">

    <div class="container">

        <div class="modal fade" id="myModal" role="dialog">
            <div class="modal-dialog">

                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title"></h4>
                    </div>
                    <div class="modal-body">
                        <p></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                </div>

            </div>
        </div>

    </div>
    <div class="">
        <div class="navbar-header" style="padding-right: 10px">
            <center style="/*padding-top: 5px*/">
            <button   type="button" class="navbar-toggle collapsed " data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar" style="margin-top:0;">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar shadow-pulse"></span>
                <span class="icon-bar shadow-pulse"></span>
                <span class="icon-bar shadow-pulse"></span>
            </button>
                <div id="navbarScroll" class="" style="position:absolute;left:10px;bottom:120px;display:none;visibility:hidden"><img width="30" src="Images/arrowdn-s.png" /> </div>
                <div id="NavbarHelp" class="hidden-sm hidden-md hidden-lg" style="    position: absolute;    background-color: gold;    padding: 10px;    border-radius: 5px;    border: 1px solid black;    top: 44px;    right: 0;    text-align: right;display:none">
                    <span>برای استفاده از خدمات عمومی و اختصاصی بروی دکمه چشمک زن بالا سمت راست کلیک کنید</span></div>
            <span class=" hidden" style="padding-top: 2px; font-size: 11px;position: absolute; color:white;    left:50px;">
                <img width="35" src="Images/Armw0.png" style="margin: 0px 5px 0 5px; padding: 2px;" />سامانه خدمات اینترنتی سیستم یکپارچه شهرسازی</span>

            <div style="padding-left: 0px;margin-left: 100px;" class="navbar-brand">
                <img id="imgLogo" class="hidden-xs" src="Images/esup-logo.png")" style="/* width: 65px; */padding: 5px;/* float: left; */position: absolute;left: 0;margin: 6px;top: 9px;">
                <img class="hidden-sm hidden-md hidden-lg" src="Images/esup-logo.png")"  style="/* width: 65px; */padding: 5px;/* float: left; */position: absolute;left: calc( 50% - 45px);margin: 6px;top: 9px;">
            

             <a  class="hidden-xs" runat="server" id="loginIcon" name="loginIcon"  onclick="GoLoginPage()" >ورود </a>
             <a class=" hidden-xs UMenu2_loginIcon"  style="" runat="server"  id="loginIconGov" name="loginIcon"  onclick="GoLoginPageSSO()" >ورود از طریق دولت من </a>
              
                <!--Project name-->
                 <asp:Label style="line-height:200%" runat="server" ID="LblAccount"  CssClass="hidden-xs"/>
                <ul id="logingMenu" style="">
                    <li class="dropdown">

                           <a href="#" class="hidden-sm hidden-md hidden-lg dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">						
                            <img runat="server" id="loginIcon1" name="loginIcon" style="margin-right: 5px; float: left; width: 30px" src="~/Images/user-login-icon-50.png" />
                                                        </a>
                                                 <a runat="server" id="isloginIcon" visible="false"  href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
							
                            <img style="margin-right: 5px; float: left; width: 30px" src="<%=Page.ResolveUrl("~/Images/user-islogin.png")%>"/>
                            <span  class="caret"></span></a>


                        <ul class="dropdown-menu" style="padding:10px">
                            <li  runat="server" class="" style="padding-right:10px">
                       
                                       <asp:Label runat="server" ID="LblAccountInMenu"   Font-Bold="true"  Text="" CssClass="LblUser"   /> 
                               
							
                                 </li>
                            <li runat="server" class="" style="padding-right:1px" id="btnEditAccount" visible="false">
								<a class="LblUser" style="float:right;" onclick="GoEditAccount('<%=Session.SessionID%>')"><asp:Label runat="server" ID="Label2"  Font-Bold="true"  Text="ویرایش اطلاعات کاربر" /></a>
                            </li>
                            <li runat="server" class="" style="padding-right:1px" id="LiChangePass" visible="false">
								<a class="LblUser" style="float:right;" onclick="GoChangePass()"><asp:Label runat="server"   Font-Bold="true"  Text="تغییر کلمه عبور" /></a>
                            </li>

                            <li   role="separator" class="divider"></li>

                            <li ID="UserHeader" runat="server" class="dropdown-header hidden">شهروندان</li>
                            <li ID="BtnLogin" runat="server" Visible="true" >
                                
                                <table class="loginMenuTable">
                                    <tr>
                                        <td style="text-align:center">
                                            <a href="#" onclick="GoLoginPage()"style="font-size:16px;">ورود </a>
                                            <hr />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="text-align:center">
                                            <a href="#" style="font-size:16px;" onclick="GoLoginPageSSO()" id="loginIconGov2">ورود به دولت من </a>

                                        </td>
                                    </tr>
                                </table>
                                
                            </li>
                            <li id="AadminHeader" runat="server" class="dropdown-header hidden-lg hidden-md hidden-sm hidden">دفاتر</li>
                            <li class="hidden-lg hidden-md hidden-sm" ID="BtnLoginAadmin" runat="server" Visible="true" >
                                 <p></p>
                                
                                <table class="loginMenuTable" id ="btnLoginAdminInMenuT" style="display:none">
                                    <tr>
                                    <td><img width="20" class="" src="Images/admin_login-w.png"style=" "></td>
                                    <td><span></span></td>
								
                                    <td><a id="btnLoginAdmin2" style="display:none" href="">ورود دفاتر</a></td><td></td>
                                    </tr>
                                </table>
                                

                            </li>
                            <li  >
                                <p></p>
                                <table class="loginMenuTable" ID="divExit"  Visible="false" runat="server" >
                                    <tr>
                                    <td><img width="20" class="" src="Images/exit0.png" ></td>
                                    <td><span></span></td>
								
                                    <td onclick="StartBusy('MainBody', 'بارگذاری');">
                                        <a  onclick="Logout()"   style="color:#e24242!important;font-size:16px;cursor:pointer" target="_blank" >خروج شهروند</a>
                                        </td><td></td>
                                    </tr>
                                </table>
                                   <table class="loginMenuTable" ID="divExitSSO" Visible="false" runat="server" >
                                    <tr>
                                    <td><img width="20" class="" src="Images/exit0.png" ></td>
                                    <td><span></span></td>
								
                                    <td onclick="StartBusy('MainBody', 'بارگذاری');">
                                        <a  onclick="LogoutSSOGov()" style="color:#e24242!important;font-size:16px;cursor:pointer" target="_blank" >خروج شهروند</a>
                                        </td><td></td>
                                    </tr>
                                </table>

                              
                            </li>
                         <%--Responsive--%>
                              <li class="hidden-lg hidden-md">
                                <p></p>

                                <table class="loginMenuTable" ID="DivExitAadmin" runat="server" Visible="false">
                                <tr>
                                <td><img width="20" class="" src="Images/exit0.png" ></td>
                                <td><span></span></td>
								
                                <td colspan="2">
                                        <asp:LinkButton OnClick="LogoutAadmin_Click" ID="BtnExit" runat="server"  style="color:#ffb7b7!important;font-size:16px;"  Text="خروج دفاتر" />
                                </td>
                                   
                                </tr>
                                </table>
                              
                            </li>

                             <li  runat="server" ID="UserLogin" visible="false" style="display:none">
						
                                <asp:Label runat="server" ID="LblUserAdmin" ClientIDMode="Static" Font-Bold="true" class="" />

                            </li> 
                            <li  runat="server" ID="headerId" visible="false" class="dropdown-header" style="display:none"></li>
                            <li  runat="server" ID="LblUserIdLi" visible="false" style="display:none"> 
                            </li>
                        </ul>
                    </li>
                </ul>
                       </div>
            </center>
        </div>

        <img id="MainArm" src="Config/Images/Armw-b.png" class="hidden-xs" style="height: 60px; padding: 0; position: absolute; right: 15px; margin: 6px; top: 0; position: absolute;">

        <div id="navbar" class="navbar-collapse collapse" aria-expanded="false" style="height: 1px; padding-bottom: 15px;">

            <%--        <ul  id="MainMenu" class="nav navbar-nav navbar-right">
                <li ng-repeat="m in Menu" class="NavbarMenu" ng-class="{'dropdown': m.SubMenu!=null}" style="float: right" id="{{m.ID}}"  ng-hide="m.ShowAfterLogin=='true' && m.IsLogin==false">
                    <a ng-hide="m.SubMenu!=null" href="{{m.Url}}" ng-bind="m.Caption" style="line-height: 100%; white-space: nowrap;" target="{{m.Target}}"></a>

                    <a ng-show="m.SubMenu!=null" class="dropdown-toggle " data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="margin-top: 3px;"><span style="line-height: 100%;" ng-bind="m.Caption"></span><span class="caret"></span></a>
                    <ul ng-show="m.SubMenu!=null" class="dropdown-menu multi-level {{m.Col}}" style="background-color: white">
                        <li ng-repeat="subm in m.SubMenu">
                            <a id="{{subm.ID}}" ng-class="{'disabled': subm.Enable=='false'}" onclick="ShowPage('{{subm.Url}}','{{subm.Target}}',{{subm.ShowAfterLogin}});" ng-bind="subm.Caption"></a>
                        </li>

                  

                    </ul>
                </li>
            </ul>--%>


            <ul class="nav navbar-nav navbar-right" id="MainMenu">

                <li ng-repeat="m in Menu" id="{{m.ID}}" class="NavbarMenu" ng-show="m.IsShow==true && (m.ShowAfterLogin!=true || ( m.ShowAfterLogin==true && m.IsLogin==true))">

                    <%--  <li ng-repeat="m in Menu" id="{{m.ID}}" class="NavbarMenu">--%>

                    <a ng-if="m.SubMenu!=null" ng-hide="m.SubMenu==null" data-toggle="dropdown" ng-class="{'dropdown-toggle': m.SubMenu!=null}" href="{{m.Url}}">{{m.Caption}} <b class="caret" ng-show="m.SubMenu!=null"></b></a>
                    <a ng-if="m.SubMenu==null" ng-hide="m.SubMenu!=null" data-toggle="" ng-class="{'dropdown-toggle': m.SubMenu!=null}" target="{{m.Target}}" href="{{m.Url}}">{{m.Caption}} <b class="caret" ng-show="m.SubMenu!=null"></b></a>

                    <ul class="dropdown-menu multi-level {{m.Col}}" ng-show="m.SubMenu!=null">
                        <li ng-repeat="subm in m.SubMenu" ng-show="subm.IsShow!=false" ng-class="{'dropdown-submenu': subm.SubMenu2.length>0}">

                            <a id="{{subm.ID}}" ng-class="{'disabled': subm.Enable=='false' ,'dropdown-toggle': subm.SubMenu2.length>0}" data-toggle="dropdown"
                                onclick="ShowPage('{{subm.Url}}','{{subm.Target}}',{{subm.ShowAfterLogin}},'{{subm.ID}}');">{{subm.Caption}}
                            </a>

                            <ul class="dropdown-menu {{m.Col}}" ng-show="subm.SubMenu2.length>0">
                                <li ng-repeat="subm2 in subm.SubMenu2">
                                    <a id="{{subm2.ID}}" ng-class="{'disabled': subm2.Enable=='false'}" onclick="ShowPage('{{subm2.Url}}','{{subm2.Target}}',{{subm2.ShowAfterLogin}});" ng-bind="subm2.Caption"></a>
                                </li>
                            </ul>


                        </li>
                    </ul>
                </li>


            </ul>



        </div>
        <%-- <asp:HiddenField ID="hfAccount" runat="server" ClientIDMode="Static" />--%>
        <asp:HiddenField ID="hfShManager" runat="server" ClientIDMode="Static" />
        <asp:HiddenField ID="hfVersion" runat="server" ClientIDMode="Static" />
    </div>


</nav>
<script>
    $(document).ready(function () {
        
        if (typeof (EnableSSO) != 'undefined' && EnableSSO.indexOf('SSO')!=-1) {
            $('#UMenu2_loginIconGov').show();
        }

        if (typeof (SSoLable) !== 'undefined') {
            $('#UMenu2_loginIconGov').text(SSoLable);
            $('#UMenu2_loginIconGov2').text(SSoLable);
        }
    });

 
</script>