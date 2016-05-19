import PIXI from 'pixi.js';
import config  from '../../config';
import TweenLite from 'gsap';

export default class Line extends PIXI.Container{
	constructor(speed){
		super();
		this.speed = speed;
		this.line = new PIXI.Sprite(PIXI.Texture.fromImage('./assets/line.png'));
		this.addChild(this.line);
	}
	update(delta){
		this.position.y += this.speed;

		if(this.position.y > config.height){
			this.kill = true;
		}
	}
}