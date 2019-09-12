/**
 * @external CABLES
 * @namespace Utils
 */

const UTILS = {};
/**
 * Merge two Float32Arrays.
 * @function float32Concat
 * @memberof Utils
 * @param {Float32Array} first Left-hand side array
 * @param {Float32Array} second Right-hand side array
 * @return {Float32Array}
 * @static
 */
UTILS.float32Concat = function (first, second)
{
    if (!(first instanceof Float32Array)) first = new Float32Array(first);
    if (!(second instanceof Float32Array)) second = new Float32Array(second);

    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
};

/**
 * randomize order of an array
 * @function shuffleArray
 * @memberof Utils
 * @param {Array|Float32Array} array {Array} original
 * @return {Array|Float32Array} shuffled array
 * @static
 */
export const shuffleArray = function (array)
{
    for (var i = array.length - 1; i > 0; i--)
    {
        var j = Math.floor(Math.seededRandom() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

const _uuid = function ()
{
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) =>
    {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
};
/**
 * generate a UUID
 * @function uuid
 * @memberof Utils
 * @return {String} generated UUID
 * @static
 */
export const uuid = _uuid;
export const generateUUID = _uuid;

/**
 * generate a simple ID
 * @function simpleId
 * @memberof Utils
 * @return {Number} new id
 * @static
 */
var simpleIdCounter = 0;
export const simpleId = function ()
{
    simpleIdCounter++;
    return simpleIdCounter;
};

/**
 * smoothStep a value
 * @function smoothStep
 * @memberof Utils
 * @function
 * @param {Number} value value to be smoothed [0-1]
 * @return {Number} smoothed value
 * @static
 */
export const smoothStep = function (perc)
{
    var x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * (3 - 2 * x); // smoothstep
    return perc;
};

/**
 * smootherstep a value
 * @function smootherStep
 * @memberof Utils
 * @param value {Number} value to be smoothed [0-1]
 * @return {Number} smoothed value
 * @static
 */
export const smootherStep = function (perc)
{
    var x = Math.max(0, Math.min(1, (perc - 0) / (1 - 0)));
    perc = x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
    return perc;
};

/**
 * map a value in a range to a value in another range
 * @function map
 * @memberof Utils
 * @param {Number} value value to be mapped
 * @param {Number} oldMin old range minimum value
 * @param {Number} oldMax old range maximum value
 * @param {Number} newMin new range minimum value
 * @param {Number} newMax new range maximum value
 * @return {Number} mapped value
 * @static
 */
export const map = function (x, _oldMin, _oldMax, _newMin, _newMax, _easing)
{
    if (x >= _oldMax) return _newMax;
    if (x <= _oldMin) return _newMin;

    var reverseInput = false;
    var oldMin = Math.min(_oldMin, _oldMax);
    var oldMax = Math.max(_oldMin, _oldMax);
    if (oldMin != _oldMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min(_newMin, _newMax);
    var newMax = Math.max(_newMin, _newMax);
    if (newMin != _newMin) reverseOutput = true;

    var portion = 0;
    var r = 0;

    if (reverseInput) portion = ((oldMax - x) * (newMax - newMin)) / (oldMax - oldMin);
    else portion = ((x - oldMin) * (newMax - newMin)) / (oldMax - oldMin);

    if (reverseOutput) r = newMax - portion;
    else r = portion + newMin;

    if (!_easing) return r;
    if (_easing == 1)
    {
        // smoothstep
        x = Math.max(0, Math.min(1, (r - _newMin) / (_newMax - _newMin)));
        return _newMin + x * x * (3 - 2 * x) * (_newMax - _newMin);
    }
    if (_easing == 2)
    {
        // smootherstep
        x = Math.max(0, Math.min(1, (r - _newMin) / (_newMax - _newMin)));
        return _newMin + x * x * x * (x * (x * 6 - 15) + 10) * (_newMax - _newMin);
    }

    return r;
};

/**
 * @namespace Math
 */
/**
 * set random seed for seededRandom()
 * @memberof Math
 * @type Number
 * @static
 */
Math.randomSeed = 1;

/**
 * generate a seeded random number
 * @function seededRandom
 * @memberof Math
 * @param {Number} max minimum possible random number
 * @param {Number} min maximum possible random number
 * @return {Number} random value
 * @static
 */
Math.seededRandom = function (max, min)
{
    if (Math.randomSeed === 0) Math.randomSeed = Math.random() * 999;
    max = max || 1;
    min = min || 0;

    Math.randomSeed = (Math.randomSeed * 9301 + 49297) % 233280;
    var rnd = Math.randomSeed / 233280.0;

    return min + rnd * (max - min);
};

// ----------------------------------------------------------------

UTILS.arrayWriteToEnd = function (arr, v)
{
    for (var i = 1; i < arr.length; i++) arr[i - 1] = arr[i];
    arr[arr.length - 1] = v;
};

// ----------------------------------------------------------------

/**
 * returns true if parameter is a number
 * @function isNumeric
 * @memberof Utils
 * @param {Any} value The value to check.
 * @return {Boolean}
 * @static
 */
UTILS.isNumeric = function (n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * returns true if parameter is array
 * @function isArray
 * @param {Any} value Value to check
 * @memberof Utils
 * @return {Boolean}
 * @static
 */
UTILS.isArray = function (v)
{
    return Object.prototype.toString.call(v) === "[object Array]";
};

/**
 * @namespace String
 */

/**
 * append a linebreak to a string
 * @function endl
 * @memberof String
 * @return {String} string with newline break appended ('\n')
 */
String.prototype.endl = function ()
{
    return this + "\n";
};

/**
 * return true if string starts with prefix
 * @function startsWith
 * @memberof String
 * @param {String} prefix The prefix to check.
 * @return {Boolean}
 */
String.prototype.startsWith = function (prefix)
{
    return this.indexOf(prefix) === 0;
};

/**
 * return true if string ends with suffix
 * @function endsWith
 * @memberof String
 * @param {String} suffix
 * @return {Boolean}
 */
String.prototype.endsWith = function (suffix)
{
    return this.match(suffix + "$") == suffix;
};

// ----------------------------------------------------------------

/**
 * append a unique/random parameter to a url, so the browser is forced to reload the file, even if its cached
 * @function cacheBust
 * @static
 * @memberof Utils
 * @param {String} url The url to append the cachebuster parameter to.
 * @return {String} url with cachebuster parameter
 */
export const cacheBust = function (url)
{
    if (url.indexOf("?") > -1) url += "&";
    else url += "?";
    return url + "cb=" + CABLES.uuid();
};

var jsonpCounter = null;
export const jsonp = function (url, cb)
{
    jsonpCounter = jsonpCounter || 0;
    jsonpCounter++;
    var jsonPID = jsonpCounter;

    console.log("making jsonp request...");

    CABLES["jsonpFunc" + jsonPID] = function (data)
    {
        console.log(data);
        cb(false, data);
    };

    var paramChar = "?";
    if (url.indexOf(paramChar) > -1) paramChar = "&";

    var s = document.createElement("script");
    s.setAttribute("src", url + paramChar + "callback=CABLES.jsonpFunc" + jsonPID);
    // s.onload=function()
    // {
    // };
    document.body.appendChild(s);
};

export const ajaxSync = function (url, cb, method, post, contenttype)
{
    request({
        url,
        cb,
        method,
        data: post,
        contenttype,
        sync: true,
    });
};

export const ajax = function (url, cb, method, post, contenttype, jsonp)
{
    request({
        url,
        cb,
        method,
        "data:": post,
        contenttype,
        sync: false,
        jsonp,
    });
};

export const request = function (options)
{
    if (!options.hasOwnProperty("asynch")) options.asynch = true;

    var xhr;
    try
    {
        xhr = new XMLHttpRequest();
    }
    catch (e) {}

    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState != 4) return;

        if (options.cb)
        {
            if (xhr.status == 200 || xhr.status == 0) options.cb(false, xhr.responseText, xhr);
            else options.cb(true, xhr.responseText, xhr);
        }
    };

    xhr.addEventListener("progress", (ev) =>
    {
        // console.log('progress',ev.loaded/1024+' kb');
        // if (ev.lengthComputable)
        // {
        //     var percentComplete = ev.loaded / ev.total;
        //     console.log(url,percentComplete);
        // }
    });

    xhr.open(options.method ? options.method.toUpperCase() : "GET", options.url, !options.sync);

    if (!options.post && !options.data)
    {
        xhr.send();
    }
    else
    {
        xhr.setRequestHeader(
            "Content-type",
            options.contenttype ? options.contenttype : "application/x-www-form-urlencoded",
        );
        xhr.send(options.data || options.post);
    }
};

// ----------------------------------------------------------------

window.performance = window.performance || {
    offset: Date.now(),
    now: function now()
    {
        return Date.now() - this.offset;
    },
};

export { UTILS };