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
		this.position = new Point(0.0, 0.0);
		this.pivotPoint = new Point(0.0, 0.0);
		this.scaleX = 1.0;
		this.scaleY = 1.0;
		this.rotation = 0.0; // Radians
		this.alpha = 1.0;
		this.hitbox = new Hitbox(this);

		this.loadImage(filename);
		this.parent = undefined;
		this.hasPhysics = false;
		this.vX = 0;
		this.vY = 0;
		this.aX = 0;
		this.aY = 0;
		// this.gravity = 1;
		// this.terminalV = 15;
		// this.grounded = false;
		this.mass = 0;
		this.friction = 0;


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
	update(pressedKeys){
		if (this.hasPhysics) {
			// update velocity
			var pos = this.getPosition();
			this.vX += this.aX;
			this.vY += this.aY;
			if (this.vX > 0) {
				this.vX -= this.friction;
				this.vX = this.vX < 0 ? 0 : this.vX;
			} else if (this.vX < 0) {
				this.vX += this.friction;
				this.vX = this.vX > 0 ? 0 : this.vX;
			}
			if (this.vY > 0) {
				this.vY -= this.friction;
				this.vY = this.vY < 0 ? 0 : this.vY;
			} else if (this.vY < 0) {
				this.vY += this.friction;
				this.vY = this.vY > 0 ? 0 : this.vY;
			}

			this.setPosition({
				x: pos.x + this.vX,
				y: pos.y + this.vY
			});
		}
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

	setId(id){this.id = id;
		return this;}
	getId(){return this.id;}

	setDisplayImage(image){
		if(typeof image === "string") {
			this.loadImage(image);
		} else {
			this.displayImage = image;
		}
		return this;
	}
	getDisplayImage(){return this.displayImage;}

	getUnscaledHeight(){return this.displayImage.height;}
	getUnscaledWidth(){return this.displayImage.width;}

	/**
	 * Getters and setters
	 */
	getLoaded () { return this.loaded; }
	setLoaded (loaded) { this.loaded = loaded;
		return this; }

	getVisible () { return this.visible; }
	setVisible (visible) { this.visible = visible;
		return this; }

	getPosition () { return {x: this.position.x, y: this.position.y}; }
	setPosition (position) { 
		this.position.x = typeof position.x !== 'undefined' ? position.x : this.position.x; 
		this.position.y = typeof position.y !== 'undefined' ? position.y : this.position.y;
		this.hitbox.update();
		return this;
	}

	getPivotPoint () { return {x: this.pivotPoint.x, y: this.pivotPoint.y}; }
	setPivotPoint (pivotPoint) { 
		this.pivotPoint.x = pivotPoint.x; 
		this.pivotPoint.y = pivotPoint.y;
		this.hitbox.update();
		return this;
	}
	getNormalizedPivotPoint() {
		return {
			x: this.pivotPoint.x + this.position.x, 
			y: this.pivotPoint.y + this.position.y
		};
	}

	getScaleX () { return this.scaleX; }
	setScaleX (scaleX) {
		this.pivotPoint.x *= Math.abs(scaleX / this.scaleX);
		this.scaleX = scaleX;
		this.hitbox.update();
		return this;
	}

	getScaleY () { return this.scaleY; }
	setScaleY (scaleY) {
		this.pivotPoint.y *= Math.abs(scaleY / this.scaleY);
		this.scaleY = scaleY;
		this.hitbox.update();
		return this;
	}

	setScale (scale) {
		this.setScaleX(scale);
		this.setScaleY(scale);
		return this;
	}

	getRotation () { return this.rotation; }
	setRotation (rotation) { 
		this.rotation = rotation;
		this.hitbox.update();
		return this;
	}

	getAlpha () { return this.alpha; }
	setAlpha (alpha) { this.alpha = alpha;
		return this; }

	getParent () { return this.parent; }
	setParent (parent) { this.parent = parent;
		return this; }

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
			hitbox2 = otherDO.hitbox.hitbox,
			collided;

		if (Object.keys(hitbox1).length === 0 || Object.keys(hitbox2).length === 0) {
			return false;
		}

		collided = this.doOverlap(hitbox1.tl, hitbox2.tl, hitbox1.br, hitbox2.br);

		if (collided)
			this.dispatchEvent(EVENTS.COLLISION, [this, otherDO]);

		// maybe should be for all
		if (this.hasPhysics && collided) {
			if (MathUtil.approxEq(hitbox1.br.y, hitbox2.tl.y, 20)) {
				this.dispatchEvent(EVENTS.COLLISION_TOP);
			}
			if (MathUtil.approxEq(hitbox1.tl.y, hitbox2.br.y, 20)) {
				this.dispatchEvent(EVENTS.COLLISION_BOTTOM);
			}
			if (MathUtil.approxEq(hitbox1.tl.x, hitbox2.tr.x, 20)) {
				this.dispatchEvent(EVENTS.COLLISION_RIGHT);
			}
			if (MathUtil.approxEq(hitbox1.tr.x, hitbox2.tl.x, 20)) {
				this.dispatchEvent(EVENTS.COLLISION_LEFT);
			}
		}
		
		return collided;
	}

	outOfFrame(width, height, epsilon) {
		return (this.position.x < -epsilon || this.position.x > width+epsilon 
			|| this.position.y < -epsilon || this.position.y > height+epsilon); 
	}

	distanceTo(otherPoint) {
		let myPoint = this.getNormalizedPivotPoint();
		return Math.sqrt(Math.pow(otherPoint.x - myPoint.x, 2) + Math.pow(otherPoint.y - myPoint.y,2));
	}

	/**
	 * Detect overlap between two axis-aligned rectangles
	 * */
	doOverlap(l1, r1, l2, r2) {
		// left, right, up, down
		return !(l2.x < r1.x || l1.x > r2.x || l2.y < r1.y || l1.y > r2.y);
	}

	setHasPhysics(bool) {
		this.hasPhysics = bool;
		return this;
	}
	getHasPhysics() { return this.hasPhysics; }

	initCollisions() {
		var that = this;
		this.addEventListener(EVENTS.COLLISION_TOP, this, function () {
				that.vY = that.vY > 0 ? 0 : that.vY;
				that.aY = that.aY > 0 ? 0 : that.aY;
				//console.log(that.id + ": collision top");
			})
			.addEventListener(EVENTS.COLLISION_BOTTOM, this, function () {
				that.vY = that.vY < 0 ? 0 : that.vY;
				that.aY = that.aY < 0 ? 0 : that.aY;
				//console.log(that.id + ": collision btm");
			})
			.addEventListener(EVENTS.COLLISION_LEFT, this, function () {
				that.vX = that.vX > 0 ? 0 : that.vX;
				that.aX = that.aX > 0 ? 0 : that.aX;
				//console.log(that.id + ": collision left");
			})
			.addEventListener(EVENTS.COLLISION_RIGHT, this, function () {
				that.vX = that.vX < 0 ? 0 : that.vX;
				that.aX = that.aX < 0 ? 0 : that.aX;
				//console.log(that.id + ": collision right");
			});

	}
	
}
