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
		if(options.volume && typeof options.volume === "number") {
			if(options.volume >= 0.0 && options.volume <= 1.0) {
				this.currentSound.volume = options.volume;
			} else {
				console.error("Volume option must be between 0 and 1");
			}
		}
		if(options.loop) {
			that.currentSound.addEventListener('ended', function() {
				that.playSound(id, options);
				that.currentSound.removeEventListener('ended');
			})
		}
		this.currentSound.play();
	}

	loadMusic(id, filename, looping) {
		var m = new Audio();
		m.src = "resources/audio/" + filename;
		m.loop = typeof looping !== "boolean" ? false : looping;
		this.music[id] = m;
	}

	playMusic(id, options) {
		if(options === undefined) { options = {}; }
		if(this.music[id] === undefined) {console.error("Music does not exist");}
		if(this.currentMusic !== undefined) {
			this.currentMusic.pause();			
		}
		this.currentMusic = this.music[id];
		this.currentMusic.load();
		if(options.startVolume && options.startVolume <= 1.0 && options.startVolume >= 0.0) {
			this.currentMusic.volume = options.startVolume;
		}
		this.currentMusic.play();
	}

	fadeMusic(nextMusic, options) {
		//Fades the current music out and fades next music in
		if(!this.hasMusic(nextMusic) || this.currentMusic === this.music[nextMusic]) {
			return;
		}
		if(options === undefined) { options = {}; }
		var fadeTime = 100,
			fadeOutAmount = 0.1,
			that = this,
			fadeOutAudio = setInterval(function () {

	        // Only fade if past the fade out point or not at zero already
	        if (that.currentMusic.volume !== 0.0) {	        	
	            if(that.currentMusic.volume >= fadeOutAmount) {
	            	that.currentMusic.volume -= fadeOutAmount;
	            } else {
	            	that.currentMusic.volume = 0.0;
	            }
	        }
	        // When volume at zero stop all the intervalling
	        if (that.currentMusic.volume === 0.0) {
	            clearInterval(fadeOutAudio);
	            let endVolume = (options.endMusicVolume) ? options.endMusicVolume : 1,
	            	fadeInAmount = endVolume / 10; 	
	            that.playMusic(nextMusic, {startVolume: 0.1});
	            var fadeInAudio = setInterval(function() {	 
	            	if(that.currentMusic.volume < endVolume) {
	            		if(that.currentMusic.volume <= (endVolume-fadeInAmount)) {
	            			that.currentMusic.volume += fadeInAmount;
	            		}
	            		else {
	            			that.currentMusic.volume = endVolume;
	            		}
	            	}
	            	if(that.currentMusic.volume >= endVolume) {
	            		clearInterval(fadeInAudio);
	            	}
	            }, 100);
	        }
	    }, 100);
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

	hasMusic(musicName) {
		return this.music[musicName] !== undefined;
	}

	getCurrentMusicId() {
		for(var id in this.music) {
			if(this.music[id] === this.currentMusic) {
				return id;
			}
		}
		return "";
	}

	setCurrentVolume(vol) {
		if(this.currentMusic !== undefined && typeof vol === "number" && vol <= 1.0 && vol >= 0.0) {
			this.currentMusic.volume = vol;
		}
	}

}
