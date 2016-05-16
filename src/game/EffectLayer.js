import PIXI from 'pixi.js';
import config  from '../config';
import TweenLite from 'gsap';

export default class EffectLayer extends PIXI.Container{
	constructor(screenManager){
		super();

		this.screenManager = screenManager;

		this.tvLines = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage('./assets/tvlines.png', config.width, config.height))
		this.addChild(this.tvLines)
		this.tvLines.width = config.width;
		this.tvLines.height = config.height;

		this.tvLines.blendMode = PIXI.BLEND_MODES.ADD;
		
		this.tvShape = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/frontTVsoft.png'))
		this.addChild(this.tvShape)

		this.tvShape.blendMode = PIXI.BLEND_MODES.OVERLAY;


		this.rgpSplit = new PIXI.filters.RGBSplitFilter();
		this.rgpSplit.red = new PIXI.Point(1,1);
		this.rgpSplit.green = new PIXI.Point(-1,-1);
		this.rgpSplit.blue = new PIXI.Point(1,-1);
		this.rgpSplit.padding = 5;
		let displacementTexture = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/frontTVDisplacement.jpg'))
		this.addChild(displacementTexture);
		this.displacementFilter = new PIXI.filters.DisplacementFilter(displacementTexture);
		displacementTexture.anchor.set(0.5,0.5);
		displacementTexture.position.set(config.width / 2, config.height / 2);


		this.glitch1 = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage('./assets/glitch1.jpg', 200, 200))
		//this.addChild(this.glitch1)
		this.glitch1.width = 200;
		this.glitch1.height = config.height;
		this.displacementFilterGlitch1 = new PIXI.filters.DisplacementFilter(this.glitch1);

		this.screenManager.filters = [this.rgpSplit, this.displacementFilter, this.displacementFilterGlitch1];

	}

	update(delta){

		this.tvLines.tilePosition.y += 1;
	}

	shake(force, steps, time){
		if(!force){
			force = 1;
		}
		if(!steps){
			steps = 4;
		}
		if(!time){
			time = 1;
		}
		let timelinePosition = new TimelineLite();
		let timelineSplitRed = new TimelineLite();
		let timelineSplitGreen = new TimelineLite();
		let timelineSplitBlue = new TimelineLite();
		let positionForce = (force * 50);
		let spliterForce = (force * 20);
		let speed = time / steps;
		for (var i = 4; i >= 0; i--) {
			timelinePosition.append(TweenLite.to(this.screenManager.position, speed, {x: Math.random() * positionForce - positionForce/2, y: Math.random() * positionForce - positionForce/2, ease:"easeNoneLinear"}));
			timelineSplitRed.append(TweenLite.to(this.rgpSplit.red, speed, {x:Math.random() * spliterForce - spliterForce/2, y: Math.random() * spliterForce - spliterForce/2, ease:"easeNoneLinear"}));
			timelineSplitGreen.append(TweenLite.to(this.rgpSplit.green, speed, {x:Math.random() * spliterForce - spliterForce/2, y: Math.random() * spliterForce - spliterForce/2, ease:"easeNoneLinear"}));
			timelineSplitBlue.append(TweenLite.to(this.rgpSplit.blue, speed, {x:Math.random() * spliterForce - spliterForce/2, y: Math.random() * spliterForce - spliterForce/2, ease:"easeNoneLinear"}));
		};

		timelinePosition.append(TweenLite.to(this.screenManager.position, speed, {x:0, y:0, ease:"easeeaseNoneLinear"}));
		timelineSplitRed.append(TweenLite.to(this.rgpSplit.red, speed, {x:1, y:1, ease:"easeNoneLinear"}));
		timelineSplitGreen.append(TweenLite.to(this.rgpSplit.green, speed, {x:-1, y:-1, ease:"easeNoneLinear"}));
		timelineSplitBlue.append(TweenLite.to(this.rgpSplit.blue, speed, {x:1, y:-1, ease:"easeNoneLinear"}));
		
	}
}
