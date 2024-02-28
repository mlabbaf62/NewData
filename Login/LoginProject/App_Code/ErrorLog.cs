using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for ErrorLOg
/// </summary>
public class ErrorLog
{
    private static string _LogFolderPath;
    private static long _NumOfLogs;
    private static object _NumOfLogsLock = new object();

     static ErrorLog()
    {
        try
        {
            _LogFolderPath = HttpContext.Current.Server.MapPath("~/log/");
            if (!Directory.Exists(_LogFolderPath))
                Directory.CreateDirectory(_LogFolderPath);
            _NumOfLogs = Directory.GetFiles(_LogFolderPath).Length;
        }
        catch
        {
            _LogFolderPath = System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + "\\log";
            if (!Directory.Exists(_LogFolderPath))
                Directory.CreateDirectory(_LogFolderPath);
            _NumOfLogs = Directory.GetFiles(_LogFolderPath).Length;
        }
    }

    public static string GetStrLogFromClass(object pObject)
    {
        var pLog = "";
        try
        {

            if (pObject != null)
            {

                pLog += pObject.GetType().FullName + "-------------------------------\r\n";
                foreach (var itemp in pObject.GetType().GetProperties().OrderBy(f => f.Name))
                {
                    try
                    {
                        if (itemp.PropertyType == typeof(string) || itemp.PropertyType == typeof(int) || itemp.PropertyType == typeof(decimal) || itemp.PropertyType == typeof(double) || itemp.PropertyType == typeof(Guid))
                        {
                            pLog += string.Format("{0} : {1} : {2}\r\n", itemp.Name, itemp.GetValue(pObject, null), itemp.PropertyType.Name);
                        }
                        else if (itemp.PropertyType.Name.Contains("List"))
                        {
                            System.Collections.IList oTheList = itemp.GetValue(pObject, null) as System.Collections.IList;
                            //System.Reflection.PropertyInfo piTheValue = itemp.PropertyType.GetGenericArguments()[0].GetProperty("ErrorTitle");
                            if (oTheList.Count > 0)
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
                return pLog;
            }
            return pLog;
        }
        catch
        {
            return pLog;
        }
    }

    public static long WriteLog(string message, string FileName = "")
    {
        try
        {
            lock (_NumOfLogsLock)
                ++_NumOfLogs;
            string fileName = String.Format(FileName + _NumOfLogs+ ".log");
            string filePath = _LogFolderPath + "\\" + fileName;
            File.AppendAllText(filePath, message );
            return _NumOfLogs;
        }
        catch(Exception ex)
        {
            return 0;
        }
    }
    public static long WriteLogIfDebug(string message, string pFileName = "")
    {
        try
        {
            if (ClsCommon.DebugMode)
            {
                lock (_NumOfLogsLock)
                    ++_NumOfLogs;

                string fileName = String.Format("{0}-{1}.log", pFileName, _NumOfLogs);
                //string fileName = String.Format("{0}.log", _NumOfLogs);
                string filePath = _LogFolderPath + "\\" + fileName;
                File.AppendAllText(filePath, String.Format("{2}\r\n{0}\r\nStack Trace:\r\n{1}\r\n--------------------------------------------------------------------\r\n", message, new StackTrace().ToString(), DateTime.Now.ToString()));
                return _NumOfLogs;
            }
            else return 0;
        }
        catch
        {
            return -1;
        }
    }
    public static long WriteLog(Exception ex, string pFileName = "")
    {
        try
        {
            string message = ex.Message;
            Exception inner = ex.InnerException;
            while (inner != null)
            {
                message += String.Format("\r\nInner Exception: {0}", inner.Message);
                inner = inner.InnerException;
            }
            return WriteLog(message, pFileName);
        }
        catch
        {
            return 0;
        }
    }
}