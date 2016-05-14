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
  }
};
