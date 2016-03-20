"use strict";

/**
 * A very basic Sprite. For now, does not do anything.
 * 
 * */
class Sprite extends DisplayObjectContainer{
	
	constructor(id, filename){
		super(id, filename);
	}

	/**
	 * Invoked every frame, manually for now, but later automatically if this DO is in DisplayTree
	 */
	update(pressedKeys){
		super.update(pressedKeys);
	}

	/**
	 * Draws this image to the screen
	 */
	draw(g){
		super.draw(g);
	}
}

