using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace LoginProject
{

    public partial class CreateAccount : System.Web.UI.Page
    {

        protected void Page_Load(object sender, EventArgs e)
        {
            //var tmpR= Request["r"];
            //if (tmpR != Session.SessionID)
            //    Response.Redirect("~/SafaError.html");
        }

        [WebMethod]
        public static SrvSecurity.Account_Info GetAccountInfo()
        {
            try
            {
                var tmpCode = ClsSession.GetSession("AccountSession", false);
                var srvSecurity = ClsCommon.getServiceSecurity();
                var tmpAccount = srvSecurity.GetAccountInfo(tmpCode.ToString());

                tmpAccount.Account_Info.AccountPassword = "********";
                tmpAccount.Account_Info.ExtensionData = null;

                //tmpAccount = (SrvSecurity.Account_Info)ConvertToObjectWithoutPropertiesWithNullValues(tmpAccount);

                return tmpAccount.Account_Info;
            }
            catch (Exception ex)
            {
                ErrorLog.WriteLog(ex);
                return null;
            }
        }


        [WebMethod]
        public static SrvSecurity.ClsErrorResult MobileCheck(string pAccountName, string pNationalCode, string pMobileNo, Guid? NidAccount)
        {

            var srvSec = ClsCommon.getServiceSecurity();
            #region
            try
            {
                ClsLog.AddLog(new { srvSec.Endpoint.Address.Uri.AbsoluteUri });

                SrvSecurity.ClsAccount tmpClsccount = new SrvSecurity.ClsAccount();
                SrvSecurity.Account_Info tmp = new SrvSecurity.Account_Info();
                tmp.AccountName = pAccountName;
                tmp.OwnerNationalCode = pNationalCode;
                tmp.OwnerTell = pMobileNo;
                tmp.NidAccount = NidAccount.HasValue ? NidAccount.Value : Guid.Empty;

                var tmpRes = srvSec.ValidateAccount(tmp).ErrorResult;

                ClsLog.AddLog("ValidateAccount");
                return tmpRes;
            }

            catch (Exception ex)
            {
                ClsLog.AddLog("MobileCheck Ex: " + ex.Message);
                return null;
            }

            #endregion
        }

        [WebMethod]
        public static string SendConfirmSMS(string pBizCode, string pNumber)
        {
            var srvSMS = ClsCommon.getSMSService();
            #region
            try
            {
                Random r = new Random(DateTime.Now.Millisecond);
                var tmpCode = r.Next(11111, 99999).ToString();

                var Tmp = new SrvSMS.ClsParameters()
                {
                    AppName = "UGP",
                    SMSType = "عضویت",
                    Number = pNumber,

                    Text = string.Format(@"کد تاییدیه شما : {0} شهرداری {1}", tmpCode, ClsCommon.CityName),

                    BizCode = pBizCode,
                    ScheduleSendDate = ClsCommon.CurrentShamsiDateString,
                    UserID = "1",
                    UserName = "Admin"
                };
                srvSMS.SendSMS(Tmp);

                ClsSession.AddSession(pBizCode, tmpCode);

                //System.Web.HttpContext.Current.Session.Add(pBizCode, tmpCode);
                ErrorLog.WriteLogIfDebug(tmpCode, "ConfirmSms");
                return "99999";
            }

            catch (Exception ex)
            {
                ErrorLog.WriteLog(ex.Message);
                return "";
            }

            #endregion
        }

        [WebMethod]
        public static bool CheckConfirmCode(string pBizCode, string pConfirmCode)
        {
            try
            {
                var tmpCode = ClsSession.GetSession(pBizCode);

                if (tmpCode.Equals(pConfirmCode))
                {
                    return true;
                }
                else return false;
            }
            catch (Exception ex)
            {
                ErrorLog.WriteLog(ex);
                return false;
            }
        }

        [WebMethod]
        public static SrvInquery.clsPersonInfoJson CheckInqueryMelliCode(string pNationalCode, string Year, string Month, string Day)
        {
            try
            {
                SrvInquery.SrvNationalCodeInquiryClient srvN = ClsCommon.getServiceInquery();
                var tmpRes = srvN.GetPersonInfoJson(pNationalCode, Year, Month, Day);

                return tmpRes.PersonInfoJson; ;
            }
            catch (Exception ex)
            {
                ErrorLog.WriteLog(ex);
                return null;
            }
        }


        protected void btnBack2_Click(object sender, EventArgs e)
        {
            if (Session["UrlReferer"] != null)
                Response.Redirect(Session["UrlReferer"].ToString());
            else
                Response.Redirect("SafaLoginMain.aspx?Domain=" + ClsCommon.Domain);
        }

        [WebMethod]
        public static SrvSecurity.ClsAccount CreateNewAccount(SrvSecurity.Account_Info pAccount)
        {
            ClsLog.AddLog("CreateNewAccount");

            CheckToken();
            ClsLog.AddLog("After CheckToken");

            try
            {
                var tmpRes = new SrvSecurity.ClsAccount() { ErrorResult = new SrvSecurity.ClsErrorResult() { BizErrors = new List<SrvSecurity.clsBizError>() } };

                var srvSecurity = ClsCommon.getServiceSecurity();
                var tmpCheck = MobileCheck(pAccount.AccountName, pAccount.OwnerNationalCode, pAccount.OwnerTell, pAccount.NidAccount);

                ClsLog.AddLog(new { tmpCheck });
                ClsLog.AddLog(new { srvSecurity.Endpoint.Address.Uri });

                if (tmpCheck != null && tmpCheck.BizErrors.Count > 0)
                    tmpRes.ErrorResult.BizErrors = tmpCheck.BizErrors;
                else
                {
                    ClsLog.AddLog("CreateAccount");

                    var tmpAccount = srvSecurity.CreateAccount(pAccount);
                    tmpAccount.ExtensionData = null;
                    tmpAccount.Account_Info.AccountPassword = "********";
                    tmpRes.Account_Info = tmpAccount.Account_Info;
                }
                ErrorLog.WriteLog(ClsLog.Log, "CreateAccount");
                return tmpRes;
            }
            catch (Exception ex)
            {
                ClsLog.AddLog(ex.Message);
                if (ex.InnerException != null)
                {
                    ClsLog.AddLog(ex.InnerException.Message);
                }
                ErrorLog.WriteLog(ClsLog.Log, "CreateAccount");
                ErrorLog.WriteLog(ex);
                return null;
            }
        }

        private static void CheckToken()
        {
            var tmpCookie = System.Web.HttpContext.Current.Request.Cookies["TrustTokenSelf"];

            ClsLog.AddLog(new { tmpCookie });

            var tmpTrustToken = System.Web.HttpContext.Current.Session["TrustTokenSelf"];

            ClsLog.AddLog(new { tmpTrustToken });

            if (tmpCookie != null)
            {
                System.Web.HttpContext.Current.Session.Remove("TrustTokenSelf");
                if (((tmpTrustToken == null || (tmpTrustToken != null && tmpTrustToken.ToString() != tmpCookie.Value)) && tmpCookie.Value != "SecurityTrust1400"))
                {
                    ClsLog.AddLog("enforce");
                    HttpResponse response = HttpContext.Current.Response;
                    response.StatusCode = 401;
                    response.SuppressContent = false;
                    response.ClearContent();
                    response.End();
                }
            }
            else
            {
                ClsLog.AddLog("enforce2");
                HttpResponse response = HttpContext.Current.Response;
                response.StatusCode = 401;
                response.SuppressContent = false;
                response.ClearContent();
                response.End();
            }
        }
        [WebMethod]
        public static string RequestToken()
        {
            var Newguid = Guid.NewGuid().ToString();
            var NewToken = string.Format("{0}#{1}#{2}", Newguid, System.Web.HttpContext.Current.Request.Browser.Browser, System.Web.HttpContext.Current.Request.ServerVariables["Remote_Addr"]);
            NewToken = RSAClient.Encrypt(NewToken, Newguid, "Lsppp1400");

            Random r = new Random(DateTime.Now.Second + DateTime.Now.Millisecond);
            var tmpTrustToken = r.Next();
            System.Web.HttpContext.Current.Session.Add("TrustTokenSelf", tmpTrustToken);

            HttpCookie hc = new HttpCookie("TrustTokenSelf", tmpTrustToken.ToString());
            hc.Expires = DateTime.Now.AddMinutes(10);
            hc.HttpOnly = true;

            if (HttpContext.Current.Request.Url.Scheme.Equals("Https", StringComparison.OrdinalIgnoreCase))
            {
                hc.SameSite = SameSiteMode.Strict;
                hc.Secure = true;
            }
            System.Web.HttpContext.Current.Response.Cookies.Add(hc);

            return NewToken;
        }

    }
}