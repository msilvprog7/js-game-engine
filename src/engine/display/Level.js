"use strict";


var TILES = {
	"tile-0": {
		FILENAME: "biomancer/levels/tiles/tile_0_400x400.png",
		WIDTH: 400,
		HEIGHT: 400
	}
};

var LEVEL_VARS = {
	DEFAULT_TILE: "tile-0",
	TILE_ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
	MAX_ANIMALS: 3,
	GRID_TILE_SIZE: 25
};

/**
 * A display object container for a level
 * 
 * */
class Level extends DisplayObjectContainer{

	constructor(id, game, noGrid) {
		super(id, undefined);
		this.focusChild = undefined;
		this.biomancer = undefined;
		this.animals = [];
		this.healthBars = [];
		this.friendlies = [];
		this.enemies = [];
		this.colliders = [];
		this.movers = [];
		this.obstacles = [];
		this.scriptObjects = [];
		this.game = game;
		this.inCombat = false;
		this.dropCombatTime = new Date().getTime();	

		this.addEventListener(EVENTS.COMBAT_STATE_CHANGE, this, function(state){
			let musicToFade = this.inCombat ? "background-nervous" : "background-normal";		
			new SoundManager().fadeMusic(musicToFade);
		}, this);	
		
		if (!noGrid)
			this.aStarGrid = new AStarGrid(this);
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

		if(this.inCombat && this.dropCombatTime < new Date().getTime()) {
			this.changeCombatState(false);
		}

		// Remove animals that have spawned and died
		this.animals.forEach(function (animal) {
			if (animal.hasSpawned() && !animal.isAlive()) {
				that.removeChild(animal);
				that.removeFriendly(animal);
				that.removeCollider(animal);
				that.removeMover(animal);
				that.removeFromAStarGrid(animal);
			}
		});
		this.animals = this.animals.filter((animal) => (!animal.hasSpawned() || animal.isAlive()));

		// Remove enemies that have died
		this.enemies.forEach(function (enemy) {
			if (!enemy.isAlive()) {
				that.removeChild(enemy);
				that.removeCollider(enemy);
				that.removeMover(enemy);
				that.removeFromAStarGrid(enemy);
			}
		});
		this.enemies = this.enemies.filter((enemy) => (enemy.isAlive()));

		// Remove obstacles that have been destroyed
		this.obstacles.forEach(function (obstacle) {
			if (obstacle.destroyed) {
				that.removeChild(obstacle);
				that.removeCollider(obstacle);
				that.removeMover(obstacle);
				that.removeFromAStarGrid(obstacle);
			}
		});
		this.obstacles = this.obstacles.filter((obstacle) => (!obstacle.destroyed));

		// Remove dialogues that have been triggered
		this.scriptObjects.forEach(function (script) {
			if (script.activated) {
				that.removeChild(script);
			}
		});
		this.scriptObjects = this.scriptObjects.filter((scriptObject) => (!scriptObject.activated));

		// Check collisions
		this.movers.forEach(mover => {
			this.colliders.forEach(collider => {
				if (mover !== collider) 
					if (mover.collidesWith(collider)) {
					}
			});
		});

		this.scriptObjects.forEach(scriptObject => {
			if(scriptObject.collidesWith(this.biomancer)) {
				//Do nothing because the event handles all that jazz
			}
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
			this.addMover(entity);
			this.addCollider(entity);
			this.addToAStarGrid(entity, true, true);
		} else if(entity instanceof Animal){
			this.addFriendly(entity);
			this.animals.push(entity);
			if(this.animals.length > LEVEL_VARS.MAX_ANIMALS) {
				this.animals[0].killSelf();
			}
			this.addToAStarGrid(entity, true, true);
		} else if(entity instanceof Biomancer) {
			this.addFriendly(entity);
			this.setFocusChild(entity);
			this.biomancer = entity;
			entity.addEventListener(EVENTS.DIED, this, function () {
				that.reload();
			});
			this.addToAStarGrid(entity, true, true);
		} else if(entity instanceof Obstacle) {
			this.obstacles.push(entity);
			this.addMover(entity);
			this.addCollider(entity);
			this.addToAStarGrid(entity, true, false);
		} else if(entity instanceof ScriptObject) {
			this.scriptObjects.push(entity);
		}

		if(options["monitorHealth"] !== undefined && options["monitorHealth"]) {
			this.monitorHealth(entity);
		}
	}

	changeCombatState(state) {
		if(state) {
			this.dropCombatTime = new Date().getTime() + 5000;
		}
		if(state !== this.inCombat) {
			this.inCombat = state;
			this.dispatchEvent(EVENTS.COMBAT_STATE_CHANGE, state);
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
		this.addToAStarGrid(wall, false);
		return this;
	}

	addToAStarGrid(entity, isDynamic, isMover) {
		if (this.aStarGrid) {
			var tl = entity.hitbox.hitbox.tl,
				br = entity.hitbox.hitbox.br;

			if (isDynamic) {
				// marking all dynamic entries as single tiles
				this.aStarGrid.addObject(entity, tl, br, isMover);
			} else {
				this.aStarGrid.addStatic(tl, br);
			}
		}
	}

	removeFromAStarGrid(entity) {
		if (this.aStarGrid)
			this.aStarGrid.removeObject(entity);
	}

	getGrid() { 
		if (this.aStarGrid)
			return this.aStarGrid; 
	}

	setCorners(corners) {
		if (this.aStarGrid) {
			this.topLeft = corners[0];
			this.bottomRight = corners[1];

			// generate initial A* grid
			
			this.aStarGrid.generateGrid(this.topLeft, this.bottomRight, LEVEL_VARS.GRID_TILE_SIZE);
		}
	}

	/**
	  * Tiles
	 */
	static generateTileRect(tileId, cols, rows) {
		var tile = (tileId !== undefined) ? TILES[tileId] : TILES[LEVEL_VARS.DEFAULT_TILE],
			generatedTile = new DisplayObjectContainer("generated-tile-" + Math.floor(Math.random() * 100000)),
			currentTileId = 0,
			tileImage = {width: tile.WIDTH, height: tile.HEIGHT};

		// Layout tiles
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				var currentTile = new Sprite("tile" + "-" + currentTileId, tile.FILENAME);
				currentTile.setPosition({x: j * tile.WIDTH, y: i * tile.HEIGHT});
				currentTile.setPivotPoint({x: tile.WIDTH / 2, y: tile.HEIGHT / 2});
				currentTile.hitbox.setHitboxFromImage(tileImage);
				generatedTile.addChild(currentTile);
				currentTileId++;
			}
		}

		// Central pivot point on the display object container
		generatedTile.setPivotPoint({x: cols * tile.WIDTH / 2, y: rows * tile.HEIGHT / 2});

		// Set hitbox
		generatedTile.hitbox.setHitboxFromImage({width: cols * tile.WIDTH, height: rows * tile.HEIGHT});

		return generatedTile;
	}


}
