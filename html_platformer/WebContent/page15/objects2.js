ar Block = Class.extend({
	// center of the block
	position: new Vector(0, 0), 
	// these are 'radiuses' of the block, so width would be dimension.x * 2
	dimension: new Vector(0, 0), 
	color: new Color(0, 0, 0),

	draw: function(context) {
		context.fillStyle = this.color;
		context.fillRect(
				this.position.x - this.dimension.x,
				this.position.y - this.dimension.y,
				this.dimension.x*2,
				this.dimension.y*2
		);
	},

	rect: function() {
		return {
			cx: this.position.x,
			cy: this.position.y,
			hh: this.dimension.y,
			hw: this.dimension.x
		};
	}
});

var MovingBlock = Block.extend({
	velocity: new Vector(0, 0),
	speed: new Vector(0, 0),
	
	move: function() {
		this.velocity.x = this.velocity.x * friction;
		if (this.speed.x != 0) this.velocity.x = this.speed.x;
		this.velocity.y += gravity.y * dt;
		if (this.speed.y != 0) this.velocity.y = this.speed.y;
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
});

var Ledge = Block.extend({
});