using System;
using System.Collections.Generic;
using System.Web.UI;


namespace UGP.UI.UC_Main
{
    public partial class UMenu : System.Web.UI.UserControl
    {
        public string UserID
        {
            get
            {
                if (Session["UserID"] != null)
                    return Session["UserID"].ToString();
                else return "";
            }
            set { Session["UserID"] = value; }
        }


        public string SessionID
        {
            get
            {
                return Session["SessionID"].ToString();
            }
            set { Session["SessionID"] = value; }
        }

        public string NidAccountEnc
        {
            get
            {
                if (Session["NidAccountEnc"] != null)
                    return Session["NidAccountEnc"].ToString();
                else return null;
            }
            set { Session["NidAccountEnc"] = value; }
        }
        

        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                //fake login
                //lnkSpacial0.Visible = true;
                //ClsAccount.Account_Info = new SrvSecurity.Account_Info() { AccountName = "m.labbaf" };
                ////////////////////////////////////////////////////////////////////////////////////////////////////

                if (!Page.IsPostBack)
                {
                    //در دکمه خروج این صفحه فراخوانی میشود
                    if (Request["Page"] == "Logout")
                    {
                        ClsAccount.LogoutAccount(SessionID);
                        LblAccount.Text = "";
                        ClsAccount.Account_Info = null;
                        //Session.Abandon();

                        Session.Remove("AccountSession");

                        var myCookie = Request.Cookies["ASP.NET_SessionId"];
                        if (myCookie != null)
                        {
                            myCookie.Expires = DateTime.Now.AddYears(-1);
                            Response.SetCookie(myCookie);

                            myCookie.Expires = DateTime.Now.AddMinutes(1);
                            Response.Cookies.Add(myCookie);
                        }

                        var myCookie2 = Request.Cookies["ASP.NET_SId"];
                        if (myCookie2 != null)
                        {
                            myCookie2.Expires = DateTime.Now.AddYears(-1);
                            Response.SetCookie(myCookie2);
                            //Response.Cookies.Add(myCookie2);
                            //Response.Cookies.Add(myCookie);
                        }

                        Response.Redirect("~/Default.aspx", false);
                        return;
                    }
                    else if (Request.QueryString["Page"] == "LogoutAuthin")
                    {
                        ClsAccount.LogoutAccount(SessionID);
                        ClsAccount.Account_Info = null;
                        Session.Abandon();

                        var myCookie = Request.Cookies["ASP.NET_SessionId"];
                        if (myCookie != null)
                        {
                            myCookie.Expires = DateTime.Now.AddDays(-1);
                            Response.Cookies.Set(myCookie);
                        }
                        SSO.ClsSSO tmpSSo = new SSO.ClsSSO();
                        tmpSSo.SSOType = SSO.SSOType.Authin;
                        tmpSSo.Logout();

                    }
                    else if (Request.QueryString["Page"] == "LogoutSSOGov")
                    {
                        ClsAccount.LogoutAccount(SessionID);
                        ClsAccount.Account_Info = null;
                        Session.Abandon();

                        SSO.ClsSSO tmpSSo = new SSO.ClsSSO();
                        tmpSSo.SSOType = SSO.SSOType.Gov;
                        tmpSSo.Logout();

                        var myCookie = Request.Cookies["ASP.NET_SessionId"];
                        if (myCookie != null)
                        {
                            myCookie.Expires = DateTime.Now.AddDays(-1);
                            Response.Cookies.Set(myCookie);
                        }
                    }
                    else if (Request.QueryString["Page"] == "LogoutSSOMyCity")
                    {
                        ClsAccount.LogoutAccount(SessionID);
                        ClsAccount.Account_Info = null;
                        Session.Abandon();

                        SSO.ClsSSO tmpSSo = new SSO.ClsSSO();
                        tmpSSo.SSOType = SSO.SSOType.MyCity;
                        tmpSSo.Logout();

                        var myCookie = Request.Cookies["ASP.NET_SessionId"];
                        if (myCookie != null)
                        {
                            myCookie.Expires = DateTime.Now.AddDays(-1);
                            Response.Cookies.Set(myCookie);
                        }
                    }
                    #region !IsPostBack
                    //دفاتر//شیخی
                    if (Request.QueryString["UserID"] != null)
                    {
                        UserID = Request.QueryString["UserID"].ToString();
                    }

                    if (Request.QueryString["FullName"] != null)
                    {
                        if (ClsAccount.Account_Info == null)
                        {
                            UserHeader.Visible = true;
                            BtnLogin.Visible = true;

                            divExit.Visible = false;
                            divExitSSO.Visible = false;
                        }
                        else
                        {
                            UserHeader.Visible = false;
                            BtnLogin.Visible = false;

                            divExit.Visible = true;
                        }
                        AadminHeader.Visible = false;
                        BtnLoginAadmin.Visible = false;
                        LblUserAdmin.Visible = false;
                        LblAccountInMenu.Visible = true;
                        //  DivExitAadmin.Visible = true;
                        ClsAccount.AdminFullName = Request.QueryString["FullName"].ToString();
                        ClsAccount.UserInfo = new SrvSecurity.User() { GUID = Guid.Parse(UserID) };
                    }

                    if (Request.QueryString["LoginMode"] == "ManMail")
                    {
                        LoginToSecurity();
                    }
                    UGPbiz.ClsLog.AddLog("Menu PageLoad");

                    UGPbiz.ClsLog.AddLog("LoginMode=" + Request.QueryString["LoginMode"]);

                    if (Request.QueryString["LoginMode"] == "SSO")
                    {
                        LoginToSecuritySSO();

                        ErrorLog2.WriteLog(UGPbiz.ClsLog.Log, "LoginSecurityAccount");

                    }

                    #endregion

                    CheckUser();
                }
                if (ClsAccount.Account_Info != null)
                {
                    
                    if (ClsAccount.Account_Info.NidAccount != Guid.Empty)
                    {
                        BtnLogin.Visible = false;
                        UserHeader.Visible = false;
                        LblUserAdmin.Visible = true;
                        LblAccountInMenu.Visible = true;

                        FillHfNidAccount();
                    }
                }
                else
                {
                    BtnLogin.Visible = true;
                }
                CheckVersion();

                if (ClsAccount.Account_Info != null)
                {
                    try
                    {
                        var tmpSrv = UGPbiz.ClsProxyHelper.GetCrowdsourcingService();
                        var tmpNidProc = (Guid)ClsSession.GetSession<Guid>("Request_NidProc");
                        var tmpDistrict = (string)ClsSession.GetSession<string>("Request_District");

                        ManagerConfirmList = tmpSrv.CheckIsDoneManagerConfirm(tmpNidProc, tmpDistrict).Sh_ManagerConfirm_List;
                        var json = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(ManagerConfirmList);
                        hfShManager.Value = json;
                    }
                    catch { }

                }
            }
            catch (Exception ex)
            {
                UGPbiz.ClsLog.AddLog("PageLoad ex" + ex.Message);
                ErrorLog2.WriteLog(ex);
            }


        }

        private void CheckVersion()
        {
            System.Reflection.Assembly thisAssembly = this.GetType().Assembly;
            string ver = thisAssembly.FullName.Split(',')[1].Split('=')[1].ToString();
            hfVersion.Value = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version.ToString();
        }
       
  
       

        private void FillHfNidAccount()
        {
            // ClsViewState tmpCls = new ClsViewState(Page);
            // tmpCls.AddViewState<SrvSecurity.Account_Info>("hfAccount", ClsAccount.Account_Info);

            var tmpNidAccountEnc = SafaCrypto.ClsPassword.Encrypt(ClsAccount.Account_Info.NidAccount.ToString(), Common.ClsCommon.RequestId);
            ClsAccount.Account_Info.NidAccountEnc = SafaCrypto.ClsPassword.UrlSimboleToChar(tmpNidAccountEnc);

            //   var tmpNidAccountEnc = SafaCrypto.ClsPassword.Encrypt(ClsAccount.Account_Info.NidAccount.ToString(), Common.ClsCommon.RequestId);
            //   ClsAccount.Account_Info.NidAccountEnc = SafaCrypto.ClsPassword.UrlSimboleToChar(tmpNidAccountEnc);
            //  ClsAccount.Account_Info.FullName = ClsAccount.AccountFullName;

            //  var json = new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(ClsAccount.Account_Info);
            // hfAccount.Value = json;

            // ViewState["Account"]=json;

            // Page.ClientScript.RegisterHiddenField("vCode", ViewState["Account"].ToString());


        }
        protected void Logout_Click(object sender, EventArgs e)
        {
            try
            {
                ClsAccount.Account_Info = null;
                Response.Redirect("http://login.mashhad.ir/logout.aspx", false);
                Response.Redirect("~/Default.aspx");
            }
            catch { }
        }
        protected void LogoutAadmin_Click(object sender, EventArgs e)
        {

            //////////دفاتر
            try
            {
              
                ClsAccount.UserInfo = null;
                Response.Redirect("~/Default.aspx");
            }
            catch
            {
                Response.Redirect("~/Default.aspx");
            }
        }

    }
}