import PIXI from 'pixi.js';
import TweenLite from 'gsap';
import config  from '../../config';
import utils  from '../../utils';
import Screen from '../../screenManager/Screen'
import Bunny from '../../Bunny';

export default class GameScreen extends Screen{
	constructor(label){
		super(label);
	}
	build(){
		super.build();

		this.background = new PIXI.Graphics();
		this.background.beginFill( config.palette.gameScreen80 );
	    this.background.drawRect( 0, 0, config.width, config.height);
		this.addChild(this.background);

	    this.screenContainer = new PIXI.Container();
		this.addChild(this.screenContainer);

		this.backButton = 	this.createButton ( );
	    this.addChild(this.backButton)
	    this.addChild(this.screenContainer)

	    this.backButton.position.set(config.buttonRadius, config.buttonRadius)
	    TweenLite.from(this.backButton.scale, 1, {x:0,y:0, ease:"easeOutElastic"});
	    this.backButton.on('tap', this.onButtonDown.bind(this)).on('click', this.onButtonDown.bind(this));
	}
	onButtonDown(test) {
		this.backButton.interactive = false;
		TweenLite.to(this.backButton.scale, 0.8, {x:50, onComplete: this.toGame, onCompleteScope: this});
		TweenLite.to(this.backButton.scale, 1, {y:50});
	}
	toGame(){
		this.screenManager.change("INIT");
	}

	update(delta){
		super.update(delta);
	}

	createButton ( ) {
	    let button = new PIXI.Container()
	    let bg = new PIXI.Graphics()
	    let color = utils.getRandomValue(config.palette.colors80, [config.palette.gameScreen80] );
	    bg.beginFill(color);
	    utils.setInitScreen80(color);
	    bg.drawCircle( 0, 0, config.buttonRadius );
	    button.addChild( bg )
	    button.interactive = true
	    button.buttonMode = true
	    return button
	}
}
