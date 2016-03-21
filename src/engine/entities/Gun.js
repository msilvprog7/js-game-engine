"use strict";

var GUN_VARS = {
	ID: "gun",
	FILENAME: "biomancer/main-char/gun.png",
	RECHARGE_RATE: 1000, // ms
	ANIMALS: ["WOLF"],
	LAUNCH_OFFSET: {x: 7.5, y: 36}
};

/**
 * The gun
 */
class Gun extends Sprite {
	
	constructor() {
		super(GUN_VARS.ID, GUN_VARS.FILENAME);
		this.rechargeRate = GUN_VARS.RECHARGE_RATE;
		this.nextFire = 0;
		this.initializeAnimals();
	}

	getBiomancer() {
		return this.getParent();
	}

	update(pressedKeys) {
		super.update(pressedKeys);

		// Space key - shoot
		if (pressedKeys.contains(32)) {
			this.shoot();
		}
	}

	draw(g) {
		super.draw(g);
	}

	shoot() {
		// Check recharge
		if (new Date().getTime() < this.nextFire) {
			return false;
		}

		// Fire!
		var animal = this.generateCurrentAnimal();
		this.getBiomancer().getLevel().addAnimal(animal);

		// Update timestamp and return
		this.nextFire = new Date().getTime() + this.rechargeRate;
		return true;
	}

	generateCurrentAnimal() {
		var animal = undefined;

		// Get animal instance
		switch (this.getCurrentAnimal()) {
			case "WOLF":
				animal = new Wolf();
				break;
			default:
				return animal;
		}

		var biomancer = this.getBiomancer();
		
		// Hey, you in the chair! This code does not work...

		/*
		animal.setPosition(biomancer.hitbox.transformPointWithFullMatrix(new Point(
			this.position.x + GUN_VARS.LAUNCH_OFFSET.x - ((flipX) ? -1 : 1) * animal.launchIdlePivot.x,
			this.position.y + GUN_VARS.LAUNCH_OFFSET.y - ((flipY) ? -1 : 1) * animal.launchIdlePivot.y
		)));
		*/

		animal.setPosition(
			biomancer.hitbox.transformPointWithFullMatrix(
				new Point(0, 0)
			)
		);

		// animal.setPivotPoint({x: animal.launchIdlePivot.x, y: animal.launchIdlePivot.y });

		// Set direction based on Biomancer 
		animal.setDirection(biomancer.getRotation());
		// ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !

		return animal;
	}

	swapAnimal(name) {
		var potentialAnimal = this.availableAnimals.find((element) => element === name);
		this.currentAnimal = (potentialAnimal !== undefined) ? potentialAnimal : this.currentAnimal;
		return (potentialAnimal !== undefined);
	}

	getCurrentAnimal() {
		return this.currentAnimal;
	}

	addAnimal(animal) {
		this.availableAnimals.push(animal);

		if (this.currentAnimalIndex === undefined) {
			this.currentAnimal = animal;
		}
	}

	initializeAnimals() {
		// Create animals
		this.availableAnimals = [];
		this.currentAnimal = undefined;
		GUN_VARS.ANIMALS.map((x) => this.addAnimal(x)); // Call like this to set default to first
	}
}