import PIXI from 'pixi.js';
import TweenLite from 'gsap';
import config  from '../../config';
import utils  from '../../utils';
import Screen from '../../screenManager/Screen'
import Line from '../entity/Line'
import PauseContainer from '../container/PauseContainer'
import EndContainer from '../container/EndContainer'

export default class GameScreen extends Screen{
	constructor(label){
		super(label);
	}
	build(){
		super.build();

		//create background shape
		this.background = new PIXI.Graphics();
		this.background.beginFill( 0 );
	    this.background.drawRect( 0, 0, config.width, config.height);
		this.addChild(this.background);

		//create background
		this.backgroundContainer = new PIXI.Container();
		this.addChild(this.backgroundContainer);
		this.inGameBg1 = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/inGameBg1.png'));
		this.backgroundContainer.addChild(this.inGameBg1);
		this.inGameBg1.position.set(0, config.height- this.inGameBg1.height);

		//controller of lines in background
		this.lineCounter = 1;
		this.lineRespawn = 0.3;

		//create particles layer
		this.createParticles();

		//create screen container
	    this.screenContainer = new PIXI.Container();
		this.addChild(this.screenContainer);

		//variable to speed game animations
		this.normalizedDelta = 1;
	    
	    //initialize timer and label
	    this.timerMax = 5;
	    this.timer = this.timerMax;
	    this.timerStyleStandard = {font : '64px super_smash_tvregular', fill : 0xFFFFFF, align : 'center', dropShadow:true, dropShadowColor:'#666666'};
	    this.timerStylePause = {font : '184px super_smash_tvregular', fill : 0xFFFFFF, align : 'center', dropShadow:true, dropShadowColor:'#666666'};
	    this.labelTimer = new PIXI.Text('0',this.timerStyleStandard);
	    this.screenContainer.addChild(this.labelTimer);
	    this.labelTimer.position.set(config.width/2 - this.labelTimer.width/2, 0);
	    utils.applyPositionCorrection(this.labelTimer);

	    this.labelInstruction = new PIXI.Text('0',{font : '40px super_smash_tvregular', fill : 0xFFFFFF, align : 'center'});
	    this.labelInstruction.position.set(config.width/2 - this.labelTimer.width/2, this.labelTimer.position.y + this.labelTimer.height);
		this.screenContainer.addChild(this.labelInstruction);
		this.labelInstruction.visible = false;
		this.labelTimer.visible = false;
	    

	    //size and distance of dots
	    this.dotRadius = 16;
	    this.dotDistance = 18;


	    //create and position game container
	    this.gameContainer = new PIXI.Container();
	    this.screenContainer.addChild(this.gameContainer);


	    //create invisible shape on baclground
	    let gameContainerBackground = new PIXI.Graphics();
		gameContainerBackground.beginFill( 0 );
	    gameContainerBackground.drawRect( -50, -50, this.gameContainer.width, this.gameContainer.height);
	    gameContainerBackground.alpha = 0;
		// this.gameContainer.addChild(gameContainerBackground);

		//glich variable controller
	    this.glichValue = 1;

	    //set interactive
	    this.interactive = false;
	    this.gameContainer.interactive = true;
	    
	    //create start button
	    let playObj = this.createPlayButton("PLAY");
	    this.startButton = playObj.button;
	    // utils.applyPositionCorrection(this.startButton);
	    this.screenContainer.addChild(this.startButton);
	    this.startButton.position.set(config.width/2 - playObj.size.width/2, config.height/2 - playObj.size.height)
	    TweenLite.from(this.startButton.position, 1, {delay:0.5, y:config.height + playObj.size.height, ease:"easeOutBack"});

	    let playHardObj = this.createPlayButton("HARDCORE");
	    this.hardCoreButton = playHardObj.button;
	    // utils.applyPositionCorrection(this.hardCoreButton);
	    this.screenContainer.addChild(this.hardCoreButton);
	    this.hardCoreButton.position.set(config.width/2 - playHardObj.size.width/2, config.height/2 + playHardObj.size.height/2)
	    TweenLite.from(this.hardCoreButton.position, 1, {delay:0.7, y:config.height + playHardObj.size.height + 50, ease:"easeOutBack"});
	    
	    //create pause button
	    this.pauseButton = this.createButton("P").button;
	    this.screenContainer.addChild(this.pauseButton)
	    this.pauseButton.position.set(config.width - config.buttonRadius * 2, config.buttonRadius + config.bounds.y)
	    this.pauseButton.visible = false;
	    //TweenLite.from(this.pauseButton.scale, 0.8, {x:20,y:20});

	    //create back button
	    let btnObject = this.createButton("");
	    this.backButton = btnObject.button;
	    this.buttonShape = btnObject.shape;
	    this.screenContainer.addChild(this.backButton)
	    this.backButton.position.set(config.buttonRadius + config.bounds.x, config.buttonRadius + config.bounds.y)
	    TweenLite.from(this.backButton.scale, 0.8, {x:20,y:20});


	   
	    this.pauseContainer = new PauseContainer(this);
	    this.screenContainer.addChild(this.pauseContainer);
	    this.pauseContainer.hide(true);

	    this.endContainer = new EndContainer(this);
	    this.screenContainer.addChild(this.endContainer);
	    this.endContainer.hide(true);

	    this.pause = false;
	    this.updateInstructions();
	    this.addEvents();

	    this.lastColum;

	    this.playerPlaceds=[];
	}
	
	//EVENTS
	removeEvents(){
		this.hardCoreButton.off('tap').off('click');
		this.startButton.off('tap').off('click');
		this.backButton.off('tap').off('click');
		this.pauseButton.off('tap').off('click');
		this.gameContainer.off('mousemove');
		this.off('tap').off('mouseup');
	}
	addEvents(){
		this.removeEvents();
	    this.hardCoreButton.on('tap', this.initGameHardcore.bind(this)).on('click', this.initGameHardcore.bind(this));	    
	    this.startButton.on('tap', this.initGameNormal.bind(this)).on('click', this.initGameNormal.bind(this));	    
	    this.backButton.on('tap', this.onBackCallback.bind(this)).on('click', this.onBackCallback.bind(this));	    
	    this.pauseButton.on('tap', this.onPauseCallback.bind(this)).on('click', this.onPauseCallback.bind(this));	    
	    this.gameContainer.on('mousemove', this.onMouseMoveCallback.bind(this));
	    this.on('mouseup', this.onGameClickCallback.bind(this)).on('tap', this.onGameClickCallback.bind(this));	    
	    //this.gameContainer.on('click', this.onGameClickCallback.bind(this)).on('tap', this.onGameClickCallback.bind(this));	    
	}
	onMouseMoveCallback(e) {
		if(!this.started || this.ended){
			return;
		}
		let width = e.target.width * e.target.scale.x- this.dotRadius/2;
		let realativePosition = e.data.global.x - (e.target.position.x - width/ 2) - this.dotRadius/2;
		//console.log(e.data.global.x, e.target.position.x, e.target.width , e.target.scale.x,this.dotRadius/2, 'move');
		if(config.isJuicy){
			this.findCol(realativePosition + config.hitCorrection.x, width);
		}else{
			this.findCol(realativePosition, width);
		}
	}
	onGameClickCallback(e) {
		if(!this.playerRound || !this.started || this.ended){
			return;
		}
		let width = e.target.gameContainer.width * e.target.gameContainer.scale.x- this.dotRadius/2;
		let realativePosition = e.data.global.x - (e.target.gameContainer.position.x - width/ 2) - this.dotRadius/2;
		console.log(e.data.global.x, e.target.gameContainer.position.x, e.target.gameContainer.width , e.target.gameContainer.scale.x,this.dotRadius/2, 'click');
		if(config.isJuicy){
			this.findCol(realativePosition + config.hitCorrection.x, width);
		}else{
			this.findCol(realativePosition, width);
		}
		if(this.addElementOnColum(this.currentColum, 1).added){
			this.lastColum = this.currentColum;
			this.playerPlaceds.push(this.lastColum);
			this.resetTimer	();
			this.opponentPlay();
			this.playerRound = false;
		}
	}
	onPauseCallback() {
		this.pause = !this.pause;
		TweenLite.to(this, 3, {normalizedDelta:this.pause?0:1});
		TweenLite.killTweensOf(this.gameContainer.scale);
		TweenLite.killTweensOf(this.gameContainer.position);
		TweenLite.killTweensOf(this.gameContainer);
		if(this.pause){
			config.effectsLayer.fadeBloom(10,10,1,0, false);
			this.pauseButton.visible = false;
			this.backButton.visible = false;
			TweenLite.to(this.gameContainer.scale, 2, {x:0.3, y:0.3, ease:"easeOutBack"});
			TweenLite.to(this.gameContainer.position, 2, {y:this.initialYPosition - 40, ease:"easeOutBack"});
			TweenLite.to(this.gameContainer.position, 2, {x:config.width / 2 + this.dotRadius, ease:"easeOutBack"});
			TweenLite.to(this.gameContainer, 0.5, {alpha:0});
			config.effectsLayer.addShockwave(this.pauseButton.position.x / config.width,this.pauseButton.position.y / config.height,0.8);
			this.pauseContainer.show();

		}else{
			config.effectsLayer.fadeBloom(10,0,0.5,0, true);
			this.pauseButton.visible = true;
			this.backButton.visible = true;
			TweenLite.to(this.gameContainer.scale, 1, {x:1, y:1, ease:"easeOutBack"});	
			TweenLite.to(this.gameContainer.position, 2, {y:this.initialYPosition, ease:"easeOutBack"});
			TweenLite.to(this.gameContainer.position, 2, {x:this.initialXPosition, ease:"easeOutBack"});
			TweenLite.to(this.gameContainer, 0.5, {alpha:1});
			this.pauseContainer.hide();
		}
	}

	//GAMEPLAY
	updateInstructions(){
		let rnd1 = Math.floor(Math.random()* 9);
		let rnd2 = String.fromCharCode(Math.floor(Math.random()*20) + 65);
		let connectLabel = 'CONNECT'.split('');
		let rndPause = Math.random();
		if(rndPause < 0.5){
			connectLabel[Math.floor(Math.random()*connectLabel.length)] = rnd1;
			connectLabel[Math.floor(Math.random()*connectLabel.length)] = rnd2;
		}
		let connectString = '';
		for (var i = 0; i < connectLabel.length; i++) {
			connectString+=connectLabel[i];
		}
		this.labelInstruction.text = connectString+" "+this.currentConnectFactor;
		this.labelInstruction.position.set(config.width/2 - this.labelInstruction.width/2, this.labelTimer.position.y + this.labelTimer.height * 0.9);
	}
	//find colum by position
	findCol(position, width){
		this.currentColum = Math.floor((position + this.dotDistance) / (width / this.matrixBounds.j));
		this.showCol(this.currentColum);
	}
	//update game colors
	updateColors(){		
		for (var i = this.entityMatrix.length - 1; i >= 0; i--) {
			for (var j = this.entityMatrix[i].length - 1; j >= 0; j--) {
				if(this.gameMatrix[i][j] == 0){
					this.entityMatrix[i][j].tint = config.palette.tileColor;
				}else if(this.gameMatrix[i][j] == 1){
					this.entityMatrix[i][j].tint = config.palette.playerColor;
				}else if(this.gameMatrix[i][j] == 2){
					this.entityMatrix[i][j].tint = config.palette.opponentColor;
				}
			}
		}
	}
	//highlight selected colum
	showCol(colum){
		if(this.pause || this.ended){
			return;
		}
		this.updateColors();
		if(colum < 0 || colum >= this.entityMatrix.length){
			return;
		}		
		for (var i = this.entityMatrix[colum].length - 1; i >= 0; i--) {
			if(this.gameMatrix[colum][i] == 0){
				TweenLite.killTweensOf(this.entityMatrix[colum][i]);
				this.entityMatrix[colum][i].tint = config.palette.highlightColor;
			}
		};
	}
	//if is possible, add on element on game
	addElementOnColum(colum, id){
		if((!colum && colum != 0) || colum < 0 || colum >= this.gameMatrix.length || !this.started || this.ended){
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
				
				config.effectsLayer.addShockwave(normalX,normalY,1, 0.1);
				added = true;
				break;
			}
		};
		this.updateColors();
		let idWinner = false;
		if(added){
			idWinner = this.verifyWinner(addedMatrixPosition, id)
			if(idWinner >= 0){
				if(idWinner <= 0){
					element = this.entityMatrix[Math.floor(this.entityMatrix.length / 2)][this.entityMatrix[0].length - 1];
				}
				this.endGame(idWinner, element);
			}
			let timeline = new TimelineLite();
			timeline.add(TweenLite.to(this.entityColums[colum].position, 0.05, {y:20}));
			timeline.add(TweenLite.to(this.entityColums[colum].position, 0.2, {y:0, ease:"easeOutBack"}));
		}
		return {added:added, hasWinner:idWinner >= 0};
	}
	//opponents play
	opponentPlay() {	
		if(this.ended || !this.started){
			return
		}
		setTimeout(function(){
			this.playerRound = true;
			let added = false;
			let rndPlay = this.lastColum;
			rndPlay = this.lastColum - Math.floor(Math.random() * 3 - 1);
			//simple inteligence to try prevent player victory
			if(this.playerPlaceds.length >= 2){
				if(this.playerPlaceds[this.playerPlaceds.length - 1] == this.playerPlaceds[this.playerPlaceds.length - 2]){
					rndPlay = this.playerPlaceds[this.playerPlaceds.length - 1];
				}
				if(this.playerPlaceds[this.playerPlaceds.length - 2] == this.playerPlaceds[this.playerPlaceds.length - 1] - 1){
					rndPlay = this.playerPlaceds[this.playerPlaceds.length - 1] + 1;
				}
				
				if(this.playerPlaceds[this.playerPlaceds.length - 2] == this.playerPlaceds[this.playerPlaceds.length - 1] + 1){
					rndPlay = this.playerPlaceds[this.playerPlaceds.length - 1] - 1;
				}
			}
			while (!added){
				added = this.addElementOnColum(rndPlay, 2).added;
				rndPlay = Math.floor(Math.random() * this.gameMatrix.length);
			};
			this.resetTimer	();
		}.bind(this), 400);		
	}
	//verify if have winner
	verifyWinner(addedMatrixPosition) {
		let currentIdTested;
		let seqAcum;
		let possibleWinnerList =[];
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
				if(!duplicate && decressVerify){
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
				if(!duplicate && decressVerify2){
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
				return currentIdTested;
				break;
			}
		}

		seqAcum = 0;
		currentIdTested = -1;
		possibleWinnerList =[];
		for (var i = 0; i < diagonal2List.length; i++) {
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
				return currentIdTested;
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
				return currentIdTested;
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
				return currentIdTested;
				break;
			}
		}

		//verify if have more options to play
		let hasPossibility = false;
		for (var j = this.gameMatrix.length-1; j >= 0; j--) {
			for (var i = this.gameMatrix[j].length-1; i >= 0; i--) {
				if(this.gameMatrix[j][i] == 0){
					hasPossibility = true;
					break;
				}
			}
		}

		if(!hasPossibility){
			this.haveWinner(-1, []);
			return 0;
		}

		return -1;		
	}
	//if have winner, o draw
	haveWinner(id, graphicsList) {
		config.effectsLayer.shakeSplitter(1,4,0.4);
		this.gameContainer.position.y = config.height - this.gameContainer.height + this.gameContainer.pivot.y;
		TweenLite.from(this.gameContainer.position, 1, {y:this.gameContainer.position.y + 20, ease:"easeOutElastic"});
		this.ended = true;
		let stdDelay = 0.6;
		let highlightColor = config.palette.playerHightlightColor;
		if(id == 1){
			config.palette.currentGameStateColor = config.palette.winGameColor;
		}else if(id == 2){
			config.palette.currentGameStateColor = config.palette.lostGameColor;
			highlightColor = config.palette.opponentHightlightColor
		}else{
			config.palette.currentGameStateColor = config.palette.drawGameColor;
			highlightColor = config.palette.drawGameColor;
			let element = this.entityMatrix[Math.floor(this.entityMatrix.length / 2)][this.entityMatrix[0].length - 1];
			for (var i = this.entityMatrix.length - 1; i >= 0; i--) {
				for (var j = this.entityMatrix[i].length - 1; j >= 0; j--) {
					TweenLite.to(this.entityMatrix[i][j], 0.5, {tint:highlightColor});
				}
			}
			TweenLite.to(element, 0.5, {tint:config.palette.currentGameStateColor, delay: stdDelay});
			TweenLite.to(element, 1, {x:1.2, y:1.2, delay:stdDelay, ease:"easeOutElastic"});

		}
		this.labelTimer.text = ("IT'S OVER");
		this.labelTimer.style = (this.timerStylePause);
		this.updateInstructions();
		this.labelTimer.position.x = config.width / 2 - this.labelTimer.width / 2 + config.hitCorrection.x;
		
		for (var i = graphicsList.length - 1; i >= 0; i--) {
			TweenLite.to(graphicsList[i], 0.5, {tint:highlightColor, delay:0.3 * i + stdDelay});
			TweenLite.to(graphicsList[i].scale, 1, {x:1.2, y:1.2, delay:0.2 * i + stdDelay, ease:"easeOutElastic"});
		}
		this.removeEvents();
	}
	
	//end game
	endGame(idWinner, element) {
		this.removeEvents();
		let delay = idWinner>0?this.currentConnectFactor * 0.7:1;
		
		this.ended = true;
		TweenLite.to(this, 1, {normalizedDelta:0.2});
		this.removeEvents();
		TweenLite.to(element.parent.scale, 1.5, {delay:delay, x:50,y:50});
		TweenLite.to(element, 0.5, {delay:delay,tint:config.palette.currentGameStateColor});
		let parent = element.parent.parent.parent;
		let elementToChange = element.parent.parent;
		parent.setChildIndex(elementToChange, parent.children.length - 1);

		parent = element.parent.parent;
		elementToChange = element.parent;
		parent.setChildIndex(elementToChange, parent.children.length - 1);

		this.pauseButton.visible = false;
		this.backButton.visible = false;

		let normalX = (this.gameContainer.position.x - this.gameContainer.pivot.x + element.parent.position.x - this.dotRadius / 2) / config.width;
		let normalY = (this.gameContainer.position.y - this.gameContainer.pivot.y + element.parent.position.y - this.dotRadius / 2) / config.height;
		
		config.effectsLayer.addShockwave(normalX,normalY,2, 0);

		let labelStatus = "DRAW";
		if(idWinner == 1){
			labelStatus = "YOU WIN";
			this.endContainer.setStatus("LEVEL "+(config.currentLevel + 1), 0);
		}else if(idWinner == 2){
			labelStatus = "YOU LOOSE";
			this.endContainer.setStatus(labelStatus, 1);
		}else{
			this.endContainer.setStatus("LEVEL "+(config.currentLevel + 1), -1);
		}
		this.labelTimer.text = labelStatus;
		this.labelTimer.position.x = config.width / 2 - this.labelTimer.width / 2 + config.hitCorrection.x;

		
		this.endContainer.show(delay);		
	}
	forceHideGame(){
		this.labelTimer.visible = false;
		this.gameContainer.visible = false;
	}
	forceShowGame(){
		this.labelTimer.visible = true;
		this.gameContainer.visible = true;
	}
	//update dots matrix position
	updateGameplayPosition(){
		TweenLite.killTweensOf(this.gameContainer.scale);
		TweenLite.killTweensOf(this.gameContainer.position);
		TweenLite.killTweensOf(this.gameContainer);
		this.gameContainerSinAcum = 0;
	    this.gameContainerCosAcum = 0;
		this.gameContainerVelocity = {x:0,y:0};
		this.gameContainerScaleBase = {x:1,y:1};
	    this.gameContainer.pivot.x = this.gameContainer.width / 2 / this.gameContainer.scale.x;
	    this.gameContainer.pivot.y = this.gameContainer.height / 2 / this.gameContainer.scale.y;
	    if(!this.initialXPosition){
		    this.initialXPosition = this.gameContainer.pivot.x + config.width/2 - this.gameContainer.width/2 + this.dotRadius * 2;
		    this.initialYPosition = config.height/2 - this.gameContainer.height/2 + this.gameContainer.pivot.y + 30;
		}
	    this.gameContainer.position.x = this.initialXPosition;
	    this.gameContainer.position.y = this.initialYPosition;
	    this.gameContainer.visible = false;
	    this.gameContainer.alpha = 1;
	}
	//remove elements on game matrix
	destroyGameMatrix(){
		if(!this.entityMatrix){
			return;
		}
		for (var i = this.entityMatrix.length - 1; i >= 0; i--) {
			for (var j = this.entityMatrix[i].length - 1; j >= 0; j--) {
				this.entityMatrix[i][j].parent.parent.removeChild(this.entityMatrix[i][j].parent);
			}
		}
		this.entityMatrix = [];
	}
	//init game
	initGameNormal() {
		config.currentLevel = 0;
		this.initGame();
	}
	initGameHardcore() {
		config.currentLevel = config.levels.length - 1;
		this.initGame();
	}
	initGame() {
		this.levelConf = config.levels[config.currentLevel];
		//game bounds
	    this.matrixBounds = this.levelConf.bounds;
	     //connect number
	    this.currentConnectFactor = this.levelConf.connect;
	    this.timerMax = this.levelConf.timer;

		this.labelInstruction.visible = true;
		this.labelTimer.visible = true;
		this.pauseButton.visible = true;

		this.pauseContainer.hide();
		this.endContainer.hide();
		this.pauseButton.visible = true;
		this.backButton.visible = true;
		//destroy graphics, if have
		this.destroyGameMatrix();
		//reset all matrix
		this.gameMatrix = [];
	    this.entityMatrix = [];
	    this.entityColums = [];
	    //create game matrix
	    this.configGameMatrix(this.matrixBounds.i,this.matrixBounds.j);
	    //draw game matrix
	    this.drawMatrix(this.dotRadius, this.dotDistance * 2);
	    //update position of in game
	    this.updateGameplayPosition();
	    //set to player the first turn
		this.playerRound = true;
		this.pause = false;
		//not ended mode
		this.ended = false;
		//normalized time variable
		this.normalizedDelta = 1;
		//hide start button
		TweenLite.killTweensOf(this.startButton.position);
		TweenLite.to(this.startButton.position, 0.4, {delay:0.2, y:config.height + this.startButton.height, ease:"easeInBack"});

		TweenLite.killTweensOf(this.hardCoreButton.position);
		TweenLite.to(this.hardCoreButton.position, 0.4, {y:config.height + this.hardCoreButton.height, ease:"easeInBack"});
		//show game container
		this.gameContainer.visible = true;
		this.gameContainer.alpha = 0;
		this.interactive = true;
		//transition of in game
		TweenLite.killTweensOf(this.gameContainer);
		TweenLite.killTweensOf(this.gameContainer.scale);
		this.gameContainer.scale.set(1);
		this.gameContainer.position.set(this.initialXPosition, this.initialYPosition);
		TweenLite.from(this.gameContainer.scale, 1, {delay:0.3, y:0.1, x:0.1, ease:"easeOutBack"});
		TweenLite.to(this.gameContainer, 0.5, {delay:0.3, alpha:1});
		//set first timer
		this.timer = this.timerMax * 2;
		//start
		this.started = true;

		config.effectsLayer.fadeBloom(10,0,0.3,0, true);


		setTimeout(function(){
			this.addEvents();			
		}.bind(this), 400);

		//this.addEvents();
	}
	//reset timer
	resetTimer(){
		this.timer = this.timerMax;
	}
	//end timer
	endTimer(){
		this.opponentPlay();
		config.effectsLayer.shake(1,5,0.5);
		config.effectsLayer.addShockwave(0.5,0.5,0.5);
		config.effectsLayer.shakeSplitter(1,4,0.4);
		//config.effectsLayer.fadeBloom(100,0,0.3,0, true);
	}
	//destroy game
	destroyGame(){
		this.resetTimer();
		this.started = false;
		this.destroyGameMatrix();
		this.removeEvents();
	}


	//INITIALIZE
	//create matrix based on game bounds
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
	//draw dots on screen
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
		
		utils.applyPositionCorrection(this.gameContainer);
	}
	//

	//SCREEN
	onBackCallback() {
		this.endContainer.hide();
		this.pauseContainer.hide();
		this.backButton.visible = true;
		config.effectsLayer.addShockwave(this.backButton.position.x / config.width,this.backButton.position.y / config.height,0.8);
		// config.effectsLayer.fadeBloom(100,0,0.5,0, true);
		this.backButton.interactive = false;
		TweenLite.to(this.buttonShape.scale, 0.8, {delay:0.2, x:50,y:50, onComplete: this.toInit, onCompleteScope: this});
	}
	toInit(){
		this.destroyGame();
		this.screenManager.change("INIT");
	}


	//PARTICLES
	//update particles position
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
	//create new particles
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
		    let particle = PIXI.Sprite.fromImage('./assets/particle2.png');
		    particle.anchor.set(0.5, 1);
		    particle.scale.set(1, 1);
		    let angle = (Math.random() * 180 + 90) /180 * Math.PI;
		    particle.x = config.width / 2 + Math.sin(angle) * 100;
		    particle.y = config.height / 2 + Math.cos(angle) * 50;
		    particle.alpha = 0;
		    particle.direction = angle;
		    particle.turningSpeed = 0;
		    particle.speed = 1 + Math.random() * 1.5;
		    this.particles.push(particle);
		    this.particlesContainer.addChild(particle);
		}
	}

	//UPDATE
	//update timer
	updateTimer(delta){
		
		if(this.ended){
			return;
		}
		if(this.timer <= 0)
		{
			this.resetTimer();			
			this.endTimer();
			
		}else{
			let rnd1 = String.fromCharCode(Math.floor(Math.random()*20) + 65);
			let rnd2 = Math.floor(Math.random()* 9);
			let rnd3 = String.fromCharCode(Math.floor(Math.random()*20) + 65);
			if(this.pause){

				let pauseLabel = 'PAUSE'.split('');
				let rndPause = Math.random();
				if(rndPause < 0.5){
					pauseLabel[Math.floor(Math.random()*pauseLabel.length)] = rnd3;
				}
				let pauseString = '';
				for (var i = 0; i < pauseLabel.length; i++) {
					pauseString+=pauseLabel[i];
				}
				this.labelTimer.text = (pauseString);
				this.labelTimer.style = (this.timerStylePause);
			}else{
				this.labelTimer.text = (this.timer.toFixed(3)+rnd1+rnd2+rnd3);
				this.labelTimer.style = (this.timerStyleStandard);
			}
			this.updateInstructions();
		}
		this.labelTimer.position.x = config.width / 2 - this.labelTimer.width / 2 + config.hitCorrection.x;
		if(this.pause){

			return;
		}
		this.timer -= delta;
	}
	//game update
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
	createPlayButton(label) {
	    let button = new PIXI.Container()
	    let shape = new PIXI.Graphics()
	    let descriptionLabel = new PIXI.Text(label,{font : '80px super_smash_tvregular', fill : 0xFFFFFF, align : 'right'});
	    let color = 0x00FFFF;
	    shape.beginFill(color);	   
	    shape.drawRect( 0, 0, descriptionLabel.width, descriptionLabel.height );
	    //button.addChild( shape)
	    button.addChild(descriptionLabel);
	    button.interactive = true
	    button.buttonMode = true
	    utils.addMockRect(button, descriptionLabel.width, descriptionLabel.height)
	    descriptionLabel.position.x += 25;
	    return {button:button, size:{width:descriptionLabel.width, height:descriptionLabel.height}}
	}
	createButton(label) {
	    let button = new PIXI.Container()
	    let shape = new PIXI.Graphics()
	    let color = config.palette.gameScreen80;
	   	config.palette.initScreen80 = color;	   
	    shape.beginFill(color);	    
	    shape.drawCircle( 0, 0, config.buttonRadius );
	    button.addChild(shape);
	    let descriptionLabel = new PIXI.Text(label,{font : '50px super_smash_tvregular', fill : 0xFFFFFF, align : 'right'});
	    descriptionLabel.position.y = -20;
	    descriptionLabel.position.x = -10;
	    button.addChild(descriptionLabel);
	    button.interactive = true
	    button.buttonMode = true
	    utils.addMockObject(button);
	    return {button:button, shape:shape}
	}
}
