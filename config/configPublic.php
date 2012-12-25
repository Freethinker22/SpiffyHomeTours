<?php // Define and set constants *** Note: This is only the public version of this file, remember the values will vary depending on where the code is being run from e.g. live server or localhost ***
define('DEVELOPMENT_ENVIRONMENT', true);

// Define the path to the views directory for use in loadView()
define('VIEWS_PATH', 'app/views/');

// Define the path to the virtual tours directory for use in the TourCon
define('TOURS_PATH', 'tours/');

// Database login vars
define('DB_HOST', 'localhost');
define('DB_NAME', 'dataBaseName');
define('DB_USER', 'dataBaseUser');
define('DB_PASS', 'password');

// Types of user info used to access the DB in userInDb() and getUserData() in DbQuery object
define('EMAIL', 'email');
define('USER_ID', 'userId');

// Address that the contact page msgs get sent to
define('CONTACT_EMAIL', 'contact@SpiffyHomeTours.com');

// Address that emails are sent from in the Messenger object
define('ADMIN_EMAIL', 'admin@SpiffyHomeTours.com');

// Key used for Encryption object
define('KEY', 'Its a secret phrase');

// Salt used for HashPass object
define('SALT_PHRASE', 'secretphrase');
?>
