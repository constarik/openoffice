// Extract solution from Open Office puzzle
const UNK=0,WALL=1,EMPTY=2,NOCLUE=-1;
let N=6, difficulty='medium';

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function isOutsideConnected(inside){
  const P=N+2,pad=[];
  for(let r=0;r<P;r++){pad[r]=[];for(let c=0;c<P;c++)pad[r][c]=(r>0&&r<=N&&c>0&&c<=N)?inside[r-1][c-1]:false;}
  const vis=[];for(let r=0;r<P;r++){vis[r]=[];for(let c=0;c<P;c++)vis[r][c]=false;}
  const q=[[0,0]];vis[0][0]=true;let cnt=1;
  while(q.length){const[r,c]=q.shift();for(const[dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]]){
    const nr=r+dr,nc=c+dc;if(nr>=0&&nr<P&&nc>=0&&nc<P&&!pad[nr][nc]&&!vis[nr][nc]){vis[nr][nc]=true;q.push([nr,nc]);cnt++;}}}
  let total=0;for(let r=0;r<P;r++)for(let c=0;c<P;c++)if(!pad[r][c])total++;
  return cnt===total;
}

function generateLoop(rng){
  for(let att=0;att<200;att++){
    const inside=[];for(let r=0;r<N;r++){inside[r]=[];for(let c=0;c<N;c++)inside[r][c]=false;}
    const sr=Math.floor(rng()*N),sc=Math.floor(rng()*N);
    inside[sr][sc]=true;let sz=1;
    const target=Math.max(3,Math.floor(N*N*(0.2+rng()*0.3)));
    let stuck=0;
    while(sz<target&&stuck<200){
      const cands=[];
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){
        if(inside[r][c])continue;let adj=false;
        for(const[dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]]){const nr=r+dr,nc=c+dc;
          if(nr>=0&&nr<N&&nc>=0&&nc<N&&inside[nr][nc])adj=true;}
        if(adj)cands.push([r,c]);}
      if(!cands.length)break;
      const[cr,cc]=cands[Math.floor(rng()*cands.length)];
      inside[cr][cc]=true;
      if(isOutsideConnected(inside)){sz++;stuck=0;}else{inside[cr][cc]=false;stuck++;}
    }
    if(sz<3)continue;
    const hE=[],vE=[];
    for(let r=0;r<=N;r++){hE[r]=[];for(let c=0;c<N;c++)hE[r][c]=0;}
    for(let r=0;r<N;r++){vE[r]=[];for(let c=0;c<=N;c++)vE[r][c]=0;}
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){
      if(!inside[r][c])continue;
      if(r===0||!inside[r-1][c])hE[r][c]=1;
      if(r===N-1||!inside[r+1][c])hE[r+1][c]=1;
      if(c===0||!inside[r][c-1])vE[r][c]=1;
      if(c===N-1||!inside[r][c+1])vE[r][c+1]=1;
    }
    let edgeCnt=0;
    for(let r=0;r<=N;r++)for(let c=0;c<N;c++)if(hE[r][c])edgeCnt++;
    for(let r=0;r<N;r++)for(let c=0;c<=N;c++)if(vE[r][c])edgeCnt++;
    if(edgeCnt<2*N)continue;
    if(!verifyLoop(hE,vE))continue;
    return{hE,vE};
  }
  return null;
}

function verifyLoop(hE,vE){
  for(let vr=0;vr<=N;vr++)for(let vc=0;vc<=N;vc++){
    let d=0;
    if(vc<N&&hE[vr][vc])d++;if(vc>0&&hE[vr][vc-1])d++;
    if(vr<N&&vE[vr][vc])d++;if(vr>0&&vE[vr-1][vc])d++;
    if(d!==0&&d!==2)return false;}
  let svr=-1,svc=-1,total=0;
  for(let vr=0;vr<=N&&svr===-1;vr++)for(let vc=0;vc<=N&&svr===-1;vc++){
    let d=0;if(vc<N&&hE[vr][vc])d++;if(vc>0&&hE[vr][vc-1])d++;
    if(vr<N&&vE[vr][vc])d++;if(vr>0&&vE[vr-1][vc])d++;
    if(d===2){svr=vr;svc=vc;}}
  if(svr===-1)return false;
  for(let r=0;r<=N;r++)for(let c=0;c<N;c++)if(hE[r][c])total++;
  for(let r=0;r<N;r++)for(let c=0;c<=N;c++)if(vE[r][c])total++;
  let cr=svr,cc=svc,pr=-1,pc=-1,traced=0;
  do{
    let nr=-1,nc=-1;
    if(cc<N&&hE[cr][cc]&&!(cr===pr&&cc+1===pc)){nr=cr;nc=cc+1;}
    if(nr===-1&&cc>0&&hE[cr][cc-1]&&!(cr===pr&&cc-1===pc)){nr=cr;nc=cc-1;}
    if(nr===-1&&cr<N&&vE[cr][cc]&&!(cr+1===pr&&cc===pc)){nr=cr+1;nc=cc;}
    if(nr===-1&&cr>0&&vE[cr-1][cc]&&!(cr-1===pr&&cc===pc)){nr=cr-1;nc=cc;}
    if(nr===-1)return false;
    traced++;pr=cr;pc=cc;cr=nr;cc=nc;
  }while(cr!==svr||cc!==svc);
  return traced===total;
}

function computeClues(hE,vE){
  const cl=[];
  for(let r=0;r<N;r++){cl[r]=[];for(let c=0;c<N;c++){
    let n=0;if(hE[r][c])n++;if(hE[r+1][c])n++;if(vE[r][c])n++;if(vE[r][c+1])n++;
    cl[r][c]=n;}}
  return cl;
}

function cloneSt(st){return{h:st.h.map(r=>[...r]),v:st.v.map(r=>[...r])};}
function cellEdges(r,c){return[{t:'h',vr:r,vc:c},{t:'h',vr:r+1,vc:c},{t:'v',vr:r,vc:c},{t:'v',vr:r,vc:c+1}];}
function vertexEdges(vr,vc){
  const e=[];
  if(vc<N)e.push({t:'h',vr,vc});if(vc>0)e.push({t:'h',vr,vc:vc-1});
  if(vr<N)e.push({t:'v',vr,vc});if(vr>0)e.push({t:'v',vr:vr-1,vc});
  return e;
}
function getE(st,e){return e.t==='h'?st.h[e.vr][e.vc]:st.v[e.vr][e.vc];}
function setE(st,e,val){if(e.t==='h')st.h[e.vr][e.vc]=val;else st.v[e.vr][e.vc]=val;}

function propagate(st,cl){
  let changed=true;
  while(changed){changed=false;
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){
      if(cl[r][c]===NOCLUE)continue;const need=cl[r][c],edges=cellEdges(r,c);
      let w=0,u=0;const unk=[];
      for(const e of edges){const s=getE(st,e);if(s===WALL)w++;else if(s===UNK){u++;unk.push(e);}}
      if(w>need||w+u<need)return false;
      if(u===0)continue;
      if(w===need){for(const e of unk){setE(st,e,EMPTY);changed=true;}}
      else if(w+u===need){for(const e of unk){setE(st,e,WALL);changed=true;}}
    }
    for(let vr=0;vr<=N;vr++)for(let vc=0;vc<=N;vc++){
      const edges=vertexEdges(vr,vc);
      let w=0,u=0;const unk=[];
      for(const e of edges){const s=getE(st,e);if(s===WALL)w++;else if(s===UNK){u++;unk.push(e);}}
      if(w>2)return false;if(w===1&&u===0)return false;if(w+u<2&&w>0)return false;
      if(u===0)continue;
      if(w===2){for(const e of unk){setE(st,e,EMPTY);changed=true;}}
      if(w===1&&u===1){for(const e of unk){setE(st,e,WALL);changed=true;}}
      if(w===0&&u===1){for(const e of unk){setE(st,e,EMPTY);changed=true;}}
    }
  }
  return true;
}

function isComplete(st){
  for(let r=0;r<=N;r++)for(let c=0;c<N;c++)if(st.h[r][c]===UNK)return false;
  for(let r=0;r<N;r++)for(let c=0;c<=N;c++)if(st.v[r][c]===UNK)return false;
  return true;
}

function isValidSolution(st){
  return verifyLoop(st.h.map(r=>r.map(v=>v===WALL?1:0)),st.v.map(r=>r.map(v=>v===WALL?1:0)));
}

function solveCount(cl,maxSol){
  const initSt={h:[],v:[]};
  for(let r=0;r<=N;r++){initSt.h[r]=[];for(let c=0;c<N;c++)initSt.h[r][c]=UNK;}
  for(let r=0;r<N;r++){initSt.v[r]=[];for(let c=0;c<=N;c++)initSt.v[r][c]=UNK;}
  let count=0,calls=0;const MAX=500000;
  function bt(st){
    if(count>=maxSol||calls>MAX)return;calls++;
    const s=cloneSt(st);
    if(!propagate(s,cl))return;
    if(isComplete(s)){if(isValidSolution(s))count++;return;}
    let fe=null;
    for(let r=0;r<=N&&!fe;r++)for(let c=0;c<N&&!fe;c++)if(s.h[r][c]===UNK)fe={t:'h',vr:r,vc:c};
    if(!fe)for(let r=0;r<N&&!fe;r++)for(let c=0;c<=N&&!fe;c++)if(s.v[r][c]===UNK)fe={t:'v',vr:r,vc:c};
    if(!fe)return;
    for(const val of[WALL,EMPTY]){if(count>=maxSol)break;const ns=cloneSt(s);setE(ns,fe,val);bt(ns);}
  }
  bt(initSt);return count;
}

function generatePuzzle(rng){
  const pctHide=difficulty==='easy'?0:difficulty==='medium'?0.3:0.5;
  for(let att=0;att<100;att++){
    const loop=generateLoop(rng);if(!loop)continue;
    const{hE,vE}=loop;
    const cl=computeClues(hE,vE);
    const allCells=[];
    for(let r=0;r<N;r++)for(let c=0;c<N;c++)allCells.push([r,c]);
    for(let i=allCells.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[allCells[i],allCells[j]]=[allCells[j],allCells[i]];}
    const visible=cl.map(r=>[...r]);
    let removed=0;const target=Math.floor(N*N*pctHide);
    for(const[r,c]of allCells){
      if(removed>=target)break;
      const saved=visible[r][c];visible[r][c]=NOCLUE;
      if(solveCount(visible,2)===1){removed++;}else{visible[r][c]=saved;}
    }
    if(solveCount(visible,2)===1)return{hE,vE,clues:visible};
  }
  return null;
}

// Generate the puzzle
const seed = 1770294898444;
const rng = mulberry32(seed);
console.log("Generating puzzle with seed:", seed);
const result = generatePuzzle(rng);

if(result){
  console.log("\n=== CLUES (visible numbers, -1=hidden) ===");
  for(let r=0;r<N;r++) console.log("Row "+r+":", result.clues[r].join(" "));
  
  console.log("\n=== SOLUTION - Horizontal edges (solH) ===");
  for(let r=0;r<=N;r++) console.log("hRow "+r+":", result.hE[r].join(" "));
  
  console.log("\n=== SOLUTION - Vertical edges (solV) ===");
  for(let r=0;r<N;r++) console.log("vRow "+r+":", result.vE[r].join(" "));

  // Now simulate: for each possible edge, try clicking it (set to WALL)
  // and run autoDeduct to see if the whole board gets solved
  console.log("\n=== TESTING 1-CLICK WINS ===");
  
  function autoDeductSim(pH, pV, cl){
    let changed=true, steps=0;
    while(changed){changed=false; steps++;
      for(let r=0;r<N;r++)for(let c=0;c<N;c++){
        if(cl[r][c]===NOCLUE)continue;const need=cl[r][c];
        const edges=cellEdges(r,c);
        let w=0,u=0;const unk=[];
        for(const e of edges){const s=e.t==='h'?pH[e.vr][e.vc]:pV[e.vr][e.vc];
          if(s===WALL)w++;else if(s===UNK){u++;unk.push(e);}}
        if(u===0)continue;
        if(w===need){for(const e of unk){const a=e.t==='h'?pH:pV;a[e.vr][e.vc]=EMPTY;changed=true;}}
        else if(w+u===need){for(const e of unk){const a=e.t==='h'?pH:pV;a[e.vr][e.vc]=WALL;changed=true;}}
      }
      for(let vr=0;vr<=N;vr++)for(let vc=0;vc<=N;vc++){
        const edges=vertexEdges(vr,vc);let w=0,u=0;const unk=[];
        for(const e of edges){const s=e.t==='h'?pH[e.vr][e.vc]:pV[e.vr][e.vc];
          if(s===WALL)w++;else if(s===UNK){u++;unk.push(e);}}
        if(u===0)continue;
        if(w===2){for(const e of unk){const a=e.t==='h'?pH:pV;a[e.vr][e.vc]=EMPTY;changed=true;}}
        if(w===1&&u===1){for(const e of unk){const a=e.t==='h'?pH:pV;a[e.vr][e.vc]=WALL;changed=true;}}
        if(w===0&&u===1){for(const e of unk){const a=e.t==='h'?pH:pV;a[e.vr][e.vc]=EMPTY;changed=true;}}
      }
    }
    // Check if complete
    let complete = true;
    for(let r=0;r<=N;r++)for(let c=0;c<N;c++)if(pH[r][c]===UNK) complete=false;
    for(let r=0;r<N;r++)for(let c=0;c<=N;c++)if(pV[r][c]===UNK) complete=false;
    return complete;
  }

  // Try every WALL edge as 1-click
  let found = false;
  // Try horizontal edges
  for(let r=0;r<=N;r++)for(let c=0;c<N;c++){
    if(result.hE[r][c]===1){ // This is a WALL in solution
      let pH=[];for(let i=0;i<=N;i++){pH[i]=[];for(let j=0;j<N;j++)pH[i][j]=UNK;}
      let pV=[];for(let i=0;i<N;i++){pV[i]=[];for(let j=0;j<=N;j++)pV[i][j]=UNK;}
      pH[r][c]=WALL;
      if(autoDeductSim(pH,pV,result.clues)){
        // Verify it matches solution
        let ok=true;
        for(let i=0;i<=N;i++)for(let j=0;j<N;j++)
          if((pH[i][j]===WALL)!==(result.hE[i][j]===1))ok=false;
        for(let i=0;i<N;i++)for(let j=0;j<=N;j++)
          if((pV[i][j]===WALL)!==(result.vE[i][j]===1))ok=false;
        if(ok){
          console.log("WINNER! Click H-edge at row="+r+", col="+c+" (wall mode)");
          found=true;
        }
      }
    }
  }
  // Try vertical edges
  for(let r=0;r<N;r++)for(let c=0;c<=N;c++){
    if(result.vE[r][c]===1){
      let pH=[];for(let i=0;i<=N;i++){pH[i]=[];for(let j=0;j<N;j++)pH[i][j]=UNK;}
      let pV=[];for(let i=0;i<N;i++){pV[i]=[];for(let j=0;j<=N;j++)pV[i][j]=UNK;}
      pV[r][c]=WALL;
      if(autoDeductSim(pH,pV,result.clues)){
        let ok=true;
        for(let i=0;i<=N;i++)for(let j=0;j<N;j++)
          if((pH[i][j]===WALL)!==(result.hE[i][j]===1))ok=false;
        for(let i=0;i<N;i++)for(let j=0;j<=N;j++)
          if((pV[i][j]===WALL)!==(result.vE[i][j]===1))ok=false;
        if(ok){
          console.log("WINNER! Click V-edge at row="+r+", col="+c+" (wall mode)");
          found=true;
        }
      }
    }
  }
  
  // Also try EMPTY edges (X mode)
  for(let r=0;r<=N;r++)for(let c=0;c<N;c++){
    if(result.hE[r][c]===0){ // This is EMPTY in solution
      let pH=[];for(let i=0;i<=N;i++){pH[i]=[];for(let j=0;j<N;j++)pH[i][j]=UNK;}
      let pV=[];for(let i=0;i<N;i++){pV[i]=[];for(let j=0;j<=N;j++)pV[i][j]=UNK;}
      pH[r][c]=EMPTY;
      if(autoDeductSim(pH,pV,result.clues)){
        let ok=true;
        for(let i=0;i<=N;i++)for(let j=0;j<N;j++)
          if((pH[i][j]===WALL)!==(result.hE[i][j]===1))ok=false;
        for(let i=0;i<N;i++)for(let j=0;j<=N;j++)
          if((pV[i][j]===WALL)!==(result.vE[i][j]===1))ok=false;
        if(ok){
          console.log("WINNER! Click H-edge at row="+r+", col="+c+" (empty/X mode)");
          found=true;
        }
      }
    }
  }
  for(let r=0;r<N;r++)for(let c=0;c<=N;c++){
    if(result.vE[r][c]===0){
      let pH=[];for(let i=0;i<=N;i++){pH[i]=[];for(let j=0;j<N;j++)pH[i][j]=UNK;}
      let pV=[];for(let i=0;i<N;i++){pV[i]=[];for(let j=0;j<=N;j++)pV[i][j]=UNK;}
      pV[r][c]=EMPTY;
      if(autoDeductSim(pH,pV,result.clues)){
        let ok=true;
        for(let i=0;i<=N;i++)for(let j=0;j<N;j++)
          if((pH[i][j]===WALL)!==(result.hE[i][j]===1))ok=false;
        for(let i=0;i<N;i++)for(let j=0;j<=N;j++)
          if((pV[i][j]===WALL)!==(result.vE[i][j]===1))ok=false;
        if(ok){
          console.log("WINNER! Click V-edge at row="+r+", col="+c+" (empty/X mode)");
          found=true;
        }
      }
    }
  }
  
  if(!found) console.log("No single-click win found - need multiple clicks");
} else {
  console.log("Failed to generate puzzle");
}
