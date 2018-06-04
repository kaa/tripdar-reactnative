import Polyline from '@mapbox/polyline';
import { point, lineString, distance, nearestPointOnLine } from '@turf/turf';
import pointOnFeature from '@turf/point-on-feature';

const directionsApiBase = "https://maps.googleapis.com/maps/api/directions/json";
const directionsApiKey = "AIzaSyD24WqxOkdvLZ6T-22WiCr4LVB6kTKvRQw";

async function routeBetween(start, destination) {
  var response = await fetch(directionsApiBase+"?language=fi&origin="+encodeURIComponent(start)+"&destination="+encodeURIComponent(destination)+"&alternatives=true"+"&key="+directionsApiKey);
  var body = await response.json();
  return body.routes.map(r => ({
    start: start.substring(0,start.indexOf(',')), 
    destination: destination.substring(0,destination.indexOf(',')), 
    path: Polyline
      .decode(r.overview_polyline.points)
      .map(t => t.reverse()), /* swap google maps lng-lat for turfs lat-lng */ 
    description: r.summary,
    duration: r.legs.reduce((acc,curr) => acc+curr.distance.value, 0), 
    distance: r.legs.reduce((acc,curr) => acc+curr.duration.value, 0)
  }));
}

async function describeRoute(route) {
  const stations = await fetchStations();
  const line = lineString(route.path);
  return stations
    // find stations closest point on route
    .map(station => ({ station, ...nearestPointOnLine(line, station.location).properties }))
    // at most 500m from route
    .filter(t => t.dist * 1000 < 500)
    // sort by ascending distance from start
    .sort((a,b) => a.location - b.location)
    // project only relevant properties
    .map(t => ({ station: t.station, distance: t.location * 1000 }));
}

const stationsApiBase = "https://tie.digitraffic.fi/api/v1/metadata/camera-stations";
async function fetchStations() {
  var response = await fetch(stationsApiBase);
  var body = await response.json();
  return body.features
    .filter(t => 
      // only currently reporting stations
      (t.properties.state === null || t.properties.state === "OK") && 
      // only stations with location
      t.geometry)
    .map(t => ({
      location:  t.geometry,
      name: t.properties.names.en || t.properties.names.fi || t.properties.name,
      roadStationId: t.properties.roadStationId,
      weatherStationId: t.properties.nearestWeatherStationId,
      cameras: t.properties.presets.map(c => c.imageUrl)
    }))
}

const weatherStationsApiBase = "https://tie.digitraffic.fi/api/v1/data/weather-data";
async function fetchWeatherReports() {
  var response = await fetch(weatherStationsApiBase);
  var body = await response.json();
  return body.weatherStations
    .filter(t => t.sensorValues)
    .map(parseWeatherStationToReport);
}

async function fetchWeatherReport(stationId) {
  const response = await fetch(weatherStationsApiBase+"/"+stationId);
  if(response.status!=200) return null;
  const body = await response.json();
  const stations = body.weatherStations
    .filter(t => t.sensorValues)
    .map(parseWeatherStationToReport);
  return stations[0];
}

function parseWeatherStationToReport(stationJson) {
  let report = { weatherStationId: stationJson.id };
  stationJson.sensorValues.reduce((acc, t) => {
    if(t.name==="ILMA")
      acc.air = t.sensorValue;
    else if(t.name==="TIE_1" || t.name==="TIE_2")
      acc.road = t.sensorValue;
    return acc;
  }, report);
  return report;
}

export { routeBetween, describeRoute, fetchWeatherReports }