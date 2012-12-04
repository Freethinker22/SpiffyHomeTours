<?php // Remember: Paths are relative to the location of this file
require_once('config/config.php');

// Check if environment is development and set error reporting
function setReporting()
{
    if(DEVELOPMENT_ENVIRONMENT == true)
    {
        error_reporting(E_ALL);
        ini_set('display_errors', 'on');
    }
    else
    {
        error_reporting(E_ALL);
        ini_set('display_errors', 'off');        
        ini_set('log_errors', 'on');
        ini_set('error_log', 'logs/error_log');
    }
}

// Autoload any classes that are required
function autoLoad($classToLoad)
{
    if(file_exists(dirname(__FILE__) . '/app/controllers/' . $classToLoad . '.class.php')) // Classes in the controllers folder
    {
    	require(dirname(__FILE__) . '/app/controllers/' . $classToLoad . '.class.php');
    }
    else if(file_exists(dirname(__FILE__) . '/app/models/' . $classToLoad . '.class.php')) // Classes in the models folder
    {
    	require(dirname(__FILE__) . '/app/models/' . $classToLoad . '.class.php');
    }
    else if(file_exists(dirname(__FILE__) . '/library/' . $classToLoad . '.class.php')) // Classes in the library folder
    {
        require(dirname(__FILE__) . '/library/' . $classToLoad . '.class.php');
    }
    else if(file_exists(dirname(__FILE__) . '/app/controllers/ajaxCons/' . $classToLoad . '.class.php')) // Classes in the ajax controllers folder
    {
    	require(dirname(__FILE__) . '/app/controllers/ajaxCons/' . $classToLoad . '.class.php');
    }
}

setReporting();
spl_autoload_register('autoLoad');
?>