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
			}

			this.children.forEach(function (child) {
				child.draw(g);
			});
		}

		this.reverseTransformations(g);
	}

	update () {
		super.update();
		this.children.forEach(c => c.update());
	}

	addChild (child, index) {
		if(index === undefined) { 
			this.children.push(child);
		} else {
			this.children.splice(index, 0, child);
		}
		child.setParent(this);
	}

	removeChild (child) {
		var index = this.children.indexOf(child);

		if (index !== -1) {
			this.children.splice(index, 1);
		}
	}

	removeChildAtIndex (index) {
		if (index !== undefined && (index >= 0 && index < this.children.length)) {
			this.children.splice(index, 1);
		}
	}

	removeChildren () {
		this.children = [];
	}

	contains (child) {
		return (this.children.indexOf(child) !== -1);
	}

	getChildById (id) {
		return this.children.filter(child => child.getId() === id)[0];
	}

	getChildByIndex (index) {
		return this.children[index];
	}

	getChildren() {
		return this.children;
	}

}