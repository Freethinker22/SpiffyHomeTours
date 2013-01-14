// Form validation for the login page
$(document).ready(function()
{
    var formInputs = $('#loginForm input'); // Array of form inputs
    
    formInputs.prop('error', false); // Create flags to know if the error msg is on or not
    $('#email').focus(); // Give the email input focus by default
    
    $('#loginForm').submit(function(event)
    {
        var val = new ValObj();
        var valEmail = checkInput(val, $('#email'), val.EMAIL, true);
        var valPass = checkInput(val, $('#password'), val.PASSWORD, true);
        
        return valEmail && valPass ? true : event.preventDefault();
    });
    
    // Uses a reference to the validator obj and the input field to be validated. The val obj either returns true or sets its errMsg property to the correct error msg and returns false
    function checkInput(valObj, input, regEx, required)
    {
        if(valObj.validate(input, regEx, required))
        {
            return true;
        }
        else
        {
            if(!input.prop('error')) // If the error msg is already showing, don't create another one
            {
                var errId = input.attr('id') + 'ErrMsg'; // Set a unique id for each error msg so it can specifically be removed
                
                input.prev().after('<p class="errMsg" id="' + errId + '">' + valObj.errMsg + '</p>'); // Append the error msg set in the validator obj
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
});