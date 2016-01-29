"use strict";

/**
 * A very basic display object for a javascript based gaming engine
 * 
 * */
class DisplayObject{
	
	constructor(id, filename){
		this.id = id;
		this.loaded = false;
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
}

