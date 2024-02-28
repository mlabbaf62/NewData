using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;

namespace UGP.UI
{
    public partial class UGPMaster : System.Web.UI.MasterPage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            try
            {
                if (ClsAccount.Account_Info == null)
                {
                    if ((Request.QueryString["RequestId"] != null || Request.QueryString["PaymentResultKey"]!=null) && Request.QueryString["S"] != null)
                    {
                        var tmpSessionID = Request.QueryString["S"];
                        tmpSessionID = Crypto.Base64Decode(tmpSessionID);
                        tmpSessionID = tmpSessionID.Replace("Lsppp", "");
                        if (!ClsAccount.IsUserLogined() && !string.IsNullOrEmpty(tmpSessionID))
                        {
                            ClsAccount.LoginToSecurity(tmpSessionID);
                        }
                    }
                    //else
                    //Response.Redirect(".");
                }

                if (Request["NidProc"] != null)
                {
                    try
                    {
                        //UGPbiz.ClsRequestInfo cr = new UGPbiz.ClsRequestInfo();
                        //var tmpReq = cr.GetRequest(Guid.Parse(Request["NidProc"]));
                        //UGPbiz.ClsWorkFlow cw = new UGPbiz.ClsWorkFlow();
                        //var tmpW = cw.GetWorkFlow(tmpReq.NidWorkflowDeff.Value);
                        //if (tmpW.PageName != null)
                        //{
                        //    var tmpPage = System.IO.Path.GetFileName(Page.AppRelativeVirtualPath);
                        //    tmpPage = tmpPage.Replace("~/", "");
                        //    if (tmpW.PageName.ToLower() != tmpPage.ToLower())
                        //        Response.Redirect(".");
                        //}
                    }
                    catch { }
                }
            }

            catch { }
        //    var tt = Page.ResolveUrl("~/Config/Images/Armw-b.png");
          //  var yy = HttpRuntime.AppDomainAppVirtualPath.TrimEnd('/') + "/Images/logo.png";


        }

        public Dictionary<int, string> dayDIC = new Dictionary<int, string>();
        public Dictionary<int, string> MonthDIC = new Dictionary<int, string>();

        public void GetDateTime()
        {
            dayDIC.Add(0, "یکشنبه");
            dayDIC.Add(1, "دوشنبه");
            dayDIC.Add(2, "سه شنبه");
            dayDIC.Add(3, "چهار شنبه");
            dayDIC.Add(4, "پنجشنبه");
            dayDIC.Add(5, "جمعه");
            dayDIC.Add(6, "شنبه");

            MonthDIC.Add(1, "فروردین");
            MonthDIC.Add(2, "اردیبهشت");
            MonthDIC.Add(3, "خرداد");
            MonthDIC.Add(4, "تیر");
            MonthDIC.Add(5, "مرداد");
            MonthDIC.Add(6, "شهریور");
            MonthDIC.Add(7, "مهر");
            MonthDIC.Add(8, "آبان");
            MonthDIC.Add(9, "آذر");
            MonthDIC.Add(10, "دی");
            MonthDIC.Add(11, "بهمن");
            MonthDIC.Add(12, "اسفند");

            System.Globalization.PersianCalendar pc = new System.Globalization.PersianCalendar();
            var yyyy = pc.GetYear(DateTime.Now);
            var mm = pc.GetMonth(DateTime.Now);
            var dd = pc.GetDayOfMonth(DateTime.Now);
            var dw = pc.GetDayOfWeek(DateTime.Now);

            var PDate = string.Format(" {0} {1} {2} {3}", dayDIC[(int)dw], dd, MonthDIC[mm], yyyy);
            //var PDate = string.Format(" {0}/{1}/{2} ", yyyy, mm, dd);
            string CurrentTime = DateTime.Now.ToString("HH:mm");//("hh:mm:ttt")

            //lblDate.Text = PDate;
        }
        protected void Logout_Click(object sender, EventArgs e)
        {
            try
            {
                ClsAccount.Account_Info = null;
                Response.Redirect("~/Default.aspx");
            }
            catch
            {
                Response.Redirect("~/Default.aspx");
            }
        }


        protected string GetJavaScriptCode()
        {
            string xmlFilePath = System.Web.HttpContext.Current.Server.MapPath("Config/Config.js");

            // خواندن متن فایل XML
            string xmlContent = File.ReadAllText(xmlFilePath);

            return xmlContent;
            //// کلید برای رمزنگاری و رمزگشایی
            //string key = "SafaUGPMenu12345"; // کلید خود را قرار دهید


            //string originalString = xmlContent;
            //byte[] bytes = System.Text.Encoding.UTF8.GetBytes(originalString);

            //// Shift operation in C#
            //byte[] shiftedBytes = ShiftBytes(bytes, 0);

            //// Print shifted bytes
            //Console.WriteLine("Shifted Bytes in C#: " + BitConverter.ToString(shiftedBytes).Replace("-", ""));

            //// Convert shifted bytes back to string in JavaScript
            //string jsCompatibleString = BitConverter.ToString(shiftedBytes).Replace("-", "");
            //Console.WriteLine("JavaScript Compatible String: " + jsCompatibleString);




            string jsCode = "var test = \"test677\";";
            return jsCode;
        }

    }
}