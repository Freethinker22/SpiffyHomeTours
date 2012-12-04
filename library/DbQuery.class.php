<?php // This class holds all of the functions for interacting with the database
class DbQuery
{    
// **** These functions are abstract DB operations ****

    // Submits data to the database using the provided query string and an array of the data to send
    public function sendToDb($sqlString, $paramArray)
    {
        $db = $this->createConnection();
        $sql = $db->prepare($sqlString);

        foreach($paramArray as $valName => &$value) // Remember: BindParam needs a reference of $value otherwise it binds the variable name and not its value
        {
            $sql->bindParam($valName, $value);
        }
        
        $sql->execute();
    }

    // Fetches data from the DB using the provided query string and an array of the data to find
    // Note: Returns an associtve array by default or it can return the results variable that can be used for something else, like $sql->fetchColumn() in the userInDb() func for example
    public function getFromDb($sqlString, $paramArray, $fetchAssoc = true)
    {
        $db = $this->createConnection();
        $sql = $db->prepare($sqlString);

        foreach($paramArray as $valName => &$value)
        {
            $sql->bindParam($valName, $value);
        }

        $sql->execute();
        return $fetchAssoc ? $sql->fetch(PDO::FETCH_ASSOC) : $sql; 
    }
    
    // Establish a PDO connection to the database and set error reporting
    private function createConnection()
    {
        try 
        {
            $db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME, DB_USER, DB_PASS); // Note: Constants are set in config.php
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $db;
        }
        catch(PDOException $e)
        {
            error_log('File:DbQuery.class.php - PDO connection error ' . $e->getMessage(), 0); // Revise later: Show an error message?
        }
    }
    
// **** These functions are specific to a certain DB operation ****
    
    // Return the user's info from the DB 
    // Note: The $type var determines which type of user identifier is being sent to request the data, type 'email' comes from the front end pages while type 'userId' comes from the back end pages
    public function getUserData($emailOrUserId, $type)
    {
        if($type == EMAIL)
        {
            $sqlString = 'SELECT * FROM clients WHERE email = :email';
            $paramArray = array(':email' => $emailOrUserId);
        }
        else if($type == USER_ID)
        {
            $sqlString = 'SELECT * FROM clients WHERE userId = :userId';
            $paramArray = array(':userId' => $emailOrUserId);
        }
        
        return $this->getFromDb($sqlString, $paramArray);
    }
    
    // Checks to see if the user already has an account using either an email address or a user ID number. Used in signUp, payment, login, contact, and password reset
    public function userInDb($emailOrUserId, $type)
    {       
        if($type == EMAIL)
        {
            $sqlString = 'SELECT COUNT(*) FROM clients WHERE email = :email';
            $paramArray = array(':email' => $emailOrUserId);
        }
        else if($type == USER_ID)
        {
            $sqlString = 'SELECT COUNT(*) FROM clients WHERE userId = :userId';
            $paramArray = array(':userId' => $emailOrUserId);
        }

        $sql = $this->getFromDb($sqlString, $paramArray, false);
        return $sql->fetchColumn() == 0 ? false : true; // If the count comes back as 0 then the user doesn't exist in the DB
    }
    
    // Change the user's current password to a new password
    public function updatePass($userId, $hashedPass)
    {
        $sqlString = 'UPDATE clients SET password = :password WHERE userId = :userId';
        $paramArray = array(':password' => $hashedPass, ':userId' => $userId);
        $this->sendToDb($sqlString, $paramArray);
    }
    
    // Update the user's last login time in the DB
    public function updateLastLogin($email, $date)
    {
        $sqlString = 'UPDATE clients SET lastLogin = :lastLogin WHERE email = :email';
        $paramArray = array(':lastLogin' => $date, ':email' => $email);
        $this->sendToDb($sqlString, $paramArray);
    }
    
    // Send the user's email address to the notify table in the DB. Used only in the under construction page
    public function notifyEmailToDB($notifyEmail)
    {
        $sqlString = 'INSERT INTO notify (email) VALUES (:email)';
        $paramArray = array(':email' => $notifyEmail);
        $this->sendToDb($sqlString, $paramArray);
    }
}
?>