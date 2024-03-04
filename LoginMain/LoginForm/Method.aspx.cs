using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace LoginMain.LoginForm
{
    public partial class Method : System.Web.UI.Page
    {

        [WebMethod]
        public static SrvInquiry.ClsPersonAuthenticationJson CheckInqueryMelliCode(string pNationalCode, string Year, string Month, string Day)
        {
            try
            {

                SrvInquiry.SrvNationalCodeInquiryClient srvN = new SrvInquiry.SrvNationalCodeInquiryClient();
                var tmpRes = srvN.GetPersonInfoJson(pNationalCode, Year, Month, Day);


                return tmpRes;
            }
            catch (Exception ex)
            {
                //ErrorLog.WriteLog(ex);
                return null;
            }
        }


        [WebMethod]
        public static bool CheckShahkar(string pNationalCode, string pMobile)
        {
            Class.ClsShahkar clsSH = new Class.ClsShahkar();

            var res = clsSH.CheckShahkar(pNationalCode, pMobile);
            return res;
        }
        [WebMethod]
        public static Dto.Account GetAccount(Guid NidAccount)
        {
            try
            {
                Dto.Entities srv = new Dto.Entities();

                var tmpA = srv.Accounts.Where(f => f.NidAccount == NidAccount).FirstOrDefault();
                return tmpA;
            }
            catch
            {
                return null;
            }

        }

        [WebMethod]
        public static bool SaveAccount(Dto.Account pAccount)
        {
            try
            {
                Dto.Entities srv = new Dto.Entities();

                var tmpA = srv.Accounts.Where(f => f.NidAccount == pAccount.NidAccount).FirstOrDefault();
                if (tmpA == null)
                {
                    pAccount.NidAccount = Guid.NewGuid();
                    srv.AddToAccounts(pAccount);
                }
                else
                    tmpA.Json = pAccount.Json;

                srv.SaveChanges();

                return true;
            }
            catch
            {
                return false;
            }

        }
    }
}