<?php
class HomeCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header. Path arrays are looped over inside of the header view to build the link and script tags
    public $title = 'Spiffy Home Tours - Interactive virtual tours';
    public $pageId = 'homePg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/frontEnd/home.css', 'screen'));
    public $jsArray = array();

    public function __construct()
    {
        $this->model = new FrontEndModel($this); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        $this->renderView(); // Display the default page
    }
    
    private function renderView()
    {
        $this->loadView('frontEnd/homeView'); // The view is hard coded here because its specific to this page controller
    }
} 
?>