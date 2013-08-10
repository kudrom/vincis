var canvasMap = document.querySelector("canvas#map"),
	canvasCongress = document.querySelector("canvas#congress"),
	map, congress,
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
	},
	// Distribution of seats between rings in the congress
	seats_dbtion = [[8,5,8],[9,6,9],[10,7,10],[11,8,11],[12,9,12],
	                [13,10,13],[14,11,14],[15,12,15],[16,13,16],[17,14,17]],
	parties_dbtion = [{seats: 130, color: "blue"}, {seats: 120, color: "green"},
	                  {seats: 20, color: "pink"}, {seats: 30, color: "orange"},
	                  {seats: 50, color: "purple"}];

canvasMap.width = max_min_coords.WIDTH;
canvasMap.height = max_min_coords.HEIGHT;
// Load the data
http_provinces.onreadystatechange = function(){
	if(http_provinces.readyState === 4 && http_provinces.status === 200){
		map = new Map(JSON.parse(http_provinces.responseText), max_min_coords);
		bind(canvasMap, "mousemove", map);
		map.draw(canvasMap);
	}
}
http_provinces.open("GET", "/static/loreg/data/provincias.json", true);
http_provinces.send();

canvasCongress.width = 470;
canvasCongress.height = 350;
congress = new Congress();
congress.draw(canvasCongress, [{color: ORANGE, n: 4}, {color: "grey", n: 16},
                               {color: "brown", n: 10}, {color: "red", n: 100},
                               {color: "blue", n: 220}]);
bind(canvasCongress, "mousemove", congress);
congress.select_number_seats([{color: "blue", n: 9},
                              {color :"red", n: 18},
                              {color: ORANGE, n: 2}],canvasCongress.getContext("2d"));

function CreateGradient (obj, color)
{
    return RGraph.RadialGradient(obj, 200, 150, 95, 200, 150, 125, color, 'black')
}

var pie = new RGraph.Pie('pie', [4,3,2,6,8]);

pie.Set('chart.colors', [
                          CreateGradient(pie, '#ABD874'),
                          CreateGradient(pie, '#E18D87'),
                          CreateGradient(pie, '#599FD9'),
                          CreateGradient(pie, '#F4AD7C'),
                          CreateGradient(pie, '#D5BBE5')
                         ])
    .Set('shadow', true)
    .Set('shadow.offsetx', 5)
    .Set('shadow.offsety', 5)
    .Set('shadow.blur', 15)
    .Set('shadow.color', '#bbb')
    .Set('labels.sticks', true)
    .Set('labels.sticks.length', 15)
    .Set('tooltips', ['Robert','Louise','Peter','Kevin','Jack'])
    .Set('labels', ['Robert','Louise','Peter','Kevin','Jack'])
    .Set('radius', 100)
    .Set('strokestyle', 'rgba(0,0,0,0.1)')
    .Draw();