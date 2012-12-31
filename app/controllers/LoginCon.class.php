<?php
class LoginCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Login';
    public $pageId = 'loginPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/frontEnd/login.css', 'screen'));
    public $jsArray = array('public/js/validator.js', 'public/js/frontEnd/loginPage.js');
    
    public function __construct()
    {
        $this->model = new FrontEndModel(); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        if(isset($_POST['loginBtn']))
        {
            $this->model->btnPressed = true; // This set here because the model and view use it for form checking and error generation
          
            if($this->model->validator->valEmail($_POST['email'], true) && $this->model->validator->valPassword($_POST['password'])) // Check the validity of the user's input
            {
                if($this->model->dbQuery->userInDb($_POST['email'], EMAIL)) // Check to see if the user is in the DB
                {
                    if($this->model->checkLoginInfo($_POST['email'], $_POST['password'])) // Check the password against the email
                    {
                        $this->model->allowAccess($_POST['email']); // Setup the session vars that allow the user into their account
                        $this->model->dbQuery->updateLastLogin($_POST['email'], date('m/d/Y g:ia T')); // Update the user's last login date in the DB
                        header('Location: UserPanel'); // Send the user to their account
                    }
                    else
                    {
                        $this->model->denyAccess = true;
                        $this->renderView(); // If the password doesn't match, redisplay the page with the error box showing
                    }
                }
                else
                {
                    $this->model->denyAccess = true; 
                    $this->renderView(); // If the email is not in the DB, redisplay the page with the error box showing
                }
            }
            else
            {
                $this->renderView(); // If there are validation errors, redisplay the page with them showing
            }
        }
        else
        {
           $this->renderView(); // Display the default page
        }
    }
    
    private function renderView()
    {
        $this->loadView('frontEnd/loginView'); // The view is hard coded here because its specific to this page controller
    }
}
?>