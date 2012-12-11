// Functions for the under construction page and form validation

addEvent(window, 'load', init, false);

// Object to access the input fields to keep from repeating document.getElementById('inputId')
function InputsObj()
{
    this.email = document.getElementById('notifyEmail');
}

function init()
{
    var inputs = new InputsObj();
    inputs.email.className = 'defaultText';
    addEvent(inputs.email, 'focus', fieldFocus, false);
    addEvent(inputs.email, 'blur' , fieldBlur, false);
}

// Clears the default field values and removes the error msgs if they're showing
function fieldFocus(e)
{
    var evtTarget = e.target || e.srcElement; // Handle browser differences
    
    if(evtTarget.value == evtTarget.title)
    {
        evtTarget.value = ''; // Clear field's initial value
        evtTarget.className = ''; // Remove the defaultText class to make the user's text black
    }
	
    if(evtTarget.error) // If error msg is showing, remove msg and reset flag attribute
    {
        var errorContainer = document.getElementById('errorContainer'); // Reference to error msg error container
        errorContainer.removeChild(document.getElementById('errorMsg')); // Removes error msg if it exists in the parent element
        removeEvent(evtTarget, 'focus', fieldFocus, false); // Removes focus listener to keep subsequent focuses from clearing entered data
        evtTarget.error = false; // Reset flag attribute
    }
}

// Resets the fields inital values if they're empty on blur
function fieldBlur(e)
{
    var evtTarget = e.target || e.srcElement;
	
    if(evtTarget.value == '')
    {
        evtTarget.value = evtTarget.title; // Reset default text value to input tag's title
        evtTarget.className = 'defaultText'; // Reset the color of the default text to light gray
        addEvent(evtTarget, 'focus', fieldFocus, false); // Reassign focus listener so the error msg is removed when refocused
    }
}

// Called by the notify btn
function checkFormStatus()
{
    var inputs = new InputsObj();
    var val = new ValObj('dynamic');
    
    var valEmail = val.validate(inputs.email, val.EMAIL, true);
    return valEmail ? true : false;
}

// Creates a default error msg unless a different one is given
function errMsg(evtTarget, msg)
{
    if(msg == null)
    {
        msg = 'Invalid Entry';
    }
        
    var errorContainer = document.getElementById('errorContainer'); // Reference to error msg error container
    var errElem = document.createElement('p'); // Create container for error msg
    var errText = document.createTextNode(msg); // Create error msg
	
    errElem.appendChild(errText); // Put error msg in container
    errElem.setAttribute('class', 'errLabel'); // Set the error msg style
    errElem.setAttribute('id', 'errorMsg'); // Set the id of the error msg element so it can be removed in fieldFocus
    errorContainer.appendChild(errElem);// Put the error msg on the screen
    addEvent(evtTarget, 'focus', fieldFocus, false); // Reassign a focus listener so error msg is removed when refocused	
    evtTarget.error = true; // Set error flag var to prevent multiple errors from being displayed
}