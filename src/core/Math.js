// src/core/Math.js
export class Vec2 {
  constructor(x=0,y=0){ this.x=x; this.y=y; }
  set(x,y){ this.x=x; this.y=y; return this; }
  copy(v){ this.x=v.x; this.y=v.y; return this; }
  add(v){ this.x+=v.x; this.y+=v.y; return this; }
  sub(v){ this.x-=v.x; this.y-=v.y; return this; }
  mul(n){ this.x*=n; this.y*=n; return this; }
  div(n){ if(n!==0){ this.x/=n; this.y/=n; } return this; }
  mag(){ return Math.hypot(this.x,this.y); }
  normalize(){ const m=this.mag(); if(m>0){ this.div(m);} return this; }
  limit(max){ const m=this.mag(); if(m>max){ this.div(m).mul(max);} return this; }
  static sub(a,b){ return new Vec2(a.x-b.x, a.y-b.y); }
}
