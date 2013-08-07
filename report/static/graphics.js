var // A map is composed of provinces
	Province = function(id, name, path){
		this.id = id;
		this.name = name;
		this.path = path;
		// Translate the geographical coordinates to canvas x and y
		this.get_coords = function (coords, max_min_coords){
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
		this.build_path = function(context){
			context.beginPath();
			for(i = 0; i < path.length; i++){
				length = path[i].length;
				for(ii = 0; ii < length; ii++){
					coords = this.get_coords(path[i][ii], max_min_coords);
					if(ii === 0){
						context.moveTo(coords.x, coords.y);
					}else{
						context.lineTo(coords.x, coords.y);
					}
				}
				context.closePath();
			}
		}
		this.draw = function(canvas, max_min_coords, fill, stroke){
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
	Map = function(json_provinces, max_min_coords, draw){
		// the objects array is named like this to enable the events interface
		var objects = [],
			province;
		// Build the provinces
		for(var i = 0; i < json_provinces.length; i++){
			province = json_provinces[i];
			objects.push(new Province(province.id, province.name, province.coordinates))
		}
		this.objects = objects;
		this.max_min_coords = max_min_coords;
		this.old_province = null;
		// Assign it to the argument or to a default function
		this.draw = draw != undefined ? draw : function(canvas){
			var length = this.objects.length;
			for(var i = 0; i < length; i++){
				this.objects[i].draw(canvas, this.max_min_coords, "#EF8E51", "white");
			}
		};
		this.click = function(province, canvas){
			province.draw(canvas, this.max_min_coords, "red", "white");
		};
		this.mover = function(province, canvas){
			if(this.old_province !== province){
				province.erase(canvas);
				this.old_province = province;
			}
		};
	};
