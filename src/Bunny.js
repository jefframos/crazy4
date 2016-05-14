import PIXI from 'pixi.js';

export default class Bunny extends PIXI.Sprite{
	velocity = {x:0, y:0};
	constructor(){
		super(PIXI.Texture.fromImage('./assets/bunny.png'));
		this.anchor.set(0.5);
	}

	update(delta){
		this.rotation += 5*delta;
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}
