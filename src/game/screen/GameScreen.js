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

		this.createParticles();

	    this.screenContainer = new PIXI.Container();
		this.addChild(this.screenContainer);
		this.normalizedDelta = 1;
	    
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
	    this.entityColums = [];
	    this.matrixBounds = {i:6, j:7};
	    this.configGameMatrix(this.matrixBounds.i,this.matrixBounds.j);
	    this.dotRadius = 15;
	    this.dotDistance = 20;
	    this.drawMatrix(this.dotRadius, this.dotDistance * 2);

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

	    this.interactive = false;
	    this.gameContainer.interactive = true;
	    // this.gameContainer.buttonMode = true;
	    
	    //utils.applyPositionCorrection(this.gameContainer);
	    
	    //utils.addMockObject(this.gameContainer);
	    this.startButton = this.createPlayButton ( );
	    utils.applyPositionCorrection(this.startButton);
	    this.screenContainer.addChild(this.startButton);
	    this.startButton.position.set(config.width/2, config.height/2)
	    TweenLite.from(this.startButton.position, 1, {delay:0.5, y:config.height + this.startButton.height, ease:"easeOutBack"});
	    


	    this.backButton = this.createButton ( );
	    this.screenContainer.addChild(this.backButton)
	    this.backButton.position.set(config.buttonRadius + config.bounds.x, config.buttonRadius + config.bounds.y)
	    TweenLite.from(this.backButton.scale, 0.8, {x:20,y:20});

	    this.pauseButton = this.createButton ( );
	    this.screenContainer.addChild(this.pauseButton)
	    this.pauseButton.position.set(config.width - config.buttonRadius * 2, config.buttonRadius + config.bounds.y)
	    //TweenLite.from(this.pauseButton.scale, 0.8, {x:20,y:20});

	    this.currentConnectFactor = 4;
	    this.pause = false;
	    this.addEvents();
	    // this.initGame();
	}
	
	//EVENTS
	removeEvents(){
		this.off('tap').off('click');
		this.startButton.off('tap', this.initGame.bind(this)).off('click', this.initGame.bind(this));
		this.backButton.off('tap', this.onBackCallback.bind(this)).off('click', this.onBackCallback.bind(this));
		this.pauseButton.off('tap', this.onPauseCallback.bind(this)).off('click', this.onPauseCallback.bind(this));
		this.gameContainer.off('mousemove');
	}
	addEvents(){		
	    this.on('tap', this.onGameClickCallback.bind(this)).on('click', this.onGameClickCallback.bind(this));	    
	    this.startButton.on('tap', this.initGame.bind(this)).on('click', this.initGame.bind(this));	    
	    this.backButton.on('tap', this.onBackCallback.bind(this)).on('click', this.onBackCallback.bind(this));	    
	    this.pauseButton.on('tap', this.onPauseCallback.bind(this)).on('click', this.onPauseCallback.bind(this));	    
	    this.gameContainer.on('mousemove', this.onMouseMoveCallback.bind(this));
	}
	onMouseMoveCallback(e) {
		if(!this.started){
			return;
		}
		// console.log(this.dotDistance, this.matrixBounds.j, this.dotRadius);
		let width = e.target.width * e.target.scale.x- this.dotRadius/2;
		// let width = (this.dotDistance * (this.matrixBounds.j - 1)) + (this.dotRadius * this.matrixBounds.j);
		let realativePosition = e.data.global.x - (e.target.position.x - width/ 2) - this.dotRadius/2;
		if(config.isJuicy){
			this.findCol(realativePosition + config.hitCorrection.x, width);
		}else{
			this.findCol(realativePosition, width);
		}
	}
	onGameClickCallback() {
		if(!this.playerRound || !this.started){
			return;
		}
		if(this.addElementOnColum(this.currentColum, 1)){
			this.resetTimer	();
			this.opponentPlay();
			this.playerRound = false;
		}
	}
	onPauseCallback() {
		this.pause = !this.pause;
		TweenLite.to(this, 3, {normalizedDelta:this.pause?0:1});
	}

	//GAMEPLAY
	findCol(position, width){
		this.currentColum = Math.floor((position + this.dotDistance) / (width / this.matrixBounds.j));
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
		if(this.pause){
			return;
		}
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
		
		if(colum < 0 || colum >= this.gameMatrix.length || !this.started){
			return false;
		}
		let added = false;
		let element;
		let addedMatrixPosition;
		for (var i = this.gameMatrix[colum].length - 1; i >= 0; i--) {
			if(this.gameMatrix[colum][i] == 0){
				this.gameMatrix[colum][i] = id;
				addedMatrixPosition = {j:colum, i:i};
				element = this.entityMatrix[colum][i];
				TweenLite.from(element.scale, 1, {x:0, y: 0, ease:"easeOutElastic"});
				
				let normalX = (this.gameContainer.position.x - this.gameContainer.pivot.x + element.parent.position.x - this.dotRadius / 2) / config.width;
				let normalY = (this.gameContainer.position.y - this.gameContainer.pivot.y + element.parent.position.y - this.dotRadius / 2) / config.height;
				
				config.effectsLayer.addShockwave(normalX,normalY,0.5, 0.1);
				added = true;
				break;
			}
		};
		this.updateColors();
		
		if(added){
			if(this.verifyWinner(addedMatrixPosition, id)){
				added = false;
			}
			let timeline = new TimelineLite();
			timeline.add(TweenLite.to(this.entityColums[colum].position, 0.05, {y:20}));
			timeline.add(TweenLite.to(this.entityColums[colum].position, 0.2, {y:0, ease:"easeOutBack"}));
		}
		return added;
	}
	//trabalhar nisso
	verifyWinner(addedMatrixPosition) {
		//horizontal verification
		let currentIdTested;
		let seqAcum;
		let possibleWinnerList =[];
		// console.log(addedMatrixPosition);


		let diagonal1List = [];
		let diagonal2List = [];
		let decressVerify = {i:addedMatrixPosition.i,j:addedMatrixPosition.j};
		let decressVerify2 = {i:addedMatrixPosition.i,j:addedMatrixPosition.j};
		let duplicate = false;
		diagonal1List.push({j:decressVerify.j, i:decressVerify.i});
		diagonal2List.push({j:decressVerify2.j, i:decressVerify2.i});
		for (var j = this.gameMatrix.length; j >= 0; j--) {
			if(decressVerify.j >= 0 && decressVerify.i >= 0){
				duplicate = false;
				for (var i = diagonal1List.length - 1; i >= 0; i--) {
				 	if(diagonal1List[i].i == decressVerify.i && diagonal1List[i].j == decressVerify.j){
				 		duplicate = true;
				 		break;
				 	}
				 } 
				if(!duplicate){
					diagonal1List.push({i:decressVerify.i,j:decressVerify.j});
				}
				decressVerify.j --;
				decressVerify.i --;
			}
			//add id 
			if(decressVerify2.j >= 0 && decressVerify2.i < this.gameMatrix[0].length){
				duplicate = false;
				for (var i = diagonal2List.length - 1; i >= 0; i--) {
				 	if(diagonal2List[i].i == decressVerify2.i && diagonal2List[i].j == decressVerify2.j){
				 		duplicate = true;
				 		break;
				 	}
				 } 
				if(!duplicate){
					diagonal2List.push({i:decressVerify2.i,j:decressVerify2.j});
				}
				decressVerify2.j --;
				decressVerify2.i ++;
			}


		}


		decressVerify = {i:addedMatrixPosition.i,j:addedMatrixPosition.j};
		decressVerify2 = {i:addedMatrixPosition.i,j:addedMatrixPosition.j};
		for (var j = this.gameMatrix.length; j >= 0; j--) {
			if(decressVerify.j < this.gameMatrix.length && decressVerify.i < this.gameMatrix[0].length){
				duplicate = false;
				for (var i = diagonal1List.length - 1; i >= 0; i--) {
				 	if(diagonal1List[i].i == decressVerify.i && diagonal1List[i].j == decressVerify.j){
				 		duplicate = true;
				 		break;
				 	}
				 } 
				if(!duplicate){
					diagonal1List.push({i:decressVerify.i,j:decressVerify.j});
				}
				decressVerify.j ++;
				decressVerify.i ++;
			}

			if(decressVerify2.j < this.gameMatrix.length && decressVerify2.i >= 0){
				duplicate = false;
				for (var i = diagonal2List.length - 1; i >= 0; i--) {
				 	if(diagonal2List[i].i == decressVerify2.i && diagonal2List[i].j == decressVerify2.j){
				 		duplicate = true;
				 		break;
				 	}
				 } 
				if(!duplicate){
					diagonal2List.push({i:decressVerify2.i,j:decressVerify2.j});
				}
				decressVerify2.j ++;
				decressVerify2.i --;
			}

		}
		diagonal1List.sort(function(objt1, objt2){return objt1.j-objt2.j});
		diagonal2List.sort(function(objt1, objt2){return objt1.j-objt2.j});
		

		seqAcum = 0;
		currentIdTested = -1;
		possibleWinnerList =[];

		for (var i = 0; i < diagonal1List.length; i++) {
			if(currentIdTested < 0){
				currentIdTested = this.gameMatrix[diagonal1List[i].j][diagonal1List[i].i];
			}
			if(currentIdTested == this.gameMatrix[diagonal1List[i].j][diagonal1List[i].i] &&  this.gameMatrix[diagonal1List[i].j][diagonal1List[i].i] > 0){
				seqAcum ++;
			}else{
				currentIdTested = this.gameMatrix[diagonal1List[i].j][diagonal1List[i].i];
				possibleWinnerList = [];
				seqAcum = 1;
			}
			possibleWinnerList.push(this.entityMatrix[diagonal1List[i].j][diagonal1List[i].i]);
			if(seqAcum >= this.currentConnectFactor){
				this.haveWinner(currentIdTested, possibleWinnerList);
				return true;
				break;
			}
		}

		for (var i = 0; i < diagonal2List[i].length; i++) {
			if(currentIdTested < 0){
				currentIdTested = this.gameMatrix[diagonal2List[i].j][diagonal2List[i].i];
			}
			if(currentIdTested == this.gameMatrix[diagonal2List[i].j][diagonal2List[i].i] &&  this.gameMatrix[diagonal2List[i].j][diagonal2List[i].i] > 0){
				seqAcum ++;
			}else{
				currentIdTested = this.gameMatrix[diagonal2List[i].j][diagonal2List[i].i];
				possibleWinnerList = [];
				seqAcum = 1;
			}
			possibleWinnerList.push(this.entityMatrix[diagonal2List[i].j][diagonal2List[i].i]);
			if(seqAcum >= this.currentConnectFactor){
				this.haveWinner(currentIdTested, possibleWinnerList);
				return true;
				break;
			}
		}

		seqAcum = 0;
		currentIdTested = -1;
		possibleWinnerList =[];
		//HORIZONTAL
		for (var i = 0; i < this.gameMatrix.length; i++) {
			if(currentIdTested < 0){
				currentIdTested = this.gameMatrix[i][addedMatrixPosition.i];
			}
			if(currentIdTested == this.gameMatrix[i][addedMatrixPosition.i] &&  this.gameMatrix[i][addedMatrixPosition.i] > 0){
				seqAcum ++;
			}else{
				currentIdTested = this.gameMatrix[i][addedMatrixPosition.i];
				possibleWinnerList = [];
				seqAcum = 1;
			}
			possibleWinnerList.push(this.entityMatrix[i][addedMatrixPosition.i]);
			if(seqAcum >= this.currentConnectFactor){
				this.haveWinner(currentIdTested, possibleWinnerList);
				return true;
				break;
			}
		}

		


		seqAcum = 0;
		currentIdTested = -1;
		possibleWinnerList =[];
		//VERTICAL
		for (var j = 0; j < this.gameMatrix[addedMatrixPosition.j].length; j++) {
			if(currentIdTested < 0){
				currentIdTested = this.gameMatrix[addedMatrixPosition.j][j];
			}
			if(currentIdTested == this.gameMatrix[addedMatrixPosition.j][j] &&  this.gameMatrix[addedMatrixPosition.j][j] > 0){
				seqAcum ++;
			}else{
				currentIdTested = this.gameMatrix[addedMatrixPosition.j][j];
				seqAcum = 1;
				possibleWinnerList = [];
			}
			possibleWinnerList.push(this.entityMatrix[addedMatrixPosition.j][j]);
			if(seqAcum >= this.currentConnectFactor){
				this.haveWinner(currentIdTested, possibleWinnerList);
				return true;
				break;
			}
		}

		return false;
		
	}
	hasDuplicated(array, obj) {
		for (var i = array.length - 1; i >= 0; i--) {
		 	if(array == obj){
		 		return true;
		 		break;
		 	}
		 } 
		 return false;
	}
	haveWinner(id, graphicsList) {
		console.log(graphicsList);
		this.pause = true;
		for (var i = graphicsList.length - 1; i >= 0; i--) {
			graphicsList[i].tint = 0xFF0000;
		}

	}
	
	opponentPlay() {
		let rndPlay = Math.floor(Math.random() * this.gameMatrix.length);
		setTimeout(function(){
			this.playerRound = true;
			this.addElementOnColum(rndPlay, 2);
		}.bind(this), 400);
		
	}
	initGame() {
		this.playerRound = true;
		this.pause = false;
		this.normalizedDelta = 1;
		TweenLite.killTweensOf(this.startButton.position);
		TweenLite.to(this.startButton.position, 0.4, {y:config.height + this.startButton.height, ease:"easeInBack"});
		this.gameContainer.visible = true;
		this.gameContainer.alpha = 0;
		this.interactive = true;
		TweenLite.killTweensOf(this.gameContainer);
		TweenLite.killTweensOf(this.gameContainer.scale);
		TweenLite.from(this.gameContainer.scale, 1, {delay:0.3, y:0.1, x:0.1, ease:"easeOutBack"});
		TweenLite.to(this.gameContainer, 0.5, {delay:0.3, alpha:1});
		this.timer = this.timerMax * 2;

		this.started = true;
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
		this.removeEvents();
	}


	//INITIALIZE
	configGameMatrix(i,j) {
		this.gameMatrix = [];
	    this.entityMatrix = [];
	    this.entityColums = [];
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
		this.entityColums = [];
		for (var i = 0; i < this.gameMatrix.length; i ++) {
			let tempContainer = new PIXI.Container();	
			for (var j = 0; j < this.gameMatrix[i].length; j ++) {
				let alphaBG = new PIXI.Graphics()
			    alphaBG.beginFill(0xffffff);
			    alphaBG.drawCircle( 0, 0, size );
			    let container = utils.addToContainer(alphaBG);
			    container.position.set(i* distance, j*distance);
			    tempContainer.addChild(container);
			    
			    this.entityMatrix[i][j] = alphaBG;
			}
			this.gameContainer.addChild(tempContainer);
			this.entityColums.push(tempContainer);
		};
		this.gameContainer.position.set(config.width/2 - this.gameContainer.width/2 +size ,config.height/2 - this.gameContainer.height/2)
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


	//PARTICLES
	updateParticles(delta){
		for (var i = 0; i < this.particleUpdater; i++)
	    {
	        var particle = this.particles[i];
	        particle.direction += particle.turningSpeed * 0.01;
	        particle.position.x += Math.sin(particle.direction) * (particle.speed * particle.scale.y);
	        particle.position.y += Math.cos(particle.direction) * (particle.speed * particle.scale.y);
	        particle.rotation = -particle.direction + Math.PI;
	        particle.alpha += delta;
	        if(particle.position.x < 0 || particle.position.x > config.width || particle.y < 0){
	        	particle.x = config.width / 2 + Math.sin(particle.direction) * 100;
		    	particle.y = config.height / 2 + Math.cos(particle.direction) * 50;
		    	particle.alpha = 0;
	        }
		}
		this.particleUpdater += delta*20;
		if(this.particleUpdater > this.particles.length){
			this.particleUpdater = this.particles.length;
		}
	}
	createParticles(){
		this.particleUpdater = 0;
		this.particlesContainer = new PIXI.ParticleContainer(500, {
		    scale: true,
		    position: true,
		    rotation: true,
		    uvs: true,
		    alpha: true
		});
		this.addChild(this.particlesContainer);
		this.particles = [];
		for (let i = 0; i < 50; i++)
		{
		    // create a new Sprite
		    let particle = PIXI.Sprite.fromImage('./assets/particle2.png');
		    particle.anchor.set(0.5, 1);
		    particle.scale.set(1, 1);
		    let angle = (Math.random() * 180 + 90) /180 * Math.PI;
		    // scatter them all
		    particle.x = config.width / 2 + Math.sin(angle) * 100;
		    particle.y = config.height / 2 + Math.cos(angle) * 50;

		    particle.alpha = 0;

		    // create a random direction in radians
		    particle.direction = angle;

		    // this number will be used to modify the direction of the sprite over time
		    particle.turningSpeed = 0;

		    // create a random speed between 0 - 2, and these maggots are slooww
		    particle.speed = 1 + Math.random() * 1.5;
		    this.particles.push(particle);
		    this.particlesContainer.addChild(particle);
		}
	}

	//UPDATE
	updateTimer(delta){
		
		
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

		if(this.pause){
			return;
		}
		this.timer -= delta;
	}
	update(delta){
		delta *= this.normalizedDelta;
		super.update(delta);
		if(!this.started){
			return;
		}
		this.updateTimer(delta);
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
		this.gameContainerVelocity.x = Math.sin(this.gameContainerSinAcum+=0.1) * 0.2;
		this.gameContainerVelocity.y = Math.sin(this.gameContainerCosAcum+=0.08) * 0.6;


		this.glichValue -= delta;
		if(this.glichValue < 0){
			this.randomBallGlitch();
			this.glichValue = Math.random() * 2;
		}
		this.updateParticles(delta);
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
