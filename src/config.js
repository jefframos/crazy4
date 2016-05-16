export default {
  width: 800,
  height: 450,
  bounds: {x:60, y:50},
  hitCorrection:{x:30,y:50},  
  buttonRadius: 30,
  debugAlpha: 0,
  webgl: true, //false for 2dContext, true for autoDetectRenderer
  rendererOptions: {
    //pixi rendererOptions
    antialias: true,
    backgroundColor : 0x000000
  },
  palette: {  	
    colors80:[
	    0xFFF001, //yellow
	    0x99FC20, //green
	    0x00E6FE, //light blue
	    0xFD1999 //pink
    ],
    initScreen80:0xA10EEC,
    gameScreen80: 0xFFF001,
    effectsLayer:null,
  },  
};
