"use strict";

var WALL_VARS = {
	FILENAME: "brick.png",
	groupCount: 0,
	WALLS: {
		"wall-0": {
			FILENAME: "biomancer/levels/tiles/wall_0_50x50.png",
			WIDTH: 50,
			HEIGHT: 50
		},
		"wall-0-wide": {
			FILENAME: "biomancer/levels/tiles/wall_0_400x50.png",
			WIDTH: 400,
			HEIGHT: 50
		}, 
		"wall-0-tall": {
			FILENAME: "biomancer/levels/tiles/wall_0_50x400.png",
			WIDTH: 50,
			HEIGHT: 400
		}
	},
	DEFAULT_WALL: "wall-0"
};


class Wall extends Sprite {

	constructor(id, filename) {
		super(id, WALL_VARS.FILENAME);
		this.hasPhysics = true;
	}
	
}

class WallGroup extends DisplayObjectContainer {

	constructor(id) {
		super(id, undefined);
		this.hasPhysics = true;
	}

	/**
	  * Generate Walls
	 */
	static generateWall(wallId, cols, rows) {
		var wall = (wallId !== undefined) ? WALL_VARS.WALLS[wallId] : WALL_VARS.WALLS[WALL_VARS.DEFAULT_WALL],
			generatedWall = new WallGroup("generated-wall-" + WALL_VARS.groupCount),
			currentWallId = 0,
			wallImage = {width: wall.WIDTH, height: wall.HEIGHT};

		// Layout walls
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				var currentWall = new Sprite("wall" + "-" + currentWallId, wall.FILENAME);
				currentWall.setPosition({x: j * wall.WIDTH, y: i * wall.HEIGHT});
				currentWall.setPivotPoint({x: wall.WIDTH / 2, y: wall.HEIGHT / 2});
				currentWall.hitbox.setHitboxFromImage(wallImage);
				generatedWall.addChild(currentWall);
				currentWallId++;
			}
		}

		// Central pivot point on the display object container
		generatedWall.setPivotPoint({x: cols * wall.WIDTH / 2, y: rows * wall.HEIGHT / 2});

		// Set hitbox
		generatedWall.hitbox.setHitboxFromImage({width: cols * wall.WIDTH, height: rows * wall.HEIGHT});

		// Increment count
		WALL_VARS.groupCount++;

		return generatedWall;
	}

}