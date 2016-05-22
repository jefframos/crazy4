import PIXI from 'pixi.js';

export default class ScreenManager extends PIXI.Container{
	
	currentScreen = null;
	screenList = [];

	constructor(){
		super();
	}
	addScreen(screen){
		this.screenList.push(screen);
		this.currentScreen = screen;
		screen.screenManager = this;
	}
	change(screenLabel){
		let tempScreen;
		for(let i = 0; i < this.screenList.length; i++){
			if(this.screenList[i].label == screenLabel){
				tempScreen = this.screenList[i];
			}
		}
		if(this.currentScreen){
			this.currentScreen.transitionOut(tempScreen);
		}
	}
	//change between screens
	forceChange(screenLabel){
		if(this.currentScreen && this.currentScreen.parent){
			this.removeChild(this.currentScreen);
		}
		let tempScreen;
		for(let i = 0; i < this.screenList.length; i++){
			if(this.screenList[i].label == screenLabel){
				tempScreen = this.screenList[i];
			}
		}
		this.currentScreen = tempScreen;
		this.currentScreen.build();
		this.currentScreen.transitionIn();
		this.addChild(this.currentScreen);	
	}
	//update manager
	update(delta){
		if(this.screenList != null){
			this.currentScreen.update(delta);
		}
	}
}
