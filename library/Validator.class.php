<?php // This class is used to validate user text input, validation of radio btns and checkboxes is done in the model

class Validator
{
    // Check the loadTime session var created on initial load or time error reload to see if the submission is old enough to be from a human and not a bot
    public function checkTime($loadTime)
    {
        return time() - $loadTime > 1 ? true : false;
    }
    
    // Depending on the type of user value, call the validate function with the correct regular expression *** Remember: these RegExs exactly match the ones in the JS validation ***
    // Note: when $returnErr is set to true, the error handler echos the error to be displayed to the user, otherwise nothing is echoed
    // Note: the userVal is used to determine the type of validation and then used as the name of the POST var passed to validate()
    public function valName($userVal, $required, $returnErr = false, $defaultText = NULL)
    {
        $regEx = "/^[A-Za-z'\-\.\s]{1,50}$/";
        return $this->validate($regEx, $userVal, $required, $returnErr, $defaultText);
    }
    public function valPhone($userVal, $required, $returnErr = false, $defaultText = NULL)
    {
       $regEx = "/^(([0-9\-\.\/+()]+)\s?((ext|EXT|Ext|ex|EX|Ex|x|X):?\.?\s?)?){7,25}$/";
       return $this->validate($regEx, $userVal, $required, $returnErr, $defaultText); 
    }
    public function valUrl($userVal, $required, $returnErr = false, $defaultText = NULL)
    {
        $regEx = "/^((http|https|ftp):\/\/)?([\w\-]+)\.([\w\-]+)([\w\-\.\/]*)?\/?$/"; // *** Revise later: prevent usage of multiple periods and slashes in a row, input length too. Remember to update the JS ***
        return $this->validate($regEx, $userVal, $required, $returnErr, $defaultText);
    }
    public function valEmail($userVal, $required, $returnErr = false, $defaultText = NULL)
    {
        $regEx = "/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)\@((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/";
        return $this->validate($regEx, $userVal, $required, $returnErr, $defaultText);
    }
    public function valNumber($userVal, $required, $returnErr = false, $defaultText = NULL)
    {
        $regEx = "/^[0-9\-\.\s]{1,50}$/";
        return $this->validate($regEx, $userVal, $required, $returnErr, $defaultText); 
    }
    public function valOtherText($userVal, $required, $returnErr = false, $defaultText = NULL)
    {
        $regEx = "/^[A-Za-z0-9\-\.\/?!'\"\@#%^&*()_\s]{1,50}$/";
        return $this->validate($regEx, $userVal, $required, $returnErr, $defaultText); 
    }
    public function valPassword($userVal, $returnErr = false)
    {
        $regEx = "/^[A-Za-z0-9\-!\@#$%^&*()_\s]{8,50}$/";
        return $this->checkPassword($regEx, $userVal, $returnErr);
    }
    
    // See if the two values match
    public function confirmMatch($firstVal, $secVal, $returnErr = false, $defaultText = NULL)
    {
        if($this->checkForNull($secVal, $defaultText)) // $secVal must be the confirm field value
        {
            if($firstVal != $secVal)
            {
                if($returnErr)
                {
                    $this->errorMsg('Doesn\'t Match');
                }
                return false;
            }
            else
            {
                return true;
            }
        }
        else
        {
            return false;
        }
    }
    
    // Check to make sure the field is not empty. The $defaultText var is equal to the value attribute's initial text in the input fields
    public function checkForNull($userVal, $defaultText = NULL)
    {
        return $userVal == '' || $userVal == $defaultText ? false : true;
    }
    
    // Check the validity of required and non-required fields
    private function validate($regEx, $userVal, $required, $returnErr, $defaultText)
    {
        if($required)
        {
            if($this->checkForNull($userVal, $defaultText))
            {
                return $this->checkRegEx($regEx, $userVal, $returnErr);
            }
            else
            {
                return false;
            }
        }
        else // If not required
        {
            if($userVal != '')
            {
                return $this->checkRegEx($regEx, $userVal, $returnErr);
            }
            else
            {
                return true; // Return true even if non-required field is empty
            }
        }
    }

    // Check the length of the passwords
    private function checkPassword($regEx, $userVal, $returnErr)
    {
        if($this->checkForNull($userVal))
        {
            if(strlen($userVal) < 8)
            {
                if($returnErr)
                {
                    $this->errorMsg('Too Short');
                }
                return false;
            }
            else
            {
                return $this->checkRegEx($regEx, $userVal, $returnErr);
            }
        }
        else
        {
            return false;
        }
    }

    // Check the target value against the regular expression
    private function checkRegEx($regEx, $userVal, $returnErr)
    {
        if(preg_match($regEx, $userVal) == 1)
        {
            return true;
        }
        else
        {
            if($returnErr)
            {
                $this->errorMsg();
            }
            return false;
        }
    }

    // Called when the form needs to echo an error message to user
    private function errorMsg($msg = 'Invalid Entry')
    {
        echo '<p class="errLabel">' . $msg . '</p>';
    }
}
?>