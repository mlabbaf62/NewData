using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Form_SafaResetPassword : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            if (Request["ResetPassword"] == null)
            {
                LMessage.Text = "اطلاعات نا معتبر می باشد ، لطفا از صفحه اصلی وارد شوید";
                LMessage.ForeColor = System.Drawing.Color.Red;
            }

        }

        btnBack.HRef = "SafaLogin.aspx";

    }



    public static string Base64Decode(string base64EncodedData)
    {
        var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
        return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
    }

    private bool IsPersianChar(string pStr)
    {
        try
        {
            var pStr1 = pStr.Split(' ').LastOrDefault();
            pStr = pStr.Split(' ').FirstOrDefault();


            var myregex = new System.Text.RegularExpressions.Regex(@"^[\u0600-\u06FF]+$");
            if (myregex.IsMatch(pStr) || myregex.IsMatch(pStr1))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        catch
        {
            return false;
        }
    }

    protected void btnSave_Click(object sender, EventArgs e)
    {
        ClsLog.Clear();
        try
        {

            var tmpCode = Request["S"];
            ClsLog.AddLog(new { tmpCode });

            var tmpPassword = Base64Decode(PEnc.Value);
            var tmpRePassword = Base64Decode(txtReNewPasswordEnc.Value);

            if (Validate())
            {
                var SrvSec = ClsCommon.getServiceSecurity();
                ClsLog.AddLog(new { SrvSec.Endpoint.Address.Uri.AbsoluteUri });

                HttpRequestMessageProperty httpRequestProperty = new HttpRequestMessageProperty();
                httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie, "TrustToken=SecurityTrust1400");
                using (OperationContextScope scope = new OperationContextScope(SrvSec.InnerChannel))
                {
                    ClsLog.AddLog("OperationContextScope");

                    OperationContext.Current.OutgoingMessageProperties[HttpRequestMessageProperty.Name] = httpRequestProperty;

                    var tmpUserAccount = SrvSec.ResetAccountPasswordTemp(tmpCode, tmpPassword);
                    ClsLog.AddLog("tmpUserAccount null" + (tmpUserAccount == null).ToString());

                    if (tmpUserAccount.ErrorResult.BizErrors.Count > 0)
                    {
                        var tmpError = tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel;
                        if (IsPersianChar(tmpError))
                            LMessage.Text = tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel;
                        else
                            LMessage.Text = "اطلاعات نامعتبر می باشد . لطفا دوباره تلاش نمایید";

                        ClsLog.AddLog(new { tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel });
                        LMessage.ToolTip = tmpUserAccount.ErrorResult.BizErrors[0].ErrorTitel;
                        LMessage.ForeColor = System.Drawing.Color.Red;
                    }
                    else
                    {
                        ClsLog.AddLog("ok");
                        LMessage.Text = "رمز عبور با موفقیت تغییر یافت";
                        LMessage.ForeColor = System.Drawing.Color.Green;
                        MainTable.Disabled = true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            ClsLog.AddLog(new { ex.Message });
            LMessage.ToolTip = ex.Message;
            LMessage.Text = "اطلاعات نامعتبر می باشد . لطفا دوباره تلاش نمایید";
            LMessage.ForeColor = System.Drawing.Color.Red;
        }
        finally
        {
            ErrorLog.WriteLog(ClsLog.Log, "ChangePass");
        }
    }

    private new bool Validate()
    {


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