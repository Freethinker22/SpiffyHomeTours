<?php
class ForgotPassCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Forgot Password';
    public $pageId = 'forgotPassPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/frontEnd/login.css', 'screen')); // The header view uses $cssArray to build link tags for the page specific stylesheets
    public $jsArray = array('public/js/utils.js', 'public/js/navMenu.js', 'public/js/validator.js', 'public/js/frontEnd/forgotPassPage.js');
    
    public function __construct()
    {
        $this->model = new FrontEndModel(); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        if(isset($_POST['forgotBtn']))
        {
            $this->model->btnPressed = true; // This set here because the model and view use it for form checking and error generation
            
            if($this->model->dbQuery->userInDb($_POST['email'], EMAIL)) // Check to see if the user is in the DB
            {
                $row = $this->model->dbQuery->getUserData($_POST['email'], EMAIL); // Get the user's info from the DB for use in the forgot password email
                $encryptedUserId = $this->model->encrypt->encryptString($row['userId']);
                
                $this->model->messenger->forgotPassMsg($row['email'], $encryptedUserId, $row['firstName']);
                $this->model->forgotPassConfirm = true;
                $this->renderView(); // Redisplay the page with a msg telling the user that an email was sent to them
            }
            else
            {
                $this->model->emailNotIdDb = true;
                $this->renderView(); // Redisplay the page with a msg telling the user the email they entered doesn't have an account
            }
        }
        else
        {
            $this->renderView(); // Display the default page
        }
    }
    
    private function renderView()
    {
        $this->loadView('frontEnd/forgotPassView'); // The view is hard coded here because its specific to this page controller
    }
}
?>