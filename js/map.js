var map = L.map('map').setView([9.432311, -0.865817], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var overlays = {};
var searchLayer = L.featureGroup();
var control = L.control.layers(null, overlays, {collapsed: false});

var dataLayers = {
  'Administration': 'Administration.geojson',
  'Business Points': 'Business Points.geojson',
  'Departments': 'Departments.geojson',
  'Facilities': 'Facilities.geojson',
  'Halls': 'Halls.geojson',
  'Hostels': 'Hostels.geojson',
  'Houses': 'Houses.geojson',
  'Main Road': 'Main Road.geojson',
  'Parks and Courts': 'Parks and Courts.geojson',
  'Paths': 'Paths.geojson',
  'SHS Dormitories': 'SHS Dormitories.geojson',
  'Teachers Quarters': 'Teachers Quarters.geojson',
  'Trees': 'Trees.geojson',
  'Workshops': 'Workshops.geojson',
  'Boundary': 'Boundary.geojson',
  'parks': 'parks.geojson'
};

Object.keys(dataLayers).forEach(function(key) {
  fetch('data/' + dataLayers[key])
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var layer = L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
          var p = feature.properties || {};
          var html = '';
          if (p.name) html += '<b>' + p.name + '</b>';
          if (p.type) html += '<br>' + p.type;
          if (p.description) html += '<br>' + p.description;
          if (p.photo) html += '<br><img src="img/' + p.photo + '" alt="' + p.name + '" style="width:100px;">';
          layer.bindPopup(html);
        },
        style: function(feature) {
          if (feature.geometry.type === 'LineString') {
            return {color: 'red', weight: 3};
          }
          if (feature.geometry.type === 'Polygon') {
            return {color: 'green', weight: 2, fillOpacity: 0.1};
          }
          return {color: 'blue'};
        }
      });
      layer.addTo(map);
      overlays[key] = layer;
      searchLayer.addLayer(layer);
      control.addOverlay(layer, key);
    });
});

control.addTo(map);
var lc = control.getContainer();
document.getElementById('layer-control').appendChild(lc);

var searchControl = new L.Control.Search({
  layer: searchLayer,
  propertyName: 'name',
  marker: false,
  moveToLocation: function(latlng, title, map) {
    map.setView(latlng, 18);
  }
});
searchControl.addTo(map);

L.control.locate({flyTo: true}).addTo(map);