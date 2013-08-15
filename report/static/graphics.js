var // A map is composed of provinces
	Province = function(id, name, path){
		this.id = id;
		this.name = name;
		this.path = path;

		// Translate the geographical coordinates to canvas x and y.
		// max_min_coords is a global variable defined in the controller
		this.get_coords = function (coords){
			min_lat = max_min_coords.min_lat;
			total_lat = max_min_coords.total_lat;
			min_lon = max_min_coords.min_lon;
			total_lon = max_min_coords.total_lon;
			WIDTH = max_min_coords.WIDTH,
			HEIGHT = max_min_coords.HEIGHT;
			return {
			        x: ((coords[0] - min_lat) / total_lat) * WIDTH,
			        y: HEIGHT - (((coords[1] - min_lon) / total_lon) * HEIGHT)
			}
		};
		// Used by the events.js API and draw
		this.build_path = function(context){
			context.beginPath();
			for(i = 0; i < path.length; i++){
				length = path[i].length;
				for(ii = 0; ii < length; ii++){
					coords = this.get_coords(path[i][ii]);
					if(ii === 0){
						context.moveTo(coords.x, coords.y);
					}else{
						context.lineTo(coords.x, coords.y);
					}
				}
				context.closePath();
			}
		}
		this.draw = function(canvas, fill, stroke){
			var context = canvas.getContext("2d"),
				position,
				i, ii;
			context.save();
			context.fillStyle = fill;
			context.lineWidth = 0.5;
			context.strokeStyle = stroke;
			context.beginPath();
			this.build_path(context);
			context.fill();
			context.stroke();
			context.restore();
		};
		this.erase = function(canvas){
			var context = canvas.getContext("2d");
			context.save();
			this.build_path(context);
			context.clip();
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.restore();
		}
	},
	// Constructor for a map
	Map = function(json_provinces, max_min_coords){
		// the objects array is named like this to enable the events interface
		var objects = [],
			province;
		// Build the provinces
		for(var i = 0; i < json_provinces.length; i++){
			province = json_provinces[i];
			objects.push(new Province(province.id, province.name, province.coordinates))
		}
		this.objects = objects;
		this.old_object = null;

		this.draw = function(canvas, colors){
			var length = this.objects.length;
			canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
			for(var i = 0; i < length; i++){
				if(colors[i] === "#ffffff"){
					this.objects[i].erase(canvas);
				}else{
					this.objects[i].draw(canvas, colors[i], "white");
				}
			}
		};
		
		this.mover = function(province, canvas){
			if(this.old_object !== province){
				province.erase(canvas);
				if(this.old_object !== null){
					this.old_object.draw(canvas, "#AAA", "white");
				}
				this.old_object = province;
			}
		};
		
		this.mout = function(province, canvas){
			if(this.old_object !== null){
				this.old_object.draw(canvas, "#AAA", "white");
			}
		}
	},
	// Draw a circle
	Point = function(radius, x, y, n){
		this.radius = radius;
		this.x = x;
		this.y = y;
		this.n = n;
		this.build_path = function(context){
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
		}
		// The color must be set before
		this.draw = function(context, color){
			context.save();
			this.build_path(context);
			context.fillStyle = color;
			context.fill();
			context.restore();
		}
		this.drawNumber = function(number, context){
			context.font = "8px sans-serif";
			context.textAlign = "center";
			context.fillText(number, this.x, this.y);
		}
	},
	Congress = function(size_seat, width, height){
		var delta, alpha,
			x, y, coords,
			// number of seats per ring in one symmetrical slice
			seats_in_sym = 8, aux,
			// number of seats per ring
			SEATSxRING,
			position,
			// auxiliary variable to fit the seats on the third slice
			seats_aux = [[],[],[]];
		
		// size of the canvas (it's necessary for the translation of the coords)
		this.width = width === undefined ? 400 : width;
		this.height = height === undefined ? 250 : height;
		// size of each seat
		this.size = size_seat === undefined ? 4 : size_seat;
		// radius for the current ring, the 18 multiplier is empirical
		this.radius = 18 * this.size;
		// array of seats ordered by line (not ring)
		this.objects = [];
		// seats per party
		this.seatsxparty = [];
		this.old_object = null;
		// Is a seat selected?
		this.selected = false;
		
		this.translate_coords = function(x, y){
			var x1, y1;
			y1 = (this.height - this.size * 15) - y;
			x1 = this.width/2 - x;
			return [x1, y1];
		};
		
		// construction of the objects array that stores all the seats sorted 
		for(var ring = 0; ring < 10; ring++){
			/* SEATSxRING*2 are the number of seats in both symmetrical slices,
			 * SEATSxRING - 3 are the number of seats in the central slice
			 */
			SEATSxRING = seats_in_sym*2 + seats_in_sym - 3
			delta = Math.PI / SEATSxRING;
			alpha = 0;
			// in the first iteration it draws the symmetrical slices with aux == SEATSxRING
			aux = seats_in_sym;
			// iterate over the slices
			for(var j = 0; j < 2; j++){
				for(var seat = 0; seat < aux; seat++){
					x = this.radius * Math.cos(alpha);
					y = this.radius * Math.sin(alpha);
					coords = this.translate_coords(-x, y);
					if(j == 0){
						// store the symmetrical seats in the auxiliary variable
						seats_aux[0].push(new Point(this.size, coords[0], coords[1], ring + seat*10));
						coords = this.translate_coords(x, y);
						seats_aux[2].push(new Point(this.size, coords[0], coords[1], ring + (seats_in_sym - seat)*10));
					}else{
						seats_aux[1].push(new Point(this.size, coords[0], coords[1], ring +  seat*10));
					}
					alpha += delta;
				}
				alpha += 0.5*delta;
				// draw the central slice
				aux = seats_in_sym - 3;
			}
			this.radius += this.size*3;
			seats_in_sym++;
		}
		for(var j = 0; j < 3; j++){
			seats_aux[j].sort(function(a,b){return a.n - b.n});
			this.objects = this.objects.concat(seats_aux[j]);
		}

		// add the 5 lasting seats to sum up 350
		this.objects.push(new Point(this.size, this.width/2, this.height - this.size * 20, 0));
		for(i = 1; i < 3; i++){
			this.objects.push(new Point(this.size, this.width/2 + i * this.size * 3, this.height - this.size * 20, 0));
			this.objects.push(new Point(this.size, this.width/2 - i * this.size * 3, this.height - this.size * 20, 0));
		}
		
		this.assign_extra_50 = function(canvas){
			var context = canvas.getContext("2d"),
				x = this.radius,
				y = this.size*4;
			context.save();
			context.fillStyle = "#EF8E51";
			context.translate(canvas.width/2, canvas.height - this.size * 20);
			for(var i = 0; i < 5; i++){
				x = this.radius
				for(var ii = 0; ii < 5; ii++){
					x -= this.size*3;
					this.drawPoint(x, y, context);
					this.drawPoint(-x, y, context);
				}
				y += this.size*3;
			}
			context.restore();
		}
		
		// Draw the congress
		this.draw = function(canvas, results){
			var context = canvas.getContext("2d"),
				current = 0,
				keys = Object.keys(results),
				key,
				ii = 0;
			
			this.seatsxparty = [];
			context.clearRect(0, 0, canvas.width, canvas.height);
			// Stores in seatsxparty when starts and finish the seats of a party
			for(var i = 0; i < keys.length; i++){
				key = keys[i];
				if(results[key].hasOwnProperty("n")){
					this.seatsxparty.push({color: results[key].color,
										   range: [current, current += results[key].n],
										   seats: results[key].n});
					this.paint_party(this.seatsxparty[ii], context, true);
					ii++;
				}
			}
		}
		
		// Paint the congress
		this.paint_party = function(party, context, party_color, color){
			var current = party.range[0],
				col;
			
			context.save();
			col = color;
			while(current < party.range[1]){
				// if i use the party color, restart it in the parties array
				if(party_color){
					this.objects[current].color = party.color;
					col = party.color;
				}
				this.objects[current].draw(context, col);
				current++;
			}
			context.restore();
		}
		
		// fade all the parties except the selected
		this.select_party = function(color, context){
			var col;
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			for(var i = 0; i < this.seatsxparty.length; i++){
				if(this.seatsxparty[i].color !== color){
					col = tinycolor.lighten(this.seatsxparty[i].color);
					col = tinycolor.lighten(col);
					col = tinycolor.lighten(col).toHexString();
					this.paint_party(this.seatsxparty[i], context, false, col);
				}else{
					this.paint_party(this.seatsxparty[i], context, true);
				}
			}
		}
		
		// select a few seats from a party
		this.select_number_seats = function(distribution, context){
			var current,
				limit, end, color,
				selected;
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			for(var i = 0; i < this.seatsxparty.length; i++){
				current = this.seatsxparty[i].range[0];
				color = this.seatsxparty[i].color;
				end = this.seatsxparty[i].range[1];
				for(var ii = 0; ii < distribution.length; ii++){
					if(distribution[ii].color == color){
						limit = distribution[ii].n + this.seatsxparty[i].range[0];
						while(current < limit){
							this.objects[current].draw(context, color);
							current++;
						}
						break;
					}
				}
				color = tinycolor.lighten(color);
				color = tinycolor.lighten(color).toHexString();
				while(current < end){
					this.objects[current].draw(context, color);
					current++;
				}
			}
		}
		
		this.mover = function(seat, canvas){
			var context = canvas.getContext("2d");
			if(this.old_object !== seat.color){
				this.select_party(seat.color, context);
				this.old_object = seat.color;
				this.selected = false;
			}
		}
		
		this.mout = function(seat, canvas){
			var context = canvas.getContext("2d");
			if(!this.selected){
				this.old_object = null;
				context.clearRect(0, 0, canvas.width, canvas.height);
				for(var i = 0; i < this.seatsxparty.length; i++){
					this.paint_party(this.seatsxparty[i], context, true);
				}
			}
		}
		
		this.click = function(seat, canvas, func){
			this.selected = !this.selected;
			func(seat);
		}
	};
