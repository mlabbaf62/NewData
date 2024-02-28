using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Login : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string url = HttpContext.Current.Request.Url.AbsoluteUri;
        if (url.ToLower().Contains("domain"))
        {
            ClsCommon.Domain = Request["Domain"].ToString();
        }
        if (!string.IsNullOrEmpty(hfImg.Value))
        {
            imgFace.Src = "data:image/png;base64," + hfImg.Value;
        }
    }

    private void GotoAddress(string pSessionID, string pFullName)
    {
        var tmpUrlDeffered = ClsCommon.GetDeferedUrl();

        if (string.IsNullOrEmpty(tmpUrlDeffered))
        {
            LMessage.Text = "آدرس دامنه مورد نظر یافت نشد";
        }
        else
        {
            var tmpAddress = string.Format("{0}?UserID={1}&FullName={2}&LoginMode=Sec", tmpUrlDeffered, pSessionID, pFullName);

            if (ClsCommon.GetAppConfig<bool>("DebugMode") == true)
                ErrorLog.WriteLog(tmpAddress);

            Response.Redirect(tmpAddress);
        }
    }

    private static string GotoAddress2(string pUserID, string pSessionID, string pFullName, string Domain = null)
    {
        if (!string.IsNullOrEmpty(Domain))
            ClsCommon.Domain = Domain;

        var tmpUrlDeffered = ClsCommon.GetDeferedUrl();

        if (string.IsNullOrEmpty(tmpUrlDeffered))
        {
            return "";
        }
        else
        {
            var tmpAddress = string.Format("{0}?UserID={1}&S={2}&FullName={3}&LoginMode=Sec", tmpUrlDeffered, pUserID, pSessionID, pFullName);

            if (ClsCommon.GetAppConfig<bool>("DebugMode") == true)
                ErrorLog.WriteLog(tmpAddress);

            return (tmpAddress);
        }
    }

    [WebMethod(EnableSession = true)]
    public static string RecognizeFace(string pFaceStr)
    {
        var SrvSec = ClsCommon.getServiceSecurity();
        return SrvSec.RecognizeFace(pFaceStr);
    }

    [WebMethod]
    public static string DoLogin(string pFaceStr, string UserName, string pSessionID)
    {
        try
        {
            var SrvSec1 = ClsCommon.getServiceSecurity();
            ErrorLog.WriteLog(SrvSec1.Endpoint.Address.Uri.ToString());

            MemoryStream ms = new MemoryStream();

            var tmpImageByte = (byte[])Convert.FromBase64String(pFaceStr);

            var tmpUser = SrvSec1.CheckOtherUserLogin(UserName, pSessionID, tmpImageByte);

            SrvSec1.Close();
            if (tmpUser != null)
            {
                var FullName = string.Format("({0}) {1} {2}", tmpUser.User.UserName, tmpUser.User.FirstName, tmpUser.User.LastName);

                var res = GotoAddress2(tmpUser.User.GUID.ToString(), pSessionID, FullName);
                return res;
            }
            else
            {
                ErrorLog.WriteLog("نام کاربر وجود ندارد");
                return null;
            }
        }
        catch (Exception ex) { ErrorLog.WriteLog(ex.Message); return null; }
    }

    [WebMethod]
    public static string DoAfterLogin(string pUserGuid, string pFullName, string pSessionID, string Domain)
    {
        try
        {
            var res = GotoAddress2(pUserGuid, pSessionID, pFullName, Domain);
            return res;
        }
        catch (Exception ex) { ErrorLog.WriteLog(ex.Message); return null; }
    }

}