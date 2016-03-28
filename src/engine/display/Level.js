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

	constructor(id, game) {
		super(id, undefined);
		this.tilesGenerated = 0;
		this.focusChild = undefined;
		this.animals = [];
		this.healthBars = [];
		this.friendlies = [];
		this.enemies = [];
		this.colliders = [];
		this.movers = [];
		this.game = game;
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
				that.removeCollider(animal);
				that.removeMover(animal);
			}
		});
		this.animals = this.animals.filter((animal) => (!animal.hasSpawned() || animal.isAlive()));

		// Remove enemies that have died
		this.enemies.forEach(function (enemy) {
			if (!enemy.isAlive()) {
				that.removeChild(enemy);
				that.removeCollider(enemy);
				that.removeMover(enemy);
			}
		});
		this.enemies = this.enemies.filter((enemy) => (enemy.isAlive()));

		// Check collisions
		this.movers.forEach(mover => {
			this.colliders.forEach(collider => {
				if (mover !== collider) 
					if (mover.collidesWith(collider)) {
						// let mHitbox = mover.hitbox.hitbox,
						// 	cHitbox = collider.hitbox.hitbox,
						// 	xAdj = 0,
						// 	yAdj = 0,
						// 	mPos = mover.getPosition();
						// //move out left or right
						// if (mHitbox.tr.x > cHitbox.tl.x) {
						// 	xAdj = cHitbox.tl.x - mHitbox.tr.x;
						// } else if (mHitbox.tl.x < cHitbox.tr.x) {
						// 	xAdj = cHitbox.tr.x - mHitbox.tl.x;
						// }
						// //move out top or bottom
						// if (mHitbox.bl.y > cHitbox.tl.y) {
						// 	yAdj = cHitbox.tl.y - mHitbox.bl.y;
						// } else if (mHitbox.tl.y < cHitbox.bl.y) {
						// 	yAdj = cHitbox.bl.y - mHitbox.tl.y;
						// }

						// mover.setPosition({
						// 	x: mPos.x + xAdj,
						// 	y: mPos.y + yAdj
						// });
					}
			});
		});
	}

	draw(g) {
		super.draw(g);
	}

	/**
	  * Focus child
	 */
	setFocusChild(child, options) {
		if (this.focusChild !== undefined) {
			this.removeFocusChild();
		}

		this.focusChild = child;	
	}

	getFocusChild() {
		return this.focusChild;
	}

	removeFocusChild() {
		this.removeChild(this.focusChild);
		this.focusChild = undefined;
	}

	addEntityToLevel(entity, options) {
		var that = this;

		if(options === undefined) { return; }
		if(options["parentIsLevel"] !== undefined && options["parentIsLevel"]) {
			entity.parent = this;
		}
		if(options["indexReferenceEntity"] !== undefined) {
			//Different Entity Types to add before or after
			let index = this.getIndexOfChildType(options["indexReferenceEntity"], options["indexReferencePlacing"]);
			if(index === -1) {
				index = (this.focusChild !== undefined) ? this.getChildIndex(this.focusChild) : -1;
			} 
			this.addChild(entity, index);			
		} else {
			this.addChild(entity, this.getChildIndex(this.focusChild));
		}
		if(entity instanceof Enemy) {
			this.enemies.push(entity);
		} else if(entity instanceof Animal){
			this.addFriendly(entity);
			this.animals.push(entity);
		} else if(entity instanceof Biomancer) {
			this.addFriendly(entity);
			this.setFocusChild(entity);
			entity.addEventListener(EVENTS.DIED, this, function () {
				that.reload();
			});
		}
		if(options["monitorHealth"] !== undefined && options["monitorHealth"]) {
			this.monitorHealth(entity);
		}
	}

	reload() {
		this.game.reloadLevel();
	}
	
	removeEntity(entity) {
		this.removeChild(entity);
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
		this.addMover(entity)
			.addCollider(entity);
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

	addCollider(collider) {
		this.colliders.push(collider);
		return this;
	}

	addMover(mover) {
		this.movers.push(mover);
		return this;
	}

	getColliders(filter) {
		if(filter !== undefined) {
			return this.colliders.filter(x => !(x instanceof filter))
		} else {
			return this.colliders;
		}
	}

	removeCollider(entity) {
		this.colliders.splice(this.colliders.indexOf(entity), 1);
	}
	removeMover(entity) {
		this.movers.splice(this.movers.indexOf(entity), 1);
	}

	addWall(wall) {
		this.addChild(wall);
		this.addCollider(wall);
		return this;
	}
}
