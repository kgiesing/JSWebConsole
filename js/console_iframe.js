// "Global Constants"
var GLOBALS = (function () {
    var private = {
        indent: 2,
        printInherited: false,
        printOwn: true,
        recursion: 2,
        timeout: 1000
    };
    return {
        get: function(key) {
            return private[key];
        }
    }
})();

// The iframe's console object should return string as result of evaluation,
// not print to the actual console
var console = (function(c) {
    var msg = "",
        spaces = 0,
        time = Infinity;
    // Settings object
    var settings = {
        indent: GLOBALS.get("indent"),
        inherited: GLOBALS.get("printInherited"),
        own: GLOBALS.get("printOwn"),
	recursion: GLOBALS.get("recursion"),
        timeout: GLOBALS.get("timeout")
    }
    function assert(exp, m) {
        if (!exp) {
            error(m);
        }
    }
    function cls() {
        indent = 0;
        msg = "";
    }
    function getMsg() {
        return msg;
    }
    function ind(spaces) {
        var line = "";
        for (i = 0; i < spaces; i++) {
            line += " ";
        }
        return line;
    }
    function prettify(obj, depth) {
        var i = 0,
            br = false,
            m = "",
            prop = "",
            incl = false;
        // Check for timeout
        if ( (new Date()).getTime() - time > settings.timeout ) {
            throw "Execution exceeded timeout -- object too large to print";
        }
        m += ind(spaces);
        spaces += settings.indent;
        switch (typeof obj) {
        case "object":
            if (obj !== null) {
		// Check for depth
		depth = depth || 0;
		if (depth > settings.recursion) {
		    m += obj.toString();
		} else if (obj instanceof RegExp) {
                    // Regular expression
                    m += obj.toString();
                } else if (obj instanceof Array) {
                    // Array
                    m += printObject(obj, true, depth);
                } else {
                    // Normal object
                    m += printObject(obj, false, depth);
                }
            } else {
                // Object is null
                m += 'null';
            }
            break;
        case "string":
	    // Strip tags
            m += '"' + obj.replace(/<[^>]*>/ig, "") + '"';
            break;
	case "function":
	    // Custom function printing 
	    m += obj.toString().replace(/{[^>]*}/ig, "{ ... }");
	    break;
        default:
            m += obj;
        }
        spaces -= settings.indent;
        return m;
    }
    function printObject(obj, isArray, depth) {
        var br = false,
            pi = false,
            po = false,
            i = 0,
            m = "";
	depth = depth || 0;
        // Nested helper function
        function out(i) {
	    depth++;
            m += (br ? ",\n" : "\n") + prettify(i, depth).replace(/\"/g, "") + ": "
               + (obj[i] == obj ? "__this__" : "" + prettify(obj[i], depth).trim() );
            br = true;
	    depth--;
        }
        if (obj.constructor) {
            m += obj.constructor.name + " ";
        }
        m += (isArray ? "[" : "{");
        if (isArray) {
            for (i = 0; i < obj.length; i++) {
                out(i);
            }
        } else {
            for (i in obj) {
                // Print inherited and/or own properties
                pi = settings.inherited && !obj.hasOwnProperty(i) &&
                     (Object.prototype[i] !== obj[i]);
                po = settings.own && obj.hasOwnProperty(i);
                if (pi || po) {
                    out(i);
                }
            }
        }
        m += (br ? "\n" + ind(spaces - settings.indent) : "")
           + (isArray ? "]" : "}");
        return m;
    }
    function print(cls) {
        time = (new Date()).getTime();
        for (var i = 1; i < arguments.length; i++) {
            msg = msg + '<span class="' + cls + '">' + prettify(arguments[i])
                + '</span>\n';
        }
    }
    function enclose(cls) {
        return function(m) { print(cls, m); }
    }
    // "Temporary" constructor
    function Console() {
        this.alert    = enclose("warning"),
        this.assert   = assert,
        this.clear    = cls,
        this.debug    = enclose("debug"),
        this.error    = enclose("error"),
        this.info     = enclose("info"),
        this.log      = enclose("log"),
        this.messages = getMsg,
        this.printer  = settings,
        this.warn     = enclose("warning")
    }
    return new Console();
})(console);

// All scripts will be evaluated in this iframe
parent.sandbox = {
    messages: console.messages,
    clear: console.clear,
    eval: function(code) {
        return eval(code);
    }
};