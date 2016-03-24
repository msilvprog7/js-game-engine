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
		animal.parent = this;
		this.addChildBeforeEnemies(animal);
		this.animals.push(animal);
		this.addFriendly(animal);
	}

	getFirstAnimalIndex() {
		return this.getIndexOfChildType(Animal);
	}

	getLastAnimalIndex() {
		return this.getLastIndexOfChildType(Animal);
	}

	addChildAfterAnimals(child) {
		let i = this.getLastAnimalIndex();
		if (i === -1) {
			this.addChildBeforeFocus(child);
		} else {
			this.addChild(child, i + 1);
		}
	}

	addChildBeforeAnimals(child) {
		let i = this.getFirstAnimalIndex();
		if (i === -1) {
			this.addChildBeforeFocus(child);
		} else {
			this.addChild(child, i);
		}
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

	getEnemyEntities() {
		return this.enemies;
	}

	/**
	  * Enemies
	 */
	addEnemy(enemy) {
		enemy.parent = this;
		this.addChildAfterAnimals(enemy);
		this.enemies.push(enemy);
		this.monitorHealth(enemy);
	}

	getFirstEnemyIndex() {
		return this.getIndexOfChildType(Enemy);
	}

	addChildBeforeEnemies(child) {
		let i = this.getFirstEnemyIndex();
		if (i === -1) {
			this.addChildBeforeFocus(child);
		} else {
			this.addChild(child, i);
		}
	}

	addBullet(bullet) {
		bullet.parent = this;
		this.addChildBeforeAnimals(bullet);
	}

	removeBullet(bullet) {
		this.removeChild(bullet);
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
