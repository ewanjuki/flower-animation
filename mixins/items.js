MIXINS.Items = function (){
	this._items          = [];
	this._aliases        = {};

	this.alias 			 = 'alias';
	this.elements 		 = [];
	this.querySelector   = 'div';
	this.queryUntil 	 = null;
	this.queryAttr 		 = null;

	this.config = function (args){
		this.alias 			= 'alias' in args ? args.alias : this.alias;
		this.elements 		= 'elements' in args ? args.elements : this.elements;
		this.querySelector 	= 'querySelector' in args ? args.querySelector : this.querySelector;
		this.queryUntil 	= 'queryUntil' in args ? args.queryUntil : this.queryUntil;
		this.queryAttr 		= 'queryAttr' in args ? args.queryAttr : this.queryAttr;
		return this;
	};

	this.set = function (items, args){
		this.clear();
		this.add(items, args);
		return this;
	};

	this.add = function (items, args){
		args 		= args || {};
		args.type 	= 'type' in args ? args.type : 'array';
		args.alias 	= 'alias' in args ? args.alias : this.alias;

		// @todo check if the item already exists

		if (args.type === 'array' && !(items instanceof Array)){
			items = [items];
		}

		var last;
		this.utils.each(items, {'context':this}, function (item, i, e){
			var alias = item[args.alias];
			if (alias === undefined){
				alias = e.type === 'object' ? i : this._items.length;
			}

			this._aliases[alias] = this._items.length;
			this._items.push(item);

			last = item;
		});

		return last;
	};

	this.exists = function (search){
		var index = this.index(search);
		return !!~index;
	};

	this.count = function (){
		return this._items.length;
	};

	this.index = function (search){
		var index = -1;

		if (this._aliases[search] !== undefined){
			index = this._aliases[search];
		}else if (typeof search === 'number'){
			index = search;
		}else if (search === ':first'){
			index = 0;
		}else if (search === ':last'){
			index = this._items.length - 1;
		}else if (this.utils.dom.isElement(search) || this.utils.dom.isQuery(search)){
			if (this.elements.length){
				this.utils.each(this.elements, {'context':this}, function (el, i){
					if (this.utils.dom.contains(el, search)){
						index = i;
						return BREAK;
					}
				});
			}else{
				var element = this.utils.dom.closest(search, this.querySelector, this.queryUntil);
				index = (this.queryAttr && element.getAttribute(this.queryAttr)) || this.utils.dom.index(element);
			}
		}else{
			index = this.utils.array.indexOf(this._items, search);
		}

		return index;
	};

	this.each = function (callback){
		this.utils.each(this._items, {'context':this._self}, callback);
	};

	this.sort = function (orderBy, args){
		this.utils.array.sort(this._items, orderBy, args);
	};

	this.get = function (search, withIndex){
		withIndex = withIndex === undefined ? false : withIndex;

		var index = this.index(search);
		var item  = this._items[index] || null;

		return withIndex ? {'index':index, 'item':item} : item;
	};

	this.all = function (){
		return this._items;
	};

	this.clear = function (){
		this._items   = [];
		this._aliases = {};
		return this;
	};
};
