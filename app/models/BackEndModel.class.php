<?php // This model handles any page where the user is either signed in, paying, or reseting their password
class BackEndModel extends SuperModel
{
    public $userDataArray; // Array that holds the information about the user

    // These vars are what gets changed by the controllers, the view then checks these vars to know what to display
    public $emailTaken = false; // Flag used by the payment page to tell if the email alert should be included
    public $passResetConfirm = false; // Flag used by the password reset page to know what to display to the user
    public $passNoMatch = false; // Flag used by the password reset page to know if the password doesn't match alert should be included
    public $btnPressed = false; // Flag used to tell if the page's form btn has been clicked

    // The userId used to create this model is set during login in the FrontEndModel, set in this model during the sign up process, or is passed from the password reset page
    // Either way, this model needs a userId to setup the userDataArray so all back end pages can interact with the user's account
    public function __construct($userId)
    {
        parent::__construct(); // Instantiate the shared objects in the SuperModel
        
        // Note: if the userId is equal to zero, then the call to instantiate the BEM came from the payment or password reset pages and there is no userId yet.
        // This done because funcs in the model are needed in the construct of those pages and there's no userId to use for the creation of the userDataArray
        if($userId != 0)
        {
            $this->setUserDataArray($userId);
        }
    }
    
    // Query the DB for the user's info and set the userDataArray var to the returning associative array, also creates a session var to store the user data
    // The userDataArray session var stores the user's data so the user panel doesn't need to requery the DB should the user navigate away from the user panel and come back later 
    // Note: The userId session var is created at login, sign up, or is set using the decrypted resetCode coming from a forgot password email
    public function setUserDataArray($userId)
    {
        if(isset($_SESSION['userDataArray']) && count($_SESSION['userDataArray']) > 1) // Set the userDataArray to the session var if the array is set and populated
        {
            $this->userDataArray = $_SESSION['userDataArray']; // Reset the userDataArray using the stored session var so any back end page can access the user's info
        }
        else if(isset($userId))
        {
            $this->userDataArray = $this->dbQuery->getUserData($userId, 'userId'); // Setup the userDataArray so any back end page can access the user's info
            $_SESSION['userDataArray'] = $this->userDataArray;
        }
    }

// ****** This section of functions are used in the payment page ******
    
    // Create the user in the DB
    public function signUpUser()
    {
        $this->createUser(); // Setup an account for the user in the DB
        $this->messenger->signUpMsg($_SESSION['email'], $_SESSION['firstName']); // Send thank you email to the new client        
        $this->setUserId($_SESSION['email']); // In the SuperModel, create a session var with the user's ID so the userDataArray can fetch the correct DB info
        $this->setAllowAccess(); // In the SuperModel, create a session var that allows the user to enter the restricted pages
    }
    
    // Create the user in the DB
    private function createUser() // **** this could still be moved to the DbQuery ****
    {
        $hashedPass = $this->hashPass->convertPass($_SESSION['password']); // Hash the user's password before DB submission
        $signUpDate = date('m/d/Y'); // Current date
        $lastLogin = date('m/d/Y g:ia T'); // This is updated at login
        $active = 'yes'; // Checked at login and if the subscription date has passed, will be changed to no
        
        // Algorithm to calculate the subscription expiration date
        switch($_SESSION['subType'])
        {
            case 'oneTour':
                $subExDate = date('m/d/Y', strtotime('1 year')); // Remember to let the user know that their account access will expire after one year but if they buy another tour, the ex date will be reset to one year again
                break;
            case 'oneMonth':
                $subExDate = date('m/d/Y', strtotime('1 month'));
                break;
            case 'threeMonth':
                $subExDate = date('m/d/Y', strtotime('3 month'));
                break;
            case 'sixMonth':
                $subExDate = date('m/d/Y', strtotime('6 month'));
                break;
            case 'oneYear':
                $subExDate = date('m/d/Y', strtotime('1 year'));
                break;
        }       
        
        // Prepare the SQL statement for DB insertion. Session vars are created in the SignUpCon
        // Note: This sqlString is prepared here and not in the DB as normally would happen because of its length
        $sqlString = 'INSERT INTO clients (firstName, lastName, phone, compName, website, email, password, subType, foundBy, tos, signUpDate, subExDate, lastLogin, active) VALUES (:firstName, :lastName, :phone, :compName, :website, :email, :password, :subType, :foundBy, :tos, :signUpDate, :subExDate, :lastLogin, :active)';
        $paramArray = array(
            ':firstName' => $_SESSION['firstName'],
            ':lastName' => $_SESSION['lastName'],
            ':phone' => $_SESSION['phone'],
            ':compName' => $_SESSION['compName'],
            ':website' => $_SESSION['website'],
            ':email' => $_SESSION['email'],
            ':password' => $hashedPass,
            ':subType' => $_SESSION['subType'],
            ':foundBy' => $_SESSION['foundBy'],
            ':tos' => $_SESSION['tos'],
            ':signUpDate' => $signUpDate,
            ':subExDate' => $subExDate,
            ':lastLogin' => $lastLogin,
            ':active' => $active
            );
        
        $this->dbQuery->sendToDb($sqlString, $paramArray);
    }
    
// ****** This section of functions are used in the user panel page ******
    
    //public function editUserData($dbField, $newValue)
    //{
        // put code here to access the DB field and change the user's info
        // this would be used in the user panel's edit features
    //}
    
// ****** This section of functions are used in the password reset page ******

    // If the field is empty or still contains the default text, highlight the 'required' error msg on the input field by changing the msg's class
    // Note: Used only for input fields that are required
    public function setReq($postVar, $defaultText)
    {
        $className = 'required';
        
        if($this->btnPressed)
        {
            $className = $postVar == '' || $postVar == $defaultText ? 'reqError' : 'required';
            return htmlspecialchars($className);
        }
        else
        {
            return htmlspecialchars($className); 
        }
    }
    
    // Validate the reset password form inputs. Revise later: build the $valArray in the PassRestCon and pass it in? Or just some way of decoupling this functin from the page controller?
    public function valPassReset($valOldPass = true)
    {
        if($valOldPass)
        {
            // These functions return true/false depending on the outcome of the validation
            $valArray = array(
                $this->validator->valPassword($_POST['oldPass'], false),
                $this->validator->valPassword($_POST['newPass'], false),
                $this->validator->confirmMatch($_POST['newPass'], $_POST['newPassConf'])
            );  
        }
        else
        {
            $valArray = array(
                $this->validator->valPassword($_POST['newPass'], false),
                $this->validator->confirmMatch($_POST['newPass'], $_POST['newPassConf'])
            );
        }

        foreach($valArray as $valResult)
        {
            // If any of the values come back false, stop the loop and return false. Specific error checking will be done on the redisplayed page
            if(!$valResult)
            {
                return false;
            }
        }
        return true;
    }
    
    // Check the user entered password against the password in the DB row matching the email address
    public function verifyOldPass($userId, $password)
    {
        $row = $this->dbQuery->getUserData($userId, USER_ID);
        return $this->hashPass->checkPass($password, $row['password']);
    }
    
    // Reset the user's password in the DB to their new password
    public function passReset($userId, $newPass)
    {
        $hashedPass = $this->hashPass->convertPass($newPass);
        $this->dbQuery->updatePass($userId, $hashedPass);
    }
}
?>