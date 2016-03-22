"use strict";


class HealthBar extends DisplayObjectContainer {
	
	constructor(entity) {
		this.entity = entity;
		this.maxHealth = this.entity.maxHealth;
		this.health = this.entity.health;
		this.dead = false;

		// listeners
		this.entity.addEventListener(EVENTS.HEALTH_UPDATED, this, updateHealth);
		this.entity.addEventListener(EVENTS.DIED, this, died);
	}

	redraw() {
		this.children = [];

		// TODO: add and alter images for health based on max
	}

	updateHealth(health) {
		this.health = health;
		redraw();
	}

	died() {
		this.dead = true;
		this.setVisible(false);
	}

	isDead() {
		return this.dead;
	}

}