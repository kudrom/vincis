var map,
	congress = new Congress(),
	pies = [new RGraph.Pie("developmentNationPie", []),
	        ],
	// cache for the electoral results
	cache_results = new Object(),

	//Maximum latitude and longitude of the map, it's part of the API used in graphics and events
	max_lat = 4.5810, min_lat = -9.2971, total_lat = max_lat - min_lat,
	max_lon = 43.7911, min_lon = 35.1387, total_lon = max_lon - min_lon,
	max_min_coords = {
		min_lat: min_lat,
		min_lon: min_lon,
		total_lat: total_lat,
		total_lon: total_lon,
		WIDTH: 400,
		HEIGHT: (total_lon / total_lat) * 400 * 1.2
	};

// Create the gradients for the pie graphic
function create_gradients(obj, colors){
	var gradients = [],
	canvas = obj.canvas,
	X = canvas.width / 2,
	Y = canvas.height / 2;
	
	for(var i = 0; i < colors.length; i++){
		gradients.push(RGraph.RadialGradient(obj, X, Y, 95, 
												  X, Y, 125, 
												  colors[i], 'rgba(0,0,0,0.05)'));
	}
	
	return gradients;
}

// From the getShape function in the pie module
function highlight_sector(pie, i, canvas, show_tooltip){
	var ret = new Object(),
		angles = pie.angles,
		TWOPI = Math.PI*2;
	ret[0] = angles[i][2];
	ret[1] = angles[i][3];
	ret[2] = pie.radius;
	ret[3] = angles[i][0] - TWOPI;
	ret[4] = angles[i][1];
	ret[5] = i;
	if (ret[3] < 0) ret[3] += TWOPI;
	if (ret[4] > TWOPI) ret[4] -= TWOPI;
	
	var tooltip = RGraph.parseTooltipText(pie.Get('chart.tooltips'), ret[5]);
	
	ret['object']      = pie;
	ret['x']           = ret[0];
	ret['y']           = ret[1];
	ret['radius']      = ret[2];
	ret['angle.start'] = ret[3];
	ret['angle.end']   = ret[4];
	ret['index']       = ret[5];
	ret['tooltip']     = tooltip;
	
	RGraph.Clear(canvas);
	pie.Draw();
	pie.highlight_segment(ret);
	if(show_tooltip){
		RGraph.Tooltip(pie, tooltip, 0, 0, i);
	}
}

// Get the electoral results whit an AJAX request and store it in the cache.
// I've to test it against the cache to make it asynchronous
function get_results(year, draw_func){
	var http_data = new XMLHttpRequest();
	if(!(year in cache_results)){
		http_data.onreadystatechange = function(){
			var data;
			if(http_data.readyState === 4 && http_data.status === 200){
				data = JSON.parse(http_data.responseText);
				cache_results[year] = data;
				draw_func(year);
			}
		}
		http_data.open("GET", "/static/loreg/resultados/" + year + '.json', true);
		http_data.send();
	}else{
		draw_func(year);
	}
}


/***********************************  SETUP  **********************************/
//Load geo data and construct the map
(function (){
	var http_provinces = new XMLHttpRequest();
	
	http_provinces.onreadystatechange = function(){
		if(http_provinces.readyState === 4 && http_provinces.status === 200){
			map = new Map(JSON.parse(http_provinces.responseText), max_min_coords);
		}
	}
	http_provinces.open("GET", "/static/loreg/provincias/provincias.json", true);
	http_provinces.send();
})();

//Setup the pies
(function (){
	for(var i = 0; i < pies.length; i++){
		pies[i].Set('shadow', true)
		       .Set('shadow.offsetx', 5)
		       .Set('shadow.offsety', 5)
		       .Set('shadow.blur', 15)
		       .Set('shadow.color', '#bbb')
		       .Set('strokestyle', 'rgba(0,0,0,0.1)');
	}
})();

// Setup the first part of the development section
(function (){
	var canvas_map = document.querySelector("#developmentNation .map"),
		canvas_congress = document.querySelector("#developmentNation .congress"),
		pie = pies[0],
		select_year = document.querySelector("#developmentNation .year");
	
	// Function to execute when the results for the selected year are retrieved
	function draw_it(year){
		var canvasMap = document.querySelector("#developmentNation .map"),
			canvasCongress = document.querySelector("#developmentNation .congress"),
			canvasPie = document.querySelector("#developmentNationPie"),
			census = document.querySelector("#developmentNation .census"),
			average = document.querySelector("#developmentNation .average"),
			colors = [],
			names = [],
			results = cache_results[year],
			keys = Object.keys(results),
			aux = [];
		
		census.textContent = pretty_number(results.census);
		average.textContent = pretty_number(Math.round(results.valid / 350));
		
		congress.draw(canvasCongress, results);
		RGraph.Clear(canvasPie);
		pies[0].data = [];
		for(var i = 0; i < keys.length; i++){
			key = keys[i];
			if(keys.length - i > 2){
				colors.push(results[key].color);
				names.push(key);
				pies[0].data.push(results[key].v);
			}
		}
		pies[0].Set('chart.colors', create_gradients(pies[0], colors))
			   .Set('tooltips', names)
			   .Draw();
		
		for(var i = 0; i < 52; i++){
			aux.push("#aaa");
		}
		map.draw(canvasMap, aux);
	}
	
	// draw the map
	function draw_provinces(party){
		var colors = [],
			color = tinycolor(party.color).toHsv(),
			votes = party.pv,
			minimum = min(votes),
			maximum = max(votes),
			range = maximum - minimum,
			aux;

		for(var i = 0; i < votes.length; i++){
			proportion = (votes[i] - minimum) / range;
			if(votes[i] === 0){
				aux = "white";
			// Abstention and null votes
			}else if(party.color === "#D5D5D5"){
				aux = {h: 0, s: 0, v: 1 - (0.1 + 0.9*proportion)};
			}else if(party.color === "white"){
				aux = {h: 0, s: 0, v: 0.1 + 0.9*proportion};
			}else{
				aux = {h: color.h, s: 0.1 + 0.9*proportion, v: color.v}
			}
			colors.push(tinycolor(aux).toHexString());
		}
		
		map.draw(canvas_map, colors);
	}
	
	// fill the explanatory text
	function fill_text(year, name_party){
		var party = document.querySelector("#developmentNation .party"),
			votes = document.querySelector("#developmentNation .votes"),
			seats = document.querySelector("#developmentNation .seats"),
			votesxseat = document.querySelector("#developmentNation .votesxseats"),
			census = cache_results[year].census,
			valid = cache_results[year].valid,
			v = Math.floor(cache_results[year][name_party].v * census),
			percent = Math.round(cache_results[year][name_party].v * 10000)/100
			v2 = v,
			n = cache_results[year][name_party].n;
		
		party.textContent = name_party;
		votes.textContent = pretty_number(v) + " = " + String(percent).replace(".", ",") + "%";
		if(n !== undefined){
			seats.textContent = n;
			votesxseat.textContent = pretty_number(Math.round(v / n));
		}else{
			seats.textContent = "--";
			votesxseat.textContent = "--";
		}
		if(v / n > valid / 350){
			votesxseat.style.color = "red";
		}else{
			votesxseat.style.color = "green";
		}
	}
	
	// Select setup
	select_year.value = 2011;
	select_year.onchange = function(e){
		get_results(e.currentTarget.value, draw_it);
	};
	
	// Canvas setup
	canvas_map.width = max_min_coords.WIDTH;
	canvas_map.height = max_min_coords.HEIGHT;
	canvas_congress.width = 400;
	canvas_congress.height = 250;
	
	// The congress follow the events.js API
	bind(canvas_congress, "mousemove", congress);
	bind(canvas_congress, "mouseup", congress, function(seat){
		var year = select_year.value,
			results = cache_results[year],
			keys = Object.keys(results),
			i,
			canvas = document.querySelector("#developmentNationPie");
		
		for(i = 0; i < keys.length; i++){
			if(keys.length - i > 2 && seat.color === results[keys[i]].color){
				break;
			}
		}
		highlight_sector(pies[0], i, canvas, true);
		fill_text(year, keys[i]);
		draw_provinces(results[keys[i]]);
	});
	
	// handler for onmousedown for the pie with the RGraph API
	pie.Set("chart.events.click", function(e, shape){
		var context = document.querySelector("#developmentNation .congress").getContext("2d"),
			year = select_year.value,
			results = cache_results[year],
			keys = Object.keys(results),
			i = shape.index;
		congress.select_party(results[keys[i]].color, context);
		draw_provinces(results[keys[i]]);
		fill_text(year, keys[i]);
		pies[0].clicked = i;
	});
	// handler for onmousemove for the pie with the RGraph API
	pie.Set("chart.events.mousemove", function(e, shape){
		var canvas = document.querySelector("#developmentNationPie"),
			i = shape.index;
		if(pies[0].clicked !== i){
			// Avoid flickering of the cursor
			canvas.style.cursor = "pointer";
			highlight_sector(pies[0], i, canvas, false);
			canvas.style.cursor = "pointer";
		}
	});
	pie.Set("radius", 100);
	
	// Initialize the canvas with the latest elections
	get_results(2011, draw_it);
})();

// Setup for the second part of the development section
(function (){
//	congress.select_number_seats([{color: "blue", n: 9},
//    {color :"red", n: 18},
//    {color: ORANGE, n: 2}],canvasCongress.getContext("2d"));

})();