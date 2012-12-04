<?php
// **** this whole section of code will need to be inside of a function or if statment and be called after the user enters their payment info and it is confirmed ****
// **** the html will need to display the payment form, this will need to come from the payment app that I decide to use ****
// **** then once the payment is confirmed, call this code to secure the user input and send it to the DB ****
// **** if DB submission is successful, then redirect to the user's account panel and send confirmation email ****
// **** when PaymentCon is init after SignUpCon redirects here, no user ID is set for use in the userDataArray?  No error is shown b/c the userId and userDataArray isn't used in the payment page b/c the account doesn't yet exists
// **** probably not a problem, but keep an eye out when build out the payment system ****

class PaymentCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - Payment';
    public $pageId = 'paymentPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/backEnd/payment.css', 'screen'));
    public $jsArray = array('public/js/utils.js', 'public/js/navMenu.js');
    
    public function __construct()
    {
        $this->model = new BackEndModel(0); // The model class is hard coded here because its specific to this page controller
        // Note: since the user hasn't been created yet, pass zero to the BEM as the userId to avoid an argument error
    }
    
    public function displayPage()
    {
        if(isset($_POST['paymentBtn']))
        {
            if(!$this->model->dbQuery->userInDb($_SESSION['email'], EMAIL)) // Though the sign up attempt is checked at sign up, this is here to check it again incase someone uses the back btn to return to this page after the info has been submitted to the DB. In short, it prevents multiple accounts with the same email
            {
                // *** Remember: in final production not to submit the user data to the DB until payment is processed! ***
                $this->model->signUpUser(); // Create an account for the user in the DB
                header('Location: UserPanel'); // After successful sign up and payment, redirect to the user's account panel
            }
            else
            {
                $this->model->emailTaken = true;
                $this->renderView(); // Redisplay the page with the email taken error showing
            }
        }
        else
        {
            $this->renderView(); // Display the default page
        }
    }
    
    private function renderView()
    {
        $this->loadView('backEnd/paymentView'); // The view is hard coded here because its specific to this page controller
    }
}
?>