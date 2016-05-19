import PIXI from 'pixi.js';
import TweenLite from 'gsap';
import config  from '../../config';
import utils  from '../../utils';
import Screen from '../../screenManager/Screen'
import Line from '../entity/Line'

export default class GameScreen extends Screen{
	constructor(label){
		super(label);
	}
	build(){
		super.build();

		this.background = new PIXI.Graphics();
		this.background.beginFill( 0 );
	    this.background.drawRect( 0, 0, config.width, config.height);
		this.addChild(this.background);


		this.backgroundContainer = new PIXI.Container();
		this.addChild(this.backgroundContainer);
		this.inGameBg1 = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/inGameBg1.png'));
		this.backgroundContainer.addChild(this.inGameBg1);
		this.inGameBg1.position.set(0, config.height- this.inGameBg1.height);

		this.lineCounter = 1;
		this.lineRespawn = 0.3;

	    this.screenContainer = new PIXI.Container();
		this.addChild(this.screenContainer);

		
	    this.addChild(this.screenContainer)
	    
	    this.timerMax = 5;
	    this.timer = this.timerMax;
	    this.description = new PIXI.Text('0',{font : '60px super_smash_tvregular', fill : 0xFFFFFF, align : 'right', dropShadow:true, dropShadowColor:'#666666'});
	    this.screenContainer.addChild(this.description);
	    this.description.position.set(config.width/2 - this.description.width/2, 0);
	    utils.applyPositionCorrection(this.description);


	    this.gameContainer = new PIXI.Container();
	    this.screenContainer.addChild(this.gameContainer);
	    this.gameContainerSinAcum = 0;
	    this.gameContainerCosAcum = 0;
		this.gameContainerVelocity = {x:0,y:0};

	    this.gameMatrix = [];
	    this.entityMatrix = [];
	    this.matrixBounds = {i:5, j:11};
	    this.configGameMatrix(this.matrixBounds.i,this.matrixBounds.j);
	    this.dotRadious = 15;
	    this.dotDistance = 20;
	    this.drawMatrix(this.dotRadious, this.dotDistance * 2);

	    this.gameContainer.pivot.x = this.gameContainer.width / 2;
	    this.gameContainer.pivot.y = this.gameContainer.height / 2;
	    this.gameContainer.position.x += this.gameContainer.pivot.x;
	    this.gameContainer.position.y += this.gameContainer.pivot.y + 30;
	    this.gameContainer.visible = false;

	    let gameContainerBackground = new PIXI.Graphics();
		gameContainerBackground.beginFill( 0 );
	    gameContainerBackground.drawRect( -50, -50, this.gameContainer.width, this.gameContainer.height);
	    gameContainerBackground.alpha = 0;
		this.gameContainer.addChild(gameContainerBackground);

	    this.glichValue = 1;

	    this.interactive = true;
	    this.gameContainer.interactive = true;
	    // this.gameContainer.buttonMode = true;
	    this.gameContainer.on('mousemove', this.onMouseMoveCallback.bind(this));

	    this.on('tap', this.onGameClickCallback.bind(this)).on('click', this.onGameClickCallback.bind(this));
	    utils.addMockObject(this.gameContainer);
	    this.startButton = this.createPlayButton ( );
	    utils.applyPositionCorrection(this.startButton);
	    this.screenContainer.addChild(this.startButton);
	    this.startButton.position.set(config.width/2, config.height/2)
	    TweenLite.from(this.startButton.position, 1, {delay:0.5, y:config.height + this.startButton.height, ease:"easeOutBack"});
	    this.startButton.on('tap', this.initGame.bind(this)).on('click', this.initGame.bind(this));


	    this.backButton = this.createButton ( );
	    this.screenContainer.addChild(this.backButton)
	    this.backButton.position.set(config.buttonRadius + config.bounds.x, config.buttonRadius + config.bounds.y)
	    TweenLite.from(this.backButton.scale, 0.8, {x:20,y:20});
	    this.backButton.on('tap', this.onBackCallback.bind(this)).on('click', this.onBackCallback.bind(this));

	    // this.initGame();
	}

	//EVENTS
	onMouseMoveCallback(e) {
		this.findCol(e.data.global.x - e.target.position.x + e.target.pivot.x + config.hitCorrection.x);
	}
	onGameClickCallback() {
		if(this.addElementOnColum(this.currentColum, 1)){
			this.resetTimer	();
			this.opponentPlay();
		}
	}



	//GAMEPLAY
	findCol(position){
		this.currentColum = Math.floor((position) / (this.dotRadious + this.dotDistance));
		this.showCol(this.currentColum);
	}
	updateColors(){
		for (var i = this.entityMatrix.length - 1; i >= 0; i--) {
			for (var j = this.entityMatrix[i].length - 1; j >= 0; j--) {
				if(this.gameMatrix[i][j] == 0){
					this.entityMatrix[i][j].tint = 0xFFFFFF;
				}else if(this.gameMatrix[i][j] == 1){
					this.entityMatrix[i][j].tint = 0x00FFFF;
				}else if(this.gameMatrix[i][j] == 2){
					this.entityMatrix[i][j].tint = 0xFFFF00;
				}
			}
		}
	}
	showCol(colum){
		this.updateColors();
		if(colum < 0 || colum >= this.entityMatrix.length){
			return;
		}
		for (var i = this.entityMatrix[colum].length - 1; i >= 0; i--) {
			if(this.gameMatrix[colum][i] == 0){
				TweenLite.killTweensOf(this.entityMatrix[colum][i]);
				this.entityMatrix[colum][i].tint = config.palette.gameScreen80;
			}
		};
	}
	addElementOnColum(colum, id){
		if(colum < 0 || colum >= this.gameMatrix.length){
			return false;
		}
		let added = false;
		for (var i = this.gameMatrix[colum].length - 1; i >= 0; i--) {
			if(this.gameMatrix[colum][i] == 0){
				this.gameMatrix[colum][i] = id;
				added = true;
				break;
			}
		};
		this.updateColors();
		this.verifyWinner();
		return added;
	}
	//trabalhar nisso
	verifyWinner() {
		//horizontal verification
		let currentTestedHorizontal;
		let currentTestedVertical;
		let acumHorizontal;
		let acumVertical;
		for (var i = 0; i < this.entityMatrix.length; i++) {
			acumVertical = 0;

			currentTestedVertical = -1;
			for (var j = 0; j < this.entityMatrix[i].length; j++) {
				if(currentTestedVertical < 0){
					currentTestedVertical = this.entityMatrix[i][j];
				}
				if(currentTestedVertical == this.entityMatrix[i][j] &&  this.entityMatrix[i][j] > 0){
					acumVertical ++;
				}else{
					currentTestedVertical = this.entityMatrix[i][j];
					acumVertical = 1;
				}

			}
			//console.log(acumVertical);
		}
		
	}
	
	opponentPlay() {
		let rndPlay = Math.floor(Math.random() * this.gameMatrix.length);
		this.addElementOnColum(rndPlay, 2);
	}
	initGame() {
		this.started = true;
		TweenLite.killTweensOf(this.startButton.position);
		TweenLite.to(this.startButton.position, 0.4, {y:config.height + this.startButton.height, ease:"easeInBack"});
		this.gameContainer.visible = true;
		this.gameContainer.alpha = 0;
		TweenLite.killTweensOf(this.gameContainer);
		TweenLite.killTweensOf(this.gameContainer.scale);
		TweenLite.from(this.gameContainer.scale, 1, {delay:0.3, y:0.1, x:0.1, ease:"easeOutBack"});
		TweenLite.to(this.gameContainer, 0.5, {delay:0.3, alpha:1});
		this.timer = this.timerMax * 2;
	}
	resetTimer(){
		this.timer = this.timerMax;
	}
	endTimer(){
		this.opponentPlay();
		config.effectsLayer.shake(1,5,0.5);
		config.effectsLayer.addShockwave(0.5,0.5,0.5);
		config.effectsLayer.shakeSplitter(1,4,0.4);
		//config.effectsLayer.fadeBloom(100,0,0.3,0, true);
	}
	destroyGame(){
		this.resetTimer();
		this.started = false;
	}


	//INITIALIZE
	configGameMatrix(i,j) {
		let tempArray = [];
		let tempArray2 = [];
		for (let jj = 0; jj < j; jj++) {
			tempArray = [];
			tempArray2 = [];
			for (let ii = 0; ii < i; ii++) {
				tempArray.push(0);
				tempArray2.push(0);
			}
			this.gameMatrix.push(tempArray2);
			this.entityMatrix.push(tempArray);
		};
	}
	drawMatrix(size, distance) {
		for (var i = 0; i < this.gameMatrix.length; i ++) {
			for (var j = 0; j < this.gameMatrix[i].length; j ++) {
				let alphaBG = new PIXI.Graphics()
			    alphaBG.beginFill(0xffffff);
			    alphaBG.drawCircle( 0, 0, size );
			    let container = utils.addToContainer(alphaBG);
			    container.position.set(i* distance, j*distance);
			    this.gameContainer.addChild(container);
			    this.entityMatrix[i][j] = alphaBG;
			}
		};
		this.gameContainer.position.set(config.width/2 - this.gameContainer.width/2,config.height/2 - this.gameContainer.height/2)
		utils.applyPositionCorrection(this.gameContainer);
	}
	//

	//SCREEN
	onBackCallback() {
		config.effectsLayer.addShockwave(this.backButton.position.x / config.width,this.backButton.position.y / config.height,0.8);
		config.effectsLayer.fadeBloom(100,0,0.5,0, true);
		this.backButton.interactive = false;
		TweenLite.to(this.buttonShape.scale, 0.8, {delay:0.2, x:50,y:50, onComplete: this.toInit, onCompleteScope: this});
	}
	toInit(){
		this.destroyGame();
		this.screenManager.change("INIT");
	}





	//UPDATE
	update(delta){
		super.update(delta);
		if(!this.started){
			return;
		}
		this.timer -= delta;
		if(this.timer <= 0)
		{
			this.resetTimer();			
			this.endTimer();
			
		}else{
			let rnd1 = String.fromCharCode(Math.floor(Math.random()*20) + 65);
			let rnd2 = Math.floor(Math.random()* 9);
			let rnd3 = String.fromCharCode(Math.floor(Math.random()*20) + 65);
			this.description.setText(this.timer.toFixed(3)+rnd1+rnd2+rnd3);
		}
		this.lineCounter-= delta;
		if(this.lineCounter <= 0)
		{
			this.lineCounter = this.lineRespawn;
			let line = new Line(4);
			this.addChild(line);
			line.position.y = this.inGameBg1.position.y;

			this.setChildIndex(this.screenContainer, this.children.length - 1);
		}

		this.gameContainer.scale.y += this.gameContainerVelocity.x * 0.01;
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


	//EFFECTS
	randomBallGlitch(){
		if(config.isJuicy == 0){
			return;
		}
		let rndi = Math.floor(Math.random() * this.entityMatrix.length);
		let rndj = Math.floor(Math.random() * this.entityMatrix[0].length);

		let tempColor = this.entityMatrix[rndi][rndj].tint;

		if(tempColor != 0xFFFFFF){
			return;
		}

		this.entityMatrix[rndi][rndj].tint = utils.getRandomValue(config.palette.colors80);
		TweenLite.killTweensOf(this.entityMatrix[rndi][rndj]);
		TweenLite.to(this.entityMatrix[rndi][rndj], Math.random(), {tint:tempColor});
	}


	//GRAPHICS
	createPlayButton ( ) {
	    let button = new PIXI.Container()
	    let shape = new PIXI.Graphics()
	    let color = 0xFFFFFF;
	    shape.beginFill(color);	    
	    shape.drawCircle( 0, 0, config.buttonRadius );
	    //button.addChild(shape);
	    //utils.applyPositionCorrection((button.addChild( shape)));
	    button.addChild( shape)
	    //utils.applyPositionCorrection();
	    button.interactive = true
	    button.buttonMode = true

	    utils.addMockObject(button);

	    return button
	}
	createButton ( ) {
	    let button = new PIXI.Container()
	    this.buttonShape = new PIXI.Graphics()
	    let color = config.palette.gameScreen80;
	   	config.palette.initScreen80 = color;
	   
	    this.buttonShape.beginFill(color);	    
	    this.buttonShape.drawCircle( 0, 0, config.buttonRadius );
	    button.addChild(this.buttonShape);

	    button.interactive = true
	    button.buttonMode = true

	    utils.addMockObject(button);

	    return button
	}
}
