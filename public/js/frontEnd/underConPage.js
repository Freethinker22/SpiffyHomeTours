// Form validation for the under construction page
$(document).ready(function()
{
    var formInputs = $('#notifyForm input'); // Array of form inputs
    
    formInputs.addClass('defaultText'); // Set the initial text in the inputs to light gray
    formInputs.prop('error', false); // Create flags to know if the error msg is on or not 
    
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
    
    // Called by the submit btn on the form
    $('#notifyBtn').click(function(event)
    {
        var val = new ValObj();
        var valEmail = checkInput(val, $('#notifyEmail'), val.EMAIL, true); 

        valEmail ? $('#notifyForm').submit() : event.preventDefault(); // Submit the form or prevent the default submit action of the form so the validation can run
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
});