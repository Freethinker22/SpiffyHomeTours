<?php // This class handles the hashing and matching of passwords for DB submission, login, and password reset
class HashPass
{
    public function __construct()
    {
        if(CRYPT_BLOWFISH != 1)
        {
            error_log('File:HashPass.class.php - CRYPT_BLOWFISH not equal to 1', 0); // Revise later: Show an error message?
        }
    }

    // Take the user's password and hash it using the crypt function with a unique salt
    public function convertPass($password)
    {
        $hash = crypt($password, $this->getSalt());
        return $hash;
    }

    // Match the user's input password against the password from the DB
    public function checkPass($userInput, $hashFromDb)
    {
        $hash = crypt($userInput, $hashFromDb);
        return $hash === $hashFromDb;
    }

    // Create a unique salt based on a unix timestamp and a phrase
    private function getSalt()
    {
        $salt = '$2a$07$' . time() . SALT_PHRASE; // Note: Constants are set in config.php
        return $salt;
    }
}
?>