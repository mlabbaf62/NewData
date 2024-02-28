using dtoDBUGP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;


    public class ClsLog
    {
        #region Log 

        public static string Log
        {
            get
            {
                string Log = "";
                if (System.Web.HttpContext.Current.Session["Log"] != null)
                    Log = System.Web.HttpContext.Current.Session["Log"].ToString();

                return Log;
            }

            set
            {
                System.Web.HttpContext.Current.Session["Log"] = value;
            }
        }
        //public static string Log = "";
        public static void AddLog<T>(T item) where T : class
        {
            if (item != null)
                Log += item.ToString() + "\r\n";
        }
        public static void AddLogEX(Exception ex , string Title=null)
        {
            AddStar(Title);
            Log += ex.Message + "\r\n";

            if (ex.InnerException != null)
                Log += ex.InnerException.Message + "\r\n";

            if (ex.StackTrace != null)
                Log += ex.StackTrace + "\r\n";
            AddStar();
        }

        public static void AddTime(string pText = "")
        {
            Log += pText +"-"+ DateTime.Now + "\r\n";
        }

        public static void AddLine()
        {
            Log += "=====================================================================" + "\r\n";
        }
        public static void AddStar(string Text = "")
        {
            Log += string.Format("{0}{1}{0}", Text, "*********************************************************************") + "\r\n";
        }

        public static string GetStrLogFromClass<T>(T pObject)
        {
            var pLog = "";
            try
            {
                if (pObject != null)
                {
                    pLog += pObject.ToString() + "\r\n";
                    pLog += pObject.GetType().FullName + "-------------------------------\r\n";
                    foreach (var itemp in pObject.GetType().GetProperties().OrderBy(f => f.Name))
                    {
                        try
                        {
                            if (itemp.PropertyType == typeof(string) || itemp.PropertyType == typeof(int) || itemp.PropertyType == typeof(decimal) || itemp.PropertyType == typeof(double) || itemp.PropertyType == typeof(Guid) || itemp.PropertyType == typeof(bool) || itemp.PropertyType == typeof(bool?))
                            {
                                pLog += string.Format("{0} : {1} : {2}\r\n", itemp.Name, itemp.GetValue(pObject, null), itemp.PropertyType.Name);
                            }
                            else if (itemp.PropertyType.Name.Contains("List"))
                            {
                                System.Collections.IList oTheList = itemp.GetValue(pObject, null) as System.Collections.IList;
                                //System.Reflection.PropertyInfo piTheValue = itemp.PropertyType.GetGenericArguments()[0].GetProperty("ErrorTitle");
                                if (oTheList != null && oTheList.Count > 0)
                                {
                                    int index = 0;
                                    foreach (var listItem in oTheList)
                                    {
                                        index++;
                                        pLog += "Index:" + index + "  " + GetStrLogFromClass(listItem);

                                        //if (listItem.GetType().GetProperty("ErrorTitel") != null)
                                        //{
                                        //    var tmpVal = listItem.GetType().GetProperty("ErrorTitel").GetValue(listItem, null);
                                        //    pLog += "\r\nErrorTitle=" + tmpVal;
                                        //}
                                    }
                                }
                            }
                            else if (itemp.PropertyType.BaseType == typeof(object))
                            {
                                var tmpParent = itemp.GetValue(pObject, null);
                                pLog += GetStrLogFromClass(tmpParent);
                            }
                        }
                        catch (Exception ex)
                        {
                            pLog += string.Format("Ex:{0}\r\n", ex.Message);
                            continue;
                        }
                    }
                    pLog += "-------------------------------\r\n";
                    Log += pLog;
                    return pLog;
                }
            }
            catch
            {

            }

            return pLog;
        }

        public static void Clear()
        {
            Log = "";
        }


        #endregion
        public static void InsertLog(dtoDBUGP.LogVisitor pLogVisitor)
        {
            try
            {
                using (srvDBUGP.DbUGPModelDataContext tmpDB = new srvDBUGP.DbUGPModelDataContext())
                {
                    pLogVisitor.VisitDate = ClsCommon.CurrentShamsiDateString;
                    pLogVisitor.VisitTime = ClsCommon.CurrentTimeString;
                    pLogVisitor.IP = GetClientIP();

                    tmpDB.LogVisitors.InsertOnSubmit(pLogVisitor);
                    tmpDB.SubmitChanges();
                }
            }
            catch (Exception ex) { ErrorLog2.WriteLog(ex); }
        }

        public static void InsertLogState(dtoDBUGP.LogState pLogState)
        {
            try
            {
                using (srvDBUGP.DbUGPModelDataContext tmpDB = new srvDBUGP.DbUGPModelDataContext())
                {
                    pLogState.LogDate = ClsCommon.CurrentShamsiDateString;
                    pLogState.LogTime = ClsCommon.CurrentTimeString;

                    tmpDB.LogStates.InsertOnSubmit(pLogState);
                    tmpDB.SubmitChanges();
                }
            }
            catch (Exception ex) { ErrorLog2.WriteLog(ex); }
        }

        private static string GetClientIP()
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

        [DataMember]
        public List<LogVisitor> LogVisitorList = new List<LogVisitor>();

        [DataMember]
        public List<LogState> LogStateList = new List<LogState>();

        [DataMember]
        public int Count { get; set; }

        public List<SrvGetLogVisitorResult> GetLogVisitorGroupByField(string fieldName, string fromDate, string ToDate)
        {
            try
            {
                List<SrvGetLogVisitorResult> res2 = null;

                srvDBUGP.DbUGPModelDataContext srv = new srvDBUGP.DbUGPModelDataContext();
                res2 = srv.SrvGetLogVisitor(fieldName, fromDate, ToDate).ToList();
                srv.Dispose();
                res2 = AnalysLogVisitor(res2);
                srv.Dispose();

                return res2;
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                return null;
            }
        }

        public List<SrvGetLogVisitorResult> AnalysLogVisitor(List<SrvGetLogVisitorResult> LogVisitorList)
        {
            try
            {
                foreach (var item in LogVisitorList)
                {
                    try
                    {
                        if (item.MonthNum != null)
                            item.Month = convertToMonthName(item.MonthNum.ToString());

                        if (item.Time != null)
                        {
                            int t1 = int.Parse(item.Time);
                            int t2 = t1 + 1;
                            string TimeRange = string.Format("{0}-{1}", t1, t2);

                            item.TimeRange = TimeRange;
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }

                return LogVisitorList;
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                throw ex;
            }
        }
        private string convertToMonthName(string monthNum)
        {
            int num = int.Parse(monthNum);
            switch (num)
            {
                case 1: return "فروردین";
                case 2: return "اردیبهشت";
                case 3: return "خرداد";
                case 4: return "تیر";
                case 5: return "مرداد";
                case 6: return "شهریور";
                case 7: return "مهر";
                case 8: return "آبان";
                case 9: return "آذر";
                case 10: return "دی";
                case 11: return "بهمن";
                case 12: return "اسفند";
            }
            return "نامشخص";
        }

        public void GetLogVisitorDetail(string FromDate, string ToDate, int FromPage, int PageSize)
        {
            try
            {
                int from = (FromPage) * PageSize;

                using (var srv = new srvDBUGP.DbUGPModelDataContext())
                {
                    LogVisitorList = srv.SrvGetLogVisitorDetail(FromDate, ToDate, 0, 50).ToList();
                    Count = srv.SrvGetLogVisitorDetailCount(FromDate, ToDate).FirstOrDefault().Count.Value;
                }
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                throw ex;
            }
        }


        #region LogState
        public List<LogState> GetLogStateGroup()
        {
            try
            {
                List<LogState> res = null;

                srvDBUGP.DbUGPModelDataContext srv = new srvDBUGP.DbUGPModelDataContext();
                var res2 = (from ls in srv.LogStates
                            group ls by new { ls.NidAccount, ls.AccountName } into g1
                            select new
                            {
                                NidAccount = g1.Key.NidAccount,
                                AccountName = g1.Key.AccountName,
                                Max = g1.Max(f => f.EumState)
                            }).ToList();


                var res3 = res2.Select(f => new LogState()
                {
                    NidAccount = f.NidAccount,
                    AccountName = f.AccountName,
                    MaxState = f.Max
                }).ToList();

                LogStateList = res3.ToList();

                srv.Dispose();

                return LogStateList.ToList();
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                return null;
            }
        }

        public List<LogState> GetLogStateDetail(Guid pNidAccount)
        {
            try
            {
                using (var srv = new srvDBUGP.DbUGPModelDataContext())
                {
                    LogStateList = srv.LogStates.Where(f => f.NidAccount == pNidAccount).ToList();
                    return LogStateList;
                }
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                return null;
            }
        }

        #endregion
    }
