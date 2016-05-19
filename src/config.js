export default {
  width: 800,
  height: 450,
  bounds: {x:60, y:50},
  hitCorrection:{x:20,y:50},  
  buttonRadius: 30,
  debugAlpha: 0,
  isJuicy: 1,
  webgl: true, //false for 2dContext, true for autoDetectRenderer
  rendererOptions: {
    //pixi rendererOptions
    antialias: true,
    backgroundColor : 0x000000
  },
  palette: {  	
    colors80:[
	    // 0xFFF001, //yellow
	    0x2A0E79, //green
	    0x44A6C6, //light blue
	    0xDB1993 //pink
    ],
    initScreen80:0xDB1993,
    gameScreen80: 0xDB1993,
    effectsLayer:null,
  },
};
