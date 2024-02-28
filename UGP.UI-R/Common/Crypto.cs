using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace UGP
{
    public static class Crypto
    {
        private const string KEY = "<RSAKeyValue><Modulus>ove/ZBOL81GJ/vsb6jq2nL9vrbrXDO8EsAwlD0bbUyqiEioybOafC9+tjKLnMnLSUCmpzCiGiHn2NFtQobyfW5ZxIrXd6wJQzaUZyNvO1tW+CUOth+JUODDp3LpEncgU+GKMrNtXJvboBvAJVjmUa/QVZbM2n96lXart8fQY2OU=</Modulus><Exponent>AQAB</Exponent><P>0Ap2rWX+1Vxx7nqXJg0pEzhVwOD4vlOFxHnSSAekeqYqfi+n/X9hcjqaZp5u6H+obr1d5TmvvXpVFZiF3VdKuQ==</P><Q>yIlLJ2qxRttPkRYSBBJr6NIBDKkqyklpg24nO636JUE0ovax6qc7+I4cwPCPkgCboN+/VCDwjqtRRKw5r625jQ==</Q><DP>u/dIRODrv0DYW5z9pc6sNwZmTG+3rtbt/JgIyzXEgWBS8lICmUKW+8tBJ8ir8nss5mlIRcy6IRs/dtSo1lSBWQ==</DP><DQ>R8zojLdlu9IAPhlh3/Vcj6LJX2geewkn7zf8ciDLpJUhLIwZjcPM9CSl5Or87LCtCD+0eIHGv75VPbpQeTdBbQ==</DQ><InverseQ>fxWfG4MRvWX3Z4fmodQBI1WrZrw0qvGgPywg+ETS6gW3UKTH2B7QYZzJ1D2Czad/tWDr96aH1VKduUkz+JzWhg==</InverseQ><D>KgEpd6YCIIkXxHz8yPaxMt2071aFL3Q8BRRcSP++cEVA2OW/cYpP3EOe++zRIpOt2bOjbFfVtT+aUgxnUAjKGevxL5NSUagVNKhIG780qQhv5MPGg4sMTuKf9eyOFv5IIoRU13SPQiS3vVyzDALYMyAUULn4FnuwJ5PGyJMA7YE=</D></RSAKeyValue>";
        private const int ENCRYPTION_SIZE = 1024;
        public static string EncryptRSA(string inputString)
        {
            RSACryptoServiceProvider rsaCryptoServiceProvider =
                                          new RSACryptoServiceProvider(ENCRYPTION_SIZE);
            //-------------------------------------------------------------------------
            RSACryptoServiceProvider provider = new RSACryptoServiceProvider(1024);
            string publicKey = provider.ToXmlString(false);
            string privateKey = provider.ToXmlString(true);

            provider.FromXmlString(publicKey);
            byte[] data = Encoding.UTF8.GetBytes("Hi, Here is sample data for encryption -- 30sharp.com");
            byte[] encryptedData = provider.Encrypt(data, true);

            RSACryptoServiceProvider provider2 = new RSACryptoServiceProvider(1024);
            provider2.FromXmlString(privateKey);
            byte[] data2 = provider2.Decrypt(encryptedData, true);

            var ret = Encoding.UTF32.GetString(data2);

            RSACryptoServiceProvider MySigner = new RSACryptoServiceProvider();
            byte[] datas = Encoding.UTF8.GetBytes("Hi, Here is sample data for Signature -- 30sharp.com");
            MySigner.FromXmlString(privateKey);
            byte[] signature = MySigner.SignData(datas, new SHA1CryptoServiceProvider());


            provider.FromXmlString(publicKey);

            bool kk = provider.VerifyData(datas, new SHA1CryptoServiceProvider(), signature);

            //----------------------------------------------------------


            rsaCryptoServiceProvider.FromXmlString(KEY);
            int keySize = ENCRYPTION_SIZE / 8;
            byte[] bytes = Encoding.UTF32.GetBytes(inputString);

            int maxLength = keySize - 42;
            int dataLength = bytes.Length;
            int iterations = dataLength / maxLength;
            StringBuilder stringBuilder = new StringBuilder();
            for (int i = 0; i <= iterations; i++)
            {
                byte[] tempBytes = new byte[
                        (dataLength - maxLength * i > maxLength) ? maxLength :
                                                      dataLength - maxLength * i];
                Buffer.BlockCopy(bytes, maxLength * i, tempBytes, 0,
                                  tempBytes.Length);
                byte[] encryptedBytes = rsaCryptoServiceProvider.Encrypt(tempBytes,
                                                                          true);
                Array.Reverse(encryptedBytes);

                stringBuilder.Append(Convert.ToBase64String(encryptedBytes));
            }
            return stringBuilder.ToString();
        }
        public static string DecryptRSA(string inputString)
        {
            RSACryptoServiceProvider rsaCryptoServiceProvider
                                     = new RSACryptoServiceProvider(ENCRYPTION_SIZE);
            rsaCryptoServiceProvider.FromXmlString(KEY);
            int base64BlockSize = ((ENCRYPTION_SIZE / 8) % 3 != 0) ?
              (((ENCRYPTION_SIZE / 8) / 3) * 4) + 4 : ((ENCRYPTION_SIZE / 8) / 3) * 4;
            int iterations = inputString.Length / base64BlockSize;
            List<byte> arrayList = new List<byte>();
            for (int i = 0; i < iterations; i++)
            {
                byte[] encryptedBytes = Convert.FromBase64String(
                     inputString.Substring(base64BlockSize * i, base64BlockSize));

                Array.Reverse(encryptedBytes);
                arrayList.AddRange(rsaCryptoServiceProvider.Decrypt(
                                    encryptedBytes, true));
            }
            return Encoding.UTF32.GetString(arrayList.ToArray());
        }

        public static string Decrypt(string base64Input, string password, string salt)
        {
            byte[] encryptBytes = Convert.FromBase64String(base64Input);
            byte[] saltBytes = Encoding.UTF8.GetBytes(salt);

            // Our symmetric encryption algorithm
            AesManaged aes = new AesManaged();

            // We're using the PBKDF2 standard for password-based key generation
            Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, saltBytes);

            // Setting our parameters
            aes.BlockSize = aes.LegalBlockSizes[0].MaxSize;
            aes.KeySize = aes.LegalKeySizes[0].MaxSize;

            aes.Key = rfc.GetBytes(aes.KeySize / 8);
            aes.IV = rfc.GetBytes(aes.BlockSize / 8);

            // Now, decryption
            ICryptoTransform decryptTrans = aes.CreateDecryptor();

            // Output stream, can be also a FileStream
            MemoryStream decryptStream = new MemoryStream();
            CryptoStream decryptor = new CryptoStream(decryptStream, decryptTrans, CryptoStreamMode.Write);

            decryptor.Write(encryptBytes, 0, encryptBytes.Length);
            decryptor.Flush();
            decryptor.Close();

            // Showing our decrypted content
            byte[] decryptBytes = decryptStream.ToArray();
            string decryptedString = UTF8Encoding.UTF8.GetString(decryptBytes, 0, decryptBytes.Length);

            return decryptedString;
        }




        public static string Decrypt(string base64Input, string password)
        {
            byte[] encryptBytes = Convert.FromBase64String(base64Input);
            byte[] saltBytes = Encoding.UTF8.GetBytes(password);

            // Our symmetric encryption algorithm
            AesManaged aes = new AesManaged();

            // We're using the PBKDF2 standard for password-based key generation
            Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, saltBytes);

            // Setting our parameters
            aes.BlockSize = aes.LegalBlockSizes[0].MaxSize;
            aes.KeySize = aes.LegalKeySizes[0].MaxSize;

            aes.Key = rfc.GetBytes(aes.KeySize / 8);
            aes.IV = rfc.GetBytes(aes.BlockSize / 8);

            // Now, decryption
            ICryptoTransform decryptTrans = aes.CreateDecryptor();

            // Output stream, can be also a FileStream
            MemoryStream decryptStream = new MemoryStream();
            CryptoStream decryptor = new CryptoStream(decryptStream, decryptTrans, CryptoStreamMode.Write);

            decryptor.Write(encryptBytes, 0, encryptBytes.Length);
            decryptor.Flush();
            decryptor.Close();

            // Showing our decrypted content
            byte[] decryptBytes = decryptStream.ToArray();
            string decryptedString = UTF8Encoding.UTF8.GetString(decryptBytes, 0, decryptBytes.Length);

            return decryptedString;
        }



        public static string Encrypt(string input, string password)
        {
            // Test data
            string data = input;
            byte[] utfdata = UTF8Encoding.UTF8.GetBytes(data);
            byte[] saltBytes = UTF8Encoding.UTF8.GetBytes(password);

            // Our symmetric encryption algorithm
            AesManaged aes = new AesManaged();

            // We're using the PBKDF2 standard for password-based key generation
            Rfc2898DeriveBytes rfc = new Rfc2898DeriveBytes(password, saltBytes);

            // Setting our parameters
            aes.BlockSize = aes.LegalBlockSizes[0].MaxSize;
            aes.KeySize = aes.LegalKeySizes[0].MaxSize;

            aes.Key = rfc.GetBytes(aes.KeySize / 8);
            aes.IV = rfc.GetBytes(aes.BlockSize / 8);

            // Encryption
            ICryptoTransform encryptTransf = aes.CreateEncryptor();

            // Output stream, can be also a FileStream
            MemoryStream encryptStream = new MemoryStream();
            CryptoStream encryptor = new CryptoStream(encryptStream, encryptTransf, CryptoStreamMode.Write);

            encryptor.Write(utfdata, 0, utfdata.Length);
            encryptor.Flush();
            encryptor.Close();

            // Showing our encrypted content
            byte[] encryptBytes = encryptStream.ToArray();

            //string encryptedString = UTF8Encoding.UTF8.GetString(encryptBytes, 0, encryptBytes.Length);
            string encryptedString = Convert.ToBase64String(encryptBytes);

            return encryptedString;
        }

        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

    }
}
