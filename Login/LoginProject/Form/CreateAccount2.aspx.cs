using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace LoginProject
{
    public partial class CreateAccount2 : System.Web.UI.Page
    {

        protected void Page_Load(object sender, EventArgs e)
        {
            //var tmpR= Request["r"];
            //if (tmpR != Session.SessionID)
            //    Response.Redirect("~/SafaError.html");
        }


        [WebMethod]
        public static SrvSecurity.Account_Info GetAccountInfo()
        {
            try
            {
                var tmpCode = ClsSession.GetSession("AccountSession",false);
                var srvSecurity = ClsCommon.getServiceSecurity();
               var tmpAccount=  srvSecurity.GetAccountInfo(tmpCode.ToString());
                tmpAccount.Account_Info.AccountPassword = "********";
                return tmpAccount.Account_Info;
            }
            catch (Exception ex)
            {
                ErrorLog.WriteLog(ex);
                return null;
            }
        }
    }
}