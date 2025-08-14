// src/core/Engine.js
import { FIXED_DT, MAX_STEPS, DPR } from '../constants.js';

export class Engine {
  constructor(update, render){
    this.updateFn = update;
    this.renderFn = render;
    this.acc = 0;
    this.last = 0;
    this.running = false;
    this.canvas = null;
    this.ctx = null;
    this.dim = { w: 0, h: 0, warpathTop: 0, warpathBottom: 0 };
  }

  attachCanvas(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.dim.w = w; this.dim.h = h;
      this.dim.warpathTop = h/3; this.dim.warpathBottom = h*2/3;
      this.canvas.width = Math.floor(w * DPR);
      this.canvas.height = Math.floor(h * DPR);
      this.canvas.style.width = w+'px';
      this.canvas.style.height = h+'px';
      // reset transform (avoid compounding scale)
      this.ctx.setTransform(DPR,0,0,DPR,0,0);
    };
    window.addEventListener('resize', onResize);
    onResize();
  }

  start(){
    if(this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if(!this.running) return;
      let dt = now - this.last;
      if (dt > 100) dt = 100; // clamp big frame gaps
      this.last = now;
      this.acc += dt;
      let steps = 0;
      while(this.acc >= FIXED_DT && steps < MAX_STEPS){
        this.updateFn(FIXED_DT);
        this.acc -= FIXED_DT;
        steps++;
      }
      this.renderFn(this.ctx, this.dim);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop(){ this.running = false; }
}
