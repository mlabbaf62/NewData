using System;
//using System;
using System.Collections.Generic;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.ServiceModel.Configuration;
using System.Text;
using System.Web;
using System.Xml.Linq;

/// <summary>
/// Summary description for ClsCommon
/// </summary>
public class ClsCommon
{

    public static string SessionId
    {
        get
        {
            return System.Web.HttpContext.Current.Session["SessionId"].ToString();
        }
        set
        {
            System.Web.HttpContext.Current.Session["SessionId"] = SessionId;
        }

    }


    public ClsCommon()
    {
    }
    public static string DecryptUrl(string pEnc, string pRequestId = "")
    {
        pEnc = SafaCrypto.ClsPassword.UrlCharToSimbole(pEnc);

        var tmpDec = SafaCrypto.ClsPassword.Decrypt(pEnc, pRequestId);
        return tmpDec;
    }
    public static bool DebugMode
    {
        get
        {
            return ClsCommon.GetAppConfig<bool>("DebugMode");
        }
    }
    public static string CityName
    {
        get
        {
            return ClsCommon.GetAppConfig<string>("CityName");
        }
    }

    public static string ManMailAddressOLd
    {
        get
        {
            try
            {
                return GetAppConfig<string>("ManMailAddress");
            }
            catch
            {
                return "http://account.manmail.ir/api/client/";
            }
        }
    }
    public static string ManMailAddressNew
    {
        get
        {
            try
            {
                return GetAppConfig<string>("ManMailAddressNew");
            }
            catch
            {
                return "http://login.manmail.ir/ManmailOperation.svc/api/client/";
            }
        }
    }
    public static string ManMailAddressNewUser
    {
        get
        {
            try
            {
                var tmpRes = GetAppConfig<string>("ManMailAddressNew");
                tmpRes = tmpRes.ToLower().Replace("client", "user");

                return tmpRes;
            }
            catch
            {
                return "http://login.mashhad.ir/ManmailOperation.svc/api/user/";
            }
        }
    }

    public static string Domain
    {
        get
        {
            if (HttpContext.Current.Session["Domain"] != null)
            {
                if (!string.IsNullOrEmpty(HttpContext.Current.Session["Domain"].ToString()))
                    return HttpContext.Current.Session["Domain"].ToString();
                else return "UGP";
            }
            else return "UGP";
        }
        set
        {
            HttpContext.Current.Session["Domain"] = value;
        }
    }

    public static string ManMailAddressSiteNew
    {
        get
        {
            try
            {
                return GetAppConfig<string>("ManMailAddressSite");
            }
            catch
            {
                return "http://login.manmail.ir/default.aspx";
            }
        }
    }

    public static string ManMailLogoutAddress
    {
        get
        {
            try
            {
                return GetAppConfig<string>("ManMailLogoutAddress");
            }
            catch
            {
                return "http://login.manmail.ir/Logout.aspx";
            }
        }
    }

    public static string ManMailAddressSiteOld
    {
        get
        {
            try
            {
                if (ManMailAddressOLd.StartsWith("https"))
                    return "https://account.manmail.ir/";
                else return "http://account.manmail.ir/";
            }
            catch
            {
                return "https://account.manmail.ir/";
            }
        }
    }
    public static T GetAppConfig<T>(string Param)
    {
        try
        {
            var tmpS = ClsCNManagment.GetAppSetting(Param);
            return (T)Convert.ChangeType(tmpS, typeof(T));

            //System.Configuration.AppSettingsReader ap = new System.Configuration.AppSettingsReader();
            //var tmpReturnSite = ap.GetValue(Param, typeof(T));
            //return (T)tmpReturnSite;
        }
        catch (Exception ex)
        {
            ClsLog.AddLog(new { Param } + ex.Message);
            return default(T);
        }
    }

    public static string GetDeferedUrl(string pDomain = "")
    {
        try
        {
            var tmpDomain = ClsCommon.Domain;

            if (!string.IsNullOrEmpty(pDomain))
                tmpDomain = pDomain;

            var tmpUrlDeffered = ClsCommon.GetAppConfig<string>("ReturnUrl");
            ClsLog.AddLog(new { tmpUrlDeffered });

            if (tmpUrlDeffered.Contains("#"))
            {
                var T = System.Text.RegularExpressions.Regex.Split(tmpUrlDeffered, "#" + ClsCommon.Domain + "#");
                return T[1].ToString();
            }
            else
                return tmpUrlDeffered;
        }
        catch { return ""; }
    }

    public static string GetSecurityUrl()
    {
        try
        {
            var tmpUrlDeffered = ClsCommon.GetAppConfig<string>("SecurityService");
            if (tmpUrlDeffered.Contains("#"))
            {
                var T = System.Text.RegularExpressions.Regex.Split(tmpUrlDeffered, "#" + ClsCommon.Domain + "#");
                if (T.Length == 1)
                    T = System.Text.RegularExpressions.Regex.Split(tmpUrlDeffered, "#UGP#");

                return T[1].ToString();
            }
            else
                return tmpUrlDeffered;
        }
        catch (Exception ex) { ErrorLog.WriteLog(ex); return ""; }
    }

    public static System.ServiceModel.BasicHttpBinding CreateBinding()
    {
        System.ServiceModel.BasicHttpBinding binding = new System.ServiceModel.BasicHttpBinding();


        binding.TransferMode = System.ServiceModel.TransferMode.StreamedResponse;


        if (SECURITY_SERVICE_ADDRESS.ToLower().Contains("https"))
            binding = new System.ServiceModel.BasicHttpBinding(System.ServiceModel.BasicHttpSecurityMode.Transport);


        //binding.ReaderQuotas.MaxStringContentLength = 2147483647;
        binding.ReaderQuotas.MaxArrayLength = 2147483647;
        binding.ReaderQuotas.MaxStringContentLength = 2147483647;

        binding.MaxBufferPoolSize = 2147483647;
        binding.MaxReceivedMessageSize = 2147483647;
        binding.MaxBufferSize = 2147483647;

        binding.CloseTimeout = TimeSpan.FromMinutes(5);
        binding.ReceiveTimeout = TimeSpan.FromMinutes(5);
        binding.OpenTimeout = TimeSpan.FromMinutes(5);
        binding.SendTimeout = TimeSpan.FromMinutes(5);
        return binding;
    }

    public static System.ServiceModel.BasicHttpBinding CreateBinding2()
    {
        System.ServiceModel.BasicHttpBinding binding = new System.ServiceModel.BasicHttpBinding();


        //binding.TransferMode = System.ServiceModel.TransferMode.StreamedResponse;

        //binding.ReaderQuotas.MaxStringContentLength = 2147483647;
        binding.ReaderQuotas.MaxArrayLength = 2147483647;

        binding.MaxReceivedMessageSize = 2147483647;
        binding.MaxBufferSize = 2147483647;

        binding.CloseTimeout = TimeSpan.FromMinutes(5);
        binding.ReceiveTimeout = TimeSpan.FromMinutes(5);
        binding.OpenTimeout = TimeSpan.FromMinutes(5);
        binding.SendTimeout = TimeSpan.FromMinutes(5);
        return binding;
    }

    public static string SECURITY_SERVICE_ADDRESS = "";
    public static SrvSecurity.SecurityWCFClient getServiceSecurity()
    {
        try
        {
            //ClientSection clientSection = (ClientSection)System.Configuration.ConfigurationManager.GetSection("system.serviceModel/client");
            //var el = clientSection.Endpoints[0]; // I don't want to use index here as more endpoints may get added and its order may change
           

            var tmpServiceAddress = GetSecurityUrl();
            if (!string.IsNullOrEmpty(tmpServiceAddress))
                SECURITY_SERVICE_ADDRESS = tmpServiceAddress;

            SrvSecurity.SecurityWCFClient srv;

            srv = new SrvSecurity.SecurityWCFClient(CreateBinding(), new System.ServiceModel.EndpointAddress(SECURITY_SERVICE_ADDRESS));

         


            if (srv.State == System.ServiceModel.CommunicationState.Closed || srv.State == System.ServiceModel.CommunicationState.Created)
                srv.Open();

            //  OperationContextScope oc = new OperationContextScope(srv.InnerChannel);
            //  SetCookies(OperationContext.Current, CookieStorage);


            //  ManipulateCookieContainer(AUTHENTICATION_SERVICE_ADDRESS, SECURITY_SERVICE_ADDRESS);

            return srv;
        }
        catch(Exception ex)
        {
            ClsLog.AddLog("getServiceSecurity" + ex.Message);
            return null;
        }
    }
    #region Cookies


    public static CookieContainer CookieStorage = new CookieContainer();
    public static CookieContainer GetCookies(OperationContext oc)
    {
        HttpResponseMessageProperty httpResponseProperty =
            (HttpResponseMessageProperty)oc.IncomingMessageProperties[HttpResponseMessageProperty.Name];
        if (httpResponseProperty != null)
        {
            CookieContainer cookieContainer = new CookieContainer();
            string header = httpResponseProperty.Headers[HttpResponseHeader.SetCookie];

            if (header != null)
            {
                cookieContainer.SetCookies(new Uri(@url), header);
            }
            return cookieContainer;
        }
        return null;
    }

    static string url = "http://192.168.100.50";
    public static void SetCookies(OperationContext oc, CookieContainer cookieContainer)
    {
        HttpRequestMessageProperty httpRequestProperty = null;
        if (oc.OutgoingMessageProperties.ContainsKey(HttpRequestMessageProperty.Name))
        {
            httpRequestProperty =
                oc.OutgoingMessageProperties[HttpRequestMessageProperty.Name]
                as HttpRequestMessageProperty;
        }

        if (httpRequestProperty == null)
        {
            httpRequestProperty = new HttpRequestMessageProperty();
            oc.OutgoingMessageProperties.Add(HttpRequestMessageProperty.Name,
                httpRequestProperty);
        }
        httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie,
            cookieContainer.GetCookieHeader(new Uri(@url)));
    }
    private static string FormatCookie(string input)
    {
        string[] cookies = input.Split(new char[] { ',', ';' });
        StringBuilder buffer = new StringBuilder(input.Length * 10);
        foreach (string entry in cookies)
        {
            if (entry.IndexOf("=") > 0 && !entry.Trim().StartsWith("path") && !entry.Trim().StartsWith("expires"))
            {
                buffer.Append(entry).Append("; ");
            }
        }
        if (buffer.Length > 0)
        {
            buffer.Remove(buffer.Length - 2, 2);
        }
        return buffer.ToString();
    }
    public static string cookies { get; set; }
    #endregion
    public static SrvAuth.AuthenticationServiceClient getServiceAuth()
    {
        try
        {
            ClientSection clientSection = (ClientSection)System.Configuration.ConfigurationManager.GetSection("system.serviceModel/client");
            var el = clientSection.Endpoints[1]; // I don't want to use index here as more endpoints may get added and its order may change
            string SECURITY_SERVICE_ADDRESS = el.Address.ToString();

            SrvAuth.AuthenticationServiceClient srv;

            srv = new SrvAuth.AuthenticationServiceClient(CreateBinding2(), new System.ServiceModel.EndpointAddress(SECURITY_SERVICE_ADDRESS));

            if (srv.State == System.ServiceModel.CommunicationState.Closed)
                srv.Open();

            return srv;
        }
        catch
        {
            return null;
        }
    }

    public static SrvInquery.SrvNationalCodeInquiryClient getServiceInquery()
    {
        try
        {
            ClientSection clientSection = (ClientSection)System.Configuration.ConfigurationManager.GetSection("system.serviceModel/client");
            var tmpServiceAddress = ClsCommon.GetAppConfig<string>("NationalCodeInquiryURL");
            if (string.IsNullOrEmpty(tmpServiceAddress))
            {
                tmpServiceAddress = "http://esup.qom.ir/SrvNationalCodeInquiry/SrvNationalCodeInquiry.svc";
            }

            SrvInquery.SrvNationalCodeInquiryClient srv;

            srv = new SrvInquery.SrvNationalCodeInquiryClient(CreateBinding(), new System.ServiceModel.EndpointAddress(tmpServiceAddress));

            if (srv.State == System.ServiceModel.CommunicationState.Closed)
                srv.Open();

            return srv;
        }
        catch
        {
            return null;
        }
    }

    public static string GetEncryptedUserName(string pUserName, string pRequestKey)
    {
        string tmpEncryptUserName = "";
        if (!string.IsNullOrEmpty(pUserName))
            tmpEncryptUserName = RSAClient.Encrypt(pUserName, "SfSLbf", pRequestKey);

        return tmpEncryptUserName;
    }

    public static String CurrentShamsiDateString
    {
        get
        {
            var tmpPersianCalender = new System.Globalization.PersianCalendar();
            String tmpYear = tmpPersianCalender.GetYear(DateTime.Now).ToString();
            String tmpMonth = tmpPersianCalender.GetMonth(DateTime.Now).ToString();
            String tmpDay = tmpPersianCalender.GetDayOfMonth(DateTime.Now).ToString();
            return String.Format(@"{2}/{1}/{0}", tmpDay.Length == 1 ? "0" + tmpDay : tmpDay, tmpMonth.Length == 1 ? "0" + tmpMonth : tmpMonth, tmpYear);
        }
    }
    public static string CurrentTimeString
    {
        get
        {
            string tmpHour = DateTime.Now.Hour.ToString();
            string tmpMinute = DateTime.Now.Minute.ToString();
            return string.Format((tmpHour.Length == 2 ? tmpHour : "0" + tmpHour) + ":" + (tmpMinute.Length == 2 ? tmpMinute : "0" + tmpMinute));
        }
    }

    public static string GetClientIP()
    {
        try
        {
            System.Web.HttpContext context = System.Web.HttpContext.Current;
            string ClientIP = context.Request.ServerVariables["REMOTE_ADDR"];

            if (ClientIP.Contains("::1") || String.IsNullOrEmpty(ClientIP))
                ClientIP = "Localhost";

            return ClientIP;
        }
        catch
        {
            return "UNKNOWN IP";
        }
    }

    public static string CreateReturnUrl(string tmpUrlDeffered, string SessionId, bool Encrypted = false)
    {
        var tmpSimbol = "?";
        if (tmpUrlDeffered.Contains("?"))
            tmpSimbol = "&";

        ClsLog.AddLog(new { SessionId });
        if (Encrypted)
        {
            if (ClsCommon.GetAppConfig<bool>("NoEncryptSessionID") == false)
            {
                SessionId = SafaCrypto.ClsPassword.Encrypt(SessionId, ClsCommon.RequestId);
                SessionId = SafaCrypto.ClsPassword.UrlSimboleToChar(SessionId);

                ClsLog.AddLog(new { ClsCommon.RequestId });
                ClsLog.AddLog(new { SessionId });
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
    public static string CreateReturnUrlForSecurity(string tmpUrlDeffered, string pUserID, string pSessionId, string pFullName)
    {
        var tmpSimbol = "?";
        if (tmpUrlDeffered.Contains("?"))
            tmpSimbol = "&";

        var TokenID = pUserID + "###" + pSessionId + "###" + pFullName;
        TokenID = SafaCrypto.ClsPassword.Encrypt(TokenID, ClsCommon.RequestId);
        TokenID = SafaCrypto.ClsPassword.UrlSimboleToChar(TokenID);

        var tmpAddress = string.Format("{0}{1}Token={2}&LoginMode=Sec", tmpUrlDeffered, tmpSimbol, TokenID);

        if (ClsCommon.GetAppConfig<bool>("DebugMode") == true)
            ErrorLog.WriteLog(tmpAddress);

        return tmpAddress;
    }
    public static SrvSMS.SrvScheduleSMSClient getSMSService()
    {
        try
        {
            string SMS_ADDRESS = ClsCNManagment.GetAppSetting("UrlSMS");
            SrvSMS.SrvScheduleSMSClient srv;
            srv = new SrvSMS.SrvScheduleSMSClient(CreateBinding(), new System.ServiceModel.EndpointAddress(SMS_ADDRESS));

            if (srv.State == System.ServiceModel.CommunicationState.Closed)
                srv.Open();
            return srv;
        }
        catch
        {
            return null;
        }
    }

    public static string RequestId
    {
        get
        {
            //return  "2e336b51-0000-0000-0000-66eb7a67a41f";
            try
            {
                var tmpc = System.Web.HttpContext.Current.Request.Cookies["ASP.NET_SessionId"];

                return tmpc.Value;
            }
            catch
            {
                return "";
            }
        }
    }

    public static string NewRequestId
    {
        get
        {
            return "2e336b51-0000-0000-0000-66eb7a67a41f";

        }
    }



}