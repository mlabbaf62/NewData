using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;

/// <summary>
/// Summary description for ClsLog
/// </summary>
public class ClsLog
{
    public static string Log = "";
    public ClsLog()
    {

    }
    //public static void AddLog(string Value)
    //{
    //    Log += Value.GetType().Name + ":" + Value;
    //}

    public static void AddLog<T>(T item) where T : class
    {
        if (item != null)
            Log += item.ToString() + "\r\n";
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
               
            }
        }
        catch
        {

        }
        Log += pLog;
        return pLog;
    }
    public static void Clear()
    {
        Log = "";
    }
}