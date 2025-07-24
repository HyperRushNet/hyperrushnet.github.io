// platformer.js
export class Game {
  constructor(canvas, gravity=0.7, friction=0.8) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gravity = gravity;
    this.friction = friction;
    this.player = null;
    this.platforms = [];
    this.beforeDraw = null;
  }
  addPlayer(p) { this.player = p; }
  addPlatform(p) { this.platforms.push(p); }
  loop = () => {
    if (this.beforeDraw) this.beforeDraw();
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.platforms.forEach(p => {
      this.ctx.fillStyle = "#654321";
      this.ctx.fillRect(p.x,p.y,p.w,p.h);
    });
    if (this.player) this.player.draw(this.ctx);
    requestAnimationFrame(this.loop);
  }
  start() { this.loop(); }
}

export class Platform {
  constructor(x,y,w,h){ this.x=x;this.y=y;this.w=w;this.h=h; }
}
