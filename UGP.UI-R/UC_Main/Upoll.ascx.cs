using System;

namespace UGP.UI.UC_Main
{
    public partial class Upoll : System.Web.UI.UserControl
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        private string GetUserIP()
        {
            string ipList = Request.ServerVariables["HTTP_X_FORWARDED_FOR"];

            if (!string.IsNullOrEmpty(ipList))
            {
                return ipList.Split(',')[0];
            }

            return Request.ServerVariables["REMOTE_ADDR"];
        }

        protected void SavePoll_Click(object sender, EventArgs e)
        {
            try
            {
                var TmpSelection = RBAli1.Checked ? 1 :
                    RBGood2.Checked ? 2 :
                    RBMiddle3.Checked ? 3 :
                    RBWeak4.Checked ? 4 : 1;
                UGPbiz.ClsPoll.SavePoll((byte)TmpSelection, GetUserIP());
            }
            catch { }
            p1.Visible = false;
            p2.Visible = true;
        }

        protected void Button2_Click(object sender, EventArgs e)
        {
            Response.Redirect("~/WebForm3.aspx");
        }
    }
}