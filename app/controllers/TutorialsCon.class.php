<?php
class TutorialsCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Tutorials';
    public $pageId = 'tutorialsPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/frontEnd/tutorials.css', 'screen'));
    public $jsArray = array();
    
    public function __construct()
    {
        $this->model = new FrontEndModel($this); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        $this->renderView(); // The view and any subfolder it might be in is hard coded here because its specific to this page controller
    }
    
    // These functions change out what tutorial is showing on the tutorials page
    public function light()
    {
        $this->model->tutorialPgView = 'frontEnd/tutorials/lightView';
    }
    public function panorama()
    {
        $this->model->tutorialPgView = 'frontEnd/tutorials/panoramaView';
    }
    public function best()
    {
        $this->model->tutorialPgView = 'frontEnd/tutorials/bestView';
    }
    public function size()
    {
        $this->model->tutorialPgView = 'frontEnd/tutorials/sizeView';
    }
    public function megapixel()
    {
        $this->model->tutorialPgView = 'frontEnd/tutorials/megapixelView';
    }
    
    private function renderView()
    {
        $this->loadView($this->model->tutorialPgView);
    }
}
?>