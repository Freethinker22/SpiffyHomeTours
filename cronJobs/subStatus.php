<?php // This is a cron job script that notifies users if their subscription is about to expire and updates the DB if it does

require_once('../bootstrap.php');

$messenger = new Messenger();
$dbQuery = new DbQuery();

function twoWeekNotice($dbQuery, $messenger)
{
    $amountOfTime = 'in two weeks'; // Used in the email to tell the user how much time they have left
    $twoWeeksOut = date('m/d/Y', strtotime('2 weeks')); // This will only run if the user's subscription date is exactly two weeks away so the this particular notification email is only sent once
    $sqlString = 'SELECT firstName, email from clients WHERE subExDate = :twoWeeksOut';
    $paramArray = array(':twoWeeksOut' => $twoWeeksOut);
    $sql = $dbQuery->getFromDb($sqlString, $paramArray, false); // getFromDb() returns an assoc array by default but doing it that way would cause getFromDb() to run each time a row is matched
    
    while($row = $sql->fetch(PDO::FETCH_ASSOC)) // Populate the array with the emails of users who's accounts will be expiring in two weeks
    {
        $messenger->expiringSub($row['email'], $row['firstName'], $amountOfTime);
    }
}

function oneWeekNotice($dbQuery, $messenger)
{
    $amountOfTime = 'in one week';
    $oneWeekOut = date('m/d/Y', strtotime('1 week'));
    $sqlString = 'SELECT firstName, email from clients WHERE subExDate = :oneWeekOut';
    $paramArray = array(':oneWeekOut' => $oneWeekOut);
    $sql = $dbQuery->getFromDb($sqlString, $paramArray, false);
    
    while($row = $sql->fetch(PDO::FETCH_ASSOC))
    {
        $messenger->expiringSub($row['email'], $row['firstName'], $amountOfTime);
    }
}

function toDayNotice($dbQuery, $messenger)
{
    $amountOfTime = 'after today';
    $today = date('m/d/Y');
    $sqlString = 'SELECT firstName, email from clients WHERE subExDate = :today';
    $paramArray = array(':today' => $today);
    $sql = $dbQuery->getFromDb($sqlString, $paramArray, false);
    
    while($row = $sql->fetch(PDO::FETCH_ASSOC))
    {
        $messenger->expiringSub($row['email'], $row['firstName'], $amountOfTime);
    }
}

function lastNotice($dbQuery, $messenger)
{
    $yesterday = date('m/d/Y', strtotime('-1 day'));
    $sqlString = 'SELECT firstName, email from clients WHERE subExDate = :yesterday';
    $paramArray = array(':yesterday' => $yesterday);
    $sql = $dbQuery->getFromDb($sqlString, $paramArray, false);
    
    while($row = $sql->fetch(PDO::FETCH_ASSOC))
    {
        $messenger->expiredSub($row['email'], $row['firstName']);
    }
}

// Notify the user of their account that will be deleted and send an email to the admin about it
function deleteNotice($dbQuery, $messenger)
{
    $deleteDate = date('m/d/Y', strtotime('-90 days'));
    $sqlString = 'SELECT firstName, email from clients WHERE subExDate = :deleteDate';
    $paramArray = array(':deleteDate' => $deleteDate);
    $sql = $dbQuery->getFromDb($sqlString, $paramArray, false);
    
    while($row = $sql->fetch(PDO::FETCH_ASSOC))
    {
        $messenger->deleteSub($row['email'], $row['firstName']);
        $messenger->notifyAdmin($row['email']);
    }
}

// Update the user's active status to no in the DB
function deactivate($dbQuery)
{
    $active = 'no';
    $yesterday = date('m/d/Y', strtotime('-1 day'));
    $sqlString = 'UPDATE clients SET active = :active WHERE subExDate = :yesterday';
    $paramArray = array(':active' => $active, ':yesterday' => $yesterday);
    $dbQuery->sendToDb($sqlString, $paramArray);
}

twoWeekNotice($dbQuery, $messenger);
oneWeekNotice($dbQuery, $messenger);
toDayNotice($dbQuery, $messenger);
lastNotice($dbQuery, $messenger);
deleteNotice($dbQuery, $messenger);
deactivate($dbQuery);
?>