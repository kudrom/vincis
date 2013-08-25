var map,
	congress = new Congress(),
	layers = [new LayerCongress(congress), new LayerCongress(congress),
			  new LayerCongress(congress), new LayerCongress(congress)
			 ],
	pies = [new RGraph.Pie("developmentNationPie", []),
	        new RGraph.Pie("developmentProvincesPie", []),
		   ],
	// cache for the electoral results and alternatives
	cache_results = new Object(),
	cache_alternatives = new Object(),

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
	},
	
	content = document.querySelector("#help #content");
	eject = document.querySelector("#help #eject");

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

function show_help(){
	var help = document.querySelector("#help"),
		eject = document.querySelector("#help #eject");
	
	content.style.height = window.innerHeight + "px";
	help.classList.toggle("expanded");
	eject.classList.toggle("expanded");
}

function hide_help(){
	var help = document.querySelector("#help"),
		eject = document.querySelector("#help #eject");
	
	help.classList.toggle("expanded");
	eject.classList.toggle("expanded");
}

/***********************************  SETUP  **********************************/

// Load geo data and construct the map
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
		layerCongress = layers[0],
		select_year = document.querySelector("#developmentNation .year");
	
	// Function to execute when the results for the selected year are retrieved
	function draw_it(year){
		var canvasMap = document.querySelector("#developmentNation .map"),
			canvasCongress = document.querySelector("#developmentNation .congress"),
			canvasPie = document.querySelector("#developmentNationPie"),
			census = document.querySelector("#developmentNation .census"),
			average = document.querySelector("#developmentNation .average"),
			party = document.querySelector("#developmentNation .party"),
			votes = document.querySelector("#developmentNation .votes"),
			seats = document.querySelector("#developmentNation .seats"),
			votesxseat = document.querySelector("#developmentNation .votesxseats"),
			layerCongress = layers[0],
			colors = [],
			names = [],
			results = cache_results[year],
			keys = Object.keys(results),
			aux = [];
		
		census.textContent = pretty_number(results.census["total"]);
		average.textContent = pretty_number(Math.round(results.valid / 350));
		party.textContent = "--";
		votes.textContent = "--";
		seats.textContent = "--";
		votesxseat.textContent = "--";
		
		layerCongress.draw(canvasCongress, results);
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
		map.draw(canvasMap, aux, false);
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
		
		map.draw(canvas_map, colors, false);
	}
	
	// fill the explanatory text
	function fill_text(year, name_party){
		var party = document.querySelector("#developmentNation .party"),
			votes = document.querySelector("#developmentNation .votes"),
			seats = document.querySelector("#developmentNation .seats"),
			votesxseat = document.querySelector("#developmentNation .votesxseats"),
			census = cache_results[year].census["total"],
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
	canvas_congress.height = 200;
	
	// To allow the shared congress, i must redraw it before i select a party 
	// (view the mover function in graphics.js)
	bind(canvas_congress, "mousemove", layerCongress, function(){
		var canvasCongress = document.querySelector("#developmentNation .congress"),
			year = document.querySelector("#developmentNation .year").value,
			results = cache_results[year];
		congress.draw(canvas_congress, results);
	});
	bind(canvas_congress, "mouseup", layerCongress, function(seat){
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
			layerCongress = layers[0],
			i = shape.index;
		layerCongress.draw(canvas_congress, results);
		layerCongress.select_party(results[keys[i]].color, context);
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
	
	// Initialize the canvases with the latest elections
	get_results(2011, draw_it);
})();

// Setup for the second part of the development section
(function (){
	var canvas_map = document.querySelector("#developmentProvinces .map"),
		canvas_congress = document.querySelector("#developmentProvinces .congress"),
		pie = pies[1],
		select_year = document.querySelector("#developmentProvinces .year");
	
	function draw_it(year){
		var results = cache_results[year],
			keys = Object.keys(results),
			party,
			max,
			maxColor,
			seats = [],
			canvas_map = document.querySelector("#developmentProvinces .map"),
			canvas_congress = document.querySelector("#developmentProvinces .congress"),
			census = document.querySelector("#developmentProvinces .census"),
			average = document.querySelector("#developmentProvinces .average"),
			province = document.querySelector("#developmentProvinces .province"),
			censusB = document.querySelector("#developmentProvinces .pcensus"),
			seatsA = document.querySelector("#developmentProvinces .seats"),
			votesxseat = document.querySelector("#developmentProvinces .votesxseats"),
			pie = pies[1],
			layerCongress = layers[1];
		
		census.textContent = pretty_number(results.census["total"]);
		average.textContent = pretty_number(Math.round(results.census["total"] / 350));
		province.textContent = "--";
		censusB.textContent = "--";
		seatsA.textContent = "--";
		votesxseat.textContent = "--";
		
		// Iterate over the provinces of all the political parties
		for(var i = 0; i < 52; i++){
			max = 0;
			for(var ii = 0; ii < keys.length; ii++){
				party = results[keys[ii]];
				if(party.hasOwnProperty("n") && party.pn[i] > max){
					max = party.pn[i];
					maxColor = party.color;
				}
			}
			seats.push(maxColor);
		}
		
		layerCongress.draw(canvas_congress, results);
		RGraph.Clear(pie.canvas);
		pie.data = [1];
		pie.Set('chart.colors', create_gradients(pie, ["#ddd"]))
		   .Set('labels', [])
		   .Draw();
		map.draw(canvas_map, seats, true);
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
	canvas_congress.height = 200;
	
	pie.Set("radius", 100);
	
	// Initialize the canvases with the latests elections
	get_results(2011, function(){
		// The map doesn't exists until it's created by get_results
		bind(canvas_map, "mousemove", map);
		bind(canvas_map, "mousedown", map);
		bind(canvas_map, "mouseup", map, function(id, name){
			var dist = [],
				canvas_congress = document.querySelector("#developmentProvinces .congress"),
				year = document.querySelector("#developmentProvinces .year").value,
				canvasPie = document.querySelector("#developmentProvincesPie"),
				province = document.querySelector("#developmentProvinces .province"),
				census = document.querySelector("#developmentProvinces .pcensus"),
				seats = document.querySelector("#developmentProvinces .seats"),
				votesxseat = document.querySelector("#developmentProvinces .votesxseats"),
				average = document.querySelector("#developmentProvinces .average"),
				results = cache_results[year],
				layerCongress = layers[1],
				aux,
				votes = [],
				labels = [],
				colors = [],
				names = [],
				pcensus = results.census["provinces"][id - 1],
				n = 0,
				keys = Object.keys(results),
				party;
			
			for(var i = 0; i < keys.length; i++){
				party = results[keys[i]];
				if(party.hasOwnProperty("pn") && party.pn[id - 1] > 0){
					aux = new Object();
					aux.color = party.color;
					aux.n = party.pn[id - 1];
					dist.push(aux);
					n += party.pn[id - 1];
				}
				if(party.hasOwnProperty("color") && party.pv[id - 1] > 0){
					colors.push(party.color);
					votes.push(100 * party.pv[id - 1]);
					labels.push(String(Math.floor(10000 * party.pv[id - 1]) / 100) + "%");
					names.push(keys[i]);
				}
			}
			
			layerCongress.draw(canvas_congress, results);
			layerCongress.select_number_seats(dist, canvas_congress.getContext("2d"));
			
			RGraph.Clear(canvasPie);
			pies[1].data = votes;
			pies[1].Set('chart.colors', create_gradients(pie, colors))
				   .Set('tooltips', names)
				   .Set('__names', labels)
				   .Draw();
			pies[1].Set('chart.events.click', function(e, shape){
				var pie = shape.object,
					index = shape.index,
					labels = pie.Get('__names'),
					copy = [];
				for(var i = 0; i < labels.length; i++){
					if(i !== index){
						copy.push(" ");
					}else{
						copy.push(labels[i]);
					}
				}
				// I must redraw everything to avoid the craziness of the selective labels
				RGraph.Clear(pie.canvas);
				pie.Set("labels", copy);
				pie.Draw();
				highlight_sector(pie, index, pie.canvas, true);
			});
			
			province.textContent = name;
			seats.textContent = n;
			census.textContent = pretty_number(pcensus);
			votesxseat.textContent = pretty_number(Math.floor(pcensus / n));
			if(results.census.total / 350 > pcensus / n){
				votesxseat.innerHTML += " <i class='icon-arrow-right'></i> SR";
			}else{
				votesxseat.innerHTML += " <i class='icon-arrow-right'></i> IR";
			}
		});
		draw_it(2011);
	});
})();

// Setup for the alternatives section
(function(){
	var canvas_before = document.querySelector("#alternatives canvas.before"),
		canvas_after = document.querySelector("#alternatives canvas.after"),
		layerBefore = layers[2],
		layerAfter = layers[3],
		select_year = document.querySelector("#alternatives .year"),
		formula = document.querySelector("#alternatives .formula"),
		size = document.querySelector("#alternatives .size"),
		minimum = document.querySelector("#alternatives .min");
	
	// Update the canvases with the year selected
	function draw_it(year){
		var results = cache_results[year],
			canvas_map = document.querySelector("#alternatives .map"),
			canvas_before = document.querySelector("#alternatives canvas.before"),
			canvas_after = document.querySelector("#alternatives canvas.after"),
			census = document.querySelectorAll("#alternatives .census"),
			averages = document.querySelectorAll("#alternatives .average"),
			layerBefore = layers[2],
			layerAfter = layers[3],
			aux = [];
		
		for(var i = 0; i < 2; i++){
			census[i].textContent = pretty_number(results.census.total);
		}
		
		averages[0].textContent = pretty_number(Math.floor(results.census.total / 350));
		averages[1].textContent = pretty_number(Math.floor(results.census.total / layerAfter.objects.length));
		reset_spans();
		
		layerBefore.draw(canvas_before, results);
		layerAfter.draw(canvas_after, results);
		
		get_alternatives();
	}
	
	// reset all the spans of the .text div excluding the census and averages
	function reset_spans(){
		var spans = document.querySelectorAll("#alternatives h4 span"),
			name;
		
		for(var i = 0; i < spans.length; i++){
			name = spans[i].className;
			if(name !== "census" && name !== "average"){
				spans[i].textContent = "--";
				spans[i].style.color = "#444";
			}
		}
	}
	
	// Fill the spans with the proper text
	function fill_text(color){
		var year = document.querySelector("#alternatives .year").value,
			parties = document.querySelectorAll("#alternatives .party"),
			seats = document.querySelectorAll("#alternatives .seats"),
			votesxseats = document.querySelectorAll("#alternatives .votesxseat"),
			censuses = document.querySelectorAll("#alternatives .census"),
			votes = document.querySelectorAll("#alternatives .votes"),
			v,
			census = Math.floor(parseInt(censuses[0].textContent.replace(/\./g,""))),
			results = cache_results[year],
			valid = results.valid,
			keys = Object.keys(results),
			alternative = get_alternative(),
			alternative_results,
			party,
			old_seats,
			calculate_votes = false;
		
		// Reset the current text with two dashes
		reset_spans();
		
		// Load the proper alternative results
		if(alternative !== "dhont-350-2/" && (alternative !== "ugr/" || year !== "2011")){
			alternative_results = cache_alternatives[alternative][year]
		}
		
		// Load the party whose color is the first argument
		for(var i = 0; i < keys.length; i++){
			if(color == results[keys[i]].color){
				party = results[keys[i]];
				break;
			}
		}
		
		// if party isn't empty, i have to populate the before texts
		if(party !== undefined){
			parties[0].textContent = keys[i];
			v = Math.floor(party.v*census);
			percent = Math.floor(party.v*10000)/100;
			votes[0].textContent = pretty_number(v) + " = " + String(percent).replace(".", ",") + "%";
			seats[0].textContent = party.n;
			old_seats = party.n;
			votesxseats[0].textContent = pretty_number(Math.floor(v / party.n));
			if(v / party.n > valid / 350){
				votesxseats[0].style.color = "red";
			}else{
				votesxseats[0].style.color = "green";
			}
		// otherwise load the proper party from the alternative results
		}else{
			keys = Object.keys(alternative_results);
			for(var i = 0; i < keys.length; i++){
				if(color == alternative_results[keys[i]].color){
					party = alternative_results[keys[i]];
					calculate_votes = true;
					break;
				}
			}
		}
		
		// populate the alternative texts
		if(party !== "" && alternative_results !== undefined){
			party = alternative_results[keys[i]];
			parties[1].textContent = keys[i];
			if(calculate_votes){
				v = Math.floor(party.v*census);
				percent = Math.floor(party.v*10000)/100;
			}
			votes[1].textContent = pretty_number(v) + " = " + String(percent).replace(".", ",") + "%";
			seats[1].innerHTML = party.n;
			if(party.n - old_seats > 0){
				seats[1].innerHTML += " <bold style='color: green; margin-left: 15px'>+" + (party.n - old_seats) + "</bold>";
			}else if(party.n - old_seats < 0){
				seats[1].innerHTML += " <bold style='color: red; margin-left: 15px'>" + (party.n - old_seats) + "</bold>";
			}
			votesxseats[1].textContent = pretty_number(Math.floor(v / party.n));
			if(v / party.n > valid / 350){
				votesxseats[1].style.color = "red";
			}else{
				votesxseats[1].style.color = "green";
			}
		}
	}
	
	// return the alternative that the user has selected
	function get_alternative(){
		var year = document.querySelector("#alternatives .year"),
			formula = document.querySelector("#alternatives .formula"),
			size = document.querySelector("#alternatives .size"),
			minimum = document.querySelector("#alternatives .min"),
			alternative = "";
		
		if(formula.value === "ugr"){
			alternative = "ugr/";
		}else{
			alternative = formula.value + "-" + size.value + "-" + minimum.value + "/";
		}
		return alternative
	}
	
	// Request with AJAX the alternative selected
	function get_alternatives(){
		var http_data = new XMLHttpRequest(),
			year = document.querySelector("#alternatives .year"),
			size = document.querySelector("#alternatives .size").value,
			alternative = get_alternative();
		
		if(!(alternative in cache_alternatives) || !(year in cache_alternatives[alternative])){
			// The results aren't in the cache
			
			if(alternative !== "dhont-350-2/" && (alternative !== "ugr/" || year.value !== "2011")){
				// The results must be redrawn
				http_data.onreadystatechange = function(){
					var data;
					if(http_data.readyState === 4 && http_data.status === 200){
						data = JSON.parse(http_data.responseText);
						if(typeof cache_alternatives[alternative] !== "object"){
							cache_alternatives[alternative] = new Object();
						}
						cache_alternatives[alternative][year.value] = data;
						
						if(size == 400 || alternative === "ugr/"){
							update_400_seats(alternative, year.value)
						}else{
							update_350_seats(alternative, year.value)
						}
					}
				}
				http_data.open("GET", "/static/loreg/alternativas/" + alternative + year.value + '.json', true);
				http_data.send();
			}
		}
		
	}
	// Update the .after canvas when the alternative has 350 seats
	function update_350_seats(alternative, year){
		var results = cache_alternatives[alternative][year],
			canvasAfter = document.querySelector("#alternatives canvas.after"),
			layerAfter = layers[3];
		
		layerAfter.draw(canvasAfter, results);
	}
	
	// Update the .after canvas when the alternative has 400 seats
	function update_400_seats(alternative, year){
		var canvas_after = document.querySelector("#alternatives canvas.after"),
			layerBefore = layers[2],
			layerAfter = layers[3],
			alternative_results = cache_alternatives[alternative][year],
			results = cache_results[year],
			keys = Object.keys(results),
			key,
			n1,
			// new_results stores the new distribution from the alternative
			new_results = new Object(),
			// Auxiliary array to sort the new_results
			aux = [],
			has_seats,
			// What party gained more number of seats with the alternative?
			// i use it to balanceate the distribution of the extra 50 when a party lost seats with the alternative
			maximum = [0],
			// when the distribution in the 350 first seats changes, acc is equal to the difference of seats
			acc = 0;
		
		// Iterate through results to populate the aux structure
		for(var i = 0; i < keys.length; i++){
			key = keys[i];
			if(results[key].hasOwnProperty("n")){
				// The party exists in the alternative
				if(key in alternative_results){
					n1 = alternative_results[key].n - results[key].n;
					color = results[key].color;
					if(n1 <= 0){
						aux.push([key, {color: color, n: alternative_results[key].n}]);
						// Remember that n1 < 0, so substract is in fact add
						acc -= n1;
					// The party has more seats with the alternative than before
					}else{
						aux.push([key, {color: color, n: results[key].n, extra: n1}]);
					}
					// update the maximum that i use later in the second iteration
					if(n1 > maximum[0]){
						maximum[0] = n1;
						maximum[1] = i;
					}
				}else{
					aux.push([key, {color: color, n: results[key].n}]);
				}
			}
		}
		// There is at least one party that has lost seats, so i've to balanceate it
		if(acc > 0){
			aux[maximum[1]][1].n += acc;
			aux[maximum[1]][1].extra -= acc;
		}
		// Iterate through alternative to add the parties that now have seats
		keys = Object.keys(alternative_results);
		for(var i = 0; i < keys.length; i++){
			key = keys[i];
			
			// Has already the party got seats in the congress?
			has_seats = true;
			for(var ii = 0; ii < aux.length; ii++){
				if(aux[ii][0] == key){
					has_seats = false;
					break;
				}
			}
			if(has_seats){
				color = alternative_results[key].color;
				n1 = alternative_results[key].n;
				aux.splice(0, 0, [key, {color: color, n: 0, extra: n1}]);
			}
		}
		
		var new_results_sorted = new Object;
		for(var i = 0; i < aux.length; i++){
			new_results[aux[i][0]] = aux[i][1];
		}
		layerAfter.draw(canvas_after, new_results);
	}
	
	// Form setup
	select_year.value = 2011;
	select_year.onchange = function(e){
		get_results(e.currentTarget.value, draw_it);
	};
	formula.value = "dhont";
	formula.onchange = function(e){
		var size = document.querySelector("#alternatives .size"),
			minimum = document.querySelector("#alternatives .min");
		if(e.currentTarget.value == "ugr"){
			size.disabled = true;
			minimum.disabled = true;
		}else{
			size.disabled = false;
			minimum.disabled = false;
		}
		get_alternatives();
	}
	size.disabled = false;
	minimum.disabled = false;
	size.value = 350;
	size.onchange = function(){
		get_alternatives();
	}
	minimum.value = 2;
	minimum.onchange = function(){
		get_alternatives();
	}
	
	canvas_before.width = 400;
	canvas_before.height = 250;
	canvas_after.width = 400;
	canvas_after.height = 250;
	
	bind(canvas_before, "mousemove", layerBefore);
	bind(canvas_after, "mousemove", layerAfter);
	bind(canvas_before, "mouseup", layerBefore, function(seat){
		var color = seat.color;
		layerAfter.select_party(color, canvas_after.getContext("2d"));
		layerAfter.selected = true;
		fill_text(seat.color);
	});
	bind(canvas_after, "mouseup", layerAfter, function(seat){
		var color = seat.color;
		layerBefore.select_party(color, canvas_before.getContext("2d"));
		layerBefore.selected = true;
		fill_text(seat.color);
	})
	get_results(2011, draw_it);
})();

//Setup for the help panel
(function(){
	content.style.height = window.innerHeight + "px";
})();

content.onmouseup = function(){
	if(eject.classList.contains("rotated")){
		hide_help();
	}else{
		show_help();
	}
}

content.onmouseover = content.onmouseout = function(){
	content.classList.toggle("selected");
	eject.classList.toggle("selected");
}

window.onresize = function(){
	content.style.height = window.innerHeight + "px";
}