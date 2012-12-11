// This script is used to validate user text input

// This validator object used in every page with text inputs
// Remember: These RegExs exactly match the ones in the PHP Validator class
function ValObj(errStyle)
{
    // Constants
    this.NAME = /^[A-Za-z'\-\.\s]{1,50}$/; // *** Revise later: could prevent the usage of multiple spaces in a row ***
    this.PHONE = /^(([0-9\-\.\/+()]+)\s?((ext|EXT|Ext|ex|EX|Ex|x|X):?\.?\s?)?){7,25}$/; // *** Revise later: could prevent the usage of multiple special characters in a row ***
    this.URL = /^((http|https|ftp):\/\/)?([\w\-]+)\.([\w\-]+)([\w\-\.\/]*)?\/?$/; // *** Revise later: could prevent the usage of multiple periods and slashes in a row, input field length too ***
    this.EMAIL = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
    this.NUMBER = /^[0-9\-\.\s]{1,50}$/;
    this.OTHER_TEXT = /^[A-Za-z0-9\-\.\/?!'\"\@#%^&*()_\s]{1,50}$/;
    this.PASSWORD = /^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/;
    
    // Other properties
    this.errStyle = errStyle;
}

// Check the validity of required and non-required fields
ValObj.prototype.validate = function(evtTarget, regEx, required)
{
    if(required)
    {
        if(this.checkForNull(evtTarget))
        {
            return this.checkRegEx(evtTarget, regEx);
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
            return this.checkRegEx(evtTarget, regEx); // Validate the input if the field contains text
        }
        else
        {
            return true; // Return true even if non-required field is still empty
        }
    }
};

// Check function specifically for a password field
ValObj.prototype.checkPassword = function(evtTarget, regEx)
{
    if(this.checkForNull(evtTarget))
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
            return this.checkRegEx(evtTarget, regEx);	
        }
    }
    else
    {
        return false;
    }
};

// Check to see if two fields match
ValObj.prototype.confirmVals = function(firstVal, secVal)
{
    if(this.checkForNull(secVal)) // secVal must be the confirm field value
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

// If the field is empty or its value is equal to its default text, notify the user
// Note: Error style static means there's already a required msg next to the input field that highlights when its left empty. The dynamic style generates a msg using createElement()
// Note: The differance in error styles is due to the design of the page and how much room there is to display an error msg
ValObj.prototype.checkForNull = function(evtTarget)
{
    if(evtTarget.value == '' || evtTarget.value == evtTarget.title)
    {
        if(this.errStyle == 'static')
        {
            reqErrOn(evtTarget); // Changes the class to highlight (required) in the span tag
        }
        else if(this.errStyle == 'dynamic')
        {
            if(!evtTarget.error) // If the error message is on, don't create another one
            {
                errMsg(evtTarget, 'Required');
            }    
        }
        return false;
    }
    else
    {
        return true;
    }
}
// Check the evetTarget value against the regular expression
ValObj.prototype.checkRegEx = function(evtTarget, regEx)
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