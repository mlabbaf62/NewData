<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UUserMessages.aspx.cs" Inherits="UGP.UI.UUserMessages" MasterPageFile="~/UGPMaster.Master" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

       <fieldset>
                 <h3>پیام ها</h3>

                 <telerik:RadGrid ID="RadGrid1" runat="server" AllowPaging="True" AllowSorting="True" GroupPanelPosition="Top" Font-Names="Tahoma">
                     <SortingSettings SortedAscToolTip="صعودی" SortedDescToolTip="نزولی" SortToolTip="مرتب سازی" />
<MasterTableView AutoGenerateColumns="False" DataKeyNames="NidMessage">


<CommandItemSettings ExportToPdfText="Export to PDF"></CommandItemSettings>


<RowIndicatorColumn FilterControlAltText="Filter RowIndicator column">
<HeaderStyle Width="20px"></HeaderStyle>
</RowIndicatorColumn>

<ExpandCollapseColumn Visible="True" FilterControlAltText="Filter ExpandColumn column" Created="True">
<HeaderStyle Width="20px"></HeaderStyle>
</ExpandCollapseColumn>

    <Columns>
        <telerik:GridImageColumn FilterControlAltText="Filter column column" ImageHeight="" ImageUrl="Style/images/message.png" ImageWidth="" UniqueName="column">
            <HeaderStyle Width="10px" />
        </telerik:GridImageColumn>
        <telerik:GridBoundColumn DataField="Subject" FilterControlAltText="Filter Subject column"  HeaderText="موضوع" SortExpression="Subject" UniqueName="Subject">
            <HeaderStyle Width="110px" />
        </telerik:GridBoundColumn>
        <telerik:GridBoundColumn DataField="StrDate" FilterControlAltText="Filter StrDate column" HeaderText="تاریخ" SortExpression="StrDate" UniqueName="StrDate">
             <HeaderStyle Width="70px" />
        </telerik:GridBoundColumn>
        <telerik:GridBoundColumn DataField="StrTime" FilterControlAltText="Filter StrTime column" HeaderText="زمان" SortExpression="StrTime" UniqueName="StrTime">
            <HeaderStyle Width="70px" />
        </telerik:GridBoundColumn>
        <telerik:GridBoundColumn DataField="Description" FilterControlAltText="Filter Description column" HeaderText="توضیحات" SortExpression="Description" UniqueName="Description">
        </telerik:GridBoundColumn>
    </Columns>

<EditFormSettings>
<EditColumn FilterControlAltText="Filter EditCommandColumn column"></EditColumn>
</EditFormSettings>

<PagerStyle PageSizeControlType="RadComboBox"></PagerStyle>
</MasterTableView>

<PagerStyle PageSizeControlType="RadComboBox"></PagerStyle>

<FilterMenu EnableImageSprites="False"></FilterMenu>
                     <HeaderStyle Font-Names="Tahoma" />
                     <ItemStyle Font-Names="Tahoma" />
                 </telerik:RadGrid>
             <%--    <asp:SqlDataSource ID="SqlDataSourceMessage" runat="server" SelectCommand="SELECT * FROM [Account_Message] WHERE ([NidAccount] = @NidAccount)">
                     <SelectParameters>
                         <asp:SessionParameter Name="NidAccount" SessionField="NidAccount" Type="Object" />
                     </SelectParameters>
                 </asp:SqlDataSource>--%>


       </fieldset>
</asp:Content>
