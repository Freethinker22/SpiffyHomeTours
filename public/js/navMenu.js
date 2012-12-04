// Functions for nav menu on Spiffy Home Tours site

// Global variables
var pageId = new String(); // Holds the page's id after the page loads
var btnArray = new Array(); // Holds references to the nav btn objects
var preArray = new Array(); // Holds the nav btns over states after they're preloaded
var btnArLen = new Number(); // btnArray length
var path = 'public/img/navImgs/'; // Path to the directory with imgs
 
addEvent(window, 'load', loaded, false);

// Registar event listeners and preload over states for the nav btns
function loaded()
{
    pageId = document.body.id; // Set the pageId var after the page loads
    btnArray = document.getElementById('navigation').getElementsByTagName('img'); // Setup the object array for the nav btns
    btnArLen = btnArray.length; // Set the array length var
	
    for(var i = 0; i < btnArLen; i++)
    {
        var currentBtn = btnArray[i];
		
        preArray[i] = new Image(); // Preloads the over states of the nav menu
        preArray[i].src = path + btnArray[i].id + 'Over.png';
		
        addEvent(currentBtn, 'mouseover', navBtnOver, false);
        addEvent(currentBtn, 'mouseout', navBtnOut, false);
    }
	
    // Switchs out appropriate nav btn depending on the page's id for 'you are here' navigation
    switch(pageId)
    {
        case 'homePg':
            btnArray[0].src = preArray[0].src;
            break;
        case 'samplesPg':
            btnArray[1].src = preArray[1].src;
            break;
        case 'pricingPg':
            btnArray[2].src = preArray[2].src;
            break;
        case 'signUpPg':
            btnArray[3].src = preArray[3].src;
            break;
        case 'tutorialsPg':
            btnArray[4].src = preArray[4].src;
            break;
        case 'aboutPg':
            btnArray[5].src = preArray[5].src;
            break;
        case 'contactPg':
            btnArray[6].src = preArray[6].src;
            break;
        default:
            return;
            break;
    }
}

// These two funcs handle the swapping of the over and out events
function navBtnOver(e)
{
    var evtTarget = e.target || e.srcElement; // Handle browser differences
    evtTarget.src = path + evtTarget.id + 'Over.png'; // Remember: Using the keyword 'this' with attachEvent doesn't work due to IE7 and 8 not supporting DOM Level 2
}

function navBtnOut(e)
{
    var evtTarget = e.target || e.srcElement;
	
    if(pageId != evtTarget.id + 'Pg') // Keeps the nav btn of the current page in its over state
    {
        evtTarget.src = path + evtTarget.id + '.png';
    }
}