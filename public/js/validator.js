// This Validator object used in every page with text inputs
// Remember: These RegExs exactly match the ones in the PHP Validator class
function ValObj(errStyle) // ******** still need errStyle??? ********
{
    // Constants
    this.NAME = /^[A-Za-z'\-\.\s]{1,50}$/; // *** Revise later: Could prevent the usage of multiple spaces in a row ***
    this.PHONE = /^(([0-9\-\.\/+()]+)\s?((ext|EXT|Ext|ex|EX|Ex|x|X):?\.?\s?)?){7,25}$/; // *** Revise later: Could prevent the usage of multiple special characters in a row ***
    this.URL = /^((http|https|ftp):\/\/)?([\w\-]+)\.([\w\-]+)([\w\-\.\/]*)?\/?$/; // *** Revise later: Could prevent the usage of multiple periods and slashes in a row, input field length too ***
    this.EMAIL = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
    this.NUMBER = /^[0-9\-\.\s]{1,50}$/;
    this.OTHER_TEXT = /^[A-Za-z0-9\-\.\/?!'\"\@#%^&*()_\s]{1,50}$/;
    this.PASSWORD = /^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/;
    
    // Error msg property
    this.errStyle = errStyle; // ******* still need this, parameter too??? ********
    this.errMsg = '';
    this.isNull = false;
}

// Route the validate call to the right validate function
ValObj.prototype.validate = function(input, regEx, required)
{
    var type = input.attr('type');
    
    switch(type)
    {
        case 'text':
            return this.checkText(input, regEx, required);
            break;
        case 'password':
            return this.checkPassword(input, regEx);
            break;
    }
}

// Check the validity of required and non-required text fields
ValObj.prototype.checkText = function(input, regEx, required)
{
    if(required)
    {
        return this.checkForNull(input) ? this.checkRegEx(input, regEx) : false;
    }
    else
    {
        return input.attr('value') != '' ? this.checkRegEx(input, regEx) : true; // Validate the input if the field contains text, return true even if the non-required field is empty
    }
};

// Check function specifically for a password field
ValObj.prototype.checkPassword = function(input, regEx)
{
    if(this.checkForNull(input))
    {
        if(input.attr('value').length < 8)
        {
            this.errMsg = 'Too Short';
            return false;
        }
        else
        {
            return this.checkRegEx(input, regEx);	
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
        if(firstVal.attr('value') != secVal.attr('value'))
        {
            this.errMsg = 'Doesn\'t Match'; 
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
};

// If the field is empty or its value is equal to its default text, notify the user
// Note: Error style static means there's already a required msg next to the input field that highlights when its left empty. The dynamic style generates a msg using createElement()
// Note: The differance in error styles is due to the design of the page and how much room there is to display an error msg
ValObj.prototype.checkForNull = function(input)
{
    if(input.attr('value') == '' || input.attr('value') == input.attr('title'))
    {
//        if(this.errStyle == 'static') // ****** DON'T delete this until you figure out how to turn on the highlighting in the other js files **********
//        {
//            reqErrOn(evtTarget); // Changes the class to highlight (required) in the span tag
//        }
//        else if(this.errStyle == 'dynamic')
//        {
//            if(!evtTarget.prop('error')) // If the error message is on, don't create another one
//            {
//                errMsg(evtTarget, 'Required');
//            }    
//        }
        this.errMsg = 'Required';
        this.isNull = true;
        return false;
    }
    else
    {
        this.errMsg = '';
        this.isNull = false;
        return true;
    }
};

// Check the evetTarget value against the regular expression
ValObj.prototype.checkRegEx = function(input, regEx)
{
    if(regEx.test(input.attr('value')))
    {
        return true;
    }
    else
    {
//        if(!evtTarget.prop('error')) // If the error message is on, don't create another one
//        {
//            errMsg(evtTarget);
//        }
        this.errMsg = 'Invalid Entry'; // *** used in EX ***
        return false;
    }
};