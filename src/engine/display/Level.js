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
		super(id, undefined);
		this.tilesGenerated = 0;
		this.focusChild = undefined;
		this.animals = [];
		this.healthBars = [];
		this.friendlies = [];
		this.enemies = [];
	}

	update(pressedKeys) {
		super.update(pressedKeys);
		var that = this;

		// Remove unused health bars
		this.healthBars.forEach(function (healthBar) {
			if (healthBar.isDead()) {
				that.removeChild(healthBar);
			}
		});
		this.healthBars = this.healthBars.filter((healthBar) => (!healthBar.isDead()));

		// Remove animals that have spawned and died
		this.animals.forEach(function (animal) {
			if (animal.hasSpawned() && !animal.isAlive()) {
				that.removeChild(animal);
				that.removeFriendly(animal);
			}
		});
		this.animals = this.animals.filter((animal) => (!animal.hasSpawned() || animal.isAlive()));

		// Remove enemies that have died
		this.enemies.forEach(function (enemy) {
			if (!enemy.isAlive()) {
				that.removeChild(enemy);
			}
		});
		this.enemies = this.enemies.filter((enemy) => (enemy.isAlive()));
	}

	draw(g) {
		super.draw(g);
	}

	/**
	  * Focus child
	 */
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

	setFocusChildAndMonitorHealth(child) {
		this.setFocusChild(child);
		this.monitorHealth(child);
	}

	addChildBeforeFocus(child) {
		this.addChild(child, this.getChildIndex(this.focusChild));
	}

	/**
	  * Animals
	 */
	addAnimal(animal) {
		animal.setLevel(this);
		this.addChildBeforeFocus(animal);
		this.animals.push(animal);
		this.addFriendly(animal);
	}

	/**
	  * Health
	 */
	monitorHealth(entity) {
		var healthBar = new HealthBar(entity);
		this.addChild(healthBar, this.getChildIndex(entity) + 1);
		this.healthBars.push(healthBar);
	}

	/**
	  * Friendlies
	 */
	addFriendly(entity) {
		this.friendlies.push(entity);
	}

	removeFriendly(entity) {
		this.friendlies.splice(this.friendlies.indexOf(entity), 1);
	}

	getFriendlyEntities() {
		return this.friendlies;
	}

	/**
	  * Enemies
	 */
	addEnemy(enemy) {
		enemy.setLevel(this);
		this.addChildBeforeFocus(enemy);
		this.enemies.push(enemy);
		this.monitorHealth(enemy);
	}

	/**
	  * Tiles
	 */
	generateTileRect(horizontalTiles, verticalTiles, position, scale, tileId) {
		var tile = (tileId !== undefined) ? TILES[tileId] : TILES[LEVEL_VARS.DEFAULT_TILE],
			generatedTile = new DisplayObjectContainer(),
			currentTileId = 0,
			tileImage = {width: tile.WIDTH, height: tile.HEIGHT};

		for (let j = 0; j < verticalTiles; j++) {
			for (let i = 0; i < horizontalTiles; i++) {
				var currentTile = new Sprite("tile-" + this.tilesGenerated + "-" + currentTileId, tile.FILENAME);
				currentTile.setPosition({x: i * tile.WIDTH, y: j * tile.HEIGHT});
				currentTile.setPivotPoint({x: tile.WIDTH / 2, y: tile.HEIGHT / 2});
				currentTile.hitbox.setHitboxFromImage(tileImage);
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
