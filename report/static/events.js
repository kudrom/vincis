var globalEventMapping = {},
	globalManagerMapping = {};

// binds an event with the appropriate handler
function bind(canvas, event, cobj){
	// Handle the event with the global manager to bind the proper manager to the cobj
	canvas["on"+event] = globalEventHandler;
	if(!(canvas in globalEventMapping)){
		globalEventMapping[canvas] = new Object();
		globalEventMapping[canvas][event] = cobj;
	}else{
		globalEventMapping[canvas][event] = cobj;
	}
}

/* I've to supply this global manager because in the event binding 
 * (DOMElement.onmousedown) the handler (in this case globalEventHandler, see the function bind)
 * is binded with the DOM element that binded it and i can't access the 
 * "complex object" through "this" in this handler, so i have to bind the primitive
 * event to a proxy (globalEventHandler) in order to call the real handler 
 * (the manager) with the complex object so it can update the state of the canvas.
 */
function globalEventHandler(e){
	var manager = globalManagerMapping[e.type],
		cobj = globalEventMapping[this][e.type];
	manager.call(cobj, e, this);
}

// Manager for click events
function clickHoverHandler(e, canvas){
	var loc = windowToCanvas(e.clientX, e.clientY, canvas),
		context = canvas.getContext("2d"),
		BckgCanvas = document.createElement("canvas"),
		BckgContext = BckgCanvas.getContext("2d"),
		i, length = this.objects.length,
		func = {"mousedown": this.click, "mousemove": this.mover};
	// Iterate over the objects
	for(i = 0; i < length; i++){
		this.objects[i].build_path(BckgContext);
		if(BckgContext.isPointInPath(loc.x, loc.y)){
			// Call the handler of the object
			func[e.type].call(this, this.objects[i], canvas);
			break;
		}
	}
}
// register the manager with the proper event types
globalManagerMapping["mousedown"] = clickHoverHandler;
globalManagerMapping["mousemove"] = clickHoverHandler;