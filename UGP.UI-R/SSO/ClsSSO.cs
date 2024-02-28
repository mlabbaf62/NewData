using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UGP.UI.SSO
{
    [Serializable]
    public class ClsSSO
    {
        public SSOType SSOType { get; set; }

        public void LoadObj()
        {

           
            if (SSOType == SSOType.Gov)
            {
                try
                {
                    //SSO.ClsSSOGov tmpSSOGov = new SSO.ClsSSOGov();
                    SSO.ClsSSOGovNew tmpSSOGov = new SSO.ClsSSOGovNew();
                    tmpSSOGov.LoadObj();
                }
                catch(Exception ex) {
                    ErrorLog2.WriteLog(ex.Message, "Start SSO Gov ex");
                }
            }
         
            
        }

        public void Logout()
        {
         
           
           if (SSOType == SSOType.Gov)
            {
                SSO.ClsSSOGovNew tmpAuthin = new SSO.ClsSSOGovNew();
                tmpAuthin.Logout();
            }
      
        }
        public string SessionID
        {
            get
            {
                return System.Web.HttpContext.Current.Session["SessionID"].ToString();
            }
            set { System.Web.HttpContext.Current.Session["SessionID"] = value; }
        }

    }

    public enum SSOType { Default, Authin, Shiraz, Isfahan, Zanjan, Gov , MyCity }


    public struct RequestData
    {
        public static string MainAddress = "http://demo.authin.ir/";
        public static string SSOApiAddress = "https://ssokeshvar.moi.ir/";

        public static string client_id = "8edde5f6-b440-4a68-80f9-c56fdd4c6ded";
        public static string client_secret = "f0f1c48d6621f89d75fef83bc855d90a0779cadf187a6a5ee447c16adc3f2417";
        public static string grant_type = "";
        public static string redirect_uri = "http://localhost/UGPNew/Default.aspx";
        public static string AuthorizationCode
        {
            get
            {
                if (HttpContext.Current.Session["AuthorizationCode"] != null)
                    return (string)HttpContext.Current.Session["AuthorizationCode"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["AuthorizationCode"] = value;
            }
        }
    }

    public struct ResponseData
    {


        public static string id_token
        {
            get
            {
                if (HttpContext.Current.Session["id_token"] != null)
                    return (string)HttpContext.Current.Session["id_token"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["id_token"] = value;
            }
        }
        public static string access_token
        {
            get
            {
                if (HttpContext.Current.Session["access_token"] != null)
                    return (string)HttpContext.Current.Session["access_token"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["access_token"] = value;
            }
        }
        public static string refresh_token
        {
            get
            {
                if (HttpContext.Current.Session["refresh_token"] != null)
                    return (string)HttpContext.Current.Session["refresh_token"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["refresh_token"] = value;

            }
        }
        public static string token_type
        {
            get
            {
                if (HttpContext.Current.Session["token_type"] != null)
                    return (string)HttpContext.Current.Session["token_type"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["token_type"] = value;

            }
        }
        public static string expires_in
        {
            get
            {
                if (HttpContext.Current.Session["expires_in"] != null)
                    return (string)HttpContext.Current.Session["expires_in"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["expires_in"] = value;

            }
        }

        public static string UserName
        {
            get
            {


                if (HttpContext.Current.Session["SSO_UserName"] != null)
                    return (string)HttpContext.Current.Session["SSO_UserName"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["SSO_UserName"] = value;

            }
        }


    }
}