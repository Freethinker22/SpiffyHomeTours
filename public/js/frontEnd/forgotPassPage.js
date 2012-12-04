// Functions for the forgot password page and form validation *** Revise later: functions like validate, checkForNull, checkRegEx, etc could all be abstracted into one validation file ***

addEvent(window, 'load', init, false);

function init()
{
    var email = document.getElementById('email');
	
    email.focus(); // *** Revise later: this throws an error when alertPassConfirm is displayed on the page because the email input does not exist when the alert is showing ***
    email.error = false; // Create new flag attribute, used to tell if an error message is on
}

// Called by the login btn, validates the form by calling the check functions
function checkFormStatus()
{
    var valEmail = checkInput(document.getElementById('email'));
	
    if(valEmail)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// Depending on the field ID, call the validate function with the correct regular expression *** Remember: these RegExs exactly match the ones in the PHP validator ***
function checkInput(evtTarget)
{
    var regEx = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
    return validate(evtTarget, regEx);
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

// Check the evetTarget value to see if the user entered a value
function checkForNull(evtTarget)
{
    if(evtTarget.value != '')
    {
        return true;
    }
    else
    {
        if(!evtTarget.error) // If the error message is on, don't create another one
        {
            errMsg(evtTarget, 'Required');
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

// Creates a default error message next to the target field unless a different one is given
function errMsg(evtTarget, msg)
{
    if(msg == null)
    {
        msg = 'Invalid Entry';
    }
	
    var labelObj = document.getElementById(evtTarget.id).parentNode.getElementsByTagName('label'); // Reference to field's label element
    var errElem = document.createElement('p'); // Create container for error message
    var errText = document.createTextNode(msg); // Create error message
	
    errElem.appendChild(errText); // Put error message in container
    errElem.setAttribute('class', 'errLabel'); // Set the error message style
    labelObj[0].appendChild(errElem); // Put the error message in the label element. [0] is there because getElementsByTagName returns an array and there is only 1 label element per evtTarget
    addEvent(evtTarget, 'focus', fieldFocus, false); // Assign a focus listener so error message is removed when refocused	
    evtTarget.error = true; // Set error flag var to prevent multiple errors from being displayed
}

// Removes the error message if on is present
function fieldFocus(e)
{
    var evtTarget = e.target || e.srcElement; // Handle browser differences
	
    if(evtTarget.error) // If error message is showing, remove message and reset flag attribute
    {
        var labelObj = document.getElementById(evtTarget.id).parentNode.getElementsByTagName('label'); // Reference to field's label element
        labelObj[0].removeChild(labelObj[0].getElementsByTagName('p')[0]); // Removes error p tag if it exists in the label element
        removeEvent(evtTarget, 'focus', fieldFocus, false); // Removes focus listener
        evtTarget.error = false; // Reset flag attribute
    }	
}