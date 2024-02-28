using System;
using System.Web.UI;

namespace UGP.UI.UC_Main
{
    public partial class UUserInfoAdmin : System.Web.UI.UserControl
    {
        public string UserID
        {
            get
            {
                if (Session["UserID"] != null)
                    return Session["UserID"].ToString();
                else return "";
            }
            set { Session["UserID"] = value; }
        }
        public string SessionID
        {
            get
            {
                return Session["SessionID"].ToString();
            }
            set { Session["SessionID"] = value; }
        }

        protected void Page_Load(object sender, EventArgs e)
        {

            if (!Page.IsPostBack)
            {

                if (Request.QueryString["Token"] != null)
                {
                    var tmpToken = Request.QueryString["Token"].ToString();
                    var encUrl = SafaCrypto.ClsPassword.UrlCharToSimbole(tmpToken);
                    tmpToken = SafaCrypto.ClsPassword.Decrypt(encUrl, Common.ClsCommon.RequestId);
                    if (tmpToken != null)
                    {
                        var tmpS = tmpToken.Split(new string[] { "###" }, StringSplitOptions.RemoveEmptyEntries);
                        if (tmpS != null && tmpS.Length == 3)
                        {
                            UserID = tmpS[0];
                            SessionID = tmpS[1];
                            ClsAccount.AdminFullName = tmpS[2];

                            ClsAccount.UserInfo = new SrvSecurity.User() { GUID = Guid.Parse(UserID) };
                        }
                    }
                }

                //if (Request.QueryString["UserID"] != null)
                //{
                //    UserID = Request.QueryString["UserID"].ToString();
                //}
                //if (Request.QueryString["FullName"] != null)
                //{
                //    ClsAccount.AdminFullName = Request.QueryString["FullName"].ToString();

                //    ClsAccount.UserInfo = new SrvSecurity.User() { GUID = Guid.Parse(UserID) };
                //}
                CheckUser();
            }
            hfNidUser.Value = (UserID);
        }
        public String LblUsertxt;
        private void CheckUser()
        {
            if (ClsAccount.UserInfo != null)
            {
                if (ClsAccount.UserInfo.GUID != Guid.Empty)
                {
                    tblUserInfo.Visible = true;
                    panel1.Visible = false;
                    LblUserAdmin.Text = ClsAccount.AdminFullName;
                    LblUsertxt = ClsAccount.AdminFullName;
                    hfIsAdminLogin.Value = ClsAccount.UserInfo.GUID.ToString();
                }
            }
        }

        protected void Logout_Click(object sender, EventArgs e)
        {
            try
            {
                new UGPbiz.ClsAccountInfo().LogoutWithSession(ClsAccount.UserInfo.GUID, SessionID);
                ClsAccount.UserInfo = null;
                Response.Redirect("~/Default.aspx");
            }
            catch
            {
                Response.Redirect("~/Default.aspx");
            }
        }
    }
}