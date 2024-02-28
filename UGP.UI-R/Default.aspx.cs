using dtoDBUGP;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI.WebControls;
using UGPbiz;


namespace UGP.UI
{
    public partial class Default : System.Web.UI.Page
    {
        //public static SSO.ClsSSO tmpSSo = new SSO.ClsSSO();

        public static SSO.ClsSSO tmpSSO
        {
            get
            {
                if (System.Web.HttpContext.Current.Session["SSO"] != null)
                    return (SSO.ClsSSO)System.Web.HttpContext.Current.Session["SSO"];
                else
                {
                    var tmpSSo = new SSO.ClsSSO();
                    System.Web.HttpContext.Current.Session["SSO"] = tmpSSo;
                    return tmpSSo;
                }
            }
            set
            {
                System.Web.HttpContext.Current.Session["SSO"] = value;
            }

        }

        protected void Page_Load(object sender, EventArgs e)
        {
         

            try
            {

                //string[] keys = Request.Form.AllKeys;
                string Log1 = "";
                //for (int i = 0; i < keys.Length; i++)
                //{
                //    Log1 += keys[i] + ": " + Request.Form[keys[i]] + "<br>";
                //}

                var tmplogout_token = Request["logout_token"];
                if (tmplogout_token != null)
                {
                    Log1 += "tmplogout_token:" + tmplogout_token + "\r\n";
                    
                    tmpSSo.ValidateTokenLogout(tmplogout_token);

                    ErrorLog2.WriteLog(Log1, "LogoutDefault");
                    //Response.Redirect(Request["Page"] == "Logout"))
                }

                //string remoteUrl = "http://localhost/UGPNew/default.aspx";
                //string firstName = "Mudassar";
                //string lastName = "Khan";

                //System.Text.ASCIIEncoding encoding = new System.Text.ASCIIEncoding();
                //string data = string.Format("FirstName={0}&LastName={1}", firstName, lastName);
                //byte[] bytes = encoding.GetBytes(data);
                //HttpWebRequest httpRequest = (HttpWebRequest)WebRequest.Create(remoteUrl);
                //httpRequest.Method = "POST";
                //httpRequest.ContentType = "application/x-www-form-urlencoded";
                //httpRequest.ContentLength = bytes.Length;
                //using (Stream stream = httpRequest.GetRequestStream())
                //{
                //    stream.Write(bytes, 0, bytes.Length);
                //    stream.Close();
                //}

                if (Request.QueryString["LoginMode"] == "StartSSO" || Request.QueryString["state"] == "StartLogin")
                {
                    tmpSSO.SSOType = SSO.SSOType.Authin;
                    tmpSSO.LoadObj();
                }
                else if (Request.QueryString["LoginMode"] == "SSOIsfahan" || Request.QueryString["state"] == "SSOIsfahan")
                {
                    //SSO.ClsSSO tmpSSo = new SSO.ClsSSO();
                    tmpSSO.SSOType = SSO.SSOType.Isfahan;
                    tmpSSO.LoadObj();
                }
                else if (Request.QueryString["LoginMode"] == "SSOGov" || Request.QueryString["state"] == "SSOGov")
                {
                    tmpSSO.SSOType = SSO.SSOType.Gov;
                    tmpSSO.LoadObj();
                }
                else if (Request.QueryString["LoginMode"] == "SSOMyCity" || Request.QueryString["state"] == "SSOMyCity" || !string.IsNullOrEmpty(Request.QueryString["code"]))
                {
                    tmpSSO.SSOType = SSO.SSOType.MyCity;
                    tmpSSO.LoadObj();
                }
                else if (Request.QueryString["LoginMode"] == "ManMail")
                {
                    tmpSSO.SSOType = SSO.SSOType.Default;
                }
            }
            catch { }
            finally {
              
            }
        }

      
      
        public static String PersianDate(int PassDay)
        {
            //get
            //{
            var tmpPersianCalender = new System.Globalization.PersianCalendar();
            String tmpYear = tmpPersianCalender.GetYear(DateTime.Now.AddDays(-PassDay)).ToString();
            String tmpMonth = tmpPersianCalender.GetMonth(DateTime.Now.AddDays(-PassDay)).ToString();
            String tmpDay = tmpPersianCalender.GetDayOfMonth(DateTime.Now.AddDays(-PassDay)).ToString();
            return String.Format(@"{2}/{1}/{0}", tmpDay.Count() == 1 ? "0" + tmpDay : tmpDay, tmpMonth.Count() == 1 ? "0" + tmpMonth : tmpMonth, tmpYear);
            //}
        }
      
        public string WebRequestinJson(string url, string postData)
        {
            string ret = string.Empty;

            StreamWriter requestWriter;

            var webRequest = System.Net.WebRequest.Create(url) as HttpWebRequest;
            if (webRequest != null)
            {
                webRequest.Method = "POST";
                webRequest.ServicePoint.Expect100Continue = false;
                webRequest.Timeout = 20000;

                webRequest.ContentType = "application/json";
                //POST the data.
                using (requestWriter = new StreamWriter(webRequest.GetRequestStream()))
                {
                    requestWriter.Write(postData);
                }
            }

            HttpWebResponse resp = (HttpWebResponse)webRequest.GetResponse();
            Stream resStream = resp.GetResponseStream();
            StreamReader reader = new StreamReader(resStream);
            ret = reader.ReadToEnd();

            return ret;
        }



       

    }
}