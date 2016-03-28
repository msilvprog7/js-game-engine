"use strict";

var HEALTHBAR_VARS = {
	OFFSET: {x: -5, y: -10},
	BACKGROUNDBAR_COLOR: "#000000",
	BACKGROUNDBAR_HEIGHT: 8,
	HEALTHBAR_COLOR: [
		{LOWERBOUND: 0.35, COLOR: "#00FF00"},
		{LOWERBOUND: 0.15, COLOR: "#FFFF00"},
		{LOWERBOUND: 0.00, COLOR: "#FF0000"}
	],
	HEALTHBAR_PADDING: {x: 2, y: 2}
};


class HealthBar extends DisplayObjectContainer {
	
	constructor(entity) {
		super("healthbar-" + entity.id, undefined);

		// set state
		this.entity = entity;

		// initialize
		this.backgroundBar = undefined;
		this.healthBar = undefined;
		this.healthColor = HEALTHBAR_VARS.HEALTHBAR_COLOR[0].COLOR;
		this.create();

		// listeners
		this.entity.addEventListener(EVENTS.HEALTH_UPDATED, this, this.updateHealth, this);
		this.entity.addEventListener(EVENTS.HITBOX_UPDATED, this, this.updatePosition, this);
		this.entity.addEventListener(EVENTS.DIED, this, this.died, this);
	}

	create() {
		this.removeChildren();

		// Add background bar
		this.backgroundBar = new Rectangle(this.getBackgroundBarPosition(), this.getBackgroundBarDimensions(), HEALTHBAR_VARS.BACKGROUNDBAR_COLOR);
		this.addChild(this.backgroundBar);

		// Add inner health bar
		this.healthBar = new Rectangle(this.getHealthBarPosition(), this.getHealthBarDimensions(), this.healthColor);
		this.addChild(this.healthBar);
	}

	getBackgroundBarPosition() {
		return {
			x: this.entity.position.x + HEALTHBAR_VARS.OFFSET.x,
			y: this.entity.position.y + HEALTHBAR_VARS.OFFSET.y
		};
	}

	getBackgroundBarDimensions() {
		return {
			width: (this.entity.hitbox.hitbox.tr.x - this.entity.hitbox.hitbox.tl.x) - 2 * (HEALTHBAR_VARS.OFFSET.x),
			height: HEALTHBAR_VARS.BACKGROUNDBAR_HEIGHT
		};
	}

	getHealthBarPosition() {
		var backgroundBarPosition = this.getBackgroundBarPosition();

		return {
			x: backgroundBarPosition.x + HEALTHBAR_VARS.HEALTHBAR_PADDING.x,
			y: backgroundBarPosition.y + HEALTHBAR_VARS.HEALTHBAR_PADDING.y
		};
	}

	getHealthBarDimensions() {
		var backgroundBarDim = this.getBackgroundBarDimensions(),
			fullWidth = backgroundBarDim.width - 2 * HEALTHBAR_VARS.HEALTHBAR_PADDING.x;

		return {
			width: this.entity.getHealthRatio() * fullWidth,
			height: backgroundBarDim.height - 2 * HEALTHBAR_VARS.HEALTHBAR_PADDING.y
		};
	}

	setHealthColor() {
		var ratio = this.entity.getHealthRatio(),
			currentColorObj = undefined,
			colorToSet = HEALTHBAR_VARS.HEALTHBAR_COLOR[HEALTHBAR_VARS.HEALTHBAR_COLOR.length - 1].COLOR; // Default to last (all thresholds failed...)

		for (let i = 0; i < HEALTHBAR_VARS.HEALTHBAR_COLOR.length; i++) {
			currentColorObj = HEALTHBAR_VARS.HEALTHBAR_COLOR[i];

			// Check threshold
			if (currentColorObj.LOWERBOUND < ratio) {
				colorToSet = currentColorObj.COLOR;
				break;
			}
		}

		this.healthBar.setFillColor(colorToSet);
	}

	resize() {
		// Update health bar dimensions
		this.healthBar.setDimensions(this.getHealthBarDimensions());
	}

	updatePosition(data) {
		// Background bar
		this.backgroundBar.setPosition(this.getBackgroundBarPosition());
		this.backgroundBar.setDimensions(this.getBackgroundBarDimensions());

		// Health bar
		this.healthBar.setPosition(this.getHealthBarPosition());
		this.healthBar.setDimensions(this.getHealthBarDimensions());
	}

	updateHealth(data) {
		this.setHealthColor();
		this.resize();
	}

	died() {
		this.setVisible(false);
	}

	isDead() {
		return !this.entity.isAlive();
	}

}