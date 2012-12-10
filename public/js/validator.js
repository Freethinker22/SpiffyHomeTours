// This script is used to validate user text input

// Note: signUpPage and contactPage 3 main val funcs match. forgotPassPage, loginPage, and passResetPage 3 main val funcs almost match and could be made to do so
// The first thing to do is get all 3 main val funcs and checkInput to work for all six pages, using OOP if possible

// *** could declare reEx constants here and use them in the call to the validate function in checkInput
var NAME_REGEX = /^[A-Za-z'\-\.\s]{1,50}$/; // *** the keyword const isn't supported in IE 7 8, just use regular var keyword with all CAPS


// ********* change note in index to say convert js to oop and push to code examples using master branch *******
// **** new branch, jsoop, convert forgotPass, login, and underCon over to using an OOP obj to access email and password vars through the obj, test, merge and push using master 



// Depending on the field ID, validate with the correct regular expression *** Remember: These RegExs exactly match the ones in the PHP Validator class ***
function checkInput(evtTarget)
{
    var regEx;
    var test = NAME_REGEX;
    
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