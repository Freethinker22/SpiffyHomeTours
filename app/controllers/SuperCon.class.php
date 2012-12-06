<?php // This class handles all of the common features of the controllers for the Spiffy Home Tours site
class SuperCon
{
    protected $controller;
    
    public function __construct($controller, $action = null)
    {
        $this->controller = new $controller(); // Initialize page specific controller
        
        if(!empty($action))
        {
            $this->controller->{$action}(); // Call function in the page con if an action was called
        }
    }
    
    // This is where what the user sees is initialized
    public function renderPage($withHeader = true)
    {
        if($withHeader)
        {
            ob_start(); // This is here because some page controllers use header() redirects and this keeps the headerView from generating output until the code in the page cons has executed
            $this->loadView('headerView');
            $this->controller->displayPage();
            $this->loadView('footerView');
            ob_end_flush();
        }
        else
        {
            $this->controller->displayPage(); // Load the page w/o the default header and footer, used for under construction page
        }
    }
    
    // Checks to see if the view exists and includes it
    // Note: If the view file is in a subfolder within the main views folder, the subfolder name will need to be included in the path sent to this function, e.g. 'frontEnd/aboutView'
    public function loadView($viewName)
    {
        if(file_exists(VIEWS_PATH . $viewName . '.php'))
        {
            include(VIEWS_PATH . $viewName . '.php');
        }
        else if(file_exists(VIEWS_PATH . $viewName . '.html'))
        {
            include(VIEWS_PATH . $viewName . '.html');
        }
        else
        {
            include(VIEWS_PATH . 'errors/errorNoViewFound.php');
        }
    }
}
?>