// Functions for the sign up page and form validation *** Revise later: functions like validate, checkForNull, checkRegEx, etc could all be abstracted into one validation file ***

addEvent(window, 'load', init, false);

// Object to access the input fields to keep from repeating document.getElementById('inputId')
function InputsObj()
{
    this.firstName = document.getElementById('firstName');
    this.lastName = document.getElementById('lastName');
    this.phone = document.getElementById('phone');
    this.compName = document.getElementById('compName');
    this.website = document.getElementById('website');
    this.email = document.getElementById('email');
    this.emailConf = document.getElementById('emailConf');
    this.password = document.getElementById('password');
    this.txtPassword = document.getElementById('txtPassword');
    this.passwordConf = document.getElementById('passwordConf');
    this.txtPasswordConf = document.getElementById('txtPasswordConf');
    this.subType = document.getElementById('subType');
    this.subTypeAr = document.getElementById('subType').getElementsByTagName('input');
    this.findType = document.getElementById('findType');
    this.findTypeAr = document.getElementById('findType').getElementsByTagName('input');
    this.tos = document.getElementById('tos');
    this.foundByOther = document.getElementById('foundByOther');
}

function init()
{
    changePassFields('init');
    addEvents();
}

// Swap the password input fields to their readable counterparts, this is so if JS is disabled, the password fields are still of type password
function changePassFields(action)
{
    var inputs = new InputsObj();
	
    switch(action) // *** Note: All of this code will be unnecessary whenever IE8 goes away. Once that happens, remove the duplicate input tag in the HTML and use: evtTarget.type = 'text' ***
    {
        case 'init':
            if(inputs.password.value == '' || inputs.passwordConf.value == '') // Keep the password fields from being replaced with the password txt fields if there is a value in them and the page is redisplayed
            {
                inputs.txtPassword.style.display = 'inline';
                inputs.txtPasswordConf.style.display = 'inline';
                inputs.password.style.display = 'none';
                inputs.passwordConf.style.display = 'none';
            }
            break;
        case 'txtPassToPass':
            inputs.txtPassword.style.display = 'none';
            inputs.password.style.display = 'inline';
            inputs.password.focus();
            break;
        case 'passToTxtPass':
            inputs.txtPassword.style.display = 'inline';
            inputs.password.style.display = 'none';
            break;
        case 'txtConfToConf':
            inputs.txtPasswordConf.style.display = 'none';
            inputs.passwordConf.style.display = 'inline';
            inputs.passwordConf.focus();
            break;
        case 'confToTxtConf':
            inputs.txtPasswordConf.style.display = 'inline';
            inputs.passwordConf.style.display = 'none';
            break;
    }
}

// Add event handlers to input fields
function addEvents()
{
    var inputs = new InputsObj();
    var inputAr = document.getElementById('signUpForm').getElementsByTagName('input'); // Array of the input elements
    var inputArLen = inputAr.length;
	
    addEvent(inputs.foundByOther, 'focus', otherFieldHandler, false); // Add focus event to the 'other' field
    addEvent(inputs.findType, 'change', clearOtherField, false); // Add listener to clear the 'other' field if text is present when a radio btn gets checked
		
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

// Clears the default field values and removes the error messages if they're showing, also changes the password field over to type password if its in focus
function fieldFocus(e)
{
    var evtTarget = e.target || e.srcElement; // Handle browser differences
	
    if(evtTarget.error) // If error message is showing, remove message and reset flag attribute
    {
        var parentObj = evtTarget.parentNode; // Reference to error message parent element
        parentObj.removeChild(parentObj.getElementsByTagName('p')[0]); // Removes error p tag if it exists in the parent element	
        removeEvent(evtTarget, 'focus', fieldFocus, false); // Removes focus listener to keep subsequent focuses from clearing entered data
        evtTarget.error = false; // Reset flag attribute
    }
    else
    {		
        if(evtTarget.value == evtTarget.title)
        {
            evtTarget.value = ''; // Clear field's initial value
            removeEvent(evtTarget, 'focus', fieldFocus, false); // Removes focus listener after initial focus to keep subsequent focuses from clearing entered data
            evtTarget.className = ''; // Remove the defaultText class to make the user entered text black
        }
        if(evtTarget.title != '') // Only fields that're required have a title used for default text replacement, this statment avoids errors created by fields w/o the required span element
        {
            if(evtTarget.parentNode.getElementsByTagName('span')[0].className == 'reqError') // If 'required' is highlighted because of an error, un-highlight it
            {
                reqErrOff(evtTarget); // Change the span's class back to normal un-highlighted text
            }
        }	
		
        if(evtTarget.id == 'txtPassword') // Swap out the readable text field for a password typed field
        {
            changePassFields('txtPassToPass');
        }
        if(evtTarget.id == 'txtPasswordConf')
        {
            changePassFields('txtConfToConf');
        }
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
		
        if(evtTarget.id == 'password') // Switch back to showing the password field with readable text
        {
            changePassFields('passToTxtPass');
        }
        if(evtTarget.id == 'passwordConf')
        {
            changePassFields('confToTxtConf');
        }
    }
}

// Called by next step btn, validates the form by calling the check functions
function checkFormStatus()
{
    var inputs = new InputsObj();
    var valFirstName = checkInput(inputs.firstName);
    var valLastName = checkInput(inputs.lastName);
    var valPhoneNum = checkInput(inputs.phone);
    var valCompName = checkInput(inputs.compName);
    var valWebsite = checkInput(inputs.website);
    var valEmail = checkInput(inputs.email);
    var valEmailConf = confirmVals(inputs.email, inputs.emailConf);
    var valPassword = checkInput(inputs.password);
    var valPasswordConf = confirmVals(inputs.password, inputs.passwordConf);
    var valSubType = checkFirstRadGrp(inputs.subType);
    var valFindType = checkSecRadGrp(inputs.findType);
    var valTos = checkTos(inputs.tos);
    var valFoundByOther = checkInput(inputs.foundByOther);
    
    // If all the check functions return true, allow the form to submit
    return valFirstName && valLastName && valPhoneNum && valCompName && valWebsite && valEmail && valEmailConf && valPassword && valPasswordConf && valSubType && valFindType && valTos && valFoundByOther ? true : false;
}

// Depending on the field ID, validate with the correct regular expression *** Remember: these RegExs exactly match the ones in the PHP validator ***
function checkInput(evtTarget)
{
    var regEx;
    
    switch(evtTarget.id)
    {
        case 'firstName':
        case 'lastName':
            regEx = /^[A-Za-z'\-\.\s]{1,50}$/; // *** Revise later: could prevent the usage of multiple spaces in a row ***
            return validate(evtTarget, regEx, true);
            break;
        case 'phone':
            regEx = /^(([0-9\-\.\/+()]+)\s?((ext|EXT|Ext|ex|EX|Ex|x|X):?\.?\s?)?){7,25}$/; // *** Revise later: could prevent the usage of multiple special characters in a row ***
            return validate(evtTarget, regEx, true);
            break;
        case 'compName':
        case 'foundByOther':
            regEx = /^[A-Za-z0-9\-\.\/?!'\"\@#%^&*()_\s]{1,50}$/;
            return validate(evtTarget, regEx);
            break;
        case 'website':
            regEx = /^((http|https|ftp):\/\/)?([\w\-]+)\.([\w\-]+)([\w\-\.\/]*)?\/?$/; // *** Revise later: could prevent the usage of multiple periods and slashes in a row, input field length too.  Remember to update the PHP regex ***
            return validate(evtTarget, regEx);
            break;
        case 'email':
            regEx = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
            return validate(evtTarget, regEx, true);
            break;
        case 'password':
            regEx = /^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/;
            return checkPassword(evtTarget, regEx);
            break;
    }
}

// Check the validity of required and non-required fields
function validate(evtTarget, regEx, required)
{
    if(required)
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
    else // If not required
    {
        if(evtTarget.value != '')
        {
            return checkRegEx(evtTarget, regEx);
        }
        else
        {
            return true; // Return true even if non-required field is still empty
        }
    }
}

// Check the evetTarget value against the regular expression
function checkRegEx(evtTarget, regEx)
{
    if(regEx.test(evtTarget.value))
    {
        return true;
    }
    else
    {
        if(!evtTarget.error) // If the error message is on, don't create another one
        {
            errMsg(evtTarget);
        }
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

// Checks to see if a radio button in the 'Subscription type' section is checked
function checkFirstRadGrp(evtTarget)
{	
    var inputs = new InputsObj();
    
    if(loopRadBtns(inputs.subTypeAr))
    {
        return true;
    }
    else
    {
        reqErrOn(evtTarget);
        addEvent(evtTarget, 'change', function(){
            reqErrOff(evtTarget);
        }, false); // Assign listener so error message is removed on form change or focus
        return false;
    }
}

// Checks to see if a radio button in the 'How did you find us' section is checked
function checkSecRadGrp(evtTarget)
{	
    var inputs = new InputsObj();
    
    if(loopRadBtns(inputs.findTypeAr) || inputs.foundByOther.value != '')
    {
        return true;
    }
    else
    {
        reqErrOn(evtTarget);
        addEvent(evtTarget, 'change', function(){
            reqErrOff(evtTarget);
        }, false);
        addEvent(inputs.foundByOther, 'focus', function(){
            reqErrOff(evtTarget);
        }, false);
        return false;
    }
}

// Uncheck the radio btns in the 'How did you find us' section if the 'other' field gains focus
function otherFieldHandler()
{
    var inputs = new InputsObj();
    var radioGrpArLen = inputs.findTypeAr.length;
	
    for(var i = 0; i < radioGrpArLen; i++)
    {
        if(inputs.findTypeAr[i].checked)
        {
            inputs.findTypeAr[i].checked = false;
        }
    }
}

// Clears the 'other' field if a radio btn in the 'How did you find us' section gets checked while there's still text in the field
function clearOtherField()
{
    var inputs = new InputsObj();
    
    if(loopRadBtns(inputs.findTypeAr))
    {
        inputs.foundByOther.value = '';	
    }
}

// Check to see if the terms of service checkbox is checked
function checkTos(evtTarget)
{
    if(!evtTarget.checked)
    {
        reqErrOn(evtTarget);
        addEvent(evtTarget, 'focus', function(){
            reqErrOff(evtTarget);
        }, false); // Assign listener to turn off the error once the TOS box gets checked *** Revise later: not working in Chrome and Safari, not even calling event? ***
        return false;
    }
    else
    {
        return true;
    }
}

// If the field is empty or its value is equal to its default text, change the required note in the span tag to red using CSS class, if not return ture
function checkForNull(evtTarget)
{
    if(evtTarget.value == '' || evtTarget.value == evtTarget.title)
    {
        reqErrOn(evtTarget);
        addEvent(evtTarget, 'focus', fieldFocus, false); // Re-assign focus listener so error message is removed when refocused
        return false;
    }
    else
    {
        return true;
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

// Changes the class on to highlight required fields
function reqErrOn(evtTarget)
{
    if(evtTarget.id == 'tos')
    {
        evtTarget.parentNode.className = 'tosErr'; // Highlights the parent div of the TOS checkbox
    }
    else
    {
        var spanObj = evtTarget.parentNode.getElementsByTagName('span')[0]; // Reference to the target's span element
        spanObj.className = 'reqError';
    }
}

// Turns off the highlights on required fields
function reqErrOff(evtTarget)
{
    if(evtTarget.id == 'tos')
    {
        evtTarget.parentNode.className = ''; // Un-highlights the parent div of the TOS checkbox
    }
    else
    {
        var spanObj = evtTarget.parentNode.getElementsByTagName('span')[0];
        spanObj.className = 'required';
    }
}

// Loops through btn array and returns true if one of the radio buttons is checked
function loopRadBtns(btnGrp)
{
    var btnGrpLen = btnGrp.length;
	
    for(var i = 0; i < btnGrpLen; i++)
    {
        if(btnGrp[i].checked)
        {
            return true;
        }
    }
    return false;
}