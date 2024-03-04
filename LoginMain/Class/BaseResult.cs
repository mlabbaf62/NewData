using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;


public class ClsErrorResult
{
    public ClsErrorResult()
    {
        Requirements = new List<ClsRequirementItem>();
        BizErrors = new List<clsBizError>();
    }

    public List<ClsRequirementItem> Requirements { set; get; }

    public List<clsBizError> BizErrors { set; get; }

    public void AddSystemError(Exception ex)
    {
        var ErrNum = ErrorLog2.WriteLog(ex);
        var ErrKey = ex.Message;
        if (ex.InnerException != null)
            ErrKey += "\r\n" + ex.InnerException.Message;

        var message = String.Format("خطا سیستمی با این شماره اتفاق افتاده است لطفا به راهبر سیستم اطلاع دهید" + "\n{0}", ErrNum.ToString());
        if (ErrKey.Contains("IX_Accounts_NationalCode"))
            message = "کد ملی وارد شده قبلا در سیستم ثبت شده است";
        if (ErrKey.Contains("TimeOut"))
            message = "خطای انقضای زمان";

      

        BizErrors.Add(new clsBizError { ErrorAction = EumErrorAction.Stop, ErrorKey = ErrNum.ToString(), ErrorTitel = message });
    }

    public void AddBizError(Exception ex)
    {
        var ErrNum = ErrorLog.WriteLog(ex);

        var message = ex.Message;
 
        BizErrors.Add(new clsBizError { ErrorAction = EumErrorAction.Stop, ErrorKey = ErrNum.ToString(), ErrorTitel = message });
    }

    public string ReturnValue{ set; get; }
}

public class ClsRequirementItem
{
    public string RequireType { set; get; }

    public string RequireTitel { set; get; }

    public string RequireKey { set; get; }

    public string RequireValue { set; get; }

    public string RequireDescription { set; get; }
}

public class clsBizError
{
    public string ErrorTitel { set; get; }

    public EumErrorAction ErrorAction { set; get; }

    public string ErrorKey { set; get; }
}

public enum EumErrorAction
{
    Stop = 0,
    Warning = 1
}

