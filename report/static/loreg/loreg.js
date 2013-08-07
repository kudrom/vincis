var canvasMap = document.querySelector("canvas#map"),
	map,
	http_provinces = new XMLHttpRequest(),
	// Maximum latitude and longitude of the map
	max_lat = 4.5810, min_lat = -9.2971, total_lat = max_lat - min_lat,
	max_lon = 43.7911, min_lon = 35.1387, total_lon = max_lon - min_lon,
	max_min_coords = {
		min_lat: min_lat,
		min_lon: min_lon,
		total_lat: total_lat,
		total_lon: total_lon,
		WIDTH: 400,
		HEIGHT: (total_lon / total_lat) * 400 * 1.2
	}

canvasMap.width = max_min_coords.WIDTH;
canvasMap.height = max_min_coords.HEIGHT;
// Load the data
http_provinces.onreadystatechange = function(){
	if(http_provinces.readyState === 4 && http_provinces.status === 200){
		map = new Map(JSON.parse(http_provinces.responseText), max_min_coords);
		bind(canvasMap, "mousedown", map);
		bind(canvasMap, "mousemove", map);
		map.draw(canvasMap);
	}
}
http_provinces.open("GET", "/static/loreg/data/provincias.json", true);
http_provinces.send();
