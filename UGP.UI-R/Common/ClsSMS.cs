using System;
using System.Collections.Generic;
using System.Linq;
using SrvSecurity;

namespace UGPbiz.Common
{
    public class ClsSMS
    {
        private static string DefaultCode = "";

        //ارسال برای مامور بازدید
  

        //public static void SendConfirmSMS2(string pCode, string pNumber, string NidAccount, string tmpRandomConfirmCode)
        //{
        //    ErrorLog2.WriteLog("type=0\r\nBizCode=" + NidAccount + "\r\n" + "tmpRandomConfirmCode=" + tmpRandomConfirmCode + "\r\nCityName=" + ClsCommon.CityName, "sms");
        //    var srvSMS = ClsProxyHelper.GetSmsService();

        //    var Tmp = new UGPbiz.SrvSms.ClsParameters()
        //    {
        //        AppName = "UGP",
        //        SMSType = "عضویت",
        //        Number = pNumber,

        //        Text = string.Format("کد تاییدیه شما : " + tmpRandomConfirmCode + "\r\n" + "شهرداری " + ClsCommon.CityName),

        //        BizCode = NidAccount,
        //        ScheduleSendDate = UGPbiz.ClsCommon.CurrentShamsiDateString,
        //        UserID = "1",
        //        UserName = "Admin"
        //    };
        //    srvSMS.SendSMS(Tmp);
        //}

        //ارسال بعد از ثبت درخواست پروانه

    }
}
