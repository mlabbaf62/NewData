using System;
namespace UGPbiz
{

    public class dtoSecurity
    {

        public Guid RequestId { get; set; }

        public string EncryptStr { get; set; }
    }

    public class ClsSecurity
    {
        public static UGPbiz.dtoSecurity GetSignature()
        {
            UGPbiz.dtoSecurity tmpReturn = new UGPbiz.dtoSecurity();

            Guid tmpRequestId = Guid.NewGuid();
            string tmpEncrypt = UGPbiz.RSAClient.Encrypt("SafaSecurity8", tmpRequestId.ToString());

            tmpReturn.RequestId = tmpRequestId;
            tmpReturn.EncryptStr = tmpEncrypt;


            tmpReturn.EncryptStr = tmpReturn.EncryptStr.Replace("=", "EQUAL");
            tmpReturn.EncryptStr = tmpReturn.EncryptStr.Replace("&", "AND");
            tmpReturn.EncryptStr = tmpReturn.EncryptStr.Replace("/", "SLASH");
            tmpReturn.EncryptStr = tmpReturn.EncryptStr.Replace("+", "PLUS");

            return tmpReturn;
        }
    }
}