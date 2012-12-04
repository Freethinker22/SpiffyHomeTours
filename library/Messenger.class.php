<?php // This class handles the sending of email messages
// *** Remember to redesign and rebuild the html email messages that are sent ***
class Messenger
{
    private $headers; // Used to hold the header info about the email

    // Create and send an html email that is sent to the user after they successfully sign up *** Revise later: Maybe use separate files with the html inside of them instead of having it all typed out here? ***
    public function signUpMsg($email, $firstName)
    {
        $subject = 'Welcome!';
        $msg =
            '
            <html>
                <head>
                    <title>Sign up confirmation</title>
                </head>
                <body>
                    <p>Hi ' . $firstName . ',</p>
                    <p>Thank you for signing up with Spiffy Home Tours.</p>
                    <p>If you have any questions about your account, please <a href="https://www.spiffyhometours.com/Contact" title="Contact Me">contact</a> me.</p>
                    <p>*** This email needs to be redesigned and rebuilt before going live.  Maybe list their sub type and when it will expire?  Could use images or the logo too? ***</p>
                </body>
            </html>
            ';
          
        $this->setHeaders();
        mail($email, $subject, $msg, $this->headers);
    }
    
    // Create and send an email to the user with a link to the password reset page. The password reset page detects if their user ID is in the query string and displays the appropriate page
    public function forgotPassMsg($email, $encryptedUserId, $firstName)
    {
        $subject = 'Password reset';
        $msg = 
            '
            <html>
                <head>
                    <title>Forgot password e-mail</title>
                </head>
                <body>
                    <p>Hi ' . $firstName . ',</p>
                    <p>To reset your password, click on the link below and follow the instructions on the page.  Once you have reset your password you\'ll be able to login again.</p>
                    <p>If you have any questions about your account, please <a href="https://www.spiffyhometours.com/Contact" title="Contact me">contact</a> me.</p>
                    <p><a href="https://www.spiffyhometours.com/PassReset?resetCode=' . $encryptedUserId . '" title="Password reset">Reset your password</a></p>
                    <p>*** This email needs to be redesigned and rebuilt before going live.  Could use images or the logo too? ***</p>
                </body>
            </html>
            ';
        
        $this->setHeaders();
        mail($email, $subject, $msg, $this->headers);
    }
    
    // Create and send an email to the user notifying them that thier password was reset and if they didn't reset it to notify me
    public function passResetMsg($email)
    {
        $subject = 'Your password was reset';
        $msg = 
            '
            <html>
                <head>
                    <title>Password Reset confirmation</title>
                </head>
                <body>
                    <p>Hi, this e-mail is to let you know your password with Spiffy Home Tours has been reset.</p>
                    <p>If you meant to change your password, please disregard this e-mail</p>
                    <p>If you didn\'t change your password, please <a href="https://www.spiffyhometours.com/Contact" title="Contact me">contact</a> me as soon as possible.</p>
                    <p>*** This email needs to be redesigned and rebuilt before going live.  Could use images or the logo too? ***</p>
                </body>
            </html>
            ';
        
        $this->setHeaders();
        mail($email, $subject, $msg, $this->headers);
    }
    
    // Create and send an email when the user uses the contact me page
    public function contactMsg($userName, $userEmail, $userSubject, $userMsg, $isClient)
    {
        $subject = 'Message from contact form: ' . $isClient;
        $msg = '
            <html>
                <head>
                    <title>Message from contact form</title>
                </head>
                <body>
                    <p>You\'ve received an email from: ' . $userName . '.</p>
                    <p>Their e-mail addres is: ' . $userEmail . '</p>
                    <p>The subject of their message is: ' . $userSubject . '.</p>
                    <p>Their message is: ' . $userMsg . '</p>
                    <p>*** This email needs to be redesigned and rebuilt before going live. ***</p>
                </body>
            </html>
            ';
        
        $this->setHeaders();
        return mail(CONTACT_EMAIL, $subject, $msg, $this->headers); // Note: Constants are set in config.php
    }
    
    // Create and send an email to the user notifying them that their subscription is about to expire
    // Note: This function is used in a cron job
    public function expiringSub($email, $firstName, $amountOfTime)
    {
        $subject = 'Your subscription is expiring';
        $msg = '
            <html>
                <head>
                    <title>Expiring subscription notification</title>
                </head>
                <body>
                    <p>Hi ' . $firstName . ',</p>
                    <p>Your subscription with Spiffy home tours will be expiring ' . $amountOfTime . '.</p>
                    <p>Please follow this link to renew your subscription and prevent any loss of service</p>
                    <p>Thank you</p>
                    <p>*** This email needs to be redesigned and rebuilt before going live. ***</p>
                </body>
            </html>
            ';
        $this->setHeaders();
        mail($email, $subject, $msg, $this->headers);
    }
    
    // Create and send an email to the user notifying them that their subscription has expired
    // Note: This function is used in a cron job
    public function expiredSub($email, $firstName)
    {
        $subject = 'Your subscription has expired';
        $msg = '
            <html>
                <head>
                    <title>Expired subscription notification</title>
                </head>
                <body>
                    <p>Hi ' . $firstName . ',</p>
                    <p>Your subscription with Spiffy home tours has expired.</p>
                    <p>You can still log into your account and manage your tours for another 90 days.</p>
                    <p>You will not be able to build any new tours until your subscription is renewed.</p>
                    <p>Please follow this link to renew your subscription and prevent any loss of service</p>
                    <p><strong>Important! After 90 days without renewing, your account and all of your tours will be deleted from the system.</strong></p>
                    <p>Thank you</p>
                    <p>*** This email needs to be redesigned and rebuilt before going live. ***</p>
                </body>
            </html>
            ';
        $this->setHeaders();
        mail($email, $subject, $msg, $this->headers);
    }
    
    // Create and send an email to the user notifying them that their account is about to be deleted
    // Note: This function is used in a cron job
    public function deleteSub($email, $firstName)
    {
        $subject = 'Your account will be deleted soon';
        $msg = '
            <html>
                <head>
                    <title>Delete account notification</title>
                </head>
                <body>
                    <p>Hi ' . $firstName . ',</p>
                    <p>Your subscription with Spiffy home tours has been expired for 90 days now.</p>
                    <p>If you do not renew by the end of today, your account and all tours associated with it will be permanently deleted.</p>
                    <p>Please follow this link to renew your subscription and prevent any loss of service.</p>
                    <p><strong>Important! If your account is deleted there is no way to recover any of the data or the tours.</strong></p>
                    <p>*** This email needs to be redesigned and rebuilt before going live. ***</p>
                </body>
            </html>
            ';
        $this->setHeaders();
        mail($email, $subject, $msg, $this->headers);
    }
    
    // Send a message to the admin with the emails of any accounts that need to be removed from the DB
    // Note: This function is used in a cron job
    public function notifyAdmin($email)
    {
        $subject = 'Account to delete';
        $msg = '
            <html>
                <head>
                    <title>Delete account notification</title>
                </head>
                <body>
                    <p>This account: ' . $email . ' has been expired for 90 days now.</p>
                    <p>Wait till tomorrow and remove it from the DB.</p>
                    <p>*** This email needs to be redesigned and rebuilt before going live. ***</p>
                </body>
            </html>
            ';
        $this->setHeaders();
        mail(ADMIN_EMAIL, $subject, $msg, $this->headers);
    }
    
    private function setHeaders()
    {
        $this->headers = "From: Spiffy Home Tours <" . ADMIN_EMAIL . ">\r\n";
        $this->headers .= "Content-type: text/html; charset=iso-8859-1\r\n";
        $this->headers .= "MIME-Version: 1.0\r\n";
    }
}
?>