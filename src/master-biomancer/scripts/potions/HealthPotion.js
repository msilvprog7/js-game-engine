"use strict";

var HEALTH_POTION_VARS = {
	HEAL_AMOUNT: 50,
	DURATION: 6000,
	FILENAME: "biomancer/misc/potions/health-potion.png",
	DIMENSIONS: {width: 20, height: 30},
	IDLE_PIVOT: {x: 10, y: 15},
	count: 0
};


class HealthPotion extends Potion {
	
	constructor() {
		super("health-potion-" + HEALTH_POTION_VARS.count, HEALTH_POTION_VARS.FILENAME);
		HEALTH_POTION_VARS.count++;
	}

	drink(character) {
		super.drink(character);
		character.addHealth(HEALTH_POTION_VARS.HEAL_AMOUNT, HEALTH_POTION_VARS.DURATION);
	}

}