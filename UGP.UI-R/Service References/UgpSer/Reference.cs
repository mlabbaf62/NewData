﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace UGP.UI.UgpSer {
    
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    [System.ServiceModel.ServiceContractAttribute(ConfigurationName="UgpSer.IUgpService")]
    public interface IUgpService {
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/IUgpService/DoWork", ReplyAction="http://tempuri.org/IUgpService/DoWorkResponse")]
        string DoWork();
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/IUgpService/DoWork", ReplyAction="http://tempuri.org/IUgpService/DoWorkResponse")]
        System.Threading.Tasks.Task<string> DoWorkAsync();
    }
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    public interface IUgpServiceChannel : UGP.UI.UgpSer.IUgpService, System.ServiceModel.IClientChannel {
    }
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    public partial class UgpServiceClient : System.ServiceModel.ClientBase<UGP.UI.UgpSer.IUgpService>, UGP.UI.UgpSer.IUgpService {
        
        public UgpServiceClient() {
        }
        
        public UgpServiceClient(string endpointConfigurationName) : 
                base(endpointConfigurationName) {
        }
        
        public UgpServiceClient(string endpointConfigurationName, string remoteAddress) : 
                base(endpointConfigurationName, remoteAddress) {
        }
        
        public UgpServiceClient(string endpointConfigurationName, System.ServiceModel.EndpointAddress remoteAddress) : 
                base(endpointConfigurationName, remoteAddress) {
        }
        
        public UgpServiceClient(System.ServiceModel.Channels.Binding binding, System.ServiceModel.EndpointAddress remoteAddress) : 
                base(binding, remoteAddress) {
        }
        
        public string DoWork() {
            return base.Channel.DoWork();
        }
        
        public System.Threading.Tasks.Task<string> DoWorkAsync() {
            return base.Channel.DoWorkAsync();
        }
    }
}
