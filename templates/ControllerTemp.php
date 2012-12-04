<?php
class NameCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Title';
    public $pageId = 'samplePg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/sample.css', 'screen')); // The header view uses $cssArray to build link tags for the page specific stylesheets
    public $jsArray = array('public/js/utils.js', 'public/js/navMenu.js');
    
    public function __construct()
    {
        $this->model = new BackEndModel(); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        $this->renderView(); // Display the default page
    }
    
    private function renderView()
    {
        $this->loadView('backEnd/sampleView'); // The view is hard coded here because its specific to this page controller
    }
}
?>