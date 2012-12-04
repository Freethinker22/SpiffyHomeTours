<?php // This class handles all of the common features of the models for the Spiffy Home Tours site
class SuperModel
{
    // Shared objects used throughout the models
    public $validator;
    public $messenger;
    public $dbQuery;
    public $hashPass;
    public $encrypt;

    public function __construct()
    {
        $this->validator = new Validator();
        $this->messenger = new Messenger();
        $this->dbQuery = new DbQuery();
        $this->hashPass = new HashPass();
        $this->encrypt = new Encrypt();
    }
    
    // Put the user's ID number from the database into a session var so it can be used throughout the backend pages after login and sign up
    public function setUserId($email)
    {
        $row = $this->dbQuery->getUserData($email, EMAIL);
        $_SESSION['userId'] = $row['userId'];
    }
    
    // Allow the user to enter the backend pages after successful login or after their payment has been received during sign up
    protected function setAllowAccess()
    {
        $_SESSION['allowAccess'] = true;
    }
}
?>