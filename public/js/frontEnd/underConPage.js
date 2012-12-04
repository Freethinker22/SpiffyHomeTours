// Functions for the under construction page and form validation *** Revise later: functions like validate, checkForNull, checkRegEx, etc could all be abstracted into one validation file ***

addEvent(window, 'load', init, false);

function init()
{
    var email = document.getElementById('notifyEmail');
	
    email.className = 'defaultText'; // *** Revise later: This throws an error when the thank you msg is displayed, because the email input does not exist when the msg is showing ***
    addEvent(email, 'focus', fieldFocus, false);
    addEvent(email, 'blur' , fieldBlur, false);
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

// Called by the notify btn, validates the form by calling the check functions
function checkFormStatus()
{
    var valEmail = checkInput(document.getElementById('notifyEmail'));
    return valEmail ? true : false;
}

// Depending on the field ID, validate with the correct regular expression *** Remember: these RegExs exactly match the ones in the PHP validator ***
function checkInput(evtTarget)
{
    var regEx;
    
    switch(evtTarget.id)
    {
        case 'notifyEmail':
            regEx = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
            return validate(evtTarget, regEx);
            break;
    }
}

// Check the validity of the fields
function validate(evtTarget, regEx)
{
    if(checkForNull(evtTarget))
    {
        return checkRegEx(evtTarget, regEx);
    }
    else
    {
        return false;
    }
}

// If the field is empty or its value is equal to its default text, show required msg
function checkForNull(evtTarget)
{
    
    if(evtTarget.value != '' && evtTarget.value != evtTarget.title)
    {
        return true;
    }
    else
    {
        if(!evtTarget.error) // If the error msg is on, don't create another one
        {
            errMsg(evtTarget, 'An e-mail address is required');
            addEvent(evtTarget, 'focus', fieldFocus, false); // Reassign focus listener so the error msg is removed when refocused
        }
        return false;
    }
}

// Check the evtTarget value against the regular expression
function checkRegEx(evtTarget, regEx)
{
    if(regEx.test(evtTarget.value))
    {
        return true;
    }
    else
    {
        if(!evtTarget.error)
        {
            errMsg(evtTarget);
        }
        return false;
    }
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