﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CreateAccount.aspx.cs" Inherits="LoginProject.CreateAccount" EnableViewState="true" ViewStateEncryptionMode="Always" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>ثبت عضویت کاربر جدید</title>
    <link rel="icon" type="image/png" href="icons/favicon.png">
<%--    <script src="https://cdnjs.cloudflare.com/ajax/libs/mouse0270-bootstrap-notify/3.1.5/bootstrap-notify.min.js"></script>--%>
    <link href="css/style.css" rel="stylesheet" />
    <link href="css/bootstrap.rtl.min.css" rel="stylesheet" />
    <script src="js/jquery.min.js"></script>
    <script src="js/angular.min.js"></script>

    <script src="js/bootstrap.min.js"></script>
    <link href="css/CAccount.css" rel="stylesheet" />
    <script type="text/javascript" src="../js/busy.js"></script>
    <script type="text/javascript" src="../Config/Config.js"></script>
    <script type="text/javascript" src="js/PassWordCheck.js"></script>
    <script type="text/javascript" src="../Token/Account.min.js"></script>
    <script src="js/bootstrap-filestyle.min.js"></script>
    <!--===============================================================================================-->
    <script src="../Token/AppConfig.js"></script>
    <script src="../Token/safaSecurity.min.js"></script>
    <script src="../Token/LoginSec.js?v=2"></script>
    <!--===============================================================================================-->
    <script src="js/Busy.js"></script>
    <script type="text/javascript" src="js/Main.js"></script>

    <script>
        AppConfig.LoadObj();
    </script>
    <!--<link rel="stylesheet" href="css/persianDatepicker-default.css" />-->
    <link rel="stylesheet" href="css/kamadatepicker.min.css" />

    <!--<script src="js/persianDatepicker.min.js"></script>-->
    <script src="js/kamadatepicker.min.js"></script>
    <script src="js/persian-date.js"></script>

    <!--<script src="js/jalali-moment.browser.js"></script>-->
    <meta name="viewport" content="width=device-width, initial-scale=1" />


</head>
<body class="" dir="rtl" ng-app="myApp" ng-controller="myCtrl" id="myCtrlID">
    <div class="container">

        <img id="lblVersion" class="" src="Image/esup-logo.png " style="/* width: 65px; */padding: 5px;left: 0;float:left ;top:10px">

        <div class="container" id="SecDIv" style="background-color: white; margin-top: 20px; display:none">

            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBox">

                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBoxFrame">
                    <h2>
                        اطلاعات کاربری
                    </h2>

                    <h3><span style="color: green; font-weight: bold; font-size: 15px" id="msgSuccess">اطلاعات کاربری با موفقیت ثبت شد</span></h3>

                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12   nopadding  " ng-hide="LegalPerson">
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 "> نام کاربری / کدملی  </span>
                            <input disabled type="text" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  engtxt" value="" ng-model="Account_Info.AccountName" />
                        </div>
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                نام:
                            </span>
                            <input disabled type="text" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 fatxt" value="" ng-model="Account_Info.OwnerFirstName" />
                        </div>
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                نام خانوادگی:
                            </span>
                            <input type="text" disabled class="col-lg-12 col-md-12 col-sm-12 col-xs-12 fatxt" value="" ng-model="Account_Info.OwnerLastName" />
                        </div>
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                تلفن همراه:
                            </span>
                            <input id="txtTell" type="text" disabled class="col-lg-12 col-md-12 col-sm-12 col-xs-12  engtxt number" value="" ng-model="Account_Info.OwnerTell" />
                        </div>


                    </div>


                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12   nopadding  " ng-show="LegalPerson">
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 "> نام کاربری / کدملی  </span>

                            <input disabled type="text" id="txt_Username2" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  engtxt" value="" ng-model="Account_Info.AccountName" />
                        </div>
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                نام:
                            </span>
                            <input disabled type="text" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  fatxt" value="" ng-model="Account_Info.CEOName" />
                        </div>
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                نام خانوادگی:
                            </span>
                            <input type="text" disabled class="col-lg-12 col-md-12 col-sm-12 col-xs-12  fatxt" value="" ng-model="Account_Info.CEOFamily" />
                        </div>
                        <div class="col-md-4">
                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                تلفن همراه:
                            </span>
                            <input type="text" disabled class="col-lg-12 col-md-12 col-sm-12 col-xs-12 engtxt number" value="" ng-model="Account_Info.CEOCellNo" />
                        </div>


                    </div>



                </div>
                <div>
                    <input class="btn btn-default" style="background-color:green; color:white" type="button" value="بازگشت به صفحه ورود به سیستم" onclick="window.open('SafaLogin.aspx','_self')" />

                </div>
            </div>

        </div>
        <div class="container" id="MainDIv">

            <div id="Register" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBox">
                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBoxFrame" style="/*text-align: center; width: 100%; z-index: 1000; position: fixed; top: 0px; padding: 10px; background-color: #2aabee; color: white */">
                    <h2 id="headertxt">
                        عضویت در سامانه شهروند سپاری
                    </h2>

                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 GamBoxFrame">
                        <h1>
                            شناسه کاربری
                        </h1>
                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  row">
                            <div class="col-md-4 col-xs-12">
                                <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">نام کاربری / کد ملی</span>
                                <!--<input type="button" value="..." style="width:30px;float:right;margin-top:5px" class="btn btn-default" />-->
                                <input type="text" tabindex="1" class="col-lg-12 col-xs-12" style="float:right" id="txt_Username" title="نام کاربری فقط حرف انگلیسی و اعداد" ng-disabled="EditDisable" ng-model="Account_Info.AccountName" />

                            </div>
                            <div class="col-md-4 col-xs-12">
                                <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                    رمز عبور:
                                </span>
                                <div>
                                    <input tabindex="2" type="password" id="txtPassword" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 engtxt" title="کلمه عبور . فقط حرف انگلیسی" value="" />
                                    <img id="imgShowPass" alt="نمایش رمز عبور" src="../images/showpassOff.png" onclick="ToggleShowPass()" title="نمایش رمز عبور">
                                </div>
                                <div class="progress" id="Progress1" style="width: 100%; margin-top: 3px; height: 7px">
                                    <div id="progressBar" class="progress-bar " role="progressbar" style="">
                                    </div>
                                </div>
                                <span id="result" style="text-align: center;"></span>
                            </div>
                            <div class="col-md-4 col-xs-12">
                                <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                    تکرار رمز عبور:
                                </span>

                                <input tabindex="3" type="password" id="txt_ConfirmPass" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  engtxt" title="کلمه عبور . فقط حرف انگلیسی" value="" />


                            </div>

                        </div>

                        <div style="padding-right:15px" ng-show="ShowInquiryButton">
                            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                                استعلام کد ملی
                            </button>

                            <!-- Modal -->
                            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" style="" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="exampleModalLabel">استعلام کد ملی</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <ng-include src="'InquiryNationalCode.html'"></ng-include>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-danger" data-dismiss="modal">انصراف</button>
                                            <button type="button" class="btn btn-primary" onclick="Inquiry()">تایید</button>

                                            <span id="LMessageInquery" style="float:right ; color:red"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12   ">
                        <h1>
                            مشخصات متقاضی
                        </h1>


                        <ul class="nav nav-tabs">
                            <li class="active"><a data-toggle="tab" href="#personTab" onclick="SetLeganPersion(0)">حقیقی</a></li>
                            <li id="legalTab1"><a data-toggle="tab" href="#legalTab" onclick="SetLeganPersion(1)">حقوقی</a></li>

                        </ul>

                        <div class="tab-content">

                            <div id="personTab" class="tab-pane fade in active ">
                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBoxFrame ">

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام:
                                        </span>
                                        <input type="text" tabindex="5" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_owername" value="" ng-model="Account_Info.OwnerFirstName" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام خانوادگی:
                                        </span>
                                        <input type="text" tabindex="6" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_OwnerFamilyName" value="" ng-model="Account_Info.OwnerLastName" />
                                    </div>


                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام پدر:
                                        </span>
                                        <input type="text" tabindex="7" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_OwnerFatherName" ng-model="Account_Info.OwnerFatherName" />
                                    </div>

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            شماره شناسنامه:
                                        </span>
                                        <input type="text" style="text-align:left;direction:ltr" tabindex="8" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number" maxlength="10" value="" id="txt_RegIDNoHaghighi" ng-model="Account_Info.OwnerIDNO" />
                                    </div>


                                    <div class="col-md-4" id="divNationalCode">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            کد ملی :
                                        </span>
                                        <input type="text" tabindex="9" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  number" maxlength="10" id="txt_NCode" value="" ng-model="Account_Info.OwnerNationalCode" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تاریخ تولد:
                                        </span>
                                        <input type="text" tabindex="10" id="txt_OwenrBirthDate" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  pdatePiker" maxlength="10" value="" ng-model="Account_Info.OwnerBirthDate" />
                                    </div>



                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تحصیلات:
                                        </span>
                                        <!--<select class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " tabindex="27" id="OwnerDegree" ng-model="Account_Info.OwnerDegree" ng-options="item for item in Degree">
                                                                             <option value="0" selected="selected">دیپلم</option>
                                        <option value="1">فوق دیپلم</option>
                                        <option value="2">کارشناسی</option>
                                        <option value="3">کارشناسی ارشد</option>
                                        <option value="4">دکترا</option>
                                                                        </select>-->
                                        <select class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " tabindex="27" id="OwnerDegree"
                                                ng-options="i.Id as (i.Title ) for i in Degree"
                                                ng-model="Account_Info.OwnerDegree"></select>
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تلفن همراه:
                                        </span>
                                        <input type="text" tabindex="12" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number " maxlength="11" title="09121234567" id="txt_OwnerTell" value="" ng-model="Account_Info.OwnerTell" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            پست الکترونیک:
                                        </span>
                                        <input type="text" tabindex="13" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 email" title="09121234567" id="txtEmail" value="" ng-model="Account_Info.CEOEmail" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            کد پستی:
                                        </span>
                                        <input type="text" tabindex="13" style="text-align:left;direction:ltr" maxlength="10" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number" ng-model="Account_Info.PostCode" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            آدرس:
                                        </span>
                                        <input type="text" tabindex="13" style="text-align:right;direction:rtl" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 persiantxtNum" ng-model="Account_Info.Address" />
                                    </div>


                                    <div class="col-md-4" style="position:static">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12">جنسیت</span>
                                        <input type="radio" name="psex" id="sexUserMan" tabindex="3" onclick="psex = true" value="true" ng-model="Account_Info.OwnerSex" />
                                        <label for="sexUserMan">مرد</label>
                                        <input type="radio" name="psex" id="sexUserWoman" tabindex="4" style="margin-right:10px" value="false" ng-model="Account_Info.OwnerSex" />
                                        <label for="sexUserMan">زن</label>

                                    </div>
                                </div>


                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 GamBoxFrame" ng-show="ShowUploadButton">

                                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  infoBox">
                                        <h2>توجه</h2>
                                        <ul class="infoBoxUl">
                                            <li>فرمت فایل باید از نوع عکس (png,jpg) باشد</li>
                                            <li>تصویر کارت ملی را بارگذاری نمایید.</li>
                                        </ul>

                                    </div>
                                    <div class="col-lg-4 col-md-4 col-sm-4 col-xs-12 ">
                                        <input type="file" onchange="encodeImageFileAsURL(this)" />
                                    </div>

                                    <div class="col-lg-8 col-md-8 col-sm-8 col-xs-12 ">
                                        <img id="ownerImage" width="70" style="float: left;" />
                                    </div>
                                </div>


                            </div>
                            <div id="legalTab" class="tab-pane fade">
                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12     GamBoxFrame">

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            شناسه ملی فرد حقوقی:
                                        </span>
                                        <input type="text" tabindex="14" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12" maxlength="20" id="txt_RequestNationalCode" value="" ng-model="Account_Info.RequestNationalCode" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام شرکت:
                                        </span>
                                        <input type="text" tabindex="15" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_companyname" value="" ng-model="Account_Info.CompanyName" />
                                    </div>

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            شماره ثبت:
                                        </span>
                                        <input type="text" tabindex="16" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " value="" ng-model="Account_Info.RegNo" id="txt_RegNo" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            کد اقتصادی:
                                        </span>
                                        <input type="text" tabindex="17" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " value="" ng-model="Account_Info.Codes" id="txt_Codes" />
                                    </div>

                                </div>
                                <div class=" col-lg-12 col-md-12 col-sm-12 col-xs-12 GamBoxFrame ">
                                    <h1 class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                        مشخصات مدیر عامل
                                    </h1>

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام:
                                        </span>
                                        <input type="text" tabindex="20" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_CEOName" value="" ng-model="Account_Info.CEOName" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام خانوادگی:
                                        </span>
                                        <input type="text" tabindex="21" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_CEOFamily" value="" ng-model="Account_Info.CEOFamily" />
                                    </div>

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            نام پدر:
                                        </span>
                                        <input type="text" tabindex="22" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" id="txt_CEOFatherName" value="" ng-model="Account_Info.CEOFatherName" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            شماره شناسنامه:
                                        </span>
                                        <input type="text" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " maxlength="10" value="" ng-model="Account_Info.CEOIDNo" id="txt_CEOIDNo" tabindex="23" />
                                    </div>


                                    <div class="col-md-4" id="divNationalCode2">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            کد ملی :
                                        </span>
                                        <input type="text" tabindex="24" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  number" maxlength="10" value="" ng-model="Account_Info.CEONationalCode" id="txt_CEONationalCode" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تاریخ تولد:
                                        </span>
                                        <input type="text" tabindex="25" id="txt_CEOBirhDate" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  pdatePiker" maxlength="10" ng-model="Account_Info.CEOBirthDate" />
                                    </div>

                                    <!--<div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تاریخ تولد:
                                        </span>
                                        <input id="idateBirth" type="text" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  pdatePiker" maxlength="10" value="" ng-model="Account_Info.CEOBirthDate" tabindex="26" />
                                    </div>-->



                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تحصیلات:
                                        </span>

                                        <select class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " tabindex="27" id="CEODegree"
                                                ng-options="i.Id as (i.Title ) for i in Degree"
                                                ng-model="Account_Info.CEOCI_Degree"></select>
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تلفن همراه:
                                        </span>
                                        <input type="text" tabindex="28" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number " maxlength="11" title="09121234567" id="txt_CEOCellNo" value="" ng-model="Account_Info.CEOCellNo" />
                                    </div>

                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            تلفن ثابت:
                                        </span>
                                        <input type="text" tabindex="29" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number " maxlength="11" title="09121234567" id="txt_CEOPhoneNo" ng-model="Account_Info.CEOPhoneNo" />
                                    </div>
                                    <div class="col-md-4">
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                            رايانامه (پست الکترونيک) :
                                        </span>
                                        <input type="text" tabindex="30" style="text-align:left;direction:ltr" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  email" id="txt_CEOEmail" value="" ng-model="Account_Info.CEOEmail" />

                                    </div>
                                    <div class="col-md-4">
                                        <!--{{Account_Info.CEOSex}}-->
                                        <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">جنسیت</span>
                                        <input type="radio" name="ipsex" id="isexUserMan" tabindex="18" onclick="ipsex = true" value="true" ng-model="Account_Info.CEOSex" />
                                        <label for="isexUserMan">مرد</label>
                                        <input type="radio" name="ipsex" id="isexUserWoman" tabindex="19" style="margin-right:10px" value="false" ng-model="Account_Info.CEOSex" />
                                        <label for="isexUserMan">زن</label>

                                    </div>
                                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12 GamBoxFrame" ng-show="ShowUploadButton">
                                        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  infoBox">
                                            <h2>توجه</h2>
                                            <ul class="infoBoxUl">
                                                <li>فرمت فایل باید از نوع عکس (png,jpg) باشد</li>
                                                <li>تصویر کارت ملی را بارگذاری نمایید.</li>
                                            </ul>

                                        </div>
                                        <div class="col-lg-4 col-m">
                                            <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                                                <input type="file" onchange="encodeImageFileAsURL(this, 'CEO')" />
                                            </div>
                                            <div class="col-lg-8 col-md-8 col-sm-6 col-xs-12">
                                                <img id="ceoImage" width="70" style="float: left;" />
                                            </div>
                                        </div>


                                    </div>
                                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBoxFrame">
                                        <h1>
                                            آدرس مکاتباتی/دفتر

                                        </h1>
                                        <div class="col-md-4">
                                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                                شهر / روستا :
                                            </span>
                                            <input type="text" tabindex="31" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  persiantxt" value="" ng-model="Account_Info.Vilage" id="txt_vilage" />
                                        </div>
                                        <div class="col-md-4">
                                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                                آدرس:
                                            </span>
                                            <input type="text" tabindex="32" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " value="" ng-model="Account_Info.Address" id="txt_address" />
                                        </div>
                                        <div class="col-md-4">
                                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                                کد پستی:
                                            </span>
                                            <input type="text" tabindex="33" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " maxlength="10" value="" ng-model="Account_Info.PostCode" id="txt_postcode" />
                                        </div>
                                        <div class="col-md-4">
                                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 " title="10 رقم">
                                                پست الکترونیک:
                                            </span>
                                            <input type="text" tabindex="34" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  email" value="" ng-model="Account_Info.MailBox" id="txt_mailbox" />
                                        </div>
                                        <div class="col-md-4">
                                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                                تلفن ثابت:
                                            </span>
                                            <input type="text" tabindex="35" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number " maxlength="10" title="02112345678" value="" ng-model="Account_Info.Telephone" id="txt_Tell" />
                                        </div>
                                        <div class="col-md-4">
                                            <span class="col-lg-12 col-md-12 col-sm-12 col-xs-12 ">
                                                نمابر:
                                            </span>
                                            <input type="text" tabindex="36" class="col-lg-12 col-md-12 col-sm-12 col-xs-12 number" maxlength="10" title="02112345678" value="" ng-model="Account_Info.Fax" id="txt_Fax" />
                                        </div>

                                    </div>
                                </div>


                            </div>
                            <h1 class="col-lg-12 col-md-12 col-sm-12 col-xs-12 smsValidate" id="DivSmsConfirm">
                                تاییدیه صحت شماره همراه
                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  nopadding">
                                    <h3 style="padding: 0;font-size:14px; margin-top:10px;margin-bottom:0">
                                        ابتدا تلفن همراه خود را وارد نمایید و دکمه دریافت کد تایید را بزنید
                                    </h3>
                                    <span style="float:right; font-size:small; margin-top:-10px;" ng-bind="Account_Info.OwnerTell"></span>
                                    <div style="direction:rtl; float:right;clear:both">

                                        <input id="btnSend" type="button" onclick="SendConfirmSMS()" class="normalButton btn btn-default" value="دریافت کد تایید" style="float:right" />
                                        <input id="txtConfirmCode" type="text" onkeyup="ConfirmCode_keypress(event)" ng-model="ConfirmCode" style="display:none; font-size:small; width: 130px;float:right; margin: 0;" placeholder="کد تایید را وارد نمایید" />

                                        <img id="imgTick" src="../Images/tik.png" style="width: 20px; display: none" />
                                        <img id="imgError" src="../Images/Error.png" style="width: 20px; display: none" />
                                        <span id="LRecoveryError" style="font-size: small"></span>
                                    </div>
                                </div>

                            </h1>
                            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  GamBoxFrame" title="درصورت تایید موارد فوق صحت اطلاعات را تایید نمایید">

                                <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12  nopadding">
                                    <input type="checkbox" id="ChAccept" onclick='Accept(this);' tabindex="37" />
                                    صحت اطلاعات وارد شده را تایید می نمایم
                                </div>

                                <span id="LMessage" class="col-lg-12 col-md-12 col-sm-12 col-xs-12  "></span>


                                <!--<hr class="col-lg-12 col-md-12 col-sm-12 col-xs-12  " />-->

                                <hr class="col-lg-12 col-md-12 col-sm-12 col-xs-12" />

                                <button disabled id="BtnSave" class="btn btn-default" onclick="OnClientClick()" title="درصورت تایید موارد فوق صحت اطلاعات را تایید نمایید">
                                    ثبت عضویت
                                </button>


                            </div>
                        </div>

                    </div>
                </div>

                <p style="text-align:center" class="footer" id="lblfooterText" ng-bind="FooterText"></p>
            </div>


        </div>
        <script src="js/CAccount.min.js"></script>
    </div>
      
           <script>
               RequestToken();
           </script>
    


</body>
</html>
