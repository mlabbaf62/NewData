using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net;
using Authin.Api.Sdk.Request;
using System.Text;
using System.IO;
using UGPbiz;
using System.Runtime.Caching;

namespace UGP.UI.SSO
{

    public partial class ClsSSOGovNew
    {

        public void LoadObj()
        {
            try
            {
                ClsLog.Clear();
                ClsLog.AddLog("Start SSO Gov");
                string tmpReturnUrl = string.Format("{0}://{1}{2}", HttpContext.Current.Request.Url.Scheme, HttpContext.Current.Request.Url.Host, HttpContext.Current.Request.Url.AbsolutePath);
               

                if (HttpContext.Current.Request.Url.Port != 80 && HttpContext.Current.Request.Url.Port != 443)
                    tmpReturnUrl = string.Format("{0}://{1}:{2}{3}", HttpContext.Current.Request.Url.Scheme, HttpContext.Current.Request.Url.Host, HttpContext.Current.Request.Url.Port, HttpContext.Current.Request.Url.AbsolutePath);

                //tmpReturnUrl = tmpReturnUrl.Replace("/default.aspx", "").Replace("/Default.aspx", "");


                // localhost
                RequestData.redirect_uri = tmpReturnUrl;
                try
                {
                    RequestData.MainAddress = ClsCNManagment.GetAppSetting("SSOAddress");
                    RequestData.SSOApiAddress = ClsCNManagment.GetAppSetting("SSOApiAddress");
                    RequestData.client_id = ClsCNManagment.GetAppSetting("client_id");
                    RequestData.client_secret = ClsCNManagment.GetAppSetting("client_secret");
                }
                catch (Exception ex)
                {
                    ClsLog.AddLog(new { ex.Message });
                }
                if (RequestData.AuthorizationCode == null)
                    RequestData.AuthorizationCode = System.Web.HttpContext.Current.Request["code"];
                // Log += "AuthorizationCode : " + (RequestData.AuthorizationCode) + "\r\n";

                ClsLog.AddLog(new { RequestData.AuthorizationCode });
                ClsLog.AddLog(new { RequestData.client_id });
                ClsLog.AddLog(new { RequestData.client_secret });
                ClsLog.AddLog(new { RequestData.MainAddress });
                ClsLog.AddLog(new { RequestData.redirect_uri });

                if (RequestData.AuthorizationCode == null)
                {
                    GotoLoginPage();
                }
                else
                {
                    GetAccessToken();
                    GetUserInfo();

                    System.Web.HttpContext.Current.Response.Redirect(".?LoginMode=SSO", false);
                }
            }
            catch (Exception ex)
            {
                ClsLog.AddLog(new { ex.Message });
                ErrorLog2.WriteLog(ClsLog.Log, "LoginSSORedirectError");
            }
            finally
            {
                ErrorLog2.WriteLog(ClsLog.Log, "LoginSSORedirect");
            }
        }
   
        public void GotoLoginPage()
        {
            //https://ssokeshvar.moi.ir/oauth2/authorize?response_type=code&scope=openid profile&client_id={0}&state=SSOGov&redirect_uri={1}
            //MainAddress=FullAddress

            string url = string.Format(RequestData.MainAddress, RequestData.client_id, RequestData.redirect_uri);
            ClsLog.AddLog(new { url });

            System.Web.HttpContext.Current.Response.Redirect(url, false);
        }
        public void GetAccessToken()
        {
            try
            {

                #region GetAccessToken

                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
                String username = RequestData.client_id;
                String password = RequestData.client_secret;

                String encoded = System.Convert.ToBase64String(System.Text.Encoding.GetEncoding("ISO-8859-1").GetBytes(username + ":" + password));

                //Form Data

                var formData = string.Format(@"grant_type=authorization_code&code={0}&redirect_uri={1}&scope=openid profile",
                      RequestData.AuthorizationCode, RequestData.redirect_uri);
                ClsLog.AddLog(new { formData });

                var encodedFormData = Encoding.ASCII.GetBytes(formData);

                ClsLog.AddLog(new { encodedFormData });

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(RequestData.SSOApiAddress + "oauth2/token");
                request.ContentType = "application/x-www-form-urlencoded";
                request.Method = "POST";
                request.ContentLength = encodedFormData.Length;
                request.Headers.Add("Authorization", "Basic " + encoded);

                ClsLog.AddLog(new { request.Headers });
                ClsLog.AddLog(new { encoded });

                using (var stream = request.GetRequestStream())
                {
                    stream.Write(encodedFormData, 0, encodedFormData.Length);
                }

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();
                var dic = JsonConvert.DeserializeObject<Dictionary<string, string>>(responseString);

                ResponseData.access_token = dic["access_token"]; ;
                ClsLog.AddLog(new { ResponseData.access_token });
                #endregion

                //ValidateToken();
            }
            catch (Exception ex)
            {
                ClsLog.AddLog("GetAccessToken EX : " + ex.Message);
                //lblMessage.Text = ex.Message;
            }
        }
        public void GetUserInfo()
        {
            string tmpHeader = "Bearer " + ResponseData.access_token;

            var tmpUserResponse = GetWebRequest(RequestData.SSOApiAddress + "api/v1/user/userinfo", "", tmpHeader);
            ClsLog.AddLog(tmpUserResponse);
            var tmpUser = Newtonsoft.Json.JsonConvert.DeserializeObject<ClsSSOUser>(tmpUserResponse);
            ClsLog.GetStrLogFromClass(tmpUser);

            ClsLog.AddLog(new { HttpContext.Current.Session.SessionID });
            ResponseData.UserName = tmpUser.nationalId;

            ClsLog.AddLog(new { ResponseData.UserName });

            CreateAccount(tmpUser);
        }
        public void ValidateTokenLogout(string ptoken)
        {
            try
            {
                var jwksRequest = JwksRequest.GetBuilder()
                .SetBaseUrl(RequestData.MainAddress)
                .Build();

                var jwksTask = jwksRequest.ExecuteSync();
                //jwksTask.Start();
                var jwksResult = jwksTask;

                var decodedJwt = Authin.Api.Sdk.Validation.TokenValidator.Validate(
                   ptoken,
                   jwksResult,
                   "https://www.authin.ir",
                   RequestData.client_id
                );
                var tmpLog = ErrorLog2.GetStrLogFromClass(decodedJwt);
                ErrorLog2.WriteLog(tmpLog, "ValidateTokenLogout");
                // GetRefreshToken();
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex.Message, "ValidateTokenLogoutError");
            }
        }

        public void GetRefreshToken()
        {
            try
            {
                var refreshTokenRequest = RefreshTokenRequest.GetBuilder()
                     .SetBaseUrl(RequestData.MainAddress)
                    .SetClientId(RequestData.client_id)
                    .SetClientSecret(RequestData.client_secret)
                    .SetAccessToken(ResponseData.access_token)
                    .SetGrantType("refresh_token")
                    .SetRefreshToken(ResponseData.refresh_token)
                    .Build();

                var refreshTokenTask = refreshTokenRequest.Execute();
                refreshTokenTask.Start();
                var refreshTokenResult = refreshTokenTask.Result;
            }
            catch (Exception ex)
            {

            }
        }

      
        private string GetWebRequest(string Url, string FormData, string Header, string Method = "Get")
        {
            try
            {
                ClsLog.AddLog(new { Url });
                ClsLog.AddLog(new { FormData });

                var encodedFormData = Encoding.ASCII.GetBytes(FormData);
                ClsLog.AddLog(new { encodedFormData.Length });
                ClsLog.AddLog(new { encodedFormData });

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(Url);
                request.ContentType = "application/x-www-form-urlencoded";
                request.Method = Method;


                if (!string.IsNullOrEmpty(Header))
                    request.Headers.Add("Authorization", Header);

                ClsLog.AddLog("Headers:" + request.Headers.ToString());

                if (encodedFormData.Length > 0)
                {
                    request.ContentLength = encodedFormData.Length;
                    using (var stream = request.GetRequestStream())
                    {
                        stream.Write(encodedFormData, 0, encodedFormData.Length);
                    }
                }

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();

                ClsLog.AddLog(new { responseString });

                return responseString;
            }
            catch (Exception ex)
            {
                ClsLog.AddLog("Ex UserInfo:" + ex.Message);
                return null;
            }
        }

        public void CreateAccount(ClsSSOUser UserInfo)
        {
            ClsLog.AddLog("CreateAccount");
            string NewSessionId = RequestData.AuthorizationCode.Substring(0, 36);
            ClsLog.AddLog(new { NewSessionId });
            ClsLog.AddLog("ClsAccount.CreateAccount");
            var tmpAccount = ClsAccount.CreateAccount(new SrvSecurity.Account_Info()
            {
                AccountName = UserInfo.nationalId,
                OwnerFirstName = UserInfo.firstName,
                OwnerLastName = UserInfo.lastName,
                OwnerTell = UserInfo.mobile,
                CellPhone = UserInfo.mobile,
                OwnerFatherName = UserInfo.fatherName,
                OwnerSex = (UserInfo.gender == "MALE" ? true : false),
                Address = UserInfo.FullAddress,
                OwnerIDNO = UserInfo.shenasnamehNo,
                OwnerBirthDate = UserInfo.birthDateShamsi,
                AccountPassword = "safa123",
                SessionId = NewSessionId,
                OwnerNationalCode = UserInfo.nationalId,
                PostCode=UserInfo.postalCode,
               
            });

          
            ClsLog.AddLog("CreateAccount is null : " + (tmpAccount == null));
            ClsLog.GetStrLogFromClass(tmpAccount);

            if (tmpAccount != null)
            {
                tmpAccount.SessionId = NewSessionId;
                UGP.UI.ClsSession.AddCache(RequestData.AuthorizationCode, tmpAccount, 1);
                ClsLog.AddLog("AddCache = " + RequestData.AuthorizationCode);
            }
        }

        public void Logout()
        {
            string Url = RequestData.SSOApiAddress + "logout";
            System.Web.HttpContext.Current.Response.Redirect(Url);
        }
    }
}