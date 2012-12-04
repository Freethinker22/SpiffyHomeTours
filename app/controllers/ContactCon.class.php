<?php
class ContactCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Contact';
    public $pageId = 'contactPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/frontEnd/contact.css', 'screen'));
    public $jsArray = array('public/js/utils.js', 'public/js/navMenu.js', 'public/js/frontEnd/contactPage.js');
    
    public function __construct()
    {
        $this->model = new FrontEndModel(); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        $this->renderView(); // Display the default page
    }
    
    private function renderView()
    {
        $this->loadView('frontEnd/contactView'); // The view is hard coded here because its specific to this page controller
    }
}
?>