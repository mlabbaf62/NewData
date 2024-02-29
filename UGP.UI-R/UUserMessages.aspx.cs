using System;

namespace UGP.UI
{
    public partial class UUserMessages : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

            //SqlDataSourceMessage.ConnectionString = Common.ClsCommon.G_DbUGPConnectionString;
            var TmpAccountInfo = new UGPbiz.ClsAccountInfo();
            if (ClsAccount.NidAccount != null)
            {

                TmpAccountInfo.NidAccount = ClsAccount.NidAccount.Value;
                TmpAccountInfo.GetAccountMessage();

                RadGrid1.DataSource = TmpAccountInfo.AccountMessageList;

                Common.ClsCommon.CheckUserLogined();
            }

        }
    }
}