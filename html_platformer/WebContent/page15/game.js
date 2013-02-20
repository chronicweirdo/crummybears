function Canvas(context, width, height) {
	this.canvas = context;
	this.width = width;
	this.height = height;
}


function Game(objects, canvas, subsystems) {
	this.handle;
	this.objects = objects;
	this.canvas = canvas;
	this.subsystems = new Array();
	this.FPS = 30;
	
	this.start = function() {	
		// in case the game is running, stop it first
		this.stop();
		
		// initialize subsystems
		this.subsystems = new Array();
		this.subsystems[0] = new MoveSubsystem();
		this.subsystems[1] = new CollisionSubsystem();
		this.subsystems[2] = new DrawSubsystem();
		
		// start game
		this.animate();
	};
	
	this.stop = function() {
		clearInterval(this.handle);
	};
	
	this.clear = function() {
		this.canvas.context.clearRect(0, 0, canvas.width, canvas.height);
	};
	
	
	this.animate = function() {
		this.handle = setInterval(function() {
			game.main();
		}, 1000/this.FPS);
	};
	
	this.main = function() {
		this.clear();
		var options = {};
		for (var i = 0; i < this.subsystems.length; i++) {
			this.subsystems[i].execute(options, canvas, objects);
		}
	};
}

// subsystem prototype
function Subsystem() {
	this.options;
	this.canvas;
	this.objects;
	this.execute = function(options, canvas, objects) {
		this.options = options;
		this.canvas = canvas;
		this.objects = objects;
		
		this.run();
	};
}
// move subsystem - moves objects
function MoveSubsystem() {
	this.run = function() {
		for (var i = 0; i < this.objects.length; i++) {
			// check if object has move function
			if (typeof this.objects[i].move === 'function') {
				this.objects[i].move();
			}
		}
	};
}
MoveSubsystem.prototype = new Subsystem();

//collision sub. - detects collisions and applies corrections
function CollisionSubsystem() {
	this.run = function() {
		for (var i = 0; i < this.objects.length; i++) {
			for (var j = i+1; j < this.objects.length; j++) {
				var collision = this.collide(this.objects[i], this.objects[j]);
				if (collision.c) {
					this.handleCollision(this.objects[i], this.objects[j], collision);
				}
			}
		}
	};
	
	// collisions are based on the bounding box - everything is an axis-aligned rectange
	this.collide = function(object1, object2) {
		var r1 = object1.rect();
		var r2 = object2.rect();
		var dx = Math.abs(r1.cx - r2.cx) - (r1.hw + r2.hw);
		var dy = Math.abs(r1.cy - r2.cy) - (r1.hh + r2.hh);
		return {c: (dx < 0) && (dy < 0), dx: dx, dy: dy};
	};
	
	this.getType = function (object) {
		if (object instanceof Block) return "Block";
		if (object instanceof Ledge) return "Ledge";
		return "";
	};
	
	this.handleCollision = function(object1, object2, collision) {
		if (this.getType(object1) == "Block" && this.getType(object2) == "Block") {
			this.handleBlockCollision(object1, object2, collision);
		}
		if (this.getType(object1) == "Block" && this.getType(object2) == "Ledge" && this.options.ledgeCollisions) {
			this.handleLedgeCollision(object1, object2, collision);
		}
		if (this.getType(object2) == "Block" && this.getType(object1) == "Ledge" && this.options.ledgeCollisions) {
			this.handleLedgeCollision(object2, object1, collision);
		}
	};
	
	this.handleLedgeCollision = function(block, ledge, collision) {
		// only do this if block is above ledge and coming down
		var blockBottom = block.position.y + block.dimension.y;
		var ledgeBottom = ledge.position.y + ledge.dimension.y;

		var blockIsAbove = blockBottom < ledgeBottom;
		var blockIsComingDown = block.velocity.y > 0;
		
		if (blockIsAbove && blockIsComingDown) {
			this.handleBlockCollision(block, ledge, collision);
		}
	};
	
	this.handleBlockCollision = function(block1, block2, collision) {
		jumpTime = 0;

		// decide which way the blocks must move
		if (Math.abs(collision.dx) > Math.abs(collision.dy)) {
			// move back on the y axis
			// decide if both blocks must move
			if (block1.mobile && block2.mobile) {
				// both blocks move
				// get vector between blocks, the component of the direction of correction
				var sign1 = block2.position.y - block1.position.y;
				sign1 = sign1 / Math.abs(sign1);
				var sign2 = -sign1;
				block1.position.y += collision.dy/2 * sign1;
				block1.velocity.y = 0;
				block2.position.y += collision.dy/2 * sign2;
				block2.velocity.y = 0;
			} else if (block1.mobile) {
				var sign = block2.position.y - block1.position.y;
				sign = sign / Math.abs(sign);
				block1.position.y += collision.dy * sign;
				block1.velocity.y = 0; 
			} else if (block2.mobile) {
				var sign = block1.position.y - block2.position.y;
				sign = sign / Math.abs(sign);
				block2.position.y += collision.dy * sign;
				block2.velocity.y = 0;
			}
		} else {
			// move back on the x axis
			if (block1.mobile && block2.mobile) {
				// both blocks move
				var sign1 = block2.position.x - block1.position.x;
				sign1 = sign1 / Math.abs(sign1);
				var sign2 = -sign1;
				block1.position.x += collision.dx/2 * sign1;
				block1.velocity.x = 0;
				block2.position.x += collision.dx/2 * sign2;
				block2.velocity.x = 0;
			} else if (block1.mobile) {
				//log("moving back block 1 on x");
				var sign = block2.position.x - block1.position.x;
				sign = sign / Math.abs(sign);
				block1.position.x += collision.dx * sign;
				block1.velocity.x = 0; 
			} else if (block2.mobile) {
				//log("moving back block 2 on x");
				var sign = block1.position.x - block2.position.x;
				sign = sign / Math.abs(sign);
				block2.position.x += collision.dx * sign;
				block2.velocity.x = 0;
			}
		}
	};
}
CollisionSubsystem.prototype = new Subsystem();

// physics subsystem - affects velocity (friction, gravity, based on collision output (ex. when object finished falling))
// control sub. - based on active controls, affects objects
// drawing sub. - draws scene
function DrawSubsystem() {
	this.run = function() {
		for (var i = 0; i < this.objects.length; i++) {
			// check if object has draw function
			if (typeof this.objects[i].draw === 'function') {
				this.objects[i].draw();
			}
		}
	};
}
DrawSubsystem.prototype = new Subsystem();