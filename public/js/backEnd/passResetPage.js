// Form validation for the password reset page
$(document).ready(function()
{
    var formInputs = $('#passResetForm input'); // Array of form inputs
    formInputs.prop('error', false); // Create flags to know if the error msg is on or not
        
    // The password fields have two input tags, one of type text for initial display and one of type password for user input
    // The inputs of type text are initially hidden via CSS incase JS is disabled
    // This code here swaps the classes of the inputs and shows the inputs of type text at runtime if the form isn't being redisplayed due to an error
    if($('#newPass').attr('value') === '')
    {
        $('#txtNewPass').addClass('displayInline');
        $('#txtNewPassConf').addClass('displayInline');
        $('#newPass').addClass('displayNone');
        $('#newPassConf').addClass('displayNone');

         // If the user accessed the reset page from the user panel, this field will be present
        if($('#oldPass').length > 0)
        {
            $('#txtOldPass').addClass('displayInline');
            $('#oldPass').addClass('displayNone');
        }
    }
    
    // Clears the default field values if they're showing
    formInputs.focus(function()
    {
        if($(this).attr('value') === $(this).attr('title'))
        {
            $(this).removeClass('displayInline').addClass('displayNone'); // Hide the input of type text
            $(this).prev().removeClass('displayNone').addClass('displayInline'); // Show the input of type password
            $(this).prev().focus();
        }
    });
    
    // Resets the fields' inital values if they're empty on blur
    formInputs.blur(function()
    {
        if($(this).attr('value') === '')
        {
            $(this).removeClass('displayInline').addClass('displayNone');
            $(this).next().removeClass('displayNone').addClass('displayInline');
        }
    });
    
    $('#passResetForm').submit(function()
    {
        var val = new ValObj();
        var valNewPass = checkInput(val, $('#newPass'), val.PASSWORD, true);
        var valNewPassConf = confirmInputs(val, $('#newPass'), $('#newPassConf'));
        
        if($('#oldPass').length > 0)
        {
            var valOldPass = checkInput(val, $('#oldPass'), val.PASSWORD, true);
            
            return valNewPass && valNewPassConf && valOldPass ? true : false;
        }
        else
        {
            return valNewPass && valNewPassConf ? true : false;
        }
    });
    
    // Uses a reference to the validator obj and the input field to be validated. The val obj either returns true or sets its errMsg property to the correct error msg and returns false
    function checkInput(valObj, input, regEx, required)
    {
        return valObj.validate(input, regEx, required) ? true : showErrMsg(input, valObj.errMsg);
    }
    
    function confirmInputs(valObj, firstVal, secVal)
    {
        return valObj.confirmVals(firstVal, secVal) ? true : showErrMsg(secVal, valObj.errMsg);
    }
    
    // Add the error msg to the DOM and assign it a listener so its removed when the field gains focus again
    function showErrMsg(input, errMsg)
    {
        if(!input.prop('error')) // If the error msg is already showing, don't create another one
        {
            var errId = input.attr('id') + 'ErrMsg'; // Set a unique id for each error msg so it can specifically be removed

            input.parent().append('<p class="errMsg" id="' + errId + '">' + errMsg + '</p>'); // Append the error msg set in the validator obj
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
});