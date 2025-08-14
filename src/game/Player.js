// src/game/Player.js
import { BOMB_TYPES, BOMB_CLIP_SIZE, BOMB_OVERHEAT_COOLDOWN, DRONE_WAVE_SIZES } from '../constants.js';

export class Player {
  constructor(id, color, direction){
    this.id = id;
    this.color = color;
    this.direction = direction; // 1 goes down, -1 goes up
    this.isAI = (id === 2);
    this.reset();
  }
  reset(){
    this.score = 0;
    this.dronesRemaining = 250;
    this.bombsRemaining = { micro: 20, standard: 10, heavy: 5 };
    this.bombSystems = {};
    for(const t of BOMB_TYPES){
      this.bombSystems[t] = { clip: BOMB_CLIP_SIZE, isOverheated:false, overheatStartTime: -Infinity };
    }
  }
  tick(dt, game){
    // cool down weapons
    for(const t of BOMB_TYPES){
      const sys = this.bombSystems[t];
      if(sys.isOverheated && game.time - sys.overheatStartTime > BOMB_OVERHEAT_COOLDOWN[t]){
        sys.isOverheated = false;
        sys.clip = BOMB_CLIP_SIZE;
      }
    }
    if(this.isAI) this._ai(dt, game);
  }
  _ai(dt, game){
    // Bombing logic (only target player's drones inside warpath)
    const warTop = game.dim.warpathTop, warBot = game.dim.warpathBottom;
    const candidates = game.drones.filter(d => d.owner.id===1 && d.pos.y>warTop && d.pos.y<warBot);
    if(candidates.length > 20){
      const bombToUse = BOMB_TYPES[(Math.random()*BOMB_TYPES.length)|0];
      const sys = this.bombSystems[bombToUse];
      if(!sys.isOverheated && this.bombsRemaining[bombToUse] > 0){
        const target = candidates[(Math.random()*candidates.length)|0];
        game.placeBomb(target.pos.x, target.pos.y, this, bombToUse);
      }
    }
    // Deployment logic (random trickle)
    if(this.dronesRemaining > 0 && Math.random() < 0.01){
      const waveType = Math.random() < 0.7 ? 'scout' : 'assault';
      game.deployDrones(this, waveType);
    }
  }
}
