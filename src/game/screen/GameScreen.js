import PIXI from 'pixi.js';
import TweenLite from 'gsap';
import config  from '../../config';
import utils  from '../../utils';
import Screen from '../../screenManager/Screen'

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
	    this.addChild(this.screenContainer)
	    

	    this.description = new PIXI.Text('The game will be here!',{font : '36px super_smash_tvregular', fill : 0xFFFFFF, align : 'right'});
	    this.screenContainer.addChild(this.description);
	    this.description.position.set(config.width/2 - this.description.width/2,config.height / 2 - this.description.height/2);

	    this.screenContainer.addChild(this.backButton)

	    this.backButton.position.set(config.buttonRadius + config.bounds.x, config.buttonRadius + config.bounds.y)
	    TweenLite.from(this.backButton.scale, 1, {x:0,y:0, ease:"easeOutElastic"});
	    this.backButton.on('tap', this.onButtonDown.bind(this)).on('click', this.onButtonDown.bind(this));
	}
	onButtonDown(test) {
		this.backButton.interactive = false;
		TweenLite.to(this.buttonShape.scale, 0.8, {x:50, onComplete: this.toGame, onCompleteScope: this});
		TweenLite.to(this.buttonShape.scale, 1, {y:50});
	}
	toGame(){

		this.screenManager.change("INIT");
	}

	update(delta){
		super.update(delta);
	}

	createButton ( ) {
	    let button = new PIXI.Container()
	    this.buttonShape = new PIXI.Graphics()
	    let color = utils.getRandomValue(config.palette.colors80, [config.palette.gameScreen80] );
	   	config.palette.initScreen80 = color;
	   	let alphaBG = new PIXI.Graphics()
	    alphaBG.beginFill(0);	    
	    alphaBG.drawCircle( -10, 10, config.buttonRadius );
	    alphaBG.alpha = 0.15;
	    utils.applyPositionCorrection(button.addChild( utils.addToContainer(alphaBG) ));

	    this.buttonShape.beginFill(color);	    
	    this.buttonShape.drawCircle( 0, 0, config.buttonRadius );
	    utils.applyPositionCorrection((button.addChild( this.buttonShape)));
	    //utils.applyPositionCorrection();
	    button.interactive = true
	    button.buttonMode = true

	    utils.addMockObject(button);

	    console.log(button);
	    return button
	}
}
