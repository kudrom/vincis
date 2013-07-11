var canvas = document.querySelector("canvas#logo"),
    context = canvas.getContext("2d"),
    bckgCanvas = document.createElement("canvas"),
    bckgContext = bckgCanvas.getContext("2d"),
    MAX_RADIUS = 10,
    ZOOM = canvas.width / 450,
    juice = [300, 100, 40, 200, 200, 100, 40, 160],
    end_points = [
        [ //V
            {x: 18,  y: 59 },
            {x: 39,  y: 59 },
            {x: 64,  y: 115},
            {x: 101, y: 17 },
            {x: 120, y: 14 },
            {x: 67,  y: 137},
            {x: 53,  y: 137},
        ],
        [ // body's i
            {x: 131, y: 59 },
            {x: 149, y: 59 },
            {x: 149, y: 137},
            {x: 131, y: 137},
        ],
        [ // point's i
            {x: 129, y: 43 },
            {x: 152, y: 43 }
        ],
        [ // n
            {x: 168, y: 59 },
            {x: 197, y: 59 },
            {x: 220, y: 137},
            {x: 204, y: 137},
            {x: 187, y: 72 },
            {x: 187, y: 137},
            {x: 168, y: 137}
        ],
        [ // c
            {x: 322, y: 76 },
            {x: 306, y: 84 },
            {x: 271, y: 91 },
            {x: 306, y: 110},
            {x: 322, y: 117},
            {x: 251, y: 91 }
        ],
        [ // body's i
            {x: 341, y: 59 },
            {x: 359, y: 59 },
            {x: 359, y: 137},
            {x: 341, y: 137},
        ],
        [ // point's y
            {x: 339, y: 43 },
            {x: 362, y: 43 }
        ],
        [ // s
            {x: 426, y: 69 },
            {x: 415, y: 77 },
            {x: 406, y: 82 },
            {x: 433, y: 115},
            {x: 373, y: 119},
            {x: 388, y: 109},
            {x: 415, y: 114},
            {x: 385, y: 78 }
        ]
        
    ],    
    control_points = [
        [ // V
            {x: 18,  y: 59 },
            {x: 39,  y: 59 },
            {x: 39,  y: 59 },
            {x: 64,  y: 115},
            {x: 81,  y: 96 },
            {x: 103, y: 27 },
            {x: 101, y: 17 },
            {x: 120, y: 14 },
            {x: 122, y: 26 },
            {x: 100, y: 97 },
            {x: 67,  y: 137},
            {x: 53,  y: 137},
            {x: 53,  y: 137},
            {x: 18,  y: 59 }
        ],
        [ // body's i
            {x: 131, y: 59 },
            {x: 149, y: 59 },
            {x: 149, y: 59 },
            {x: 149, y: 137},
            {x: 149, y: 137},
            {x: 131, y: 137},
            {x: 131, y: 137},
            {x: 131, y: 59 }
        ],
        [ // point's i
            {x: 129, y: 26 },
            {x: 152, y: 26 },
            {x: 152, y: 56 },
            {x: 129, y: 56 }
        ],
        [ // n
            {x: 168, y: 59 },
            {x: 197, y: 59 },
            {x: 255, y: 65 },
            {x: 240, y: 120},
            {x: 220, y: 137},
            {x: 204, y: 137},
            {x: 210, y: 130},
            {x: 239, y: 72 },
            {x: 187, y: 72 },
            {x: 187, y: 137},
            {x: 187, y: 137},
            {x: 168, y: 137},
            {x: 168, y: 137},
            {x: 168, y: 59 }
        ],
        [ // c
            {x: 322, y: 76 },
            {x: 306, y: 84 },
            {x: 298, y: 61 },
            {x: 272, y: 68 },
            {x: 271, y: 129},
            {x: 300, y: 132},
            {x: 306, y: 110},
            {x: 323, y: 117},
            {x: 308, y: 148},
            {x: 252, y: 147},
            {x: 252, y: 43 },
            {x: 315, y: 53 },
        ],
        [ // body's i
            {x: 340, y: 59 },
            {x: 359, y: 59 },
            {x: 359, y: 59 },
            {x: 359, y: 137},
            {x: 359, y: 137},
            {x: 340, y: 137},
            {x: 340, y: 137},
            {x: 340, y: 59 }
        ],
        [ // point's i
            {x: 339, y: 26 },
            {x: 362, y: 26 },
            {x: 362, y: 56 },
            {x: 339, y: 56 }
        ],
        [ // s
            {x: 427, y: 70 },
            {x: 415, y: 77 },
            {x: 411, y: 63 },
            {x: 390, y: 73 },
            {x: 416, y: 88 },
            {x: 437, y: 93 },
            {x: 423, y: 153},
            {x: 382, y: 136},
            {x: 374, y: 119},
            {x: 388, y: 109},
            {x: 389, y: 126},
            {x: 414, y: 133},
            {x: 416, y: 92 },
            {x: 385, y: 100},
            {x: 386, y: 51 },
            {x: 418, y: 51 }
        ]
    ],
    // Limits for each letter of vincis
    bounding_boxes = [
        {x: 15,  y: 11,  width: 111, height: 129},
        {x: 129, y: 57,  width: 23,  height: 82 },
        {x: 127, y: 28,  width: 27,  height: 27 },
        {x: 164, y: 56,  width: 77,  height: 83 },
        {x: 249, y: 55,  width: 81,  height: 85 },
        {x: 336, y: 55,  width: 26,  height: 85 },
        {x: 335, y: 29,  width: 30,  height: 30 },
        {x: 371, y: 54,  width: 65,  height: 86 },
    ],
    // Stores all the positions of the individual letters for each letter (see function drawLogo)
    letters = [[], [], [], [], [], [], [], []],
    i;

// Auxiliar function to draw the control and end points
function drawPoints(){
    context.save();
    context.fillStyle = "rgba(255,0,0,0.3)";
    for(var i = 0; i < control_points.length; i++){
        for(var j = 0; j < control_points[i].length; j++){
            context.beginPath();
            context.arc(control_points[i][j].x * ZOOM, control_points[i][j].y * ZOOM,
                        4, 0, Math.PI*2, false);
            context.fill()
        }
    }
    context.restore()
    context.save();
    context.fillStyle = "blue";
    for(var i = 0; i < end_points.length; i++){
        for(var j = 0; j < end_points[i].length; j++){
            context.beginPath();
            context.arc(end_points[i][j].x * ZOOM, end_points[i][j].y * ZOOM,
                        2, 0, Math.PI*2, false);
            context.fill()
        }
    }
    context.restore()
}

// Transforms the coordinates of the dom element into the internal canvas
function windowToCanvas(x, y){
    var bbox = canvas.getBoundingClientRect();
    return {x: x-bbox.left * (canvas.width  / bbox.width),
            y: y-bbox.top  * (canvas.height / bbox.height)}
}

// Draws the logo's path
function drawPath(context){
    var len = control_points.length,
        i;
    context.beginPath();
    for(i = 0; i < len; i++){
        drawLetterPath(context, i);
    }
}

// Draws a letter of the path's logo
function drawLetterPath(context, letter){
    var len = end_points[letter].length,
        i;

    context.moveTo(end_points[letter][0].x * ZOOM, end_points[letter][0].y * ZOOM);
    for(i = 0; i < len; i++){
        context.bezierCurveTo(
            control_points[letter][2*i].x * ZOOM,
            control_points[letter][2*i].y * ZOOM,
            control_points[letter][2*i + 1].x * ZOOM,
            control_points[letter][2*i + 1].y * ZOOM,
            end_points[letter][(i+1) % len].x * ZOOM,
            end_points[letter][(i+1) % len].y * ZOOM
        );
    }
}

// Draws the logo in a plain color
function drawPlainLogo(){
    context.save()
    context.fillStyle = "#eee";
    context.strokeStye= "black";
    drawPath(context);
    context.fill();
    context.restore();
}

// Draws the logo with the pinky-winky effect
function drawLogo(){
    var len = control_points.length,
        abc = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
        letter,
        color,
        x,
        y,
        i,
        j;
        
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillRect(canvas.x, canvas.y, canvas.width, canvas.height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "7px Round"
    context.fillStyle = "#888";
    for(i = 0; i < len; i++){
        bckgContext.beginPath();
        drawLetterPath(bckgContext, i);
        for(j = 0; j < juice[i]; j++){
            do{
               x = Math.random() * canvas.width;
               y = Math.random() * canvas.height;
            }while(!bckgContext.isPointInPath(x, y))
            letter = abc[Math.round(Math.random() * 53)];
            context.fillText(letter, x, y);
            color = j % 2 == 0 ? "#EF8E51" : "#8CA5E2";
            letters[i].push({
                    'x': x,
                    'y': y,
                    'letter': letter,
                    'color' : color,
                    'selected' : false
            });
        }
    }
}

// Redraw each letter of a letter updating also the color
function redrawLetter(letter){
    var i,
        bbox = bounding_boxes[letter],
        aux;
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.fillRect(bbox.x * ZOOM, bbox.y * ZOOM, bbox.width * ZOOM, bbox.height * ZOOM);
    for(i = 0; i < juice[letter]; i++){
        aux = letters[letter][i];
        context.fillStyle = aux.color;
        context.fillText(aux.letter, aux.x, aux.y);
    }
}

// Calculates the distance between two points
function dist(p1, p2){
    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

// Handler for the logo when the user hover over it
canvas.onmousemove = function(e){
    var loc = windowToCanvas(e.clientX, e.clientY),
        letter_selected,
        distance,
        angle,
        dx,
        dy,
        i;
        
    e.preventDefault();
    for(i = 0; i < 8; i++){
        bckgContext.beginPath();
        drawLetterPath(bckgContext, i);
        if(bckgContext.isPointInPath(loc.x, loc.y)){
            letter_selected = i;
            break;
        }
    }
    if(letter_selected !== undefined){
        e.currentTarget.parentNode.style.cursor = "pointer";
        for(i = 0; i < juice[letter_selected]; i++){
            distance = dist(letters[letter_selected][i], loc);
            if(distance < MAX_RADIUS){
                // Each letter is going to move out of the radius of action of the pointer
                angle = Math.atan2(letters[letter_selected][i].y - loc.y,
                               letters[letter_selected][i].x - loc.x);
                dx = Math.cos(angle) * (MAX_RADIUS - distance);
                dy = Math.sin(angle) * (MAX_RADIUS - distance);
                letters[letter_selected][i].x += dx;
                letters[letter_selected][i].y += dy;
                letters[letter_selected][i].selected = true;
            }
        }
        redrawLetter(letter_selected);
    } else{
        e.currentTarget.parentNode.style.cursor = "default";
    }
};

// Redraw the logo if the display is 500px maximum
window.onresize = function(e){
    if(window.matchMedia("(max-width: 500px)").matches && ZOOM === 1){
        canvas.width = 300;
        canvas.height = 120;
        bckgCanvas.width = canvas.width;
        bckgCanvas.height = canvas.height;
        ZOOM = canvas.width / 450;
        juice = [150, 50, 15, 100, 100, 50, 15, 80];
        letters = [[], [], [], [], [], [], [], []];
        MAX_RADIUS = 5;
        drawLogo();
    }
    else if(window.matchMedia("(min-width: 500px)").matches && ZOOM !== 1){
        canvas.width = 450;
        canvas.height = 180;
        bckgCanvas.width = canvas.width;
        bckgCanvas.height = canvas.height;
        ZOOM = 1;
        juice = [300, 100, 40, 200, 200, 100, 40, 160];
        letters = [[], [], [], [], [], [], [], []];
        MAX_RADIUS = 10;
        drawLogo();
    }

}

/* Initial setup */
canvas.parentNode.style.cursor = "default";
bckgCanvas.width = canvas.width;
bckgCanvas.height = canvas.height;
drawLogo();
