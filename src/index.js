import plugins from './plugins';
import config  from './config';
import Game from './Game';
import Bunny from './Bunny';
import EffectLayer from './game/EffectLayer';
import GameScreen from './game/screen/GameScreen';
import InitScreen from './game/screen/InitScreen';
import ScreenManager from './screenManager/ScreenManager';


PIXI.loader
	.add('./assets/frontTVDisplacement.jpg')
	.add('./assets/glitch1.jpg')
	.add('./assets/frontTVSoft.png')
	.add('./assets/logo.png')
	.add('./assets/fonts/super_smash_tv-webfont.woff')
	.add('./assets/fonts/super_smash_tv-webfont.woff2')
	.add('./assets/fonts/stylesheet.css')
	.add('./assets/fonts/specimen_files/specimen_stylesheet.css')
	.load(configGame);

function configGame(){
	let game = new Game(config);


	let screenManager = new ScreenManager();
	let gameScreen = new GameScreen("GAME");
	let initScreen = new InitScreen("INIT");

	screenManager.addScreen(gameScreen);
	screenManager.addScreen(initScreen);
	screenManager.forceChange("INIT");

	

	let effectLayer = new EffectLayer(screenManager);
	game.stage.addChild(screenManager);
	game.stage.addChild(effectLayer);

	config.effectsLayer = effectLayer;

	game.start();
}
