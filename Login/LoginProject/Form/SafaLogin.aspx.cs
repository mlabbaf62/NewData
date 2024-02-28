using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace LoginProject
{
    public partial class SafaLogin : System.Web.UI.Page
    {

        protected void Page_Load(object sender, EventArgs e)
        {
            string url = HttpContext.Current.Request.Url.AbsoluteUri;
            EnableCaptcha = ClsCommon.GetAppConfig<bool>("EnableCaptcha");

            if (!Page.IsPostBack)
            {
                if (Request.UrlReferrer != null && !Request.UrlReferrer.AbsoluteUri.Contains("CreateAccount"))
                {
                    Session["UrlReferer"] = Request.UrlReferrer;
                }
                UCaptcha.Visible = EnableCaptcha;

                //if (Session["UrlReferer"] != null)
                //    lblBack.HRef = Session["UrlReferer"].ToString();
            }

            if (url.ToLower().Contains("domain"))
            {
                Domain = Request["Domain"].ToString();
            }
            if (Request["EditAccount"] != null)
            {
                //Response.Redirect("CreateAccount.aspx?" + Request.QueryString + "&r=" + Session.SessionID);
                Response.Redirect("CreateAccount.aspx?" + Request.QueryString );
            }
            if (Request["ChangePassword"] != null)
            {
                Response.Redirect("SafaChangePassword.aspx?" + Request.QueryString);
            }
            if (Request["ResetPassword"] != null)
            {
                Response.Redirect("SafaResetPassword.aspx?" + Request.QueryString);
            }
        }

        public string Domain
        {
            get
            {
                if (Session["Domain"] != null) return Session["Domain"].ToString(); else return "UGP";
            }
            set { Session["Domain"] = value; }
        }
        public bool EnableCaptcha
        {
            get
            {
                if (Session["EnableCaptcha"] != null) return bool.Parse(Session["EnableCaptcha"].ToString()); else return false;
            }
            set { Session["EnableCaptcha"] = value; }
        }
        protected void btnLogin_Click(object sender, EventArgs e)
        {
            ClsLog.Clear();
            try
            {
                if (string.IsNullOrEmpty(ClsCommon.RequestId))
                {
                    LMessage.Text = "مدت زمان لاگین به پایان رسیده است . به سایت اصلی بازگردید و دوباره لاگین نمایید";
                    LMessage.ForeColor = System.Drawing.Color.Red;
                    return;
                }
                var tmpUserName = Base64Decode(UNEnc.Value);
                var tmpPassword = Base64Decode(PEnc.Value);

                var key = HttpContext.Current.Request.Cookies["ASP.NET_SessionId"].Value;
               
                tmpUserName = tmpUserName.Replace(key, "");
                tmpPassword = tmpPassword.Replace(key, "");

                tmpUserName = Base64Decode(tmpUserName);
                tmpPassword = Base64Decode(tmpPassword);

                ClsLog.AddLog(new { tmpUserName });
                ClsLog.AddLog(new { tmpPassword });

                if (tmpUserName != "" && tmpPassword != "")
                {
                    var tmpSession = Request["S"];
                    var tmpApplicationName = Request["ApplicationName"];
                    var LoginMode = Request["LoginMode"];
                    ClsLog.AddLog(new { LoginMode });
                    if (LoginMode == "SSOIsfahan")
                    {
                        ClsSSO_Isfahan tmpSSO = new ClsSSO_Isfahan();
                        tmpSSO.Username = tmpUserName;
                        tmpSSO.Password = tmpPassword;
                        var tmpRes = tmpSSO.Login();
                        ClsLog.AddLog(new { tmpRes });
                        if (tmpRes == true)
                        {
                            ClsLog.AddLog("Login SSo True");

                            #region MyRegion
                            tmpSession = Guid.NewGuid().ToString();// tmpSSO.Token;
                            var SrvSec = ClsCommon.getServiceSecurity();
                            HttpRequestMessageProperty httpRequestProperty = new HttpRequestMessageProperty();
                            httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie, "TrustToken=SecurityTrust1400");
                            using (OperationContextScope scope = new OperationContextScope(SrvSec.InnerChannel))
                            {
                                OperationContext.Current.OutgoingMessageProperties[HttpRequestMessageProperty.Name] = httpRequestProperty;
                                //var tmpUserAccount = SrvSec.GetAllAccount(0, 1, new SrvSecurity.Account_InfoModel() { AccountName = tmpUserName });
                                var tmpAccountInfo = SrvSec.GetAccountByName( tmpUserName).Account_Info;

                                ClsLog.GetStrLogFromClass(tmpAccountInfo);
                                if (tmpAccountInfo == null)
                                {
                                    LMessage.Text = "چنین کاربری در سیستم وجود ندارد";
                                    LMessage.ForeColor = System.Drawing.Color.Red;
                                }
                                else
                                {
                                    SrvSec.AddAccountLog(new SrvSecurity.AccountLog()
                                    {
                                        NidAccount = tmpAccountInfo.NidAccount,
                                        AccountName = tmpAccountInfo.AccountName,
                                        LoginDate = ClsCommon.CurrentShamsiDateString,
                                        LoginTime = ClsCommon.CurrentTimeString,
                                        ApplicationName = "UGP",
                                        SessionID = tmpSession
                                    });
                                    LMessage.Text = "با موفقیت وارد سیستم شدید";
                                    LMessage.ForeColor = System.Drawing.Color.Green;
                                    
                                    ClsSession.AddSession("AccountSession", tmpSession);
                                    GotoAddress(tmpSession);
                                }
                            }
                            SrvSec.Close();
                            #endregion

                        }
                        else
                        {
                            LMessage.Text = "نام کاربری یا رمز عبور اشتباه است";
                            LMessage.ForeColor = System.Drawing.Color.Red;
                        }
                    }
                    else
                    {
                        ClsLog.AddLog("getServiceSecurity");
                        var SrvSec = ClsCommon.getServiceSecurity();
                        ClsLog.AddLog(new { SrvSec.Endpoint.Address.Uri.AbsoluteUri });
                        ClsLog.AddLog("Pre LoginAccount");
                        var tmpUserAccount = SrvSec.LoginAccount(tmpUserName, tmpPassword, tmpSession, "UGP");
                        if (tmpUserAccount.ErrorResult.BizErrors.Count > 0)
                        {
                            ClsLog.AddLog(new { tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel });
                            LMessage.Text = tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel;
                            LMessage.ForeColor = System.Drawing.Color.Red;
                            UCaptcha.Visible = EnableCaptcha;
                        }
                        else
                        {
                            ClsLog.AddLog("True");
                            ClsSession.AddSession("AccountSession", tmpUserAccount.Account_Info.SessionId,600);
                            CreateCoockiSID();
                            LMessage.Text = "با موفقیت وارد سیستم شدید";
                            LMessage.ForeColor = System.Drawing.Color.Green;
                            GotoAddress(tmpUserAccount.Account_Info.SessionId);
                        }
                        SrvSec.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                ClsLog.AddLog("btnLogin_Click ex:" + ex.Message);
                LMessage.Text = "خطا در سرویس . لطفا به راهبر سیستم اطلاع دهید";
                LMessage.ToolTip = ex.Message;
                LMessage.ForeColor = System.Drawing.Color.Red;
            }
            finally
            {
                ErrorLog.WriteLog(ClsLog.Log, "BtnLogin_Click");
            }
        }
        private void CreateCoockiSID()
        {
      
            try
            {
                double tmpTimeOut = 60;
                if (System.Web.Configuration.WebConfigurationManager.GetSection("system.web/sessionState") != null)
                {
                    var sessionSection = (System.Web.Configuration.SessionStateSection)System.Web.Configuration.WebConfigurationManager.GetSection("system.web/sessionState");
                    tmpTimeOut = sessionSection.Timeout.TotalMinutes;
                }
               
                ClsLog.AddLog(new { tmpTimeOut });
                var mCookieSID = new HttpCookie("ASP.NET_SId");
                mCookieSID.Expires = DateTime.Now.AddMinutes(tmpTimeOut);
                mCookieSID.SameSite = SameSiteMode.Strict;
                mCookieSID.HttpOnly = true;


                var myCookie = System.Web.HttpContext.Current.Request.Cookies["ASP.NET_SessionId"];
                var tmpB = System.Web.HttpContext.Current.Request.Browser.Browser;
                var tmpC = System.Web.HttpContext.Current.Request.ServerVariables["Remote_Addr"];
                var tmpD = System.Web.HttpContext.Current.Request.ServerVariables["HTTPS_SERVER_ISSUER"];

                string NewSession = string.Format("{0}#{1}#{2}#{3}", myCookie.Value, tmpB, tmpC, tmpD);
               // string NewSession = string.Format("{0}#{1}#{2}", myCookie.Value, Request.Browser.Browser, Request.ServerVariables["Remote_Addr"]);
                var Enc = RSAClient.Encrypt(NewSession, ClsCommon.NewRequestId, ClsCommon.NewRequestId);
                mCookieSID.Value = Enc;
                Response.SetCookie(mCookieSID);

                var myCookieNET_SessionId = new HttpCookie("ASP.NET_SessionId");
                myCookieNET_SessionId.Expires = DateTime.Now.AddMinutes(tmpTimeOut);
                myCookieNET_SessionId.SameSite = SameSiteMode.Strict;
                myCookieNET_SessionId.HttpOnly = true;
                myCookieNET_SessionId.Value = HttpContext.Current.Session.SessionID;
                Response.SetCookie(myCookieNET_SessionId);
                Session.Timeout =int.Parse(tmpTimeOut.ToString());
            }
            catch (Exception ex)
            {
                ClsLog.AddLog("CreateCoockiSID Ex:" + ex.Message);
            }

        }
        private void GotoAddress(string pSessionID)
        {
            var tmpUrlDeffered = ClsCommon.GetDeferedUrl(Domain);

            if (string.IsNullOrEmpty(tmpUrlDeffered))
            {
                LMessage.Text = "آدرس دامنه مورد نظر یافت نشد";
            }
            else
            {
                var tmpAddress = CreateReturnUrl(tmpUrlDeffered, pSessionID, true);
                Response.Redirect(tmpAddress);
            }
        }
        public static string CreateReturnUrl(string tmpUrlDeffered, string SessionId, bool Encrypted = false)
        {
            var tmpSimbol = "?";
            if (tmpUrlDeffered.Contains("?"))
                tmpSimbol = "&";

            if (Encrypted)
            {
                if (ClsCommon.GetAppConfig<bool>("NoEncryptSessionID") == false)
                {
                    ClsLog.AddLog(new { SessionId });
                    SessionId = SafaCrypto.ClsPassword.Encrypt(SessionId, ClsCommon.RequestId);
                    SessionId = SafaCrypto.ClsPassword.UrlSimboleToChar(SessionId);

                    ClsLog.AddLog(new { ClsCommon.RequestId });
                    ClsLog.AddLog(new { SessionId });
                }
            }
            string returnPagStr = "";
            if (HttpContext.Current.Request["ReturnPage"] != null)
            {
                returnPagStr = "&ReturnPage=" + HttpContext.Current.Request["ReturnPage"];
            }
            var tmpAddress = string.Format("{0}{1}S={2}&LoginMode=ManMail" + returnPagStr, tmpUrlDeffered, tmpSimbol, SessionId);
            ClsLog.AddLog(new { tmpAddress });

            return tmpAddress;
        }

        protected void btnSendPass_Click(object sender, EventArgs e)
        {
            DivRecovery.Visible = true;
            var srvSec = ClsCommon.getServiceSecurity();
            var tmpres = srvSec.RecoveryAccountPassword(txtRecoveryMobile.Value);
            if (tmpres.BizErrors.Count > 0)
            {
                LRecoveryError.Text = tmpres.BizErrors[0].ErrorTitel;
            }
            else
            {
                LRecoveryError.Text = "رمز عبور با موفقیت ارسال شد";
                LRecoveryError.ForeColor = System.Drawing.Color.Green;
            }
        }

        public string encoding(string toEncode)
        {
            byte[] bytes = System.Text.Encoding.GetEncoding(28591).GetBytes(toEncode);
            string toReturn = System.Convert.ToBase64String(bytes);
            return toReturn;
        }
        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }


        [WebMethod]
        [System.Web.Script.Services.ScriptMethod(UseHttpGet = true)]
        public static string GetKey()
        {
            return HttpContext.Current.Request.Cookies["ASP.NET_SessionId"].Value;
            //return HttpContext.Current.Session.SessionID;
        }

        [WebMethod]
       
        public static SrvSecurity.ClsErrorResult RecoveryAccountPassword(string pMobileNo)
        {
            try
            {
                var SrvSec = ClsCommon.getServiceSecurity();
                ClsLog.AddLog(new { SrvSec.Endpoint.Address.Uri.AbsoluteUri });

                HttpRequestMessageProperty httpRequestProperty = new HttpRequestMessageProperty();
                httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie, "TrustToken=SecurityTrust1400");

                string tmpReturnUrl = string.Format("{0}://{1}{2}", HttpContext.Current.Request.Url.Scheme, HttpContext.Current.Request.Url.Host, HttpContext.Current.Request.Url.AbsolutePath);
                if (HttpContext.Current.Request.Url.Port != 80 && HttpContext.Current.Request.Url.Port != 443)
                    tmpReturnUrl = string.Format("{0}://{1}:{2}{3}", HttpContext.Current.Request.Url.Scheme, HttpContext.Current.Request.Url.Host, HttpContext.Current.Request.Url.Port, HttpContext.Current.Request.Url.AbsolutePath);
                tmpReturnUrl = tmpReturnUrl.Replace("/RecoveryAccountPassword","");

                httpRequestProperty.Headers.Add(HttpRequestHeader.Referer, tmpReturnUrl);

                using (OperationContextScope scope = new OperationContextScope(SrvSec.InnerChannel))
                {
                    ClsLog.AddLog("OperationContextScope");

                    OperationContext.Current.OutgoingMessageProperties[HttpRequestMessageProperty.Name] = httpRequestProperty;

                    var tmpClsErrorResult = SrvSec.RecoveryAccountPassword(pMobileNo);
                    return tmpClsErrorResult;
                }
            }
            catch (Exception ex){
                var tmpRes = new SrvSecurity.ClsErrorResult() { BizErrors = new List<SrvSecurity.clsBizError>() };
                if (!ex.Message.Contains("deserializing body"))
                {
                    if(ex.Message.Contains("You are not authorized") || ex.Message.Contains("Anonymous"))
                           tmpRes.BizErrors.Add(new SrvSecurity.clsBizError() { ErrorTitel ="دسترسی غیر مجار ، لطفا دقایقی دیگر امتحان نمایید" });
                }
               
                return tmpRes;
            }
        }
    }
}