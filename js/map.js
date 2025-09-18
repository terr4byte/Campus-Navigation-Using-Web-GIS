// Enhanced TTU Campus Web GIS
const CAMPUS_CENTER = [9.432311, -0.865817];
const map = L.map('map', { zoomControl: true }).setView(CAMPUS_CENTER, 16);

// Basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 20,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.control.scale().addTo(map);

// ============ Layer styling (polished colors & icons) ============
const styleMap = {
  "Boundary":        { color: "#E53935", weight: 3, fillOpacity: 0.0, dashArray: "6,4" },
  "Main Road":       { color: "#1f2937", weight: 3 },
  "Road":            { color: "#6b7280", weight: 2 },
  "Paths":           { color: "#10b981", weight: 3 },
  "Parks":           { color: "#22c55e", weight: 2, fillOpacity: 0.2 },
  "Parks and Courts":{ color: "#22c55e", weight: 2, fillOpacity: 0.2 },
  "Buildings":       { color: "#1d4ed8", weight: 1, fillOpacity: 0.25 },
  "Departments":     { color: "#6d28d9", weight: 1, fillOpacity: 0.25 },
  "Hostels":         { color: "#b45309", weight: 1, fillOpacity: 0.25 },
  "Halls":           { color: "#7c3aed", weight: 1, fillOpacity: 0.25 },
  "Houses":          { color: "#0ea5e9", weight: 1, fillOpacity: 0.20 },
  "Facilities":      { color: "#ef4444", weight: 1, fillOpacity: 0.20 },
  "Workshops":       { color: "#0d9488", weight: 1, fillOpacity: 0.20 },
  "Trees":           { color: "#16a34a", weight: 1, fillOpacity: 0.15 },
  "Default":         { color: "#0ea5e9", weight: 1, fillOpacity: 0.15 }
};
function styleFor(displayName) {
  if (/Boundary/i.test(displayName)) return styleMap["Boundary"];
  if (/Main Road/i.test(displayName)) return styleMap["Main Road"];
  if (/Road/i.test(displayName)) return styleMap["Road"];
  if (/Path/i.test(displayName)) return styleMap["Paths"];
  if (/Park/i.test(displayName)) return styleMap["Parks"];
  if (/Department/i.test(displayName)) return styleMap["Departments"];
  if (/Hostel/i.test(displayName)) return styleMap["Hostels"];
  if (/Hall/i.test(displayName)) return styleMap["Halls"];
  if (/House/i.test(displayName)) return styleMap["Houses"];
  if (/Facilities?/i.test(displayName)) return styleMap["Facilities"];
  if (/Workshop/i.test(displayName)) return styleMap["Workshops"];
  if (/Tree/i.test(displayName)) return styleMap["Trees"];
  return styleMap["Buildings"];
}

// Emoji icon mapping similar to your screenshots
function iconFor(name) {
  if (/Administration/i.test(name)) return "🏛️";
  if (/Business/i.test(name))      return "🏪";
  if (/Departments?/i.test(name))  return "🏫";
  if (/Facilities?/i.test(name))   return "🏢";
  if (/Halls?/i.test(name))        return "🏛️";
  if (/Hostels?/i.test(name))      return "🏘️";
  if (/Houses?/i.test(name))       return "🏠";
  if (/Main Road/i.test(name))     return "🛣️";
  if (/Road/i.test(name))          return "🛣️";
  if (/Parks?/i.test(name))        return "🏟️";
  if (/Courts?/i.test(name))       return "🏟️";
  if (/Paths?/i.test(name))        return "🚶";
  if (/Dormitories?/i.test(name))  return "🏫";
  if (/Teachers Quarters?/i.test(name)) return "🏘️";
  if (/Trees?/i.test(name))        return "🌲";
  if (/Workshops?/i.test(name))    return "🔧";
  if (/Boundary/i.test(name))      return "📍";
  return "📌";
}

// ============ Popup formatter ============
function featurePopupHTML(f, displayName) {
  const p = (f.properties || {});
  const name = p.name || p.Name || p.NAME || displayName || "Feature";
  const typ = p.type || p.Type || p.TYPE || "";
  const desc = p.description || p.Description || p.DESCRIPTION || "";
  const contact = p.contact || p.Contact || "";
  const photo = p.photo || p.Photo || p.img || null;
  let html = `<div><b>${name}</b>`;
  if (typ) html += `<div><small>${typ}</small></div>`;
  if (desc) html += `<div class="mt-1">${desc}</div>`;
  if (contact) html += `<div class="mt-1"><small>Contact: ${contact}</small></div>`;
  if (photo) html += `<img src="${photo}" alt="${name}">`;
  html += `</div>`;
  return html;
}

// ============ Load layers & sidebar toggles ============
const overlays = {};
const searchLayers = [];
let boundaryLayer = null;
let pathsLayer = null;

const layerListDiv = document.getElementById('layer-list');
const presentLayers = (window.LAYERS_CONFIG || []).filter(x => x.present);

function addLayerToggle(displayName, groupLayer) {
  const item = document.createElement('label');
  item.className = 'list-group-item d-flex align-items-center justify-content-between layer-item';
  const left = document.createElement('div');
  left.className = 'd-flex align-items-center gap-2';

  // Creating the checkboxes and their event listeners as "cb"
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = true;
  cb.className = 'form-check-input me-2';
  cb.addEventListener('change', (e) => {
    if (e.target.checked) { map.addLayer(groupLayer); }
    else { map.removeLayer(groupLayer); }
  });

  const icon = document.createElement('span');
  icon.className = 'layer-emoji';
  icon.textContent = iconFor(displayName);

  const label = document.createElement('span');
  label.textContent = displayName;

  left.appendChild(cb);
  left.appendChild(icon);
  left.appendChild(label);

  const dot = document.createElement('span');
  dot.className = 'layer-dot';
  const s = styleFor(displayName) || {};
  dot.style.backgroundColor = s.color || '#0ea5e9';

  item.appendChild(left);
  item.appendChild(dot);

  layerListDiv.appendChild(item);
}

// function loadOneLayer(cfg) {
//   return fetch(encodeURI(cfg.file))
//     .then(r => r.json())
//     .then(geo => {
//       const style = styleFor(cfg.display);
//       const gj = L.geoJSON(geo, {
//         style,
//         onEachFeature: (f, layer) => { layer.bindPopup(featurePopupHTML(f, cfg.display)); },
//         pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 6, color: style.color || '#0ea5e9', weight: 1, fillOpacity: 0.85 })
//       });

//       if (/Boundary/i.test(cfg.display)) boundaryLayer = gj;
//       if (/Path/i.test(cfg.display)) pathsLayer = gj;

//       gj.addTo(map);
//       overlays[cfg.display] = gj;
//       addLayerToggle(cfg.display, gj);
//       searchLayers.push(gj);
//     })
//     .catch(err => {
//       console.error("Failed to load", cfg.file, err);
//       const warn = document.createElement('div');
//       warn.className = 'list-group-item text-danger';
//       warn.textContent = `Missing or invalid: ${cfg.display}`;
//       layerListDiv.appendChild(warn);
//     });
// }

function loadOneLayer(cfg) {
  return fetch(encodeURI(cfg.file))
    .then(r => r.json())
    .then(geo => {
      const style = styleFor(cfg.display);
      const gj = L.geoJSON(geo, {
        style,
        onEachFeature: (f, layer) => { layer.bindPopup(featurePopupHTML(f, cfg.display)); },
        pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 6, color: style.color || '#0ea5e9', weight: 1, fillOpacity: 0.85 })
      });

      if (/Boundary/i.test(cfg.display)) boundaryLayer = gj;
      if (/Path/i.test(cfg.display)) pathsLayer = gj;

      // Only add to map if not "Trees"
      const checked = cfg.display !== "Trees";
      if (checked) gj.addTo(map);

      overlays[cfg.display] = gj;
      addLayerToggle(cfg.display, gj, checked); // Pass checked state
      searchLayers.push(gj);
    })
    // ...existing code...
}

// Promise.all(presentLayers.map(loadOneLayer)).then(() => {
//   if (boundaryLayer) {
//     try { map.fitBounds(boundaryLayer.getBounds(), { padding: [20,20] }); }
//     catch(e){ map.setView(CAMPUS_CENTER, 16); }
//   } else {
//     map.setView(CAMPUS_CENTER, 16);
//   }
  Promise.all(presentLayers.map(loadOneLayer)).then(() => {
  if (boundaryLayer) {
    try { 
      map.fitBounds(boundaryLayer.getBounds(), { padding: [20,20] }); 
      boundaryLayer.bringToBack(); // <-- Add this line
    }
    catch(e){ map.setView(CAMPUS_CENTER, 16); }
  } else {
    map.setView(CAMPUS_CENTER, 16);
  }
  // Leaflet Search
  const searchControl = new L.Control.Search({
    layer: L.layerGroup(searchLayers),
    propertyName: 'name',
    initial: false,
    zoom: 19,
    marker: false,
    textPlaceholder: 'Search by name…'
  });
  map.addControl(searchControl);

  // Fill datalist with known place names for directions
  populatePlacesList();
});

// ============ Text search fallback ============
document.getElementById('btn-text-search').addEventListener('click', () => {
  const q = (document.getElementById('text-search').value || '').trim().toLowerCase();
  if (!q) return;
  let found = null;
  for (const key in overlays) {
    overlays[key].eachLayer(layer => {
      const p = layer.feature && layer.feature.properties || {};
      const name = (p.name || p.Name || '').toLowerCase();
      const typ = (p.type || p.Type || '').toLowerCase();
      if ((name && name.includes(q)) || (typ && typ.includes(q))) {
        if (!found) found = layer.getBounds ? layer.getBounds() : L.latLngBounds([layer.getLatLng()]);
      }
    });
    if (found) break;
  }
  if (found) map.fitBounds(found.pad(0.2));
});

// ============ Quick actions ============
document.getElementById('btn-locate').addEventListener('click', () => {
  map.locate({ setView: true, maxZoom: 18, enableHighAccuracy: true });
});
map.on('locationfound', (e) => {
  L.marker(e.latlng).addTo(map).bindPopup('You are here').openPopup();
});
map.on('locationerror', () => alert('Location unavailable. Please enable GPS/Location in your browser.'));

document.getElementById('btn-zoom-campus').addEventListener('click', () => {
  if (boundaryLayer) map.fitBounds(boundaryLayer.getBounds(), { padding: [20,20] });
  else map.setView(CAMPUS_CENTER, 16);
});

document.getElementById('btn-print').addEventListener('click', () => window.print());

// ============ Directions (Dijkstra over Paths endpoints) ============
let routeLayer = null;
let pickState = null; // 'from' | 'to'
const fromInput = document.getElementById('dir-from');
const toInput   = document.getElementById('dir-to');
document.getElementById('pick-from').addEventListener('click', () => { pickState = 'from'; });
document.getElementById('pick-to').addEventListener('click', () => { pickState = 'to'; });
map.on('click', (e) => {
  if (!pickState) return;
  const latlng = e.latlng;
  const txt = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
  if (pickState === 'from') fromInput.value = txt;
  else toInput.value = txt;
  pickState = null;
});

document.getElementById('btn-clear-route').addEventListener('click', () => {
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
});

document.getElementById('btn-route').addEventListener('click', async () => {
  if (!pathsLayer) return alert('Paths layer not loaded. Ensure Paths.geojson is present.');
  const start = await resolvePlace(fromInput.value);
  const end   = await resolvePlace(toInput.value);
  if (!start || !end) return alert('Could not resolve start or end. Try selecting from map or typing a known name.');

  const graph = buildGraphFromPaths(pathsLayer);
  const startNode = snapToNearestNode(graph, start);
  const endNode   = snapToNearestNode(graph, end);
  const path = dijkstra(graph, startNode.key, endNode.key);
  if (!path || path.length < 2) return alert('No route found on the Paths network.');

  // Build a polyline from the path coordinates
  const latlngs = path.map(k => graph.nodes[k]);
  if (routeLayer) map.removeLayer(routeLayer);
  routeLayer = L.polyline(latlngs, { className: 'route-line', weight: 6, opacity: 0.9 }).addTo(map);
  map.fitBounds(routeLayer.getBounds().pad(0.2));
});

// Resolve a place name or "lat,lng" to a LatLng
async function resolvePlace(text) {
  text = (text || '').trim();
  if (!text) return null;
  // lat,lng?
  const m = text.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
  if (m) return L.latLng(parseFloat(m[1]), parseFloat(m[2]));

  // Otherwise, search feature names across overlays
  let best = null;
  for (const key in overlays) {
    overlays[key].eachLayer(layer => {
      const f = layer.feature;
      if (!f) return;
      const name = (f.properties && (f.properties.name || f.properties.Name)) || '';
      if (name && name.toLowerCase() === text.toLowerCase()) {
        let ll = null;
        if (layer.getLatLng) ll = layer.getLatLng();
        else if (layer.getBounds) ll = layer.getBounds().getCenter();
        if (ll && !best) best = ll;
      }
    });
    if (best) break;
  }
  return best;
}

// Build graph: nodes = endpoints of Path lines; edges = segment length
function buildGraphFromPaths(pathsGJ) {
  const nodes = {}; // key: "lat,lng" -> L.LatLng
  const edges = {}; // key -> [{to, w}]
  function keyOf(ll) { return ll.lat.toFixed(6)+','+ll.lng.toFixed(6); }
  function addNode(ll) {
    const k = keyOf(ll);
    if (!nodes[k]) nodes[k] = ll;
    if (!edges[k]) edges[k] = [];
    return k;
  }
  function addEdge(k1, k2) {
    if (k1 === k2) return;
    const p1 = nodes[k1], p2 = nodes[k2];
    const w = map.distance(p1, p2); // meters
    edges[k1].push({to: k2, w});
    edges[k2].push({to: k1, w});
  }

  pathsGJ.eachLayer(layer => {
    const f = layer.feature;
    if (!f) return;
    const geom = f.geometry;
    if (!geom) return;
    if (geom.type === 'LineString') {
      const coords = geom.coordinates;
      for (let i=0; i<coords.length-1; i++) {
        const a = L.latLng(coords[i][1], coords[i][0]);
        const b = L.latLng(coords[i+1][1], coords[i+1][0]);
        const ka = addNode(a), kb = addNode(b);
        addEdge(ka, kb);
      }
    } else if (geom.type === 'MultiLineString') {
      geom.coordinates.forEach(line => {
        for (let i=0; i<line.length-1; i++) {
          const a = L.latLng(line[i][1], line[i][0]);
          const b = L.latLng(line[i+1][1], line[i+1][0]);
          const ka = addNode(a), kb = addNode(b);
          addEdge(ka, kb);
        }
      });
    }
  });

  return { nodes, edges };
}

// Snap a LatLng to nearest node in graph
function snapToNearestNode(graph, ll) {
  let best = null, bestK = null, bestD = Infinity;
  for (const k in graph.nodes) {
    const d = map.distance(ll, graph.nodes[k]);
    if (d < bestD) { bestD = d; best = graph.nodes[k]; bestK = k; }
  }
  return { key: bestK, ll: best };
}

// Dijkstra's algorithm
function dijkstra(graph, sourceKey, targetKey) {
  const dist = {}, prev = {}, visited = {};
  Object.keys(graph.nodes).forEach(k => { dist[k] = Infinity; prev[k] = null; });
  dist[sourceKey] = 0;

  function extractMin() {
    let minK = null, minD = Infinity;
    for (const k in dist) {
      if (!visited[k] && dist[k] < minD) { minD = dist[k]; minK = k; }
    }
    return minK;
  }

  while (true) {
    const u = extractMin();
    if (u === null) break;
    if (u === targetKey) break;
    visited[u] = true;
    const nbrs = graph.edges[u] || [];
    for (const {to, w} of nbrs) {
      const alt = dist[u] + w;
      if (alt < dist[to]) { dist[to] = alt; prev[to] = u; }
    }
  }

  // Reconstruct
  const path = [];
  let u = targetKey;
  if (prev[u] !== null || u === sourceKey) {
    while (u) { path.unshift(u); u = prev[u]; }
  }
  return path;
}

// Populate datalist with names
function populatePlacesList() {
  const names = new Set();
  for (const key in overlays) {
    overlays[key].eachLayer(layer => {
      const f = layer.feature;
      if (!f) return;
      const name = (f.properties && (f.properties.name || f.properties.Name)) || null;
      if (name) names.add(String(name));
    });
  }
  const dl = document.getElementById('places-list');
  dl.innerHTML = '';
  Array.from(names).sort().forEach(n => {
    const opt = document.createElement('option');
    opt.value = n;
    dl.appendChild(opt);
  });
}
