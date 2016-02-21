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
		this.physics = new Physics();
		this.position = new Point(0.0, 0.0);
		this.pivotPoint = new Point(0.0, 0.0);
		this.scaleX = 1.0;
		this.scaleY = 1.0;
		this.rotation = 0.0; // Radians
		this.alpha = 1.0;
		this.hitbox = new Hitbox(this);

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
  				// Set default hitbox for single images
  				t.hitbox.setHitboxFromImage(t.displayImage);
  			};
  			this.displayImage.src = 'resources/images/' + filename;
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

				// Test drawing hitbox
				// this.drawHitbox(g);
			}
			this.reverseTransformations(g);

			// Test drawing transformed hitbox
			this.drawTransformedHitbox(g);
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

	setHasPhysics(p) {this.physics.hasPhysics = p;}
	getHasPhysics() { return this.physics.hasPhysics;}

	setPhysicsProperty(prop, value) {
		if(this.physics[prop]) {
			this.physics[prop] = value;
		}
	}
	updatePhysics() {
		if(this.physics.hasPhysics) {
			this.physics.update();
		}
	}

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
	setPosition (position) { 
		this.position.x = position.x; 
		this.position.y = position.y;
		this.hitbox.update();
	}

	getPivotPoint () { return {x: this.pivotPoint.x, y: this.pivotPoint.y}; }
	setPivotPoint (pivotPoint) { 
		this.pivotPoint.x = pivotPoint.x; 
		this.pivotPoint.y = pivotPoint.y;
		this.hitbox.update();
	}

	getScaleX () { return this.scaleX; }
	setScaleX (scaleX) {
		this.pivotPoint.x *= Math.abs(scaleX / this.scaleX);
		this.scaleX = scaleX;
		this.hitbox.update();
	}

	getScaleY () { return this.scaleY; }
	setScaleY (scaleY) {
		this.pivotPoint.y *= Math.abs(scaleY / this.scaleY);
		this.scaleY = scaleY;
		this.hitbox.update();

	}

	setScale (scale) {
		this.setScaleX(scale);
		this.setScaleY(scale);
	}

	getRotation () { return this.rotation; }
	setRotation (rotation) { 
		this.rotation = rotation;
		this.hitbox.update();
	}

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

	getHitBox() {
		return this.hitbox;
	}	

	collidesWith(otherDO) {
		//Does no consider collision with child to be a hit
		var hitbox1 = this.hitbox.hitbox,
			hitbox2 = otherDO.hitbox.hitbox;

		if (hitbox1.length === 0 || hitbox2.length === 0) {
			return false;
		}
		
		var lines1 = hitbox1.map((point, i) => new Line(point, hitbox1[(i + 1) % hitbox1.length])),
			lines2 = hitbox2.map((point, i) => new Line(point, hitbox2[(i + 1) % hitbox2.length]));
		for(var i = 0; i < lines1.length; i++) {
			for(var j = 0; j < lines2.length; j++) {
				if(lines1[i].intersects(lines2[j])) { 
					this.dispatchEvent(EVENTS.COLLISION);
				}
			}
		}
	}
	
}