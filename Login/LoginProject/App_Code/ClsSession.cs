using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.ServiceModel;
using System.Text;
using System.Web;


namespace LoginProject
{
    public class ClsSession
    {
        /// <summary>
        /// ExpireTime in Minute
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="ExpireTime"></param>
        public static void AddSession(string key, object value,int ExpireTime=2)
        {
            System.Web.HttpContext.Current.Session.Add(key, new SessionClassValue() { Value = value,  Expire = DateTime.Now.AddMinutes(ExpireTime) }) ;
        }

        public static object GetSession(string key,bool Remove=true)
        {
            var tmpValue = (SessionClassValue)System.Web.HttpContext.Current.Session[key];
            if(Remove)
                System.Web.HttpContext.Current.Session.Remove(key);

            if (DateTime.Now > tmpValue.Expire )
            {
                return null;
            }
            else return tmpValue.Value;
        }

        [Serializable]
        public struct SessionClassValue
        {
           public  DateTime Expire { get; set; }
            public object Value { get; set; }
        }
    }
}