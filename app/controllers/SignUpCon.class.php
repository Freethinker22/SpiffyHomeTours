<?php
class SignUpCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Sign Up';
    public $pageId = 'signUpPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/frontEnd/signUp.css', 'screen'));
    public $jsArray = array('public/js/utils.js', 'public/js/navMenu.js', 'public/js/validator.js', 'public/js/frontEnd/signUpPage.js');
    
    public function __construct()
    {
        $this->model = new FrontEndModel(); // The model class is hard coded here because its specific to this page controller
    }
    
    // Include the view and/or set vars in the model so the view knows what to display to the user
    public function displayPage()
    {
        if(isset($_POST['nextStepBtn']))
        {
            $this->model->btnPressed = true; // This set here because the model and view use it for form checking and error generation
            
            if($this->model->checkSignUp())
            {
                if($this->model->validator->checkTime($_SESSION['loadTime']))
                {
                    if(!$this->model->dbQuery->userInDb($_POST['email'], EMAIL))
                    {
                        $this->model->setSessionVars();
                        header('Location: Payment');
                    }
                    else
                    {
                        $this->model->emailTaken = true;
                        $this->renderView(); // Redisplay the page with the email taken error showing
                    }
                }
                else
                {
                    error_log('File:SignUpCon.class.php - Time error'); // Log the time error
                    $this->model->tooFast = true;
                    $this->renderView(); // Redisplay page with the time error showing
                }
            }
            else
            {
                $this->renderView(); // Redisplay the page with validation errors showing
            }
        }
        else
        {
            $this->renderView(); // Display the default page
        }
    }
    
    private function renderView()
    {
        $this->loadView('frontEnd/signUpView'); // The view is hard coded here because its specific to this page controller
    }
}
?>