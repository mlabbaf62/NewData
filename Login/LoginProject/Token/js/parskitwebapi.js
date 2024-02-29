/////////////////////////////////////////////////////////////////////////////////////
// This file is created by Amnafzar Co. to facilitate access to ParsKit Web API.   //
// Contact ParsKey Web API support services by parskey@amnafzar.ir.	               //
//                                                                                 //
// Version 0.21 Release 950218_1                                                   //
/////////////////////////////////////////////////////////////////////////////////////


// ---- Global Variables ----
var isIE8_IE9 = window.XDomainRequest ? true : false;
var isIE11 = !(window.ActiveXObject) && "ActiveXObject" in window;
var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && !navigator.userAgent.match('CriOS');
var errorCode = 0;
var errorMsg = "";
var connectTimeOut;
// The connection port of ParsKit Web API service is configurable.
// The connection port can be changed via ParsKit Web API configuration file.
// You can use URI address http://localhost:58185/ParsKitWebAPI/ for graphical ParsKitWebAPI service. 

var pk_srviceURL = "https://localhost:58085/ParsKitWebAPI/";

// ---- End of Global Variables ----

//////////////////////////////////////////////////////////////
// The following code describes that how to connect to      //
// ParsKit Web API web-methods and send/receive commands    //
//////////////////////////////////////////////////////////////

function waitUntilFinish(isFinished)
{
	setTimeout(waitUntilFinish, 100);

	while(!isFinished);
}

function addEvent(evnt, elem, func)
{
   if(elem.addEventListener)  // W3C DOM
      elem.addEventListener(evnt,func,false);
   else if(elem.attachEvent)
	{ // IE DOM
      elem.attachEvent("on"+evnt, func);
	}
   else 
	{ // No much to do
      elem[evnt] = func;
	}
}

// Returns the version of Internet Explorer or a -1 that indicates to use another browser.
function getInternetExplorerVersion()
{
	var rv = -1; // Return value assumes failure

	if(navigator.appName == 'Microsoft Internet Explorer')
	{
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if(re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
	}
	return rv;
}

function createIframe(IeVersion, pk_webMethodName, ipJSON)
{
	var compatibleUrl = null;

	if(IeVersion == 7 || IeVersion == 8 || IeVersion == 9 || IeVersion == 10 || isIE11 || isSafari)
	{
		compatibleUrl = pk_srviceURL + 'PK_BrowserCompatible';
	}
	else
	{
		alert("Invalid version  : " + IeVersion);
		return null;
	}

	var randomNumber = Math.floor((Math.random() * 1000) + 1);
	var iframe = document.createElement('iframe');
	
	iframe.style.display = 'none';
	iframe.src = compatibleUrl;
	iframe.id = "ssw_iframe_requester" + randomNumber;
	
	id = iframe.id;
	var onErrorFunction =  "var onError = function()" +
	"{" +
	"	var idTemp = \"" + id + "\";" +
	"	var webMethodName = \"" + pk_webMethodName + "\";" +
	"	var iframeID = document.getElementById(idTemp);" +
	"	if(iframeID)" + 
	"   {"+
	"		if(webMethodName == \"PK_ServiceConnection\")" + 
	"       {" +
	"   		errorCode = 1001;"+
	"			errorMsg = \"PArsKit Sevice with the URI Address is down.\";"+
	"           eval(\"PK_ServiceConnection.callBack()\"\);"+
	"		}" +
	"		else" + 
	"			alert(\"There is a problem in communicating with the PK_Service\");" +
	"   }"+
	"   else"+
	"   	errorCode = 1000;"+
	"}";
	
	eval(onErrorFunction);
	var onLoadFunction = function()
	{
		var code = "";
		code = iframe.id + ".postMessage(pk_webMethodName + \"#@!\" + ipJSON + \"#@!\" + " + randomNumber + ",  \"*\")";
		eval(code);
	}
	
	connectTimeOut = setTimeout(onError, 8000);
	
	if(IeVersion == 8 || IeVersion == 7)
	{
		iframe.attachEvent('onload', onLoadFunction);
	}
	else
	{
		iframe.onload = onLoadFunction;
	}
	
    document.body.appendChild(iframe);
	
	return randomNumber;
}

function registerEventListener(IeVersion, opCallback, randomNumber)
{
	clearTimeout(connectTimeOut);
	
	var callbackMethod = "var eventCallback = function(e) { var id = \"" + randomNumber + "\";//alert(id + '\\n'+ e.data);\nvar inputID = e.data.split(\"#@!\")[1];if(id != inputID){return 0;	} var elem = document.getElementById('ssw_iframe_requester' + id);	if(elem)elem.parentElement.removeChild(elem);if(window.detachEvent)window.detachEvent('onmessage',  eventCallback);if(window.removeEventListener)window.removeEventListener('message' , eventCallback, false);opCallback(e.data.split(\"#@!\")[0]);return 1;}";
	eval(callbackMethod);
	
	addEvent("message" , window, eventCallback);
		
	return 1;
}

// ---- Internal Functions ----
String.prototype.escapeSpecialChars = function()
{
	return this.replace(/\n/g, "\\n")
				.replace(/\'/g, "\\'")
				.replace(/\&/g, "\\&")
				.replace(/\r/g, "\\r")
				.replace(/\t/g, "\\t")
				.replace(/\f/g, "\\f");
};

function createXDRequest(url, handler)
{
	var request;
	
	if(window.XDomainRequest)
	{
		request = new XDomainRequest();
	}
	else
	{
		request = new XMLHttpRequest();
	}
		return request;
}

function call_pk_compatible_method(IeVersion, pk_webMethodName, ipJSON, opCallback)
{
	var iframe = createIframe(IeVersion, pk_webMethodName, ipJSON);
	
	if(!registerEventListener(IeVersion, opCallback, iframe))
	{
		alert("Registering event listener for web service callback has been failed.");
		return false;
	}
	
	return true;
}

function call_pk_general_method(pk_webMethodName, ipJSON, opCallback)
{
	var request = createXDRequest();
	var retVal = 0;
	pk_webMethodURL = pk_srviceURL + pk_webMethodName;
	
	if(request)
	{
		request.open('POST', pk_webMethodURL, false);
	
		try
		{
			request.send(ipJSON);
		}
		catch(e)
		{
			if(pk_webMethodName == "PK_ServiceConnection")  
			{ 
				errorCode = 1001;
				errorMsg = "PArsKit Sevice with the URI Address is down.";
				eval("PK_ServiceConnection.callBack()");
			} 
			else  
				alert("There is a problem in communicating with the PK_Service"); 
			return false;
			
		}
		
		request.onreadystatechange = pk_handler(request, opCallback, retVal);
		if(retVal)
		  return false;
	}
	else 
	{
		alert("No request TookPlace At All");
		return false;
	}
	return true;
}

function call_pk_method(pk_webMethodName, ipJSON, opCallback)
{
	var IeVersion = getInternetExplorerVersion();
	
	if(IeVersion == 7 || IeVersion == 8 || IeVersion == 9 || IeVersion == 10 || isIE11 || isSafari)
		return call_pk_compatible_method(IeVersion, pk_webMethodName, ipJSON, opCallback);
	else
		return call_pk_general_method(pk_webMethodName, ipJSON, opCallback);
}

function pk_handler(request, opCallback, retVal)
{
	if(request.readyState == 4)
	{
		if(request.status == 200) 
		{
			opCallback(request.responseText);
		}
		else 
		{
			alert("Invocation Errors Occurred");
			retVal = 1;
		}
	}
	else
	{
		alert("pk_service is stop");
		retVal = 1;
	}
}
// ---- End of Internal Functions ------

//////////////////////////////////////////////////////////////////
// Each of web method class is defined in the following code    //
//////////////////////////////////////////////////////////////////
//               ParsKit Web Method Classes                     //
//////////////////////////////////////////////////////////////////

// --- PK_ServiceConnection Class ---
var PK_ServiceConnection = new function()
 {
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = -1;
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_ServiceConnection.isCalled = false;
		PK_ServiceConnection.success = false;
		PK_ServiceConnection.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		
		if(errorCode == 1001 && pk_srviceURL == "http://localhost:58185/ParsKitWebAPI/"&& opJSON == undefined)
		{
			eval("PK_ServiceConnection.call(\"https\")");
			return false;
		}
		
		if(errorCode == 1001 && pk_srviceURL == "https://localhost:58085/ParsKitWebAPI/" && opJSON == undefined)
		{
			PK_ServiceConnection.isCalled = true;
			PK_ServiceConnection.success = false;
			if(PK_ServiceConnection.showErrorAlert)
			{
				alert("There is a problem in communicating with the PK_Service");
				return false;
			}
			else
			{
				PK_ServiceConnection.pk_opErrorMessage = "There is a problem in communicating with the PK_Service";
				eval(PK_ServiceConnection.rootMethod);
				return false;
			}
		}
		result = JSON.parse(opJSON);
		if(errorCode == 1000 || result.pk_opErrorMessage == "ParsKit Web API is running")
		{
			PK_ServiceConnection.isCalled = true;
			PK_ServiceConnection.pk_opErrorCode = 0;
			PK_ServiceConnection.pk_opErrorMessage = pk_srviceURL;
			
			if(result.pk_opErrorCode == 0)
			{
				PK_ServiceConnection.success = true;
				eval(PK_ServiceConnection.rootMethod);
				return true;
			}
		}	
		return true;
	};
	
	this.call = function (srviceURL) 
	{
		// --- Set Service URI ---
		if(srviceURL == "" || srviceURL == undefined)
			pk_srviceURL = "http://localhost:58185/ParsKitWebAPI/";
		else if(srviceURL == "https")
			pk_srviceURL = "https://localhost:58085/ParsKitWebAPI/";;
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_ServiceConnection', '', PK_ServiceConnection.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_ServiceConnection Class ----

// --- PK_InitPKE Class ---
var PK_InitPKE = new function()
 {
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = -1;
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_InitPKE.isCalled = false;
		PK_InitPKE.success = false;
		PK_InitPKE.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_InitPKE.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_InitPKE.pk_opErrorCode = result.pk_opErrorCode;
		PK_InitPKE.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_InitPKE.success = true;
			eval(PK_InitPKE.rootMethod);
			return true;
		}
		
		PK_InitPKE.success = false;
		if(PK_InitPKE.showErrorAlert)
		{
			alert("Operation has been failed in PK_InitPKE function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_InitPKE.rootMethod);
			return false;
		}
		
		return true;
	};
	
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_InitPKE', ipJSON, PK_InitPKE.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_InitPKE Class ----

// --- PK_SetCryptoki Class ---
var PK_SetCryptoki = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipCryptokiType = 0;
	this.pk_ipCryptoki = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_SetCryptoki.isCalled = false;
		PK_SetCryptoki.success = false;
		PK_SetCryptoki.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_SetCryptoki.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_SetCryptoki.pk_opErrorCode = result.pk_opErrorCode;
		PK_SetCryptoki.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0 || result.pk_opErrorCode == 0)
		{
			PK_SetCryptoki.success = true;
			eval(PK_SetCryptoki.rootMethod);
			return true;
		}
		
		PK_SetCryptoki.success = false;
		if(PK_SetCryptoki.showErrorAlert)
		{
			alert("Operation has been failed in PK_SetCryptoki function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_SetCryptoki.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipCryptokiType": 0, "pk_ipCryptoki": ""}';
		var ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipCryptokiType= PK_SetCryptoki.pk_ipCryptokiType;
		ipJSON_tmp.pk_ipCryptoki = PK_SetCryptoki.pk_ipCryptoki;
		
		ipJSON = JSON.stringify(ipJSON_tmp);
		ipJSON = ipJSON.escapeSpecialChars();
		
		// --- Cryptoki Loading Operation ---
		if(!call_pk_method('PK_SetCryptoki', ipJSON, PK_SetCryptoki.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_SetCryptoki Class ----

// --- PK_InitializeToken Class ---
var PK_InitializeToken = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	this.pk_ipLabel = "";
	this.pk_ipSOPIN = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_InitializeToken.isCalled = false;
		PK_InitializeToken.success = false;
		PK_InitializeToken.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_InitializeToken.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_InitializeToken.pk_opErrorCode = result.pk_opErrorCode;
		PK_InitializeToken.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_InitializeToken.success = true;
			eval(PK_InitializeToken.rootMethod);
			return true;
		}
		
		PK_InitializeToken.success = false;
		if(PK_InitializeToken.showErrorAlert)
		{
			alert("Operation has been failed in PK_InitializeToken function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_InitializeToken.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": "", "pk_ipLabel": "", "pk_ipSOPIN": ""}';
		var	ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_InitializeToken.pk_ipSlotId;
		ipJSON_tmp.pk_ipLabel = PK_InitializeToken.pk_ipLabel;
		ipJSON_tmp.pk_ipSOPIN = PK_InitializeToken.pk_ipSOPIN;
		
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_InitializeToken', ipJSON, PK_InitializeToken.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_InitializeToken Class ----

// --- PK_InitializeUserPIN Class ---
var PK_InitializeUserPIN = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	this.pk_ipUserPIN = "";
	this.pk_ipSOPIN = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_InitializeUserPIN.isCalled = false;
		PK_InitializeUserPIN.success = false;
		PK_InitializeUserPIN.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_InitializeUserPIN.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_InitializeUserPIN.pk_opErrorCode = result.pk_opErrorCode;
		PK_InitializeUserPIN.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_InitializeUserPIN.success = true;
			eval(PK_InitializeUserPIN.rootMethod);
			return true;
		}
		
		PK_InitializeUserPIN.success = false;
		if(PK_InitializeUserPIN.showErrorAlert)
		{
			alert("Operation has been failed in PK_InitializeUserPIN function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_InitializeUserPIN.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": "", "pk_ipUserPIN": "", "pk_ipSOPIN": ""}';
	    var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_InitializeUserPIN.pk_ipSlotId;
		ipJSON_tmp.pk_ipUserPIN = PK_InitializeUserPIN.pk_ipUserPIN;
		ipJSON_tmp.pk_ipSOPIN = PK_InitializeUserPIN.pk_ipSOPIN;
			
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_InitializeUserPIN', ipJSON, PK_InitializeUserPIN.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_InitializeUserPIN Class ----

// --- PK_Login Class ---
var PK_Login = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipUserType = 1;
	this.pk_ipSlotId = 0;
	this.pk_ipPincode = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0;
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_Login.isCalled = false;
		PK_Login.success = false;
		PK_Login.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_Login.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_Login.pk_opErrorCode = result.pk_opErrorCode;
		PK_Login.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_Login.success = true;
			eval(PK_Login.rootMethod);
			return true;
		}
		
		PK_Login.success = false;
		if(PK_Login.showErrorAlert)
		{
			alert("Operation has been failed in PK_Login function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_Login.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipUserType": 1, "pk_ipSlotId": 0, "pk_ipPincode": ""}';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipUserType = PK_Login.pk_ipUserType;
		ipJSON_tmp.pk_ipSlotId = PK_Login.pk_ipSlotId;
		ipJSON_tmp.pk_ipPincode = PK_Login.pk_ipPincode;
		
		ipJSON = JSON.stringify(ipJSON_tmp);
		ipJSON = ipJSON.escapeSpecialChars();
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_Login', ipJSON, PK_Login.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_Login Class ----

// --- PK_Logout Class ---
var PK_Logout = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_Logout.isCalled = false;
		PK_Logout.success = false;
		PK_Logout.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_Logout.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_Logout.pk_opErrorCode = result.pk_opErrorCode;
		PK_Logout.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_Logout.success = true;
			eval(PK_Logout.rootMethod);
			return true;
		}
		
		PK_Logout.success = false;
		if(PK_Logout.showErrorAlert)
		{
			alert("Operation has been failed in PK_Logout function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_Logout.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_Logout.pk_ipSlotId;
	   	ipJSON = JSON.stringify(ipJSON_tmp);	
		// --- Call Web Method ---
		if(!call_pk_method('PK_Logout', ipJSON, PK_Logout.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_Logout Class ----

// --- PK_CheckToken Class ---
var PK_CheckToken = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opPresent = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_CheckToken.isCalled = false;
		PK_CheckToken.success = false;
		PK_CheckToken.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_CheckToken.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_CheckToken.pk_opPresent = result.pk_opPresent;
		PK_CheckToken.pk_opErrorCode = result.pk_opErrorCode;
		PK_CheckToken.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_CheckToken.success = true;
			eval(PK_CheckToken.rootMethod);
			return true;
		}
		
		PK_CheckToken.success = false;
		if(PK_CheckToken.showErrorAlert)
		{
			alert("Operation has been failed in PK_CheckToken function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_CheckToken.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_CheckToken.pk_ipSlotId;
	   	ipJSON = JSON.stringify(ipJSON_tmp);	
		// --- Call Web Method ---
		if(!call_pk_method('PK_CheckToken', ipJSON, PK_CheckToken.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_CheckToken Class ----

// --- PK_GetSlotCount Class ---
var PK_GetSlotCount = new function()
 {
	// --- Define Public Output Variables ---
	this.pk_opSlotCount = 0; 
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetSlotCount.isCalled = false;
		PK_GetSlotCount.success = false;
		PK_GetSlotCount.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetSlotCount.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_GetSlotCount.pk_opSlotCount = result.pk_opSlotCount;
		PK_GetSlotCount.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetSlotCount.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetSlotCount.success = true;
			eval(PK_GetSlotCount.rootMethod);
			return true;
		}
		
		PK_GetSlotCount.success = false;
		if(PK_GetSlotCount.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetSlotCount function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetSlotCount.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetSlotCount', ipJSON, PK_GetSlotCount.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetSlotCount Class ----

// --- PK_GetSlotInfo Class ---
var PK_GetSlotInfo = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opLabel = "";
	this.pk_opManufacturerID = "";
	this.pk_opModel = "";
	this.pk_opSerialNumber = "";
	this.pk_opErrorCode = 0; 
	
	// --- Define Common Public Variables ---
	// --- They are common in all Class ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetSlotInfo.isCalled = false;
		PK_GetSlotInfo.success = false;
		PK_GetSlotInfo.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
	    var result = "";
		PK_GetSlotInfo.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_GetSlotInfo.pk_opLabel = result.pk_opLabel;
		PK_GetSlotInfo.pk_opManufacturerID = result.pk_opManufacturerID;
		PK_GetSlotInfo.pk_opModel = result.pk_opModel;
		PK_GetSlotInfo.pk_opSerialNumber = result.pk_opSerialNumber;
		PK_GetSlotInfo.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetSlotInfo.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetSlotInfo.success = true;
			eval(PK_GetSlotInfo.rootMethod);
			return true;
		}
		
		PK_GetSlotInfo.success = false;
		if(PK_GetSlotInfo.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetSlotInfo function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetSlotInfo.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_GetSlotInfo.pk_ipSlotId;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetSlotInfo', ipJSON, PK_GetSlotInfo.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetSlotInfo Class ----

// --- PK_GetPubKeys Class ---
var PK_GetPubKeys = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opSubjects = "";
	this.pk_opPublicKeys = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetPubKeys.isCalled = false;
		PK_GetPubKeys.success = false;
		PK_GetPubKeys.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetPubKeys.isCalled = true;
		
		var retJSON = opJSON.escapeSpecialChars();
		result = eval('(' + retJSON + ')');
		
		PK_GetPubKeys.pk_opSubjects = result.pk_opSubjects;
		PK_GetPubKeys.pk_opPublicKeys = result.pk_opPublicKeys;
		PK_GetPubKeys.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetPubKeys.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetPubKeys.success = true;
			eval(PK_GetPubKeys.rootMethod);
			return true;
		}
		
		PK_GetPubKeys.success = false;
		if(PK_GetPubKeys.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetPubKeys function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetPubKeys.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_GetPubKeys.pk_ipSlotId;
		ipJSON = JSON.stringify(ipJSON_tmp);
	   		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetPubKeys', ipJSON, PK_GetPubKeys.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetPubKeys Class ----

// --- PK_GetCertById Class ---
var PK_GetCertById = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipPubKey = "";
	
	// --- Define Public Output Variables ---
	this.pk_opCertificate = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetCertById.isCalled = false;
		PK_GetCertById.success = false;
		PK_GetCertById.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetCertById.isCalled = true;
		
		//result = JSON.parse(opJSON);
		result = eval('(' + opJSON + ')');
		
		PK_GetCertById.pk_opCertificate = result.pk_opCertificate;
		PK_GetCertById.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetCertById.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetCertById.success = true;
			eval(PK_GetCertById.rootMethod);
			return true;
		}
		
		PK_GetCertById.success = false;
		if(PK_GetCertById.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetCertById function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetCertById.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipPubKey": "" }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipPubKey = PK_GetCertById.pk_ipPubKey;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetCertById', ipJSON, PK_GetCertById.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetCertById Class ----

// --- PK_GetPublicObject Class ---
var PK_GetPublicObject = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipSlotID = "";
	this.pk_ipKeyID = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opCert = "";
	this.pk_opPubkey = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetPublicObject.isCalled = false;
		PK_GetPublicObject.success = false;
		PK_GetPublicObject.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GetPublicObject.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetPublicObject.pk_opCert = result.pk_opCert;
		PK_GetPublicObject.pk_opPubkey = result.pk_opPubkey;
		PK_GetPublicObject.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetPublicObject.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetPublicObject.success = true;
			eval(PK_GetPublicObject.rootMethod);
			return true;
		}
		
		PK_GetPublicObject.success = false;
		if(PK_GetPublicObject.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetPublicObject function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetPublicObject.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotID": "", "pk_ipKeyID": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipSlotID = PK_GetPublicObject.pk_ipSlotID;
		ipJSONtmp.pk_ipKeyID = PK_GetPublicObject.pk_ipKeyID;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GetPublicObject', ipJSON, PK_GetPublicObject.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GetPublicObject Class ----

// --- PK_CheckCertUsage Class ---
var PK_CheckCertUsage = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipCertificate = "";
	this.pk_ipUsage = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_CheckCertUsage.isCalled = false;
		PK_CheckCertUsage.success = false;
		PK_CheckCertUsage.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_CheckCertUsage.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_CheckCertUsage.pk_opErrorCode = result.pk_opErrorCode;
		PK_CheckCertUsage.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_CheckCertUsage.success = true;
			eval(PK_CheckCertUsage.rootMethod);
			return true;
		}
		
		PK_CheckCertUsage.success = false;
		if(PK_CheckCertUsage.showErrorAlert)
		{
			alert("Operation has been failed in PK_CheckCertUsage function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_CheckCertUsage.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipCertificate": "", "pk_ipUsage": "" }';
		var  ipJSON_tmp = JSON.parse(ipJSON);

		ipJSON_tmp.pk_ipCertificate = PK_CheckCertUsage.pk_ipCertificate;
		ipJSON_tmp.pk_ipUsage = PK_CheckCertUsage.pk_ipUsage;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_CheckCertUsage', ipJSON, PK_CheckCertUsage.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_CheckCertUsage Class ----

// --- PK_GenRandom Class ---
var PK_GenRandom = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	this.pk_ipSize = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opHexRnadomString = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenRandom.isCalled = false;
		PK_GenRandom.success = false;
		PK_GenRandom.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GenRandom.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenRandom.pk_opHexRnadomString = result.pk_opHexRnadomString;
		PK_GenRandom.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenRandom.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenRandom.success = true;
			eval(PK_GenRandom.rootMethod);
			return true;
		}
		
		PK_GenRandom.success = false;
		if(PK_GenRandom.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenRandom function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenRandom.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0, "pk_ipSize": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_GenRandom.pk_ipSlotId;
		ipJSON_tmp.pk_ipSize = PK_GenRandom.pk_ipSize;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GenRandom', ipJSON, PK_GenRandom.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GenRandom Class ----

// --- PK_GetRandom Class ---
var PK_GetRandom = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSize = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opHexRnadomString = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetRandom.isCalled = false;
		PK_GetRandom.success = false;
		PK_GetRandom.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
	    var result = "";
		PK_GetRandom.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetRandom.pk_opHexRnadomString = result.pk_opHexRnadomString;
		PK_GetRandom.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetRandom.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetRandom.success = true;
			eval(PK_GetRandom.rootMethod);
			return true;
		}
		
		PK_GetRandom.success = false;
		if(PK_GetRandom.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetRandom function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetRandom.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSize": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSize = PK_GetRandom.pk_ipSize;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetRandom', ipJSON, PK_GetRandom.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetRandom Class ----

// --- PK_GenHash Class ---
var PK_GenHash = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipHashAlg = 0;
	this.pk_ipData = "";
	this.pk_ipDataLen = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opHexDigest = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenHash.isCalled = false;
		PK_GenHash.success = false;
		PK_GenHash.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GenHash.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenHash.pk_opHexDigest = result.pk_opHexDigest;
		PK_GenHash.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenHash.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenHash.success = true;
			eval(PK_GenHash.rootMethod);
			return true;
		}
		
		PK_GenHash.success = false;
		if(PK_GenHash.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenHash function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenHash.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipHashAlg": 0, "pk_ipData": "", "pk_ipDataLen": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipHashAlg = PK_GenHash.pk_ipHashAlg;
		ipJSON_tmp.pk_ipData = PK_GenHash.pk_ipData;
		ipJSON_tmp.pk_ipDataLen = PK_GenHash.pk_ipDataLen;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GenHash', ipJSON, PK_GenHash.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GenHash Class ----

// --- PK_GenHashByToken Class ---
var PK_GenHashByToken = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	this.pk_ipHashAlg = 0;
	this.pk_ipData = "";
	this.pk_ipDataLen = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opHexDigest = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenHashByToken.isCalled = false;
		PK_GenHashByToken.success = false;
		PK_GenHashByToken.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
	    var result = "";
		PK_GenHashByToken.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenHashByToken.pk_opHexDigest = result.pk_opHexDigest;
		PK_GenHashByToken.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenHashByToken.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenHashByToken.success = true;
			eval(PK_GenHashByToken.rootMethod);
			return true;
		}
		
		PK_GenHashByToken.success = false;
		if(PK_GenHashByToken.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenHashByToken function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenHashByToken.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0, "pk_ipHashAlg": 0, "pk_ipData": "", "pk_ipDataLen": 0 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_GenHashByToken.pk_ipSlotId;
		ipJSON_tmp.pk_ipHashAlg = PK_GenHashByToken.pk_ipHashAlg;
		ipJSON_tmp.pk_ipData = PK_GenHashByToken.pk_ipData;
		ipJSON_tmp.pk_ipDataLen = PK_GenHashByToken.pk_ipDataLen;
		ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GenHashByToken', ipJSON, PK_GenHashByToken.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GenHashByToken Class ----

// --- PK_GetCertInfo Class ---
var PK_GetCertInfo = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipCertificate = "";
	this.pk_ipSel = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opSubject = "";
	this.pk_opPubKey = "";
	this.pk_opKeyId = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetCertInfo.isCalled = false;
		PK_GetCertInfo.success = false;
		PK_GetCertInfo.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetCertInfo.isCalled = true;
		
		//result = JSON.parse(opJSON);
		result = eval('(' + opJSON + ')');
		
		PK_GetCertInfo.pk_opSubject = result.pk_opSubject;
		PK_GetCertInfo.pk_opPubKey = result.pk_opPubKey;
		PK_GetCertInfo.pk_opKeyId = result.pk_opKeyId;
		PK_GetCertInfo.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetCertInfo.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetCertInfo.success = true;
			eval(PK_GetCertInfo.rootMethod);
			return true;
		}
		
		PK_GetCertInfo.success = false;
		if(PK_GetCertInfo.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetCertInfo function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetCertInfo.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipCertificate": "", "pk_ipSel": 1 }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipCertificate = PK_GetCertInfo.pk_ipCertificate;
		ipJSON_tmp.pk_ipSel = PK_GetCertInfo.pk_ipSel;
		
	   	ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetCertInfo', ipJSON, PK_GetCertInfo.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetCertInfo Class ----

// --- PK_GetCN Class ---
var PK_GetCN = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipCertificate = "";
		
	// --- Define Public Output Variables ---
	this.pk_opCN = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetCN.isCalled = false;
		PK_GetCN.success = false;
		PK_GetCN.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetCN.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetCN.pk_opCN = result.pk_opCN;
		PK_GetCN.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetCN.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetCN.success = true;
			eval(PK_GetCN.rootMethod);
			return true;
		}
		
		PK_GetCN.success = false;
		if(PK_GetCN.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetCN function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetCertInfo.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipCertificate": "" }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipCertificate = PK_GetCN.pk_ipCertificate;
		
	    ipJSON = JSON.stringify(ipJSON_tmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetCN', ipJSON, PK_GetCN.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GetCN Class ----

// --- PK_InjectCert Class ---
var PK_InjectCert = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipCertificate = "";
	
	// --- Define Public Output Variables ---
	this.pk_opInformation = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_InjectCert.isCalled = false;
		PK_InjectCert.success = false;
		PK_InjectCert.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_InjectCert.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_InjectCert.pk_opInformation = result.pk_opInformation;
		PK_InjectCert.pk_opErrorCode = result.pk_opErrorCode;
		PK_InjectCert.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_InjectCert.success = true;
			eval(PK_InjectCert.rootMethod);
			return true;
		}
		
		PK_InjectCert.success = false;
		if(PK_InjectCert.showErrorAlert)
		{
			alert("Operation has been failed in PK_InjectCert function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_InjectCert.rootMethod);
			return false;
		}
	};
	
	this.call = function ()
	{
		var ipJSON = "";
		
		// --- import certificate ---
		ipJSON = '{ "pk_ipCertificate": "" }';
		ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipCertificate = PK_InjectCert.pk_ipCertificate;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_InjectCert', ipJSON, PK_InjectCert.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_InjectCert Class ----

// --- PK_GetKeyPairs Class ---
var PK_GetKeyPairs = new function()
{
	// --- Define Public Output Variables ---
	this.pk_opKeyPairs = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
		
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetKeyPairs.isCalled = false;
		PK_GetKeyPairs.success = false;
		PK_GetKeyPairs.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetKeyPairs.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetKeyPairs.pk_opKeyPairs = result.pk_opKeyPairs;
		PK_GetKeyPairs.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetKeyPairs.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetKeyPairs.success = true;
			eval(PK_GetKeyPairs.rootMethod);
			return true;
		}
		
		PK_GetKeyPairs.success = false;
		if(PK_GetKeyPairs.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetKeyPairs function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetKeyPairs.rootMethod);
			return false;
		}
	};
	
	this.call = function ()
	{
		var ipJSON = "";
		
		if(!call_pk_method('PK_GetKeyPairs', ipJSON, PK_GetKeyPairs.callBack))
			return false;
		
		return true;
	};
	
}
// ---- End of PK_GetKeyPairs Class ----

// --- PK_GetKeysID Class ---
var PK_GetKeysID = new function()
{
    // --- Define Public Input Variables ---
	this.pk_ipCheckObj = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opKeysID = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetKeysID.isCalled = false;
		PK_GetKeysID.success = false;
		PK_GetKeysID.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GetKeysID.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetKeysID.pk_opKeysID = result.pk_opKeysID;
		PK_GetKeysID.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetKeysID.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetKeysID.success = true;
			eval(PK_GetKeysID.rootMethod);
			return true;
		}
		
		PK_GetKeysID.success = false;
		if(PK_GetKeysID.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetKeysID function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetKeyPairs.rootMethod);
			return false;
		}
	};
	
	this.call = function ()
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipCheckObj": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipCheckObj = PK_GetKeysID.pk_ipCheckObj;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GetKeysID', ipJSON, PK_GetKeysID.callBack))
			return false;
		
		return true;
	};
	
}
// ---- End of PK_GetKeysID Class ----

// --- PK_genCSR Class ---
var PK_GenCSR = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipKeyId = "";
	this.pk_ipProfile = "";
	this.pk_ipSubAltName = "";
	this.pk_ipKeyLen = 0;
	this.pk_ipX931GenKey = false;
	this.pk_ipExtractable = false;
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	this.pk_opCSR = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenCSR.isCalled = false;
		PK_GenCSR.success = false;
		PK_GenCSR.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GenCSR.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenCSR.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenCSR.pk_opErrorMessage = result.pk_opErrorMessage;
		PK_GenCSR.pk_opCSR = result.pk_opCSR;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenCSR.success = true;
			eval(PK_GenCSR.rootMethod);
			return true;
		}
		
		PK_GenCSR.success = false;
		if(PK_GenCSR.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenCSR function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenCSR.rootMethod);
			return false;
		}
	
	};
	
	this.call = function ()
	{
		var ipJSON = "";
		
		// --- generate CSR ---
		ipJSON = '{ "pk_ipKeyId": "", "pk_ipProfile": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], "pk_ipSubAltName": ["", "", "", "", "", ""], "pk_ipKeyLen": 0, "pk_ipX931GenKey": 0, "pk_ipExtractable": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipKeyId = PK_GenCSR.pk_ipKeyId;
		ipJSONtmp.pk_ipProfile = PK_GenCSR.pk_ipProfile;
		ipJSONtmp.pk_ipSubAltName = PK_GenCSR.pk_ipSubAltName;
		ipJSONtmp.pk_ipKeyLen = PK_GenCSR.pk_ipKeyLen;
		ipJSONtmp.pk_ipX931GenKey = PK_GenCSR.pk_ipX931GenKey;
		ipJSONtmp.pk_ipExtractable = PK_GenCSR.pk_ipExtractable;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GenCSR', ipJSON, PK_GenCSR.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_GenCSR Class ----

// --- PK_GenCertReReq Class ---
var PK_GenCertReReq = new function ()
{
	// --- Define Public Input Variables ---
	this.pk_ipSerialNumber = "";
	this.pk_ipReqType = 0;
	this.pk_ipRevokeReason = "";
	this.pk_ipDuration = 0;
	this.pk_ipPass = "";
	this.pk_ipSlotId = 0;
	this.pk_ipRACert = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	this.pk_opCertReReq = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenCertReReq.isCalled = false;
		PK_GenCertReReq.success = false;
		PK_GenCertReReq.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_GenCertReReq.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenCertReReq.pk_opCertReReq = result.pk_opCertReReq;
		PK_GenCertReReq.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenCertReReq.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenCertReReq.success = true;
			eval(PK_GenCertReReq.rootMethod);
			return true;
		}
		
		PK_GenCertReReq.success = false;
		if(PK_GenCertReReq.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenCertReReq function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenCertReReq.rootMethod);
			return false;
		}
	};
	
	this.call = function ()
	{
		var ipJSON = "";
			
		// --- generate ReOrder ---
		ipJSON = '{ "pk_ipSerialNumber": "", "pk_ipReqType": 0, "pk_ipRevokeReason": "", "pk_ipDuration": 0, "pk_ipPass": "", "pk_ipSlotId": 0, "pk_ipRACert": ""}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipSerialNumber = PK_GenCertReReq.pk_ipSerialNumber;
		ipJSONtmp.pk_ipReqType = PK_GenCertReReq.pk_ipReqType;
		ipJSONtmp.pk_ipRevokeReason = PK_GenCertReReq.pk_ipRevokeReason;
		ipJSONtmp.pk_ipDuration = PK_GenCertReReq.pk_ipDuration;
		ipJSONtmp.pk_ipPass = PK_GenCertReReq.pk_ipPass;
		ipJSONtmp.pk_ipSlotId = PK_GenCertReReq.pk_ipSlotId;
		ipJSONtmp.pk_ipRACert = PK_GenCertReReq.pk_ipRACert;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GenCertReReq', ipJSON, PK_GenCertReReq.callBack))
			return false;
		
		return true;
	};
}

// ---- End of PK_GenCertReReq Class ----

// --- PK_GenCertIssueReq Class ---
var PK_GenCertIssueReq = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipCSR = "";
	this.pk_ipAddInfo = "";
	this.pk_ipCSR = "";
	this.pk_ipUsage = "";
	this.pk_ipDuration = 0;
	this.pk_ipSlotId = 0;
	this.pk_ipRACert = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	this.pk_opCertIssueReq = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenCertIssueReq.isCalled = false;
		PK_GenCertIssueReq.success = false;
		PK_GenCertIssueReq.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GenCertIssueReq.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenCertIssueReq.pk_opCertIssueReq = result.pk_opCertIssueReq;
		PK_GenCertIssueReq.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenCertIssueReq.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenCertIssueReq.success = true;
			eval(PK_GenCertIssueReq.rootMethod);
			return true;
		}
		
		PK_GenCertIssueReq.success = false;
		if(PK_GenCertIssueReq.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenCertIssueReq function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenCertIssueReq.rootMethod);
			return false;
		}
		
	};
	
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipAddInfo": ["", "", "", "", "", "", ""], "pk_ipCSR": "", "pk_ipUsage": "", "pk_ipDuration": 0, "pk_ipSlotId": 0, "pk_ipRACert": ""}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipAddInfo = PK_GenCertIssueReq.pk_ipAddInfo;
		ipJSONtmp.pk_ipCSR = PK_GenCertIssueReq.pk_ipCSR;
		ipJSONtmp.pk_ipUsage = PK_GenCertIssueReq.pk_ipUsage;
		ipJSONtmp.pk_ipDuration = PK_GenCertIssueReq.pk_ipDuration;
		ipJSONtmp.pk_ipSlotId = PK_GenCertIssueReq.pk_ipSlotId;
		ipJSONtmp.pk_ipRACert = PK_GenCertIssueReq.pk_ipRACert;
		
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GenCertIssueReq', ipJSON, PK_GenCertIssueReq.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GenCertIssueReq Class ----

// --- PK_GetTokenPubkeys Class ---
var PK_GetTokenPubkeys = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opPublicKeys = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetTokenPubkeys.isCalled = false;
		PK_GetTokenPubkeys.success = false;
		PK_GetTokenPubkeys.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GetTokenPubkeys.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetTokenPubkeys.pk_opPublicKeys = result.pk_opPublicKeys;
		PK_GetTokenPubkeys.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetTokenPubkeys.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetTokenPubkeys.success = true;
			eval(PK_GetTokenPubkeys.rootMethod);
			return true;
		}
		
		PK_GetTokenPubkeys.success = false;
		if(PK_GetTokenPubkeys.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetTokenPubkeys function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetTokenPubkeys.rootMethod);
			return false;
		}
		
	};
	
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipSlotId = PK_GetTokenPubkeys.pk_ipSlotId;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GetTokenPubkeys', ipJSON, PK_GetTokenPubkeys.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GetTokenPubkeys Class ----

// --- PK_ChangePIN Class ---
var PK_ChangePIN = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipOldPIN = "";
	this.pk_ipNewPIN = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_ChangePIN.isCalled = false;
		PK_ChangePIN.success = false;
		PK_ChangePIN.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_ChangePIN.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_ChangePIN.pk_opErrorCode = result.pk_opErrorCode;
		PK_ChangePIN.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_ChangePIN.success = true;
			eval(PK_ChangePIN.rootMethod);
			return true;
		}
		
		PK_ChangePIN.success = false;
		if(PK_ChangePIN.showErrorAlert)
		{
			alert("Operation has been failed in PK_ChangePIN function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_ChangePIN.rootMethod);
			return false;
		}
		
	};
	
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipOldPIN": "", "pk_ipNewPIN": ""}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipOldPIN = PK_ChangePIN.pk_ipOldPIN;
		ipJSONtmp.pk_ipNewPIN = PK_ChangePIN.pk_ipNewPIN;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_ChangePIN', ipJSON, PK_ChangePIN.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_ChangePIN Class ----

// --- PK_GetInfoCertificate Class ---
var PK_GetInfoCertificate = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipCertificate = "";
	this.pk_ipSel = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opInfo = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetInfoCertificate.isCalled = false;
		PK_GetInfoCertificate.success = false;
		PK_GetInfoCertificate.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GetInfoCertificate.isCalled = true;
		
		var retJSON = opJSON.escapeSpecialChars();
		result = eval('(' + retJSON + ')');
		
		PK_GetInfoCertificate.pk_opInfo = result.pk_opInfo;
		PK_GetInfoCertificate.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetInfoCertificate.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetInfoCertificate.success = true;
			eval(PK_GetInfoCertificate.rootMethod);
			return true;
		}
		
		PK_GetInfoCertificate.success = false;
		if(PK_GetInfoCertificate.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetInfoCertificate function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetInfoCertificate.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipCertificate": "", "pk_ipSel": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipCertificate = PK_GetInfoCertificate.pk_ipCertificate;
		ipJSONtmp.pk_ipSel = PK_GetInfoCertificate.pk_ipSel;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		if(!call_pk_method('PK_GetInfoCertificate', ipJSON, PK_GetInfoCertificate.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GetInfoCertificate Class ----

// --- PK_Import Class ---
var PK_Import = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSlotId = 0;
	this.pk_ipSessionType = 0;
	this.pk_ipObjectType = 0;
	this.pk_ipObject = 0;
	this.pk_ipPKCS12Pass = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opKeyID = "";
	this.pk_opKeyIDLen = 0;
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_Import.isCalled = false;
		PK_Import.success = false;
		PK_Import.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_Import.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_Import.pk_opKeyID = result.pk_opKeyID;
		PK_Import.pk_opKeyIDLen = result.pk_opKeyIDLen;
		PK_Import.pk_opErrorCode = result.pk_opErrorCode;
		PK_Import.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_Import.success = true;
			eval(PK_Import.rootMethod);
			return true;
		}
		
		PK_Import.success = false;
		if(PK_Import.showErrorAlert)
		{
			alert("Operation has been failed in PK_Import function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_Import.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSlotId": 0, "pk_ipSessionType": 0, "pk_ipObjectType": 0 , "pk_ipObject": "", "pk_ipPKCS12Pass": "" }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSlotId = PK_Import.pk_ipSlotId;
		ipJSON_tmp.pk_ipSessionType = PK_Import.pk_ipSessionType;
		ipJSON_tmp.pk_ipObjectType = PK_Import.pk_ipObjectType;
		ipJSON_tmp.pk_ipObject = PK_Import.pk_ipObject;
		ipJSON_tmp.pk_ipPKCS12Pass = PK_Import.pk_ipPKCS12Pass;
		
		ipJSON = JSON.stringify(ipJSON_tmp);
		ipJSON = ipJSON.escapeSpecialChars();
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_Import', ipJSON, PK_Import.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_Import Class ----

// --- PK_DeleteObject Class ---
var PK_DeleteObject = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipObjectType = 0;
	this.pk_ipObjectKeyID = "";
	this.pk_ipObjectHandle = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opInfo = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_DeleteObject.isCalled = false;
		PK_DeleteObject.success = false;
		PK_DeleteObject.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_DeleteObject.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_DeleteObject.pk_opErrorCode = result.pk_opErrorCode;
		PK_DeleteObject.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_DeleteObject.success = true;
			eval(PK_DeleteObject.rootMethod);
			return true;
		}
		
		PK_DeleteObject.success = false;
		if(PK_DeleteObject.showErrorAlert)
		{
			alert("Operation has been failed in PK_DeleteObject function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_DeleteObject.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipObjectType": 0, "pk_ipObjectKeyID": "", "pk_ipObjectHandle": 0}';// pk_ipObjectType   : 0: private key, 1:public key, 2:certificate, 3: secret key
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipObjectType = PK_DeleteObject.pk_ipObjectType;
		ipJSONtmp.pk_ipObjectKeyID = PK_DeleteObject.pk_ipObjectKeyID;
		ipJSONtmp.pk_ipObjectHandle = PK_DeleteObject.pk_ipObjectHandle;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_DeleteObject', ipJSON, PK_DeleteObject.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_DeleteObject Class ----

// --- PK_GenSymmetricKey Class ---
var PK_GenSymmetricKey = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipKeyGenMech = 0;
	this.pk_ipKeyLabel = "";
	this.pk_ipExtractable = 0;
	this.pk_ipSensitive = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opKeyHandle = 0;
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenSymmetricKey.isCalled = false;
		PK_GenSymmetricKey.success = false;
		PK_GenSymmetricKey.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GenSymmetricKey.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenSymmetricKey.pk_opKeyHandle = result.pk_opKeyHandle;
		PK_GenSymmetricKey.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenSymmetricKey.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenSymmetricKey.success = true;
			eval(PK_GenSymmetricKey.rootMethod);
			return true;
		}
		
		PK_GenSymmetricKey.success = false;
		if(PK_GenSymmetricKey.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenSymmetricKey function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenSymmetricKey.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipKeyGenMech": 0, "pk_ipKeyLabel": "", "pk_ipKeyLen": 0, "pk_ipExtractable": 0 , "pk_ipSensitive": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipKeyGenMech = PK_GenSymmetricKey.pk_ipKeyGenMech;
		ipJSONtmp.pk_ipKeyLabel = PK_GenSymmetricKey.pk_ipKeyLabel;
		ipJSONtmp.pk_ipExtractable = PK_GenSymmetricKey.pk_ipExtractable;
		ipJSONtmp.pk_ipSensitive = PK_GenSymmetricKey.pk_ipSensitive;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GenSymmetricKey', ipJSON, PK_GenSymmetricKey.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GenSymmetricKey Class ----

// --- PK_GetSecKeyHandle Class ---
var PK_GetSecKeyHandle = new function()
{
    
	// --- Define Public Output Variables ---
	this.pk_opKeyLabel = "";
	this.pk_opKeyHandle = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GetSecKeyHandle.isCalled = false;
		PK_GetSecKeyHandle.success = false;
		PK_GetSecKeyHandle.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GetSecKeyHandle.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GetSecKeyHandle.pk_opKeyLabel = result.pk_opKeyLabel;
		PK_GetSecKeyHandle.pk_opKeyHandle = result.pk_opKeyHandle;
		PK_GetSecKeyHandle.pk_opErrorCode = result.pk_opErrorCode;
		PK_GetSecKeyHandle.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GetSecKeyHandle.success = true;
			eval(PK_GetSecKeyHandle.rootMethod);
			return true;
		}
		
		PK_GetSecKeyHandle.success = false;
		if(PK_GetSecKeyHandle.showErrorAlert)
		{
			alert("Operation has been failed in PK_GetSecKeyHandle function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GetSecKeyHandle.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GetSecKeyHandle', ipJSON, PK_GetSecKeyHandle.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GetSecKeyHandle Class ----


// --- PK_GenKeyPair Class ---
var PK_GenKeyPair = new function()
{
    // --- Define Public Input Variables ---
	this.pk_ipKeyLabel = "";
	this.pk_ipKeyLen = 0;
	this.pk_ipX931GenKey = 0;
	this.pk_ipExtractable = 0;
	this.pk_ipSensitive = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opPrvKeyHandle = 0;
	this.pk_opPubKeyHandle = 0;
	this.pk_opKeyId = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_GenKeyPair.isCalled = false;
		PK_GenKeyPair.success = false;
		PK_GenKeyPair.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_GenKeyPair.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_GenKeyPair.pk_opPrvKeyHandle = result.pk_opPrvKeyHandle;
		PK_GenKeyPair.pk_opPubKeyHandle = result.pk_opPubKeyHandle;
		PK_GenKeyPair.pk_opKeyId = result.pk_opKeyId;
		PK_GenKeyPair.pk_opErrorCode = result.pk_opErrorCode;
		PK_GenKeyPair.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_GenKeyPair.success = true;
			eval(PK_GenKeyPair.rootMethod);
			return true;
		}
		
		PK_GenKeyPair.success = false;
		if(PK_GenKeyPair.showErrorAlert)
		{
			alert("Operation has been failed in PK_GenKeyPair function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_GenKeyPair.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipKeyLabel": "", "pk_ipKeyLen": 0, "pk_ipX931GenKey": 0, "pk_ipExtractable": 0 , "pk_ipSensitive": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipKeyLabel = PK_GenKeyPair.pk_ipKeyLabel;
		ipJSONtmp.pk_ipKeyLen = PK_GenKeyPair.pk_ipKeyLen;
		ipJSONtmp.pk_ipX931GenKey = PK_GenKeyPair.pk_ipX931GenKey;
		ipJSONtmp.pk_ipExtractable = PK_GenKeyPair.pk_ipExtractable;
		ipJSONtmp.pk_ipSensitive = PK_GenKeyPair.pk_ipSensitive;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_GenKeyPair', ipJSON, PK_GenKeyPair.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_GenKeyPair Class ----

// --- PK_SetCryptMech Class ---
var PK_SetCryptMech = new function()
{
    // --- Define Public Input Variables ---
	this.pk_ipOperationType = 0;
	this.pk_ipCryptType = 0;
	this.pk_ipCryptFormat = 0;
	this.pk_ipCryptMech = 0;
	this.pk_ipCipherAlg = 0;
	this.pk_ipCryptMechParam1 = [0, 0, 0];
	this.pk_ipCryptMechParam1 = "";
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_SetCryptMech.isCalled = false;
		PK_SetCryptMech.success = false;
		PK_SetCryptMech.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		PK_SetCryptMech.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_SetCryptMech.pk_opErrorCode = result.pk_opErrorCode;
		PK_SetCryptMech.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_SetCryptMech.success = true;
			eval(PK_SetCryptMech.rootMethod);
			return true;
		}
		
		PK_SetCryptMech.success = false;
		if(PK_SetCryptMech.showErrorAlert)
		{
			alert("Operation has been failed in PK_SetCryptMech function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_SetCryptMech.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipOperationType": 0, "pk_ipCryptType": 0, "pk_ipCryptFormat": 0, "pk_ipCryptMech": 0, "pk_ipCipherAlg": 0, "pk_ipCryptMechParam1": [0, 0, 0], "pk_ipCryptMechParam2": ""}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipOperationType = PK_SetCryptMech.pk_ipOperationType;
		ipJSONtmp.pk_ipCryptType = PK_SetCryptMech.pk_ipCryptType;
		ipJSONtmp.pk_ipCryptFormat = PK_SetCryptMech.pk_ipCryptFormat;
		ipJSONtmp.pk_ipCryptMech = PK_SetCryptMech.pk_ipCryptMech;
		ipJSONtmp.pk_ipCipherAlg = PK_SetCryptMech.pk_ipCipherAlg;
		ipJSONtmp.pk_ipCryptMechParam1 = PK_SetCryptMech.pk_ipCryptMechParam1;
		ipJSONtmp.pk_ipCryptMechParam2 = PK_SetCryptMech.pk_ipCryptMechParam2;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_SetCryptMech', ipJSON, PK_SetCryptMech.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_SetCryptMech Class ----

// --- PK_DoCrypt Class ---
var PK_DoCrypt = new function()
{
    // --- Define Public Input Variables ---
	this.pk_ipOperationType = 0;
	this.pk_ipKeyHandle = 0;
	this.pk_ipSlotId = 0;
	this.pk_ipPincode = "";
	this.pk_ipKeyId = "";
	this.pk_ipRecipsCerts = "";
	this.pk_ipInputData = "";
	this.pk_ipInputDataLen = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opOutputData = ""; 
	this.pk_opOutputDataLen = 0;
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_DoCrypt.isCalled = false;
		PK_DoCrypt.success = false;
		PK_DoCrypt.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_DoCrypt.isCalled = true;
		
		var retJSON = opJSON.escapeSpecialChars();
		result = JSON.parse(retJSON);
		
		PK_DoCrypt.pk_opOutputData = result.pk_opOutputData;
		PK_DoCrypt.pk_opOutputDataLen = result.pk_opOutputDataLen;
		PK_DoCrypt.pk_opErrorCode = result.pk_opErrorCode;
		PK_DoCrypt.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_DoCrypt.success = true;
			eval(PK_DoCrypt.rootMethod);
			return true;
		}
		
		PK_DoCrypt.success = false;
		if(PK_DoCrypt.showErrorAlert)
		{
			alert("Operation has been failed in PK_DoCrypt function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_DoCrypt.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipOperationType": 0, "pk_ipKeyHandle": 0, "pk_ipSlotId": 0, "pk_ipPincode": "", "pk_ipKeyId": "", "pk_ipRecipsCerts": "", "pk_ipInputData": "", "pk_ipInputDataLen": 0}';
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipOperationType = PK_DoCrypt.pk_ipOperationType;
		ipJSONtmp.pk_ipKeyHandle = PK_DoCrypt.pk_ipKeyHandle;
		ipJSONtmp.pk_ipSlotId = PK_DoCrypt.pk_ipSlotId;
		ipJSONtmp.pk_ipPincode = PK_DoCrypt.pk_ipPincode;
		ipJSONtmp.pk_ipKeyId = PK_DoCrypt.pk_ipKeyId;
		ipJSONtmp.pk_ipRecipsCerts = PK_DoCrypt.pk_ipRecipsCerts;
		ipJSONtmp.pk_ipInputData = PK_DoCrypt.pk_ipInputData;
		ipJSONtmp.pk_ipInputDataLen = PK_DoCrypt.pk_ipInputDataLen;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_DoCrypt', ipJSON, PK_DoCrypt.callBack))
			return false;
		
		return true;
		
	};
}
// ---- End of PK_DoCrypt Class ----

// --- PK_SelectCertificate Class ---
var PK_SelectCertificate = new function()
{
	// --- Define Public Input Variables ---
	this.pk_ipUsage = "";
	
	// --- Define Public Output Variables ---
	this.pk_opCertificate = ""; 
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_SelectCertificate.isCalled = false;
		PK_SelectCertificate.success = false;
		PK_SelectCertificate.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";
		
		PK_SelectCertificate.isCalled = true;
		
		result = JSON.parse(opJSON);
		
		PK_SelectCertificate.pk_opCertificate = result.pk_opCertificate;
		PK_SelectCertificate.pk_opErrorCode = result.pk_opErrorCode;
		PK_SelectCertificate.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_SelectCertificate.success = true;
			eval(PK_SelectCertificate.rootMethod);
			return true;
		}
		
		PK_SelectCertificate.success = false;
		if(PK_SelectCertificate.showErrorAlert)
		{
			alert("Operation has been failed in PK_SelectCertificate function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_SelectCertificate.rootMethod);
			return false;
		}
		
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function ()
	{	
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipUsage": "" }';//KeyUsage::C=F,DIGITAL_SIGNATURE=T,NON_REPUDIATION=T,KEY_ENCIPHERMENT=F,DATA_ENCIPHERMENT=F,KEY_AGREEMENT=F,KEY_CERT_SIGN=F,CRL_SIGN=F,ENCIPHER_ONLY=F,DECIPHER_ONLY=F;ExtendedKeyUsage::C=F,SERVER_AUTH=F,CLIENT_AUTH=F,CODE_SIGN=F,EMAIL_PROTECTION=F,TIME_STAMPING=F,OCSP_SIGN=F,SMART_CARD_LOGIN=F
		var ipJSONtmp = JSON.parse(ipJSON);
		
		ipJSONtmp.pk_ipUsage = PK_SelectCertificate.pk_ipUsage;
		ipJSON = JSON.stringify(ipJSONtmp);
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_SelectCertificate', ipJSON, PK_SelectCertificate.callBack))
			return false;
				
		return true;
		
	};
}
// ---- End of PK_SelectCertificate Class ----

// --- PK_SetSignMech Class ---
var PK_SetSignMech = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSignatureFormat = 0;
	this.pk_ipSignHashAlg = 0;
	this.pk_ipSignMechanism = 0;
	this.pk_ipSaltLen = 0;
	this.pk_ipMgf = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opErrorCode = 0; //= new intObject();
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_SetSignMech.isCalled = false;
		PK_SetSignMech.success = false;
		PK_SetSignMech.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";	
		
		PK_SetSignMech.isCalled = true;
		
		result = JSON.parse(opJSON);
		PK_SetSignMech.pk_opErrorCode = result.pk_opErrorCode;
		PK_SetSignMech.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0 || result.pk_opErrorCode == 1)
		{
			PK_SetSignMech.success = true;
			eval(PK_SetSignMech.rootMethod);
			return true;
		}
		
		PK_SetSignMech.success = false;
		if(PK_SetSignMech.showErrorAlert)
		{
			alert("Operation has been failed in PK_SetSignMech function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_SetSignMech.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSignatureFormat": 0, "pk_ipSignHashAlg": 0 , "pk_ipSignMechanism": 0, "pk_ipSaltLen": 0 , "pk_ipMgf": 0}';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSignatureFormat = PK_SetSignMech.pk_ipSignatureFormat;
		ipJSON_tmp.pk_ipSignHashAlg = PK_SetSignMech.pk_ipSignHashAlg;
		ipJSON_tmp.pk_ipSignMechanism = PK_SetSignMech.pk_ipSignMechanism;
		ipJSON_tmp.pk_ipSaltLen = PK_SetSignMech.pk_ipSaltLen;
		ipJSON_tmp.pk_ipMgf = PK_SetSignMech.pk_ipMgf;
		
		ipJSON = JSON.stringify(ipJSON_tmp);
		ipJSON = ipJSON.escapeSpecialChars();
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_SetSignMech', ipJSON, PK_SetSignMech.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_SetSignMech Class ----

// --- PK_Sign Class ---
var PK_Sign = new function()
 {
	// --- Define Public Input Variables ---
	this.pk_ipSignMethodType = 0;
	this.pk_ipLogoutAfterSign = 0;
	this.pk_ipTbsType = 0;
	this.pk_ipTbsHashAlg = 0;
	this.pk_ipTbs = 0;
	this.pk_ipUsage = 0;
	this.pk_ipSignerKeyId = 0;
	
	// --- Define Public Output Variables ---
	this.pk_opSignerCertificate = "";
	this.pk_opSignature = "";
	this.pk_opErrorCode = 0; 
	this.pk_opErrorMessage = "";
	
	// --- Define Common Public Variables ---
	this.isCalled = false;
	this.success = false;
	this.rootMethod;
	this.showErrorAlert = false;
	
	// --- Define Reset Method To Reset All Flags ---
	this.reset = function ()
	{
		PK_Sign.isCalled = false;
		PK_Sign.success = false;
		PK_Sign.showErrorAlert = false
		
		return true;
	};
	
	// --- Define Call Back Method For Getting Response ---
	this.callBack = function (opJSON)
	{
		var result = "";	
		PK_Sign.isCalled = true;
		
		var retJSON = opJSON.escapeSpecialChars();
		result = JSON.parse(retJSON);
		PK_Sign.pk_opSignerCertificate = result.pk_opSignerCertificate;
		PK_Sign.pk_opSignature = result.pk_opSignature;
		PK_Sign.pk_opErrorCode = result.pk_opErrorCode;
		PK_Sign.pk_opErrorMessage = result.pk_opErrorMessage;
		
		if(result.pk_opErrorCode == 0)
		{
			PK_Sign.success = true;
			eval(PK_Sign.rootMethod);
			return true;
		}
		
		PK_Sign.success = false;
		if(PK_Sign.showErrorAlert)
		{
			alert("Operation has been failed in PK_Sign function due to : " + result.pk_opErrorMessage  + ' (' + result.pk_opErrorCode + ')');
			return false;
		}
		else
		{
			eval(PK_Sign.rootMethod);
			return false;
		}
		
		return true;
	};
	
	// --- Define Call Method To Invocate The Web Method ---
	this.call = function () 
	{
		var ipJSON = "";
		
		// --- Set Input JSON String ---
		ipJSON = '{ "pk_ipSignMethodType": 0, "pk_ipLogoutAfterSign": 0, "pk_ipTbsType": 0, "pk_ipTbsHashAlg": 0, "pk_ipTbs": "", "pk_ipUsage": "", "pk_ipSignerKeyId" : "" }';
		var  ipJSON_tmp = JSON.parse(ipJSON);
		
		ipJSON_tmp.pk_ipSignMethodType = PK_Sign.pk_ipSignMethodType;
		ipJSON_tmp.pk_ipLogoutAfterSign = PK_Sign.pk_ipLogoutAfterSign;
		ipJSON_tmp.pk_ipTbsType = PK_Sign.pk_ipTbsType;
		ipJSON_tmp.pk_ipTbsHashAlg = PK_Sign.pk_ipTbsHashAlg;
		ipJSON_tmp.pk_ipTbs = PK_Sign.pk_ipTbs;
		ipJSON_tmp.pk_ipUsage = PK_Sign.pk_ipUsage;
		ipJSON_tmp.pk_ipSignerKeyId = PK_Sign.pk_ipSignerKeyId;
		
		ipJSON = JSON.stringify(ipJSON_tmp);
		ipJSON = ipJSON.escapeSpecialChars();
		
		// --- Call Web Method ---
		if(!call_pk_method('PK_Sign', ipJSON, PK_Sign.callBack))
			return false;
		
		return true;
	};
}
// ---- End of PK_Sign Class ----
