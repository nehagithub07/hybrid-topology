
let instance;
let chosenEnd = null;    
let chosenCore = null;   
let endpointsCreated = false;
const edgesMade = new Set();

function initialise() {
  Swal.fire({
    backdrop: false,
    target: '#mid',
    customClass: { container: 'position-absolute' },
    title: "Hybrid Topology",
    html: "<p>It is a combination of two or more different topologies. Here, we create a hybrid topology combining star and bus topologies.</p>",
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
 
  if (id === 'com') {
    if (chosenEnd && chosenEnd !== 'pc') return denyEndChoice('Laptop', 'PC');
    if (!chosenEnd) chosenEnd = 'pc';
    ['PCH1','PCH2','PCH3','PCH4','PCH5'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('com');
    disablePalette('laptop');  
    maybeCreateEndpoints();
  }
  if (id === 'laptop') {
    if (chosenEnd && chosenEnd !== 'laptop') return denyEndChoice('PC', 'Laptop');
    if (!chosenEnd) chosenEnd = 'laptop';
    ['LAPH1','LAPH2','LAPH3','LAPH4','LAPH5'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('laptop');
    disablePalette('com');  
    maybeCreateEndpoints();
  }
 
  if (id === 'iswitch') {  
    if (chosenCore && chosenCore !== 'hub') return denyCoreChoice('Switch', 'Hub');
    if (!chosenCore) chosenCore = 'hub';
    ['HUBH1','HUBH2'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('iswitch');
    disablePalette('switch'); 
    maybeCreateEndpoints();
  }
  if (id === 'switch') {
    if (chosenCore && chosenCore !== 'switch') return denyCoreChoice('Hub', 'Switch');
    if (!chosenCore) chosenCore = 'switch';
    ['SWH1','SWH2'].forEach(s => {
      document.getElementById(s).style.visibility = 'visible';
    });
    disablePalette('switch');
    disablePalette('iswitch'); 
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
    anchor: [[0, 0, 0, 1, x, y]],   
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
  if (chosenEnd === 'pc') {
    endpointPx('PCH1', 50, 82, 'black', 6);  
    endpointPx('PCH2', 8,  50, 'black', 6);  
    endpointPx('PCH3', 92, 50, 'black', 6);  
    endpointPx('PCH4', 92, 50, 'black', 6);  
    endpointPx('PCH5', 8,  50, 'black', 6); 
  } else { // laptop
    endpointPx('LAPH1', 50, 104, 'black', 6);
    endpointPx('LAPH2', 8,  50, 'black', 6);
    endpointPx('LAPH3', 92, 50, 'black', 6);
    endpointPx('LAPH4', 92, 50, 'black', 6);
    endpointPx('LAPH5', 8,  50, 'black', 6);
  }

  
  const addCorePorts = (idPrefix, color) => {
 
    endpointPx(idPrefix + '1', 26, 54, color, 6);
    endpointPx(idPrefix + '1', 84, 54, color, 6);
    endpointPx(idPrefix + '1', 63, 54, color, 6);
    endpointPx(idPrefix + '1', 45, 54, color, 6);

    endpointPx(idPrefix + '2', 26, 54, color, 6);
    endpointPx(idPrefix + '2', 84, 54, color, 6);
    endpointPx(idPrefix + '2', 45, 54, color, 6);  
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
