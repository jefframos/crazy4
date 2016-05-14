export default {
  width: 350,
  height: 600,
  buttonRadius: 30,
  webgl: true, //false for 2dContext, true for autoDetectRenderer
  rendererOptions: {
    //pixi rendererOptions
    antialias: true,
    backgroundColor : 0x1099bb
  },
  palette: {  	
    colors80:[
	    0xFFF001, //yellow
	    0x99FC20, //green
	    0x00E6FE, //light blue
	    0xFD1999 //pink
    ],
    initScreen80:0xA10EEC,
    gameScreen80: 0xFFF001
  },  
};
