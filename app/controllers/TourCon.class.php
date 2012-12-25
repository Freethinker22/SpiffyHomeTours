<?php
class TourCon extends SuperCon
{
    public $model;
    public $tourDirectory;

    public function __construct()
    {
        $this->model = new FrontEndModel($this); // The model class is hard coded here because its specific to this page controller
    }
    
    public function displayPage($tourDirectory)
    {
        if($tourDirectory != null)
        {
            if(file_exists(TOURS_PATH . $tourDirectory))
            {
                $this->tourDirectory = $tourDirectory; 
                $this->renderView(); // Display the default page
            }
            else
            {
                header('Location: Samples');  // The tour directory doesn't exists *** Revise later: Might show an error msg or page instead of redirecting? ***
            }
        }
        else
        {
            header('Location: Samples'); // The tour directory isn't set in the URL
        }
    }
    
    private function renderView()
    {
        $this->loadView('tourApp/mainView'); // The virtual tour application
    }
} 
?>