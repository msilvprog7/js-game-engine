"use strict";


class LevelParser {
	
	constructor(classReferences) {
		this.classReferences = classReferences;
		this.levels = {};
	}

	store(id, str) {
		// Create if necessary
		if (this.levels[id] === undefined || this.levels[id] === null) {
			this.levels[id] = {};
		}

		// Set content and loaded
		this.levels[id].level = str;
		this.levels[id].loaded = true;
	}

	get(id, game) {
		var levelObj = this.levels[id];

		if (levelObj === undefined || levelObj === null) {
			console.error("Level with id[" + id + "] not stored in LevelParser");
			return null;
		}

		if (levelObj.loaded === false) {
			console.error("Level with id[" + id + "] has not yet been loaded by the LevelParser");
			return null;
		}

		if (levelObj.level === undefined || levelObj.level === null) {
			console.error("Level with id[" + id + "] mysteriously lacks a level representation loaded in it LevelParser");
			return null;
		}

		return this.parse(id, levelObj.level, game);
	}

	parse(id, str, game) {
		var level = new Level(id, game),
			items = str.split("|");

		// Item by item through level definition
		for (let i = 0; i < items.length; i++) {
			// Parse each item defined
			var words = items[i].match(/\w+/g);

			// Empty line
			if (words === undefined || words === null || words.length === 0) {
				continue;
			}

			// Check type with class references (e.g. Biomancer)
			var type = words[0],
				reference = this.classReferences[type];

			if (reference === undefined  || 
				reference.constructor === undefined || 
				reference.constructor === null || 
				reference.addToLevel === undefined || 
				reference.addToLevel === null) {
				console.error("Type[" + type + "] not properly defined in Class References (project/levels/LevelList.js), must have 'constructor' and 'addToLevel'");
				continue;
			}

			// Create object
			var obj = reference.constructor();
			obj.setParent(level);

			// Parse properties on object
			for (let wordIndex = 1; wordIndex < words.length; wordIndex++) {
				// Properties
				switch (words[wordIndex]) {
					case "loc":
					case "location":
					case "pos":
					case "position":
						// Conditions not met
						if (wordIndex + 2 >= words.length || isNaN(parseFloat(words[wordIndex + 1])) || isNaN(parseFloat(words[wordIndex + 1]))) {
							console.error("Parsing level item[" + i + "] word[" + wordIndex + "] - position x y without proper formatting");
							continue;
						}

						// Set position
						obj.setPosition({x: parseFloat(words[wordIndex + 1]), y: parseFloat(words[wordIndex + 2])});
						break;
				}
			}

			// Default properties
			if (reference.pivot !== undefined) {
				obj.setPivotPoint(reference.pivot);
			}

			if (reference.dimensions !== undefined) {
				obj.hitbox.setHitboxFromImage(reference.dimensions);
			}


			// Add object to level
			reference.addToLevel(level, obj, reference.options);
		}


		// /// ... Walls
		// currentLevel.addWall(new Wall('wall1').setScaleY(4))
		// 	.addWall(new Wall('wallBottom').setPosition({y: 500}).setScaleX(8));

		return level;
	}

	loadFile(id, filename) {
		var req = new XMLHttpRequest(),
			that = this;

		// Store initial object
		this.levels[id] = {loaded: false, level: null};

		req.open("GET", filename);
		req.onreadystatechange = function () {
			// Store content
			that.store(id, req.responseText);
		};
		req.send();
	}

}