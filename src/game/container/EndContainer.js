import PIXI from 'pixi.js';
import config  from '../../config';
import utils  from '../../utils';
import TweenLite from 'gsap';

export default class EndContainer extends PIXI.Container{
	constructor(screen){
		super();
		this.screen = screen;
		let buttonDistance = 65;

	    this.status = new PIXI.Text('---',{font : '150px super_smash_tvregular', fill : 0xFFFFFF, align : 'right', dropShadow:true, dropShadowColor:'#666666'});
	    this.addChild(this.status);
	    this.status.position.set(config.width/2 - this.status.width/2, 0);

		let reestartButtonConfig = this.createButton("REESTART");
		this.reestartButton = reestartButtonConfig.button;
		this.addChild(this.reestartButton);
		this.reestartButton.position.set(config.width / 2 -reestartButtonConfig.size.width/2, config.height/2 + reestartButtonConfig.size.height/2);

		let backButtonConfig = this.createButton("BACK");
		this.backButton = backButtonConfig.button;
		this.addChild(this.backButton);
		this.backButton.position.set(config.width / 2 -backButtonConfig.size.width/2, this.reestartButton.position.y + buttonDistance);
	}
	setStatus(label){
		this.status.text = label;
		this.status.position.set(config.width/2 - this.status.width/2, 0);
	}
	show(delay){
		this.visible = true;
		TweenLite.to(this.position, 1, {delay:delay?delay:0,y:0, ease:"easeOutBack"});
		this.status.position.y = -500;
		this.status.alpha = 1;
		TweenLite.to(this.status.position, 1, {delay:delay?delay+0.5:0.5,y:30, ease:"easeOutBack"});
		this.addEvents();
	}
	hide(force){
		TweenLite.to(this.status, 1, {alpha:0});
		TweenLite.to(this.status.position, 1, {y:-500});
		TweenLite.to(this.position, force?0:1, {y:config.height / 2, ease:"easeOutBack", onComplete: this.disable, onCompleteScope: this});
		this.removeEvents();
	}
	disable() {
		this.visible = false;
	}
	removeEvents(){
		this.reestartButton.off('tap').off('click');
		this.backButton.off('tap').off('click');
	}
	addEvents(){		
	    this.reestartButton.on('tap', this.onReestartCallback.bind(this)).on('click', this.onReestartCallback.bind(this));	    
	    this.backButton.on('tap', this.onBackCallback.bind(this)).on('click', this.onBackCallback.bind(this));
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