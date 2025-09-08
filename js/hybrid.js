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

function endpoint(opts) {
  return instance.addEndpoint(opts.el, {
    endpoint: ['Dot', { radius: 7 }],
    anchor: opts.anchor,
    isSource: true,
    isTarget: true,
    maxConnections: -1,
    connector: 'Straight',
    paintStyle: { stroke: 'black', strokeWidth: 3 },
    connectorStyle: { stroke: 'black', strokeWidth: 3 },
    endpointStyle: { fill: opts.color || 'black' },
    connectionsDetachable: false
  });
}

function maybeCreateEndpoints() {
  if (!devicesPlaced.pcs || !devicesPlaced.hubs || endpointsCreated) return;

  // PCs: one port each, oriented toward the nearest hub
  endpoint({ el: 'PCH1', anchor: 'Bottom' });       // to HUB-1 (from above)
  endpoint({ el: 'PCH2', anchor: 'Left' });         // to HUB-1 (from right)
  endpoint({ el: 'PCH3', anchor: 'Right' });        // to HUB-1 (from left)
  endpoint({ el: 'PCH4', anchor: 'Right' });        // to HUB-2 (from left)
  endpoint({ el: 'PCH5', anchor: 'Left' });         // to HUB-2 (from right)

  // HUB-1 ports: top/right/left/bottom
  endpoint({ el: 'HUBH1', anchor: 'Top',    color: 'red' });
  endpoint({ el: 'HUBH1', anchor: 'Right',  color: 'red' });
  endpoint({ el: 'HUBH1', anchor: 'Left',   color: 'red' });
  endpoint({ el: 'HUBH1', anchor: 'Bottom', color: 'red' });

  // HUB-2 ports: left/right/top
  endpoint({ el: 'HUBH2', anchor: 'Left',   color: 'red' });
  endpoint({ el: 'HUBH2', anchor: 'Right',  color: 'red' });
  endpoint({ el: 'HUBH2', anchor: 'Top',    color: 'red' });

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
