"use strict"

//let _singleton = Symbol();

class SoundManager{
	// constructor(singletonToken) {
	// 	if(_singleton !== singletonToken) {
	// 		throw new Error('Cannot instantiate directly');
	// 	}
		// this.sounds = {};
		// this.music = {};
		// this.currentSound = undefined;
		// this.currentMusic = undefined;
	// }

	// static get instance() {
	// 	if(!this[_singleton]) {
	// 		this[_singleton] = new SoundManager(_singleton);
	// 	}
	// 	return this[_singleton];
	// }
	constructor() {
		this.sounds = {};
		this.music = {};
		this.currentSound = undefined;
		this.currentMusic = undefined;
	}
	loadSoundEffect(id, filename){
		var sound = new Audio();
		sound.src = "resources/audio/" + filename;
		this.sounds[id] = sound;
	}
	playSoundEffect(id){
		if(this.sounds[id] === undefined) {console.error("Sound does not exist");}
		this.currentSound = this.sounds[id];
		this.currentSound.load();
		this.currentSound.play();
	}
	loadMusic(id, filename, looping){
		var m = new Audio();
		m.src = "resources/audio/" + filename;
		m.loop = typeof looping !== "boolean" ? false : looping;
		this.music[id] = m;
	}
	playMusic(id){
		if(this.music[id] === undefined) {console.error("Music does not exist");}
		if(this.currentMusic !== undefined) {
			this.currentMusic.pause();			
		}
		this.currentMusic = this.music[id];
		this.currentMusic.load();
		this.currentMusic.play();
	}
	pauseMusic() {}
	unpauseMusic() {}
}

//export default new SoundManager();