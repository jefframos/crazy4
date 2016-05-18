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

		
	    this.addChild(this.screenContainer)
	    
	    this.timerMax = 5;
	    this.timer = this.timerMax;
	    this.description = new PIXI.Text('0',{font : '100px super_smash_tvregular', fill : 0xFFFFFF, align : 'right', dropShadow:true, dropShadowColor:'#666666'});
	    this.screenContainer.addChild(this.description);
	    this.description.position.set(config.width/2 - this.description.width/2, -30);
	    utils.applyPositionCorrection(this.description);


	    this.gameContainer = new PIXI.Container();
	    this.screenContainer.addChild(this.gameContainer);
	    this.gameContainerSinAcum = 0;
	    this.gameContainerCosAcum = 0;
		this.gameContainerVelocity = {x:0,y:0};

	    this.gameMatrix = [];
	    this.entityMatrix = [];
	    this.configGameMatrix(5,9);
	    this.drawMatrix();

	    this.glichValue = 1;


	    this.backButton = this.createButton ( );
	    this.screenContainer.addChild(this.backButton)

	    this.backButton.position.set(config.buttonRadius + config.bounds.x, config.buttonRadius + config.bounds.y)
	    TweenLite.from(this.backButton.scale, 1, {x:0,y:0, ease:"easeOutElastic"});
	    this.backButton.on('tap', this.onBackCallback.bind(this)).on('click', this.onBackCallback.bind(this));

	}
	configGameMatrix(i,j) {
		let tempArray = [];
		for (let jj = 0; jj < j; jj++) {
			tempArray = [];
			for (let ii = 0; ii < i; ii++) {
				tempArray.push(0);
			}
			this.gameMatrix.push(tempArray);
			this.entityMatrix.push(tempArray);
		};
	}
	drawMatrix() {
		for (var i = 0; i < this.gameMatrix.length; i ++) {
			for (var j = 0; j < this.gameMatrix[i].length; j ++) {
				let alphaBG = new PIXI.Graphics()
			    alphaBG.beginFill(0xffffff);
			    alphaBG.drawCircle( 0, 0, 20 );
			    let container = utils.addToContainer(alphaBG);
			    container.position.set(i* 50, j*50);
			    this.gameContainer.addChild(container);
			    this.entityMatrix[i][j] = alphaBG;
			}
		};
		this.gameContainer.position.set(config.width/2 - this.gameContainer.width/2,config.height/2 - this.gameContainer.height/2)
		utils.applyPositionCorrection(this.gameContainer);
	}
	onBackCallback() {
		config.effectsLayer.addShockwave(this.backButton.position.x / config.width,this.backButton.position.y / config.height,0.8);
		config.effectsLayer.fadeBloom(100,0,0.5,0, true);
		this.backButton.interactive = false;
		TweenLite.to(this.buttonShape.scale, 0.8, {delay:0.2, x:50,y:50, onComplete: this.toInit, onCompleteScope: this});
	}
	toInit(){
		this.screenManager.change("INIT");
	}

	update(delta){
		super.update(delta);

		this.timer -= delta;
		if(this.timer <= 0)
		{
			this.timer = this.timerMax;
			config.effectsLayer.shake(1,15,1);
			config.effectsLayer.addShockwave(0.5,0.5,0.8);
			config.effectsLayer.shakeSplitter(1,10,1.8);
			config.effectsLayer.fadeBloom(100,0,0.3,0, true);
			
		}else{
			this.description.setText(this.timer.toFixed(3));
		}

		this.gameContainer.position.x += this.gameContainerVelocity.x;
		this.gameContainer.position.y += this.gameContainerVelocity.y;
		this.gameContainerVelocity.x = Math.sin(this.gameContainerSinAcum+=0.04) * 0.1;
		this.gameContainerVelocity.y = Math.sin(this.gameContainerCosAcum+=0.03) * 0.1;

		this.glichValue -= delta;
		if(this.glichValue < 0){
			this.randomBallGlitch();
			this.glichValue = Math.random() * 2;
		}
	}
	randomBallGlitch(){
		if(config.isJuicy == 0){
			return;
		}
		let rndi = Math.floor(Math.random() * this.entityMatrix.length);
		let rndj = Math.floor(Math.random() * this.entityMatrix[0].length);
		let tempColor = this.entityMatrix[rndi][rndj].tint;

		this.entityMatrix[rndi][rndj].tint = utils.getRandomValue(config.palette.colors80);
		TweenLite.to(this.entityMatrix[rndi][rndj], Math.random(), {tint:tempColor});
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

	    return button
	}
}
