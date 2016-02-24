"use strict";

/**
 * A very clock for keeping time (between frames or otherwise)
 * 
 * */
class GameClock{
	
	constructor(){
		this.resetGameClock();
	}

	/**
	 * Returns Milliseconds passed since the last time resetGameClock() was called
	 */
	getElapsedTime(){
		return new Date().getTime() - this.start;
	}

	getTimedelta() {
		var newLastUpdate = new Date().getTime(),
			timedelta = newLastUpdate - this.lastUpdate;
		this.lastUpdate = newLastUpdate;
		return timedelta;
	}

	resetGameClock(){
		this.start = new Date().getTime();
		this.lastUpdate = this.start;
	}
}

