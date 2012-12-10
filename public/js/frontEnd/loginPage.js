// Functions for the login page and form validation *** Revise later: functions like validate, checkForNull, checkRegEx, etc could all be abstracted into one validation file ***

addEvent(window, 'load', init, false);

// Object to access the input fields to keep from repeating document.getElementById('inputId')
function InputsObj()
{
    this.email = document.getElementById('email');
    this.password = document.getElementById('password');
}

function init()
{
    var inputs = new InputsObj();
    inputs.email.focus();
    inputs.email.error = false; // Create new flag attribute, used to tell if an error message is on *** Revise later: don't really need to set these vars here, just create them in the error handler if needed ***
    inputs.password.error = false;
}

// Called by the login btn, validates the form by calling the check functions
function checkFormStatus()
{
    var inputs = new InputsObj();
    var valEmail = checkInput(inputs.email);
    var valPassword = checkInput(inputs.password);
	
    return valEmail && valPassword ? true : false;
}

// Depending on the field ID, validate with the correct regular expression *** Remember: these RegExs exactly match the ones in the PHP validator ***
function checkInput(evtTarget)
{
    var regEx;
    
    switch(evtTarget.id)
    {
        case 'email':
            regEx = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
            return validate(evtTarget, regEx);
            break;
        case 'password':
            regEx = /^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/;
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