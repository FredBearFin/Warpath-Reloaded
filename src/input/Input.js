// src/input/Input.js
import { BOMB_TYPES } from '../constants.js';

export class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.mouse = { x:0, y:0 };
    this.isShift = false;
    this.onPlaceBomb = null;
    this.onDeploy = null;
    this.onChangeBomb = null;

    canvas.addEventListener('mousemove', (e)=>{
      this.mouse.x = e.clientX; this.mouse.y = e.clientY;
    });
    canvas.addEventListener('contextmenu', (e)=> e.preventDefault());
    canvas.addEventListener('mousedown', (e)=>{
      e.preventDefault();
      if(this.onPlaceBomb && (e.button===0 || e.button===2)){
        this.onPlaceBomb(this.mouse.x, this.mouse.y);
      }
    });
    canvas.addEventListener('wheel', (e)=>{
      e.preventDefault();
      if(!this.onChangeBomb) return;
      if(e.deltaY < 0) this.onChangeBomb(-1);
      else this.onChangeBomb(+1);
    }, { passive:false });

    window.addEventListener('keydown', (e)=>{
      if(e.code === 'Space'){ this.onDeploy && this.onDeploy(this.isShift ? 'scout' : 'assault'); }
      if(e.key === 'Shift'){ this.isShift = true; }
    });
    window.addEventListener('keyup', (e)=>{
      if(e.key === 'Shift'){ this.isShift = false; }
    });
  }
}
