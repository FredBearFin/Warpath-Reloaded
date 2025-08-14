// src/ui/ui.js
import { BOMB_TYPES, BOMB_CLIP_SIZE } from '../constants.js';

export class UI {
  constructor(rootEl){
    this.root = rootEl;
    this.refs = {
      p1Score: document.getElementById('p1Score'),
      p2Score: document.getElementById('p2Score'),
      p1Drones: document.getElementById('p1Drones'),
      p2Drones: document.getElementById('p2Drones'),
      gameTimer: document.getElementById('gameTimer'),
      endScreen: document.getElementById('endScreen'),
      endTitle: document.getElementById('endTitle'),
      endSubtitle: document.getElementById('endSubtitle'),
      restartBtn: document.getElementById('restartBtn'),
      bombDisplays: {}, bombCounts: {}, bombPips:{}, bombCooldowns:{}
    };
    for(const t of BOMB_TYPES){
      this.refs.bombDisplays[t] = document.getElementById(`b_${t}`);
      this.refs.bombCounts[t] = document.getElementById(`b_${t}_count`);
      this.refs.bombPips[t] = document.getElementById(`b_${t}_pips`);
      this.refs.bombCooldowns[t] = document.getElementById(`b_${t}_cooldown`);
    }
    this._lastDomUpdate = 0;
    this._domHz = 10; // 10 FPS UI updates
  }

  bindRestart(onRestart){
    this.refs.restartBtn.addEventListener('click', onRestart);
  }

  update(game, now){
    if(now - this._lastDomUpdate < 1000 / this._domHz) return;
    this._lastDomUpdate = now;

    const p1 = game.players[0], p2 = game.players[1];
    this.refs.p1Score.textContent = p1.score;
    this.refs.p2Score.textContent = p2.score;
    this.refs.p1Drones.textContent = p1.dronesRemaining;
    this.refs.p2Drones.textContent = p2.dronesRemaining;

    // bombs (p1 only)
    BOMB_TYPES.forEach((t, idx) => {
      const sys = p1.bombSystems[t];
      this.refs.bombCounts[t].textContent = p1.bombsRemaining[t];
      this.refs.bombDisplays[t].classList.toggle('active', idx===game.activeBombIndex);

      // pips
      let html = '';
      for(let i=0;i<BOMB_CLIP_SIZE;i++){
        html += `<div class="pip ${i>=sys.clip ? 'empty':''}"></div>`;
      }
      this.refs.bombPips[t].innerHTML = html;

      // cooldown
      if(sys.isOverheated){
        const progress = (game.time - sys.overheatStartTime) / game.cooldowns[t];
        this.refs.bombCooldowns[t].style.width = `${Math.min(progress*100, 100)}%`;
      }else{
        this.refs.bombCooldowns[t].style.width = '0%';
      }
    });

    // timer
    const minutes = Math.floor(game.gameTimer / 60000);
    const seconds = Math.floor((game.gameTimer % 60000) / 1000);
    this.refs.gameTimer.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  }

  showEnd(title, subtitle){
    this.refs.endTitle.textContent = title;
    this.refs.endSubtitle.textContent = subtitle;
    this.refs.endScreen.classList.remove('hidden');
  }

  hideEnd(){
    this.refs.endScreen.classList.add('hidden');
  }

  screenShakeOn(){
    this.root.classList.add('screen-shake');
    setTimeout(()=> this.root.classList.remove('screen-shake'), 500);
  }
}
