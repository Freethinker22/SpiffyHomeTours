// *** REMEMBER: Included this file in the tour.js file after dev is done ***

// This object holds all of the configurable variables for the tour application
function Param()
{
    // SlideMenu obj
    this.centerGap = 15; // centerGap pushes the top and bottom halves of slide array away from the center so the two slides neighboring the center slide show more
    this.horiSpace = 10; // Space between slides on the X axis
    this.vertSpace = 63; // Space between slides on the Y axis
    this.topZ = 200; // Z-index of the upper most slide, this number must be greater than the number of slides to display
    this.maxHoriRatio = .60; // Imgs with a height to width ratio less than this are considered horizontal panos and tweened as such
    this.slideTweenTime = 1.5; // Slide menu animation length
    
    // Preloader obj
    this.amtToLoad = 5; // Number of imgs to load before the tour starts
    this.maskTweenTime = 4; // Number of seconds the preloader mask takes to open
    this.maskOpacity = .75; // Opacity percentage preloader mask fade too when opening
    
    // ImageDisplay obj
    this.pixelsPerSec = 25; // Used to calculate the tour img's tween time
    this.fadeDelay = 1.25; // The amount of time it takes a tour img to fade in or out during a transition
    this.maxTweenTime = 17; // Max number of seconds that a tour img will take to tween in one direction
    this.minTweenTime = 10; // Min number of seconds that a  tour img will be tweening in one direction
    
    // Music obj
    this.includeMusic = true; // Whether or not to include the music obj
    this.autoPlay = true; // Auto play the music or not
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