<?php
class PassResetCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Password Reset';
    public $pageId = 'passResetPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/backEnd/passReset.css', 'screen')); // The header view uses $cssArray to build link tags for the page specific stylesheets
    public $jsArray = array('public/js/validator.js', 'public/js/backEnd/passResetPage.js');
    
    public function __construct()
    {
        // If this page is being called from a forgot password email, a GET var named resetCode containing the encrypted user ID will be in the query string so the page knows who's password to reset
        // Note: The BackEndModel is instantiated using zero when the userId has yet to be set because it's functions are needed for decrypting the resetCode
        // Note: The usedResetCode session var keeps the page from being redirected to Login after the page is reloaded w/o resetCode or allowAccess being set. Also ensures the correct val algorithm is used when the passResetBtn is pressed
        if(isset($_GET['resetCode']) || isset($_SESSION['usedResetCode']))
        {
            $this->model = new BackEndModel(0); // Instantiate the BEM by passing it 0, then use its funcs to decrypt the resetCode, then set the userId session var
            
            if(isset($_GET['resetCode']))
            {
                $_SESSION['userId'] = $this->model->encrypt->decryptString($_GET['resetCode']);
                $_SESSION['usedResetCode'] = true;
                
                if(!$this->model->dbQuery->userInDb($_SESSION['userId'], USER_ID)) // If resetCode has been tampered with, redirect to the login page
                {
                    header('Location: Login');
                }
            }
        }
        else if(isset($_SESSION['allowAccess']) && $_SESSION['allowAccess'] == true)
        {
            $this->model = new BackEndModel($_SESSION['userId']); // The model class is hard coded here because its specific to this page controller
        }
        else
        {
            header('Location: Login');
        }
    }
    
    // Note: The userId session var is created at login, sign up, or its set using the decrypted resetCode coming from a forgot password email
    public function displayPage()
    {
        if(isset($_GET['resetCode']) || isset($_SESSION['usedResetCode'])) // Determine if the page request is coming from the user panel or the forgot password email
        {
            if(isset($_POST['passResetBtn'])) // If the reset btn has been pressed, validate the input and reset the password
            {
                $this->model->btnPressed = true; // This set here because the model and view use it for form checking and error generation

                if($this->model->valPassReset(false)) // Tell the validate function that the call is coming from the reset from email option
                {
                    unset($_SESSION['usedResetCode']); // Remove the session var that allows the page to be displayed w/o resetCode or allowAccess being set
                    $this->model->passReset($_SESSION['userId'], $_POST['newPass']); // Reset the password in the DB
                    $this->model->setUserDataArray($_SESSION['userId']); // Setup the userDataArray var in the BEM, used for passResetMsg
                    $this->model->messenger->passResetMsg($this->model->userDataArray['email']); // Notify the user of the change
                    $this->model->passResetConfirm = true; // Change flag in model so the view will display the confirmation msg
                    $this->renderEmailVersion(); // Display confirmation message with link to login page
                }
                else
                {
                    $this->renderEmailVersion(); // Redisplay the page with validation errors showing
                }
            }
            else
            {
                $this->renderEmailVersion(); // Display the page that is linked to in the forgot password email
            }
        }
        else if(isset($_SESSION['allowAccess']) && $_SESSION['allowAccess'] == true) // If the user is logged in, display appropriate reset page
        {
            if(isset($_POST['passResetBtn']))
            {
                $this->model->btnPressed = true; // This set here because the model and view use it for form checking and error generation

                if($this->model->valPassReset())
                {
                    if($this->model->verifyOldPass($_SESSION['userId'], $_POST['oldPass'])) // Check to see if the old password matches the one in the DB
                    {
                        $this->model->passReset($_SESSION['userId'], $_POST['newPass']);
                        $this->model->passResetConfirm = true;
                        $this->model->messenger->passResetMsg($this->model->userDataArray['email']);
                        $this->renderView();
                    }
                    else
                    {
                        $this->model->passNoMatch = true;
                        $this->renderView(); // Redisplay the page with the password doesn't match alert showing
                    }
                }
                else
                {
                    $this->renderView(); // Redisplay the page with validation errors showing
                }
            }
            else
            {
                $this->renderView(); // Display the page that is linked from the reset password option in the user panel
            }
        }
    }
    
    // Render the version of the page that the user sees when coming from the forgot password email
    // Note: the views are hard coded here because they're specific to this page controller
    private function renderEmailVersion()
    {
        $this->loadView('backEnd/passResetEmailView');
    }
    
    // Render the version of the page that the user sees when linking from the user panel
    private function renderView()
    {
        $this->loadView('backEnd/passResetView');
    }
}
?>