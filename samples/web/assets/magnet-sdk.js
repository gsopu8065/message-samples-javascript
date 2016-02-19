    /*!*
     * @fileoverview Magnet Max SDK for JavaScript
     *
     * @version 1.0.0-SNAPSHOT
     */

    (function(MagnetJS) {

/**
 * Namespace for the Magnet Max SDK for JavaScript.
 * @namespace MagnetJS
 */

/**
 * @global
 * @desc An object containing attributes used across the MagnetJS SDK.
 * @ignore
 */
MagnetJS.Config = {
    /**
     * @property {string} endpointUrl The host for the Magnet Max Server.
     */
    endpointUrl            : '',
    /**
     * @property {boolean} logging Enable the logging feature.
     */
    logging                : true,
    /**
     * @property {boolean} logging Enable the payload logging feature.
     */
    payloadLogging         : true,
    /**
     * @property {string} logLevel Set the lowest level to log. Lower log levels will be ignore. The order is SEVERE, WARNING,
     * INFO, CONFIG, and FINE.
     */
    logLevel               : 'FINE',
    /**
     * @property {string} logHandler Define the log handler used to handle logs if logging is enabled. Specifying 'DB' stores
     * to the database configured in {MagnetJS.Storage}, 'Console' outputs log via console.log, and 'Console&DB' stores to
     * database and outputs simultaneously.
     */
    logHandler             : 'Console',
    /**
     * @property {boolean} storeCredentials Enable storage of OAuth access token after a successful login.
     * This is required for the LoginService.loginWithAccessToken method, allowing the user to login automatically
     * after a restart of the app. Note that the locally stored access token is not encrypted. The default is false.
     */
    storeCredentials       : false,
    /**
     * @property {boolean} debugMode Ignore self-signed certificates when saving files to the file system. Only applicable
     * to the Phonegap client when using FileTransfer API transport.
     */
    debugMode              : false,
    /**
     * @property {string} sdkVersion Version of the Magnet Mobile SDK for JavaScript.
     */
    sdkVersion             : '1.0.0-SNAPSHOT',
    /**
     * @property {string} securityPolicy Security policy. ['RELAXED', 'STRICT']
     */
    securityPolicy         : 'RELAXED',
    /**
     * @property {string} mmxDomain mmxDomain.
     */
    mmxDomain              : 'mmx',
    /**
     * @property {string} mmxPort mmxPort.
     */
    mmxPort                : 5222,
    /**
     * @property {string} mmxRESTPort mmxRESTPort.
     */
    mmxRESTPort            : 6060,
    /**
     * @property {string} httpBindPort http-bind endpoint for BOSH.
     */
    httpBindEndpoint       : 'http://localhost:7070/http-bind/',
    /**
     * @property {string} mmxHost mmxHost.
     */
    mmxHost                : 'localhost',
    /**
     * @property {string} mmxEndpoint mmxEndpoint.
     */
    mmxEndpoint            : 'http://localhost:7777/api',
    /**
     * @property {string} tlsEnabled Determines whether TLS security enabled.
     */
    tlsEnabled             : false
};

MagnetJS.App = {
    /**
     * @property {boolean} True indicates that the SDK is ready for use.
     */
    initialized: false,
    /**
     * @property {boolean} True indicates the SDK is listening for messages.
     */
    receiving: false,
    /**
     * @property {object} credentials Contains authorization token needed for API
     * authorization.
     */
    credentials: {},
    /**
     * @property {string} clientId Client ID. This value is unique per application.
     */
    clientId: false,
    /**
     * @property {string} clientSecret Client secret. This value is unique per application.
     */
    clientSecret: false,
    /**
     * @property {string} appId Application id.
     */
    appId: null,
    /**
     * @property {string} appAPIKey Application API key.
     */
    appAPIKey: null,
    /**
     * @property {string} gcmSenderId GCM sender ID.
     */
    gcmSenderId: null
};

/**
 * A class containing general utility functions used across the MagnetJS SDK.
 * @memberof MagnetJS
 * @namespace Utils
 * @ignore
 */
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
MagnetJS.Utils = {
    /**
     * Indicates whether the current browser is an Android device.
     */
    isAndroid : (typeof navigator !== 'undefined' && navigator.userAgent) ? /Android|webOS/i.test(navigator.userAgent) : false,
    /**
     * Indicates whether the current browser is an iOS device.
     */
    isIOS : (typeof navigator !== 'undefined' && navigator.userAgent) ? /iPhone|iPad|iPod/i.test(navigator.userAgent) : false,
    /**
     * Indicates whether the current browser is an iOS or Android device.
     */
    isMobile : (typeof navigator !== 'undefined' && navigator.userAgent) ? /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) : false,
    /**
     * Indicates whether the current client is a Node.js server.
     */
    isNode : (typeof module !== 'undefined' && module.exports && typeof window === 'undefined'),
    /**
     * Indicates whether the current client is a Cordova app.
     */
    isCordova : (typeof navigator !== 'undefined' && navigator.userAgent) &&
        (typeof window !== 'undefined' && window.location && window.location.href) &&
        (typeof cordova !== 'undefined' || typeof PhoneGap !== 'undefined' || typeof phonegap !== 'undefined') &&
        /^file:\/{3}[^\/]/i.test(window.location.href) &&
        /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent),
    /**
     * Merges the attributes of the second object into the first object.
     * @param {object} obj1 The first object, into which the attributes will be merged.
     * @param {object} obj2 The second object, whose attributes will be merged into the first object.
     */
    mergeObj : function(obj1, obj2) {
        var obj1 = obj1 || {};
        var obj2 = obj2 || {};
        for(var p in obj2) {
            try{
                if (obj2[p].constructor == Object) {
                    obj1[p] = this.mergeObj(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            }catch(e) {
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    },
    /**
     * Determines whether the input is a JavaScript object.
     * @param {*} input The input to check.
     */
    isObject : function(input) {
        return Object.prototype.toString.call(input) == "[object Object]";
    },
    /**
     * Determines whether the input is a JavaScript array.
     * @param {*} input The input to check.
     */
    isArray : function(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    },
    /**
     * Convert the specified string to JSON if successful; otherwise returns false.
     * @param {string} str The input to convert.
     */
    getValidJSON : function(str) {
        try{
            str = JSON.parse(str);
        }catch(e) {
            return false;
        }
        return str;
    },
    /**
     * Convert the specified string to XML if successful; otherwise returns false.
     * @param {string} str The input to convert.
     */
    getValidXML : function(str) {
        if (!this.parseXml) {
            if (window.DOMParser) {
                this.parseXml = function(str) {
                    return (new window.DOMParser()).parseFromString(str, 'text/xml');
                };
            } else if (typeof window.ActiveXObject != 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
                this.parseXml = function(str) {
                    var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
                    xmlDoc.async = 'false';
                    xmlDoc.loadXML(str);
                    return xmlDoc;
                };
            }
        }
        try{
            str = this.parseXml(str);
        }catch(e) {
            return false;
        }
        return str;
    },
    /**
     * Convert the specified object into Form Data.
     * @param {string} str The input to convert.
     * @returns {string} A Form Data string.
     */
    objectToFormdata : {
        stringify : function(input) {
            if (MagnetJS.Utils.isObject(input)) {
                var ary = [];
                for(var key in input) {
                    if (input.hasOwnProperty(key) && input[key] != null)
                        ary.push(key+'='+encodeURIComponent(input[key]));
                }
                return ary.join('&');
            }
            return '';
        }
    },
    /**
     * Retrieve all attribute names of the specified object as an array.
     * @param {object} obj The object to parse.
     */
    getAttributes : function(obj) {
        var ary = [];
        obj = obj || {};
        for(var attr in obj) {
            if (obj.hasOwnProperty(attr)) ary.push(attr);
        }
        return ary;
    },
    /**
     * Retrieve all properties of the specified object as an array.
     * @param {object} obj The object to parse.
     */
    getValues : function(obj) {
        var ary = [];
        obj = obj || {};
        for(var attr in obj) {
            if (obj.hasOwnProperty(attr)) ary.push(obj[attr]);
        }
        return ary;
    },
    /**
     * Indicates whether the specified object is empty.
     * @param {object} obj The object to check.
     */
    isEmptyObject : function(obj) {
        if (!obj || typeof obj === 'string' || typeof obj === 'boolean' || this.isNumeric(obj)) {
            return true;
        }
        if (!obj.hasOwnProperty) {
            for(var i in obj) {
                return false;
            }
            return true;
        } else {
            for(var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        }
    },
    /**
     * Convert XHR and response headers into a JavaScript object.
     * @param {object} xhr The XMLHTTPRequest object to convert.
     */
    convertHeaderStrToObj : function(xhr) {
        var obj = {};
        // for IE9+ and webkit browsers - faster performance
        if (Object.keys(xhr).forEach) {
            Object.keys(xhr).forEach(function(prop) {
                if ((typeof xhr[prop] == 'string' || typeof xhr[prop] == 'number' || typeof xhr[prop] == 'boolean') && prop != 'responseText') {
                    obj[prop] = xhr[prop];
                }
            });
        } else {
            for(var prop in xhr) {
                if ((typeof xhr[prop] == 'string' || typeof xhr[prop] == 'number' || typeof xhr[prop] == 'boolean') && prop != 'responseText') {
                    obj[prop] = xhr[prop];
                }
            }
        }
        var ary = xhr.getAllResponseHeaders().split('\n');
        for(var i in ary) {
            var prop = ary[i].trim().split(': ');
            if (prop.length > 1) {
                obj[prop[0]] = prop[1];
            }
        }
        return obj;
    },
    /**
     * Determines whether the input is numeric.
     * @param {*} input The input to check.
     */
    isNumeric : function(input) {
        return !isNaN(parseFloat(input)) && isFinite(input);
    },
    /**
     * Remove attributes not defined in the specified schema and returns the corresponding set of entity attributes.
     * @param {object} schema The controller or model schema consistent with the server.
     * @param {object} obj The current set of entity attributes.
     */
    cleanData : function(schema, obj) {
        var result = {};
        for(var attr in schema) {
            if (schema.hasOwnProperty(attr) && obj[attr])
                result[attr] = obj[attr];
        }
        return result;
    },
    /**
     * Handles basic validation of object attributes based on the specified schema.
     * @param {object} schema The controller or model schema consistent with the server.
     * @param {object} attributes The current set of controller or model attributes.
     * @param {boolean} isUpdate If enabled, do not fail validation on missing required fields. Default is disabled (false).
     * @returns {object|boolean} An array of invalid property objects, or false if validation passes.
     */
    validate : function(schema, attributes, isUpdate) {
        var invalid = [], obj;
        attributes = attributes || {};
        for(var attr in schema) {
            if (schema.hasOwnProperty(attr)) {
                obj = {
                    attribute : attr
                };
                var type = schema[attr].type;
                if (typeof schema !== 'undefined' && typeof schema[attr] !== 'undefined' && typeof schema[attr].type !== 'undefined')
                    type = type.trim();
                if (schema[attr].optional === false && (typeof attributes[attr] === 'undefined' || attributes[attr] === '')) {
                    if (!isUpdate) obj.reason = 'required field blank';
                } else if (attributes[attr] && ((type == 'integer' || type == 'biginteger' || type == 'bigdecimal' || type == 'double' || type == 'long' || type == 'float' || type == 'short' || type == 'byte') && !MagnetJS.Utils.isNumeric(attributes[attr]))) {
                    obj.reason = 'not numeric';
                } else if (attributes[attr] && type == 'boolean' && attributes[attr] !== 'true' && attributes[attr] !== true && attributes[attr] !== 'false' && attributes[attr] !== false) {
                    obj.reason = 'not boolean';
                } else if (attributes[attr] && (type == 'java.util.List' ||  type == 'array') && (!attributes[attr] || attributes[attr].length == 0 || this.isArray(attributes[attr]) === false)) {
                    obj.reason = 'empty list';
                } else if (attributes[attr] && (type == '_data' || type == 'binary') && (!attributes[attr].mimeType || !attributes[attr].val)) {
                    obj.reason = 'invalid binary format';
                }
                if (obj.reason) invalid.push(obj);
            }
        }
        return invalid.length == 0 ? false : invalid;
    },
    /**
     * Determines whether the specified feature is available in the current browser or mobile client.
     * @param {string} str Name of a global variable.
     */
    hasFeature : function(str) {
        try{
            return str in window && window[str] !== null;
        } catch(e) {
            return false;
        }
    },
    /**
     * Determines whether the specified attribute is a primitive type.
     * @param {string} str The attribute type.
     */
    isPrimitiveType : function(str) {
        return '|byte|short|int|long|float|double|boolean|char|string|integer|void|'.indexOf('|'+str+'|') != -1;
    },
    /**
     * Determines whether the specified attribute is an array type. If its type is an array, the type of data in the array is returned; otherwise returns false.
     * @param {string} str The attribute type.
     */
    getArrayType : function(str) {
        return str.indexOf('[]') != -1 ? str.slice(0, -2) : false;
    },
    /**
     * Determines the data type for the specified attribute type.
     * @param {string} str The attribute type.
     */
    getDataType : function(str) {
        var type;
        switch(Object.prototype.toString.call(str)) {
            case '[object Number]'    : type = 'integer'; break;
            case '[object String]'    : type = 'string'; break;
            case '[object Array]'     : type = 'array'; break;
            case '[object Object]'    : type = 'object'; break;
            case '[object Date]'      : type = 'date'; break;
            case '[object Boolean]'   : type = 'boolean'; break;
        }
        return type;
    },
    /**
     * Determines whether the specified attribute is of type date.
     * @param {string} str The attribute type.
     */
    isDateType : function(str) {
        return ('|date|'.indexOf('|'+str+'|') != -1) === true;
    },
    /**
     * Determines whether the specified attribute is of type binary.
     * @param {string} str The attribute type.
     */
    isBinaryType : function(str) {
        return ('|binary|_data|'.indexOf('|'+str+'|') != -1) === true;
    },
    /**
     * Determines whether the specified attribute is a generic object type.
     * @param {string} str The attribute type.
     */
    isGenericObject : function(str) {
        return ('|object|'.indexOf('|'+str+'|') != -1) === true;
    },
    /**
     * Determines whether the specified attribute is of type Model or Collection.
     * @param {string} str The attribute type.
     */
    isModelOrCollection : function(str) {
        return (MagnetJS.Models[str] || MagnetJS.Models[this.getArrayType(str)]) ? true : false;
    },
    /**
     * Converts the specified Date object as an ISO 8601 Extended Format string. This is a shim for clients that do not support .toISOString.
     * @param {Date} date The Date object to be converted to an ISO 8601 Extended Format string.
     * @returns {string} An equivalent ISO 8601 Extended Format string.
     */
    dateToISO8601 : function(d) {
        function pad(n) {return n<10 ? '0'+n : n}
        return d.getUTCFullYear()+'-'
            + pad(d.getUTCMonth()+1)+'-'
            + pad(d.getUTCDate())+'T'
            + pad(d.getUTCHours())+':'
            + pad(d.getUTCMinutes())+':'
            + pad(d.getUTCSeconds())+'Z';
    },
    /**
     * Converts the specified Date string as an ISO 8601 Extended Format Date object.
     * @param {string} str An ISO 8601 Extended Format date string.
     * @returns {object} A Date object equivalent to the specified ISO 8601 Extended Format string.
     */
    ISO8601ToDate : function(str) {
        if (typeof str !== 'string') return false;
        var re = /(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(\.\d+)?(Z|([+-])(\d\d):(\d\d))/;
        var d = [];
        d = str.match(re);
        if (!d) {
            MagnetJS.Log.fine("Couldn't parse ISO 8601 date string '" + str + "'");
            return false;
        }
        var a = [1,2,3,4,5,6,10,11];
        for(var i in a) d[a[i]] = parseInt(d[a[i]], 10);
        d[7] = parseFloat(d[7]);
        var ms = Date.UTC(d[1], d[2] - 1, d[3], d[4], d[5], d[6]);
        if (d[7] > 0) ms += Math.round(d[7] * 1000);
        if (d[8] != "Z" && d[10]) {
            var offset = d[10] * 60 * 60 * 1000;
            if (d[11]) offset += d[11] * 60 * 1000;
            if (d[9] == "-") ms -= offset;
            else ms += offset;
        }
        return new Date(ms);
    },
    /**
     * Convert a UTF-8 string into URI-encoded base64 string.
     * @param input A UTF-8 string.
     * @returns {string} An equivalent URI-encoded base64 string.
     */
    stringToBase64 : function(input) {
        return (this.isNode === true && typeof Buffer !== 'undefined') ? new Buffer(input).toString('base64') : window.btoa(unescape(encodeURIComponent(input)));
    },
    /**
     * Convert a URI-encoded base64 string into a UTF-8 string.
     * @param input A URI-encoded base64 string.
     * @returns {string} An equivalent UTF-8 string.
     */
    base64ToString : function(input) {
        return (this.isNode === true && typeof Buffer !== 'undefined') ? new Buffer(input, 'base64').toString('utf8') : decodeURIComponent(escape(window.atob(input)));
    },
    /**
     * Generate a GUID.
     * @returns {string} A new GUID.
     */
    getGUID : function() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    },
    /**
     * Generate a GUID without hyphen.
     * @returns {string} A new GUID.
     */
    getCleanGUID: function() {
        return this.getGUID().replace(/-/g, '');
    },
    /**
     * Collect browser and version.
     * @returns {string} browser and version.
     */
    getBrowser : function() {
        //browser
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browser = navigator.appName;
        var version = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(verOffset + 5);
        }
        // EDGE
        else if (nAgt.indexOf('Edge/') != -1) {
            browser = 'Microsoft Edge';
            version = nAgt.substring(nAgt.indexOf('Edge/') + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Microsoft Internet Explorer';
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        // mobile version
        var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

        return browser + ' ' + version + ' (' + majorVersion + ') ' + (mobile || '');
    },
    /**
     * Collect operating system and version.
     * @returns {string} operating system and version.
     */
    getOS : function() {
        var osVersion = '-';
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;

        // system
        var os = '-';
        var clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                break;

            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                break;
        }

        return {
            os: os,
            osVersion: osVersion
        };
    }
};

/**
 * @class A simple implementation of the Promise API. A Promise object manages state and facilitates a callback after
 * all the associated asynchronous actions of a Deferred object have completed. Multiple promises can be chained with
 * the 'then' function.
 * @constructor
 */
MagnetJS.Promise = function() {
    this.successes = [];
    this.failures = [];
    this.completions = [];
};

MagnetJS.Promise.prototype = {
    successes   : null,
    failures    : null,
    completions : null,
    status      : 'pending',
    args        : null,
    _isPromise  : true,
    /**
     * Stores success and error callbacks, and calls them if the Promise status is 'resolved' or 'rejected'.
     * @param success A callback that is fired upon a 'resolved' status.
     * @param error A callback that is fired upon a 'rejected' status.
     * @returns {MagnetJS.Promise} A promise object.
     */
    then : function(success, error) {
        var defer = new MagnetJS.Deferred();
        if (success)
            this.successes.push({
                fn    : success,
                defer : defer
            });
        if (error)
            this.failures.push({
                fn    : error,
                defer : defer
            });
        if (this.status === 'resolved')
            this.exec({
                fn    : success,
                defer : defer
            }, this.args);
        else if (this.status === 'rejected')
            this.exec({
                fn    : error,
                defer : defer
            }, this.args);
        return defer.promise;
    },
    /**
     * Stores a single callback and calls it regardless of whether Promise status is 'resolved' or 'rejected'.
     * @param callback A callback that is fired upon completion.
     * @returns {MagnetJS.Promise} A promise object.
     */
    always : function(callback) {
        var defer = new MagnetJS.Deferred();
        if (callback)
            this.completions.push({
                fn    : callback,
                defer : defer
            });
        if (this.status === 'resolved' || this.status === 'rejected')
            this.exec({
                fn    : callback,
                defer : defer
            }, this.args);
        return defer.promise;
    },
    /**
     * Stores a callback which is fired if the Promise is resolved.
     * @param {function} success A success callback.
     * @returns {MagnetJS.Promise}
     */
    success : function(success) {
        var defer = new MagnetJS.Deferred();
        if (success)
            this.successes.push({
                fn    : success,
                defer : defer
            });
        if (this.status === 'resolved')
            this.exec({
                fn    : success,
                defer : defer
            }, this.args);
        return this;
    },
    /**
     * Stores a callback that is fired if the Promise is rejected.
     * @param {function} error The error callback to be stored.
     * @returns {MagnetJS.Promise} A promise object.
     */
    error : function(error) {
        var defer = new MagnetJS.Deferred();
        if (error)
            this.failures.push({
                fn    : error,
                defer : defer
            });
        if (this.status === 'rejected')
            this.exec({
                fn    : error,
                defer : defer
            }, this.args);
        return this;
    },
    /**
     * Call and resolve a callback. If the result is a Promise object, bind a
     * new set of callbacks to the Promise object to continue the chain.
     * @param {object} obj An object containing the callback function and a Deferred object.
     * @param {*} args Arguments associated with this Promise.
     */
    exec : function(obj, args) {
        setTimeout(function() {
            var res = obj.fn.apply(null, args);
            if (MagnetJS.Utils.isObject(res) && res._isPromise)
                obj.defer.bind(res);
        }, 0);
    }
};
/**
 * @class A Deferred object handles execution of resolve and reject methods, which trigger the success or error callbacks.
 * @constructor
 */
MagnetJS.Deferred = function() {
    this.promise = new MagnetJS.Promise();
};
MagnetJS.Deferred.prototype = {
    promise : null,
    /**
     * Resolve the Deferred object.
     */
    resolve : function() {
        var i, promise = this.promise;
        promise.args = arguments;
        promise.status = 'resolved';
        for(i=0;i<promise.successes.length;++i)
            promise.exec(promise.successes[i], promise.args)
        for(i=0;i<promise.completions.length;++i)
            promise.exec(promise.completions[i], promise.args)
    },
    /**
     * Reject the Deferred object.
     */
    reject : function() {
        var i, promise = this.promise;
        promise.args = arguments;
        promise.status = 'rejected';
        for(i=0;i<promise.failures.length;++i)
            promise.exec(promise.failures[i], promise.args)
        for(i=0;i<promise.completions.length;++i)
            promise.exec(promise.completions[i], promise.args)
    },
    /**
     * Bind a new set of callbacks to be fired upon completion of the Promise.
     */
    bind : function(promise) {
        var me = this;
        promise.then(function() {
            me.resolve.apply(me, arguments);
        }, function() {
            me.reject.apply(me, arguments);
        })
    }
};
/**
 * Asynchronously execute the specified promises. On completion, return an array of success and error arguments in a 'then' function.
 * @param {MagnetJS.Promise} promises An object containing the specified promises.
 */
MagnetJS.Deferred.all = function() {
    var deferred = new MagnetJS.Deferred();
    var successes = [], failures = [], ctr = 0, total = arguments.length;
    for(var i=0;i<total;++i) {
        arguments[i].call(null).then(function() {
            successes.push(arguments);
            if (++ctr == total) deferred.resolve(successes, failures);
        }, function() {
            failures.push(arguments);
            if (++ctr == total) deferred.resolve(successes, failures);
        });
    }
    return deferred.promise;
};

/**
 * A class for extending an object with an event.
 * @memberof MagnetJS
 * @namespace Events
 * @ignore
 */
MagnetJS.Events = {
    /**
     * Extends an existing object to handle events.
     * @param {object} me An instance of a MagnetJS Controller.
     * @returns {boolean} Indicates whether the event handlers were created.
     */
    create : function(me) {
        if (!me._events && !me.invoke && !me.on && !me.unbind) {
            me._events = {};
            me.on = function(eventId, callback) {
                me._events[eventId] = me._events[eventId] || [];
                me._events[eventId].push(callback);
            };
            me.invoke = function(events) {
                if (typeof events === typeof []) {
                    for(var i=events.length;i--;) {
                        if (me._events[events[i]]) {
                            for(var j=me._events[events[i]].length;j--;) {
                                me._events[events[i]][j].apply(this, [].slice.call(arguments, 1));
                            }
                        }
                    }
                } else {
                    if (me._events[events]) {
                        for(var k=me._events[events].length;k--;) {
                            me._events[events][k].apply(this, [].slice.call(arguments, 1));
                        }
                    }
                }
            };
            me.unbind = function(eventId) {
                if (me._events[eventId]) delete me._events[eventId];
            };
            return true;
        } else {
            return false;
        }
    }
};

/**
 * A connector to manage data in a Web SQL database.
 * @memberof MagnetJS
 * @namespace SQLConnector
 * @ignore
 */
MagnetJS.SQLConnector = {
    /**
     * @attribute {Database} [db] An SQL Lite database object.
     */
    db : undefined,
    schemas : {},
    /**
     * @attribute {object} dbOptions SQL Lite database options.
     */
    dbOptions : {
        name    : 'MMSDK',
        version : '1.0',
        display : 'Magnet_JS_SDK_DB',
        size    : 5000000
    },
    create : function(table, kvp, callback, failback) {
        var me = this;
        me.db.transaction(function(tx) {
            var props = MagnetJS.Utils.getAttributes(kvp).join(', ');
            var vals = MagnetJS.Utils.getValues(kvp);
            MagnetJS.Log('INSERT INTO '+table+' ('+props+') VALUES ('+me.getPlaceholders(vals)+')', vals);
            tx.executeSql('INSERT INTO '+table+' ('+props+') VALUES ('+me.getPlaceholders(vals)+')', vals, function(insertTX, res) {
                kvp.id = res.insertId;
                callback(kvp);
            });
        }, function(e) {
            MagnetJS.Log('error inserting a record: ', e);
            failback(e);
        });
    },
    update : function(table, id, kvp, callback, failback) {
        this.db.transaction(function(tx) {
            delete kvp.id;
            var props = MagnetJS.Utils.getAttributes(kvp).join('=?, ')+'=?';
            var vals = MagnetJS.Utils.getValues(kvp);
            vals.push(id);
            MagnetJS.Log('UPDATE '+table+' SET '+props+' WHERE id=?', vals);
            tx.executeSql('UPDATE '+table+' SET '+props+' WHERE id=?', vals, function() {
                callback(kvp);
            });
        }, function(e) {
            MagnetJS.Log('error updating a record: ', e);
            failback(e);
        });
    },
    get : function(table, input, callback, failback) {
        var me = this;
        me.db.transaction(function(tx) {
            if (typeof input === 'undefined' || input === null || input === '') input = {1:1};
            var props, vals, isQuery = typeof input === 'object';
            if (isQuery) {
                props = MagnetJS.Utils.getAttributes(input).join('=? AND ')+'=?';
                vals = MagnetJS.Utils.getValues(input);
            } else {
                props = 'id=?';
                vals = [input];
            }
            MagnetJS.Log('SELECT * FROM '+table+' WHERE '+props, vals);
            tx.executeSql('SELECT * FROM '+table+' WHERE '+props, vals, function(tx, results) {
                callback(me.formatResponse(results.rows, isQuery));
            }, function(e) {
                MagnetJS.Log('error retrieving records: ', e);
                failback(e);
            });
        }, function(e) {
            MagnetJS.Log('error setting up web sql transaction: ', e);
            failback(e);
        });
    },
    formatResponse : function(rows, isQuery) {
        var ary = [];
        for(var i=0;i<rows.length;++i)
            ary.push(rows.item(i));
        return isQuery ? ary : ary[0];
    },
    remove : function(table, input, callback, failback) {
        var me = this;
        me.db.transaction(function(tx) {
            var props = [], vals = [], aryProps = [], aryVals = [];
            if (typeof input === 'object') {
                for(var prop in input) {
                    if (MagnetJS.Utils.isArray(input[prop])) {
                        aryProps.push(prop+' IN ('+me.getPlaceholders(input[prop])+')');
                        aryVals = aryVals.concat(MagnetJS.Utils.getValues(input[prop]));
                    } else {
                        props.push(prop+'=?');
                        vals.push(input[prop]);
                    }
                }
                props = props.concat(aryProps).join(' AND ');
                vals = vals.concat(aryVals);
            } else {
                props = 'id=?';
                vals = [input];
            }
            MagnetJS.Log('DELETE FROM '+table+' WHERE '+props, vals);
            tx.executeSql('DELETE FROM '+table+' WHERE '+props, vals);
        }, function(e) {
            MagnetJS.Log('error deleting a record: ', e);
            failback(e);
        }, callback);
    },
    clearTable : function(table, callback, failback) {
        this.db.transaction(function(tx) {
            MagnetJS.Log('DELETE FROM '+table);
            tx.executeSql('DELETE FROM '+table);
        }, function(e) {
            MagnetJS.Log('error clearing table: ', e);
            failback(e);
        }, callback);
    },
    createTableIfNotExist : function(table, schema, kvps, clearRecords, callback, failback) {
        var me = this, props, vals, columns = ['id INTEGER PRIMARY KEY AUTOINCREMENT'];
        if (typeof schema === 'object') {
            for(var prop in schema)
                columns.push(prop+' '+schema[prop]);
            columns = columns.join(', ');
            me.schemas[table] = schema;
        }
        me.db.transaction(function(tx) {
            MagnetJS.Log('CREATE TABLE IF NOT EXISTS '+table+' ('+columns+')');
            tx.executeSql('CREATE TABLE IF NOT EXISTS '+table+' ('+columns+')');
            if (clearRecords === true) {
                MagnetJS.Log('DELETE FROM '+table);
                tx.executeSql('DELETE FROM '+table);
            }
            if (MagnetJS.Utils.isArray(kvps)) {
                for(var i=0;i<kvps.length;++i) {
                    props = MagnetJS.Utils.getAttributes(kvps[i]).join(', ');
                    vals = MagnetJS.Utils.getValues(kvps[i]);
                    MagnetJS.Log('INSERT INTO '+table+' ('+props+') VALUES ('+me.getPlaceholders(vals)+')', vals);
                    tx.executeSql('INSERT INTO '+table+' ('+props+') VALUES ('+me.getPlaceholders(vals)+')', vals);
                }
            } else if (kvps) {
                props = MagnetJS.Utils.getAttributes(kvps).join(', ');
                vals = MagnetJS.Utils.getValues(kvps);
                MagnetJS.Log('INSERT INTO '+table+' ('+props+') VALUES ('+me.getPlaceholders(vals)+')', vals);
                tx.executeSql('INSERT INTO '+table+' ('+props+') VALUES ('+me.getPlaceholders(vals)+')', vals);
            }
        }, function(e) {
            MagnetJS.Log('error executing web sql transaction: ', e);
            failback(e);
        }, callback);
    },
    getPlaceholders : function(vals) {
        var ques = [];
        for(var i=0;i<vals.length;++i) ques.push('?');
        return ques.join(', ');
    }
};
/**
 * A connector to manage data in a local storage database.
 * @memberof MagnetJS
 * @namespace LocalStorage
 * @ignore
 */
MagnetJS.LocalStorageConnector = {
    create : function(table, kvp, callback) {
        setTimeout(function() {
            var tableData = MagnetJS.Utils.getValidJSON(window.localStorage.getItem(table)) || [];
            kvp.id = MagnetJS.Utils.getGUID();
            tableData.push(kvp);
            window.localStorage.setItem(table, JSON.stringify(tableData));
            callback(kvp);
        }, 1);
    },
    update : function(table, id, kvp, callback, failback) {
        var record;
        setTimeout(function() {
            var tableData = MagnetJS.Utils.getValidJSON(window.localStorage.getItem(table));
            if (tableData) {
                for(var i=0;i<tableData.length;++i) {
                    if (tableData[i].id == id) {
                        for(var key in kvp)
                            tableData[i][key] = kvp[key];
                        record = tableData[i];
                    }
                }
                if (typeof record === 'undefined') {
                    failback('record-not-exist');
                } else {
                    window.localStorage.setItem(table, JSON.stringify(tableData));
                    callback(record);
                }
            } else {
                failback('table-not-exist');
            }
        }, 1);
    },
    get : function(table, input, callback, failback) {
        var records = [], valid = true;
        setTimeout(function() {
            var tableData = MagnetJS.Utils.getValidJSON(window.localStorage.getItem(table));
            if (tableData) {
                if (typeof input === 'object') {
                    for(var i=0;i<tableData.length;++i) {
                        for(var key in input)
                            if (tableData[i][key] !== input[key])
                                valid = false;
                        if (valid === true) records.push(tableData[i]);
                        valid = true;
                    }
                } else if (typeof input === 'undefined' || input === null || input === '') {
                    records = tableData;
                } else {
                    records = undefined;
                    for(var i=0;i<tableData.length;++i) {
                        if (tableData[i].id == input) {
                            records = tableData[i];
                            break;
                        }
                    }
                }
                callback(records);
            } else {
                failback('table-not-exist');
            }
        }, 1);
    },
    remove : function(table, input, callback, failback) {
        var matched = true;
        setTimeout(function() {
            var tableData = MagnetJS.Utils.getValidJSON(window.localStorage.getItem(table));
            if (tableData) {
                for(var i=tableData.length;i--;) {
                    if (typeof input === 'object') {
                        matched = true;
                        for(var prop in input) {
                            if (MagnetJS.Utils.isArray(input[prop])) {
                                if (input[prop].indexOf(tableData[i][prop]) == -1) matched = false;
                            } else {
                                if (tableData[i][prop] !== input[prop]) matched = false;
                            }
                        }
                        if (matched) tableData.splice(i, 1);
                    } else {
                        if (tableData[i].id == input) tableData.splice(i, 1);
                    }
                }
                window.localStorage.setItem(table, JSON.stringify(tableData));
                callback();
            } else {
                failback('table-not-exist');
            }
        }, 1);
    },
    clearTable : function(table, callback) {
        setTimeout(function() {
            window.localStorage.setItem(table, JSON.stringify([]));
            callback();
        }, 1);
    },
    createTableIfNotExist : function(table, schema, kvps, clearRecords, callback) {
        setTimeout(function() {
            var tableData = (clearRecords === true ? [] : MagnetJS.Utils.getValidJSON(window.localStorage.getItem(table))) || [];
            if (MagnetJS.Utils.isArray(kvps)) {
                for(var i=0;i<kvps.length;++i) {
                    kvps[i].id = MagnetJS.Utils.getGUID();
                    tableData.push(kvps[i]);
                }
            } else if (kvps) {
                kvps.id = MagnetJS.Utils.getGUID();
                tableData.push(kvps);
            }
            window.localStorage.setItem(table, JSON.stringify(tableData));
            callback();
        }, 1);
    }
};
/**
 * A connector to manage data in non-persistent memory store.
 * @memberof MagnetJS
 * @namespace SQLConnector
 * @ignore
 */
MagnetJS.MemoryStoreConnector = {
    /**
     * @attribute {object} memory Memory store for Node.js and other platforms which do not support localStorage.
     */
    memory : {},
    create : function(table, kvp, callback) {
        this.memory[table] = this.memory[table] || [];
        kvp.id = MagnetJS.Utils.getGUID();
        this.memory[table].push(kvp);
        callback(kvp);
    },
    update : function(table, id, kvp, callback, failback) {
        var record;
        if (this.memory[table]) {
            for(var i=0;i<this.memory[table].length;++i) {
                if (this.memory[table][i].id === id) {
                    for(var key in kvp)
                        this.memory[table][i][key] = kvp[key];
                    record = this.memory[table][i];
                }
            }
            if (typeof record === 'undefined')
                failback('record-not-exist');
            else
                callback(record);
        } else {
            failback('table-not-exist');
        }
    },
    get : function(table, input, callback, failback) {
        var records = [], valid = true;
        if (this.memory[table]) {
            if (typeof input === 'object') {
                for(var i=0;i<this.memory[table].length;++i) {
                    for(var key in input)
                        if (this.memory[table][i][key] !== input[key])
                            valid = false;
                    if (valid === true) records.push(this.memory[table][i]);
                    valid = true;
                }
            } else if (typeof input === 'undefined' || input === null || input === '') {
                records = this.memory[table];
            } else {
                records = undefined;
                for(var i=0;i<this.memory[table].length;++i) {
                    if (this.memory[table][i].id == input) {
                        records = this.memory[table][i];
                        break;
                    }
                }
            }
            callback(records);
        } else {
            failback('table-not-exist');
        }
    },
    remove : function(table, input, callback, failback) {
        var matched = true;
        if (this.memory[table]) {
            for(var i=this.memory[table].length;i--;) {
                if (typeof input === 'object') {
                    matched = true;
                    for(var prop in input) {
                        if (MagnetJS.Utils.isArray(input[prop])) {
                            if (input[prop].indexOf(this.memory[table][i][prop]) == -1)
                                matched = false;
                        } else {
                            if (this.memory[table][i][prop] !== input[prop])
                                matched = false;
                        }
                    }
                    if (matched) this.memory[table].splice(i, 1);
                } else {
                    if (this.memory[table][i].id == input) {
                        this.memory[table].splice(i, 1);
                    }
                }
            }
            callback();
        } else {
            failback('table-not-exist');
        }
    },
    clearTable : function(table, callback) {
        this.memory[table] = [];
        callback();
    },
    createTableIfNotExist : function(table, schema, kvps, clearRecords, callback) {
        this.memory[table] = (clearRecords === true ? [] : this.memory[table]) || [];
        if (MagnetJS.Utils.isArray(kvps)) {
            for(var i=0;i<kvps.length;++i) {
                kvps[i].id = MagnetJS.Utils.getGUID();
                this.memory[table].push(kvps[i]);
            }
        } else if (kvps) {
            kvps.id = MagnetJS.Utils.getGUID();
            this.memory[table].push(kvps);
        }
        callback();
    }
};

/**
 * A class for storing a value into persistent storage. Currently relies on HTML5 localStorage.
 * Clients that do not support localStorage will fall back to a memory store that will not persist past a
 * restart of the app.
 * @memberof MagnetJS
 * @namespace Storage
 * @ignore
 */
MagnetJS.Storage = {
    /**
     * @attribute {object} connector The data connector to be used.
     */
    connector : MagnetJS.MemoryStoreConnector,
    /**
     * Create an object.
     * @param {string} table The table in the database.
     * @param {*} kvp An object containing values to set on the object.
     */
    create : function(table, kvp, callback, failback) {
        this.connector.create(table, kvp, function(record) {
            if (typeof callback === typeof Function)
                callback(record);
        }, function(e) {
            if (typeof failback === typeof Function)
                failback(e);
        });
    },
    /**
     * Update values of the object corresponding to the specified ID.
     * @param {string} table The table in the database.
     * @param {*} id The unique identifier of the object to set.
     * @param {*} kvp An object containing values to set on the object.
     */
    update : function(table, id, kvp, callback, failback) {
        this.connector.update(table, id, kvp, function(record) {
            if (typeof callback === typeof Function)
                callback(record);
        }, function(e) {
            if (typeof failback === typeof Function)
                failback(e);
        });
    },
    /**
     * Get an object using an ID or a query. A query is an object of properties, each containing an array of property matches. For example, {"foo":"a1"]}.
     * @param {string} table The table in the database.
     * @param {string|object} input An ID or a query object containing the required matches.
     */
    get : function(table, input, callback, failback) {
        this.connector.get(table, input, function(records) {
            if (typeof callback === typeof Function)
                callback(records);
        }, function(e) {
            if (typeof failback === typeof Function)
                failback(e);
        });
    },
    /**
     * Remove an object using an ID or a query. A query is an object of properties, each containing an array of property matches. For example, {"foo":"a1"]}.
     * @param {string} table The table in the database.
     * @param {*} id The unique identifier of the object to remove.
     */
    remove : function(table, input, callback, failback) {
        this.connector.remove(table, input, function() {
            if (typeof callback === typeof Function)
                callback();
        }, function(e) {
            if (typeof failback === typeof Function)
                failback(e);
        });
    },
    /**
     * Clear a table.
     * @param {string} table The table in the database.
     */
    clearTable : function(table, callback, failback) {
        this.connector.clearTable(table, function() {
            if (typeof callback === typeof Function)
                callback();
        }, function(e) {
            if (typeof failback === typeof Function)
                failback(e);
        });
    },
    /**
     * Retrieve or create a keystore, and return it.
     * @param {string} table The table in the database.
     * @param {object} schema An object containing the property types.
     * @param {object|array} [kvps] An array of objects to add to the table, or a single object.
     * @param {boolean} [clearTable] If enabled, the table will be cleared.
     */
    createTableIfNotExist : function(table, schema, kvps, clearTable, callback, failback) {
        this.connector.createTableIfNotExist(table, schema, kvps, clearTable, function() {
            if (typeof callback === typeof Function)
                callback();
        }, function(e) {
            if (typeof failback === typeof Function)
                failback(e);
        });
    },
    /**
     * Selects the best storage persister available to be used by the platform.
     */
    setupConnector : function() {
        MagnetJS.Storage.connector = MagnetJS.MemoryStoreConnector;
        return;

        if (MagnetJS.Utils.hasFeature('openDatabase')) {
            MagnetJS.SQLConnector.db = window.openDatabase(
                MagnetJS.SQLConnector.dbOptions.name,
                MagnetJS.SQLConnector.dbOptions.version,
                MagnetJS.SQLConnector.dbOptions.display,
                MagnetJS.SQLConnector.dbOptions.size
            );
            MagnetJS.Storage.connector = MagnetJS.SQLConnector;
        } else if (MagnetJS.Utils.hasFeature('localStorage') === true) {
            MagnetJS.Storage.connector = MagnetJS.LocalStorageConnector;
        } else {
            MagnetJS.Storage.connector = MagnetJS.MemoryStoreConnector;
        }

    }
};
MagnetJS.Storage.setupConnector();


/**
 * The {MagnetJS.Log} makes it easier to troubleshoot client side problems in mobile applications installed
 * on mobile devices, where examining logs of individual devices is not possible. Since the logs can be sent
 * by the SDK without user intervention, problems can be identified and fixed without user involvement.
 * @memberof MagnetJS
 * @namespace Log
 */
MagnetJS.Log = {};
MagnetJS.Log.store = 'MMSDKLogstore';
/**
 * @attribute {boolean} storeReady Determines whether the log store is ready for use.
 */
MagnetJS.Log.storeReady = false;
/**
 * @attribute {object} Level A key-value pair of all log levels.
 */
MagnetJS.Log.Level = {
    SEVERE  : 500,
    WARNING : 400,
    INFO    : 300,
    CONFIG  : 200,
    FINE    : 100
};

MagnetJS.Storage.createTableIfNotExist(MagnetJS.Log.store, {
    date      : 'TEXT',
    level     : 'TEXT',
    msg       : 'TEXT',
    metadata  : 'TEXT',
    logSource : 'TEXT',
    file      : 'TEXT'
}, null, false, function() {
    MagnetJS.Log.storeReady = true;
});

/**
 * @method
 * @desc Store log record as SEVERE log level.
 * @param {string} msg The message to log.
 * @param {object} [metadata] Metadata related to the log.
 * @param {string} [logSource] The source for the log (anything other than "server" is permitted).
 * @param {*} [file] Any extra data the mobile client desires to associate with the log record.
 */
MagnetJS.Log.severe = function(msg, metadata, logSource, file) {
    this.log(this.Level.SEVERE, [].slice.apply(arguments));
};
/**
 * @method
 * @desc Store log record as WARNING log level.
 * @param {string} msg The message to log.
 * @param {object} [metadata] Metadata related to the log.
 * @param {string} [logSource] The source for the log (anything other than "server" is permitted).
 * @param {*} [file] Any extra data the mobile client desires to associate with the log record.
 */
MagnetJS.Log.warning = function(msg, metadata, logSource, file) {
    this.log(this.Level.WARNING, [].slice.apply(arguments));
};
/**
 * @method
 * @desc Store log record as INFO log level.
 * @param {string} msg The message to log.
 * @param {object} [metadata] Metadata related to the log.
 * @param {string} [logSource] The source for the log (anything other than "server" is permitted).
 * @param {*} [file] Any extra data the mobile client desires to associate with the log record.
 */
MagnetJS.Log.info = function(msg, metadata, logSource, file) {
    this.log(this.Level.INFO, [].slice.apply(arguments));
};
/**
 * @method
 * @desc Store log record as CONFIG log level.
 * @param {string} msg The message to log.
 * @param {object} [metadata] Metadata related to the log.
 * @param {string} [logSource] The source for the log (anything other than "server" is permitted).
 * @param {*} [file] Any extra data the mobile client desires to associate with the log record.
 */
MagnetJS.Log.config = function(msg, metadata, logSource, file) {
    this.log(this.Level.CONFIG, [].slice.apply(arguments));
};
/**
 * @method
 * @desc Store log record as FINE log level.
 * @param {string} msg The message to log.
 * @param {object} [metadata] Metadata related to the log.
 * @param {string} [logSource] The source for the log (anything other than "server" is permitted).
 * @param {*} [file] Any extra data the mobile client desires to associate with the log record.
 */
MagnetJS.Log.fine = function(msg, metadata, logSource, file) {
    this.log(this.Level.FINE, [].slice.apply(arguments));
};
/**
 * @method
 * @desc Store log record to the configured {MagnetJS.Storage} log store.
 * @param {*} levelOrWeight The log level as a string or log level weight as an integer defined in {MagnetJS.Log.Level}.
 * @param {array} params An array of log record parameters
 */
MagnetJS.Log.log = function(levelOrWeight, params) {
    var weight = typeof levelOrWeight == 'number' ? levelOrWeight : getLevelOrWeight(levelOrWeight);
    var level = typeof levelOrWeight == 'string' ? levelOrWeight : getLevelOrWeight(weight);
    if (!MagnetJS.Config.logging || weight < MagnetJS.Log.Level[MagnetJS.Config.logLevel]) return;
    var date = MagnetJS.Utils.dateToISO8601(new Date());
    var msg = params[0] || null;
    var metadata = params[1] ? ((MagnetJS.Utils.isAndroid || MagnetJS.Utils.isIOS) ? JSON.stringify(params[2]) : params[1]) : null;
    var logSource = params[2] || null;
    var file = params[3] ? MagnetJS.Utils.stringToBase64(params[3]) : null;
    if (MagnetJS.Config.logHandler.indexOf('Console') != -1)
        console.log('[MAGNET DEBUG] ', date, level || '', msg || '', metadata || '', logSource || '', file || '');
    if (MagnetJS.Config.logHandler.indexOf('DB') != -1) {
        if (this.storeReady) {
            MagnetJS.Storage.create(this.store, {
                date      : date,
                level     : level,
                msg       : msg,
                metadata  : metadata,
                logSource : logSource,
                file      : file
            }, null, function() {
                console.error('error storing log record');
            });
        } else {
            console.error('log store not ready yet.')
        }
    }
};
// given a log level or weight, return opposite
function getLevelOrWeight(levelOrWeight) {
    var level;
    for(var key in MagnetJS.Log.Level) {
        if (MagnetJS.Log.Level[key] === levelOrWeight)
            level = key;
        if (key === levelOrWeight)
            level = MagnetJS.Log.Level[key];
    }
    return level;
}
/**
 * @method
 * @desc Sends all records in the log store to the Magnet Mobile App Server. On a successful dump, the logs in the log store will be cleared.
 * @param {function} [callback] Callback to fire after a successful dump.
 * @param {function} [failback] Callback to fire after a failed attempt.
 */
MagnetJS.Log.dump = function(callback, failback) {
    MagnetJS.Storage.get(MagnetJS.Log.store, null, function(data) {
        var text = '';
        for(var i=0;i<data.length;++i)
            text += JSON.stringify(data[i])+'\r\n';
        MagnetJS.LoggingService.logBatch({
            file : {
                mimeType : 'text/plain',
                val      : text
            }
        }, {
            success : function(data, details) {
                MagnetJS.Storage.clearTable(MagnetJS.Log.store, function() {
                    if (typeof callback === typeof Function) callback(data, details);
                }, failback);
            },
            error : failback
        });
    }, function(e) {
        console.error('failed to send log data');
        if (typeof failback === typeof Function) failback(e);
    });
};
/**
 * @method
 * @desc Clear all records in the log store without dumping to the server.
 * @param {function} [callback] Callback to fire after a successful dump.
 * @param {function} [failback] Callback to fire after a failed attempt.
 */
MagnetJS.Log.clear = function(callback, failback) {
    MagnetJS.Storage.clearTable(MagnetJS.Log.store, callback, failback);
};

// log uncaught exceptions
if (typeof window !== 'undefined' && typeof window.onError !== 'undefined') {
    window.onError = function(err, url, line) {
        try{
            throw new Error('magnet');
        }catch(e) {
            err = err + '\n' + (e.stack ? e.stack : e.sourceURL) + ":" + e.line;
        }
        MagnetJS.Log.severe(err, {
            url  : url,
            line : line
        });
        return false;
    };
}

/**
 * @method
 * @desc Set MagnetJS SDK configuration attributes.
 * @param {object} obj An object containing key-value pairs to be set in the MagnetJS attributes.
 */
MagnetJS.set = function(obj) {
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (prop == 'endpointUrl' && /^(ftp|http|https):/.test(obj[prop] === false))
                throw('invalid endpointUrl - no protocol');
            MagnetJS.Config[prop] = obj[prop];
        }
    }
    return this;
};
/**
 * @method
 * @desc Reset MagnetJS SDK configuration attributes to their default values.
 */
MagnetJS.reset = function() {
    MagnetJS.set({
        endpointUrl : '',
        logging     : true
    });
    return this;
};
/**
 * @method
 * @desc Load a model or controller resource into memory. For NodeJS only.
 * @param {string} path A relative path to the entity or controller resource.
 */
MagnetJS.define = function(path) {
    var resource = require(path), type = resource.Controllers ? 'Controllers' : 'Models';
    MagnetJS.Utils.mergeObj(MagnetJS[type], resource[type]);
    return this;
};

var mCurrentDevice = null;
var mCurrentUser = null;
var mXMPPConnection = null;

MagnetJS.init = function(cfg) {
    // TODO: prevent second call
    MagnetJS.App.clientId = cfg.clientId;
    MagnetJS.App.clientSecret = cfg.clientSecret;
    MagnetJS.Config.endpointUrl = cfg.baseUrl;
    MagnetJS.Device.checkInWithDevice();
};

MagnetJS.onReady = function(cb) {
    if (MagnetJS.App.initialized === true) return cb();
    var readyCheck = setInterval(function() {
        if (MagnetJS.App.initialized === true) {
            MagnetJS.Log.info('sdk initialized');
            clearInterval(readyCheck);
            (cb || function() {})();
        }
    }, 100);
};

MagnetJS.getCurrentUser = function() {
    return mCurrentUser || null;
};

MagnetJS.start = function() {
    MagnetJS.App.receiving = true;
    mXMPPConnection.priority = 0;
};

MagnetJS.stop = function() {
    MagnetJS.App.receiving = false;
    mXMPPConnection.priority = -255;
};

/**
 * Third party plugins.
 */

/*!
 *  window.btoa/window.atob shim
 */
(function(){function t(t){this.message=t}var e="undefined"!=typeof exports?exports:this,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";t.prototype=Error(),t.prototype.name="InvalidCharacterError",e.btoa||(e.btoa=function(e){for(var o,n,a=0,i=r,c="";e.charAt(0|a)||(i="=",a%1);c+=i.charAt(63&o>>8-8*(a%1))){if(n=e.charCodeAt(a+=.75),n>255)throw new t("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");o=o<<8|n}return c}),e.atob||(e.atob=function(e){if(e=e.replace(/=+$/,""),1==e.length%4)throw new t("'atob' failed: The string to be decoded is not correctly encoded.");for(var o,n,a=0,i=0,c="";n=e.charAt(i++);~n&&(o=a%4?64*o+n:n,a++%4)?c+=String.fromCharCode(255&o>>(6&-2*a)):0)n=r.indexOf(n);return c})})();
/*! strophe.js v1.2.5 - built on 09-02-2016 */
!function(a){if(function(a,b){"function"==typeof define&&define.amd?define("strophe-base64",function(){return b()}):a.Base64=b()}(this,function(){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",b={encode:function(b){var c,d,e,f,g,h,i,j="",k=0;do c=b.charCodeAt(k++),d=b.charCodeAt(k++),e=b.charCodeAt(k++),f=c>>2,g=(3&c)<<4|d>>4,h=(15&d)<<2|e>>6,i=63&e,isNaN(d)?(g=(3&c)<<4,h=i=64):isNaN(e)&&(i=64),j=j+a.charAt(f)+a.charAt(g)+a.charAt(h)+a.charAt(i);while(k<b.length);return j},decode:function(b){var c,d,e,f,g,h,i,j="",k=0;b=b.replace(/[^A-Za-z0-9\+\/\=]/g,"");do f=a.indexOf(b.charAt(k++)),g=a.indexOf(b.charAt(k++)),h=a.indexOf(b.charAt(k++)),i=a.indexOf(b.charAt(k++)),c=f<<2|g>>4,d=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(c),64!=h&&(j+=String.fromCharCode(d)),64!=i&&(j+=String.fromCharCode(e));while(k<b.length);return j}};return b}),function(a,b){"function"==typeof define&&define.amd?define("strophe-sha1",function(){return b()}):a.SHA1=b()}(this,function(){function a(a,d){a[d>>5]|=128<<24-d%32,a[(d+64>>9<<4)+15]=d;var g,h,i,j,k,l,m,n,o=new Array(80),p=1732584193,q=-271733879,r=-1732584194,s=271733878,t=-1009589776;for(g=0;g<a.length;g+=16){for(j=p,k=q,l=r,m=s,n=t,h=0;80>h;h++)16>h?o[h]=a[g+h]:o[h]=f(o[h-3]^o[h-8]^o[h-14]^o[h-16],1),i=e(e(f(p,5),b(h,q,r,s)),e(e(t,o[h]),c(h))),t=s,s=r,r=f(q,30),q=p,p=i;p=e(p,j),q=e(q,k),r=e(r,l),s=e(s,m),t=e(t,n)}return[p,q,r,s,t]}function b(a,b,c,d){return 20>a?b&c|~b&d:40>a?b^c^d:60>a?b&c|b&d|c&d:b^c^d}function c(a){return 20>a?1518500249:40>a?1859775393:60>a?-1894007588:-899497514}function d(b,c){var d=g(b);d.length>16&&(d=a(d,8*b.length));for(var e=new Array(16),f=new Array(16),h=0;16>h;h++)e[h]=909522486^d[h],f[h]=1549556828^d[h];var i=a(e.concat(g(c)),512+8*c.length);return a(f.concat(i),672)}function e(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}function f(a,b){return a<<b|a>>>32-b}function g(a){for(var b=[],c=255,d=0;d<8*a.length;d+=8)b[d>>5]|=(a.charCodeAt(d/8)&c)<<24-d%32;return b}function h(a){for(var b="",c=255,d=0;d<32*a.length;d+=8)b+=String.fromCharCode(a[d>>5]>>>24-d%32&c);return b}function i(a){for(var b,c,d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",e="",f=0;f<4*a.length;f+=3)for(b=(a[f>>2]>>8*(3-f%4)&255)<<16|(a[f+1>>2]>>8*(3-(f+1)%4)&255)<<8|a[f+2>>2]>>8*(3-(f+2)%4)&255,c=0;4>c;c++)e+=8*f+6*c>32*a.length?"=":d.charAt(b>>6*(3-c)&63);return e}return{b64_hmac_sha1:function(a,b){return i(d(a,b))},b64_sha1:function(b){return i(a(g(b),8*b.length))},binb2str:h,core_hmac_sha1:d,str_hmac_sha1:function(a,b){return h(d(a,b))},str_sha1:function(b){return h(a(g(b),8*b.length))}}}),function(a,b){"function"==typeof define&&define.amd?define("strophe-md5",function(){return b()}):a.MD5=b()}(this,function(a){var b=function(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c},c=function(a,b){return a<<b|a>>>32-b},d=function(a){for(var b=[],c=0;c<8*a.length;c+=8)b[c>>5]|=(255&a.charCodeAt(c/8))<<c%32;return b},e=function(a){for(var b="",c=0;c<32*a.length;c+=8)b+=String.fromCharCode(a[c>>5]>>>c%32&255);return b},f=function(a){for(var b="0123456789abcdef",c="",d=0;d<4*a.length;d++)c+=b.charAt(a[d>>2]>>d%4*8+4&15)+b.charAt(a[d>>2]>>d%4*8&15);return c},g=function(a,d,e,f,g,h){return b(c(b(b(d,a),b(f,h)),g),e)},h=function(a,b,c,d,e,f,h){return g(b&c|~b&d,a,b,e,f,h)},i=function(a,b,c,d,e,f,h){return g(b&d|c&~d,a,b,e,f,h)},j=function(a,b,c,d,e,f,h){return g(b^c^d,a,b,e,f,h)},k=function(a,b,c,d,e,f,h){return g(c^(b|~d),a,b,e,f,h)},l=function(a,c){a[c>>5]|=128<<c%32,a[(c+64>>>9<<4)+14]=c;for(var d,e,f,g,l=1732584193,m=-271733879,n=-1732584194,o=271733878,p=0;p<a.length;p+=16)d=l,e=m,f=n,g=o,l=h(l,m,n,o,a[p+0],7,-680876936),o=h(o,l,m,n,a[p+1],12,-389564586),n=h(n,o,l,m,a[p+2],17,606105819),m=h(m,n,o,l,a[p+3],22,-1044525330),l=h(l,m,n,o,a[p+4],7,-176418897),o=h(o,l,m,n,a[p+5],12,1200080426),n=h(n,o,l,m,a[p+6],17,-1473231341),m=h(m,n,o,l,a[p+7],22,-45705983),l=h(l,m,n,o,a[p+8],7,1770035416),o=h(o,l,m,n,a[p+9],12,-1958414417),n=h(n,o,l,m,a[p+10],17,-42063),m=h(m,n,o,l,a[p+11],22,-1990404162),l=h(l,m,n,o,a[p+12],7,1804603682),o=h(o,l,m,n,a[p+13],12,-40341101),n=h(n,o,l,m,a[p+14],17,-1502002290),m=h(m,n,o,l,a[p+15],22,1236535329),l=i(l,m,n,o,a[p+1],5,-165796510),o=i(o,l,m,n,a[p+6],9,-1069501632),n=i(n,o,l,m,a[p+11],14,643717713),m=i(m,n,o,l,a[p+0],20,-373897302),l=i(l,m,n,o,a[p+5],5,-701558691),o=i(o,l,m,n,a[p+10],9,38016083),n=i(n,o,l,m,a[p+15],14,-660478335),m=i(m,n,o,l,a[p+4],20,-405537848),l=i(l,m,n,o,a[p+9],5,568446438),o=i(o,l,m,n,a[p+14],9,-1019803690),n=i(n,o,l,m,a[p+3],14,-187363961),m=i(m,n,o,l,a[p+8],20,1163531501),l=i(l,m,n,o,a[p+13],5,-1444681467),o=i(o,l,m,n,a[p+2],9,-51403784),n=i(n,o,l,m,a[p+7],14,1735328473),m=i(m,n,o,l,a[p+12],20,-1926607734),l=j(l,m,n,o,a[p+5],4,-378558),o=j(o,l,m,n,a[p+8],11,-2022574463),n=j(n,o,l,m,a[p+11],16,1839030562),m=j(m,n,o,l,a[p+14],23,-35309556),l=j(l,m,n,o,a[p+1],4,-1530992060),o=j(o,l,m,n,a[p+4],11,1272893353),n=j(n,o,l,m,a[p+7],16,-155497632),m=j(m,n,o,l,a[p+10],23,-1094730640),l=j(l,m,n,o,a[p+13],4,681279174),o=j(o,l,m,n,a[p+0],11,-358537222),n=j(n,o,l,m,a[p+3],16,-722521979),m=j(m,n,o,l,a[p+6],23,76029189),l=j(l,m,n,o,a[p+9],4,-640364487),o=j(o,l,m,n,a[p+12],11,-421815835),n=j(n,o,l,m,a[p+15],16,530742520),m=j(m,n,o,l,a[p+2],23,-995338651),l=k(l,m,n,o,a[p+0],6,-198630844),o=k(o,l,m,n,a[p+7],10,1126891415),n=k(n,o,l,m,a[p+14],15,-1416354905),m=k(m,n,o,l,a[p+5],21,-57434055),l=k(l,m,n,o,a[p+12],6,1700485571),o=k(o,l,m,n,a[p+3],10,-1894986606),n=k(n,o,l,m,a[p+10],15,-1051523),m=k(m,n,o,l,a[p+1],21,-2054922799),l=k(l,m,n,o,a[p+8],6,1873313359),o=k(o,l,m,n,a[p+15],10,-30611744),n=k(n,o,l,m,a[p+6],15,-1560198380),m=k(m,n,o,l,a[p+13],21,1309151649),l=k(l,m,n,o,a[p+4],6,-145523070),o=k(o,l,m,n,a[p+11],10,-1120210379),n=k(n,o,l,m,a[p+2],15,718787259),m=k(m,n,o,l,a[p+9],21,-343485551),l=b(l,d),m=b(m,e),n=b(n,f),o=b(o,g);return[l,m,n,o]},m={hexdigest:function(a){return f(l(d(a),8*a.length))},hash:function(a){return e(l(d(a),8*a.length))}};return m}),function(a,b){"function"==typeof define&&define.amd?define("strophe-utils",function(){return b()}):a.stropheUtils=b()}(this,function(){var a={utf16to8:function(a){var b,c,d="",e=a.length;for(b=0;e>b;b++)c=a.charCodeAt(b),c>=0&&127>=c?d+=a.charAt(b):c>2047?(d+=String.fromCharCode(224|c>>12&15),d+=String.fromCharCode(128|c>>6&63),d+=String.fromCharCode(128|c>>0&63)):(d+=String.fromCharCode(192|c>>6&31),d+=String.fromCharCode(128|c>>0&63));return d},addCookies:function(a){var b,c,d,e,f,g,h;for(b in a||{})f="",g="",h="",c=a[b],d="object"==typeof c,e=escape(unescape(d?c.value:c)),d&&(f=c.expires?";expires="+c.expires:"",g=c.domain?";domain="+c.domain:"",h=c.path?";path="+c.path:""),document.cookie=b+"="+e+f+g+h}};return a}),function(a,b){return"function"==typeof define&&define.amd?void define("strophe-polyfill",[],function(){return b()}):b()}(this,function(){Function.prototype.bind||(Function.prototype.bind=function(a){var b=this,c=Array.prototype.slice,d=Array.prototype.concat,e=c.call(arguments,1);return function(){return b.apply(a?a:this,d.call(e,c.call(arguments,0)))}}),Array.isArray||(Array.isArray=function(a){return"[object Array]"===Object.prototype.toString.call(a)}),Array.prototype.indexOf||(Array.prototype.indexOf=function(a){var b=this.length,c=Number(arguments[1])||0;for(c=0>c?Math.ceil(c):Math.floor(c),0>c&&(c+=b);b>c;c++)if(c in this&&this[c]===a)return c;return-1})}),function(a,b){if("function"==typeof define&&define.amd)define("strophe-core",["strophe-sha1","strophe-base64","strophe-md5","strophe-utils","strophe-polyfill"],function(){return b.apply(this,arguments)});else{var c=b(a.SHA1,a.Base64,a.MD5,a.stropheUtils);window.Strophe=c.Strophe,window.$build=c.$build,window.$iq=c.$iq,window.$msg=c.$msg,window.$pres=c.$pres,window.SHA1=c.SHA1,window.Base64=c.Base64,window.MD5=c.MD5,window.b64_hmac_sha1=c.SHA1.b64_hmac_sha1,window.b64_sha1=c.SHA1.b64_sha1,window.str_hmac_sha1=c.SHA1.str_hmac_sha1,window.str_sha1=c.SHA1.str_sha1}}(this,function(a,b,c,d){function e(a,b){return new i.Builder(a,b)}function f(a){return new i.Builder("message",a)}function g(a){return new i.Builder("iq",a)}function h(a){return new i.Builder("presence",a)}var i;return i={VERSION:"1.2.5",NS:{HTTPBIND:"http://jabber.org/protocol/httpbind",BOSH:"urn:xmpp:xbosh",CLIENT:"jabber:client",AUTH:"jabber:iq:auth",ROSTER:"jabber:iq:roster",PROFILE:"jabber:iq:profile",DISCO_INFO:"http://jabber.org/protocol/disco#info",DISCO_ITEMS:"http://jabber.org/protocol/disco#items",MUC:"http://jabber.org/protocol/muc",SASL:"urn:ietf:params:xml:ns:xmpp-sasl",STREAM:"http://etherx.jabber.org/streams",FRAMING:"urn:ietf:params:xml:ns:xmpp-framing",BIND:"urn:ietf:params:xml:ns:xmpp-bind",SESSION:"urn:ietf:params:xml:ns:xmpp-session",VERSION:"jabber:iq:version",STANZAS:"urn:ietf:params:xml:ns:xmpp-stanzas",XHTML_IM:"http://jabber.org/protocol/xhtml-im",XHTML:"http://www.w3.org/1999/xhtml"},XHTML:{tags:["a","blockquote","br","cite","em","img","li","ol","p","span","strong","ul","body"],attributes:{a:["href"],blockquote:["style"],br:[],cite:["style"],em:[],img:["src","alt","style","height","width"],li:["style"],ol:["style"],p:["style"],span:["style"],strong:[],ul:["style"],body:[]},css:["background-color","color","font-family","font-size","font-style","font-weight","margin-left","margin-right","text-align","text-decoration"],validTag:function(a){for(var b=0;b<i.XHTML.tags.length;b++)if(a==i.XHTML.tags[b])return!0;return!1},validAttribute:function(a,b){if("undefined"!=typeof i.XHTML.attributes[a]&&i.XHTML.attributes[a].length>0)for(var c=0;c<i.XHTML.attributes[a].length;c++)if(b==i.XHTML.attributes[a][c])return!0;return!1},validCSS:function(a){for(var b=0;b<i.XHTML.css.length;b++)if(a==i.XHTML.css[b])return!0;return!1}},Status:{ERROR:0,CONNECTING:1,CONNFAIL:2,AUTHENTICATING:3,AUTHFAIL:4,CONNECTED:5,DISCONNECTED:6,DISCONNECTING:7,ATTACHED:8,REDIRECT:9},LogLevel:{DEBUG:0,INFO:1,WARN:2,ERROR:3,FATAL:4},ElementType:{NORMAL:1,TEXT:3,CDATA:4,FRAGMENT:11},TIMEOUT:1.1,SECONDARY_TIMEOUT:.1,addNamespace:function(a,b){i.NS[a]=b},forEachChild:function(a,b,c){var d,e;for(d=0;d<a.childNodes.length;d++)e=a.childNodes[d],e.nodeType!=i.ElementType.NORMAL||b&&!this.isTagEqual(e,b)||c(e)},isTagEqual:function(a,b){return a.tagName==b},_xmlGenerator:null,_makeGenerator:function(){var a;return void 0===document.implementation.createDocument||document.implementation.createDocument&&document.documentMode&&document.documentMode<10?(a=this._getIEXmlDom(),a.appendChild(a.createElement("strophe"))):a=document.implementation.createDocument("jabber:client","strophe",null),a},xmlGenerator:function(){return i._xmlGenerator||(i._xmlGenerator=i._makeGenerator()),i._xmlGenerator},_getIEXmlDom:function(){for(var a=null,b=["Msxml2.DOMDocument.6.0","Msxml2.DOMDocument.5.0","Msxml2.DOMDocument.4.0","MSXML2.DOMDocument.3.0","MSXML2.DOMDocument","MSXML.DOMDocument","Microsoft.XMLDOM"],c=0;c<b.length&&null===a;c++)try{a=new ActiveXObject(b[c])}catch(d){a=null}return a},xmlElement:function(a){if(!a)return null;var b,c,d,e=i.xmlGenerator().createElement(a);for(b=1;b<arguments.length;b++){var f=arguments[b];if(f)if("string"==typeof f||"number"==typeof f)e.appendChild(i.xmlTextNode(f));else if("object"==typeof f&&"function"==typeof f.sort)for(c=0;c<f.length;c++){var g=f[c];"object"==typeof g&&"function"==typeof g.sort&&void 0!==g[1]&&null!==g[1]&&e.setAttribute(g[0],g[1])}else if("object"==typeof f)for(d in f)f.hasOwnProperty(d)&&void 0!==f[d]&&null!==f[d]&&e.setAttribute(d,f[d])}return e},xmlescape:function(a){return a=a.replace(/\&/g,"&amp;"),a=a.replace(/</g,"&lt;"),a=a.replace(/>/g,"&gt;"),a=a.replace(/'/g,"&apos;"),a=a.replace(/"/g,"&quot;")},xmlunescape:function(a){return a=a.replace(/\&amp;/g,"&"),a=a.replace(/&lt;/g,"<"),a=a.replace(/&gt;/g,">"),a=a.replace(/&apos;/g,"'"),a=a.replace(/&quot;/g,'"')},xmlTextNode:function(a){return i.xmlGenerator().createTextNode(a)},xmlHtmlNode:function(a){var b;if(window.DOMParser){var c=new DOMParser;b=c.parseFromString(a,"text/xml")}else b=new ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a);return b},getText:function(a){if(!a)return null;var b="";0===a.childNodes.length&&a.nodeType==i.ElementType.TEXT&&(b+=a.nodeValue);for(var c=0;c<a.childNodes.length;c++)a.childNodes[c].nodeType==i.ElementType.TEXT&&(b+=a.childNodes[c].nodeValue);return i.xmlescape(b)},copyElement:function(a){var b,c;if(a.nodeType==i.ElementType.NORMAL){for(c=i.xmlElement(a.tagName),b=0;b<a.attributes.length;b++)c.setAttribute(a.attributes[b].nodeName,a.attributes[b].value);for(b=0;b<a.childNodes.length;b++)c.appendChild(i.copyElement(a.childNodes[b]))}else a.nodeType==i.ElementType.TEXT&&(c=i.xmlGenerator().createTextNode(a.nodeValue));return c},createHtml:function(a){var b,c,d,e,f,g,h,j,k,l,m;if(a.nodeType==i.ElementType.NORMAL)if(e=a.nodeName.toLowerCase(),i.XHTML.validTag(e))try{for(c=i.xmlElement(e),b=0;b<i.XHTML.attributes[e].length;b++)if(f=i.XHTML.attributes[e][b],g=a.getAttribute(f),"undefined"!=typeof g&&null!==g&&""!==g&&g!==!1&&0!==g)if("style"==f&&"object"==typeof g&&"undefined"!=typeof g.cssText&&(g=g.cssText),"style"==f){for(h=[],j=g.split(";"),d=0;d<j.length;d++)k=j[d].split(":"),l=k[0].replace(/^\s*/,"").replace(/\s*$/,"").toLowerCase(),i.XHTML.validCSS(l)&&(m=k[1].replace(/^\s*/,"").replace(/\s*$/,""),h.push(l+": "+m));h.length>0&&(g=h.join("; "),c.setAttribute(f,g))}else c.setAttribute(f,g);for(b=0;b<a.childNodes.length;b++)c.appendChild(i.createHtml(a.childNodes[b]))}catch(n){c=i.xmlTextNode("")}else for(c=i.xmlGenerator().createDocumentFragment(),b=0;b<a.childNodes.length;b++)c.appendChild(i.createHtml(a.childNodes[b]));else if(a.nodeType==i.ElementType.FRAGMENT)for(c=i.xmlGenerator().createDocumentFragment(),b=0;b<a.childNodes.length;b++)c.appendChild(i.createHtml(a.childNodes[b]));else a.nodeType==i.ElementType.TEXT&&(c=i.xmlTextNode(a.nodeValue));return c},escapeNode:function(a){return"string"!=typeof a?a:a.replace(/^\s+|\s+$/g,"").replace(/\\/g,"\\5c").replace(/ /g,"\\20").replace(/\"/g,"\\22").replace(/\&/g,"\\26").replace(/\'/g,"\\27").replace(/\//g,"\\2f").replace(/:/g,"\\3a").replace(/</g,"\\3c").replace(/>/g,"\\3e").replace(/@/g,"\\40")},unescapeNode:function(a){return"string"!=typeof a?a:a.replace(/\\20/g," ").replace(/\\22/g,'"').replace(/\\26/g,"&").replace(/\\27/g,"'").replace(/\\2f/g,"/").replace(/\\3a/g,":").replace(/\\3c/g,"<").replace(/\\3e/g,">").replace(/\\40/g,"@").replace(/\\5c/g,"\\")},getNodeFromJid:function(a){return a.indexOf("@")<0?null:a.split("@")[0]},getDomainFromJid:function(a){var b=i.getBareJidFromJid(a);if(b.indexOf("@")<0)return b;var c=b.split("@");return c.splice(0,1),c.join("@")},getResourceFromJid:function(a){var b=a.split("/");return b.length<2?null:(b.splice(0,1),b.join("/"))},getBareJidFromJid:function(a){return a?a.split("/")[0]:null},log:function(a,b){},debug:function(a){this.log(this.LogLevel.DEBUG,a)},info:function(a){this.log(this.LogLevel.INFO,a)},warn:function(a){this.log(this.LogLevel.WARN,a)},error:function(a){this.log(this.LogLevel.ERROR,a)},fatal:function(a){this.log(this.LogLevel.FATAL,a)},serialize:function(a){var b;if(!a)return null;"function"==typeof a.tree&&(a=a.tree());var c,d,e=a.nodeName;for(a.getAttribute("_realname")&&(e=a.getAttribute("_realname")),b="<"+e,c=0;c<a.attributes.length;c++)"_realname"!=a.attributes[c].nodeName&&(b+=" "+a.attributes[c].nodeName+"='"+a.attributes[c].value.replace(/&/g,"&amp;").replace(/\'/g,"&apos;").replace(/>/g,"&gt;").replace(/</g,"&lt;")+"'");if(a.childNodes.length>0){for(b+=">",c=0;c<a.childNodes.length;c++)switch(d=a.childNodes[c],d.nodeType){case i.ElementType.NORMAL:b+=i.serialize(d);break;case i.ElementType.TEXT:b+=i.xmlescape(d.nodeValue);break;case i.ElementType.CDATA:b+="<![CDATA["+d.nodeValue+"]]>"}b+="</"+e+">"}else b+="/>";return b},_requestId:0,_connectionPlugins:{},addConnectionPlugin:function(a,b){i._connectionPlugins[a]=b}},i.Builder=function(a,b){("presence"==a||"message"==a||"iq"==a)&&(b&&!b.xmlns?b.xmlns=i.NS.CLIENT:b||(b={xmlns:i.NS.CLIENT})),this.nodeTree=i.xmlElement(a,b),this.node=this.nodeTree},i.Builder.prototype={tree:function(){return this.nodeTree},toString:function(){return i.serialize(this.nodeTree)},up:function(){return this.node=this.node.parentNode,this},attrs:function(a){for(var b in a)a.hasOwnProperty(b)&&(void 0===a[b]?this.node.removeAttribute(b):this.node.setAttribute(b,a[b]));return this},c:function(a,b,c){var d=i.xmlElement(a,b,c);return this.node.appendChild(d),"string"!=typeof c&&(this.node=d),this},cnode:function(a){var b,c=i.xmlGenerator();try{b=void 0!==c.importNode}catch(d){b=!1}var e=b?c.importNode(a,!0):i.copyElement(a);return this.node.appendChild(e),this.node=e,this},t:function(a){var b=i.xmlTextNode(a);return this.node.appendChild(b),this},h:function(a){var b=document.createElement("body");b.innerHTML=a;for(var c=i.createHtml(b);c.childNodes.length>0;)this.node.appendChild(c.childNodes[0]);return this}},i.Handler=function(a,b,c,d,e,f,g){this.handler=a,this.ns=b,this.name=c,this.type=d,this.id=e,this.options=g||{matchBare:!1},this.options.matchBare||(this.options.matchBare=!1),this.options.matchBare?this.from=f?i.getBareJidFromJid(f):null:this.from=f,this.user=!0},i.Handler.prototype={isMatch:function(a){var b,c=null;if(c=this.options.matchBare?i.getBareJidFromJid(a.getAttribute("from")):a.getAttribute("from"),b=!1,this.ns){var d=this;i.forEachChild(a,null,function(a){a.getAttribute("xmlns")==d.ns&&(b=!0)}),b=b||a.getAttribute("xmlns")==this.ns}else b=!0;var e=a.getAttribute("type");return!b||this.name&&!i.isTagEqual(a,this.name)||this.type&&(Array.isArray(this.type)?-1==this.type.indexOf(e):e!=this.type)||this.id&&a.getAttribute("id")!=this.id||this.from&&c!=this.from?!1:!0},run:function(a){var b=null;try{b=this.handler(a)}catch(c){throw c.sourceURL?i.fatal("error: "+this.handler+" "+c.sourceURL+":"+c.line+" - "+c.name+": "+c.message):c.fileName?("undefined"!=typeof console&&(console.trace(),console.error(this.handler," - error - ",c,c.message)),i.fatal("error: "+this.handler+" "+c.fileName+":"+c.lineNumber+" - "+c.name+": "+c.message)):i.fatal("error: "+c.message+"\n"+c.stack),c}return b},toString:function(){return"{Handler: "+this.handler+"("+this.name+","+this.id+","+this.ns+")}"}},i.TimedHandler=function(a,b){this.period=a,this.handler=b,this.lastCalled=(new Date).getTime(),this.user=!0},i.TimedHandler.prototype={run:function(){return this.lastCalled=(new Date).getTime(),this.handler()},reset:function(){this.lastCalled=(new Date).getTime()},toString:function(){return"{TimedHandler: "+this.handler+"("+this.period+")}"}},i.Connection=function(a,b){this.service=a,this.options=b||{};var c=this.options.protocol||"";0===a.indexOf("ws:")||0===a.indexOf("wss:")||0===c.indexOf("ws")?this._proto=new i.Websocket(this):this._proto=new i.Bosh(this),this.jid="",this.domain=null,this.features=null,this._sasl_data={},this.do_session=!1,this.do_bind=!1,this.timedHandlers=[],this.handlers=[],this.removeTimeds=[],this.removeHandlers=[],this.addTimeds=[],this.addHandlers=[],this._authentication={},this._idleTimeout=null,this._disconnectTimeout=null,this.authenticated=!1,this.connected=!1,this.disconnecting=!1,this.do_authentication=!0,this.paused=!1,this.restored=!1,this._data=[],this._uniqueId=0,this._sasl_success_handler=null,this._sasl_failure_handler=null,this._sasl_challenge_handler=null,this.maxRetries=5,this._idleTimeout=setTimeout(this._onIdle.bind(this),100),d.addCookies(this.options.cookies);for(var e in i._connectionPlugins)if(i._connectionPlugins.hasOwnProperty(e)){var f=i._connectionPlugins[e],g=function(){};g.prototype=f,this[e]=new g,this[e].init(this)}},i.Connection.prototype={reset:function(){this._proto._reset(),this.do_session=!1,this.do_bind=!1,this.timedHandlers=[],this.handlers=[],this.removeTimeds=[],this.removeHandlers=[],this.addTimeds=[],this.addHandlers=[],this._authentication={},this.authenticated=!1,this.connected=!1,this.disconnecting=!1,this.restored=!1,this._data=[],this._requests=[],this._uniqueId=0},pause:function(){this.paused=!0},resume:function(){this.paused=!1},getUniqueId:function(a){var b="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=16*Math.random()|0,c="x"==a?b:3&b|8;return c.toString(16)});return"string"==typeof a||"number"==typeof a?b+":"+a:b+""},connect:function(a,b,c,d,e,f,g){this.jid=a,this.authzid=i.getBareJidFromJid(this.jid),this.authcid=g||i.getNodeFromJid(this.jid),this.pass=b,this.servtype="xmpp",this.connect_callback=c,this.disconnecting=!1,this.connected=!1,this.authenticated=!1,this.restored=!1,this.domain=i.getDomainFromJid(this.jid),this._changeConnectStatus(i.Status.CONNECTING,null),this._proto._connect(d,e,f)},attach:function(a,b,c,d,e,f,g){if(!(this._proto instanceof i.Bosh))throw{name:"StropheSessionError",message:'The "attach" method can only be used with a BOSH connection.'};this._proto._attach(a,b,c,d,e,f,g)},restore:function(a,b,c,d,e){if(!this._sessionCachingSupported())throw{name:"StropheSessionError",message:'The "restore" method can only be used with a BOSH connection.'};this._proto._restore(a,b,c,d,e)},_sessionCachingSupported:function(){if(this._proto instanceof i.Bosh){if(!JSON)return!1;try{window.sessionStorage.setItem("_strophe_","_strophe_"),window.sessionStorage.removeItem("_strophe_")}catch(a){return!1}return!0}return!1},xmlInput:function(a){},xmlOutput:function(a){},rawInput:function(a){},rawOutput:function(a){},nextValidRid:function(a){},send:function(a){if(null!==a){if("function"==typeof a.sort)for(var b=0;b<a.length;b++)this._queueData(a[b]);else this._queueData("function"==typeof a.tree?a.tree():a);this._proto._send()}},flush:function(){clearTimeout(this._idleTimeout),this._onIdle()},sendIQ:function(a,b,c,d){var e=null,f=this;"function"==typeof a.tree&&(a=a.tree());var g=a.getAttribute("id");g||(g=this.getUniqueId("sendIQ"),a.setAttribute("id",g));var h=a.getAttribute("to"),j=this.jid,k=this.addHandler(function(a){e&&f.deleteTimedHandler(e);var d=!1,g=a.getAttribute("from");if(g!==h&&(h||g!==i.getBareJidFromJid(j)&&g!==i.getDomainFromJid(j)&&g!==j)||(d=!0),!d)throw{name:"StropheError",message:"Got answer to IQ from wrong jid:"+g+"\nExpected jid: "+h};var k=a.getAttribute("type");if("result"==k)b&&b(a);else{if("error"!=k)throw{name:"StropheError",message:"Got bad IQ type of "+k};c&&c(a)}},null,"iq",["error","result"],g);return d&&(e=this.addTimedHandler(d,function(){return f.deleteHandler(k),c&&c(null),!1})),this.send(a),g},_queueData:function(a){if(null===a||!a.tagName||!a.childNodes)throw{name:"StropheError",message:"Cannot queue non-DOMElement."};this._data.push(a)},_sendRestart:function(){this._data.push("restart"),this._proto._sendRestart(),this._idleTimeout=setTimeout(this._onIdle.bind(this),100)},addTimedHandler:function(a,b){var c=new i.TimedHandler(a,b);return this.addTimeds.push(c),c},deleteTimedHandler:function(a){this.removeTimeds.push(a)},addHandler:function(a,b,c,d,e,f,g){var h=new i.Handler(a,b,c,d,e,f,g);return this.addHandlers.push(h),h},deleteHandler:function(a){this.removeHandlers.push(a);var b=this.addHandlers.indexOf(a);b>=0&&this.addHandlers.splice(b,1)},disconnect:function(a){if(this._changeConnectStatus(i.Status.DISCONNECTING,a),i.info("Disconnect was called because: "+a),this.connected){var b=!1;this.disconnecting=!0,this.authenticated&&(b=h({xmlns:i.NS.CLIENT,type:"unavailable"})),this._disconnectTimeout=this._addSysTimedHandler(3e3,this._onDisconnectTimeout.bind(this)),this._proto._disconnect(b)}else i.info("Disconnect was called before Strophe connected to the server"),this._proto._abortAllRequests()},_changeConnectStatus:function(a,b){for(var c in i._connectionPlugins)if(i._connectionPlugins.hasOwnProperty(c)){var d=this[c];if(d.statusChanged)try{d.statusChanged(a,b)}catch(e){i.error(""+c+" plugin caused an exception changing status: "+e)}}if(this.connect_callback)try{this.connect_callback(a,b)}catch(f){i.error("User connection callback caused an exception: "+f)}},_doDisconnect:function(a){"number"==typeof this._idleTimeout&&clearTimeout(this._idleTimeout),null!==this._disconnectTimeout&&(this.deleteTimedHandler(this._disconnectTimeout),this._disconnectTimeout=null),i.info("_doDisconnect was called"),this._proto._doDisconnect(),this.authenticated=!1,this.disconnecting=!1,this.restored=!1,this.handlers=[],this.timedHandlers=[],this.removeTimeds=[],this.removeHandlers=[],this.addTimeds=[],this.addHandlers=[],this._changeConnectStatus(i.Status.DISCONNECTED,a),this.connected=!1},_dataRecv:function(a,b){i.info("_dataRecv called");var c=this._proto._reqToData(a);if(null!==c){this.xmlInput!==i.Connection.prototype.xmlInput&&this.xmlInput(c.nodeName===this._proto.strip&&c.childNodes.length?c.childNodes[0]:c),this.rawInput!==i.Connection.prototype.rawInput&&this.rawInput(b?b:i.serialize(c));for(var d,e;this.removeHandlers.length>0;)e=this.removeHandlers.pop(),d=this.handlers.indexOf(e),d>=0&&this.handlers.splice(d,1);for(;this.addHandlers.length>0;)this.handlers.push(this.addHandlers.pop());if(this.disconnecting&&this._proto._emptyQueue())return void this._doDisconnect();var f,g,h=c.getAttribute("type");if(null!==h&&"terminate"==h){if(this.disconnecting)return;return f=c.getAttribute("condition"),g=c.getElementsByTagName("conflict"),null!==f?("remote-stream-error"==f&&g.length>0&&(f="conflict"),this._changeConnectStatus(i.Status.CONNFAIL,f)):this._changeConnectStatus(i.Status.CONNFAIL,"unknown"),void this._doDisconnect(f)}var j=this;i.forEachChild(c,null,function(a){var b,c;for(c=j.handlers,j.handlers=[],b=0;b<c.length;b++){var d=c[b];try{!d.isMatch(a)||!j.authenticated&&d.user?j.handlers.push(d):d.run(a)&&j.handlers.push(d)}catch(e){i.warn("Removing Strophe handlers due to uncaught exception: "+e.message)}}})}},mechanisms:{},_connect_cb:function(a,b,c){i.info("_connect_cb was called"),this.connected=!0;var d;try{d=this._proto._reqToData(a)}catch(e){if("badformat"!=e)throw e;this._changeConnectStatus(i.Status.CONNFAIL,"bad-format"),this._doDisconnect("bad-format")}if(d){this.xmlInput!==i.Connection.prototype.xmlInput&&this.xmlInput(d.nodeName===this._proto.strip&&d.childNodes.length?d.childNodes[0]:d),this.rawInput!==i.Connection.prototype.rawInput&&this.rawInput(c?c:i.serialize(d));var f=this._proto._connect_cb(d);if(f!==i.Status.CONNFAIL){this._authentication.sasl_scram_sha1=!1,this._authentication.sasl_plain=!1,this._authentication.sasl_digest_md5=!1,this._authentication.sasl_anonymous=!1,this._authentication.legacy_auth=!1;var g;g=d.getElementsByTagNameNS?d.getElementsByTagNameNS(i.NS.STREAM,"features").length>0:d.getElementsByTagName("stream:features").length>0||d.getElementsByTagName("features").length>0;var h,j,k=d.getElementsByTagName("mechanism"),l=[],m=!1;if(!g)return void this._proto._no_auth_received(b);if(k.length>0)for(h=0;h<k.length;h++)j=i.getText(k[h]),this.mechanisms[j]&&l.push(this.mechanisms[j]);return this._authentication.legacy_auth=d.getElementsByTagName("auth").length>0,(m=this._authentication.legacy_auth||l.length>0)?void(this.do_authentication!==!1&&this.authenticate(l)):void this._proto._no_auth_received(b)}}},authenticate:function(a){var c;for(c=0;c<a.length-1;++c){for(var d=c,f=c+1;f<a.length;++f)a[f].prototype.priority>a[d].prototype.priority&&(d=f);if(d!=c){var h=a[c];a[c]=a[d],a[d]=h}}var j=!1;for(c=0;c<a.length;++c)if(a[c].test(this)){this._sasl_success_handler=this._addSysHandler(this._sasl_success_cb.bind(this),null,"success",null,null),this._sasl_failure_handler=this._addSysHandler(this._sasl_failure_cb.bind(this),null,"failure",null,null),this._sasl_challenge_handler=this._addSysHandler(this._sasl_challenge_cb.bind(this),null,"challenge",null,null),this._sasl_mechanism=new a[c],this._sasl_mechanism.onStart(this);var k=e("auth",{xmlns:i.NS.SASL,mechanism:this._sasl_mechanism.name});if(this._sasl_mechanism.isClientFirst){var l=this._sasl_mechanism.onChallenge(this,null);k.t(b.encode(l))}this.send(k.tree()),j=!0;break}j||(null===i.getNodeFromJid(this.jid)?(this._changeConnectStatus(i.Status.CONNFAIL,"x-strophe-bad-non-anon-jid"),this.disconnect("x-strophe-bad-non-anon-jid")):(this._changeConnectStatus(i.Status.AUTHENTICATING,null),this._addSysHandler(this._auth1_cb.bind(this),null,null,null,"_auth_1"),this.send(g({type:"get",to:this.domain,id:"_auth_1"}).c("query",{xmlns:i.NS.AUTH}).c("username",{}).t(i.getNodeFromJid(this.jid)).tree())))},_sasl_challenge_cb:function(a){var c=b.decode(i.getText(a)),d=this._sasl_mechanism.onChallenge(this,c),f=e("response",{xmlns:i.NS.SASL});return""!==d&&f.t(b.encode(d)),this.send(f.tree()),!0},_auth1_cb:function(a){var b=g({type:"set",id:"_auth_2"}).c("query",{xmlns:i.NS.AUTH}).c("username",{}).t(i.getNodeFromJid(this.jid)).up().c("password").t(this.pass);return i.getResourceFromJid(this.jid)||(this.jid=i.getBareJidFromJid(this.jid)+"/strophe"),b.up().c("resource",{}).t(i.getResourceFromJid(this.jid)),this._addSysHandler(this._auth2_cb.bind(this),null,null,null,"_auth_2"),this.send(b.tree()),!1},_sasl_success_cb:function(a){if(this._sasl_data["server-signature"]){var c,d=b.decode(i.getText(a)),e=/([a-z]+)=([^,]+)(,|$)/,f=d.match(e);if("v"==f[1]&&(c=f[2]),c!=this._sasl_data["server-signature"])return this.deleteHandler(this._sasl_failure_handler),this._sasl_failure_handler=null,this._sasl_challenge_handler&&(this.deleteHandler(this._sasl_challenge_handler),this._sasl_challenge_handler=null),this._sasl_data={},this._sasl_failure_cb(null)}i.info("SASL authentication succeeded."),this._sasl_mechanism&&this._sasl_mechanism.onSuccess(),this.deleteHandler(this._sasl_failure_handler),this._sasl_failure_handler=null,this._sasl_challenge_handler&&(this.deleteHandler(this._sasl_challenge_handler),this._sasl_challenge_handler=null);var g=[],h=function(a,b){for(;a.length;)this.deleteHandler(a.pop());return this._sasl_auth1_cb.bind(this)(b),!1};return g.push(this._addSysHandler(function(a){h.bind(this)(g,a)}.bind(this),null,"stream:features",null,null)),g.push(this._addSysHandler(function(a){h.bind(this)(g,a)}.bind(this),i.NS.STREAM,"features",null,null)),this._sendRestart(),!1},_sasl_auth1_cb:function(a){this.features=a;var b,c;for(b=0;b<a.childNodes.length;b++)c=a.childNodes[b],"bind"==c.nodeName&&(this.do_bind=!0),"session"==c.nodeName&&(this.do_session=!0);if(!this.do_bind)return this._changeConnectStatus(i.Status.AUTHFAIL,null),!1;this._addSysHandler(this._sasl_bind_cb.bind(this),null,null,null,"_bind_auth_2");var d=i.getResourceFromJid(this.jid);return this.send(d?g({type:"set",id:"_bind_auth_2"}).c("bind",{xmlns:i.NS.BIND}).c("resource",{}).t(d).tree():g({type:"set",id:"_bind_auth_2"}).c("bind",{xmlns:i.NS.BIND}).tree()),!1},_sasl_bind_cb:function(a){if("error"==a.getAttribute("type")){i.info("SASL binding failed.");var b,c=a.getElementsByTagName("conflict");return c.length>0&&(b="conflict"),this._changeConnectStatus(i.Status.AUTHFAIL,b),!1}var d,e=a.getElementsByTagName("bind");return e.length>0?(d=e[0].getElementsByTagName("jid"),void(d.length>0&&(this.jid=i.getText(d[0]),this.do_session?(this._addSysHandler(this._sasl_session_cb.bind(this),null,null,null,"_session_auth_2"),this.send(g({type:"set",id:"_session_auth_2"}).c("session",{xmlns:i.NS.SESSION}).tree())):(this.authenticated=!0,this._changeConnectStatus(i.Status.CONNECTED,null))))):(i.info("SASL binding failed."),this._changeConnectStatus(i.Status.AUTHFAIL,null),!1)},_sasl_session_cb:function(a){if("result"==a.getAttribute("type"))this.authenticated=!0,this._changeConnectStatus(i.Status.CONNECTED,null);else if("error"==a.getAttribute("type"))return i.info("Session creation failed."),this._changeConnectStatus(i.Status.AUTHFAIL,null),!1;return!1},_sasl_failure_cb:function(a){return this._sasl_success_handler&&(this.deleteHandler(this._sasl_success_handler),this._sasl_success_handler=null),this._sasl_challenge_handler&&(this.deleteHandler(this._sasl_challenge_handler),this._sasl_challenge_handler=null),this._sasl_mechanism&&this._sasl_mechanism.onFailure(),this._changeConnectStatus(i.Status.AUTHFAIL,null),!1},_auth2_cb:function(a){return"result"==a.getAttribute("type")?(this.authenticated=!0,
this._changeConnectStatus(i.Status.CONNECTED,null)):"error"==a.getAttribute("type")&&(this._changeConnectStatus(i.Status.AUTHFAIL,null),this.disconnect("authentication failed")),!1},_addSysTimedHandler:function(a,b){var c=new i.TimedHandler(a,b);return c.user=!1,this.addTimeds.push(c),c},_addSysHandler:function(a,b,c,d,e){var f=new i.Handler(a,b,c,d,e);return f.user=!1,this.addHandlers.push(f),f},_onDisconnectTimeout:function(){return i.info("_onDisconnectTimeout was called"),this._proto._onDisconnectTimeout(),this._doDisconnect(),!1},_onIdle:function(){for(var a,b,c,d;this.addTimeds.length>0;)this.timedHandlers.push(this.addTimeds.pop());for(;this.removeTimeds.length>0;)b=this.removeTimeds.pop(),a=this.timedHandlers.indexOf(b),a>=0&&this.timedHandlers.splice(a,1);var e=(new Date).getTime();for(d=[],a=0;a<this.timedHandlers.length;a++)b=this.timedHandlers[a],(this.authenticated||!b.user)&&(c=b.lastCalled+b.period,0>=c-e?b.run()&&d.push(b):d.push(b));this.timedHandlers=d,clearTimeout(this._idleTimeout),this._proto._onIdle(),this.connected&&(this._idleTimeout=setTimeout(this._onIdle.bind(this),100))}},i.SASLMechanism=function(a,b,c){this.name=a,this.isClientFirst=b,this.priority=c},i.SASLMechanism.prototype={test:function(a){return!0},onStart:function(a){this._connection=a},onChallenge:function(a,b){throw new Error("You should implement challenge handling!")},onFailure:function(){this._connection=null},onSuccess:function(){this._connection=null}},i.SASLAnonymous=function(){},i.SASLAnonymous.prototype=new i.SASLMechanism("ANONYMOUS",!1,10),i.SASLAnonymous.test=function(a){return null===a.authcid},i.Connection.prototype.mechanisms[i.SASLAnonymous.prototype.name]=i.SASLAnonymous,i.SASLPlain=function(){},i.SASLPlain.prototype=new i.SASLMechanism("PLAIN",!0,20),i.SASLPlain.test=function(a){return null!==a.authcid},i.SASLPlain.prototype.onChallenge=function(a){var b=a.authzid;return b+="\x00",b+=a.authcid,b+="\x00",b+=a.pass,d.utf16to8(b)},i.Connection.prototype.mechanisms[i.SASLPlain.prototype.name]=i.SASLPlain,i.SASLSHA1=function(){},i.SASLSHA1.prototype=new i.SASLMechanism("SCRAM-SHA-1",!0,40),i.SASLSHA1.test=function(a){return null!==a.authcid},i.SASLSHA1.prototype.onChallenge=function(e,f,g){var h=g||c.hexdigest(1234567890*Math.random()),i="n="+d.utf16to8(e.authcid);return i+=",r=",i+=h,e._sasl_data.cnonce=h,e._sasl_data["client-first-message-bare"]=i,i="n,,"+i,this.onChallenge=function(c,e){for(var f,g,h,i,j,k,l,m,n,o,p,q,r="c=biws,",s=c._sasl_data["client-first-message-bare"]+","+e+",",t=c._sasl_data.cnonce,u=/([a-z]+)=([^,]+)(,|$)/;e.match(u);){var v=e.match(u);switch(e=e.replace(v[0],""),v[1]){case"r":f=v[2];break;case"s":g=v[2];break;case"i":h=v[2]}}if(f.substr(0,t.length)!==t)return c._sasl_data={},c._sasl_failure_cb();for(r+="r="+f,s+=r,g=b.decode(g),g+="\x00\x00\x00",n=d.utf16to8(c.pass),i=k=a.core_hmac_sha1(n,g),l=1;h>l;l++){for(j=a.core_hmac_sha1(n,a.binb2str(k)),m=0;5>m;m++)i[m]^=j[m];k=j}for(i=a.binb2str(i),o=a.core_hmac_sha1(i,"Client Key"),p=a.str_hmac_sha1(i,"Server Key"),q=a.core_hmac_sha1(a.str_sha1(a.binb2str(o)),s),c._sasl_data["server-signature"]=a.b64_hmac_sha1(p,s),m=0;5>m;m++)o[m]^=q[m];return r+=",p="+b.encode(a.binb2str(o))}.bind(this),i},i.Connection.prototype.mechanisms[i.SASLSHA1.prototype.name]=i.SASLSHA1,i.SASLMD5=function(){},i.SASLMD5.prototype=new i.SASLMechanism("DIGEST-MD5",!1,30),i.SASLMD5.test=function(a){return null!==a.authcid},i.SASLMD5.prototype._quote=function(a){return'"'+a.replace(/\\/g,"\\\\").replace(/"/g,'\\"')+'"'},i.SASLMD5.prototype.onChallenge=function(a,b,e){for(var f,g=/([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/,h=e||c.hexdigest(""+1234567890*Math.random()),i="",j=null,k="",l="";b.match(g);)switch(f=b.match(g),b=b.replace(f[0],""),f[2]=f[2].replace(/^"(.+)"$/,"$1"),f[1]){case"realm":i=f[2];break;case"nonce":k=f[2];break;case"qop":l=f[2];break;case"host":j=f[2]}var m=a.servtype+"/"+a.domain;null!==j&&(m=m+"/"+j);var n=d.utf16to8(a.authcid+":"+i+":"+this._connection.pass),o=c.hash(n)+":"+k+":"+h,p="AUTHENTICATE:"+m,q="";return q+="charset=utf-8,",q+="username="+this._quote(d.utf16to8(a.authcid))+",",q+="realm="+this._quote(i)+",",q+="nonce="+this._quote(k)+",",q+="nc=00000001,",q+="cnonce="+this._quote(h)+",",q+="digest-uri="+this._quote(m)+",",q+="response="+c.hexdigest(c.hexdigest(o)+":"+k+":00000001:"+h+":auth:"+c.hexdigest(p))+",",q+="qop=auth",this.onChallenge=function(){return""}.bind(this),q},i.Connection.prototype.mechanisms[i.SASLMD5.prototype.name]=i.SASLMD5,{Strophe:i,$build:e,$msg:f,$iq:g,$pres:h,SHA1:a,Base64:b,MD5:c}}),function(a,b){return"function"==typeof define&&define.amd?void define("strophe-bosh",["strophe-core"],function(a){return b(a.Strophe,a.$build)}):b(Strophe,$build)}(this,function(a,b){return a.Request=function(b,c,d,e){this.id=++a._requestId,this.xmlData=b,this.data=a.serialize(b),this.origFunc=c,this.func=c,this.rid=d,this.date=0/0,this.sends=e||0,this.abort=!1,this.dead=null,this.age=function(){if(!this.date)return 0;var a=new Date;return(a-this.date)/1e3},this.timeDead=function(){if(!this.dead)return 0;var a=new Date;return(a-this.dead)/1e3},this.xhr=this._newXHR()},a.Request.prototype={getResponse:function(){var b=null;if(this.xhr.responseXML&&this.xhr.responseXML.documentElement){if(b=this.xhr.responseXML.documentElement,"parsererror"==b.tagName)throw a.error("invalid response received"),a.error("responseText: "+this.xhr.responseText),a.error("responseXML: "+a.serialize(this.xhr.responseXML)),"parsererror"}else if(this.xhr.responseText)throw a.error("invalid response received"),a.error("responseText: "+this.xhr.responseText),"badformat";return b},_newXHR:function(){var a=null;return window.XMLHttpRequest?(a=new XMLHttpRequest,a.overrideMimeType&&a.overrideMimeType("text/xml; charset=utf-8")):window.ActiveXObject&&(a=new ActiveXObject("Microsoft.XMLHTTP")),a.onreadystatechange=this.func.bind(null,this),a}},a.Bosh=function(a){this._conn=a,this.rid=Math.floor(4294967295*Math.random()),this.sid=null,this.hold=1,this.wait=60,this.window=5,this.errors=0,this._requests=[]},a.Bosh.prototype={strip:null,_buildBody:function(){var c=b("body",{rid:this.rid++,xmlns:a.NS.HTTPBIND});return null!==this.sid&&c.attrs({sid:this.sid}),this._conn.options.keepalive&&this._cacheSession(),c},_reset:function(){this.rid=Math.floor(4294967295*Math.random()),this.sid=null,this.errors=0,window.sessionStorage.removeItem("strophe-bosh-session"),this._conn.nextValidRid(this.rid)},_connect:function(b,c,d){this.wait=b||this.wait,this.hold=c||this.hold,this.errors=0;var e=this._buildBody().attrs({to:this._conn.domain,"xml:lang":"en",wait:this.wait,hold:this.hold,content:"text/xml; charset=utf-8",ver:"1.6","xmpp:version":"1.0","xmlns:xmpp":a.NS.BOSH});d&&e.attrs({route:d});var f=this._conn._connect_cb;this._requests.push(new a.Request(e.tree(),this._onRequestStateChange.bind(this,f.bind(this._conn)),e.tree().getAttribute("rid"))),this._throttledRequestHandler()},_attach:function(b,c,d,e,f,g,h){this._conn.jid=b,this.sid=c,this.rid=d,this._conn.connect_callback=e,this._conn.domain=a.getDomainFromJid(this._conn.jid),this._conn.authenticated=!0,this._conn.connected=!0,this.wait=f||this.wait,this.hold=g||this.hold,this.window=h||this.window,this._conn._changeConnectStatus(a.Status.ATTACHED,null)},_restore:function(b,c,d,e,f){var g=JSON.parse(window.sessionStorage.getItem("strophe-bosh-session"));if(!("undefined"!=typeof g&&null!==g&&g.rid&&g.sid&&g.jid)||"undefined"!=typeof b&&"null"!==b&&a.getBareJidFromJid(g.jid)!=a.getBareJidFromJid(b))throw{name:"StropheSessionError",message:"_restore: no restoreable session."};this._conn.restored=!0,this._attach(g.jid,g.sid,g.rid,c,d,e,f)},_cacheSession:function(){this._conn.authenticated?this._conn.jid&&this.rid&&this.sid&&window.sessionStorage.setItem("strophe-bosh-session",JSON.stringify({jid:this._conn.jid,rid:this.rid,sid:this.sid})):window.sessionStorage.removeItem("strophe-bosh-session")},_connect_cb:function(b){var c,d,e=b.getAttribute("type");if(null!==e&&"terminate"==e)return c=b.getAttribute("condition"),a.error("BOSH-Connection failed: "+c),d=b.getElementsByTagName("conflict"),null!==c?("remote-stream-error"==c&&d.length>0&&(c="conflict"),this._conn._changeConnectStatus(a.Status.CONNFAIL,c)):this._conn._changeConnectStatus(a.Status.CONNFAIL,"unknown"),this._conn._doDisconnect(c),a.Status.CONNFAIL;this.sid||(this.sid=b.getAttribute("sid"));var f=b.getAttribute("requests");f&&(this.window=parseInt(f,10));var g=b.getAttribute("hold");g&&(this.hold=parseInt(g,10));var h=b.getAttribute("wait");h&&(this.wait=parseInt(h,10))},_disconnect:function(a){this._sendTerminate(a)},_doDisconnect:function(){this.sid=null,this.rid=Math.floor(4294967295*Math.random()),window.sessionStorage.removeItem("strophe-bosh-session"),this._conn.nextValidRid(this.rid)},_emptyQueue:function(){return 0===this._requests.length},_hitError:function(b){this.errors++,a.warn("request errored, status: "+b+", number of errors: "+this.errors),this.errors>4&&this._conn._onDisconnectTimeout()},_no_auth_received:function(b){b=b?b.bind(this._conn):this._conn._connect_cb.bind(this._conn);var c=this._buildBody();this._requests.push(new a.Request(c.tree(),this._onRequestStateChange.bind(this,b.bind(this._conn)),c.tree().getAttribute("rid"))),this._throttledRequestHandler()},_onDisconnectTimeout:function(){this._abortAllRequests()},_abortAllRequests:function(){for(var a;this._requests.length>0;)a=this._requests.pop(),a.abort=!0,a.xhr.abort(),a.xhr.onreadystatechange=function(){}},_onIdle:function(){var b=this._conn._data;if(this._conn.authenticated&&0===this._requests.length&&0===b.length&&!this._conn.disconnecting&&(a.info("no requests during idle cycle, sending blank request"),b.push(null)),!this._conn.paused){if(this._requests.length<2&&b.length>0){for(var c=this._buildBody(),d=0;d<b.length;d++)null!==b[d]&&("restart"===b[d]?c.attrs({to:this._conn.domain,"xml:lang":"en","xmpp:restart":"true","xmlns:xmpp":a.NS.BOSH}):c.cnode(b[d]).up());delete this._conn._data,this._conn._data=[],this._requests.push(new a.Request(c.tree(),this._onRequestStateChange.bind(this,this._conn._dataRecv.bind(this._conn)),c.tree().getAttribute("rid"))),this._throttledRequestHandler()}if(this._requests.length>0){var e=this._requests[0].age();null!==this._requests[0].dead&&this._requests[0].timeDead()>Math.floor(a.SECONDARY_TIMEOUT*this.wait)&&this._throttledRequestHandler(),e>Math.floor(a.TIMEOUT*this.wait)&&(a.warn("Request "+this._requests[0].id+" timed out, over "+Math.floor(a.TIMEOUT*this.wait)+" seconds since last activity"),this._throttledRequestHandler())}}},_onRequestStateChange:function(b,c){if(a.debug("request id "+c.id+"."+c.sends+" state changed to "+c.xhr.readyState),c.abort)return void(c.abort=!1);var d;if(4==c.xhr.readyState){d=0;try{d=c.xhr.status}catch(e){}if("undefined"==typeof d&&(d=0),this.disconnecting&&d>=400)return void this._hitError(d);var f=this._requests[0]==c,g=this._requests[1]==c;(d>0&&500>d||c.sends>5)&&(this._removeRequest(c),a.debug("request id "+c.id+" should now be removed")),200==d?((g||f&&this._requests.length>0&&this._requests[0].age()>Math.floor(a.SECONDARY_TIMEOUT*this.wait))&&this._restartRequest(0),this._conn.nextValidRid(Number(c.rid)+1),a.debug("request id "+c.id+"."+c.sends+" got 200"),b(c),this.errors=0):(a.error("request id "+c.id+"."+c.sends+" error "+d+" happened"),(0===d||d>=400&&600>d||d>=12e3)&&(this._hitError(d),d>=400&&500>d&&(this._conn._changeConnectStatus(a.Status.DISCONNECTING,null),this._conn._doDisconnect()))),d>0&&500>d||c.sends>5||this._throttledRequestHandler()}},_processRequest:function(b){var c=this,d=this._requests[b],e=-1;try{4==d.xhr.readyState&&(e=d.xhr.status)}catch(f){a.error("caught an error in _requests["+b+"], reqStatus: "+e)}if("undefined"==typeof e&&(e=-1),d.sends>this._conn.maxRetries)return void this._conn._onDisconnectTimeout();var g=d.age(),h=!isNaN(g)&&g>Math.floor(a.TIMEOUT*this.wait),i=null!==d.dead&&d.timeDead()>Math.floor(a.SECONDARY_TIMEOUT*this.wait),j=4==d.xhr.readyState&&(1>e||e>=500);if((h||i||j)&&(i&&a.error("Request "+this._requests[b].id+" timed out (secondary), restarting"),d.abort=!0,d.xhr.abort(),d.xhr.onreadystatechange=function(){},this._requests[b]=new a.Request(d.xmlData,d.origFunc,d.rid,d.sends),d=this._requests[b]),0===d.xhr.readyState){a.debug("request id "+d.id+"."+d.sends+" posting");try{d.xhr.open("POST",this._conn.service,this._conn.options.sync?!1:!0),d.xhr.setRequestHeader("Content-Type","text/xml; charset=utf-8"),this._conn.options.withCredentials&&(d.xhr.withCredentials=!0)}catch(k){return a.error("XHR open failed."),this._conn.connected||this._conn._changeConnectStatus(a.Status.CONNFAIL,"bad-service"),void this._conn.disconnect()}var l=function(){if(d.date=new Date,c._conn.options.customHeaders){var a=c._conn.options.customHeaders;for(var b in a)a.hasOwnProperty(b)&&d.xhr.setRequestHeader(b,a[b])}d.xhr.send(d.data)};if(d.sends>1){var m=1e3*Math.min(Math.floor(a.TIMEOUT*this.wait),Math.pow(d.sends,3));setTimeout(l,m)}else l();d.sends++,this._conn.xmlOutput!==a.Connection.prototype.xmlOutput&&this._conn.xmlOutput(d.xmlData.nodeName===this.strip&&d.xmlData.childNodes.length?d.xmlData.childNodes[0]:d.xmlData),this._conn.rawOutput!==a.Connection.prototype.rawOutput&&this._conn.rawOutput(d.data)}else a.debug("_processRequest: "+(0===b?"first":"second")+" request has readyState of "+d.xhr.readyState)},_removeRequest:function(b){a.debug("removing request");var c;for(c=this._requests.length-1;c>=0;c--)b==this._requests[c]&&this._requests.splice(c,1);b.xhr.onreadystatechange=function(){},this._throttledRequestHandler()},_restartRequest:function(a){var b=this._requests[a];null===b.dead&&(b.dead=new Date),this._processRequest(a)},_reqToData:function(a){try{return a.getResponse()}catch(b){if("parsererror"!=b)throw b;this._conn.disconnect("strophe-parsererror")}},_sendTerminate:function(b){a.info("_sendTerminate was called");var c=this._buildBody().attrs({type:"terminate"});b&&c.cnode(b.tree());var d=new a.Request(c.tree(),this._onRequestStateChange.bind(this,this._conn._dataRecv.bind(this._conn)),c.tree().getAttribute("rid"));this._requests.push(d),this._throttledRequestHandler()},_send:function(){clearTimeout(this._conn._idleTimeout),this._throttledRequestHandler(),this._conn._idleTimeout=setTimeout(this._conn._onIdle.bind(this._conn),100)},_sendRestart:function(){this._throttledRequestHandler(),clearTimeout(this._conn._idleTimeout)},_throttledRequestHandler:function(){a.debug(this._requests?"_throttledRequestHandler called with "+this._requests.length+" requests":"_throttledRequestHandler called with undefined requests"),this._requests&&0!==this._requests.length&&(this._requests.length>0&&this._processRequest(0),this._requests.length>1&&Math.abs(this._requests[0].rid-this._requests[1].rid)<this.window&&this._processRequest(1))}},a}),function(a,b){return"function"==typeof define&&define.amd?void define("strophe-websocket",["strophe-core"],function(a){return b(a.Strophe,a.$build)}):b(Strophe,$build)}(this,function(a,b){return a.Websocket=function(a){this._conn=a,this.strip="wrapper";var b=a.service;if(0!==b.indexOf("ws:")&&0!==b.indexOf("wss:")){var c="";c+="ws"===a.options.protocol&&"https:"!==window.location.protocol?"ws":"wss",c+="://"+window.location.host,c+=0!==b.indexOf("/")?window.location.pathname+b:b,a.service=c}},a.Websocket.prototype={_buildStream:function(){return b("open",{xmlns:a.NS.FRAMING,to:this._conn.domain,version:"1.0"})},_check_streamerror:function(b,c){var d;if(d=b.getElementsByTagNameNS?b.getElementsByTagNameNS(a.NS.STREAM,"error"):b.getElementsByTagName("stream:error"),0===d.length)return!1;for(var e=d[0],f="",g="",h="urn:ietf:params:xml:ns:xmpp-streams",i=0;i<e.childNodes.length;i++){var j=e.childNodes[i];if(j.getAttribute("xmlns")!==h)break;"text"===j.nodeName?g=j.textContent:f=j.nodeName}var k="WebSocket stream error: ";return k+=f?f:"unknown",g&&(k+=" - "+f),a.error(k),this._conn._changeConnectStatus(c,f),this._conn._doDisconnect(),!0},_reset:function(){},_connect:function(){this._closeSocket(),this.socket=new WebSocket(this._conn.service,"xmpp"),this.socket.onopen=this._onOpen.bind(this),this.socket.onerror=this._onError.bind(this),this.socket.onclose=this._onClose.bind(this),this.socket.onmessage=this._connect_cb_wrapper.bind(this)},_connect_cb:function(b){var c=this._check_streamerror(b,a.Status.CONNFAIL);return c?a.Status.CONNFAIL:void 0},_handleStreamStart:function(b){var c=!1,d=b.getAttribute("xmlns");"string"!=typeof d?c="Missing xmlns in <open />":d!==a.NS.FRAMING&&(c="Wrong xmlns in <open />: "+d);var e=b.getAttribute("version");return"string"!=typeof e?c="Missing version in <open />":"1.0"!==e&&(c="Wrong version in <open />: "+e),c?(this._conn._changeConnectStatus(a.Status.CONNFAIL,c),this._conn._doDisconnect(),!1):!0},_connect_cb_wrapper:function(b){if(0===b.data.indexOf("<open ")||0===b.data.indexOf("<?xml")){var c=b.data.replace(/^(<\?.*?\?>\s*)*/,"");if(""===c)return;var d=(new DOMParser).parseFromString(c,"text/xml").documentElement;this._conn.xmlInput(d),this._conn.rawInput(b.data),this._handleStreamStart(d)&&this._connect_cb(d)}else if(0===b.data.indexOf("<close ")){this._conn.rawInput(b.data),this._conn.xmlInput(b);var e=b.getAttribute("see-other-uri");e?(this._conn._changeConnectStatus(a.Status.REDIRECT,"Received see-other-uri, resetting connection"),this._conn.reset(),this._conn.service=e,this._connect()):(this._conn._changeConnectStatus(a.Status.CONNFAIL,"Received closing stream"),this._conn._doDisconnect())}else{var f=this._streamWrap(b.data),g=(new DOMParser).parseFromString(f,"text/xml").documentElement;this.socket.onmessage=this._onMessage.bind(this),this._conn._connect_cb(g,null,b.data)}},_disconnect:function(c){if(this.socket&&this.socket.readyState!==WebSocket.CLOSED){c&&this._conn.send(c);var d=b("close",{xmlns:a.NS.FRAMING});this._conn.xmlOutput(d);var e=a.serialize(d);this._conn.rawOutput(e);try{this.socket.send(e)}catch(f){a.info("Couldn't send <close /> tag.")}}this._conn._doDisconnect()},_doDisconnect:function(){a.info("WebSockets _doDisconnect was called"),this._closeSocket()},_streamWrap:function(a){return"<wrapper>"+a+"</wrapper>"},_closeSocket:function(){if(this.socket)try{this.socket.close()}catch(a){}this.socket=null},_emptyQueue:function(){return!0},_onClose:function(){this._conn.connected&&!this._conn.disconnecting?(a.error("Websocket closed unexcectedly"),this._conn._doDisconnect()):a.info("Websocket closed")},_no_auth_received:function(b){a.error("Server did not send any auth methods"),this._conn._changeConnectStatus(a.Status.CONNFAIL,"Server did not send any auth methods"),b&&(b=b.bind(this._conn))(),this._conn._doDisconnect()},_onDisconnectTimeout:function(){},_abortAllRequests:function(){},_onError:function(b){a.error("Websocket error "+b),this._conn._changeConnectStatus(a.Status.CONNFAIL,"The WebSocket connection could not be established or was disconnected."),this._disconnect()},_onIdle:function(){var b=this._conn._data;if(b.length>0&&!this._conn.paused){for(var c=0;c<b.length;c++)if(null!==b[c]){var d,e;d="restart"===b[c]?this._buildStream().tree():b[c],e=a.serialize(d),this._conn.xmlOutput(d),this._conn.rawOutput(e),this.socket.send(e)}this._conn._data=[]}},_onMessage:function(b){var c,d,e='<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';if(b.data===e)return this._conn.rawInput(e),this._conn.xmlInput(b),void(this._conn.disconnecting||this._conn._doDisconnect());if(0===b.data.search("<open ")){if(c=(new DOMParser).parseFromString(b.data,"text/xml").documentElement,!this._handleStreamStart(c))return}else d=this._streamWrap(b.data),c=(new DOMParser).parseFromString(d,"text/xml").documentElement;return this._check_streamerror(c,a.Status.ERROR)?void 0:this._conn.disconnecting&&"presence"===c.firstChild.nodeName&&"unavailable"===c.firstChild.getAttribute("type")?(this._conn.xmlInput(c),void this._conn.rawInput(a.serialize(c))):void this._conn._dataRecv(c,b.data)},_onOpen:function(){a.info("Websocket open");var b=this._buildStream();this._conn.xmlOutput(b.tree());var c=a.serialize(b);this._conn.rawOutput(c),this.socket.send(c)},_reqToData:function(a){return a},_send:function(){this._conn.flush()},_sendRestart:function(){clearTimeout(this._conn._idleTimeout),this._conn._onIdle.bind(this._conn)()}},a}),function(a){"function"==typeof define&&define.amd&&define("strophe",["strophe-core","strophe-bosh","strophe-websocket"],function(a){return a})}(this),a){if("function"!=typeof define||!define.amd)return a(Strophe,$build,$msg,$iq,$pres);var b=a;require(["strophe"],function(a){b(a.Strophe,a.$build,a.$msg,a.$iq,a.$pres)})}}(function(a,b,c,d,e){window.Strophe=a,window.$build=b,window.$msg=c,window.$iq=d,window.$pres=e});
/*!
 Copyright 2011-2013 Abdulla Abdurakhmanov
 Original sources are available at https://code.google.com/p/x2js/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function (root, factory) {
     if (typeof define === "function" && define.amd) {
         define([], factory);
     } else if (typeof exports === "object") {
         module.exports = factory();
     } else {
         root.X2JS = factory();
     }
 }(this, function () {
	return function (config) {
		'use strict';
			
		var VERSION = "1.2.0";
		
		config = config || {};
		initConfigDefaults();
		initRequiredPolyfills();
		
		function initConfigDefaults() {
			if(config.escapeMode === undefined) {
				config.escapeMode = true;
			}
			
			config.attributePrefix = config.attributePrefix || "_";
			config.arrayAccessForm = config.arrayAccessForm || "none";
			config.emptyNodeForm = config.emptyNodeForm || "text";		
			
			if(config.enableToStringFunc === undefined) {
				config.enableToStringFunc = true; 
			}
			config.arrayAccessFormPaths = config.arrayAccessFormPaths || []; 
			if(config.skipEmptyTextNodesForObj === undefined) {
				config.skipEmptyTextNodesForObj = true;
			}
			if(config.stripWhitespaces === undefined) {
				config.stripWhitespaces = true;
			}
			config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];
	
			if(config.useDoubleQuotes === undefined) {
				config.useDoubleQuotes = false;
			}
			
			config.xmlElementsFilter = config.xmlElementsFilter || [];
			config.jsonPropertiesFilter = config.jsonPropertiesFilter || [];
			
			if(config.keepCData === undefined) {
				config.keepCData = false;
			}
		}
	
		var DOMNodeTypes = {
			ELEMENT_NODE 	   : 1,
			TEXT_NODE    	   : 3,
			CDATA_SECTION_NODE : 4,
			COMMENT_NODE	   : 8,
			DOCUMENT_NODE 	   : 9
		};
		
		function initRequiredPolyfills() {		
		}
		
		function getNodeLocalName( node ) {
			var nodeLocalName = node.localName;			
			if(nodeLocalName == null) // Yeah, this is IE!! 
				nodeLocalName = node.baseName;
			if(nodeLocalName == null || nodeLocalName=="") // =="" is IE too
				nodeLocalName = node.nodeName;
			return nodeLocalName;
		}
		
		function getNodePrefix(node) {
			return node.prefix;
		}
			
		function escapeXmlChars(str) {
			if(typeof(str) == "string")
				return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
			else
				return str;
		}
	
		function unescapeXmlChars(str) {
			return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
		}
		
		function checkInStdFiltersArrayForm(stdFiltersArrayForm, obj, name, path) {
			var idx = 0;
			for(; idx < stdFiltersArrayForm.length; idx++) {
				var filterPath = stdFiltersArrayForm[idx];
				if( typeof filterPath === "string" ) {
					if(filterPath == path)
						break;
				}
				else
				if( filterPath instanceof RegExp) {
					if(filterPath.test(path))
						break;
				}				
				else
				if( typeof filterPath === "function") {
					if(filterPath(obj, name, path))
						break;
				}
			}
			return idx!=stdFiltersArrayForm.length;
		}
		
		function toArrayAccessForm(obj, childName, path) {
			switch(config.arrayAccessForm) {
				case "property":
					if(!(obj[childName] instanceof Array))
						obj[childName+"_asArray"] = [obj[childName]];
					else
						obj[childName+"_asArray"] = obj[childName];
					break;
				/*case "none":
					break;*/
			}
			
			if(!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
				if(checkInStdFiltersArrayForm(config.arrayAccessFormPaths, obj, childName, path)) {
					obj[childName] = [obj[childName]];
				}			
			}
		}
		
		function fromXmlDateTime(prop) {
			// Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
			// Improved to support full spec and optional parts
			var bits = prop.split(/[-T:+Z]/g);
			
			var d = new Date(bits[0], bits[1]-1, bits[2]);			
			var secondBits = bits[5].split("\.");
			d.setHours(bits[3], bits[4], secondBits[0]);
			if(secondBits.length>1)
				d.setMilliseconds(secondBits[1]);
	
			// Get supplied time zone offset in minutes
			if(bits[6] && bits[7]) {
				var offsetMinutes = bits[6] * 60 + Number(bits[7]);
				var sign = /\d\d-\d\d:\d\d$/.test(prop)? '-' : '+';
	
				// Apply the sign
				offsetMinutes = 0 + (sign == '-'? -1 * offsetMinutes : offsetMinutes);
	
				// Apply offset and local timezone
				d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset())
			}
			else
				if(prop.indexOf("Z", prop.length - 1) !== -1) {
					d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));					
				}
	
			// d is now a local time equivalent to the supplied time
			return d;
		}
		
		function checkFromXmlDateTimePaths(value, childName, fullPath) {
			if(config.datetimeAccessFormPaths.length > 0) {
				var path = fullPath.split("\.#")[0];
				if(checkInStdFiltersArrayForm(config.datetimeAccessFormPaths, value, childName, path)) {
					return fromXmlDateTime(value);
				}
				else
					return value;			
			}
			else
				return value;
		}
		
		function checkXmlElementsFilter(obj, childType, childName, childPath) {
			if( childType == DOMNodeTypes.ELEMENT_NODE && config.xmlElementsFilter.length > 0) {
				return checkInStdFiltersArrayForm(config.xmlElementsFilter, obj, childName, childPath);	
			}
			else
				return true;
		}	
	
		function parseDOMChildren( node, path ) {
			if(node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
				var result = new Object;
				var nodeChildren = node.childNodes;
				// Alternative for firstElementChild which is not supported in some environments
				for(var cidx=0; cidx <nodeChildren.length; cidx++) {
					var child = nodeChildren.item(cidx);
					if(child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
						var childName = getNodeLocalName(child);
						result[childName] = parseDOMChildren(child, childName);
					}
				}
				return result;
			}
			else
			if(node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
				var result = new Object;
				result.__cnt=0;
				
				var nodeChildren = node.childNodes;
				
				// Children nodes
				for(var cidx=0; cidx <nodeChildren.length; cidx++) {
					var child = nodeChildren.item(cidx); // nodeChildren[cidx];
					var childName = getNodeLocalName(child);
					
					if(child.nodeType!= DOMNodeTypes.COMMENT_NODE) {
						var childPath = path+"."+childName;
						if (checkXmlElementsFilter(result,child.nodeType,childName,childPath)) {
							result.__cnt++;
							if(result[childName] == null) {
								result[childName] = parseDOMChildren(child, childPath);
								toArrayAccessForm(result, childName, childPath);					
							}
							else {
								if(result[childName] != null) {
									if( !(result[childName] instanceof Array)) {
										result[childName] = [result[childName]];
										toArrayAccessForm(result, childName, childPath);
									}
								}
								(result[childName])[result[childName].length] = parseDOMChildren(child, childPath);
							}
						}
					}								
				}
				
				// Attributes
				for(var aidx=0; aidx <node.attributes.length; aidx++) {
					var attr = node.attributes.item(aidx); // [aidx];
					result.__cnt++;
					result[config.attributePrefix+attr.name]=attr.value;
				}
				
				// Node namespace prefix
				var nodePrefix = getNodePrefix(node);
				if(nodePrefix!=null && nodePrefix!="") {
					result.__cnt++;
					result.__prefix=nodePrefix;
				}
				
				if(result["#text"]!=null) {				
					result.__text = result["#text"];
					if(result.__text instanceof Array) {
						result.__text = result.__text.join("\n");
					}
					//if(config.escapeMode)
					//	result.__text = unescapeXmlChars(result.__text);
					if(config.stripWhitespaces)
						result.__text = result.__text.trim();
					delete result["#text"];
					if(config.arrayAccessForm=="property")
						delete result["#text_asArray"];
					result.__text = checkFromXmlDateTimePaths(result.__text, childName, path+"."+childName);
				}
				if(result["#cdata-section"]!=null) {
					result.__cdata = result["#cdata-section"];
					delete result["#cdata-section"];
					if(config.arrayAccessForm=="property")
						delete result["#cdata-section_asArray"];
				}
				
				if( result.__cnt == 0 && config.emptyNodeForm=="text" ) {
					result = '';
				}
				else
				if( result.__cnt == 1 && result.__text!=null  ) {
					result = result.__text;
				}
				else
				if( result.__cnt == 1 && result.__cdata!=null && !config.keepCData  ) {
					result = result.__cdata;
				}			
				else			
				if ( result.__cnt > 1 && result.__text!=null && config.skipEmptyTextNodesForObj) {
					if( (config.stripWhitespaces && result.__text=="") || (result.__text.trim()=="")) {
						delete result.__text;
					}
				}
				delete result.__cnt;			
				
				if( config.enableToStringFunc && (result.__text!=null || result.__cdata!=null )) {
					result.toString = function() {
						return (this.__text!=null? this.__text:'')+( this.__cdata!=null ? this.__cdata:'');
					};
				}
				
				return result;
			}
			else
			if(node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
				return node.nodeValue;
			}	
		}
		
		function startTag(jsonObj, element, attrList, closed) {
			var resultStr = "<"+ ( (jsonObj!=null && jsonObj.__prefix!=null)? (jsonObj.__prefix+":"):"") + element;
			if(attrList!=null) {
				for(var aidx = 0; aidx < attrList.length; aidx++) {
					var attrName = attrList[aidx];
					var attrVal = jsonObj[attrName];
					if(config.escapeMode)
						attrVal=escapeXmlChars(attrVal);
					resultStr+=" "+attrName.substr(config.attributePrefix.length)+"=";
					if(config.useDoubleQuotes)
						resultStr+='"'+attrVal+'"';
					else
						resultStr+="'"+attrVal+"'";
				}
			}
			if(!closed)
				resultStr+=">";
			else
				resultStr+="/>";
			return resultStr;
		}
		
		function endTag(jsonObj,elementName) {
			return "</"+ (jsonObj.__prefix!=null? (jsonObj.__prefix+":"):"")+elementName+">";
		}
		
		function endsWith(str, suffix) {
			return str.indexOf(suffix, str.length - suffix.length) !== -1;
		}
		
		function jsonXmlSpecialElem ( jsonObj, jsonObjField ) {
			if((config.arrayAccessForm=="property" && endsWith(jsonObjField.toString(),("_asArray"))) 
					|| jsonObjField.toString().indexOf(config.attributePrefix)==0 
					|| jsonObjField.toString().indexOf("__")==0
					|| (jsonObj[jsonObjField] instanceof Function) )
				return true;
			else
				return false;
		}
		
		function jsonXmlElemCount ( jsonObj ) {
			var elementsCnt = 0;
			if(jsonObj instanceof Object ) {
				for( var it in jsonObj  ) {
					if(jsonXmlSpecialElem ( jsonObj, it) )
						continue;			
					elementsCnt++;
				}
			}
			return elementsCnt;
		}
		
		function checkJsonObjPropertiesFilter(jsonObj, propertyName, jsonObjPath) {
			return config.jsonPropertiesFilter.length == 0
				|| jsonObjPath==""
				|| checkInStdFiltersArrayForm(config.jsonPropertiesFilter, jsonObj, propertyName, jsonObjPath);	
		}
		
		function parseJSONAttributes ( jsonObj ) {
			var attrList = [];
			if(jsonObj instanceof Object ) {
				for( var ait in jsonObj  ) {
					if(ait.toString().indexOf("__")== -1 && ait.toString().indexOf(config.attributePrefix)==0) {
						attrList.push(ait);
					}
				}
			}
			return attrList;
		}
		
		function parseJSONTextAttrs ( jsonTxtObj ) {
			var result ="";
			
			if(jsonTxtObj.__cdata!=null) {										
				result+="<![CDATA["+jsonTxtObj.__cdata+"]]>";					
			}
			
			if(jsonTxtObj.__text!=null) {			
				if(config.escapeMode)
					result+=escapeXmlChars(jsonTxtObj.__text);
				else
					result+=jsonTxtObj.__text;
			}
			return result;
		}
		
		function parseJSONTextObject ( jsonTxtObj ) {
			var result ="";
	
			if( jsonTxtObj instanceof Object ) {
				result+=parseJSONTextAttrs ( jsonTxtObj );
			}
			else
				if(jsonTxtObj!=null) {
					if(config.escapeMode)
						result+=escapeXmlChars(jsonTxtObj);
					else
						result+=jsonTxtObj;
				}
			
			return result;
		}
		
		function getJsonPropertyPath(jsonObjPath, jsonPropName) {
			if (jsonObjPath==="") {
				return jsonPropName;
			}
			else
				return jsonObjPath+"."+jsonPropName;
		}
		
		function parseJSONArray ( jsonArrRoot, jsonArrObj, attrList, jsonObjPath ) {
			var result = ""; 
			if(jsonArrRoot.length == 0) {
				result+=startTag(jsonArrRoot, jsonArrObj, attrList, true);
			}
			else {
				for(var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
					result+=startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
					result+=parseJSONObject(jsonArrRoot[arIdx], getJsonPropertyPath(jsonObjPath,jsonArrObj));
					result+=endTag(jsonArrRoot[arIdx],jsonArrObj);
				}
			}
			return result;
		}
		
		function parseJSONObject ( jsonObj, jsonObjPath ) {
			var result = "";	
	
			var elementsCnt = jsonXmlElemCount ( jsonObj );
			
			if(elementsCnt > 0) {
				for( var it in jsonObj ) {
					
					if(jsonXmlSpecialElem ( jsonObj, it) || (jsonObjPath!="" && !checkJsonObjPropertiesFilter(jsonObj, it, getJsonPropertyPath(jsonObjPath,it))) )
						continue;			
					
					var subObj = jsonObj[it];						
					
					var attrList = parseJSONAttributes( subObj )
					
					if(subObj == null || subObj == undefined) {
						result+=startTag(subObj, it, attrList, true);
					}
					else
					if(subObj instanceof Object) {
						
						if(subObj instanceof Array) {					
							result+=parseJSONArray( subObj, it, attrList, jsonObjPath );					
						}
						else if(subObj instanceof Date) {
							result+=startTag(subObj, it, attrList, false);
							result+=subObj.toISOString();
							result+=endTag(subObj,it);
						}
						else {
							var subObjElementsCnt = jsonXmlElemCount ( subObj );
							if(subObjElementsCnt > 0 || subObj.__text!=null || subObj.__cdata!=null) {
								result+=startTag(subObj, it, attrList, false);
								result+=parseJSONObject(subObj, getJsonPropertyPath(jsonObjPath,it));
								result+=endTag(subObj,it);
							}
							else {
								result+=startTag(subObj, it, attrList, true);
							}
						}
					}
					else {
						result+=startTag(subObj, it, attrList, false);
						result+=parseJSONTextObject(subObj);
						result+=endTag(subObj,it);
					}
				}
			}
			result+=parseJSONTextObject(jsonObj);
			
			return result;
		}
		
		this.parseXmlString = function(xmlDocStr) {
			var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
			if (xmlDocStr === undefined) {
				return null;
			}
			var xmlDoc;
			if (window.DOMParser) {
				var parser=new window.DOMParser();			
				var parsererrorNS = null;
				// IE9+ now is here
				if(!isIEParser) {
					try {
						parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
					}
					catch(err) {					
						parsererrorNS = null;
					}
				}
				try {
					xmlDoc = parser.parseFromString( xmlDocStr, "text/xml" );
					if( parsererrorNS!= null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
						//throw new Error('Error parsing XML: '+xmlDocStr);
						xmlDoc = null;
					}
				}
				catch(err) {
					xmlDoc = null;
				}
			}
			else {
				// IE :(
				if(xmlDocStr.indexOf("<?")==0) {
					xmlDocStr = xmlDocStr.substr( xmlDocStr.indexOf("?>") + 2 );
				}
				xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async="false";
				xmlDoc.loadXML(xmlDocStr);
			}
			return xmlDoc;
		};
		
		this.asArray = function(prop) {
			if (prop === undefined || prop == null)
				return [];
			else
			if(prop instanceof Array)
				return prop;
			else
				return [prop];
		};
		
		this.toXmlDateTime = function(dt) {
			if(dt instanceof Date)
				return dt.toISOString();
			else
			if(typeof(dt) === 'number' )
				return new Date(dt).toISOString();
			else	
				return null;
		};
		
		this.asDateTime = function(prop) {
			if(typeof(prop) == "string") {
				return fromXmlDateTime(prop);
			}
			else
				return prop;
		};
	
		this.xml2json = function (xmlDoc) {
			return parseDOMChildren ( xmlDoc );
		};
		
		this.xml_str2json = function (xmlDocStr) {
			var xmlDoc = this.parseXmlString(xmlDocStr);
			if(xmlDoc!=null)
				return this.xml2json(xmlDoc);
			else
				return null;
		};
	
		this.json2xml_str = function (jsonObj) {
			return parseJSONObject ( jsonObj, "" );
		};
	
		this.json2xml = function (jsonObj) {
			var xmlDocStr = this.json2xml_str (jsonObj);
			return this.parseXmlString(xmlDocStr);
		};
		
		this.getVersion = function () {
			return VERSION;
		};	
	}
}))
/**
 * A class containing transport functions for facilitating requests and responses between a client and a Mobile App Server.
 * @memberof MagnetJS
 * @namespace Request
 * @ignore
 */
MagnetJS.Request = function(request, callback, failback) {
    request._path = request.url;
    request.contentType = request.contentType || 'application/json';
    request.headers = request.headers || [];

    var deferred = new MagnetJS.Deferred();
    deferred.promise = new MagnetJS.Call();

    var options = {
        call : deferred.promise
    };

    if (MagnetJS.App.credentials && MagnetJS.App.credentials.access_token)
        request.headers['Authorization'] = 'Bearer ' + MagnetJS.App.credentials.access_token;

    setTimeout(function() {
        MagnetJS.Transport.request(request.data, request, options, function(result, details) {
            MagnetJS.Log.fine(details.status+' '+details.info.url+' ', {
                contentType : details.contentType,
                response    : result
            });

            options.call.state = MagnetJS.CallState.SUCCESS;
            (callback || function() {})(result, details);

        }, function(e, details) {
            MagnetJS.Log.fine(details.status+' '+details.info.url+' ', {
                contentType : details.contentType,
                response    : e
            });

            if (details.status == 401 || details.status == 403) {
                // TODO: handle session timeout, reconnect, and re-send call
            }

            options.call.state = MagnetJS.CallState.FAILED;
            (failback || function() {})(e, details);

        });
    }, 0);

    return deferred;
};

/**
 * A class containing transport functions for facilitating requests and responses between a client and a Mobile App Server.
 * @memberof MagnetJS
 * @namespace Transport
 * @ignore
 */
MagnetJS.Transport = {
    /**
     * Base request function. Determines the best available transport and calls the request.
     * @param {object} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded. The success callback will be fired on a status code in the 200-207 range.
     * @param {function} [failback] Executes if the request failed.
     */
    request : function(body, metadata, options, callback, failback) {
        options = options || {};
        metadata._path = metadata._path || metadata.path;
        MagnetJS.Config.endpointUrl = MagnetJS.Config.endpointUrl.toLowerCase();
        metadata._path = (metadata.local === true || /^(ftp|http|https):/.test(metadata._path) === true) ? metadata._path : MagnetJS.Config.endpointUrl+metadata._path;
        //metadata.contentType = metadata.contentType == 'application/json' ? 'application/json; magnet-type=controller-params' : metadata.contentType;
        if (MagnetJS.Utils.isCordova && typeof cordova !== 'undefined') {
            this.requestCordova(body, metadata, options, callback, failback);
        } else if (MagnetJS.Utils.isNode) {
            this.requestNode(body, metadata, options, callback, failback);
        } else if (MagnetJS.Utils.isCordova && options.callOptions && options.callOptions.saveAs && !options.callOptions.returnRaw) {
            this.cordovaFileTransfer(body, metadata, options, callback, failback);
        } else if (typeof jQuery !== 'undefined' && !MagnetJS.Utils.isBinaryType(metadata.returnType) && !metadata.isBinary) {
            this.requestJQuery(body, metadata, options, callback, failback);
        } else if (XMLHttpRequest !== 'undefined') {
            this.requestXHR(body, metadata, options, callback, failback);
        } else {
            throw('request-transport-unavailable');
        }
    },
    /**
     * Transport with JQuery over HTTP/SSL protocol with REST. Cross-origin requests from a web browser are currently not supported.
     * @param {object|string|number} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded.
     * @param {function} [failback] Executes if the request failed.
     */
    requestJQuery : function(body, metadata, options, callback, failback) {
        var me = this;
        var reqBody = me.parseBody(metadata.contentType, body);
        $.support.cors = true;
        var details = {
            body : reqBody,
            info : {
                url : metadata._path
            }
        };
        options.call.transportHandle = $.ajax({
            type        : metadata.method,
            url         : metadata._path,
            timeout     : 30000,
            dataType    : metadata.dataType,
            contentType : metadata.contentType,
            data        : reqBody,
            beforeSend  : function(xhr) {
                xhr.setRequestHeader('Accept', me.createAcceptHeader(metadata.dataType));
                if (metadata.headers) {
                    for(var key in metadata.headers) {
                        xhr.setRequestHeader(key, metadata.headers[key]);
                    }
                }
            },
            success : function(data, status, xhr) {
                if (typeof callback === typeof Function) {
                    details.info.xhr = MagnetJS.Utils.convertHeaderStrToObj(xhr);
                    details.contentType = xhr.getResponseHeader('Content-Type');
                    details.status = xhr.status;
                    data = data.result || data;
                    callback(data, details);
                }
            },
            error : function(xhr, metadata, error) {
                details.info.xhr = MagnetJS.Utils.convertHeaderStrToObj(xhr);
                details.contentType = xhr.getResponseHeader('Content-Type');
                details.status = xhr.status;
                if (metadata == 'parsererror')
                    callback(xhr.responseText, details);
                else if (typeof failback === typeof Function)
                    failback(xhr.responseText, details);
            }
        });
    },
    /**
     * Transport with XMLHttpRequest over HTTP/SSL protocol with REST. Cross-origin requests from a web browser are currently not supported.
     * @param {object|string|number} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded.
     * @param {function} [failback] Executes if the request failed.
     */
    requestXHR : function(body, metadata, options, callback, failback) {
        var me = this, resBody;
        var reqBody = me.parseBody(metadata.contentType, body);
        var details = {
            body : reqBody,
            info : {
                url : metadata._path
            }
        };
        options.call.transportHandle = new XMLHttpRequest();
        var xhr = options.call.transportHandle;
        xhr.timeout = 30000;
        if (MagnetJS.Utils.isBinaryType(metadata.returnType)) xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                details.status = xhr.status;
                details.contentType = xhr.getResponseHeader('Content-Type');
                details.info.xhr = MagnetJS.Utils.convertHeaderStrToObj(xhr);
                resBody = xhr.responseText;
                if (typeof xhr.responseXML !== 'undefined' && xhr.responseXML != null) {
                    resBody = xhr.responseXML;
                } else {
                    try{
                        resBody = JSON.parse(resBody);
                        resBody = resBody.result || resBody;
                    }catch(e) {}
                }
                if (me.isSuccess(xhr.status)) {
                    if (MagnetJS.Utils.isBinaryType(metadata.returnType))
                        resBody = {
                            mimeType : details.contentType,
                            val      : resBody
                        };
                    if (typeof callback === typeof Function) callback(resBody, details);
                } else {
                    if (typeof failback === typeof Function) failback(resBody, details);
                }
            }
        };
        xhr.ontimeout = function() {
            details.status = 0;
            details.contentType = xhr.getResponseHeader('Content-Type');
            details.info.xhr = MagnetJS.Utils.convertHeaderStrToObj(xhr);
            if (typeof failback === typeof Function) failback('request-timeout', details);
        };
        xhr.open(metadata.method, metadata._path, true);
        if (metadata.contentType)
            xhr.setRequestHeader('Content-Type', metadata.contentType);
        xhr.setRequestHeader('Accept', me.createAcceptHeader(metadata.dataType));
        if (metadata.headers)
            for(var key in metadata.headers) {
                xhr.setRequestHeader(key, metadata.headers[key]);
            }
        xhr.send(reqBody);
    },
    /**
     * Initialize a transport with Node.js. For NodeJS only.
     * @param {object|string|number} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded.
     * @param {function} [failback] Executes if the request failed.
     */
    requestNode : function(body, metadata, options, callback, failback) {
        var urlParser = require('url');
        var reqObj = urlParser.parse(metadata._path);
        var headers = MagnetJS.Utils.mergeObj({
            'Content-Type' : metadata.contentType
        }, MagnetJS.Transport.Headers);
        if (metadata.headers)
            for(var key in metadata.headers) {
                xhr.setRequestHeader(key, metadata.headers[key]);
            }
            for(var i=metadata.headers.length;i--;)
                headers[metadata.headers[i].name] = metadata.headers[i].val;
        metadata.protocol = reqObj.protocol;
        if (reqObj.hostname) {
            this.requestNodeExec(body, metadata, {
                host               : reqObj.hostname,
                port               : parseInt(reqObj.port || (reqObj.protocol == 'https:' ? 443 : null)),
                path               : reqObj.path,
                method             : metadata.method,
                rejectUnauthorized : false,
                requestCert        : false,
                headers            : headers
            }, options, callback, failback);
        } else {
            if (typeof failback === typeof Function) {
                failback('error-parsing-url', {
                    body : body,
                    info : {
                        url : metadata._path
                    }
                });
            }
        }
    },
    /**
     * Transport with Node.js over HTTP/SSL protocol with REST. For NodeJS only.
     * @param {object|string|number} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} httpRequestmetadata http.request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded.
     * @param {function} [failback] Executes if the request failed.
     */
    requestNodeExec : function(body, metadata, httpRequestmetadata, options, callback, failback) {
        var me = this, http = require('http'), https = require('https');
        var reqBody = me.parseBody(metadata.contentType, body);
        options.call.transportHandle = (metadata.protocol == 'https:' ? https : http).request(httpRequestmetadata, function(res) {
            var resBody = '';
            var details = {
                body : reqBody,
                info : {
                    metadata : metadata,
                    url      : metadata._path,
                    request  : options.call.transportHandle,
                    response : res
                },
                contentType : res.headers['content-type'],
                status      : res.statusCode
            };
            res.setEncoding(MagnetJS.Utils.isBinaryType(metadata.returnType) ? 'binary' : 'utf8');
            res.on('data', function(chunk) {
                resBody += chunk;
            });
            res.on('end', function() {
                try{
                    resBody = JSON.parse(resBody);
                    resBody = resBody.result || resBody;
                }catch(e) {}
                if (me.isSuccess(res.statusCode)) {
                    if (MagnetJS.Utils.isBinaryType(metadata.returnType))
                        resBody = {
                            mimeType : details.contentType,
                            val      : resBody
                        };
                    if (typeof callback === typeof Function)
                        callback(resBody, details);
                } else {
                    if (typeof failback === typeof Function)
                        failback(resBody, details);
                }
            });
        });
        options.call.transportHandle.on('error', function(e) {
            if (typeof failback === typeof Function) {
                var details = {
                    body : body,
                    info : {
                        metadata : metadata,
                        url      : metadata._path,
                        request  : options.call.transportHandle
                    },
                    status : 0
                };
                failback(e, details);
            }
        });
        if (body) options.call.transportHandle.write(reqBody, metadata.isBinary === true ? 'binary' : 'utf8');
        options.call.transportHandle.end();
    },
    /**
     * Transport through cordova plugin leveraging Magnet iOS and Android SDKs.
     * @param {object|string|number} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded.
     * @param {function} [failback] Executes if the request failed.
     */
    requestCordova : function(body, metadata, options, callback, failback) {
        cordova.exec((callback || function() {}), (failback || function() {}), 'MagnetCordovaPlugin', 'execController', [{
            body     : body,
            metadata : metadata,
            options  : options
        }]);
    },
    /**
     * Determines whether the status code is a success or failure.
     * @param {number} code The HTTP request status code.
     */
    isSuccess : function(code) {
        return code >= 200 && code <= 299;
    },
    /**
     * Formats the body into the appropriate string type using the specified Content-Type header.
     * @param {object|string|number} type The Content-Type of the request.
     * @param {string} input The original request body.
     */
    parseBody : function(type, input) {
        var QS = MagnetJS.Utils.isNode ? require('querystring') : MagnetJS.Utils.objectToFormdata;
        switch(type) {
            case 'application/x-www-form-urlencoded' : input = QS.stringify(input); break;
            case 'application/json' : input = JSON.stringify(input); break;
            case 'application/json;' : input = JSON.stringify(input); break;
        }
        return input;
    },
    /**
     * Create an Accept header.
     * @param {string} [dataType] The expected data type of the request.
     * @returns {string} The Accept Header string.
     */
    createAcceptHeader : function(dataType) {
        var str = '';
        dataType = dataType || 'json';
        switch(dataType) {
            case 'xml'  : str = 'application/xml;q=1.0'; break;
            case 'html' : str = 'text/plain;q=1.0'; break;
            case 'text' : str = 'text/plain;q=1.0'; break;
            case 'json' : str = 'application/json;'; break;
            default     : str = '*/*;q=1.0'; break;
        }
        return str;
    },
    /**
     * Transport with Phonegap's FileTransfer API.
     * @param {object|string|number} [body] The body of the request.
     * @param {object} metadata Request metadata.
     * @param {object} options Request options.
     * @param {function} [callback] Executes if the request succeeded.
     * @param {function} [failback] Executes if the request failed.
     */
    cordovaFileTransfer : function(body, metadata, options, callback, failback) {
        var details = {
            body : body,
            info : {
                url : metadata._path
            },
            status : null
        };
        var headers = {};
        if (metadata.headers)
            for(var i=metadata.headers.length;i--;)
                headers[metadata.headers[i].name] = metadata.headers[i].val;
        MagnetJS.FileManager.getFS(function(fs, filePath) {
            options.call.transportHandle = new FileTransfer();
            options.call.transportHandle.download(
                metadata._path,
                filePath+options.callOptions.saveAs,
                function(fileEntry) {
                    if (typeof callback === typeof Function) callback(fileEntry, details);
                },
                function(e, sourceUrl, targetUrl, status) {
                    details.status = status;
                    if (typeof failback === typeof Function) failback(e, details);
                }, MagnetJS.Config.debugMode, {
                    headers : headers
                }
            );
        }, function() {
            if (typeof failback === typeof Function) failback(MagnetJS.FileManager.status, details);
        });
    }
};
MagnetJS.Transport.Headers = {};

/**
 * A set of constants used by a MagnetJS.Call object to determine the current state of the call.
 * @memberof MagnetJS
 * @namespace CallState
 * @ignore
 */
MagnetJS.CallState = {
    /**
     * The call has been initialized but the request has not yet started.
     * @type {string}
     */
    INIT       : 'init',
    /**
     * The call is in progress.
     * @type {string}
     */
    EXECUTING  : 'executing',
    /**
     * The call is in a reliable queue.
     * @type {string}
     */
    QUEUED     : 'queued',
    /**
     * The call has been cancelled.
     * @type {string}
     */
    CANCELLED  : 'cancelled',
    /**
     * The call has completed successfully.
     * @type {string}
     */
    SUCCESS    : 'success',
    /**
     * The call has failed.
     * @type {string}
     */
    FAILED     : 'failed'
};

/**
 * This interface represents an asynchronous invocation to a controller. An instance of the Call is typically returned by a method call from any Controller
 * implementation. If the options are not specified in the Controller subclass method call, a fail-fast asynchronous call will be assumed.
 * @augments MagnetJS.Promise
 * @constructor
 * @memberof MagnetJS
 * @ignore
 */
MagnetJS.Call = function() {
    /**
     * A system generated unique ID for this call.
     * @type {string}
     */
    this.callId;
    /**
     * A custom opaque token provided by the caller.
     * @type {string}
     */
    this.token;
    /**
     * The last cached time of the result. It is available only if the call has completed.
     * @type {Date}
     */
    this.cachedTime;
    /**
     * Indicates whether the result was retrieved from the cache.
     * @type {boolean}
     */
    this.isResultFromCache;
    /**
     * The result returned by the call. This property is undefined if the call failed.
     * @type {*}
     */
    this.result;
    /**
     * The error, if any, that occurred during execution of the call. An undefined error value indicates that the call completed successfully.
     * @type {*}
     */
    this.resultError;
    /**
     * An object containing details of the request.
     * @type {object}
     */
    this.details;
    this.state = MagnetJS.CallState.INIT;
    MagnetJS.Promise.apply(this, arguments);
};
MagnetJS.Call.prototype = new MagnetJS.Promise();
MagnetJS.Call.prototype.constructor = MagnetJS.Call;

MagnetJS.User = function(userObj) {
    MagnetJS.Utils.mergeObj(this, userObj);
    return this;
};

MagnetJS.User.register = function(userObj) {
    userObj.userName = userObj.username;

    var def = MagnetJS.Request({
        method: 'POST',
        url: '/com.magnet.server/user/enrollment',
        data: userObj
    }, function() {
        def.resolve.apply(def, arguments);
    }, function() {
        def.reject.apply(def, arguments);
    });
    return def.promise;
};

MagnetJS.User.login = function(userObj, cb) {
    userObj = userObj || {};
    userObj.grant_type = 'password';
    userObj.client_id = MagnetJS.App.clientId;
    userObj.remember_me = false;

    var def = MagnetJS.Request({
        method: 'POST',
        url: 'http://localhost:1337/localhost:7777/api/com.magnet.server/user/session',
        data: userObj,
        contentType: 'application/x-www-form-urlencoded',
        headers: {
           'Authorization': 'Basic ' + MagnetJS.Utils.stringToBase64(userObj.username+':'+userObj.password),
           'MMS-DEVICE-ID': '1111-2222-3333-4444'
        }
    }, function(data) {

        MagnetJS.App.credentials = data;
        mCurrentUser = new MagnetJS.User(data.user);
        MagnetJS.Device.register().success(function() {
            MagnetJS.MMXClient.connect(userObj.password).success(function() {
                def.resolve.apply(def, arguments);
            });
        });

    }, function() {
        def.reject.apply(def, arguments);
    });

    return def.promise;
};

MagnetJS.User.getUsersByUserNames = function(usernames) {
    var qs = '', userlist = [];

    if (usernames && usernames.length) {
        for (var i=0;i<usernames.length;++i) {
            qs += '&userNames=' + usernames[i];
        }
        qs = qs.replace('&', '?');
    }

    var def = MagnetJS.Request({
        method: 'GET',
        url: 'http://localhost:7777/api/com.magnet.server/user/users' + qs
    }, function(data, details) {

        for (var i=0;i<data.length;++i)
            userlist.push(new MagnetJS.User(data[i]));

        def.resolve.apply(def, [userlist, details]);
    }, function() {
        def.reject.apply(def, arguments);
    });

    return def.promise;
};

MagnetJS.User.search = function(queryObj, cb) {
    var qs = '';

    var keyMap = {
        query: 'q',
        limit: 'take',
        offset: 'skip',
        orderby: 'sort'
    };

    for(var key in queryObj){
        qs += '&'+keyMap[key]+'='+queryObj[key];
    }
    qs = qs != '' ? qs.replace('&', '?') : qs;

    $.ajax({
        method: 'GET',
        url: 'http://localhost:7777/api/com.magnet.server/user/query'+qs,
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(users) {
        var userlist = [];
        for (var i=0;i<users.length;++i) {
            userlist.push(new MagnetJS.User(users[i]));
        }
        cb(null, userlist);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.User.logout = function(cb) {
    mCurrentUser = null;
    mCurrentDevice = null;
    MagnetJS.App.credentials = null;

    $.ajax({
        method: 'DELETE',
        url: 'http://localhost:7777/api/com.magnet.server/user/session',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(data) {
        (cb || function() {})();
    }).fail(function(err) {
        (cb || function() {})();
    });
};


MagnetJS.Device = {
    getCurrentDevice: function() {
        return mCurrentDevice || null;
    },
    register: function() {
        var def = MagnetJS.Request({
            method: 'POST',
            url: '/com.magnet.server/devices',
            data: mCurrentDevice
        }, function() {
            def.resolve.apply(def, arguments);
        }, function() {
            def.reject.apply(def, arguments);
        });

        return def.promise;
    },
    collectDeviceInfo: function(cb) {
        var e = null;
        var browser = MagnetJS.Utils.getBrowser();
        var os = MagnetJS.Utils.getOS();
        var deviceInfo = {
            deviceId: 'web-client-js-sdk',
            deviceStatus: 'ACTIVE',
            label: browser,
            os: 'ANDROID', // TODO: server must support web client: os.os,
            osVersion: os.version
        };

        return (cb || function() {})(e, deviceInfo);
    },
    checkInWithDevice: function() {
        if (MagnetJS.App.initialized) return;

        MagnetJS.Device.collectDeviceInfo(function(e, deviceInfo) {
            if (e) throw (e);

            MagnetJS.Request({
                method: 'POST',
                url: '/com.magnet.server/applications/session-device',
                data: deviceInfo,
                headers: {
                    Authorization: 'Basic '+MagnetJS.Utils.stringToBase64(MagnetJS.App.clientId+':'+MagnetJS.App.clientSecret)
                }
            }, function(data) {

                MagnetJS.App.credentials = data.applicationToken;
                MagnetJS.App.appId = data.applicationToken.mmx_app_id;
                MagnetJS.Config.mmxEndpoint = data.config['mms-application-endpoint'];
                MagnetJS.Config.mmxHost = data.config['mmx-host'];
                MagnetJS.Config.securityPolicy = data.config['security-policy'];
                MagnetJS.Config.tlsEnabled = data.config['tls-enabled'] === 'true';
                MagnetJS.Config.mmxDomain = data.config['mmx-domain'];
                MagnetJS.Config.mmxPort = parseInt(data.config['mmx-port']);

                mCurrentDevice = data.device;
                mCurrentUser = mCurrentUser || new MagnetJS.User({
                    userIdentifier: data.device.userId
                });

                MagnetJS.App.initialized = true;

            }, function(e) {
                MagnetJS.Log.severe('checkInWithDevice failed', e);
            });
        });
    }
};


var xmppStore;
var x2js = new X2JS();

MagnetJS.start = function() {
    MagnetJS.App.receiving = true;
    mXMPPConnection.priority = 0;
};

MagnetJS.stop = function() {
    MagnetJS.App.receiving = false;
    mXMPPConnection.priority = -255;
};

MagnetJS.registerListener = function(listener) {
    xmppStore = xmppStore || {};

    xmppStore[listener.id] = mXMPPConnection.addHandler(function(msg) {
        var jsonObj = x2js.xml2json(msg);
        var mmxMsg = new MagnetJS.Message();

        mmxMsg.formatMessage(jsonObj, function() {
            listener.handler(mmxMsg);
        });
        return true;

    }, null, 'message', null, null,  null);
};

MagnetJS.unregisterListener = function(id) {
    mXMPPConnection.deleteHandler(xmppStore[id]);
};

MagnetJS.MessageListener = function(idOrHandler, handler) {
    if (typeof handler == typeof Function)
        this.handler = handler;
    else
        this.handler = idOrHandler;
    this.id = typeof idOrHandler == 'string' ? idOrHandler : MagnetJS.Utils.getGUID();
};

MagnetJS.MMXClient = {
    connect: function(password) {
        var def = new MagnetJS.Deferred();

        mXMPPConnection = new Strophe.Connection(MagnetJS.Config.httpBindEndpoint);

        mXMPPConnection.rawInput = function(data) {
            if (MagnetJS.Config.payloadLogging)
                MagnetJS.Log.fine('RECV: ' + data);
        };
        mXMPPConnection.rawOutput = function(data) {
            if (MagnetJS.Config.payloadLogging)
                MagnetJS.Log.fine('SENT: ' + data);
        };

        mCurrentUser.jid = mCurrentUser.userIdentifier + "%" + MagnetJS.App.appId +
            '@' + MagnetJS.Config.mmxDomain + '/' + mCurrentDevice.deviceId;

        mXMPPConnection.connect(mCurrentUser.jid, password, function(status) {
            if (status == Strophe.Status.CONNECTING) {
                MagnetJS.Log.fine('MMX is connecting.');
            } else if (status == Strophe.Status.CONNFAIL) {
                MagnetJS.Log.fine('MMX failed to connect.');
            } else if (status == Strophe.Status.DISCONNECTING) {
                MagnetJS.Log.fine('MMX is disconnecting.');
            } else if (status == Strophe.Status.DISCONNECTED) {
                MagnetJS.Log.info('MMX is disconnected.');
            } else if (status == Strophe.Status.CONNECTED) {
                MagnetJS.Log.info('MMX is connected.');
                mXMPPConnection.send($pres());
                if (!mCurrentUser.connected) {
                    mCurrentUser.connected = true;
                    def.resolve();
                }
            }
        });

        return def.promise;
    }
};

MagnetJS.Message = function(contents, recipientOrRecipients) {
    this.meta = {};
    this.recipients = [];
    if (contents) {
        this.messageContent = contents;
    }
    if (recipientOrRecipients) {
        if (MagnetJS.Utils.isArray(recipientOrRecipients)) {
            for (var i=0;i<recipientOrRecipients.length;++i) {
                this.recipients.push(this.formatUser(recipientOrRecipients[i]));
            }
        } else {
            this.recipients.push(this.formatUser(recipientOrRecipients));
        }
    }
    if (mCurrentUser) {
        this.sender = {
            userId: mCurrentUser.userIdentifier
        };
    }
    return this;
};

MagnetJS.Message.prototype.formatUser = function(userOrUserId) {
    if (typeof userOrUserId == 'string') {
        return {
            userId: userOrUserId
        };
    }
    return {
        userId: userOrUserId.userIdentifier
    };
};

MagnetJS.Message.prototype.formatMessage = function(msg, cb) {
    var self = this;
    try {
        this.receivedMessage = true;
        this.messageType = msg._type;
        this.messageID = msg._id;
        this.channel = null;
        this.attachments = null;

        this.meta = {
            from: msg._from,
            to: msg._to,
            id: msg._id
        };

        msg.mmx = (
          msg.event &&
          msg.event.items &&
          msg.event.items.item &&
          msg.event.items.item.mmx
        ) ? msg.event.items.item.mmx : msg.mmx;

        this.meta.ns = msg.mmx ? msg.mmx._xmlns : '';

        if (msg.mmx && msg.mmx.meta) {
            this.messageContent = JSON.parse(msg.mmx.meta);
            // TODO: handle attachments
            delete this.messageContent._attachments;
        }

        if (msg.mmx && msg.mmx.mmxmeta) {
            var mmxMeta = JSON.parse(msg.mmx.mmxmeta);
            this.recipients = mmxMeta.To;
            this.sender = mmxMeta.From;
        }

        if (msg.mmx && msg.mmx.payload) {
            this.timestamp = msg.mmx.payload._stamp;
        }

        if (msg.event && msg.event.items && msg.event.items._node) {
            nodePathToChannel(msg.event.items._node, function(e, channel) {
                self.channel = channel;
                cb();
            });
        } else {
            cb();
        }

    } catch(e) {
        console.log('MMXMessage.formatMessage', e);
    }
};

MagnetJS.Message.prototype.send = function() {
    var self = this;
    var deferred = new MagnetJS.Deferred();
    var msgId = MagnetJS.Utils.getCleanGUID();

    setTimeout(function() {
        if (!self.recipients.length)
            return deferred.reject('no recipients');
        if (!mCurrentUser)
            return deferred.reject('session expired');
        if (self.receivedMessage)
            return deferred.reject('unable to send: this was a received message.');

        if (!mXMPPConnection.connected) {
            // TODO: replace with reliable offline
        }

        self.sender = {
            userId: mCurrentUser.userIdentifier
        };

        try {
            var mmxMeta = {
                To: self.recipients,
                From: self.sender,
                NoAck: true,
                mmxdistributed: true
            };

            mmxMeta = JSON.stringify(mmxMeta);
            var meta = JSON.stringify(self.messageContent);
            var dt = MagnetJS.Utils.dateToISO8601(new Date());

            var payload = $msg({type: 'chat', id: msgId})
                .c('mmx', {xmlns: 'com.magnet:msg:payload'})
                .c('mmxmeta', mmxMeta).up()
                .c('meta', meta).up()
                .c('payload', {stamp: dt, chunk: '0/0/0'}).up().up()
                .c('request', {xmlns: 'urn:xmpp:receipts'}).up()
                .c('body', '.');

            mXMPPConnection.addHandler(function(msg) {
                var json = x2js.xml2json(msg);

                if (json.error)
                    return deferred.reject(json.error._code + ' : ' + json.error._type);

                deferred.resolve('ok');
            }, null, null, null, msgId, null);

            mXMPPConnection.send(payload.tree());

        } catch (e) {
            deferred.reject(e);
        }
    }, 0);

    return deferred.promise;
};

MagnetJS.Message.prototype.reply = function(content, cb) {
    if (!this.receivedMessage) return cb('unable to reply: not a received message.');
    $msg({to: this.meta.from, from: this.meta.to, type: 'chat'})
        .cnode(Strophe.copyElement(content));
};

MagnetJS.Channel = function(channelObj) {
    if (channelObj.topicName) {
        channelObj.name = channelObj.topicName;
        delete channelObj.topicName;
    }

    channelObj.privateChannel = channelObj.userId ? true : false;
    MagnetJS.Utils.mergeObj(this, channelObj);

    return this;
};

MagnetJS.Channel.findPublicChannelsByName = function(channelName) {
    var qs = '';
    var channels = [];

    if (typeof channelName == 'string')
        qs += '?channelName=' + channelName;

    var def = MagnetJS.Request({
        method: 'GET',
        url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels' + qs
    }, function(data, details) {
        for (var i=0;i<data.results.length;++i) {
            channels.push(new MagnetJS.Channel(data.results[i]));
        }
        def.resolve.apply(def, [channels, details]);
    }, function() {
        def.reject.apply(def, arguments);
    });

    return def.promise;
};

MagnetJS.Channel.create = function(channelObj, cb) {
    if (!channelObj.name)
        return cb('name not set');
    if (channelObj.publishPermission && (['anyone', 'owner', 'subscribers'].indexOf(channelObj.publishPermission) == -1))
        return cb('publishPermission must be in ["anyone", "owner", "subscribers"]');

    var dt = MagnetJS.Utils.dateToISO8601(new Date());

    channelObj.channelName = channelObj.name;
    channelObj.ownerId = mCurrentUser.userIdentifier;
    channelObj.privateChannel = (channelObj.private === true || channelObj.private === false) ? channelObj.private : false;
    channelObj.subscribeOnCreate = (channelObj.subscribe === true || channelObj.subscribe === false) ? channelObj.subscribe : true;
    channelObj.creationDate = dt;
    channelObj.lastTimeActive = dt;
    if (channelObj.privateChannel) {
        channelObj.userId = mCurrentUser.userIdentifier;
    }

    $.ajax({
        method: 'POST',
        url: 'http://localhost:7777/api/com.magnet.server/channel/create',
        data: JSON.stringify(channelObj),
        contentType: 'application/json',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(data) {
        delete channelObj.ownerId;
        var mmxChannel = new MagnetJS.Channel(channelObj);
        cb(null, mmxChannel);
    }).fail(function(err) {
        cb(err);
    });
};

// FIXME: this is an old API?
//    MagnetJS.Channel.getAllSubscriptions = function(cb) {
//        $.ajax({
//            method: 'GET',
//            url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels/my_subscriptions',
//            beforeSend: function(xhr) {
//               xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
//            }
//        }).done(function(data) {
//            cb(null, data);
//        }).fail(function(err) {
//            cb(err);
//        });
//    };

MagnetJS.Channel.getAllSubscriptions = function(cb) {
    if (!mCurrentUser) return cb('not logged in!');
    var messageId = MagnetJS.Utils.getCleanGUID();
    if (mXMPPConnection.connected) {
        try {
            var mmxMeta = {
                limit: -1,        // -1 for unlimited (or not specified), or > 0
                recursive: true,           // true for all descendants, false for immediate children only
                topic: null, // null from the root, or a starting topic
                type: 'both'  // type of topics to be listed global/personal/both
            };

            mmxMeta = JSON.stringify(mmxMeta);

            var payload = $iq({from: mCurrentUser.jid, type: 'get', id: messageId})
                .c('mmx', {xmlns: 'com.magnet:pubsub', command: 'listtopics', ctype: 'application/json'}, mmxMeta);

            mXMPPConnection.addHandler(function(msg) {
                var json = x2js.xml2json(msg);
                var payload, channels = [];
                if (json.mmx) {
                    payload = JSON.parse(json.mmx);
                    if (payload.length) {
                        for (var i=0;i<payload.length;++i) {
                            channels.push(new MagnetJS.Channel(payload[i]));
                        }
                    }
                }
                cb(null, payload);
            }, null, null, null, messageId,  null);

            mXMPPConnection.send(payload.tree());

        } catch (e) {
            console.log(e);
        }
    } else if (mXMPPConnection.messageQueue) {
        // TODO: add to queue
        // return cb();
    } else {
        cb('not connected');
    }
};

MagnetJS.Channel.findChannelsBySubscribers = function(subscribers, cb) {
    var subscriberlist = [];
    for (var i in subscribers) {
        subscriberlist.push(MagnetJS.Utils.isObject(subscribers[i]) ? subscribers[i].userIdentifier : subscribers[i]);
    }
    $.ajax({
        method: 'POST',
        url: 'http://localhost:7777/api/com.magnet.server/channel/query',
        data: JSON.stringify({
            subscribers: subscriberlist,
            matchFilter: 'EXACT_MATCH'
        }),
        contentType: 'application/json',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(result) {
        var channels = [];
        if (result.channels && result.channels.length) {
            for (var i=0;i<result.channels.length;++i) {
                channels.push(new MagnetJS.Channel(result.channels[i]));
            }
        }
        cb(null, channels);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.Channel.getChannelSummary = function(channelOrChannels, subscriberCount, messageCount, cb) {
    if (!MagnetJS.Utils.isArray(channelOrChannels)) channelOrChannels = [channelOrChannels];
    var channelIds = [];
    for (var i=0;i<channelOrChannels.length;++i) {
        channelIds.push({
            channelName: channelOrChannels[i].name,
            userId: channelOrChannels[i].userId,
            privateChannel: channelOrChannels[i].privateChannel
        });
    }
    $.ajax({
        method: 'POST',
        url: 'http://localhost:7777/api/com.magnet.server/channel/summary',
        data: JSON.stringify({
            channelIds: channelIds,
            numOfSubcribers: subscriberCount,
            numOfMessages: messageCount
        }),
        contentType: 'application/json',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(result) {
        var channelSummaries = [];
        if (result && result.length) {
            for (var i=0;i<result.length;++i) {
                channelSummaries.push(result[i]);
            }
        }
        cb(null, channelSummaries);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.Channel.getChannel = function(channelName, cb) {
    MagnetJS.Request({
        method: 'GET',
        url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels/'+encodeURIComponent(channelName)
    }, function(data) {
        cb(null, new MagnetJS.Channel(data));
    }, function() {
        cb(e);
    });
};

MagnetJS.Channel.prototype.getAllSubscribers = function(cb) {
    if (!this.name) return cb('invalid channel');
    $.ajax({
        method: 'GET',
        url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels/'+encodeURIComponent(this.getChannelName())+'/subscriptions',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(data) {
        cb(null, data);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.Channel.prototype.getChannelDetail = function() {

};

MagnetJS.Channel.prototype.addSubscribers = function(subscribers, cb) {
    if (!this.name) return cb('invalid channel');
    if (!this.isOwner() && this.isPrivate()) return cb('insufficient privileges');
    var subscriberlist = [];
    for (var i in subscribers) {
        subscriberlist.push(MagnetJS.Utils.isObject(subscribers[i]) ? subscribers[i].userIdentifier : subscribers[i]);
    }
    $.ajax({
        method: 'POST',
        url: 'http://localhost:7777/api/com.magnet.server/channel/'+this.name+'/subscribers/add',
        data: JSON.stringify({
            privateChannel: this.isPrivate(),
            subscribers: subscriberlist
        }),
        contentType: 'application/json',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(data) {
        cb(null, data);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.Channel.prototype.removeSubscribers = function(subscribers, cb) {
    if (!this.name) return cb('invalid channel');
    if (!this.isOwner() && this.isPrivate()) return cb('insufficient privileges');
    var subscriberlist = [];
    for (var i in subscribers) {
        subscriberlist.push(MagnetJS.Utils.isObject(subscribers[i]) ? subscribers[i].userIdentifier : subscribers[i]);
    }
    $.ajax({
        method: 'POST',
        url: 'http://localhost:7777/api/com.magnet.server/channel/'+this.name+'/subscribers/remove',
        data: JSON.stringify({
            privateChannel: this.isPrivate(),
            subscribers: subscriberlist
        }),
        contentType: 'application/json',
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(data) {
        cb(null, data);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.Channel.prototype.subscribe = function() {
    var def = MagnetJS.Request({
        method: 'PUT',
        url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels/'+encodeURIComponent(this.getChannelName())+'/subscribe'
    }, function(data, details) {
        def.resolve.apply(def, arguments);
    }, function() {
        def.reject.apply(def, arguments);
    });

    return def.promise;
};

MagnetJS.Channel.prototype.unsubscribe = function() {
    var def = MagnetJS.Request({
        method: 'PUT',
        url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels/'+encodeURIComponent(this.getChannelName())+'/unsubscribe'
    }, function(data, details) {
        def.resolve.apply(def, arguments);
    }, function() {
        def.reject.apply(def, arguments);
    });

    return def.promise;
};

MagnetJS.Channel.prototype.publish = function(mmxMessage) {
    var self = this;
    var deferred = new MagnetJS.Deferred();

    setTimeout(function() {

        if (!mCurrentUser) return deferred.reject('session expired');
        if (!mXMPPConnection.connected) return deferred.reject('not connected');

        var iqId = MagnetJS.Utils.getCleanGUID();
        var messageId = MagnetJS.Utils.getCleanGUID();
        var dt = MagnetJS.Utils.dateToISO8601(new Date());
        var attachments = [];

        try {
            var mmxMeta = {
                From: {
                    userId: mCurrentUser.userIdentifier,
                    devId: mCurrentDevice.deviceId,
                    displayName: mCurrentUser.userName
                }
            };

            mmxMeta = JSON.stringify(mmxMeta);
            var meta = JSON.stringify(mmxMessage.messageContent);

            var payload = $iq({to: 'pubsub.mmx', from: mCurrentUser.jid, type: 'set', id: iqId})
                .c('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
                .c('publish', {node: self.getNodePath()})
                .c('item', {id: messageId})
                .c('mmx', {xmlns: 'com.magnet:msg:payload'})
                .c('mmxmeta', mmxMeta).up()
                .c('meta', meta).up()
                .c('payload', {mtype: 'unknown', stamp: dt, chunk: '0/0/0'});

            // TODO: add attachments via:  "_attachments": "[ ... ]"

            mXMPPConnection.addHandler(function(msg) {
                var json = x2js.xml2json(msg);
                if (json.error) return cb({
                    code: json.error._code,
                    type: json.error._type
                });

                deferred.resolve('ok');

            }, null, null, null, iqId, null);

            mXMPPConnection.send(payload.tree());

        } catch (e) {console.log(e);
            deferred.reject(e);
        }

    }, 0);

    return deferred.promise;
};

MagnetJS.Channel.prototype.delete = function(cb) {
    var qs = '';
    if (!this.name) return cb('invalid channel');
    if (this.privateChannel) qs += '?personal=true';
    $.ajax({
        method: 'DELETE',
        url: 'http://localhost:1337/localhost:5220/mmxmgmt/api/v2/channels/'+this.name + qs,
        beforeSend: function(xhr) {
           xhr.setRequestHeader('Authorization', 'Bearer ' + MagnetJS.App.credentials.token.access_token);
        }
    }).done(function(data) {
        cb(null, data);
    }).fail(function(err) {
        cb(err);
    });
};

MagnetJS.Channel.prototype.isOwner = function() {
    return this.userId == mCurrentUser.userIdentifier || this.creator == Strophe.getBareJidFromJid(mCurrentUser.jid);
};

MagnetJS.Channel.prototype.isPrivate = function() {
    return this.privateChannel === true;
};

MagnetJS.Channel.prototype.getChannelName = function() {
    return this.privateChannel === true ? (this.userId + '#' + this.name) : this.name;
};

MagnetJS.Channel.prototype.getNodePath = function() {
    return '/' + MagnetJS.App.appId + '/' + (this.userId ? this.userId : '*') + '/' + this.name.toLowerCase();
};

function nodePathToChannel(nodeStr, cb) {
    nodeStr = nodeStr.split('/');
    if (nodeStr.length !== 4) return cb('invalid node path');

    var name = nodeStr[nodeStr.length-1];
    var userId = nodeStr[nodeStr.length-2];

    return MagnetJS.Channel.getChannel(userId == '*' ? name : (userId + '#' + name));
}

MagnetJS.PubSubManager = {
    store: {},
    add: function(id, cb) {
        this.store[id] = cb;
    },
    run: function(id, meta) {
        if (this.store[id]) {
            this.store[id](meta);
            this.remove(id);
        }
    },
    remove: function(id) {
        delete this.store[id];
    },
    clear: function() {
        this.store = {};
    }
};


})(typeof exports === 'undefined' ? this['Max'] || (this['Max']={}) : exports);