
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.Serialization;

namespace UGPbiz
{
    public class ClsAccountInfo
    {
        public ClsAccountInfo()
        {
            ErrorResult = new Error.ClsErrorResult();
        }

        #region Properties
        public UGPbiz.Error.ClsErrorResult ErrorResult { get; set; }

        [DataMember()]
        [Category("Runtime")]
        public SrvSecurity.Account_Info Account_Info { get; set; }
        //public SrvSecurity.Account_Info Account_Info2 { get; set; }

        [DataMember()]
        [Category("Runtime")]
        public List<SrvSecurity.Account_Message> AccountMessageList { get; set; }


        public Guid NidAccount { get; set; }

        #endregion

        #region Save

        private bool CheckNationalCode()
        {
            try
            {
                string value = this.Account_Info.EumAccountType == (byte)ClsEnum.EumAccountType.Hoghoghi ? Account_Info.CEONationalCode : Account_Info.OwnerNationalCode;

                if (value == "0000000000" || value == "1111111111" || value == "2222222222" || value == "3333333333"
                                 || value == "4444444444" || value == "5555555555" || value == "6666666666" || value == "777777777"
                                 || value == "8888888888" || value == "9999999999")
                {

                    return false;
                }
                int intSum = 0, i = 0, intD, intC, intP;

                for (i = 0; i < 9; i++)
                    intSum += int.Parse(value.Substring(i, 1)) * (10 - i);
                intD = intSum % 11;
                intC = 11 - intD;
                intP = int.Parse(value.Substring(9, 1));
                if (((intD == 0 || intD == 1) && intP == intD) || (intD > 1 && intP == intC))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); throw ex; }
        }

        private void CheckValidation()
        {
            try
            {
                ErrorResult = new Error.ClsErrorResult();

                using (var tmpDB = new srvDBUGP.DbUGPModelDataContext())
                {
                    if (!CheckNationalCode())
                    {
                        ErrorResult.AddBizError(new Error.clsBizError()
                        {
                            ErrorAction = Error.EumErrorAction.Stop,
                            ErrorTitel = "کد ملی وارد شده صحیح نمی باشد"
                        });
                    }

                    if (string.IsNullOrWhiteSpace(Account_Info.AccountName) || Account_Info.AccountName.Length < 4)
                    {
                        ErrorResult.AddBizError(new Error.clsBizError()
                        {
                            ErrorAction = Error.EumErrorAction.Stop,
                            ErrorTitel = "نام کاربری وارد شده معتبر نمی باشد"
                        });
                    }

                    string MobileNo = this.Account_Info.EumAccountType == (byte)UGPbiz.ClsEnum.EumAccountType.Hoghoghi ? Account_Info.CEOCellNo : Account_Info.OwnerTell;

                    if (string.IsNullOrWhiteSpace(MobileNo) || !MobileNo.StartsWith("09") || MobileNo.Length != 11)
                    {
                        ErrorResult.AddBizError(new Error.clsBizError()
                        {
                            ErrorAction = Error.EumErrorAction.Stop,
                            ErrorTitel = "تلفن همراه وارد شده صحیح نمی باشد"
                        });
                    }


                    if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
                    {
                        if (Account_Info.EumAccountType == (byte)UGPbiz.ClsEnum.EumAccountType.Hoghoghi)
                        {
                            Account_Info.OwnerBirthDate = string.Empty;
                            Account_Info.OwnerCode = string.Empty;
                            Account_Info.OwnerDegree = 0;
                            Account_Info.OwnerLastName = string.Empty;
                            Account_Info.OwnerFatherName = string.Empty;
                            Account_Info.OwnerIDNO = string.Empty;
                            Account_Info.OwnerFirstName = string.Empty;
                            Account_Info.OwnerNationalCode = string.Empty;
                            Account_Info.OwnerNationality = false;
                            Account_Info.OwnerSex = false;
                            Account_Info.OwnerTell = string.Empty;
                        }
                        else
                        {
                            Account_Info.RequesterRegCity = 0;
                            Account_Info.RequesterRegState = 0;
                            Account_Info.RequestNationalCode = string.Empty;
                            Account_Info.CompanyName = string.Empty;
                            Account_Info.RegNo = string.Empty;
                            Account_Info.RequesterRegCity = 0;
                            Account_Info.RequesterRegCity = 0;
                            Account_Info.CI_LegalPerson = 0;
                            Account_Info.Codes = string.Empty;
                        }
                        Account_Info.StrDate = UGPbiz.ClsCommon.CurrentShamsiDateString;
                        Account_Info.StrTime = UGPbiz.ClsCommon.CurrentTimeString;
                    }
                }
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); throw ex; }
        }

        private void CheckValidationManMail()
        {
            try
            {
                ErrorResult = new Error.ClsErrorResult();

                using (var tmpDB = new srvDBUGP.DbUGPModelDataContext())
                {
                    if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
                    {
                        if (Account_Info.EumAccountType == (byte)UGPbiz.ClsEnum.EumAccountType.Hoghoghi)
                        {
                            Account_Info.OwnerBirthDate = string.Empty;
                            Account_Info.OwnerCode = string.Empty;
                            Account_Info.OwnerDegree = 0;
                            Account_Info.OwnerLastName = string.Empty;
                            Account_Info.OwnerFatherName = string.Empty;
                            Account_Info.OwnerIDNO = string.Empty;
                            Account_Info.OwnerFirstName = string.Empty;
                            Account_Info.OwnerNationalCode = string.Empty;
                            Account_Info.OwnerNationality = false;
                            Account_Info.OwnerSex = false;
                            Account_Info.OwnerTell = string.Empty;
                        }
                        else
                        {
                            Account_Info.RequesterRegCity = 0;
                            Account_Info.RequesterRegState = 0;
                            Account_Info.RequestNationalCode = string.Empty;
                            Account_Info.CompanyName = string.Empty;
                            Account_Info.RegNo = string.Empty;
                            Account_Info.RequesterRegCity = 0;
                            Account_Info.RequesterRegCity = 0;
                            Account_Info.CI_LegalPerson = 0;
                            Account_Info.Codes = string.Empty;
                        }
                        Account_Info.StrDate = UGPbiz.ClsCommon.CurrentShamsiDateString;
                        Account_Info.StrTime = UGPbiz.ClsCommon.CurrentTimeString;
                    }
                }
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); throw ex; }
        }

        //public void Save()
        //{
        //    try
        //    {
        //        using (var srvSec = ClsProxyHelper.GetSecurityService())
        //        {

        //            CheckValidation();

        //            if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
        //            {
        //                if (!ReferenceEquals(Account_Info, null))
        //                {
        //                    SaveAccount_Info();
        //                    if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
        //                    {
        //                        srvSec.SaveAccountMessage(new SrvSecurity.Account_Message()
        //                        {
        //                            Description = string.Format("حساب کاربری شما در حال بررسی وتشخیص هویت می باشد. شماره پیگیری حساب کاربری شما {0} می باشد", Account_Info.AccountNo),
        //                            NidAccount = NidAccount,
        //                            StrDate = UGPbiz.ClsCommon.CurrentShamsiDateString,
        //                            StrTime = UGPbiz.ClsCommon.CurrentTimeString,
        //                            Subject = "حساب کاربری",
        //                        });
        //                        SendSms();
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {

        //        ErrorResult.AddSystemError(ex);
        //        //if (Account_Info != null && Account_Info.NidProcAccount != default(Guid))
        //        //{
        //        //    var tmpSrvTask = ClsProxyHelper.GetTaskService();
        //        //    tmpSrvTask.DeleteProc(Account_Info.NidProcAccount);
        //        //}
        //    }
        //}

        //public void SaveForManMail()
        //{
        //    try
        //    {
        //        var srvSec = ClsProxyHelper.GetSecurityService();
        //        Account_Info = srvSec.GetAccountInfo2(NidAccount).Account_Info;
        //        Account_Info.ConfirmDate = ClsCommon.CurrentShamsiDateString;
        //        Account_Info.EumProvider = 1;//ManMail
        //        Account_Info.RecongnizeState = 1; // تایید کارت ملی 

        //        CheckValidationManMail();

        //        if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
        //        {
        //            if (!ReferenceEquals(Account_Info, null))
        //            {
        //                UpdateAccount_Info();

        //                if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
        //                {
        //                    //CreateTask();

        //                    if (ErrorResult != null && ErrorResult.BizErrors.Where(f => f.ErrorAction == Error.EumErrorAction.Stop).ToList().Count <= 0)
        //                    {
        //                        srvSec.SaveAccountMessage(new SrvSecurity.Account_Message()
        //                        {
        //                            Description = string.Format("حساب کاربری شما در حال بررسی وتشخیص هویت می باشد. شماره پیگیری حساب کاربری شما {0} می باشد", Account_Info.AccountNo),
        //                            NidAccount = NidAccount,
        //                            StrDate = UGPbiz.ClsCommon.CurrentShamsiDateString,
        //                            StrTime = UGPbiz.ClsCommon.CurrentTimeString,
        //                            Subject = "حساب کاربری",
        //                        });

        //                        SendSms();
        //                    }
        //                }
        //            }
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        ErrorResult.AddSystemError(ex);
        //        //if (Account_Info != null && Account_Info.NidProcAccount != default(Guid))
        //        //{
        //        //    var tmpSrvTask = ClsProxyHelper.GetTaskService();
        //        //    tmpSrvTask.DeleteProc(Account_Info.NidProcAccount);
        //        //}
        //    }
        //}

        public void GetAccountMessage()
        {
            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                AccountMessageList = srvSec.GetAccountMessages(NidAccount).Account_MessageList;
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); }
        }
      
     

        #endregion

        #region Load
        public void LoadObj()
        {
            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                Account_Info = srvSec.GetAccountInfo2(NidAccount).Account_Info;
                //using (_DB = new srvDBUGP.DbUGPModelDataContext())
                //{
                //    Account_Info = _DB.Account_Info.FirstOrDefault(f => f.NidAccount == NidAccount);
                //}
            }

            catch (Exception ex)
            {
                ErrorResult.AddSystemError(ex);
            }
        }
        #endregion
        //---------------------------
        #region Login
        public SrvSecurity.Account_Info Login(string pAccountName, string pAccountPassword, out bool IsExistAccountName)
        {
            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                var tmpUser = srvSec.LoginAccount(pAccountName, pAccountPassword, "", "");
                if (tmpUser.Account_Info != null)
                {
                    IsExistAccountName = true;
                }
                else
                    IsExistAccountName = false;

                return tmpUser.Account_Info;

                //using (var tmpDB = new srvDBUGP.DbUGPModelDataContext())
                //{
                //    var TmpResult = tmpDB.Account_Info.FirstOrDefault(f => f.AccountName == pAccountName && f.EumAccessType != (byte)ClsEnum.EumAccessType.Cancellation);
                //    if (TmpResult != null)
                //        IsExistAccountName = true;
                //    return TmpResult != null && TmpResult.AccountPassword == pAccountPassword ? TmpResult : null;
                //}
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public SrvSecurity.ClsAccount LoginSecurityAccount(string pSessionID)
        {
            string Log = "";
            SrvSecurity.ClsAccount tmpClsAccount = new SrvSecurity.ClsAccount();
            tmpClsAccount.ErrorResult = new SrvSecurity.ClsErrorResult() { BizErrors = new List<SrvSecurity.clsBizError>() };
            Log += ("LoginSecurityAccount");
            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                Log += "\r\nsrvSec Url =" + (srvSec.Endpoint.Address.Uri.AbsoluteUri);

                tmpClsAccount = srvSec.GetAccountInfo(pSessionID);
                Log += "\r\ntmpClsAccount is Null=" + (tmpClsAccount == null);
                Log += "\r\ntmpClsAccount.Account_Info is Null=" + (tmpClsAccount.Account_Info == null);
                Log += "\r\ntmpClsAccount AccountName=" + (tmpClsAccount.Account_Info.AccountName);

                ErrorLog2.WriteLogIfDebug(Log, "LoginSecurityAccount");

                return tmpClsAccount;
            }
            catch (Exception ex)
            {
                Log += "EX:" + ex.Message;
               
                tmpClsAccount.ErrorResult.BizErrors.Add(new SrvSecurity.clsBizError() { ErrorTitel = ex.Message });
                return tmpClsAccount;
            }
            finally {
                ErrorLog2.WriteLog(Log, "LoginSecurityAccount");
            }
        }

        public void LogoutWithSession(Guid UserGuid, string pSessionID)
        {

            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                srvSec.LogoutWithSessionAsync("", "", UserGuid, pSessionID);
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
            }
        }

        public void LogoutAccount(string pSessionID)
        {

            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                srvSec.LogoutAccount(pSessionID);
            }
            catch (Exception ex)
            {
                ErrorLog2.WriteLog(ex);
            }
        }

        public void ChangePassword(Guid pNidAccount, string poldpass, string pnewpass)
        {
            try
            {
                string TmpResult = string.Empty;
                using (var tmpDB = ClsProxyHelper.GetSecurityService())
                {
                    var TmpAccount = tmpDB.ChangeAccountPassword(pNidAccount, poldpass, pnewpass);

                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        public void SendSms_InLogin()
        {
            Common.ClsSMS.SendSms_InLogin(Account_Info);
        }

        #endregion

        #region Function

        [Category("DesignFunc")]
        [DisplayName("حساب کاربری بر اساس شماره حساب")]
        public SrvSecurity.Account_Info GetAccount_Info_InAccountNo(long pAccountNo)
        {
            try
            {
                using (var tmpDb = new srvDBUGP.DbUGPModelDataContext())
                {
                    var srvSec = ClsProxyHelper.GetSecurityService();
                    Account_Info = srvSec.GetAccountInfo3(pAccountNo).Account_Info;

                    //Account_Info = tmpDb.Account_Info.Where(f => f.AccountNo == pAccountNo).FirstOrDefault();
                }

                return Account_Info;
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); ErrorLog2.WriteLog(ex); return null; }
        }

        [DataMember()]
        [Category("Runtime")]
        public List<dtoDBUGP.SrvGetAccountListResult> AccountList { get; set; }
        [Category("DesignFunc")]
        [DisplayName("لیست حسابهای کاربری")]
        public List<dtoDBUGP.SrvGetAccountListResult> GetAccountList(string pWhere, int pFromRow, int pToRow)
        {
            try
            {

                using (var tmpDb = new srvDBUGP.DbUGPModelDataContext())
                {
                    AccountList = tmpDb.SrvGetAccountList(pWhere, pFromRow, pToRow).ToList();
                }

                return AccountList;
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); ErrorLog2.WriteLog(ex); return null; }
        }

        [Category("DesignFunc")]
        [DisplayName("فعال کردن یک حساب کاربری")]
        public void ActiveAccount(Guid pNidAccount, Guid pConfirmNidUser, string pConfirmUserName)
        {
            try
            {
                using (var tmpDb = ClsProxyHelper.GetSecurityService())
                {
                    tmpDb.ActiveAccount(pNidAccount, pConfirmNidUser, pConfirmUserName);
                }
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); ErrorLog2.WriteLog(ex); }
        }

        [Category("DesignFunc")]
        [DisplayName("غیر فعال کردن یک حساب کاربری")]
        public void DeActiveAccount(Guid pNidAccount, string pRevokeComments)
        {
            try
            {
                using (var tmpDb = ClsProxyHelper.GetSecurityService())
                {
                    tmpDb.DeActiveAccount(pNidAccount, pRevokeComments);
                }
            }
            catch (Exception ex) { ErrorResult.AddSystemError(ex); ErrorLog2.WriteLog(ex); }
        }

        public void GetAccount(Guid NidAccount)
        {
            try
            {
                var srvSec = ClsProxyHelper.GetSecurityService();
                Account_Info = srvSec.GetAccountInfo2(NidAccount).Account_Info;
                //using (_DB = new srvDBUGP.DbUGPModelDataContext())
                //{
                //    Account_Info = _DB.Account_Info.FirstOrDefault(f => f.NidAccount == NidAccount);
                //}
            }

            catch (Exception ex)
            {
                ErrorResult.AddSystemError(ex);
            }
        }
        /// <summary>
        /// Get And Login  For SSO
        /// </summary>
        /// <param name="AccountName"></param>
        /// <param name="pSessionId"></param>
        public void GetAccount(string AccountName, string pSessionId)
        {
            try
            {
                //ChangeFor Zanjan
                var srvSec = ClsProxyHelper.GetSecurityService();
                ClsLog.AddLog(new { srvSec.Endpoint.Address.Uri.AbsoluteUri });

                var tmpA = srvSec.GetAccountInfo(pSessionId);

                ClsLog.AddLog("srvSec.GetAccountInfo");

                Account_Info = tmpA.Account_Info;
                ClsLog.AddLog("Account_Info is null" + (Account_Info==null));

                //ChangeFor Authin
                //var srvSec = ClsProxyHelper.GetSecurityService();
                //var tmpA = srvSec.GetAccountByName(AccountName);

                //Account_Info = tmpA.Account_Info;
                //if (Account_Info != null)
                //    srvSec.AddAccountLog(new SrvSecurity.AccountLog()
                //    {
                //        AccountName = Account_Info.AccountName,
                //        NidAccount = Account_Info.NidAccount,
                //        SessionID = pSessionId,
                //        ApplicationName = "UGP",
                //        LoginDate = ClsCommon.CurrentShamsiDateString,
                //        LoginTime = ClsCommon.CurrentTimeString,
                //        LoginProvider = "SSOAuthin"
                //    });
            }

            catch (Exception ex)
            {
                ClsLog.AddLog("srvSec.GetAccountInfo EX: " + ex.Message);
                ErrorResult.AddSystemError(ex);
            }
        }
        #endregion
    }
}