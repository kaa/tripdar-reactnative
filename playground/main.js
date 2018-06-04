// @ts-check

import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import * as Turf from '@turf/turf';
import polyline from '@mapbox/polyline';
import roadSegments from './segments.json';

async function init() {
  var map = L.map("mapid").setView([63.5, 26], 6);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiamJlaWphciIsImEiOiJjaWhyZzBlNmIwMDg3dGxtMWlvbHN0NHJoIn0.548hBxyECg4AECqnhL_OBQ'
  }).addTo(map);

  var geojsonLayer = L.geoJSON(null, {
    style: function (feature) {
      switch (feature.properties.class) {
        case "raw": return { color: "#ff0000" };
        case "route": return { color: "#00ff00" };
        default: return { color: "#0000ff", opacity: 0.5, weight: 10 };
      }
    }
  }).bindPopup(function (layer) {
    return layer.feature.properties.selite1+" "+layer.feature.properties.selite2;
  }).addTo(map);

  var req = {
    origin: "Helsinki, Finland", 
    destination: "Äkäslompolo, Finland", 
    travelMode: "DRIVING"
  };
  new google.maps.DirectionsService().route(req, (res,status) => {
    var route = Turf.lineString(res.routes[0].overview_path.map(({lat,lng}) => [lng(),lat()]));

    // add matched segments to map
    roadSegments.features.forEach(t => { 
      t.properties.class = "raw"; 
      geojsonLayer.addData(t);
    });
    
    var segments = roadSegments.features
      // Split multilinestring to linestrings
      .reduce((acc, t) => 
        Turf.getType(t)=="MultiLineString" 
          ? acc.concat(t.geometry.coordinates.map(p => Turf.lineString(p, Object.assign({}, t.properties))))
          : acc.concat(t)
      ,[]) 
      // keep segments with avg. distance of < 2km
      .filter(segment => {
        var cumulativeDistance = segment.geometry.coordinates
          .reduce((acc,point) => acc + Turf.pointToLineDistance(point, route), 0);
        return (cumulativeDistance / segment.geometry.coordinates.length) < 2;
      });

    // add matched segments to map
    segments.forEach(t => { 
      t.properties.class = "match"; 
      geojsonLayer.addData(t);
    });

    let leg, legs = [];
    route.geometry.coordinates.forEach(pt => {
      // segment closest to point
      let { distance, segment } = segments
        .map(s => ({ segment: s, distance: Turf.pointToLineDistance(pt, s) }))
        .reduce((a,b) => a.distance < b.distance ? a : b);
      if(distance > 5) segment = null;
      if(!leg || !segmentsMatch(leg, segment)) {
        leg && leg.geometry.coordinates.push(pt); // "close" last leg
        legs.push(leg = Turf.lineString([[0,0],[0,0]]));
        leg.properties = Object.assign({}, segment ? segment.properties : {}, { class: "route" });
        leg.geometry.coordinates = [];
      }
      leg.geometry.coordinates.push(pt);
    });
    legs.forEach(l => geojsonLayer.addData(l));
  })
}
function segmentsMatch(a,b) {
  return (a && b || !a && !b) && a.properties.tienumer === b.properties.tienumer &&
         b.properties.tiejakso === b.properties.tiejakso;
}

export { init }