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
	HEALTHBAR_PADDING: {x: 2, y: 2},
	STATUS_ICONS: {
		"move-slow": "biomancer/status/move-slow-icon-large.png",
		"poison": "biomancer/status/poison-icon.png",
		"burn": "biomancer/status/burning-icon-large.png",
		"attack-slow": "biomancer/status/attack-slow-icon-large.png",
	},
	STATUS_POSITIONING: {x: -10, y: -30},
	STATUS_X_PADDING: 20
};


class HealthBar extends DisplayObjectContainer {
	
	constructor(entity) {
		super("healthbar-" + entity.id, undefined);

		// set state
		this.entity = entity;

		// initialize
		this.backgroundBar = undefined;
		this.healthBar = undefined;
		this.statusIcons = [];
		this.healthColor = HEALTHBAR_VARS.HEALTHBAR_COLOR[0].COLOR;
		this.create();

		// listeners
		this.entity.addEventListener(EVENTS.HEALTH_UPDATED, this, this.updateHealth, this);
		this.entity.addEventListener(EVENTS.STATUS_UPDATED, this, this.updateStatus, this);
		this.entity.addEventListener(EVENTS.HITBOX_UPDATED, this, this.updatePosition, this);
		this.entity.addEventListener(EVENTS.DIED, this, this.died, this);
	}

	create() {
		this.removeChildren();

		// Set position
		this.setPosition(this.entity.position);

		// Add background bar
		this.backgroundBar = new Rectangle(this.getBackgroundBarPosition(), this.getBackgroundBarDimensions(), HEALTHBAR_VARS.BACKGROUNDBAR_COLOR);
		this.addChild(this.backgroundBar);

		// Add inner health bar
		this.healthBar = new Rectangle(this.getHealthBarPosition(), this.getHealthBarDimensions(), this.healthColor);
		this.addChild(this.healthBar);

		this.statusIcons = [];
	}

	getBackgroundBarPosition() {
		return {
			x: HEALTHBAR_VARS.OFFSET.x,
			y: HEALTHBAR_VARS.OFFSET.y
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

	getStatusPosition(index) {
		return {
			x: HEALTHBAR_VARS.STATUS_POSITIONING.x + HEALTHBAR_VARS.STATUS_X_PADDING * index,
			y: HEALTHBAR_VARS.STATUS_POSITIONING.y
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
		this.setPosition(this.entity.position);
		// Background bar
		// this.backgroundBar.setPosition(this.getBackgroundBarPosition());
		// this.backgroundBar.setDimensions(this.getBackgroundBarDimensions());

		// Health bar
		// this.healthBar.setPosition(this.getHealthBarPosition());
		// this.healthBar.setDimensions(this.getHealthBarDimensions());
	}

	addStatusIcon(name, index, image) {
		var icon = new Sprite(this.id + "-status-" + name, image);
		icon.setPosition(this.getStatusPosition(index));
		this.statusIcons.push(icon);
		this.addChild(icon);
	}

	removeAllStatusIcons() {
		var that = this;
		this.statusIcons.forEach((i) => that.removeChild(i));
		this.statusIcons = [];
	}

	updateStatus(data) {
		var statusIndex = 0,
			image = "";

		this.removeAllStatusIcons();

		// Get status names
		for(let statusName in this.entity.statuses) {
			// Obtain status
			let status = this.entity.statuses[statusName]
			// If status valid on character
			if(status.v) {
				// Image based on status type
				if(statusName === "dot") {
					switch(status.damageType) {
						case DAMAGE_TYPES["POISON"]:
							image = HEALTHBAR_VARS.STATUS_ICONS["poison"]
							break;
						case DAMAGE_TYPES["FIRE"]:
							image = HEALTHBAR_VARS.STATUS_ICONS["burn"]
							break;
					}
				} else {
					image = HEALTHBAR_VARS.STATUS_ICONS[statusName];
				}

				this.addStatusIcon(statusName, statusIndex, image);
				statusIndex++;
			}
		}
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