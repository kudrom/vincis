var canvasLogo = document.querySelector("canvas#logo"),
    contextLogo = canvasLogo.getContext("2d"),
    bckgCanvasLogo = document.createElement("canvas"),
    bckgContextLogo = bckgCanvasLogo.getContext("2d"),
    LOGO_MAX_RADIUS = 10,
    LOGO_ZOOM = canvasLogo.width / 450,
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

// This two functions aren't used in the production site
// Draws the logo's path
function drawLogoPath(context){
    var len = control_points.length,
        i;
    context.beginPath();
    for(i = 0; i < len; i++){
        drawLetterPath(context, i);
    }
}
//Draws the logo in a plain color
function drawPlainLogo(){
    contextLogo.save()
    contextLogo.fillStyle = "#eee";
    contextLogo.strokeStye= "black";
    drawLogoPath(contextLogo);
    contextLogo.fill();
    contextLogo.restore();
}


// Draws a letter of the path's logo
function drawLetterPath(context, letter){
    var len = end_points[letter].length,
        i;

    context.moveTo(end_points[letter][0].x * LOGO_ZOOM, end_points[letter][0].y * LOGO_ZOOM);
    for(i = 0; i < len; i++){
        context.bezierCurveTo(
            control_points[letter][2*i].x * LOGO_ZOOM,
            control_points[letter][2*i].y * LOGO_ZOOM,
            control_points[letter][2*i + 1].x * LOGO_ZOOM,
            control_points[letter][2*i + 1].y * LOGO_ZOOM,
            end_points[letter][(i+1) % len].x * LOGO_ZOOM,
            end_points[letter][(i+1) % len].y * LOGO_ZOOM
        );
    }
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
        
    contextLogo.fillStyle = "rgba(255, 255, 255, 1)";
    contextLogo.fillRect(canvasLogo.x, canvasLogo.y, canvasLogo.width, canvasLogo.height);
    contextLogo.textAlign = "center";
    contextLogo.textBaseline = "middle";
    contextLogo.font = "7px Round"
    contextLogo.fillStyle = "#888";
    for(i = 0; i < len; i++){
        bckgContextLogo.beginPath();
        drawLetterPath(bckgContextLogo, i);
        for(j = 0; j < juice[i]; j++){
            do{
               x = Math.random() * canvasLogo.width;
               y = Math.random() * canvasLogo.height;
            }while(!bckgContextLogo.isPointInPath(x, y))
            letter = abc[Math.round(Math.random() * 53)];
            contextLogo.fillText(letter, x, y);
            color = j % 2 == 0 ? "#EF8E51" : "#8CA5E2";
            letters[i].push({
                    'x': x,
                    'y': y,
                    'letter': letter,
                    'color' : color
            });
        }
    }
}

// Redraw each letter of a letter updating also the color
function redrawLetter(selected, loc, letter){
    var i,
        aux;
    contextLogo.save();
    contextLogo.beginPath();
    contextLogo.arc(loc.x, loc.y, LOGO_MAX_RADIUS, 0, Math.PI*2);
    contextLogo.clip();
    contextLogo.clearRect(0, 0, canvasLogo.width, canvasLogo.height);
    contextLogo.restore();
    contextLogo.beginPath();
    for(i = 0; i < selected.length; i++){
        aux = selected[i];
        contextLogo.fillStyle = aux.color;
        contextLogo.fillText(aux.letter, aux.x, aux.y);
    }
}

// Handler for the logo when the user hover over it
canvasLogo.onmousemove = function(e){
    var loc = windowToCanvas(e.clientX, e.clientY, canvasLogo),
    	selected = [],
        letter_selected,
        distance,
        angle,
        dx,
        dy,
        i,
        aux;
        
    e.preventDefault();
    for(i = 0; i < 8; i++){
        bckgContextLogo.beginPath();
        drawLetterPath(bckgContextLogo, i);
        if(bckgContextLogo.isPointInPath(loc.x, loc.y)){
            letter_selected = i;
            break;
        }
    }
    if(letter_selected !== undefined){
        e.currentTarget.parentNode.style.cursor = "pointer";
        for(i = 0; i < juice[letter_selected]; i++){
        	aux = letters[letter_selected][i];
            distance = dist(aux, loc);
            if(distance < LOGO_MAX_RADIUS){
                // Each 'point letter' of the letter selected is going to move 
            	// out of the radius of action of the pointer
                angle = Math.atan2(aux.y - loc.y, aux.x - loc.x);
                dx = Math.cos(angle) * (LOGO_MAX_RADIUS - distance);
                dy = Math.sin(angle) * (LOGO_MAX_RADIUS - distance);
                aux.x += dx;
                aux.y += dy;
                selected.push(aux);
            }
        }
        redrawLetter(selected, loc, letter_selected);
    } else{
        e.currentTarget.parentNode.style.cursor = "default";
    }
};

// Redraw the logo if the display is 500px maximum
window.onresize = function(e){
    if(window.matchMedia("(max-width: 500px)").matches && LOGO_ZOOM === 1){
        canvasLogo.width = 300;
        canvasLogo.height = 120;
        bckgCanvasLogo.width = canvasLogo.width;
        bckgCanvasLogo.height = canvasLogo.height;
        LOGO_ZOOM = canvasLogo.width / 450;
        juice = [150, 50, 15, 100, 100, 50, 15, 80];
        letters = [[], [], [], [], [], [], [], []];
        LOGO_MAX_RADIUS = 5;
        drawLogo();
    }
    else if(window.matchMedia("(min-width: 500px)").matches && LOGO_ZOOM !== 1){
        canvasLogo.width = 450;
        canvasLogo.height = 180;
        bckgCanvasLogo.width = canvasLogo.width;
        bckgCanvasLogo.height = canvasLogo.height;
        LOGO_ZOOM = 1;
        juice = [300, 100, 40, 200, 200, 100, 40, 160];
        letters = [[], [], [], [], [], [], [], []];
        LOGO_MAX_RADIUS = 10;
        drawLogo();
    }

}

/* Initial setup */
canvasLogo.parentNode.style.cursor = "default";
bckgCanvasLogo.width = canvasLogo.width;
bckgCanvasLogo.height = canvasLogo.height;
drawLogo();
