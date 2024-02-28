using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
namespace LoginProject
{

    public partial class Form_SafaChangePassword : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                if (Request["ChangePassword"] != null)
                {
                    var tmpCode = ClsSession.GetSession("AccountSession", false);

                    var tmpSessionID = tmpCode.ToString(); ClsCommon.DecryptUrl(Request["ChangePassword"], ClsCommon.RequestId);
                    if (!string.IsNullOrEmpty(tmpSessionID))
                    {
                        //NidAccount = Guid.Parse(tmpSessionID);
                        LoadAccount(tmpSessionID);
                    }
                    else
                    {
                        LMessage.Text = "اطلاعات نا معتبر می باشد ، لطفا از صفحه اصلی وارد شوید";
                        LMessage.ForeColor = System.Drawing.Color.Red;
                    }
                }
            }
            if (Session["UrlReferer"] != null)
            {
                btnBack.HRef = Session["UrlReferer"].ToString();
            }
            else btnBack.HRef = "SafaLogin.aspx";
        }
        public Guid? NidAccount
        {
            get
            {
                return (Guid?)Session["NidAccount"];
            }
            set
            {
                Session["NidAccount"] = value;
            }
        }

        private void LoadAccount(string pSessionID)
        {
            try
            {
                var srvSec = ClsCommon.getServiceSecurity();
                HttpRequestMessageProperty httpRequestProperty = new HttpRequestMessageProperty();
                httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie, "TrustToken=SecurityTrust1400");
                using (OperationContextScope scope = new OperationContextScope(srvSec.InnerChannel))
                {
                    OperationContext.Current.OutgoingMessageProperties[HttpRequestMessageProperty.Name] = httpRequestProperty;

                    var tmpRes = srvSec.GetAccountInfo(pSessionID);
                    if (tmpRes.ErrorResult.BizErrors.Count > 0)
                    {
                        Response.Write("اطلاعات نامعتبر می باشد");
                        this.Visible = false;
                    }
                    else
                    {
                        txtUserName.Text = tmpRes.Account_Info.AccountName;
                        NidAccount = tmpRes.Account_Info.NidAccount;
                    }
                    srvSec.Close();
                }
            }
            catch { }
        }
        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
        protected void btnSave_Click(object sender, EventArgs e)
        {
            try
            {
                var tmpUserName = txtUserName.Text;
                var tmpOldPassword = Base64Decode(txtOldPasswordEnc.Value);
                var tmpPassword = Base64Decode(PEnc.Value);
                var tmpRePassword = Base64Decode(txtReNewPasswordEnc.Value);

                if (tmpPassword == tmpOldPassword)
                {
                    LMessage.Text = "کلمه عبور جدید ،با رمز قبلی نباید شبیه هم باشند";
                    LMessage.ForeColor = System.Drawing.Color.Red;
                    return;
                }
                if (Validate())
                {
                    ErrorLog.WriteLog(NidAccount.Value.ToString(), "nid");

                    var SrvSec = ClsCommon.getServiceSecurity();
                    var tmpUserAccount = SrvSec.ChangeAccountPassword(NidAccount.Value, tmpOldPassword, tmpPassword);
                    if (tmpUserAccount.ErrorResult.BizErrors.Count > 0)
                    {
                        LMessage.Text = tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel;
                        LMessage.ForeColor = System.Drawing.Color.Red;
                    }
                    else
                    {
                        LMessage.Text = "رمز عبور با موفقیت تغییر یافت";
                        LMessage.ForeColor = System.Drawing.Color.Green;
                        MainTable.Disabled = true;
                    }
                }
            }
            catch (Exception ex)
            {
                LMessage.Text = ex.Message;
                LMessage.ForeColor = System.Drawing.Color.Red;
            }
        }

        private new bool Validate()
        {
            if (txtUserName.Text == "")
            {
                LMessage.Text = "نام کاربری را وارد نمایید";
                return false;
            }
            if (txtOldPasswordEnc.Value == "")
            {
                LMessage.Text = "کلمه عبور قبلی را وارد نمایید";
                return false;
            }
            if (PEnc.Value == "")
            {
                LMessage.Text = "کلمه عبور را وارد نمایید";
                return false;
            }
            if (!PEnc.Value.Equals(txtReNewPasswordEnc.Value))
            {
                LMessage.Text = "کلمه عبور و تکرار آن باید شبیه هم باشند";
                return false;
            }
            return true;
        }

    }

}