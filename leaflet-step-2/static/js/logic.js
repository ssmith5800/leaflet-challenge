//the various tile layers

var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});

var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});

// map object with options
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
  layers: [graymap, satellitemap, outdoors]
});

graymap.addTo(map);

// earquake and plate tectonic layers
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var baseMaps = {
  Satellite: satellitemap,
  Grayscale: graymap,
  Outdoors: outdoors
};

// overlays: earthquakes and plate tectonics
var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Adding a control to the map
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

// AJAX call retrieves  earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // style data for each of the earthquakes 
  function styleInformation(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Color marker function
  function getColor(depth) {
    switch (true) {
    case depth > 90:
      return "#ea2c2c";
    case depth > 70:
      return "#ea822c";
    case depth > 50:
      return "#ee9c00";
    case depth > 30:
      return "#eecc00";
    case depth > 10:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
  }

  // radius marker function
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // GeoJSON layer
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInformation,
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
      );
    }
    // adding earthquake layer
  }).addTo(earthquakes);
  earthquakes.addTo(map);

  // legend control object.
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [-10, 10, 30, 50, 70, 90];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"];

    // creating labels
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // legend.
  legend.addTo(map);

  // AJAX call to get Tectonic Plate geoJSON data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);
      tectonicplates.addTo(map);
    });
});
