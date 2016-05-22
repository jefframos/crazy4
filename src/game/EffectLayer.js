import PIXI from 'pixi.js';
import config  from '../config';
import TweenLite from 'gsap';

export default class EffectLayer extends PIXI.Container{
	constructor(screenManager){
		super();

		this.screenManager = screenManager;

		this.blackShape = new PIXI.Graphics();
		this.blackShape.beginFill(0);
	    this.blackShape.drawRect( 0, 0, config.width, config.height);
	    this.blackShape.alpha = 0;
		this.addChild(this.blackShape);

		this.grey = new PIXI.Graphics();
		this.grey.beginFill(0X555555);
	    this.grey.drawRect( 0, 0, config.width, config.height);
	    this.grey.alpha = 1;
		this.addChild(this.grey);

		this.tvLines = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage('./assets/tvlines.png', config.width, config.height))
		this.addChild(this.tvLines)
		this.tvLines.width = config.width;
		this.tvLines.height = config.height;

		this.tvLines.blendMode = PIXI.BLEND_MODES.ADD;
		
		this.tvShape = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/frontTVsoft.png'))
		this.addChild(this.tvShape)

		this.tvShape.blendMode = PIXI.BLEND_MODES.OVERLAY;


		//RGB SPLITTER
		this.rgpSplit = new PIXI.filters.RGBSplitFilter();
		this.rgpSplit.red = new PIXI.Point(1,1);
		this.rgpSplit.green = new PIXI.Point(-1,-1);
		this.rgpSplit.blue = new PIXI.Point(1,-1);

		//DISPLACEMENT FILTER
		let displacementTexture = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/frontTVDisplacement.jpg'))
		this.addChild(displacementTexture);
		this.displacementFilter = new PIXI.filters.DisplacementFilter(displacementTexture);
		displacementTexture.anchor.set(0.5,0.5);
		displacementTexture.position.set(config.width / 2, config.height / 2);

		//GLITCH 1
		this.glitch1 = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage('./assets/glitch1.jpg', 200, 200))
		this.addChild(this.glitch1)
		this.glitch1.width = 200;
		this.glitch1.height = config.height;
		this.displacementFilterGlitch1 = new PIXI.filters.DisplacementFilter(this.glitch1);


		//BLOOM
		this.bloom = new PIXI.filters.BloomFilter();
		this.bloom.blur = 10;

		//SHOCKWAVE
		this.shockwave = new PIXI.filters.ShockwaveFilter();
		this.shockwave.time = 0;
		this.shockwave.center.x = 0.5;
		this.shockwave.center.y = 0.5;

		this.filtersList = [this.rgpSplit, this.displacementFilter, this.displacementFilterGlitch1, this.bloom, this.shockwave];
		this.filtersActives = [true,true,true,false, false];

		this.updateFilters();
		


	}
	hideGreyShape(time, delay){
		TweenLite.to(this.grey, time, {alpha:0, delay:delay});
	}
	updateFilters(){
		if(config.isJuicy == 0){
			return;
		}
		var filtersToApply = [];
		for (var i = 0; i < this.filtersList.length; i++) {
			
			if(this.filtersActives[i]){
				filtersToApply.push(this.filtersList[i]);
			}
		};
		this.screenManager.filters = filtersToApply.length > 0?filtersToApply:null;
	}
	removeBloom(){
		this.filtersActives[3] = false;
		this.updateFilters();
	}
	addBloom(){
		this.filtersActives[3] = true;		
		this.updateFilters();		
	}

	removeShockwave(){
		this.filtersActives[4] = false;
		this.updateFilters();	
	}
	addShockwave(x,y,time, delay){
		this.filtersActives[4] = true;
		this.updateFilters();
		this.shockwave.time = 0;
		this.shockwave.center.x = x;
		this.shockwave.center.y = y;
		TweenLite.killTweensOf(this.shockwave);
		TweenLite.to(this.shockwave, time, {delay:delay, time:1, onComplete:this.removeShockwave, onCompleteScope: this});
	}

	fadeBloom(initValue, endValue, time, delay, removeAfter){
		this.addBloom();
		this.bloom.blur = initValue;
		if(removeAfter){
			TweenLite.to(this.bloom, time, {delay:delay, blur:endValue, onComplete:this.removeBloom, onCompleteScope: this});
		}else{
			TweenLite.to(this.bloom, time, {delay:delay, blur:endValue});
		}
	}
	shakeSplitter(force, steps, time){
		if(config.isJuicy == 0){
	      return;
	    }
		if(!force){
			force = 1;
		}
		if(!steps){
			steps = 4;
		}
		if(!time){
			time = 1;
		}
		let timelineSplitRed = new TimelineLite();
		let timelineSplitGreen = new TimelineLite();
		let timelineSplitBlue = new TimelineLite();
		let spliterForce = (force * 20);
		let speed = time / steps;
		for (var i = steps; i >= 0; i--) {
			timelineSplitRed.append(TweenLite.to(this.rgpSplit.red, speed, {x:Math.random() * spliterForce - spliterForce/2, y: Math.random() * spliterForce - spliterForce/2, ease:"easeNoneLinear"}));
			timelineSplitGreen.append(TweenLite.to(this.rgpSplit.green, speed, {x:Math.random() * spliterForce - spliterForce/2, y: Math.random() * spliterForce - spliterForce/2, ease:"easeNoneLinear"}));
			timelineSplitBlue.append(TweenLite.to(this.rgpSplit.blue, speed, {x:Math.random() * spliterForce - spliterForce/2, y: Math.random() * spliterForce - spliterForce/2, ease:"easeNoneLinear"}));
		};
		timelineSplitRed.append(TweenLite.to(this.rgpSplit.red, speed, {x:1, y:1, ease:"easeNoneLinear"}));
		timelineSplitGreen.append(TweenLite.to(this.rgpSplit.green, speed, {x:-1, y:-1, ease:"easeNoneLinear"}));
		timelineSplitBlue.append(TweenLite.to(this.rgpSplit.blue, speed, {x:1, y:-1, ease:"easeNoneLinear"}));
	}
	shake(force, steps, time){
		if(config.isJuicy == 0){
	      return;
	    }
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
		let positionForce = (force * 50);
		let spliterForce = (force * 20);
		let speed = time / steps;
		for (var i = steps; i >= 0; i--) {
			timelinePosition.append(TweenLite.to(this.screenManager.position, speed, {x: Math.random() * positionForce - positionForce/2, y: Math.random() * positionForce - positionForce/2, ease:"easeNoneLinear"}));
		};

		timelinePosition.append(TweenLite.to(this.screenManager.position, speed, {x:0, y:0, ease:"easeeaseNoneLinear"}));		
	}

	update(delta){
		this.tvLines.tilePosition.y += Math.random()*2 - 1;
		this.blackShape.alpha =  Math.random() * 0.2;
		this.glitch1.tilePosition.y += 1;
	}
}
