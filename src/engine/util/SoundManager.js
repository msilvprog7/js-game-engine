"use strict";

let _soundManagerInstance = null;

class SoundManager{

	constructor(singletonToken) {
		if(!_soundManagerInstance) {
			_soundManagerInstance = this;

			this.sounds = {};
			this.music = {};
			this.currentSound = undefined;
			this.currentMusic = undefined;
		}

		return _soundManagerInstance;
	}

	loadSound(id, filename) {
		var sound = new Audio();
		sound.src = "resources/audio/" + filename;
		this.sounds[id] = sound;
	}

	playSound(id, options) {
		if(this.sounds[id] === undefined) {console.error("Sound does not exist [" + id + "]");}
		this.currentSound = this.sounds[id];
		this.currentSound.load();
		options = options || {};
		if(options.pauseMusic) {
			let that = this;
			that.pauseMusic();
				if(options.unpauseMusic !== false) {
					that.currentSound.addEventListener('ended', function() { 
					that.unpauseMusic(); 
					that.currentSound.removeEventListener('ended');
				}); 
			}			
		}
		this.currentSound.play();
	}

	loadMusic(id, filename, looping) {
		var m = new Audio();
		m.src = "resources/audio/" + filename;
		m.loop = typeof looping !== "boolean" ? false : looping;
		this.music[id] = m;
	}

	playMusic(id) {
		if(this.music[id] === undefined) {console.error("Music does not exist");}
		if(this.currentMusic !== undefined) {
			this.currentMusic.pause();			
		}
		this.currentMusic = this.music[id];
		this.currentMusic.load();
		this.currentMusic.play();
	}

	pauseMusic() {
		if (this.currentMusic !== undefined) {
			this.currentMusic.pause();
		}
	}

	unpauseMusic() {
		if (this.currentMusic !== undefined) {
			this.currentMusic.play();
		}
	}

	hasSound(soundName) {
		return this.sounds[soundName] !== undefined;
	}

}
