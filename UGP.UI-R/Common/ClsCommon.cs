using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace UGPbiz
{
    public class ClsCommon
    {
        #region Properties
        public static string G_DbUGPConnectionString
        {
            get
            {
                return ClsCNManagment.GetConnectionString("DbUGPConnectionString");
            }
        }

        // فقط برای اینکه سرویسی نبود که از کد ارجاع کلید درخواست به دست بیاید اضافه شده
        public static string G_DbEsupInUGPConnectionString
        {
            get
            {
                return ClsCNManagment.GetConnectionString("DbEsupInUGPConnectionString");
            }
        }

        public static string ArchiveRegion
        {
            get
            {
                return ClsCNManagment.GetAppSetting("ArchiveDomainName");
            }
        }

        public static string LayerIds_Current
        {
            get
            {
                return ClsCNManagment.GetAppSetting("LayerIds_Current");
            }
        }

        public static string MapServiceUrl
        {
            get
            {
                return ClsCNManagment.GetAppSetting("MapServiceUrl");
            }
        }


        #endregion
        #region Proxy
      
        public static void SendMail(string pTo, string pSubject, string pBody)
        {
            try
            {
                var srvMail = new SrvEmail.SafaESPServiceClient();

                SrvEmail.ClsEmail newMessage = new SrvEmail.ClsEmail();
                newMessage.EmailTo = new List<SrvEmail.EmailTo>() { new SrvEmail.EmailTo() { To = pTo } };
                newMessage.Email = new SrvEmail.Email()
                {
                    Subject = pSubject,
                    Body = pBody,
                    IsBodyHtml = true,
                    TryToSend = 3
                };
                srvMail.SendEmailAsync(newMessage);
            }
            catch (Exception ex) { ErrorLog2.WriteLog(ex.Message); }
        }

        #endregion

        /// <summary>
        /// Hour : Minute : Second
        /// </summary>
        public static string CurrentTimeString
        {
            get
            {
                string tmpHour = DateTime.Now.Hour.ToString();
                string tmpMinute = DateTime.Now.Minute.ToString();
                string tmpSecond = DateTime.Now.Second.ToString();
                return string.Format((tmpHour.Count() == 2 ? tmpHour : "0" + tmpHour) + ":" + (tmpMinute.Count() == 2 ? tmpMinute : "0" + tmpMinute) + ":" + (tmpSecond.Count() == 2 ? tmpSecond : "0" + tmpSecond));
            }
        }
        /// <summary>
        /// Hour : Minute
        /// </summary>
        public static string CurrentTimeString2
        {
            get
            {
                string tmpHour = DateTime.Now.Hour.ToString();
                string tmpMinute = DateTime.Now.Minute.ToString();
                return string.Format((tmpHour.Count() == 2 ? tmpHour : "0" + tmpHour) + ":" + (tmpMinute.Count() == 2 ? tmpMinute : "0" + tmpMinute));
            }
        }
        public static string CurrentTimeStringAdd(int Hour)
        {

            string tmpHour = DateTime.Now.AddHours(Hour).Hour.ToString();
            string tmpMinute = DateTime.Now.Minute.ToString();
            return string.Format((tmpHour.Count() == 2 ? tmpHour : "0" + tmpHour) + ":" + (tmpMinute.Count() == 2 ? tmpMinute : "0" + tmpMinute));

        }

        public static String CurrentShamsiDateString
        {
            get
            {
                var tmpPersianCalender = new System.Globalization.PersianCalendar();
                String tmpYear = tmpPersianCalender.GetYear(DateTime.Now).ToString();
                String tmpMonth = tmpPersianCalender.GetMonth(DateTime.Now).ToString();
                String tmpDay = tmpPersianCalender.GetDayOfMonth(DateTime.Now).ToString();
                return String.Format(@"{2}/{1}/{0}", tmpDay.Count() == 1 ? "0" + tmpDay : tmpDay, tmpMonth.Count() == 1 ? "0" + tmpMonth : tmpMonth, tmpYear);
            }
        }
        public static String CurrentShamsiDateStringAdd(int pDay = 0)
        {
            DateTime NewDate = DateTime.Now.AddDays(pDay);
            var tmpPersianCalender = new System.Globalization.PersianCalendar();
            String tmpYear = tmpPersianCalender.GetYear(NewDate).ToString();
            String tmpMonth = tmpPersianCalender.GetMonth(NewDate).ToString();
            String tmpDay = tmpPersianCalender.GetDayOfMonth(NewDate).ToString();
            return String.Format(@"{2}/{1}/{0}", tmpDay.Count() == 1 ? "0" + tmpDay : tmpDay, tmpMonth.Count() == 1 ? "0" + tmpMonth : tmpMonth, tmpYear);

        }
        public static DateTime CurrentMiladiDateTime
        {
            get
            {
                return DateTime.Now;
            }
        }

        public static byte[] ReadFully(Stream input)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                input.CopyTo(ms);
                return ms.ToArray();
            }
        }

        //----------------------
        public static string GetInDomain(string pFrom, String pDomain)
        {
            try
            {
                string tmpUrlList = pFrom;

                string[] tmpListURL = System.Text.RegularExpressions.Regex.Split(tmpUrlList, "#" + pDomain + "#");
                string TmpURL = string.Empty;
                if (tmpListURL.Length > 0) TmpURL = tmpListURL[1].ToString();

                return TmpURL;
            }
            catch (Exception ex) { throw ex; }

        }

        public static bool DebugMode
        {
            get
            {
                try
                {
                    var res = false;
                    return bool.TryParse(ClsCNManagment.GetAppSetting("DebugMode"), out res);
                }
                catch { return false; }
            }
        }

        public static string CityName
        {
            get
            {
                try
                {
                    return ClsCNManagment.GetAppSetting("CityName").ToString();
                }
                catch { return "مشهد"; }
            }
        }
        public static string CityTel
        {
            get
            {
                try
                {
                    return ClsCNManagment.GetAppSetting("CityTel").ToString();
                }
                catch { return "1513"; }
            }
        }

        //public static void CompleteConfigForSC(String pDomain)
        //{
        //    try
        //    {
        //        BIZ.SA.ClsConnection.Sara8ConnectionString = ClsCommon.GetInDomain(ClsCommon.Sara8ConnectionString_InDomain, pDomain);
        //        BIZ.SB.ClsConnections.ConnectionStringSB = BIZ.SA.ClsConnection.Sara8ConnectionString;
        //        BIZ.SC.ClsConnection.Sara8ConnectionString = BIZ.SA.ClsConnection.Sara8ConnectionString;

        //        BIZ.SA.ClsConnection.RuleConnectionString = ClsCommon.RuleConnectionString;
        //        BIZ.SC.ClsConnection.RuleConnectionString = BIZ.SA.ClsConnection.RuleConnectionString;

        //        BIZ.SA.ClsConnection.SaraAnalysisConnectionString = ClsCommon.SaraAnalysisConnectionString;
        //        BIZ.SC.ClsConnection.SaraAnalysisConnectionString = BIZ.SA.ClsConnection.SaraAnalysisConnectionString;

        //        BIZ.SA.ClsCommon.GCI_City = int.Parse(ClsCommon.G_City);
        //        BIZ.SC.ClsCommon.GCI_City = BIZ.SA.ClsCommon.GCI_City;

        //        if (BIZ.SC.ClsCommon.GSettings_Map == null)
        //        {
        //            BIZ.SC.ClsCommon.GSettings_Map = new BIZ.SC.ClsSettings_Map() { ImageUpdate = ClsCNManagment.GetAppSetting("ImageUpdate"), MapServiceUrl = ClsCNManagment.GetAppSetting("MapServiceUrl"), GeographyInfoUrl = ClsCNManagment.GetAppSetting("GeographyInfoUrl"), LayerIds_Current = ClsCNManagment.GetAppSetting("LayerIds_Current"), MapImageUrl = ClsCNManagment.GetAppSetting("MapImageUrl"), ImagePath = ClsCNManagment.GetAppSetting("ImagePath"), UserName = "sa", ImageWidth = ClsCNManagment.GetAppSetting("ImageWidth"), ImageHeight = ClsCNManagment.GetAppSetting("ImageHeight"), ImageLayerIds = ClsCNManagment.GetAppSetting("ImageLayerIds"), ImageScale = ClsCNManagment.GetAppSetting("ImageScale"), ImageFillColor = ClsCNManagment.GetAppSetting("ImageFillColor"), ImageBgColor = ClsCNManagment.GetAppSetting("ImageBgColor"), ImageStrokeColor = ClsCNManagment.GetAppSetting("ImageStrokeColor"), MapBottomRightCoordLatSearch = ClsCNManagment.GetAppSetting("BottomRightCoordLatSearch"), MapBottomRightCoordLongSearch = ClsCNManagment.GetAppSetting("BottomRightCoordLongSearch"), MapTopLeftCoordLatSearch = ClsCNManagment.GetAppSetting("TopLeftCoordLatSearch"), MapTopLeftCoordLongSearch = ClsCNManagment.GetAppSetting("TopLeftCoordLongSearch") };
        //        }

        //    }
        //    catch (Exception ex) { throw ex; }
        //}

        //public static Guid GetRevisitAgentWithOutBazdid(string Domain = "1")
        //{
        //    string NidRevisitAgent = "";
        //    try
        //    {
        //        NidRevisitAgent = ClsCNManagment.GetAppSetting("NidRevisitAgentWithOutBazdid");
        //        var T = System.Text.RegularExpressions.Regex.Split(NidRevisitAgent, "#" + Domain + "#");
        //        if (T.Length == 1)
        //            NidRevisitAgent = T[0];
        //        else
        //            NidRevisitAgent = T[1];

        //        return Guid.Parse(NidRevisitAgent);
        //    }
        //    catch
        //    {
        //        return Guid.Empty;
        //    }
        //}
        public static Guid GetRevisitAgent(string Domain = "1")
        {
            string NidRevisitAgent = "";
            try
            {
                NidRevisitAgent = ClsCNManagment.GetAppSetting("NidRevisitAgent");
                var T = System.Text.RegularExpressions.Regex.Split(NidRevisitAgent, "#" + Domain + "#");
                if (T.Length == 1)
                    NidRevisitAgent = T[0];
                else
                    NidRevisitAgent = T[1];

                return Guid.Parse(NidRevisitAgent);
            }
            catch
            {
                return Guid.Empty;
            }
        }
        public static Guid GetRevisitAgentMovafeghatOsoli(string Domain = "1")
        {
            string NidRevisitAgent = "";
            try
            {
                NidRevisitAgent = ClsCNManagment.GetAppSetting("NidRevisitAgent_PrincipalAgreement");
                var T = System.Text.RegularExpressions.Regex.Split(NidRevisitAgent, "#" + Domain + "#");
                if (T.Length == 1)
                    NidRevisitAgent = T[0];
                else
                    NidRevisitAgent = T[1];

                return Guid.Parse(NidRevisitAgent);
            }
            catch
            {
                return Guid.Empty;
            }
        }

        public static string GetRevisitAgentName(string Domain = "1")
        {
            string RevisitAgentName = "";
            try
            {
                RevisitAgentName = ClsCNManagment.GetAppSetting("RevisitAgentName");
                var T = System.Text.RegularExpressions.Regex.Split(RevisitAgentName, "#" + Domain + "#");
                if (T.Length == 1)
                    RevisitAgentName = T[0];
                else
                    RevisitAgentName = T[1];

                return (RevisitAgentName);
            }
            catch
            {
                return "";
            }
        }

        public static Guid GetNidAssignUser(string Domain = "1")
        {
            string NidAssignUser = "";
            try
            {
                NidAssignUser = ClsCNManagment.GetAppSetting("NidAssignUser");
                var T = System.Text.RegularExpressions.Regex.Split(NidAssignUser, "#" + Domain + "#");
                if (T.Length == 1)
                    NidAssignUser = T[0];
                else
                    NidAssignUser = T[1];

                return Guid.Parse(NidAssignUser);
            }
            catch
            {
                return Guid.Empty;
            }
        }
        public static string GetAssignUserName(Guid pNidUserOrGroup)
        {
            var tmpNameOrGroupName = "";
            var srvSec = UGPbiz.ClsProxyHelper.GetSecurityService();
            var tmpGroup = srvSec.GetGroup(pNidUserOrGroup);
            if (tmpGroup != null)
                tmpNameOrGroupName = tmpGroup.Name;

            if (string.IsNullOrEmpty(tmpNameOrGroupName))
            {
                var tmpUser = srvSec.GetUserShort(pNidUserOrGroup).User;
                tmpNameOrGroupName = string.Format("{0} {1} ({2})", tmpUser.FirstName, tmpUser.LastName, tmpUser.UserName);
            }
            srvSec.Close();
            return tmpNameOrGroupName; 
        }

        public static T GetAppConfig<T>(string Param)
        {
            try
            {
                var tmpS = ClsCNManagment.GetAppSetting(Param);
                return (T)Convert.ChangeType(tmpS, typeof(T));
            }
            catch
            {
                return default(T);
            }
        }
    }
}
