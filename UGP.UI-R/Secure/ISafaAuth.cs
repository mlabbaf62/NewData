using System.ServiceModel;

namespace UGP.UI
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IAuth" in both code and config file together.
    [ServiceContract]
    public interface ISafaAuth
    {
        [OperationContract]
        ReturnResult Login(string username, string password, string customCredential, bool isPersistent);
        [OperationContract]
        bool Logout();
    }
}
