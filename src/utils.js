import config  from './config';
export default {  
  getRandomValue(array, exception){
  	let value = array[Math.floor(Math.random() * array.length)];
  	if(exception){
  	let equal = true;	
  		while (equal){
  			equal = false;
  			for(let i = 0; i < exception.length; i++){
				if(exception[i] == value){
					equal = true;
				}
			}
			if(equal){
  				value = array[Math.floor(Math.random() * array.length)]
  			}
  		}
  	}
  	return value
  },
  setGameScreen80(color){
  	config.palette.gameScreen80 = color;
  },
  setInitScreen80(color){
  	config.palette.initScreen80 = color;
  },
  applyPositionCorrection(element){
    if(config.isJuicy == 0){
      return;
    }
  	element.position.x += config.hitCorrection.x;
  	element.position.y += config.hitCorrection.y;
  },
  addToContainer(element){
  	let elementContainer = new PIXI.Container()
  	elementContainer.addChild(element);
  	return elementContainer;
  },
  centerPivot(element){
  	element.pivot.x = element.width / 2;
  	element.pivot.y = element.height / 2;
  	element.position.x += element.width / 2;
  	element.position.y += element.height / 2;
  },
  addMockObject(element){
    if(config.isJuicy == 0){
      return;
    }
  	let alphaBG2 = new PIXI.Graphics()
    alphaBG2.beginFill(0);	    
    alphaBG2.drawRect(-element.width/2,-element.height/2,element.width,element.height );
    alphaBG2.alpha = config.debugMockobjectsAlpha;
    element.addChild( (alphaBG2) );
  }
};
