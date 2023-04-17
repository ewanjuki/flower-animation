/**
 * aaa/aaa
 * [description]
 *
 * @todo
 * @example https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs
 */
 Component.define('splash', function (){
 	var utils 	 	= this.utils;
	this.$requires	= 'poly-decomp.js,matter.js';
	//this.$requires	= 'matter.min.js';

	// constants ---------------------------------------------------------------
	var CLASSES = {
	};

	// static ------------------------------------------------------------------

	// setup -------------------------------------------------------------------
	this._elements 				= 'resize,letter';
	this._listenToResize 	    = true;
	this._refreshOnWindowResize = false;
	this._loadMedias 		    = true;

	// properties --------------------------------------------------------------
	this.props = {
		'walls'	      				: '',
		'wallWidth'  				: -10,
		'boxPadding'  				: 5,
		'letterPadding:Number2' 	: [0,0],
		'maxWidth'	  				: 1920,
		'delay'						: '1.5s',
		'pixelRatio'				: 2,
		'debug'		  				: true,

		'density:Number'			: 1, // 0.02,
		'friction:Number'   		: 0.3, //0.01,
		'frictionAir:Number'		: 0.00001,
		'restitution:Number'		: 0.9, //0.6,			// bounce effect
		'gravityMax'				: 0.5,
	};

	this.data = {
		'render' 	    : null,
		'walls'	 	    : [],
		'hasStarted'	: false,
	};

	// init --------------------------------------------------------------------
	this.init = function (){
		this.elements.boxes = this.$(this.props.boxes);

		// bodies --------------------------------------------------------------
		var bodies 			= [];
		this.data.walls 	= [this.createBody({'wall':true}), this.createBody({'wall':true}), this.createBody({'wall':true}), this.createBody({'wall':true})];
		this.data.boxes 	= [];
		this.data.letters	= [];

		this.elements.boxes.each(true, function (el){
			var wall = this.createBody({
				'element': el,
				'wall'	 : true,
			});
			this.data.boxes.push(wall);
		});

		this.elements.letter.each(true, function (el){
			var img   	= el.is('img') ? el : el.find('img');
			var src    	= img.attr('src');
			var width 	= el.attr('data-width');
			var height 	= el.attr('data-height');
			var offset  = el.attr('data-offset');
			var points	= el.attr('points');
			var path 	= el.attr('path');

			offset = utils.array.to2Numbers(offset);


			var body = this.createBody({
				'element' 	: el,
				'sprite'	: src,
				'points'	: points,
				'path'	    : path,
				'width'		: width,
				'height'	: height,
			});

			body._offset = offset;

			this.data.letters.push(body);
		});

		bodies = bodies.concat(this.data.walls, this.data.boxes, this.data.letters);

		// engine --------------------------------------------------------------
		var engine = this.data.engine = Matter.Engine.create();
		engine.world.gravity.y = this.getGravity(-1); // reverse gravity

		// renderer ------------------------------------------------------------
		var render = this.data.render = Matter.Render.create({
		    'element' : this.element.get(0),
		    'engine'  : engine,
			'options' : {
				'pixelRatio'			: this.props.pixelRatio,
				'wireframes'			: this.props.debug,
				'background'			: 'transparent',
				'wireframeBackground'	: 'rgba(0,0,0,0.6)',
				'showAngleIndicator'	: this.props.debug,
			//	'showBounds'			: true,
			}
		});

		// mouse ---------------------------------------------------------------
		var mouse 			= Matter.Mouse.create(render.canvas);
		var mouseConstraint = Matter.MouseConstraint.create(engine, {
            'mouse': mouse,
            'constraint': {
                'stiffness': 0.2,
                'render': {
                    'visible': false
                }
            }
        });

		// add all of the bodies to the world
		Matter.World.add(engine.world, bodies);
		Matter.World.add(engine.world, mouseConstraint);

		// events
		Matter.Events.on(this.data.engine, 'afterTick afterRender', engine_onRender.bind(this));

		if (navigator.permissions){
			navigator.permissions.query({'name':'gyroscope'}).then();
		}

		window.addEventListener('deviceorientation', device_onOrientation.bind(this));
	};

	this.getGravity = function (val){
		return utils.math.between(val, this.props.gravityMax, this.props.gravityMax * -1);
	};

	this.createBody = function (args){
		args 			= args !== undefined ? args : {};
		args.element 	= 'element' in args ? args.element : null;
		args.points 	= 'points' in args ? args.points : null;
		args.path	 	= 'path' in args ? args.path : null;
		args.src 		= 'src' in args ? args.src : null;
		args.wall 		= 'wall' in args ? args.wall : false;

		var body = null;
		var options = {
			'isStatic' 	 : args.wall,
			'density'    : this.props.density,
			'friction'   : this.props.friction,
			'frictionAir': this.props.frictionAir,
			'restitution': this.props.restitution,
			'render'	: {
				'visible': this.props.debug || !args.wall,
				'sprite' : {'texture':args.sprite}
			}
		};

		var x = 0;
		var y = 0;
		var w = 0;
		var h = 0;

		if (args.element){
			var bounds = args.element.bounds();
			x = bounds.x;
			y = bounds.y;
			w = args.width || bounds.width;
			h = args.height || bounds.height;
		}

		if (args.points){
			var vertices = [];
			var points   = args.points.split(' ');

			for (var i=0, l=points.length/2; i<l; ++i){
				vertices.push({
					'x' : parseFloat(points[i * 2] * this.props.pixelRatio),
					'y' : parseFloat(points[i * 2 + 1] * this.props.pixelRatio),
				});
			}

			body = Matter.Bodies.fromVertices(x,y,vertices,options);

			var width 	= body.bounds.max.x - body.bounds.min.x;
			var height 	= body.bounds.max.y - body.bounds.min.y;
			body._width  = width;
			body._height = height;
		}else if (args.path){
			var vertices 	= [];
			var path   		= args.path.split(' ');

			for (var i=0, l=path.length; i<l; ++i){
				var pair = path[i].trim().split(',');
				var type = pair[0].substr(0,1).toLowerCase();
				var xx 	 = parseFloat(pair[0].substr(1));
				var yy 	 = parseFloat(pair[1]);

				if (!isNaN(xx) && !isNaN(yy)){
					vertices.push({
						'x' : xx * this.props.pixelRatio,
						'y' : yy * this.props.pixelRatio,
					});
				}
			}

			body = Matter.Bodies.fromVertices(x,y,vertices,options);
		}else{
			body = Matter.Bodies.rectangle(x,y,w,h,options);
		}

		body._ = args;

		return body;
	};

	this.updateRect = function (box, x, y, w, h){
		if (x !== null && y !== null){
			Matter.Body.setPosition(box, {'x':x + w/2, 'y':y + h/2});
		}
		Matter.Body.setVertices(box, [
			{'x':w/-2, 'y':h/-2},
			{'x':w/2, 'y':h/-2},
			{'x':w/2, 'y':h/2},
			{'x':w/-2, 'y':h/2},
		]);
	};

	this.render = function (){
		var w = Browser.screenWidth;
		var h = Browser.screenHeight;
		var p = this.props.wallWidth;

		// resize the bodies
		var ratio = Browser.screenWidth / this.props.maxWidth;
		if (ratio > 1){
			ratio = 1;
		}

		this.elements.resize.style({
			'transform'	: 'scale('+ratio+')'
		});

		// resize the letters
		var oldRatio 	= this.data.ratio || 1;
		var changeRatio = ratio / oldRatio;

		this.data.ratio = ratio;

		this.each(this.data.letters, function (letter){
			var bounds 	= letter._.element.bounds().viewport;

			var p1 		= this.props.letterPadding[0] * ratio;
			var p2 		= this.props.letterPadding[1] * ratio;
			var x 		= this.data.hasStarted ? null : (bounds.x - p1/2);
			var y 		= this.data.hasStarted ? null : bounds.y - p2/2;

			letter.render.sprite.xScale = ratio;
			letter.render.sprite.yScale = ratio;

			if (x !== null && y !== null){
				var offsetX = letter._offset[0] * ratio;
				var offsetY = letter._offset[1] * ratio;

				Matter.Body.setPosition(letter, {'x':x + (bounds.width + p1)/2 + offsetX, 'y':y + (bounds.height + p2)/2 + offsetY});
			}

			Matter.Body.scale(letter, changeRatio, changeRatio);
		});

		// resize the canvas
		this.data.render.canvas.width  			= w * this.props.pixelRatio;
		this.data.render.canvas.height 			= h * this.props.pixelRatio;
		this.data.render.canvas.style.width 	= w + 'px';
		this.data.render.canvas.style.height 	= h + 'px';

		// resize the walls
		this.updateRect(this.data.walls[0], 0, 0, w, p);
		this.updateRect(this.data.walls[1], w - p, 0, p, h);
		this.updateRect(this.data.walls[2], 0, h - p, w, p);
		this.updateRect(this.data.walls[3], 0, 0, p, h);

		// resize the extra walls
		this.each(this.data.boxes, function (wall){
			var bounds 	= wall._.element.bounds();
			var p  		= this.props.boxPadding;
			this.updateRect(wall, bounds.x - p, bounds.y - p, bounds.width + p*2, bounds.height + p*2);
		});
	};

	this.mount = function (){
		// run the renderer
		Matter.Render.run(this.data.render);

		this.wait(this.props.delay, function (){
			//Matter.Engine.run(this.data.engine);
			Matter.Engine.run(this.data.engine);
			this.data.hasStarted = true;
		});
	};

	this.edit = function (){
		var self 	= this;
		var editor 	= new InlineEditor(this.getId(), {});

		editor.add('density', {
			'type'	: 'number',
			'min'	: 0,
			'step'	: 0.01,
			'value' : this.props.density,
		});
		editor.add('friction', {
			'type'	: 'number',
			'min'	: 0,
			'step'	: 0.01,
			'value' : this.props.friction,
		});
		editor.add('frictionAir', {
			'type'	: 'number',
			'min'	: 0,
			'step'	: 0.00001,
			'value' : this.props.frictionAir,
		});
		editor.add('restitution', {
			'type'	: 'number',
			'min'	: 0,
			'step'	: 0.01,
			'value' : this.props.restitution,
		});

		var self = this;
		editor.on('change', function (e){
			self.props[e.key] = e.value;

			self.each(self.data.letters, function (letter){
				letter.restitution = self.props.restitution;
				letter.friction    = self.props.friction;
				letter.frictionAir = self.props.frictionAir;
				Matter.Body.setDensity(letter, self.props.density);
			});
		});
	};

	// private functions -------------------------------------------------------

	// events ------------------------------------------------------------------
	function engine_onRender (e){
		this.each(this.data.letters, function (letter){
			var x        = letter.position.x;
			var y        = letter.position.y;
			var isChange = false;

			if (x < 0){
				x        = 0;
				isChange = true;
			}else if (x > Browser.screenWidth){
				x        = Browser.screenWidth;
				isChange = true;
			}

			if (y < 0){
				y        = 0;
				isChange = true;
			}else if (y > Browser.screenHeight){
				y        = Browser.screenHeight;
				isChange = true;
			}

			if (isChange){
				Matter.Body.setPosition(letter, {'x':x, 'y':y});
			}
		});
	}

	function device_onOrientation (e){
		if (event.gamma === undefined || event.beta === undefined){
			return;
		}

		var orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0;
		var gravity 	= this.data.engine.world.gravity;

		if (orientation === 0) {
			gravity.x = Matter.Common.clamp(event.gamma, -90, 90) / 90;
			gravity.y = Matter.Common.clamp(event.beta, -90, 90) / 90;
		} else if (orientation === 180) {
			gravity.x = Matter.Common.clamp(event.gamma, -90, 90) / 90;
			gravity.y = Matter.Common.clamp(-event.beta, -90, 90) / 90;
		} else if (orientation === 90) {
			gravity.x = Matter.Common.clamp(event.beta, -90, 90) / 90;
			gravity.y = Matter.Common.clamp(-event.gamma, -90, 90) / 90;
		} else if (orientation === -90) {
			gravity.x = Matter.Common.clamp(-event.beta, -90, 90) / 90;
			gravity.y = Matter.Common.clamp(event.gamma, -90, 90) / 90;
		}

		// reverse gravity
		gravity.x *= -1;
		gravity.y *= -1;

		gravity.x = this.getGravity(gravity.x);
		gravity.y = this.getGravity(gravity.y);
	}
});
