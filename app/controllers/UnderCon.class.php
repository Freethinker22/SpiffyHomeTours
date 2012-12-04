<?php // This is a special controller that doesn't use the regular header or footer views
class UnderCon extends SuperCon
{
    public $model;
    public $title = 'Spiffy Home Tours - Under construction';
    
    public function __construct()
    {
        $this->model = new FrontEndModel(); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage()
    {
        if(isset($_POST['notifyBtn']))
        {
            $this->model->btnPressed = true; // This set here because the model and view use it for form checking and error generation
            
            if($this->model->validator->valEmail($_POST['notifyEmail'], true))
            {
                if($this->model->validator->checkTime($_POST['loadTime']))
                {
                    $this->model->underConThanksMsg = true;
                    $this->model->dbQuery->notifyEmailToDB($_POST['notifyEmail']); // Submit the email to the notify table in the DB
                    $this->renderView(); // Display the default page with thank you message
                }
                else
                {
                    error_log('File:UnderCon.class.php - Time error'); // Log the time error
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
        $this->loadView('frontEnd/underConView'); // The view is hard coded here because its specific to this page controller
    }
}
?>