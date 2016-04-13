"use strict";

var USER_INTERFACE_VARS = {
	ALPHA: 0.0,
	INTERFACE_FILE: "biomancer/ui/main.png",
	DIALOG_CLOSE: 81, // Q
}
let _userinterfaceInstance = null;

class UserInterface extends DisplayObjectContainer {
	constructor() {
		if(!_userinterfaceInstance) {
			super('user-interface', USER_INTERFACE_VARS.INTERFACE_FILE);
			_userinterfaceInstance = this;			
			this.alpha = USER_INTERFACE_VARS.ALPHA;
			this.canvasCTX = document.getElementById('game').getContext('2d');			
			this.animalContainer = new UIAnimalDisplay();
			this.addChild(this.animalContainer);
			this.dialogShown = false;
			this.dialog = undefined;
			this.dialogQueue = [];
		}

		return _userinterfaceInstance;
	}	

	update(pressedKeys) {
		let currentTime = new Date().getTime();

		if(this.dialog && this.dialog.finished) {
			if(this.dialog.finishedTimeout < currentTime || pressedKeys.contains(USER_INTERFACE_VARS.DIALOG_CLOSE)) {			
				this.removeChild(this.dialog);
				this.dialog = undefined;
				this.dialogShown = false;
				if(this.dialogQueue.length > 0) {
					let nextDialog = this.dialogQueue.shift();
					this.showDialog(nextDialog.message, nextDialog.options);
				}
			}
		}		
	}

	showDialog(message, options) {
		if(!this.dialogShown) {
			this.dialog = new DialogContainer(message, options, this.canvasCTX)
			this.addChild(this.dialog);
			this.dialogShown = true;
		} else {
			this.dialogQueue.push({message: message, options: options});
		}
	}
}

var UI_ANIMAL_VARS = {
	XPOS: 0,
	YPOS: 0,
	ALPHA: 0.5,	
	ANIMAL_CONTAINER_FILE: "biomancer/ui/ui-animal-container.png",
	ANIMAL_CONTAINER_BLANK: "biomancer/ui/ui-animal-container-blank.png"
}

class UIAnimalDisplay extends DisplayObjectContainer {
	constructor() {
		super('user-interface-animal-container', UI_ANIMAL_VARS.ANIMAL_CONTAINER_FILE)
		this.currentAnimal = undefined;
		this.availableAnimals = GUN_VARS.ANIMALS.map(a => { 
			return {
				image: "biomancer/ui/ui-animal-container-" + a.toLowerCase() + ".png",
				name: a.toLowerCase()				
			};
		});
		this.alpha = UI_ANIMAL_VARS.ALPHA;
		this.setPosition = {x: UI_ANIMAL_VARS.XPOS, y: UI_ANIMAL_VARS.YPOS};
		this.availableAnimals.forEach((a, i) => {
			this.addAnimal(a, i);			
		});
		this.nextUpdate = new Date().getTime();
	}

	addAnimal(animal, index) {
		animal.underIcon = new DisplayObjectContainer("ui-animal-under-"+animal.name, UI_ANIMAL_VARS.ANIMAL_CONTAINER_BLANK);
		animal.icon = new DisplayObjectContainer("ui-animal-"+animal.name, animal.image);

		this.addChild(animal.underIcon);
		animal.underIcon.addChild(animal.icon);
		animal.underIcon.setPosition({x:15, y:80*index+15});
		animal.underIcon.setAlpha(0.0);
		animal.icon.setPosition({x:10, y:10});

		if(this.currentAnimal === undefined) { this.setCurrentAnimal(animal); }
	}

	// removeAnimal(name) {
	// 	this.availableAnimals = this.availableAnimals.filter(x => x !== name);
	// 	this.removeChildById("ui-animal-"+name);
	// 	if(this.currentAnimal === name) { this.currentAnimal = undefined; }
	// }

	setCurrentAnimal(animal) {
		if(this.currentAnimal !== undefined) {
			this.currentAnimal.underIcon.setAlpha(0.0);
		}
		if(typeof animal === "string") {
			let name = animal.toLowerCase();
			this.currentAnimal = this.availableAnimals.find(a => a.name === name);
		} else {
			this.currentAnimal = animal;
		}
		this.currentAnimal.underIcon.setAlpha(0.8);
	}


}