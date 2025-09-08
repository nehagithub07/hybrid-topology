// Hubs-only hybrid (star–star) with jsPlumb
let instance;
let devicesPlaced = { pcs: false, hubs: false };
let endpointsCreated = false;
const edgesMade = new Set();

function initialise() {
  Swal.fire({
    backdrop: false,
    target: '#mid',
    customClass: { container: 'position-absolute' },
    title: "Hybrid Topology (Hubs only)",
    text: "Place PCs and Hubs, connect PC-1/2/3 to HUB-1, HUB-1 ↔ HUB-2, and PC-4/5 to HUB-2. Then click CHECK.",
    icon: "info",
  });

  jsPlumb.ready(function () {
    instance = jsPlumb.getInstance({});
    // IMPORTANT: set the correct container (bug fix)
    instance.setContainer(document.getElementById('mid'));

    instance.bind('connection', function (info) {
      const a = info.sourceId;
      const b = info.targetId;
      const key = [a, b].sort().join('|');
      edgesMade.add(key);
      // console.log('connected:', key);
    });
  });
}

function imgDraw(id) {
  if (id === 'com' && !devicesPlaced.pcs) {
    ['PCH1','PCH2','PCH3','PCH4','PCH5'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    devicesPlaced.pcs = true;
    document.getElementById('com').onclick = null;
    document.getElementById('com').style.opacity = 0.5;
    maybeCreateEndpoints();
  }

  if (id === 'iswitch' && !devicesPlaced.hubs) {
    ['HUBH1','HUBH2'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    devicesPlaced.hubs = true;
    document.getElementById('iswitch').onclick = null;
    document.getElementById('iswitch').style.opacity = 0.5;
    maybeCreateEndpoints();
  }
}

function endpointPx(el, x, y, color = 'black', r = 6) {
  return instance.addEndpoint(el, {
    endpoint: ['Dot', { radius: r }],
    anchor: [[0, 0, 0, 1, x, y]],   // px from top-left of the element
    isSource: true,
    isTarget: true,
    maxConnections: -1,
    connector: 'Straight',
    paintStyle: { stroke: 'black', strokeWidth: 3 },
    connectorStyle: { stroke: 'black', strokeWidth: 3 },
    endpointStyle: { fill: color },
    connectionsDetachable: false
  });
}
function maybeCreateEndpoints() {
  if (!devicesPlaced.pcs || !devicesPlaced.hubs || endpointsCreated) return;

  // --- PC ports (image ~100x100). Put dots on the screen bezel. ---
  // bottom-center for PC-1 (to HUB-1)
  endpointPx('PCH1', 50, 82, 'black', 6);

  // middle-left (to HUB-1)
  endpointPx('PCH2', 8, 50, 'black', 6);

  // middle-right (to HUB-1)
  endpointPx('PCH3', 92, 50, 'black', 6);

  // middle-right (to HUB-2)
  endpointPx('PCH4', 92, 50, 'black', 6);

  // middle-left (to HUB-2)
  endpointPx('PCH5', 8, 50, 'black', 6);

  // --- HUB ports (image ~100x75). Align with the front jack row. ---
  // HUB-1: left jack, right jack, bottom center (for the vertical backbone)
  

// --- HUB-1: four ports ---
// left jack, right jack, center jack (front row), bottom jack (to HUB-2)
endpointPx('HUBH1', 26, 54, 'red', 6);   // left jack
endpointPx('HUBH1', 84, 54, 'red', 6);   // right jack
endpointPx('HUBH1', 63, 54, 'red', 6);   // center jack (NEW)
  endpointPx('HUBH1', 45, 54, 'red', 6);   // bottom jack (to HUB-2)

  // HUB-2: left jack, right jack, top center (from HUB-1)
  endpointPx('HUBH2', 26, 54, 'red', 6);   // left jack
  endpointPx('HUBH2', 84, 54, 'red', 6);   // right jack
  endpointPx('HUBH2', 45, 54,  'red', 6);   // top jack (from HUB-1)

  endpointsCreated = true;
}


function redirect() {
  const v = document.getElementById("dropdown").value;
  if (v === "hybrid") window.location.replace("hybrid.html");
  if (v === "star")   window.location.replace("index.html");
  if (v === "bus")    window.location.replace("bus.html");
  if (v === "ring")   window.location.replace("ring.html");
  if (v === "mesh")   window.location.replace("mesh.html");
}

function reset() { window.location.reload(); }

function evaltop() {
  if (!devicesPlaced.pcs) {
    return Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"End devices missing", text:"Click on PC to place PC-1 … PC-5."
    });
  }
  if (!devicesPlaced.hubs) {
    return Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Central devices missing", text:"Click on Hub to place HUB-1 and HUB-2."
    });
  }
  if (edgesMade.size < 6) {
    return Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Incomplete", text:"Make all six connections, then click CHECK.",
      icon:"info"
    });
  }

  const need = new Set([
    'HUBH1|PCH1',
    'HUBH1|PCH2',
    'HUBH1|PCH3',
    'HUBH1|HUBH2',
    'HUBH2|PCH4',
    'HUBH2|PCH5'
  ]);

  let ok = true;
  need.forEach(k => { if (!edgesMade.has(k)) ok = false; });

  if (ok) {
    Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Connection Established!",
      text:"Hybrid built correctly with hubs only.",
      icon:"success"
    });
  } else {
    Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Oops...", text:"Connections don’t match the target diagram. Reset or fix the wires.",
      icon:"error"
    });
  }
}
