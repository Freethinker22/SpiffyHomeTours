// Functions for the sign up page and form validation
$(document).ready(function()
{
    var formInputs = $('#signUpForm input'); // Array of all form inputs
    var defaultText = $('#signUpForm input[type="text"]'); // Array of form inputs that are text fields
    
    formInputs.prop('error', false); // Create flags to know if the error msg is on or not
    
    // The password fields have two input tags, one of type text for initial display and one of type password for user input
    // The inputs of type text are initially hidden via CSS incase JS is disabled
    // This code here swaps the classes of the inputs and shows the inputs of type text when the page loads or reloads due to an error
    if($('#password').val() === '')
    {
        $('#txtPassword').removeClass('displayNone').addClass('displayInline');
        $('#txtPasswordConf').removeClass('displayNone').addClass('displayInline');
        $('#password').addClass('displayNone');
        $('#passwordConf').addClass('displayNone');
    }
    
    // Inputs with a title have a default value, the color of the default value is light gray
    // If the page has been reloaded due to an error, the text will not be set to light gray if the text is not equal to the title
    defaultText.addClass(function()
    {
        if($(this).val() === $(this).attr('title'))
        {
            return 'lightGrayText';
        }
    });
    
    // Swap the text password inputs out for the real password inputs
    $('.txtPass').focus(function()
    {
        $(this).removeClass('displayInline').addClass('displayNone');
        $(this).prev().removeClass('displayNone').addClass('displayInline');
        $(this).prev().focus();
    });
    
    // If nothing was entered in the real password inputs, change them back to the text password inputs
    $('.realPass').blur(function()
    {
        if($(this).val() === '')
        {
            $(this).removeClass('displayInline').addClass('displayNone');
            $(this).next().removeClass('displayNone').addClass('displayInline');
            $(this).next().val($(this).next().attr('title'));
            $(this).next().addClass('lightGrayText');
        }
    });
    
    // Clears the default field values if they're showing
    defaultText.focus(function()
    {
        $(this).removeClass('lightGrayText'); // This is here because some inputs of type text don't have a title and thus it wouldn't be removed if that field gained focus, blurred, and regained focus again
        
        if($(this).val() === $(this).attr('title'))
        {
            $(this).val('');
        }
    });
    
    // Resets the fields' inital values if they're empty on blur
    defaultText.blur(function()
    {
        if($(this).val() === '')
        {
            $(this).val($(this).attr('title'));
            $(this).addClass('lightGrayText');
        }
    });
    
    // Uncheck the radio btns in the 'How did you find us' section if the 'other' field gains focus
    $('#foundByOther').focus(function()
    {
        $('#findType').find('input[type="radio"]').each(function()
        {
            $(this).attr('checked', false);
        });
    });
    
    // Clears the 'other' field if a radio btn in the 'How did you find us' section gets checked while there's text in the field
    $('#findType').change(function()
    {
        if(loopRadBtns($('#findType')))
        {
            $('#foundByOther').val('');
        }
    });
    
    // If all the check functions return true, allow the form to submit
    $('#signUpForm').submit(function(event)
    {
        var val = new ValObj();
        var valFirstName = checkInput(val, $('#firstName'), val.NAME, true);
        var valLastName = checkInput(val, $('#lastName'), val.NAME, true);
        var valPhoneNum = checkInput(val, $('#phone'), val.PHONE, true);
        var valCompName = checkInput(val, $('#compName'), val.OTHER_TEXT, false);
        var valWebsite = checkInput(val, $('#website'), val.URL, false);
        var valEmail = checkInput(val, $('#email'), val.EMAIL, true);
        var valEmailConf = confirmInputs(val, $('#email'), $('#emailConf'));
        var valPassword = checkInput(val, $('#password'), val.PASSWORD, true);
        var valPasswordConf = confirmInputs(val, $('#password'), $('#passwordConf'));
        var valSubType = checkSubType($('#subType'));
        var valFindType = checkFindType($('#findType'));
        var valFoundByOther = checkInput(val, $('#foundByOther'), val.OTHER_TEXT, false);
        var valTos = checkTos($('#tos'));
    
        return valFirstName && valLastName && valPhoneNum && valCompName && valWebsite && valEmail && valEmailConf && valPassword && valPasswordConf && valSubType && valFindType && valFoundByOther && valTos ? true : event.preventDefault();
    });
    
    // Validate the input using the val obj and display error msgs if needed based on properties of the val obj
    function checkInput(valObj, input, regEx, required)
    {
        if(valObj.validate(input, regEx, required)) // If the input is valid, return true
        {
            return true;
        }
        else if(valObj.isNull) // If the input has no value but is required, highlight the required notification
        {
            return showReqErr(input);
        }
        else // If the input is not valid, create and display an error msg
        {
            return showErrMsg(input, valObj.errMsg);
        }
    }
    
    // Same as checkInput only using a different method of the val obj
    function confirmInputs(valObj, firstVal, secVal)
    {
        if(valObj.confirmVals(firstVal, secVal))
        {
            return true;
        }
        else if(valObj.isNull)
        {
            return showReqErr(secVal);
        }
        else
        {
            return showErrMsg(secVal, valObj.errMsg);
        }
    }
    
    // Determine if a radio btn was selected in the radio btn group, if not, highlight the required error msg
    function checkSubType(btnGroup)
    {
        return loopRadBtns(btnGroup) ? true : showReqErr(btnGroup);
    }
    
    function checkFindType(btnGroup)
    {
        return loopRadBtns(btnGroup) || $('#foundByOther').val() !== '' ? true : showReqErr(btnGroup);
    }
    
    // Check to see if the terms of service checkbox is checked
    function checkTos(tosBox)
    {
        if(tosBox.attr('checked'))
        {
            return true;
        }
        else
        {
            tosBox.parent().addClass('tosErr'); // Highlights the parent div of the TOS checkbox
            
            tosBox.click(function(event)
            {
                tosBox.parent().removeClass('tosErr');
                tosBox.unbind(event);
            });
            return false;
        }
    }
    
    // Iterate over the radio group and determine if one of them is selected
    function loopRadBtns(btnGroup)
    {
        var isChecked = false;
        
        btnGroup.find('input[type="radio"]').each(function()
        {
            if($(this).attr('checked'))
            {
                isChecked = true;
            }
        });
        return isChecked;
    }
    
    // Add the error msg to the DOM and assign it a listener so its removed when the field gains focus again
    function showErrMsg(input, errMsg)
    {
        if(!input.prop('error')) // If the error msg is already showing, don't create another one
        {
            var errId = input.attr('id') + 'ErrMsg'; // Set a unique id for each error msg so it can specifically be removed

            input.after('<p class="errMsg" id="' + errId + '">' + errMsg + '</p>'); // Append the error msg set in the validator obj
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

    // Highlight the 'required' text in the input's span tag if the input is empty
    function showReqErr(input)
    {
        input.parent().find('span').removeClass('required').addClass('reqError');

        input.on('focus change', function(event) // Assign a listener to remove the highlighting on the 'required' text in the label's span tag if the text was highlighted
        {
            input.parent().find('span').removeClass('reqError').addClass('required');
            input.off(event);
        });
        return false;
    }
});