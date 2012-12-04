// Functions for the pricing page rollover effects

// Depending on the user agent, wait for the page to load then call func to registar event listeners 
addEvent(window, 'load', loaded, false);

// Creates array of button ids and loops through them to assign event listeners.  Uses closure function to be able to loop through array w/o overwriting the local variable
function loaded()
{
    var btnArray = ["oneTourBtn", "oneMonthBtn", "threeMonthBtn", "sixMonthBtn", "oneYearBtn"];
    var badgeArray = ["oneTourBadge", "oneMonthBadge", "threeMonthBadge", "sixMonthBadge", "oneYearBadge"];
    var btnArLen = btnArray.length;
	
    for(var i = 0; i < btnArLen; i++)
    {
        var closeFunc = function(btnElem, badgeElem)
        {
            return function()
            {
                // Assigns the btn and badge elements event listeners and passes the right btn element to the change funcs 
                addEvent(btnElem, 'mouseover', function(){ signUpOver(btnElem); }, false);
                addEvent(btnElem, 'mouseout', function(){ signUpOut(btnElem); }, false);
                addEvent(badgeElem, 'mouseover', function(){ signUpOver(btnElem); }, false);
                addEvent(badgeElem, 'mouseout', function(){ signUpOut(btnElem); }, false);
            };
        };
        var btnId = closeFunc(document.getElementById(btnArray[i]), document.getElementById(badgeArray[i]));
        btnId();
    }
}

// These functions swap out the normal and over states of the sign up btns on the pricing page
function signUpOver(btn)
{
    btn.style.background = "url(public/img/signUpBtnOver.png)";
}

function signUpOut(btn)
{
    btn.style.background = "url(public/img/signUpBtn.png)";
}