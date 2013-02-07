// *** REMEMBER: Included this file in the tourMain.js file after dev is done ***

// Object that holds all of the configurable variables for the tour application
function Param()
{
    // SlideMenu obj
    this.maxHorRatio = .60; // Imgs with a height to width ratio less than this are considered horizontal panos and tweened as such
    
    // Preloader obj
    this.amtToLoad = 5; // Number of imgs to load before the tour starts
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