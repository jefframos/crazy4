import plugins from './plugins';
import config  from './config';
import Game from './Game';
import EffectLayer from './game/EffectLayer';
import GameScreen from './game/screen/GameScreen';
import InitScreen from './game/screen/InitScreen';
import ScreenManager from './screenManager/ScreenManager';


PIXI.loader
	.add('./assets/frontTVDisplacement.jpg')
	.add('./assets/glitch1.jpg')
	.add('./assets/frontTVSoft.png')
	.add('./assets/particle1.png')
	.add('./assets/particle2.png')
	.add('./assets/logo.png')
	.add('./assets/inGameBg1.png')
	.add('./assets/fonts/super_smash_tv-webfont.woff')
	.add('./assets/fonts/super_smash_tv-webfont.woff2')
	.add('./assets/fonts/stylesheet.css')
	.add('./assets/fonts/specimen_files/specimen_stylesheet.css')
	.load(configGame);

function configGame(){

	var type = window.location.hash.substr(1);
	if(type == "NOJUICY"){
		config.isJuicy = 0;
	}

	let game = new Game(config);

	//create screen manager
	let screenManager = new ScreenManager();
	//add screens
	let gameScreen = new GameScreen("GAME");
	let initScreen = new InitScreen("INIT");
	//add effect layer
	let effectLayer = new EffectLayer(screenManager);
	game.stage.addChild(screenManager);

	config.effectsLayer = effectLayer;
	screenManager.addScreen(gameScreen);
	screenManager.addScreen(initScreen);
	//change to init screen
	screenManager.forceChange("INIT");
	

	if(!config.isJuicy == 0){
		game.stage.addChild(effectLayer);
    }

	game.start();
}
