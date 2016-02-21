"use strict"

class Physics{
	constructor() {
		this.hasPhysics = false;
		this.mass = 0;
		this.accelerationY = 0;
		this.accelerationX = 0;
		this.velocityX = 0;
		this.velocityY = 0;
	}

	update() {
		this.velocityY += this.accelerationY;
		this.velocityX += this.accelerationX;
	}
}