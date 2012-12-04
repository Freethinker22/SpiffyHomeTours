<?php // This class handles the encryption and decryption of cookie info and the password reset resetCode
class Encrypt
{
    private $key;
    
    public function __construct()
    {
        $this->key = KEY; // Note: Constants are set in config.php
        substr($this->key, 0, mcrypt_get_key_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB));
    }
    public function encryptString($dataToEncrypt)
    {
        $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
        $iv = mcrypt_create_iv($ivSize, MCRYPT_RAND);
        
        return base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $this->key, $dataToEncrypt, MCRYPT_MODE_ECB, $iv));
    }
    
    public function decryptString($dataToDecrypt)
    {
        $ivSize = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
        $iv = mcrypt_create_iv($ivSize, MCRYPT_RAND);
        
        return trim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $this->key, base64_decode($dataToDecrypt), MCRYPT_MODE_ECB, $iv));
    }  
}
?>