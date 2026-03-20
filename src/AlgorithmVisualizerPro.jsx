import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   ALGORITHM VISUALIZER PRO  ·  Ultra-Premium Edition
   Particle canvas · Neon glow · Cinematic animations
═══════════════════════════════════════════════════════════ */

const G = {
  bg:       "#050508",
  surface:  "#0c0d14",
  card:     "#0f1020",
  border:   "#1e2040",
  violet:   "#7c3aed",
  cyan:     "#06b6d4",
  emerald:  "#10b981",
  rose:     "#f43f5e",
  amber:    "#f59e0b",
  indigo:   "#6366f1",
  text:     "#e2e8f0",
  muted:    "#475569",
  dim:      "#94a3b8",
  glow:     "rgba(124,58,237,0.35)",
};

/* ── Particle Canvas Background ─────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const N = 90;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.3,
      hue: Math.random() > 0.5 ? 270 : 185,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + canvas.width) % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
      });
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${pts[i].hue},80%,65%,${(1 - d / 100) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,0.7)`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

/* ── Glow button ────────────────────────────────────────── */
function GlowBtn({ children, onClick, color = G.violet, disabled, small }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? color + "28" : color + "14",
        border: `1px solid ${color}${hov ? "bb" : "55"}`,
        color: hov ? "#fff" : color,
        borderRadius: 8,
        padding: small ? "5px 11px" : "7px 18px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        letterSpacing: "0.02em",
        transition: "all 0.18s",
        boxShadow: hov ? `0 0 14px ${color}55` : "none",
        opacity: disabled ? 0.45 : 1,
        fontFamily: "monospace",
      }}>
      {children}
    </button>
  );
}

/* ── Sorting algorithms ─────────────────────────────────── */
function* bubbleSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < n - i - 1; j++) {
      yield { array:[...a], comparing:[j,j+1], sorted:[] };
      if (a[j] > a[j+1]) [a[j],a[j+1]] = [a[j+1],a[j]];
    }
  yield { array:[...a], comparing:[], sorted:a.map((_,i)=>i) };
}
function* selectionSort(a) {
  const n=a.length, s=[];
  for (let i=0;i<n-1;i++) {
    let m=i;
    for (let j=i+1;j<n;j++) { yield{array:[...a],comparing:[m,j],sorted:[...s]}; if(a[j]<a[m])m=j; }
    [a[i],a[m]]=[a[m],a[i]]; s.push(i);
  }
  s.push(n-1);
  yield{array:[...a],comparing:[],sorted:[...s]};
}
function* insertionSort(a) {
  const n=a.length;
  for(let i=1;i<n;i++){let j=i;while(j>0&&a[j-1]>a[j]){yield{array:[...a],comparing:[j-1,j],sorted:[]};[a[j-1],a[j]]=[a[j],a[j-1]];j--;}}
  yield{array:[...a],comparing:[],sorted:a.map((_,i)=>i)};
}
function* mergeSort(a) {
  function* merge(lo,mid,hi){const l=a.slice(lo,mid+1),r=a.slice(mid+1,hi+1);let i=0,j=0,k=lo;while(i<l.length&&j<r.length){yield{array:[...a],comparing:[lo+i,mid+1+j],sorted:[]};if(l[i]<=r[j])a[k++]=l[i++];else a[k++]=r[j++];}while(i<l.length){a[k++]=l[i++];yield{array:[...a],comparing:[k-1],sorted:[]};}while(j<r.length){a[k++]=r[j++];yield{array:[...a],comparing:[k-1],sorted:[]};}}
  function* ms(lo,hi){if(lo>=hi)return;const mid=Math.floor((lo+hi)/2);yield* ms(lo,mid);yield* ms(mid+1,hi);yield* merge(lo,mid,hi);}
  yield* ms(0,a.length-1);
  yield{array:[...a],comparing:[],sorted:a.map((_,i)=>i)};
}
function* quickSort(a) {
  function* qs(lo,hi){if(lo>=hi)return;let p=a[hi],i=lo-1;for(let j=lo;j<hi;j++){yield{array:[...a],comparing:[j,hi],pivot:hi,sorted:[]};if(a[j]<=p){i++;[a[i],a[j]]=[a[j],a[i]];}}[a[i+1],a[hi]]=[a[hi],a[i+1]];yield{array:[...a],comparing:[],pivot:i+1,sorted:[]};yield* qs(lo,i);yield* qs(i+2,hi);}
  yield* qs(0,a.length-1);
  yield{array:[...a],comparing:[],sorted:a.map((_,i)=>i)};
}
function* heapSort(a) {
  const n=a.length;
  function* heapify(n,i){let l=i,lt=2*i+1,rt=2*i+2;if(lt<n&&a[lt]>a[l])l=lt;if(rt<n&&a[rt]>a[l])l=rt;if(l!==i){yield{array:[...a],comparing:[i,l],sorted:[]};[a[i],a[l]]=[a[l],a[i]];yield* heapify(n,l);}}
  for(let i=Math.floor(n/2)-1;i>=0;i--)yield* heapify(n,i);
  for(let i=n-1;i>0;i--){[a[0],a[i]]=[a[i],a[0]];yield{array:[...a],comparing:[0,i],sorted:[]};yield* heapify(i,0);}
  yield{array:[...a],comparing:[],sorted:a.map((_,i)=>i)};
}

const ALGOS = {
  Bubble:    {fn:bubbleSort,    color:G.violet,  time:"O(n²)",       space:"O(1)"},
  Selection: {fn:selectionSort, color:G.cyan,    time:"O(n²)",       space:"O(1)"},
  Insertion: {fn:insertionSort, color:G.emerald, time:"O(n²)",       space:"O(1)"},
  Merge:     {fn:mergeSort,     color:G.indigo,  time:"O(n log n)",  space:"O(n)"},
  Quick:     {fn:quickSort,     color:G.amber,   time:"O(n log n)",  space:"O(log n)"},
  Heap:      {fn:heapSort,      color:G.rose,    time:"O(n log n)",  space:"O(1)"},
};

/* ── Sorting Visualizer ─────────────────────────────────── */
function SortingViz() {
  const [algoKey, setAlgoKey] = useState("Quick");
  const [size, setSize] = useState(45);
  const [speed, setSpeed] = useState(60);
  const [arr, setArr] = useState(() => genArr(45));
  const [state, setState] = useState({ comparing:[], sorted:[], pivot:null });
  const [running, setRunning] = useState(false);
  const [cmps, setCmps] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const genRef = useRef(null);
  const tmRef = useRef(null);
  const cmpRef = useRef(0);
  const swpRef = useRef(0);

  function genArr(n) { return Array.from({length:n},()=>Math.floor(Math.random()*94)+6); }

  const shuffle = useCallback(() => {
    if (tmRef.current) clearTimeout(tmRef.current);
    setArr(genArr(size)); setState({comparing:[],sorted:[],pivot:null}); setRunning(false); setCmps(0); setSwaps(0);
  }, [size]);

  useEffect(() => { shuffle(); }, [size]);

  const run = () => {
    if (running) return;
    setRunning(true); cmpRef.current=0; swpRef.current=0; setCmps(0); setSwaps(0);
    genRef.current = ALGOS[algoKey].fn([...arr]);
    const tick = () => {
      const res = genRef.current.next();
      if (res.done) { setRunning(false); setState(s=>({...s,comparing:[],pivot:null})); return; }
      const s = res.value;
      if (s.comparing.length) { cmpRef.current++; setCmps(cmpRef.current); }
      setArr(s.array); setState({comparing:s.comparing||[],sorted:s.sorted||[],pivot:s.pivot??null});
      tmRef.current = setTimeout(tick, 102-speed);
    };
    tick();
  };

  const algo = ALGOS[algoKey];
  const maxV = Math.max(...arr);
  const barW = Math.max(2, Math.floor(580/size) - 1);

  return (
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {Object.keys(ALGOS).map(k=>(
          <button key={k} onClick={()=>setAlgoKey(k)}
            style={{background:algoKey===k?ALGOS[k].color+"28":"transparent",border:`1px solid ${algoKey===k?ALGOS[k].color:G.border}`,color:algoKey===k?ALGOS[k].color:G.muted,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"monospace",transition:"all 0.15s",boxShadow:algoKey===k?`0 0 10px ${ALGOS[k].color}44`:"none"}}>
            {k}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
        <label style={{fontSize:12,color:G.muted,display:"flex",alignItems:"center",gap:8,fontFamily:"monospace"}}>
          Size
          <input type="range" min={10} max={80} step={1} value={size} disabled={running} onChange={e=>setSize(+e.target.value)} style={{width:90,accentColor:algo.color}}/>
          <span style={{color:G.dim,minWidth:24}}>{size}</span>
        </label>
        <label style={{fontSize:12,color:G.muted,display:"flex",alignItems:"center",gap:8,fontFamily:"monospace"}}>
          Speed
          <input type="range" min={1} max={99} step={1} value={speed} onChange={e=>setSpeed(+e.target.value)} style={{width:90,accentColor:algo.color}}/>
        </label>
        <GlowBtn onClick={shuffle} disabled={running} color={G.muted} small>Shuffle</GlowBtn>
        <GlowBtn onClick={run} disabled={running} color={algo.color}>▶ Sort</GlowBtn>
      </div>

      {/* Bars */}
      <div style={{display:"flex",alignItems:"flex-end",gap:1,height:180,background:G.surface,borderRadius:12,padding:"12px 10px 0",border:`1px solid ${G.border}`,overflow:"hidden",position:"relative"}}>
        {arr.map((v,i)=>{
          const isCmp = state.comparing.includes(i);
          const isSorted = state.sorted.includes(i);
          const isPivot = state.pivot===i;
          let color = G.border;
          if (isPivot)   color = G.rose;
          else if (isCmp)color = algo.color;
          else if(isSorted)color = G.emerald;
          const glow = (isCmp||isPivot) ? `0 0 8px ${color}` : "none";
          return (
            <div key={i} style={{
              flex:1, background:color, height:`${(v/maxV)*100}%`,
              borderRadius:"3px 3px 0 0", minWidth:barW,
              boxShadow:glow,
              transition:"background 0.06s, box-shadow 0.06s, height 0.04s",
            }}/>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap"}}>
        {[["Comparisons",cmps,algo.color],["Time",algo.time,G.indigo],["Space",algo.space,G.cyan]].map(([l,v,c])=>(
          <div key={l} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"8px 14px",flex:1,minWidth:100}}>
            <div style={{fontSize:11,color:G.muted,marginBottom:3,fontFamily:"monospace"}}>{l}</div>
            <div style={{fontSize:16,fontWeight:700,color:c,fontFamily:"monospace"}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pathfinding ────────────────────────────────────────── */
const ROWS=16, COLS=28;
function mkGrid(){ return Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},(_,c)=>({r,c,wall:false,visited:false,path:false,start:r===7&&c===2,end:r===8&&c===25}))); }

function PathViz() {
  const [grid, setGrid] = useState(mkGrid);
  const [algo, setAlgo] = useState("BFS");
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("Draw walls, then run.");
  const [stats, setStats] = useState({visited:0,path:0});
  const drawing = useRef(false);
  const tmRef = useRef(null);

  const reset = () => { if(tmRef.current)clearTimeout(tmRef.current); setGrid(mkGrid()); setRunning(false); setMsg("Grid reset."); setStats({visited:0,path:0}); };

  const addWalls = () => {
    const g = mkGrid();
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(!g[r][c].start&&!g[r][c].end&&Math.random()<0.3)g[r][c].wall=true;
    setGrid(g); setMsg("Random walls. Now run!");
  };

  const addMaze = () => {
    const g = mkGrid();
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(!g[r][c].start&&!g[r][c].end&&((r%2===0)||(c%4===0&&r%3!==1)))g[r][c].wall=true;
    setGrid(g); setMsg("Maze generated. Run!");
  };

  const run = useCallback(()=>{
    if(running)return;
    setRunning(true);
    const g=grid.map(row=>row.map(c=>({...c,visited:false,path:false})));
    const start=g.flat().find(c=>c.start), end=g.flat().find(c=>c.end);
    const prev={}, visited=[];
    if(algo==="BFS"){
      const q=[start],seen=new Set([`${start.r},${start.c}`]);
      while(q.length){const cur=q.shift();if(!cur.start&&!cur.end)visited.push([cur.r,cur.c]);if(cur.r===end.r&&cur.c===end.c)break;for(const[dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]]){const nr=cur.r+dr,nc=cur.c+dc,k=`${nr},${nc}`;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!g[nr][nc].wall&&!seen.has(k)){seen.add(k);prev[k]=`${cur.r},${cur.c}`;q.push(g[nr][nc]);}}}
    } else {
      const stk=[start],seen=new Set([`${start.r},${start.c}`]);
      while(stk.length){const cur=stk.pop();if(!cur.start&&!cur.end)visited.push([cur.r,cur.c]);if(cur.r===end.r&&cur.c===end.c)break;for(const[dr,dc]of[[-1,0],[1,0],[0,-1],[0,1]]){const nr=cur.r+dr,nc=cur.c+dc,k=`${nr},${nc}`;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!g[nr][nc].wall&&!seen.has(k)){seen.add(k);prev[k]=`${cur.r},${cur.c}`;stk.push(g[nr][nc]);}}}
    }
    let step=0;
    const animate=()=>{
      if(step<visited.length){const[r,c]=visited[step];setGrid(pg=>pg.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,visited:true}:cell)));step++;tmRef.current=setTimeout(animate,12);}
      else{
        const pathC=[]; let cur=`${end.r},${end.c}`; while(prev[cur]){pathC.unshift(cur);cur=prev[cur];}
        let pi=0;
        const trace=()=>{if(pi<pathC.length){const[r,c]=pathC[pi].split(",").map(Number);setGrid(pg=>pg.map((row,ri)=>row.map((cell,ci)=>ri===r&&ci===c?{...cell,path:true}:cell)));pi++;tmRef.current=setTimeout(trace,25);}
        else{setStats({visited:visited.length,path:pathC.length});setMsg(pathC.length?`Path found in ${algo}!`:"No path!");setRunning(false);}};
        trace();
      }
    };
    animate(); setMsg(`Running ${algo}...`);
  },[grid,running,algo]);

  const cs = Math.min(22, Math.floor(340/COLS));

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
        {["BFS","DFS"].map(a=>(
          <button key={a} onClick={()=>setAlgo(a)} style={{background:algo===a?G.cyan+"22":"transparent",border:`1px solid ${algo===a?G.cyan:G.border}`,color:algo===a?G.cyan:G.muted,borderRadius:7,padding:"5px 14px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"monospace",transition:"all 0.15s",boxShadow:algo===a?`0 0 10px ${G.cyan}44`:"none"}}>{a}</button>
        ))}
        <GlowBtn onClick={run} disabled={running} color={G.emerald}>▶ Run</GlowBtn>
        <GlowBtn onClick={addWalls} color={G.amber} small>Random Walls</GlowBtn>
        <GlowBtn onClick={addMaze} color={G.violet} small>Maze</GlowBtn>
        <GlowBtn onClick={reset} color={G.muted} small>Reset</GlowBtn>
      </div>
      <div style={{overflowX:"auto"}}>
        <div style={{display:"inline-block",borderRadius:10,overflow:"hidden",border:`1px solid ${G.border}`,cursor:"crosshair",userSelect:"none"}}
          onMouseLeave={()=>{drawing.current=false;}}>
          {grid.map((row,r)=>(
            <div key={r} style={{display:"flex"}}>
              {row.map((cell,c)=>{
                let bg=G.bg;
                if(cell.start) bg=G.emerald;
                else if(cell.end) bg=G.rose;
                else if(cell.wall) bg="#1e293b";
                else if(cell.path) bg=G.amber;
                else if(cell.visited) bg=G.violet+"66";
                const glow = cell.path?`0 0 6px ${G.amber}`:cell.start||cell.end?`0 0 8px ${cell.start?G.emerald:G.rose}`:cell.visited?`0 0 3px ${G.violet}33`:"none";
                return (
                  <div key={c} style={{width:cs,height:cs,background:bg,borderRight:c<COLS-1?`0.5px solid ${G.border}18`:"none",borderBottom:r<ROWS-1?`0.5px solid ${G.border}18`:"none",transition:"background 0.08s",flexShrink:0,boxShadow:glow}}
                    onMouseDown={()=>{if(!cell.start&&!cell.end){drawing.current=true;const ng=grid.map((rw,ri)=>rw.map((cl,ci)=>ri===r&&ci===c?{...cl,wall:!cl.wall}:cl));setGrid(ng);}}}
                    onMouseEnter={()=>{if(drawing.current&&!cell.start&&!cell.end){const ng=grid.map((rw,ri)=>rw.map((cl,ci)=>ri===r&&ci===c?{...cl,wall:true}:cl));setGrid(ng);}}}
                    onMouseUp={()=>{drawing.current=false;}}/>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        {[["Visited",stats.visited,G.violet],["Path Length",stats.path,G.amber],["Algorithm",algo,G.cyan]].map(([l,v,c])=>(
          <div key={l} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"7px 12px",flex:1}}>
            <div style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>{l}</div>
            <div style={{fontSize:15,fontWeight:700,color:c,fontFamily:"monospace"}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:G.dim,marginTop:8,fontFamily:"monospace"}}>{msg}</div>
    </div>
  );
}

/* ── Stack Viz ──────────────────────────────────────────── */
function StackViz() {
  const [stack, setStack] = useState([10,20,30]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("LIFO — Last In, First Out.");
  const [flash, setFlash] = useState(null);

  const doFlash = (idx,ms=700) => { setFlash(idx); setTimeout(()=>setFlash(null),ms); };
  const push = () => { const v=parseInt(input); if(isNaN(v))return; setStack(s=>[...s,v]); doFlash(stack.length); setMsg(`Pushed ${v}.`); setInput(""); };
  const pop  = () => { if(!stack.length){setMsg("Stack empty!");return;} doFlash(stack.length-1); setTimeout(()=>setStack(s=>s.slice(0,-1)),350); setMsg(`Popped ${stack[stack.length-1]}.`); };
  const peek = () => { if(!stack.length)return; doFlash(stack.length-1,1000); setMsg(`Top = ${stack[stack.length-1]}.`); };

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&push()} placeholder="value"
          style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:7,padding:"6px 10px",width:80,fontSize:13,fontFamily:"monospace"}}/>
        <GlowBtn onClick={push} color={G.violet}>Push</GlowBtn>
        <GlowBtn onClick={pop}  color={G.rose}>Pop</GlowBtn>
        <GlowBtn onClick={peek} color={G.amber}>Peek</GlowBtn>
      </div>
      <div style={{display:"flex",flexDirection:"column-reverse",gap:4,alignItems:"flex-start",minHeight:140}}>
        {stack.map((v,i)=>(
          <div key={i} style={{
            background:flash===i?G.violet+"33":G.surface,
            border:`1.5px solid ${flash===i?G.violet:G.border}`,
            color:flash===i?G.violet:G.text,
            borderRadius:8,padding:"8px 20px",fontSize:14,fontFamily:"monospace",
            transition:"all 0.25s",display:"flex",alignItems:"center",gap:12,minWidth:120,
            boxShadow:flash===i?`0 0 16px ${G.violet}66`:"none",
          }}>
            <span style={{fontWeight:700}}>{v}</span>
            {i===stack.length-1&&<span style={{fontSize:11,color:G.violet,fontFamily:"monospace"}}>◀ TOP</span>}
          </div>
        ))}
        {!stack.length&&<div style={{color:G.muted,fontSize:13,fontFamily:"monospace"}}>empty</div>}
      </div>
      <div style={{marginTop:10,fontSize:12,color:G.dim,fontFamily:"monospace"}}>{msg}</div>
    </div>
  );
}

/* ── Queue Viz ──────────────────────────────────────────── */
function QueueViz() {
  const [queue, setQueue] = useState([5,15,25]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("FIFO — First In, First Out.");
  const [flash, setFlash] = useState(null);

  const enq = () => { const v=parseInt(input); if(isNaN(v))return; setQueue(q=>[...q,v]); setFlash("tail"); setTimeout(()=>setFlash(null),700); setMsg(`Enqueued ${v}.`); setInput(""); };
  const deq = () => { if(!queue.length)return; setFlash("head"); setTimeout(()=>{setQueue(q=>q.slice(1));setFlash(null);},400); setMsg(`Dequeued ${queue[0]}.`); };

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enq()} placeholder="value"
          style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:7,padding:"6px 10px",width:80,fontSize:13,fontFamily:"monospace"}}/>
        <GlowBtn onClick={enq} color={G.emerald}>Enqueue</GlowBtn>
        <GlowBtn onClick={deq} color={G.rose}>Dequeue</GlowBtn>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        {queue.length>0&&<span style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>FRONT→</span>}
        {queue.map((v,i)=>{
          const isFlash=(flash==="head"&&i===0)||(flash==="tail"&&i===queue.length-1);
          return (
            <div key={i} style={{background:isFlash?G.emerald+"33":G.surface,border:`1.5px solid ${isFlash?G.emerald:G.border}`,color:isFlash?G.emerald:G.text,borderRadius:8,padding:"8px 18px",fontSize:14,fontFamily:"monospace",transition:"all 0.25s",boxShadow:isFlash?`0 0 14px ${G.emerald}66`:"none"}}>
              {v}
            </div>
          );
        })}
        {queue.length>0&&<span style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>←REAR</span>}
        {!queue.length&&<span style={{color:G.muted,fontSize:13,fontFamily:"monospace"}}>empty</span>}
      </div>
      <div style={{marginTop:10,fontSize:12,color:G.dim,fontFamily:"monospace"}}>{msg}</div>
    </div>
  );
}

/* ── BST Viz ────────────────────────────────────────────── */
function BSTViz() {
  const [nodes, setNodes] = useState([50,30,70,20,40,60,80]);
  const [input, setInput] = useState("");
  const [highlight, setHighlight] = useState([]);
  const [msg, setMsg] = useState("BST ready. Insert or search a value.");

  function buildBST(vals){
    if(!vals.length)return null;
    function build(arr){if(!arr.length)return null;const mid=Math.floor(arr.length/2);return{val:arr[mid],left:build(arr.slice(0,mid)),right:build(arr.slice(mid+1))};}
    return build([...vals].sort((a,b)=>a-b));
  }

  const insert = () => { const v=parseInt(input); if(isNaN(v)||nodes.includes(v))return; setNodes(n=>[...n,v]); setMsg(`Inserted ${v}.`); setInput(""); };
  const search = () => {
    const v=parseInt(input); if(isNaN(v))return;
    const path=[]; const bst=buildBST(nodes);
    function tr(node){if(!node)return false;path.push(node.val);if(node.val===v)return true;if(v<node.val)return tr(node.left);return tr(node.right);}
    const found=tr(bst); setHighlight(path);
    setMsg(found?`Found ${v}! Path: ${path.join(" → ")}`:`${v} not in tree. Checked: ${path.join(" → ")}`);
    setTimeout(()=>setHighlight([]),2500); setInput("");
  };

  function renderTree(node,x,y,spread){
    if(!node)return null;
    const hl=highlight.includes(node.val);
    const els=[];
    if(node.left){const lx=x-spread,ly=y+60;els.push(<line key={`l${node.val}`} x1={x} y1={y} x2={lx} y2={ly} stroke={G.border} strokeWidth={1}/>);els.push(...(renderTree(node.left,lx,ly,spread/2)||[]));}
    if(node.right){const rx=x+spread,ry=y+60;els.push(<line key={`r${node.val}`} x1={x} y1={y} x2={rx} y2={ry} stroke={G.border} strokeWidth={1}/>);els.push(...(renderTree(node.right,rx,ry,spread/2)||[]));}
    els.push(
      <g key={node.val}>
        <circle cx={x} cy={y} r={20} fill={hl?G.cyan+"33":G.surface} stroke={hl?G.cyan:G.border} strokeWidth={hl?2:1}/>
        {hl&&<circle cx={x} cy={y} r={20} fill="none" stroke={G.cyan} strokeWidth={1} opacity={0.4}/>}
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={hl?G.cyan:G.dim} fontSize={12} fontFamily="monospace" fontWeight={700}>{node.val}</text>
      </g>
    );
    return els;
  }

  const bst=buildBST(nodes);
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&insert()} placeholder="value"
          style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:7,padding:"6px 10px",width:80,fontSize:13,fontFamily:"monospace"}}/>
        <GlowBtn onClick={insert} color={G.emerald}>Insert</GlowBtn>
        <GlowBtn onClick={search} color={G.cyan}>Search</GlowBtn>
        <GlowBtn onClick={()=>{setNodes([50,30,70,20,40,60,80]);setHighlight([]);setMsg("BST reset.");}} color={G.muted} small>Reset</GlowBtn>
      </div>
      <svg width="100%" viewBox="0 0 400 210" style={{overflow:"visible"}}>
        {renderTree(bst,200,24,80)}
      </svg>
      <div style={{fontSize:12,color:G.dim,marginTop:4,fontFamily:"monospace"}}>{msg}</div>
    </div>
  );
}

/* ── Linked List ────────────────────────────────────────── */
function LinkedListViz() {
  const [list, setList] = useState([10,20,30,40]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("Singly linked list. Add or remove nodes.");
  const [flash, setFlash] = useState(null);

  const doFlash=(i,ms=700)=>{setFlash(i);setTimeout(()=>setFlash(null),ms);};
  const addFront=()=>{const v=parseInt(input);if(isNaN(v))return;setList(l=>[v,...l]);doFlash(0);setMsg(`Added ${v} at HEAD.`);setInput("");};
  const addBack =()=>{const v=parseInt(input);if(isNaN(v))return;setList(l=>[...l,v]);doFlash(list.length);setMsg(`Added ${v} at TAIL.`);setInput("");};
  const remFront=()=>{if(!list.length)return;doFlash(0);setTimeout(()=>setList(l=>l.slice(1)),350);setMsg(`Removed ${list[0]} from HEAD.`);};

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="value"
          style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:7,padding:"6px 10px",width:80,fontSize:13,fontFamily:"monospace"}}/>
        <GlowBtn onClick={addFront} color={G.violet}>+Front</GlowBtn>
        <GlowBtn onClick={addBack}  color={G.cyan}>+Back</GlowBtn>
        <GlowBtn onClick={remFront} color={G.rose}>-Front</GlowBtn>
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:0}}>
        <span style={{fontSize:11,color:G.muted,marginRight:8,fontFamily:"monospace"}}>HEAD</span>
        {list.map((v,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center"}}>
            <div style={{background:flash===i?G.violet+"33":G.surface,border:`1.5px solid ${flash===i?G.violet:G.border}`,color:flash===i?G.violet:G.text,borderRadius:8,padding:"6px 0",minWidth:56,textAlign:"center",fontSize:13,fontFamily:"monospace",transition:"all 0.25s",boxShadow:flash===i?`0 0 14px ${G.violet}66`:"none"}}>
              <div style={{fontSize:10,color:G.muted,marginBottom:2}}>data</div>
              <div style={{fontWeight:700}}>{v}</div>
              <div style={{fontSize:10,color:G.muted,marginTop:2}}>next→</div>
            </div>
            {i<list.length-1&&(
              <div style={{width:18,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:12,height:1.5,background:G.border}}/>
                <div style={{color:G.muted,fontSize:9,marginLeft:-2}}>▶</div>
              </div>
            )}
          </div>
        ))}
        <span style={{fontSize:11,color:G.muted,marginLeft:10,fontFamily:"monospace"}}>NULL</span>
      </div>
      <div style={{marginTop:10,fontSize:12,color:G.dim,fontFamily:"monospace"}}>{msg}</div>
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────── */
const TABS = [
  {id:"sort",  label:"Sorting",         icon:"↕"},
  {id:"path",  label:"Pathfinding",     icon:"⬡"},
  {id:"ds",    label:"Data Structures", icon:"⚙"},
  {id:"learn", label:"Learn Mode",      icon:"◎"},
];
const DS_TABS = [
  {id:"stack", label:"Stack",       C:StackViz},
  {id:"queue", label:"Queue",       C:QueueViz},
  {id:"ll",    label:"Linked List", C:LinkedListViz},
  {id:"bst",   label:"BST",         C:BSTViz},
];

export default function App() {
  const [tab, setTab] = useState("sort");
  const [dsTab, setDsTab] = useState("stack");
  const [loaded, setLoaded] = useState(false);
  useEffect(()=>{ setTimeout(()=>setLoaded(true),100); },[]);
  const DSC = DS_TABS.find(t=>t.id===dsTab)?.C || StackViz;

  return (
    <div style={{minHeight:"100vh",background:G.bg,color:G.text,fontFamily:"'Inter','Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>

      {/* Animated background */}
      <div style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none"}}>
        <ParticleCanvas/>
        {/* Ambient glow orbs */}
        <div style={{position:"absolute",top:-120,left:-120,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-80,right:-80,width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.10) 0%,transparent 70%)",pointerEvents:"none"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>
        {/* Header */}
        <div style={{
          background:"rgba(12,13,20,0.85)",
          backdropFilter:"blur(20px)",
          borderBottom:`1px solid ${G.border}`,
          padding:"18px 28px",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14,
          opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(-12px)",
          transition:"opacity 0.5s,transform 0.5s",
        }}>
          <div>
            <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.5px",fontFamily:"monospace",lineHeight:1.1}}>
              <span style={{color:G.violet,textShadow:`0 0 20px ${G.violet}88`}}>{"<"}</span>
              <span style={{color:G.text}}> Algo</span>
              <span style={{background:`linear-gradient(90deg,${G.cyan},${G.violet})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Visualizer</span>
              <span style={{color:G.violet,textShadow:`0 0 20px ${G.violet}88`}}>{"/>"}</span>
            </div>
            <div style={{fontSize:12,color:G.muted,marginTop:3,fontFamily:"monospace",letterSpacing:"0.05em"}}>
              sorting · pathfinding · data structures · live animations
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {TABS.map(t=>{
              const active=tab===t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  background:active?"rgba(124,58,237,0.2)":"transparent",
                  border:`1px solid ${active?G.violet:G.border}`,
                  color:active?G.violet:G.muted,
                  borderRadius:9,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:600,
                  fontFamily:"monospace",transition:"all 0.15s",
                  boxShadow:active?`0 0 16px ${G.violet}44`:"none",
                }}>
                  <span style={{marginRight:6,fontSize:14}}>{t.icon}</span>{t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{padding:"28px",maxWidth:960,margin:"0 auto"}}>

          {tab==="sort"&&(
            <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"opacity 0.4s 0.1s,transform 0.4s 0.1s"}}>
              <SectionHeader title="Sorting Algorithms" sub="Select · Shuffle · Watch it sort in real time"/>
              <Card><SortingViz/></Card>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:10,marginTop:16}}>
                {Object.entries(ALGOS).map(([name,{color,time,space}])=>(
                  <div key={name} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"11px 13px",transition:"box-shadow 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 16px ${color}44`}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`}}/>
                      <span style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:G.dim}}>{name}</span>
                    </div>
                    <div style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>T: <span style={{color:G.dim}}>{time}</span></div>
                    <div style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>S: <span style={{color:G.dim}}>{space}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="path"&&(
            <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"opacity 0.4s 0.1s,transform 0.4s 0.1s"}}>
              <SectionHeader title="Pathfinding Visualizer" sub="Draw walls · Generate maze · Run BFS or DFS"/>
              <Card><PathViz/></Card>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
                {[{name:"BFS",desc:"Breadth-First Search — explores level by level using a queue. Always finds the shortest path.",color:G.cyan},
                  {name:"DFS",desc:"Depth-First Search — dives deep first using a stack. Fast but no shortest path guarantee.",color:G.rose}]
                  .map(a=>(
                    <div key={a.name} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"13px 15px",borderLeft:`3px solid ${a.color}`}}>
                      <div style={{fontSize:13,fontWeight:700,color:a.color,fontFamily:"monospace",marginBottom:5}}>{a.name}</div>
                      <div style={{fontSize:12,color:G.muted,lineHeight:1.6}}>{a.desc}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {tab==="ds"&&(
            <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"opacity 0.4s 0.1s,transform 0.4s 0.1s"}}>
              <SectionHeader title="Data Structures" sub="Perform operations · Watch state change live"/>
              <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                {DS_TABS.map(t=>(
                  <button key={t.id} onClick={()=>setDsTab(t.id)} style={{
                    background:dsTab===t.id?"rgba(99,102,241,0.2)":"transparent",
                    border:`1px solid ${dsTab===t.id?G.indigo:G.border}`,
                    color:dsTab===t.id?G.indigo:G.muted,
                    borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:600,
                    fontFamily:"monospace",transition:"all 0.15s",
                    boxShadow:dsTab===t.id?`0 0 14px ${G.indigo}44`:"none",
                  }}>{t.label}</button>
                ))}
      
          {tab==="learn"&&(
            <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"opacity 0.4s 0.1s,transform 0.4s 0.1s"}}>
              <LearnMode/>
            </div>
          )}
        </div>
              <Card><DSC/></Card>
    
          {tab==="learn"&&(
            <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"opacity 0.4s 0.1s,transform 0.4s 0.1s"}}>
              <LearnMode/>
            </div>
          )}
        </div>
          )}

          {tab==="learn"&&(
            <div style={{opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(16px)",transition:"opacity 0.4s 0.1s,transform 0.4s 0.1s"}}>
              <LearnMode/>
            </div>
          )}
        </div>

        {/* ── Try Your Own Input Playground ── */}
        <CustomPlayground/>

        {/* Footer */}
        <div style={{textAlign:"center",padding:"24px",fontSize:12,color:G.muted,borderTop:`1px solid ${G.border}22`,fontFamily:"monospace",letterSpacing:"0.05em"}}>
          built with react · open source · deploy on vercel
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM PLAYGROUND  —  "Try Your Own Input"
═══════════════════════════════════════════════════════════ */
function CustomPlayground() {
  const [mode, setMode]         = useState("sort");   // "sort" | "search" | "ds"
  const [rawInput, setRawInput] = useState("64, 34, 25, 12, 22, 11, 90");
  const [algoKey, setAlgoKey]   = useState("Quick");
  const [speed, setSpeed]       = useState(55);
  const [arr, setArr]           = useState([64,34,25,12,22,11,90]);
  const [state, setState]       = useState({comparing:[],sorted:[],pivot:null});
  const [running, setRunning]   = useState(false);
  const [cmps, setCmps]         = useState(0);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchIdx, setSearchIdx]       = useState([]);
  const [dsMode, setDsMode]     = useState("stack");
  const [dsArr, setDsArr]       = useState([10,20,30]);
  const [dsInput, setDsInput]   = useState("");
  const [dsMsg, setDsMsg]       = useState("Your stack is ready!");
  const [dsFlash, setDsFlash]   = useState(null);
  const [queue, setQueue]       = useState([5,15,25]);
  const [qInput, setQInput]     = useState("");
  const [qMsg, setQMsg]         = useState("Your queue is ready!");
  const [qFlash, setQFlash]     = useState(null);
  const tmRef  = useRef(null);
  const genRef = useRef(null);
  const cmpRef = useRef(0);

  const parseInput = (raw) => {
    const nums = raw.split(/[\s,;]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    return nums;
  };

  const applyInput = () => {
    const nums = parseInput(rawInput);
    if (nums.length < 2) { setError("Enter at least 2 numbers separated by commas."); return; }
    if (nums.length > 80) { setError("Max 80 values please!"); return; }
    setError("");
    if (tmRef.current) clearTimeout(tmRef.current);
    setArr(nums);
    setState({comparing:[],sorted:[],pivot:null});
    setRunning(false); setDone(false); setCmps(0); setSearchResult(null); setSearchIdx([]);
  };

  const runSort = () => {
    if (running || arr.length < 2) return;
    setRunning(true); setDone(false); cmpRef.current = 0; setCmps(0);
    setState({comparing:[],sorted:[],pivot:null});
    genRef.current = ALGOS[algoKey].fn([...arr]);
    const tick = () => {
      const res = genRef.current.next();
      if (res.done) { setRunning(false); setDone(true); setState(s=>({...s,comparing:[],pivot:null})); return; }
      const s = res.value;
      if (s.comparing.length) { cmpRef.current++; setCmps(cmpRef.current); }
      setArr(s.array); setState({comparing:s.comparing||[],sorted:s.sorted||[],pivot:s.pivot??null});
      tmRef.current = setTimeout(tick, 102-speed);
    };
    tick();
  };

  const runLinearSearch = () => {
    const target = parseFloat(searchVal);
    if (isNaN(target)) return;
    setSearchResult(null); setSearchIdx([]);
    const steps = [];
    for (let i = 0; i < arr.length; i++) {
      steps.push(i);
      if (arr[i] === target) { steps.found = i; break; }
    }
    let si = 0;
    const tick = () => {
      if (si < steps.length) {
        setSearchIdx([...steps.slice(0, si+1)]);
        si++;
        tmRef.current = setTimeout(tick, 120);
      } else {
        setSearchResult(steps.found !== undefined ? steps.found : -1);
      }
    };
    tick();
  };

  const runBinarySearch = () => {
    const target = parseFloat(searchVal);
    if (isNaN(target)) return;
    const sorted = [...arr].sort((a,b)=>a-b);
    setArr(sorted);
    setSearchResult(null); setSearchIdx([]);
    const steps = [];
    let lo=0, hi=sorted.length-1, foundIdx=-1;
    while (lo<=hi) {
      const mid=Math.floor((lo+hi)/2);
      steps.push({lo,mid,hi});
      if (sorted[mid]===target) { foundIdx=mid; break; }
      if (sorted[mid]<target) lo=mid+1; else hi=mid-1;
    }
    let si=0;
    const tick=()=>{
      if(si<steps.length){
        const s=steps[si];
        setSearchIdx([s.lo,s.mid,s.hi].filter((v,i,a)=>a.indexOf(v)===i));
        si++;
        tmRef.current=setTimeout(tick,400);
      } else {
        setSearchResult(foundIdx);
      }
    };
    tick();
  };

  const dsFlashFn=(i,ms=700)=>{setDsFlash(i);setTimeout(()=>setDsFlash(null),ms);};
  const dsPush=()=>{const v=parseFloat(dsInput);if(isNaN(v))return;setDsArr(a=>[...a,v]);dsFlashFn(dsArr.length);setDsMsg(`Pushed ${v} ✓`);setDsInput("");};
  const dsPop =()=>{if(!dsArr.length){setDsMsg("Stack is empty!");return;}dsFlashFn(dsArr.length-1);setTimeout(()=>setDsArr(a=>a.slice(0,-1)),350);setDsMsg(`Popped ${dsArr[dsArr.length-1]} ✓`);};
  const dsPeek=()=>{if(!dsArr.length)return;dsFlashFn(dsArr.length-1,1000);setDsMsg(`Top = ${dsArr[dsArr.length-1]}`);};
  const loadDsFromInput=()=>{const nums=parseInput(rawInput);if(!nums.length)return;setDsArr(nums);setDsMsg("Loaded your values into the stack!");};

  const qFlashFn=(k,ms=700)=>{setQFlash(k);setTimeout(()=>setQFlash(null),ms);};
  const qEnq=()=>{const v=parseFloat(qInput);if(isNaN(v))return;setQueue(q=>[...q,v]);qFlashFn("tail");setQMsg(`Enqueued ${v} ✓`);setQInput("");};
  const qDeq=()=>{if(!queue.length){setQMsg("Queue is empty!");return;}qFlashFn("head");setTimeout(()=>setQueue(q=>q.slice(1)),350);setQMsg(`Dequeued ${queue[0]} ✓`);};
  const loadQFromInput=()=>{const nums=parseInput(rawInput);if(!nums.length)return;setQueue(nums);setQMsg("Loaded your values into the queue!");};

  const maxV = arr.length ? Math.max(...arr) : 1;
  const algo = ALGOS[algoKey];

  const MODES = [
    {id:"sort",   label:"Sort my array",  icon:"↕"},
    {id:"search", label:"Search a value", icon:"⌕"},
    {id:"ds",     label:"DS operations",  icon:"⚙"},
  ];

  return (
    <div style={{padding:"0 28px 32px",maxWidth:960,margin:"0 auto"}}>
      {/* Section header */}
      <div style={{
        display:"flex",alignItems:"center",gap:14,marginBottom:22,
        padding:"20px 0 0",
        borderTop:`1px solid ${G.border}`,
      }}>
        <div style={{
          width:3,height:40,borderRadius:4,
          background:`linear-gradient(180deg,${G.violet},${G.cyan})`,
          boxShadow:`0 0 12px ${G.violet}88`,
          flexShrink:0,
        }}/>
        <div>
          <div style={{fontSize:18,fontWeight:800,fontFamily:"monospace",color:G.text,letterSpacing:"-0.3px"}}>
            Try with your own values
          </div>
          <div style={{fontSize:12,color:G.muted,fontFamily:"monospace",marginTop:3}}>
            Enter any numbers below — watch the algorithm run on YOUR data
          </div>
        </div>
      </div>

      <div style={{
        background:"rgba(15,16,32,0.92)",
        border:`1px solid ${G.border}`,
        borderRadius:16,
        padding:24,
        backdropFilter:"blur(12px)",
        boxShadow:`0 0 0 1px ${G.border}33, 0 4px 40px rgba(0,0,0,0.5), 0 0 60px ${G.violet}0a`,
      }}>

        {/* ── Input row ── */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:12,color:G.muted,fontFamily:"monospace",marginBottom:8,letterSpacing:"0.05em"}}>
            YOUR ARRAY  <span style={{color:G.border}}>·</span>  separate values with commas or spaces
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <input
              value={rawInput}
              onChange={e=>{setRawInput(e.target.value); setError(""); setDone(false);}}
              onKeyDown={e=>e.key==="Enter"&&applyInput()}
              placeholder="e.g. 64, 34, 25, 12, 22, 11, 90"
              style={{
                flex:1, minWidth:220,
                background:G.surface,
                border:`1.5px solid ${error?G.rose:G.border}`,
                color:G.text, borderRadius:9,
                padding:"10px 14px", fontSize:14,
                fontFamily:"monospace", outline:"none",
                transition:"border-color 0.2s",
                boxShadow:error?`0 0 10px ${G.rose}33`:"none",
              }}
            />
            <GlowBtn onClick={applyInput} color={G.violet}>Load Array ▸</GlowBtn>
            <button onClick={()=>{
              const presets=["5,3,8,1,9,2,7,4,6","100,50,75,25,90,10,60","42,7,13,99,3,55,28,71,16"];
              setRawInput(presets[Math.floor(Math.random()*presets.length)]);
              setError("");
            }} style={{background:"transparent",border:`1px solid ${G.border}`,color:G.muted,borderRadius:8,padding:"9px 13px",cursor:"pointer",fontSize:12,fontFamily:"monospace",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.color=G.dim}
              onMouseLeave={e=>e.currentTarget.style.color=G.muted}>
              Random preset
            </button>
          </div>
          {error&&<div style={{marginTop:7,fontSize:12,color:G.rose,fontFamily:"monospace"}}>{error}</div>}

          {/* Live token preview */}
          {arr.length>0&&(
            <div style={{marginTop:10,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:G.muted,fontFamily:"monospace",marginRight:4}}>parsed →</span>
              {arr.map((v,i)=>(
                <span key={i} style={{
                  background:state.comparing.includes(i)?algo.color+"33":state.sorted.includes(i)?G.emerald+"22":state.pivot===i?G.rose+"33":G.surface,
                  border:`1px solid ${state.comparing.includes(i)?algo.color:state.sorted.includes(i)?G.emerald:state.pivot===i?G.rose:G.border}`,
                  color:state.comparing.includes(i)?algo.color:state.sorted.includes(i)?G.emerald:state.pivot===i?G.rose:G.dim,
                  borderRadius:6, padding:"3px 9px",
                  fontSize:12, fontFamily:"monospace", fontWeight:700,
                  transition:"all 0.1s",
                  boxShadow:state.comparing.includes(i)?`0 0 8px ${algo.color}55`:state.pivot===i?`0 0 8px ${G.rose}55`:"none",
                }}>
                  {v}
                </span>
              ))}
              <span style={{fontSize:11,color:G.muted,fontFamily:"monospace",marginLeft:4}}>[{arr.length} elements]</span>
            </div>
          )}
        </div>

        {/* ── Mode tabs ── */}
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>{setMode(m.id);setSearchResult(null);setSearchIdx([]);setState({comparing:[],sorted:[],pivot:null});setDone(false);setCmps(0);}}
              style={{
                background:mode===m.id?`rgba(124,58,237,0.2)`:"transparent",
                border:`1px solid ${mode===m.id?G.violet:G.border}`,
                color:mode===m.id?G.violet:G.muted,
                borderRadius:8,padding:"7px 16px",cursor:"pointer",
                fontSize:12,fontWeight:600,fontFamily:"monospace",
                transition:"all 0.15s",
                boxShadow:mode===m.id?`0 0 12px ${G.violet}44`:"none",
              }}>
              <span style={{marginRight:5}}>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>

        {/* ── SORT MODE ── */}
        {mode==="sort"&&(
          <div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:14}}>
              {Object.keys(ALGOS).map(k=>(
                <button key={k} onClick={()=>{setAlgoKey(k);setState({comparing:[],sorted:[],pivot:null});setDone(false);setCmps(0);}}
                  style={{background:algoKey===k?ALGOS[k].color+"28":"transparent",border:`1px solid ${algoKey===k?ALGOS[k].color:G.border}`,color:algoKey===k?ALGOS[k].color:G.muted,borderRadius:7,padding:"5px 11px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"monospace",transition:"all 0.15s",boxShadow:algoKey===k?`0 0 10px ${ALGOS[k].color}44`:"none"}}>
                  {k}
                </button>
              ))}
              <label style={{fontSize:12,color:G.muted,display:"flex",alignItems:"center",gap:7,fontFamily:"monospace",marginLeft:8}}>
                Speed
                <input type="range" min={1} max={99} step={1} value={speed} onChange={e=>setSpeed(+e.target.value)} style={{width:80,accentColor:algo.color}}/>
              </label>
              <GlowBtn onClick={runSort} disabled={running} color={algo.color}>▶ Sort it!</GlowBtn>
              <GlowBtn onClick={()=>{if(tmRef.current)clearTimeout(tmRef.current);applyInput();}} color={G.muted} small>Reset</GlowBtn>
            </div>

            {/* Bars */}
            <div style={{display:"flex",alignItems:"flex-end",gap:1,height:160,background:G.surface,borderRadius:12,padding:"10px 10px 0",border:`1px solid ${G.border}`,overflow:"hidden",position:"relative"}}>
              {arr.map((v,i)=>{
                const isCmp=state.comparing.includes(i), isSorted=state.sorted.includes(i), isPivot=state.pivot===i;
                let color=G.border;
                if(isPivot)color=G.rose; else if(isCmp)color=algo.color; else if(isSorted)color=G.emerald;
                return (
                  <div key={i} style={{flex:1,background:color,height:`${(v/maxV)*100}%`,borderRadius:"3px 3px 0 0",minWidth:4,
                    boxShadow:(isCmp||isPivot)?`0 0 8px ${color}`:done?`0 0 4px ${G.emerald}55`:"none",
                    transition:"background 0.06s,height 0.05s"}}/>
                );
              })}
              {done&&(
                <div style={{position:"absolute",top:8,right:12,fontSize:12,color:G.emerald,fontFamily:"monospace",fontWeight:700,
                  textShadow:`0 0 10px ${G.emerald}`}}>
                  ✓ Sorted!
                </div>
              )}
            </div>

            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"8px 14px",flex:1,minWidth:120}}>
                <div style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>Comparisons</div>
                <div style={{fontSize:16,fontWeight:700,color:algo.color,fontFamily:"monospace"}}>{cmps}</div>
              </div>
              <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"8px 14px",flex:1,minWidth:120}}>
                <div style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>Elements</div>
                <div style={{fontSize:16,fontWeight:700,color:G.cyan,fontFamily:"monospace"}}>{arr.length}</div>
              </div>
              <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"8px 14px",flex:1,minWidth:120}}>
                <div style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>Algorithm</div>
                <div style={{fontSize:14,fontWeight:700,color:algo.color,fontFamily:"monospace"}}>{algoKey} · {algo.time}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SEARCH MODE ── */}
        {mode==="search"&&(
          <div>
            <div style={{fontSize:12,color:G.muted,fontFamily:"monospace",marginBottom:10}}>
              Search within your loaded array. Binary Search will auto-sort the array first.
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
              <input value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="value to find"
                style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:8,padding:"9px 13px",width:150,fontSize:13,fontFamily:"monospace",outline:"none"}}/>
              <GlowBtn onClick={runLinearSearch} color={G.cyan}>Linear Search</GlowBtn>
              <GlowBtn onClick={runBinarySearch} color={G.violet}>Binary Search</GlowBtn>
            </div>

            {/* Array display with search highlight */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",minHeight:54}}>
              {arr.map((v,i)=>{
                const isChecked=searchIdx.includes(i);
                const isFound=searchResult!==null&&searchResult===i;
                const isMiss=searchResult===-1&&isChecked;
                return (
                  <div key={i} style={{
                    background:isFound?G.emerald+"33":isChecked?algo.color+"22":G.surface,
                    border:`2px solid ${isFound?G.emerald:isChecked?algo.color:G.border}`,
                    color:isFound?G.emerald:isChecked?algo.color:G.dim,
                    borderRadius:8,padding:"8px 12px",
                    fontSize:13,fontFamily:"monospace",fontWeight:700,
                    transition:"all 0.15s",minWidth:38,textAlign:"center",
                    boxShadow:isFound?`0 0 16px ${G.emerald}66`:isChecked?`0 0 8px ${algo.color}44`:"none",
                    transform:isFound?"scale(1.15)":"scale(1)",
                  }}>
                    {v}
                    {isFound&&<div style={{fontSize:9,color:G.emerald,marginTop:2}}>FOUND</div>}
                    {isChecked&&!isFound&&<div style={{fontSize:9,color:algo.color,marginTop:2,opacity:0.7}}>checked</div>}
                  </div>
                );
              })}
            </div>

            {searchResult!==null&&(
              <div style={{marginTop:14,padding:"12px 16px",borderRadius:10,
                background:searchResult>=0?G.emerald+"18":G.rose+"18",
                border:`1px solid ${searchResult>=0?G.emerald:G.rose}55`,
                fontSize:13,fontFamily:"monospace",color:searchResult>=0?G.emerald:G.rose,
                boxShadow:`0 0 20px ${searchResult>=0?G.emerald:G.rose}22`,
              }}>
                {searchResult>=0
                  ? `✓ Found ${searchVal} at index [${searchResult}] · Checked ${searchIdx.length} element${searchIdx.length>1?"s":""}`
                  : `✗ ${searchVal} not found in the array · Checked all ${arr.length} elements`}
              </div>
            )}

            <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{name:"Linear Search",desc:"Scans every element from left to right. O(n) time. Works on any array.",color:G.cyan},
                {name:"Binary Search",desc:"Splits the sorted array in half each step. O(log n) time. Array must be sorted first.",color:G.violet}]
                .map(s=>(
                  <div key={s.name} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:9,padding:"11px 13px",borderLeft:`3px solid ${s.color}`}}>
                    <div style={{fontSize:12,fontWeight:700,color:s.color,fontFamily:"monospace",marginBottom:4}}>{s.name}</div>
                    <div style={{fontSize:11,color:G.muted,lineHeight:1.6}}>{s.desc}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── DS MODE ── */}
        {mode==="ds"&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {[{id:"stack",label:"Stack"},{id:"queue",label:"Queue"}].map(d=>(
                <button key={d.id} onClick={()=>setDsMode(d.id)}
                  style={{background:dsMode===d.id?"rgba(99,102,241,0.2)":"transparent",border:`1px solid ${dsMode===d.id?G.indigo:G.border}`,color:dsMode===d.id?G.indigo:G.muted,borderRadius:8,padding:"6px 16px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"monospace",transition:"all 0.15s",boxShadow:dsMode===d.id?`0 0 12px ${G.indigo}44`:"none"}}>
                  {d.label}
                </button>
              ))}
            </div>

            {dsMode==="stack"&&(
              <div>
                <div style={{fontSize:12,color:G.muted,fontFamily:"monospace",marginBottom:10}}>
                  Your loaded array values can be pushed as a stack. Or push one by one below.
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
                  <input value={dsInput} onChange={e=>setDsInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&dsPush()} placeholder="push value"
                    style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:7,padding:"7px 11px",width:110,fontSize:13,fontFamily:"monospace",outline:"none"}}/>
                  <GlowBtn onClick={dsPush}  color={G.violet}>Push</GlowBtn>
                  <GlowBtn onClick={dsPop}   color={G.rose}>Pop</GlowBtn>
                  <GlowBtn onClick={dsPeek}  color={G.amber}>Peek</GlowBtn>
                  <GlowBtn onClick={loadDsFromInput} color={G.cyan} small>Load from array</GlowBtn>
                  <GlowBtn onClick={()=>{setDsArr([]);setDsMsg("Stack cleared.");}} color={G.muted} small>Clear</GlowBtn>
                </div>
                <div style={{display:"flex",flexDirection:"column-reverse",gap:4,alignItems:"flex-start",minHeight:100}}>
                  {dsArr.map((v,i)=>(
                    <div key={i} style={{background:dsFlash===i?G.violet+"33":G.surface,border:`1.5px solid ${dsFlash===i?G.violet:G.border}`,color:dsFlash===i?G.violet:G.text,borderRadius:8,padding:"8px 20px",fontSize:14,fontFamily:"monospace",transition:"all 0.25s",display:"flex",alignItems:"center",gap:12,minWidth:120,boxShadow:dsFlash===i?`0 0 16px ${G.violet}66`:"none"}}>
                      <span style={{fontWeight:700}}>{v}</span>
                      {i===dsArr.length-1&&<span style={{fontSize:11,color:G.violet}}>◀ TOP</span>}
                    </div>
                  ))}
                  {!dsArr.length&&<div style={{color:G.muted,fontSize:13,fontFamily:"monospace"}}>stack is empty</div>}
                </div>
                <div style={{marginTop:10,fontSize:12,color:G.dim,fontFamily:"monospace"}}>{dsMsg}</div>
              </div>
            )}

            {dsMode==="queue"&&(
              <div>
                <div style={{fontSize:12,color:G.muted,fontFamily:"monospace",marginBottom:10}}>
                  Your loaded array values can fill the queue. Or enqueue one by one below.
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
                  <input value={qInput} onChange={e=>setQInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&qEnq()} placeholder="enqueue value"
                    style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,borderRadius:7,padding:"7px 11px",width:120,fontSize:13,fontFamily:"monospace",outline:"none"}}/>
                  <GlowBtn onClick={qEnq}  color={G.emerald}>Enqueue</GlowBtn>
                  <GlowBtn onClick={qDeq}  color={G.rose}>Dequeue</GlowBtn>
                  <GlowBtn onClick={loadQFromInput} color={G.cyan} small>Load from array</GlowBtn>
                  <GlowBtn onClick={()=>{setQueue([]);setQMsg("Queue cleared.");}} color={G.muted} small>Clear</GlowBtn>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {queue.length>0&&<span style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>FRONT→</span>}
                  {queue.map((v,i)=>{
                    const isF=(qFlash==="head"&&i===0)||(qFlash==="tail"&&i===queue.length-1);
                    return (
                      <div key={i} style={{background:isF?G.emerald+"33":G.surface,border:`1.5px solid ${isF?G.emerald:G.border}`,color:isF?G.emerald:G.text,borderRadius:8,padding:"8px 18px",fontSize:14,fontFamily:"monospace",transition:"all 0.25s",boxShadow:isF?`0 0 14px ${G.emerald}66`:"none"}}>
                        {v}
                      </div>
                    );
                  })}
                  {queue.length>0&&<span style={{fontSize:11,color:G.muted,fontFamily:"monospace"}}>←REAR</span>}
                  {!queue.length&&<span style={{color:G.muted,fontSize:13,fontFamily:"monospace"}}>queue is empty</span>}
                </div>
                <div style={{marginTop:10,fontSize:12,color:G.dim,fontFamily:"monospace"}}>{qMsg}</div>
              </div>
            )}
          </div>
        )}

        {/* Hint bar */}
        <div style={{marginTop:20,padding:"10px 14px",background:G.surface,borderRadius:9,border:`1px solid ${G.border}33`,display:"flex",gap:16,flexWrap:"wrap"}}>
          {[["Tip","Type your own comma-separated numbers above and hit Load Array",G.violet],
            ["Then","Pick Sort / Search / DS mode and interact with your exact data",G.cyan],
            ["Share","This is what makes your project stand out — real user input!",G.emerald]]
            .map(([label,text,color])=>(
              <div key={label} style={{flex:1,minWidth:180,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{fontSize:11,background:color+"22",border:`1px solid ${color}55`,color,borderRadius:5,padding:"2px 7px",fontFamily:"monospace",fontWeight:700,flexShrink:0,marginTop:1}}>{label}</span>
                <span style={{fontSize:11,color:G.muted,lineHeight:1.6}}>{text}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({title,sub}){
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.3px",fontFamily:"monospace",color:G.text}}>{title}</div>
      <div style={{fontSize:12,color:G.muted,marginTop:3,fontFamily:"monospace"}}>{sub}</div>
    </div>
  );
}

function Card({children}){
  return (
    <div style={{
      background:"rgba(15,16,32,0.9)",
      border:`1px solid ${G.border}`,
      borderRadius:14,
      padding:22,
      backdropFilter:"blur(10px)",
      boxShadow:`0 0 0 1px ${G.border}33, 0 4px 40px rgba(0,0,0,0.5)`,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEARN MODE  —  Step-by-step code + explanation + complexity
═══════════════════════════════════════════════════════════ */

const LEARN_ALGOS = {
  Bubble: {
    color: "#7c3aed",
    time: "O(n²)", space: "O(1)",
    best: "O(n)", worst: "O(n²)", avg: "O(n²)",
    stable: true, inplace: true,
    tagline: "Repeatedly swap adjacent elements until sorted.",
    when: "Good for nearly-sorted data. Never use on large datasets.",
    intuition: "Imagine bubbles rising — the largest element 'bubbles up' to its correct position each pass.",
    complexity_explain: {
      time: "Two nested loops: outer runs n times, inner runs n-i times. Total comparisons ≈ n²/2 → O(n²).",
      space: "Only swaps in-place using a single temp variable. No extra array needed → O(1).",
      best: "If array is already sorted, we can detect 0 swaps in one pass and stop early → O(n).",
    },
    code: [
      { line: "function bubbleSort(arr) {",         exp: "Define our function. 'arr' is the input array we'll sort in-place." },
      { line: "  const n = arr.length;",            exp: "Store length once — avoids recalculating every iteration." },
      { line: "  for (let i = 0; i < n-1; i++) {", exp: "Outer loop: each pass guarantees the i-th largest is placed correctly at the end." },
      { line: "    let swapped = false;",           exp: "Optimization flag — if no swaps happen, array is already sorted → exit early." },
      { line: "    for (let j = 0; j < n-i-1; j++) {", exp: "Inner loop: compare adjacent pairs. We stop at n-i-1 because last i elements are already sorted." },
      { line: "      if (arr[j] > arr[j+1]) {",    exp: "Compare current element with its neighbour. If out of order, we swap them." },
      { line: "        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];", exp: "ES6 destructuring swap — no temp variable needed. The larger value moves right." },
      { line: "        swapped = true;",            exp: "Mark that at least one swap happened this pass — array wasn't fully sorted yet." },
      { line: "      }",                            exp: "" },
      { line: "    }",                              exp: "" },
      { line: "    if (!swapped) break;",           exp: "Early exit! If zero swaps occurred, every element is in order — we're done!" },
      { line: "  }",                                exp: "" },
      { line: "  return arr;",                      exp: "Array is now sorted in ascending order. Return it." },
      { line: "}",                                  exp: "" },
    ],
    steps: (arr) => {
      const a=[...arr], steps=[];
      const n=a.length;
      for(let i=0;i<n-1;i++){
        let swapped=false;
        for(let j=0;j<n-i-1;j++){
          steps.push({array:[...a],comparing:[j,j+1],pivot:null,sorted:[],codeLine:5,msg:`Comparing a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}`});
          if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];swapped=true;steps.push({array:[...a],comparing:[j,j+1],pivot:null,sorted:[],codeLine:6,msg:`Swapped! ${a[j+1]} > ${a[j]} — moved larger right`});}
        }
        if(!swapped){steps.push({array:[...a],comparing:[],pivot:null,sorted:a.map((_,i)=>i),codeLine:10,msg:`No swaps in this pass — array is sorted! Early exit.`});break;}
      }
      steps.push({array:[...a],comparing:[],pivot:null,sorted:a.map((_,i)=>i),codeLine:12,msg:`Done! Array sorted in ascending order.`});
      return steps;
    },
  },
  Selection: {
    color: "#06b6d4",
    time: "O(n²)", space: "O(1)",
    best: "O(n²)", worst: "O(n²)", avg: "O(n²)",
    stable: false, inplace: true,
    tagline: "Find the minimum element and place it at the front, repeatedly.",
    when: "Useful when writes are expensive (minimises swaps to exactly n-1).",
    intuition: "Like picking cards from a hand — always pick the smallest remaining card and put it in position.",
    complexity_explain: {
      time: "Always scans the remaining unsorted portion for the min: (n-1)+(n-2)+…+1 = n(n-1)/2 → O(n²). No best case improvement.",
      space: "Swaps in-place, only stores the index of the minimum element → O(1).",
      best: "Even if sorted, still scans everything to confirm minimum → O(n²). No early exit possible.",
    },
    code: [
      { line: "function selectionSort(arr) {",          exp: "Sort by repeatedly selecting the minimum of the remaining unsorted portion." },
      { line: "  const n = arr.length;",               exp: "Cache the length." },
      { line: "  for (let i = 0; i < n-1; i++) {",    exp: "Each iteration places the correct element at position i. After n-1 passes, done." },
      { line: "    let minIdx = i;",                   exp: "Assume the first unsorted element is the smallest. We'll update this if we find something smaller." },
      { line: "    for (let j = i+1; j < n; j++) {",  exp: "Scan the rest of the unsorted array to find the true minimum." },
      { line: "      if (arr[j] < arr[minIdx])",       exp: "Found a new minimum! Update our tracker." },
      { line: "        minIdx = j;",                   exp: "Remember where the new minimum is." },
      { line: "    }",                                 exp: "" },
      { line: "    if (minIdx !== i) {",               exp: "Only swap if minimum isn't already in position i — avoids unnecessary writes." },
      { line: "      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];", exp: "Swap: put the found minimum into its correct sorted position." },
      { line: "    }",                                 exp: "" },
      { line: "  }",                                   exp: "" },
      { line: "  return arr;",                         exp: "Sorted array returned." },
      { line: "}",                                     exp: "" },
    ],
    steps: (arr) => {
      const a=[...arr],steps=[],sorted=[];
      const n=a.length;
      for(let i=0;i<n-1;i++){
        let minIdx=i;
        for(let j=i+1;j<n;j++){
          steps.push({array:[...a],comparing:[minIdx,j],pivot:minIdx,sorted:[...sorted],codeLine:5,msg:`Scanning: a[${j}]=${a[j]} vs current min a[${minIdx}]=${a[minIdx]}`});
          if(a[j]<a[minIdx])minIdx=j;
        }
        if(minIdx!==i){[a[i],a[minIdx]]=[a[minIdx],a[i]];steps.push({array:[...a],comparing:[i,minIdx],pivot:null,sorted:[...sorted],codeLine:9,msg:`Placed minimum ${a[i]} at position ${i}`});}
        sorted.push(i);
      }
      sorted.push(n-1);
      steps.push({array:[...a],comparing:[],pivot:null,sorted:[...sorted],codeLine:12,msg:`Done! All elements in sorted position.`});
      return steps;
    },
  },
  Insertion: {
    color: "#10b981",
    time: "O(n²)", space: "O(1)",
    best: "O(n)", worst: "O(n²)", avg: "O(n²)",
    stable: true, inplace: true,
    tagline: "Build sorted array one element at a time by inserting into correct position.",
    when: "Excellent for small arrays or nearly-sorted data. Used in hybrid algorithms like Timsort.",
    intuition: "Like sorting playing cards in your hand — pick one card and slide it left until it's in the right spot.",
    complexity_explain: {
      time: "Each element shifts left past elements larger than it. Worst case (reverse sorted): 1+2+…+(n-1) = O(n²). Best case (already sorted): no shifts needed → O(n).",
      space: "Only one extra variable (key) to hold the element being inserted → O(1).",
      best: "Already-sorted input: inner while loop never executes — just n comparisons total → O(n).",
    },
    code: [
      { line: "function insertionSort(arr) {",            exp: "Build the sorted portion from left to right, one element at a time." },
      { line: "  const n = arr.length;",                 exp: "Cache the array length." },
      { line: "  for (let i = 1; i < n; i++) {",        exp: "Start from index 1 — the element at index 0 is trivially 'sorted' by itself." },
      { line: "    const key = arr[i];",                 exp: "Save the current element. We'll shift others right to make room for it." },
      { line: "    let j = i - 1;",                      exp: "j points to the last element of the sorted portion — our comparison target." },
      { line: "    while (j >= 0 && arr[j] > key) {",   exp: "Shift elements right as long as they are larger than our key." },
      { line: "      arr[j + 1] = arr[j];",             exp: "Move arr[j] one position right — opening a slot to the left." },
      { line: "      j--;",                              exp: "Move j left to compare the next element in the sorted portion." },
      { line: "    }",                                   exp: "" },
      { line: "    arr[j + 1] = key;",                  exp: "Insert key into the correct position — all larger elements are now to its right." },
      { line: "  }",                                     exp: "" },
      { line: "  return arr;",                           exp: "Sorted array returned." },
      { line: "}",                                       exp: "" },
    ],
    steps: (arr) => {
      const a=[...arr],steps=[];
      const n=a.length;
      for(let i=1;i<n;i++){
        const key=a[i];let j=i-1;
        steps.push({array:[...a],comparing:[i],pivot:i,sorted:[],codeLine:3,msg:`Inserting key=${key} into sorted portion [0..${i-1}]`});
        while(j>=0&&a[j]>key){
          steps.push({array:[...a],comparing:[j,j+1],pivot:null,sorted:[],codeLine:5,msg:`a[${j}]=${a[j]} > key=${key}, shifting right`});
          a[j+1]=a[j];j--;
        }
        a[j+1]=key;
        steps.push({array:[...a],comparing:[j+1],pivot:null,sorted:[],codeLine:9,msg:`Inserted key=${key} at position ${j+1}`});
      }
      steps.push({array:[...a],comparing:[],pivot:null,sorted:a.map((_,i)=>i),codeLine:11,msg:`Done! Array sorted.`});
      return steps;
    },
  },
  Merge: {
    color: "#6366f1",
    time: "O(n log n)", space: "O(n)",
    best: "O(n log n)", worst: "O(n log n)", avg: "O(n log n)",
    stable: true, inplace: false,
    tagline: "Divide array in half recursively, then merge sorted halves back together.",
    when: "Best general-purpose stable sort. Preferred when stability matters (e.g. sorting records).",
    intuition: "Divide and conquer — split the problem in half until trivial (size 1), then merge solutions bottom-up like a zipper.",
    complexity_explain: {
      time: "log n levels of recursion (each halving the array) × n work per level to merge → O(n log n). Same in all cases.",
      space: "Merging requires a temporary auxiliary array of size n to hold combined halves → O(n). This is the trade-off vs in-place sorts.",
      best: "Even with sorted input, must still divide and merge everything → O(n log n). No shortcut possible.",
    },
    code: [
      { line: "function mergeSort(arr) {",                  exp: "Entry point. Returns a new sorted array (not in-place)." },
      { line: "  if (arr.length <= 1) return arr;",        exp: "Base case: a single element is trivially sorted — return it." },
      { line: "  const mid = Math.floor(arr.length / 2);", exp: "Find the midpoint to split into two roughly equal halves." },
      { line: "  const left  = mergeSort(arr.slice(0, mid));",  exp: "Recursively sort the left half. Goes deeper until base case." },
      { line: "  const right = mergeSort(arr.slice(mid));",     exp: "Recursively sort the right half. Mirror of left." },
      { line: "  return merge(left, right);",               exp: "Combine the two sorted halves into one sorted array." },
      { line: "}",                                          exp: "" },
      { line: "function merge(left, right) {",             exp: "Merge two sorted arrays into one sorted array." },
      { line: "  const result = [];",                      exp: "Output array — this is the O(n) extra space." },
      { line: "  let i = 0, j = 0;",                       exp: "Two pointers — one for left half, one for right half." },
      { line: "  while (i < left.length && j < right.length) {", exp: "Compare front elements of both halves — take the smaller one." },
      { line: "    if (left[i] <= right[j])",              exp: "Left element is smaller or equal — take it (≤ preserves stability)." },
      { line: "      result.push(left[i++]);",             exp: "Add left[i] to result, advance left pointer." },
      { line: "    else result.push(right[j++]);",         exp: "Right element is smaller — add right[j], advance right pointer." },
      { line: "  }",                                       exp: "" },
      { line: "  return result.concat(left.slice(i)).concat(right.slice(j));", exp: "Append any remaining elements from whichever half wasn't exhausted." },
      { line: "}",                                         exp: "" },
    ],
    steps: (arr) => {
      const steps=[];
      function ms(a,offset){
        if(a.length<=1)return a;
        const mid=Math.floor(a.length/2);
        const L=ms(a.slice(0,mid),offset),R=ms(a.slice(mid),offset+mid);
        const merged=[];let i=0,j=0;
        while(i<L.length&&j<R.length){
          const li=offset+i,ri=offset+mid+j;
          steps.push({array:null,comparing:[li,ri],pivot:null,sorted:[],codeLine:10,msg:`Merging: comparing L[${i}]=${L[i]} vs R[${j}]=${R[j]}`});
          if(L[i]<=R[j])merged.push(L[i++]);else merged.push(R[j++]);
        }
        while(i<L.length)merged.push(L[i++]);
        while(j<R.length)merged.push(R[j++]);
        return merged;
      }
      const sorted=ms([...arr],0);
      if(!steps.length)steps.push({array:[...arr],comparing:[],pivot:null,sorted:[],codeLine:1,msg:"Array of size 1 — already sorted (base case)."});
      steps.push({array:sorted,comparing:[],pivot:null,sorted:sorted.map((_,i)=>i),codeLine:15,msg:"All merges complete. Array fully sorted!"});
      return steps;
    },
  },
  Quick: {
    color: "#f59e0b",
    time: "O(n log n)", space: "O(log n)",
    best: "O(n log n)", worst: "O(n²)", avg: "O(n log n)",
    stable: false, inplace: true,
    tagline: "Pick a pivot, partition elements around it, recurse on both sides.",
    when: "Fastest in practice for most inputs. Default sort in many language runtimes (V8, etc.).",
    intuition: "Pick any element as a 'pivot'. Put everything smaller to its left, larger to its right. Pivot is now in its final position. Repeat on both sides.",
    complexity_explain: {
      time: "Average: log n levels of recursion × n partitioning work = O(n log n). Worst case (already-sorted + bad pivot): n levels × n work = O(n²). Randomised pivot avoids this.",
      space: "No auxiliary array — partitions in-place. But recursion stack uses O(log n) space on average, O(n) worst case.",
      best: "Pivot always lands in the middle: perfectly balanced splits → O(n log n).",
    },
    code: [
      { line: "function quickSort(arr, lo=0, hi=arr.length-1) {", exp: "Recursive sort on subarray from index lo to hi." },
      { line: "  if (lo >= hi) return;",                    exp: "Base case: subarray of size 0 or 1 is already sorted." },
      { line: "  const pivotIdx = partition(arr, lo, hi);", exp: "Partition the array — pivot ends up in its correct final position." },
      { line: "  quickSort(arr, lo, pivotIdx - 1);",        exp: "Recursively sort the left partition (elements < pivot)." },
      { line: "  quickSort(arr, pivotIdx + 1, hi);",        exp: "Recursively sort the right partition (elements > pivot)." },
      { line: "}",                                          exp: "" },
      { line: "function partition(arr, lo, hi) {",          exp: "Lomuto partition scheme — use last element as pivot." },
      { line: "  const pivot = arr[hi];",                   exp: "Choose last element as pivot. (Random choice is better in production!)" },
      { line: "  let i = lo - 1;",                          exp: "i tracks the boundary between 'smaller than pivot' and 'rest'." },
      { line: "  for (let j = lo; j < hi; j++) {",         exp: "j scans all elements except the pivot." },
      { line: "    if (arr[j] <= pivot) {",                 exp: "If current element belongs in the left partition (≤ pivot)..." },
      { line: "      i++;",                                  exp: "Expand the left partition boundary by one." },
      { line: "      [arr[i], arr[j]] = [arr[j], arr[i]];", exp: "Swap: move this small element into the left partition." },
      { line: "    }",                                       exp: "" },
      { line: "  }",                                        exp: "" },
      { line: "  [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];", exp: "Final swap: put pivot in its correct position (between left and right partitions)." },
      { line: "  return i + 1;",                            exp: "Return pivot's final index — left side all ≤ pivot, right side all > pivot." },
      { line: "}",                                          exp: "" },
    ],
    steps: (arr) => {
      const a=[...arr],steps=[];
      function qs(lo,hi){
        if(lo>=hi)return;
        const pivot=a[hi];let i=lo-1;
        for(let j=lo;j<hi;j++){
          steps.push({array:[...a],comparing:[j,hi],pivot:hi,sorted:[],codeLine:10,msg:`Comparing a[${j}]=${a[j]} with pivot=${pivot}`});
          if(a[j]<=pivot){i++;[a[i],a[j]]=[a[j],a[i]];if(i!==j)steps.push({array:[...a],comparing:[i,j],pivot:hi,sorted:[],codeLine:12,msg:`a[${j}]≤pivot → swap a[${i}] and a[${j}]`});}
        }
        [a[i+1],a[hi]]=[a[hi],a[i+1]];
        steps.push({array:[...a],comparing:[],pivot:i+1,sorted:[],codeLine:15,msg:`Pivot ${a[i+1]} placed at final position ${i+1}`});
        qs(lo,i);qs(i+2,hi);
      }
      qs(0,a.length-1);
      steps.push({array:[...a],comparing:[],pivot:null,sorted:a.map((_,i)=>i),codeLine:5,msg:"Recursion complete. Array fully sorted!"});
      return steps;
    },
  },
};

function LearnMode() {
  const [algoKey, setAlgoKey]   = useState("Bubble");
  const [rawInput, setRawInput] = useState("64, 34, 25, 12, 22, 11, 90");
  const [baseArr, setBaseArr]   = useState([64,34,25,12,22,11,90]);
  const [steps, setSteps]       = useState([]);
  const [stepIdx, setStepIdx]   = useState(-1);
  const [playing, setPlaying]   = useState(false);
  const [speed, setSpeed]       = useState(600);
  const [inputErr, setInputErr] = useState("");
  const tmRef = useRef(null);
  const codeRefs = useRef({});

  const algo = LEARN_ALGOS[algoKey];

  const parseNums = (s) => s.split(/[\s,;]+/).map(Number).filter(n=>!isNaN(n));

  const loadArr = () => {
    const nums = parseNums(rawInput);
    if (nums.length < 2 || nums.length > 20) { setInputErr("Enter 2–20 numbers."); return; }
    setInputErr(""); setBaseArr(nums);
    const s = algo.steps(nums);
    setSteps(s); setStepIdx(-1); setPlaying(false);
    if (tmRef.current) clearTimeout(tmRef.current);
  };

  useEffect(() => {
    const s = algo.steps(baseArr);
    setSteps(s); setStepIdx(-1); setPlaying(false);
    if (tmRef.current) clearTimeout(tmRef.current);
  }, [algoKey]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    tmRef.current = setTimeout(() => setStepIdx(i => i+1), speed);
    return () => clearTimeout(tmRef.current);
  }, [playing, stepIdx, speed, steps]);

  useEffect(() => {
    if (stepIdx >= 0 && steps[stepIdx]) {
      const line = steps[stepIdx].codeLine;
      const el = codeRefs.current[line];
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [stepIdx]);

  const cur = stepIdx >= 0 ? steps[stepIdx] : null;
  const displayArr = cur?.array ?? baseArr;
  const maxV = Math.max(...displayArr, 1);

  const prev = () => { if(tmRef.current)clearTimeout(tmRef.current); setPlaying(false); setStepIdx(i=>Math.max(0,i-1)); };
  const next = () => { if(tmRef.current)clearTimeout(tmRef.current); setPlaying(false); setStepIdx(i=>Math.min(steps.length-1,i+1)); };
  const reset = () => { if(tmRef.current)clearTimeout(tmRef.current); setPlaying(false); setStepIdx(-1); };
  const togglePlay = () => {
    if (stepIdx >= steps.length-1) { setStepIdx(0); setPlaying(true); return; }
    setPlaying(p=>!p);
  };

  const progress = steps.length ? Math.round(((stepIdx+1)/steps.length)*100) : 0;

  return (
    <div>
      <SectionHeader title="Learn Mode" sub="Pick an algorithm · Load your array · Step through every line of code"/>

      {/* Algorithm selector */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {Object.keys(LEARN_ALGOS).map(k=>(
          <button key={k} onClick={()=>setAlgoKey(k)} style={{
            background:algoKey===k?LEARN_ALGOS[k].color+"28":"transparent",
            border:`1px solid ${algoKey===k?LEARN_ALGOS[k].color:G.border}`,
            color:algoKey===k?LEARN_ALGOS[k].color:G.muted,
            borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:700,
            fontFamily:"monospace",transition:"all 0.15s",
            boxShadow:algoKey===k?`0 0 14px ${LEARN_ALGOS[k].color}55`:"none",
          }}>{k} Sort</button>
        ))}
      </div>

      {/* Tagline card */}
      <div style={{background:`${algo.color}12`,border:`1px solid ${algo.color}44`,borderRadius:10,padding:"12px 16px",marginBottom:16,borderLeft:`3px solid ${algo.color}`}}>
        <div style={{fontSize:13,color:G.text,fontWeight:600,marginBottom:4}}>{algo.tagline}</div>
        <div style={{fontSize:12,color:G.muted,lineHeight:1.6}}>{algo.intuition}</div>
        <div style={{fontSize:12,color:algo.color,marginTop:6,fontFamily:"monospace"}}>Best use: {algo.when}</div>
      </div>

      {/* Input row */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={rawInput} onChange={e=>{setRawInput(e.target.value);setInputErr("");}}
          onKeyDown={e=>e.key==="Enter"&&loadArr()}
          placeholder="Your numbers e.g. 5, 3, 8, 1, 9"
          style={{flex:1,minWidth:200,background:G.surface,border:`1.5px solid ${inputErr?G.rose:G.border}`,color:G.text,borderRadius:8,padding:"9px 13px",fontSize:13,fontFamily:"monospace",outline:"none",boxShadow:inputErr?`0 0 10px ${G.rose}33`:"none"}}/>
        <GlowBtn onClick={loadArr} color={algo.color}>Load & Generate Steps</GlowBtn>
      </div>
      {inputErr&&<div style={{fontSize:12,color:G.rose,fontFamily:"monospace",marginBottom:10}}>{inputErr}</div>}

      {/* ── Main 3-column layout ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>

        {/* LEFT: Bars + controls */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Bar chart */}
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"12px 12px 0",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:2,height:140}}>
              {displayArr.map((v,i)=>{
                const isCmp=cur?.comparing?.includes(i);
                const isSorted=cur?.sorted?.includes(i);
                const isPivot=cur?.pivot===i;
                let color=G.border;
                if(isPivot)color=G.rose;
                else if(isCmp)color=algo.color;
                else if(isSorted)color=G.emerald;
                return (
                  <div key={i} style={{flex:1,background:color,height:`${(v/maxV)*100}%`,borderRadius:"3px 3px 0 0",minWidth:3,
                    boxShadow:(isCmp||isPivot)?`0 0 8px ${color}`:isSorted?`0 0 4px ${G.emerald}55`:"none",
                    transition:"background 0.15s,height 0.15s"}}>
                  </div>
                );
              })}
            </div>
            {/* Value labels */}
            <div style={{display:"flex",gap:2,marginTop:4,paddingBottom:8}}>
              {displayArr.map((v,i)=>{
                const isCmp=cur?.comparing?.includes(i), isPivot=cur?.pivot===i, isSorted=cur?.sorted?.includes(i);
                return (
                  <div key={i} style={{flex:1,textAlign:"center",fontSize:10,fontFamily:"monospace",fontWeight:700,
                    color:isPivot?G.rose:isCmp?algo.color:isSorted?G.emerald:G.muted,
                    transition:"color 0.15s"}}>
                    {v}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step explanation bubble */}
          <div style={{background:G.surface,border:`1px solid ${cur?algo.color+"55":G.border}`,borderRadius:10,padding:"12px 14px",minHeight:64,
            boxShadow:cur?`0 0 16px ${algo.color}22`:"none",transition:"all 0.3s"}}>
            {cur ? (
              <>
                <div style={{fontSize:11,color:algo.color,fontFamily:"monospace",marginBottom:5,fontWeight:700,letterSpacing:"0.08em"}}>
                  STEP {stepIdx+1} / {steps.length}
                </div>
                <div style={{fontSize:13,color:G.text,lineHeight:1.6}}>{cur.msg}</div>
              </>
            ) : (
              <div style={{fontSize:12,color:G.muted,fontFamily:"monospace"}}>Hit Play or Step → to begin the walkthrough.</div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{background:G.surface,borderRadius:8,height:6,overflow:"hidden",border:`1px solid ${G.border}`}}>
            <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${algo.color},${G.cyan})`,borderRadius:8,transition:"width 0.2s",boxShadow:`0 0 8px ${algo.color}88`}}/>
          </div>

          {/* Playback controls */}
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <GlowBtn onClick={reset} color={G.muted} small>⏮ Reset</GlowBtn>
            <GlowBtn onClick={prev}  color={G.dim} small disabled={stepIdx<=0}>← Prev</GlowBtn>
            <GlowBtn onClick={togglePlay} color={algo.color}>
              {playing?"⏸ Pause": stepIdx>=steps.length-1?"⏮ Replay":"▶ Play"}
            </GlowBtn>
            <GlowBtn onClick={next}  color={G.dim} small disabled={stepIdx>=steps.length-1}>Next →</GlowBtn>
            <label style={{fontSize:11,color:G.muted,display:"flex",alignItems:"center",gap:6,fontFamily:"monospace",marginLeft:4}}>
              Speed
              <input type="range" min={100} max={1500} step={50} value={1600-speed}
                onChange={e=>setSpeed(1600-Number(e.target.value))}
                style={{width:70,accentColor:algo.color}}/>
            </label>
          </div>
        </div>

        {/* RIGHT: Code panel */}
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"10px 14px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:G.rose,opacity:0.8}}/>
            <div style={{width:10,height:10,borderRadius:"50%",background:G.amber,opacity:0.8}}/>
            <div style={{width:10,height:10,borderRadius:"50%",background:G.emerald,opacity:0.8}}/>
            <span style={{fontSize:11,color:G.muted,fontFamily:"monospace",marginLeft:6}}>{algoKey.toLowerCase()}_sort.js</span>
          </div>
          <div style={{overflowY:"auto",maxHeight:380,padding:"12px 0"}}>
            {algo.code.map((row,i)=>{
              const isActive = cur?.codeLine===i;
              return (
                <div key={i} ref={el=>codeRefs.current[i]=el} style={{
                  display:"flex",gap:0,
                  background:isActive?`${algo.color}22`:"transparent",
                  borderLeft:isActive?`3px solid ${algo.color}`:"3px solid transparent",
                  transition:"background 0.2s,border-color 0.2s",
                  boxShadow:isActive?`inset 0 0 20px ${algo.color}11`:"none",
                }}>
                  <span style={{width:32,textAlign:"right",paddingRight:12,fontSize:11,color:isActive?algo.color:G.muted,fontFamily:"monospace",flexShrink:0,lineHeight:"22px",userSelect:"none",paddingLeft:8}}>
                    {i+1}
                  </span>
                  <span style={{fontSize:12,fontFamily:"monospace",color:isActive?G.text:G.dim,lineHeight:"22px",whiteSpace:"pre",paddingRight:14,letterSpacing:"0.01em"}}>
                    {row.line}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Inline explanation of highlighted line */}
          {cur&&algo.code[cur.codeLine]?.exp&&(
            <div style={{borderTop:`1px solid ${G.border}`,padding:"10px 14px",background:`${algo.color}0d`}}>
              <div style={{fontSize:10,color:algo.color,fontFamily:"monospace",marginBottom:3,fontWeight:700}}>LINE {cur.codeLine+1} EXPLANATION</div>
              <div style={{fontSize:11,color:G.dim,lineHeight:1.6}}>{algo.code[cur.codeLine].exp}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Complexity Deep-Dive ── */}
      <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:20,marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:G.text,fontFamily:"monospace",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:algo.color}}>◈</span> Time & Space Complexity Breakdown
        </div>

        {/* Complexity grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
          {[
            ["Best Case",  algo.best,  G.emerald],
            ["Average",    algo.time,  algo.color],
            ["Worst Case", algo.worst, G.rose],
            ["Space",      algo.space, G.cyan],
          ].map(([label,val,color])=>(
            <div key={label} style={{background:G.card,border:`1px solid ${color}44`,borderRadius:10,padding:"12px 14px",textAlign:"center",
              boxShadow:`0 0 12px ${color}18`,transition:"box-shadow 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 20px ${color}44`}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 12px ${color}18`}>
              <div style={{fontSize:10,color:G.muted,fontFamily:"monospace",marginBottom:6,letterSpacing:"0.08em"}}>{label.toUpperCase()}</div>
              <div style={{fontSize:20,fontWeight:800,color,fontFamily:"monospace",textShadow:`0 0 12px ${color}88`}}>{val}</div>
            </div>
          ))}
        </div>

        {/* Explanations */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            ["Time Complexity",  algo.complexity_explain.time,  algo.color],
            ["Space Complexity", algo.complexity_explain.space, G.cyan],
            ["Best Case",        algo.complexity_explain.best,  G.emerald],
          ].map(([label,text,color])=>(
            <div key={label} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 12px",background:G.card,borderRadius:8,border:`1px solid ${G.border}`}}>
              <span style={{fontSize:11,background:color+"22",border:`1px solid ${color}55`,color,borderRadius:5,padding:"3px 8px",fontFamily:"monospace",fontWeight:700,flexShrink:0,marginTop:1,whiteSpace:"nowrap"}}>{label}</span>
              <span style={{fontSize:12,color:G.muted,lineHeight:1.7}}>{text}</span>
            </div>
          ))}
        </div>

        {/* Properties row */}
        <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
          {[
            ["Stable",   algo.stable   ? "Yes" : "No",  algo.stable   ? G.emerald : G.rose,
              "Stable: equal elements maintain their original relative order after sorting."],
            ["In-Place", algo.inplace  ? "Yes" : "No",  algo.inplace  ? G.emerald : G.rose,
              "In-place: sorts within the original array without allocating extra O(n) memory."],
            ["Paradigm", algoKey==="Merge"||algoKey==="Quick" ? "Divide & Conquer" : "Iterative", G.cyan,
              "The high-level strategy: iterative (loop-based) vs divide & conquer (recursive halving)."],
          ].map(([label,val,color,tip])=>(
            <div key={label} title={tip} style={{background:G.card,border:`1px solid ${color}44`,borderRadius:8,padding:"8px 14px",cursor:"help"}}>
              <div style={{fontSize:10,color:G.muted,fontFamily:"monospace"}}>{label}</div>
              <div style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace"}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:20}}>
        <div style={{fontSize:14,fontWeight:700,color:G.text,fontFamily:"monospace",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:G.cyan}}>⊞</span> Algorithm Comparison Table
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"monospace"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${G.border}`}}>
                {["Algorithm","Best","Average","Worst","Space","Stable","In-Place"].map(h=>(
                  <th key={h} style={{padding:"8px 10px",textAlign:"left",color:G.muted,fontWeight:600,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(LEARN_ALGOS).map(([name,a])=>(
                <tr key={name} style={{borderBottom:`1px solid ${G.border}22`,background:name===algoKey?`${a.color}12`:"transparent",transition:"background 0.2s"}}>
                  <td style={{padding:"8px 10px",color:name===algoKey?a.color:G.dim,fontWeight:name===algoKey?700:400}}>
                    {name==="Bubble"?"Bubble":name==="Selection"?"Selection":name==="Insertion"?"Insertion":name==="Merge"?"Merge":"Quick"} Sort
                  </td>
                  <td style={{padding:"8px 10px",color:G.emerald}}>{a.best}</td>
                  <td style={{padding:"8px 10px",color:a.color}}>{a.time}</td>
                  <td style={{padding:"8px 10px",color:G.rose}}>{a.worst}</td>
                  <td style={{padding:"8px 10px",color:G.cyan}}>{a.space}</td>
                  <td style={{padding:"8px 10px",color:a.stable?G.emerald:G.rose}}>{a.stable?"✓ Yes":"✗ No"}</td>
                  <td style={{padding:"8px 10px",color:a.inplace?G.emerald:G.rose}}>{a.inplace?"✓ Yes":"✗ No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
