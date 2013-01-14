// This Validator object used in every page with text inputs
// Remember: These RegExs exactly match the ones in the PHP Validator class
function ValObj()
{
    // Constants
    this.NAME = /^[A-Za-z'\-\.\s]{1,50}$/; // *** Revise later: Could prevent the usage of multiple spaces in a row ***
    this.PHONE = /^(([0-9\-\.\/+()]+)\s?((ext|EXT|Ext|ex|EX|Ex|x|X):?\.?\s?)?){7,25}$/; // *** Revise later: Could prevent the usage of multiple special characters in a row ***
    this.URL = /^((http|https|ftp):\/\/)?([\w\-]+)\.([\w\-]+)([\w\-\.\/]*)?\/?$/; // *** Revise later: Could prevent the usage of multiple periods and slashes in a row, input field length too ***
    this.EMAIL = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
    this.NUMBER = /^[0-9\-\.\s]{1,50}$/;
    this.OTHER_TEXT = /^[A-Za-z0-9\-\.\/?!'\"\@#%^&*()_\s]{1,50}$/;
    this.PASSWORD = /^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/;
    
    // Error msg properties
    this.errMsg = '';
    this.isNull = false;
}

// Route the validate call to the right validate function
ValObj.prototype.validate = function(input, regEx, required)
{
    this.resetProperties();
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
        return input.val() !== '' ? this.checkRegEx(input, regEx) : true; // Validate the input if the field contains text, return true even if the non-required field is empty
    }
};

// Check function specifically for a password field
ValObj.prototype.checkPassword = function(input, regEx)
{
    if(this.checkForNull(input))
    {
        if(input.val().length < 8)
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
    this.resetProperties();
    
    if(this.checkForNull(secVal)) // secVal must be the confirm field value
    {
        if(firstVal.val() !== secVal.val())
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

// Check if the field is empty or its value is equal to its default text
ValObj.prototype.checkForNull = function(input)
{
    if(input.val() === '' || input.val() === input.attr('title'))
    {
        this.errMsg = 'Required';
        this.isNull = true;
        return false;
    }
    else
    {
        return true;
    }
};

// Check the evetTarget value against the regular expression
ValObj.prototype.checkRegEx = function(input, regEx)
{
    if(regEx.test(input.val()))
    {
        return true;
    }
    else
    {
        this.errMsg = 'Invalid Entry';
        return false;
    }
};

// Reset obj properties to default values. This is so the obj can be used repeatedly w/o the previous call to it affecting the next one
ValObj.prototype.resetProperties = function()
{
    this.errMsg = '';
    this.isNull = false;
}