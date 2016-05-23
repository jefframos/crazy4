import PIXI from 'pixi.js';
import config  from '../../config';
import utils  from '../../utils';
import TweenLite from 'gsap';

export default class PauseContainer extends PIXI.Container{
	constructor(screen){
		super();
		this.screen = screen;
		let buttonDistance = 65;
		let continueButtonConfig = this.createButton("CONTINUE");
		this.continueButton = continueButtonConfig.button;
		this.addChild(this.continueButton);
		this.continueButton.position.set(config.width / 2 -continueButtonConfig.size.width/2, config.height/2 + continueButtonConfig.size.height/2);

		let reestartButtonConfig = this.createButton("RESTART");
		this.reestartButton = reestartButtonConfig.button;
		this.addChild(this.reestartButton);
		this.reestartButton.position.set(config.width / 2 -reestartButtonConfig.size.width/2, this.continueButton.position.y + buttonDistance);

		let backButtonConfig = this.createButton("BACK");
		this.backButton = backButtonConfig.button;
		this.addChild(this.backButton);
		this.backButton.position.set(config.width / 2 -backButtonConfig.size.width/2, this.reestartButton.position.y + buttonDistance);
		// utils.applyPositionCorrection(this);
	}
	show(){
		this.visible = true;
		TweenLite.to(this.position, 1, {y:0, ease:"easeOutBack"});
		this.addEvents();
	}
	hide(force){
		TweenLite.to(this.position, force?0:1, {y:config.height / 2, ease:"easeOutBack", onComplete: this.disable, onCompleteScope: this});
		this.removeEvents();
	}
	disable() {
		this.visible = false;
	}
	removeEvents(){		
		this.reestartButton.off('tap').off('click');
		this.backButton.off('tap').off('click');
		this.continueButton.off('tap').off('click');
	}
	addEvents(){
		this.removeEvents();		
	    this.reestartButton.on('tap', this.onReestartCallback.bind(this)).on('click', this.onReestartCallback.bind(this));	    
	    this.backButton.on('tap', this.onBackCallback.bind(this)).on('click', this.onBackCallback.bind(this));	    
	    this.continueButton.on('tap', this.onContinueCallback.bind(this)).on('click', this.onContinueCallback.bind(this));    
	}
	onReestartCallback(){
		this.screen.initGame();	
	}
	onBackCallback(){		
		this.screen.onBackCallback();
	}
	onContinueCallback(){		
		this.screen.onPauseCallback();
	}
	createButton(label) {
	    let button = new PIXI.Container()
	    let descriptionLabel = new PIXI.Text(label,{font : '50px super_smash_tvregular', fill : 0xFFFFFF, align : 'right'});
	    let color = 0x00FFFF;
	    button.addChild(descriptionLabel);
	    button.interactive = true
	    button.buttonMode = true
	    utils.addMockRect(button, descriptionLabel.width, descriptionLabel.height)
	    return {button:button, size:{width:descriptionLabel.width, height:descriptionLabel.height}}
	}
}