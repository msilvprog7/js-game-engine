"use strict";

/**
 * A very basic display object for a javascript based gaming engine
 * 
 * */
class DisplayObject extends EventDispatcher{
	
	constructor(id, filename){
		super();
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
		this.parent = undefined;
	}

	/**
	 * Loads the image, sets a flag called 'loaded' when the image is ready to be drawn
	 */
	loadImage(filename){
		if(filename) {
			var t = this;
			this.displayImage = new Image();
  			this.displayImage.onload = function(){
  				t.loaded = true;
  			};
  			this.displayImage.src = 'resources/' + filename;
		}
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
		if(this.displayImage && this.visible){
			this.applyTransformations(g);
			if(this.loaded) {
				g.drawImage(this.displayImage,0,0);
			}
			this.reverseTransformations(g);
		}
	}

	/**
	 * Applies transformations for this display object to the given graphics
	 * object
	 * */
	applyTransformations(g) {
		g.save();
		g.translate(this.position.x + this.pivotPoint.x, this.position.y + this.pivotPoint.y);
		g.rotate(this.rotation);
		g.translate(-this.pivotPoint.x, -this.pivotPoint.y);

		// Adjust negatives to flip in place
		if (this.scaleX < 0) {
			g.translate(Math.abs(this.scaleX) * this.displayImage.width, 0);
		}
		if (this.scaleY < 0) {
			g.translate(0, Math.abs(this.scaleY) * this.displayImage.height);
		}
		g.scale(this.scaleX, this.scaleY);

		g.globalAlpha = this.alpha;
	}

	/**
	 * Reverses transformations for this display object to the given graphics
	 * object
	 * */
	reverseTransformations(g) {
		g.restore();
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

	getPosition () { return {x: this.position.x, y: this.position.y}; }
	setPosition (position) { this.position.x = position.x; this.position.y = position.y; }

	getPivotPoint () { return this.pivotPoint; }
	setPivotPoint (pivotPoint) { this.pivotPoint.x = pivotPoint.x; this.pivotPoint.y = pivotPoint.y; }

	getScaleX () { return this.scaleX; }
	setScaleX (scaleX) {
		this.pivotPoint.x *= Math.abs(scaleX / this.scaleX);
		this.scaleX = scaleX; 
	}

	getScaleY () { return this.scaleY; }
	setScaleY (scaleY) {
		this.pivotPoint.y *= Math.abs(scaleY / this.scaleY);
		this.scaleY = scaleY; 
	}

	setScale (scale) {
		this.setScaleX(scale);
		this.setScaleY(scale);
	}

	getRotation () { return this.rotation; }
	setRotation (rotation) { this.rotation = rotation; }

	getAlpha () { return this.alpha; }
	setAlpha (alpha) { this.alpha = alpha; }

	getParent () { return this.parent; }
	setParent (parent) { this.parent = parent; }

	getAspectRatio () {
		return this.getUnscaledWidth() / this.getUnscaledHeight();
	}

	getWidth () {
		return (this.displayImage !== undefined) ? this.displayImage.width * this.scaleX : -1;
	}

	getHeight() {
		return (this.displayImage !== undefined) ? this.displayImage.height * this.scaleY : -1;
	}

	getUnscaledWidth () {
		return (this.displayImage !== undefined) ? this.displayImage.width : -1;
	}

	getUnscaledHeight() {
		return (this.displayImage !== undefined) ? this.displayImage.height : -1;
	}
	
}