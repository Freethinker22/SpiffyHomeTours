<?php
// *** then check to see what their ex date is and update active column in DB in need be.  *** how to compare today's date with ex date when dates are in Y-m-d format? *** this could also be a cron job?
// if ex date is past, notify them and send them to a renewal page, not sure how the renewal page would work yet???  Also, change the active column in the DB???
// what if subscription was a one tour purchase?  Idea: don't let people with one tour subs build another tour while one is active, and set an exdate for them one year out. *** Make sure to tell them that! ***
// *** detect if user is a one tour at a time user and display panel accordingly ***
// *** detect if active in the DB is set to yes or no, if no, show warning message, with renew pg link, about how they have 90 days to renew before their account and tours are deleted, maybe a countdown on the number?  Also, disable the tour builder
// design userPanel and start on tour building process

class UserPanelCon extends SuperCon
{
    public $model;
    
    // These vars are page specific and accessed by the view when rendering the header
    public $title = 'Spiffy Home Tours - User Panel';
    public $pageId = 'userPanelPg'; // Used in navMenu.js for 'you are here navigation'
    public $cssArray = array(array('public/css/reset.css', 'screen'), array('public/css/theme.css', 'screen'), array('public/css/backEnd/userPanel.css', 'screen'));
    public $jsArray = array('public/js/utils.js', 'public/js/navMenu.js');
    
    public function __construct()
    {
        // If the allowAccess session var equals true then instantiate the BEM and display the user panel, otherwise redirect to the login page
        // Note: The allowAccess session var is created in the SuperModel. Its set at login and after payment is received during sign up
        if(isset($_SESSION['allowAccess']) && $_SESSION['allowAccess'] == true)
        {
            $this->model = new BackEndModel($_SESSION['userId']); // The model class is hard coded here because its specific to this page controller
        }
        else
        {
            header('Location: Login');
        }
    }
    
    public function displayPage()
    {        
        if(isset($_SESSION['userId']) && isset($this->model->userDataArray))
        {
            $this->renderView();
        }
    }
    
    // Called from a log out link to unset session vars and destroy the session
    public function logOut()
    {
        unset($_SESSION['userId']);
        unset($_SESSION['allowAccess']);
        unset($_SESSION['userDataArray']);
        unset($_SESSION['usedResetCode']);
        session_destroy();
        header('Location: Login');
    }
    
    private function renderView()
    {
        $this->loadView('backEnd/userPanelView'); // The view is hard coded here because its specific to this page controller
    }
}
?>