var SETTINGS 	= window.settings || {};
var STATIC    	= window.STATIC || {};
var COMPONENT 	= window.COMPONENT || {};
var EVENTS 		= window.EVENTS || {};
var FILTERS 	= window.FILTERS || {};
var BINDINGS 	= window.BINDINGS || {};
var BROWSER 	= window.BROWSER || {};

// STATIC ----------------------------------------------------------------------
STATIC['*'] = {
	'logs'	: 'error,warn,log',
};

STATIC['Require'] = {
	'version'	: SETTINGS.version || null,
	'baseUrl'	: (SETTINGS.assets_path || ''),
	//'logs'		: 'info',
};

STATIC['Component'] = {
	'componentsBaseUrl' : (SETTINGS.assets_path || '') + 'components/',
	'mixinsBaseUrl' 	: (SETTINGS.assets_path || '') + 'mixins/',
	'warnRescan'		: false,
};

// COMPONENT -------------------------------------------------------------------
COMPONENT['Overlay'] = {
	'animation'		: false,
	'overscrolling'	: false,
};
COMPONENT['Accordion'] = {
	'triggersSelector'	: 'a[href^="#"]',
	'duration'			: 150,
};
COMPONENT['Accordion.menu'] = {
	'triggersSelector'	: '.menu-item-has-children > a',
	'targetsSelector'	: '.menu-item-has-children > ul',
	'duration'			: 150,
};
COMPONENT['Accordion.list'] = {
	'duration'      	: 150,
	'triggersSelector'  : '> h3',
	'targetsSelector'   : '> div',
};
COMPONENT['Carousel'] = {
	'animation'		: 'none',
	'hasPagination'	: false,
	'navigation' 	: false,
	'loop'			: true,
	//'swipe'			: true,
	//'aspectRatio'	: '3x2',
	'dictionary'	: {
		'navigation.previous'	: '❮',
		'navigation.next'		: '❯',
	}
};
COMPONENT['Carousel.images'] = {
	'animation'		: 'none',
	'navigation' 	: false,
	'height'		: 'min',
	'swipe:mobile'	: true,
	'spacing'		: 15,
	'onReady':function (){
		this.utils.dom.onMousemove(this.element, {'context':this, 'callback':function (e){
			if (Browser.isMobile()) return;

			var index = Math.floor(this.navigation.count * e.ratioX);
			this.goto(index);
		}});
	}
};
COMPONENT['Carousel.captions'] = {
	'height'		: 'max',
};

// EVENTS ----------------------------------------------------------------------
// FILTERS ---------------------------------------------------------------------
FILTERS.src = function (src){
	if (src.indexOf('http') === 0){
		return src;
	}else if (window.template_url){
		return window.template_url.replace(/\/$/, '') + '/' + src.replace(/^\//, '');
	}
};

// BINDINGS --------------------------------------------------------------------
// BROWSER ---------------------------------------------------------------------
/*
BROWSER.ready = function (){
	this.layout(18, 20, {'padding':25, 'max':1440});
	this.layout(18, 6, {'padding':12, 'media':'phone'});
};
*/

var Core 	 = {};
var BREAK 	 = '__BREAK__';
var CONTINUE = '__CONTINUE__';
var DEBUG 	 = '__DEBUG__';

var Utils = Core.Utils = (new function (){
	var utils = this;

	var EXPANDO = '_';

	var LOG = function (type, msg, data, colors){
		if (data){
			msg = utils.string.interpolate(msg, data);
		}
		msg = [msg].concat(colors || []);
		console[type].apply(null, msg);
	};

	var RE = {
		PERCENTAGE : /[^0-9+-.%]/,
	};

	// global ------------------------------------------------------------------
	var GLOBAL = {
		'timers'	: {}
	};

	this.defined = function (){
		var list = arguments;
		if (list.length === 1 && Array.isArray(list[0])){
			list = list[0];
		}

		for (var i in list){
			if (list[i] !== undefined){
				return list[i];
			}
		}
		return null;
	};

	this.nvl = function (){
		var list = arguments;
		if (list.length === 1 && Array.isArray(list[0])){
			list = list[0];
		}

		for (var i in list){
			if (this.is(list[i])){
				return list[i];
			}
		}
		return null;
	};

	this.each = function (list, args, callback){
		if (typeof args === 'function'){
			callback 	= args;
			args 		= {};
		}

		args = args || {};
		if (args.context === undefined) 		args.context = list;
		if (args.reverse === undefined) 		args.reverse = false;
		if (args.separator === undefined) 		args.separator = ',';
		if (args.trim === undefined) 			args.trim = true;
		if (args.lowercase === undefined) 		args.lowercase = false;
		if (args.update === undefined) 			args.update = false;
		if (args.type === undefined) 			args.type = null;
		if (args.filter === undefined)			args.filter = false;
		if (args.continue === undefined) 		args.continue = CONTINUE;
		if (args.args === undefined)			args.args = null;
		if (args.break === undefined) 			args.break = BREAK;

		var keys 	= [];
		var length  = 0;
		var type 	= null;

		if (list === null){
			list = [];
			type = 'null';
		}else if (typeof list === 'number'){
			keys   = null;
			length = list;
			type   = 'number';
		}else if (typeof list === 'string'){
			keys   = null;
			list   = list.trim().split(args.separator).filter(function (v){ return v.trim() !== ''; });
			type   = 'string';
			length = list.length;
		}else if (list instanceof Array || (typeof list === 'object' && 'length' in list)){
			keys 	= null;
			length 	= list.length;
			type 	= 'array';
		}else{
			var keys = [];
			for (var i in list){
				if (list.hasOwnProperty(i)){
					keys.push(i);
				}
			}
			length  = keys.length;
			type 	= 'object';
		}

		if (args.type){
			type = args.type;
		}

		var newList = type === 'object' ? {} : [];
		var i, l, a, index, key, item, response;
		for (i=0, l=length; i<l; ++i){
			index= args.reverse ? l - i - 1 : i;
			key  = keys ? keys[index] : index;
			item = type === 'number' ? index+1 : list[key];

			if (typeof item === 'string'){
				if (args.trim){
					item = item.trim();
				}
				if (args.lowercase){
					item = item.toLowerCase();
				}
			}

			response = undefined;
			if (typeof callback === 'function'){
				a 	  	  = args.args || {};
				a.index   = i;
				a.length  = length;
				a.type    = type;
				response  = callback.apply(args.context || item, [item, key, a]);
			}else{
				response = item;
			}

			if (response === args.continue){
				continue;
			}else if (response === args.break){
				break;
			}else if (response !== undefined && args.update){
				list[key] = response;
			}

			if (response !== undefined || !args.filter){
				if (response === undefined){
					response = item;
				}

				if (type === 'object'){
					newList[key] = response;
				}else{
					newList.push(response);
				}
			}
		}

		return newList;
	};

	this.map = function (list, callback){
		return utils.each(list, {'type':'array', 'filter':true}, callback);
	};

	this.count = function (list){
		list = this.toArray(list, {'separator':''});
		return list.length;
	};

	this.match = function (item, compare, args){
		args = args || {};

		if (args.caseSensitive === undefined) 	args.caseSensitive = true;
		if (args.loose === undefined)			args.loose = true;
		if (args.deep === undefined)			args.deep = true; // go deeper and deeper in arrays/objects

		// @todo compare arrays
		// @todo deal with deep match

		function _match (a, b, depth){
			depth = depth === undefined ? 0 : depth;

			for (var i in b){
				if (!b.hasOwnProperty(i)) continue;

				var aa      = a[i];
				var bb      = b[i];
				var isPlain = utils.isPlainObject(aa) && args.loose;
				var isArray = Array.isArray(aa);

				if (
					(isArray && !_match(aa, bb)) ||
					(isPlain && !_match(aa, bb)) ||
					(!isPlain && !isArray && aa !== bb)
				){
					return false;
				}
			}

			return true;
		}

		var isItemObject    = typeof item === 'object' && !(item instanceof Array);
		var isCompareObject = typeof compare === 'object' && !(compare instanceof Array);

		if (
			item === compare ||
			(typeof item === 'string' && typeof compare === 'string' && !args.caseSensitive && item.toLowerCase() === compare.toLowerCase()) ||
			(typeof item === 'string' && compare instanceof RegExp && item.match(compare)) ||
			(typeof compare == 'function' && compare.call(item, item) === true) ||
			(args.loose && isItemObject && isCompareObject && _match(item, compare))
		){
			return true
		}

		return false;
	};

	this.extend = function (){
		var copies = [];
		var clones = [];
		var isDebug= arguments[0] === DEBUG;

		function _walk (){
			var target = arguments[0];

			if (target === undefined || target === null){
				return target;
			}

			var isDeep   = false;
			var i		 = 1;
			var length   = arguments.length;

			if (typeof target === 'boolean' || target === DEBUG){
				isDeep = !!target;
				target = arguments[i] || {};
				i++;
			}

			for (; i<length; ++i){
				var item = arguments[i];

				// add the current target/copie to list of clones and copies (when refering to "same" item)
				if (isDeep){
					clones.push(target);
					copies.push(item);
				}

				for (var name in item){
					var src        = target[name];
					var copy       = item[name];
					var copyIndex  = isDeep ? copies.indexOf(copy) : -1;
					var clone;

					// skip infinity loop
					if (target === copy){
						continue;
					}

					if (~copyIndex){
						target[name] = clones[copyIndex];
					}else if (isDeep && copy && (Array.isArray(copy) || utils.isPlainObject(copy))){
						// make sure to create a new Array/Object when it's an inherited property
						if (!target.hasOwnProperty(name)){
							src = null;
						}

						if (Array.isArray(copy)){
							clone = src && Array.isArray(src) ? src : [];
						}else{
							clone = src && utils.isPlainObject(src) ? src : {};
						}

						copies.push(copy);
						clones.push(clone);

						if (isDebug){
							//console.log(name, copy, clone);
						}

						target[name] = _walk(isDeep, clone, copy);
					}else{
						target[name] = copy;
					}
				}
			}

			return target;
		}

		var response = _walk.apply(this, arguments);
		delete(clones);
		delete(copies);

		return response;
	};

	this.defaults = function (obj, defaults, isCopy){
		for (var i in defaults){
			if (i in obj) continue;
			obj[i] = isCopy ? utils.copy(defaults[i]) : defaults[i];
		}
		return obj;
	};

	this.copy = function (obj){
		if (obj instanceof Array){
			return utils.extend(true, [], obj);
		}else if (typeof obj === 'object'){
			return utils.extend(true, {}, obj);
		}else{
			return obj;
		}
	};

	this.calculate = function (nbr, units){
		if (typeof units === 'number'){
			units = {'%':units};
		}

		units = units || {};
		if (units['%'] === undefined){
			units['%'] = 1;
		}

		if (nbr === undefined || nbr === null){
			value = 0;
		}else if (!isNaN(nbr)){
			nbr = parseFloat(nbr);
		}else if (typeof nbr === 'string' && !nbr.match(RE.PERCENTAGE)){
			nbr = parseFloat(nbr) / 100 * units['%'];
		}else if (typeof nbr === 'string'){
			nbr = nbr.replace(/(\-?\d+\.?\d*)([a-z\%]+)/g, function (m, $1, $2){
				var n = parseFloat($1);
				var m = $2 in units ? units[$2] : 100;
				return (n / 100) * m;
			});
		}

		if (typeof nbr === 'string'){
			nbr = nbr.replace(/[^0-9\+\-\*\/\.\(\)]/g, '');
			try{
				nbr = eval(nbr);
			}catch (e){}
		}

		return nbr;
	}

	this.get = function (value, params, context){
		return typeof value === 'function' ? value.apply(context, params) : value;
	};

	this.is = function (value){
		return !!(value || value === 0 || value === '0');
	};

	this.isNot = function (value){
		return value === null || value === undefined || value === '' || value === false;
	};

	this.isInvalid = function (value){
		return value === null || value === undefined || (typeof value === 'number' && (isNaN(value) || !isFinite(value)));
	};

	this.isPlainObject = function (obj){
		return obj!=null && typeof(obj)=="object" && Object.getPrototypeOf(obj)==Object.prototype;
	};

	this.isNumber = function (value){
		return !isNaN(parseFloat(value)) && isFinite(value);
	};

	this.isEmpty = function (value){
		if (
			(typeof value === 'string' && value.trim() === '') ||
			(Array.isArray(value) && !value.length)
		){
			return true;
		}else if (typeof value === 'object'){
			for (var i in value){
				return false;
			}
			return true;
		}
		return false;
	};

	this.isEqual = function (a, b, deep){
		if (a === b){
			return true;
		}
		if (a === null || b === null){
			return false;
		}

		var aType 	= Object.prototype.toString.call(a);
		var bType 	= Object.prototype.toString.call(b);
		var isEqual = false;

		if (aType !== bType){
			return false;
		}

		if (b instanceof Array){
			if (a.length !== b.length){
				return false;
			}
			for (var i=0, l=b.length; i<l; ++i){
				if (!utils.isEqual(a[i], b[i])){
					return false;
				}
			}
		}else if (typeof b === 'object' && utils.isPlainObject(b)){
			// not the same length
			var aCount = 0;
			var bCount = 0;
			for (var i in a){
				if (!a.hasOwnProperty(i)) continue;
				aCount++;
			}

			for (var i in b){
				if (!b.hasOwnProperty(i)) continue;

				if (!utils.isEqual(a[i], b[i])){
					utils.debug.log('---->' , i, a[i], '!==',  b[i]);

					return false;
				}

				bCount++;
			}


			if (aCount !== bCount){
				return false;
			}
		}else if (a !== b){
			return false;
		}

		return true;
	};

	this.toArray = function (list, separator, test){
		if (!list && list !== 0){
			return [];
		}

		if (separator === undefined){
			separator = ',';
		}

		if (Array.isArray(list)){
			return list;
		}else if (typeof list === 'object' && list.length !== undefined){
			//return Array.prototype.slice.call(list);
			// the for loop is faster than Array.slice call
			var i=0, l = list.length, children = [];
			for (;i<l;++i){ children.push(list[i]); }
			return children;
		}else if (list && typeof list === 'object'){
			var list2 = [];
			for (var i in list){
				list2.push(list[i]);
			}
			return list2;
		}else if (typeof list === 'string'){
			if (separator instanceof RegExp){
				list = list.match(separator);
			}else{
				list = list.split(separator);
			}

			return list.filter(function (v){
				return v.trim() !== '';
			}).map(function (v){
				return v.trim();
			});
		}else if (list !== undefined){
			return [list];
		}

		return [];
	};

	this.toString = function (value, fallback){
		if (fallback === undefined){
			fallback = '';
		}
		return (value || fallback).toString().trim();
	};

	this.toSetterObject = function (key, value, fallback){
		if (typeof key === 'object'){
			return key;
		}else if (value !== undefined){
			var values = {};
			values[key] = value;
			return values;
		}else{
			return fallback;
		}
	};

	this.log = function (msg, data, colors){
		LOG('log', msg, data, colors);
	};

	this.info = function (msg, data, colors){
		colors = ['color:#aaa;'];

		if (typeof msg === 'string'){
			msg = '%c' + msg.replace(/\%c/g, '');
		}else{
			colors = null;
		}

		LOG('info', msg, data, colors);
	};

	this.warn = function (msg, data, colors){
		LOG('warn', msg, data, colors);
	};

	this.error = function (msg, data, colors){
		LOG('error', msg, data, colors);
	};

	this.time = function (key, clear){
		key = !key === undefined ? key : '*';

		var timer = GLOBAL.timers[key];
		if (timer === undefined){
			timer = GLOBAL.timers[key] = {'time':0};
			clear = true;
		}

		var now = +new Date();
		if (clear){
			timer.time = now;
		}else{
			var time = now-timer.time;
			utils.log(key + ':' + time + 'ms');
			timer.time = now;
		}
	};

	// string ------------------------------------------------------------------
	var STRING = this._STRING = {
		RE : {
			SPACE_CASE  			: /((?:\_|\s|\-|\/|[A-Z]))[a-z0-9]/g,
			INTERPOLATE 			: /\{\{(.+?)\}\}/g,
			TEMPLATE 				: /\{([^}|]+)(?:\|([^}]*))?\}/g,
			IF_STATEMENT			: /\{\@if (!)?([^}]+)\}([\s\S]+?)\{\/if\}/gm,
			APOSTROPHES 			: /^['"](.+)['"]$/g,
			VALUES 					: /(?:,|^|;)((?:[^,("']+(?:(?:\(.+?\))|(?:\".+?\")|(?:\'.+?\'))?)|(?:\(.+?\))|(?:\".+?\")|(?:\'.+?\'))/g,
			JSON_KEY 				: /\s?([a-z\_\$][a-z\_\-\$]+)\s*\:/gi,
			CALLBACK_PARAMS			: /([^\(]+)(?:\(([^\)]+)\))?/,
			SPLIT_WORDS 			: /(?:\<\/?.+?\>)|([^\s<]+)/gim,
			EMAIL 					: /^([a-zA-Z0-9_\-\.\+]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
			PATH_COMMANDS 			: /^(?:([astvzqmhlc])(?:([0-9,.-]|\s)+)){2,}$/gi,
			PATH_COMMAND_SEGMENT 	: /([astvzqmhlc])([^astvzqmhlc]*)/ig,
			PATH_COMMAND_NUMBER 	: /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig,
			POINT_COMMANDS 			: /^((?:\s?)(-?\d*(\.\d+)?,-?\d*(\.\d+)?))+$/g,
			POINT_COMMAND_SEGMENT 	: /((?:\s?)(-?\d*(\.\d+)?,-?\d*(\.\d+)?))/g,
			NUMBER_UNITS			: /(\-?\d+(?:\.\d+)?(?:em|rem|%|vh|vw|px))/g,
		},
		PATH_COMMAND_LENGTHS : {'a': 7, 'c': 6, 'h': 1, 'l': 2, 'm': 2, 'q': 4, 's': 4, 't': 2, 'v': 1, 'z': 0},
	};

	this.string = {};

	this.string.trim = function (str, clearAll){
		if (!str) return '';

		//str = str.toString().replace(/^\s+|\s+$/g, '');

		if (clearAll){
			str = str.replace(/\t/g, ' ').replace(/\n|\r/g, ' ');
		}

		return str.replace(/\s{2,}/g, ' ').trim();
	};

	this.string.pad = function (str, pad, length, position){
		if (str === null || str === undefined) return '';

		if (str.toString().length >= length) return str;

		if (position === undefined){
			position = 'right';
		}

		var count 	= length - str.toString().length;
		var result  = '';

		if (position == 'left'){
			result = utils.string.repeat(pad, count) + str;
		}else if (position == 'center'){
			var leftCount 	= Math.floor(count / 2);
			var rightCount 	= Math.ceil(count / 2);
			result = utils.string.repeat(pad, leftCount) + str + utils.string.repeat(pad, rightCount);
		}else if (position == 'right'){
			result = str + utils.string.repeat(pad, count);
		}

		return result;
	};

	this.string.truncate = function (str, limit, suffix){
		if (!str) 					return '';
		if (suffix === undefined) 	suffix = '...';
		if (limit === undefined) 	limit = 25;

		var text 	= str.toString();
		var length 	= text.length;

		return length <= limit ? text : text.substr(0, limit)+suffix;
	};

	this.string.split = function (str, separator){
		if (separator === undefined){
			separator = 1;
		}
		if (typeof separator === 'number'){
			separator = new RegExp('.{1,'+separator+'}', 'g');
		}

		if (typeof separator === 'string'){
			return str.split(separator);
		}else if (separator instanceof RegExp){
			return str.match(separator);
		}
	};

	this.string.repeat = function (str, times){
		if (typeof times !== 'number' || times < 0){
			return '';
		}
		return new Array((times+1) | 0).join(str);
	};

	this.string.match = function (str, re, callback){
		var groups = [];

		var match = null;
		var max   = 100;
		var i 	  = 0;
		var l 	  = 0;

		if (re.global){
			while ((match = re.exec(str)) !== null && max > 0){
				var value = match;

				if (typeof callback === 'function'){
					value = callback.apply(null, match);
				}else if (value.groups){
					value = value.groups;
				}else{
					value = [];
					for (i=1, l=match.length; i<l; ++i){
						value.push(match[i]);
					}
				}

				groups.push(value);
				max--;
			}
		}else if (match = str.match(re)){
			if (match.groups && typeof callback === 'function'){
				groups = callback.call(null, match.groups);
			}else if (match.groups){
				groups = match.groups;
			}else{
				for (i=1, l=match.length; i<l; ++i){
					var value = match[i];

					if (typeof callback === 'function'){
						value = callback.call(null, value, i-1);
					}

					groups.push(value);
				}
			}
		}

		return groups;
	};

	// example: "my string has {variables} and also support {fallbacks|0}"
	//this.string.interpolate = function (str, data, fallback, separator){
	this.string.interpolate = function (str, data, args){
		if (typeof str !== 'string' || !~str.indexOf('{')){
			return str;
		}
		if (data === undefined){
			data = {};
		}

		args 			= args || {};
		args.fallback 	= 'fallback' in args ? args.fallback : '';
		args.separator 	= 'separator' in args ? args.separator : '';
		args.paths 		= 'paths' in args ? args.paths : true;

		function _get (data, key){
			var value = undefined;

			if (typeof data === 'function'){
				value = data(key);
			}else if (data[key] !== undefined){
				value = data[key];
			}else if (key && args.paths && typeof data === 'object'){
				value = utils.object.resolve(data, key);
			}

			if (typeof value === 'function'){
				value = value();
			}

			return value;
		}

		if (data instanceof Array){
			var items = [];
			for (var i=0, l=data.length; i<l; ++i){
				var item = typeof data[i] !== 'object' ? {'value':data[i]} : data[i];
				item = utils.string.interpolate(str, item, {'fallback':args.fallback, 'paths':args.paths});
				items.push(item);
			}
			return items.join(args.separator);
		}else{
			// do the simple if(s)
			str = str.replace(STRING.RE.IF_STATEMENT, function (match, isNot, key, content){
				isNot = isNot === '!' ? true : false;

				var value  = _get(data, key);
				var isTrue = value === 0 || value === '0' || !!value;

				return isNot !== isTrue ? content : '';
			});

			// Variable replacement
			str = str.replace(STRING.RE.TEMPLATE, function (match, $1, $2){
				var value = undefined;
				var keys  = $1.split(',');

				for (var i=0, l=keys.length; i<l; ++i){
					var key   = keys[i];
					var value = _get(data, key);

					if (value !== undefined){
						break;
					}
				}

				if (value === undefined && $2 === undefined){
					return args.fallback !== null ? args.fallback : '{'+$1+'}';
				}else if (value === undefined){
					return $2;
				}else{
					return value;
				}
			});
		}

		return str;
	};

	// @todo https://johnresig.com/blog/javascript-micro-templating/
	this.string.template = function (str, args){
		args 			= args === undefined ? {} : args;
		args.context 	= 'context' in args ? args.context : null;
		args.params 	= utils.toArray('params' in args ? args.params : []);

		var values 		= [];
		var separator 	= '__value__';
		var code 		= [];

		str = str.replace(STRING.RE.INTERPOLATE, function (m, value){
			value = value.trim();

			if (value.match(/^@if/)){
				value = value.replace('@if', '').trim();
				value = '(' + value + ' ? (""';
			}else if (value.match(/\/if/)){
				value = '"") : "")';
			}else if (value.match(/@each/)){
				value = value.replace('@each', '').trim();
				value = value.split(' in ');

				var pair = value[0].split(':');
				var index= pair.length > 1 ? pair[0].trim() : '__index__';
				var name = pair.length > 1 ? pair[1].trim() : pair[0].trim();
				var list = value[1];

				value = list + '.map(function (' + name + ', '+index+'){ return ""';
			}else if (value.match(/\/each/)){
				value = '""; })';
			}else{
				// @todo check if it's only a variable OR a command/directive
				//value = value.replace(/\@([a-z][a-z0-9_]+)/ig, '__$1__')
				value = '(' + value + ')';
			}

			values.push(value);

			return separator;
		});

		str = str.split(separator);
		for (var i=0, l=str.length; i<l; ++i){
			if (str[i].trim()){
				code.push('"' + str[i].replace('"', '\\"').replace("'", "\\'") + '"');
			}
			if (values[i]){
				code.push(values[i]);
			}
		}

		code = code.join(' + ').trim();
		code = 'with (__this__){\
			var __value__ 	= "";\
			var $this 	 	= this;\
			try{\
				__value__ = ' + code + ';\
			}catch(e){\
				console.warn("[template error]", e);\
				__value__ = null;\
			}\
			return __value__;\
		}';

		var params 	 = ['__this__'].concat(args.params, code);
		var callback = Function.apply(null, params).bind(args.context);

		return callback;
	};

	this.string.generateId = function (prefix, separator){
		if (separator === undefined){
			separator = '_';
		}
		return (prefix ? prefix+separator : '')+Math.round(Math.random()*new Date());
	};

	this.string.splitText = function (text, args){
		text = text.replace(/\t|(^\s+)|(\s+$)/gm, '');

		args 			= args || {};
		args.lines 		= 'lines' in args ? args.lines : false;
		args.words 		= 'words' in args ? args.words : true;
		args.letters 	= 'letters' in args ? args.letters : false;

		// @todo for the aria labels, remove any html
		var iWords 	= 0;
		var iLetters= 0;

		text = text.split("\n").map(function (line, iLine){
			var oLine = line;

			// words and letters
			line = line.replace(STRING.RE.SPLIT_WORDS, function (m, word){
				// isn't a word
				if (word === undefined){
					return m;
				}

				var oWord = word;

				if (args.letters){
					word = word.split('').map(function (letter){
						return '<span class="letter letter'+(iLetters++)+'" aria-hidden="true">' + letter + '</span>';
					}).join('');
				}

				if (args.words){
					word     = '<span class="word word'+(iWords++)+'" aria-hidden="true" aria-label="'+oWord+'">' + word + '</span>';
					iLetters = 0;
				}

				return word;
			});

			if (args.lines){
				line     = '<div class="line line'+iLine+'" aria-hidden="true" aria-label="'+oLine+'">' + line + '</div>';
				iWords   = 0;
				iLetters = 0;
			}

			return line;
		}).join("\n");

		return text;
	};

	this.string.eval = function (str){
		if (typeof str !== 'string'){
			return str;
		}

		str = str.replace(/\/\/.+/g, ''); // remove comments
		str = str.replace(/\t|\r|\n/g, ' ').trim();

		// make sure there's a brackets
		if (str[0] !== '{'){
			str = '{'+str+'}';
		}

		str = '(function (){ return '+str+'; }())';

		try{
			str = eval(str);
		}catch (e){
			utils.warn('The JSON string couldn\'t be eval().\n{error}', {'error':e});
		}

		return str;
	};

	this.string.isEmail = function (str){
		if (typeof str !== 'string') return false;
		return !!str.match(STRING.RE.EMAIL);
	};

	this.string.toSpaceCase = function (str){
		if (!str){
			return '';
		}

		return str.replace(STRING.RE.SPACE_CASE, function ($1){
			return ' '+$1.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
		}).toLowerCase().trim();
	};

	this.string.toDashCase = function (str){
		return utils.string.toSpaceCase(str).replace(/\s/g, '-');
	};

	this.string.toUnderscoreCase = function (str){
		return utils.string.toSpaceCase(str).replace(/\s/g, '_');
	};

	this.string.toSlashCase = function (str){
		return utils.string.toSpaceCase(str).replace(/\s/g, '/');
	};

	this.string.toCamelCase = function (str, allWords){
		str = utils.string.toSpaceCase(str);
		if (allWords){
			str = ' ' + str;
		}
		return str.replace(/(\s[a-z0-9])/g, function ($1){
			return $1.substring(1).toUpperCase();
		});
	};

	this.string.toRegExp = function (str, args){
		args               = args || {};
		args.group         = 'group' in args ? args.group : false;
		args.caseSensitive = 'caseSensitive' in args ? args.caseSensitive : true;
		args.return 	   = 'return' in args ? args.return : 'RegExp';

		str = str.replace(/([\-\+\(\)\.\*])/g, '\\$1');

		if (args.group){
			str = '('+str+')';
		}

		if (args.return === 'string'){
			return str;
		}else{
			new RegExp(str, 'g' + (caseSensitive ? 'i' : ''))
		}
	};

	this.string.toPx = function (str, args){
		if (!str) return 0;

		// @todo check all units: https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Values_and_units
		// convert vh,vw, rem. em, % if there's a DOM element
		var screenWidth 	= document.documentElement.clientWidth || 0;
		var screenHeight 	= document.documentElement.clientHeight || 0;

		str = str.toString().replace(STRING.RE.NUMBER_UNITS, function (m, number){
			var unit 	= number.replace(/[0-9\.\-]/g, '').toLowerCase();
			var number  = parseFloat(number);

			if (unit === 'vh'){
				number = number/100 * screenHeight;
			}else if (unit === 'vw'){
				number = number/100 * screenWidth;
			}

			return number;
		});

		var px = utils.calculate(str);
		return px;
	};

	this.string.toValue = function (str, args){
		if (typeof str !== 'string' || str === ''){
			return str;
		}

		args 			= args || {};
		args.context 	= 'context' in args ? args.context : null;
		args.clean 		= 'clean' in args ? args.clean : true;

		var value = str.trim();

		if (value === 'true'){
			value = true;
		}else if (value === 'false'){
			value = false;
		}else if (value === 'null' || value === null || value === undefined){
			value = null;
		}else if (!isNaN(value) && value !== ''){
			value = parseFloat(value);
		}else if (value === 'this'){
			value = args.context;
		}else if (value.match(/^[\[\{].+[\]\}]$/)){
			value = utils.string.toJson(value, false) || value;
		// remove the beginining an ending apostrophe
		}else if (args.clean){
			value = value.replace(STRING.RE.APOSTROPHES, '$1');
		}

		return value;
	};

	this.string.toValues = function (str, args){
		var values = [];

		if (!str || str instanceof Array){
			return values;
		}

		str.replace(STRING.RE.VALUES, function (m, $1){
			var value = utils.string.toValue($1, args);
			values.push(value);
		});

		return values;
	};

	this.string.toObject = function (str, args){
		if (typeof str === 'object'){
			return str;
		}
		if (typeof str !== 'string'){
			return {};
		}

		args 				= (typeof args === 'string' ? {'separator':args} : args) || {};
		args.separator 		= 'separator' in args ? args.separator : ',';
		args.pairSeparator 	= 'pairSeparator' in args ? args.pairSeparator : ':';
		args.clean 			= 'clean' in args ? args.clean : true;

		str = str.trim().replace(/^\{|\}$/g, '').split(args.separator);
		var props = {};
		for (var i=0, l=str.length; i<l; ++i){
			var prop = str[i].trim();

			if (!prop) continue;

			var pair = prop.split(args.pairSeparator);

			try{
				var key  = pair[0].trim();
				var value= utils.string.toValue(pair[1].trim(), {'clean':args.clean});
				props[key] = value;
			}catch (e){}
		}

		return props;
	};

	this.string.toDuration = function (time){
		if (time === null || time === undefined){
			time = 0;
		}

		if (typeof time === 'string'){
			if (~time.indexOf('ms')){
				time = parseFloat(time);
			}else if (~time.indexOf('s')){
				time = parseFloat(time) * 1000;
			}else if (~time.indexOf('min')){
				time = parseFloat(time) * 60 * 1000;
			}else{
				time = parseFloat(time);
			}
		}

		return isNaN(time) ? 0 : time;
	};

	this.string.toJson = function (str, warn){
		if (warn === undefined){
			warn = true;
		}
		if (str && typeof str === 'object'){
			return str;
		}else if (typeof str !== 'string'){
			return {};
		}

		var json = {};
		try{
			json = str.replace(/\'/g, '"');
			json = json.replace(/\/\/.+/g, '');
			json = json.replace(STRING.RE.JSON_KEY, '"$1":');
			json = utils.string.trim(json, true);

			// remove the first and last "{/}" to be able to remove the last ","
			json = json.replace(/^\{|\}$/g, '');
			json = json.replace(/\,$/, '');
			json = '{' + json + '}';

			json = JSON.parse(json);
		}catch(e){
			if (warn){
				utils.warn('The JSON string "{string}" couldn\'t be parsed.\n%c{error}', {
					'string': str,
					'error' : e,
				}, 'color:red; font-style:italic;');
			}
			json = null;
		}

		return json;
	};

	this.string.toAction = function (str, args){
		if (typeof str !== 'string'){
			return null;
		}

		args = args || {};
		if (args.modifierSeparator === undefined) 	args.modifierSeparator = '.';
		if (args.typeSeparator === undefined) 		args.typeSeparator = ':';
		if (args.context === undefined) 			args.context = null;

		var name 		= str;
		var type 		= null;
		var params  	= null;
		var modifiers 	= {};

		if (!!~name.indexOf(args.modifierSeparator)){
			var modifiers = name.split(args.modifierSeparator);

			name = modifiers.shift();

			for (var i=0, l=modifiers.length; i<l; ++i){
				var modifier 	= modifiers[i];
				var match 		= modifier.match(STRING.RE.CALLBACK_PARAMS);
				var key 		= match[1] || null;
				var value  		= utils.string.toValues(match[2], {'context':args.context});

				if (value.length <= 1){
					value = value[0];
				}

				modifiers[key] 	= value;
			}
		}

		if (!!~name.indexOf(args.typeSeparator)){
			var pair = name.split(args.typeSeparator);
			name = pair[0];
			type = pair[1];
		}

		var match = name.match(STRING.RE.CALLBACK_PARAMS);
		if (match){
			name   = match[1];
			params = utils.string.toValues(match[2] || null, {'context':args.context});
		}

		return {
			'name'    	: name,
			'type'		: type,
			'params'    : params,
			'modifiers' : modifiers,
		};
	};

	this.string.toCharCodes = function (str, args){
		if (str instanceof Array){
			return str;
		}

		args = args || {};
		if (args.exclude === undefined) 	args.exclude = null;
		if (args.include === undefined) 	args.include = null;
		if (args.fallback === undefined) 	args.fallback = ' '; // space

		var arr = [];
		for (var i=0, l=str.length; i<l; ++i){
			var value = str[i];
			var code  = str.charCodeAt(i);

			if (
				(args.exclude && ~args.exclude.indexOf(value)) ||
				(args.include && !~args.include.indexOf(value))
			){
				code = args.fallback.charCodeAt(i);
			}

			arr.push(code);
		};

		return arr;
	};

	this.string.toSvgPath = function (path){
		// @source https://github.com/jkroso/parse-svg-path/blob/master/index.js
		if (path instanceof Array){
			return path;
		}

		var items = [];

		path.replace(STRING.RE.PATH_COMMAND_SEGMENT, function(_, command, args){
			var type 	= command.toLowerCase();
			var numbers = args.match(STRING.RE.PATH_COMMAND_NUMBER);

			numbers = numbers ? numbers.map(Number) : [];

			// overloaded moveTo
			if (type == 'm' && numbers.length > 2) {
				items.push([command].concat(numbers.splice(0, 2)));
				type = 'l';
				command = command == 'm' ? 'l' : 'L';
			}

			while (true) {
				if (numbers.length == STRING.PATH_COMMAND_LENGTHS[type]) {
					numbers.unshift(command);
					return items.push(numbers);
				}

				if (numbers.length < length[type]){
					throw new Error('malformed path data');
				}

				items.push([command].concat(numbers.splice(0, STRING.PATH_COMMAND_LENGTHS[type])));
			}
		});

		return items;
	};

	this.string.toSvgPoints = function (points){
		if (points instanceof Array){
			return points;
		}

		var points 	= points.match(STRING.RE.POINT_COMMAND_SEGMENT);
		var items 	= [];

		for (var i=0, l=points.length; i<l; ++i){
			var point = points[i].split(',');
			items.push([
				parseFloat(point[0]),
				parseFloat(point[1]),
			]);
		}

		return items;
	};

	// number ------------------------------------------------------------------
	this.number = {};

	this.number.countDecimals = function (nbr){
		var str = nbr.toString();
		var nbr = Math.floor(parseFloat(nbr) || 0).toString();

		if (!isNaN(nbr) && nbr !== str){
			var pair = str.split(".");
			return (pair[1] && pair[1].length) || 0;
		}

		return 0;
	};

	this.number.limitDecimals = function (nbr, count){
		if (count === undefined){
			count = 2;
		}
		nbr = parseFloat(nbr) || 0;
		return parseFloat(nbr.toFixed(count));
	};

	this.number.decimals = function (nbr, count){
		if (count === undefined){
			return utils.number.countDecimals(nbr);
		}else{
			return utils.number.limitDecimals(nbr, count);
		}
	};

	this.number.format = function (nbr, args){
		args = args || {};

		if (args.decimals === undefined) args.decimals = 2;
		if (args.decimalSeparator === undefined) args.decimalSeparator = '.';
		if (args.groupSeparator === undefined) args.groupSeparator = ',';

		var prefix 		= nbr < 0 ? '-' : '';
		var numbers 	= parseInt(nbr).toString();
		var decimals 	= (nbr % 1).toFixed(args.decimals).slice(2);
		var overhead 	= numbers.length > 3 ? numbers.length % 3 : 0;

		return prefix +
			(overhead ? numbers.substr(0, overhead) + args.groupSeparator : '') +
			numbers.substr(overhead).replace(/(\d{3})(?=\d)/g, "$1" + args.groupSeparator) +
			(args.decimals ? (args.decimalSeparator + decimals) : '');
	};

	this.number.toDuration = function (time){
		if (time === null || time === undefined){
			time = 1000;
		}
		return Math.round(time / 10)/100 + 's';
	};

	// math --------------------------------------------------------------------
	var MATH = {
		RE : {
			PATH_COMMAND_SEGMENT 	: /([astvzqmhlc])([^astvzqmhlc]*)/ig,
			PATH_COMMAND_NUMBER 	: /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig,
		},
		PATH_COMMAND_LENGTHS : {'a': 7, 'c': 6, 'h': 1, 'l': 2, 'm': 2, 'q': 4, 's': 4, 't': 2, 'v': 1, 'z': 0},
		FOCUS : {
			SIZES : {
				COVER 	: 'cover',
				CONTAIN : 'contain',
			},
			HORIZONTALS : {
				LEFT 	: 'left',
				CENTER 	: 'center',
				RIGHT 	: 'right',
			},
			VERTICALS : {
				TOP 	: 'top',
				MIDDLE 	: 'middle',
				BOTTOM 	: 'bottom',
			}
		}
	}

	this.math = {};

	this.math.min = function (a, b){
		if (isNaN(a)) a = Infinity;
		if (isNaN(b)) b = -Infinity;
		return Math.min(a, b) || 0;
	};

	this.math.max = function (a, b){
		return Math.max(a || -Infinity, b || -Infinity) || 0;
	};

	this.math.minMax = function (value){
		function update (v){
			update.min = utils.math.min(update.min, v);
			update.max = utils.math.max(update.max, v);
		}

		update.min = Infinity;
		update.max = -Infinity;

		if (value !== undefined){
			if (value instanceof Array){
				var v, i=0;
				while ((v = value[i++]) !== undefined){
					update(v);
				}
			}else{
				update(value);
			}
		}

		return update;
	};

	this.math.get = function (nbr, args){
		args 				= (typeof args === 'number' ? {'max':args} : args) || {};
		args.min 			= 'min' in args ? args.min : 0;
		args.max 			= 'max' in args ? args.max : 0;
		args.outOfBounds 	= 'outOfBounds' in args ? args.outOfBounds : true;
		args.decimals 		= 'decimals' in args ? args.decimals : true;
		args.fallback 		= 'fallback' in args ? args.fallback : nbr;


		if (args.min && args.max && args.min > args.max){
			var min = args.min;
			var max = args.max;
			args.min = max;
			args.max = min;
		}

		var length = args.max - args.min;

		if (nbr === 'start' || nbr === 'first' || nbr === 'left' || nbr === 'top'){
			nbr = args.min;
		}else if (nbr === 'end' || nbr === 'last' || nbr === 'right' || nbr === 'bottom'){
			nbr = args.max;
		}else if (nbr === 'middle' || nbr === 'center'){
			nbr = args.min + length/2;
		}else if (nbr === 'random'){
			nbr = args.min + (Math.random() * length);
		}else if (nbr === null){
			nbr = args.fallback;
		}else if (typeof nbr === 'object' && nbr.ratio !== undefined){
			nbr = args.min + (nbr.ratio * length);
		}else if (typeof nbr === 'string' && ~nbr.indexOf('%')){
			nbr = parseFloat(nbr)/100;
			nbr = args.min + (nbr * length);
		}else if (!isNaN(nbr)){
			nbr = parseFloat(nbr);
		}

		if (typeof nbr === 'number'){
			if (!args.decimals){
				nbr = Math.round(nbr);
			}

			if (!args.outOfBounds){
				if (nbr < args.min){
					nbr = args.min;
				}else if (nbr > args.max){
					nbr = args.max;
				}
			}
		}

		return isNaN(nbr) ? args.fallback : nbr;
	};

	this.math.xy = function (nbr, columnCount){
		return {
			'x'	: nbr % columnCount,
			'y' : Math.floor(nbr / columnCount)
		};
	};

	this.math.gap = function (nbr, size, shift){
		var min = Math.max(0, shift);
		var max = Math.min(size, nbr + shift);
		return size - (min + max);
	};

	this.math.random = function (min, max, decimals){
		var args = min;

		if (arguments.length >= 2){
			args = {'min':min, 'max':max};
		}else if (typeof min === 'number'){
			args = {'max':min};
		}else{
			args = {'max':1};
		}

		args.decimals = decimals;

		return utils.math.get('random', args);
	};

	this.math.probability = function (weights){
		var total    = 0;
		var items    = [];
		var found    = null;
		var isArray	 = weights instanceof Array;

		for (var i in weights){
			var weight 	= parseFloat(isArray ? weights[i].weight : i);
			var value 	= isArray ? weights[i].value : weights[i];

			items.push({
				'weight': weight,
				'value'	: value,
			});

			total += weight;
		}

		var index 	= Math.random() * total;
		var sum 	= 0;
		for (var i=0, l=items.length; i<l; ++i){
			var item = items[i];
			var next = sum + item.weight;

			if (index <= next){
				found = item;
				break;
			}

			sum = next;
		}

		return found ? found.value : null;
	};

	this.math.mid = function (start, end, ratio){
		if (ratio === undefined){
			ratio = 0.5;
		}
		if (typeof ratio === 'number'){
			ratio = ratio * 100 + '%';
		}
		return utils.math.get(ratio, {
			'min' : start,
			'max' : end
		});
	};

	this.math.align = function (nbr, max, ratio){
		if (ratio === undefined){
			ratio = 0.5;
		}

		if (ratio === 'start' || ratio === 'top' || ratio === 'left'){
			ratio = 0;
		}else if (ratio === 'end' || ratio === 'bottom' || ratio === 'right'){
			ratio = 1;
		}else if (ratio === 'middle' || ratio === 'center'){
			ratio = 0.5;
		}

		return (max - nbr) * ratio;
	};

	this.math.between = function (nbr, min, max, decimals){
		return utils.math.get(nbr, {
			'min'	      : min,
			'max'	      : max,
			'decimals'	  : decimals,
			'outOfBounds' : false,
		});
	};

	this.math.nearest = function (nbr, arr, args){
		args 		= args || {};
		args.get	= 'get' in args ? args.get : null;
		args.return = 'return' in args ? args.return : null;

		// special array
		var list = [];
		for (var i in arr){
			var item  = arr[i];
			var value = typeof args.get === 'function' ? args.get(item) :
						args.get ? item[args.get] :
						item;

			list.push({
				'value' : value,
				'item'	: item
			});
		}

		// order items
		list.sort(function (a, b){
			return a.value - b.value;
		});

		// the array needs to be in the right order
		var index = -1;

		// extermities
		var first   = list[0].value;
		var last    = list[list.length-1].value;
		var from 	= -1;
		var to 	 	= -1;
		if (nbr <= first){
			index = 0;
			from  = 0;
			to    = 1;
		}else if (nbr >= last){
			index = list.length-1;
			from  = index;
			to    = index - 1;
		}else{
			for (var i=1, l=list.length; i<l; ++i){
				var prev = list[i-1].value;
				var next = list[i].value;

				if (nbr >= prev && nbr <= next){
					var diffPrev = nbr - prev;
					var diffNext = next - nbr;

					if (diffPrev < diffNext){
						index = i-1;
						from  = i-1;
						to 	  = i;
					}else{
						index = i;
						from  = i;
						to 	  = i + 1;
					}
				}
			}
		}

		if (args.return === 'index'){
			return index;
		}else if (args.return === 'ratio'){

			//return list[index] ? [list[from].item, list[from].item, list[index]] : null;
			/*
			if (list[index] && index === 0){
				return [list[index].item, list[index+1].item];
			}else if (list[index] && index === list.length-1){
				return [list[index-1].item, list[index].item];
			}else if (list[index]){
				return [list[index-1].item, list[index].item];
			}else{
				return null;
			}
			*/
		}else if (args.return === 'value'){
			return list[index] ? list[index].value : null;
		}else{
			return list[index] ? list[index].item : null;
		}
	};

	this.math.frames = function (duration, fps){
		duration = utils.string.toDuration(duration);
		return (duration / 1000) * (fps || 60);
	};

	this.math.ratio = function (from, to, ratio, easing){
		var range = null;
		var value = null;

		if (typeof from === 'object'){
			easing   = ratio;
			ratio    = to;
			range    = from;
			from 	 = null;
			to 		 = null;
		}

		if (easing){
			easing = utils.easings.get(easing);
			ratio  = easing(ratio);
		}

		// range of values (ex.: [0,1,1,1,0] OR {0:0, 0.2:1, 0.8:1, 0.9:0})
		if (range){
			var values = [];
			var isArray= range instanceof Array;

			for (var i in range){
				var r = parseFloat(i);

				if (isArray){
					r = r / (range.length-1);
				}

				values.push({'ratio':r, 'value':range[i]});
			}

			values.sort(function (a, b){ return a.ratio - b.ratio; });

			// make sure there's a 0 and 1 ratio
			if (values[0].ratio !== 0){
				values.unshift({'ratio':0, 'value':values[0].value});
			}
			var last = values.length-1;
			if (values[last].ratio !== 1){
				values.push({'ratio':1, 'value':values[last].value});
			}

			for (var i=1, l=values.length; i<l; ++i){
				var prev = values[i-1];
				var next = values[i];

				// in between 2 values
				if (ratio >= prev.ratio && ratio < next.ratio){
					var r = (ratio - prev.ratio) / (next.ratio - prev.ratio);
					value = prev.value + (next.value - prev.value) * r;
					break;
				}else if (ratio < prev.ratio){
					value = prev.value;
					break;
				}else if (ratio >= next.ratio){
					value = next.value;
				}
			}
		}else{
			from = parseFloat(from);
			to   = parseFloat(to);
			value= from + (to - from) * ratio;
		}

		return value;
	};

	this.math.subRatio = function (start, end, ratio, args){
		args     = args || {};
		args.mid = 'mid' in args ? args.mid : 0;

		if (typeof start === 'string' && ~start.indexOf('%')){
			start = parseFloat(start) / 100;
		}
		if (typeof end === 'string' && ~end.indexOf('%')){
			end = parseFloat(end) / 100;
		}

		// mid point : 0 -> 1 -> 0
		var r = (ratio - start) / (end - start);
		if (args.mid){
			var mid = args.mid === true ? 0.5 : args.mid;

			if (r <= 0 || r >= 1){
				r = 0;
			}else if (r >= mid){
				r = 1 - (r - mid) / (1 - mid);
			}else{
				r = r / mid;
			}
		}else{
			if (r <= 0){
				r = 0;
			}else if (r >= 1){
				r = 1;
			}
		}

		return r;
	};

	this.math.velocity = function (start, end, startTime, now, debug){
		if (now === undefined){
			now = +new Date();
		}

		var distance = 0;
		if (Array.isArray(start) && Array.isArray(end)){
			distance = utils.math.distance(start, end);
		}else{
			distance = Math.abs(end - start);
		}

		var time 		= now - startTime;
		var velocity 	= distance / time;

		if (!isFinite(velocity)){
			velocity = 0;
		}

		return velocity || 0;
	};

	// @todo: position element in container

	this.math.distance = function (start, end){
		start 	= utils.math.toPoint(start);
		end 	= utils.math.toPoint(end);

		var x = end.x - start.x;
		var y = end.y - start.y;

		return Math.sqrt((x * x) + (y * y));
	};

	this.math.focus = function (width, height, args){
		args 					= args || {};
		args.containerWidth 	= 'containerWidth' in args ? args.containerWidth : width;
		args.containerHeight 	= 'containerHeight' in args ? args.containerHeight : height;

		args.minWidth 			= 'minWidth' in args ? args.minWidth : 0;
		args.maxWidth 			= 'maxWidth' in args ? args.maxWidth : 0;
		args.minHeight 			= 'minHeight' in args ? args.minHeight : 0;
		args.maxHeight 			= 'maxHeight' in args ? args.maxHeight : 0;

		args.focusX 			= args.focusX || 0;
		args.focusY 			= args.focusY || 0;
		args.focusWidth 		= 'focusWidth' in args ? (args.focusWidth || 0) : width;
		args.focusHeight 		= 'focusHeight' in args ? (args.focusHeight || 0) : height;
		args.minFocusWidth 		= 'minFocusWidth' in args ? args.minFocusWidth : 0;
		args.maxFocusWidth 		= 'maxFocusWidth' in args ? args.maxFocusWidth : 0;
		args.minFocusHeight 	= 'minFocusHeight' in args ? args.minFocusHeight : 0;
		args.maxFocusHeight 	= 'maxFocusHeight' in args ? args.maxFocusHeight : 0;

		args.size 				= 'size' in args ? args.size : MATH.FOCUS.SIZES.CONTAIN;
		args.horizontal 		= 'horizontal' in args ? args.horizontal : MATH.FOCUS.HORIZONTALS.CENTER;
		args.vertical 			= 'vertical' in args ? args.vertical : MATH.FOCUS.VERTICALS.MIDDLE;
		args.grow 				= 'grow' in args ? args.grow : true;
		args.shrink 			= 'shrink' in args ? args.shrink : true;
		args.fill 				= 'fill' in args ? args.fill : false; // if fill:true, it will make sure the container is always filled

		// calculate
		args.focusX         = utils.calculate(args.focusX, width);
		args.focusY         = utils.calculate(args.focusY, height);
		args.focusWidth     = utils.calculate(args.focusWidth, width);
		args.focusHeight    = utils.calculate(args.focusHeight, height);

		args.minWidth 	    = utils.calculate(args.minWidth, args.containerWidth);
		args.maxWidth       = utils.calculate(args.maxWidth, args.containerWidth);
		args.minHeight      = utils.calculate(args.minHeight, args.containerHeight);
		args.maxHeight      = utils.calculate(args.maxHeight, args.containerHeight);
		args.minFocusWidth  = utils.calculate(args.minFocusWidth, args.containerWidth);
		args.maxFocusWidth  = utils.calculate(args.maxFocusWidth, args.containerWidth);
		args.minFocusHeight = utils.calculate(args.minFocusHeight, args.containerHeight);
		args.maxFocusHeight = utils.calculate(args.maxFocusHeight, args.containerHeight);

		var scale 	= 1;
		var scaleW 	= args.containerWidth / args.focusWidth;
		var scaleH	= args.containerHeight ? args.containerHeight / args.focusHeight : 1;	// the height might be at 0, that way we only consider the scale width

		if (!isFinite(scaleW)) scaleW = 1;
		if (!isFinite(scaleH)) scaleH = 1;

		if (args.size === MATH.FOCUS.SIZES.COVER){
			scale = Math.max(scaleW, scaleH);
		}else{ // contain
			scale = Math.min(scaleW, scaleH);
		}

		var scaledWidth          = width * scale;
		var scaledHeight 	     = height * scale;
		var scaledFocusWidth 	 = args.focusWidth * scale;
		var scaledFocusHeight 	 = args.focusHeight * scale;

		// min/max focus
		if ((args.minFocusWidth && scaledFocusWidth < args.minFocusWidth) || (args.minFocusHeight && scaledFocusHeight < args.minFocusHeight)){
			scaleW = args.minFocusWidth && scaledFocusWidth < args.minFocusWidth ? args.minFocusWidth / args.focusWidth : scale;
			scaleH = args.minFocusHeight && scaledFocusHeight < args.minFocusHeight ? args.minFocusHeight / args.focusHeight : scale;
			scale  = Math.max(scaleW, scaleH);
		}
		if ((args.maxFocusWidth && scaledFocusWidth > args.maxFocusWidth) || (args.maxFocusHeight && scaledFocusHeight > args.maxFocusHeight)){
			scaleW = args.maxFocusWidth && scaledFocusWidth > args.maxFocusWidth ? args.maxFocusWidth / args.focusWidth : scale;
			scaleH = args.maxFocusHeight && scaledFocusHeight > args.maxFocusHeight ? args.maxFocusHeight / args.focusHeight : scale;
			scale  = Math.min(scaleW, scaleH);
		}

		// min/max
		if ((args.minWidth && scaledWidth < args.minWidth) || (args.minHeight && scaledHeight < args.minHeight)){
			scaleW = args.minWidth && scaledWidth < args.minWidth ? args.minWidth / width : scale;
			scaleH = args.minHeight && scaledHeight < args.minHeight ? args.minHeight / width : scale;
			scale  = Math.max(scaleW, scaleH);
		}
		if ((args.maxWidth && scaledWidth > args.maxWidth) || (args.maxHeight && scaledHeight > args.maxHeight)){
			scaleW = args.maxWidth && scaledWidth > args.maxWidth ? args.maxWidth / width : scale;
			scaleH = args.maxHeight && scaledHeight > args.maxHeight ? args.maxHeight / height : scale;
			scale  = Math.min(scaleW, scaleH);
		}

		if (!args.grow && scale > 1){
			scale = 1;
		}
		if (!args.shrink && scale < 1){
			scale = 1;
		}

		// fix scale
		scaledWidth          = width * scale;
		scaledHeight 	     = height * scale;
		scaledFocusWidth 	 = args.focusWidth * scale;
		scaledFocusHeight 	 = args.focusHeight * scale;

		// fix width/height when we don't want to show empty space (overwrites the min/max)
		if (args.fill && ((scaledWidth < args.containerWidth) || (scaledHeight < args.containerHeight))){
			scaleW = args.containerWidth / width;
			scaleH = args.containerHeight / height;
			scale  = Math.max(scaleW, scaleH);
		}

		// fix scale one last time
		scaledHeight         = height * scale;
		scaledWidth          = width * scale;
		scaledFocusWidth 	 = args.focusWidth * scale;
		scaledFocusHeight 	 = args.focusHeight * scale;

		// x/y positions
		var scaledFocusX = args.focusX * scale;
		var scaledFocusY = args.focusY * scale;

		if (args.horizontal === MATH.FOCUS.HORIZONTALS.CENTER){
			scaledFocusX -= (args.containerWidth - scaledFocusWidth) / 2;
		}else if (args.horizontal === MATH.FOCUS.HORIZONTALS.RIGHT){
			scaledFocusX -= (args.containerWidth - scaledFocusWidth);
		}
		if (args.containerHeight && args.vertical === MATH.FOCUS.VERTICALS.MIDDLE){
			scaledFocusY -= (args.containerHeight - scaledFocusHeight) / 2;
		}else if (args.containerHeight && args.vertical === MATH.FOCUS.VERTICALS.BOTTOM){
			scaledFocusY -= (args.containerHeight - scaledFocusHeight);
		}

		// fix x/y when we don't want to show empty space
		var diffX = utils.math.gap(scaledWidth, args.containerWidth, scaledFocusX * -1);
		if (args.fill && diffX){
			scaledFocusX -= diffX;
		}

		var diffY = utils.math.gap(scaledHeight, args.containerHeight, scaledFocusY * -1);
		if (args.fill && diffY){
			scaledFocusY -= diffY;
		}

		var scaleX = scaledFocusX / scale;
		var scaleY = scaledFocusY / scale;

		return {
			// scaled dimensions
			'x'			        : scaledFocusX,
			'y'			        : scaledFocusY,
			'width'		        : scaledWidth,
			'height'	        : scaledHeight,
			'background' 		: 'no-repeat '+(scaledFocusX * -1)+'px '+(scaledFocusY * -1)+'px / '+scaledWidth+'px '+scaledHeight+'px',
			// scale
			'scale'		        : scale,
			'scaleX'	        : scaleX,
			'scaleY'	        : scaleY,
			'transform'	        : 'scale('+scale+') translate('+(scaleX * -1)+'px, '+(scaleY * -1)+'px)',
			'transformOrigin'   : 'top left',
			// focus
			'focusX'            : args.focusX,
			'focusY'	        : args.focusY,
			'focusWidth'        : args.focusWidth,
			'focusHeight'       : args.focusHeight,
			// focus (percents)
			'ratioX'            : args.focusX / width,
			'ratioY'	        : args.focusY / height,
			'ratioWidth'        : args.focusWidth / width,
			'ratioHeight'       : args.focusHeight / height,
			// container
			'containerWidth'	: args.containerWidth,
			'containerHeight'	: args.containerHeight || (scaledFocusHeight),
		}
	};

	this.math.angle = function (start, center, end){
		if (end === undefined){
			end      = center;
			center   = null;
		}

		start 	= utils.math.toPoint(start);
		center  = center ? utils.math.toPoint(center) : null;
		end 	= utils.math.toPoint(end);

		var angle;
		if (center){
			var a = utils.math.angle(center, start);
			var b = utils.math.angle(center, end);
			var c = b - a;
			return (c < 0 ? 360 + c : c) % 360;
		}else{
			var dx 		= end.x - start.x;
			var dy 		= end.y - start.y;
			var radian	= Math.atan2(dy, dx);

			angle = radian < 0 ? radian + 2 * Math.PI : radian;
		}

		return utils.math.toDegree(angle);
	};

	this.math.diffDegree = function (start, end){
		var diff = end - start;

		if (diff < -180){
			diff += 360;
		}
		if (diff > 180){
			diff -= 360;
		}

		return diff;
	}

	this.math.toDegree = function (angle){
		return angle * (180 / Math.PI);
	};

	this.math.toRadian = function (angle){
		return angle / (180/Math.PI);
	};

	this.math.toSizeGap = function (max, count, gap, size){
		// need to at least have 1 item
		if (count === 0){
			count = 1;
		}

		if (gap && size){
			max = count * (gap + size) - gap;
		}else if (gap){
			size = ((max + gap) / count) - gap;
		}else if (size){
			gap = (max - (count * size)) / (count-1);
		}else{
			size = max / count;
		}

		gap  = gap < 0 ? 0 : gap;
		size = size < 0 ? 0 : size;
		max  = max < 0 ? 0 : max;

		// make sure the max isn't at 0
		if (max < size){
			max = size;
		}

		return {
			'gap'	    : gap,
			'size'	    : size,
			'max'	    : max,
			'totalSize' : size * count,
			'totalGap'  : gap * (count - 1),
		}
	};

	this.math.toPoint = function (x, y){
		if (utils.isNot(x)){
			return null;
		}

		if (x instanceof Array){
			y = x[1];
			x = x[0];
		}else if (typeof x === 'object'){
			var o = x;
			x = 'x' in o ? o.x : 'left' in o ? o.left : 0;
			y = 'y' in o ? o.y : 'top' in o ? o.top : 0;
		}

		x = x || 0;
		y = y || 0;

		return {
			'x' : x,
			'y' : y,
		}
	};

	this.math.toRect = function (x, y, w, h){
		if (x instanceof Array){
			h = x[3];
			w = x[2];
			y = x[1];
			x = x[0];
		}else if (typeof x === 'object'){
			var o = x;
			x = 'x' in o ? o.x : 'left' in o ? o.left : 0;
			y = 'y' in o ? o.y : 'top' in o ? o.top : 0;
			w = 'width' in o ? o.width : 'right' in o ? o.right - x : 0;
			h = 'height' in o ? o.height : 'bottom' in o ? o.bottom - y : 0;
		}

		x = x || 0;
		y = y || 0;
		w = w || 0;
		h = h || 0;

		return {
			'x' 	: x,
			'y' 	: y,
			'top'	: y,
			'right' : x + w,
			'bottom': y + h,
			'left'	: x,
 			'width' : w,
			'height': h,
		}
	};

	this.math.toBounds = function (data, args){
		args 		 = args || {};
		args.padding = 'padding' in args ? args.padding : 0;
		args.offsetX = 'offsetX' in args ? args.offsetX : 0;
		args.offsetY = 'offsetY' in args ? args.offsetY : 0;

		var x, y, w, h;
		if (data instanceof Array){
			x = data[0] || 0;
			y = data[1] || 0;
			w = data[2] || 0;
			h = data[3] || 0;
		}else if (typeof data === 'object'){
			x = 'x' in data ? data.x : 'left' in data ? data.left : 0;
			y = 'y' in data ? data.y : 'top' in data ? data.top : 0;
			w = 'w' in data ? data.w : 'width' in data ? data.width : 'right' in data ? data.right - x : 0;
			h = 'h' in data ? data.h : 'height' in data ? data.height : 'bottom' in data ? data.bottom - y : 0;

			// radius for circles
			if ('radius' in data){
				x -= data.radius;
				y -= data.radius;
				w = data.radius * 2;
				h = data.radius * 2;
			}
		}

		x = (isFinite(x) ? x : 0) - args.padding + args.offsetX;
		y = (isFinite(y) ? y : 0) - args.padding + args.offsetY;
		w = (isFinite(w) ? w : 0) + (args.padding*2);
		h = (isFinite(h) ? h : 0) + (args.padding*2);

		// make sure the height/width are not negative
		if (h < 0) h = 0;
		if (w < 0) w = 0;

		return {
			'top'	 : y,
			'right'	 : x + w,
			'bottom' : y + h,
			'left'   : x,
			'x'		 : x,
			'y'		 : y,
			'width'	 : w,
			'height' : h,
			'centerX': x + (w / 2),
			'centerY': y + (h / 2),
			'center' :{
				'x'	: x + (w / 2),
				'y' : y + (h / 2),
			}
		};
	};

	this.math.toPointByAngle = function (point, distance, angle){
		point = utils.math.toRect(point);
		angle = utils.math.toRadian(angle);

		var x = point.x;
		var y = point.y;
		var z = 0;
		var w = 0;
		var h = 0;

		if (distance instanceof Array){
			w = distance[0];
			h = distance[1] || distance[0] || 0;
			z = distance[2] || 0;
		}else if (typeof distance === 'object'){
			w = distance.width || 0;
			h = distance.height || distance.width || 0;
			z = distance.z || 0;
		}else{
			w = distance;
			h = distance;
			z = 0;
		}

		z = utils.math.toRadian(z);
		x = x + w * Math.cos(angle) * Math.cos(z) - h * Math.sin(angle) * Math.sin(z);
		y = y + w * Math.cos(angle) * Math.sin(z) + h * Math.sin(angle) * Math.cos(z);

		return {
			'x' : x,
			'y' : y,
			'dx': x - point.x,
			'dy': y - point.y,
		};
	};

	this.math.rotatePoint = function (point, center, rotate){
		var distance = utils.math.distance(center, point);
		var angle 	 = utils.math.angle(center, point);
		return utils.math.toPointByAngle(center, distance, angle + rotate);
	};

	this.math.angleBetween = function (pointA, center, pointB, ratio){
		ratio  = ratio === undefined ? 0.5 : ratio;
		pointA = utils.math.toPoint(pointA);
		center = utils.math.toPoint(center);
		pointB = utils.math.toPoint(pointB);

		var angleA = utils.math.angle(center, pointA);
		var angleB = utils.math.angle(center, pointB);
		var angle  = angleA + (angleB - angleA) * ratio;

		if (angleB < angleA){
			angle += 180;
		}

		return angle;
	};

	this.math.pointBetween = function (pointA, pointB, ratio){
		ratio  = ratio === undefined ? 0.5 : ratio;
		pointA = utils.math.toPoint(pointA);
		pointB = utils.math.toPoint(pointB);

		var x = pointA.x + (pointB.x - pointA.x) * ratio;
		var y = pointA.y + (pointB.y - pointA.y) * ratio;

		return utils.math.toPoint(x,y);
	};

	this.math.attractPoint = function (pointA, pointB, move){
		pointA = utils.math.toPoint(pointA);
		pointB = utils.math.toPoint(pointB);

		var distance= utils.math.distance(pointA, pointB);
		var ratio 	= move / distance;

		return utils.math.pointBetween(pointA, pointB, ratio);
	};

	this.math.transformRect = function (rect, transforms, shape){
		rect       = utils.math.toRect(rect);
		transforms = transforms || {};

		var centerX = utils.math.get('originX' in transforms ? transforms.originX : '50%', rect.width);
		var centerY = utils.math.get('originY' in transforms ? transforms.originY : '50%', rect.height);
		var center  = [centerX, centerY];

		// translate -----------------------------------------------------------
		if ('translateX' in transforms){
			rect.x += transforms.translateX;
		}
		if ('translateY' in transforms){
			rect.y += transforms.translateY;
		}

		// rotate --------------------------------------------------------------
		if ('rotate' in transforms){
			var x1          = rect.x;
			var x2          = rect.x + rect.width;
			var y1          = rect.y;
			var y2          = rect.y + rect.height;

			var topLeft     = utils.math.rotatePoint([x1, y1], center, transforms.rotate);
			var topRight    = utils.math.rotatePoint([x2, y1], center, transforms.rotate);
			var bottomLeft  = utils.math.rotatePoint([x1, y2], center, transforms.rotate);
			var bottomRight = utils.math.rotatePoint([x2, y2], center, transforms.rotate);

			var x 			= utils.math.minMax([topLeft.x, topRight.x, bottomLeft.x, bottomRight.x]);
			var y 			= utils.math.minMax([topLeft.y, topRight.y, bottomLeft.y, bottomRight.y]);

			rect.x      = x.min;
			rect.y      = y.min;
			rect.width  = x.max - x.min;
			rect.height = y.max - y.min;
		}

		// scale ---------------------------------------------------------------
		var ratioX 	= (centerX - rect.x) / rect.width;
		var ratioY  = (centerY - rect.y) / rect.height;
		if ('scaleX' in transforms && rect.width){
			var width   = rect.width * transforms.scaleX;
			rect.x 	    += (rect.width - width) * ratioX;
			rect.width 	= width;
		}
		if ('scaleY' in transforms && rect.height){
			var height  = rect.height * transforms.scaleY;
			rect.y 	    += (rect.height - height) * ratioY;
			rect.height = height;
		}

		// skew ----------------------------------------------------------------
		if ('skewX' in transforms){
			var point    = [rect.x + rect.width/2, rect.y];
			var rotated  = utils.math.rotatePoint(point, center, -transforms.skewX);
			var offset 	 = rotated.x - point[0];

			//rect.x 		+= offset;
			//rect.width  += offset * 2;

			//console.log(offset);
			//shape.x(point[0], point[1]);
			//shape.x(rotated.x, point[1]);

			/*
			var center  = [rect.x + rect.width/2, rect.y + rect.height/2];
			var point	= [center[0], rect.y];
			var rotated = utils.math.rotatePoint(point, center, this.props.skewX);
			var offset 	= rotated.x - point[0];
			//*/
		}
		if ('skewY' in transforms){

		}

		return rect;
	};

	this.math.toPointInRect = function (rect, position){
		rect 	 = utils.math.toRect(rect);
		position = position instanceof Array ? position.join(' ') : position.toString();

		var positionXY = position.split(' ');
		var positionX  = ~position.indexOf('left') ? '0%' :
						 ~position.indexOf('center') ? '50%' :
						 ~position.indexOf('right') ? '100%' :
						 positionXY[0];
		var positionY  = ~position.indexOf('top') ? '0%' :
						 ~position.indexOf('middle') ? '50%' :
						 ~position.indexOf('bottom') ? '100%' :
						 positionXY[1];

		positionX = (positionX || '').toString().replace(/[^0-9\.\-\%]/g, '');
		positionY = (positionY || '').toString().replace(/[^0-9\.\-\%]/g, '');

		positionX = utils.math.get(positionX, {'max':rect.width, 'fallback':null});// + rect.x;
		positionY = utils.math.get(positionY, {'max':rect.height, 'fallback':null});// + rect.y;

		if (positionX !== null) positionX += rect.x;
		if (positionY !== null) positionY += rect.y;

		return {
			'x'	: positionX,
			'y' : positionY,
		}
	};

	this.math.toClientRect = function (points, offsetX, offsetY){
		var top 	= Infinity;
		var right 	= -Infinity;
		var bottom 	= -Infinity;
		var left 	= Infinity;

		utils.each(points, function (point){
			var point = utils.math.toRect(point);
			top 	= Math.min(top, point.y);
			right 	= Math.max(right, point.x);
			bottom 	= Math.max(bottom, point.y);
			left 	= Math.min(left, point.x);
		});

		offsetX = offsetX || 0;
		offsetY = offsetY || 0;
		top 	= (isFinite(top) ? top : 0) + offsetY;
		right 	= (isFinite(right) ? right : 0) + offsetX;
		bottom 	= (isFinite(bottom) ? bottom : 0) + offsetY;
		left 	= (isFinite(left) ? left : 0) + offsetX;

		return {
			'x'		: left,
			'y'		: top,
			'top'	: top,
			'right'	: right,
			'bottom': bottom,
			'left'	: left,
			'width' : right - left,
			'height': bottom - top,
		}
	};

	this.math.toArcRect = function (point, radius, start, end, counterClockwise){
		var points 	= [];
		var angles 	= [start, end];

		point 		= utils.math.toRect(point);
		start 		= (counterClockwise ? 360 - start : start);
		end 		= (counterClockwise ? 360 - end : end);

		if (end - start >= 360){
			points = [
				{'x':point.x - radius, 'y':point.y - radius},
				{'x':point.x + radius, 'y':point.y + radius},
			];
		}else{
			if (utils.math.isBetweenAngle(start, end, 0)) angles.push(0);
			if (utils.math.isBetweenAngle(start, end, 90)) angles.push(90);
			if (utils.math.isBetweenAngle(start, end, 180)) angles.push(180);
			if (utils.math.isBetweenAngle(start, end, 270)) angles.push(270);

			utils.each(angles, function (a){
				var p = utils.math.toPointByAngle(point, radius, a);
				points.push(p);
			});
		}

		return utils.math.toClientRect(points);
	};

	// @source https://stackoverflow.com/questions/24809978/calculating-the-bounding-box-of-cubic-bezier-curve/24814530
	this.math.toBezierRect = function (start, control1, control2, end){
		start    = utils.math.toRect(start);
		control1 = utils.math.toRect(control1);
		control2 = utils.math.toRect(control2);
		end      = utils.math.toRect(end);

		var x0 = start.x;
		var y0 = start.y;
		var x1 = control1.x;
		var y1 = control1.y;
		var x2 = control2.x;
		var y2 = control2.y;
		var x3 = end.x;
		var y3 = end.y;

		var tvalues = [], xvalues = [], yvalues = [],
			a, b, c, t, t1, t2, b2ac, sqrtb2ac;

		for (var i = 0; i < 2; ++i) {
			if (i == 0) {
				b = 6 * x0 - 12 * x1 + 6 * x2;
				a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
				c = 3 * x1 - 3 * x0;
			} else {
				b = 6 * y0 - 12 * y1 + 6 * y2;
				a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
				c = 3 * y1 - 3 * y0;
			}
			if (Math.abs(a) < 1e-12) {
				if (Math.abs(b) < 1e-12) {
					continue;
				}
				t = -c / b;
				if (0 < t && t < 1) {
					tvalues.push(t);
				}
				continue;
			}
			b2ac = b * b - 4 * c * a;
			if (b2ac < 0) {
				if (Math.abs(b2ac) < 1e-12) {
					t = -b / (2 * a);
					if (0 < t && t < 1) {
						tvalues.push(t);
					}
				}
				continue;
			}
			sqrtb2ac = Math.sqrt(b2ac);
			t1 = (-b + sqrtb2ac) / (2 * a);
			if (0 < t1 && t1 < 1) {
				tvalues.push(t1);
			}
			t2 = (-b - sqrtb2ac) / (2 * a);
			if (0 < t2 && t2 < 1) {
				tvalues.push(t2);
			}
		}

		var j = tvalues.length, mt;
		while (j--) {
			t = tvalues[j];
			mt = 1 - t;
			xvalues[j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
			yvalues[j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
		}

		xvalues.push(x0,x3);
		yvalues.push(y0,y3);

		var top    = Math.min.apply(0, yvalues);
		var right  = Math.max.apply(0, xvalues);
		var bottom = Math.max.apply(0, yvalues);
		var left   = Math.min.apply(0, xvalues);

		return {
			'x'		: left,
			'y'		: top,
			'top'	: top,
			'right'	: right,
			'bottom': bottom,
			'left'	: left,
			'width' : right - left,
			'height': bottom - top,
		};
	};

	// @source https://stackoverflow.com/questions/999549/finding-min-max-of-quadratic-bezier-with-coregraphics/1099291#1099291
	this.math.toQuadRect = function (start, control, end){
		start    = utils.math.toRect(start);
		control  = utils.math.toRect(control);
		end      = utils.math.toRect(end);

		function pointOnCurve (s,c,e,t){
		    if(t<=0 || 1<=t || isNaN(t)) return false;

			var cx1 = s.x+(c.x-s.x)*t;
			var cy1 = s.y+(c.y-s.y)*t;
			var cx2 = c.x+(e.x-c.x)*t;
			var cy2 = c.y+(e.y-c.y)*t;
			var x   = cx1+(cx2-cx1)*t;
			var y   = cy1+(cy2-cy1)*t;

		    return {
				'x' : x,
				'y' : y,
			};
		}

		var tx = (start.x - control.x) / (start.x - 2*control.x + end.x);
		var ty = (start.y - control.y) / (start.y - 2*control.y + end.y);
		var Ex = pointOnCurve(start,control,end,tx);

		var xMin = Ex ? Math.min(start.x,end.x,Ex.x) : Math.min(start.x,end.x);
		var xMax = Ex ? Math.max(start.x,end.x,Ex.x) : Math.max(start.x,end.x);
		var Ey 	 = pointOnCurve(start,control,end,ty);

		var yMin = Ey ? Math.min(start.y,end.y,Ey.y) : Math.min(start.y,end.y);
		var yMax = Ey ? Math.max(start.y,end.y,Ey.y) : Math.max(start.y,end.y);

		return {
			'x'		: xMin,
			'y'		: yMin,
			'top'	: yMin,
			'right'	: xMax,
			'bottom': yMax,
			'left'	: xMin,
			'width' : xMax - xMin,
			'height': yMax - yMin,
		};
	};

	this.math.toSvgPath = function (path, args){
		args 			= args || {};
		args.offsetX 	= 'offsetX' in args ? args.offsetX : 0;
		args.offsetY 	= 'offsetY' in args ? args.offsetY : 0;
		args.absolute 	= 'absolute' in args ? args.absolute : true;
		args.simplify 	= 'simplify' in args ? args.simplify : true;
		args.arcToCurves= 'arcToCurves' in args ? args.arcToCurves : true;
		args.isArray 	= 'isArray' in args ? args.isArray : false;

		// @source https://github.com/jkroso/parse-svg-path/blob/master/index.js
		// parse ARC https://github.com/nilzona/path2d-polyfill/blob/master/src/path2d-polyfill.js

		if (typeof path === 'string'){
			var items = [];
			path.replace(MATH.RE.PATH_COMMAND_SEGMENT, function(_, command, args){
				var type 	= command.toLowerCase();
				var numbers = args.match(MATH.RE.PATH_COMMAND_NUMBER);

				numbers = numbers ? numbers.map(Number) : [];

				// overloaded moveTo
				if (type == 'm' && numbers.length > 2) {
					items.push([command].concat(numbers.splice(0, 2)));
					type = 'l';
					command = command == 'm' ? 'l' : 'L';
				}

				while (true) {
					if (numbers.length == MATH.PATH_COMMAND_LENGTHS[type]) {
						numbers.unshift(command);
						return items.push(numbers);
					}

					if (numbers.length < length[type]){
						throw new Error('malformed path data');
					}

					items.push([command].concat(numbers.splice(0, MATH.PATH_COMMAND_LENGTHS[type])));
				}
			});
			path = items;
		}

		if (args.isArray){
			segments = path;
		}else{
			var previous  = null;
			var previousX = 0;
			var previousY = 0;
			var segments  = [];
			for (var i=0, l=items.length; i<l; ++i){
				var item = items[i];

				if (item instanceof Array){
					var type 		= item[0].toString().toLowerCase();
					var isRelative 	= item[0] === type;

					switch (type){
						case 'm': item = {'type':'move', 'x':item[1], 'y':item[2]}; break;
						case 'l': item = {'type':'line', 'x':item[1], 'y':item[2]}; break;
						case 'h': item = {'type':'horizontal', 'x':item[1]}; break;
						case 'v': item = {'type':'vertical', 'y':item[1]}; break;
						case 'c': item = {'type':'curve', 'cp1x':item[1], 'cp1y':item[2], 'cp2x':item[3], 'cp2y':item[4], 'x':item[5], 'y':item[6]}; break;
						case 's': item = {'type':'smooth-curve', 'cp2x':item[1], 'cp2y':item[2], 'x':item[3], 'y':item[4]}; break;
						case 'q': item = {'type':'quad', 'cpx':item[1], 'cpy':item[2], 'x':item[5], 'y':item[6]}; break;
						case 't': item = {'type':'smooth-quad', 'x':item[1], 'y':item[2]}; break;
						case 'a': item = {'type':'arc', 'rx':item[1], 'ry':item[2], 'rotation':item[3], 'largeArc':item[4], 'sweep':item[5], 'x':item[6], 'y':item[7]}; break;
						case 'z': item = {'type':'end'}; break;
						default:  item = {'x':item[0], 'y':item[1]}; break;
					}

					if (item.type === undefined){
						item.type = previous ? 'line' : 'move';
					}

					item.relative = isRelative;
				}

				// set to absolute the relative data
				if (args.absolute && item.relative){
					if ('x' in item)	item.x += previousX;
					if ('y' in item)	item.y += previousY;
					if ('cpx' in item)	item.cpx += previousX;
					if ('cpy' in item)	item.cpy += previousY;
					if ('cp1x' in item)	item.cp1x += previousX;
					if ('cp1y' in item)	item.cp1y += previousY;
					if ('cp2x' in item)	item.cp2x += previousX;
					if ('cp2y' in item)	item.cp2y += previousY;
					item.relative = 'false';
				}

				if (item.type === 'move'){
					previousX = item.x;
					previousY = item.y;
				}else if (item.type === 'line'){
					previousX = item.x;
					previousY = item.y;
				}else if (item.type === 'horizontal' && args.simplify){
					item.type 	= 'line';
					item.y 		= previousY;
					previousX	= item.x;
				}else if (item.type === 'horizontal'){
					previousX = item.x;
				}else if (item.type === 'vertical' && args.simplify){
					item.type 	= 'line';
					item.x 		= previousX;
					previousY 	= item.y;
				}else if (item.type === 'vertical'){
					previousY = item.y;
				}else if (item.type === 'curve'){
					previousX = item.x;
					previousY = item.y;
				}else if (item.type === 'smooth-curve' && args.simplify){
					var cpx = previousX;
					var cpy = previousY;

					if (previous && previous.type === 'curve'){
						cpx = previous.cp2x;
						cpy = previous.cp2y;
					}else if (previous && previous.type === 'quad'){
						cpx = previous.cpx;
						cpy = previous.cpy;
					}

					item.type = 'curve';
					item.cp1x = previousX - cpx + previousX; //(item.relative ? previousX : 0);
					item.cp1y = previousY - cpy + previousY; //(item.relative ? previousY : 0);

					previousX = item.x;
					previousY = item.y;
				}else if (item.type === 'smooth-curve'){
					previousX = item.x;
					previousY = item.y;
				}else if (item.type === 'quad'){
					previousX = item.x;
					previousY = item.y;
				}else if (item.type === 'smooth-quad'){
					/*
					var cpx = previousX;
					var cpy = previousY;

					if (previous && previous.type === 'curve'){
						cpx = previous.cp2x;
						cpy = previous.cp2y;
					}else if (previous && previous.type === 'quad'){
						cpx = previous.cpx;
						cpy = previous.cpy;
					}

					item.type = 'quad';
					item.cpx  = previousX - cpx + previousX;
					item.cpy  = previousY - cpy + previousY;
					*/

					previousX = item.x;
					previousY = item.y;
				// convert the arc to curves
				}else if (item.type === 'arc' && args.arcToCurves){
					var curves = utils.math.arcToBezier(previousX, previousY, item.x, item.y, item.rx, item.ry, item.rotation, item.largeArc, item.sweep);

					if (curves.length){
						segments  = segments.concat(curves);

						previous  = curves[curves.length - 1];
						previousX = previous.x;
						previousY = previous.y;
					}

					continue;
				}else if (item.type === 'arc'){
					previousX = item.x;
					previousY = item.y;
				}

				// offset
				previous = item;
				segments.push(item);
			}
		}

		return segments;
	}

	// @source https://github.com/colinmeinke/svg-arc-to-cubic-bezier
	this.math.arcToBezier = function (px, py, cx, cy, rx, ry, xAxisRotation, largeArcFlag, sweepFlag){
		xAxisRotation = xAxisRotation || 0;
		largeArcFlag  = largeArcFlag || 0;
		sweepFlag     = sweepFlag || 0;


		var TAU = Math.PI * 2;

		function _mapToEllipse (xy, rx, ry, cosphi, sinphi, centerx, centery){
			xy.x *= rx;
			xy.y *= ry;

			var xp = cosphi * xy.x - sinphi * xy.y;
			var yp = sinphi * xy.x + cosphi * xy.y;

			return {
				'x' : xp + centerx,
				'y' : yp + centery
			}
		}

		function _approxUnitArc (ang1, ang2){
			// See http://spencermortensen.com/articles/bezier-circle/ for the derivation
			// of this constant.
			// Note: We need to keep the sign of ang2, because this determines the
			//       direction of the arc using the sweep-flag parameter.
			var c = 0.551915024494 * (ang2 < 0 ? -1 : 1);
			var x1 = Math.cos(ang1);
			var y1 = Math.sin(ang1);
			var x2 = Math.cos(ang1 + ang2);
			var y2 = Math.sin(ang1 + ang2);

			return [{
				'x': x1 - y1 * c,
				'y': y1 + x1 * c
			},{
				'x': x2 + y2 * c,
				'y': y2 - x2 * c
			},{
				'x': x2,
				'y': y2
			}]
		};

		function _vectorAngle (ux, uy, vx, vy) {
		  var sign = (ux * vy - uy * vx < 0) ? -1 : 1;
		  var umag = Math.sqrt(ux * ux + uy * uy);
		  var vmag = Math.sqrt(ux * ux + uy * uy);
		  var dot = ux * vx + uy * vy;
		  var div = dot / (umag * vmag);

			if (div > 1){
				div = 1;
			}

			if (div < -1){
				div = -1;
			}

			return sign * Math.acos(div);
		}

		function _getArcCenter (px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp){
			var rxsq = Math.pow(rx, 2);
			var rysq = Math.pow(ry, 2);
			var pxpsq = Math.pow(pxp, 2);
			var pypsq = Math.pow(pyp, 2);
			var radicant = (rxsq * rysq) - (rxsq * pypsq) - (rysq * pxpsq);

			if (radicant < 0){
				radicant = 0;
			}

			radicant /= (rxsq * pypsq) + (rysq * pxpsq);
			radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);

			var centerxp = radicant * rx / ry * pyp;
			var centeryp = radicant * -ry / rx * pxp;

			var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
			var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;

			var vx1 = (pxp - centerxp) / rx;
			var vy1 = (pyp - centeryp) / ry;
			var vx2 = (-pxp - centerxp) / rx;
			var vy2 = (-pyp - centeryp) / ry;

			var ang1 = _vectorAngle(1, 0, vx1, vy1);
			var ang2 = _vectorAngle(vx1, vy1, vx2, vy2);

			if (sweepFlag === 0 && ang2 > 0) {
				ang2 -= TAU;
			}

			if (sweepFlag === 1 && ang2 < 0) {
				ang2 += TAU;
			}

			return [centerx, centery, ang1, ang2];
		}

		var curves = [];

		if (rx === 0 || ry === 0){
			return [];
		}

		var sinphi = Math.sin(xAxisRotation * TAU / 360);
		var cosphi = Math.cos(xAxisRotation * TAU / 360);

		var pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2;
		var pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2;

		if (pxp === 0 && pyp === 0) {
			return [];
		}

		rx = Math.abs(rx);
		ry = Math.abs(ry);

		var lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);

		if (lambda > 1){
			rx *= Math.sqrt(lambda);
			ry *= Math.sqrt(lambda);
		}

		var arcCenter = _getArcCenter(
			px,
			py,
			cx,
			cy,
			rx,
			ry,
			largeArcFlag,
			sweepFlag,
			sinphi,
			cosphi,
			pxp,
			pyp
		);

		var centerx = arcCenter[0];
		var centery = arcCenter[1];
		var ang1 = arcCenter[2];
		var ang2 = arcCenter[3];

		// If 'ang2' == 90.0000000001, then `ratio` will evaluate to
		// 1.0000000001. This causes `segments` to be greater than one, which is an
		// unecessary split, and adds extra points to the bezier curve. To alleviate
		// this issue, we round to 1.0 when the ratio is close to 1.0.
		var ratio = Math.abs(ang2) / (TAU / 4);
		if (Math.abs(1.0 - ratio) < 0.0000001){
			ratio = 1.0;
		}

		var segments = Math.max(Math.ceil(ratio), 1);
		ang2 /= segments;


		for (var i=0; i<segments; i++) {
			curves.push(_approxUnitArc(ang1, ang2));
			ang1 += ang2;
		}

		return curves.map(function (curve){
			var xy1 = _mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery);
			var xy2 = _mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery);
			var xy  = _mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery);
			return {'type':'curve', 'cp1x':xy1.x, 'cp1y':xy1.y, 'cp2x':xy2.x, 'cp2y':xy2.y, 'x':xy.x, 'y':xy.y};
		});
	};

	this.math.isBetweenAngle = function (start, end, mid, isEqual){
		if (start < 0) 	start = 360 + start;
		if (end < 0) 	end = 360 + end;
		if (mid < 0) 	mid = 360 + mid;

		start 	= start % 360;
		end 	= end % 360;
		mid   	= mid % 360;

		if (start > end){
			var s = start;
			start = end;
			end   = s;
		}

		if (isEqual && (mid === start || mid === end)){
			return true;
		}

		end = (end - start) < 0 ? end - start + 360 : end - start;
	    mid = (mid - start) < 0 ? mid - start + 360 : mid - start;

		return mid < end;
	};

	this.math.isColliding = function (a, b, args){
		args 			= args || {};
		args.isCircle 	= 'isCircle' in args ? args.isCircle : false;
		args.padding  	= 'padding' in args ? args.padding : 0;
		args.delta 		= 'delta' in args ? args.delta : false;

		a = utils.math.toBounds(a, {'padding':args.padding});
		b = utils.math.toBounds(b);

		var collides = false;
		if (args.isCircle){
			var distance = utils.math.distance([a.centerX, a.centerY], [b.centerX, b.centerY]);
			var radiuses = a.width/2 + b.width/2;

			if (distance < radiuses){
				collides = {
					'x' 	: a.centerX,
					'y'		: a.centerY,
					'diff'	: distance - radiuses,
					'angle' : utils.math.angle([a.centerX, a.centerY], [b.centerX, b.centerY]),
				};

				if (args.delta){
					var point = utils.math.toPointByAngle(a, collides.diff, collides.angle);
					collides.dx = point.dx;
					collides.dy = point.dy;
				}
			}
			// @todo https://happycoding.io/tutorials/processing/collision-detection
		}else{
			if (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom){
				// @todo return the colliding space
				collides = true;
			}
		}

		return collides;
	};

	// object ------------------------------------------------------------------
	var OBJECT = {
		RE : {
			PATH : /((?:[^\.]+(?=\()\([^\)]+\))|[^.]+)/g,	// match object path with function. ex.: value.value.function(a,b,c).value
			PROP : /([^(]+)(?:\(([^(]+)\))?/,
		}
	};

	this.object = {};

	this.object.inherit = function (proto, props){
		var obj = {};

		obj.__proto__ = proto;

		for (var i in props){
			obj[i] = props[i];
		}

		return obj;
	};

	this.object.create = function (key, value){
		var obj = {};
		obj[key] = value;
		return obj;
	};

	this.object.split = function (obj, callback){
		var keys   = [];
		var values = [];

		utils.each(obj, function (value, key){
			keys.push(key);
			values.push(value);

			if (typeof callback === 'function'){
				callback(key, value);
			}
		});

		return {
			'keys'  : keys,
			'values': values,
		}
	};

	this.object.keys = function (obj){
		return this.split(obj).keys;
	};

	this.object.keyIndex = function (obj, key){
		var keys = utils.object.split(obj).keys;
		return keys.indexOf(key);
	};

	this.object.count = function (obj){
		var count = 0;
		for (var i in obj){
			count++;
		}
		return count;
	};

	this.object.exists = function (obj, list){
		if (list instanceof Array){
			return !!~list.indexOf(obj);
		}else if (typeof list === 'object'){
			for (var i in list){
				if (list[i] === obj) return true;
			}
		}
	};

	// @todo
	this.object.get = function (obj, match){

	};

	this.object.has = function (obj, keys){
		if (typeof obj !== 'object'){
			return false;
		}

		var hasAll = true;
		utils.each(keys, function (key){
			if (!(key in obj)){
				hasAll = false;
				return BREAK;
			}
		});

		return hasAll;
	};

	this.object.values = function (obj){
		return this.split(obj).values;
	};

	this.object.swapKeyValue = function (obj){
		var swap = {};

		utils.object.split(obj, function (key, value){
			swap[value] = key;
		});

		return swap;
	};

	this.object.enumValue = function (obj, value, fallback){
		var first = null;

		for (var k in obj){
			var v = obj[k];

			if (!first){
				first = v;
			}

			if (v === value){
				return v;
			}
		}

		return fallback !== undefined ? fallback : first;
	};

	this.object.cache = function (obj, key, value, expando){
		if (typeof obj !== 'object') return null;
		if (expando === undefined) expando = EXPANDO;

		var set  = utils.toSetterObject(key, value);
		var data = obj[EXPANDO];

		if (data === undefined){
			data = obj[EXPANDO] = {};
		}

		if (set){
			utils.object.merge(data, set);
		}else if (key !== undefined){
			return data[key];
		}else{
			return data;
		}
	};

	this.object.merge = function (obj, copy, include, exclude){
		include = include ? utils.toArray(include) : null;
		exclude = exclude ? utils.toArray(exclude) : null;

		for (var i in copy){
			var value = copy[i];

			if (
				value === undefined ||
				(include && !~include.indexOf(i)) ||
				(exclude && ~exclude.indexOf(i))
			) continue;

			obj[i] = value;
		}

		return obj;
	};

	this.object.clone = function (obj){
		var copy = {};

		for (var i in obj){
			if (!obj.hasOwnProperty(i)) continue;
			copy[i] = obj[i];
		}

		return copy;
	};

	this.object.prop = this.object.getterSetter = function (obj, prop, getter, setter){
		Object.defineProperty(obj, prop, {
			get:function (){ return getter.apply(this); },
			set:function (){ setter.apply(this, arguments); }
		});
	};

	this.object.resolve = function (obj, path, args){
		path = path.toString().match(OBJECT.RE.PATH);

		if (!path || !obj){
			return;
		}

		args 		= args || {};
		args.value 	= 'value' in args ? args.value : undefined;
		args.context= 'context' in args ? args.context : undefined;

		var value;
		for (var i=0, l=path.length; i<l; ++i){
			var name 	= path[i];
			var match 	= name.match(OBJECT.RE.PROP);

			// couldn't match an attribute
			if (!match){
				break;
			}

			var prop 	= match[1];
			var params 	= utils.string.toValues(match[2]);
			var isLast  = i === l-1;
			var val 	= obj[prop];

			if (isLast){
				// set value to function
				if (args.value !== undefined && typeof current === 'function'){
					value = val.call(args.context || obj, args.value);
				// set value (need to use the obj, since it's HIS value that needs to be set)
				}else if (args.value !== undefined){
					value = obj[prop] = args.value;
				}else{
					value = val;
				}
			}else{
				val = typeof val === 'function' ? val.apply(args.context || obj, params) : val;

				if (val === undefined || val === null){
					break;
				}else{
					obj = val;
				}
			}
		}

		return value;
	};

	this.object.namespace = function (obj, value, args){
		if (typeof obj === 'string'){
			var key = obj;
			obj 	 = {};
			obj[key] = value;
		}else{
			args = value;
		}

		args 			= (typeof args === 'string' ? {'separator':args} : args) || {};
		args.separator 	= 'separator' in args ? args.separator : '.';
		args.arraySets	= 'arraySets' in args ? args.arraySets : false;

		var data = {};
		for (var key in obj){
			var prev = data;
			var value= obj[key];
			var path;

			// if it's a set of array
			if (args.arraySets && value instanceof Array){
				key   = value[0];
				value = value[1];
			}

			if (args.separator === 'form'){
				path = key.replace(/\[/g, '.').replace(/\]/g, '').split('.');
			}else{
				path = key.split(args.separator);
			}

			for (var i=0, l=path.length; i<l; ++i){
				var index  = (path[i] || prev.length.toString()).trim();
				var nIndex = (path[i + 1] || '0').trim();

				if (i === path.length - 1){
					prev[index] = value;
				}else if (!isNaN(nIndex)){
					prev = prev[index] = prev[index] || [];
				}else{
					prev = prev[index] = prev[index] || {};
				}
			}
		}

		return data;
	};

	// @todo
	this.object.flatten = function (obj, separator, isArray){
		/*
		var data = _walk(obj);

		function _walk (o){
			var data = isArray ? [] : {};
			for (var i in o) {
				if (!o.hasOwnProperty(i)) continue;

				if ((typeof o[i]) == 'object') {
					var flatObject = flattenObject(o[i]);
					for (var x in flatObject) {
						if (!flatObject.hasOwnProperty(x)) continue;
						data[i + '.' + x] = flatObject[x];
					}
				} else {
					data[i] = o[i];
				}
			}
		}

		return data;
		*/
	};

	this.object.toString = function (obj, args){
		args 				= args || {};
		args.separator 		= 'separator' in args ? args.separator : ',';
		args.pairSeparator 	= 'pairSeparator' in args ? args.pairSeparator : ':';

		var string = [];
		for (var i in obj){
			string.push(i + args.pairSeparator + obj[i]);
		}

		return string.join(args.separator);
	}

	this.object.toUrlParams = function (obj){
		var	params = [];

		for (var i in obj){
			var value = obj[i];

			if (value instanceof Array){
				var arr = [];
				for (var ii in value){
					arr.push(i+'[]='+encodeURIComponent(value[ii]));
				}
				if (arr.length){
					params.push(arr.join('&'));
				}else{
					params.push(i+'[]');
				}
			}else if (typeof value === 'object'){
				// multiple parts
				// @todo
			}else{
				params.push(i+'='+encodeURIComponent(value)+'');
			}
		}

		return params.join('&');
	};

	this.object.toFormData = function (obj){
		var	data = new FormData();

		for (var i in obj){
			var value = obj[i];

			if (value instanceof Array){
				for (var ii in value){
					var v = value[ii];
					data.append(i + '[]', v);
				}
				if (!value.length){
					data.append(i + '[]', '');
				}
			}else if (typeof value === 'object'){
				data.append(i, value);
			}else{
				data.append(i, value);
			}
		}

		return data;
	};

	this.object.toObject = function (obj, key, args){
		args 		 = args || {};
		args.extend  = 'extend' in args ? args.extend : [];
		args.default = 'default' in args ? args.default : [];
		args.copy 	 = 'copy' in args ? args.copy : false;

		if (typeof obj !== 'object' || obj instanceof Array){
			var o = {};
			o[key] = obj;
			obj = o;
		}else if (args.clone){
			obj = utils.copy(obj);
		}

		if (!(args.default instanceof Array)){
			args.default = [args.default];
		}
		for (var i in args.default){
			var values = args.default[i];
			if (values){
				utils.defaults(obj, values);
			}
		}

		if (!(args.extend instanceof Array)){
			args.extend = [args.extend];
		}
		for (var i in args.extend){
			var values = args.extend[i];
			if (values){
				utils.extend(obj, values);
			}
		}

		return obj;
	};

	this.object.updateKeys = function (obj, callback){
		var item = {};

		utils.each(obj, function (value, id){
			id       = callback(id);
			item[id] = value;
		});

		return item;
	};

	// array -------------------------------------------------------------------
	this.array = {};

	this.array.join = function (arr, args){
		args = args || {};

		if (args.prefix === undefined) args.prefix = '';
		if (args.suffix === undefined) args.suffix = '';
		if (args.separator === undefined) args.separator = '';
		if (args.template === undefined) args.template = '';
		if (args.data === undefined) args.data = {};

		var response = [];
		utils.each(arr, function (item, i, a){
			var value;
			var separator = args.separator instanceof Array ? args.separator[(a.index - 1) % args.separator.length] : args.separator;

			if (typeof item === 'function'){
				value = item.name;
			}else if (args.template && typeof item === 'object' && item !== null){
				var data = utils.extend({}, args.data, item);
				value = utils.string.interpolate(args.template, data);
			}else{
				value = item === null || item === undefined ? '' : item.toString();
			}

			if (a.index > 0){
				response.push(separator);
			}

			response.push(args.prefix + value + args.suffix);
		});

		return response.join('');
	};

	this.array.filter = function (arr, match, trim){
		var items = [];

		utils.each(arr, {'trim':trim}, function (item){
			if (
				(match === undefined && utils.is(item)) ||
				(match !== undefined && utils.match(item, match))
			){
				items.push(item);
			}
		});

		return items;
	};

	this.array.compare = function (arr1, arr2, isSame, callback){
		if (isSame === undefined){
			isSame = true;
		}
		arr1 = utils.toArray(arr1);
		arr2 = utils.toArray(arr2);

		var items = utils.array.filter(arr1, function (a){
			var isFound = false;

			utils.each(arr2, function (b){
				if (
					(typeof callback === 'function' && callback(a, b)) ||
					(typeof callback !== 'function' && utils.match(a, b))
				){
					isFound = true;
				}
			});

			return isFound === isSame;
		});

		return items;
	}

	this.array.clean = function (arr){
		return utils.array.filter(arr, function (item){
			return item !== null && item !== undefined && (typeof item === 'string' && item.trim() !== '');
		});
	};

	this.array.clone = function (arr){
		return Array.prototype.slice.call(arr);
	};

	this.array.indexOf = function (arr, match, outOfBounds){
		if (outOfBounds === undefined) outOfBounds = true;

		var index = -1;
		if (typeof match === 'string' && match.indexOf('index:') === 0){
			match = match.replace('index:', '');
			index = utils.math.get(match, {
				'min'	      : 0,
				'max'	      : arr.length-1,
				'decimals'	  : false,
				'outOfBounds' : outOfBounds,
				'fallback'	  : -1,
			});
		}else{
			utils.each(arr, function (item, key){
				if (utils.match(item, match)){
					index = key;
					return BREAK;
				}
			});
		}

		return index;
	};

	this.array.get = function (arr, match, outOfBounds){
		if (outOfBounds === undefined) outOfBounds = true;
		var index = utils.array.indexOf(arr, match, outOfBounds);
		return arr[index];
	};

	this.array.exists = function (arr, match){
		var item = utils.array.get(arr, match);
		return item !== undefined && item !== null;
	};

	this.array.findInLoop = function (arr, index, fallback){
		if (!Array.isArray(arr)){
			return fallback;
		}
		if (index in arr){
			return arr[index];
		}else if (index % arr.length in arr){
			return arr[index % arr.length];
		}else if (0 in arr){
			return arr[0];
		}else{
			return fallback;
		}
	};

	this.array.insert = function (arr, items, args){
		if (!(items instanceof Array)){
			items = [items];
		}

		if (typeof args === 'function' || typeof args === 'boolean'){
			args = {'duplicate':args};
		}else if (typeof args !== 'object'){
			args = {'index':args};
		}
		if (args.duplicate === undefined) 	args.duplicate = true;
		if (args.index === undefined) 	 	args.index = arr.length;

		args.index = utils.math.get(args.index, {
			'min'	      : 0,
			'max'	      : arr.length,
			'decimals'	  : false,
			'outOfBounds' : false,
			'fallback'	  : arr.length,
		});

		if (args.duplicate === false || typeof args.duplicate === 'function'){
			items = utils.array.compare(items, arr, false, args.duplicate);
		}

		arr.splice.apply(arr, [args.index, 0].concat(items));

		return arr;
	};

	this.array.remove = function (arr, match, replace){
		var removed = [];
		var index   = -1;

		if (typeof match === 'string' && match.indexOf('index:') === 0){
			match = match.replace('index:', '');

			index = utils.math.get(match, {
				'min'	      : 0,
				'max'	      : arr.length-1,
				'decimals'	  : false,
				'outOfBounds' : false,
				'fallback'	  : -1,
			});

			removed = arr.splice(index, 1);
		}else{
			var isArray = match instanceof Array;
			utils.each(arr, {'reverse':true}, function (item, i){
				if (
					(isArray && !!~utils.array.indexOf(match, item)) ||
					(!isArray && utils.match(item, match, {'loose':false}))
				){
					index = i;
					removed.unshift(item);
					this.splice(i, 1);
				}
			});
		}

		if (replace){
			replace = replace instanceof Array ? replace : [replace];
			arr.splice.apply(arr, [index, 0].concat(replace));
		}

		return removed;
	};

	this.array.diff = function (arr1, arr2, returnInstersects){
		arr1 = utils.toArray(arr1);
		arr2 = utils.toArray(arr2);

		var intersects 	= [];
		var diffs     	= [];
		var length 		= Math.max(arr1.length, arr2.length);

		for (var i=0; i<length; ++i){
			var a = arr1[i];
			var b = arr2[i];

			if (a !== undefined){
				if (!~arr2.indexOf(a) && !~diffs.indexOf(a)){
					diffs.push(a);
				}else if (!~intersects.indexOf(a)){
					intersects.push(a);
				}
			}
			if (b !== undefined){
				if (!~arr1.indexOf(b) && !~diffs.indexOf(b)){
					diffs.push(b);
				}else if (!~intersects.indexOf(b)){
					intersects.push(b);
				}
			}
		}

		if (typeof returnInstersects === 'function'){
			returnInstersects(diffs, intersects);
		}

		if (returnInstersects === true){
			return intersects;
		}else{
			return diffs;
		}
	};

	this.array.intersect = function (arr1, arr2){
		return utils.array.diff(arr1, arr2, true);
	};

	this.array.random = function (arr, args){
		arr 	= typeof arr === 'string' ? utils.toArray(arr) : arr;
		args 	= args || {};

		if (args.min === undefined) args.min = 0;
		if (args.max === undefined) args.max = 0;

		var keys=[];
		for (var i in arr){
			keys.push(i);
		}

		var min = args.min;
		var max = args.max;
		if (!min && !max){
			min = 1;
			max = 1;
		}else if (min && !max){
			max = keys.length;
		}

		// sort randomly the array keys
		keys.sort(function() { return 0.5 - Math.random(); });

		var limit = Math.floor((max - min + 1) * Math.random());
		keys = keys.slice(0, min + limit);

		var list = [];
		for (var i=0, l=keys.length; i<l; ++i){
			var key 	= keys[i];
			var value 	= arr[key];
			list.push(value);
		}

		return !args.min && !args.max ? list[0] : list;
	};

	this.array.shuffle = function (arr){
		var j, x, i;
	    for (i = arr.length; i; i--) {
	        j = Math.floor(Math.random() * i);
	        x = arr[i - 1];
	        arr[i - 1] = arr[j];
	        arr[j] = x;
	    }
		return arr;
	};

	this.array.repeat = function (value, count){
		var arr = [];
		for (var i=0, l=count; i<l; ++i){
			arr.push(value);
		}
		return arr;
	};

	this.array.create = function (count, callback){
		var arr = [];
		for (var i=0; i<count; ++i){
			var value = i + 1;
			if (typeof callback === 'function'){
				value = callback(value, i);
			}
			arr.push(value);
		}
		return arr;
	}

	this.array.sort = function (arr, orderBy, args){
		if (!(arr instanceof Array) || !arr.length) return arr;

		args = args || {};

		if (args.copy === undefined) args.copy = false;
		if (args.get === undefined)  args.get = null;

		if (args.copy){
			arr = utils.array.clone(arr);
		}

		if (typeof orderBy == 'string' && ~orderBy.indexOf(',')){
			orderBy = orderBy.split(',');
		}else if (typeof orderBy == 'string' || !(orderBy instanceof Array)){
			orderBy = [orderBy];
		}

		// check if it's numbers/string
		if (typeof arr[0] === 'number'){
			arr.sort(function (a, b){
				return a - b;
			});

			if (orderBy[0] === 'DESC'){
				arr.reverse();
			}

			return arr;
		}else if (typeof arr[0] === 'string'){
			arr.sort();

			if (orderBy[0] === 'DESC'){
				arr.reverse();
			}

			return arr;
		}

		// it's object
		var	keys 		= [];
		var directions 	= [];

		for (var i=0, l=orderBy.length; i<l; ++i){
			var value 	= orderBy[i].toString().split(':');
			var	key 	= value[0];
			var	dir 	= (value[1] || 'ASC').toUpperCase();

			// make sure it's ASC or DESC
			if (dir !== 'ASC' && dir !== 'DESC'){
				dir = 'ASC';
			}

			keys.push(key);
			directions.push(dir);

			delete value;
			delete key;
			delete dir;
		}

		var sort = function (a, b){
			var compare = null;

			// the data is located elsewhere (different source)
			if (typeof args.get === 'function'){
				a = args.get.call(a, a);
				b = args.get.call(b, b);
			}

			for (var i in keys){
				var key 		= keys[i];
				var direction	= directions[i];
				var valueA		= a[key] == null || a[key] == undefined ? '' : a[key];
				var valueB		= b[key] == null || b[key] == undefined ? '' : b[key];

				// same exact value OR already found an order
				if (valueA === valueB || compare !== null){
					continue;
				}

				// one of the attribute is missing
				if (a[key] == undefined || b[key] == undefined){
					compare = a[key] == undefined ? 1 : -1;
					continue;
				}

				// check for number
				var numberA = parseFloat(valueA);
				var	numberB = parseFloat(valueB);

				if (!isNaN(numberA)){
					valueA = numberA;
					valueB = numberB;
				}

				// both value are not the same type... actually not good
				//if (typeof valueA !== typeof valueB) continue;

				if (!isFinite(valueA) || !isFinite(valueB)){
					compare = (valueA > valueB ? 1 : -1) * (direction === 'DESC' ? -1 : 1);
				}else if (typeof valueA == 'number'){
					compare = direction == 'DESC' ? valueB - valueA : valueA - valueB;
				}else if (valueA > valueB){
					compare = direction == 'DESC' ? -1 : 1;
				}else if (valueA < valueB){
					compare = direction == 'DESC' ? 1 : -1;
				}else{
					compare = 0;
				}

				if (isNaN(compare)){
					compare = 0;
				}
			}

			if (compare === 0){
				compare = a > b;
			}

			return compare;
		}

		return arr.sort(sort);
	};

	this.array.group = function (arr, args){
		args 			= args === undefined ? {} : args;
		args.groupKey 	= 'groupKey' in args ? args.groupKey : null;
		args.childKey 	= 'childKey' in args ? args.childKey : null;
		args.callback 	= 'callback' in args ? args.callback : null;

		var list = {};
		for (var i in arr){
			var item   = arr[i];
			var key    = item[args.groupKey];
			var parent = list[key];

			if (!parent){
				parent = typeof args.callback === 'function' ? args.callback(item, i) : item;
				list[key] = parent;
			}

			if (!parent[args.childKey]){
				parent[args.childKey] = [];
			}

			parent[args.childKey].push(item);
		}

		return list;
	}

	this.array.to4Values = function (arr, args){
		args = args || {};
		if (args.separator === undefined) 	args.separator 	= null;
		if (args.format === undefined) 		args.format 	= utils.fn.empty;
		if (args.fallback === undefined) 	args.fallback 	= null;

		function _get (options){
			var value = utils.defined(options);

			if (typeof args.format === 'function'){
				value = args.format(value);
			}
			if (utils.isInvalid(value)){
				value = args.fallback;
			}

			return value;
		}

		// find the separator
		if (typeof arr === 'string' && args.separator === null){
			if (~arr.indexOf(';')) 		args.separator = ';';
			else if (~arr.indexOf(',')) args.separator = ',';
			else 						args.separator = ' ';
		}

		arr = utils.toArray(arr, args.separator);

		return [
			_get([arr[0]]),
			_get([arr[1], arr[0]]),
			_get([arr[2], arr[0]]),
			_get([arr[3], arr[1], arr[0]])
		]
	};

	this.array.to2Values = function (arr, args){
		arr = utils.array.to4Values(arr, args);
		return arr.slice(0,2);
	};

	this.array.to4Numbers = function (arr, args){
		args 			= args || {};
		args.format 	= parseFloat;
		args.fallback	= 'fallback' in args ? args.fallback : 0;
		return utils.array.to4Values(arr, args);
	};

	this.array.to2Numbers = function (arr, args){
		args 			= args || {};
		args.format 	= parseFloat;
		args.fallback	= 'fallback' in args ? args.fallback : 0;
		return utils.array.to2Values(arr, args);
	};

	this.array.toChars = function (arr, args){
		if (typeof arr === 'string'){
			return arr;
		}

		args = args || {};
		if (args.exclude === undefined) 	args.exclude = null;
		if (args.include === undefined) 	args.include = null;
		if (args.fallback === undefined) 	args.fallback = ' '; // space

		for (var i=0, l=arr.length; i<l; ++i){
			var code  = Math.floor(arr[i]);
			var value = String.fromCharCode(code);

			if (
				(args.exclude && ~args.exclude.indexOf(value)) ||
				(args.include && !~args.include.indexOf(value))
			){
				value = args.fallback;
			}

			arr[i] = value;
		}

		return arr.join('');
	};

	this.array.toKeys = function (arr, defaults){
		defaults = defaults === undefined ? true : defaults;

		var obj = {};
		for (var i in arr){
			obj[arr[i]] = defaults;
		}

		return obj;
	};

	// date --------------------------------------------------------------------
	var DATE = {
		RE : {
			UPDATE 		: /(?:(?:(\+|\-)(\d+)|(first|last))\s?([a-z]+))/g,
			IN_ATTRS 	: /(year|month|day|hour|minute|min|second|sec|millisecond|Y{1,4}|M{1,4}|D{1,4}|h{1,2}|m{1,2}|s{1,2}|ms)/g,
			OUT_ATTRS 	: /(year|month|day|hour|minute|min|second|sec|millisecond|YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|HH|hh|H|h|mm|m|ss|s|ms|A|a)/g,
		},
		MINUTE_IN_SECONDS 	: 60,
		HOUR_IN_SECONDS 	: 60 * 60,
		DAY_IN_SECONDS 		: 60 * 60 * 24,
		WEEK_IN_SECONDS 	: 60 * 60 * 24 * 7,
		MONTH_IN_SECONDS 	: 60 * 60 * 24 * 30,
		YEAR_IN_SECONDS 	: 60 * 60 * 24 * 365,
		// props ---------------------------------------------------------------
		locales : {},
		addLocale:function (lang, strings){
			var locale = this.locales[lang] || (this.locales[lang] = {});
			utils.extend(locale, strings);
		},
	};

	DATE.addLocale('en', {
		'month_long'	: 'January,February,March,April,May,June,July,August,September,October,November,December'.split(','),
		'month_short'	: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
		'weekday_long'	: 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(','),
		'weekday_short'	: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
		'weekday_narrow': 'S,M,T,W,T,F,S'.split(','),
	});

	DATE.addLocale('fr', {
		'month_long'	: 'janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre'.split(','),
		'month_short'	: 'janv,févr,mars,avr,mai,juin,juil,août,sept,oct,nov,déc'.split(','),
		'weekday_long'	: 'dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi'.split(','),
		'weekday_short'	: 'dim,lun,mar,mer,jeu,ven,sam'.split(','),
		'weekday_narrow': 'd,l,m,m,j,v,s'.split(','),
	});

	this.date = {};

	this.date.locale = function (lang, strings){
		DATE.addLocale(lang, strings);
	};

	this.date.get = function (date, args){
		args 			= (typeof args === 'string' ? {'update':args} : args) || {};
		args.update 	= 'update' in args ? args.update : null;
		args.input 		= 'input' in args ? args.input : null;
		args.output 	= 'output' in args ? args.output : null;
		args.time 		= 'time' in args ? args.time : true;
		args.locale 	= 'locale' in args ? args.locale : null;

		var locales 	= args.locale in DATE.locales ? DATE.locales[args.locale] : DATE.locales.en;

		// split the update if it's in the date variable
		if (typeof date === 'string' && !args.update && date.match(DATE.RE.UPDATE)){
			args.update = date.match(DATE.RE.UPDATE).join(' ');
			date 		= date.replace(DATE.RE.UPDATE, '').trim();
		}

		if (date instanceof Date){
			date = new Date(date.getTime());
		}else if (date === 'now'){
			date = new Date();
		}else if (date === 'today'){
			date = new Date();
			date.setMilliseconds(0);
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
		}else if (typeof date === 'string' && args.input){
			var attrs 	= [];
			var count 	= 0;
			var str 	= date;
			var re 		= args.input;

			utils.string.toRegExp(re, {'return':'string'});
			re = '^' + re.replace(DATE.RE.IN_ATTRS, function (m, $1){
				attrs.push($1.replace(/\s$/, ''));
				return '(.+?)';
			}) + '$';
			re 	 = new RegExp(re);

			date = new Date();
			utils.string.match(str, re, function (number, i){
				var attr = attrs[i];

				if (isNaN(number)){
					var index;
					if (~(index = locales.month_long.indexOf(number))){
						number = index+1;
					}else if (~(index = locales.month_short.indexOf(number))){
						number = index+1;
					}
				}else{
					number = parseFloat(number);
				}

				if (number === null){
					return;
				}

				switch (attr){
					case 'year': case 'YYYY': case 'YY': 						date.setYear(number); break;
					case 'month': case 'MMMM': case 'MMM': case 'MM': case 'M':	date.setMonth(number-1); break;
					case 'day': case 'DDDD': case 'DDD': case 'DD': case 'D':  	date.setDate(number); break;
					case 'hour': case 'hh': case 'h': 							date.setHours(number); break;
					case 'minute': case 'min': case 'mm': case 'm':				date.setMinutes(number); break;
					case 'second': case 'sec': case 'ss': case 's':				date.setSeconds(number); break;
					case 'millisecond': case 'ms' : 							date.setMilliseconds(number); break;
				}
			});
		}else if (typeof date === 'string'){
			date = Date.parse(date);
			date = new Date(date);
		}else if (!isNaN(date)){
			date = new Date(parseFloat(date));
		}

		if (args.time === false){
			date.setMilliseconds(0);
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
		}

		if (args.update){
			var lastOperator = '+';
			utils.string.match(args.update, DATE.RE.UPDATE, function (m, operator, number, relative, attr){
				operator = operator || lastOperator;

				// remove the plural form
				attr = attr.toLowerCase().replace(/s$/, '');

				if (relative === 'first' && attr === 'day'){
					date.setDate(1);
				}else if (relative === 'last' && attr === 'day'){
					date.setMonth(date.getMonth() + 1);
					date.setDate(0);
				}else{
					number = parseFloat(number) * (operator === '-' ? -1 : 1);

					switch (attr){
						case 'year': date.setYear(date.getFullYear() + number); break;
						case 'month': date.setMonth(date.getMonth() + number); break;
						case 'week': date.setDate(number * 7); break;
						case 'day': date.setDate(date.getDate() + number); break;
						case 'hour': date.setHours(date.getHours() + number); break;
						case 'minute': date.setMinutes(date.getMinutes() + number); break;
						case 'second': date.setSeconds(date.getSeconds() + number); break;
					}

					lastOperator = operator;
				}
			});
		}

		// @todo output
		if (args.output){
			var attrs = {
				'YYYY' 	: date.getFullYear(),
				'YY'	: date.getFullYear().toString().slice(2),
				'MMMM'	: locales.month_long[date.getMonth()],
				'MMM'	: locales.month_short[date.getMonth()],
				'MM'	: utils.string.pad(date.getMonth()+1, '0', 2, 'left'),
				'M'		: date.getMonth()+1,
				'DDDD'	: locales.weekday_long[date.getDay()],
				'DDD'	: locales.weekday_short[date.getDay()],
				'D'		: locales.weekday_narrow[date.getDay()],
				'dd'	: utils.string.pad(date.getDate(), '0', 2, 'left'),
				'd'		: date.getDate(),
				'HH'	: utils.string.pad(date.getHours(), '0', 2, 'left'),
				'H'		: date.getHours(),
				'hh'	: utils.string.pad(date.getHours() % 12, '0', 2, 'left'),
				'h'		: date.getHours() % 12,
				'mm'	: utils.string.pad(date.getMinutes(), '0', 2, 'left'),
				'm'		: date.getMinutes(),
				'ss'	: utils.string.pad(date.getSeconds(), '0', 2, 'left'),
				's'		: date.getSeconds(),
				'ms'	: date.getMilliseconds(),
				'A'		: date.getHours() >= 12 ? 'PM' : 'AM',
				'a'		: date.getHours() >= 12 ? 'pm' : 'am',
			};

			// synonyms
			attrs.year 	         = attrs.YYYY;
			attrs.month          = attrs.MMMM;
			attrs.day 	         = attrs.D;
			attrs.weekday 	     = attrs.DDD;
			attrs.hour 	         = attrs.H;
			attrs.minute 	     = attrs.m;
			attrs.min 	         = attrs.m;
			attrs.second 	     = attrs.s;
			attrs.sec 	         = attrs.s;
			attrs.millisecond 	 = attrs.ms;

			if (args.output === true){
				date = attrs;
			}else{
				date = args.output.replace(DATE.RE.OUT_ATTRS, function (m, attr){
					var value = attr;

					if (attr in attrs){
						value = attrs[attr];
					}

					return value;
				});
			}
		}

		return date;
	};

	this.date.is = function (dateA, dateB, args){
		args 		= args || {};
		args.time 	= 'time' in args ? args.time : true;

		if (dateA === 'today' || dateB === 'today'){
			args.time = false;
		}

		if (!dateA || !dateB){
			 return false;
		}

		dateA = utils.date.get(dateA);
		dateB = utils.date.get(dateB);

		if (!args.time){
			dateB.setMilliseconds(0);
			dateA.setSeconds(0);
			dateA.setMinutes(0);
			dateA.setHours(0);

			dateB.setMilliseconds(0);
			dateB.setSeconds(0);
			dateB.setMinutes(0);
			dateB.setHours(0);
		}

		return dateA.getTime() === dateB.getTime();
	};

	this.date.diff = function (dateA, dateB){
		dateA = utils.date.get(dateA);
		dateB = utils.date.get(dateB);

		var timeA 			 = dateA.getTime();
		var timeB 			 = dateB.getTime();
		var milliseconds 	 = timeB - timeA;
		var seconds          = Math.floor(milliseconds / 1000);
		var hours            = Math.floor(seconds / DATE.HOUR_IN_SECONDS);
		var days             = Math.floor(seconds / DATE.DAY_IN_SECONDS);
		var weeks            = Math.floor(seconds / DATE.WEEK_IN_SECONDS);
		var months 	         = Math.floor(seconds / DATE.MONTH_IN_SECONDS);
		var years            = Math.floor(seconds / DATE.YEAR_IN_SECONDS);

		return {
			'milliseconds'	: milliseconds % 1000,
			'seconds'       : seconds % 60,
			'hours'         : hours % 24,
			'days'          : days % 30,
			'weeks'         : weeks % 52,
			'months'        : months % 12,
			'years'         : years % 365,
			'total'			: {
				'milliseconds'	: milliseconds,
				'seconds'       : seconds,
				'hours'         : hours,
				'weeks'         : weeks,
				'days'          : days,
				'months'        : months,
				'years'         : years,
			}
		};
	};

	// functions ---------------------------------------------------------------
	var FN = {
		RE : {
			SUPER     : /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/,		//
			TEXT_VARS : /\[([^!\]]+)\]/g,										// "test [10.1]%" and not "test [!10.1]%"
			NUMBERS   : /(-?[0-9,]*\.?[0-9]+(?:e[-+]?\d+)?)([^, ]+)?/g,			// numbers "-.45px 0 26.0%, 45,00.50$ 50.45"
		}
	};

	this.fn = {};

	this.fn.empty = function (v){ return v; };

	this.fn.prepare = function (){
		var self 		= this;
		var args 		= Array.prototype.slice.call(arguments);
		var callback 	= args.shift();

		return function (){
			var a = Array.prototype.slice.call(arguments);
			return callback.apply(self, args.concat(a));
		};
	};

	this.fn.requestFrame = function (callback, isDouble){
		if (!window.requestFrame){
			window.requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || (function() {
		        var timeLast = 0;
		        return function(fn) {
		            var timeCurrent = (new Date()).getTime();
		            var timeDelta;

		            // Dynamically set the delay on a per-tick basis to more closely match 60fps.
		            // Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671.
		            timeDelta 	= Math.max(0, 16 - (timeCurrent - timeLast));
		            timeLast 	= timeCurrent + timeDelta;

		            return setTimeout(function() {
						fn(timeCurrent + timeDelta);
					}, timeDelta);
		        };
		    })();
		}

		var request = {
			'id' : null,
		};

		if (isDouble){
			// @todo find a way to cancel both
			request.id = window.requestFrame(function (){
				request.id = window.requestFrame(callback);
			});
		}else{
			request.id = window.requestFrame(callback);
		}

		return request;
	};

	this.fn.cancelFrame = function (request){
		if (!request) return;

		if (!window.cancelFrame){
			window.cancelFrame = window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelRequestAnimationFrame || window.mozCancelAnimationFrame || window.oCancelRequestAnimationFrame || window.oCancelAnimationFrame || window.msCancelRequestAnimationFrame || window.msCancelAnimationFrame || function (id){
				return clearTimeout(request.id);
			};
		}
		void window.cancelFrame(request.id);
	};

	this.fn.animate = function (callback, args){
		args 			= (typeof args === 'string' || typeof args === 'number' ? {'duration':args} : args) || {};
		args.frames 	= 'frames' in args ? args.frames : null;
		args.duration 	= utils.string.toDuration('duration' in args ? args.duration : 1000);
		args.easing 	= utils.easings.get('easing' in args ? args.easing : 'linear');
		args.context	= 'context' in args ? args.context : null;
		args.eventType	= 'eventType' in args ? args.eventType : 'object';
		args.fps 		= 'fps' in args ? args.fps : null;

		if (isNaN(args.duration)){
			args.duration = 0;
		}

		var start   	= +new Date();
		var request	 	= null;
		var lastFrame 	= -1;
		var instance 	= {
			'isPlaying'	: false,
			'play'		: play,
			'stop'		: stop,
		};

		if (args.frames){
			args.frames = Math.abs(args.frames) | 0;
		}

		function tick (){
			instance.isPlaying = true;

			var time = +new Date() - start;
			if (args.duration && time > args.duration){
				time = args.duration;
			}

			var ratio = 0;
			var frame = 0;

			// animation by frames
			if (args.frames){
				frame = lastFrame + 1;
				ratio = frame / args.frames;
			// animation by duration
			}else{
				ratio = time / args.duration;
				frame = Math.floor(args.fps ? time / 1000 * args.fps : lastFrame+1);
			}

			if (frame !== lastFrame){
				var r = !isNaN(ratio) ? args.easing(ratio) : 0;
				var a = args.eventType === 'ratio' ? r : {
					'time'	: time,
					'ratio' : r,
					'frame'	: frame,
				};

				var response = callback.call(args.context || instance, a, instance);

				if (response === false){
					instance.isPlaying = false;
				}
			}

			// next frame
			if (instance.isPlaying && (!args.duration || ratio < 1)){
				lastFrame 	= frame;
				request 	= utils.fn.requestFrame(tick);
			}
		}

		function play (){
			instance.isPlaying = true;
			tick();
		}
		function stop (){
			instance.isPlaying = false;
			utils.fn.cancelFrame(request);
		}

		play();

		return instance;
	};

	this.fn.steps = function (steps){

	};

	this.fn.interval = function (callback, args){
		args 			= (typeof args === 'number' ? {'delay':args} : args) || {};
		args.delay		= 'delay' in args ? args.delay : 1000;
		args.context	= 'context' in args ? args.context : null;
		args.now		= 'now' in args ? args.now : false;

		var	timeout = null;
		var ticker = {
			'isStarted'	: false,
			'count'		: 0,
			'delay'		: args.delay,
			'start'		: _start,
			'stop'		: _stop,
		};

		function _start (){
			this.stop();
			_tick.apply(this);
			return this;
		}

		function _stop (resetCount){
			this.isStarted = false;

			if (resetCount){
				this.count = 0;
			}

			clearTimeout(timeout);

			return this;
		}

		function _tick (){
			ticker.isStarted = true;
			timeout = setTimeout(function (){
				callback.apply(args.context, [ticker.count]);

				// @info maybe the callback cancel the next tick
				if (ticker.isStarted){
					ticker.count++;
					_tick.apply(ticker);
				}
			}, ticker.delay);
		}

		if (args.now){
			ticker.start();
		}

		return ticker;
	};

	this.fn.debounce = function (args, callback){
		if (typeof args === 'function'){
			callback = args;
			args     = {};
		}

		args = args || {};

		if (args.context === undefined) args.context = null;
		if (args.wait === undefined) 	args.wait = 300;
		if (args.now === undefined) 	args.now = false;

		var timeout = null;
		var wait    = false;

		return function (){
			var a = arguments;

			if (args.now && !wait){
				callback.apply(args.context, a);
			}

			wait = true;
			clearTimeout(timeout);
			timeout = setTimeout(function (){
				if (!args.now){
					callback.apply(args.context, a);
				}
				wait = false;
			}, args.wait);
		};
	};

	this.fn.throttle = function (args, callback){
		if (typeof args === 'function'){
			callback = args;
			args     = {};
		}

		args = args || {};

		if (args.context === undefined) args.context = null;
		if (args.wait === undefined) 	args.wait = 300;
		if (args.now === undefined) 	args.now = false;
		/*
		if (args.leading === undefined) 	args.leading = true;
		if (args.trailing === undefined) 	args.trailing = true;
		*/

		var timeout = null;
		var wait    = false;

		/*

		var isBusy 			= false;
		var isFirst			= true;
		var trailingTimeout	= null;

		return function (){
			var a = arguments;

			if (args.trailing){
				clearTimeout(trailingTimeout);
				trailingTimeout = setTimeout(function (){
					callback.apply(null, a);
					isFirst = true;
				}, time);
			}

			if (isBusy) return;

			setTimeout(function (){
				isBusy = false;
			}, time);

			if (args.leading || !isFirst){
				callback.apply(null, a);
			}

			isBusy 	= true;
			isFirst = false;
		};
		*/
	};

	this.fn.sync = this.fn.regulate = function (args){
		if (typeof args === 'function'){
			args = {'onChange':args};
		}

		args = args || {};
		if (args.context === undefined) 	args.context = null;
		if (args.debounce === undefined) 	args.debounce = 300;
		if (args.throttle === undefined) 	args.throttle = 300;
		if (args.format === undefined)		args.format = null;

		if (args.onStart === undefined)		args.onStart = null;
		if (args.onChange === undefined)	args.onChange = null;
		if (args.onEnd === undefined)		args.onEnd = null;

		var timeout        = null;
		var wait 	       = false;
		var hasStarted     = false;
		var startData      = null;

		var callback = function (data){
			if (typeof args.format === 'function'){
				var response = args.format.call(args.context || this, data, startData);
				if (response !== undefined){
					data = response;
				}
			}

			if (!hasStarted && typeof args.onStart === 'function'){
				if (typeof data === 'object'){
					data.isStart = true;
					data.isEnd 	 = false;
				}
				startData = data;
				args.onStart.call(args.context, data);
			}

			if (!wait && typeof args.onChange === 'function'){
				if (typeof data === 'object'){
					data.isStart = false;
					data.isEnd 	 = false;
				}

				args.onChange.call(args.context, data);
				wait = true;

				// requestAnimationFrame
				if (args.throttle === true){
					utils.fn.requestFrame(function (){ wait = false; });
				// timeout
				}else if (typeof args.throttle === 'number'){
					setTimeout(function (){ wait = false; }, args.throttle);
				// all the time
				}else{
					wait = false;
				}
			}

			hasStarted = true;
			clearTimeout(timeout);
			timeout = setTimeout(function (){
				if (typeof data === 'object'){
					data.isStart = false;
					data.isEnd 	 = true;
				}

				hasStarted = false;
				startData  = null;

				if (typeof args.onEnd === 'function'){
					args.onEnd.call(args.context, data);
				}
			}, args.debounce);
		};

		//callback.stop =

		return callback;
	}

	this.fn.bindContext = function (args){
		var self 	= {'items':[]};
		var props 	= utils.toArray(args.props);
		var create 	= typeof args.create === 'function' ? args.create : null;

		self.get = function (args){
			var filter = {
				'callback'	: args.callback || null,
				'context'   : args.context || null,
			};

			// add custom properties
			for (var i=0, l=props.length; i<l; ++i){
				var key = props[i];
				filter[key] = args[key] || null;
			}

			var item = utils.array.get(this.items, filter);
			if (!item){
				item = filter;

				if (create){
					item.args = args;
					item.bind = create.call(item, args);
				}

				if (typeof item.bind !== 'function'){
					  item.bind = item.callback.bind(item.context);
				}

				this.items.push(item);
			}

			return item;
		};

		self.exists = function (filter){
			return !!utils.array.get(this.items, filter);
		};

		self.remove = function (filter){
			return utils.array.remove(this.items, filter);
		};

		return self;
	};

	this.fn.all = function (callbacks, context, args){
		if (!(callbacks instanceof Array)){
			callbacks = [callbacks];
		}
		for (var i=0, l=callbacks.length; i<l; ++i){
			var callback = callbacks[i];
			if (typeof callback === 'function'){
				callback.apply(context, args);
			}
		}
	};

	/*
	this.fn.queue = function (args){
		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		args.onComplete = 'onComplete' in args ? args.onComplete : utils.fn.empty;
		args.context 	= 'context' in args ? args.context : null;
		args.now 		= 'now' in args ? args.now : false;

		var self       = {};
		var items      = [];
		var isChecking = false;

		function _done (item){
			item.status = 'loading';

			return function (){
				item.response = utils.toArray(arguments);
				item.status   = 'loaded';

				if (isChecking){
					self.check();
				}
			};
		}

		self.add = self.push = function (item){
			if (typeof item === 'function'){
				item = {'callback':item};
			}

			item.index 		  = items.length;
			item.callback     = 'callback' in item ? item.callback : utils.gn.empty;
			item.delay        = utils.string.toDuration(item.delay);
			item.status 	  = '';
			item.response     = null;
			items[item.index] = item;

			return _done(item);
		};

		self.check = function (){
			isChecking = true;

			var response = [];
			for (var i=0, l=items.length; i<l; ++i){
				var item = items[i];

				if (item.status === 'loaded'){
					response.push(item.response);
				}
			}

			if (response.length === items.length){
				args.onComplete.call(args.context || self, response);
			}
		};

		self.items = items;

		if (args.now){
			self.check();
		}

		return self;
	};
	*/

	this.fn.queue = function (args){
		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		args.onComplete = 'onComplete' in args ? args.onComplete : utils.fn.empty;
		args.context 	= 'context' in args ? args.context : null;
		args.now 		= 'now' in args ? args.now : false;

		var self       = {};
		var items      = [];
		var isChecking = false;
		var lastDelay  = 0;

		self.add = function (item){
			item 			= (typeof item === 'function' ? {'callback':item} : item) || {};
			item.index 		= items.length;
			item.delay 		= lastDelay + utils.string.toDuration(item.delay);
			item.callback	= 'callback' in item ? item.callback : null;
			item.response 	= null;
			item.status 	= '';

			item.start = function (){
				if (item.status) return;

				item.status = 'loading';

				if (item.callback && item.delay){
					setTimeout(function (){
						item.callback.apply(args.context, [item.done]);
					}, item.delay);
				}else if (item.callback){
					item.callback.apply(args.context, [item.done]);
				}
			};

			item.done = function (){
				item.start();

				item.response 	= utils.toArray(arguments);
				item.status 	= 'loaded';

				if (!isChecking){
					self.check();
				}
			}

			items.push(item);

			lastDelay = item.delay;

			return item.done;
		};

		self.check = function (){
			isChecking = true;

			var response = [];
			for (var i=0, l=items.length; i<l; ++i){
				var item = items[i];
				item.start();

				if (item.status === 'loaded'){
					response.push(item.response);
				}
			}

			isChecking = false;

			if (response.length === items.length){
				args.onComplete.call(args.context || self, response);
			}
		};

		self.items = items;

		if (args.now){
			self.check();
		}

		return self;
	};

	this.fn.super = function (callback, superCallback, name){
		if (name === undefined){
			name = '_super';
		}

		if (typeof callback === 'function' && typeof superCallback === 'function' && FN.RE.SUPER.test(callback)){
			return function (){
				var old = this._super;

				// gotta fix the bug with infinite loop of _super();
				this[name] = superCallback;
				var response = callback.apply(this, arguments);
				this[name] = old;

				return response;
			}
		}else{
			return callback;
		}
	};

	this.fn.databank = function (obj, context){
		var callback = function (key, value){
			var set = utils.toSetterObject(key, value);

			if (set){
				utils.object.merge(callback, set);
				return context || this;
			}else if (key){
				return callback[key];
			}else{
				return utils.object.clone(callback);
			}
		};

		callback(obj);

		return callback;
	};

	this.fn.frames = function (args, values){
		if (arguments.length <= 1){
			values = args;
			args   = {};
		}

		args 			= (typeof args === 'number' ? {'speed':args} : args) || {};
		args.move 		= 'move' in args ? args.move : 0.5;									// move by pixel
		args.speed 		= 'speed' in args ? args.speed : 0;									// move by ratio speed
		args.duration 	= 'duration' in args ? utils.string.toDuration(args.duration) : 0;	// move by duration
		args.frames 	= parseInt('frames' in args ? args.frames : 0, 10);					// move by frames (using the from/to)

		// used with frames
		args.loop 		= 'loop' in args ? args.loop : false;
		args.boomerang 	= 'boomerang' in args ? args.boomerang : false;
		args.easing 	= utils.easings.get('easing' in args ? args.easing : 'swing');

		// @todo add a time based frames
		args.debug 		= 'debug' in args ? args.debug : false;

		// limit the
		if (args.speed > 1){
			args.speed = 1;
		}else if (args.speed < 0){
			args.speed = 0;
		}

		var isDone 	  = false;
		var isReverse = false;

		var from 	  = args.frames ? utils.extend({}, values) : values;
		var to 		  = {};
		var item 	  = {};

		var count 	  = 0;
		var start 	  = null;
		var now 	  = null;
		var time 	  = null;

		var generate  = null;

		function _set (fData, tData){
			if (tData === undefined){
				tData = fData;
				fData = null;
			}

			// mean the data will be automatically regereated when isDone
			if (typeof tData === 'function'){
				generate = tData;
			}

			isDone	= false;
			count 	= 0;

			if (fData){
				values 	= fData;
				from 	= utils.extend({}, fData);
			}else{
				from 	= args.frames ? utils.extend({}, values) : values;
			}

			from 	= fData ? fData : (args.frames || args.duration ? utils.extend({}, values) : values);
			to  	= generate ? generate() : tData;

			return this;
		}

		function _get (ratio){
			if (!args.frames && (ratio === false || isDone)){
				return values;
			}

			if (ratio === undefined && args.speed){
				ratio = args.speed;
			}else if (ratio === undefined && args.frames){
				ratio = count / args.frames;

				if (ratio >= 1 && args.loop){
					count = 0;
					ratio = 0;

					if (generate){
						_set(generate);
					}

					if (args.boomerang){
						isReverse = !isReverse;
					}
				}else{
					count++;
				}

				if (isReverse){
					ratio = 1 - ratio;
				}

				// start/end
				if (ratio <= 0){
					return from;
				}else if (ratio >= 1){
					return to;
				}
			}else if (ratio === undefined && args.duration){
				now   = +new Date();
				start = start !== null ? start : now;
				time  = (now - start);

				if (time > args.duration && args.loop){
					start = +new Date();
					time  = 0;

					if (generate){
						_set(generate);
					}

					if (args.boomerang){
						isReverse = !isReverse;
					}
				}

				ratio = time / args.duration;

				if (isReverse){
					ratio = 1 - ratio;
				}

				// start/end
				if (ratio <= 0){
					return from;
				}else if (ratio >= 1){
					return to;
				}
			}else if (ratio === undefined){
				ratio = args.move;
			}

			var isChanged = false;
			for (var i in from){
				var fromValue 	= from[i];
				var toValue 	= i in to ? to[i] : fromValue[i];
				var value 		= null;

				// no to-value
				if (toValue === undefined){
					value = fromValue;
				// frames ratio
				}else if (args.frames){
					var r = args.easing(ratio);
					value = fromValue + ((toValue - fromValue) * r);
				// speed ratio
				}else if (args.speed){
					var diff = ((toValue - fromValue) * ratio);
					var move = Math.abs(toValue - fromValue) < args.speed ? (toValue - fromValue) : diff;
					value = fromValue + move;
				// duration ratio
				}else if (args.duration){
					var r = args.easing(ratio);
					value = fromValue + ((toValue - fromValue) * r);

				// move ratio
				}else{
					var diff = toValue - fromValue;
					var aDiff= Math.abs(diff);
					var move = aDiff < args.move ? aDiff : args.move;
					value = fromValue + move * (diff < 0 ? -1 : 1);
				}

				// skip this value change
				if (value !== values[i]){
					isChanged = true;
				}

				values[i] = value;
			}

			if (!isChanged){
				isDone = true;
			}

			return values;
		}

		function _update (a){
			for (var i in a){
				args[i] = a[i];
			}
			return this;
		}

		function _ratio (){
			return isDone ? 1 : count / args.frames;
		}

		item = {
			'set' 	: _set,
			'get' 	: _get,
			'ratio' : _ratio,
			'update': _update,
		};

		return item;
	};

	this.fn.tweener = function (start, end, args){
		args          = args || {};
		args.get      = 'get' in args ? args.get : utils.fn.empty;
		args.set      = 'set' in args ? args.set : utils.fn.empty;
		args.type     = 'type' in args ? args.type : null;
		args.match    = 'match' in args ? args.match : FN.RE.TEXT_VARS;
		args.easing   = utils.easings.get('easing' in args ? args.easing : null);
		args.decimals = 'decimals' in args ? args.decimals : null;
		args.keepWrap = 'keepWrap' in args ? args.keepWrap : false;

		// try to detect the type
		var from     = args.get(start);
		var to       = args.get(end);
		var tween    = null;

		var decimals = args.decimals;
		var values 	 = [];
		var template = '';
		var wrap 	 = null;
		var i 		 = 0;

		// make sure from and to aren't null/undefined
		from = from !== null && from !== undefined ? from : '';
		to 	 = to !== null && to !== undefined ? to : '';

		if (args.type === null){
			if (from === null && to === null){
				args.type = 'null';
			}else if (typeof from === 'boolean' || typeof to === 'boolean'){
				args.type = 'boolean';
			}else if (!isNaN(from) || !isNaN(to)){
				args.type = 'number';
			}else if (typeof from === 'object' || to === 'object'){
				args.type = 'list';
			}else if (utils.color.is(from) || utils.color.is(to)){
				args.type = 'color';
			}else if (typeof from === 'string' || typeof to === 'string'){
				// variable in text
				if (to.match(args.match)){
					args.type = 'vars';
				}else if (to.match(STRING.RE.PATH_COMMANDS)){
					args.type = 'path';
				}else if (to.match(STRING.RE.POINT_COMMANDS)){
					args.type = 'points';
				}else if (to.match(STRING.RE.NUMBERS)){
					args.type = 'numbers';
				}else{
					args.type = 'string';
				}
				// @todo : letters, money...
			}
		}

		if (args.type === 'number'){
			from     = parseFloat(from) || 0;
			to       = parseFloat(to) || 0;
			tween    = _number;
		}else if (args.type === 'numbers'){
			from 	= from.toString();
			to 		= to.toString();
			values	= [];
			tween 	= _numbers;

			// list of numbers
			i = 0;
			template = from.replace(FN.RE.NUMBERS, function (m, $1, $2){
				var isFinancial = !!~$1.indexOf(',');
				var decimals 	= utils.number.decimals($1);
				var number 	 	= parseFloat($1.replace(/[^0-9.-]/g, ''));
				values[i] = {'from':number, 'to':number, 'unit':$2, 'decimals':decimals, 'financial':isFinancial};

				return '@@' + (i++) + '@@';
			});

			i = 0;
			to.replace(FN.RE.NUMBERS, function (m, $1, $2){
				var isFinancial = !!~$1.indexOf(',');
				var decimals 	= utils.number.decimals($1);
				var number 	 	= parseFloat($1.replace(/[^0-9.-]/g, ''));
				var item     	= values[i++];

				item.to 	    = number;
				item.unit 	    = item.unit || $2 || '';
				item.decimals	= Math.max(item.decimals, decimals);
				item.financial	= item.financial || isFinancial;
			});
		}else if (args.type === 'string' && (!isNaN(from) || !isNaN(to))){
			var f 	 = utils.number.decimals(from);
			var t 	 = utils.number.decimals(to);

			decimals = Math.max(f, t);
			from     = parseFloat(from);
			to       = parseFloat(to);
			tween    = _number;
		}else if (args.type === 'vars'){
			from 	= from.toString();
			to 		= to.toString();
			template= to;
			wrap 	= null;
			values	= [];
			tween  	= _text;

			// @todo detect types of numbers (financials with separator like " " or ",")

			i = 0;
			from = from.replace(args.match, function (m, $1){
				var decimals = utils.number.decimals($1);
				var number 	 = parseFloat($1);

				values[i++]  = {'from':number, 'to':number, 'decimals':decimals};

				return $1;
			});
			to = to.replace(args.match, '$1');

			if (!args.keepWrap){
				start = from;
				end   = to;
			}

			i = 0;
			template = template.replace(args.match, function (m, $1){
				var decimals = utils.number.decimals($1);
				var number 	 = parseFloat($1);
				var item 	 = values[i];

				item.to 		= number;
				item.decimals	= Math.max(item.decimals, decimals);
				wrap 			= m.replace($1, '?');

				return '@@' + (i++) + '@@';
			});
		}else if (args.type === 'color'){
			from   = utils.color.toRgbArray(from);
			to     = utils.color.toRgbArray(to);
			tween  = _color;
		}else if (args.type === 'list'){
			from  = from || [];
			to 	  = to || [];
			tween = _list;
		}else if (args.type === 'path'){
			from  = utils.string.toSvgPath(from);
			to 	  = utils.string.toSvgPath(to);
			tween = _path;
		}else if (args.type === 'points'){
			from  = utils.string.toSvgPoints(from);
			to 	  = utils.string.toSvgPoints(to);
			// make sure there's the same amount of points
			tween = _points;
		}else{
			tween = _bool;
		}

		function _ (a, b, ratio){
			return utils.math.ratio(a, b, ratio);
		}
		function _number (ratio){
			var value = _(from, to, ratio);

			if (decimals !== null){
				value = value.toFixed(decimals);
			}

			return value;
		}
		function _numbers (ratio){
			var text = template.toString();

			for (var i=0, l=values.length; i<l; ++i){
				var item 	= values[i];
				var value 	= _(item.from, item.to, ratio);

				if (item.financial){
					value = utils.number.format(value, {'decimals':item.decimals});
				}else{
					value = value.toFixed(item.decimals);
				}

				value += item.unit;
				text = text.replace('@@'+i+'@@', value);
			}

			return text;
		}
		function _text (ratio){
			var tValues = [];
			var text 	= template.toString();

			for (var i=0, l=values.length; i<l; ++i){
				var item  = values[i];
				var value = _(item.from, item.to, ratio).toFixed(item.decimals);

				if (args.keepWrap){
					text = text.replace('@@'+i+'@@', wrap.replace('?', value));
				}else{
					text = text.replace('@@'+i+'@@', value);
				}
			}

			return text;
		}
		function _bool (ratio){
			return ratio < 0.5 ? from : to;
		}
		function _list (ratio){
			var items = to instanceof Array ? [] : {};

			for (var i in to){
				var fromItem = from[i];
				var toItem   = to[i];
				var item 	 = toItem;

				// list of values
				if (fromItem === undefined){
					fromItem = toItem;
				}else if (typeof toItem === 'object'){
					item = toItem instanceof Array ? [] : {};

					for (var key in toItem){
						var fromValue = fromItem[key];
						var toValue   = toItem[key];
						var value 	  = toValue;

						// @todo limit the decimals

						if (!isNaN(fromValue) && !isNaN(toValue)){
							value = _(fromValue, toValue, ratio);
						}else if (ratio < 0.5){
							value = fromValue;
						}

						item[key] = value;
					}
				// simple value
				}else if (!isNaN(fromItem) && !isNaN(toItem)){
					item = _(fromItem, toItem, ratio);
				// can't tween value
				}else if (ratio < 0.5){
					item = fromItem;
				}

				items[i] = item;
			}

			return items;
		}
		function _color (ratio){
			var r 		= _(from[0], to[0], ratio) | 0;
			var g 		= _(from[1], to[1], ratio) | 0;
			var b 		= _(from[2], to[2], ratio) | 0;
			var a 		= to[3] !== undefined && from[3] !== undefined ? _(from[3], to[3], ratio) : 1;
			var color 	= utils.color.toRgb([r,g,b,a]);
			return color;
		}
		function _path (ratio){
			var items = _list(ratio);

			for (var i=0, l=items.length; i<l; ++i){
				var values = items[i];
				items[i] = values[0] + ' ' + values.slice(1).join(',');
			}

			return items.join(' ');
		}
		function _points (ratio){
			var items = _list(ratio);

			for (var i=0, l=items.length; i<l; ++i){
				items[i] = items[i].join(',');
			}

			return items.join(' ');
		}

		function _get (ratio){
			var value = null;

			if (ratio === 0){
				value = start;
			}else if (ratio === 1){
				value = end;
			}else{
				ratio = args.easing(ratio);
				value = tween(ratio);
			}

			value = args.set(value);

			return value;
		}

		return {
			'from'	: from,
			'to'	: to,
			'get'	: _get,
			'type'	: args.type,
		}
	};

	this.fn.while = function (args, callback){
		if (typeof args === 'function' || typeof args === 'number'){
			args = {'condition':args};
		}else{
			args = args || {};
		}
		args.condition 	= 'condition' in args ? args.condition : true;
		args.limit 		= 'limit' in args ? args.limit : 999;
		args.context 	= 'context' in args ? args.context : null;

		var success = 0;
		var error   = 0;

		if (typeof args.condition === 'number'){
			var count = args.condition;
			args.condition = function (){
				return success < count;
			}
		}

		while (error < args.limit && args.condition()){
			var response = callback.call(args.context, success, error);
			if (response === false){
				error++;
			}else{
				success++;
			}
		}

		return error;
	};

	// colors ------------------------------------------------------------------
	var COLOR = {
		RE : {
			HEX : /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
			RGB : /rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:,([\d.]+))?\)/,
		},
		NAMES : {
			"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
			"beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2",
			"brown":"#a52a2a","burlywood":"#deb887","cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50",
			"cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff","darkblue":"#00008b","darkcyan":"#008b8b",
			"darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b",
			"darkolivegreen":"#556b2f","darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a",
			"darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1","darkviolet":"#9400d3",
			"deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff","firebrick":"#b22222",
			"floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff","gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700",
			"goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f","honeydew":"#f0fff0","hotpink":"#ff69b4",
			"indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c","lavender":"#e6e6fa","lavenderblush":"#fff0f5",
			"lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff",
			"lightgoldenrodyellow":"#fafad2","lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a",
			"lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de","lightyellow":"#ffffe0",
			"lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6","magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa",
			"mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
			"mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa",
			"mistyrose":"#ffe4e1","moccasin":"#ffe4b5","navajowhite":"#ffdead","navy":"#000080","oldlace":"#fdf5e6","olive":"#808000",
			"olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6","palegoldenrod":"#eee8aa","palegreen":"#98fb98",
			"paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb",
			"plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
			"saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d",
			"silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f",
			"steelblue":"#4682b4","tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0","violet":"#ee82ee",
			"wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5","yellow":"#ffff00","yellowgreen":"#9acd32"
		},
	};

	this.color = {};

	this.color.type = function (color){
		var type = null;

		if (typeof color === 'string' && (color.trim().toLowerCase() in COLOR.NAMES)){
			type = 'name';
		}else if (typeof color === 'string' && color.match(COLOR.RE.RGB)){
			type = 'rgb';
		}else if (typeof color === 'string' && color.match(COLOR.RE.HEX)){
			type = 'hex';
		}else if (color instanceof Array){
			type = 'rgbArray';
		}else if (typeof color === 'object' && (color.r !== undefined && color.g !== undefined && color.b !== undefined)){
			type = 'rgbObject';
		}else if (typeof color === 'object' && (color.h !== undefined && color.s !== undefined && color.v !== undefined)){
			type = 'hsvObject';
		}

		return type;
	};

	this.color.is = function (color){
		return utils.color.type(color) !== null;
	};

	this.color.random = function (){
		var letters = '0123456789ABCDEF'.split('');
		var color 	= '#';

		for (var i = 0; i < 6; i++){
			color += letters[Math.floor(Math.random() * 16)];
		}

		return color;
	};

	this.color.lighten = function (color, percent){
		var type;

		if (color instanceof Array){
			type = 'array';
		}else if (typeof color === 'object'){
			type = 'rgb';
		}else if (typeof color === 'string' && color[0] === '#'){
			type = 'hex';
		}else if (typeof color === 'string' && color.match(COLOR.RE.RGB)){
			type = 'rgb';
		}

		color = utils.color.toRgbArray(color);

		var amt = Math.round(2.55 * (percent*100));
		for (var i=0, l=3; i<l; ++i){
			color[i] += amt;

			if (color[i] < 0){
				color[i] = 0;
			}else if (color[i] > 255){
				color[i] = 255;
			}
		}

		if (type === 'hex'){
			color = utils.color.toHex(color);
		}else if (type === 'rgb'){
			color = utils.color.toRgb(color);
		}

		return color;
	};

	this.color.darken = function (color, percent){
		return utils.color.lighten(color, percent * -1);
	};

	this.color.toHex = function (color, opacity){
		var value;

		if (typeof color === 'string' && color[0] === '#'){
			value = color;
		}else if (typeof color === 'number'){
			value = '#' + utils.string.pad(color.toString(16), '0', 6, 'left');
		}else{
			value = utils.color.toRgbArray(color);
		}

		if (value && opacity !== undefined){
			value = utils.color.toRgbArray(value, opacity);
		}

		if (value instanceof Array){
			var hex = '#';
			for (var i=0, l=value.length; i<l; ++i){
				var code = Math.round(value[i]).toString(16);
				hex += code.length <= 1 ? '0' + code : code;
			}
			value = hex;
		}

		return value;
	};

	this.color.toRgb = function (color, opacity){
		var value;

		if (typeof color === 'string' && color.match(COLOR.RE.RGB)){
			value = color;
		}else if (typeof color === 'number'){
			value = '#' + utils.string.pad(color.toString(16), '0', 6, 'left');
		}else{
			value = utils.color.toRgbArray(color);
		}

		// if opacity is set, turn to array
		if (value && opacity !== undefined){
			value = utils.color.toRgbArray(value, opacity);
		}

		if (value instanceof Array){
			opacity = opacity !== undefined ? opacity : value[3];

			if (!isNaN(opacity) && opacity < 1){
				//opacity = value[3];
				value 	= 'rgba('+value[0]+','+value[1]+','+value[2]+','+(opacity ? opacity.toFixed(2) : 0)+')';
			}else{
				value = 'rgb('+value[0]+','+value[1]+','+value[2]+')';
			}
		}

		return value;
	};

	// @todo
	this.color.toHue = function (color, opacity){
		//
	};

	this.color.toRgbArray = function (color, opacity){
		var value, match;

		if (color instanceof Array){
			value = color;
		// RGB color object
		}else if (typeof color === 'object' && color.r !== undefined && color.g !== undefined && color.b !== undefined){
			value = [color.r, color.g, color.b];
		// HSV color object
		}else if (typeof color === 'object' && color.h !== undefined && color.s !== undefined && color.v !== undefined){
			var r, g, b;
			var i, f, p, q, t;

			i = Math.floor(color.h * 6);
			f = color.h * 6 - i;
			p = color.v * (1 - color.s);
			q = color.v * (1 - f * color.s);
			t = color.v * (1 - (1 - f) * color.s);

			switch (i % 6) {
				case 0: r = color.v, g = t, b = p; break;
				case 1: r = q, g = color.v, b = p; break;
				case 2: r = p, g = color.v, b = t; break;
				case 3: r = p, g = q, b = color.v; break;
				case 4: r = t, g = p, b = color.v; break;
				case 5: r = color.v, g = p, b = q; break;
			}

			r = Math.round(r * 255);
			g = Math.round(g * 255);
			b = Math.round(b * 255);

			value = [r,g,b];
		}else if (typeof color === 'string' && (color.toLowerCase() in COLOR.NAMES || (match = color.match(COLOR.RE.HEX)))){
			if (color.toLowerCase() in COLOR.NAMES){
				color = COLOR.NAMES[color.toLowerCase()];
			}

			color = color.replace('#', '');

			if (color.length < 6){
				color = color.replace(/(.)/g, '$1$1');
			}

			match = color.match(COLOR.RE.HEX);
			var	r = parseInt(color.substring(0,2), 16);
			var	g = parseInt(color.substring(2,4), 16);
			var	b = parseInt(color.substring(4,6), 16);
			var	a = parseInt(color.substring(6,8), 16) / 255;

			// make the A a 0 to 1 values, not 0 to 255

			value = isNaN(a) ? [r,g,b] : [r,g,b,a];
		}else if (typeof color === 'string' && (match = color.match(COLOR.RE.RGB))){
			var	r = parseInt(match[1], 10);
			var	g = parseInt(match[2], 10);
			var	b = parseInt(match[3], 10);
			var	a = parseFloat(match[4]); // * 255;
			value = isNaN(a) ? [r,g,b] : [r,g,b,a];
		}

		if (opacity !== undefined){
			value[3] = opacity;
		}

		// make sure the rbga are whole numbers
		value[0] = Math.round(value[0]);
		value[1] = Math.round(value[1]);
		value[2] = Math.round(value[2]);
		value[3] = value[3] < 0 ? 0 : value[3] > 1 ? 1 : value[3];
		//if (value[3]) value[3] = Math.round(value[3]);

		return value;
	};

	this.color.toHsvArray = function (color){
		var color = utils.color.toRgbArray(color);
		var r = color[0];
		var g = color[1];
		var b = color[2];

	    var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
	    var d = max - min;
	    var h = null;
        var s = (max === 0 ? 0 : d / max);
        var v = max / 255;

	    switch (max) {
	        case min: h = 0; break;
	        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
	        case g: h = (b - r) + d * 2; h /= 6 * d; break;
	        case b: h = (r - g) + d * 4; h /= 6 * d; break;
	    }

	    return [h,s,v];
	};

	// media -------------------------------------------------------------------
	var MEDIA = this._MEDIA = {
		RE : {
			SRC_PATH : /url\(([^\)]+)\)/,
			IMAGE 	 : /\.(jpg|jpeg|gif|png|svg)/g,
		},
		'images' : {},
		'fonts'	 : {},
	};

	this.media = {};

	this.media.preload = function (urls, args){
		urls = utils.toArray(urls);

		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		args.context 	= 'context' in args ? args.context : null;
		args.onLoad 	= 'onLoad' in args ? args.onLoad : utils.fn.empty;
		args.onComplete = 'onComplete' in args ? args.onComplete : utils.fn.empty;

		var count 	= 0;
		var total 	= urls.length;
		var items = [];

		function _onLoad (e){
			var item = {
				'url'	: e.target.responseURL,
				'data'	: e.target.response,
				'status': e.target.status === 200 ? 'loaded' : 'error',
				'type'	: 'file',
			};
			items.push(item);

			args.onLoad.call(args.context, item);

			if (items.length === total){
				args.onComplete.call(args.context, items);
			}
		}

		function _onImageLoad (e){
			items.push(e);

			args.onLoad.call(args.context, e);

			if (items.length === total){
				args.onComplete.call(args.context, items);
			}
		}

		utils.each(urls, function (url){
			if (utils.media.isImage(url)){
				utils.media.getImage(url, _onImageLoad);
			}else{
				var ajax = new XMLHttpRequest();
				ajax.onload = _onLoad;
				ajax.open("GET", url, true);
				ajax.send();
			}
		});
	};

	this.media.speed = function (url, callback){
		// @source https://gist.github.com/debloper/7296289

		// @source check this : https://stackoverflow.com/questions/13988051/checking-someones-bandwidth-and-loading-content-based-on-it

		var start = +new Date();
		var ajax  = new XMLHttpRequest();

		ajax.onreadystatechange = function (){
			if (ajax.readyState !== 4) return;

			if (ajax.status === 200){
				var end   = +new Date();
				var time  = (end - start) / 1000;
				var size  = ajax.responseText.length;
				var speed = (size * 8) / time / 1024;

				callback(speed);
			}else{
				// @error
			}
		};

		ajax.open("GET", url, true);
		ajax.send();
	};

	this.media.isImage = function (src){
		src = utils.media.getImageSrc(src);
		return src.match(MEDIA.RE.IMAGE);
	};

	this.media.getImageSrc = function (src){
		var image = null;
		if (src instanceof Image){
			src = src.getAttribute('src') || '';
		}
		if (typeof src !== 'string'){
			return false;
		}

		src = ~src.indexOf('url(') ? src.match(MEDIA.RE.SRC_PATH)[1] :
			src.match(MEDIA.RE.IMAGE) ? src : '';

		src = utils.string.trim(src);

		// @info an hashtag means a local element
		if (src && src[0] === '#'){
			src = false;
		}

		return src ? src : false;
	};

	this.media.getImage = function (src, args){
		args 			= (typeof args === 'function' ? {'callback':args} : args) || {};
		args.callback 	= ('callback' in args ? args.callback : utils.fn.empty);
		args.context 	= 'context' in args ? args.context : null;

		var image = src instanceof Image ? src : null;
		var qItem = {'callback':args.callback, 'context':args.context, 'image':image};

		src = utils.media.getImageSrc(src);

		// not an image
		if (!src){
			args.callback.call(args.context, null);
			return;
		}

		var item = MEDIA.images[src];
		var isSvg= !!~src.indexOf('.svg');

		if (image){
			image.src = src;
		}

		if (item){
			item.queue.push(qItem);

			if (item.status === 'loaded' || item.status === 'error'){
				_done(true);
			}else{
				return;
			}
		}else{
			var dummy = new Image();

			item = MEDIA.images[src] = {
				'src'    : src,
				'image'	 : dummy,
				'width'  : 0,
				'height' : 0,
				'type'	 : isSvg ? 'svg' : 'img',
				'status' : 'loading',
				'queue'	 : [qItem],
			};

			dummy.onload  	= _load;
			dummy.onerror 	= _error;
			dummy.src 		= src;
		}

		function _load (){
			// @info little fix for IE9 to IE11 with SVG images
			if (!this.width && !this.height){
				document.body.appendChild(this);
				this.width 	= this.offsetWidth;
				this.height = this.offsetHeight;
				document.body.removeChild(this);
			}

			item.width  = this.width;
			item.height = this.height;
			item.status = 'loaded';

			if (isSvg){
				var ajax = new XMLHttpRequest();
				ajax.onload = _ajaxLoad;
				ajax.open("GET", src, true);
				ajax.send();
			}else{
				_done();
			}
		}

		function _ajaxLoad (e){
			var container = document.createElement('div');
			var response  = e.target.responseText;
			var svg 	  = response.substring(response.indexOf('<svg'));

			container.innerHTML = svg;
			item.svg 			= container.children[0];
			item.svgHtml		= svg;
			container.removeChild(item.svg);

			delete(container);

			_done();
		}

		function _error (){
			item.status = 'error';
			_done();
		}

		function _done (isCached){
			var queue  = item.queue;
			item.queue = [];

			utils.each(queue, function (qItem){
				var iItem = item;

				if (qItem.image && item.image !== qItem.image){
					iItem       = utils.object.clone(item);
					iItem.image = qItem.image;
				}

				qItem.callback.call(qItem.context, iItem, !!isCached);
			});
		}

		return item;
	};

	this.media.getImages = function (srcs, args){
		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		args.base 		= 'base' in args ? args.base : '';
		args.context 	= 'context' in args ? args.context : null;
		args.onLoad 	= 'onLoad' in args ? args.onLoad : utils.fn.empty;
		args.onComplete = 'onComplete' in args ? args.onComplete : utils.fn.empty;

		if (srcs instanceof Image){
			srcs = [srcs];
		}else{
			srcs = utils.toArray(srcs);
		}

		var count 	= 0;
		var total 	= srcs.length;
		var images = [];

		for (var i=0, l=srcs.length; i<l; ++i){
			var src = srcs[i];

			src 	= typeof src === 'string' ? args.base + src : src;
			srcs[i] = src;

			utils.media.getImage(src, {'callback':onLoad, 'context':args.context});
		}

		function onLoad (item){
			images.push(item);
			args.onLoad.apply(item, [item]);

			if (images.length >= total){
				args.onComplete(images);
			}
		}

		if (!total){
			args.onComplete([]);
		}
	};

	// @source https://github.com/youbastard/getImageData/blob/master/getimagedata.js
	this.media.getImageData = function (ctx){
		if (typeof ctx === 'object' && (ctx.tagName || '').toLowerCase() === 'canvas'){
			ctx = ctx.getContext('2d');
		}

		var imageWidth  = ctx.canvas.width;
		var imageHeight = ctx.canvas.height;
		var isValid 	= imageWidth && imageHeight && !!ctx.getImageData(0, 0, 1, 1).data;
		var data      	= isValid ? ctx.getImageData(0, 0, imageWidth, imageHeight).data : null;
		var imageData 	= data && data.buffer ? new Uint32Array(data.buffer) : null;

		// bug with IE10
		//console.log(imageData);

		function _rect (x, y, width, height){
			x      = x | 0;
			y      = y | 0;
			width  = width | 0;
			height = height | 0;

			// revert to the old way of getting a rectangle (in IE10, data.buffer is undefined)
			if (!isValid){
				return ctx.getImageData(x, y, width, height).data;
			}

			var arr = new Uint32Array(width * height * 4);
			var i	= 0;
			for (var r=y; r<height+y; r+=1) {
				for (var c=x; c<width+x; c+=1) {
					var xy = ((r*imageWidth) + c);

					if (c<0 || c>=imageWidth || r<0 || r>=imageHeight){
						arr[i++] = 0;
					} else {
						arr[i++] = imageData[xy];
					}
				}
			}

			return arr;
		}

		function _color (x, y){
			var pixel 	= new Uint8Array(_rect(x, y, 1, 1).buffer);
			var rgb 	= ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16);
			var color 	= pixel[3] ? ("#" + ("000000" + rgb).slice(-6)).toUpperCase() : null;
			return color;
		}

		return {
			'data'   : imageData,
			'rect'   : _rect,
			'color'  : _color,
			'width'  : imageWidth,
			'height' : imageHeight,
		}
	};

	// @source http://smnh.me/web-font-loading-detection-without-timers/
	this.media.getFontFace = function (name, args){
		args 			= (typeof args === 'function' ? {'callback':args} : args) || {};
		args.callback 	= 'callback' in args ? args.callback : utils.fn.empty;
		args.context 	= 'context' in args ? args.context : null;
		args.italic 	= 'italic' in args ? args.italic : false;
		args.bold 		= 'bold' in args ? args.bold : false;
		args.timeout 	= utils.string.toDuration('timeout' in args ? args.timeout : '1s');

		var key  = name + (args.italic ? '_italic' : '') + (args.bold ? '_bold' : '');
		var item = MEDIA.fonts[key] || (MEDIA.fonts[key] = {'name':name, 'status':null});

		if (item.status === 'loading'){
			item.callbacks.push(args.callback);
		}else if (item.status === 'loaded' || item.status === 'error'){
			args.callback.apply(args.context, [item, true]);
			return item;
		}else{
			var elements = utils.dom.create('<div style="position:absolute; top:0; left:0; pointer-events:none; opacity:0; overflow:hidden;">\
				<div element="content" style="position:relative; white-space: nowrap; font-family: serif; display:inline-block;">\
					<div element="innerWrapper" style="position:absolute; width:100%; height:100%; overflow:hidden;"><div element="innerContent"></div></div>\
					dummy text\
				</div>\
			</div>', {'extract':'element', 'parent':document.body});

			var width   = elements.content.offsetWidth;
			var height  = elements.content.offsetHeight;
			var time  	= +new Date();
			var timeout = null;

			item.status    = 'loading';
			item.callbacks = [args.callback];

			utils.el.update(elements.self, {'style':{'width':width - 1, 'height':height - 1}, 'props':{
				'scrollLeft': elements.self.scrollWidth - elements.self.clientWidth,
				'scrollTop'	: elements.self.scrollHeight - elements.self.clientHeight,
			}});

			utils.el.update(elements.innerContent, {'style':{'width':width + 1, 'height':height + 1}});

			utils.el.update(elements.innerWrapper, {'props':{
				'scrollLeft' : elements.innerWrapper.scrollWidth - elements.innerWrapper.clientWidth,
				'scrollTop'	 : elements.innerWrapper.scrollHeight - elements.innerWrapper.clientHeight,
			}});

			function _scroll (e){
				if (elements.content.offsetWidth === width && elements.content.offsetHeight === height){
					return;
				}

				item.time 	= (+new Date()) - time;
				item.status = 'loaded';

				_done();
			}

			function _error (){
				item.status = 'error';
				_done();
			}

			function _done (){
				// clear stuff
				clearTimeout(timeout);
				elements.self.removeEventListener('scroll', _scroll);
				elements.innerWrapper.removeEventListener('scroll', _scroll);

				utils.dom.remove(elements.self);

				// do the callbacks
				var callbacks = item.callbacks;
				delete(item.callbacks);

				// loading 2 similar fonts, but with different Italic/Bold seems to bug
				setTimeout(function (){
					utils.fn.all(callbacks, args.context, [item, false]);
				}, 0);
			}

			elements.self.addEventListener('scroll', _scroll);
			elements.innerWrapper.addEventListener('scroll', _scroll);

			elements.content.style.font = (args.italic ? 'italic ' : '') + (args.bold ? 'bold ' : '') + '100px ' + name;

			// add timeout
			if (args.timeout){
				timeout = setTimeout(_error, args.timeout);
			}
		}
	};

	this.media.getFontFaces = function (names, args){
		args 			= (typeof args === 'function' ? {'callback':args} : args) || {};
		args.callback 	= 'callback' in args ? args.callback : utils.fn.empty;
		args.context 	= 'context' in args ? args.context : null;
		args.timeout 	= utils.string.toDuration('timeout' in args ? args.timeout : '1s');

		var queue = utils.fn.queue({
			'context'	: args.context,
			'onComplete': args.callback
		});

		utils.each(names, function (name){
			utils.media.getFontFace(name, {
				'context'	: args.context,
				'timeout'	: args.timeout,
				'callback'	: queue.add()
			});
		});

		queue.check();
	};

	// path --------------------------------------------------------------------
	this.path = {};

	this.path.ratio = function (points, ratio, args){
		args = args || {};
		if (args.defaultPoint === undefined) args.defaultPoint = 'from';	// from, to, both
		if (args.format === undefined) 		 args.format = utils.fn.empty;

		if (ratio === 0){
			return points.slice(0,1);
		}else if (ratio === 1){
			return points;
		}

		var index  = Math.floor((points.length-1) * ratio);
		var from   = points[index];
		var to 	   = points[index + 1];

		ratio  = (points.length-1) * ratio % 1;
		points = points.slice(0, index+1);

		function _get (f, t, r){
			if (typeof f === 'number' && typeof t === 'number'){
				return f + (t - f) * r;
			}else if (args.defaultPoint === 'from' || (args.defaultPoint === 'both' && r < 0.5)){
				return f;
			}else{
				return t; // @todo validate it's the right variable, it was before "v"
			}
		}

		if (ratio){
			var point = null;

			if (typeof from === 'object'){
				var point = from instanceof Array ? [] : {};

				for (var i in from){
					point[i] = _get(from[i], to[i], ratio);
				}
			}else{
				point = _get(from, to, ratio);
			}

			points.push(point);
		}

		return points;
	};

	this.path.format = function (points, args){
		args = args || {};

	};

	// url ---------------------------------------------------------------------
	var URL = {
		RE : {
			HOST 	   : /^(https?:\/\/[^\/]+)(.+)?$/,
			KEY_VALUE  : /(?:([^=&]+?)\=([^=&]+))/g,
		},
		'queries' : {},
	};

	this.url = {};

	this.url.host = function (url){
		return (url || location.href).replace(URL.RE.HOST, '$1');
	};

	this.url.query = function (attr, url, isCached){
		url = url || window.location.href;

		var	query = isCached ? (URL.queries[url] || null) : null;

		if (!query){
			// remove the domain
			query = url.replace(/^.+\?|\#.+$/g, '');

			// split the values
			query = utils.string.match(query, URL.RE.KEY_VALUE, function (match, $1, $2){
				return [$1, utils.string.toValue($2)];
			});

			// namespace the keys
			query = utils.object.namespace(query, {'arraySets':true});

			URL.queries[url] = query;
		}

		if (attr){
			return query[attr];
		}else{
			return query;
		}
	};

	this.url.get = function (url){
		url = url || window.location.href;

		var	base 	= url.replace(/(\?|#).+/, '');
		var	query 	= utils.url.query(null, url);
		var	anchor 	= url.indexOf('#') >= 0 ? url.replace(/[^\#]+\#(.+)$/, '$1') : null;

		return {
			'url'		: base,
			'host'		: base.replace(/^(https?:\/\/[^\/]+)(.+)?$/, '$1'),
			'path' 		: base.replace(/^(https?:\/\/[^\/]+)(.+)?$/, '$2'),
			'query' 	: query,
			'anchor'	: anchor
		};
	};

	this.url.set = function (url, args, merge){
		url  = utils.url.get(url);

		var update 	= utils.extend(merge ? true : false, {}, url, args);
		var	query 	= utils.object.toUrlParams(update.query);

		return update.url + (query ? '?'+query : '') + (update.anchor ? '#'+update.anchor : '');
	};

	// browser -----------------------------------------------------------------
	var BROWSER = {
		name    : null,
		version : -1,
	};

	this.browser = {};

	this.browser.info = function (refresh){
		// Return cached result if available, else get result then cache it.
		if (refresh || !BROWSER.name){
			var ua 		 = navigator.userAgent;
			var match 	 = null;
			var name     = null;
			var version  = 0;

			//"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
			if (match = ua.match(/Firefox\/(\d+(?:\.\d+)?)/)){
				name = 'firefox';
			// Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18
			// Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 OPR/15.0.1147.100
			}else if (match = ua.match(/(?:Opera|OPR)\/(\d+(?:\.\d+)?)/)){
				name = 'opera';
			//"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
			}else if (~ua.indexOf('Trident') && ((match = ua.match(/MSIE\s(\d+(?:\.\d+)?)/)) || (match = ua.match(/rv\:(\d+(?:\.\d+)?)/))) ){
				name = 'ie';
			//"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
			}else if (match = ua.match(/Edge\/(\d+(?:\.\d+)?)/)){
				name = 'edge';
			//"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
			}else if (match = ua.match(/Chrome\/(\d+(?:\.\d+)?)/)){
				name = 'chrome';
			//Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1
			}else if (ua.match(/iP(ad|od|hone)/i) && (match = ua.match(/OS\s(\d+(?:\_\d+)?)/))){
				name = 'ios';
			//Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.2 Safari/605.1.15
			}else if (~ua.indexOf('Safari') && (match = ua.match(/Version\/(\d+(?:\.\d+)?)/))){
				name = 'safari';
			}else{
				name = 'unknown';
			}

			version 		= match ? parseFloat(match[1].replace('_', '.')) : 0;

			BROWSER.name    = name;
			BROWSER.version = version;
		}

		return {
			'name'	 : BROWSER.name,
			'version': BROWSER.version,
		};
	};

	// element -----------------------------------------------------------------
	var DOM = this._DOM = {
		// constants -----------------------------------------------------------
		NAMESPACES : {
			'xlink:href' : 'http://www.w3.org/1999/xlink',
		},
		RE : {
			CSS_NUMBER 		: /((?:^|\s|\()\-?[0-9]+(?:\.[0-9]+(?:e-[0-9]+)?)?(?=\)|\s|$))/g,
			CSS_URL 		: /(?:^|\s)(?!url\(\")([^\s]+(?:(?:\/[^\s]+)|(?:\.[a-z]+)))(?:\s|$)/g,
			DELEGATE_EVENT 	: /([^:]+)\:(.+)/,
			CSS_SELECTOR 	: /(\#[a-z][\w-]+)|(\.[\-a-z][\w-]+)|(\[[^\]]+\])|(\{[^\]]+\})|(\=.+)|([a-z][\w-]+)/gi,
		},
		PX_VALUES : [
			'top','right','bottom','left',
			'height','width','min-height','max-height','min-width','max-width',
			'border','border-top','border-right','border-bottom','border-left','border-top-width', 'border-right-width','border-bottom-width','border-left-width','border-radius',
			'background', 'background-size', 'background-position',
			'margin','margin-top','margin-right','margin-bottom','margin-left',
			'padding','padding-top','padding-right','padding-bottom','padding-left',
			'font-size',
		],
		TRANSFORMS : [
			'translateX', 'translateY', 'translateZ',
			'scale', 'scaleX', 'scaleY', 'scaleZ',
			'rotate', 'rotateX', 'rotateY', 'rotateZ',
			'skewX', 'skewY',
			'perspective', 'perspectiveX', 'perspectiveY',
			'centerX', 'centerY',
		],
		URL_VALUES : [
			'background', 'background-image',
			'border', 'border-image', 'border-left',
			'cursor',
			'list-style',
		],
		ALT_DELEGATE_EVENTS : {
			'mouseenter'  : 'mouseover',
			'mouseleave'  : 'mouseout',
			'pointerenter': 'pointerover',
			'pointerleave': 'pointerout',
		},
		DEFAULT_EVENT_PROPS : [
			'altKey','bubbles','cancelable','changedTouches','ctrlKey','detail','eventPhase','metaKey',
			'pageX','pageY','shiftKey','view','char','charCode','key','keyCode','button','buttons',
			'clientX','clientY','offsetX','offsetY','pointerId','pointerType','screenX','screenY',
			'targetTouches','toElement','touches','data','type',
		],
		// props ---------------------------------------------------------------
		isReady      : false,
		isLoaded     : false,
		readyEvents  : [],
		loadEvents 	 : [],
		events 		 : utils.fn.bindContext({
			'props' :'eventname,delegate',
			'create':function (args){
				var originalEventname 	= args.eventname;
				var hasAlternateEvent	= originalEventname in DOM.ALT_DELEGATE_EVENTS;
				var eventname 			= hasAlternateEvent && args.delegate ? DOM.ALT_DELEGATE_EVENTS[originalEventname] : originalEventname;

				var callback = function (e){
					var target  = e.target;
					var related = e.relatedTarget;

					// find the right delegate target
					if (args.delegate){
						target = utils.dom.closest(target, args.delegate);

						if (!target){
							return;
						// alternate/special delegates
						}else if (hasAlternateEvent && (related === target || target.contains(related))){
							return;
						}else if (!utils.dom.is(target, args.delegate)){
							return;
						}
					}else{
						target = this;
					}

					var event = {
						'originalEvent'				: e,
						'originalTarget'			: e.target,
						'preventDefault'			: function (){ e.preventDefault(); this.isDefaultPrevented = true; },
						'stopPropagation'			: function (){ e.stopPropagation(); this.isPropagationStopped = true; },
						'stopImmediatePropagation' 	: function (){ e.stopImmediatePropagation(); this.isPropagationStopped = true; },
						'target'					: target,
						'data'						: args.data || {},
						'timestamp'					: new Date(),
					};

					utils.object.merge(event, e, DOM.DEFAULT_EVENT_PROPS);

					if (event.pageX !== undefined && event.pageY){
					//	event.cursorX = event.pageX - (window.scrollX || window.pageXOffset || 0);
					//	event.cursorY = event.pageY - (window.scrollY || window.pageYOffset || 0);
					}

					args.callback.call(args.context || target, event);
				};

				callback.eventname = eventname;

				return callback;
			}
		}),
		// functions -----------------------------------------------------------
		ready:function (){
			DOM.isReady = true;
			utils.each(DOM.readyEvents, function (event){
				if (typeof event === 'function'){
					event();
				}
			});
			DOM.readyEvents = [];
		},
		loaded:function (){
			DOM.isLoaded = true;
			utils.each(DOM.loadEvents, function (event){
				if (typeof event === 'function'){
					event();
				}
			});
			DOM.loadEvents = [];
		},
		getEvent:function (args, action){
			args = args || {};

			if (args.callback === undefined) 	args.callback 	= null;
			if (args.context === undefined) 	args.context 	= null;
			if (args.delegate == undefined) 	args.delegate	= null;

			// refresh the eventname if the delegate is in it's name (eg.: .my-class:click)
			if (~args.eventname.indexOf(':')){
				var match = args.eventname.match(DOM.RE.DELEGATE_EVENT);
				args.eventname= match[2];
				args.delegate = match[1];
			}

			var event = DOM.events.get(args);
			if (action === 'remove'){
				event.count--;
			}else{
				event.count = (event.count || 0) + 1;
			}

			// when there's no more element using this binded callback, remove it from the list
			if (!event.count){
				DOM.events.remove(event);
			}

			return event.bind;
		},
		extractCss:function (style, pattern){
			var directions 	= ['top','right','bottom','left'];
			var values 		= [];

			for (var i=0, l=directions.length; i<l; ++i){
				var key 	= pattern.replace('{direction}', directions[i]);
				var value 	= parseFloat(style[key] || 0);
				values.push(value);
			}

			values.vertical 	= values[0] + values[2];
			values.horizontal 	= values[1] + values[3];

			return values;
		},
	};
	this.el  = {};
	this.els = {};
	this.dom = {};

	this.el.add = function (element, position, selector){
		if (selector === undefined){
			selector = position;
			position = 'append';
		}

		var target = utils.dom.get(selector);
		if (!target) return;

		if (position === 'before' && target.parentNode){
			target.parentNode.insertBefore(element, target);
		}else if (position === 'after' && target.parentNode){
			target.parentNode.insertBefore(element, target.nextSibling);
		}else if (position === 'replace' && target.parentNode){
			target.parentNode.insertBefore(element, target);
			target.parentNode.removeChild(target);
		}else if (position === 'wrap'){
			if (target.parentNode){
				target.parentNode.insertBefore(element, target);
			}
			element.appendChild(target);
		}else if (position === 'prepend'){
			target.insertBefore(element, target.childNodes[0]);
			//target.insertBefore(element, target.children[0]);
		}else if (position === 'append'){ // append
			target.appendChild(element);
		}else if (typeof position === 'number'){
			var children = utils.el.children(target);
			if (children[position]){
				target.insertBefore(element, children[position].nextSibling);
			}else{
				target.appendChild(element);
			}
		}

		return element;
	}
	this.el.replace = function (element, selector, replaceAttrs){
		var target = utils.dom.get(selector);
		if (!target) return;

		var attrs = replaceAttrs ? utils.el.attrs(element) : {};

		element.parentNode.insertBefore(target, element);
		element.parentNode.removeChild(element);

		if (replaceAttrs){
			// style
			if (attrs.style){
				var style = utils.string.toObject(attrs.style, {'separator':';'});
				utils.el.style(target, style);
				delete(attrs.style);
			}
			// class
			if (attrs.class){
				utils.el.addClass(target, attrs.class);
				delete(attrs.class);
			}
			// attrs
			utils.el.attrs(target, attrs);
		}

		return target;
	};
	this.el.remove = function (element){
		if (element.parentNode){
			element.parentNode.removeChild(element);
		}
		return element;
	};
	this.el.clone = function (element, args){
		args 		= (typeof args === 'number' ? {'times':args} : args) || {};
		args.times 	= 'times' in args ? args.times : null;

		var clones 	= [];
		var times 	= ('times' in args ? args.times : 1);

		if (!isFinite(times)){
			times = 0;
		}

		utils.each(times, function (){
			var clone = element.cloneNode(true);
			clones.push(clone);
		});

		return args.times ? clones : clones[0];
	}
	this.el.update = function (element, args){
		args 			= args || {};
		args.id   		= 'id' in args ? args.id : null;
		args.style   	= 'style' in args ? args.style : null;
		args.attrs   	= 'attrs' in args ? args.attrs : ('attr' in args ? args.attr : null);
		args.props		= 'props' in args ? args.props : ('prop' in args ? args.prop : null);
		args.classnames = 'classnames' in args ? args.classnames : ('classname' in args ? args.classname : null);
		args.children  	= 'children' in args ? args.children : 'html' in args ? args.html : null;
		args.clean 		= 'clean' in args ? args.clean : false; // clean the other children
		args.parent   	= args.parent || args.appendTo || null;

		if (args.id !== null){
			args.attrs 		= args.attrs || {};
			args.attrs.id 	= args.id;
		}

		if (args.classnames){
			utils.el.addClass(element, args.classnames);
		}
		if (args.style){
			utils.el.style(element, args.style);
		}
		if (args.attrs){
			utils.el.attrs(element, args.attrs);
		}
		if (args.props){
			utils.el.props(element, args.props);
		}
		if (utils.is(args.children)){
			utils.el.html(element, args.children, {'clean':args.clean});
		}
		if (args.parent && args.parent.appendChild && element.parentNode !== args.parent){
			args.parent.appendChild(element);
		}

		return element;
	};

	this.el.children = function (element, exclude){
		var children = [];

		if ('children' in element){
			children = element.children || [];
		}else{
			var nodes    = element.childNodes;
			var children = [];

			var node;
			var i = 0;

			while (node = nodes[i++]){
				if (node.nodeType === 1){
					children.push(node);
				}
			}
		}

		/*
		if (exclude instanceof Array){
			for (var i=0, l=exclude.length; in exclude){
				var index = children.indexOf(exclude[i]);
				if (~index){
					children.splice(index,1);
				}
			}
		}
		*/

		return children;
	};
	// @todo add condition to match (eg.: if you only fetch the children of specific parents)
	this.el.extract = function (element, args){
		args = (typeof args === 'string' ? {'single':args} : args) || {};
		if (args.single === undefined) 	args.single = '';
		if (args.group === undefined) 	args.group = '';
		if (args.clean === undefined) 	args.clean = false;

		var elements = {'self':element};

		var selector;
		if (args.single && args.group){
			selector = '['+args.single+'],['+args.group+']';
		}else if (args.single){
			selector = '['+args.single+']';
		}else if (args.group){
			selector = '['+args.group+']';
		}

		var children = element.querySelectorAll(selector);
		for (var i=0, l=children.length; i<l; ++i){
			var child 	= children[i];
			var single  = child.getAttribute(args.single);
			var group 	= child.getAttribute(args.group);

			if (single !== null){
				elements[single] = child;

				if (args.clean){
					child.removeAttribute(args.single);
				}
			}
			if (group !== null){
				if (!elements[group]){
					elements[group] = [];
				}

				elements[group].push(child);

				if (args.clean){
					child.removeAttribute(args.group);
				}
			}
		}

		return elements;
	};

	this.el.is = function (element, selector){
		if (element === selector){
			return true;
		}else if (typeof selector === 'function'){
			return !!selector(element);
		}else if (typeof selector === 'string'){
			var match = (
				element.matches || element.matchesSelector || element.msMatchesSelector ||
				element.mozMatchesSelector || element.webkitMatchesSelector || element.oMatchesSelector
			);
			return (match ? match.call(element, selector) : false);
		}else{
			return false;
		}
	};
	this.el.closest = function (element, selector, untilParent){
		var isFound     = false;
		var untilParent = utils.dom.get(untilParent);

		// check first if it's not already out of bounds
		if (untilParent && untilParent !== element && !utils.el.contains(untilParent, element)){
			return null;
		}

		while (element && !isFound){
			if (utils.el.is(element, selector)){
				isFound = true;
			}
			if (isFound || element === untilParent){
				break;
			}
			element = element.parentNode;
		}

		return isFound ? element : null;
	};
	this.el.contains = function (element, child){
		child = utils.dom.get(child);
		return element && child && element.contains(child);
	};
	this.el.index = function (element, selector){
		var elements = selector ? utils.dom.getAll(selector) : utils.toArray(element.parentNode.children);
		return elements.indexOf(element);
	};
	this.el.val = function (element, value, data){
		if (value === undefined){
			if (element.type === 'radio' || element.type === 'checkbox'){
				value = element.value || 'on';
			}else if (element.tagName.toLowerCase() === 'select'){
				var values  = [];
				var options = element.options;
				for (var i=0, l=options.length; i<l; ++i){
					var option = options[i];
					if (option.selected){
						values.push(option.value);
					}
				}

				if (element.multiple){
					value = values;
				}else{
					value = values[0] === undefined ? -1 : values[0];
				}
			}else{
				value = element.value;
			}

			if (typeof value === 'string'){
				value = value.trim();
			}

			// @todo maybe try to parse the data

			return utils.string.toValue(value); // === null || value === undefined ? '' : value;
		}else{
			if (typeof value === 'string'){
				value = utils.string.interpolate(value, data);
			}else if (typeof value === 'object'){
				value = JSON.stringify(value);
			}

			if (element.tagName.toLowerCase() === 'select'){
				var options = element.options || [];
				var values 	= value instanceof Array ? value : [value];
				var isSet 	= false;

				for (var i=0, l=options.length; i<l; ++i){
					var option = options[i];

					if (~values.indexOf(option.value)){
						option.selected = true;
						isSet = true;
					}else{
						option.selected = false;
					}
				}

				if (!isSet){
					element.selectedIndex = -1;
				}
			}else{
				element.value = value;
			}
		}
	};

	this.el.formData = function (element, key, value, setter){
		/*
		form($0);									// get all
		form($0, function (){});					// get all + getter
		form($0, 'name', function (){});			// get one + getter
		form($0, 'name', 'value');					// set 1
		form($0, {});								// set those
		form($0, {}, function (){});				// set those + setter
		form($0, 'name', 'value', function (){}); 	// set 1 + setter;
		*/

		var getter = null;
		if (typeof key === 'function'){
			getter = key;
			setter = null;
			key    = undefined;
		}else if (typeof key === 'string' && typeof value === 'function'){
			getter = value;
			value  = undefined;
		}else if (typeof key === 'object' && typeof value === 'function'){
			setter = value;
			value  = undefined;
		}

		var elements = utils.dom.getAll('input,textarea,select', {'context':element});
		var values   = utils.toSetterObject(key, value);
		var isSet    = !!values;
		var toggles  = {};

		if (!getter) getter = utils.fn.empty;
		if (!setter) setter = utils.fn.empty;
		if (!isSet)  values = [];

		for (var i=0, l=elements.length; i<l; ++i){
			var element  = elements[i];
			var name  	 = element.name;
			var value 	 = utils.string.toValue(element.value);
			var type  	 = element.tagName.toLowerCase() === 'input' ? element.type || 'text' : element.tagName.toLowerCase();
			var isArray  = !!name.match(/\[\]$/);
			var isToggle = type === 'checkbox' || type === 'radio';

			// remove the array part at the end
			if (!name.trim()) continue;

			// setter ----------------------------------------------------------
			if (isSet){
				// @todo find the name of the element (in case of complicated names like: formname[fieldname][], have to extract the fieldnname...)
				name = name.replace(/\[\]$/, '');

				var val = setter(values[name], name, element, values);
				if (val === undefined){
					continue;
				}

				if (isArray && !(val instanceof Array)){
					val = [val];
				}

				if (type === 'file'){
					// all that can be done for files is to be reset
					if (!val){
						element.value = '';
					}
				}else if (isArray && isToggle){
					element.checked = !!~val.indexOf(value);
				}else if (type === 'checkbox'){
					element.checked = !!val;
				}else if (type === 'radio'){
					element.checked = val === value;
				}else if (type === 'select'){
					var options = element.children;
					for (var ii=0, ll=options.length; ii<ll; ++ii){
						var option = options[ii];
						var oValue = option.value;
						option.selected = isArray ? !!~val.indexOf(oValue) : val === oValue;
					}
				}else if (isArray){
					element.value = val[value];
				}else{
					element.value = typeof val === 'object' ? JSON.stringify(val) : val;
				}
			// getter ----------------------------------------------------------
			}else{
				// skip hidden that are checked
				if (type === 'hidden' && element.checked){
					continue;
				}

				// for files, the value is different
				if (type === 'file'){
					var files = Array.prototype.slice.call(element.files);
					value   = isArray ? files : files[0];
					name 	= name.replace(/\[\]$/, '');
					isArray = false;
				}else if (type === 'select' && isArray){
					value   = [];
					name 	= name.replace(/\[\]$/, '');
					isArray = false;

					var options = element.children;
					for (var ii=0, ll=options.length; ii<ll; ++ii){
						var option = options[ii];
						var oValue = option.value;

						if (option.selected){
							oValue = utils.string.toValue(oValue);
							value.push(oValue);
						}
					}
				}else if (type === 'checkbox' && !isArray){
					value = !!element.checked;
				}

				// make sure the array type exists (if none are selected, then the array still need to exits)
				if (isToggle && !toggles[name]){
					// default values
					if (isArray){
						values.push([name.replace(/\[\]$/, ''), []]);
					}else{
						values.push([name, null]);
					}
					toggles[name] = true;
				}

				if (!isToggle || (!isArray && type === 'checkbox') || (type === 'radio' && element.checked) || (isArray && element.checked)){
					value = getter(value, name, element);
					values.push([name, value]);
				}
			}
		}

		// format the values gotten from the fields into a object
		if (!isSet && values instanceof Array){
			values = utils.object.namespace(values, {'separator':'form', 'arraySets':true});
		}

		return key ? values[key] : values;
	}

	this.el.cache = function (element, key, value){
		return utils.object.cache(element, key, value);
	};

	this.el.addEvent = function (element, names, args){
		if (typeof args === 'function'){
			args = {'callback':args};
		}
		if (args.callback === undefined) 	args.callback = null;
		if (args.delegate === undefined) 	args.delegate = null;
		if (args.context === undefined) 	args.context = null;
		if (args.capture === undefined) 	args.capture = false;
		if (args.passive === undefined) 	args.passive = null;
		if (args.once === undefined) 		args.once = false;

		utils.each(names, {'separator':' ', 'lowercase':true}, function (name){
			var a 		= utils.object.merge({'eventname':name}, args);
			var event 	= DOM.getEvent(a, 'add');

			element.addEventListener(event.eventname, event, {
				'capture' : args.capture,
				'passive' : args.passive,
				'once'    : args.once,
			});
		});
	};
	this.el.addEvents = function (element, events, args){
		for (var names in events){
			var eArgs = utils.extend({}, args, typeof events[names] === 'function' ? {'callback':events[names]} : events[names]);
			utils.el.addEvent(element, names, eArgs);
		}
	};
	// @todo way to remove all events!
	this.el.removeEvent = function (element, names, args){
		if (typeof args === 'function'){
			args = {'callback':args};
		}

		if (args.callback === undefined) 	args.callback = null;
		if (args.delegate === undefined) 	args.delegate = null;
		if (args.context === undefined) 	args.context = null;
		if (args.capture === undefined) 	args.capture = false;
		//if (args.passive === undefined) 	args.passive = true;
		if (args.passive === undefined) 	args.passive = null;
		if (args.once === undefined) 		args.once = false;

		utils.each(names, {'separator':' ', 'lowercase':true}, function (name){
			var a 		= utils.object.merge({'eventname':name}, args);
			var event 	= DOM.getEvent(a, 'remove');

			element.removeEventListener(event.eventname, event, {
				'capture' : args.capture,
				'passive' : args.passive,
				'once'    : args.once,
			});
		});
	};
	this.el.triggerEvent = function (element, names, data){
		// @todo
	};

	this.el.onMutation = function (element, props, callback){
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

		if (!MutationObserver) return;

		props = utils.toArray(props);

		var obj = {};
		for (var i in props){
			obj[props[i]] = true;
		}

		var observer = new MutationObserver(function (list){
			callback(element, list);
		});

		observer.observe(element, obj);
	};

	// @todo trackpad gestures :https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
	this.el.onTouch = function (element, args){
		if (typeof args === 'function'){
			args = {'callback':args};
		}

		args = args || {};
		if (args.delegate === undefined) args.delegate = null;
		if (args.overflow === undefined) args.overflow = true;	// does the event overflows (onces started, it's the DOCUMENT that emits the event)

		var _startEvents         = 'touchstart mousedown';
		var _moveEvents          = 'touchmove mousemove';
		var _stopEvents          = 'touchend touchcancel mouseup mouseleave';
		var _dragEvents 		 = 'dragstart';
		var _clickEvents 	     = 'click';

		var _target 			 = null;
		var _pointerType 		 = null;
		var _validIdentifiers    = [];
		var _startPoints 	     = {};
		var _previousPoints      = [];
		var _startTouch 		 = null;
		var _previousTouch 	     = null;
		var _isClickPrevented    = false;
		var _skipMouseEvent 	 = false;
		var _isEnabled 			 = true;

		// [fix] weird fix for iOS for the gestures to work and block with preventDefault()
		window.ontouchmove = function (){};

		function _getType (e){
			return e.type.indexOf('touch') === 0 ? 'touch' : 'mouse';
		}

		function _isSkipped (e){
			return _getType(e) === 'mouse' && _skipMouseEvent;
		}

		function _getPoint (e, a){
			if (!e){
				return null;
			}
			if (a === undefined){
				a = {};
			}

			if (a.offsetX === undefined) a.offsetX = 0;
			if (a.offsetY === undefined) a.offsetY = 0;

			var id = e.identifier === undefined ? 'mouse' : e.identifier;
			// get only the valid IDs
			if (!~_validIdentifiers.indexOf(id)){
				return null;
			}

			var now 	 = +new Date();
			var x        = (e['clientX'] || 0) + a.offsetX;
			var y        = (e['clientY'] || 0) + a.offsetY;
			var start 	 = _startPoints[id];

			var point = {
				'id'				        : id,
				'timestamp'			        : start ? start.timestamp : now,
				'duration'			        : 0,
				'x' 		 		        : x,
				'y' 		 	            : y,
				'startX' 		            : start ? start.startX : 0,
				'startY' 		            : start ? start.startY : 0,
				'deltaX' 		            : 0,
				'deltaY' 		            : 0,
				'absoluteX' 	            : 0,
				'absoluteY' 	            : 0,
				'distance'					: 0,
				'angle'						: 0,
				'rotation'					: 0,
				// direction
				'directionX'				: null,
				'directionY'				: null,
				'directionDistance'			: null,
				'directionRotation'			: null,
				// velocity
				'velocity'					: 0,
				'velocityVertical'			: 0,
				'velocityHorizontal'		: 0,
				'velocityDistance'			: 0,
				'velocityRotation'			: 0,
			};

			// make sure the previous value exists
			if (!start){
				start 		        		  = _startPoints[id] = point;
				start.startX                  = point.x;
				start.startY                  = point.y;
				start.lastX 				  = point.x;
				start.lastY 				  = point.y;
				start.lastDistance 			  = 0;
				start.lastRotation			  = 0;
				start.velocityStart           = now;
				start.velocityVerticalStart   = now;
				start.velocityHorizontalStart = now;
				start.velocityDistanceStart   = now;
				start.velocityRotationStart   = now;
			}

			point.duration	    = now - point.timestamp;
			point.deltaX        = x - point.startX;
			point.deltaY        = y - point.startY;
			point.absoluteX     = Math.abs(point.deltaX);
			point.absoluteY     = Math.abs(point.deltaY);
			point.distance		= utils.math.distance([point.startX, point.startY], [point.x, point.y]);
			point.angle 		= utils.math.angle([point.startX, point.startY], [point.x, point.y]);

			var diffAngle 		= utils.math.diffDegree(start.angle, point.angle);
			point.rotation 		= start.rotation + diffAngle;

			// directions ------------------------------------------------------
			// horizontal direction
			if (point.x < start.x)						point.directionX = 'left';
			else if (point.x > start.x)					point.directionX = 'right';
			else 										point.directionX = start.directionX;
			// vertical direction
			if (point.y < start.y)						point.directionY = 'up';
			else if (point.y > start.y)					point.directionY = 'down';
			else 										point.directionY = start.directionY;
			// distance direction
			if (point.distance < start.distance)		point.directionDistance = 'shrink';
			else if (point.distance > start.distance)	point.directionDistance = 'grow';
			else 										point.directionDistance = start.directionDistance;
			// rotation direction
			if (diffAngle > 0)							point.directionRotation = 'clockwise';
			else if (diffAngle < 0)						point.directionRotation = 'counter-clockwise';
			else 										point.directionRotation = start.directionRotation;

			// velocity --------------------------------------------------------
			if (point.directionX !== start.directionX){
				start.lastX 				  = point.x;
				start.velocityHorizontalStart = now;
			}
			if (point.directionY !== start.directionY){
				start.lastY 				  = point.y;
				start.velocityVerticalStart   = now;
			}
			if (point.directionDistance !== start.directionDistance){
				start.lastDistance  		  = point.distance;
				start.velocityDistanceStart   = now;
			}
			if (point.directionRotation !== start.directionRotation){
				start.lastRotation			  = point.rotation;
				start.velocityRotationStart   = now;
			}

			point.lastX 				= start.lastX;
			point.lastY 				= start.lastY;
			point.previousX 			= start.x;
			point.previousY 			= start.y;
			point.velocity 				= utils.math.velocity([start.startX, start.startY], [x, y], start.velocityStart, now, true);
			point.velocityHorizontal 	= utils.math.velocity(start.lastX, x, start.velocityHorizontalStart, now);
			point.velocityVertical 		= utils.math.velocity(start.lastY, y, start.velocityVerticalStart, now);
			point.velocityDistance 		= utils.math.velocity(start.lastDistance, point.distance, start.velocityDistanceStart, now);
			point.velocityRotation 		= utils.math.velocity(start.lastRotation, point.rotation, start.velocityRotationStart, now);

			// cache data for the next update
			start.x                 = x;
			start.y                 = y;
			start.distance          = point.distance;
			start.angle             = point.angle;
			start.rotation          = point.rotation;
			start.directionX        = point.directionX;
			start.directionY        = point.directionY;
			start.directionDistance = point.directionDistance;
			start.directionRotation = point.directionRotation;

			return point;
		}

		function _getPoints (e, a){
			a = a || {};

			if (a.validate === undefined) 	a.validate = false;
			if (a.clean === undefined) 		a.clean = false;

			// revalidate all the identifiers
			if (a.validate){
				_validIdentifiers = ['mouse'];
			}

			var points 	= [];
			var offsetX = ((element.offsetLeft || 0) - (window.scrollX || window.pageXOffset || 0)) * -1;
			var offsetY = ((element.offsetTop || 0) - (window.scrollY || window.pageYOffset || 0)) * -1;

			// touch event
			if (e.type.indexOf('touch') === 0){
				var currentIdentifiers 	= {};

				for (var i=0, l=4; i<l; ++i){
					var touch = e.touches[i];

					if (!touch) continue;

					// re-create the valid identifiers
					if (a.validate){
						_validIdentifiers.push(touch.identifier);
					}

					var point = _getPoint(touch, {'offsetX':offsetX, 'offsetY':offsetY});
					if (point){
						points.push(point);
						currentIdentifiers[point.id] = true;
					}
				}

				if (a.clean){
					for (var id in _startPoints){
						if (id in currentIdentifiers) continue;
						delete(_startPoints[id]);
					}
				}
			}else if (e.type === 'mousedown' || e.type === 'mousemove'){
				var point = _getPoint(e, {'offsetX':offsetX, 'offsetY':offsetY});
				if (point){
					points.push(point);
				}
			}

			return points;
		}

		function _getTouch (points, type){
			if (type === undefined){
				type = '';
			}

			var now = +new Date();

			// when there's no more pointers, return the previous cached touch
			if (type === 'end'){
				_previousTouch.type  	= 'end';
				_previousTouch.count 	= 0;
				_previousTouch.duration = now - _startTouch.timestamp;
				return _previousTouch;
			}

			var point1 	= points[0];
			var point2 	= points[1];

			var touch = {
				'timestamp'          : _startTouch ? _startTouch.timestamp : now,
				'duration'	         : _startTouch ? now - _startTouch.timestamp : 0,
				'type'		         : type,
				'count'		         : points.length,
				'x'		             : point2 ? utils.math.mid(point1.x, point2.x) : point1.x,
				'y'		             : point2 ? utils.math.mid(point1.y, point2.y) : point1.y,
				'startX'             : _startTouch ? _startTouch.startX : point1.startX,
				'startY'             : _startTouch ? _startTouch.startY : point1.startY,
				'deltaX'	         : 0,
				'deltaY'	         : 0,
				'distance'	         : point2 ? utils.math.distance(point1, point2) : 0,
				'scale'		         : 0,
				'angle'		         : point2 ? utils.math.angle(point1, point2) : 0,
				'rotation'	         : 0,
				// direction
				'directionX'         : null,
				'directionY'         : null,
				'directionScale'	 : null,
				'directionRotation'  : null,
				// velocity
				'velocity'			 : 0,
			};

			// @todo add previousX, previousY, previousScale, previousAngle, previousRotation

			if (!_startTouch){
				_startTouch = touch;
			}
			if (!_previousTouch){
				_previousTouch = touch;
			}

			// when a pointer is added/removed, refresh the startTouch
			if (touch.type === 'add' || touch.type === 'remove'){
				_startTouch.x 		= touch.x;
				_startTouch.y 		= touch.y;
				_startTouch.distance= touch.distance;
				_startTouch.deltaX  = _previousTouch.deltaX;
				_startTouch.deltaY  = _previousTouch.deltaY;
			}

			if (touch.type === 'add'){
				_previousTouch.angle = touch.angle; // make sure the previous touch has the right angle at first
			}else if (touch.type === 'remove'){
				_startTouch.scale    = _previousTouch.scale;
			}

			// x/y
			touch.deltaX		= _startTouch.deltaX + (touch.x - _startTouch.x);
			touch.deltaY		= _startTouch.deltaY + (touch.y - _startTouch.y);
			touch.absoluteX 	= Math.abs(touch.deltaX);
			touch.absoluteY 	= Math.abs(touch.deltaY);
			// distance/scale
			var diffDistance 	= (touch.distance / _startTouch.distance) - 1;
			touch.deltaDistance = touch.distance - _startTouch.distance;
			touch.scale 		= _startTouch.scale + (diffDistance || 0);
			// angle
			var diffAngle 		= point2 ? utils.math.diffDegree(_previousTouch.angle, touch.angle) : 0;
			touch.rotation 		= _previousTouch.rotation + diffAngle;

			// direction -------------------------------------------------------
			// horizontal
			if (touch.deltaX < _previousTouch.deltaX)		touch.directionX = 'left';
			else if (touch.deltaX > _previousTouch.deltaX)	touch.directionX = 'right';
			else 											touch.directionX = _previousTouch.directionX;
			// vertical
			if (touch.y < _previousTouch.y) 				touch.directionY = 'up';
			else if (touch.y > _previousTouch.y)			touch.directionY = 'down';
			else 											touch.directionY = _previousTouch.directionY;
			// scale
			if (touch.scale < _previousTouch.scale) 		touch.directionScale = 'shrink';
			else if (touch.scale > _previousTouch.scale)	touch.directionScale = 'grow';
			else 											touch.directionScale = _previousTouch.directionScale;
			// rotation
			if (diffAngle > 0)								touch.directionRotation = 'clockwise';
			else if (diffAngle < 0)							touch.directionRotation = 'counter-clockwise';
			else 											touch.directionRotation = _previousTouch.directionRotation;

			// velocity --------------------------------------------------------
			touch.velocity = utils.math.velocity([touch.startX, touch.startY], [touch.x, touch.y], _startTouch.timestamp, now);

			return touch;
		}

		function _trigger (element, touch, points, e){
			var event = touch;

			event.target 			= _target;
			event.originalEvent 	= e.originalEvent;
			event.originalTarget 	= e.originalTarget;
			event.preventDefault 	= e.preventDefault;
			event.stopPropagation 	= e.stopPropagation;
			event.preventClick 		= function (){ _isClickPrevented = true; };
			event.points 			= points;
			event.previousPoints 	= _previousPoints;

			args.callback.call(element, event);
		}

		function _clear (){
			_target				 = null;
			_startPoints 	     = {};
			_previousPoints      = [];
			_validIdentifiers    = [];
			_startTouch 		 = null;
			_previousTouch 	     = null;
		}

		function _onDrag (e){
			if (!_isEnabled){
				return;
			}
			e.preventDefault();
			e.stopPropagation();
		}

		function _onStart (e){
			if (!_isEnabled || _isSkipped(e)){
				return;
			}

			// this make sure the "mousedown" event won't be fired if the touchstart is fired first (but sadly it prevents CLICK events)
			var pointerType= _getType(e);
			var touchType  = 'start';

			if (!_previousPoints.length || (_previousTouch && _previousTouch.type === 'start')){
				_clear();
			}else{
				touchType = 'add';
			}

			if (touchType === 'start'){
				_target = e.target;
			}

			var points 	     = _getPoints(e.originalEvent, {'validate':true});
			var touch 		 = _getTouch(points, touchType);

			// event
			_trigger(this, touch, points, e);

			// caching previous values
			_previousTouch	 = touch;
			_previousPoints  = points;
			_pointerType 	 = pointerType;
		}

		function _onMove (e){
			if (!_isEnabled) return;

			var validate 	= args.overflow && !!_previousPoints.length;
			var points 		= _getPoints(e.originalEvent, {'validate':validate});

			// no valid points
			if (!points.length){
				return;
			}

			var touchType 	 = points.length > _previousPoints.length ? 'add' :
							   points.length < _previousPoints.length ? 'remove' :
							   'move';
			var touch 		 = _getTouch(points, touchType);

			// event
			_trigger(this, touch, points, e);

			// caching previous values
			_previousTouch	 = touch;
			_previousPoints  = points;
		}

		function _onStop (e){
			if (!_isEnabled || _isSkipped(e)){
				return;
			}

			var points = _getPoints(e.originalEvent, {'validate':args.overflow && _previousPoints.length, 'clean':true});

			// if the remove points are not in the valid ones, then skip the rest
			if (points.length >= _previousPoints.length){
				return;
			}

			var touchType 	 = points.length ? 'remove' : 'end';
			var touch 		 = _getTouch(points, touchType);

			// event
			_trigger(this, touch, points, e);

			// caching previous values
			_previousTouch	 = touch;
			_previousPoints  = points;

			if (!points.length){
				_clear();

				// skip the mouse events when using touch
				if (_getType(e) === 'touch'){
					_skipMouseEvent = true;
					setTimeout(function (){ _skipMouseEvent = false; }, 150);
				}
			}
		}

		function _onClick (e){
			if (!_isEnabled) return;

			if (_isClickPrevented){
				e.preventDefault();
				//e.stopPropagation();
			}

			_isClickPrevented = false;
		}

		function _on (){
			utils.dom.addEvent(element, _startEvents, {'delegate':args.delegate, 'callback':_onStart, 'passive':false});
			utils.dom.addEvent(element, _dragEvents, {'delegate':args.delegate, 'callback':_onDrag});
			utils.dom.addEvent(element, _clickEvents, {'delegate':args.delegate, 'callback':_onClick});

			if (args.overflow){
				utils.dom.addEvent(document, _moveEvents, {'context':element, 'callback':_onMove, 'passive':false});
				utils.dom.addEvent(document, _stopEvents, {'context':element, 'callback':_onStop, 'passive':false});
			}else{
				utils.dom.addEvent(element, _moveEvents, {'delegate':args.delegate, 'callback':_onMove, 'passive':false});
				utils.dom.addEvent(element, _stopEvents, {'delegate':args.delegate, 'callback':_onStop, 'passive':false});
			}
		}

		function _off (){
			utils.dom.removeEvent(element, _startEvents, {'delegate':args.delegate, 'callback':_onStart, 'passive':false});
			//utils.dom.removeEvent(element, _dragEvents, {'delegate':args.delegate, 'callback':_onDrag});
			utils.dom.removeEvent(element, _clickEvents, {'delegate':args.delegate, 'callback':_onClick});

			if (args.overflow){
				utils.dom.removeEvent(document, _moveEvents, {'context':element, 'callback':_onMove, 'passive':false});
				utils.dom.removeEvent(document, _stopEvents, {'context':element, 'callback':_onStop, 'passive':false});
			}else{
				utils.dom.removeEvent(element, _moveEvents, {'delegate':args.delegate, 'callback':_onMove, 'passive':false});
				utils.dom.removeEvent(element, _stopEvents, {'delegate':args.delegate, 'callback':_onStop, 'passive':false});
			}
		}

		function _enable (value){
			if (value !== undefined){
				_isEnabled = !!value;
			}
			return _isEnabled;
		}

		_on();

		return {
			'element'	: element,
			'on'		: _on,
			'off'		: _off,
			'enable'	: _enable,
		};
	};

	this.el.onGestures = function (element, args){
		args = args || {};

		if (args.tapMoveThreshold === undefined) 	args.tapMoveThreshold = 10;
		if (args.tapTimeThreshold === undefined) 	args.tapTimeThreshold = 300;
		if (args.holdTimeThreshold === undefined) 	args.holdTimeThreshold = 500;
		if (args.dragMoveThreshold === undefined) 	args.dragMoveThreshold = 20;
		if (args.swipeMinVelocity === undefined) 	args.swipeMinVelocity = 1;
		if (args.swipeMoveThreshold === undefined) 	args.swipeMoveThreshold = 50;
		if (args.rotateThreshold === undefined) 	args.rotateThreshold = 5;
		if (args.pinchThreshold === undefined) 		args.pinchThreshold = 10;
		if (args.context === undefined)				args.context = null;

		// add inertia/momentum to drag
		// @todo add it to pinch and rotate too
		args.friction = 'friction' in args ? args.friction : 0;
		if (args.friction === true) args.friction = 0.85;
		if (args.friction > 1) 		args.friction = 0.99;

		args.callback 	= _onTouch;

		var ORIENTATIONS = {
			HORIZONTAL  : 'horizontal',
			VERTICAL 	: 'vertical',
		};
		var DIRECTIONS = {
			UP 		: 'up',
			RIGHT 	: 'right',
			DOWN 	: 'down',
			LEFT 	: 'left'
		};

		var _touch 		= utils.el.onTouch(element, args);
		var _data 		= {};
		var _events 	= {};
		var _instance	= {
			'element' 	: _touch.element,
			'enable'	: _touch.enable,
			'on'		: _on,
			'off'		: _off,
			'props'		: args, // to be able to change it after
		};

		var get = function (key){ return _data[key]; };
		var set = function (key, value){ _data[key] = value; };

		function _onTouch (e){
			var el 			= this;
			var trigger 	= function (eventname, props){ _trigger(el, eventname, e, props); }
			var absoluteXY 	= Math.max(e.absoluteX, e.absoluteY);

			// by default, if there's at least 2 fingers, preventDefault()
			if (e.count >= 2){
				e.preventDefault();
			}

			// taps / hold -----------------------------------------------------
			var tapCount 	= get('tapCount') || 0;
			var tapTimeout 	= get('tapTimeout') || null;
			var holdTimeout = get('holdTimeout') || null;

			if (e.type === 'start'){
				set('willTap', true);
				set('willHold', true);
				set('tapCount', tapCount + 1);

				// delay before the tap count is reset
				clearTimeout(tapTimeout);
				tapTimeout = setTimeout(function (){
					set('tapCount', 0);
				}, args.tapTimeThreshold);

				// delay before a "hold" event is triggered
				clearTimeout(holdTimeout);
				holdTimeout = setTimeout(function (){
					if (!get('willHold')) return;

					trigger('hold', {'duration':args.holdTimeThreshold});
				}, args.holdTimeThreshold);

				set('tapTimeout', tapTimeout);
				set('holdTimeout', holdTimeout);
			}else if (e.type === 'add' || e.type === 'remove' || (e.type === 'move' && (absoluteXY > args.tapMoveThreshold))){
				set('willTap', false);
				set('willHold', false);
				set('tapCount', 0);

				clearTimeout(tapTimeout);
				clearTimeout(holdTimeout);
			}else if (e.type === 'end'){
				if (e.duration <= args.tapTimeThreshold && get('willTap')){
					set('willTap', false);

					trigger('tap', {'tapCount':tapCount});

					// shortcut double-tap
					if (tapCount === 2){
						trigger('doubletap');
					}
				}

				if (e.duration >= args.holdTimeThreshold && get('willHold')){
					trigger('hold-end', {'duration':e.duration});
				}

				set('willHold', false);
			}

			// drag/swipes -----------------------------------------------------
			var isDragging = get('isDragging');
			var willDrag   = (e.type === 'move' && !isDragging && absoluteXY > args.dragMoveThreshold) ||
							 (e.type === 'start' && !isDragging && !args.dragMoveThreshold);

			//e.stopPropagation();

			if (isDragging || willDrag){
				var point = e.type === 'end' ? e.previousPoints[0] : e.points[0];

				var props = {
					'x'					: e.x,
					'y'					: e.y,
					'startX' 			: get('dragStartX') || (e.x),
					'startY'			: get('dragStartY') || (e.y),
					'deltaX'			: e.deltaX - (get('dragStartDeltaX') || 0),
					'deltaY'			: e.deltaY - (get('dragStartDeltaY') || 0),
					'orientation'		: e.absoluteX > e.absoluteY ? ORIENTATIONS.HORIZONTAL : ORIENTATIONS.VERTICAL,
					'orientationStart'	: get('dragStartOrientation'),
					'isStart'			: false,
					'isEnd'				: false,
				};

				if (e.x < props.startX && props.orientation === ORIENTATIONS.HORIZONTAL) 		props.direction = DIRECTIONS.LEFT;
				else if (e.x > props.startX  && props.orientation === ORIENTATIONS.HORIZONTAL)	props.direction = DIRECTIONS.RIGHT;
				else if (e.y < props.startY && props.orientation === ORIENTATIONS.VERTICAL) 	props.direction = DIRECTIONS.UP;
				else if (e.y > props.startY && props.orientation === ORIENTATIONS.VERTICAL) 	props.direction = DIRECTIONS.DOWN;

				if (willDrag){
					set('isDragging', true);
					set('dragStartX', props.startX);
					set('dragStartY', props.startY);
					set('dragStartDeltaX', props.deltaX);
					set('dragStartDeltaY', props.deltaY);
					set('dragStartOrientation', props.orientation);

					var bounds = e.target.getBoundingClientRect();
					set('dragClientWidth', bounds.width);
					set('dragClientHeight', bounds.height);
					set('dragOffsetX', bounds.left + (window.scrollX || window.pageXOffset || 0));
					set('dragOffsetY', bounds.top + (window.scrollY || window.pageYOffset || 0));

					props.deltaX  = 0;
					props.deltaY  = 0;
					props.isStart = true;
				}else if (e.type === 'end'){
					if (e.velocity > args.swipeMinVelocity && absoluteXY > args.swipeMoveThreshold){
						if (props.direction === DIRECTIONS.UP)			trigger('swipe-up', props);
						else if (props.direction === DIRECTIONS.RIGHT)	trigger('swipe-right', props);
						else if (props.direction === DIRECTIONS.DOWN)	trigger('swipe-down', props);
						else if (props.direction === DIRECTIONS.LEFT)	trigger('swipe-left', props);
						trigger('swipe', props);
					}

					props.isEnd = true;
				}

				//props.deltaX 		= e.deltaX - (get('dragStartDeltaX') || 0);
				//props.deltaY		= e.deltaY - (get('dragStartDeltaY') || 0); // had to update deltas here
				props.absoluteX 	= Math.abs(props.deltaX);
				props.absoluteY 	= Math.abs(props.deltaY);
				props.clientWidth	= get('dragClientWidth') || 0;
				props.clientHeight	= get('dragClientHeight') || 0;
				props.offsetX		= e.x - (get('dragOffsetX') || 0);
				props.offsetY		= e.y - (get('dragOffsetY') || 0);
				props.isOutside 	= props.offsetX < 0 || props.offsetX > props.clientWidth ||
				 					  props.offsetY < 0 || props.offsetY > props.clientHeight;

				var dragDirectionEvent = get('dragStartOrientation') === ORIENTATIONS.HORIZONTAL ? 'drag-x' : 'drag-y';
				var inertia = get('dragInertia');
				if (inertia) inertia.stop();


				// @source simple velocity: https://jsfiddle.net/soulwire/znj683b9/
				if (args.friction && e.type === 'end'){
					props.isEnd = false;

					var point 	= e.previousPoints[0];
					var distX 	= props.x - point.previousX;
					var distY 	= props.y - point.previousY;
					var x 		= props.x;
					var y 		= props.y;

					// cancel previous animation
					var inertia = utils.fn.animate(function (e){
						x 		+= distX;
						y 		+= distY;
						distX 	*= args.friction;
						distY 	*= args.friction;

						if (Math.abs(distX) < 1) distX = 0;
						if (Math.abs(distY) < 1) distY = 0;

						// @todo add limits of inertia to "args"

						props.x  		= x;
						props.y  		= y;
						props.deltaX 	= x - props.startX;
						props.deltaY 	= y - props.startY;
						props.isEnd		= !distX && !distY;

						trigger('drag', props);
						trigger(dragDirectionEvent, props);

						if (props.isEnd){
							return false;
						}
					}, 0);

					set('dragInertia', inertia);
				}else{
					trigger('drag', props);
					trigger(dragDirectionEvent, props);
				}
			}

			if (e.type === 'start' || e.type === 'end'){
				set('isDragging', false);
				set('dragStartX', 0);
				set('dragStartY', 0);
				set('dragStartDeltaX', 0);
				set('dragStartDeltaY', 0);
				set('dragStartOrientation', null);
			}

			// rotate/pinch ----------------------------------------------------
			var isRotating = get('isRotating');
			var willRotate = (e.type === 'move' && !isRotating && Math.abs(e.rotation) > args.rotateThreshold) ||
							 (e.type === 'start' && !isRotating && !args.rotateThreshold);
			var isPinching = get('isPinching');
			var willPinch  = (e.type === 'move' && !isPinching && Math.abs(e.deltaDistance) > args.pinchThreshold) ||
							 (e.type === 'start' && !isPinching && !args.pinchThreshold);

			if (isRotating || willRotate){
				var rotateStart = get('rotateStart') || e.rotation;
				var props = {
					'rotation' 	: e.rotation - rotateStart,
					'direction' : e.directionRotation,
					'isStart'	: false,
					'isEnd'		: false,
				};

				if (willRotate){
					set('isRotating', true);
					set('rotateStart', rotateStart);
					props.isStart = true;
				}else if (e.type === 'end'){
					props.isEnd = true;
				}

				trigger('rotate', props);
			}

			if (isPinching || willPinch){
				var eventname       = 'pinch';
				var pinchStart      = get('pinchStart') || e.deltaDistance;
				var pinchScaleStart = get('pinchScaleStart') || e.scale;

				var props = {
					'distance' 	    : e.distance,
					'deltaDistance' : e.deltaDistance - pinchStart,
					'scale'			: e.scale - pinchScaleStart,
					'direction'     : e.directionScale,
					'isStart'		: false,
					'isEnd'			: false,
				};

				if (willPinch){
					set('isPinching', true);
					set('pinchStart', pinchStart);
					set('pinchScaleStart', pinchScaleStart);
					props.isStart = true;
				}else if (e.type === 'end'){
					props.isEnd = true;
				}

				trigger('pinch', props);
			}

			if (e.type === 'start' || e.type === 'end'){
				set('isRotating', false);
				set('rotateStart', 0);
				set('isPinching', false);
				set('pinchStart', 0);
				set('pinchScaleStart', 0);
			}

			// general touch event
			_trigger(element, 'touch', e);
		}

		function _trigger (element, eventname, e, event){
			var events = _events[eventname];
			if (events === undefined){
				return;
			}

			if (event === undefined){
				event = {};
			}

			event.type            = eventname;
			event.touch           = e;
			event.target 		  = e.target;
			event.preventDefault  = e.preventDefault;
			event.preventClick    = e.preventClick;
			event.stopPropagation = e.stopPropagation;

			for (var i=0, l=events.length; i<l; ++i){
				var callback = events[i];

				if (typeof callback === 'function'){
					callback.call(args.context || e.target, event);
				}
			}
		}

		function _on (names, callback){
			if (!arguments.length){
				_touch.on();
			}else{
				utils.each(names, {'separator':' ', 'lowercase':true}, function (name){
					if (_events[name] === undefined){
						_events[name] = [];
					}
					_events[name].push(callback);
				});
			}
			return _instance;
		}

		function _off (names, callback){
			if (!arguments.length){
				_touch.off();
			}else{
				utils.each(names, {'separator':' ', 'lowercase':true}, function (name){
					if (_events[name] !== undefined){
						utils.array.remove(_events[name], callback);
					}
				});
			}
			return _instance;
		}

		return _instance;
	};

	this.el.onMousemove = function (element, args){
		args 			= typeof args === 'function' ? {'callback':args} : args || {};
		args.callback 	= 'callback' in args ? args.callback : utils.fn.empty;
		args.context	= 'context' in args ? args.context : element;

		var evt = {
			'isStart' 	: false,
			'isEnd' 	: false,
			'x'			: 0,
			'y'			: 0,
			'width'		: 0,
			'height'	: 0,
		};

		var bounds = {};

		function _update (e){
			evt.x 			= e.pageX - bounds.borderBox.x;
			evt.y 			= e.pageY - bounds.borderBox.y;
			evt.ratioX 		= utils.math.between(evt.x / bounds.borderBox.width, 0, 1, true);
			evt.ratioY 		= utils.math.between(evt.y / bounds.borderBox.height, 0, 1, true);
		}

		function _onEnter (e){
			bounds = utils.el.bounds(this);

			evt.isStart = true;
			evt.isEnd   = false;
			evt.width 	= bounds.borderBox.width;
			evt.height 	= bounds.borderBox.height;

			_update(e);

			args.callback.call(args.context, evt);
		}
		function _onMove (e){
			evt.isStart = false;

			_update(e);

			args.callback.call(args.context, evt);
		}
		function _onLeave (e){
			evt.isEnd 	= true;

			args.callback.call(args.context, evt);
		}

		function _on (){
			utils.el.addEvent(element, 'mouseenter', _onEnter);
			utils.el.addEvent(element, 'mousemove', _onMove);
			utils.el.addEvent(element, 'mouseleave', _onLeave);
		}

		function _off (){
			utils.el.removeEvent(element, 'mouseenter', _onEnter);
			utils.el.removeEvent(element, 'mousemove', _onMove);
			utils.el.removeEvent(element, 'mouseleave', _onLeave);
		}

		_on();

		return {
			'element'	: element,
			'on'		: _on,
			'off'		: _off,
		};
	};

	this.el.onTyping = function (element, args){
		// @todo
	};

	this.el.classnames = function (element, values, addRemove){
		var classnames = utils.toArray(element.getAttribute('class'), ' ');

		if (values !== undefined){
			if ((values instanceof Array || typeof values !== 'object')){
				// if addRemove is undefined, then reset the classnames to those new ones
				if (typeof addRemove !== 'boolean'){
					classnames = [];
				}

				// convert the values to a true/false object
				var obj = {};
				utils.each(values, {'separator':' '}, function (name){
					if (!name) return;

					obj[name] = addRemove === false ? false : true;
				});
				values = obj;
			}

			// add/remove the elements
			for (var name in values){
				name = name.trim();

				if (!name) continue;

				var add   = values[name];
				var index = classnames.indexOf(name);

				if (add && !~index){
					classnames.push(name);
				}else if (!add && ~index){
					classnames.splice(index, 1);
				}
			}

			classnames = utils.array.clean(classnames);

			if (classnames.length){
				element.setAttribute('class', classnames.join(' '));
			}else{
				element.removeAttribute('class');
			}
		}

		return classnames;
	};
	this.el.addClass = function (element, classnames, timeout){
		utils.el.classnames(element, classnames, true);

		if (timeout){
			setTimeout(function (){
				utils.el.classnames(element, classnames, false);
			}, timeout);
		}
	};
	this.el.removeClass = function (element, classnames){
		utils.el.classnames(element, classnames, false);
	};
	this.el.toggleClass = function (element, classnames){
		var current   	= utils.el.classnames(element);
		var classnames 	= utils.toArray(classnames);

		for (var i=0, l=classnames.length; i<l; ++i){
			var c     = classnames[i];
			var index = current.indexOf(c);

			if (~index){
				current.splice(index, 1);
			}else{
				current.push(c);
			}
		}

		utils.el.classnames(element, current);
	};
	this.el.transitionClass = function (element, args){
		if (typeof args === 'function'){
			args = {'callback':args};
		}

		args = args || '';
		if (args.startClass === undefined) 	args.startClass = 'transition-start';
		if (args.activeClass === undefined) args.activeClass = 'transition-active';
		if (args.endClass === undefined) 	args.endClass = 'transition-end';
		if (args.callback === undefined)	args.callback = null;

		var _add    = utils.dom.addClass;
		var _remove = utils.dom.removeClass;

		_add(element, args.startClass);

		var reflow = element.offsetHeight; // force reflow...
		_add(element, args.activeClass);

		// find the type of animation
		var animationType 		= null;
		var styles 		 		= window.getComputedStyle(element);
		var transitionDuration 	= parseFloat(styles.transitionDuration);
		var animationName 		= styles.animationName;
		var eventName 			= null;

		function _onComplete (){
			_remove(element, [args.startClass, args.activeClass, args.endClass]);

			if (eventName){
				element.removeEventListener(eventName, _onComplete);
			}
			if (typeof args.callback === 'function'){
				args.callback();
			}
		};

		// no transition/animation found
		if (!transitionDuration && animationName === 'none'){
			_onComplete();
			return;
		// css transition
		}else if (transitionDuration){
			eventName = 'transitionend';
		// css animation
		}else if (animationName){
			eventName = 'animationend';
		}

		utils.fn.requestFrame(function (){
			_remove(element, args.startClass);
			_add(element, args.endClass);

			element.addEventListener(eventName, _onComplete);
		}, true);
	};
	this.el.transition = function (element, props, args){
		if (typeof args === 'function'){
			args = {'onComplete':args};
		}else if (typeof args === 'number' || typeof args === 'string'){
			args = {'duration':args};
		}

		args 			= args || {};
		args.duration 	= utils.string.toDuration('duration' in args ? args.duration : 1000);
		args.delay 		= utils.string.toDuration('delay' in args ? args.delay : 0);
		args.pause 		= utils.string.toDuration('pause' in args ? args.pause : 0);
		args.easing 	= utils.easings.get('easing' in args ? args.easing : null, true);
		args.context 	= 'context' in args ? args.context : null;
		args.clean 	 	= 'clean' in args ? args.clean : false;
		args.onComplete = typeof args.onComplete === 'function' ? args.onComplete : utils.fn.empty;

		// all transitioning element
		var cache         = 'transition-timeoute';
		var classname     = 'is-transitioning';
		var from          = {};
		var to 	          = {};
		var clean         = {};
		var totalDuration = args.duration + args.delay + args.pause;

		for (var i in props){
			var isFrom 	= i[0] === '!'
			var key 	= i.replace('!', '');

			if (props[i] instanceof Array){
				from[key] = props[i][0];
				to[key]   = props[i][1];
			}else if (isFrom){
				from[key] = props[i];
			}else{
				to[key] = props[i];
			}

			clean[key]= '';
		}

		var current = utils.el.cache(element, cache);
		clearTimeout(current);


		// before
		function _from (){
			element.style.transition = 'none';
			utils.el.addClass(element, classname);
			utils.el.style(element, from);

			if (args.pause){
				setTimeout(_to, args.pause);
			}else{
				_to();
			}
		}

		function _to (){
			var reflow = element.offsetHeight;
			element.style.transition = 'all ' + utils.number.toDuration(args.duration) + ' ' + args.easing;
			utils.el.style(element, to);
		}

		if (args.delay){
			setTimeout(_from, args.delay);
		}else{
			_from();
		}

		// timeout
		var timeout = setTimeout(function (){
			args.onComplete.call(args.context || element, element);

			if (args.clean){
				utils.el.style(element, clean);
			}

			utils.el.removeClass(element, classname);

			element.style.transition = '';
		}, totalDuration);

		utils.el.cache(element, cache, timeout);
	};

	this.el.attrs = function (element, key, value){
		var attrs = utils.toSetterObject(key, value);

		if (attrs){
			var cache = utils.el.cache(element, 'attrs') || {};

			for (var name in attrs){
				var value 	= attrs[name];
				var old 	= cache[name];

				cache[name] = value;

				if (value === old){
					continue;
				}

				if (value === '' || value === null || value === undefined){
					element.removeAttribute(name);
				}else{
					if (name in DOM.NAMESPACES){
						element.setAttributeNS(DOM.NAMESPACES[name], name, value);
					}else{
						element.setAttribute(name, value === true ? '' : value);
					}
				}
			}

			utils.el.cache(element, 'attrs', cache);
		}else if (key){
			if (key in DOM.NAMESPACES){
				return element.getAttributeNS(DOM.NAMESPACES[key], key);
			}else{
				return element.getAttribute(key);
			}
		}else{
			var attrs = {};

			for (var i=0, l=element.attributes.length; i<l; ++i){
				var key 	= element.attributes[i].name.toString();
				var value 	= element.attributes[i].value.toString();
				attrs[key] = value;
			}

			return attrs;
		}
	};
	this.el.data = function (element, key, value){
		// @info on Edge or IE, the dataset validates the values and things like data-enable:mobile isn't valid

		var data 		= utils.toSetterObject(key, value);
		var hasDataset 	= false; //element.dataset !== undefined;

		if (data){
			for (var name in data){
				var value = data[name];

				if (hasDataset){
					element.dataset[name] = value;
				}else{
					name = 'data-' + utils.string.toDashCase(name);
					element.setAttribute(name, value);
				}
			}
		}else{
			var data = element.dataset;

			if (hasDataset){
				data = utils.each(data, {'returnObject':true}, function (value){
					return utils.string.toValue(value);
				});
			}else{
				data = {};
				for (var i=0, l=element.attributes.length; i<l; ++i){
					var name = element.attributes[i].name.toString();
					var value= element.attributes[i].value.toString();

					if (name.indexOf('data-') !== 0) continue;

					name		= utils.string.toCamelCase(name.replace('data-', ''));
					data[name] 	= utils.string.toValue(value);
				}
			}

			return key !== undefined ? data[key] : data;
		}
	};
	this.el.props = function (element, key, value){
		var props = utils.toSetterObject(key, value);

		if (props){
			for (var i in props){
				if (typeof element[i] === 'function'){
					element[i].apply(null, props[i]);
				}else{
					element[i] = props[i];
				}
			}
		}else if (key){
			return element[key];
		}else{
			return null;
		}
	};
	this.el.html = function (element, html, args){
		args 			= args || {};
		args.clean 		= 'clean' in args ? args.clean : false; // clean the other children

		var old = utils.el.cache(element, 'html');

		if (typeof html !== 'object' && html === old) return;

		// html children
		if (typeof html == 'string'){
			element.innerHTML = html;
		// object children
		}else if (utils.isPlainObject(html)){
			/*
			child = utils.dom.create(html);
			element.innerHTML = '';
			element.appendChild(child);
			*/

			//console.log(html);
			// @todo
			utils.dom.toDom(element, html);
		// array of DOM elements
		}else if (html){
			if (!(html instanceof Array)){
				html = [html];
			}

			// remove all other childNodes
			if (args.clean){
				var nodes = element.childNodes;
				var i 	  = nodes.length-1;
				var node;

				while (node = nodes[i--]){
					if (node.nodeType !== 1) continue;

					if (!~html.indexOf(node)){
						element.removeChild(node);
					}
				}
			}

			for (var i=0, l=html.length; i<l; ++i){
				var child = html[i];
				if (!child) continue;

				if (utils.isPlainObject(child)){
					child = utils.dom.create(child);
				}

				if (child.parentNode !== element){
					element.appendChild(child);
				}
			}
		}

		utils.el.cache(element, 'html', html);
	};
	this.el.style = function (element, key, value){
		var style = utils.toSetterObject(key, value);

		if (style){
			var transform 	= null;
			var cache 		= utils.el.cache(element, 'style') || {};

			for (var key in style){
				var value = style[key];
				var old   = cache[key];

				// skip the update if same
				if (value === old){
					continue;
				}
				// @fix IE10 has a bug with NULL, so force ''
				if (value === null){
					value = '';
				}

				// is a transforms value
				if (~DOM.TRANSFORMS.indexOf(key)){
					transform 		= transform || {};
					transform[key] 	= value;

					// @info the transform cache needs to be cleared
					delete(cache.transform);

					continue;
				}

				// clear the transforms
				if (key === 'transform'){
					transform = null;
					utils.el.cache(element, 'transforms', {});
				}

				// basic
				key 		= utils.string.toDashCase(key);
				cache[key] 	= value;

				// make sure the numbers are not missing their unit (px by default)
				if ((typeof value === 'number' || typeof value === 'string') && ~DOM.PX_VALUES.indexOf(key)){
					// @todo make sure to skip when there's a calc() in the value (to keep value without units)
					value = value.toString().replace(DOM.RE.CSS_NUMBER, function (m, $1){
						var v = utils.number.limitDecimals($1, 4);
						return v + 'px';
					});
				}

				// format the URL to be well formated (with the "url(...)" wrapper)
				if (typeof value === 'string' && ~DOM.URL_VALUES.indexOf(key)){
					value = value.replace(DOM.RE.CSS_URL, 'url("$1")');
				}

				if (key.match(/^\-\-/)){
					element.style.setProperty(key, value);
				}else{
					element.style[key] = value;
				}

			}

			utils.el.cache(element, 'style', cache);

			if (transform){
				utils.dom.transform(element, transform);
			}
		}else{
			var style     = window.getComputedStyle ? window.getComputedStyle(element) : {};
			var transform = utils.el.cache(element, 'transforms') || {};

			if (key in style){
				return style[key];
			}else if (key in transform){
				return transform[key];
			}else if (key !== undefined){
				return null;
			}else{
				style = utils.each(style, {'filter':true}, function (value, key){
					if (!isNaN(key)) return;
					return value;
				});
				for (var i in transform){
					style[i] = transform[i];
				}

				return style;
			}
		}
	};
	this.el.transform = function (element, values, args){
		args          = args || {};
		args.decimals = 'decimals' in args ? args.decimals : false;

		//if (args.pixelPerfect === undefined) args.pixelPerfect = true;

		var transforms 	= utils.el.cache(element, 'transforms') || {};
		var output 		= [];

		if (values === undefined){
			return transforms;
		}else if (!values){
			values 		= {};
			transforms 	= {};
		}

		for (var i in values){
			var value = values[i];

			if (value === ''){
				delete(transforms[i]);
			}else{
				transforms[i] = value;
			}
		}

		// shortcuts
		if (values.translate === ''){
			delete(transforms.translateY);
			delete(transforms.translateX);
		}else if (values.translate !== undefined){
			transforms.translateX = values.translate;
			delete(transforms.translateY);
		}
		if (values.scale === ''){
			delete(transforms.scaleX);
			delete(transforms.scaleY);
		}else if (values.scale !== undefined){
			transforms.scaleX = values.scale;
			transforms.scaleY = values.scale;
		}
		if (values.rotate !== undefined){
			transforms.rotateZ = values.rotate;
		}

		// output
		if (transforms.perspective !== undefined){
			var p = (transforms.perspective || 0);
			if (typeof p === 'number') p += 'px';
			output.push('perspective('+p+')');
		}

		if (transforms.perspectiveX !== undefined){
			var x = transforms.perspectiveX || 0;
			var y = transforms.perspectiveY || 0;

			if (typeof x === 'number') x += 'px';
			if (typeof y === 'number') y += 'px';

			element.style.perspectiveOrigin = x + ' ' + y;
		}

		if (transforms.translateX !== undefined || transforms.translateY !== undefined || transforms.translateZ !== undefined){
			var x = (transforms.translateX || 0);
			var y = (transforms.translateY || 0);
			var z = (transforms.translateZ || 0);

			if (typeof x === 'number'){
				if (!args.decimals) x = parseInt(x, 10);
				x += 'px';
			}
			if (typeof y === 'number'){
				if (!args.decimals) y = parseInt(y, 10);
				y += 'px';
			}
			if (typeof z === 'number'){
				if (!args.decimals) z = parseInt(z, 10);
				z += 'px';
			}

			output.push('translate3d('+x+','+y+','+z+')');
		}

		if (transforms.scaleX !== undefined || transforms.scaleY !== undefined || transforms.scaleZ !== undefined){
			var x = transforms.scaleX !== undefined ? transforms.scaleX : 1;
			var y = transforms.scaleY !== undefined ? transforms.scaleY : 1;
			var z = transforms.scaleZ !== undefined ? transforms.scaleZ : 1;
			output.push('scale3d('+x+','+y+','+z+')');
		}

		if (transforms.rotateX !== undefined){
			var r = (transforms.rotateX || 0);
			if (typeof r === 'number') r += 'deg';
			output.push('rotateX('+r+')');
		}
		if (transforms.rotateY !== undefined){
			var r = (transforms.rotateY || 0);
			if (typeof r === 'number') r += 'deg';
			output.push('rotateY('+r+')');
		}
		if (transforms.rotateZ !== undefined){
			var r = (transforms.rotateZ || 0);
			if (typeof r === 'number') r += 'deg';
			output.push('rotateZ('+r+')');
		}

		if (transforms.skewX !== undefined || transforms.skewY !== undefined){
			var x = (transforms.skewX || 0);
			var y = (transforms.skewY || 0);

			if (typeof x === 'number') x += 'deg';
			if (typeof y === 'number') y += 'deg';

			output.push('skew('+skewX+','+skewY+')');
		}

		if (transforms.centerX !== undefined || transforms.centerY !== undefined){
			var x = transforms.centerX || 0;
			var y = transforms.centerY || 0;

			if (typeof x === 'number') x += 'px';
			if (typeof y === 'number') y += 'px';

			element.style.transformOrigin = x + ' ' + y;
		}

		element.style.transform = output.join(' ');

		// cache old transforms
		this.cache(element, 'transforms', transforms);
	};

	this.el.isVisible = function (element){
		return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

	this.el.show = function (element, force){
		var isVisible 	= utils.el.isVisible(element);
		var el, last, parent;

		if (!isVisible){
			if (force){
				el = element;
				while (!last && el){
					parent = el.parentNode;

					if (parent && utils.el.isVisible(parent)){
						last = parent;
					}else{
						_show(parent);
					}

					el = parent;
				}
			}

			_show(element);
		}

		function _show (el){
			var style 	= window.getComputedStyle ? window.getComputedStyle(el) : el.style;
			var display = style.display || 'block';
			var tag     = el.tagName.toLowerCase();

			el._display = el.style.display || '';

			// first, try to show the element by removing the display value
			el.style.display = '';

			if (!utils.el.isVisible(el)){
				if (display === 'none'){
					if (tag === 'span')	 					display = 'inline';
					else if (tag === 'li') 					display = 'list-item';
					else if (tag === 'table') 				display = 'table';
					else if (tag === 'td' || tag === 'th') 	display = 'table-cell';
					else if (tag === 'tr')					display = 'table-row';
					else if (tag === 'caption')				display = 'table-caption';
					else 									display = 'block';
				}

				el.style.display = display;
			}
		}

		function _cancel (){
			if (last){
				el = element;

				while (el !== last && (el = el.parentNode)){
					el.style.display = el._display;
				}
			}

			element.style.display = element._display;
		}

		return _cancel;
	};

	this.el.bounds = function (element){
		if (element === window || element === document){
			element = document.body;
		}

		var padding = [0,0,0,0];
		var border  = [0,0,0,0];
		var margin  = [0,0,0,0];
		var bounds 	= {};

		if (element){
			var style = window.getComputedStyle(element);
			padding = DOM.extractCss(style, 'padding-{direction}');
			border  = DOM.extractCss(style, 'border-{direction}-width');
			margin  = DOM.extractCss(style, 'margin-{direction}');
			bounds 	= element.getBoundingClientRect();
		}else{
			padding.horizontal = padding.vertical = 0;
			border.horizontal  = border.vertical  = 0;
			margin.horizontal  = margin.vertical  = 0;
			element = {};
		}

		var x 		= bounds.left + (window.scrollX || window.pageXOffset || 0);
		var y 		= bounds.top + (window.scrollY || window.pageYOffset || 0);
		var height 	= (element.clientHeight || bounds.height || 0);
		var width	= (element.clientWidth || bounds.width || 0);
		var data 	= {};

		data 				= utils.math.toBounds([x + border[3] + padding[3], y + border[0] + padding[0], width - padding.horizontal, height - padding.vertical]);
		data.paddingBox		= utils.math.toBounds([x + border[3], y + border[0], width, height]);
		data.borderBox 		= utils.math.toBounds([x, y, width + border.horizontal, height + border.vertical]);
		data.marginBox 		= utils.math.toBounds([x - margin[3], y - margin[0], width + border.horizontal + margin.horizontal, height + border.vertical + margin.vertical]);
		data.viewport 		= utils.math.toBounds([bounds.left, bounds.top, bounds.width, bounds.height]);

		data.padding 		= padding;
		data.margin 		= margin;
		data.border 		= border;

		data.scale 			= (Math.round(bounds.width) / element.offsetWidth) || 1;
		data.scrollTop 		= element.scrollTop || 0;
		data.scrollLeft 	= element.scrollLeft || 0;
		data.scrollHeight 	= element.scrollHeight !== element.clientHeight ? element.scrollHeight : 0;
		data.scrollWidth 	= element.scrollWidth !== element.clientWidth ? element.scrollWidth : 0;

		return data;
	};

	this.el.scrollpane = function (element, args){
		args = args || {};

		var scrollpane = null;
		while (element && !scrollpane){
			if (element === window || element === document || element === document.body || element.tagName.toLowerCase() === 'html') break;

			var style 		= window.getComputedStyle(element);
			var overflowY 	= style.getPropertyValue('overflow-y');
			var scrollHeight= element.scrollHeight;
			var clientHeight= element.clientHeight;

			if (overflowY === 'scroll' || (overflowY === 'auto' && scrollHeight > clientHeight)){
				scrollpane = element;
			}

			/*
			(includeHidden && (overflowY === 'scroll' || (overflowY !== 'visible' && element.scrollHeight > element.clientHeight))) ||
			(!includeHidden && (overflowY === 'scroll' || (overflowY == 'auto' && element.scrollHeight > element.clientHeight)))
			*/

			element = element.parentNode;
		}

		if (!scrollpane){
			scrollpane = window;
		}

		return scrollpane;
	};
	this.el.scrollInfo = function (element, key){
		var isDoc = element === window || element === document;

		var info = {
			'width'			: isDoc ? window.innerWidth : element.clientWidth,
			'height'		: isDoc ? window.innerHeight : element.clientHeight,
			'innerWidth'	: isDoc ? document.documentElement.scrollWidth : element.scrollWidth,
			'innerHeight'	: isDoc ? document.documentElement.scrollHeight : element.scrollHeight,
			'scrollLeft'	: isDoc ? window.pageXOffset : element.scrollLeft,
			'scrollTop'		: isDoc ? window.pageYOffset : element.scrollTop,
		};

		info.x 				 = info.scrollLeft;
		info.y 				 = info.scrollTop;
		info.scrollBottom 	 = info.scrollTop + info.height;
		info.scrollRight 	 = info.scrollLeft + info.width;
		info.maxScrollWidth  = info.innerWidth - info.width;
		info.maxScrollHeight = info.innerHeight - info.height;
		info.progressX		 = (info.scrollLeft / info.maxScrollWidth) || 0;
		info.progressY		 = (info.scrollTop / info.maxScrollHeight) || 0;
		info.atStartX 		 = info.scrollLeft === 0;
		info.atEndX			 = info.progressX === 1 || (info.innerWidth <= info.width);
		info.atStartY 		 = info.scrollTop === 0;
		info.atEndY			 = info.progressY === 1 || (info.innerHeight <= info.height);

		return key ? info[key] : info;
	};
	this.el.scrollTo = function (element, x, y){
		if (typeof x === 'string' || typeof y === 'string'){
			var info = utils.dom.scrollInfo(element);
			x = utils.math.get(x, {'max':info.maxScrollWidth});
			y = utils.math.get(y, {'max':info.maxScrollHeight});
		}

		if (element === window || element === document){
			window.scrollTo(x, y);
		}else{
			if (!isNaN(x)){
				element.scrollLeft = x;
			}
			if (!isNaN(y)){
				element.scrollTop = y;
			}
		}
	};

	this.el.offsetParent = function (element){
		if (element.offsetParent){
			return element.offsetParent;
		}else{
			// for some elements, the offsetParent is always null
			while (element && element !== document){
				element = element.parentNode;

				var style = window.getComputedStyle(element);
				if (style.position !== 'static'){
					return element;
				}
			}

			return window.body;
		}
	};
	this.el.offsetPosition = function (element, parent){
		var parent   = parent ? utils.dom.get(parent) : utils.el.offsetParent(element);
		var pBounds  = utils.el.bounds(parent).viewport;
		var bounds 	 = utils.el.bounds(element).viewport;

		return {
			'offsetX'		: bounds.x - pBounds.x,
			'offsetY' 		: bounds.y - pBounds.y,
			'element' 		: element,
			'parent' 		: parent,
			'elementBounds' : bounds,
			'parentBounds' 	: pBounds,
		};
	};

	this.el.moveTo = function (element, target, args){
		args 			= args || {};
		args.origin 	= 'origin' in args ? args.origin : [0,0];
		args.position 	= 'position' in args ? args.position : [0,0];
		args.offsetX 	= 'offsetX' in args ? args.offsetX : 0;
		args.offsetY 	= 'offsetY' in args ? args.offsetY : 0;
		args.type 		= 'type' in args ? args.type : null;
		args.clean 		= 'clean' in args ? args.clean : false;
		args.onComplete = 'onComplete' in args ? args.onComplete : null;

		target = utils.dom.get(target);

		var parent   = utils.el.offsetParent(element);
		var pBounds  = utils.el.bounds(parent).viewport;
		var tBounds  = utils.el.bounds(target).viewport;
		var eBounds  = utils.el.bounds(element);

		var origin   = utils.math.toPointInRect({'width':eBounds.width, 'height':eBounds.height}, args.origin);
		var position = utils.math.toPointInRect(tBounds, args.position);
		var point    = {
			'x' : (position.x - pBounds.x) - origin.x + args.offsetX,
			'y' : (position.y - pBounds.y) - origin.y + args.offsetY,
		};

		//

		var style = {};
		if (args.type === 'transform'){
			style.translateX = position.x - eBounds.viewport.x - origin.x + args.offsetX;
			style.translateY = position.y - eBounds.viewport.y - origin.y + args.offsetY;
		}else{
			style.left 	   	= point.x;
			style.top    	= point.y;
			style.position 	= 'absolute';
		}

		// animated
		if (args.duration){
			utils.el.transition(element, style, {
				'duration' 	: args.duration,
				'easing'	: args.easing,
				'onComplete': _done,
			});
		}else{
			utils.el.style(element, style);
			_done();
		}

		function _done (){
			if (args.clean){
				utils.el.style(element, {
					'translateX'	: '',
					'translateY'	: '',
					'left'			: '',
					'top'			: '',
					'position'		: '',
				});
			}

			if (typeof args.onComplete === 'function'){
				args.onComplete();
			}
		}
	};
	this.el.swapElement = function (from, to, args){
		to = utils.dom.get(to);

		args 			= args || {};
		args.duration 	= utils.string.toDuration('duration' in args ? args.duration : 1000);
		args.animation 	= 'animation' in args ? args.animation : 'cross-fade';
		args.remove 	= 'remove' in args ? args.remove : false;
		args.onComplete	= 'onComplete' in args ? args.onComplete : utils.fn.empty;
		args.easing 	= 'easing' in args ? args.easing : null;
		args.context	= 'context' in args ? args.context : null;

		var fOffset 	= utils.el.offsetPosition(from);
		from.style.display = '';
		to.style.display   = '';
		var tBounds 	= utils.dom.bounds(to);

		var fProps       = {};
		var tProps       = {};
		var fDuration    = args.duration;
		var tDuration    = args.duration;
		var fPause 	 	 = 0;
		var tPause 		 = 0;

		if (args.animation === 'fade' || args.animation === 'cross-fade'){
			fProps = {
				'opacity'  :[1,0],
				'!position':'absolute',
				'!top'     : fOffset.offsetY,
				'!left'	   : fOffset.offsetX,
				'!width'   : fOffset.elementBounds.width,
			};

			tProps = {
				'opacity'	: [0, 1],
				'height'	: [fOffset.element.height, tBounds.height]
			};

			if (args.animation === 'fade'){
				fDuration 	/= 2;
				tDuration 	/= 2;
				tPause 		= fDuration;
			}
		}else if (args.animation === 'scale'){
			fProps = {
				'scale' 	: [1, 0.5],
				'opacity'	: [1,0],
				'!position'	: 'absolute',
				'!top'      : fOffset.offsetY,
				'!left'	   	: fOffset.offsetX,
				'!width'	: fOffset.elementBounds.width,
			};
			tProps = {
				'scale' 	: [1.5, 1],
				'opacity'	: [0,1],
			};
		}else{
			_done();
			return;
		}

		utils.dom.transition(from, fProps, {
			'easing'	: args.easing,
			'duration'	: fDuration,
		});

		utils.dom.transition(to, tProps, {
			'easing'	: args.easing,
			'duration'	: tDuration,
			'pause'		: tPause,
			'clean' 	: true,
			'onComplete': _done
		});


		function _done (){
			if (args.remove){
				utils.dom.remove(from);
			}else{
				from.style.display = 'none';
			}

			args.onComplete.apply(args.context, [from, to]);
		}
	};
	this.el.zoom = function (element, args){
		if (!args){
			 return;
		}

		args 		= args || {};
		args.width 	= args.width || 0;
		args.height = args.height || 0;
		args.style  = 'style' in args ? args.style : 'absolute';

		if (!args.width || !args.height){
			if (utils.el.is(element, 'video')){
				args.width  = element.videoWidth;
				args.height = element.videoHeight;
			}else if (utils.el.is(element, 'iframe')){
				// @todo
			}else if (utils.el.is(element, 'img')){
				args.width  = element.naturalWidth;
				args.height = element.naturalHeight;
			}else{
				// @todo ... what other types
			}
		}

		var zoom = utils.math.focus(args.width, args.height, args);

		if (args.style === 'transform'){
			element.style.transform 		= zoom.transform;
			element.style.transformOrigin 	= 'top left';
			element.style.width				= args.width + 'px';
			element.style.height 			= args.height + 'px';
		}else if (args.style === 'background'){
			// @todo
		}else{
			element.style.position 	= args.style === 'relative' ? 'relative' : 'absolute';
			element.style.top 		= -zoom.y + 'px';
			element.style.left 		= -zoom.x + 'px';
			element.style.width		= zoom.width + 'px';
			element.style.height	= zoom.height + 'px';
		}
	};

	this.el.deferClick = function (element, args){
		var isPreClicked = false;
		var isClicked    = false;
		var isTouch 	 = false;

		utils.el.addEvent(element, 'click', function (e){
			if (!isTouch){
				isClicked = isPreClicked;
			}
			if (!isClicked){
				e.preventDefault();
			}
			if (isPreClicked){
				isClicked = true;
			}

			isTouch = false;
		});
		utils.el.addEvent(element, 'mouseenter', function (e){
			isPreClicked = true;
		});
		utils.el.addEvent(element, 'mouseleave', function (e){
			isPreClicked = false;
			isClicked    = false;
		});
		utils.el.addEvent(element, 'touchend', function (e){
			isTouch = true;
		});
	};

	// extra functions
	this.el.splitText = function (element, args){
		element.innerHTML = utils.string.splitText(element.innerHTML, args);
	};

	this.el.beautifySelect = function (element){
		var data = utils.el.cache(element);

		if (!data.isBeautiful){
			// html
			var elements = utils.dom.create('<span class="dropdown" style="cursor:pointer; position:relative;">\
				<label element="label" class="dropdown-label"></label>\
				<span class="dropdown-knob"></span>\
			</span>', {'extract':'element'});

			utils.el.add(elements.self, 'after', element);
			utils.el.add(element, elements.self);

			utils.el.style(element, {
				'background'	: 'none',
				'opacity'	    : 0,
				'position'	    : 'absolute',
				'top'	        : 0,
				'right'	        : 0,
				'bottom'	    : 0,
				'left'	        : 0,
				'width'	        : '100%',
				'height'	    : '100%',
				'z-index'	    : 1,
			});

			// events
			utils.el.addEvent(element, 'change', _render);
			utils.el.onMutation(element, 'childList,attributes,subtree', _render);

			// functions
			function _render (){
				var value 	= element.value;
				var index 	= element.selectedIndex;
				var child 	= element.children[index];

				if (child){
					var label = child.getAttribute('data-label') || child.text;
					elements.label.innerHTML = label || '';
				}
			}

			_render();

			utils.el.cache(element, {
				'render'	  : _render,
				'isBeautiful' : true,
			});
		}
	};

	this.el.hoverParts = function (element, partSelector, args){
		args 			= args || {};
		args.classname 	= 'classname' in args ? args.classname : 'is-hovered';

		utils.el.addEvent(element, 'mouseenter', {'delegate':partSelector, 'callback':function (){
			utils.el.addClass(element, args.classname);
		}});

		utils.el.addEvent(element, 'mouseleave', {'delegate':partSelector, 'callback':function (){
			utils.el.removeClass(element, args.classname);
		}});
	};

	// elements ----------------------------------------------------------------
	this.els.onOutside = function (elements, args){
		elements 		= utils.dom.getAll(elements);

		args 			= (typeof args === 'function' ? {'outside':args} : args) || {};
		args.context 	= 'context' in args ? args.context : null;
		args.outside 	= 'outside' in args ? args.outside : utils.fn.empty;
		args.inside 	= 'inside' in args ? args.inside : utils.fn.empty;
		args.delayed 	= 'delayed' in args ? args.delayed : false;
		args.now 		= 'now' in args ? args.now : true;

		var _isDelayed   = false;
		var _isListening = false;

		/*
		if (args.context === undefined) args.context = null;
		if (args.outside === undefined) args.outside = null;
		if (args.inside === undefined) 	args.inside = null;
		if (args.now === undefined) 	args.now = true;
		*/

		function _click (e){
			var isOutside = true;

			for (var i=0, l=elements.length; i<l; ++i){
				var element = elements[i];
				if (utils.dom.contains(element, e.target)){
					isOutside = false;
				}
			}

			if (isOutside && typeof args.outside === 'function' && !_isDelayed){
				args.outside.call(args.context);
			}else if (!isOutside && typeof args.inside === 'function'){
				args.inside.call(args.context);
			}
		}

		function _delay (time){
			_isDelayed = true;

			setTimeout(function (){
				_isDelayed = false;
			}, time || 30);
		}

		function _on (){
			if (_isListening) return;
			document.addEventListener('click', _click);
			_isListening = true;
		}

		function _off (){
			document.removeEventListener('click', _click);
			_isListening = false;
		}

		if (args.now){
			_on();
		}

		return {
			'elements'	: elements,
			'on'		: _on,
			'off'		: _off,
			'delay'		: _delay,
		}
	};

	this.els.onMediaLoad = function (elements, args){
		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		args.types 		= 'types' in args ? args.types : 'img,video,audio,iframe';
		args.context 	= 'context' in args ? args.context : null;
		args.onLoad 	= 'onLoad' in args ? args.onLoad : utils.fn.empty;
		args.onComplete = 'onComplete' in args ? args.onComplete : utils.fn.empty;

		var images  = utils.dom.getAll('img', {'context':elements, 'includeContext':true});
		var videos  = []; // @todo
		var audios 	= []; // @todo
		var iframes = []; // @todo
		var medias 	= [];
		var total   = images.length + videos.length + audios.length + iframes.length;

		utils.media.getImages(images, {
			'context'	: args.context,
			'onLoad'	: args.onLoad,
			'onComplete': _onComplete
		});

		function _onComplete (items){
			medias = medias.concat(items);

			if (medias.length >= total){
				args.onComplete.call(args.context, medias);
			}
		};
	};

	this.els.equalHeight = function (elements){
		var rows = {};

		// reset and get the height of the elements
		for (var i in elements){
			var element = elements[i];

			element.style.height = '';

			var bounds 	= utils.el.bounds(element);
			var row 	= rows[bounds.top];

			if (row === undefined){
				row = rows[bounds.top] = {
					'top'		: top,
					'elements'	: [],
					'height'	: 0,
				};
			}

			row.height = Math.max(row.height, bounds.height);
			row.elements.push(element);
		}

		for (var i in rows){
			var row = rows[i];

			// skip if only 1 elements
			if (row.elements.length <= 1) continue;

			for (var ii=0, ll=row.elements.length; ii<ll; ++ii){
				var element = elements[ii];
				element.style.height = row.height + 'px';
			}
		}
	};

	// dom ---------------------------------------------------------------------
	// add all private function and do a check first that it's an HtmlElement
	for (var i in this.el){
		this.dom[i] = (function (fct){
			return function (element){
				arguments[0] = utils.dom.get(element);
				return utils.el[fct].apply(this, arguments);
			}
		}(i));
	}
	for (var i in this.els){
		this.dom[i] = (function (fct){
			return function (element){
				arguments[0] = utils.dom.getAll(element);
				return utils.els[fct].apply(this, arguments);
			}
		}(i));
	}

	this.dom.onReady = function (callback){
		if (document.readyState === 'complete' || (document.readyState !== "loading" && !document.documentElement.doScroll)){
			DOM.isReady = true;
		}

		if (DOM.isReady === true){
			callback();
		}else{
			DOM.readyEvents.push(callback);

			if (DOM.isReady === false){
				DOM.isReady = 'loading';
				document.addEventListener('DOMContentLoaded', DOM.ready);
				window.addEventListener('load', DOM.ready);
			}
		}
	};
	this.dom.onLoad = function (callback){
		if (document.readyState === 'complete'){
			DOM.isLoaded = true;
		}

		if (DOM.isLoaded === true){
			callback();
		}else{
			DOM.loadEvents.push(callback);

			if (DOM.isLoaded === false){
				DOM.isLoaded = 'loading';
				window.addEventListener('load', DOM.loaded);
			}
		}
	};
	this.dom.isReady = function (){
		return DOM.isReady;
	};
	this.dom.isLoaded = function (){
		return DOM.isLoaded;
	};

	this.dom.isNode = function (item){
		return typeof Node === "object" ? item instanceof Node : item && typeof item === "object" && typeof item.nodeType === "number" && typeof item.nodeName==="string";
	};
	this.dom.isElement = function (item){
		return typeof HTMLElement === "object" || typeof SVGElement === 'object' ?
			item instanceof HTMLElement || item instanceof SVGElement :
			item && typeof item === "object" && item !== null && item.nodeType === 1 && typeof item.nodeName==="string";
	};
	this.dom.isDomElement = function (item){
		return item === window || item === document || utils.dom.isElement(item);
	};
	this.dom.isQuery = function (item){
		return (window.jQuery && item instanceof jQuery) || (window.Query && item instanceof Query);
	};

	this.dom.get = function (selector, args){
		args 				= args || {};
		args.single 		= 'single' in args ? args.single : true;
		args.includeContext = 'includeContext' in args ? args.includeContext : false;
		args.onlyElements 	= 'onlyElements' in args ? args.onlyElements : false;
		args.context 		= args.context || [document];
		args.context		= args.context instanceof Array ? args.context : [args.context];

		var elements = [];
		var contexts = [];

		// check context
		for (var i=0, l=args.context.length; i<l; ++i){
			var ctx = args.context[i];
			if (!ctx) continue;

			// make sure the element is a domElement
			if (!utils.dom.isDomElement(ctx)){
				ctx = utils.dom.get(ctx);
			}

			contexts.push(ctx);

			// include the current context if it's the same thing as the selector
			if (args.includeContext && utils.el.is(ctx, selector)){
				elements.push(ctx);
			}
		}
		/*
		if (!contexts.length){
			contexts = [document];
		}
		*/

		// domElement
		if (utils.dom.isDomElement(selector)){
			elements.push(selector);
		// nodeElement
		}else if (utils.dom.isNode(selector)){
			elements.push(args.onlyElements ? selector.parentNode : selector);
		// jQuery or Query
		}else if (utils.dom.isQuery(selector)){
			elements = elements.concat(selector.get());
		// create html
		}else if (typeof selector === 'string' && selector.trim()[0] === '<'){
			var fragment = document.createElement('div');
			fragment.innerHTML = selector;

			var els  = utils.toArray(fragment.children);
			elements = elements.concat(els);
		// find elements by string OR function
		}else if (selector && typeof selector === 'string' || typeof selector === 'function'){
			for (var i=0, l=contexts.length; i<l; ++i){
				var ctx = contexts[i];
				var els = [];

				try{
					if (typeof selector === 'string' && ctx && typeof ctx.querySelectorAll === 'function'){
						// scope fix (add a custom attribute as a prefix)
						// @polyfill https://github.com/jonathantneal/element-qsa-scope/blob/master/index.js
						if (ctx !== document){
							var attr = utils.string.generateId('attr');
							ctx.setAttribute(attr, '');
							els = ctx.querySelectorAll('['+attr+'] ' + selector);
							ctx.removeAttribute(attr);
						}else{
							els = ctx.querySelectorAll(selector);
						}
					}else if (typeof selector === 'function'){
						els = selector(ctx);
					}
				}catch (e){
					els = [];
				}

				els 	 = utils.toArray(els);
				elements = elements.concat(els);
			}
		// is an array
		}else if (selector instanceof Array){
			for (var i=0, l=selector.length; i<l; ++i){
				var els = utils.dom.getAll(selector[i], {'context':args.contexts, 'onlyElements':args.onlyElements});
				elements = elements.concat(els);
			}
		}

		if (args.single){
			return elements[0];
		}else{
			return utils.toArray(elements);
		}
	};

	this.dom.getAll = function (selector, args){
		args        = args || {};
		args.single = false;
		return this.get(selector, args);
	};

	this.dom.create = function (tag, args){
		// @info if the tag is in the args
		if (utils.isPlainObject(tag)){
			args = tag;
			tag  = args.tag || 'div';
		}

		if (typeof tag === 'string'){
			tag = tag.trim();
		}

		args 	 			= args || {};
		args.defaultTag 	= args.defaultTag || 'div';
		args.returnWrapper 	= args.returnWrapper || false;
		args.svg 			= args.svg || false;
		args.extract 		= args.extract || false;

		function _create (tag){
			return args.svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
		}

		var element;
		// already a dom element
		if (utils.dom.isDomElement(tag)){
			element = tag;
		// namespace / tag
		}else if (Array.isArray(tag)){
			element = document.createElementNS(tag[0], tag[1]);
		// html
		}else if (typeof tag === 'string' && tag[0] === '<'){
			var fragment = _create(args.defaultTag);
			fragment.innerHTML = tag;

			if (args.returnWrapper){
				element = fragment;
			}else{
				element = fragment.children[0];
			}
		// css selector
		}else if (typeof tag === 'string'){
			var items = tag.match(DOM.RE.CSS_SELECTOR);

			if (items){
				tag = null;
			}else{
				items = [];
			}

			//eg.: div#id.classname.classname2[alt=image, title=title]{border:1px solid black}=the content
			for (var i=0, l=items.length; i<l; ++i){
				var item 	= items[i];
				var prefix 	= item[0];
				var value 	= item.substr(1);

				// styles: {color:red, fontSize:14}
				if (prefix === '{'){
					var style = value.substring(0, value.length-1).split(',');
					for (var ii=0, ll=style.length; ii<ll; ++ii){
						var pair 	= style[ii].trim().split(':');
						var key 	= pair[0];
						var value 	= pair[1];
						args.style 		= args.style || {};
						args.style[key] = value;
					}
				// attrs: [id=item, alt=image]
				}else if (prefix === '['){
					var attrs = value.substring(0, value.length-1).split(',');
					for (var ii=0, ll=attrs.length; ii<ll; ++ii){
						var pair 	= attrs[ii].trim().split('=');
						var key 	= pair[0];
						var value 	= pair[1];
						args.attrs 		= args.attrs || {};
						args.attrs[key] = value;
					}
				// classname: .class
				}else if (prefix === '.'){
					args.classnames = args.classnames || [];
					args.classnames.push(value);
				// id: #itemId
				}else if (prefix === '#'){
					args.attrs 	  = args.attrs || {};
					args.attrs.id = value;
				// html: =This is the html
				}else if (prefix === '='){
					args.html = value;
				// tag: div
				}else{
					tag = item;
				}
			}

			element = _create(tag || args.defaultTag);
		}

		utils.el.update(element, args);

		if (args.extract){
			return utils.el.extract(element, {'single':args.extract});
		}else{
			return element;
		}


		/*
		args.defaultTag = 'defaultTag' in args ? args.defaultTag : 'div';
		args.defaultTag = 'defaultTag' in args ? args.defaultTag : 'div';
		args.defaultTag = 'defaultTag' in args ? args.defaultTag : 'div';
		args.children = 'children' in args ? args.children : 'html' in args 'div';

		args.parent 		= args.parent || args.appendTo || null;
		args.children 		= args.parent || args.appendTo || null;

		/*

		if (typeof tag === 'object'){
			args = tag;
			tag  = args.tag || 'div';
		}

		args = args || {};

		if (args.defaultTag === undefined) 		args.defaultTag = 'div';
		if (args.returnWrapper === undefined) 	args.returnWrapper = false;
		if (args.parent === undefined)			args.parent = args.appendTo || null;

		if (args.id === undefined)				args.id = null;
		if (args.style === undefined)			args.style = {};
		if (args.attrs === undefined)			args.attrs = {};
		if (args.classnames === undefined)		args.classnames = [];
		if (args.html === undefined) 			args.html = '';
		if (args.svg === undefined)				args.svg = false;
		if (args.children === undefined)		args.children = [];

		if (args.extract === undefined)			args.extract = null;

		if (typeof tag === 'string'){
			tag = tag.trim();
		}

		function _create (tag){
			return args.svg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
		}

		var element;
		// namespace / tag
		if (utils.dom.isDomElement(tag)){
			element = tag;
		}else if (Array.isArray(tag)){
			element = document.createElementNS(tag[0], tag[1]);
		// html
		}else if (typeof tag === 'string' && tag[0] === '<'){
			var fragment = _create(args.defaultTag);
			fragment.innerHTML = tag;

			if (args.returnWrapper){
				element = fragment;
			}else{
				element = fragment.children[0];
			}
		// css selector
		}else if (typeof tag === 'string'){
			var items = tag.match(DOM.RE.CSS_SELECTOR);

			if (items){
				tag = null;
			}else{
				items = [];
			}

			for (var i=0, l=items.length; i<l; ++i){
				var item 	= items[i];
				var prefix 	= item[0];
				var value 	= item.substr(1);

				if (prefix === '{'){
					var style = value.substring(0, value.length-1).split(',');
					for (var ii=0, ll=style.length; ii<ll; ++ii){
						var pair 	= style[ii].trim().split(':');
						var key 	= pair[0];
						var value 	= pair[1];
						args.style[key] = value;
					}
				}else if (prefix === '['){
					var attrs = value.substring(0, value.length-1).split(',');
					for (var ii=0, ll=attrs.length; ii<ll; ++ii){
						var pair 	= attrs[ii].trim().split('=');
						var key 	= pair[0];
						var value 	= pair[1];
						args.attrs[key] = value;
					}
				}else if (prefix === '.'){
					args.classnames.push(value);
				}else if (prefix === '#'){
					args.attrs.id = value;
				}else if (prefix === '='){
					args.html = value;
				}else{
					tag = item;
				}
			}

			element = _create(tag || args.defaultTag);
		}

		if (args.id){
			args.attrs.id = args.id;
		}

		utils.el.attrs(element, args.attrs);
		utils.el.style(element, args.style);
		utils.el.addClass(element, args.classnames);

		if (args.html){
			element.innerHTML = args.html;
		}

		if (args.parent){
			utils.dom.add(element, args.parent);
		}

		if (args.children instanceof Array){
			for (var i=0, l=args.children.length; i<l; ++i){
				var child = args.children[i];
				var cArgs = {};

				if (typeof child === 'object' && 'tag' in child){
					cArgs = child;
					child = child.tag;
				}

				cArgs.parent = element;
				cArgs.svg 	 = args.svg;

				utils.dom.create(child, cArgs);
			}
		}

		if (args.extract){
			return utils.el.extract(element, {'single':args.extract});
		}else{
			return element;
		}
		*/
	};

	// not sure if used anymore
	this.dom.parse = function (selector, args){
		var element = utils.dom.get(selector);

		args = args || {};
		if (args.html === undefined) 				args.html = '';
		if (args.create === undefined) 				args.create = false;
		if (args.extract === undefined) 			args.extract = null;
		if (args.appendTo === undefined)			args.appendTo = null;
		if (args.id === undefined && args.create) 	args.id = 'element_'+utils.string.generateId();

		// create the element if it does not exists
		if (!element && args.create){
			var tagName = typeof args.create === 'string' ? args.create : 'div';
			document.write('<'+tagName+' id="'+args.id+'"></'+tagName+'>');
			element = document.getElementById(args.id);
		}

		// save the ID
		if (args.id){
			element.setAttribute('id', args.id);
		}

		// setup the HTML if it's not already there
		if (args.html){
			element.innerHTML = args.html;
		}

		// append to root
		if (args.appendTo){
			utils.el(element, args.appendTo);
		}

		if (args.extract){
			var elements = {'self':element};
			var children = element.querySelectorAll('['+args.extract+']');

			for (var i=0, l=children.length; i<l; ++i){
				var child = children[i];
				var name  = child.getAttribute(args.extract);
				elements[name] = child;
			}

			return elements;
		}else{
			return element;
		}
	}

	this.dom.lazy = function (selector, args){
		if (typeof selector === 'function'){
			args     = selector;
			selector = null;
		}

		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		args.context 	= 'context' in args ? args.context : null;
		args.onLoad 	= 'onLoad' in args ? args.onLoad : utils.fn.empty;
		args.onComplete = 'onComplete' in args ? args.onComplete : utils.fn.empty;
		args.cleanRatio = 'cleanRatio' in args ? args.cleanRatio : true;

		var context 	= selector ? utils.dom.getAll(selector) : null;
		var elements 	= utils.dom.getAll('[lazy-src], [lazy-bg]', {'context':context});
		var queue		= utils.fn.queue(function (){
			if (typeof args.onComplete === 'function'){
				args.onComplete.apply(args.context, [elements]);
			}
		});

		utils.each(elements, function (el){
			var bg   = el.getAttribute('lazy-bg');
			var src  = el.getAttribute('lazy-src');
			var img  = utils.media.getImageSrc(bg || src);
			var done = queue.add();

			utils.media.getImage(img, function (image){
				if (args.cleanRatio){
					el.style.paddingTop = '';
				}

				if (bg){
					el.style.backgroundImage = 'url('+bg+')';
				}
				if (src){
					el.setAttribute('src', src);
				}

				el.removeAttribute('lazy-src');
				el.removeAttribute('lazy-bg');

				if (typeof args.onLoad === 'function'){
					args.onLoad.apply(args.context, [el, image]);
				}

				done();
			});
		});
	};

	this.dom.toDom = (function (){
		var DOM_EVENTS = utils.fn.bindContext({
			'props' 	: 'target',
			'create'    : _createEvent,
		});

		function _normalize (obj){
			if (typeof obj === 'object'){
				var hasProperties = false;
				for (var i in obj){
					hasProperties = true;
					break;
				}
				if (!hasProperties){
					obj = null;
				}
			}else if (obj !== undefined && obj !== null){
				obj = obj.toString();
			}
			return obj;
		}

		function _cache (el, key, value){
			return utils.el.cache(el, key, value);
		}

		function _create (data){
			if (utils.dom.isElement(data)){
				return data;
			}else if (typeof data === 'string' && ~data.trim().indexOf('<')){	// mini trick, if it starts with a "<" i seems it's HTML, so insert a empty node
				element = document.createElement('span');
				element.setAttribute('wrapper', '');
				element.innerHTML = data;
				return element;
			}else if (typeof data === 'string'){
				return document.createTextNode(data);
			}else{
				return utils.dom.create(data.tag || 'div');
			}
		}

		function _key (item, index){
			if (item && item.key !== undefined && item.key !== null){
				return item.key;
			}else{
				return index || 0;
			}
		}

		function _props (data, old, callback){
			data = data || {};
			old  = old || {};

			var diffs = {};
			for (var i in data){
				var n = data[i], o = old[i];

				if (n !== o){
					diffs[i] = n;

					if (typeof callback === 'function'){
						callback(i, n, o);
					}
				}

				delete(old[i]);
			}
			for (var i in old){
				diffs[i] = '';

				if (typeof callback === 'function'){
					callback(i, '', old[i]);
				}
			}

			return diffs;
		}

		function _deferCallback (callback, args){
			return function (){
				if (typeof callback === 'function'){
					callback.apply(this, args);
				}
			};
		}

		function _createEvent (args){
			return function (e){
				var params = args.params;

				if (!params){
					params = [args.data || {}];
					params[0].originalEvent  = e;
					params[0].originalTarget = args.target;
				}

				if (args.preventDefault){
					e.preventDefault();
				}
				if (args.stopPropagation){
					e.stopPropagation();
				}

				args.callback.apply(args.context, params);
			};
		}

		function _bounds (elements, callback){
			var list = [];

			for (var i=0, l=elements.length; i<l; ++i){
				var element = elements[i];
				var bounds	= element.getBoundingClientRect();

				list.push(bounds);

				if (typeof callback === 'function'){
					callback(element, i, bounds);
				}
			}

			return list;
		}

		function _moveNode (item){
			item.parentNode.insertBefore(item.node, item.parentNode.childNodes[item.index]);
		}

		function _insertNode (item){
			item.parentNode.insertBefore(item.node, item.parentNode.childNodes[item.index]);
		}

		function _removeNode (item){
			if (item.node){
				item.node.parentNode.removeChild(item.node);
			}
		}

		function _transition (el, prefix, done){
			utils.dom.transitionClass(el, {
				'startClass'  : prefix+'-start',
				'activeClass' : prefix+'-active',
				'endClass'    : prefix+'-end',
				'callback'    : done,
			});
		}

		function _events (el, name, event, oldEvent, data, context){
			var name 			= name.split(':');
			var eventName 		= name[0];
			var preventDefault 	= !!~name.indexOf('prevent');
			var stopPropagation = !!~name.indexOf('stop');
			var eventCallback 	= event;
			var oldCallback 	= oldEvent;
			var params 			= null;

			if (eventCallback instanceof Array){
				params 			= eventCallback.slice(1);
				eventCallback	= eventCallback[0];
			}
			if (oldCallback instanceof Array){
				oldCallback	= oldCallback[0];
			}

			if (oldCallback){
				oldCallback	= DOM_EVENTS.get({'callback':oldCallback, 'context':context, 'target':el});
			}
			if (eventCallback){
				eventCallback = DOM_EVENTS.get({
					'callback'        : eventCallback,
					'context'         : context,
					'target'          : el,
					'data'            : data,
					'params'          : params,
					'stopPropagation' : stopPropagation,
					'preventDefault'  : preventDefault,
				});
			}

			if (eventCallback === oldCallback){
				eventCallback.args.params          = params;
				eventCallback.args.preventDefault  = preventDefault;
				eventCallback.args.stopPropagation = stopPropagation;
			}else{
				if (oldCallback){
					el.removeEventListener(eventName, oldCallback.bind);
					DOM_EVENTS.remove(oldCallback);
				}
				if (eventCallback){
					el.addEventListener(eventName, eventCallback.bind);
				}
			}
		}

		function _walk (el, data, old, args){
			args = args || {};
			if (args.depth === undefined) args.depth = 0;
			var prefix = Utils.string.repeat('   ', args.depth);

			data = data || {};
			old  = old || {};

			// attrs -----------------------------------------------------------
			var attrs = _props(data.attrs, old.attrs);
			utils.el.attrs(el, attrs);

			// style -----------------------------------------------------------
			// fallbacks for either calling styles or style (without the "s")
			var style = _props(data.styles || data.style, old.styles || old.style);
			utils.el.style(el, style);

			// classnames ------------------------------------------------------
			// fallbacks for either calling styles or style (without the "s")
			var classnames = data.classnames || data.classname;
			utils.el.classnames(el, classnames);

			// events ----------------------------------------------------------
			_props(data.events, old.events, function (name, n, o){
				_events(el, name, n, o, data.eventData || data, args.context);
			});

			// input:value -----------------------------------------------------
			// @todo maybe deal with values for form elements

			// data ------------------------------------------------------------
			utils.el.cache(el, 'data', data);

			// children --------------------------------------------------------
			var nChildren = data.html !== undefined ? data.html || '' : (data.children || []);
			var oChildren = old.html !== undefined ? old.html || '' : (old.children || []);

			if (nChildren instanceof Array){
				data.children = nChildren = utils.array.filter(nChildren, function (c){
					return c !== null && c !== undefined;
				}, false);
			}

			var keepNodes	     = [];
			var keepItems     	 = [];
			var removeItems      = [];
			var insertItems      = [];
			var moveItems        = [];

			// type miss-match then remove everything
			if (typeof nChildren !== typeof oChildren){
				el.innerHTML = '';
			}

			if (typeof nChildren === 'string'){
				if (nChildren !== oChildren){
					el.innerHTML = nChildren;
				}
			}else{
				if (!(nChildren instanceof Array)) nChildren = [nChildren];
				if (!(oChildren instanceof Array)) oChildren = [oChildren];

				var count 	 	= Math.max(nChildren.length, oChildren.length);
				var childNodes 	= [];

				// only get the nodes that are not flagged "_removed";
				for (var i=0, l=el.childNodes.length; i<l; ++i){
					var childNode = el.childNodes[i];
					if (!_cache(childNode, 'removed')){
						childNodes.push(childNode);
					}
				}

				var nKeysIndex       = {};
				var oKeysIndex       = {};
				var actions 		 = [];

				// create map of keys indexes (for when item moves)
				for (var i=0, l=count; i<l; ++i){
					var nChild 	= _normalize(nChildren[i]);
					var oChild 	= _normalize(oChildren[i]);
					var nKey 	= _key(nChild, i);
					var oKey 	= _key(oChild, i);

					if (nChild){
						nKeysIndex[nKey] = i;
					}
					if (oChild){
						oKeysIndex[oKey] = i;
					}
				}
				// get all the actions (insert/remove/move/update)
				for (var i=0, l=count; i<l; ++i){
					var nChild 		= _normalize(nChildren[i]);
					var oChild 		= _normalize(oChildren[i]);
					var nKey 		= _key(nChild, i);
					var oKey 		= _key(oChild, i);
					var oIndex 		= oKey in nKeysIndex ? nKeysIndex[oKey] : null;
					var nIndex 		= nKey in oKeysIndex ? oKeysIndex[nKey] : null;

					// insert
					if (nChild && nIndex === null){
						//console.log(prefix + '- insert', nKey, 'at', i);
						actions.push({'type':'insert', 'nChild':nChild, 'oChild':null, 'index':i});
					}
					// remove
					if (oChild && oIndex === null){
						//console.log(prefix + '- remove', oKey, 'at', i);
						actions.push({'type':'remove', 'nChild':null, 'oChild':oChild, 'index':i});
					}
					// move
					if (nKey !== oKey && nIndex !== null){
						//console.log(prefix + '- move', nKey, 'at', i);
						oChild = _normalize(oChildren[nIndex]);
						actions.push({'type':'move', 'nChild':nChild, 'oChild':oChildren[nIndex], 'index':nIndex, 'move':i});

						keepNodes.push(childNodes[nIndex]);
					}
					// update
					if (nChild && oChild && nKey === oKey){
						//console.log(prefix + '- update', nKey);
						actions.push({'type':'update', 'nChild':nChild, 'oChild':oChild, 'index':i});

						keepNodes.push(childNodes[i]);
					}
				}

				// execute all the actions
				for (var i=0, l=actions.length; i<l; ++i){
					var action    = actions[i];
					var nChild    = action.nChild;
					var oChild    = action.oChild;
					var index     = action.index;
					var move      = action.move;
					var childNode = childNodes[index];
					var isElement = utils.dom.isElement(nChild);	// if it's already a DOM Element, don't need to continue down

					// remove
					if (!nChild && oChild){
						removeItems.push({'parentNode':el, 'data':data, 'node':childNode, 'index':index});
						_cache(childNode, 'removed', true);

						childNode = null;
					// add new element
					}else if (nChild && !oChild){
						childNode = _create(nChild);
						insertItems.push({'parentNode':el, 'data':data, 'node':childNode, 'index':index});
					// 2 strings, different text
					}else if (typeof nChild === 'string' && typeof oChild === 'string' && nChild !== oChild){
						// @todo check if it's special content...
						childNode.textContent = nChild;
					// Swap the elements, remove the old and insert the new one at the same space
					}else if (nChild && oChild && ((typeof nChild !== typeof oChild) || (nChild.tag !== oChild.tag))){
						removeItems.push({'parentNode':el, 'data':data, 'node':childNode, 'index':index});
						_cache(childNode, 'removed', true);

						childNode = _create(nChild);
						insertItems.push({'parentNode':el, 'data':data, 'node':childNode, 'index':index});
					// Move the node to a new position
					}else if (nChild && oChild && move !== undefined){
						moveItems.push({'parentNode':el, 'data':data, 'node':childNode, 'index':move});
					}

					if (!isElement && childNode && childNode.nodeType === Node.ELEMENT_NODE){
						var diff = _walk(childNode, nChild, oChild, {
							'context'	: args.context,
							'events'	: args.events,
							'depth'		: args.depth+1,
						});

						removeItems = removeItems.concat(diff.removeItems);
						insertItems = insertItems.concat(diff.insertItems);
						moveItems 	= moveItems.concat(diff.moveItems);
						keepItems 	= keepItems.concat(diff.keepItems);
					}
				}

				if (keepNodes.length){
					keepItems.push({'parentNode':el, 'data':data, 'nodes':keepNodes});
				}
			}

			return {
				'keepItems'	  : keepItems,
				'removeItems' : removeItems,
				'insertItems' : insertItems,
				'moveItems'   : moveItems,
			};
		};

		function _patch (items, args){
			if (typeof args === 'function'){
				args = {'callback':args};
			}
			args = args || {};

			if (args.eventname === undefined) args.eventname = null;
			if (args.transition === undefined) args.transition = null;
			if (args.callback === undefined) args.callback = null;

			for (var i=0, l=items.length; i<l; ++i){
				var item = items[i];

				// do a callback on the item
				if (typeof args.callback === 'function'){
					args.callback(item);
				}
				// call specific event
				if (typeof item.data[args.eventname] === 'function'){
					item.data[args.eventname](item.node);
				}
				// add transition classes
				if (item.data.transition && args.transition){
					_transition(item.node, args.transition);
				}
			}
		}

		return function (args, data){
			if (data === undefined){
				data = args;
				args = {};
			}

			if (utils.dom.isElement(args)){
				args = {'element':args};
			}

			args = args || {};
			if (args.element === undefined) 		args.element = null;		// use this element to update it's HTML
			if (args.appendTo === undefined)		args.appendTo = null;		// append to the target
			if (args.prependTo === undefined)		args.prependTo = null;		// prepend to the target
			if (args.insertBefore === undefined)	args.insertBefore = null;	// insertBefore the target
			if (args.insertAfter === undefined)		args.insertAfter = null;	// insertAfter the target
			if (args.replace === undefined)			args.replace = null;		// replace the target with this new element
			if (args.context === undefined)			args.context = null;		// context of the "this" for the DOM events

			var element;
			if (!args.element){
				element = this.create(data.tag || 'div');
			}else{
				element = utils.dom.get(args.element);
			}

			// @todo update the "tag" prop
			// @todo add a way to skip ANY animation on first parsing of the data
			// @todo add onMove, onInsert, onRemove to the single nodes too, not just the parent (that way, we can have "onMove" for when the parent has a child move, and when the item itself moves)
			// @todo add "cancel" animation insert/move/remove. When items moves then quickly you remove one, the remove animation is skipped right now, it shouldnt

			// insert element
			if (args.appendTo){
				this.add(element, 'append', args.appendTo);
			}else if (args.prependTo){
				this.add(element, 'prepend', args.prependTo);
			}else if (args.insertBefore){
				this.add(element, 'before', args.insertBefore);
			}else if (args.insertAfter){
				this.add(element, 'after', args.insertAfter);
			}else if (args.replace){
				this.add(element, 'replace', args.replace);
			}

			var old 		= args.old || this.cache(element, 'old') || {};
			var allEvents 	= [];

			// update the props (attributes, style, events, classnames, ..)
			var diff = _walk(element, data, old, {
				'context'	: args.context,
				'events'	: allEvents,
				'depth'		: 0,
			});

			// kept items (prepare)
			if (diff.keepItems.length){
				for (var i=0, l=diff.keepItems.length; i<l; ++i){
					var item = diff.keepItems[i];

					// automatic transition means we save the node position
					if (item.data.transition || item.data.onMove){
						item.bounds = _bounds(item.nodes);
					}
				}
			}

			// patch the actions
			_patch(diff.removeItems, _removeNode);
			_patch(diff.insertItems, {'callback':_insertNode, 'transition':'insert', 'eventname':'onInsert'});
			_patch(diff.moveItems, _moveNode);

			// kept items (move animation)
			if (diff.keepItems.length){
				// only the nodes that have a dx/dy change will be used
				var movingItems = [];

				for (var i=0, l=diff.keepItems.length; i<l; ++i){
					var item = diff.keepItems[i];

					if (item.data.transition || item.data.onMove){
						_bounds(item.nodes, function (node, i, bounds){
							var dx = item.bounds[i].left - bounds.left;
							var dy = item.bounds[i].top - bounds.top;
							if (dx || dy){
								node.style.transition = '0s'; // force 0s transition, so it does not move right away
								node.style.transform  = 'translate('+dx+'px, '+dy+'px)';
								movingItems.push({'el':item.el, 'data':item.data, 'node':node});
							}
						});
					}
				}

				if (movingItems.length){
					// cause reflow for the movement to work properly
					var reflow = element.offsetHeight;

					for (var i=0, l=movingItems.length; i<l; ++i){
						var item = movingItems[i];

						if (typeof item.data.onMove === 'function'){
							item.data.onMove(item.node);
						}

						if (item.data.transition){
							item.node.style.transition = '';
							_transition(item.node, 'move');
							item.node.style.transform = '';
						}
					}
				}
			}

			// re-add the removed item AND then do their transition
			for (var i=0, l=diff.removeItems.length; i<l; ++i){
				var item = diff.removeItems[i];
				var done = _deferCallback(_removeNode, [item]);

				if (item.data.transition || item.data.onRemove){
					// re-add the node for animation (by transition class OR event)
					_insertNode(item);

					if (typeof item.data.onRemove === 'function'){
						item.data.onRemove(item.node, done);
					}

					// add the transition classes (even if the javascript callback exists)
					if (item.data.transition){
						_transition(item.node, 'remove', typeof item.data.onRemove === 'function' ? null : done);
					}
				}
			}

			// cache a copy!
			data = utils.extend(true, {}, data);
			_cache(element, 'old', data);

			// clean the events with nodes that were removed
			DOM_EVENTS.remove(function (){
				var removed = !document.body.contains(this.target);
				return removed;
			});

			return element;
		}
	}());

	// easings -----------------------------------------------------------------
	this.easings = {};
	this.easings.css = {};

	this.easings.toBezier = function (p1, p2, p3, p4){
		// defining the bezier functions in the polynomial form
		var Cx = 3 * p1;
		var Bx = 3 * (p3 - p1) - Cx;
		var Ax = 1 - Cx - Bx;

		var Cy = 3 * p2;
		var By = 3 * (p4 - p2) - Cy;
		var Ay = 1 - Cy - By;

		function _x(t) {
			return t * (Cx + t * (Bx + t * Ax));
		}
		function _y(t) {
			return t * (Cy + t * (By + t * Ay));
		}

		// using Newton's method to aproximate the parametric value of x for t
		function _x_der(t) {
			return Cx + t * (2*Bx + 3*Ax * t);
		}

		function _x_for(t) {
			var x=t, i=0, z;

			while (i < 5) { // making 5 iterations max
				z = _x(x) - t;

				if (Math.abs(z) < 1e-3) break; // if already got close enough

				x = x - z/_x_der(x);
				i++;
			}

			return x;
		}

		return function(t) {
			return _y(_x_for(t));
		};
	}

	this.easings.linear 		= function(t) { return t };

	//this.easings.swing 		= function(p){ return (-Math.cos(p * Math.PI) / 2) + 0.5; };
	this.easings.swing 			= this.easings.toBezier(0.02, 0.01, 0.47, 1);
	this.easings.css.swing 		= [0.02, 0.01, 0.47, 1];

	this.easings.square 		= function(p){ return Math.sqrt(p); };
	this.easings.spring 		= function(p){ return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6)); };

	this.easings.inQuad 		= function(t) { return t * t };
	this.easings.outQuad 		= function(t) { return t * (2 - t) };
	this.easings.inOutQuad 		= function(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t };
	this.easings.css.inQuad    	= [0.550, 0.085, 0.680, 0.530];
	this.easings.css.outQuad   	= [0.250, 0.460, 0.450, 0.940];
	this.easings.css.inOutQuad 	= [0.455, 0.030, 0.515, 0.955];

	this.easings.inCubic 		= function(t) { return t * t * t };
	this.easings.outCubic 		= function(t) { return (--t) * t * t + 1 };
	this.easings.inOutCubic 	= function(t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 };
	this.easings.css.inCubic    = [0.550, 0.055, 0.675, 0.190];
	this.easings.css.outCubic   = [0.215, 0.610, 0.355, 1.000];
	this.easings.css.inOutCubic	= [0.645, 0.045, 0.355, 1.000];

	this.easings.inQuart 		= function(t) { return t * t * t * t };
	this.easings.outQuart 		= function(t) { return 1 - (--t) * t * t * t };
	this.easings.inOutQuart 	= function(t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t };
	this.easings.css.inQuart    = [0.895, 0.030, 0.685, 0.220];
	this.easings.css.outQuart  	= [0.165, 0.840, 0.440, 1.000];
	this.easings.css.inOutQuart = [0.770, 0.000, 0.175, 1.000];

	this.easings.inQuint 		= function(t) { return t * t * t * t * t };
	this.easings.outQuint 		= function(t) { return 1 + (--t) * t * t * t * t };
	this.easings.inOutQuint 	= function(t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t };
	this.easings.css.inQuint    = [0.755, 0.050, 0.855, 0.060];
	this.easings.css.outQuint	= [0.230, 1.000, 0.320, 1.000];
	this.easings.css.inOutQuint	= [0.860, 0.000, 0.070, 1.000];

	this.easings.inSine 		= function(t) { return -1 * Math.cos(t / 1 * (Math.PI * 0.5)) + 1; };
	this.easings.outSine 		= function(t) { return Math.sin(t / 1 * (Math.PI * 0.5)); };
	this.easings.inOutSine 		= function(t) { return -1 / 2 * (Math.cos(Math.PI * t) - 1); };
	this.easings.css.inSine		= [0.470, 0.000, 0.745, 0.715];
	this.easings.css.outSine	= [0.390, 0.575, 0.565, 1.000];
	this.easings.css.inOutSine	= [0.445, 0.050, 0.550, 0.950];

	this.easings.inExpo 		= function(t) { return (t == 0) ? 0 : Math.pow(2, 10 * (t - 1)); };
	this.easings.outExpo 		= function(t) { return (t == 1) ? 1 : (-Math.pow(2, -10 * t) + 1); };
	this.easings.inOutExpo 		= function(t) {
		if (t == 0) return 0;
		if (t == 1) return 1;
		if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
		return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
	};
	this.easings.css.inExpo		= [0.950, 0.050, 0.795, 0.035];
	this.easings.css.outExpo	= [0.190, 1.000, 0.220, 1.000];
	this.easings.css.inOutExpo	= [1.000, 0.000, 0.000, 1.000];

	this.easings.inCirc 		= function(t) { return -1 * (Math.sqrt(1 - t * t) - 1); };
	this.easings.outCirc 		= function(t) { return Math.sqrt(1 - (t = t - 1) * t); };
	this.easings.inOutCirc 		= function(t) {
		if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
		return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
	};
	this.easings.css.inCirc		= [0.600, 0.040, 0.980, 0.335];
	this.easings.css.outCirc	= [0.075, 0.820, 0.165, 1.000];
	this.easings.css.inOutCirc	= [0.785, 0.135, 0.150, 0.860];

	this.easings.inBack 		= function(t, s) {
		if (s == undefined) s = 1.70158;
		return 1 * t * t * ((s + 1) * t - s);
	};
	this.easings.outBack 		= function(t, s) {
		if (s == undefined) s = 1.70158;
		return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
	};
	this.easings.inOutBack 		= function(t, s) {
		if (s == undefined) s = 1.70158;
		if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
		return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
	};
	this.easings.css.inBack		= [0.600, -0.280, 0.735, 0.045];
	this.easings.css.outBack	= [0.175, 0.885, 0.320, 1.275];
	this.easings.css.inOutBack	= [0.680, -0.550, 0.265, 1.550];

	this.easings.inBounce = function(t) {
		return 1 - utils.easings.outBounce(1 - t);
	};
	this.easings.outBounce = function(t) {
		if ((t /= 1) < (1 / 2.75)) {
			return (7.5625 * t * t);
		} else if (t < (2 / 2.75)) {
			return (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
		} else if (t < (2.5 / 2.75)) {
			return (7.5625 * (t -= (2.25 / 2.75)) * t + .9375);
		} else {
			return (7.5625 * (t -= (2.625 / 2.75)) * t + .984375);
		}
	};
	this.easings.inOutBounce = function(t) {
		if (t < 1 / 2){
			return utils.easings.inBounce(t * 2) * 0.5;
		}
		return utils.easings.outBounce(t * 2 - 1) * 0.5 + 0.5;
	};
	this.easings.css.inOutBounce = [0.3, -1, 0.7, 2];

	this.easings.inElastic = function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t == 0) return 0;
		if (t == 1) return 1;
		if (!p) p = 0.3;
		if (a < 1) {
			a = 1;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
	};
	this.easings.outElastic = function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t == 0) return 0;
		if (t == 1) return 1;
		if (!p) p = 0.3;
		if (a < 1) {
			a = 1;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
		return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
	};
	this.easings.inOutElastic = function(t) {
		var s = 1.70158;
		var p = 0;
		var a = 1;
		if (t == 0) return 0;
		if ((t /= 1 / 2) == 2) return 1;
		if (!p) p = (0.3 * 1.5);
		if (a < 1) {
			a = 1;
			var s = p / 4;
		} else var s = p / (2 * Math.PI) * Math.asin(1 / a);
		if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
	};

	this.easings.get = function (easing, isCss){
		if (easing instanceof Array){
			easing = isCss ? 'cubic-bezier('+easing.join(', ')+')' : utils.easings.toBezier.apply(null, easing);
		}else if (isCss && (easing in utils.easings.css)){
			easing = 'cubic-bezier(' + utils.easings.css[easing].join(', ') + ')';
		}else if (isCss && !(easing in utils.easings.css)){
			easing = 'ease';
		}else if (!isCss && easing in utils.easings){
			easing = utils.easings[easing];
		}else if (!isCss && typeof easing !== 'function'){
			easing = utils.easings.linear;
		}
		return easing;
	}

	// debug -------------------------------------------------------------------
	var DEBUG = {
		'log'	: false,
	};

	this.debug = {};

	this.debug.log = function (msg, data){
		if (typeof msg === 'boolean'){
			DEBUG.log = msg;
			return;
		}
		if (DEBUG.log){
			console.log.apply(null, arguments);
		}
	};

	this.debug.line = function (y){
		var line = utils.dom.create('div', {'parent':document.body, 'style':{
			'top'		: y !== undefined ? y : document.documentElement.clientHeight * 0.5,
			'left'		: 0,
			'height'	: 1,
			'width'		: '100%',
			'position' 	: 'fixed',
			'background': 'black',
			'box-shadow': '0 0 0 15px rgba(0,0,0,0.2)',
			'z-index'	: 99999,
		}});
	};
}());

var STATIC = window.STATIC || {};
var MIXINS = window.MIXINS || {};

var Class = Core.Class = (function (){
	var isInitializing  = false;
	var classes 		= [];
	var utils 			= Utils;

	var BaseStatic = {
		'utils'	: utils,
		'logs' 	: 'log,warn,error,info',
		'log'	: function (msg, data, details){ logClass.apply(this, ['log', msg, data, details]); },
		'warn'	: function (msg, data, details){ logClass.apply(this, ['warn', msg, data, details]); },
		'error'	: function (msg, data, details){ logClass.apply(this, ['error', msg, data, details]); },
		'info'	: function (msg, data, details){ logClass.apply(this, ['info', msg, data, details]); },
		'msg'	: function (title, color, msg, data, details){ logClass.apply(this, ['log', msg, data, details, title, color]); },
	};

	var BaseClass = function (){};
	BaseClass.prototype = {
		'utils' 		: utils,
		'data'			: {},
		'logs' 			: 'log,warn,error,info',
		'log' 			: function (msg, data, details){ log.apply(this, ['log', msg, data, details]); },
		'warn' 			: function (msg, data, details){ log.apply(this, ['warn', msg, data, details]); },
		'error' 		: function (msg, data, details){ log.apply(this, ['error', msg, data, details]); },
		'info' 			: function (msg, data, details){ log.apply(this, ['info', msg, data, details]); },
		'msg'			: function (title, color, msg, data, details){ log.apply(this, ['warn', msg, data, details, title, color]); },
		'isReady' 		: function (){ return this.__ready__; },
		'getId'			: function (){ return this.__id__; },
		'setId'			: function (value){ this.__id__ = value; return this; },
		'getType'		: function (){ return this.__type__; },
		'getTypeClass'	: function (){ return this.__type_class__ || (this.__type_class__ = utils.string.toDashCase(this.__type__)); },
		'getTypes'		: function (){ return this.__types__; },
		'isType'		: function (value){ return this.utils.array.intersect(this.__types__, value).length > 0; },
		'getClasses' 	: function (){ return this.__classes__; },
		'addClass'		: function (value){ this.utils.array.insert(this.__classes__, value, 'last'); return this; },
		'removeClass'	: function (value){ this.utils.array.remove(this.__classes__, value); return this; },
		'isClass'		: function (value){ return this.utils.array.intersect(this.__classes__, value).length > 0; },
		'get' 			: function (key){ return key ? this.data[key] : this.data; },
		'set' 			: function (key, value){
			if (typeof key === 'object'){
				utils.extend(this.data, key);
			}else{
				this.data[key] = value;
			}
			return this;
		},
		'each'			: function (items, args, callback, isArray){
			if (typeof args === 'function'){
				isArray  = callback;
				callback = args;
				args     = {};
			}

			args.context = this;
			args.filter  = 'filter' in args ? args.filter : true;
			args.type 	 = 'type' in args ? args.type : (isArray ? 'array' : undefined);

			return utils.each(items, args, callback);
		},
		'toString'		: function (){ return '['+(this.__singleton__?'singleton':'instance')+' '+this.__type__+']'; },
	};

	function merge (obj, args, sources){
		if (sources === undefined){
			sources = args;
			args    = {};
		}

		args = args || {};
		if (args.skipDefinedFunctions === undefined)	args.skipDefinedFunctions = false;
		if (args.createSuperFunctions === undefined)	args.createSuperFunctions = false;
		if (args.mergeProps === undefined)				args.mergeProps = false;
		if (args.debug === undefined)					args.debug = false;

		for (var i in sources){
			if ((typeof sources[i] !== 'object' && typeof sources[i] !== 'function') || !sources[i]) continue;

			for (var ii in sources[i]){
				var oldProp      = obj[ii];
				var prop         = sources[i][ii];
				var areFunctions = typeof prop === 'function' && typeof oldProp === 'function';

				if (areFunctions && (args.skipDefinedFunctions || prop === oldProp)){
					continue;
				}else if (areFunctions && args.createSuperFunctions){
					obj[ii] = utils.fn.super(oldProp, prop);
				}else if (typeof prop === 'function'){
					obj[ii] = prop;
				}else if (oldProp !== undefined && args.mergeProps && args.mergeProps.indexOf(ii)){
					utils.extend(true, oldProp, prop);
				}else{
					obj[ii] = prop;
				}
			}
		}
	}

	function logClass (type, msg, data, details, title, color){
		if (!~this.logs.indexOf(type)) return;

		msg = msg === null ? '' : msg.toString();

		var name 	= '%c['+(title || this.type)+']%c';
		var color  	= color || 'green';
		var colors 	= ['font-weight:bold; color:'+color+';', ''];
		var log 	= this.utils[type];

		log(name + ' ' + msg, data, colors);
		if (utils.is(details)){
			console.log('  ', details);
		}
	}

	function log (type, msg, data, details, title, color){
		if (!~this.static.logs.indexOf(type)) return;

		msg = msg === null ? '' : msg.toString();

		var id 		= this.__singleton__ ? this.getId() : this.getType()+':'+this.getId();
		var color  	= color || 'blue';
		var name 	= '%c['+(title || id)+']%c';
		var colors 	= ['font-weight:bold; color:'+color+';', ''];
		var log 	= this.utils[type];

		log(name + ' ' + msg, data, colors);
		if (utils.is(details)){
			console.log('  ', details);
		}
	}


	function Class (args, props){
		if (arguments.length === 1){
			props = args;
			args  = {};
		}

		// args ----------------------------------------------------------------
		if (args === true){
			args = {'singleton':true};
		}
		args 			= (typeof args === 'boolean' ? {'singleton':args} : args) || {};
		args.singleton 	= 'singleton' in args ? args.singleton : false;
		args.wait 		= 'wait' in args ? args.wait : false;
		args.merge 		= 'merge' in args ? args.merge : ''; // merge properties (instead of overwrites)

		/*
		if (args.singleton === undefined) 	args.singleton = false;
		if (args.wait === undefined) 		args.wait = false;
		if (args.merge === undefined)		args.merge = '';	// merge properties (instead of overwrites)
		*/

		// props ---------------------------------------------------------------
		if (typeof props === 'function'){
			props.prototype.utils = utils;
			props 				  = new props();
		}

		// "extends" is a reserved word, that's why it's the singular version
		var extend    	= props.$extends || BaseClass;
		var type 		= (props.$type || 'Class').replace(/[^a-z_0-9$]/gi, '').replace(/^[^a-z_$]*/i, '');
		var setters 	= props.$set || {};
		var getters 	= props.$get || {};
		var static 		= props.$static || {};
		var mixins 		= props.$mixins || [];
		var aliases 	= [];
		var mergeProps 	= args.merge.split(',');
		var uses 		= props.$uses || [];

		var defaults 	= {};
		var inits 		= [];
		var prototype 	= null;

		// uses ----------------------------------------------------------------
		utils.each(uses, function (name){
			if (Core[name] !== undefined || window[name] !== undefined) return;
			utils.error('Class "{type}" is trying to use the undefined "{name}" function', {'type':type, 'name':name});
		});

		// implements ----------------------------------------------------------
		if (typeof extend === 'string'){
			if (extend in Core)			extend = Core[extend];
			else if (extend in window) 	extend = window[extend];
			else 						utils.warn('Class "{type}" is trying to extend the undefined "{extend}" class', {'type':type, 'extend':extend});
		}

		// make sure extend is a function
		if (typeof extend !== 'function'){
			function Extend (){};
			Extend.prototype = extend || {};
			extend = Extend;
		}

		var parent  = extend.prototype || {};
		var types	= (parent.__types__ || ['Class']).slice();
		var klass 	= new Function('return function '+type+' (){ return this.__init__.apply(this, arguments); };')();

		if (!~types.indexOf(type)){
			types.push(type);
		}

		isInitializing = true;
		prototype 	   = new extend();
		isInitializing = false;

		// in case another type of extended function, make sure it has the base functions
		if (!(prototype instanceof BaseClass)){
			utils.extend(prototype, BaseClass.prototype);
		}

		// get the previous inits
		inits = (prototype.__inits__ || []).slice();

		// make copies of the prototype objects, so we have fresh ones everytimes
		for (var i in prototype){
			var prop = prototype[i];
			if (typeof prop !== 'object' || !prop || prop === Utils || i === '__classes__' || i === '__types__') continue;

			defaults[i] = utils.copy(prop);
		}

		for (var i in props){
			// skip some properties with "$" as a prefix, they are there for the definition
			if (i === '$type' || i === '$extends' || i === '$static' || i === '$mixins' || i === '$get' || i === '$set' || !props.hasOwnProperty(i)) continue;

			var prop = props[i];
			if (typeof prop === 'function'){
				prototype[i] = utils.fn.super(prop, parent[i]);

				// remove from $defaults if there's a conflicts
				delete(defaults[i]);
			}else if (~mergeProps.indexOf(i) && defaults[i]){
				utils.extend(true, defaults[i], prop);
			}else{
				defaults[i] = prop;
			}
		}

		// mixins --------------------------------------------------------------
		if (typeof mixins === 'string'){
			mixins = mixins.split(',');
		}

		// mixins can have an alias prefix, so the props/functions will be under that prefix
		for (var i in mixins){
			var pair  = mixins[i].split(':');
			var mixin = pair.length > 1 ? pair[1] : pair[0];
			var alias = pair.length > 1 ? pair[0] : null;

			if (typeof mixin === 'string'){
				if (mixin in MIXINS)		mixin = MIXINS[mixin];
				else if (mixin in Core)		mixin = Core[mixin];
				else if (mixin in window)	mixin = window[mixin];
				else 						utils.warn('Class "{type}" is trying to use the undefined "{mixin}" mixin', {'type':type, 'mixin':mixin});
			}

			// parse the mixin
			if (typeof mixin === 'function'){
				mixin.prototype.utils = utils;
				mixin 				  = new mixin();
			}

			if (alias){
				aliases.push(alias);
				defaults[alias] = {};
			}

			for (var ii in mixin){
				var prop = mixin[ii];

				if (typeof prop === 'function' && ii === 'init'){
					inits.push(prop);
				}else{
					if (alias){
						defaults[alias][ii] = prop;
					}else if (typeof prop === 'function'){
						prototype[ii] = utils.fn.super(prototype[ii], prop) || prop;
					}else{
						defaults[ii] = prop;
					}
				}
			}
		}

		// getter/setter ---------------------------------------------------
		for (var i in setters){
			var get = getters[i] || utils.fn.empty;
			var set = setters[i];
			utils.object.getterSetter(prototype, i, get, set);
		}
		for (var i in getters){
			// if the this already exists in setters, it's been already set
			if (setters[i] !== undefined) continue;
			var get = getters[i];
			var set = utils.fn.empty;
			utils.object.getterSetter(prototype, i, get, set);
		}

		// static --------------------------------------------------------------
		klass.type  	= type;
		klass.count 	= 0;
		klass.addMethod	= function (name, callback){ prototype[name] = callback; };

		merge(klass, {'skipDefinedFunctions':true}, [
			BaseStatic,			// base
			STATIC['*'],		// general
			prototype.static,	// static parent already has been set with STATIC[*]
			static,				// current class static
			STATIC[type],		// specific class static
		]);

		// props ---------------------------------------------------------------
		prototype.static        = klass;
		prototype.__type__      = type;
		prototype.__types__     = types;
		prototype.__inits__     = inits;
		prototype.__singleton__ = args.singleton;

		prototype.__init__ = function (){
			// default props
			utils.extend(true, this, defaults);

			this.__id__ 	 = args.singleton ? type : type + klass.count;
			this.__classes__ = [];
			this.__ready__ 	 = false;

			// instance init
			if (!isInitializing){
				// used for mixins
				this._self = this;

				var i, l, alias, props;

				// mixin inits
				for (i=0, l=inits.length; i<l; ++i){
					inits[i].apply(this);
				}
				// mixin aliases
				for (i=0, l=aliases.length; i<l; ++i){
					alias = aliases[i];
					this[alias]._self = this;
				}

				// @todo mini bug, the mixin _self doesn't transfert to the Class that inherit. For example, a Class that extends Carousel won't work properly with .navigation

				// static init (only on the first instance)
				if (typeof this.static.init === 'function' && klass.count === 0){
					this.static.init.call(klass, this);
				}				
				klass.count++;

				if (this.init){
					props = utils.toArray(arguments);

					var init = (function (){
						if (typeof this.preInit === 'function'){
							this.preInit.apply(this);
						}

						var response = this.init.apply(this, props);

						this.__ready__ = true;

						return response === undefined ? this : response;
					}).bind(this);

					if (typeof args.wait === 'function'){
						args.wait.apply(this, [init, props, args]);
					}else{
						return init();
					}
				}else{
					this.__ready__ = true;
				}
			}
		};

		// Create the class ------------------------------------------------
		klass.prototype 			= prototype;
		klass.prototype.constructor = klass;

		classes[type] = klass;

		return args.singleton ? new klass() : klass;
	}

	// To help debugging
	Class.items = classes;
	Class.isInstance = function (item, type){
		return item &&
			typeof item === 'object' &&
			typeof item.isType === 'function' &&
			item.isType('Class') &&
			(!type || item.isType(type));
	};

	return Class;
}());

// @todo add "cache" for the exists() function. When there's a call on exists(), cache it's results, when on() or off() is called, clear the full cache
var EVENTS = window.EVENTS || {};
var Events = Core.Events = new Class(true, function (){
	var utils = this.utils;

	this.$type = 'Events';

	// properties --------------------------------------------------------------
	this.items       = {};
	this.customProps = {};

	// private functions -------------------------------------------------------
	function each (names, callback){
		this.utils.each(names, {'separator':' ', 'context':this}, callback);
	}

	function getEventNames (target, names){
		var eventnames = [];

		each.call(this, names, function (name){
			// global
			eventnames.push('*:'+name);
			eventnames.push(name);

			// no-target event
			if (!target){
				return;
			}

			// Class functions
			var targetId 		= typeof target.getId === 'function' ? target.getId() : null;
			var targetTypes 	= typeof target.getTypes === 'function' ? target.getTypes() : [];
			var targetClasses 	= typeof target.getClasses === 'function' ? target.getClasses() : [];

			// @todo/maybe : deal with DOM elements
			if (this.utils.dom.isDomElement(target)){
				targetId 		= this.utils.dom.attr('id') || null;
				targetTypes		= target.tagName ? ['HtmlElement', target.tagName.toString().toLowerCase()] : [];
				targetClasses	= this.utils.dom.classnames(target);
			}

			// types
			for (var i=0, l=targetTypes.length; i<l; ++i){
				var targetType = targetTypes[i];
				eventnames.push(targetType + ':' + name);
			}
			// classes
			for (var i=0, l=targetClasses.length; i<l; ++i){
				var targetClass = targetClasses[i];
				eventnames.push('.' + targetClass + ':' + name);

				for (var ii=0, ll=targetTypes.length; ii<ll; ++ii){
					var targetType = targetTypes[ii];
					eventnames.push(targetType + '.' + targetClass + ':' + name);
				}
			}
			// ID
			if (targetId){
				eventnames.push('#' + targetId + ':' + name);
			}
		});

		return eventnames;
	}

	// @todo
	function isDelegator (parent, child, match){
		if (!this.utils.dom.isDomElement(parent) || !this.utils.dom.isDomElement(child)){
			return false;
		}

		console.log(parent, child, match);
	}

	// methods -----------------------------------------------------------------
	this.on = function (target, names, args){
		if (typeof target === 'string'){
			args 	= names;
			names   = target;
			target 	= null;
		}
		if (typeof args === 'function'){
			args = {'callback':args};
		}
		args = args || {};

		each.call(this, names, function (name){
			var items = this.items[name];
			if (!items){
				items = this.items[name] = [];
			}

			var item = {
				'target'	: target || null,
				'context'	: args.context || target || null,
				//'element'	: args.element || this.utils.dom.isDomElement(target) ? target : null,
				'delegate'	: args.delegate || null,
				'once'		: args.once || false,
				'callback'	: args.callback || null,
			};

			this.items[name].push(item);
		});

		return this;
	};

	this.off = function (target, names, args){
		if (typeof target === 'string'){
			args 	= names;
			names   = target;
			target 	= null;
		}
		if (typeof args === 'function'){
			args = {'callback':args};
		}
		args = args || {};

		each.call(this, names, function (name){
			var items = this.items[name];
			if (!items){
				return;
			}

			var item = {'target':target || null};
			if (args.context !== undefined) 	item.context = args.context;
			if (args.delegate !== undefined) 	item.delegate = args.delegate;
			if (args.callback !== undefined) 	item.callback = args.callback;
			if (args.once !== undefined) 		item.once = args.once;

			this.utils.array.remove(items, item);

			// clean the main object
			if (!items.length){
				delete(this.items[name]);
			}
		});

		return this;
	};

	this.trigger = function (target, names, data){
		var self 	= this;
		var params 	= utils.toArray(arguments);

		if (typeof target === 'string'){
			names  = target;
			target = null;
			params = params.slice(1);
		}else{
			params = params.slice(2);
		}

		// first param is the event data
		params[0] = params[0] || {};
		if (typeof params[0] !== 'object'){
			params[0] = {};
		}

		// get all the possible event names (from class)
		names = getEventNames.call(this, target, names);

		each.call(this, names, function (name){
			var items     = this.items[name];
			var hasPrefix = !!~name.indexOf(':');
			var type 	  = name.replace(/^.+\:/, '');

			if (Class.isInstance(target)){
				self.info('Triggered "{type}" by #{id}', {'type':type, 'id':target.getId()});
			}else{
				self.info('Triggered "{type}"', {'type':type});
			}

			if (!items){
				return;
			}

			var keepEvents = [];
			for (var i=0, l=items.length; i<l; ++i){
				var item = items[i];

				// @todo delegate (needs to be a DOM element)
				//if (item.delegate && isDelegator.call(this, item.target, target, item.delegate)){
				//console.log(item);
				//}

				if (target === item.target || hasPrefix){
					params[0] = utils.extend({}, params[0], {
						'type'		: type,
						'timestamp'	: new Date(),
						'target'	: target || item.target,
					});

					if (typeof item.callback === 'function'){
						item.callback.apply(item.context || target, params);
					}

					if (!item.once){
						keepEvents.push(item);
					}
				}else{
					keepEvents.push(item);
				}
			}
			this.items[name] = keepEvents;
		});

		return this;
	};

	this.exists = function (target, names){
		if (typeof target === 'string'){
			names  = target;
			target = null;
		}

		names = getEventNames.call(this, target, names);

		var found = false;
		each.call(this, names, function (name){
			var items = this.items[name];
			if (!items){
				return;
			}

			var hasPrefix = !!~name.indexOf(':');
			for (var i=0, l=items.length; i<l; ++i){
				var item = items[i];

				if (target === item.target || hasPrefix){
					found = true;
					return BREAK;
				}
			}
		});

		return found;
	};

	// start -------------------------------------------------------------------
	for (var name in EVENTS){
		var e = EVENTS[name];
		this.on(name, e);
	}
});

var MixinEvents = function (){
	this._eventContext = null;
	this._eventPrefix = '';

	// methods -----------------------------------------------------------------
	this.init = function (){
		this._eventContext = this;
	};

	this.setEventContext = function (context){
		this._eventContext = context;
		return this;
	};

	this.setEventPrefix = function (prefix){
		this._eventPrefix = prefix;
	};

	this.on = function (target, names, args){
		if (typeof target === 'string'){
			args 	= names;
			names   = target;
			target 	= this;
		}
		if (typeof args === 'function'){
			args = {'callback':args};
		}
		args 		 = args || {};
		args.context = args.context !== undefined ? args.context : this._eventContext;

		// @todo maybe add a args.prop for forcing a "custom" event on a DOM element
		if (window.Query && target instanceof Query){
			target.on(names, args);
		}else if (this.utils.dom.isDomElement(target)){
			this.utils.dom.addEvent(target, names, args);
		}else{
			Events.on(target, names, args);
		}

		return this;
	};

	this.off = function (target, names, args){
		if (typeof target === 'string'){
			args 	= names;
			names   = target;
			target 	= this;
		}
		if (typeof args === 'function'){
			args = {'callback':args};
		}
		args = args || {};
		args.context = this._eventContext;

		if (window.Query && target instanceof Query){
			target.off(names, args);
		}else if (this.utils.dom.isDomElement(target)){
			this.utils.dom.removeEvent(target, names, args);
		}else{
			Events.off(target, names, args);
		}

		return this;
	};

	this.trigger = function (target, names, data){
		var args = this.utils.toArray(arguments);
		if (typeof target === 'string'){
			target = this;
			args.unshift(target);
		}

		if (this.utils.dom.isDomElement(target)){
			this.utils.dom.triggerEvent.apply(null, args);
		}else{
			Events.trigger.apply(Events, args);
		}

		return this;
	};

	this.hasEvents = function (target, names){
		if (typeof target === 'string'){
			names   = target;
			target 	= this;
		}

		if (this.utils.dom.isDomElement(target)){
			//return this.utils.dom.triggerEvent(target, names, data);
		}else{
			return Events.exists(target, names);
		}
	};
};

var FILTERS = window.FILTERS || {};
var Filters = Core.Filters = new Class(true, function (){
	this.$type = 'Filters';

	// properties --------------------------------------------------------------
	this.items = {};

	// methods -----------------------------------------------------------------
	this.add = function (name, callback){
		var items = this.items[name];

		if (!items){
			items = this.items[name] = [];
		}

		items.push(callback);

		return this;
	};

	this.remove = function (name, callback){
		var items = this.items[name];

		if (!items){
			return this;
		}

		var index = items.indexOf(callback);

		if (~index){
			items.splice(index, 1);
		}

		return this;
	};

	this.apply = function (name, context, data){
		if (arguments.length < 3){
			data = context;
		}
		if (!(data instanceof Array)){
			data = [data];
		}

		var filters = name instanceof Array ? name : this.items[name] || [];
		for (var i=0, l=filters.length; i<l; ++i){
			var response = filters[i].apply(context, data);
			if (response !== undefined){
				data[0] = response;
			}
		}

		return data[0];
	};

	// start -------------------------------------------------------------------
	for (var name in FILTERS){
		var callback = FILTERS[name];
		this.add(name, callback);
	}
});

var MixinFilters = Core.MixinFilters = function (){
	this._filterPrefix  = '';
	this._localFilters  = {};

	this._delegateFilters = {};
	this._delegateMatch   = null;

	// methods -----------------------------------------------------------------
	this.setFilterPrefix = function (prefix){
		this._filterPrefix = prefix;
	};

	this.addFilter = function (name, callback){
		if (this._localFilters[name] === undefined){
			this._localFilters[name] = [];
		}
		this._localFilters[name].push(callback);
		//Filters.add('#' + this.__id__ + ':' + name, callback);
	};

	this.removeFilter = function (name, callback){
		Filters.remove('#' + this.__id__ + ':' + name, callback);
	};

	this.applyFilters = function (name, args){
		args = this.utils.toArray(arguments).slice(1);

		// global filter
		args[0] = Filters.apply(name, this, args);

		// types filters
		for (var i=0, l=this.__types__.length; i<l; ++i){
			var type = this.__types__[i];
			args[0] = Filters.apply(this._filterPrefix + type + ':' + name, this, args);
		}

		// classes filters
		for (var i=0, l=this.__classes__.length; i<l; ++i){
			var c = this.__classes__[i];
			args[0] = Filters.apply('.' + c + ':' + name, this, args);
		}

		// id filter
		args[0] = Filters.apply('#' + this.__id__ + ':' + name, this, args);

		// delegate filters (when a parent holds lots of filters)
		// @todo

		// local filters
		var local = this._localFilters[name] || [];
		args[0] = Filters.apply(local, this, args);
		//*/

		return args[0];
	};
};

var States = Core.States = new Class(true, function (){
	this.$type = 'States';

	// properties --------------------------------------------------------------
	this.values 	= {};
	this.watchers 	= [];

	// methods -----------------------------------------------------------------
	this.get = function (name, fallback){
		return this.values[name] !== undefined ? this.values[name] : fallback;
	};

	this.set = function (name, value, args){
		var old = this.values[name];

		if (value !== old){
			this.values[name] = value;

			for (var i in this.watchers){
				var watcher = this.watchers[i];

				if (!watcher.name || watcher.name === name){
					watcher.callback.call(watcher.context, {
						'name'	: name,
						'old'   : old,
						'value' : value,
						'args'	: args,
					});
				}
			}
		}

		return this;
	};

	this.watch = function (name, context, callback){
		if (typeof name !== 'string'){
			callback = context;
			context  = name;
			name 	 = null;
		}
		if (typeof context === 'function'){
			callback = context;
			context  = null;
		}

		this.watchers.push({
			'name'		: name,
			'context'	: context,
			'callback'  : callback,
		});

		return this;
	};

	this.unwatch = function (name, context, callback){
		if (typeof name !== 'string'){
			callback = context;
			context  = name;
			name 	 = null;
		}
		if (typeof context === 'function'){
			callback = context;
			context  = null;
		}

		this.utils.array.remove(this.watchers, {
			'name'	  : name,
			'context' : context,
			'callback': callback
		});

		return this;
	};
});

var MixinStates = Core.MixinStates = function (){
	this._watchers = [];

	// init --------------------------------------------------------------------
	this.init = function (){
		States.watch(this, watch);
	};

	// private functions -------------------------------------------------------
	function watch (e){
		var prefix = this.getId() + ':';

		if (
			e.name.indexOf(prefix) !== 0 ||
			!this._watchers.length
		) return;

		// clean up the "e"
		e = {
			'name'  : e.name.replace(prefix, ''),
			'old'	: e.old,
			'value'	: e.value,
			'args'	: e.args,
		};

		for (var i=0, l=this._watchers.length; i<l; ++i){
			var watcher = this._watchers[i];
			watcher.call(this, e);
		}
	}

	// methods -----------------------------------------------------------------
	this.setState = function (name, value, isBody){
		States.set(this.getId() + ':' + name, value, {'isBody':isBody});
		return this;
	};

	this.setStates = function (states){
		for (var i in states){
			this.setState(i, states[i]);
		}
	};

	this.getState = function (name, fallback){
		return States.get(this.getId() + ':' + name, fallback);
	};

	this.watchState = function (callback){
		this._watchers.push(callback);
	};

	this.unwatchState = function (callback){
		var index = this._watchers.indexOf(callback);
		if (~index){
			this._watchers.splice(index, 1);
		}
	};
};

// @todo add custom functions IN the properties (eg: border-color:lighten-color(#FF0011, 0.5);)
// @todo add styling of INLINE items, either by setting an ID first, or directly setting the inline style
// @todo add default STYLE_DATE, for example, for self, if this.$classname is set
var Styles = Core.Styles = new Class(true, function (){
	this.$type = 'Styles';

	// constants ---------------------------------------------------------------
	var POSITIONS = {
		HEAD	: 'head',
		TOP 	: 'top',
		BOTTOM	: 'bottom',
	};

	var RE = {
		CSS_VALUES : /([^\s(]+(?:\([^)]+\))?)/g,
	};

	// properties --------------------------------------------------------------
	this.elements       = {};
	this.items          = {};

	this.computedStyles = null;
	this.prefixProps    = {};
	this.customProps    = {};

	// private functions -------------------------------------------------------
	function getContainer (position){
		if (position === POSITIONS.TOP && !this.elements.top){
			this.elements.top               = document.createElement('div');
			this.elements.top.className     = 'custom-styles-top';
			this.elements.top.style.display = 'none';
			this.elements.top.innerHTML 	= '&shy;';
			document.body.insertBefore(this.elements.top, document.body.children[0]);
		}else if (position === POSITIONS.BOTTOM && !this.elements.bottom){
			this.elements.bottom                 = document.createElement('div');
			this.elements.bottom.className       = 'custom-styles-bottom';
			this.elements.bottom.style.display   = 'none';
			this.elements.bottom.innerHTML 		 = '&shy;';
			document.body.appendChild(this.elements.bottom);
		}else if (!this.elements.head){
			this.elements.head      	= document.createElement('style');
			this.elements.head.type 	= 'text/css';
			this.elements.head.id 		= 'custom-styles-head';
			document.head.insertBefore(this.elements.head, document.head.children[0]);
		}
		return this.elements[position];
	}

	function getStyleText (id, style, root, data){
		var rules = ['/* ====== '+id+' ============================================ */'];

		// @todo way to parse "style" if it's a string

		// parse the data too
		for (var i in data){
			var value = data[i];
			value = this.utils.string.interpolate(value, data);

			// do a double interpolate, sometimes the return value has variables
			if (~value.indexOf('{')){
				value = this.utils.string.interpolate(value, data);
			}

			data[i] = value;
		}

		for (var i in style){
			var selector	= this.utils.string.interpolate(i, data);
			var props 		= getProps.call(this, style[i], data);

			// replace instance of "&" to the root class
			if (root){
				selector = selector.replace(/\&/g, root);
			}

			rules.push(selector+"{"+props+'}');
		}

		rules = rules.join('\n');

		return rules;
	}

	function getProps (props, data){
		props = this.utils.string.interpolate(props, data);

		var allProps = {};
		this.utils.each(props, {'context':this, 'separator':';'}, function (prop){
			var keyValue 	= prop.split(':');
			var key 		= keyValue[0].trim();
			var value 		= keyValue[1].trim();
			var custom 		= this.customProps[key];

			if (typeof custom === 'function'){
				var customValues  = this.utils.toArray(value, RE.CSS_VALUES);
				custom = custom.apply(this, customValues);

				for (var customKey in custom){
					allProps[customKey] = custom[customKey];
				}
			}else{
				allProps[key] = value;
			}
		});

		props = [];
		for (var key in allProps){
			props.push(prefixProp.call(this, key) + ':' + allProps[key]);
		}

		return props.join('; ') + ';';
		//return '\n\t' + props.join(';\n\t') + ';\n';
	}

	function prefixProp (prop){
		// a custom variable
		if (prop.indexOf('--') === 0){
			return prop;
		}

		// cached prefix
		if (this.prefixProps[prop]){
			return this.prefixProps[prop];
		}

		var prefixed	= prop;
		var styles 		= this.computedStyles || window.getComputedStyle(document.documentElement, '');
		var camelCase	= prop.replace(/\-([a-z])/g, function (m){ return m[1].toUpperCase(); });
		var upperCase	= camelCase[0].toUpperCase() + camelCase.slice(1);

		if (camelCase in styles)				prefixed = prop;
		else if ('webkit'+upperCase in styles)	prefixed = '-webkit-' + prop;
		else if ('moz'+upperCase in styles)		prefixed = '-moz-' + prop;
		else if ('ms'+upperCase in styles)		prefixed = '-ms-' + prop;
		else if ('o'+upperCase in styles)		prefixed = '-o-' + prop;

		this.computedStyles 	= styles;
		this.prefixProps[prop] 	= prefixed;

		return prefixed;
	}

	// methods -----------------------------------------------------------------
	this.add = function (id, style, args){
		if (this.items[id]){
			this.remove(id);
		}

		args 			= args || {};
		args.data 		= 'data' in args ? args.data : {};
		args.position 	= 'position' in args ? args.position : POSITIONS.HEAD;
		args.root 		= 'root' in args ? args.root : null;

		var item = {
			'id'		: id,
			'position'	: this.utils.object.enumValue(POSITIONS, args.position, POSITIONS.HEAD),
			'style'		: getStyleText.apply(this, [id, style, args.root, args.data])
		};

		var container = getContainer.call(this, item.position);
		var styleNode = document.createTextNode(item.style);

		if (item.position !== POSITIONS.HEAD){
			var element = document.createElement('style');
			element.type = 'text/css';
			element.appendChild(styleNode);
			styleNode = element;
		}

		container.appendChild(styleNode);

		return this;
	};

	this.remove = function (id){
		var item = this.items[id];

		if (!item){
			return this;
		}

		delete(this.items[id]);

		if (item.position === POSITIONS.HEAD){

		}else{

		}
	};

	this.addProp = function (prop, callback){
		this.customProps[prop] = callback;
		return this;
	};

	// custom props ------------------------------------------------------------
	this.customProps.size = function (value){
		return {
			'width'	: value,
			'height': value
		}
	};

	this.customProps.corner = function (corner, x, y, position){
		if (x === undefined) x = 0;
		if (y === undefined) y = 0;
		if (position === undefined) position = 'absolute';

		corner = corner.trim().toLowerCase();

		var style = {
			'position' : position,
		};

		if (corner === 'tl' || corner === 'lt' || corner === 'top-left' || corner === 'left-top'){
			style.left 	= x;
			style.top 	= y;
		}else if (corner === 'tr' || corner === 'rt' || corner === 'top-right' || corner === 'right-top'){
			style.right = x;
			style.top 	= y;
		}else if (corner === 'bl' || corner === 'lb' || corner === 'bottom-left' || corner === 'left-bottom'){
			style.left 	= x;
			style.bottom= y;
		}else if (corner === 'br' || corner === 'rb' || corner === 'bottom-right' || corner === 'right-bottom'){
			style.right	= x;
			style.bottom= y;
		}else if (corner === 't' || corner === 'top'){
			style.left 	= x;
			style.right = x;
			style.top 	= y;
		}else if (corner === 'r' || corner === 'right'){
			style.right = x;
			style.top 	= y;
			style.bottom= y;
		}else if (corner === 'b' || corner === 'bottom'){
			style.left 	= x;
			style.right = x;
			style.bottom= y;
		}else if (corner === 'l' || corner === 'left'){
			style.left  = x;
			style.top 	= y;
			style.bottom= y;
		}else if (corner === 'all' || corner === 'cover'){
			style.top    = y;
			style.right  = x;
			style.bottom = y;
			style.left   = x;
		}

		return style;
	};
});

var MixinStyles = Core.MixinStyles = function (){
	this.addBaseStyle = function (style, data){
		if (this.static._addedBaseStyle) return this;

		var id = this.getType();
		this.addStyle(id, style, {'data':data});
		this.static._addedBaseStyle = true;

		return this;
	};

	this.addStyleVars = function (vars){

	};

	this.addStyle = function (id, style, args){
		args      = args || {};
		args.data = args.data || {};

		// @todo add pre-defined variables to parse
		args.data['self'] = args.root = args.data.self || ('.' + this.classname);

		Styles.add(id, style, args);
		return this;
	};
};

// @todo add --device-width, --device-height in the body as CSS variables
var BROWSER = window.BROWSER || {};

var Browser = new Class(true, function (){
	var utils 	 = this.utils;
	this.$type 	 = 'Browser';
	this.$mixins = 'MixinEvents';

	// constants ---------------------------------------------------------------
	var ORIENTATIONS = {
		PORTRAIT  : 'portrait',
		LANDSCAPE : 'landscape'
	};

	var MEDIAS = {
		PHONE 		: 'phone',
		TABLET 		: 'tablet',
		LAPTOP 		: 'laptop',
		DESKTOP 	: 'desktop',
	};

	var DELAYS = {
		DEBOUNCE 	: 150,
	};

	// properties --------------------------------------------------------------
	this._title 	 	    = {'title':'', 'subtitle':'', 'count':null, 'separator':'|'};
	this._scrollbarSize     = -1;
	this._breakpoints 	    = {'phone':480, 'tablet' :768, 'laptop':1440, 'desktop':2000};
	this._useCssBreakpoints = true;
	this._previous 		    = {'screenWidth':null, 'screenHeight':null, 'breakpoint':null, 'classnames':[]};

	this.scrollTop 			= 0;
	this.scrollRight 		= 0;
	this.scrollBottom		= 0;
	this.scrollLeft 	    = 0;
	this.cursorX 		    = 0;
	this.cursorY 		    = 0;
	this.browserVersion     = 0;
	this.breakpoint 	    = null;
	this.media 				= null; //
	this.loadTime			= 0;

	this.layouts = {};

	// constructor -------------------------------------------------------------
	this.init = function (){
		this.set('startTime', +new Date());

		// @todo add an interval ticker to check if it's slow to load the page content

		this.refreshSizes();

		this.on(window, 'resize', window_onResize);
		this.on(window, 'scroll', {'callback':window_onScroll, 'capture':true});
		this.on(document, 'mousemove', document_onMouseMove);
		this.on(document, 'mousedown touchstart', document_onMouseMove);
		// add interval to check content height/width change

		this.utils.dom.onReady(document_onReady.bind(this));
		this.utils.dom.onLoad(window_onLoad.bind(this));

		if (BROWSER.ready) this.ready(BROWSER.ready);
		if (BROWSER.load) this.load(BROWSER.load);
	};

	// getter/setter -----------------------------------------------------------
	this.$get = {};
	this.$set = {};

	this.$get.title = function (){ return this._title.title; };
	this.$set.title = function (value){ this.updateTitle({'title':value}); };

	this.$get.subtitle = function (){ return this._title.subtitle; };
	this.$set.subtitle = function (value){ this.updateTitle({'subtitle':value}); };

	this.$get.titleCount = function (){ return this._title.count; };
	this.$set.titleCount = function (value){ this.updateTitle({'count':value}); };

	this.$get.titleSeparator = function (){ return this._title.separator; };
	this.$set.titleSeparator = function (value){ this.updateTitle({'separator':value}); };

	this.$get.useCssBreakpoints = function (){ return this._useCssBreakpoints; };
	this.$set.useCssBreakpoints = function (value){ this._useCssBreakpoints = value; this.refresh(true); };

	this.$get.name 		= function (){ return utils.browser.info().name; }
	this.$get.version 	= function (){ return utils.browser.info().version; }

	// private function --------------------------------------------------------

	// events ------------------------------------------------------------------
	function document_onReady (e){
		if (!this.title){
			var title = document.querySelector('head title');
			this.title = title ? title.innerText : '';
		}

		this.refresh(true);
		this.trigger('ready');
	}

	function window_onLoad (e){
		this.refresh(true);
		this.trigger('load');
		this.loadTime = +new Date() - this.get('startTime');
	}

	function window_onResize (e){
		this.refresh();

		if (!this.hasEvents('resize resize-width resize-height breakpoint')){
			return;
		}

		if (this._resizeDelay === undefined){
			this._resizeDelay = this.utils.fn.sync({
				'context'  : this,
				'debounce' : DELAYS.DEBOUNCE,
				'throttle' : true,
				'onStart'  : function (a){ a.isStart = true; this._triggerResize(a); },
				'onChange' : function (a){ a.isStart = false; this._triggerResize(a); },
				'onEnd'	   : function (a){ a.isEnd = true; this._triggerResize(a); }
			});

			this._triggerResize = function (a){
				if (a.previousWidth !== a.screenWidth || a.previousHeight !== a.screenHeight){
					if (a.previousWidth !== a.screenWidth){
						this.trigger('resize-width', a);
					}
					if (a.previousHeight !== a.screenHeight){
						this.trigger('resize-height', a);
					}
					this.trigger('resize', a);
				}

				// breakpoint
				if (a.previousBreakpoint !== a.breakpoint){
					this.trigger('breakpoint', a);
				}
			}
		};

		this._resizeDelay({
			'previousWidth'		: this._previous.screenWidth,
			'previousHeight'	: this._previous.screenHeight,
			'previousBreakpoint': this._previous.breakpoint,
			'screenWidth'	    : this.screenWidth,
			'screenHeight'	    : this.screenHeight,
			'breakpoint'	    : this.breakpoint,
		});
	}

	function window_onScroll (e){
		this.refreshScrolls();
		
		if (!this.hasEvents('scroll')){
			return;
		}

		if (this._scrollDelay === undefined){
			this._scrollDelay = this.utils.fn.sync({
				'context'  : this,
				'debounce' : DELAYS.DEBOUNCE,
				'throttle' : true,
				'onStart'  : function (a){ a.isStart = true; this.trigger('scroll', a); },
				'onChange' : function (a){ a.isStart = false; this.trigger('scroll', a); },
				'onEnd'	   : function (a){ a.isEnd = true; this.trigger('scroll', a); }
			});
		};

		var data = utils.dom.scrollInfo(e.originalTarget);
		data.element = e.originalTarget;
		this._scrollDelay(data);
		/*
		this._scrollDelay({
			'element'		: e.originalTarget,
			'scrollTop'	 	: this.scrollTop,
			'scrollLeft' 	: this.scrollLeft,
			'scrollBottom'	: this.scrollTop + this.innerHeight,
			'scrollRight'	: this.scrollLeft + this.innerWidth,
			'scrollHeight'	: this.scrollHeight,
			'scrollWidth' 	: this.scrollWidth,
			'progressY'		: this.scrollTop / this.scrollHeight,
			'progressX'		: this.scrollLeft / this.scrollWidth,
		});
		*/
	}

	function document_onMouseMove (e){
		this.cursorX 	= e.pageX;
		this.cursorY 	= e.pageY;
		this.screenX 	= e.clientX;
		this.screenY 	= e.clientY;

		if (!this.hasEvents('mousemove')){
			return;
		}

		if (this._mousemoveDelay === undefined){
			this._mousemoveDelay = this.utils.fn.sync({
				'context'  : this,
				'debounce' : DELAYS.DEBOUNCE,
				'throttle' : true,
				'format'   : function (a, o){
					return {
						'x'	 : a.x,
						'y'  : a.y,
						'dx' : o ? o.x - a.x : 0,
						'dy' : o ? o.y - a.y : 0,
					};
				},
				'onStart'  : function (a){ a.isStart = true; this.trigger('mousemove', a); },
				'onChange' : function (a){ a.isStart = false; this.trigger('mousemove', a); },
				'onEnd'	   : function (a){ a.isEnd = true; this.trigger('mousemove', a); }
			});
		};

		this._mousemoveDelay({
			'x' : this.cursorX,
			'y' : this.cursorY
		});
	}

	// methods -----------------------------------------------------------------
	this.ready = function (context, callback){
		if (callback === undefined){
			callback = context;
			context  = this;
		}
		this.utils.dom.onReady(callback.bind(context));
	};

	this.load = function (context, callback){
		if (callback === undefined){
			callback = context;
			context  = this;
		}
		this.utils.dom.onLoad(callback.bind(context));
	};

	this.updateTitle = function (data){
		this.utils.extend(this._title, data);

		var data  = this._title;
		var title = (data.count ? '('+data.count+') ' : '') +
					(data.subtitle || '') +
					(data.title && data.subtitle ? ' ' + data.separator + ' ' : '') +
					(data.title || '');

		document.title = title;
	};

	this.setBreakpoints = function (breakpoints){
		if (typeof breakpoints !== 'object'){
			return;
		}

		_this.extend(this._breakpoints, breakpoints);
	};

	this.layout = function (columns, gutter, args){
		args       		= args || {};
		args.media 		= 'media' in args ? args.media : '*';
		args.padding 	= 'padding' in args ? args.padding : 0;
		args.max 		= 'max' in args ? args.max : 0;

		this.layouts[args.media] = {
			'columns'	: columns,
			'gutter'	: gutter,
			'padding'	: args.padding,
			'max'		: args.max,
		};
	};

	this.col = function (colCount, gutterCount){
		var layout = this.layouts[this.breakpoint] || this.layouts['*'];

	};

	this.scrollbarSize = function (){
		if (~this._scrollbarSize){
			return this._scrollbarSize;
		}

		// create a box
		var outside = document.createElement('div');
		var inside 	= document.createElement('div');
		var size  	= -1;

		// create a dummy DIV with a children and compare their width
		outside.style.overflow = 'scroll';
		outside.style.width    = '50px';
		outside.appendChild(inside);
		document.body.appendChild(outside);

		size = outside.offsetWidth - inside.offsetWidth;

		document.body.removeChild(outside);

		this._scrollbarSize = size;

		return size;
	};

	this.popup = function (href, args){
		args = args || {};

		if (args.width === undefined) 	args.width = screen.width / 2;
		if (args.height === undefined) 	args.height = screen.height / 2;
		if (args.target === undefined) 	args.target = '';
		if (args.toolbar === undefined) args.toolbar = false;
		if (args.status === undefined) 	args.status = false;

		var left= (screen.width-args.width)/2;
		var top = (screen.height-args.height)/2;
		var win = window.open(href, args.target, 'toolbar='+(args.toolbar?1:0)+',status='+(args.status?1:0)+',width='+args.width+',height='+args.height+',left='+left+',top='+top);

		if (win){
			win.focus();
		}

		return win;
	};

	this.isMobile = function (refresh){
		if (!refresh && this._isMobile){
			return this._isMobile;
		}

		this._isMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));

		return this._isMobile;
	}

	this.info = function (refresh){
		return utils.browser.info(refresh);
	};

	this.refreshSizes = function (refresh){
		var win  = window;
		var	html = document.documentElement;
		var	body = document.body;

		// use a dummy body when it didn't have time to fully load the document
		if (!body){
			body = {
				'isDummy'	   : true,
				'style'        : {},
				'scrollWidth'  : 0,
				'scrollHeight' : 0,
				'offsetWidth'  : 0,
				'offsetHeight' : 0,
			};
		}

		this._previous.screenWidth  = this.screenWidth;
		this._previous.screenHeight = this.screenHeight
		this._previous.breakpoint   = this.breakpoint;

		// screen size (on mobile iOS, if the user pinch to zoom, the innerWidth changes to the wrong values....)
		body.style.overflow = 'hidden';
		this.screenWidth    = document.documentElement.clientWidth;
		this.screenHeight   = document.documentElement.clientHeight;
		body.style.overflow = '';

		// inner width/height is the screen width/height considering the scrollbars
		this.innerWidth     = document.documentElement.clientWidth;
		this.innerHeight    = document.documentElement.clientHeight;

		this.contentWidth   = Math.max(html.clientWidth, body.scrollWidth, html.scrollWidth, body.offsetWidth, html.offsetWidth);
		this.contentHeight  = Math.max(html.clientHeight, body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight);

		// max scrolls
		this.scrollHeight 	= this.contentHeight - this.innerHeight;
		this.scrollWidth 	= this.contentWidth - this.innerWidth;

		// orientation
		this.orientation	= this.screenHeight > this.screenWidth ? ORIENTATIONS.PORTRAIT : ORIENTATIONS.LANDSCAPE;

		// device width/height while ignoring the orientation
		this.deviceWidth 	= this.orientation == ORIENTATIONS.LANDSCAPE ? this.screenWidth : this.screenHeight;
		this.deviceHeight	= this.orientation == ORIENTATIONS.LANDSCAPE ? this.screenHeight : this.screenWidth;

		// skip the rest if it's the same as before...
		if ((this._previous.screenWidth === this.screenWidth && this._previous.screenHeight === this.screenHeight) && !refresh){
			return;
		}

		// breakpoints
		if (this._useCssBreakpoints && !body.isDummy){
			this.breakpoint = win.getComputedStyle ? win.getComputedStyle(body, ':before').getPropertyValue('content').replace(/\"/g, '') : null;

			if (this.breakpoint === 'none'){
				this.breakpoint = null;
			}

			var styles = win.getComputedStyle(body);
			this.media = styles.getPropertyValue('--media').trim();
		}

		// fallback to JS value breakpoints
		if (!this.breakpoint){
			for (var i in MEDIAS){
				var media = MEDIAS[i];
				var width = this._breakpoints[media];

				if (width && this.screenWidth <= width){
					this.breakpoint = media;
					break;
				}
			}
		}

		if (this.media){
			this.innerWidth = this.contentWidth = body.offsetWidth;
		}

		//this.media = this.media || this.breakpoint;

		// classenames
		if (!body.isDummy){
			var classnames = [];
			if (this.isMobile()){
				classnames.push('is-mobile');
			}else{
				classnames.push('is-not-mobile');
			}

			var info = this.info();
			classnames.push(this.name);
			classnames.push(this.name + '-' + parseFloat(this.version));

			this.utils.dom.removeClass(body, this._previous.classnames);
			this.utils.dom.addClass(body, classnames);
			this._previous.classnames = classnames;

			// CSS screen sizes
			if (typeof body.style.setProperty === 'function'){
				body.style.setProperty('--screen-height', (this.screenHeight + 'px') || '100vh');
				body.style.setProperty('--screen-width', (this.screenWidth + 'px') || '100vw');
				body.style.setProperty('--inner-height', (this.innerHeight + 'px') || '100vh');
				body.style.setProperty('--inner-width', (this.innerWidth + 'px') || '100vw');
				body.style.setProperty('--content-height', (this.contentHeight + 'px') || '100vh');
				body.style.setProperty('--content-width', (this.contentWidth + 'px') || '100vw');

				var layout 	= this.layouts[this.breakpoint] || this.layouts['*'];
				var max 	= layout ? this.innerWidth - layout.padding*2 : this.innerWidth;
				body.style.setProperty('--layout-width', max + 'px');
			}
		}
	};

	this.refreshScrolls = function (){
		this.scrollTop 		= window.pageYOffset;
		this.scrollBottom 	= window.pageYOffset + window.innerHeight;
		this.scrollLeft 	= window.pageXOffset;
		this.scrollRight	= window.pageXOffset + window.innerWidth;
	};

	this.refresh = function (refresh){
		this.isMobile(true);
		this.info(true);
		this.refreshSizes(refresh);
		this.refreshScrolls();
	};
});

var Query = Core.Query = new Class(function (){
	var utils 		 = this.utils;
	this.$type       = 'Query';
	this.$extends    = 'Array';

	// static ------------------------------------------------------------------
	var static = this.$static = {
		'shorthand' : '$$',
		'expando'	: '_',
	};

	this.$static.init = function (){
		static = this;
		this.noConflict(this.shorthand);
	};

	this.$static.noConflict = function (shorthand){
		if (window[this.shorthand]){
			delete(window[this.shorthand]);
		}

		this.shorthand = shorthand;

		window[shorthand] = function (selector){
			return new Query(selector);
		};
	};

	// props -------------------------------------------------------------------
	this.context = null;

	// init --------------------------------------------------------------------
	this.init = function (selector, context){
		if (context){
			this.context = context;
		}
		this.add(false, selector);
	};

	// private functions -------------------------------------------------------
	function create (items){
		if (items === undefined){
			items = this;
		}

		if (typeof items === 'function'){
			var callback = items;
			var items    = this;
			var elements = [];

			utils.each(items, function (el){
				var response = callback(el);
				if (response instanceof Array){
					elements = elements.concat(response);
				}else if (response){
					elements.push(response);
				}
			});

			items = elements;
		}else{
			items = utils.toArray(items);
		}

		return new Query(items, this.context);
	};

	function merge (a, b){
		if (a instanceof Query){
			a = utils.toArray(a);
		}
		if (b instanceof Query){
			b = utils.toArray(b);
		}
		return a.concat(b);
	}

	function is (el, selector, isStrict){
		if (selector instanceof Query){
			selector = selector[0];
		}
		return (!selector && !isStrict) || (selector && utils.el.is(el, selector)) ? el : undefined;
	}

	function isNot (el, selector, isStrict){
		return (!selector && !isStrict) || (selector && utils.el.is(el, selector)) ? undefined : el;
	}

	function walk (element, key, callback){
		while (element && element !== document){
			if (element.nodeType === 1 && typeof callback === 'function'){
				var response = callback(element);
				if (response === BREAK){
					break;
				}
			}
			element = element[key];
		}
	};

	function toClones (elements, withEvents){
		var clones = [];
		for (var i=0, l=elements.length; i<l; ++i){
			var clone = elements[i].cloneNode(true);
			// @todo clone events
			clones.push(clone);
		}
		return clones;
	}

	function addElements (selector, callback){
		var elements = this;
		var added    = [];

		utils.each(elements, function (element){
			var add = utils.dom.getAll(selector);

			utils.each(add, function (child){
				var response = callback(element, child);

				if (response){
					added = merge(added, response);
				}
			});
		});

		return added.length ? create.call(this, added) : elements;
	}

	function cloneElements (selector, callback){
		var elements = this;
		var all      = [];

		var clones = utils.dom.getAll(selector);
		utils.each(clones, function (clone, i){
			// keep the first batch of items, then clone them for the rest
			var add = i === 0 ? elements : toClones(elements);
			var el	= clone;
			var last= el;

			utils.each(add, function (child){
				callback(el, child, last);
				last = child; //el = child;
			});

			all = merge(all, add);
		});

		return create.call(this, all);
	}

	// methods:manipulation ----------------------------------------------------
	this.get = function (index){
		if (!arguments.length){
			return utils.toArray(this);
		// get a value of the elements
		}else if (typeof index === 'function'){
			var values = [];
			this.each(function (el){
				var value = index(el);
				values.push(value);
			});
			return values;
		}else{
			return utils.array.get(this, 'index:'+index);
		}
	};

	this.add = function (returnNew, selector){
		if (selector === undefined){
			selector  = returnNew;
			returnNew = true;
		}
		if (returnNew === undefined){
			returnNew = true;
		}

		var elements = this.utils.dom.getAll(selector);

		if (returnNew){
			elements = this.get().concat(elements);
			return create.call(this, elements);
		}else{
			for (var i=0, l=elements.length; i<l; ++i){
				var element = elements[i];
				if (element && !~this.indexOf(element)){
					this.push(element);
				}
			}
			return this;
		}
	};

	this.each = function (args, callback){
		if (typeof args === 'function'){
			callback = args;
			args 	 = {};
		}
		if (typeof callback !== 'function'){
			return this;
		}

		this.map(args, callback);

		return this;
	};

	this.map = function (args, callback){
		if (typeof args === 'function'){
			callback = args;
			args 	 = {};
		}else if (typeof args === 'boolean'){
			args 	 = {'query':args};
		}

		args.context = 'context' in args ? args.context : (this.context || this);
		args.query 	 = 'query' in args ? args.query : false;

		if (typeof callback !== 'function'){
			return [];
		}

		var items = [];
		for (var i=0, l=this.length; i<l; ++i){
			var element = this[i];

			if (args.query){
				var queryElement = utils.el.cache(element, 'queryElement');

				if (!queryElement){
					queryElement = new Query(element);
					utils.el.cache(element, 'queryElement', queryElement);
				}

				element = queryElement.setContext(args.context);
			}

			var response = callback.apply(args.context, [element, i, this.length]);
			items.push(response);
		}

		return items;
	};

	this.setContext = function (context){
		this.context = context;
		return this;
	};

	// methods:validations -----------------------------------------------------
	this.is = function (selector, allValid){
		var isValid = null;

		this.each(function (el){
			var valid = is(el, selector);
			if (allValid && !valid){
				isValid = false;
			}else if (isValid === null && valid){
				isValid = true;
			}
		});

		return !!isValid;
	};

	this.contains = function (selector, allValid){
		/*
		var isValid = null;

		each(this, function (el){
			var child = find(selector, el, true);

			if (allValid && !child){
				isValid = false;
			}else if (isValid === null && child){
				isValid = true;
			}
		});

		return !!isValid;
		*/
	};

	// methods:insert/remove ---------------------------------------------------
	this.remove = function (){
		this.each(function (el){
			utils.el.remove(el);
		});
		return this;
	};

	this.append = function (selector){
		return addElements.call(this, selector, function (element, child){
			element.appendChild(child);
		});
	};

	this.prepend = function (selector){
		return addElements.call(this, selector, function (element, child){
			element.insertBefore(child, element.firstChild);
		});
	};

	this.before = function (selector){
		return addElements.call(this, selector, function (element, child){
			element.parentNode.insertBefore(child, element);
		});
	};

	this.after = function (selector){
		return addElements.call(this, selector, function (element, child){
			element.parentNode.insertBefore(child, element.nextSibling);
		});
	};

	this.appendTo = function (selector){
		return cloneElements.call(this, selector, function (element, child, last){
			element.appendChild(child);
		});
	};

	this.prependTo = function (selector){
		return cloneElements.call(this, selector, function (element, child, last){
			element.insertBefore(child, element.firstChild);
		});
	};

	this.insertBefore = function (selector){
		return cloneElements.call(this, selector, function (element, child){
			element.parentNode.insertBefore(child, element);
		});
	};

	this.insertAfter = function (selector){
		return cloneElements.call(this, selector, function (element, child, last){
			element.parentNode.insertBefore(child, last.nextSibling);
		});
	};
	// @todo
	this.replaceAll = function (selector){
		this.error('Todo function "Replace"')
	};

	this.replaceWith = function (selector){
		new Query(selector, this.context).insertAfter(this).get();
		return this.remove();
	};

	this.wrap = function (selector){
		return cloneElements.call(this, selector, function (element, child){
			return utils.el.add(child, 'wrap', element);
		});
	};
	// @todo
	this.wrapWith = function (selector){
		this.error('Todo function "wrapWith"')
	};

	this.clone = function (){
		return create.call(this, toClones(this));
	};

	// methods:selector --------------------------------------------------------
	this.find = function (includeSelf, selector){
		if (selector === undefined){
			selector    = includeSelf;
			includeSelf = false;
		}

		return create.call(this, function (el){
			var elements = utils.dom.getAll(selector, {'context':el});

			if (includeSelf && is(el, selector)){
				elements.unshift(el);
			}

			return elements;
		});
	};

	this.filter = function (selector){
		return create.call(this, function (el){
			return is(el, selector);
		});
	};

	this.children = function (selector){
		return create.call(this, function (el){
			var children = utils.el.children(el);
			return utils.each(children, {'filter':true}, function (child){
				return is(child, selector);
			});
		});
	};

	this.contents = function (){
		return create.call(this, function (el){
			return utils.toArray(el.childNodes);
		});
	};

	this.parent = function (selector){
		return create.call(this, function (el){
			return is(el.parentNode, selector);
		});
	};

	this.parents = function (selector, untilSelector){
		return create.call(this, function (el){
			var parents = [];

			walk(el.parentNode, 'parentNode', function (parent){
				if (is(parent, selector)){
					parents.push(parent);
				}
				if (is(parent, untilSelector, true)){
					return BREAK;
				}
			});

			return parents;
		});
	};

	this.closest = function (selector, untilSelector){
		var until = utils.dom.get(untilSelector);

		return create.call(this, function (el){
			return utils.el.closest(el, selector, until);
		});
	};
	// @todo
	this.next = function (selector){

	};
	// @todo
	this.prev = function (selector){

	};
	// @todo
	this.nextAll = function (selector){

	};
	// @todo
	this.prevAll = function (selector){

	};
	// @todo
	this.siblings = function (selector){

	};

	this.not = function (selector){
		return create.call(this, function (el){
			return is(el, selector) ? null : el;
		});
	};

	this.eq = function (selector){
		var index = utils.math.get(selector, {
			'min'		 : 0,
			'max'		 : this.length - 1,
			'decimals' 	 : false,
		});

		return create.call(this, [this[index]]);
	};

	this.first = function (count){
		if (count){
			return create.call(this, this.slice(0, count));
		}else{
			return this.eq('first');
		}
	};

	this.last = function (count){
		if (count){
			return create.call(this, this.slice(count * -1));
		}else{
			return this.eq('last');
		}
	};

	// methods:insert ----------------------------------------------------------
	// @todo

	// methods:props -----------------------------------------------------------
	this.tag = function (key){
		if (key){
			// switch tag types
		}else if (this[0]){
			return this[0].tagName.toLowerCase();
		}else{
			return null;
		}
	};

	this.style = this.css = function (key, value){
		var set = utils.toSetterObject(key, value);

		if (set){
			return this.each(function (el){
				utils.el.style(el, set);
			});
		}else if (this[0]){
			return utils.el.style(this[0], key);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.hide = function (){
		return this.each(function (el){
			utils.el.style(el, {'display':'none'});
		});
	};

	this.show = function (force){
		return this.each(function (el){
			utils.el.show(el, force);
		});
	};

	this.transform = function (key, value){
		var set = utils.toSetterObject(key, value);

		if (set){
			return this.each(function (el){
				utils.el.transform(el, set);
			});
		}else if (this[0]){
			return utils.el.transform(this[0], key);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.classnames = function (classnames){
		return this.each(function (el){
			utils.el.classnames(el, classnames);
		});
	};

	this.addClass = function (classnames, delay){
		return this.each(function (el){
			utils.el.addClass(el, classnames, delay);
		});
	};

	this.removeClass = function (classnames){
		return this.each(function (el){
			utils.el.removeClass(el, classnames);
		});
	};

	this.toggleClass = function (classnames){
		return this.each(function (el){
			utils.el.toggleClass(el, classnames);
		});
	};

	this.attr = this.attrs = function (key, value){
		var set = utils.toSetterObject(key, value);

		if (set){
			return this.each(function (el){
				utils.el.attrs(el, set);
			});
		}else if (this[0]){
			return utils.el.attrs(this[0], key);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.data = function (key, value){
		var set = utils.toSetterObject(key, value);

		if (set){
			return this.each(function (el){
				utils.el.data(el, set);
			});
		}else if (this[0]){
			return utils.el.data(this[0], key);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.prop = this.props = function (key, value){
		var set = utils.toSetterObject(key, value);

		if (set){
			return this.each(function (el){
				utils.el.props(el, set);
			});
		}else if (this[0]){
			return utils.el.props(this[0], key);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.call = function (key){
		var args 	= utils.toArray(arguments).slice(1);
		var context = this;

		return this.each(function (el){
			var callback = utils.el.cache(el, key) || el[key];
			if (typeof callback === 'function'){
				callback.apply(context, args);
			}
		});
	}

	this.cache = function (key, value){
		var self = this;
		var set  = utils.toSetterObject(key, value);

		if (set){
			return this.each(function (el){
				utils.object.cache(el, set, null, self.static.expando);
			});
		}else if (this[0]){
			return utils.object.cache(this[0], key);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.html = function (html, data){
		if (arguments.length){
			html = utils.string.interpolate(html, data, {'fallback':null});
			return this.each(function (el){
				el.innerHTML = html;
			});
		}else if (this[0]){
			return (this[0].innerHTML || '').trim();
		}else{
			return undefined;
		}
	};

	this.outerHtml = function (html, data){
		if (arguments.length){
			html = utils.string.interpolate(html, data, {'fallback':null});

			return this.each(function (el){
				// @todo
				//el.outerHTML = html;
			});
		}else if (this[0]){
			return (this[0].outerHTML || '').trim();
		}else{
			return undefined;
		}
	};

	this.json = function (json){
		if (arguments.length && json !== true){
			html = JSON.stringify(json || {});

			return this.each(function (el){
				if (el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'input'){
					el.value = html;
				}else{
					el.innerHTML = html;
				}
			});
		}else if (this[0]){
			var html = this[0].tagName.toLowerCase() === 'textarea' || this[0].tagName.toLowerCase() === 'input' ? this[0].value : this[0].innerHTML;

			if (json === true){
				/*
				html = html.replace(/\t|\r|\n/g, ' ').trim();

				// make sure there's a brackets
				if (html[0] !== '{'){
					html = '{'+html+'}';
				}

				html = '(function (){ return '+html+'; }())';

				try{
					json = eval(html);
				}catch (e){
					this.warn('The JSON string couldn\'t be eval().\n{error}', {'error':e});
				}
				*/
				json = utils.string.eval(html);

				return json;
			}else{
				return utils.string.toJson(html);
			}
		}else{
			return {};
		}
	};

	this.text = function (text, data){
		if (arguments.length){
			text = utils.string.interpolate(text, data, {'fallback':null});
			return this.each(function (el){
				el.textContent = html;
			});
		}else if (this[0]){
			return (this[0].textContent || '').trim();
		}else{
			return undefined;
		}
	};

	this.index = function (selector){
		return this[0] ? utils.el.index(this[0], selector) : -1;
	};

	this.value = this.val = function (value, data){
		if (arguments.length){
			return this.each(function (el){
				utils.el.val(el, value, data);
			});
		}else if (this[0]){
			return utils.el.val(this[0]);
		}else{
			return undefined;
		}
	};

	this.formData = function (key, value, setter){
		if (typeof key === 'object' || (value && typeof value !== 'function')){
			return this.each(function (el){
				utils.el.formData(el, key, value, setter);
			});
		}else if (this[0]){
			return utils.el.formData(this[0], key, value, setter);
		}else{
			return arguments.length ? undefined : {};
		}
	};

	this.visible = function (){
		var isVisible = true;
		this.each(function (el){
			if (!utils.el.isVisible(el)){
				isVisible = false;
				return BREAK;
			}
		});
		return isVisible;
	};

	// methods:dimensions/positions --------------------------------------------
	this.bounds = function (args){
		args 				= (typeof args === 'boolean' ? {'':args} : args) || {};
		args.empty 			= 'empty' in args ? args.empty : false;
		args.hideChildren 	= 'hideChildren' in args ? args.hideChildren : false;

		if (this[0]){
			var children = args.hideChildren ? create(this[0].childNodes) : null;

			if (children) children.hide();

			var bounds = utils.el.bounds(this[0]);

			if (children) children.each(function (el){
				el.style.display = '';
			});

			return bounds;
		}else{
			return !args.empty ? utils.el.bounds(null) : null;
		}
	};

	this.width = function (value){
		if (arguments.length){
			this.style('width', value);
		}else if (this[0]){
			return this.bounds().width || 0;
		}else{
			return 0;
		}
	};

	this.height = function (value){
		if (arguments.length){
			this.style('height', value);
		}else if (this[0]){
			return this.bounds().height || 0;
		}else{
			return 0;
		}
	};

	this.scroll = function (x, y){
		if (arguments.length){
			return this.each(function (el){
				utils.el.scrollTo(el, x, y);
			});
		}else if (this[0]){
			return this.scrollInfo();
		}else{
			return null;
		}
	};

	// methods:actions ---------------------------------------------------------
	this.focus = function (selected){
		if (this[0] && typeof this[0].focus === 'function'){
			this[0].focus();

			if (selected){
				this[0].select()
			}
		}
		return this;
	};

	this.blur = function (){
		if (this[0] && typeof this[0].blur === 'function'){
			return this[0].blur();
		}
		return this;
	};

	// resize the image/dom
	this.zoom = function (args){
		return this.each(function (el){
			utils.el.zoom(el, args);
		});
	};

	// methods:extras ----------------------------------------------------------
	this.transition = function (props, args){
		return this.each(function (el){
			utils.el.transition(el, props, args);
		});
	};

	// methods:events ----------------------------------------------------------
	// custom events: tap, hold, hold-end, swipe, drag, rotate, pinch, click-inside, click-outside,
	this.on = function (names, args){
		var self = this;
		return this.each(function (el){
			args 			= (typeof args === 'function' ? {'callback':args} : args) || {};
			args.context 	= 'context' in args ? args.context : this;
			args.data 		= args.data || {};
			args.data.query = self;

			// @todo add custom events;
			utils.el.addEvent(el, names, args);
		});
	};

	this.off = function (names, args){
		return this.each(function (el){
			// @todo remove custom events;
			utils.el.removeEvent(el, names, args);
		});
	};
	// @todo
	this.trigger = function (){

	};
	// @todo
	this.observe = function (){

	};
	// @todo
	this.imagesLoaded = function (){

	};
});

// add the current shorthand
Query.noConflict(Query.shorthand);

var Props = new Class(function (){
	var utils  = this.utils;
	this.$type = 'Props';

	// constants ---------------------------------------------------------------
	var RE = {
		SIZES 		: /^(<|>|<=|>=)?(\d+)((?:\-)\d+)?(w|h|vh|vw|cw|ch|%)?$/,
		BORDER 		: /(\S+)\s(\S+)\s(\S+)/,	// @info what was this for?
		RELATIVE  	: /^([+-/*%!])\=(.+)/,
	};

	// static ------------------------------------------------------------------
	this.$static = {
		'items'			: [],
		'conditions'	: {},
	};

	this.$static.init = function (){
		// @todo on window resize, maybe refresh the properties... but maybe that will be done in the Component
	};

	this.$static.types = {
		'unknown':function (key, value){
			function format (v){ return v; }
			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'string':function (key, value){
			function format (v){
				return v === null || v === undefined ? '' : v.toString();
			};
			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'number':function (key, args){
			args 		= args && typeof args === 'object' ? args : {'value':args};
			args.min 	= 'min' in args ? args.min : 0;
			args.max 	= 'max' in args ? args.max : 0;
			args.modulus= 'modulus' in args ? args.modulus : 0;

			function format (v, old){
				var original = v;
				var operator = null;

				if (v !== null && v !== undefined && (match = v.toString().match(RE.RELATIVE))){
					operator = match[1];
					v 	 	 = v.replace(RE.RELATIVE, '$2');
				}

				// @todo calculate sizing

				v = isNaN(v) ? v : parseFloat(v);

				if (operator && !isNaN(old)){
					if (isNaN(v)){
						this.warn('Can\'t calulate relative value "{value}", it needs to be a number', {'value':original});
					}else{
						switch (operator){
							case '+': v = old + v; break;
							case '-': v = old - v; break;
							case '*': v = old * v; break;
							case '/': v = old / v; break;
							case '%': v = old % v; break;
						}
					}
				}

				if (args.modulus) 				v = v % args.modulus;
				if (args.min && v < args.min) 	v = args.min;
				if (args.max && v > args.max) 	v = args.max;

				return v;
			};

			return {
				'value'	: format(args.value),
				'format': format,
			}
		},
		'array':function (key, args){
			if (args instanceof Array || typeof args !== 'object' || args === null){
				args = {'value':args};
			}
			args.value 		= 'value' in args ? args.value : [];
			args.separator 	= 'separator' in args ? args.separator : ',';
			args.nullable 	= 'nullable' in args ? args.nullable : false;

			function format (v){
				if (v === null && args.nullable){
					return null;
				}

				v = utils.toArray(v, args.separator);

				return v instanceof Array ? v : [];
			};

			return {
				'value'	: format(args.value),
				'format': format,
			}
		},
		'boolean':function (key, value){
			function format (v){
				return v === null ? null : !!v;
			};
			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'object':function (key, value){
			function format (v){
				return typeof v === 'object' ? v : {};
			};
			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'angle':function (key, args){
			args 		 = args && typeof args === 'object' ? args : {'value':args};
			args.modulus = 360;
			return this.number(key, args);
		},
		'config':function (key, value){
			function format (v, o){
				var data = o || {};
				if (v && typeof v === 'object'){
					utils.extend(data, v);
				}
				return data;
			};

			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'function':function (key, value){
			function format (v){
				if (typeof v === 'string' && window[v]){
					v = window[v];
				}
				return typeof v === 'function' ? v : function (){ return v; };
			};
			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'alias':function (key, args){
			args 	 = args || {};
			args.set = typeof args.set === 'function' ? args.set : utils.fn.empty;
			args.get = typeof args.get === 'function' ? args.get : utils.fn.empty;

			if (typeof args === 'string'){
				var path = args;

				args = {};

				args.set = function (v){
					utils.object.resolve(this, path, {'value':v});
				};

				args.get = function (){
					return utils.object.resolve(this, path);
				};
			}

			function format (v){
				args.set.call(this, v);
			}

			function alias (v){
				return args.get.call(this);
			}

			return {
				'format' : format,
				'alias'  : alias,
			}
		},
		'value4':function (key, args){
			if (args instanceof Array || typeof args !== 'object' || args === null){
				args = {'value':args};
			}
			if (args.callback === undefined) 	args.callback = utils.array.to4Values;
			if (args.fallback === undefined) 	args.fallback = '';
			if (args.separator === undefined) 	args.separator = ',';
			if (args.format === undefined) 	 	args.format = null;

			function format (v){
				return args.callback(v, {
					'format'   : args.format,
					'fallback' : args.fallback,
					'separator': args.separator,
				});
			};

			return {
				'value'	: format(args.value),
				'format': format,
			}
		},
		'value2':function (key, args){
			if (args instanceof Array || typeof args !== 'object' || args === null){
				args = {'value':args};
			}
			args.callback = utils.array.to2Values;

			return this.value4(key, args);
		},
		'number2':function (key, args){
			if (args instanceof Array || typeof args !== 'object' || args === null){
				args = {'value':args};
			}
			args.callback = utils.array.to2Values;
			args.fallback = 0;
			args.format   = parseFloat;

			return this.value4(key, args);
		},
		'number4':function (key, args){
			if (args instanceof Array || typeof args !== 'object' || args === null){
				args = {'value':args};
			}
			args.fallback = 0;
			args.format   = parseFloat;

			return this.value4(key, args);
		},
		'namespace':function (key, value){
			function format (v){
				return typeof v === 'object' ? utils.object.namespace(v) : {};
			};
			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'enum':function (key, args){
			var value 	= args[0];
			var options = args[1];

			function format (v){
				var isFound = false;
				for (var i in options){
					var option = options[i];

					if ((option == v) || (v !== null && v.constructor === option)){
						isFound = true;
					}
				}

				if (!isFound){
					utils.warn('Prop "{key}={value}" needs to be in the ENUM ({options})', {
						'key' 		: key,
						'value'		: v,
						'options'	: utils.array.join(options, {'separator':', '})
					});
					return null;
				}

				return v;
			}

			return {
				'options': options,
				'format' : format,
				'value'	 : format(value),
			}
		},
		'datetime':function (key, value){
			function format (v){
				v = utils.date.get(v);
				return v;
			}

			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'date':function (key, value){
			function format (v){
				v = utils.date.get(v, {'time':false});
				return v;
			}

			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'duration':function (key, value){
			function format (v){
				return utils.string.toDuration(v);
			}

			return {
				'value'	: format(value),
				'format': format,
			}
		},
		'shortcut':function (key, args){
			if (args instanceof Array){
				args = {'value':args[0], 'attrs':args[1]};
			}
			args.value = 'value' in args ? args.value : '';
			args.attrs = utils.toArray('attrs' in args ? args.attrs : '');
			args.format= 'format' in args ? args.format : utils.fn.empty;

			function format (v, o){
				var data     = {};
				var isString = typeof v === 'string';

				if (o === undefined){
					utils.each(args.attrs, function (name){
						data[name] = null;
					});
				}else{
					data = utils.object.clone(o);
				}

				utils.each(v, {'separator':' '}, function (value, i){
					if (isString){
						i = args.attrs[i];
					}
					data[i] = utils.string.toValue(value);
				});

				if (typeof args.format === 'function'){
					args.format(data);
				}

				return data;
			}

			return {
				'value'	: format(args.value),
				'format': format,
			}
		},
	};

	this.$static.addType = function (key, callback){
		if (this.types[key] !== undefined){
			return this.error('Can\'t add the "{type}" type, it already exists', {'type':key});
		}
		this.types[key] = callback;
	};

	this.$static.addCondition = function (key, callback){
		if (this.conditions[key] !== undefined){
			return this.error('Can\'t add the "{condition}" condition since it already exists', {'condition':key});
		}
		this.conditions[key] = callback;
	};

	// properties --------------------------------------------------------------
	this._element       = null;
	this._context       = null;
	this._hasConditions = false;
	this._props 		= {};
	this._values 		= {};
	this._isInavlid 	= false;
	this._format 		= null;
	//this._preFormat 	= null;
	//this._postformat	= null;
	this._isStrict		= true;

	// init --------------------------------------------------------------------
	this.init = function (props, args){
		// @todo make sure "props" is a simple object, and only go through the right properties
		args           = args || {};
		this._element  = 'element' in args ? args.element : null;
		this._context  = 'context' in args ? args.context : null;
		this._isStrict = 'strict' in args ? args.strict : true;

		for (var i in props){
			var pair = i.split(':');
			var key  = pair[0];
			var type = (pair[1] || 'unknown').toLowerCase();
			var data = props[i];

			// make sure there's a type
			if (!this.static.types[type]){
				return this.error('Type "{type}" does not exits', {'type':type});
			}

			if (this._props[key]){
				this._props[key].set(data, '*');
			}else{
				addProp.call(this, type, key, data);
			}
		}

		this.static.items.push(this);
	};

	this.destroy = function (){
		this.utils.array.remove(this.static.items, this);
	};

	// private functions -------------------------------------------------------
	function getProp (key, type, prop){
		var self 		= this;
		prop.key 		= key;
		prop.type 	    = type;
		prop.valueKey   = '*';
		prop.values     = {'*':{'value':prop.value, 'isDynamic':false}};
		prop.conditions = null;

		function getValueKey (){
			var valueKey = '*';

			if (typeof prop.conditions === 'object'){
				// first the first working condition
				for (var i in prop.conditions){
					var condition 	= prop.conditions[i];
					var isMatch 	= condition.check(self._element);

					if (isMatch === condition.equals){
						valueKey = i;
						break;
					}
				}
			}

			return valueKey;
		}

		prop.get = function (){
			// make sure the instance is now not fully invalid
			self._isInvalid = false;

			if (typeof prop.alias === 'function'){
				prop.value = prop.alias.call(self);
			}else if (!prop.valueKey){
				var valueKey 	= getValueKey();
				prop.valueKey 	= valueKey;
				prop.value 		= prop.values[valueKey].value;

				// bound functions to context
				if (typeof prop.value === 'function'){
					prop.value = prop.value.bind(self._context);
				}

				// @todo, should the value be validated twice?? on set() and on get()
			}

			// special format values (if it's dynamic, it's on the GET)
			if (typeof self._format === 'function' && prop.values[prop.valueKey] && prop.values[prop.valueKey].isDynamic){
				var formatted = self._format.apply(self._context, [key, prop.values[prop.valueKey].value]);
				if (formatted !== undefined){
					prop.value = formatted;
				}
			}

			return prop.value;
		};

		prop.set = function (value, valueKey){
			var valueKey = valueKey || prop.valueKey || getValueKey();
			var original = value;
			var isDynamic= typeof value === 'string' && value[0] === '!';


			// special format values
			if (typeof self._format === 'function' && !isDynamic){
				var formatted = self._format.apply(self._context, [key, value]);
				if (formatted !== undefined){
					value = formatted;
				}
			}

			if (isDynamic){
				value = value.slice(1);
			}

			var old   = self._values[key];
			var value = prop.format.apply(self, [value, old]);

			// update the value (raw) of the current set
			prop.values[valueKey] = {'value':value, 'isDynamic':isDynamic};
			prop.valueKey         = null;
			self._values[key]	  = value;
		};

		return prop;
	}

	function addProp (type, key, data){
		var definition 	= this.static.types[type](key, data);
		var prop 		= getProp.call(this, key, type, definition);

		this._props[key] = prop;

		Object.defineProperty(this, key, {
			'get':prop.get,
			'set':prop.set
		});

		return prop;
	}

	function isSizeCondition (condition){
		var match = condition.match(RE.SIZES);
		if (!match){
			return;
		}

		var nbr1     = parseFloat(match[2]) || 0;
		var nbr2     = parseFloat((match[3] || '').toString().replace('-', ''));
		var compare  = match[1];
		var unit 	 = match[4] || 'w';
		var key      = '';

		if (unit === '%'){
			unit = 'vw';
		}

		if (!compare && !isNaN(nbr1) && !isNaN(nbr2)){
			compare = '<=>';
		}else if (!compare){
			compare = '<=';
		}

		var min = 0;
		var max = 0;

		if (compare === '<'){
			max = nbr1 - 1;
		}else if (compare === '<='){
			max = nbr1;
		}else if (compare === '>'){
			min = nbr1 + 1;
			max = Infinity;
		}else if (compare === '>='){
			min = nbr1;
			max = Infinity;
		}else if (compare === '<=>'){
			min = nbr1;
			max = nbr2;
		}

		var key = min + '-' + (!isFinite(max) ? '?' : max) + unit;

		function check (element){
			var doc  = document.documentElement;
			var el   = element || doc;
			var size = 0;

			// element width
			if (unit === 'cw'){
				size = el.clientWidth;
			// element height
			}else if (unit === 'ch'){
				size = el.clientHeight;
			// view width percentage
			}else if (unit === 'vw'){
				size = el.clientWidth / doc.clientWidth * 100;
			// view height percentage
			}else if (unit === 'vh'){
				size = el.clientHeight / doc.clientHeight * 100;
			// view width
			}else if (unit === 'w'){
				size = doc.clientWidth;
			// view height
			}else if (unit === 'h'){
				size = doc.clientHeight;
			}

			return size >= min && size <= max;
		}

		return {
			'key'	: key,
			'check'	: check,
		}
	}

	// methods -----------------------------------------------------------------
	this.isStrict = function (value){
		if (!arguments.length){
			return this._isStrict;
		}else{
			this._isStrict = !!value;
			return this;
		}
	};

	this.invalidate = function (){
		// no dynamic conditions or already invalidated, so no need to invalidate everything
		if (!this._hasConditions || this._isInvalid){
			return;
		}

		for (var i in this._props){
			var prop = this._props[i];
			if (prop.conditions){
				this._props[i].valueKey = null;
			}
		}

		this._isInvalid = true;
	};

	this.setElement = function (element){
		if (element = this.utils.dom.get(element)){
			this._element = element;
			this.invalidate();
		}
		return this;
	};

	this.setContext = function (context){
		this._context = context;
		this.invalidate();
		return this;
	};

	this.setFormat = function (callback, isPost){
		this._format = callback;
		return this;
	};

	this.set = function (key, value, defaultCondition){
		var props = this.utils.toSetterObject(key, value, {});

		for (var i in props){
			var pair      = i.split(':');
			var key       = pair[0];
			var conditions = pair[1] || defaultCondition;
			var value     = props[i];
			var prop 	  = this._props[key];

			if (!prop){
				if (this._isStrict){
					this.warn('To add unknown property "{key}", set strict to false', {'key':key});
					continue;
				}else{
					prop = addProp.call(this, 'unknown', key.replace(/:.+/, ''), value);
				}
			}

			// update the current condition
			if (!conditions){
				prop.set(value);
				continue;
			}

			conditions = conditions ? conditions.split(',') : [];

			for (var i in conditions){
				var condition = conditions[i];

				// set it the default value
				if (condition === '*'){
					prop.set(value, '*');
					continue;
				}

				// has a condition
				var sizeCondition  = null;
				var foundCondition = null;
				var isNot	   	   = condition[0] === '!';
				var conditionName  = condition.replace('!', '');

				// @todo add many conditions at the same time

				if (this.static.conditions[conditionName]){
					foundCondition = {
						'key'	: conditionName,
						'check' : this.static.conditions[conditionName]
					};
				}else if (sizeCondition = isSizeCondition(conditionName)){
					foundCondition = sizeCondition;
				}

				if (!foundCondition){
					this.warn('Condition "{name}" does not exists', {'name':conditionName});
					continue;
				}

				if (!prop.conditions){
					prop.conditions = {};
				}

				var conditionKey = (isNot ? '!' : '') + foundCondition.key;

				// @todo pass parameter to conditions

				prop.conditions[conditionKey] 	= {'check':foundCondition.check, 'equals':!isNot};
				prop.set(value, conditionKey);
				/*
				if (conditionKey in prop.values){
					prop.values[conditionKey].value = value;
				}else{
					prop.values[conditionKey] = {'value':value, 'isDynamic':false};
				}*/
				//prop.values[valueKey] = {'value':value, 'isDynamic':isDynamic};

				prop.valueKey = null;
				this._hasConditions = true;
			}
		}

		return this;
	};

	this.get = function (key, fallback){
		if (key === undefined){
			for (var i in this._props){
				this._values[i] = this._props[i].get();
			}
			return this._values;
		}else if (this._props[key]){
			this._values[key] = this._props[key].get();
			return this._values[key];
		}else{
			return fallback;
		}
	};

	this.toSource = function (){
		var props = [];

		for (var i in this._props){
			var prop = this.utils.object.merge({}, this._props[i], null, 'conditions,valueKey,format,get,set,values');
			prop.value = this._props[i].get();
			props.push(prop);
		}

		return props;
	};
});


/*

	props = {
		key : {
			value:
			...
		}
	}

*/

var Require = new Class(function (){
	var utils  = this.utils;
	this.$type = 'Require';

	// constants ---------------------------------------------------------------
	var STATUS = {
		LOADING   : 'loading',
		LOADED 	  : 'loaded',
		ERROR 	  : 'error',
	};

	// static ------------------------------------------------------------------
	this.$static = {
		'version'	: 0,
		'urls'		: {},
		'cache'		: true,
		'baseUrl'	: '',
	};

	this.$static.load = function (url, callback){
		console.log(url)
		var self = this;
		var item = this.urls[url];
		var url2 = url;

		if (!this.cache){
			url2 += (~url.indexOf('?') ? '&' : '?') + '_='+(+new Date());
		}else if (this.version){
			url2 += (~url.indexOf('?') ? '&' : '?') + '_='+self.version;
		}

		if (!~url2.indexOf('http')){
			url2 = (this.baseUrl || '') + url2;
		}

		if (item){
			item.callbacks.push(callback);
		}else{
			var isCss 	= ~url.indexOf('.css');
			var item 	= {
				'url'		: url,
				'start'		: +new Date(),
				'status'	: STATUS.LOADING,
				'callbacks'	: [callback],
			};

			item.onComplete = function (){
				self.info('... "{url}" loaded', {'url':url2});

				item.status = STATUS.LOADED;
				item.time 	= +new Date() - item.start;

				// remove the validated callbacks
				utils.array.remove(item.callbacks, function (callback){
					return callback();
				});
			};

			item.onError = function (){
				self.info('... error loading "{url}"', {'url':url2});

				item.status = STATUS.ERROR;
				item.time 	= +new Date() - item.start;

				// remove the validated callbacks
				utils.array.remove(item.callbacks, function (callback){
					return callback();
				});
			};

			this.info('Loading... "{url}"', {'url':url2});

			var head = document.getElementsByTagName("head")[0];
			if (isCss){
				var head  = document.getElementsByTagName('head')[0];
			    var link  = document.createElement('link');

				link.rel  	= 'stylesheet';
			    link.type	= 'text/css';
			    link.media 	= 'all';
				link.onload = item.onComplete;
				link.onerror= item.onError;
			    link.href 	= url2;

				head.appendChild(link);
				// @todo
			}else{
				script 			= document.createElement('script');
				script.type 	= "text/javascript";
				script.async 	= true;
				script.defer 	= true;

				// IE browser
				if (script.readyState){
					script.onreadystatechange = function (){
						if (this.readyState != "loaded" && this.readyState != "complete") return;
						this.onreadystatechange = null;
						item.onComplete();
					};
					// @todo validate when there's an error loading the script
				// other browsers
				}else{
					script.onload  = item.onComplete;
					script.onerror = item.onError;
				}

				script.src = url2;

				head.appendChild(script);
			}

			this.urls[url] = item;
		}
	};

	this.$static.stats = function (){
		var text = [];
		for (var i in this.urls){
			var item = this.urls[i];
			var time = utils.number.toDuration(item.time);
			time = utils.string.pad(time, ' ', 6);
			text.push(time + item.url);
		}
		return text.join('\n');
	};

	// properties --------------------------------------------------------------
	this.urls 	    = [];
	//this.version    = 0;
	//this.baseUrl 	= '';
	this.context 	= null;
	this.onComplete = null;
	this.isComplete = false;

	// init --------------------------------------------------------------------
	this.init = function (urls, args){
		var self = this;

		args 			= (typeof args === 'function' ? {'onComplete':args} : args) || {};
		this.version 	= 'version' in args ? args.version : this.static.version;
		this.context 	= 'context' in args ? args.context : null;
		this.onComplete = 'onComplete' in args ? args.onComplete : this.utils.fn.empty;

		// add versioning
		this.urls = this.utils.toArray(urls);

		this.validate = function (){
			var isValid 	= true;
			var allUrls 	= self.static.urls;
			var loadedUrls 	= [];
			var errorUrls 	= [];

			for (var i=0, l=self.urls.length; i<l; i++){
				var url = self.urls[i];

				if (!allUrls[url] || allUrls[url].status === STATUS.LOADING){
					isValid = false;
				}else if (allUrls[url].status === STATUS.LOADED){
					loadedUrls.push(url);
				}else if (allUrls[url].status === STATUS.ERROR){
					errorUrls.push(url);
				}
			}

			if (isValid){
				self.isComplete = true;
				self.onComplete.apply(self.context, [loadedUrls, errorUrls]);
			}

			return isValid;
		}

		if (!self.validate()){
			this.utils.each(this.urls, function (url){
				self.static.load(url, self.validate);
			});
		}
	};
});

var COMPONENT = window.COMPONENT || {};
var BINDINGS  = window.BINDINGS || {};

var Component = new Class(function (){
	var utils 	 = this.utils;
	this.$uses	 = 'Filters,Events,Query,Require,Props,Browser';
	this.$type 	 = 'Component';
	this.$mixins = 'MixinEvents,MixinStates,MixinStyles,MixinFilters';

	// constants ---------------------------------------------------------------
	var FIX_FUNCTIONS = 'cache,render,uncache,unrender,addEvents,removeEvents,destroy'.split(',');

	var RESERVED_KEYS = 'self,container,window,document,html,body'.split(',');

	var STATUS = {
		REQUESTED : 'requested',
		LOADING   : 'loading',
		LOADED 	  : 'loaded',
	};

	var CLASSES = {
		IS_INITIALIZING         : 'is-initializing',
		IS_LOADED				: 'is-loaded',
		IS_ANIMATING 	        : 'is-animating',
		IS_DEBUG 				: 'is-debug',
		IS_LOADING 		        : 'is-loading',
		IS_LOADING_CHILDREN     : 'is-loading-children',
		IS_LOADING_MEDIAS       : 'is-loading-medias',
		IS_LOADING_DEPENDENCIES : 'is-loading-dependencies',
		IS_LOADING_AJAX			: 'is-loading-ajax',
		IS_LOADING_URLS 		: 'is-loading-urls',
		IS_DISABLE 				: '-disabled',	// .is-disable is already used in the main CSS
		NO_ANIMATIONS           : 'no-animations',
	};

	// static ------------------------------------------------------------------
	this.$static = {
		'componentsBaseUrl'     : '/components/',
		'mixinsBaseUrl' 	    : '/mixins/',
		'compomentClassPrefix'  : 'component-',
		'stateClassPrefix'		: '-',
		'styleClassPrefix'		: '--',
		'classes'	            : {},
		'items'	 	            : [],
		'queue'					: [],
		'queueEvents'			: [],
		'getterShorthand'		: '__',
		'debugCanvas'			: null,
		// debug
		'warnRescan'			: true,
	};

	this.$static.getter = function (shorthand){
		if (window[this.getterShorthand]){
			delete(window[this.getterShorthand]);
		}

		this.getterShorthand = shorthand;

		window[shorthand] = function (selector, args){
			return Component.get(selector, args);
		};
	};

	this.$static.start = function (){
		// set the shorthand (to clickly get the instances)
		Component.getter(Component.getterShorthand);

		// Add screen breakpoints conditions
		Props.addCondition('mobile', function (){ return Browser.isMobile(); });
		Props.addCondition('phone', function (){ return Browser.breakpoint === 'phone'; });
		Props.addCondition('tablet', function (){ return Browser.breakpoint === 'tablet'; });
		Props.addCondition('laptop', function (){ return Browser.breakpoint === 'laptop'; });
		Props.addCondition('widescreen', function (){ return Browser.breakpoint === 'widescreen'; });
		Props.addCondition('mobileSize', function (){ return Browser.breakpoint === 'phone' || Browser.breakpoint === 'tablet'; });
		Props.addCondition('ie', function (){ return Browser.info().name === 'ie'; });
		Props.addCondition('ie10', function (){ var info = Browser.info(); return info.name === 'ie' && info.version <= 10; });

		// scan for components
		this.scan('body');

		// global onclick event for all components
		utils.dom.addEvent(document, 'click', {
			'delegate' : '[on-click]',
			'callback' : self_onClick,
		});

		// refresh components on resize
		Browser.on('resize', browser_onResize);
		Browser.on('scroll', browser_onScroll);
	}

	this.$static.getClass = function (key){
		if (typeof key === 'function' || typeof key === 'object'){
			return key;
		}else if (typeof key === 'string'){
			var keyLC = key.toLowerCase();

			if (this.classes[keyLC] && this.classes[keyLC].status === STATUS.LOADED){
				return this.classes[keyLC].class;
			}else{
				return key;
			}
		}else{
			return key;
		}
	};

	this.$static.define = function (type, props){
		var self = this;

		if (this.classes[type] && this.classes[type].status === STATUS.LOADING){
			return _this.warn('Can\'t redefine Class "{type}"', {'type':type});
		}

		// make sure the props are an object
		if (typeof props === 'function'){
			props.prototype.utils = utils;
			props = new props();
		}

		// validate that the type is set (use the name)
		if (props.$type === undefined){
			props.$type = this.utils.string.toCamelCase(type, true);
		}
		if (!props.classname){
			props.classname = this.utils.string.toDashCase(props.$type);
		}
		if (!props.init){
			props.init = props.$extends ? function (){ this._super.apply(this, arguments); } : function (){};
		}

		// fix the new Components main functions (so we don't have to call ._super() each time)
		if (!props.$extends){
			props.$extends = Component;

			for (var i=0, l=FIX_FUNCTIONS.length; i<l; ++i){
				var name = FIX_FUNCTIONS[i];
				var fct  = typeof props[name] === 'function' ? props[name] : null;

				if (!fct) continue;

				props[name] = (function (name, old){
					return function (){
						if (
							((name === 'cache' || name === 'render') && !this.props.enable) ||
							((name === 'uncache' || name === 'unrender') && this.props.enable)
						){
							return this;
						}
						old.apply(this, arguments);
						this._super.apply(this, arguments);
					}
				}(name, fct));
			}
		}

		var item 		= this.classes[type] || {};
		item.requires 	= item.requires || [];
		item.extend 	= this.getClass(props.$extends);
		item.status 	= STATUS.LOADING;
		item.class 		= null;

		item.validate = function (){
			if (this.class) 		  return true;
			if (this.requires.length) return false;

			props.$extends = self.getClass(props.$extends);

			// still not ready
			if (typeof props.$extends === 'string') return;

			// @todo merge some properties ($mixins, _elements, _style)

			this.class = new Class({'merge':'props', 'wait':function (init, args){
				// make sure the Component.init is called first()
				Component.prototype.init.apply(this, args.concat(init));

				// all done
				this.initDone();
			}}, props);

			this.status = STATUS.LOADED;

			// export to Component for quick creation
			Component[props.$type] = this.class;

			// create instances of items in the queue
			utils.array.remove(self.queue, function (q){
				if (q.type === type){
					self.create(type, q);
					return true;
				}
			});

			// validate other classes that could be depending on this one
			for (var i in self.classes){
				if (i === type) continue;

				var other = self.classes[i];
				if (typeof other.validate === 'function'){
					other.validate();
				}
			}
		};

		// get all the required scripts/css
		var requires = [];
		if (typeof item.extend === 'string'){
			item.requires.push(self.componentsBaseUrl + item.extend.toLowerCase() + '.js');
		}
		utils.each(props.$mixins, function (value){
			if (typeof value !== 'string' || Core[value] || window[value]) return;
			value = value.split(':')[0];
			item.requires.push(self.mixinsBaseUrl + value.toLowerCase() + '.js');
		});
		utils.each(props.$requires, function (value){
			item.requires.push(value);
		});

		this.classes[type] = item;
		this.require(item.requires, type);
	};

	this.$static.require = function (urls, initType){
		var self = this;

		new Require(urls, function (found, error){
			if (error.length){
				self.warn('Files "{urls}" couldn\'t be loaded for "{type}"', {
					'urls' : error.join(', '),
					'type' : initType,
				});
			}

			var all = found.concat(error);
			//self.info('REQUIRE ..... found: {found}, error: {error}', {'found':found.join(', '), 'error' : error.join(', ')});

			// check for waiting classes
			for (var type in self.classes){
				var item = self.classes[type];

				if (item.status === STATUS.LOADED) continue;

				// remove the loaded required scripts/css
				if (item.requires){
					utils.array.remove(item.requires, all);
				}

				// check if current is finished loading
				if (item.status === STATUS.LOADING){
					item.validate();
				}
			}
		});
	};

	this.$static.create = function (type, args){
		var self = this;

		args = args || {};
		if (args.element === undefined) 	args.element = null;
		if (args.props === undefined) 		args.props = {};
		if (args.classes === undefined) 	args.classes = [];
		if (args.onReady === undefined)		args.onReady = utils.fn.empty;
		if (args.onLoad === undefined)		args.onLoad = utils.fn.empty;
		if (args.warnRescan === undefined)	args.warnRescan = this.warnRescan;

		// wait for the class to be fully loaded
		var klass = this.classes[type];
		var item  = null;

		args.type = type;

		if (klass && klass.status !== STATUS.LOADED){
			this.queue.push(args);
		}else if (!klass){
			var url = this.componentsBaseUrl + type.toLowerCase() + '.js';

			this.classes[type] = {'status':STATUS.REQUESTED};
			this.queue.push(args);

			this.require(url, type);
		}else{
			var element = $$(args.element);
			item = element.cache('component');

			// make sure the element is not already instantiated
			if (item){
				args.warnRescan && this.warn('Element #{id} is already initiated as a "{type}"', {
					'id'  : item.getId(),
					'type': item.getType(),
				});
				return;
			}

			item = new klass.class(element, args.props, args.classes);
			item.isReady(args.onReady);
			item.isLoaded(args.onLoad);

			// check for queued events
			utils.array.remove(this.queueEvents, function (q){
				if (item.is(q.search)){
					item.isReady(q.onReady);
					item.isLoaded(q.onLoad);
					return true;
				}
			});
		}

		return item;
	};

	this.$static.scan = function (selector, args){
		var self = this;

		args = args || {};
		if (args.name === undefined) 		args.name = '';
		if (args.onReady === undefined) 	args.onReady = utils.fn.empty;
		if (args.onLoad === undefined) 		args.onLoad = utils.fn.empty;
		if (args.warnRescan === undefined) 	args.warnRescan = this.warnRescan;
		if (args.lazy === undefined) 		args.lazy = false;

		var elements = $$(selector).find('[is]');
		var total 	 = elements.length;
		var ready 	 = 0;
		var loaded 	 = 0;

		Events.trigger('scan-components scan-components-ready', {
			'count'		: 0,
			'total'		: total,
			'isStart'	: true,
		});

		elements.each(function (el){
			el = $$(el);

			var type  	= el.attr('is').split('.');
			var classes = type.slice(1);
			var props 	= el.data();
			type 		= type[0];

			//self.info('//// scaning ' + type + ' #' + el.attr('id') + ' ////');

			self.create(type, {
				'element' 	: el,
				'classes' 	: classes,
				'props' 	: props,
				'onReady':function (){
					ready++;

					args.onReady(this, ready, total);

					Events.trigger('scan-components-ready', {
						'count'	: ready,
						'total' : total,
						'isEnd'	: ready === total,
					});
				},
				'onLoad':function (){
					loaded++;

					args.onLoad(this, loaded, total);

					Events.trigger('scan-components', {
						'count'	: loaded,
						'total'	: total,
						'isEnd'	: loaded === total,
					});
				},
				'warnRescan' : args.warnRescan,
			});
		});
	};

	/*
	this.$static.is = function (item, search){
		return 	(item === search) ||
				(item.getId() === search) ||
				(item.isComponent(search));
	};
	*/

	this.$static.get = function (search, args){
		if (typeof args === 'function'){
			args = {'onLoad':args};
		}
		if (typeof args === 'boolean'){
			args = {'closest':args};
		}

		args = args || {};
		if (args.onReady === undefined) args.onReady = utils.fn.empty;
		if (args.onLoad === undefined)  args.onLoad = utils.fn.empty;
		if (args.closest === undefined) args.closest = false;

		if (args.closest){
			search = $$(search).closest('[is]');
		}

		var item = utils.array.get(this.items, function (i){
			return this.is(search);
		});

		// wait for them to be ready
		if (item){
			item.isReady(args.onReady);
			item.isLoaded(args.onLoad);
		}else if (args.onReady || args.onLoad){
			args.search = search;
			this.queueEvents.push(args);
		}

		return item;
	};

	this.$static.find = function (search, args){
		if (search instanceof Array){
			search = {'items':search};
		}else if (typeof search === 'string'){
			search = {'items':utils.toArray(search)};
		}

		search = search || {};
		if (search.items === undefined) search.items = null;
		if (search.type === undefined) search.type = null;
		if (search.parent === undefined) search.parent = null;

		if (typeof args === 'function'){
			args = {'onAll':args};
		}
		args = args || {};
		if (args.onReady === undefined) args.onReady = utils.fn.empty;
		if (args.onLoad === undefined) 	args.onLoad = utils.fn.empty;
		if (args.onEach === undefined) 	args.onEach = utils.fn.empty;
		if (args.onAll === undefined) 	args.onAll = utils.fn.empty;
		if (args.context === undefined) args.context = null;

		// find specific items
		var instances = {};
		var total 	  = 0;
		var count 	  = 0;

		function _onReady (){
			instances[this.getId()] = this;
			args.onReady.call(args.context, this);
		}

		function _onLoad (){
			args.onLoad.call(args.context, this);
			args.onEach.call(args.context, this);

			count++;

			if (count >= total){
				args.onAll.call(args.context, instances);
			}
		}

		if (search.items){
			total = search.items.length;

			utils.each(search.items, {'context':this}, function (item){
				this.get(item, {'onReady':_onReady, 'onLoad':_onLoad});
			});
		// check the current list
		}else{
			var types 	= search.type ? utils.toArray(search.type) : null;
			var parent 	= null;

			if (search.parent instanceof Component){
				parent = search.parent.element[0];
			}else if (search.parent){
				parent = utils.dom.get(search.parent);
			}

			//search.parent ? search.parent utils.dom.get(search.parent) : null;

			utils.each(this.items, {'context':this}, function (item){
				if (types && !item.isType(types)) return;
				//if (parent && !parent.contains(item.element)) return;
				instances[item.getId()] = item;
				total++;
			});

			utils.each(instances, function (item){
				item.isReady(_onReady);
				item.isLoaded(_onLoad);
			});
		}

		return instances;
	};

	this.$static.stats = function (){
		var text = [];

		for (var i in this.items){
			var item 		= this.items[i];
			var mountTime 	= utils.string.pad(utils.number.toDuration(item._stats.mountTime), ' ', 6, 'left');
			var refreshTime = utils.string.pad(utils.number.toDuration(item._stats.refreshTime), ' ', 6, 'left');
			var name 		= item.getType() + '#' + item.getId();
			text.push('mount: '+mountTime + ' | refresh: ' + refreshTime + '  ->  ' + name);
		}

		return text.join('\n');
	};

	// private properties ------------------------------------------------------
	// content modifiers
	this._styleVars             = {};		// variable used for the style added
	this._style                 = {};		// style that will be added to the top of the page
	this._elements				= '';
	this._html                  = null;		// html insert in the element
	this._outerHtml             = null;		// html that will replace the element
	this._debug 				= null;
	this._debugIds 				= [];
	this._stats 				= {};
	// triggers from the extended classes
	this._listenToResize 	    = false;
	this._refreshOnResize       = true;
	this._refreshOnWindowResize = false;
	this._refreshInvisible 	    = false;
	this._refreshChildren       = false;
	this._loadMedias 		    = false;
	this._loadChildren  	    = false;
	this._isTemplate 			= false;	// is the innerHTML a template
	// props
	this._templates             = {};		// list of templates fetched (<template> Dom element)
	this._bindings 	            = [];		// list of simple one-way binding (with "bind" attribute)
	this._bindingCallbacks 	    = {};
	this._childrenQueue	 	    = [];
	this._hiddenElements 	    = [];		// elements with [hide] attributes
	this._bounds 			    = null;
	// states
	this._isLoading             = [];		// list of loading classnames
	this._isLoaded              = false;
	this._isRendered            = false;
	this._isAnimating 	        = false;
	this._hasAnimation 	        = true;
	this._cancelAnimation       = null;		// function to be called when isAnimating(false) is called
	// events callbacks
	this._onLoad 	            = [];
	this._onReady 	            = [];
	this._onFirstRender         = [];
	this._onChildrenLoad        = [];

	// properties --------------------------------------------------------------
	this.element         = null;		// main element
	this.originalElement = null;		// if the original element is changed, keep the original
	this.parentElement   = null;

	//this.browser 		= Browser;	// can't be here... seems to be copied, not a simpleObject

	this.elements      = {};			// list of elements found
	this.classname     = null;			// default classname
	this.parent 	   = undefined;		// parent component
	this.children	   = {};			// children components

	//this.browser 	   = Browser;

	// list of properties
	this.props = {
		'root'						: null,
	//	'js'						: null, // linked JS file
	//	'css'						: null, // linked CSS file
	//	'html'						: null, // linked HTML file
		'optimizeResize:Boolean'	: false,
	//	'listenToScroll:Boolean'	: false,
		'inView'					: 0, // percent of the element to be visible to trigger the "in-view"
		'dictionary:Namespace'  	: {},
		'enable:Boolean'			: true,
		'debug:Boolean'				: false,
		// quick events
		'onReady:Function'			: null,
		'onLoad:Function'			: null,
		'onDestroy:Function'		: null,
	};

	// default states
	this.states = {};

	// init --------------------------------------------------------------------
	this.init = function (selector, props, classes, init){
		var self = this;
		if (props === undefined){
			props    = selector;
			selector = null;
		}

		// stats ---------------------------------------------------------------
		this._stats.start = +new Date();

		// elements ------------------------------------------------------------
		if (!this.static.window){
			this.static.window	 = this.$(window);
			this.static.document = this.$(document);
			this.static.html	 = this.$('html');
			this.static.body	 = this.$('body');
			this.static.empty 	 = this.$();
		}

		this.element 			= this.$(selector);
		this.originalElement	= this.element;
		this.parentElement		= this.element.parent().closest('[is]');

		// defaults items
		this.each(this._elements, function (name){
			this.elements[name] = this.$();
		});

		this.elements.window 	= this.static.window;
		this.elements.document 	= this.static.document;
		this.elements.html 		= this.static.html;
		this.elements.body 		= this.static.body;
		this.elements.empty 	= this.static.empty;

		// set the ID to the proper one
		this.setId(this.element.attr('id') || this.getId());

		// classes -------------------------------------------------------------
		classes = utils.toArray(classes);
		this.addClass(classes);

		// props ---------------------------------------------------------------
		this.props = new Props(this.props)
				.setContext(this)
				.isStrict(false);

		// find the properties set in the COMPONENT object
		props = getProps({
			'types' 	: this.getTypes(),
			'classes' 	: this.getClasses(),
			'id'		: this.getId(),
			'script'	: this.element.children('script[type="data/json"]').remove().json(true),
			'inline'	: props,
		});

		// merge the dictionary prop
		props.dictionary = utils.string.toObject(props.dictionary); // make sure the dictionary is an object
		props.dictionary = utils.extend(true, {}, this.props.dictionary, props.dictionary || {});

		this.props.set(props, undefined, '*');

		// html ----------------------------------------------------------------
		var element = getRootElement.apply(this);
		this.setElementComponent(this.originalElement);
		this.setElement(element);

		// states --------------------------------------------------------------
		this.watchState(state_onChange);
		for (var i in this.states){
			this.setState(i, this.states[i]);
		}

		// style ---------------------------------------------------------------
		this._styleVars['state']  = '{self}.'+this.static.stateClassPrefix;
		this._styleVars['debug']  = '{self}.is-debug';
		this._styleVars['!debug'] = '{self}:not(.is-debug)';

		this.addBaseStyle(this._style, this._styleVars);
		this.element.addClass(CLASSES.IS_INITIALIZING);
		this.element.addClass(this.getClassnames());

		// imports -------------------------------------------------------------
		// @todo

		// children ------------------------------------------------------------
		//var container 	= this.element.get(0);
		var element		= this.element[0];
		var children	= this.element.find(true, '[is],[bind],[clone],[element],[hide],[template],template')
						.add(false, '[element^="#'+this.getId()+':"],[bind^="#'+this.getId()+':"],[template^="#'+this.getId()+':"]')
						.add(false, '[element$="!global"]')

		children.each(function (el){
			var id 			= '#' + self.getId() + ':';
			var isKey       = el.getAttribute('is');
			var bindKey     = el.getAttribute('bind');
			var cloneKey    = el.getAttribute('clone');
			var elementKey  = el.getAttribute('element');
			var templateKey = el.getAttribute('template') || (el.tagName.toLowerCase() === 'template' ? el.getAttribute('id') : null);
			var hideKey 	= el.hasAttribute('hide');

			var externalKey = elementKey && (elementKey[0] === '#') ? elementKey :
							  bindKey && bindKey[0] === '#' ? bindKey :
							  templateKey && templateKey[0] === '#' ? templateKey :
							  null;

			// skip if external but not the right ID
			if (externalKey && !~externalKey.indexOf(id)){
				return;
			}

			var isGlobal 	= elementKey && !!~elementKey.indexOf('!global');
			var parent		= externalKey || isGlobal ? element : (utils.el.closest(el.parentNode, '[is]', element) || element);

			if (parent !== element){
				return;
			}

			el = $$(el, self);

			// make sure to not re-add the same instance to itself
			if (isKey && !el.is(self.originalElement) && !el.is(self.element)){
				addInstance.call(self, el);
			}
			if (bindKey){
				bindKey = bindKey.replace(id, '');
				addBinding.call(self, bindKey, el);
			}
			if (cloneKey){
				doClone.call(self, cloneKey, el);
			}
			if (elementKey){
				//console.log(self.getId(), elementKey, el);
				elementKey = elementKey.replace(id, '').replace('!global', '').trim();
				addElement.call(self, elementKey, el);
			}
			if (templateKey !== null){
				templateKey = templateKey.replace(id, '');
				addTemplate.call(self, templateKey, el);
			}
			if (hideKey && (!isKey || el.is(element))){
				addHidden.call(self, el);
			}

			// clean bind and clone, once they are done
			var clean = {'bind':'', 'clone':''};
			if (!externalKey){
				clean.element = '';
			}
			el.attrs(clean);
		});

		// caching -------------------------------------------------------------
		// add it to the items
		this.static.items.push(this);

		// quick onReady
		if (typeof this.props.onReady === 'function'){
			this.props.onReady.apply(this);
		}

		// root ----------------------------------------------------------------
		if (this.props.root){
			var root = this.$(this.props.root);
			root.append(this.element);
		}

		// events --------------------------------------------------------------
		this.trigger('ready');

		// preload -------------------------------------------------------------
		//this.info('load component...');

		// add the isLoading first (the order of events is important)
		if (this._loadChildren)  this.isLoading(true, CLASSES.IS_LOADING_CHILDREN);
		if (this._loadMedias) 	 this.isLoading(true, CLASSES.IS_LOADING_MEDIAS);

		init.call(this, props);

		if (this._loadChildren){
			this.isChildrenLoaded(function (){
				self.isLoading(false, CLASSES.IS_LOADING_CHILDREN);
			});
		}
		if (this._loadMedias){
			utils.dom.onMediaLoad(this.element, function (imgs){
				self.isLoading(false, CLASSES.IS_LOADING_MEDIAS);
			});
		}
	};

	this.initDone = function (){
		if (this.isLoading() || this.isLoaded()){
			return;
		}

		this.element.removeClass(CLASSES.IS_INITIALIZING);
		this.element.addClass(CLASSES.IS_LOADED);
		$$(this._hiddenElements).attr('hide', '');

		// add events
		this.addEvents();
		this.bounds(); // cache the bounds
		this.isLoaded(true);
		this.trigger('load');

		var count = this.utils.count(this.children);
		this.info('loaded component'+(count?' ('+this.utils.count(this.children)+' children)':''));

		// add to parent
		var parent = this.getParent(true);
		if (parent){
			parent.addChildren(this);
		}

		// quick onLoad
		if (typeof this.props.onLoad === 'function'){
			this.props.onLoad.apply(this);
		}

		this.preMount();

		// refresh the component
		this._stats.startRefresh = +new Date();
		this.refresh();

		this.mount();

		this.isInView(); // @todo fix this code, maybe it can be an "optional check"

		// stats ---------------------------------------------------------------
		this._stats.refreshTime = (+new Date() - this._stats.startRefresh);
		this._stats.mountTime   = (+new Date() - this._stats.start);
	};

	this.preMount = function (){};
	this.mount = function (){};			// after first render
	this.unmount = function (){};		// before destroy

	this.addEvents = function (){
	};

	this.removeEvents = function (){
		//
	};

	this.cache = function (){
		if (this.props.debug){
			this.element.addClass(CLASSES.IS_DEBUG);
		}else{
			this.element.removeClass(CLASSES.IS_DEBUG);
		}
		this.element.removeClass(CLASSES.IS_DISABLE);
	};

	this.uncache = function (){
		this.element.addClass(CLASSES.IS_DISABLE);
	};

	this.render = function (){
		this.isRendered(true);
		this.renderBindings();
		this.trigger('render');
	};

	this.unrender = function (){
		this.isRendered(true);
		this.trigger('unrender');
	};

	this.destroy = function (){
		this.unmount();

		// destroy all children
		this.each(this.children, function (item){
			// do not try to destroy itself
			if (item === this) return;

			// only destroy direct descendants
			if (!this.element.contains(item.element)){
				return;
			}

			item.destroy();
		});

		// remove from direct parent
		var parent = this.getParent();
		if (parent){
			delete(parent.children[this.getId()]);
		}

		this.removeEvents();
		this.element.remove();
		this.utils.array.remove(this.static.items, this);

		// quick onDestroy
		if (typeof this.props.onDestroy === 'function'){
			this.props.onDestroy.apply(this);
		}
	};

	this.refresh = function (){
		if (this.props.enable){
			this.cache();
			this.render();

			if (this._refreshChildren){
				this.refreshChildren();
			}
		}else{
			this.uncache();
			this.unrender();
		}
	};

	this.refreshChildren = function (refreshInvisible){
		utils.each(this.children, function (item){
			if (item.isLoaded() && (item.isVisible() || refreshInvisible)){
				item.refresh();
			}
		});
	};

	// private functions -------------------------------------------------------
	function getProps (args){
		args          = args || {};
		args.types    = args.types || [];
		args.classes  = args.classes || [];
		args.id       = args.id || null;
		args.script   = args.script || {};
		args.inline   = args.inline || {};

		if (typeof args.script !== 'object'){
			args.script = {};
		}
		if (typeof args.inline !== 'object'){
			args.inline = {};
		}

		var keys = [];
		// types
		utils.each(args.types, function (t){
			keys.push(t);
		});
		// classes
		utils.each(args.classes, function (c){
			keys.push('.' + c);

			utils.each(args.types, function (t){
				keys.push(t + '.' + c);
			});
		});
		// id
		if (args.id){
			keys.push('#' + args.id);
		}

		var props = {};
		for (var i=0, l=keys.length; i<l; ++i){
			var key = keys[i];
			var p 	= COMPONENT[key];

			if (!p) continue;

			utils.extend(true, props, p);
		}

		utils.extend(true, props, args.script, args.inline);

		return props;
	};

	function getRootElement (){
		if (!this._html && !this._outerHtml){
			return this.element;
		}

		var html = this._html || this._outerHtml;
		var data = this.props.dictionary;

		var children = this._isTemplate ? [] : this.element.children().not('script,template,[template]').get();
		var response = parseHtml.apply(this, [this.element, html, {
			'children'	     : children,
			'data'           : data,
			'replace'		 : !!this._outerHtml,
			'returnTemplate' : true,
		}]);

		if (response.childrenTemplate){
			this.setTemplate('@children', response.childrenTemplate);
		}

		return response.element;
	}

	function parseHtml (element, html, args, isDebug){
		args = args || {};

		if (args.replace === undefined) 		args.replace = true;
		if (args.data === undefined) 			args.data = {};
		if (args.children === undefined)		args.children = [];
		if (args.format === undefined)			args.format = utils.fn.empty;	// format child data
		if (args.onChild === undefined)			args.onChild = utils.fn.empty;	//
		if (args.classname === undefined)		args.classname = this.classname;
		if (args.returnTemplate === undefined) 	args.returnTemplate = false;

		var dom 	         = $$('<div>');
		var replaceChildren  = !!~html.indexOf('@children') || !!~html.indexOf('data-each');
		var replaceElement   = !!~html.indexOf('@html') || !!~html.indexOf('data-replace="html"');
		var childrenTemplate = null;

		args.data['html.class'] = args.data['self'] = args.classname;

		// replace special codes
		html = html.replace(/\@children/g, 'data-each');
		html = html.replace(/\@(html|child)/g, '<div data-replace="$1"></div>');
		html = utils.string.interpolate(html, args.data, {'fallback':null});
		dom.html(html);

		if (replaceChildren){
			dom.find(true, '[data-each]').each(true, function (el){
				var parent 	 = el.parent();
				var template = el.remove().outerHtml();

				childrenTemplate = template;

				// use the template to add the childs
				utils.each(args.children, function (child, i){
					var data = child = args.format(child);

					// get the proper child data
					if (utils.dom.isElement(child)){
						var attrs = utils.el.attrs(child);
						for (var ii in attrs){
							data['attr.'+ii] = attrs[ii];
						}
						data.element = child;
					}

					data['html.class'] = data['self'] = args.classname;
					data['html.index'] = i;

					// create the element
					var html 	 = utils.string.interpolate(template, data);
					var childDom = $$(html).attr('data-each', '');
					var replace  = childDom.find('[data-replace]');

					if (data.element){
						replace.replaceWith(data.element);
					}

					// edit the child node
					args.onChild(childDom, data);

					parent.append(childDom);
				});
			});
		}

		// insert the element
		var container = dom.children();


		if (!element){
			element = container;
		}else if (replaceElement){
			var replace = dom.find('[data-replace]');

			// replace the element
			if (args.replace){
				container.insertAfter(element);
				replace.replaceWith(element);

				if (args.replace){
					element = container;
				}
			// wrap the content
			}else{
				var children = element.contents();
				element.append(container);
				replace.replaceWith(children);
			}
		}else if (args.replace){
			element.html('').append(container);
		}else{
			element.append(container);
		}

		return args.returnTemplate ? {
			'element'			: element,
			'template'			: html,
			'childrenTemplate'	: childrenTemplate,
		} : element;
	}

	function addInstance (element){
		var item = this.static.get(element);

		// cache the parentComponent
		element.cache('parentComponent', this);

		if (item && item.isLoaded()){
			item.parent = this;
			this.children[item.getId()] = item;
		}else{
			this._childrenQueue.push(element);
		}
	}

	function addElement (key, element){
		if (~RESERVED_KEYS.indexOf(key)){
			return this.warn('Can\'t add the child element="{key}" since it\'s using a reserved key', {'key':key});
		}

		var group = this.elements[key];
		if (!group){
			group = this.elements[key] = this.$();
		}

		group.add(false, element);
	}

	function addBinding (key, element){
		var action 		= utils.string.toAction(key, {'separator':':', 'context':this});
		var template 	= element.html().replace(/((\<\!\-\-).+?(\-\-\>))/, '');

		this._bindings.push({
			'name' 		: action.name,
			'params'	: action.params,
			'modifiers'	: action.modifiers,
			'element'	: element,
			'data'		: element.data(),
			'template'	: template,
			'isSkipped'	: false,
		});
	}

	function doClone (key, element){
		var html = utils.each(key, function (selector){
			var isOuter = !!~selector.indexOf('!outer');
			var child 	= $$(selector.replace('!outer', ''));
			var html 	= isOuter ? child.outerHtml() : child.html();

			return html || '';
		}).join('\n');

		element.html(html);
	}

	function addTemplate (key, element){
		if (!key){
			key = '*';
		}

		var html = null;
		if (element.tag() === 'template'){
			html = element.html();
		}else{
			html = element.attr('template', '').outerHtml();
		}

		html = utils.string.trim(html, true)
			.replace(/^(\<\!\-\-)|(\-\-\>)$/g, '')
			.trim();

		//var html = utils.string.trim(element.html(), true).replace(/^(\<\!\-\-)|(\-\-\>)$/g, '').trim();
		this.setTemplate(key, html);

		element.remove();
	}

	function addHidden (element){
		this._hiddenElements.push(element);
	}

	// events ------------------------------------------------------------------
	function self_onClick (e){
		var action 		= e.target.getAttribute('on-click');
		var id 			= null;
		var instance 	= null;

		// fetch another item
		if (action.indexOf('#') === 0){
			var pair	= action.split(':');
			id 			= pair[0];
			action  	= pair[1];
			instance 	= Component.get(id);
		}else{
			instance = Component.get(e.target, {'closest':true});
		}

		action = utils.string.toAction(action, {'separator':'!', 'context':e.target});

		if (!instance){
			Component.warn('Tried to call on-click="{action}" on undefined instance {id}', {
				'id'	 : id,
				'action' : action.name,
			});
		}

		if (!action || !instance){
			return;
		}

		if ('prevent' in action.modifiers){
			e.preventDefault();
		}
		if ('stop' in action.modifiers){
			e.stopPropagation();
		}
		if ('once' in action.modifiers){
			e.target.removeAttribute('on-click');
		}

		if (!instance){
			this.warn('No instance was found for the on-click="{action}" to be triggered', {
				'action' : action,
			}, e.target);
		}

		if (typeof instance[action.name] === 'function'){
			instance[action.name].apply(instance, action.params);
		}else{
			instance.warn('Tried to call undefined on-click="{action}"', {
				'action' : action.name,
			});
		}
	};

	function browser_onResize (e){
		utils.each(Component.items, {'context':Component}, function (item){
			// refresh the props
			if ((!e.isStart && !e.isEnd) || (item.props.optimizeResize && e.isEnd)){
				item.props.invalidate();
			}

			// invalidate the bounds
			if (!item._listenToResize || (!this._refreshInvisible && !item.isVisible())){
				item._bounds = null;
				return;
			}

			// save the start values
			if (e.isStart){
				item.trigger('resize-start');
			}

			var bounds = item.bounds();

			// save the start values
			if (!e.isStart && (!item.props.optimizeResize || e.isEnd)){
				var current  	= item.bounds(true);
				var hasResized	= current.width !== item._previousWidth || current.height !== item._previousHeight;
				var refresh 	= item._refreshOnWindowResize || (item._refreshOnResize && hasResized);

				bounds = current;

				// @fix temporary fix (in broswer_onScroll, the bounds are refreshed.... so the previous width,height arent kept)
				item._previousWidth  = current.width;
				item._previousHeight = current.height;

				if (refresh){
					item.refresh();
				}
			}

			item.trigger('resize', bounds);

			if (e.isEnd){
				item.trigger('resize-end', bounds);
			}

			if (item.props.inView && item.isVisible()){
				item.bounds(true);
				item.isInView();
			}
		});
	};

	function browser_onScroll (e){
		// the "getFontFace" triggers the scroll event and that creates a bug, the scroll event needs to be coming from the document
		if (e.element !== document) return;

		utils.each(Component.items, function (instance){
			if (!instance.props.inView) return;

			if (e.isStart){
				instance.bounds(true);
			}

			instance.isInView();
		});
	}

	function state_onChange (e){
		var classnames 	= {};
		var element		= e.args.isBody ? this.elements.body : this.element;
		var prefix 		= (e.args.isBody ? this.getId() + '-' : this.static.stateClassPrefix) + e.name;

		if (e.value === true){
			classnames[prefix] = true;
		}else if (e.value === false){
			classnames[prefix] = false;
		}else{
			if (e.old !== undefined){
				var name = prefix + '-' + (utils.is(e.old) ? e.old : 'none');
				classnames[name] = false;
			}

			var name = prefix + '-' + (utils.is(e.value) ? e.value : 'none');
			classnames[name] = true;
		}

		element.classnames(classnames);

		// @todo trigger events
	}

	// methods:states ----------------------------------------------------------
	this.is = function (search){
		if (
			this === search ||
			this.getId() === search ||
			this.originalElement.is(search) ||
			this.element.is(search)
		) return true;

		var element = utils.dom.get(search);
		var cache   = element && utils.el.cache(search, 'component');
		if (cache === this){
			return true;
		}
	};

	this.isReady = function (callback){
		var isReady = this._super();

		if (typeof callback === 'function'){
			callback.apply(this, this);
		}

		return isReady;
	};

	this.isLoaded = function (value){
		if (value === true){
			this._isLoaded = true;
			utils.fn.all(this._onLoad, this);
			this._onLoad = [];
		}else if (typeof value === 'function' && !this._isLoaded){
			this._onLoad.push(value);
		}else if (typeof value === 'function'){
			value.call(this, this);
		}
		return this._isLoaded;
	};

	this.isChildrenLoaded = function (value){
		if (value === true){
			this._childrenQueue = [];
			utils.fn.all(this._onChildrenLoad, this);
			this._onChildrenLoad = [];
		}else if (typeof value === 'function' && this._childrenQueue.length){
			this._onChildrenLoad.push(value);
		}else if (typeof value === 'function'){
			value.call(this, this.children);
		}
		return !!this._childrenQueue.length;
	};

	this.isRendered = function (value){
		if (value === true && !this._isRendered){
			this._isRendered = true;
			utils.fn.all(this._onFirstRender, this);
			this._onFirstRender = [];
		}else if (typeof value === 'function' && !this._isRendered){
			this._onFirstRender.push(value);
		}else if (typeof value === 'function'){
			value.call(this, this);
		}
		return this._isRendered;
	};

	this.isLoading = function (value, classname){
		if (arguments.length){
			value 		= !!value;
			classname 	= classname || CLASSES.IS_LOADING;

			var index 		= this._isLoading.indexOf(classname);
			var isLoading 	= !!~index;

			if (value && !isLoading){
				this._isLoading.push(classname);
				this.element.addClass([classname, CLASSES.IS_LOADING]);
			}else if (!value && isLoading){
				this._isLoading.splice(index, 1);
				this.element.removeClass(classname);

				// there's no more loading classes and the initDone() hasnt been called yet
				if (!this._isLoading.length){
					this.element.removeClass(CLASSES.IS_LOADING);

					if (!this._isLoaded){
						this.initDone();
					}
				}
			}

			return this;
		}else{
			return !!this._isLoading.length;
		}
	};

	this.isAnimating = function (value, callback){
		if (value !== undefined){
			value = !!value;
		}

		if (arguments.length && value === this._isAnimating){
			return this;
		}else if (arguments.length){
			this._isAnimating = value;

			if (value){
				this.element.addClass(CLASSES.IS_ANIMATING);
			}else{
				this.element.removeClass(CLASSES.IS_ANIMATING);
			}

			// cancel previous animation
			if (typeof this._cancelAnimation === 'function'){
				this._cancelAnimation();
				this._cancelAnimation = null;
			}

			// save current animation
			if (callback){
				this._cancelAnimation = callback;
			}

			return this;
		}else{
			return this._isAnimating;
		}
	};

	this.hasAnimation = this.fx = function (value){
		if (arguments.length){
			this._hasAnimation = !!value;

			if (value){
				this.element.removeClass(CLASSES.NO_ANIMATIONS);
			}else{
				this.element.addClass(CLASSES.NO_ANIMATIONS);
				// @todo maybe stop isAnimating
			}

			return this;
		}else{
			return this._hasAnimation;
		}
	};

	this.isVisible = function (){
		var element = this.element.get(0);
		return element && utils.el.isVisible(element);
	};

	this.isEnabled = function (value){
		if (value !== undefined){
			this.props.enable = !!value;
			return this;
		}else{
			return this.props.enable;
		}
	};

	this.isInView = function (){
		if (!this.props.inView) return;

		var scrollTop 		= window.pageYOffset;
		var scrollBottom 	= scrollTop + window.innerHeight;
		var bounds 			= this.bounds();
		var viewRatio 		= typeof this.props.inView === 'boolean' ? 0 : parseFloat(this.props.inView);
		var inView 			= this.isVisible() && (
			(bounds.top >= scrollTop && bounds.top <= scrollBottom) ||
			(bounds.bottom >= scrollTop && bounds.bottom <= scrollBottom) ||
			(bounds.top <= scrollTop && bounds.bottom >= scrollBottom)
		);

		// check for a percentage to be visible to trigger the "in-view"
		if (viewRatio){
			var visibleHeight 	= Math.min(scrollBottom, bounds.bottom) - Math.max(scrollTop, bounds.top);
			var ratioVisible 	= visibleHeight / bounds.height;
			var ratioScreen		= visibleHeight / window.innerHeight;
			inView = ratioVisible >= this.props.inView || ratioScreen >= this.props.inView;
		}

		if (inView !== this._inView){
			this.element.classnames({
				'in-view'	  : inView,
				'out-of-view' : !inView,
			});

			if (inView) this.trigger('in-view');
			else 		this.trigger('out-of-view');
		}

		this._inView = inView;

		return inView;
	};

	// methods:help ------------------------------------------------------------
	this.wait = function (time, callback){
		var self = this;

		if (!time){
			callback.apply(self);
		}else{
			time = utils.string.toDuration(time);
			setTimeout(function (){
				callback.apply(self);
			}, time);
		}
	};

	this.dependency = function (items, callback){
		var self = this;

		this.isLoading(true, CLASSES.IS_LOADING_DEPENDENCIES);

		this.static.find(items, {
			'context':this,
			'onAll':function (items){
				// add the children
				utils.object.merge(this.children, items);

				if (typeof callback === 'function'){
					callback.call(this, items);
				};

				this.isLoading(false, CLASSES.IS_LOADING_DEPENDENCIES);
			}
		});

		return this;
	};

	this.preload = function (urls){
		var self = this;

		this.isLoading(true, CLASSES.IS_LOADING_URLS);

		utils.media.preload(urls, function (items){
			self.isLoading(false, CLASSES.IS_LOADING_URLS);
		});

		return this;
	};

	this.addChildren = function (item){
		this.children[item.getId()] = item;

		utils.array.remove(this._childrenQueue, function (child){
			return item.is(child);
		});

		// all loaded, set to ON
		if (!this._childrenQueue.length){
			this.isChildrenLoaded(true);
		}
	};

	this.getAnimation = function (animation){
		if (animation === undefined){
		 	animation = this.props.animation;
		}

		if (this.isRendered() && this.fx()){
			if (typeof animation === 'function'){
				return animation;
			}else if (typeof this.static.animations[animation] === 'function'){
				return this.static.animations[animation];
			}
		}

		return null;
	}

	this.extend = function (props){
		if (typeof props === 'function'){
			props = new props();
		}

		for (var i in props){
			var prop = props[i];
			if (typeof prop === 'function'){
				this[i] = utils.fn.super(prop, this[i]);
			}else if (this[i] === undefined){
				this[i] = prop;
			}else{
				this.warn('Property {name} already exists', {'name':i});
			}
		}
	};

	this.proxy = function (props){
		if (typeof props === 'function'){
			props = new props();
		}else{
			props = utils.object.clone(props);
		}

		// check if there's an init
		var init = props.init || utils.fn.empty;
		delete(props.init);

		this.extend(props);
		init.call(this);
	};

	this.el = function (name){
		return this.elements[name] ? this.elements[name] : this.elements.empty;
	};

	this.$ = function (selector){
		var query = new Query(selector, this);
		return query;
	};

	// methods:data ------------------------------------------------------------
	this.setId = function (id){
		this.element.attr('id', id);
		this._super(id);
		return this;
	};

	this.getClassnames = function (all){
		var classnames = [this.classname];

		utils.each(this.getTypes(), {'context':this}, function (c){
			if (!all && c === 'Class' || c === 'Component'){
				return;
			}
			c = this.static.compomentClassPrefix + utils.string.toDashCase(c);
			classnames.push(c);
		});

		utils.each(this.getClasses(), {'context':this}, function (c){
			c = this.static.styleClassPrefix + utils.string.toDashCase(c);
			classnames.push(c);
		});

		return classnames;
	};

	this.getParent = function (refresh){
		if (!this.parent || refresh){
			var parent = this.originalElement.cache('parentComponent') ||
						this.element.cache('parentComponent') ||
						this.parentElement.cache('component') ||
						this.element.parent().closest('[is]').cache('component');

			//console.log(this.getId(), '->', this.originalElement.cache('parentComponent'), this.element.cache('parentComponent'), this.element.parent().closest('[is]').cache('component'));

			this.parent = parent || null;
		}
		return this.parent;
	};

	this.eachChildren = function (search, callback, value){
		if (typeof search === 'function'){
			value 	 = callback
			callback = search;
			search	 = {};
		}

		this.each(this.children, function (child, i){
			if ('type' in search && !child.isType(search.type)) return;
			// @todo add more filtering options

			if (typeof callback === 'function'){
				callback.call(this, value || child);
			}else if (typeof callback === 'string'){
				utils.object.resolve(child, callback, {'value':value});
			}else{
				// uhm... nothing
			}
		});
	};

	this.setElement = function (element, replace){
		var attrs   = this.element.attrs();
		var element = this.$(element);

		if (this.element[0] !== element[0]){
			if (attrs.is){
				element.attr('is', attrs.is);
			}
			if (attrs.id){
				element.attr('id', attrs.id);
			}
			if (attrs.class){
				element.addClass(attrs.class);
			}
			if (attrs.style){
				var style = utils.string.toObject(attrs.style, {'separator':';'});
				element.style(style);
			}

			var altId 		= attrs['@id'];
			var altClass 	= attrs['@class'] || '';
			var altStyle 	= attrs['@style'] || '';

			// remove old stuff
			this.element.attrs({
				'is'		: null,
				'id'		: altId,
				'class' 	: altClass,
				'style' 	: altStyle,
				'@id'		: null,
				'@class'	: null,
				'@style'	: null,
			});

			if (replace){
				// @todo cache the original element
				//console.log(this.element);

				utils.dom.replace(this.element, element);
				this.element.remove();

				//this.element.after(element).remove();
			}
		}

		this.element = element;
		this.setElementComponent(element);
		this.props.setElement(element);
	};

	this.setElementComponent = function (element){
		$$(element).cache('component', this);
	};

	this.bounds = function (refresh){
		if (!this._bounds || refresh){
			this._bounds = this.element.bounds();
		}
		return this._bounds;
	};

	// methods:content ---------------------------------------------------------
	this.renderBindings = function (){
		utils.each(this._bindings, {'context':this}, function (bind){
			// if it was asked to only run once
			if (bind.isSkipped){
				return;
			}

			// check if the bind is a callback
			var value = this._bindingCallbacks[bind.name] ||
				(this.data.bind && this.data.bind[bind.name]) ||
				this.data[bind.name] ||
				this[bind.name] ||
				this.props.get(bind.name) ||
				BINDINGS['#' + this.getId() + ':' + bind.name] ||
				BINDINGS[bind.name];

			if (typeof value === 'function'){
				var params = (bind.params.length && bind.params) || [bind.value];
				value = value.apply(this, params);
			}

			// set the current value (used to old values)
			bind.value = value;

			if (value instanceof Array){
				var html = [];

				for (var i=0, l=value.length; i<l; ++i){
					var v = value[i];

					if (typeof v !== 'object'){
						v = {'value':v};
					}

					// add index
					v['@index'] = i;

					v = utils.string.interpolate(bind.template, v);

					html.push(v);
				}

				value = html.join('');
			}else if (bind.template){
				value = utils.string.interpolate(bind.template, typeof value === 'object' ? value : {'value':value});
			}

			bind.element.html(value || '').classnames({
				'is-empty' : !value
			});

			if ('once' in bind.modifiers){
				bind.isSkipped = true;
			}
		});
	};

	this.setBinding = function (key, callback){
		this._bindingCallbacks[key] = callback;
	};

	this.setBindingValue = function (key, value){
		var data = utils.toSetterObject(key, value);

		if (this.data.bind === undefined){
			this.data.bind = {};
		}

		utils.extend(this.data.bind, data);
	};

	this.setTemplate = function (key, html, overwrite){
		if (overwrite === undefined){
			overwrite = true;
		}

		if (!overwrite && key in this._templates){
			return this;
		}

		if (typeof html !== 'string'){
			var element = utils.dom.get(html);
			if (element){
				html = element.innerHTML;
				element.innerHTML = '';
			}
		}

		this._templates[key] = utils.string.trim(html);

		return this;
	}

	this.getTemplate = function (key, data, fallback){
		data = data || {};

		var template = this._templates[key] || fallback;
		if (template === undefined){
			return this.warn('The template "{key}" couldn\'t be found', {'key':key});
		}

		return utils.string.interpolate(template, data, {'fallback':null});
	}

	this.parseTemplate = function (key, selector, args){
		args = args || {};

		var template = this.getTemplate(key);
		var element  = selector ? this.$(selector) : null;

		return parseHtml.apply(this, [element, template, args]);
	};

	// methods:data ------------------------------------------------------------
	this.ajax = function (url, args, onComplete){
		var self = this;

		if (typeof onComplete === 'function'){
			args = {'data':args, 'onComplete':onComplete};
		}else if (typeof args === 'function'){
			args = {'onComplete':args};
		}

		args = args || {};
		if (args.data === undefined) 		args.data = null;
		if (args.onComplete === undefined) 	args.onComplete = utils.fn.empty;
		if (args.onError === undefined) 	args.onError = utils.fn.empty;

		this.isLoading(true, CLASSES.IS_LOADING_AJAX);

		new Ajax(url, {'data':args.data, 'method':args.data ? 'POST' : 'GET'})
			.on('complete', function (e){
				self.isLoading(false, CLASSES.IS_LOADING_AJAX);
				args.onComplete.call(self, e);
			}).on('error', function (e){
				self.isLoading(false, CLASSES.IS_LOADING_AJAX);
				args.onError.call(self, e);
			});

		return this;
	}

	// methods:debug -----------------------------------------------------------
	this.debug = function (items){
		if (!this.props.debug) return;

		if (!window.Draw){
			return this.error('Draw.Canvas is needed to debug this item');
		}

		var canvas = this.static.debugCanvas;
		if (!canvas){
			canvas = this.static.debugCanvas 	= new Draw.Canvas(document.body, {'type':'svg'});
			canvas.element.style.pointerEvents 	= 'none';
			canvas.element.style.position 		= 'absolute';
			canvas.element.style.zIndex 		= 999999;
			canvas.element.style.transform 		= 'translateZ(0)';
			canvas.element.style.left			= 0;
			canvas.element.style.top			= 0;
		}

		if (!this._debug){
			this._debug = utils.fn.debounce({'context':this}, function (items){
				//var oldIds = this._debugIds;
				var newIds = [];

				this.each(items, function (item, i){
					// make sure there's an ID there
					item.id = this.getId() + '_' + (item.id || i);
					newIds.push(item.id);
				});

				this.each(this._debugIds, function (id){
					if (!~newIds.indexOf(id)){
						items.push({'id':id, 'type':null});
					}
				});

				canvas.resize(document.body.clientWidth, document.body.clientHeight, false)
					  .set(items);

				this._debugIds = newIds;
			});
		}

		this._debug(items);
	};


	this.edit = function (){
		var self 	= this;
		var editor 	= new InlineEditor(this.getId(), {});

		this.each(this.props._props, function (prop, key){
			if (typeof prop.get() === 'function') return;

			var data = {'type':prop.type, 'value':prop.get()};

			if (data.type === 'boolean'){
				data.type = 'check';
			}
			if (data.type === 'angle'){
				data.type = 'number';
				data.max  = 360;
			}
			if (data.type === 'number2'){
				data.type  = 'numbers';
				data.count = 2;
			}
			if (data.type === 'number4'){
				data.type  = 'numbers';
				data.count = 4;
			}

			editor.add(key, data);
		});

		editor.on('change', function (e){
			self.props[e.key] = e.value;
			self.trigger('edit-change');
			self.render();
		});
	};
});

Browser.on('ready', function (){
	Component.start();
});

var IAnimation = new Class(function (){
	var utils  = this.utils;
	this.$type = 'IAnimation';

	// static ------------------------------------------------------------------
	this.$static = {
		'defaultDuration'	: '1s',
		'defaultEasing'		: 'outSine',
		'items'             : [],
	};

	// properties --------------------------------------------------------------
	this.name 		   = '';
	this.context 	   = null;
	this.easing 	   = null;
	this.isPlaying 	   = false;
	this.isReverse	   = false;
	this.looped 	   = 0;
	this.clean 		   = false;

	this._element 	   = null;
	this._duration     = null;
	this._reverse 	   = false;
	this._loop 		   = false;
	this._boomerang    = false;

	this.items 		   = [];
	this.events 	   = {};
	this._calculated   = null;

	// getter/setter -----------------------------------------------------------
	this.$get = {};
	this.$set = {};

	this.$get.element = function (){ return this._element; };
	this.$set.element = function (value){ this._element = this.utils.dom.get(value); };

	this.$get.duration = function (){ return this._duration; };
	this.$set.duration = function (value){ this._duration = utils.string.toDuration(value); };

	// init --------------------------------------------------------------------
	this.init = function (args){
		args 			= args || {};
		this.name 		= args.name !== undefined ? args.name : this.getId();
		this.element 	= args.element || null;
		this.context	= args.context || this;
		this.easing		= args.easing || this.static.defaultEasing;
		this.duration	= args.duration || this.static.defaultDuration;
		this.clean 		= 'clean' in args ? args.clean : false;
		this._reverse 	= args.reverse !== undefined ? args.reverse : false;
		this._loop 		= args.loop !== undefined ? args.loop : false;
		this._boomerang = args.boomerang !== undefined ? args.boomerang : false;

		this.static.items.push(this);
	};

	this.destroy = function (){
		this.utils.array.remove(this.static.items, this);
	};

	// private functions -------------------------------------------------------
	this._args = function (args){
		if (typeof args === 'function'){
			args = {'onComplete':args};
		}else if (typeof args !== 'object'){
			args = {};
		}

		if (args.refresh === undefined)		args.refresh = false;
		if (args.data === undefined)		args.data = {};
		if (args.clean === undefined)		args.clean = this.clean;

		if (args.context === undefined)		args.context = this.context;
		if (args.reverse === undefined)		args.reverse = false;
		if (args.loop === undefined) 		args.loop = false;
		if (args.boomerang === undefined)	args.boomerang = false;
		if (args.wait === undefined)		args.wait = 0; // wait time between loops
		if (args.onPlay === undefined)		args.onPlay = this.utils.fn.empty;
		if (args.onStop === undefined)		args.onStop = this.utils.fn.empty;
		if (args.onComplete === undefined)	args.onComplete = this.utils.fn.empty;

		return args;
	};

	// methods -----------------------------------------------------------------
	this.calculate = function (refresh, onEach, onAll){
		if (this._calculated && !refresh){
			return this._calculated;
		}

		var totalDuration 	 = 0;
		var previousDuration = 0;
		var frames 			 = [];

		// get the number of frames/durations
		utils.each(this.items, {'context':this}, function (item, i){
			// calculate the time
			var frame = {
				'start' : 0,
				'end'	: 0,
			};

			// timing
			if (item.duration !== undefined){
				if (item.queue){
					totalDuration 	 += previousDuration;
					previousDuration = item.delay + item.duration;
				}else{
					previousDuration = item.delay + Math.max(item.duration, previousDuration);
				}
				frame.start = item.delay + totalDuration;
				frame.end 	= frame.start + item.duration;
			}
			if (item.wait){
				totalDuration += item.wait;
			}

			// special case of calulation
			if (typeof onEach === 'function'){
				onEach.apply(this, [item, frame]);
			}

			frames.push(frame);
		});
		totalDuration += previousDuration;

		var animation = {
			'duration'	: totalDuration,
			'frames' 	: frames,
		};

		if (typeof onAll === 'function'){
			onAll.apply(this, [animation])
		}

		this._calculated = animation;

		return animation;
	};

	this.add = function (args, props){
		return this;
	};

	this.queue = function (args, props){
		if (arguments.length === 1){
			props = args;
			args  = {};
		}

		args = args || {};
		args.queue = true;

		return this.add(args, props);
	};

	this.wait = function (duration){
		this.add({
			'queue'   : true,
			'element' : null,
			'wait'    : utils.string.toDuration(duration)
		}, null);
		return this;
	};

	this.play = function (args){
		return this;
	};

	this.loop = function (times){
		args 		= this._args(times);
		args.loop 	= typeof times === 'number' ? times : true;
		return this.play(args);
	};

	this.reverse = function (args){
		args 			= this._args(args);
		args.reverse 	= true;
		return this.play(args);
	};

	this.boomerang = function (times){
		args 			= this._args(times);
		args.boomerang 	= typeof times === 'number' ? times : true;
		return this.play(args);
	};

	this.stop = function (id){
		return this;
	};
});

var Transition = new Class(function (){
	var utils     = this.utils;
	this.$extends = 'IAnimation';
	this.$type    = 'Transition';

	// constants ---------------------------------------------------------------

	// static ------------------------------------------------------------------

	// properties --------------------------------------------------------------
	this._start = [];
	this._end 	= [];
	this._last  = [];
	this._stop  = null;

	// getter/setter -----------------------------------------------------------

	// init --------------------------------------------------------------------

	// private functions -------------------------------------------------------
	function getElement (element, data){
		if (typeof element === 'string'){
			element = utils.string.interpolate(element, data);
		}

		element = utils.dom.get(element);

		return element;
	};

	function getProps (props, data){
		if (typeof props === 'object' && data){
			//props = utils.object.merge({}, props);
			// @todo interpolate
		}

		return props;
	}

	function clean (element, props){
		if (typeof props === 'object'){
			props = utils.each(props, function (){ return ''; });
			utils.el.style(element, props);
		}
	}

	function animate (frame, args){
		args = args || {};
		if (args.data === undefined) 	 args.data = null;
		if (args.reverse === undefined)	 args.reverse = false;
		if (args.start === undefined)	 args.start = frame.start;

		var element = getElement(frame.element, args.data);

		if (!element) return;

		var timeout    = null;
		var from 	   = getProps(frame.from || frame.props, args.data);
		var to 		   = getProps(frame.to, args.data);
		var transition = (args.reverse ? frame.backward : frame.forward) || '';

		// switch both props
		if (args.reverse){
			from = [to, to=from][0];
		}

		function _start (){
			// remove the previous transition
			element.style.transition = '';

			if (typeof from === 'function'){
				from(element);
			}else{
				utils.el.style(element, from);
			}

			var reflow = element.offsetHeight;

			// add the new transition
			element.style.transition = transition;

			if (typeof to === 'function'){
				to(element);
			}else{
				utils.el.style(element, to);
			}
		}

		function _stop (willClean){
			clearTimeout(timeout);

			element.style.transition = '';

			if (willClean){
				clean(element, from);
				clean(element, to);
			}
		};

		if (args.start){
			timeout = setTimeout(_start, args.start);
		}else{
			_start();
		}

		return _stop;
	}

	// methods -----------------------------------------------------------------
	this.calculate = function (refresh){
		// get last frame
		this._last = [];

		return this._super(refresh, function (item, frame){
			var duration = utils.number.toDuration(item.duration);
			var delay 	 = utils.number.toDuration(item.delay);

			frame.element  = item.element;
			frame.forward  = 'all ' + duration + ' ' + item.easing + ' ' + delay;
			frame.backward = 'all ' + duration + ' ' + item.easing;
			frame.from     = item.from;
			frame.to       = item.to;

			var last = utils.array.get(this._last, {'element':item.element});
			if (!last){
				last = {'element':item.element, 'start':'end', 'props':{}};
				this._last.push(last);
			}
			utils.extend(last.props, item.to);
		});
	};

	this.start = function (args, props){
		if (arguments.length === 1){
			props = args;
			args  = {};
		}

		args 		 = args || {};
		args.element = args.element || this.element || '{element}';
		props 		 = typeof props === 'function' ? props : this.utils.string.toObject(props, {'separator':';'});

		this._start.push({
			'element'	: args.element,
			'props'		: props,
			'start'		: 'start',
		});

		return this;
	};

	this.end = function (args, props){
		if (arguments.length === 1){
			props = args;
			args  = {};
		}

		args 		 = args || {};
		args.element = args.element || this.element || '{element}';
		props 		 = typeof props === 'function' ? props : this.utils.string.toObject(props, {'separator':';'});

		this._end.push({
			'element'	: args.element,
			'props'		: props,
			'start'		: 'end',
		});

		return this;
	};

	this.add = function (args, props){
		if (arguments.length === 1){
			props = args;
			args  = {};
		}

		args 			= args || {};
		args.element	= 'element' in args ? args.element : (this.element || '{element}');
		args.duration 	= this.utils.string.toDuration('duration' in args ? args.duration : this.duration);
		args.delay 		= this.utils.string.toDuration(args.delay || 0);
		args.wait 		= this.utils.string.toDuration(args.wait || 0);
		args.easing 	= this.utils.easings.get(args.easing || this.easing, true);

		var from = {};
		var to   = {};
		// @type ['opacity:0', 'opacity:1']
		if (props instanceof Array){
			if (props.length === 1){
				from = '';
				to 	 = props[0];
			}else{
				from = props[0];
				to   = props[1];
			}
		// @type {'opacity':[0,1], 'translateX':50}
		}else if (typeof props === 'object'){
			for (var i in props){
				var value = props[i];
				if (value instanceof Array){
					from[i] = value[0];
					to[i]   = value[1];
				}else{
					to[i] 	= value;
				}
			}
		// @type 'opacity:0'
		}else if (typeof props === 'string'){
			from = '';
			to   = props;
		}

		from = typeof from === 'function' ? from : this.utils.string.toObject(from, {'separator':';'});
		to 	 = typeof to === 'function' ? to : this.utils.string.toObject(to, {'separator':';'});

		this.items.push({
			'element'	: args.element,
			'from'		: from,
			'to'		: to,
			'duration'	: args.duration,
			'queue'		: args.queue || false,
			'delay'		: args.delay,
			'wait'		: args.wait,
			'easing'	: args.easing,
		});

		return this;
	};

	this.play = function (args){
		this.stop();

		args 			  = this._args(args);
		var self 		  = this;
		var animation 	  = this.calculate(args.refresh);
		var stopCallbacks = [];
		var frames 		  = this._start.concat(animation.frames, this._last, this._end);
		var isReverse	  = args.reverse;
		var timeout 	  = null;

		function _start (){
			self.isPlaying = true;

			utils.each(frames, {'reverse':isReverse}, function (frame){
				var start = frame.start === 'start' ? 0 :
							frame.start === 'end' ? animation.duration :
							frame.start;

				var end = 'end' in frame ? frame.end : start;

				var stop = animate(frame, {
					'reverse' : isReverse,
					'data'    : args.data,
					'start'	  : isReverse ? animation.duration - end : start,
				});

				if (typeof stop === 'function'){
					stopCallbacks.push(stop);
				}
			});

			timeout = setTimeout(_end, animation.duration);
		}

		function _end (){
			self.looped++;

			var again = args.loop === true || typeof args.loop === 'number' && self.looped < args.loop ||
						args.boomerang === true || typeof args.boomerang === 'number' && Math.floor(self.looped/2) < args.boomerang;

			_stop(again ? true : args.clean, again);

			if (!again){
				args.onComplete.apply(args.context);
			}else{
				if (args.boomerang){
					isReverse = !isReverse;
				}
				_start();
			}
		}

		var _stop = this._stop = function (clean, willLoop){
			if (!self.isPlaying) return;
			if (clean === undefined){
				clean = args.clean;
			}

			utils.fn.all(stopCallbacks, null, [clean]);
			stopCallbacks  = [];

			if (!willLoop){
				self.looped    = 0;
				self.isPlaying = false;
			}

			clearTimeout(timeout);
		}

		// complete
		_start();

		return this;
	};

	this.stop = function (args){
		if (this.isPlaying && typeof this._stop === 'function'){
			this._stop();
			this._stop = null;
		}
		return this;
	};
});

Transition.OpenClose = (function (){
	var anim = new Transition({'duration':'{duration|0.5s}', 'clean':true})
			.start({overflow:'hidden'})
			.add([{height:0}, {height:'{height}'}])
			.end({overflow:""})

	return function (element, args){
		args = args || {};

		// deal with "isAnimating, to cancel it"

		// will recalculate the duration/easing

		anim.play({
			'data':{
				'element' : element,
				'height'  : height,
				'duration': args.duration,
				'easing'  : args.easing,
			}
		});
	};

}());

// http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage
// @todo save settings with name
// @todo input=number, fix the "steps" when draging up/down from the field
// @todo input=range, add a format to the output field
// @todo close editor, destroy editor, make sure it moves in the bounds
// @todo add Calendar/Time input
// @todo for numbers, limit the amount of decimals
var InlineEditor = new Class(function (){
	var utils 	 = this.utils;
	this.$type 	 = 'InlineEditor';
	this.$mixins = 'MixinEvents,MixinStyles';

	// constants ---------------------------------------------------------------
	var HTML = '\
		<div element="editor" class="inline-editor">\
			<div element="header" class="editor-header">\
				<button element="minimize" class="minimize">&mdash;</button>\
				<strong element="title" class="editor-title">Editor</strong>\
				<button element="close" class="close">✕</button>\
			</div>\
			<table element="props" class="editor-props"></table>\
		</div>\
	';

	var CLASSNAME = '.inline-editor';

	var STYLE_DATA = {
		'self'	        	: CLASSNAME,
		'text'				: '{self} input[type=text]',
		'checkbox'			: '{self} input[type=checkbox]',
		'number'			: '{self} input[type=number]',
		'number-spinner'	: '{self} input[type=number]::-webkit-inner-spin-button',
		'range'				: '{self} input[type=range]',
		'range-knob'		: '{self} input[type=range]::-webkit-slider-thumb',
		'range-track'		: '{self} input[type=range]::-webkit-slider-runnable-track',
		'select'			: '{self} select',
		'color-picker'		: '{self} .color-picker',
	}

	var STYLE = {
		'{self}'							: 'background:#262c2f; box-shadow:0 5px 10px -2px rgba(0,0,0,0.5); transition:box-shadow 0.2s; color:#abb2be; font:12px/16px Lucida Console, monospace; border-radius:5px; padding-bottom:5px; max-width:350px; position:fixed; top:10px; right:10px; z-index:99999999999999999;',
		'{self}:hover'						: 'box-shadow:0 15px 20px -8px rgba(0,0,0,0.5);',
		'{self} *'							: 'box-sizing:border-box; outline:none;',
		// header
		'{self} .editor-header'				: 'display:flex; border-bottom:2px solid #40464a; padding:10px; margin-bottom:5px; justify-content:space-between;',
		'{self} .editor-header button' 		: 'background:none; border:none; color:#4aa7ff;',
		'{self} .editor-title'				: 'color:white; text-align:center;',
		// table
		'{self} table' 						: 'width:100%;',
		'{self} th, {self} td'				: 'padding:5px 10px;',
		'{self} th'							: 'text-align:left; font-weight:normal; padding-right:15px;',
		'{self} td'							: 'text-align:left;',
		// fields
		'{self} input' 						: 'border:none; font:12px/16px Lucida Console, monospace; color:white;',
		'{text}, {number}'					: 'background:#40464a; padding:5px 10px 4px; width:100%;',
		// text
		'{text}'							: 'width:100%;',
		// button
		'{self} table button'				: 'background:#4aa7ff; min-height:2em; color:#262c2f; font-weight:bold; border:none; width:100%; cursor:pointer;',
		'{self} table button:hover'			: 'background:#4aa7ff;',
		// list
		'{self} .list-item'					: 'display:flex; margin:2px 0;',
		'{self} .list-item input'		 	: 'width:calc(100% - 4em)',
		'{self} .list-item button'		 	: 'width:2em; background:none; color:#4aa7ff; margin-left:2px; border:none;',
		// number(s)
		'{number}'							: 'cursor:ns-resize; background:none; border:2px solid #40464a; text-align:center; appearance:none;',
		'{number-spinner}'					: 'appearance:none;',
		'{self} .numbers'					: 'display:flex; margin:0 -2px;',
		'{self} .numbers > *'				: 'margin:0 2px; width:100%;',
		'{self} .number-label'				: 'display:block; text-align:center; font-size:10px;',
		// select
		'{select}' 							: 'color:white; background:#40464a; border:none; border-radius:0; padding:0; width:100%; appearance:none; padding:6px 10px;',
		'{self} .select'					: 'position:relative; padding-right:25px;',
		'{self} .select:after'				: 'content:"∟"; corner:tr 10px calc(50% - 2px); font-weight:bold; transform:translateY(-50%) rotate(-45deg);',
		// checkbox
		'{checkbox}'						: 'opacity:0; background:blue; cursor:pointer; corner:tl; size:100%; z-index:1; appearance:none; margin:0;',
		'{self} .checkbox'					: 'border:2px solid #40464a; cursor:pointer; width:35px; height:20px; display:inline-block; position:relative; padding:2px;',
		'{self} .checkbox:before'			: 'content:""; float:left; display:inline-block; background:#40464a; size:12px;',
		'{self} .checkbox.is-checked:before': 'background:#4aa7ff; float:right;',
		// range
		'{range}'							: 'margin:0; padding:0; background:none; appearance:none; width:100%;',
		'{range-track}'						: 'background:#40464a; height:4px;',
 		'{range-knob}'						: 'background:#fff; box-shadow:0 0 0 3px #262c2f; appearance:none; size:15px; border-radius:100%; margin-top:-5px; cursor:pointer;',
		'{self} .range'						: 'display:flex;',
		'{self} .range-output'				: 'display:inline-display; margin-left:10px; color:#4aa7ff; text-align:right; width:50px;',
		// color
		'{color-picker} .input'				: 'border:2px solid #40464a; width:100%;',
		'{color-picker} input'				: 'background:none; text-align:center;',
		'{color-picker} .current'			: 'height:18px; margin:4px;',
		'{color-picker} .controls'			: 'background:#40464a; border:none; margin-top:2px;',
	};

	// static ------------------------------------------------------------------
	this.$static = {
		'root'	: null,
		'items'	: [],
	};

	this.$static.init = function (instance){
		this.root = this.utils.dom.create('#inline-editors', {'appendTo':document.body});

		// @todo close/open editors
		this.utils.dom.onGestures(document, {
			'delegate'			: CLASSNAME + ' .editor-header',
			'dragMoveThreshold' : 1,
		}).on('drag', self_onDrag);

		this.utils.dom.onGestures(document, {
			'delegate'          : CLASSNAME + ' [type=number]',
			'dragMoveThreshold' : 0,
		}).on('drag', number_onDrag);

		// One-time actions
		instance.addBaseStyle(STYLE, STYLE_DATA);
	};

	this.$static.types = {
		'text':function (key, args, onChange){
			var field = this.utils.dom.create('input[type=text]');

			function get (){
				return field.value;
			}
			function set (value){
				field.value = value;
			}

			field.onkeyup = field.onchange = function (){
				onChange(key, get());
			};

			return {
				'field'	: field,
				'set'	: set,
				'get'	: get,
			}
		},
		'list':function (key, args, onChange){
			var element = this.utils.dom.create('div.list');
			var elements= [];
			var fields  = [];
			var self 	= this;

			function get (){
				var values = [];
				for (var i=0; i<fields.length; ++i){
					var field = fields[i];
					var value = field.value;
					values.push(value);
				}
				return values;
			}

			function add (e){
				var index 	= e.index;
				var values 	= get();
				values.splice(index+1, 0, '');

				set(values);
				onChange(key, values);
			}

			function remove (e){
				var index 	= e.index;
				var values 	= get();
				values.splice(index, 1);

				set(values);
				onChange(key, values);
			}

			function set (values){
				values = self.utils.toArray(values);

				// remove old elements/fields
				if (values.length < elements.length){
					var count = elements.length - values.length;
					for (var i=count; i>0; --i){
						var last = elements.pop();
						self.utils.dom.remove(last);
					}
					fields = fields.slice(0, values.length);
				}

				for (var i=0; i<values.length; ++i){
					var field = fields[i];
					var value = values[i];

					if (!field){
						field = self.utils.dom.create('input[type=text]');
						field.onkeyup = field.onchange = function (){
							var values = get();
							onChange(key, values);
						};
						fields[i] = field;

						// wrapper element
						elements[i] = self.utils.dom.toDom({'appendTo':element},{
							'tag'		: 'div.list-item',
							'children'	: [
								field,
								{
									'tag'	: 'button.add',
									'html'	: '+',
									'index'	: i,
									'events': {'click':add}
								}, i === 0 ? null : {
									'tag'	: 'button.remove',
									'html'	: '-',
									'index'	: i,
									'events': {'click':remove}
								}
							]
						});
					}

					field.value = value;
				}
			}

			// set first default item
			set(['']);

			return {
				'field'	: element,
				'set'	: set,
				'get'	: get,
			}
		},
		'number':function (key, args, onChange){
			var field = this.utils.dom.create('input[type=number]', {'attrs':{
				'min'	: args.min,
				'max'	: args.max,
				'step'	: args.step,
			}});

			function get (){
				return parseFloat(field.value) || 0;
			}
			function set (value){
				setNumberFieldValue(field, value);
			}

			field.onkeyup = field.oninput = field.onchange = function (){
				onChange(key, get());
			};

			return {
				'field'	: field,
				'set'	: set,
				'get'	: get,
			}
		},
		'numbers':function (key, args, onChange){
			var labels  = args.labels || [];
			var count 	= args.count || labels.length || 2;
			var element = this.utils.dom.create('div.numbers.count'+count);
			var isObject= labels.length;
			var fields  = [];
			var self 	= this;

			function get (){
				var values = isObject ? {} : [];
				for (var i=0; i<count; ++i){
					var field = fields[i];
					var value = parseFloat(field.value) || 0;

					if (isObject){
						values[labels[i]] = value;
					}else{
						values.push(value);
					}
				}
				return values;
			}

			function set (values){
				values = self.utils.toArray(values);

				for (var i=0; i<count; ++i){
					var field = fields[i];
					var value = values[i];
					setNumberFieldValue(field, value);
				}
			}

			for (var i=0; i<count; ++i){
				var field = this.utils.dom.create('input[type=number]', {'attrs':{
					'min'	: args.min,
					'max'	: args.max,
					'step'	: args.step,
				}});
				field.onkeyup = field.oninput = field.onchange = function (){
					var values = get();
					onChange(key, values);
				};

				fields.push(field);

				// labels
				var label = labels[i];
				if (label !== undefined){
					this.utils.dom.toDom({'appendTo':element}, {
						'tag'		: 'span.number',
						'children'	: [
							field,
							{
								'tag' : 'span.number-label',
								'html': label
							}
						]
					});
				}else{
					element.appendChild(field);
				}
			}

			return {
				'field'	: element,
				'set'	: set,
				'get'	: get,
			}
		},
		'range':function (key, args, onChange){
			var element = this.utils.dom.toDom({
				'tag'		: 'div.range',
				'children'	: [{
					'tag'	: 'input[type=range]',
					'attrs'	: {
						'element' : 'input',
						'min'	  : args.min,
						'max'	  : args.max,
						'step'	  : args.step,
					}
				},{
					'tag'	: 'span.range-output',
					'attrs'	: {
						'element' : 'output',
					}
				}]
			});
			var fields = this.utils.dom.parse(element, {'extract':'element'});

			function get (){
				return parseFloat(fields.input.value);
			}

			function set (value){
				fields.input.value = value;
				fields.output.innerHTML = value;
			}

			function render (){
				fields.output.innerHTML = get();
			}

			fields.input.oninput = fields.input.onchange = function (){
				var value = parseFloat(get());
				onChange(key, value);
				render();
			};

			render();

			return {
				'field'	: element,
				'set'	: set,
				'get'	: get,
			}
		},
		'check':function (key, args, onChange){
			var element = this.utils.dom.create('span.checkbox')
			var field 	= this.utils.dom.create('input[type=checkbox]', {'appendTo':element});
			var self 	= this;

			function get (){
				return field.checked;
			}
			function set (value){
				field.checked = !!value;
				render();
			}
			function render (){
				if (get()){
					self.utils.dom.addClass(element, 'is-checked');
				}else{
					self.utils.dom.removeClass(element, 'is-checked');
				}
			}

			field.onchange = function (){
				onChange(key, get());
				render();
			};

			render();

			return {
				'field'	: element,
				'set'	: set,
				'get'	: get,
			}
		},
		'select':function (key, args, onChange){
			var field = this.utils.dom.toDom({
				'tag' 		: 'select',
				'children'	: this.utils.each(args.options || [], function (label, value, index, length, type){
					return {
						'tag'	: 'option',
						'attrs'	: {'value':type === 'object' ? value : label},
						'html'	: label
					}
				})
			});

			var element = this.utils.dom.toDom({
				'tag'		: 'div.select',
				'children'	: field,
			});

			function get (){
				return field.value;
			}

			function set (value){
				field.value = value;
			}

			field.onchange = function (){
				onChange(key, get());
			};

			return {
				'field'	: element,
				'set'	: set,
				'get'	: get,
			}
		},
		'button':function (key, args, onChange){
			var self = this;

			var field = this.utils.dom.create('button[type=button]', {
				'html'	: args.text || 'ok'
			});

			function get (){ return true; }
			function set (){}

			field.onclick = function (){
				if (typeof args.onClick === 'function'){
					args.onClick.call(self);
				}
				onChange(key, true);
			};

			return {
				'field'	: field,
				'get'	: get,
				'set'	: set,
			}
		},
	};

	this.$static.addType = function (key, callback){
		if (this.types[key] !== undefined){
			return this.error('Can\'t add the "{type}" type, it already exists', {'type':key});
		}
		this.types[key] = callback;
	};

	// properties --------------------------------------------------------------
	this.elements   = {};
	this.props      = {};

	// init --------------------------------------------------------------------
	this.init = function (args, props){
		if (arguments.length === 1){
			props 	= args;
			args 	= {};
		}
		if (typeof args === 'string'){
			args = {'title':args};
		}

		args = args || {};
		if (args.title === undefined) 	args.title = 'Editor';
		if (args.id) 					this.setId(args.id);

		// elements
		var element = this.utils.dom.create(HTML, {'appendTo':this.static.root});
		this.elements = this.utils.dom.parse(element, {'id':this.getId(), 'extract':'element'});
		this.elements.title.innerHTML = args.title;

		// add the
		for (var i in props){
			var prop = props[i] || {};
			this.add(i, prop);
		}

		// events

		this.static.items.push(this);
	};

	this.destroy = function (){

	};

	// private -----------------------------------------------------------------
	function setNumberFieldValue (element, value){
		var min 	= parseFloat(element.getAttribute('min'));
		var max 	= parseFloat(element.getAttribute('max'));
		var step 	= parseFloat(element.getAttribute('step'));

		if (!isNaN(step)){
			//value = value % step;
		}
		if (!isNaN(min) && value < min){
			value = min;
		}
		if (!isNaN(max) && value > max){
			value = max;
		}

		element.value = value;
	}

	// events ------------------------------------------------------------------
	function self_onDrag (e){
		e.preventDefault();

		var x = (this._x || 0) + e.deltaX;
		var y = (this._y || 0) + e.deltaY;

		if (e.isStart){
			this._target = utils.dom.closest(this, '.inline-editor');
		}else if (e.isEnd){
			this._x = x;
			this._y = y;
		}

		// @todo make sure it doesnt get out of the screen bounds
		utils.el.transform(this._target, {
			'translateX' : x,
			'translateY' : y,
		});
	}

	function field_onChange (key, value){
		this.trigger('change', {
			'key'	: key,
			'value'	: value,
		});
	};

	function number_onDrag (e){
		if (e.isStart){
			this._value = parseFloat(this.value) || 0;
		}

		setNumberFieldValue(this, this._value - e.deltaY);

		if (typeof this.onchange === 'function'){
			this.onchange();
		}
	}

	// methods -----------------------------------------------------------------
	this.clear = function (){
		this.props 						= {};
		this.elements.props.innerHTML 	= '';
	};

	this.add = function (key, args){
		args = args || {};
		if (args.type === undefined) 	args.type = 'text';
		if (args.label === undefined) 	args.label = key;

		var onChange = field_onChange.bind(this);
		var types 	 = this.static.types;
		var prop 	 = types[args.type] ? types[args.type].apply(this, [key, args, onChange]) : null;
		var field 	 = prop ? prop.field : '<em>unknown "'+args.type+'" type</em>';

		// set the value
		if (prop && args.value !== undefined){
			prop.set(args.value);
		}

		// save the prop
		if (prop){
			this.props[key] = prop;
		}

		this.utils.dom.toDom({'appendTo':this.elements.props}, {
			'tag'		: 'tr',
			'children'	: [{
				'tag'	: 'th',
				'html'	: args.label,
			},{
				'tag'		: 'td',
				'classnames': 'field -'+args.type,
				'html'		: field,
			}]
		});
	};

	this.get = function (key){
		if (key === undefined){
			var values = {};
			for (var i in this.props){
				var prop 	= this.props[i];
				var value 	= prop.get();
				values[i] = value;
			}
			return values;
		}else if (this.props[key]){
			return this.props[key].get();
		}
	};

	this.set = function (key, value){
		var setter = utils.toSetterObject(key, value);
		for (var i in setter){
			var prop = this.props[i];

			if (!prop){
				// @error
			}else{
				prop.set(value);
			}
		}
	};

	this.open = function (){

	};

	this.close = function (){

	};
});

Component.define('app', function (){
	var utils = this.utils;

	// constants ---------------------------------------------------------------
	var CLASSES = {
	};

	// setup -------------------------------------------------------------------
	this._loadChildren = true;

	// properties --------------------------------------------------------------
	this.props = {
	};

	this.states = {
	};

	this.data = {
	};

	// init --------------------------------------------------------------------
	this.init = function (){
		this.$('[data-hover]').each(true, function (el){
			var selector = el.data('hover');
			utils.dom.hoverParts(el, selector);
		});
	};

	this.preMount = function (){

	};

	this.mount = function (){
	};

	this.addEvents = function (){
	};

	// private functions -------------------------------------------------------

	// events ------------------------------------------------------------------

	// methods -----------------------------------------------------------------

});
