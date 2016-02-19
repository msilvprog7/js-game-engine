"use strict";

class Matrix{
	constructor(twoDimArray) {
		this.matrix = twoDimArray;
		this.n = twoDimArray.length;
		this.m = twoDimArray[0].length;
	}

	multiply(otherMatrix) {
		var matrix1 = this.matrix,
			n1 = this.n,
			m1 = this.m,
			matrix2 = otherMatrix.matrix,
			n2 = otherMatrix.n,
			m2 = otherMatrix.m;

		if(m1 !== n2) {
			console.error("You can't multiply a " + n1 + "x" + m1 + " matrix with a " + n2 + "x" + m2 + " matrix...");
			return;
		}

		var result = new Array(n1);
		
		for (var r = 0; r < n1; r++) {
			result[r] = new Array(m2);

			for (var c = 0; c < m2; c++) {
				result[r][c] = 0;
				for(var i = 0; i < m1; i++) {
					result[r][c] += matrix1[r][i] * matrix2[i][c];
				}
			}
		}
		return new Matrix(result);
	}

	getPoint() {
		if (this.n !== 3 || this.m !== 1) {
			return undefined;
		}
		return new Point(this.matrix[0][0], this.matrix[1][0]);
	}
}

class Point{
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	getMatrix() {
		return new Matrix([
				[this.x],
				[this.y],
				[1.0]
			]);
	}
}

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

		// hitboxes
		this.hitbox = [];
		this.transformedHitbox = [];

		// hitboxes for matrices
		this.positionMatrix = new Matrix([
				[1.0, 0.0, this.position.x],
				[0.0, 1.0, this.position.y],
				[0.0, 0.0, 1.0]
			]);
		this.rotationMatrix = new Matrix([
				[Math.cos(this.rotation), -Math.sin(this.rotation), 0.0],
				[Math.sin(this.rotation), Math.cos(this.rotation), 0.0],
				[0.0, 0.0, 1.0]
			]);
		this.scaleMatrix = new Matrix([
				[this.scaleX, 0.0, 0.0],
				[0.0, this.scaleY, 0.0],
				[0.0, 0.0, 1.0]
			]);
		this.computeTransformMatrix();

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
  				t.setHitBoxFromImage(t.displayImage);
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

				// Test drawing hitbox
				// this.drawHitbox(g);
			}
			this.reverseTransformations(g);

			// Test drawing transformed hitbox
			this.drawTransformedHitbox(g);
		}
	}

	/**
	  * Test to draw the hit box
	  */
	drawHitbox(g) {
		if (this.hitbox.length <= 0) {
			return;
		}

		g.save();

		g.beginPath();
		g.moveTo(this.hitbox[0].x, this.hitbox[0].y);
		this.hitbox.slice(1).forEach(point => g.lineTo(point.x, point.y));
		g.lineTo(this.hitbox[0].x, this.hitbox[0].y);
		g.stroke();

		g.restore();
	}

	/**
	  * Test to draw the transformed hit box
	  */
	drawTransformedHitbox(g) {
		if (this.transformedHitbox.length <= 0) {
			return;
		}

		g.save();

		g.beginPath();
		g.moveTo(this.transformedHitbox[0].x, this.transformedHitbox[0].y);
		this.transformedHitbox.slice(1).forEach(point => g.lineTo(point.x, point.y));
		g.lineTo(this.transformedHitbox[0].x, this.transformedHitbox[0].y);
		g.stroke();

		g.restore();
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
	setPosition (position) { 
		this.position.x = position.x; 
		this.position.y = position.y;
		this.computePositionMatrix();
	}

	getPivotPoint () { return {x: this.pivotPoint.x, y: this.pivotPoint.y}; }
	setPivotPoint (pivotPoint) { this.pivotPoint.x = pivotPoint.x; this.pivotPoint.y = pivotPoint.y; }

	getScaleX () { return this.scaleX; }
	setScaleX (scaleX) {
		this.pivotPoint.x *= Math.abs(scaleX / this.scaleX);
		this.scaleX = scaleX; 
		this.computeScaleMatrix();
	}

	getScaleY () { return this.scaleY; }
	setScaleY (scaleY) {
		this.pivotPoint.y *= Math.abs(scaleY / this.scaleY);
		this.scaleY = scaleY;
		this.computeScaleMatrix();
	}

	setScale (scale) {
		this.setScaleX(scale);
		this.setScaleY(scale);
		this.computeScaleMatrix();
	}

	getRotation () { return this.rotation; }
	setRotation (rotation) { 
		this.rotation = rotation;
		this.computeRotationMatrix();
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

	computePositionMatrix() {
		this.positionMatrix = new Matrix([
				[1.0, 0.0, this.position.x],
				[0.0, 1.0, this.position.y],
				[0.0, 0.0, 1.0]
			]);
		this.computeTransformMatrix();
	}

	computeScaleMatrix() {
		this.scaleMatrix = new Matrix([
				[this.scaleX, 0.0, 0.0],
				[0.0, this.scaleY, 0.0],
				[0.0, 0.0, 1.0]
			]);
		this.computeTransformMatrix();
	}

	computeRotationMatrix() {
		this.rotationMatrix = new Matrix([
				[Math.cos(this.rotation), -Math.sin(this.rotation), 0.0],
				[Math.sin(this.rotation), Math.cos(this.rotation), 0.0],
				[0.0, 0.0, 1.0]
			]);
		this.computeTransformMatrix();
	}

	computeTransformMatrix() {
		// Compute transformation matrix
		this.transformMatrix = this.positionMatrix.multiply(this.rotationMatrix.multiply(this.scaleMatrix));

		// Update points in transformed hit box
		this.transformedHitbox = this.hitbox.map(point => this.transformPointWithMatrix(point));
		console.log(this.transformedHitbox);
	}

	transformPointWithMatrix(point) {
		return this.transformMatrix.multiply(point.getMatrix()).getPoint();
	}

	setHitBox(pointList) {
		this.hitbox = pointList;
	}

	setHitBoxFromImage(image) {
		this.hitbox = [new Point(0, 0), 
			new Point(image.width, 0), 
			new Point(image.width, image.height), 
			new Point(0, image.height)];
		this.transformedHitbox = this.hitbox.map(point => this.transformPointWithMatrix(point));
	}

	getHitBox() {
		return this.hitbox;
	}

	getTransformedHitBox() {
		return this.transformedHitBox;
	}

	collidesWith(otherDO) {

	}
	
}