"use strict"

class Hitbox {
	constructor(parent, points) {
		this.rawHitbox = points || [];
		this.hitbox = [];
		this.parent = parent;
		this.update();
		this.collidingWith = [];
	} 

	isCollidingWith(id) {
		return this.collidingWith.some(x => x.id === id);
	}
	addCollidingWith(id, normalToOther, normalToMe) {
		if (!this.collidingWith.some(x => x.id === id)) {
			this.collidingWith.push({id: id, normalToOther: normalToOther, normalToMe: normalToMe});
		}
	}
	removeCollidingWith(id) {
		for (let i = 0; i < this.collidingWith.length; i++) {
			if (this.collidingWith[i].id === id) {
				this.collidingWith.splice(i, 1);
				return;
			}
		}
	}

	getHitbox() {
		return this.hitbox;
	}

	getRawHitbox() {
		return this.rawHitbox;
	}

	setHitbox(pointList) {
		this.rawHitbox = pointList || this.rawHitbox;
		this.update();
	}

	setHitboxFromImage(image) {
		this.rawHitbox = [new Point(0, 0), 
			new Point(image.width, 0), 
			new Point(image.width, image.height/3),
			new Point(image.width+image.width/4, image.height/3),
			new Point(image.width+image.width/4, 2*image.height/3),		
			new Point(image.width, 2*image.height/3),				
			new Point(image.width, image.height), 
			new Point(0, image.height)
			];

		this.update();
	}

	update() {
		this.computeRotationMatrix();
		this.computePositionMatrix();
		this.computeScaleMatrix();
		this.computePivotPointMatrix();	
		this.computeTransformMatrix();
	}


	/**
	  * Test to draw the hit box
	  */
	drawHitbox(g, raw) {
		let box = raw ? this.rawHitbox : this.hitbox;
		if (box.length <= 0) {
			return;
		}
		g.save();
		g.beginPath();
		g.moveTo(box[0].x, box[0].y);
		box.slice(1).forEach(point => g.lineTo(point.x, point.y));
		g.lineTo(box[0].x, box[0].y);
		g.stroke();
		g.restore();
	}

	computePositionMatrix() {
		this.preRotationPositionMatrix = new Matrix([
				[1.0, 0.0, this.parent.position.x + this.parent.pivotPoint.x],
				[0.0, 1.0, this.parent.position.y + this.parent.pivotPoint.y],
				[0.0, 0.0, 1.0]
			]);
	}

	computePivotPointMatrix() {
		this.preRotationPositionMatrix = new Matrix([
				[1.0, 0.0, this.parent.position.x + this.parent.pivotPoint.x],
				[0.0, 1.0, this.parent.position.y + this.parent.pivotPoint.y],
				[0.0, 0.0, 1.0]
			]);
		this.postRotationPositionMatrix = new Matrix([
				[1.0, 0.0, -this.parent.pivotPoint.x],
				[0.0, 1.0, -this.parent.pivotPoint.y],
				[0.0, 0.0, 1.0]
			]);
	}

	computeScaleMatrix() {
		// Translate for in-place flip
		var additionalFlipX = (this.parent.scaleX < 0) ? Math.abs(this.parent.scaleX) * this.parent.displayImage.width : 0;
		var additionalFlipY = (this.parent.scaleY < 0) ? Math.abs(this.parent.scaleY) * this.parent.displayImage.height : 0;

		this.preScaleTranslationMatrix = new Matrix([
				[1.0, 0.0, additionalFlipX],
				[0.0, 1.0, additionalFlipY],
				[0.0, 0.0, 1.0]
			]);
		this.scaleMatrix = new Matrix([
				[this.parent.scaleX, 0.0, 0.0],
				[0.0, this.parent.scaleY, 0.0],
				[0.0, 0.0, 1.0]
			]);
	}

	computeRotationMatrix() {
		this.rotationMatrix = new Matrix([
				[Math.cos(this.parent.rotation), -Math.sin(this.parent.rotation), 0.0],
				[Math.sin(this.parent.rotation), Math.cos(this.parent.rotation), 0.0],
				[0.0, 0.0, 1.0]
			]);
	}

	computeTransformMatrix() {
		// Compute transformation matrix
		this.transformMatrix = this.preRotationPositionMatrix.multiply(this.rotationMatrix).multiply(this.postRotationPositionMatrix).multiply(
			this.preScaleTranslationMatrix).multiply(this.scaleMatrix);

		// Update points in transformed hit box
		this.hitbox = this.rawHitbox.map(point => this.transformPointWithMatrix(point));
	}

	transformPointWithMatrix(point) {
		return this.transformMatrix.multiply(point.getMatrix()).getPoint();
	}
}