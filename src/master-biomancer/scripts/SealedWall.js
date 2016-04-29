"use strict";


var SEALED_WALL_VARS = {
	FILENAME: "biomancer/misc/dialogue.png",
	DIMENSIONS: {width: 50, height: 50},
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for focusChild
		indexReferencePlacing: false, //True is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
	TIME_BETWEEN_WALLS: 150,
	count: 0
};


class SealedWall extends ScriptObject {
	
	constructor(id) {
		super(id);

	}

	script() {
		super.script();

		var that = this,
			timeDiff = 0;
		this.children.forEach(function (child) {
			setTimeout(function () {
				var wall = WallGroup.generateWall("wall-0", 1, 1);
				wall.setPosition({x: child.position.x, y: child.position.y});
				that.getLevel().addWall(wall);
			}, timeDiff);
			timeDiff += SEALED_WALL_VARS.TIME_BETWEEN_WALLS;
		});
	}

	/**
	  * Generate Dialogue
	 */
	static generateSealedWall(cols) {
		var sealedWallImage = SEALED_WALL_VARS.FILENAME,
			generatedSealedWall = new SealedWall("SealedWall-" + SEALED_WALL_VARS.count),
			currentSealedWallId = 0,
			width = SEALED_WALL_VARS.DIMENSIONS.width,
			height = SEALED_WALL_VARS.DIMENSIONS.height;

		// Layout walls
		for (let j = 0; j < cols; j++) {
			var currentSealedWall = new Sprite("SealedWall" + "-" + SEALED_WALL_VARS.count + "-" + currentSealedWallId, sealedWallImage);
			currentSealedWall.setPosition({x: j * width, y: 0});
			currentSealedWall.setPivotPoint({x: width / 2, y: height / 2});
			currentSealedWall.hitbox.setHitboxFromImage(SEALED_WALL_VARS.DIMENSIONS);
			generatedSealedWall.addChild(currentSealedWall);
			currentSealedWallId++;
		}

		// Central pivot point on the display object container
		generatedSealedWall.setPivotPoint({x: cols * width / 2, y: height / 2});

		// Set hitbox
		generatedSealedWall.hitbox.setHitboxFromImage({width: cols * width, height: height});

		// Increment count
		SEALED_WALL_VARS.count++;

		return generatedSealedWall;
	}

}