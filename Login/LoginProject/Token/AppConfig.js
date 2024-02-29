
var AppConfig = new function () {

    this.Params = {};

    this.IsLoaded = false;

    //this.LoadObj = function (callback) {

    //    if ($.isEmptyObject(this.Params)) {
    //        $.ajax({
    //            type: "GET",
    //            url: "../Config/AppConfig1.xml?v=6",
    //            dataType: "xml",
    //            success: function (xml) {
    //                var $xml = $(xml);
    //                $xml.find("Setting").each(function (i, j) {
    //                    var $entry = $(this);
    //                    var Key = $entry.attr('Key');
    //                    var Value = $entry.attr('Value');

    //                    Object.defineProperty(AppConfig.Params, Key, {
    //                        value: Value,
    //                        writable: true,
    //                        enumerable: true,
    //                        configurable: true
    //                    });

    //                });
    //                this.IsLoaded = true;
    //                if (typeof callback === "function") {
    //                    callback();
    //                }
    //            },
    //            error: function (ex) {
    //                alert(ex);
    //            }
    //        });
    //    }
    //    else if (typeof callback === "function") {
    //        callback();
    //    }
    //}

    this.GetParamFromDomainName = function (pParamName, pDomainName) {

        return getParameterByName(pDomainName, pParamName);
    }

    this.GetParam = function (pParamName, pDomainName) {

        return getParameterByName(pDomainName, pParamName);
    }

    function getParameterByName(name, a) {

        var re = '#' + name + '#';
        if (a == undefined)
            a = 1;

        var TmpResult = a.split(re);
        if (TmpResult.length > 1)
            return TmpResult[1];
        else
            return null;
    }
};

/*AppConfig.LoadObj();*/