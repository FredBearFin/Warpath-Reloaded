// src/core/SpatialGrid.js
// Lightweight uniform grid for neighbor queries (flocking/explosions)
// Reduces O(N^2) scans to ~O(N)
export class SpatialGrid {
  constructor(cellSize=48){
    this.cellSize = cellSize;
    this.map = new Map();
  }
  _key(cx,cy){ return (cx<<16) ^ cy; }
  clear(){ this.map.clear(); }
  insert(entity, x, y){
    const cx = Math.floor(x/this.cellSize);
    const cy = Math.floor(y/this.cellSize);
    const k = this._key(cx,cy);
    let bucket = this.map.get(k);
    if(!bucket){ bucket = []; this.map.set(k,bucket); }
    bucket.push(entity);
    entity._cell = k;
  }
  neighbors(x,y,radius){
    const cs = this.cellSize;
    const minX = Math.floor((x-radius)/cs);
    const maxX = Math.floor((x+radius)/cs);
    const minY = Math.floor((y-radius)/cs);
    const maxY = Math.floor((y+radius)/cs);
    const out = [];
    for(let cy=minY; cy<=maxY; cy++){
      for(let cx=minX; cx<=maxX; cx++){
        const b = this.map.get(this._key(cx,cy));
        if(b) out.push(...b);
      }
    }
    return out;
  }
}
