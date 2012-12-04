<?php // Validate contact form input and return thank you msg *** Remember: The contact form is Ajax based and doesn't work without JS being enabled ***
class ContactFormAjax
{
    private $model;
    private $validator; // Shortcut to the vaildator object in the model
    
    public function __construct()
    {
        $this->model = new FrontEndModel();
        $this->validator = $this->model->validator;

        if($this->model->checkContact())
        {
            if($this->validator->valNumber($_POST['loadTime'], true) && $this->validator->checkTime($_POST['loadTime'])) // Val the loadTime var then check if the submission is old enough to be from a human and not a bot
            {
                $userName = $_POST['name'];
                $userEmail = $_POST['email'];
                $userSubject = $_POST['subject'];
                $userMsg = filter_var($_POST['message'], FILTER_SANITIZE_STRING);
                $isClient = $this->model->clientOrNot($userEmail);
                
                if($this->model->messenger->contactMsg($userName, $userEmail, $userSubject, $userMsg, $isClient))
                {
                    include(VIEWS_PATH . 'alerts/msgSent.php'); // Redisplay page with the confirmation msg showing
                }
            }
            else
            {
                error_log('File:ContactFormAjax.class.php - Time error'); // Log the time error
                include(VIEWS_PATH . 'alerts/tooFast.php'); // Redisplay page with the time error showing
            }
        }
        else
        {
            include(VIEWS_PATH . 'errors/error404.php'); // Note: This is here incase the JS validation is thwarted and the server side val comes back false, the form shouldn't submit w/o JS being enabled
        }
    }
}
?>