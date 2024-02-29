using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace UGPbiz.Error
{
    [DataContract()]
    public class ClsErrorResult
    {

        [DataMember]
        public List<ClsRequirementItem> Requirements { set; get; }

        [DataMember]
        public List<clsBizError> BizErrors { set; get; }


        public ClsErrorResult()
        {
            Requirements = new List<ClsRequirementItem>();
            BizErrors = new List<clsBizError>();
        }

        public clsBizError this[string pErrorKey]
        {
            get { return BizErrors.FirstOrDefault(f => f.ErrorKey == pErrorKey); }
        }

        public IEnumerable<clsBizError> this[EumErrorAction pErrorAction]
        {
            get { return BizErrors.Where(f => f.ErrorAction == pErrorAction); }
        }

        public void AddSystemError(Exception ex)
        {
            var ErrNum = ErrorLog2.WriteLog(ex);
            BizErrors.Add(new clsBizError { ErrorAction = EumErrorAction.Stop, ErrorKey = ErrNum.ToString(), ErrorTitel = String.Format("خطا سیستمی با این شماره اتفاق افتاده است لطفا به راهبر سیستم اطلاع دهید" + "\n{0}", ErrNum.ToString()) });
        }

        public void AddBizError(clsBizError pBizError)
        {
            BizErrors.Add(pBizError);
            ErrorLog2.WriteLog(pBizError.ErrorTitel);
        }

        public void AddBizError(IEnumerable<clsBizError> pBizError)
        {
            BizErrors.AddRange(pBizError);
        }

        public static implicit operator bool(ClsErrorResult ClsErrorResult)
        {
            return ClsErrorResult.BizErrors.Any(f => f.ErrorAction == EumErrorAction.Stop);
        }

        public bool HasErrors
        {
            get
            {
                return BizErrors.Count > 0;
            }
        }
    }

    [DataContract()]
    public class ClsRequirementItem
    {
        [DataMember]
        public string RequireType { set; get; }

        [DataMember]
        public string RequireTitel { set; get; }

        [DataMember]
        public string RequireKey { set; get; }

        [DataMember]
        public string RequireValue { set; get; }

        [DataMember]
        public string RequireDescription { set; get; }
    }

    [DataContract]
    public class clsBizError
    {
        [DataMember]
        public string ErrorTitel { set; get; }

        [DataMember]
        public EumErrorAction ErrorAction { set; get; }

        [DataMember]
        public string ErrorKey { set; get; }

        [DataMember]
        public string Status { set; get; }

    }


    public enum EumErrorAction
    {
        Stop = 0,
        Warning = 1
    }
}
