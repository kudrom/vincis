var articles = document.querySelectorAll("article"),
	vincis = articles[0],
	homeCanvases = document.querySelectorAll("#vincis > canvas"),
	sections = document.querySelectorAll("#vincis .second li"),
	// In order to avoid the overlap of the earlier handler in logo.js
	oldResizeFunction = window.onresize,
    i,
    lastTime = +new Date(),
    // view the call to cancelAnimationFrame in the handler for the sections
    currentAnimation,
    /* The next variables are used only in draw_report but in order to use
     * cancelAnimationFrame they must be global, otherwise if the animation is
     * interrupted in the middle of draw_graph (or draw_axes) it goes crazy.
     */
	    next_function,
	    // amount of animation already animated
		delta = 0,
		// sum of the total of segments in the function draw_graph
		total_x = 0,
		total_y = 0,
		old_total_x,
		old_total_y,
		// enable/disable draw points in the function draw_graph
		called = [0, 0, 0, 0];

// polyfill for requestAnimationFrame and cancelAnimationFrame from Paul Irish
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function draw_report(){
	var canvas = document.querySelector("canvas#report"),
		context = canvas.getContext("2d"),
		MARGIN = 0,
		WIDTH = 4;

	function draw_axes(time){
		// With Chrome time and lastTime are roughly equal and therefore elapsedTime is negative
		var elapsedTime = Math.max(time - lastTime, 1),
			initial = 150;
		
		// Draw the vertical axis until it reach the maximum height
		if(delta + initial < (canvas.height - MARGIN*2)){
			context.fillRect(MARGIN, MARGIN + delta, WIDTH, initial);
		}
		// Draw the horizontal axis
		context.fillRect(MARGIN + delta, canvas.height - MARGIN - WIDTH, initial, WIDTH);
		delta += initial * (elapsedTime / 1000);
		lastTime = time;
		
		// Controls the length of the horizontal axis
		if(delta + initial < (canvas.width - MARGIN*2)){
			return "axes";
		}else{
			// setup for draw_graph function
			context.restore();
			context.save();
			context.lineWidth = WIDTH;
			context.beginPath();
			// Initial translation for the graph
			context.translate(1.3*MARGIN + 10, canvas.height*0.35);
			delta = 0;
			context.strokeStyle = BLUE;
			return "graph";
		}
	}
	
	function draw_graph(time){
		var elapsedTime = Math.max(time - lastTime, 1),
			initial = 10,
			angle;
		
		// Control the direction and length of the segments of the line
		if(total_x < 100){
			angle = to_rad(30);
		}else if(total_x > 100 && total_x < 150){
			angle = to_rad(60);
		}else if(total_x > 150 && total_x < 220){
			angle = to_rad(-60);
			/* i have to store the old_total in order to place the point 
			 * in the correct place and over the line
			 */
			if(called[0] === 0){
				old_total_x = total_x;
				old_total_y = total_y; 
			}else if (called[0] === 2){
				draw_point();
			}
			called[0]++;
		}else if(total_x > 220 && total_x < 240){
			angle = to_rad(75);
		}else if(total_x > 240 && total_x < 250){
			angle = to_rad(-85);
		}else if(total_x > 250 && total_x < 290){
			angle = to_rad(-15);
			if(called[1] === 0){
				old_total_x = total_x;
				old_total_y = total_y; 
			}else if (called[1] === 2){
				draw_point();
			}
			called[1]++;
		}else{
			angle = to_rad(15);
			if(called[2] === 0){
				old_total_x = total_x;
				old_total_y = total_y; 
			}else if (called[2] === 2){
				draw_point();
			}
			called[2]++;
		}
		
		// The translations are cumulative
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(Math.cos(angle)*delta, Math.sin(angle)*delta);
		context.translate(Math.cos(angle)*delta, Math.sin(angle)*delta);
		context.stroke();
		
		// Updates the state of the animation
		delta = initial * (elapsedTime / 1000);
		total_x += Math.cos(angle)*delta;
		total_y += Math.sin(angle)*delta;
		
		// Stop the animation if it reaches the end
		if(total_x < canvas.width - MARGIN*2){
			return "graph";
		}else{
			context.restore();
			return "end";
		}
	}
	
	/* Draw a point on the correct spot and over the curve
	 * CAUTION: it uses globals to determine the spot
	 */
	function draw_point(){
		context.save();
		context.fillStyle = ORANGE;
		context.translate(old_total_x - total_x, old_total_y - total_y);
		
		context.beginPath();
		context.arc(0, 0, 1.5*WIDTH, 0, Math.PI*2);
		context.fill();
		
		context.beginPath();
		context.fillStyle = "white";
		context.arc(0, 0, 0.8*WIDTH, 0, Math.PI*2, true);
		context.fill();
		
		context.restore();
	}
	
	/* To use cancelAnimationFrame i've to use only one function to animate the
	 * axes and the graph.
	 */
	function animation(time){
		var result;
		// initial function
		if (next_function === undefined){
			next_function = draw_axes;
		}
		// when the animation has finished next_function = null
		if(next_function !== null){
			result = next_function(time);
			if(result === "axes"){
				next_function = draw_axes
			}else if(result === "graph"){
				next_function = draw_graph
			}else{
				next_function = null;
			}
			if(next_function !== null){
				currentAnimation = requestAnimationFrame(animation);
			}
		}
	}
	
	// Start the animation
	context.save();
	context.beginPath();
	context.lineWidth = WIDTH;
	context.fillStyle = ORANGE;
	lastTime = +new Date();
	requestAnimationFrame(animation);
}

// auxiliar function for draw_tech that draws the points in the context
function drawPoints(points, context){
    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "8px Round"
    context.fillStyle = "#888";
    context.beginPath();
	context.arc(context.canvas.width/2, context.canvas.height/2, 4, 0, Math.PI*2,false);
	context.fill();
    context.beginPath();
    for(var i = 0; i < points.length; i++){
        context.fillText(i, points[i].x, points[i].y)
    }
    context.restore()
}

// Convert sexadecimal degrees to radians
function to_rad(angle){
	return (Math.PI/180)*angle;
}

// Calculates the distance between two points

function dist(p1, p2){
	var dx = p2.x - p1.x,
		dy = p2.y - p1.y;
	return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

// Draw the tech canvas
function draw_tech(){
	var canvas = document.querySelector("canvas#tech"),
    	context = canvas.getContext("2d"),
    	gears = [],
    	//Constructor for each gear
    	Gear = function(color, vel, number_tooth, width, depth, initial_angle, center){
    		var alpha = to_rad(180 / number_tooth);
    		
    		return {
    			color: color,
    			vel: vel,
    			center: center,
    			iangle: to_rad(initial_angle),
    			num: number_tooth,
    			alpha: alpha,
    			depth : depth,
    			radius: width / (2*Math.sin(alpha/2)),
    			width: width,
    			
    			rotate: function(angle){
    				this.iangle += to_rad(angle);
    				if(this.iangle > Math.PI*2){
    					this.iangle -= Math.PI*2;
    				}else if(this.iangle < -Math.PI*2){
    					this.iangle += Math.PI*2;
    				}
    			},
    			build_path: function(){
    				var i,
    					vector, p1, p2,
    					angle = this.iangle,
    					x, y, 
    					points = [];
    				
    				for(i = 0; i < this.num*2; i++){
    					x =  Math.sin(angle) * this.radius;
    					y = -Math.cos(angle) * this.radius;
    					points.push({x: x, y: y})
    					// Complete the tooth with the upper points
    					if(i % 2 === 1){
    						p1 = points.slice(-2, -1)[0];
    						p2 = points.slice(-1)[0];
    						// get the perpendicular vector to the base line of the teeth
    						vector = unitary_perpendicular_vector(p1, p2, this.depth);
    						// use the vector above to calculate the new coordinates
    						x = p1.x + (vector.x * this.depth);
    						y = p1.y + (vector.y * this.depth);
    						points.splice(-1, 0, {x: x, y: y});
    						x = p2.x + (vector.x * this.depth);
    						y = p2.y + (vector.y * this.depth);
    						points.splice(-1, 0, {x: x, y: y});
    					}
    					angle += this.alpha;
    				}
    				
    				// Draw the path
    				context.save();
    				context.translate(center.x, center.y);
    				context.beginPath();
    				context.moveTo(points[0].x, points[0].y);
    				for(i = 1; i < points.length; i++){
    					context.lineTo(points[i].x, points[i].y);
    				}
    				context.restore();
    				return points;
    			},
    			draw: function(){
    				var points;
    				context.save();
    				points = this.build_path();
    				context.fillStyle = this.color;
    				context.shadowColor = "#bbb";
    				context.shadowBlur = 10;
    				context.fill();
    				context.translate(this.center.x, this.center.y);
    				context.rotate(this.iangle);
    				context.beginPath();
    				context.arc(0, 0, this.radius*0.65, 0, Math.PI*2, false);
    				context.clip();
    				context.clearRect(-center.x, -center.y, context.canvas.width, context.canvas.height);
    				
    				// cross on the gear
    				context.beginPath();
    				context.arc(0, 0, this.radius*0.2, 0, Math.PI*2);
    				context.rect(-0.075*this.radius, -0.66*this.radius, 
    							  0.15 *this.radius,  this.radius*1.5);
    				context.rect(-0.66*this.radius, -0.075*this.radius, 
							  	  this.radius*1.5,  0.15*this.radius);
    				context.fill();
    				
    				// inner circles
    				context.beginPath();
    				context.arc(0, 0, this.radius*0.1, 0, Math.PI*2);
    				context.clip();
    				context.clearRect(-center.x, -center.y, context.canvas.width, context.canvas.height);
    				context.restore();
    				//drawPoints(points, context);
    			}
    			
    		}
    	};
    	
    	// Return a unitary vector perpendicular to the one given; it's used in Gear.build_path
    	function unitary_perpendicular_vector(p1, p2){
    		var dx = p2.x - p1.x,
    			dy = p2.y - p1.y,
    			mod = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)),
    			unitary = {x: dx/mod, y: dy/mod};
    		return {x: unitary.y, y: -unitary.x};
    	}
    	
		// Animate the gears calculating the velocity according to the fps
		function animate(time){
			var elapsedTime = time - lastTime,
				i;
			context.clearRect(0, 0, context.canvas.width, context.canvas.height)
			for(i = 0; i < gears.length; i++){
				gears[i].rotate(gears[i].vel * (elapsedTime / 1000));
				gears[i].draw();
			}
			lastTime = time;
			currentAnimation = requestAnimationFrame(animate);
		}
		
		gears.push(new Gear("#829FE9", 90, 6, 50, 40, 0, {x: 140, y: 0.7*canvas.height}));
		gears.push(new Gear("#EF8E51", -90, 6, 50, 40, 0, {x: canvas.width - 145, y: 0.3*canvas.height}))
		requestAnimationFrame(animate);
}

function draw_article(){
	var canvas = document.querySelector("canvas#article"),
		context = canvas.getContext("2d"),
		i,
		PHRASE = "viva la republica y el ingenio; salud a los oprimidos; give me liberty or death".replace(" ", ""),
		// Stores the number of letters on the canvas
		cont = 0,
		// Stores the timestamp of the last requestAnimationFrame call
		old_time,
		// Stores the timestamp of the last time in which a letter was added to the canvas
		old_update,
		// Array for the letters on the canvas
		letters = [],
		Letter = function (color, char, size, x, y, vel, acc, enabled){
		
			return{
				color: color,
				char: char,
				size: size,
				x: x,
				y: y,
				vel: vel,
				acc: acc,
				enabled: enabled,
				update: function(elapsed_time){
					this.vel += elapsed_time*acc;
					this.y += this.vel;
					if(this.y> canvas.height){
						this.y = canvas.height;
						this.vel *= -0.2;
					}else if (Math.abs(this.y - canvas.height) < 0.1){
						this.enabled = false;
					}
				},
				draw: function(){
					context.fillStyle = color;
					context.font = size + 'px "Fauna One"';
					context.fillText(this.char, this.x, this.y);
				}
			}
	}
	
	function animate(time){
		var elapsed_time = Math.max((time - old_time)/1000, 0),
			is_over = true;
		
		// Add a letter to the canvas
		if(cont < letters.length && time - old_update > 3000){
			letters[cont].enabled = true;
			cont++;
		}
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		// Update all the enabled letters
		for(letter in letters){
			if(letters[letter].enabled){
				is_over = false;
				letters[letter].update(elapsed_time);
				letters[letter].draw();
			}else{
				letters[letter].draw()
			}
		}
		
		// Update the animation for the next frame
		old_time = time;
		if(!is_over){
			requestAnimationFrame(animate);
		}
	}
	
	// Setup
	canvas.width = vincis.offsetWidth;
	canvas.height = vincis.offsetHeight;
	// generate the letters at random
	for(i = 0; i < PHRASE.length; i++){
		var color;
		if(i % 2 == 0){
			color = BLUE;
		}else{
			color = ORANGE;
		}
		letters.push(new Letter(color, PHRASE[i], get_random(25, 160), 
							   get_random(0, canvas.width - 30), -150,
							   get_random(4, 40), 1.5, Math.random() > 0.5));
	}
	old_update = old_time = +new Date();
	requestAnimationFrame(animate);
}

// Shows the correct canvas and the element on the navigation
function update_animation(element){
	var text = element.children[0].textContent,
		items = nav.children[0].children,
		canvas = document.querySelectorAll("#vincis > canvas"),
		drawers = {
			"report": draw_report,
			"tech": draw_tech,
			"article": draw_article
		},
		name = element.className.split(" ")[0],
		elements = document.querySelectorAll("#vincis .second li"),
		ii;
	
	for(ii = 1; ii < items.length - 1; ii++){
		if(items[ii].textContent === text){
			items[ii].children[0].classList.add("edited");
		}else{
			items[ii].children[0].classList.remove("edited");
		}
	}
	for(ii = 0; ii < canvas.length; ii++){
		canvas[ii].classList.add("hidden");
		elements[ii].classList.remove("selected");
	}
	cancelAnimationFrame(currentAnimation);
	document.querySelector("canvas#" + name).classList.remove("hidden");
	element.classList.add("selected");
	drawers[name]();
}

/* Setup */
window.onresize = function(e){
	oldResizeFunction(e);
    update_heights(610, articles);
}

/* For every section of vincis (report, tecnicality and article) at the first
 * "spreedsheet" handle the hover event to update the canvas which is shown on
 * the background.
 */
for(i = 0; i < sections.length; i++){
	// Wrapper for the update_animation function
	sections[i].addEventListener("click", function(e){
		update_animation(e.currentTarget);
	});
}

update_heights(600, articles);
update_animation(document.querySelector(".report"));