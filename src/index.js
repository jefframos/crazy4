import plugins from './plugins';
import config  from './config';
import Game from './Game';
import Bunny from './Bunny';
import GameScreen from './game/screen/GameScreen';
import InitScreen from './game/screen/InitScreen';
import ScreenManager from './screenManager/ScreenManager';

let game = new Game(config);


let screenManager = new ScreenManager();
let gameScreen = new GameScreen("GAME");
let initScreen = new InitScreen("INIT");

screenManager.addScreen(gameScreen);
screenManager.addScreen(initScreen);
screenManager.forceChange("INIT");
//Add the bunny
//bunny.position.set(200,150);
//game.stage.addChild(bunny);
game.stage.addChild(screenManager);

game.start();
