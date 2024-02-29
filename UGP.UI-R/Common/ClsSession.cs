using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Caching;
using System.Security.Cryptography;
using System.ServiceModel;
using System.Text;
using System.Web;


namespace UGP.UI
{
    [Serializable]
    public class ClsSession
    {
        /// <summary>
        /// ExpireTime in Minute
        /// </summary>
        /// <param name="key"></param>
        /// <param name="value"></param>
        /// <param name="ExpireTime"></param>
        public static void AddSession(string key, object value, int ExpireTime = 2)
        {
            System.Web.HttpContext.Current.Session.Add(key, new SessionClassValue() { Value = value, Expire = DateTime.Now.AddMinutes(ExpireTime) });
        }

        public static object GetSession<T>(string key, bool Remove = true)
        {
            try
            {
                var tmpValue = (SessionClassValue)System.Web.HttpContext.Current.Session[key];
                if (Remove)
                    System.Web.HttpContext.Current.Session.Remove(key);

                if (DateTime.Now > tmpValue.Expire)
                {
                    return null;
                }
                else return tmpValue.Value;
            }
            catch { return default(T); }
        }
        public static void ExpireSession(string key)
        {
            try
            {
                var tmpValue = (SessionClassValue)System.Web.HttpContext.Current.Session[key];
                tmpValue.Expire = DateTime.Now; 
            }
            catch { }
        }

        private static MemoryCache cache = new MemoryCache("Session", null);
        public static void AddCache(string key, object value, int ExpireTime = 10)
        {
            cache.Add(
                     key,
                    value,
                     new CacheItemPolicy
                     {
                         SlidingExpiration = new TimeSpan(0, ExpireTime, 0) // 1 minute
                     });
        }

        public static T GetCache<T>(string key, bool Remove = true)
        {
            try
            {
                var item = (T)cache[key];
                if (Remove)
                    cache.Remove(key);

                return item;
            }
            catch (Exception ex) { return default(T); }
        }
        [Serializable]
        public struct SessionClassValue
        {
            public DateTime Expire { get; set; }
            public object Value { get; set; }
        }
    }
}