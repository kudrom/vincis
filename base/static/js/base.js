// Global variables
var toc = document.querySelector("#toc div"),
    content = document.querySelector("#content"),
    search = document.querySelector("li[role='search'] a"),
    overlay = document.querySelector(".overlay"),
    mail = document.querySelector(".contact li"),
    popup = document.querySelector(".pop-up");

// Handler for the table of contents
function handlerToc(e){
    var dy = (window.pageYOffset || document.body.scrollTop);
    if (window.matchMedia("(min-width: 1024px)").matches){
        if (dy > 220 + content.offsetHeight - toc.offsetHeight){
            toc.style.position = "relative";
            toc.style.top = (content.offsetHeight - toc.offsetHeight -20) + "px";
        } else if (dy >= 220){
            toc.style.position = "fixed";
            toc.style.top = "32px";
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

// Handlers for the search box
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

/* Initial setup */
if(toc){
    toc.style.position = "static";
    window.onscroll = handlerToc;
}

mail.onclick = showPopup;
