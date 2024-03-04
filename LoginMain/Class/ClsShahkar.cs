using LoginMain.SrvInquiry;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;
using System.Xml.Linq;

namespace LoginMain.Class
{
    public class ClsShahkar
    {
        public bool CheckShahkar(string pNationalCode, string pMobileNumber)
        {
            string Log = "";
            try
            {
                string app_name = "safacomp";
                string SecretKey = "7906b457Fkdp38ghjHJkiQ6lkDPACVBN";
                string ClientId = "7906b457Fkdp38ghjHJkiQ6lkDPACVBN";

                var request = WebRequest.Create(ManMailAddressNew + "user/MatchingMobileNationalCode");

                Log += "pMobileNumber=" + pMobileNumber + "\r\n";
                Log += "pNationalCode=" + pNationalCode + "\r\n";

                Log += request.RequestUri.AbsoluteUri.ToString() + "\r\n";
                Log += "Method=Post" + "\r\n";
                Log += "ContentType=application/json" + "\r\n";

                request.Method = "Post";
                request.ContentType = "application/json; charset=utf-8";

                time = GetCurrentTime();
                hash = sha256(SecretKey + time);
                Log += "time=" + time + "\r\n";
                Log += "SecretKey=" + SecretKey + "\r\n";
                Log += "hash=" + hash + "\r\n";
                Log += "apiName=" + app_name + "\r\n";
                Log += "requestTime=" + time + "\r\n";
                Log += "apiSecret=" + hash + "\r\n";
                Log += "ClientId=" + "7906b457Fkdp38ghjHJkiQ6lkDPACVBN" + "\r\n";

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

                    bool res = false;
                    string tmpRes = "";
                    int tmpResCode = 0;
                    var tmpAc = doc.Descendants().Where(f => f.Name.LocalName == "IsMatch").FirstOrDefault();
                    if (!string.IsNullOrEmpty(tmpAc.Value))
                    {
                        Log += "Value=" + tmpAc.Value + "\r\n";
                        if (tmpAc.Value == "true")
                            res = true;
                        else
                        {

                            var tmpAc1 = doc.Descendants().Where(f => f.Name.LocalName == "ErrorCode").FirstOrDefault();
                            int.TryParse(tmpAc1.Value, out tmpResCode);
                            Log += "ErrorCode=" + tmpAc1.Value + "\r\n";

                            if (tmpAc1.Value == "")
                                tmpRes = "اعتبارسنجی صحیح می باشد";
                            if (tmpAc1.Value == "-1")
                                tmpRes = "فرمت کد ملی صحیح نمی باشد";
                            else if (tmpAc1.Value == "-2")
                                tmpRes = "فرمت شماره تلفن باید 11 رقم و با 09 شروع شود";
                            else if (tmpAc1.Value == "-3")
                                res = true;
                            else
                                res = false;
                        }
                    }
                    else
                        res = false;
                    
                    ErrorLog.WriteLog(Log, "Shahkar");


                    return res;
                }
            }
            catch (Exception ex)
            {
                Log += "ex=" + ex.Message + "\r\n";
                ErrorLog.WriteLog(Log, "Shahkar");
                return false;
            }

        }

        #region Property
        string ManMailAddressNew = "https://login.mashhad.ir/ManmailOperation.svc/api/";

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

        #region SabteAhval
        private string sha256_2(string txtClientId, string time)
        {
            var crypt = new System.Security.Cryptography.SHA256Managed();
            var hash = new System.Text.StringBuilder();
            byte[] crypto = crypt.ComputeHash(Encoding.UTF8.GetBytes(txtClientId + time));
            foreach (byte theByte in crypto)
            {
                hash.Append(theByte.ToString("x2"));
            }
            return hash.ToString();
        }

        public ManMailReturnData CheckSabteAhval(string pNationalCode, string pBirthDate)
        {
            pBirthDate = pBirthDate.Replace("/", "").Trim();
            string Log = "";
            Log += "pNationalCode:" + pNationalCode + "\r\n";
            Log += "pBirthDate:" + pBirthDate + "\r\n";

            ClsErrorResult tmpErrorResult = new ClsErrorResult();
            var tmpResult = new ManMailReturnData();
            var regDate = DateTime.Now;
            try
            {
                string app_name = "safacomp";
                string SecretKey = "7906b457Fkdp38ghjHJkiQ6lkDPACVBN";
                string ClientId = "7906b457Fkdp38ghjHJkiQ6lkDPACVBN";

                using (var client = new HttpClient { BaseAddress = new Uri(ManMailAddressNew) })
                {
                    var response = client.GetAsync("client/getCurrentTime").Result;
                    var str = response.Content.ReadAsStringAsync().Result;

                    var start = str.IndexOf("<timestamp>") + ("<timestamp>").Length;
                    var end = str.IndexOf("</timestamp>") - start;
                    str = str.Substring(
                        start,
                        end
                    );
                    var apiSecret = sha256_2(ClientId, str);

                    var payloadJson = new Dictionary<string, string>
                {
                    { "BirthDate", pBirthDate },
                    { "NationalCode",pNationalCode},
                };

                    var stringPayload = JsonConvert.SerializeObject(payloadJson);
                    var httpContent = new StringContent(stringPayload, Encoding.UTF8, "application/json");

                    client.DefaultRequestHeaders.Clear();
                    //client.DefaultRequestHeaders.Add("apiName", SecretKey);
                    client.DefaultRequestHeaders.Add("apiName", "");
                    client.DefaultRequestHeaders.Add("requestTime", str);
                    client.DefaultRequestHeaders.Add("apiSecret", apiSecret);

                    Log += "AbsoluteUri" + client.BaseAddress.AbsoluteUri + "\r\n";

                    response = client.PostAsync("user/SabteAhval", httpContent).Result;
                    Log += "response.StatusCode" + response.StatusCode;
                    if (response.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        str = response.Content.ReadAsStringAsync().Result;

                        var soap = XDocument.Parse(str);

                        tmpResult = new ManMailReturnData()
                        {
                            IsDie = getElem(soap, "IsDie") == null ? false : bool.Parse(getElem(soap, "IsDie")),
                            ErrorCode = getElem(soap, "ErrorCode") == null ? 0 : int.Parse(getElem(soap, "ErrorCode")),
                            IsMatch = getElem(soap, "IsMatch") == null ? false : bool.Parse(getElem(soap, "IsMatch")),
                            Message = getElem(soap, "Message") == null ? "" : getElem(soap, "Message"),
                        };

                        if (tmpResult.ErrorCode == -3)
                            tmpResult.IsMatch = true;
                    }
                    else
                    {
                        ErrorLog.WriteLog(Log, "SabteAhvalEx");
                        tmpResult = new ManMailReturnData
                        {
                            IsDie = false,
                            ErrorCode = (int)response.StatusCode,
                            IsMatch = false,
                            Message = "عدم ارتباط با سرور",
                        };
                    }
                }
            }

            catch (Exception err)
            {
                Log += "err=" + err.Message;
                ErrorLog.WriteLog(Log, "SabteAhvalEx");
                tmpResult = new ManMailReturnData
                {
                    IsDie = false,
                    ErrorCode = -100,
                    IsMatch = false,
                    Message = "عدم ارتباط با سرور",
                };
            }



            //if (string.IsNullOrEmpty(tmpResult.Message))
            //{
            //    tmpResult.Message = "کد ملی و تاریخ تولد با هم همخوانی ندارند";
            //}

            return tmpResult;

        }


        private string getElem(XDocument soap, string key)
        {
            try
            {
                return soap.Root.Elements().First(f => f.Name.LocalName == key).Value;
            }
            catch
            {
                return null;
            }
        }
        #endregion
    }



    [DataContract]
    public class ManMailReturnData
    {
        [DataMember]
        public int ErrorCode { get; set; }
        [DataMember]
        public bool IsMatch { get; set; }
        [DataMember]
        public string Message { get; set; }
        [DataMember]

        public bool IsDie { get; set; }
    }
}