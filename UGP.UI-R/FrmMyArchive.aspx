<%@ Page Title="" Language="C#" MasterPageFile="~/UGPMaster.Master" AutoEventWireup="true" %>


<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <style>
        .img {
            visibility: visible;
            width: 150px;
            height: 150px;
        }

        @page {
            size: A4;
            margin: 2cm;
        }

        .SafaLabelPercent {
            visibility: collapse !important;
        }
    </style>

    <h3>
        <img width="20" class="" src="Images/book.png">
        نمایش گواهی های صادره</h3>
    <br />
    <hr />
    <fieldset style="height: 550px; border-color: silver">
        <div id="OldArchive" style="width: 100%; height: 540px;" />
    </fieldset>

    <script>
        var ArchiveFunc = {
            tmpNosaziCode: null,
            tmpNidWorkflowDeffNew: null,
            tmpNidNosaziCode: null,
            ErrorMessage: '',
            District: 1,
            IsLoadAppConfig: false,
            tryShowArchive: 0,
            BizCodeArchive: '',
            Archive_NidEntity: Archive_NidEntity,
            LoadObj: function () {
                var tmpNidProc = getParameterByName('NidProc');
                if (tmpNidProc != '') {
                    District = 'ApprovalCertificate';
                    StartBusyTimer('divUploader', 'در حال نمایش تصویر گواهی');
                    this.Archive_NidEntity = undefined;
                    setTimeout(function () {
                        ArchiveFunc.BizCodeArchive = tmpNidProc;
                        ArchiveFunc.ShowArchive();
                    }, 1000);
                }
                else {

                    var tmpBizCode = getParameterByName('BizCode');
                    tmpNosaziCode = getParameterByName('NosaziCode');
                    District = tmpNosaziCode.split('-')[0];
                    ArchiveFunc.tmpNidWorkflowDeffNew = getParameterByName('id');
                    if (tmpBizCode != null && tmpBizCode != '') {
                        setTimeout(function () { ArchiveFunc.LoadArchive(tmpBizCode); }, 1000);
                    }
                    else {
                        this.CheckRequestValidity();
                    }
                }
                if (ArchiveFunc.tmpNidWorkflowDeffNew != undefined && ArchiveFunc.tmpNidWorkflowDeffNew != null)
                    if (ArchiveFunc.tmpNidWorkflowDeffNew.toLowerCase() == RequestTypeTransferGuid.toLowerCase())
                        this.Archive_NidEntity = Archive_NidEntityTransfer;
                    else if (ArchiveFunc.tmpNidWorkflowDeffNew.toLowerCase() == NidWorkFlowDeff_Payankar.toLowerCase())
                        this.Archive_NidEntity = Archive_NidEntityPayankar;
                    else if (ArchiveFunc.tmpNidWorkflowDeffNew.toLowerCase() == NidWorkFlowDeff_Hardening.toLowerCase())
                        this.Archive_NidEntity = Archive_NidEntityHardening;
                    else if (ArchiveFunc.tmpNidWorkflowDeffNew.toLowerCase() == NidWorkFlowDeff_Parvaneh.toLowerCase())
                        this.Archive_NidEntity = Archive_NidEntityParvaneh;
                    else if (ArchiveFunc.tmpNidWorkflowDeffNew.toLowerCase() == NidWorkFlowDeff_ParvanehSh.toLowerCase())
                        this.Archive_NidEntity = Archive_NidEntityParvaneh;
            },
            GetBizCode: function () {
                var d = { pNidNosaziCode: ArchiveFunc.tmpNidNosaziCode, pCI_ArchiveGroup: CI_Archivegroup, pDistrict: District };
                var c = JSON.stringify(d);
                StartBusy1('در حال دریافت کد آرشیو');

                $request = $.ajax({
                    type: "POST",
                    url: ServiceAddress + "GetArchiveWrapper",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {
                        StopBusy1();
                        if (msg.ArchiveWrapper == null)
                            msg.ArchiveWrapper = 'test';
                        if (msg.ArchiveWrapper != null) {
                            var tmpBizCode = msg.ArchiveWrapper.BizCode;
                            ArchiveFunc.LoadArchive(tmpBizCode);
                        }
                    },
                    error: function (c) {
                        StopBusy1();
                        var g = c;
                    }
                });
            },
            LoadArchive: function (pNewBizCode) {

                var Domain = District;
                ArchiveFunc.BizCodeArchive = pNewBizCode;

                $('#divUploader').empty();
                var u1 = $('#divUploader').AsSafaArchiveUploder();

                u1.LoadObj(ArchiveFunc.BizCodeArchive, Domain, {
                    UserName: AccountFullName,
                    UserCode: NidAccount,
                    Multiply: true, NidTag: ArchiveFunc.Archive_NidEntity, DetectObject: false, MinFileSize: Upload_MinFileSize, MaxFileSize: Upload_MaxFileSize
                    , OnCompleteUpload: function (args, sender) {

                        ArchiveFunc.ShowArchive();
                    }
                });
                this.ShowArchive();
            },

            CheckRequestValidity: function () {
                StartBusy1('در حال استعلام شماره درخواست');
                var d = { pCode: tmpNosaziCode, pNidWorkflowDeffNew: ArchiveFunc.tmpNidWorkflowDeffNew };
                var c = JSON.stringify(d);
                $request = $.ajax({
                    type: "POST",
                    url: ServiceAddress + "CheckRequestValidity",
                    data: c,
                    crossDomin: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    processdata: true,
                    success: function (msg) {
                        StopBusy1();
                        if (msg.RequestValidity != null && msg.RequestValidity.Sh_RequestInfo != null) {
                            ArchiveFunc.tmpNidNosaziCode = msg.RequestValidity.Sh_RequestInfo.NidNosaziCode;
                            ArchiveFunc.GetBizCode();
                        }
                    },
                    error: function (c) {

                        StopBusy1();

                    }
                });
            },
            ShowArchive: function () {
                var Dan = $('#OldArchive').AsSafaArchive();
                Dan.LoadObj(ArchiveFunc.BizCodeArchive, District, 1, {
                    backgroundColor: '#d1ddf9',/**/
                    FullpageBgColor: 'rgb(170, 219, 170)',/**/
                    thumbnailGutterHeight: 10,
                    thumbnailGutterWidth: 5,
                    Archive_NidEntity: ArchiveFunc.Archive_NidEntity,
                    colorScheme: {
                        navigationbar: { background: '#005aff', border: '1px dotted #00cc00', color: 'black', colorHover: '#fff' },
                        thumbnail: {
                            background: '#9bbbea',/**/
                            border: '1px solid lightblue',
                            labelBackground: '#5461a254;',
                            titleColor: '#001b5a',
                            descriptionColor: '#ccc',
                            descriptionShadow: '',
                            paginationDotBorder: '2px solid #red',
                            paginationDotBack: '#red',
                            paginationDotSelBack: '#red'
                        }
                    }
                });
            },
        }

        ArchiveFunc.LoadObj();
        ArchiveFunc.LoadArchive('f5a1bc53-8709-4944-81e8-7ec17c65a020');

        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        function StartBusy1(pMessage) {
            if (pMessage == undefined)
                pMessage = 'لطفا منتظر بمانید...';

            StartBusy('divUploader', pMessage);
        }
        function StopBusy1() {
            StopBusy('divUploader');
        }
    </script>

</asp:Content>
