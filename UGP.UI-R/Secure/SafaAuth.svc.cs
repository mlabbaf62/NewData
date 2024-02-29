using System;
using System.ServiceModel.Activation;
using System.Web;

namespace UGP.UI
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the class name "Auth" in code, svc and config file together.
    // NOTE: In order to launch WCF Test Client for testing this service, please select Auth.svc or Auth.svc.cs at the Solution Explorer and start debugging.

    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class SafaAuth : ISafaAuth
    {
        public ReturnResult Login(string username, string password, string customCredential, bool isPersistent)
        {
            var tmpAuthenticationService = new System.Web.ApplicationServices.AuthenticationService();

            var tmpReturnResult = new ReturnResult();
            try
            {
                var res = tmpAuthenticationService.Login(username, password, customCredential, isPersistent);
                if (res)
                {
                    tmpReturnResult.IsLoginned = true;
                    HttpContext.Current.Response.Cookies[".ASPXAUTH"].Expires = new DateTime().AddHours(1);
                    tmpReturnResult.HttpCookie1 = HttpContext.Current.Response.Cookies[".ASPXAUTH"];
                    return tmpReturnResult;
                }

                else
                {
                    tmpReturnResult.ErrorMessage = "نام کاربری یا کلمه عبور اشتباه است";
                    return tmpReturnResult;
                }
            }
            catch (Exception ex)
            {


                return tmpReturnResult;
            }
        }

        public bool Logout()
        {
            try
            {
                System.Web.Security.FormsAuthentication.SignOut();

                //var tmpCookie = System.Web.HttpContext.Current.Request.Cookies[".ASPXAUTH"];
                //tmpCookie.Expires = DateTime.Now;
                //System.Web.HttpContext.Current.Request.Cookies.Remove(".ASPXAUTH");
                //System.Web.HttpContext.Current.Request.Cookies.Remove("ASP.NET_SessionId");

                //foreach (string cookie1 in HttpContext.Current.Response.Cookies)
                //{
                //    HttpContext.Current.Response.Cookies[cookie1].Expires = DateTime.Now;

                //}
                return true;
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                return false;
            }
        }
    }

    public class ReturnResult
    {
        //public ClsUser ClsUser { get; set; }
        public string UserName { get; set; }

        public bool IsLoginned { get; set; }
        public string ErrorMessage { get; set; }

        public HttpCookie HttpCookie1 { get; set; }
    }
}
