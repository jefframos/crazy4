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
		console.log(screenLabel);
		this.currentScreen.build();
		this.currentScreen.transitionIn();
		this.addChild(this.currentScreen);	
	}
	//update manager
	update(delta){
		if(this.screenList != null){
			// for(let i = 0; i < this.screenList.length; i++){
			// 	if(this.screenList[i].update){
			// 		this.screenList[i].update(delta);
			// 	}
			// }
			this.currentScreen.update(delta);
		}
	}
}
