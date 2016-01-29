"use strict";

/**
 * A very basic display object for a javascript based gaming engine
 * 
 * */
class DisplayObject{
	
	constructor(id, filename){
		this.id = id;
		this.loaded = false;
		this.visible = true;
		this.position = {
			x: 0.0,
			y: 0.0
		};
		this.pivotPoint = {
			x: 0.0,
			y: 0.0
		};
		this.scaleX = 1.0;
		this.scaleY = 1.0;
		this.rotation = 0.0; // Radians
		this.alpha = 1.0;
		this.loadImage(filename);
	}

	/**
	 * Loads the image, sets a flag called 'loaded' when the image is ready to be drawn
	 */
	loadImage(filename){
		var t = this;
		this.displayImage = new Image();
  		this.displayImage.onload = function(){
  			t.loaded = true;
  		};
  		this.displayImage.src = 'resources/' + filename;
	}

	/**
	 * Invoked every frame, manually for now, but later automatically if this DO is in DisplayTree
	 */
	update(){
		
	}

	/**
	 * Draws this image to the screen
	 */
	draw(g){
		if(this.displayImage){
			this.applyTransformations(g);
			if(this.loaded) g.drawImage(this.displayImage,0,0);
			this.reverseTransformations(g);
		}
	}

	/**
	 * Applies transformations for this display object to the given graphics
	 * object
	 * */
	applyTransformations(g) {
	
	}

	/**
	 * Reverses transformations for this display object to the given graphics
	 * object
	 * */
	reverseTransformations(g) {

	}

	/**
	 * THIS AREA CONTAINS MOSTLY GETTERS AND SETTERS!
	 *
	 */

	setId(id){this.id = id;}
	getId(){return this.id;}

	setDisplayImage(image){this.displayImage = image;} //image needs to already be loaded!
	getDisplayImage(){return this.displayImage;}

	getUnscaledHeight(){return this.displayImage.height;}
	getUnscaledWidth(){return this.displayImage.width;}

	/**
	 * Getters and setters
	 */
	getLoaded () { return this.loaded; }
	setLoaded (loaded) { this.loaded = loaded; }

	getVisible () { return this.visible; }
	setVisible (visible) { this.visible = visible; }

	getPosition () { return this.postion; }
	setPosition (position) { this.postion = position; }

	getPivotPoint () { return this.pivotPoint; }
	setPivotPoint (pivotPoint) { this.pivotPoint = pivotPoint; }

	getScaleX () { return this.scaleX; }
	setScaleX (scaleX) { this.scaleX = scaleX; }

	getScaleY () { return this.scaleY; }
	setScaleY (scaleY) { this.scaleY = scaleY; }

	getRotation () { return this.rotation; }
	setRotation (rotation) { this.rotation = rotation; }

	getAlpha () { return this.alpha; }
	setAlpha (alpha) { this.alpha = alpha; }
}