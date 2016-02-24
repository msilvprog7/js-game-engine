"use strict"

var HITBOX = {
	SIDES: ["top", "right", "bottom", "left"]
};

class Hitbox {
	constructor(parent, points) {
		if (points !== undefined) {
			this.rawHitbox = {
				tl: points[0],
				tr: points[1],
				br: points[2],
				bl: points[3]	
			};
		} else {
			this.rawHitbox = {};
		}
		this.hitbox = {};
		this.parent = parent;
		this.update();
		this.collidingWith = [];
	} 

	isCollidingWith(id) {
		for(let i = 0; i < this.collidingWith.length; i++) {			
			if (this.collidingWith[i].id === id) {
				return this.collidingWith[i].collisions;
			}
		}
		return false;
	}

	// getNormals(id) {
	// 	var normalToOther = null,
	// 		normalToMe = null;

	// 	for (let i = 0; i < this.collidingWith.length; i++) {
	// 		if (this.collidingWith[i].id === id) {
	// 			normalToOther = this.collidingWith[i].normalToOther;
	// 			normalToMe = this.collidingWith[i].normalToMe;
	// 			break;
	// 		}
	// 	}

	// 	return {normalToOther: normalToOther, normalToMe: normalToMe};
	// }
	addCollidingWith(id, collisions) {
		if (!this.collidingWith.some(x => x.id === id)) {
			this.collidingWith.push({id: id, collisions: collisions});
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

	setHitbox(points) {
		if (Object.keys(this.rawHitbox).length > 0 || points.length !== 4) {
			return;
		}

		this.rawHitbox = {
				tl: points[0],
				tr: points[1],
				br: points[2],
				bl: points[3]	
			};
		this.update();
	}

	setHitboxFromImage(image) {
		if (Object.keys(this.rawHitbox).length > 0) {
			return;
		}

		this.rawHitbox = {
			tl: new Point(0, 0), 
			tr: new Point(image.width, 0),		
			br: new Point(image.width, image.height), 
			bl: new Point(0, image.height)			
		};
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
		if (Object.keys(box).length <= 0) {
			return;
		}
		g.save();
		g.beginPath();
		g.moveTo(box.tl.x, box.tl.y);
		g.lineTo(box.tr.x, box.tr.y);
		g.lineTo(box.br.x, box.br.y);
		g.lineTo(box.bl.x, box.bl.y);
		g.lineTo(box.tl.x, box.tl.y);
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
		this.transformMatrix = this.preRotationPositionMatrix.multiply(this.postRotationPositionMatrix).multiply(
			this.preScaleTranslationMatrix).multiply(this.scaleMatrix);

		if (Object.keys(this.rawHitbox).length !== 4) {
			return;
		}

		// Update points in transformed hit box
		this.hitbox = {
			tl: this.transformPointWithMatrix(this.rawHitbox.tl),
			tr: this.transformPointWithMatrix(this.rawHitbox.tr),
			br: this.transformPointWithMatrix(this.rawHitbox.br),
			bl: this.transformPointWithMatrix(this.rawHitbox.bl)
		};
	}

	transformPointWithMatrix(point) {
		return this.transformMatrix.multiply(point.getMatrix()).getPoint();
	}
}