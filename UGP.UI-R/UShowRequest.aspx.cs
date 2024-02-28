using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Services;
using System.Web.UI.WebControls;
using UGPbiz;

namespace UGP.UI
{
    public partial class UShowRequest : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Common.ClsCommon.CheckUserLogined();

            if (ClsAccount.Account_Info != null && ClsAccount.Account_Info.EumAccountType == 3)
            {
              
                var tmpList = ClsAccount.GetAccounts();

                List<ListItem> li = new List<ListItem>();
                if (tmpList != null)
                {

                    tmpList.ForEach(f => li.Add(new ListItem(f.AccountName, f.NidAccount.ToString())));

                 
                    li.RemoveAll(f => f.Value == ClsAccount.NidAccount.ToString());

                    li.Insert(0, new ListItem(ClsAccount.Account_Info.AccountName, ClsAccount.Account_Info.NidAccount.ToString()));
                    li.Insert(0, new ListItem("همه", Guid.Empty.ToString()));

                    cmbAccounts.Items.AddRange(li.ToArray());
                    cmbAccounts.SelectedIndex = 1;
                    divAccounts.Visible = true;

                    cmbAccounts2.Items.AddRange(li.ToArray());
                    cmbAccounts2.SelectedIndex = 1;
                    divAccounts2.Visible = true;
                   
                }
               
                List<ListItem> li2 = new List<ListItem>();
              
               
               
                tmpW.WorkflowList.ForEach(f => li2.Add(new ListItem(f.WorkflowTitel, f.NidWorkflowDeff.ToString())));
                li2.Insert(0, new ListItem("همه", Guid.Empty.ToString()));

                cmbW.SelectedIndex = 1;
                cmbW.Items.AddRange(li2.ToArray());
                divWorkFlow.Visible = true;

                cmbW2.SelectedIndex = 1;
                cmbW2.Items.AddRange(li2.ToArray());
                divWorkFlow2.Visible = true;
            }
        }

      


    }
}