using System;
using System.Collections.Generic;
using System.Web.Services;

namespace UGP.UI
{
    public partial class UVote : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {

            }
            catch
            {

            }
        }

        [WebMethod]
        public static List<UGPbiz.ClsPoll.Pooling> GetPooling()
        {
            UGPbiz.ClsPoll tmpClsPool = new UGPbiz.ClsPoll();
            tmpClsPool.GetAllPoll();

            return tmpClsPool.PoolingList;
        }

        [WebMethod]
        public static string GetEmployees()
        {
            return "OK-test";
        }
    }
}