// Global variables
var wrapper = document.querySelector(".wrapper"),
	content = document.querySelector("#content"),
    nav = document.querySelector("div[role='navigation']"),
    search = document.querySelector("li[role='search'] form"),
    mag_glass = document.querySelector("li[role='search'] i"),
    overlay = document.querySelector(".overlay"),
    mail = document.querySelector(".contact li"),
    popup = document.querySelector(".pop-up"),
    warning = document.querySelector(".warning"),
    close= document.querySelector(".close"),
    ORANGE = "#EF8E51",
	BLUE = "#829FE9";

// *************************** COMMON FUNCTIONS *******************************
//Transforms the coordinates of the dom element into the internal canvas
function windowToCanvas(x, y, canvas){
    var bbox = canvas.getBoundingClientRect();
    return {x: x-bbox.left * (canvas.width  / bbox.width),
            y: y-bbox.top  * (canvas.height / bbox.height)}
}

//Calculates the distance between two points
function dist(p1, p2){
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

//Calculates the sum of the list given as argument
function sum(list){
	var acc = 0;
	for(var i = 0; i < list.length; i++){
		acc += list[i];
	}
	return acc;
}

// Calculates the minimum of a list
function min(list){
	var ret = list[0];
	for(var i = 1; i < list.length; i++){
		if(list[i] < ret){
			ret = list[i];
		}
	}
	return ret;
}

// Calculates the maximum of a list
function max(list){
	var ret = list[0];
	for(var i = 1; i < list.length; i++){
		if(list[i] > ret){
			ret = list[i];
		}
	}
	return ret;
}

function pretty_number(number){
	var n = String(number),
		ret = n.slice(-3);
	for(var i = 3; i < n.length; i += 3){
		ret = n.slice(-i - 3, -i) + "." + ret;
	}
	return ret
}

/* Updates the heights of every article to the height of the screen or the MIN_HEIGHT.
 * I've to update NAV_HEIGHT because of the responsive design
 */
function update_heights(MIN_HEIGHT, articles){
	var NAV_HEIGHT = nav ? nav.offsetHeight : 0,
		height = window.innerHeight > MIN_HEIGHT ? window.innerHeight - NAV_HEIGHT : MIN_HEIGHT;

	for (i = 0; i < articles.length; i++){
		articles[i].style.height = height + "px";
	}
}

//From the MDC
function get_random(min, max){
	return Math.floor(Math.random() * (max - min +1)) + min;;
}

// show the .overlay
function toggleOverlay(e){
    overlay.style.height = Math.max(document.body.offsetHeight, window.innerHeight) + "px";
    overlay.classList.toggle("hidden");
}

// show the popup in the middle of the screen
function showPopup(e){
    var height = Math.max(document.body.offsetHeight, window.innerHeight),
        height_scroll = Math.min(document.body.offsetHeight, window.innerHeight),
        width = document.body.offsetWidth;
    e.preventDefault();
    toggleOverlay();
    popup.classList.remove("hidden");
    popup.style.left = (Math.floor(width / 2) - Math.floor(popup.offsetWidth/2)) + "px";
    popup.style.top = (Math.floor(height_scroll / 2) + window.scrollY - 135 - 50) + "px";
    document.body.onclick = function(e){
        if(!e.target.classList.contains("icon-envelope")){
            if(e.target.classList.contains("overlay")){
                hidePopup();
            }
        }
    };
    // handler for ESC
    document.body.onkeydown = function(e){
        if(e.keyCode == 27){
            hidePopup();
        }
    };
}

// hide the popup
function hidePopup(e){
    toggleOverlay();
    popup.classList.add("hidden");
    document.body.onclick = null;
    document.body.onkeydown = null;
}

function isCanvasSupported(){
	  var elem = document.createElement('canvas');
	  return !!(elem.getContext && elem.getContext('2d'));
}

function showWarning(){
	close.onclick = closeWarning;
	warning.classList.remove("hidden");
	nav.style.marginTop = warning.offsetHeight + 'px';
	wrapper.style.marginTop = (30 + warning.offsetHeight) + 'px';
	window.onresize = function(){
		nav.style.marginTop = warning.offsetHeight + 'px';
		wrapper.style.marginTop = (30 + warning.offsetHeight) + 'px';
	}
}

function closeWarning(){
	nav.style.marginTop = 0;
	wrapper.style.marginTop = '30px';
	warning.classList.add("hidden");
}

/* Initial setup */

// Only the reports doen't have the search box
if (search){
	//Handlers for the search box
	search.onclick = function(e){
	    e.preventDefault();
	    if(!search.classList.contains("edited")){
	        search.children[0].style.width = "150px";
	        search.children[0].value = "";
	    }else{
	        search.classList.remove("edited");
	    }
	    search.classList.add("selected");
	    search.children[1].style.cursor = "pointer";
	}
	search.children[0].onblur = function(e){
	    if(search.children[0].value === ""){
	        search.children[0].value = "Buscar";
	        search.children[0].style.width = "55px";
	        search.children[1].style.cursor = "text";
	    } else {
	        search.children[0].style.width = "150px";
	        search.classList.add("edited");
	    }
	    search.classList.remove("selected");
	}
	mag_glass.onclick = function(e){
		search.submit();
	}
}

mail.onclick = showPopup;

if(!isCanvasSupported()){
	showWarning();
}
