"use strict";


var DIALOGUE_VARS = {
	count: 0,
	FILENAME: "biomancer/misc/dialogue.png",
	PIVOT: {x: 25, y: 25},
	DIMENSIONS: {width: 50, height: 50},
	ADD_DEFAULTS: {
		parentIsLevel: true,
		indexReferenceEntity: undefined, //Leave undefined for before focus child, or if no child exists appending to end
		indexReferencePlacing: true, //True or undefined is before, false is after
		monitorHealth: false //True only if monitor health from start
	},
};


class DialogueObject extends DisplayObjectContainer {
	
	constructor(id, text) {
		super(id, undefined);

		// Set text
		this.text = this.filter(text);
		this.shown = false;

		// Get UI
		this.UserInterface = new UserInterface();

		// Hidden
		this.visible = false;

		this.hasPhysics = true;
		this.friction = 0.0;
		this.initCollisions();
		this.addEventListener(EVENTS.COLLISION, this, this.checkBiomancerCollision, this);
	}

	/** 
	 * Change from one string representation to string
	 */
	filter(text) {
		return text.replace(/---/g, " ");
	}

	checkBiomancerCollision(d1, d2) {
		console.log("here");
		if ((d1 === this || d2 === this) && (d1 instanceof Biomancer || d2 instanceof Biomancer)) {
			show();
		}
	}

	show() {
		this.UserInterface.showDialog(this.text);
		this.shown = true;
	}

	getLevel() {
		let l = this.parent, iters = 0;
		while(!(l instanceof Level)) {
			l = l.parent;
			iters++;
			if(iters > 10) { return undefined; }
		}
		return l;
	}

	setLevel(level) {
		this.parent = level;
	}

	/**
	  * Generate Dialogue
	 */
	static generateDialogue(text, cols, rows) {
		var dialogueImage = DIALOGUE_VARS.FILENAME,
			generatedDialogue = new DialogueObject("dialogue-" + DIALOGUE_VARS.count, text),
			currentDialogueId = 0,
			width = DIALOGUE_VARS.DIMENSIONS.width,
			height = DIALOGUE_VARS.DIMENSIONS.height;

		// Layout walls
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				var currentDialogue = new Sprite("dialogue" + "-" + DIALOGUE_VARS.count + "-" + currentDialogueId, dialogueImage);
				currentDialogue.setPosition({x: j * width, y: i * height});
				currentDialogue.setPivotPoint({x: width / 2, y: height / 2});
				currentDialogue.hitbox.setHitboxFromImage(DIALOGUE_VARS.DIMENSIONS);
				generatedDialogue.addChild(currentDialogue);
				currentDialogueId++;
			}
		}

		// Central pivot point on the display object container
		generatedDialogue.setPivotPoint({x: cols * width / 2, y: rows * height / 2});

		// Set hitbox
		generatedDialogue.hitbox.setHitboxFromImage({width: cols * width, height: rows * height});

		// Increment count
		DIALOGUE_VARS.count++;

		return generatedDialogue;
	}

}