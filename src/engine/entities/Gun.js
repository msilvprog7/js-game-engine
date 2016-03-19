"use strict";

var GUN_VARS = {
	ID: "gun",
	FILENAME: "biomancer/main-char/gun.png",
	RECHARGE_RATE: 1
};

/**
 * The gun
 */
class Gun extends Sprite {
	
	constructor() {
		super(GUN_VARS.ID, GUN_VARS.FILENAME);
		this.rechargeRate = GUN_VARS.RECHARGE_RATE;
		this.lastFire = 0;
		this.availableAnimals = [];
		this.currentAnimal = "";
	}

	shoot() {
		
	}

	swapAnimal() {

	}
}