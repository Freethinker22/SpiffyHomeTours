<?php // This file routes Ajax requests made in JS files and instantiates a specific Ajax controller to carry out the actions needed for that particular Ajax app
require_once('bootstrap.php');

// Determine which controller to instantiate based on the GET var that's listed in the Ajax request url
function routeCall()
{
    if(isset($_GET['ajaxCon'])) // 'ajaxCon' is the name of the query string var set in the url var inside the Ajax function in the JS
    {
        $ajaxCon = $_GET['ajaxCon'] . 'Ajax'; // The Ajax controllers naming convention is: page name, section of the page, and the 'Ajax' suffix
        
        file_exists('app/controllers/ajaxCons/' . $ajaxCon . '.class.php') ? new $ajaxCon : include(VIEWS_PATH . 'errors/ajaxError.php'); // Check if the incoming controller name is valid
    }
    else
    {
        error_log('File:ajaxRouter.php - ajaxCon not set.');
        header('Location: error404');
    }
}

routeCall();
?>