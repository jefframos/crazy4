import PIXI from 'pixi.js';

export default class Screen extends PIXI.Container{
	label = "";
	entityList = [];
	updateable = false;
	nextScreen;
	screenManager;
	label;
	built;
	constructor(label){  		
		super();
		this.label = label;
	}
	addChild(entity){
		super.addChild(entity);
		this.entityList.push(entity);
	}
	addOnUpdateList(entity){
		for(let i = 0; i < this.entityList.length; i++){
			if(this.entityList[i] == entity){
				return;
			}
		}  
		this.entityList.push(entity);
	}
	//update all childs
	update(delta){
		if(!this.updateable){
			return;
		}
		for(let i = 0; i < this.entityList.length; i++){			
			if(this.entityList[i].update){
				this.entityList[i].update(delta);
			}
		}
		for(let i = 0; i < this.entityList.length; i++){
			if(this.entityList[i].kill){				
				if(this.entityList[i].parent){
					this.entityList[i].parent.removeChild(this.entityList[i]);
				}
				this.entityList.splice(i, 1);
			}
		}
	}

	//NPM RUN DEV
	destroy(){
		this.built = false;
		if(this.entityList){
			for(let i = 0; i < this.entityList.length; i++){
				if(this.entityList[i].parent){
					this.entityList[i].parent.removeChild(this.entityList[i]);
				}
			}
		}
		this.entityList = [];
	}
	build(){
		this.built = true;
	}
	transitionIn(){
		console.log('in');
		this.updateable = true;
		this.endTransitionIn();
	}
	endTransitionIn(){
		console.log('endIn');
	}
	transitionOut(nextScreen){
		console.log('out');
		this.nextScreen = nextScreen;
		this.endTransitionOut();
	}
	endTransitionOut(){
		console.log('endOut');
		this.updateable = false;
		this.screenManager.forceChange(this.nextScreen.label);
		this.destroy();
	}
}
