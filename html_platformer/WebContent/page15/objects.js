// block is the basic class
function Vector(x, y) {
	this.x = x;
	this.y = y;
}
function Color(r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = 255;
}

function Block() {
	// center of the block
	this.position = new Vector(0, 0); 
	// these are 'radiuses' of the block, so width would be dimension.x * 2
	this.dimension = new Vector(0, 0); 
	this.color = new Color(0, 0, 0);
	
	this.draw = function(context) {
		context.fillStyle = this.color;
		context.fillRect(
				this.position.x - this.dimension.x,
				this.position.y - this.dimension.y,
				this.dimension.x*2,
				this.dimension.y*2
			);
	};
	
	this.rect = function() {
		return {
				cx: this.position.x,
				cy: this.position.y,
				hh: this.dimension.y,
				hw: this.dimension.x
			};
	};
}

function MovingBlock() {
	this.velocity = new Vector(0, 0);
	this.speed = new Vector(0, 0);
	
	this.move = function() {
		this.velocity.x = this.velocity.x * friction;
		if (this.speed.x != 0) this.velocity.x = this.speed.x;
		this.velocity.y += gravity.y * dt;
		if (this.speed.y != 0) this.velocity.y = this.speed.y;
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	};
}
MovingBlock.prototype = new Block();

function Ledge(position, dimension) {
}
Ledge.prototype = new Block();
