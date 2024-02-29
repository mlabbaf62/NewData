using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Net;
using System.Runtime.Caching;
using System.Text;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.ServiceModel.Web;

public partial class ClsSSO_Isfahan
{

    public string Username { get; set; }
    public string Password { get; set; }
    public string Token { get; set; }
    public void LoadObj()
    {
        Login();
    }
    public static string Log = "";

    public bool Login()
    {
        try
        {
            try
            {
                NewProfileApiMethod.AdminUserName = "ESUP";
                NewProfileApiMethod.AdminPassword = "@ESUP##$";
                NewProfileApiMethod.apiUrlOrigin = ClsCNManagment.GetAppSetting("ssoIsfahan");
            }
            catch { }

            Task<string> tmpToken = NewProfileApiMethod.AutenticationApi();
            var tmpUser = NewProfileApiMethod.LoginUserApi(Username, Password);
            ClsLog.AddLog(new { tmpToken });
            ClsLog.AddLog(new { tmpUser.Result.isSuccess });
            if (tmpUser.Result.isSuccess)
            {
                CreateAccount(tmpUser.Result);
                return true;
            }
            else
                return false;
        }
        catch (Exception ex)
        {
            ClsLog.AddLog("Ex: " + ex.Message);
            return false;
        }

    }


    public void CreateAccount(NewProfileApiResult UserInfo)
    {
        try
        {
            var srvSec = ClsCommon.getServiceSecurity();
            HttpRequestMessageProperty httpRequestProperty = new HttpRequestMessageProperty();
            httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie, "TrustToken=SecurityTrust1400");
            using (OperationContextScope scope = new OperationContextScope(srvSec.InnerChannel))
            {
                OperationContext.Current.OutgoingMessageProperties[HttpRequestMessageProperty.Name] = httpRequestProperty;
                var tmpAccount = srvSec.CreateAccount(new SrvSecurity.Account_Info()
                {
                    AccountName = UserInfo.data.userName,

                    OwnerFirstName = UserInfo.data.displayName.Split(' ')[0],
                    OwnerLastName = UserInfo.data.displayName.Split(' ')[1],
                    CellPhone = UserInfo.data.mobileNumber,
                    OwnerTell = UserInfo.data.mobileNumber,
                    MailBox = UserInfo.data.emailAddress,
                    AccountPassword = "safa123",
                    EumAccountType = 1,
                });
            }

            srvSec.Close();
        }
        catch { }
    }

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
            cookieContainer.GetCookieHeader(new Uri("")));
    }
}


public class NewProfileApiMethod
{
    private static int ServiceId = 0;
    private static MemoryCache _cache = MemoryCache.Default;
    public static string apiUrlOrigin = "https://profile.isfahan.ir/api/";

    public static string AdminUserName;
    public static string AdminPassword;
    public static string RefreshToken;
    public static async Task<string> AutenticationApi()
    {
        string apiUrl = apiUrlOrigin + "Account/UserLogin";

        LoginParam loginParam = new LoginParam()
        {
            username = AdminUserName,
            password = AdminPassword,
            serviceId = ServiceId,
        };
        string Token = _cache.Get("Token") as string;

        if (!string.IsNullOrEmpty(Token))
        {
            return Token;
        }
        CacheItemPolicy cacheItemPolicy = new CacheItemPolicy();
        cacheItemPolicy.AbsoluteExpiration = DateTime.Now.AddMinutes(15);

        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;
        using (var client = new HttpClient())
        {
            try
            {
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                var w = client.PostAsJsonAsync(apiUrl, loginParam);
                w.Wait();
                HttpResponseMessage response = w.Result;
                if (response.IsSuccessStatusCode)
                {
                    var result = response.Content.ReadAsAsync<NewProfileApiResult>();
                    if (result.Result.isSuccess)
                    {
                        Token = result.Result.data.access_token;
                        RefreshToken = result.Result.data.refresh_token;
                        _cache.Add("Token", Token, cacheItemPolicy);
                        return Token;
                    }

                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }
    }
    public static async Task<NewProfileApiResult> LoginUserApi(string username, string password)
    {
        try
        {
            var loginParam = new
            {
                username = username,
                password = password,
                serviceId = 42,
            };

            ClsLog.GetStrLogFromClass(loginParam);

            string apiUrl = apiUrlOrigin + "Account/UserLogin";
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;

            ClsLog.AddLog(new { apiUrl });
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                var w = client.PostAsJsonAsync(apiUrl, loginParam);
                w.Wait();
                HttpResponseMessage response = w.Result;
                if (response.IsSuccessStatusCode)
                {
                    ClsLog.AddLog(new { response.IsSuccessStatusCode });
                    ClsLog.AddLog(new { response.StatusCode });

                    var result = response.Content.ReadAsAsync<NewProfileApiResult>();
                    result.Wait();
                    if (result.Result.isSuccess)
                    {
                        return result.Result;
                    }
                }
                ClsLog.AddLog(new { response.IsSuccessStatusCode });
                return null;
            }
        }
        catch (Exception ex)
        {
            ClsLog.AddLog("LoginUserApi Ex: " + ex.Message);
            return null;
        }
    }
  private partial class LoginParam
    {
        public string username { get; set; }
        public string password { get; set; }
        public int serviceId { get; set; }

    }
    private partial class CheckCitzenParam
    {
        public string nationCode { get; set; }

    }
    private partial class CheckRegisterCitizenResult
    {
        public bool isSuccess { get; set; }
        public int statusCode { get; set; }
        public string messages { get; set; }
        public NewProfileError[] errors { get; set; }
        public CheckRegisterCitizenData data { get; set; }

    }
    private partial class CheckRegisterCitizenData
    {
        public bool isRegister { get; set; }
        public DateTime? registerOnDate { get; set; }
        public int? personalPicture_Confirmed { get; set; }
        public string mobile { get; set; }

    }

    public static async Task<string> GetRefreshToken()
    {
        string apiUrl = apiUrlOrigin + "Account/RefreshToken";
        var RefreshTokenParam = new
        {
            refreshToken = RefreshToken,
        };
        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;
        using (var client = new HttpClient())
        {
            try
            {
                client.BaseAddress = new Uri(apiUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                var w = client.PostAsJsonAsync(apiUrl, RefreshTokenParam);
                w.Wait();
                HttpResponseMessage response = w.Result;
                if (response.IsSuccessStatusCode)
                {
                    var result = response.Content.ReadAsAsync<NewProfileApiResult>();
                    if (result.Result.isSuccess)
                    {
                        RefreshToken = result.Result.data.refresh_token;
                        return RefreshToken;
                    }

                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }
    }

}

public partial class NewProfileApiResult
{
    public bool isSuccess { get; set; }
    public int statusCode { get; set; }
    public string messages { get; set; }
    public NewProfileError[] errors { get; set; }
    public NewProfileLoginData data { get; set; }
}

public partial class NewProfileUser
{
    public string Result { get; set; }
    public int Citizen_ID { get; set; }
    public int Queue_ID { get; set; }
    public string StrGender { get; set; }
    public string MariageStatus { get; set; }
    public string StrMariageStatus { get; set; }
    public string NationCode { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FatherName { get; set; }
    public string Mobile { get; set; }
    public string BirthDate { get; set; }
    public string FullAddress { get; set; }
    public int UserId { get; set; }
}
public partial class NewProfileError
{
    public string field { get; set; }
    public string message { get; set; }
    public string adminMessage { get; set; }
}
public partial class NewProfileLoginData
{
    public int userId { get; set; }
    public int? serviceId { get; set; }
    public string userName { get; set; }
    public int userAccountState { get; set; }
    public DateTime? lastLoggedIn { get; set; }
    public DateTime? createdOnDate { get; set; }
    public string[] roles { get; set; }
    public string displayName { get; set; }
    public string emailAddress { get; set; }
    public bool emailVerification { get; set; }
    public string mobileNumber { get; set; }
    public bool mobileNumberVerification { get; set; }
    public string access_token { get; set; }
    public string refresh_token { get; set; }
    public NewProfileCitizenGroup[] citizenGroups { get; set; }
}
public partial class NewProfileIsUserExistResult
{
    public bool isRegister { get; set; }
    public string mobile { get; set; }
}

public partial class NewProfileCitizenApiResult
{
    public bool isSuccess { get; set; }
    public int statusCode { get; set; }
    public string messages { get; set; }
    public NewProfileError[] errors { get; set; }
    public NewProfileUser data { get; set; }
}
public partial class NewProfileCitizenGroup
{
    public int id { get; set; }
    public int groupId { get; set; }
    public string group { get; set; }
}