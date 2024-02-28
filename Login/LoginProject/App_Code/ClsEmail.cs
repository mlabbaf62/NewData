using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Web;

public class ClsEmail
{
    public static string RegisterEmailTextTemplate = "سامانه شهروند سپاری" + "\r\n\r\n" +
                       "کاربر گرامی {0} عضویت شما با موفقیت در سامانه شهروند سپاری انجام شد." + "\n\n" +
                       "رمز عبور شما :" +
                        "\r\n{1}";


    public static void SendConfirmEmail(EmailInfo pEmailInfo)
    {
        try
        {
            //=================================Fill Body
            string PBodyText = "";
            if (!string.IsNullOrEmpty(pEmailInfo.BodyText))
                PBodyText = pEmailInfo.BodyText;
            else
            {
                using (System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Server.MapPath("..\\EmailTemplate.html")))
                {
                    String line = string.Empty;
                    var tmpText = reader.ReadToEnd();
                    PBodyText = string.Format(tmpText, pEmailInfo.FullName, pEmailInfo.UserName, pEmailInfo.Pass);
                }
            }
            //===============================================
            string Log = "";
            if (pEmailInfo != null)
            {
                string tmpSenderEmail = "";
                string tmpSenderPass = "";

                try
                {
                    tmpSenderEmail = ClsCommon.GetAppConfig<string>("Email");
                    if (string.IsNullOrEmpty(tmpSenderEmail))
                        return;

                    tmpSenderPass = ClsCommon.GetAppConfig<string>("Pass");
                }
                catch { }

                string From = tmpSenderEmail;
                string To = pEmailInfo.To;
                string Subject = pEmailInfo.Subject;

                string body = PBodyText;

                MailMessage newMessage = new MailMessage(From, To, Subject, body);
                newMessage.IsBodyHtml = true;

                SmtpClient client = new SmtpClient("smtp.gmail.com", 587);
                client.Credentials = new System.Net.NetworkCredential(tmpSenderEmail, tmpSenderPass);

                client.EnableSsl = true;
                client.SendAsync(newMessage, null);
                client.SendCompleted += (s, e) =>
                {
                    if (e.Error != null)
                        ErrorLog.WriteLog("Error Send Mail , IdentityCode=" + pEmailInfo.To + "\n" + e.Error);
                };

                if (ClsCommon.DebugMode)
                {
                    Log += "tmpSenderEmail : " + tmpSenderEmail + "\r\n";
                    Log += "tmpSenderPass : " + tmpSenderPass + "\r\n";
                    Log += "To : " + pEmailInfo.To + "\r\n";
                    Log += "Subject : " + Subject + "\r\n";
                    Log += "body : " + body + "\r\n";

                    ErrorLog.WriteLog(Log, "Email");
                }
            }
            else
            {
                ErrorLog.WriteLog("چنین کدی در سیستم وجود ندارد");
            }
        }
        catch (Exception ex)
        {
            ErrorLog.WriteLog(ex);
        }
    }

    public static void SendRecoveryPassEmail(EmailInfo pEmailInfo)
    {
        try
        {
            //=================================Fill Body
            string PBodyText = "";
            if (!string.IsNullOrEmpty(pEmailInfo.BodyText))
                PBodyText = pEmailInfo.BodyText;
            else
            {
                using (System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Server.MapPath("..\\FrmRecoveryPass.html")))
                {
                    String line = string.Empty;
                    var tmpText = reader.ReadToEnd();
                    PBodyText = string.Format(tmpText, pEmailInfo.FullName, pEmailInfo.UserName, pEmailInfo.Pass);
                }
            }
            //===============================================
            string Log = "";
            if (pEmailInfo != null)
            {
                string tmpSenderEmail = "";
                string tmpSenderPass = "";

                try
                {
                    tmpSenderEmail = ClsCommon.GetAppConfig<string>("Email");
                    if (string.IsNullOrEmpty(tmpSenderEmail))
                        return;

                    tmpSenderPass = ClsCommon.GetAppConfig<string>("Pass");
                }
                catch { }

                string From = tmpSenderEmail;
                string To = pEmailInfo.To;
                string Subject = pEmailInfo.Subject;

                string body = PBodyText;

                MailMessage newMessage = new MailMessage(From, To, Subject, body);
                newMessage.IsBodyHtml = true;

                SmtpClient client = new SmtpClient("smtp.gmail.com", 587);
                client.Credentials = new System.Net.NetworkCredential(tmpSenderEmail, tmpSenderPass);

                client.EnableSsl = true;
                client.SendAsync(newMessage, null);
                client.SendCompleted += (s, e) =>
                {
                    if (e.Error != null)
                        ErrorLog.WriteLog("Error Send Mail , IdentityCode=" + pEmailInfo.To + "\n" + e.Error);
                };

                if (ClsCommon.DebugMode)
                {
                    Log += "tmpSenderEmail : " + tmpSenderEmail + "\r\n";
                    Log += "tmpSenderPass : " + tmpSenderPass + "\r\n";
                    Log += "To : " + pEmailInfo.To + "\r\n";
                    Log += "Subject : " + Subject + "\r\n";
                    Log += "body : " + body + "\r\n";

                    ErrorLog.WriteLog(Log, "Email");
                }
            }
            else
            {
                ErrorLog.WriteLog("چنین کدی در سیستم وجود ندارد");
            }
        }
        catch (Exception ex)
        {
            ErrorLog.WriteLog(ex);
        }
    }

}

public class EmailInfo
{
    public string From { get; set; }
    public string To { get; set; }
    public string Subject { get; set; }
    public string BodyText { get; set; }

    public string UserName { get; set; }

    public string FullName { get; set; }

    public string Pass { get; set; }

}

