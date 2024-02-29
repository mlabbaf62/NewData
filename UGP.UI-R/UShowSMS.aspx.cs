using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Services;
using System.Web.UI.WebControls;

namespace UGP.UI
{
    public partial class UShowSMS : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Common.ClsCommon.CheckUserLogined();

        }
    }
}