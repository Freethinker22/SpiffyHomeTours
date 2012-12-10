// Functions for the password reset page and form validation *** Revise later: functions like validate, checkForNull, checkRegEx, etc could all be abstracted into one validation file ***

addEvent(window, 'load', init, false);

// Object to access the input fields to keep from repeating document.getElementById('inputId')
function InputsObj()
{
    this.txtOldPass = document.getElementById('txtOldPass');
    this.txtNewPass = document.getElementById('txtNewPass');
    this.txtNewPassConf = document.getElementById('txtNewPassConf');
    this.oldPass = document.getElementById('oldPass');
    this.newPass = document.getElementById('newPass');
    this.newPassConf = document.getElementById('newPassConf');
}

function init() 
{   
    document.getElementById('oldPass') ? changePassFields('init') : changePassFieldsEmail('init'); // Determine which function to call based on where the user accessed the page
    addEvents();
}

// Change the password input fields to their readable counterparts 
// Note: If JS is disabled, the password fields are still of type password because the CSS initially hides the password inputs of type text
function changePassFields(action)
{
    var inputs = new InputsObj();
	
    switch(action) // *** Note: All of this code will be unnecessary whenever IE8 goes away. Once that happens, remove the duplicate input tag in the HTML and use: evtTarget.type = 'text' or 'password' ***
    {
        case 'init':
            if(inputs.oldPass.value == '' || inputs.newPass.value == '' || inputs.newPassConf.value == '') // Keep the password fields from being replaced with the password txt fields if there is a value in them and the page is redisplayed
            {
                inputs.txtOldPass.style.display = 'inline';
                inputs.txtNewPass.style.display = 'inline';
                inputs.txtNewPassConf.style.display = 'inline';
                inputs.oldPass.style.display = 'none';
                inputs.newPass.style.display = 'none';
                inputs.newPassConf.style.display = 'none';
            }
            break;
        case 'txtOldPassToOldPass':
            inputs.txtOldPass.style.display = 'none';
            inputs.oldPass.style.display = 'inline';
            inputs.oldPass.focus();
            break;
        case 'oldPassToTxtOldPass':
            inputs.oldPass.style.display = 'none';
            inputs.txtOldPass.style.display = 'inline';
            break;
        case 'txtNewPassToNewPass':
            inputs.txtNewPass.style.display = 'none';
            inputs.newPass.style.display = 'inline';
            inputs.newPass.focus();
            break;
        case 'newPassToTxtNewPass':
            inputs.newPass.style.display = 'none';
            inputs.txtNewPass.style.display = 'inline';
            break;
        case 'txtNewPassConfToNewPassConf':
            inputs.txtNewPassConf.style.display = 'none';
            inputs.newPassConf.style.display = 'inline';
            inputs.newPassConf.focus();
            break;
        case 'newPassConfToTxtNewPassConf':
            inputs.newPassConf.style.display = 'none';
            inputs.txtNewPassConf.style.display = 'inline';
            break;
    }
}

// Same as other change pass field function but only for the reset page linked to from the forgot password email. Revise later: might be a way to combine the two change pass functions?
function changePassFieldsEmail(action)
{
    var inputs = new InputsObj();
	
    switch(action) // *** Note: All of this code will be unnecessary whenever IE8 goes away. Once that happens, remove the duplicate input tag in the HTML and use: evtTarget.type = 'text' or 'password' ***
    {
        case 'init':
            if(inputs.newPass.value == '' || inputs.newPassConf.value == '') // Keep the password fields from being replaced with the password txt fields if there is a value in them and the page is redisplayed
            {
                inputs.txtNewPass.style.display = 'inline';
                inputs.txtNewPassConf.style.display = 'inline';
                inputs.newPass.style.display = 'none';
                inputs.newPassConf.style.display = 'none';
            }
            break;
        case 'txtNewPassToNewPass':
            inputs.txtNewPass.style.display = 'none';
            inputs.newPass.style.display = 'inline';
            inputs.newPass.focus();
            break;
        case 'newPassToTxtNewPass':
            inputs.newPass.style.display = 'none';
            inputs.txtNewPass.style.display = 'inline';
            break;
        case 'txtNewPassConfToNewPassConf':
            inputs.txtNewPassConf.style.display = 'none';
            inputs.newPassConf.style.display = 'inline';
            inputs.newPassConf.focus();
            break;
        case 'newPassConfToTxtNewPassConf':
            inputs.newPassConf.style.display = 'none';
            inputs.txtNewPassConf.style.display = 'inline';
            break;
    }
}

// Add event handlers to the input fields
function addEvents()
{
    var inputAr = document.getElementById('passResetForm').getElementsByTagName('input'); // Array of the input elements
    var inputArLen = inputAr.length;
    
    for(var i = 0; i < inputArLen; i++)
    {
        if(inputAr[i].type == 'text' || inputAr[i].type == 'password') // Assign listeners and attribute flags only to those fields that are text boxes
        {
            addEvent(inputAr[i], 'focus', fieldFocus, false);
            addEvent(inputAr[i], 'blur' , fieldBlur, false);
            inputAr[i].error = false; // Create new flag attribute, used to tell if an error message is on
			
            if(inputAr[i].value == inputAr[i].title)
            {
                inputAr[i].className = 'defaultText'; // If the field has text in it by default, change the color of the text to light gray
            }
        }
    }
}

// Clears the default field values and removes the error message if its showing, also changes the password field over to type password if its in focus
function fieldFocus(e)
{
    var evtTarget = e.target || e.srcElement; // Handle browser differences
    
    if(evtTarget.value == evtTarget.title)
    {
        evtTarget.value = ''; // Clear field's initial value
        removeEvent(evtTarget, 'focus', fieldFocus, false); // Removes focus listener to keep subsequent focuses from clearing entered data
        evtTarget.className = ''; // Remove the defaultText class to make the user entered text black
    }
	
    if(evtTarget.error) // If error message is showing, remove message and reset flag attribute
    {
        var parentObj = evtTarget.parentNode; // Reference to error message parent element
        parentObj.removeChild(parentObj.getElementsByTagName('p')[0]); // Removes error p tag if it exists in the parent element	
        evtTarget.error = false; // Reset flag attribute
    }
    
    // Swap out the readable text field for a password typed field
    switch(evtTarget.id)
    {
        case 'txtOldPass':
            changePassFields('txtOldPassToOldPass');
            break;
        case 'txtNewPass':
            changePassFields('txtNewPassToNewPass');
            break;
        case 'txtNewPassConf':
            changePassFields('txtNewPassConfToNewPassConf');
            break;
    }
}

// Resets the fields inital values if they're empty on blur
function fieldBlur(e)
{
    var evtTarget = e.target || e.srcElement;
	
    if(evtTarget.value == '')
    {
        evtTarget.value = evtTarget.title; // Reset default text value to input tag's title
        addEvent(evtTarget, 'focus', fieldFocus, false); // Re-add event listener so initial value will be removed when refocused
        evtTarget.className = 'defaultText'; // Reset the color of the default text to light gray
        
        // Switch back to showing the password field with readable text
        switch(evtTarget.id)
        {
            case 'oldPass':
                changePassFields('oldPassToTxtOldPass');
                break;
            case 'newPass':
                changePassFields('newPassToTxtNewPass');
                break;
            case 'newPassConf':
                changePassFields('newPassConfToTxtNewPassConf');
                break;
        }
    }
}

// Called by the reset btn, checks which reset page is being used, and validates the form
function checkFormStatus()
{
    var inputs = new InputsObj();
    var valNewPass = checkInput(inputs.newPass);
    var valNewPassConf = confirmVals(inputs.newPass, inputs.newPassConf);
	
    if(inputs.oldPass) // If the old password field is present
    {
        var valOldPass = checkInput(inputs.oldPass);
        return valOldPass && valNewPass && valNewPassConf ? true : false;
    }
    else
    {
        return valNewPass && valNewPassConf ? true : false;
    }
}

// Depending on the field ID, validate with the correct regular expression *** Remember: these RegExs exactly match the ones in the PHP validator ***
function checkInput(evtTarget)
{
    var regEx;
    
    switch(evtTarget.id)
    {
        case 'oldPass':
        case 'newPass':
            regEx = /^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/;
            return checkPassword(evtTarget, regEx);
            break;
    }
}

// Check to see if two fields match
function confirmVals(firstVal, secVal)
{
    if(checkForNull(secVal)) // secVal must be the confirm field value
    {
        if(firstVal.value != secVal.value)
        {
            if(!secVal.error)
            {
                errMsg(secVal, 'Doesn\'t Match'); 
            }
            return false;
        }
        else
        {
            return true;
        }
    }
    else
    {
        return false;
    }
}

// Check function specifically for the password field
function checkPassword(evtTarget, regEx)
{
    if(checkForNull(evtTarget))
    {
        if(evtTarget.value.length < 8)
        {
            if(!evtTarget.error)
            { 
                errMsg(evtTarget, 'Too Short');
            }
            return false;
        }
        else
        {
            return checkRegEx(evtTarget, regEx);	
        }
    }
    else
    {
        return false;
    }
}

function checkForNull(evtTarget)
{
    if(evtTarget.value == '' || evtTarget.value == evtTarget.title)
    {
        if(!evtTarget.error) // If the error message is on, don't create another one
        {
            errMsg(evtTarget, 'Required');
        }
        return false;
    }
    else
    {
        return true;
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
	
    var parentObj = document.getElementById(evtTarget.id).parentNode; // Reference to field's parent element
    var errElem = document.createElement('p'); // Create container for error message
    var errText = document.createTextNode(msg); // Create error message
	
    errElem.appendChild(errText); // Put error message in container
    errElem.setAttribute('class', 'errLabel'); // Set the error message style
    parentObj.appendChild(errElem); // Put the container in the parent element
    addEvent(evtTarget, 'focus', fieldFocus, false); // Re-assign the focus listener so the error message is removed when refocused	
    evtTarget.error = true; // Set error flag var to prevent multiple errors from being displayed
}