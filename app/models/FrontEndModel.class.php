<?php // This class handles all of the front end pages on the Spiffy Home Tours site
class FrontEndModel extends SuperModel
{
    // These vars are what gets changed by the controllers, the view then checks these vars to know what to display 
    public $tutorialPgView = 'frontEnd/tutorialsView'; // Sets the default view for the tutorials page
    public $tooFast = false; // Flag used by the signUp and contact views
    public $emailTaken = false; // Flag used by the signUpView
    public $denyAccess = false; // Flag used by the loginView
    public $emailNotIdDb = false; // Flag used by the forgotPassView
    public $forgotPassConfirm = false; // Flag used by the forgotPassView
    public $underConThanksMsg = false; // Flag used by the under construction page
    public $btnPressed = false; // Flag used to tell if the page's form btn has been clicked

    public function __construct()
    {
        parent::__construct(); // Instantiate the shared objects in the SuperModel
    }
 
// ****** This section of functions are used in the sign up page ******

    // This is used to validate the sign up page inputs
    public function checkSignUp()
    {
        if($this->checkRadBtnsAndTos()) // See if the radio btn groups have been checked and that the TOS has been agreed to before bothering with the rest of the vaildation
        {
            // These functions return true/false depending on the outcome of the validation
            $valArray = array(
                $this->validator->valName($_POST['firstName'], true),
                $this->validator->valName($_POST['lastName'], true),
                $this->validator->valPhone($_POST['phone'], true),
                $this->validator->valOtherText($_POST['compName'], false),
                $this->validator->valUrl($_POST['website'], false),
                $this->validator->valEmail($_POST['email'], true),
                $this->validator->confirmMatch($_POST['email'], $_POST['emailConf']),
                $this->validator->valPassword($_POST['password'], false),
                $this->validator->confirmMatch($_POST['password'], $_POST['passwordConf'])
            );

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
        else
        {
            return false;
        }
    }
    
    // If the user's input is valid, create the session vars for use in the payment page *** Revise later: could add a filter_var() to the POST vars for an extra layer of sanitization? ***
    public function setSessionVars()
    {
        $_SESSION['firstName'] = $_POST['firstName'];
        $_SESSION['lastName'] = $_POST['lastName'];
        $_SESSION['phone'] = $_POST['phone'];
        $_SESSION['compName'] = $_POST['compName'];
        $_SESSION['website'] = $_POST['website'];
        $_SESSION['email'] = $_POST['email'];
        $_SESSION['password'] = $_POST['password'];
        $_SESSION['subType'] = $_POST['subType'];
        $_SESSION['foundBy'] = isset($_POST['foundBy']) ? $_POST['foundBy'] : $_POST['foundByOther']; // If the user filled out the 'other' field instead of selecting a radio btn, set the session var for the found by group to the 'other' field's text
        $_SESSION['tos'] = $_POST['tos'];
    }
    
    // If the field is empty or still contains the default text, highlight the 'required' error msg on the input field by changing the msg's class
    // Note: used only for input fields that are required
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
    
    // Same as above but used only for the 'Choose your subscription' radio btn group
    public function setSubTypeReq()
    {
        $className = 'required';
        
        if($this->btnPressed)
        {
            $className = isset($_POST['subType']) ? 'required' : 'reqError';
            return htmlspecialchars($className);
        }
        else
        {
            return htmlspecialchars($className); 
        }
    }
    
    // Same as above but used only for the 'How did you find us?' radio btn group
    public function setFoundByReq()
    {
        $className = 'required';
        
        if($this->btnPressed)
        {
            $className = isset($_POST['foundBy']) || $_POST['foundByOther'] != '' ? 'required' : 'reqError';
            return htmlspecialchars($className);
        }
        else
        {
            return htmlspecialchars($className); 
        }
    }

    // If the user clicked on a subscription type in the pricing page, the correct radio btn will be checked when the arrive at the sign up page
    // If the page get redisplayed because of an error, the user's selection will still be checked after the redisplay
    public function setSubTypeGroup($value)
    {
        if(isset($_GET['plan']) && $_GET['plan'] == $value)
        {
            return htmlspecialchars('checked');
        }
        else if(isset($_POST['subType']) && $_POST['subType'] == $value)
        {
            return htmlspecialchars('checked');
        }
    }
    
    // If the page get redisplayed because of an error, the user's selection will still be checked after the redisplay if they haven't filled out the 'Other' field
    public function setFoundByGroup($value)
    {
        if(isset($_POST['foundBy']) && $_POST['foundBy'] == $value && $_POST['foundByOther'] == '')
        {
            return htmlspecialchars('checked');
        }
    }
    
    // If the found by other field is filled out and the page gets redisplayed because of an error, the user's text will still be in the field after the redisplay
    public function setFoundByText()
    {
        $text = $this->btnPressed && $_POST['foundByOther'] != '' ? $_POST['foundByOther'] : '';
        return htmlspecialchars($text);
    }
    
    // If the TOS box hasn't been checked, change its CSS class to show an error
    public function isTosChecked()
    {
        if($this->btnPressed && !isset($_POST['tos']))
        {
            return htmlspecialchars('tosErr');
        }
    }
    
    // If the TOS box has been checked but the page gets redisplayed, keep the box checked
    public function keepTosChecked()
    {
        if(isset($_POST['tos']))
        {
            return htmlspecialchars('checked');
        }
    }
    
    // Check to see if the radio btn groups have been filled out properly
    private function checkRadBtnsAndTos()
    {
        if(isset($_POST['subType']) && isset($_POST['tos']) && $this->checkFoundBy())
        {
            return true;
        }
    }
    
    // See if the 'How did you find us' part of the form is filled out
    private function checkFoundBy()
    {
        if(isset($_POST['foundBy']))
        {
            return true;
        }
        else
        {
            return $_POST['foundByOther'] != '' ? true : false; // If the 'other' field was filled out return true
        }
    }
    
// ****** This section of functions are used in the Login page ******
    
    // Check the user entered password against the password in the DB row matching the email address
    public function checkLoginInfo($email, $password)
    {
        $row = $this->dbQuery->getUserData($email, EMAIL); // Get the user's info from the DB
        return $this->hashPass->checkPass($password, $row['password']);
    }
    
    // If login returns true, allowAccess is called and the user is allowed into their account
    public function allowAccess($email)
    {
        $this->bakeCookies($this->encrypt->encryptString($email));
        $this->setUserId($email); // In the SuperModel, create a session var with the user's ID so the BEM can fetch the correct DB info for the userDataArray
        $this->setAllowAccess(); // In the SuperModel, create a session var that allows the user to enter the restricted pages
    }

    // If the user previously had the remember me checkbox ticked, return their email to it from the cookie
    public function emailFieldValue()
    {
        if($this->denyAccess && $this->btnPressed)
        {
            return htmlspecialchars($_POST['email']);
        }
        else if(isset($_COOKIE['ue']))
        {
            return htmlspecialchars($this->encrypt->decryptString($_COOKIE['ue']));
        }
    }
    
    // If the user previously wanted their email remembered, auto check the box so it stays stored
    public function checkForCookie()
    {
        if(isset($_COOKIE['ue'])) return 'checked';
    }
    
    // Handle the remember me cookie, 'ue' stands for user email
    private function bakeCookies($encryptedEmail)
    {
        if(isset($_POST['rememberEmail']))
        {
            setcookie('ue', $encryptedEmail, time() + 3600 * 24 * 365); // Create a cookie if the user checked the remember me box. Revise later: see if strtotime() would work instead of using the math?
        }
        else if(isset($_COOKIE['ue']))
        {
            setcookie('ue', $encryptedEmail, time() - 1); // Remove the userEmail cookie if the checkbox is unchecked and the cookie exists
        }
    }
    
// ****** This section of functions are used in the Contact page ******
    
    // This is used to validate the contact page inputs
    public function checkContact()
    {
        $valArray = array(
            $this->validator->valName($_POST['name'], true),
            $this->validator->valEmail($_POST['email'], true),
            $this->validator->valOtherText($_POST['subject'], true),
            $this->validator->checkForNull(filter_var($_POST['message'], FILTER_SANITIZE_STRING)) // Sanitize the user's message before checking it for null in the validator
        );
        
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
    
    // Check the DB to see if the sender is a registered client to speed up response if they're a paying customer
    public function clientOrNot($userEmail)
    {
        return $this->dbQuery->userInDb($userEmail, EMAIL) ? 'Sender IS a client' : 'Sender is NOT a client';
    }
}
?>