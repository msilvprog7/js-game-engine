"use strict";

/**
 * A more complex display object container for a javascript based gaming engine
 * 
 * */
class DisplayObjectContainer extends DisplayObject{
	
	constructor(id, filename){
		super(id, filename);
		this.children = [];
	}

	draw (g) {
		this.applyTransformations(g);

		if(this.visible){
			if(this.loaded && this.displayImage) {
				g.drawImage(this.displayImage,0,0);

				// Test drawing hitbox
				// this.drawHitbox(g);
			}

			this.children.forEach(function (child) {
				child.draw(g);
			});
		}

		this.reverseTransformations(g);

		// Test drawing transformed hitbox
		//this.hitbox.drawHitbox(g);
	}

	update (pressedKeys) {
		super.update(pressedKeys);
		this.children.forEach(c => c.update(pressedKeys));
	}

	addChild (child, index) {
		if(index === undefined || index < 0) { 
			this.children.push(child);
		} else {
			this.children.splice(index, 0, child);
		}
		child.setParent(this);
	}

	unshiftChild(child) {
		this.children.unshift(child);
		child.setParent(this);
	}

	removeChild (child) {
		var index = this.children.indexOf(child);

		if (index !== -1) {
			return this.children.splice(index, 1)[0];
		}
		return undefined;
	}

	removeChildById(id) {
		var index = -1, i = 0;
		for(i; i < this.children.length; i++) {
			if(this.children[i].id === id) {
				index = i;
				break;
			}
		}

		if (index !== -1) {
			return this.children.splice(index, 1)[0];			
		}
		return undefined;
	}

	removeChildAtIndex (index) {
		if (index !== undefined && (index >= 0 && index < this.children.length)) {
			return this.children.splice(index, 1)[0];
		}
		return undefined;
	}

	removeChildren () {
		this.children = [];
	}

	contains (child) {
		return (this.children.indexOf(child) !== -1);
	}

	getChildIndex (child) {
		return this.children.indexOf(child);
	}

	getChildById (id) {
		return this.children.filter(child => child.getId() === id)[0];
	}

	getChildByIndex (index) {
		return this.children[index];
	}

	getIndexOfChildType(type, first) {
		if(first !== false) {
			for (let i = 0; i < this.children.length; i++) {
				if (this.children[i] instanceof type) {
					return i;
				}
			}
		} else {
			for (let i = this.children.length - 1; i >= 0; i--) {
				if (this.children[i] instanceof type) {
					return i;
				}
			}
		}		

		return -1;
	}

	getChildren() {
		return this.children;
	}

}