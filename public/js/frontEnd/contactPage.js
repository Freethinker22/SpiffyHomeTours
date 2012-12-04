// Functions for the contact page and form validation *** Revise later: functions like validate, checkForNull, checkRegEx, etc could all be abstracted into one validation file ***

// Global variables
var sendRequest = createRequest(); // Request object used in form submission

addEvent(window, 'load', init, false);

function init()
{
    var sendingImg = new Image();
    sendingImg.src = 'public/img/sending.gif'; // Preload img
    addEvents();
}

// Register event listeners, and setup flag attributes. If this function is called due to event rebinding, there is no need reload the processing graphic, hence the separate functions	
function addEvents()
{
    var inputAr = [document.getElementById('fullName'), document.getElementById('email'), document.getElementById('subject'), document.getElementById('message')]; // Array of input fields
    var inputArLen = inputAr.length;
	
    addEvent(document.getElementById('sendBtn'), 'click', checkFormStatus, false);
	
    for(var i = 0; i < inputArLen; i++)
    {
        addEvent(inputAr[i], 'focus', fieldFocus, false);
        addEvent(inputAr[i], 'blur', fieldBlur, false);
        inputAr[i].error = false; // Create new flag attribute, used to tell if an error message is present
		
        if(inputAr[i].value == inputAr[i].title) // Set the color of the default text to light gray if the default text is still showing
        {
            inputAr[i].className = 'defaultText';
        }
    }
}

// Clears the default field values and removes the error messages if they're showing
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
        if(evtTarget.value == evtTarget.title) // Check if field still has its initial value
        {
            evtTarget.value = ''; // Clear field's initial value
            removeEvent(evtTarget, 'focus', fieldFocus, false); // Removes focus listener after initial focus to keep subsequent focuses from clearing entered data
            evtTarget.className = ''; // Remove the defaultText class to make the user entered text black
        }
        if(evtTarget.parentNode.getElementsByTagName('span')[0].className == 'reqError') // If 'required' is highlighted because of an error, un-highlight it
        {
            reqErrOff(evtTarget); // Change the span's class back to normal un-highlighted text
        }
    }
}

// Resets the fields inital values if they're empty on blur
function fieldBlur(e)
{
    var evtTarget = e.target || e.srcElement;
	
    if(evtTarget.value == '')
    {
        evtTarget.value = evtTarget.title; // Reset initial value to input tag's title
        addEvent(evtTarget, 'focus', fieldFocus, false); // Re-add event listener so initial value will be removed when refocused
        evtTarget.className = 'defaultText'; // Reset the color of the default text to light gray
    }
}

// Called by send btn, validates the form by calling the check functions and if they're good, calls sendForm()
function checkFormStatus()
{
    var validName = checkInput(document.getElementById('fullName'));
    var validEmail = checkInput(document.getElementById('email'));
    var validSubject = checkInput(document.getElementById('subject'));
    var validMessage = checkInput(document.getElementById('message'));
	
    if(validName && validEmail && validSubject && validMessage)
    {
        sendForm(); // If all the check functions return true, allow the form to submit
    }
}

// Depending on the field ID, call the validate function with the correct regular expression *** Remember: these RegExs exactly match the ones in the PHP validator ***
function checkInput(evtTarget)
{
    switch(evtTarget.id)
    {
        case 'fullName':
            var regEx = /^[A-Za-z'\-\.\s]{1,50}$/; // *** Revise later: could prevent the usage of multiple spaces in a row ***
            return validate(evtTarget, regEx, true);
            break;
        case 'email':
            var regEx = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
            return validate(evtTarget, regEx, true);
            break;
        case 'subject':
            var regEx = /^[A-Za-z0-9\-\.\/?!'\"\@#$%^&*()_\s]{1,50}$/;
            return validate(evtTarget, regEx, true);
            break;
        case 'message':
            return checkForNull(evtTarget); // The message is sanitized in the PHP form handler
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
    addEvent(evtTarget, 'focus', fieldFocus, false); // Re-assign focus listener so error message is removed when refocused	
    evtTarget.error = true; // Set error flag var to prevent multiple errors from being displayed
}

// Changes the class on to highlight required fields
function reqErrOn(evtTarget)
{
    var spanObj = evtTarget.parentNode.getElementsByTagName('span')[0]; // Reference to the target's span element
    spanObj.className = 'reqError';
}

// Turns off the highlights on required fields
function reqErrOff(evtTarget)
{
    var spanObj = evtTarget.parentNode.getElementsByTagName('span')[0];
    spanObj.className = 'required';
}

// Send the form to the server with user input data
function sendForm()
{
    if(sendRequest == null)
    {
        alert('Oops! It seems there was an connection error, please try again.');
    }
    else
    {
        var url = 'ajaxRouter.php?ajaxCon=ContactForm';
        var nameValue = escape(document.getElementById('fullName').value); // Get the fields' values and append them to the url that is sent to the server
        var emailValue = escape(document.getElementById('email').value);
        var subjectValue = escape(document.getElementById('subject').value);
        var messageValue = escape(document.getElementById('message').value);
        var loadTimeValue = escape(document.getElementById('loadTime').value);
        var requestData = 'name=' + nameValue + '&email=' + emailValue + '&subject=' + subjectValue + '&message=' + messageValue + '&loadTime=' + loadTimeValue;
		
        sendRequest.onreadystatechange = msgReceived;
        sendRequest.open('POST', url, true);
        sendRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // Needed to un-encode POST requests
        sendRequest.send(requestData);
        msgSending();
    }
}

// Display sending graphic while waiting on server
function msgSending()
{
    var leftCol = document.getElementById('leftCol'); // Reference to the left column of the contact page
    var contactForm = document.getElementById('contactForm'); // Reference to the contact form
    var imgDiv = document.createElement('div'); // Container for the sending img
    var sendImg = document.createElement('img'); // Img element to hold the sending img
    var msgPara = document.createElement('p'); // Container for the sending message
    var sendMsg = document.createTextNode('Sending Message...'); // The text for the sending message
			
    leftCol.removeChild(contactForm); // Remove the form from the left column
    leftCol.setAttribute('class', 'leftColSending'); // Assign the left column a class to append it's CSS
    sendImg.setAttribute('src', 'public/img/sending.gif'); // Set the sendImg tag's src attribute
    imgDiv.setAttribute('id', 'sendingDiv'); // Assign the imgDiv tag's id attribute
    imgDiv.appendChild(sendImg); // Put the img in the img div
    msgPara.appendChild(sendMsg); // Put the message text in the paragraph
    imgDiv.appendChild(msgPara); // Put the paragraph in the img div
    leftCol.appendChild(imgDiv); // Put the img div in the left column
}

// Callback function for sendRequest
function msgReceived()
{
    if(sendRequest.readyState == 4)
    {
        if(sendRequest.status == 200)
        {
            var leftCol = document.getElementById('leftCol');
			
            leftCol.removeChild(document.getElementById('sendingDiv')); // Remove sending div and message
            leftCol.innerHTML = sendRequest.responseText; // Display either msg sent and thank you, or redisplay the form with any errors showing from server side validation
			
            if(elementInDoc(document.getElementById('contactForm'))) // If its the error form that comes back, rebind the events for the form
            {
                addEvents(); // Rebind the events and other JS for the returned form when there is an error in the server side validation
            }
        }
    }
}