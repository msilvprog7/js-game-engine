"use strict";


var TILES = {
	"tile_0": {
		FILENAME: "biomancer/levels/tiles/tile_0.png",
		WIDTH: 100,
		HEIGHT: 100
	}
};

var LEVEL_VARS = {
	DEFAULT_TILE: "tile_0"
};

/**
 * A display object container for a level
 * 
 * */
class Level extends DisplayObjectContainer{

	constructor(id) {
		super(id, null);
		this.tilesGenerated = 0;
		this.focusChild = undefined;
	}

	setFocusChild(child) {
		if (this.focusChild !== undefined) {
			this.removeFocusChild();
		}

		this.focusChild = child;
		this.addChild(child);
	}

	getFocusChild() {
		return this.focusChild;
	}

	removeFocusChild() {
		this.removeChild(this.focusChild);
		this.focusChild = undefined;
	}

	generateTileRect(horizontalTiles, verticalTiles, position, scale, tileId) {
		var tile = (tileId !== undefined) ? TILES[tileId] : TILES[LEVEL_VARS.DEFAULT_TILE],
			generatedTile = new DisplayObjectContainer(),
			currentTileId = 0,
			tileHitbox = [new Point(0, 0), new Point(tile.WIDTH, 0), new Point(tile.WIDTH, tile.HEIGHT), new Point(0, tile.HEIGHT)];

		for (let j = 0; j < verticalTiles; j++) {
			for (let i = 0; i < horizontalTiles; i++) {
				var currentTile = new Sprite("tile-" + this.tilesGenerated + "-" + currentTileId, tile.FILENAME);
				currentTile.setPosition({x: i * tile.WIDTH, y: j * tile.HEIGHT});
				currentTile.setPivotPoint({x: tile.WIDTH / 2, y: tile.HEIGHT / 2});
				currentTile.hitbox.setHitbox(tileHitbox);
				generatedTile.addChild(currentTile);
				currentTileId++;
			}
		}

		generatedTile.setPosition({
			x: (position !== undefined && position.x !== undefined) ? position.x : 0.0,
			y: (position !== undefined && position.y !== undefined) ? position.y : 0.0
		});
		generatedTile.setPivotPoint({x: horizontalTiles * tile.WIDTH / 2, y: verticalTiles * tile.HEIGHT / 2});
		generatedTile.setScaleX((scale !== undefined && scale.x !== undefined) ? scale.x : 1.0);
		generatedTile.setScaleY((scale !== undefined && scale.y !== undefined) ? scale.y : 1.0);

		this.tilesGenerated++;

		return generatedTile;
	}

}
