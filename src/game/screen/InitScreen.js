import PIXI from 'pixi.js';
import TweenLite from 'gsap';
import config  from '../../config';
import utils  from '../../utils';
import Screen from '../../screenManager/Screen'
import Bunny from '../../Bunny';

export default class InitScreen extends Screen{
	screenContainer;
	background;
	logoTimer;
	constructor(label){
		super(label);
	}
	build(){
		super.build();
		this.background = new PIXI.Graphics();
		this.background.beginFill(config.palette.initScreen80);
	    this.background.drawRect( 0, 0, config.width, config.height);
		this.addChild(this.background);

		this.logo = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/logo.png'));
		this.addChild(this.logo);

		this.logo.anchor.set(0.5,1);
		this.logo.position.set(config.width/2, config.height/2);
		utils.applyPositionCorrection(this.logo);
		this.logoTimer = 0;
		this.sinAcum = 0;
		this.logoVelocity = 1;
		this.logo.interactive = true
	    this.logo.buttonMode = true
	    this.logo.on('tap', this.onLogoClick.bind(this))
	    	.on('click', this.onLogoClick.bind(this));

		this.screenContainer = new PIXI.Container();
		this.addChild(this.screenContainer);

		this.description = new PIXI.Text('by Jeff Ramos',{font : '24px super_smash_tvregular', fill : 0xFFFFFF, align : 'right'});
	    this.screenContainer.addChild(this.description);
	    this.description.position.set(config.width - this.description.width - config.bounds.x,config.height - config.bounds.y - 10);

	    this.descriptionLogo = new PIXI.Text('click on logo',{font : '24px super_smash_tvregular', fill : 0xFFFFFF, align : 'right'});
	    this.screenContainer.addChild(this.descriptionLogo);
	    this.descriptionLogo.position.set(config.width/2 - this.description.width/2,config.height / 2 - this.description.height/2 + 50);

		this.playButton = this.createButton();
	    this.addChild(this.screenContainer)
	    this.screenContainer.addChild(this.playButton)

	    this.playButton.position.set(config.width / 2, config.height / 1.5  + config.buttonRadius)
	    utils.centerPivot(this.playButton);
	    TweenLite.from(this.playButton.scale, 1, {delay:0.5, x:0,y:0, ease:"easeOutElastic"});
	    this.playButton.on('tap', this.onButtonDown.bind(this))
	    	.on('click', this.onButtonDown.bind(this));

	}
	onButtonDown(test) {
		TweenLite.killTweensOf(this.logo);
		TweenLite.killTweensOf(this.buttonShape, true);
		this.logo.tint = this.targetColor;
		this.buttonShape.tint = this.targetColor;
		this.logoTimer = 10;
		this.playButton.interactive = false;
		TweenLite.to(this.buttonShape.scale, 0.5, {x:25, y:25, onComplete: this.toGame, onCompleteScope: this});
	}
	toGame(){
		utils.setGameScreen80(this.targetColor);
		this.screenManager.change("GAME");
	}
	onLogoClick(){
		config.effectsLayer.shake(1,20,1.5);
	}
	update(delta){
		super.update(delta);

		this.logo.position.y += this.logoVelocity;
		this.logoVelocity = Math.sin(this.sinAcum+=0.3);
		if(this.logoTimer <= 0){
			this.targetColor = utils.getRandomValue(config.palette.colors80, [this.logo.tint,config.palette.initScreen80]);
			TweenLite.to(this.logo, 0.8, {tint:this.targetColor});
			TweenLite.to(this.buttonShape, 0.8, {tint:this.targetColor});
			this.logoTimer = 1;
		}else{
			this.logoTimer -= delta;
		}
	}

	createButton ( ) {
	    let button = new PIXI.Container()
	    this.buttonShape = new PIXI.Graphics()
	    let color = 0xFFFFFF;
	   
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
