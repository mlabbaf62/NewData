﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace LoginMain.SrvInquiry {
    using System.Runtime.Serialization;
    using System;
    
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Runtime.Serialization", "4.0.0.0")]
    [System.Runtime.Serialization.DataContractAttribute(Name="ClsPersonAuthenticationJson", Namespace="http://schemas.datacontract.org/2004/07/SrvNationalCodeInquiry")]
    [System.SerializableAttribute()]
    public partial class ClsPersonAuthenticationJson : object, System.Runtime.Serialization.IExtensibleDataObject, System.ComponentModel.INotifyPropertyChanged {
        
        [System.NonSerializedAttribute()]
        private System.Runtime.Serialization.ExtensionDataObject extensionDataField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private LoginMain.SrvInquiry.ClsErrorResult ErrorResultField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private LoginMain.SrvInquiry.clsPersonInfoJson PersonInfoJsonField;
        
        [global::System.ComponentModel.BrowsableAttribute(false)]
        public System.Runtime.Serialization.ExtensionDataObject ExtensionData {
            get {
                return this.extensionDataField;
            }
            set {
                this.extensionDataField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public LoginMain.SrvInquiry.ClsErrorResult ErrorResult {
            get {
                return this.ErrorResultField;
            }
            set {
                if ((object.ReferenceEquals(this.ErrorResultField, value) != true)) {
                    this.ErrorResultField = value;
                    this.RaisePropertyChanged("ErrorResult");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public LoginMain.SrvInquiry.clsPersonInfoJson PersonInfoJson {
            get {
                return this.PersonInfoJsonField;
            }
            set {
                if ((object.ReferenceEquals(this.PersonInfoJsonField, value) != true)) {
                    this.PersonInfoJsonField = value;
                    this.RaisePropertyChanged("PersonInfoJson");
                }
            }
        }
        
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
        
        protected void RaisePropertyChanged(string propertyName) {
            System.ComponentModel.PropertyChangedEventHandler propertyChanged = this.PropertyChanged;
            if ((propertyChanged != null)) {
                propertyChanged(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
            }
        }
    }
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Runtime.Serialization", "4.0.0.0")]
    [System.Runtime.Serialization.DataContractAttribute(Name="ClsErrorResult", Namespace="http://schemas.datacontract.org/2004/07/SrvNationalCodeInquiry")]
    [System.SerializableAttribute()]
    public partial class ClsErrorResult : object, System.Runtime.Serialization.IExtensibleDataObject, System.ComponentModel.INotifyPropertyChanged {
        
        [System.NonSerializedAttribute()]
        private System.Runtime.Serialization.ExtensionDataObject extensionDataField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private LoginMain.SrvInquiry.clsBizError[] BizErrorsField;
        
        [global::System.ComponentModel.BrowsableAttribute(false)]
        public System.Runtime.Serialization.ExtensionDataObject ExtensionData {
            get {
                return this.extensionDataField;
            }
            set {
                this.extensionDataField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public LoginMain.SrvInquiry.clsBizError[] BizErrors {
            get {
                return this.BizErrorsField;
            }
            set {
                if ((object.ReferenceEquals(this.BizErrorsField, value) != true)) {
                    this.BizErrorsField = value;
                    this.RaisePropertyChanged("BizErrors");
                }
            }
        }
        
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
        
        protected void RaisePropertyChanged(string propertyName) {
            System.ComponentModel.PropertyChangedEventHandler propertyChanged = this.PropertyChanged;
            if ((propertyChanged != null)) {
                propertyChanged(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
            }
        }
    }
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Runtime.Serialization", "4.0.0.0")]
    [System.Runtime.Serialization.DataContractAttribute(Name="clsPersonInfoJson", Namespace="http://schemas.datacontract.org/2004/07/SrvNationalCodeInquiry")]
    [System.SerializableAttribute()]
    public partial class clsPersonInfoJson : object, System.Runtime.Serialization.IExtensibleDataObject, System.ComponentModel.INotifyPropertyChanged {
        
        [System.NonSerializedAttribute()]
        private System.Runtime.Serialization.ExtensionDataObject extensionDataField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string birthDateField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string bookNoField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string bookRowField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string deathStatusField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string familyField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string fatherNameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string genderField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string messageField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string nameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ninField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string officeCodeField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string officeNameField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string shenasnameNoField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string shenasnameSeriField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string shenasnameSerialField;
        
        [global::System.ComponentModel.BrowsableAttribute(false)]
        public System.Runtime.Serialization.ExtensionDataObject ExtensionData {
            get {
                return this.extensionDataField;
            }
            set {
                this.extensionDataField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string birthDate {
            get {
                return this.birthDateField;
            }
            set {
                if ((object.ReferenceEquals(this.birthDateField, value) != true)) {
                    this.birthDateField = value;
                    this.RaisePropertyChanged("birthDate");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string bookNo {
            get {
                return this.bookNoField;
            }
            set {
                if ((object.ReferenceEquals(this.bookNoField, value) != true)) {
                    this.bookNoField = value;
                    this.RaisePropertyChanged("bookNo");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string bookRow {
            get {
                return this.bookRowField;
            }
            set {
                if ((object.ReferenceEquals(this.bookRowField, value) != true)) {
                    this.bookRowField = value;
                    this.RaisePropertyChanged("bookRow");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string deathStatus {
            get {
                return this.deathStatusField;
            }
            set {
                if ((object.ReferenceEquals(this.deathStatusField, value) != true)) {
                    this.deathStatusField = value;
                    this.RaisePropertyChanged("deathStatus");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string family {
            get {
                return this.familyField;
            }
            set {
                if ((object.ReferenceEquals(this.familyField, value) != true)) {
                    this.familyField = value;
                    this.RaisePropertyChanged("family");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string fatherName {
            get {
                return this.fatherNameField;
            }
            set {
                if ((object.ReferenceEquals(this.fatherNameField, value) != true)) {
                    this.fatherNameField = value;
                    this.RaisePropertyChanged("fatherName");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string gender {
            get {
                return this.genderField;
            }
            set {
                if ((object.ReferenceEquals(this.genderField, value) != true)) {
                    this.genderField = value;
                    this.RaisePropertyChanged("gender");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string message {
            get {
                return this.messageField;
            }
            set {
                if ((object.ReferenceEquals(this.messageField, value) != true)) {
                    this.messageField = value;
                    this.RaisePropertyChanged("message");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string name {
            get {
                return this.nameField;
            }
            set {
                if ((object.ReferenceEquals(this.nameField, value) != true)) {
                    this.nameField = value;
                    this.RaisePropertyChanged("name");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string nin {
            get {
                return this.ninField;
            }
            set {
                if ((object.ReferenceEquals(this.ninField, value) != true)) {
                    this.ninField = value;
                    this.RaisePropertyChanged("nin");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string officeCode {
            get {
                return this.officeCodeField;
            }
            set {
                if ((object.ReferenceEquals(this.officeCodeField, value) != true)) {
                    this.officeCodeField = value;
                    this.RaisePropertyChanged("officeCode");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string officeName {
            get {
                return this.officeNameField;
            }
            set {
                if ((object.ReferenceEquals(this.officeNameField, value) != true)) {
                    this.officeNameField = value;
                    this.RaisePropertyChanged("officeName");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string shenasnameNo {
            get {
                return this.shenasnameNoField;
            }
            set {
                if ((object.ReferenceEquals(this.shenasnameNoField, value) != true)) {
                    this.shenasnameNoField = value;
                    this.RaisePropertyChanged("shenasnameNo");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string shenasnameSeri {
            get {
                return this.shenasnameSeriField;
            }
            set {
                if ((object.ReferenceEquals(this.shenasnameSeriField, value) != true)) {
                    this.shenasnameSeriField = value;
                    this.RaisePropertyChanged("shenasnameSeri");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string shenasnameSerial {
            get {
                return this.shenasnameSerialField;
            }
            set {
                if ((object.ReferenceEquals(this.shenasnameSerialField, value) != true)) {
                    this.shenasnameSerialField = value;
                    this.RaisePropertyChanged("shenasnameSerial");
                }
            }
        }
        
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
        
        protected void RaisePropertyChanged(string propertyName) {
            System.ComponentModel.PropertyChangedEventHandler propertyChanged = this.PropertyChanged;
            if ((propertyChanged != null)) {
                propertyChanged(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
            }
        }
    }
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.Runtime.Serialization", "4.0.0.0")]
    [System.Runtime.Serialization.DataContractAttribute(Name="clsBizError", Namespace="http://schemas.datacontract.org/2004/07/SrvNationalCodeInquiry")]
    [System.SerializableAttribute()]
    public partial class clsBizError : object, System.Runtime.Serialization.IExtensibleDataObject, System.ComponentModel.INotifyPropertyChanged {
        
        [System.NonSerializedAttribute()]
        private System.Runtime.Serialization.ExtensionDataObject extensionDataField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ErrorKeyField;
        
        [System.Runtime.Serialization.OptionalFieldAttribute()]
        private string ErrorTitelField;
        
        [global::System.ComponentModel.BrowsableAttribute(false)]
        public System.Runtime.Serialization.ExtensionDataObject ExtensionData {
            get {
                return this.extensionDataField;
            }
            set {
                this.extensionDataField = value;
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string ErrorKey {
            get {
                return this.ErrorKeyField;
            }
            set {
                if ((object.ReferenceEquals(this.ErrorKeyField, value) != true)) {
                    this.ErrorKeyField = value;
                    this.RaisePropertyChanged("ErrorKey");
                }
            }
        }
        
        [System.Runtime.Serialization.DataMemberAttribute()]
        public string ErrorTitel {
            get {
                return this.ErrorTitelField;
            }
            set {
                if ((object.ReferenceEquals(this.ErrorTitelField, value) != true)) {
                    this.ErrorTitelField = value;
                    this.RaisePropertyChanged("ErrorTitel");
                }
            }
        }
        
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
        
        protected void RaisePropertyChanged(string propertyName) {
            System.ComponentModel.PropertyChangedEventHandler propertyChanged = this.PropertyChanged;
            if ((propertyChanged != null)) {
                propertyChanged(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
            }
        }
    }
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    [System.ServiceModel.ServiceContractAttribute(ConfigurationName="SrvInquiry.ISrvNationalCodeInquiry")]
    public interface ISrvNationalCodeInquiry {
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/ISrvNationalCodeInquiry/GetPersonInfoJson", ReplyAction="http://tempuri.org/ISrvNationalCodeInquiry/GetPersonInfoJsonResponse")]
        LoginMain.SrvInquiry.ClsPersonAuthenticationJson GetPersonInfoJson(string pNationalCode, string pBirthDate_Year, string pBirthDate_Month, string pBirthDate_Day);
        
        [System.ServiceModel.OperationContractAttribute(Action="http://tempuri.org/ISrvNationalCodeInquiry/GetPersonInfoJson", ReplyAction="http://tempuri.org/ISrvNationalCodeInquiry/GetPersonInfoJsonResponse")]
        System.Threading.Tasks.Task<LoginMain.SrvInquiry.ClsPersonAuthenticationJson> GetPersonInfoJsonAsync(string pNationalCode, string pBirthDate_Year, string pBirthDate_Month, string pBirthDate_Day);
    }
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    public interface ISrvNationalCodeInquiryChannel : LoginMain.SrvInquiry.ISrvNationalCodeInquiry, System.ServiceModel.IClientChannel {
    }
    
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
    public partial class SrvNationalCodeInquiryClient : System.ServiceModel.ClientBase<LoginMain.SrvInquiry.ISrvNationalCodeInquiry>, LoginMain.SrvInquiry.ISrvNationalCodeInquiry {
        
        public SrvNationalCodeInquiryClient() {
        }
        
        public SrvNationalCodeInquiryClient(string endpointConfigurationName) : 
                base(endpointConfigurationName) {
        }
        
        public SrvNationalCodeInquiryClient(string endpointConfigurationName, string remoteAddress) : 
                base(endpointConfigurationName, remoteAddress) {
        }
        
        public SrvNationalCodeInquiryClient(string endpointConfigurationName, System.ServiceModel.EndpointAddress remoteAddress) : 
                base(endpointConfigurationName, remoteAddress) {
        }
        
        public SrvNationalCodeInquiryClient(System.ServiceModel.Channels.Binding binding, System.ServiceModel.EndpointAddress remoteAddress) : 
                base(binding, remoteAddress) {
        }
        
        public LoginMain.SrvInquiry.ClsPersonAuthenticationJson GetPersonInfoJson(string pNationalCode, string pBirthDate_Year, string pBirthDate_Month, string pBirthDate_Day) {
            return base.Channel.GetPersonInfoJson(pNationalCode, pBirthDate_Year, pBirthDate_Month, pBirthDate_Day);
        }
        
        public System.Threading.Tasks.Task<LoginMain.SrvInquiry.ClsPersonAuthenticationJson> GetPersonInfoJsonAsync(string pNationalCode, string pBirthDate_Year, string pBirthDate_Month, string pBirthDate_Day) {
            return base.Channel.GetPersonInfoJsonAsync(pNationalCode, pBirthDate_Year, pBirthDate_Month, pBirthDate_Day);
        }
    }
}