using DataAccess;
using System;
using System.Collections.Generic;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.Web;
using System.Xml.Linq;

namespace UGP
{
    public class ClsAccount
    {
        public static bool IsUserLogined()
        {
            
            if (Account_Info == null)
                return false;
            else
                return true;
        }
        public static List<Dto.Account> AccountList
        {
            get; set;
        }
        public static List<Dto.Account> GetAccounts()
        {
            try
            {

                Dto.Entities srv = new Dto.Entities();
                AccountList =  srv.Accounts.ToList();
                
                return AccountList;
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex.Message, "GetAccounts Ex");
                return null;
            }

        }

        public static SrvSecurity.Account_Info CreateAccount(SrvSecurity.Account_Info Account_Info)
        {
            try
            {

                var srvSec = UGPbiz.ClsProxyHelper.GetSecurityService();
                UGPbiz.ClsLog.AddLog(new { srvSec.Endpoint.Address.Uri.AbsoluteUri });




                HttpRequestMessageProperty httpRequestProperty = new HttpRequestMessageProperty();
                httpRequestProperty.Headers.Add(HttpRequestHeader.Cookie, "TrustToken=SecurityTrust1400");
                using (OperationContextScope scope = new OperationContextScope(srvSec.InnerChannel))
                {
                    OperationContext.Current.OutgoingMessageProperties[HttpRequestMessageProperty.Name] = httpRequestProperty;


                    var tmpRes = srvSec.CreateAccount(Account_Info);

                    if (tmpRes != null)
                        UGPbiz.ClsLog.GetStrLogFromClass(tmpRes.ErrorResult);

                    return tmpRes.Account_Info;
                }

            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog("Security CreateAccount Ex: " + ex.Message, "CreateAccountError");
                return null;
            }

        }

        public static SrvSecurity.Account_Info GetAccount_Info(string pNidAccount)
        {
            var tmpAc = new UGPbiz.ClsAccountInfo();
            if (!string.IsNullOrEmpty(pNidAccount))
            {
                tmpAc.GetAccount(Guid.Parse(pNidAccount));
                Account_Info = tmpAc.Account_Info;
            }
            return Account_Info;

            //if (HttpContext.Current.Application[pNidAccount] != null)
            //    return (SrvSecurity.Account_Info)HttpContext.Current.Application[pNidAccount];
            //else return null;


        }
       
        public static SrvSecurity.Account_Info Account_Info
        {
            get
            {
                if (HttpContext.Current.Session != null && HttpContext.Current.Session["Account_Info"] != null)
                    return (SrvSecurity.Account_Info)HttpContext.Current.Session["Account_Info"];
                else return null;
            }
            set
            {
                HttpContext.Current.Session["Account_Info"] = value;
                if (value != null)
                    NidAccount = value.NidAccount;
                else NidAccount = null;
            }
        }


        public static string AdminFullName
        {
            get
            {
                if (HttpContext.Current.Session["AdminFullName"] != null)
                    return HttpContext.Current.Session["AdminFullName"].ToString();
                else return "متقاضی";
            }
            set
            {
                HttpContext.Current.Session["AdminFullName"] = value;
            }
        }
        public static string AccountFullName
        {
            get
            {
                var tmpAccountName = string.Format("{0} ({1} {2})", ClsAccount.Account_Info.AccountName, ClsAccount.Account_Info.OwnerFirstName, ClsAccount.Account_Info.OwnerLastName);
                return tmpAccountName;
            }

        }

        public static Guid? NidAccount
        {
            get
            {
                try
                {
                    return (Guid)HttpContext.Current.Session["NidAccount"];
                }
                catch { return null; }
            }
            set
            {
                HttpContext.Current.Session["NidAccount"] = value;
            }
        }

        public static bool LoginToSecurity(string SessionID)
        {
            try
            {
                var TmpAccount = new UGPbiz.ClsAccountInfo().LoginSecurityAccount(SessionID);
                if (TmpAccount.ErrorResult.BizErrors.Count == 0 && TmpAccount.Account_Info != null &&
                    TmpAccount.Account_Info.NidAccount != Guid.Empty)
                {
                    ClsAccount.Account_Info = TmpAccount.Account_Info;
                    ClsAccount.Account_Info.SessionId = SessionID;
                    return true;
                }
                else
                    return false;
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
                return false;
            }
        }


        public static string GetFullUserName(SrvSecurity.User pUser)
        {
            var tmpFullUserName = string.Format("{0} {1} ({2})", pUser.FirstName, pUser.LastName, pUser.UserName);
            return tmpFullUserName;
        }
    }
}