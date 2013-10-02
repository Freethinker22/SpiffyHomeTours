<?php // This file uses the url and query string to route all calls made to the index to the correct page controller

// ***** Framework flow *****
// call to index with url
// index uses url to build controller and action vars
// init super controller
// init page specific controller
// init model
// modify the model if needed
// init the view
// view uses model functions to get info about what to display
 
// ***** Notes *****
// The FrontEndModel handles the pages that can be navigated to without a subscription, the BackEndModel handles the rest
// URLs from view and JS files can be from the TLD on down but in the CSS, need to be relative to the stylesheet
// The Ajax router is used to instantiate classes from the library and model folders so as to reuse the code

// ***** File naming convention *****
// Page controller file names have 2 parts. The page name, 'Contact' and the 'Con' suffix
// Ajax controller file names have 3 parts. The page where the Ajax app is, 'Contact', The part of the page its used for, 'Form', and the 'Ajax' suffix

session_start();
require_once('bootstrap.php');

// Check for a query string and initialize accordingly
function checkUrl()
{
    if(isset($_GET['url'])) // 'url' is the name of the query string var set in the mod_rewrite
    {
        $urlArray = explode('-', rawurlencode($_GET['url'])); // Urls in the view are called with the format of controller-action. Revise later: Fix the trailing slash bug in the mod_rewrite to allow con/action format
        file_exists('app/controllers/' . $urlArray[0] . 'Con.class.php') ? splitUrl($urlArray) : include('app/views/errors/error404.php'); // Check if the incoming controller name is valid
    }
    else
    {
        $controller = 'UnderCon'; // For when the site is under construction
        //$controller = 'HomeCon'; // Default landing page
        $action = null;
        init($controller, $action);
    }
}

// Build the controller and action vars using the incoming query string
function splitUrl($urlArray)
{
    $controller = $urlArray[0] . 'Con';
            
    if(count($urlArray) > 1) // When the urlArray is longer than 1, there's an action attached to the url
    {
        array_shift($urlArray);
        $action = $urlArray[0];
    }
    else
    {
        $action = null;
    }

    init($controller, $action);
}

// Instantiate the super controller, then init the tour application or init a regular website page 
function init($controller, $action)
{    
    if($controller == 'TourCon')
    {
        $tourDirectory = $action; // Set the tour's directory name from the action var in the URL
        $action = null; // Reset the action so as not to call a non-existent function in the page controller
        $superCon = new SuperCon($controller, $action); // Instantiate the SuperCon
        $superCon->renderTour($tourDirectory); // Initalize the tour application and pass it the tour's directory name
    }
    else if($controller == 'UnderCon')
    {
        $superCon = new SuperCon($controller, $action);
        $superCon->renderPage(false); // Don't display the default header and footer for the under construction page *** Note: This condition will not be needed once the site is ready to launch ***
    }
    else
    {
        $superCon = new SuperCon($controller, $action);
        $superCon->renderPage();
    }
}

checkUrl();
?>
