using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Xml.Linq;

/// <summary>
/// Summary description for ClsManMail
/// </summary>
public class ClsManMail
{
    public ClsManMail()
    {

    }

    #region Property
    string ManMailAddressNew = "https://login.mashhad.ir/ManmailOperation.svc/api/";

    string app_name = "safacomp";
    string SecretKey = "7906b457Fkdp38ghjHJkiQ6lkDPACVBN";
    string ClientId = "7906b457Fkdp38ghjHJkiQ6lkDPACVBN";

    string Log = "";

    public string hash
    {
        get; set;
    }
    public string time
    {
        get; set;
    }

    public string SessionId
    {
        get;
        set;
    }


    public string Refresh_Token
    {
        get;
        set;
    }
    public class currentTime
    {
        public string timestamp { get; set; }
    }

    #endregion

    #region Function
    private string GetCurrentTime()// دریافت زمان سیستم 
    {
        string endPoint = ManMailAddressNew + "Client/getCurrentTime";

        HttpWebRequest request = WebRequest.Create(endPoint) as HttpWebRequest;
        request.Method = "GET";
        request.ContentType = "application/xml";
        request.Accept = "application/json";

        using (WebResponse response = request.GetResponse())
        {
            using (Stream stream = response.GetResponseStream())
            {
                StreamReader reader = new StreamReader(stream);
                // Read the content.
                string responseFromServer = reader.ReadToEnd();

                JavaScriptSerializer s1 = new JavaScriptSerializer();
                var TimeResponse = s1.Deserialize<currentTime>(responseFromServer);

                //TimeResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<currentTime>(responseFromServer);

                // Display the content.
                return TimeResponse.timestamp;
            }
        }

    }

    string sha256(string password)
    {
        SHA256Managed crypt = new SHA256Managed();
        string hash = String.Empty;
        byte[] crypto = crypt.ComputeHash(Encoding.ASCII.GetBytes(password), 0, Encoding.ASCII.GetByteCount(password));
        foreach (byte bit in crypto)
        {
            hash += bit.ToString("x2");
        }
        return hash;
    }

    #endregion

    currentTime TimeResponse = new currentTime();
    public string ReturnMessage;

    public string getShahkar(string pMobileNumber, string pNationalCode)
    {
        try
        {
            var request = WebRequest.Create(ManMailAddressNew + "user/MatchingMobileNationalCode");
            request.Method = "Post";
            request.ContentType = "application/json; charset=utf-8";

            time = GetCurrentTime();
            hash = sha256(SecretKey + time);

            request.Headers.Add("apiName", app_name);
            request.Headers.Add("requestTime", time);
            request.Headers.Add("apiSecret", hash);
            request.Headers.Add("ClientId", "7906b457Fkdp38ghjHJkiQ6lkDPACVBN");

            using (var writer = new StreamWriter(request.GetRequestStream()))
            {
                var serializer = new JavaScriptSerializer();
                var payload = serializer.Serialize(new
                {
                    MobileNo = pMobileNumber,
                    NationalCode = pNationalCode
                });

                writer.Write(payload);
            }

            using (var response = request.GetResponse())
            using (var reader = new StreamReader(response.GetResponseStream()))
            {
                string result = reader.ReadToEnd();

                XDocument doc = new XDocument();
                using (StringReader s = new StringReader(result))
                {
                    doc = XDocument.Load(s);
                }

                var tmpAc = doc.Descendants().Where(f => f.Name.LocalName == "IsMatch").FirstOrDefault();
                if (!string.IsNullOrEmpty(tmpAc.Value))
                    if (tmpAc.Value == "true")
                        return "true";
                    else
                    {
                        string tmpRes = "";
                        var tmpAc1 = doc.Descendants().Where(f => f.Name.LocalName == "ErrorCode").FirstOrDefault();
                        if (tmpAc1.Value == "")
                            tmpRes = "اعتبارسنجی صحیح می باشد";
                        if (tmpAc1.Value == "-1")
                            tmpRes = "فرمت کد ملی صحیح نمی باشد";
                        else if (tmpAc1.Value == "-2")
                            tmpRes = "فرمت شماره تلفن باید 11 رقم و با 09 شروع شود";
                        else if (tmpAc1.Value == "-3")
                            tmpRes = "خطای ناشناخته";

                        return tmpRes;
                    }
                else return "";
            }
        }
        catch (Exception ex)
        {
            ErrorLog.WriteLog("ex AccessToken" + ex.Message);
            return null;
        }
    }
}