// Form validation for the contact page
$(document).ready(function()
{
    var formInputs = $('.formInputs'); // Array of form inputs
    var sendingImg = new Image();
    
    formInputs.prop('error', false); // Create flags to know if the error msg is on or not
    sendingImg.src = 'public/img/sending.gif'; // Preload processing img
    
    // Set the color of the text in the inputs to light gray if its the initial text, if the page has been reloaded due to an error, the user's text is not set to light gray
    formInputs.addClass(function()
    {
        if($(this).attr('value') === $(this).attr('title'))
        {
            return 'defaultText';
        }
    });
    
    // Clears the default field values if they're showing
    formInputs.focus(function()
    {
        if($(this).attr('value') === $(this).attr('title'))
        {
            $(this).attr('value', '');
            $(this).removeClass('defaultText');
        }
    });
    
    // Resets the fields' inital values if they're empty on blur
    formInputs.blur(function()
    {
        if($(this).attr('value') === '')
        {
            $(this).attr('value', $(this).attr('title'));
            $(this).addClass('defaultText');
        }
    });
    
    $('#contactBtn').click(function()
    {
        var val = new ValObj();
        var valName = checkInput(val, $('#fullName'), val.NAME, true);
        var valEmail = checkInput(val, $('#email'), val.EMAIL, true);
        var valSubject = checkInput(val, $('#subject'), val.OTHER_TEXT, true);
        var valMsg = val.checkForNull($('#message'));
        
        if(!valMsg) // The message box only needs to be checked for null, its sanitization is done on the server
        {
            reqErrOn($('#message'));
        }
        
        if(valName && valEmail && valSubject && valMsg)
        {
            sendForm(); // If all the check functions return true, submit the form via AJAX
        }
    });
    
    function checkInput(valObj, input, regEx, required)
    {
        if(valObj.validate(input, regEx, required))
        {
            return true;
        }
        else if(valObj.isNull)
        {
            reqErrOn(input);
            return false;
        }
        else
        {
            if(!input.prop('error')) // If the error msg is already showing, don't create another one
            {
                var errId = input.attr('id') + 'ErrMsg'; // Set a unique id for each error msg so it can specifically be removed
                
                input.after('<p class="errMsg" id="' + errId + '">' + valObj.errMsg + '</p>'); // Append the error msg set in the validator obj
                input.prop('error', true);
                
                input.focus(function(event) // Assign a listener to remove the error msg when the user returns to the field
                {
                    $('#' + errId).remove();
                    input.prop('error', false);
                    input.unbind(event);
                });
            }
            return false;
        }
    }
    
    // Highlight the 'required' text in the label's span tag if the input is empty
    function reqErrOn(input)
    {
        input.prev().children('span').removeClass('required').addClass('reqError');
        
        input.focus(function(event) // Assign a listener to remove the highlighting on the 'required' text in the label's span tag if the text was highlighted
        {
            input.prev().children('span').removeClass('reqError').addClass('required');
            input.unbind(event);
        });
    }
    
    // Send the form to the server with user input data
    function sendForm()
    {
       var formData = $('#contactForm').serialize();
       var request = $.ajax({
            type: 'POST',
            url: 'ajaxRouter.php?ajaxCon=ContactForm',
            data: formData
        });
                
        request.done(function(data)
        {
            $('#sendingDiv').remove(); // Remove the sending graphic
            $('#leftCol').append(data);
        });
        
        request.fail(function()
        {
            alert('Oops! It seems there was an connection error, please try again.');
        });
        
        msgSending();
    }
    
    // Display the sending graphic while waiting on the server
    function msgSending()
    {
        $('#contactForm').remove();
        $('#leftCol').addClass('leftColSending');
        $('#leftCol').append('<div id="sendingDiv"><img src="public/img/sending.gif" alt="Sending animation" /><p>Sending Message...</p></div>');
    }
});