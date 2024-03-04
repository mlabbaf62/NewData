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


    public ClsCommon()
    {
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

  
    public static T GetAppConfig<T>(string Param)
    {
        try
        {
            var tmpS = ClsCNManagment.GetAppSetting(Param);
            return (T)Convert.ChangeType(tmpS, typeof(T));
        }
        catch (Exception ex)
        {
          
            return default(T);
        }
    }

  
    public static System.ServiceModel.BasicHttpBinding CreateBinding(string Address)
    {
        System.ServiceModel.BasicHttpBinding binding = new System.ServiceModel.BasicHttpBinding();


        binding.TransferMode = System.ServiceModel.TransferMode.StreamedResponse;


        if (Address.ToLower().Contains("https"))
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


}