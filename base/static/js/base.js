// Global variables
var toc = document.querySelector("#toc div"),
    content = document.querySelector("#content"),
    search = document.querySelector("li[role='search'] form"),
    mag_glass = document.querySelector("li[role='search'] i"),
    overlay = document.querySelector(".overlay"),
    mail = document.querySelector(".contact li"),
    popup = document.querySelector(".pop-up");

// Handler for the table of contents
function handlerToc(e){
    var dy = (window.pageYOffset || document.body.scrollTop);
    if (window.matchMedia("(min-width: 1024px)").matches){
    	toc.style.width = "100%"
        if (dy > 220 + content.offsetHeight - toc.offsetHeight){
            toc.style.position = "relative";
            toc.style.top = (content.offsetHeight - toc.offsetHeight -20) + "px";
        } else if (dy >= 220){
            toc.style.position = "fixed";
            toc.style.top = "32px";
            toc.style.width = "30%"
        } else if (dy < 220){
            toc.style.position = "static";
        }
    }
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

/* Initial setup */

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

if(toc){
    toc.style.position = "static";
    toc.style.width = "100%";
    window.onscroll = handlerToc;
}

mail.onclick = showPopup;

if(window.location.pathname.split("/")[1] == "buscar"){
	var aux, aux2, i;
	aux = window.location.href.split("?");
	if(aux.length == 2){
		aux = aux[1].split("&")
		for(i = 0; i < aux.length; i++){
			aux2 = aux[i].split("=");
			if(aux2[0] == "q"){
				search.classList.add("edited");
				search.children[0].style.width = "150px";
				search.children[0].value = decodeURI(aux2[1])
			}
		}
	}
}
