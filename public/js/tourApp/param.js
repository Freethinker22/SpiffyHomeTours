// *** REMEMBER: Included this file in the tourMain.js file after dev is done ***

// This object holds all of the configurable variables for the tour application
function Param()
{
    // SlideMenu obj
    this.centerGap = 15; // centerGap pushes the top and bottom halves of slide array away from the center so the two slides neighboring the center slide show more
    this.horiSpace = 10; // Space between slides on the x axis
    this.maxHoriRatio = .60; // Imgs with a height to width ratio less than this are considered horizontal panos and tweened as such
    this.topZ = 100; // Z-index of the upper most slide, this number must be greater than the number of slides to display
    this.slideTweenTime = 0.5; // Slide menu animation length
    this.vertSpace = 60; // Space between slides on the y axis
    
    // Preloader obj
    this.amtToLoad = 5; // Number of imgs to load before the tour starts
    this.maskTweenTime = 3; // Number of seconds the preloader mask takes to open
    this.maskOpacity = .75; // Opacity percentage preloader mask fade too when opening
    
    // ImageDisplay obj
    this.pixelsPerSec = 25; // Used to calculate the tour img's tween time
    this.fadeDelay = .50; // The amount of time it takes a tour img to fade in or out during a transition
    this.maxTweenTime = 27; // Max number of seconds that a tour img will take to tween
    this.minTweenTime = 9; // Min number of seconds that a  tour img will be tweening
}

// *** Example of modifier idea ***
// *** Multiply the param by 1 or the modifier to get the new value for the different size tours. Called by onload or resize window event that changes Param() ***
//function Param(mod)
//{
//    if(!mod) { mod = 1; }
//    
//    this.parameter = 100 * mod;
//    
//    // *** OR ***
//    
//    this.getParameter = function()
//    {
//        var parameter = 100 * mod;
//        return parameter;
//    }
//}