// Hybrid (star–star) builder with choice: PCs or Laptops; Hubs or Switches
let instance;
let chosenEnd = null;   // 'pc' or 'laptop'
let chosenCore = null;  // 'hub' or 'switch'
let endpointsCreated = false;
const edgesMade = new Set();

function initialise() {
  Swal.fire({
    backdrop: false,
    target: '#mid',
    customClass: { container: 'position-absolute' },
    title: "Hybrid Topology",
    html: "Choose <b>PC</b> or <b>Laptop</b> and <b>Hub</b> or <b>Switch</b>. Then connect 1/2/3 → device-1, device-1 ↔ device-2, 4/5 → device-2. Finally click <b>CHECK</b>.",
    icon: "info",
  });

  jsPlumb.ready(function () {
    instance = jsPlumb.getInstance({});
    instance.setContainer(document.getElementById('mid'));

    instance.bind('connection', function (info) {
      const a = info.sourceId;
      const b = info.targetId;
      const key = [a, b].sort().join('|');
      edgesMade.add(key);
    });
  });
}

function imgDraw(id) {
  // END DEVICES
  if (id === 'com') {
    if (chosenEnd && chosenEnd !== 'pc') return denyEndChoice('Laptop', 'PC');
    if (!chosenEnd) chosenEnd = 'pc';
    ['PCH1','PCH2','PCH3','PCH4','PCH5'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('com');
    disablePalette('laptop'); // enforce one end-device family
    maybeCreateEndpoints();
  }
  if (id === 'laptop') {
    if (chosenEnd && chosenEnd !== 'laptop') return denyEndChoice('PC', 'Laptop');
    if (!chosenEnd) chosenEnd = 'laptop';
    ['LAPH1','LAPH2','LAPH3','LAPH4','LAPH5'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('laptop');
    disablePalette('com'); // enforce one end-device family
    maybeCreateEndpoints();
  }

  // CORE DEVICES
  if (id === 'iswitch') { // Hub (legacy id kept)
    if (chosenCore && chosenCore !== 'hub') return denyCoreChoice('Switch', 'Hub');
    if (!chosenCore) chosenCore = 'hub';
    ['HUBH1','HUBH2'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('iswitch');
    disablePalette('switch'); // enforce one core-device family
    maybeCreateEndpoints();
  }
  if (id === 'switch') {
    if (chosenCore && chosenCore !== 'switch') return denyCoreChoice('Hub', 'Switch');
    if (!chosenCore) chosenCore = 'switch';
    ['SWH1','SWH2'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('switch');
    disablePalette('iswitch'); // enforce one core-device family
    maybeCreateEndpoints();
  }
}

function disablePalette(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.onclick = null;
  el.style.opacity = 0.5;
}

function denyEndChoice(existing, trying) {
  Swal.fire({
    backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
    title: "End-device type already chosen",
    text: `You already placed ${existing}. Reset to choose ${trying}.`,
    icon: "warning"
  });
}
function denyCoreChoice(existing, trying) {
  Swal.fire({
    backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
    title: "Central-device type already chosen",
    text: `You already placed ${existing}. Reset to choose ${trying}.`,
    icon: "warning"
  });
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
  if (endpointsCreated) return;
  if (!(chosenEnd && chosenCore)) return;

  // ---------- End-device ports ----------
  if (chosenEnd === 'pc') {
    endpointPx('PCH1', 50, 82, 'black', 6); // bottom-center
    endpointPx('PCH2', 8,  50, 'black', 6); // middle-left
    endpointPx('PCH3', 92, 50, 'black', 6); // middle-right
    endpointPx('PCH4', 92, 50, 'black', 6); // middle-right
    endpointPx('PCH5', 8,  50, 'black', 6); // middle-left
  } else { // laptop
    endpointPx('LAPH1', 50, 104, 'black', 6);
    endpointPx('LAPH2', 8,  50, 'black', 6);
    endpointPx('LAPH3', 92, 50, 'black', 6);
    endpointPx('LAPH4', 92, 50, 'black', 6);
    endpointPx('LAPH5', 8,  50, 'black', 6);
  }

  // ---------- Core-device ports (4 ports each) ----------
  const addCorePorts = (idPrefix, color) => {
    // left jack, right jack, center jack, vertical link jack
    endpointPx(idPrefix + '1', 26, 54, color, 6);
    endpointPx(idPrefix + '1', 84, 54, color, 6);
    endpointPx(idPrefix + '1', 63, 54, color, 6);
    endpointPx(idPrefix + '1', 45, 54, color, 6);

    endpointPx(idPrefix + '2', 26, 54, color, 6);
    endpointPx(idPrefix + '2', 84, 54, color, 6);
    endpointPx(idPrefix + '2', 45, 54, color, 6); // jack facing the link
  };

  if (chosenCore === 'hub') addCorePorts('HUBH', 'red');
  else addCorePorts('SWH', 'red');

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
  if (!chosenEnd) {
    return Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"End devices missing", text:"Click on PC or Laptop to place the 5 end devices."
    });
  }
  if (!chosenCore) {
    return Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Central devices missing", text:"Click on Hub or Switch to place the two core devices."
    });
  }
  if (edgesMade.size < 6) {
    return Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Incomplete", text:"Make all six connections, then click CHECK.",
      icon:"info"
    });
  }

  // Build the required edge keys based on chosen families
  const E = (i) => (chosenEnd === 'pc' ? `PCH${i}` : `LAPH${i}`);
  const C = (i) => (chosenCore === 'hub' ? `HUBH${i}` : `SWH${i}`);

  const need = new Set([
    [C(1), E(1)].sort().join('|'),
    [C(1), E(2)].sort().join('|'),
    [C(1), E(3)].sort().join('|'),
    [C(1), C(2)].sort().join('|'),
    [C(2), E(4)].sort().join('|'),
    [C(2), E(5)].sort().join('|'),
  ]);

  let ok = true;
  need.forEach(k => { if (!edgesMade.has(k)) ok = false; });

  if (ok) {
    Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Connection Established!",
      text:`Hybrid built correctly with ${chosenEnd.toUpperCase()}s and ${chosenCore.toUpperCase()}s.`,
      icon:"success"
    });
  } else {
    Swal.fire({
      backdrop:false, target:'#mid', customClass:{container:'position-absolute'},
      title:"Oops...",
      text:"Connections don’t match the target diagram. Reset or fix the wires.",
      icon:"error"
    });
  }
}
