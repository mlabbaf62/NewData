using dtoDBUGP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI.WebControls;


namespace UGP.UI
{
    public partial class FrmParvaneh : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
         
        }


        [WebMethod]
        public static string CheckDuplicateRequest(string pNosaziCode, Guid pNidWorkFlowDeff)
        {
            try
            {
                string Qry = "";
                #region CheckDuplicate
                var srvTask = UGPbiz.ClsProxyHelper.GetTaskService();
                var tmpRes = srvTask.GetWorkflowInstanceByBizCode(pNosaziCode)
                    .Where(f => f.NidWorkflowDeff == pNidWorkFlowDeff && f.BizCode == pNosaziCode);

                if (UGPbiz.ClsCommon.DebugMode)
                {
                    Qry += "pNosaziCode=" + pNosaziCode + "\r\n" + "pNidWorkFlowDeff=" + pNidWorkFlowDeff + "\r\n";
                    Qry += "Res Count=" + tmpRes.Count();
                    tmpRes.ToList().ForEach(f => Qry += "\r\n" + f.NidWorkflowDeff + "     " + f.BizCode + "           " + f.NidWorkItem + "   EumProcStatus=" + f.EumProcStatus);
                    ErrorLog2.WriteLog(Qry, "CheckDuplicateRequest");
                }
                foreach (var itemR in tmpRes)
                {
                    if (itemR.EumProcStatus == 0 || itemR.EumProcStatus == 1 || itemR.EumProcStatus == 2 || itemR.EumProcStatus ==6)
                    {
                        var tmpText = string.Format("برای این کد نوسازی ، درخواستی با شماره {0} قبلا ثبت شده است", itemR.NidWorkItem);
                        return tmpText;
                    }
                    else continue;
                }
                return null;
                #endregion
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                return null;
            }
        }

        

     

        [WebMethod]
        public static string GetUserInfo()
        {
            return ClsAccount.AdminFullName;
        }
       
      



       

        [WebMethod]
        public static bool CheckConfirmCode(string pNumber)
        {
            var tmpCode = ClsSession.GetSession<string>(ClsAccount.NidAccount.ToString());

            var tmpResult = tmpCode != null && tmpCode.Equals(pNumber);
           
            return (tmpResult);
        }

       

        [WebMethod]
        public static List<dtoDBUGP.EngInfo> GetEngInfo(string NidWorkItem)
        {
            using (srvDBUGP.DbUGPModelDataContext tmpDB = new srvDBUGP.DbUGPModelDataContext())
            {
                try
                {
                    var tmpInfos = tmpDB.EngInfos.Where(f => f.NidWorkItem == NidWorkItem).ToList();
                    return tmpInfos;
                }
                catch (Exception ex)
                {
                    ErrorLog2.WriteLog(ex);
                    return null;
                }
            }
        }

      

    }
}