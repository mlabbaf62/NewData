using System;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;
using System.Web.Security;

namespace UGP.UI
{
    public class Global : System.Web.HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {
            try
            {

                ApiController.WebApiConfig.Register();

                System.Web.ApplicationServices.AuthenticationService.CreatingCookie += AuthenticationService_CreatingCookie;
                System.Web.ApplicationServices.AuthenticationService.Authenticating += AuthenticationService_Authenticating;

         


            }
            catch { }
        }

        void AuthenticationService_Authenticating(object sender, System.Web.ApplicationServices.AuthenticatingEventArgs e)
        {

            var tmpUserName = e.UserName;
            var tmpPassword = e.Password;

            if (tmpUserName == "Ugp" && tmpPassword == "123456")
            {
                e.Authenticated = true;
                e.AuthenticationIsComplete = true;
                return;
            }
            else
            {
                e.Authenticated = false;
                e.AuthenticationIsComplete = false;
                throw new System.ServiceModel.FaultException("مقدار وارد شده اشتباه است");
            }

        }


        void AuthenticationService_CreatingCookie(object sender, System.Web.ApplicationServices.CreatingCookieEventArgs e)

        {
            try
            {
                string UserData = "";


                FormsAuthenticationTicket ticket = new
                FormsAuthenticationTicket
                  (1
                   , e.UserName
                   , DateTime.Now
                   , DateTime.Now.AddDays(1)
                   , e.IsPersistent
                   , UserData
                   , FormsAuthentication.FormsCookiePath);

                string encryptedTicket = FormsAuthentication.Encrypt(ticket);


                HttpCookie cookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                cookie.Expires = DateTime.Now.AddDays(1);
                cookie.SameSite = SameSiteMode.Strict;
                cookie.HttpOnly = true;

                //در برچسب HTTPONLY مرورگر متعهد ميشود که اين کوکي را صرفاً به خدمت دهنده تحويل دهد و
                //هرگونه تلاش کد سمت کاربر، اعم از جاوا اسکريپت، برای دستیابي به کوکي، ناممکن ميگردد
                HttpContext.Current.Response.Cookies["ASP.NET_SessionId"].HttpOnly = true;
                HttpContext.Current.Response.Cookies["ASP.NET_SessionId"].Secure = true;
                HttpContext.Current.Response.Cookies["ASP.NET_SessionId"].SameSite = SameSiteMode.Strict;

                if (HttpContext.Current.Request.Url.Scheme.Equals("Https", StringComparison.OrdinalIgnoreCase))
                {
                    HttpContext.Current.Response.Cookies["ASP.NET_SessionId"].Secure = true;
                    HttpContext.Current.Response.Cookies[".ASPXAUTH"].Secure = true;
                    HttpContext.Current.Response.Cookies[".ASPXAUTH"].SameSite = SameSiteMode.Strict;
                }
                HttpContext.Current.Response.Cookies.Add(cookie);
                e.CookieIsSet = true;

            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
            }

        }

        protected void Session_Start(object sender, EventArgs e)
        {

            #region Log
            try
            {

                //var myCookie = Request.Cookies["ASP.NET_SessionId"];
                //if (myCookie != null)
                //{
                //    //myCookie.Expires = DateTime.Now.AddYears(-1);
                //    Response.Cookies.Remove("ASP.NET_SessionId");

                //    //Response.Cookies.Remove("ASP.NET_SessionId");
                //    myCookie = new HttpCookie("ASP.NET_SessionId");
                //    myCookie.Expires = DateTime.Now.AddMinutes(2);
                //    myCookie.Value = HttpContext.Current.Session.SessionID;
                //    Response.SetCookie(myCookie);
                //}
                //else
                //{
                //    myCookie = new HttpCookie("ASP.NET_SessionId");
                //    myCookie.Expires = DateTime.Now.AddMinutes(2);
                //    Response.Cookies.Add(myCookie);
                //}


                //myCookie.Expires = DateTime.Now.AddDays(-1);


                //myCookie.Expires = DateTime.Now.AddMinutes(60);
                //myCookie.SameSite = SameSiteMode.Strict;
                //myCookie.HttpOnly = true;
                //myCookie.Secure = true;
                //Response.SetCookie(myCookie);

                //try
                //{
                //    var myCookie2 = Request.Cookies["ASP.NET_SId"];
                //    if (myCookie2 != null)
                //    {
                //        var tmpC = RSAClient.Decrypt(myCookie.Value, Common.ClsCommon.NewRequestId, Common.ClsCommon.NewRequestId);
                //        var tmpC1 = tmpC.Split('#');

                //        var tmpCo = myCookie.Value;
                //        var tmpB = Request.Browser.Browser;
                //        var tmpR = Request.ServerVariables["Remote_Addr"];

                //        if (tmpC1[0] != tmpCo && tmpC1[1] != tmpB && tmpC1[2] != tmpR)
                //            throw new System.ServiceModel.FaultException("Invalid Request");
                //    }
                //    else
                //        throw new System.ServiceModel.FaultException("Invalid Request");
                //}
                //catch (Exception ex)
                //{

                //}



                //  Response.SetCookie(myCookie);

                var tmpLog = new dtoDBUGP.LogVisitor();
                tmpLog.WebBrowserName = Request.Browser.Browser;
                tmpLog.OSName = Request.Browser.Platform;
                tmpLog.IP = Request.ServerVariables["REMOTE_ADDR"];
                tmpLog.VisitDate = UGPbiz.ClsCommon.CurrentShamsiDateString;
                tmpLog.VisitTime = UGPbiz.ClsCommon.CurrentTimeString;

                tmpLog.SessionId = Session.SessionID;
                srvDBUGP.DbUGPModelDataContext srv = new srvDBUGP.DbUGPModelDataContext();
                srv.LogVisitors.InsertOnSubmit(tmpLog);
                srv.SubmitChanges();
                srv.Dispose();

                #endregion

                ApiController.WebApiConfig.Register();
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
            }
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            if (Request.Headers.AllKeys.Contains("Origin") && Request.HttpMethod == "OPTIONS")
            {
                Response.Flush();
            }


            // Response.Flush();
            //check fake request from postman


            //فقط برای درخواست های مهم باید چک شود



        }
        //protected void Application_AcquireRequestState(object sender, EventArgs e)
        //{
        //    if (UGPbiz.ClsCommon.GetAppConfig<bool>("DisableSecurityRequest") == true)
        //        return;

        //    UGPbiz.ClsLog.Clear();
        //    if (Request.HttpMethod == "POST")
        //    {
        //        var myCookie = Request.Cookies["ASP.NET_SessionId"];
        //        UGPbiz.ClsLog.AddLog(new { myCookie.Value });

        //        if (myCookie != null)
        //        {
        //            //برای جلوگیری از درخواست هایی که از postman ارسال میشود 
        //            var myCookie2 = Request.Cookies["ASP.NET_SId"];
        //            UGPbiz.ClsLog.AddLog(new { myCookie2.Value });

        //            if (myCookie2 != null)
        //            {
        //                var tmpC = RSAClient.Decrypt(myCookie2.Value, Common.ClsCommon.NewRequestId, Common.ClsCommon.NewRequestId);
        //                UGPbiz.ClsLog.AddLog(new { tmpC });

        //                var tmpC1 = tmpC.Split('#');

        //                var tmpCo = myCookie.Value;
        //                var tmpB = Request.Browser.Browser;
        //                var tmpR = Request.ServerVariables["Remote_Addr"];

        //                UGPbiz.ClsLog.AddLog(new { tmpCo });
        //                UGPbiz.ClsLog.AddLog(new { tmpB });
        //                UGPbiz.ClsLog.AddLog(new { tmpR });
        //                ErrorLog2.WriteLogIfDebug(UGPbiz.ClsLog.Log, "Application_AcquireRequestState");

        //                if (tmpC1[0] != tmpCo || tmpC1[1] != tmpB || tmpC1[2] != tmpR)
        //                {
        //                    Response.Write(System.Net.HttpStatusCode.Unauthorized);
        //                    Response.End();
        //                }
        //            }
        //            else
        //            {
        //                Response.Write(System.Net.HttpStatusCode.Unauthorized);
        //                Response.End();
        //            }
        //        }
        //        else
        //        {
        //            Response.Write(System.Net.HttpStatusCode.Unauthorized);
        //            Response.End();
        //        }
        //    }
        //}
        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        public void Error(object sender, EventArgs e)
        {
            if (!HttpContext.Current.Request.IsLocal)
                return;
            var ex = ((HttpApplication)sender).Server.GetLastError();
            if (ex.GetType() == typeof(HttpException))
                throw ex;
        }

        protected void Session_End(object sender, EventArgs e)
        {
            Session.Abandon();
        }

        protected void Application_End(object sender, EventArgs e)
        {
            Session.Abandon();
        }
        protected void Application_PreSendRequestHeaders(object sender, EventArgs e)
        {
            //var app = sender as System.Web.HttpApplication;
            //if (app == null || !app.Request.IsLocal || app.Context == null)
            //    return;
            //var headers = app.Context.Response.Headers;
            //headers.Remove("Server");
        }
    }
}