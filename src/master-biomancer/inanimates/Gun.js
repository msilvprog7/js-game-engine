"use strict";

var GUN_VARS = {
	ID: "gun",
	FILENAME: "biomancer/main-char/gun.png",
	RECHARGE_RATE: 1000, // ms
	ANIMALS: ["WOLF", "SPIDER", "PENGUIN", "TURTLE"],
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
		this.getBiomancer().getLevel().addEntityToLevel(animal, ANIMAL_VARS.ADD_DEFAULTS);


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
			case "SPIDER":
				animal = new Spider();
				break;
			case "PENGUIN":
				animal = new Penguin();
				break;
			case "TURTLE":
				animal = new Turtle();
				break;
			default:
				return animal;
		}

		var biomancer = this.getBiomancer(),
			xModifier = (biomancer.getRotation() < MathUtil['3PI4']) ? 1.0 : -1.0,
			yModifier = Math.cos(biomancer.getRotation());
		
		
		// Set hitbox
		animal.hitbox.setHitboxFromImage({width: 2 * animal.launchIdlePivot.x, height: 2 * animal.launchIdlePivot.y});

		// Reposition in terms of the level
		animal.setPosition(
			biomancer.hitbox.transformPointWithFullMatrix(
				new Point(
					this.position.x + GUN_VARS.LAUNCH_OFFSET.x - xModifier * animal.launchIdlePivot.x, 
					this.position.y + GUN_VARS.LAUNCH_OFFSET.y - yModifier * animal.launchIdlePivot.y
				)
			)
		);

		// Set pivot point
		animal.setPivotPoint({x: animal.launchIdlePivot.x, y: animal.launchIdlePivot.y });

		// Set direction based on Biomancer 
		animal.setDirection(biomancer.getRotation());

		return animal;
	}

	swapAnimal(name) {
		var potentialAnimal = this.availableAnimals.find((element) => element === name);
		this.currentAnimal = (potentialAnimal !== undefined) ? potentialAnimal : this.currentAnimal;
		if(this.currentAnimal !== undefined) {
			new UserInterface().animalContainer.setCurrentAnimal(name);
		}
		return (potentialAnimal !== undefined);
	}

	getCurrentAnimal() {
		return this.currentAnimal;
	}

	addAnimalToGun(animal) {
		this.availableAnimals.push(animal);

		if (this.currentAnimalIndex === undefined) {
			this.currentAnimal = animal;
		}
	}

	initializeAnimals() {
		// Create animals
		this.availableAnimals = [];
		this.currentAnimal = undefined;
		GUN_VARS.ANIMALS.map((x) => this.addAnimalToGun(x)); // Call like this to set default to first
		this.swapAnimal(GUN_VARS.ANIMALS[0]);
	}
}