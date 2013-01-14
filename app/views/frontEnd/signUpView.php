<?php
$_SESSION['loadTime'] = time(); // Used to make sure the form is submitted by a human and not a bot
$model = $this->model; // Shortcut to the model
$vaildator = $this->model->validator; // Shortcut to the Validator object in the model
$btnPressed = $this->model->btnPressed; // Shortcut to the btnPressed flag var in the model
?>

<section id="mainContent">
    <h1>Sign Up Here:</h1>
    <p>Kindly enter in your contact information here, select the type of plan you wish to purchase, and click next to proceeded to the payment page to complete your subscription.  Remember: there are no initial sign up fees.</p>
    <section id="signUpArea">
        
        <?php // Check to see if one of the error flags in the model is set to true. If so, include the error msg
        if($model->tooFast)
        {
            $this->loadView('alerts/tooFast');
        }
        else if($model->emailTaken)
        {
            $this->loadView('alerts/emailTaken');
        }
        ?>
        
        <form name="signUpForm" id="signUpForm" method="POST" action="SignUp">
            <fieldset class="inputText">
                <legend>Client Information</legend>
                <ul>
                    <li>
                        <label for="firstName">First Name: <span class="<?php echo $btnPressed ? $model->setReq($_POST['firstName'], 'First name') : 'required'; // Set the class of the span tag holding the 'required' text ?>">(required)</span></label>
                        <input type="text" name="firstName" id="firstName" title="First name" value="<?php echo htmlspecialchars($btnPressed ? $_POST['firstName'] : 'First name'); // Echo the user's entry or the default text ?>" maxlength="50" />
                        <?php if($btnPressed) $vaildator->valName($_POST['firstName'], true, true, 'First name'); // Check for errors and display msg if error is found ?>
                    </li>
                    <li>
                        <label for="lastName">Last Name: <span class="<?php echo $btnPressed ? $model->setReq($_POST['lastName'], 'Last name') : 'required'; ?>">(required)</span></label>
                        <input type="text" name="lastName" id="lastName" title="Last name" value="<?php echo htmlspecialchars($btnPressed ? $_POST['lastName'] : 'Last name'); ?>" maxlength="50" />
                        <?php if($btnPressed) $vaildator->valName($_POST['lastName'], true, true, 'Last name'); ?>
                    </li>
                    <li>
                        <label for="phone">Phone Number: <span class="<?php echo $btnPressed ? $model->setReq($_POST['phone'], 'e.g. 123-456-7890 ext:123') : 'required'; ?>">(required)</span></label>
                        <input type="text" name="phone" id="phone" title="e.g. 123-456-7890 ext:123" value="<?php echo htmlspecialchars($btnPressed ? $_POST['phone'] : 'e.g. 123-456-7890 ext:123'); ?>" maxlength="25" />
                        <?php if($btnPressed) $vaildator->valPhone($_POST['phone'], true, true, 'e.g. 123-456-7890 ext:123'); ?>
                    </li>
                    <li>
                        <label for="compName">Company Name: </label>
                        <input type="text" name="compName" id="compName" value="<?php echo htmlspecialchars($btnPressed ? $_POST['compName'] : ''); ?>" maxlength="50"  />
                        <?php if($btnPressed) $vaildator->valOtherText($_POST['compName'], false, true); ?>
                    </li>
                    <li>
                        <label for="website">Website: </label>
                        <input type="text" name="website" id="website" value="<?php echo htmlspecialchars($btnPressed ? $_POST['website'] : ''); ?>" maxlength="50" />
                        <?php if($btnPressed) $vaildator->valUrl($_POST['website'], false, true); ?>
                    </li>
                </ul>
            </fieldset>
            <fieldset class="inputText">
                <legend>Account Information</legend>
                <ul>
                    <li>
                        <label for="email">E-mail Address: <span class="<?php echo $btnPressed ? $model->setReq($_POST['email'], 'E-mail address') : 'required'; ?>">(required)</span></label>
                        <input type="text" name="email" id="email" title="E-mail address" value="<?php echo htmlspecialchars($btnPressed ? $_POST['email'] : 'E-mail address'); ?>" maxlength="50" />
                        <?php if($btnPressed) $vaildator->valEmail($_POST['email'], true, true, 'E-mail address'); ?>
                    </li>
                    <li>
                        <label for="emailConf">Confirm E-mail Address: <span class="<?php echo $btnPressed ? $model->setReq($_POST['emailConf'], 'Retype email address') : 'required'; ?>">(required)</span></label>
                        <input type="text" name="emailConf" id="emailConf" title="Retype email address" value="<?php echo htmlspecialchars($btnPressed ? $_POST['emailConf'] : 'Retype email address'); ?>" maxlength="50" />
                        <?php if($btnPressed) $vaildator->confirmMatch($_POST['email'], $_POST['emailConf'], true, 'Retype email address'); ?>
                    </li>
                    <li>
                        <label for="password">Password: <span class="<?php echo $btnPressed ? $model->setReq($_POST['password'], 'Min. 8 characters') : 'required'; ?>">(required)</span></label>
                        <input type="password" name="password" id="password" class="realPass" title="Min. 8 characters" value="<?php echo htmlspecialchars($btnPressed ? $_POST['password'] : ''); ?>" maxlength="50" />
                        <input type="text" name="txtPassword" id="txtPassword" class="txtPass displayNone" title="Min. 8 characters" value="Min. 8 characters" maxlength="50" /> <!-- Text typed password fields are toggled by JS so default text is readable -->
                        <?php if($btnPressed) $vaildator->valPassword($_POST['password'], true); ?>
                    </li>
                    <li>
                        <label for="passwordConf">Confirm Password: <span class="<?php echo $btnPressed ? $model->setReq($_POST['passwordConf'], 'Retype your password') : 'required'; ?>">(required)</span></label>
                        <input type="password" name="passwordConf" id="passwordConf" class="realPass" title="Retype your password" value="<?php echo htmlspecialchars($btnPressed ? $_POST['passwordConf'] : ''); ?>" maxlength="50" />
                        <input type="text" name="txtPasswordConf" id="txtPasswordConf" class="txtPass displayNone" title="Retype your password" value="Retype your password" maxlength="50" />
                        <?php if($btnPressed) $vaildator->confirmMatch($_POST['password'], $_POST['passwordConf'], true, 'Retype your password'); ?>
                    </li>
                </ul>
            </fieldset>
            <fieldset>
                <legend>Choose Your Subscription <span class="<?php echo $model->setSubTypeReq(); ?>">(required)</span></legend>
                <ul id="subType">
                    <li>
                        <input type="radio" name="subType" id="oneTour" value="oneTour" <?php echo $model->setSubTypeGroup('oneTour'); ?> />
                        <label for="oneTour">One Tour: Purchase one at a time, $30.00 each</label>
                    </li>
                    <li>
                        <input type="radio" name="subType" id="oneMonth" value="oneMonth" <?php echo $model->setSubTypeGroup('oneMonth'); ?> />
                        <label for="oneMonth">One Month: Recurring monthly payment of $25.00</label>
                    </li>
                    <li>
                        <input type="radio" name="subType" id="threeMonth" value="threeMonth" <?php echo $model->setSubTypeGroup('threeMonth'); ?> />
                        <label for="threeMonth">Three Months: One time payment of $67.50 - non-recurring</label>
                    </li>
                    <li>
                        <input type="radio" name="subType" id="sixMonth" value="sixMonth" <?php echo $model->setSubTypeGroup('sixMonth'); ?> />
                        <label for="sixMonth">Six Months: One time payment of $120.00 - non-recurring</label>
                    </li>
                    <li>
                        <input type="radio" name="subType" id="oneYear" value="oneYear" <?php echo $model->setSubTypeGroup('oneYear'); ?> />
                        <label for="oneYear">One Year: One time payment of $210.00 - non-recurring</label>
                    </li>
                </ul>
            </fieldset>
            <fieldset>
                <legend>How Did You Find Us <span class="<?php echo $model->setFoundByReq(); ?>">(required)</span></legend>
                <ul id="findType">
                    <li>
                        <input type="radio" name="foundBy" id="searchEng" value="searchEng" <?php echo $model->setFoundByGroup('searchEng'); ?> />
                        <label for="searchEng">Search Engine</label>
                    </li>
                    <li>
                        <input type="radio" name="foundBy" id="emailAd" value="emailAd" <?php echo $model->setFoundByGroup('emailAd'); ?> />
                        <label for="emailAd">E-Mail Advertisement</label>
                    </li>
                    <li>
                        <input type="radio" name="foundBy" id="sawTour" value="sawTour" <?php echo $model->setFoundByGroup('sawTour'); ?> />
                        <label for="sawTour">Saw One Of Our Tours</label>
                    </li>
                    <li>
                        <input type="radio" name="foundBy" id="friend" value="friend" <?php echo $model->setFoundByGroup('friend'); ?> />
                        <label for="friend">Friend or Associate</label>
                    </li>
                    <li>
                        <label for="foundByOther">Other:</label>
                        <input type="text" name="foundByOther" id="foundByOther" maxlength="50" value="<?php echo $model->setFoundByText(); ?>" />
                        <?php if($btnPressed && $_POST['foundByOther'] != '') $vaildator->valOtherText($_POST['foundByOther'], false, true); ?>
                    </li>
                </ul>
            </fieldset>
            <div class="<?php echo $model->isTosChecked(); ?>" id="tosDiv">
                <label for="tos"><a href="legalStuff/tosView.php" title="Terms of Service" target="_blank">I agree to the Terms of service</a></label>
                <input type="checkbox" name="tos" id="tos" value="agree" <?php echo $model->keepTosChecked(); ?> />
            </div>
            <button type="submit" name="nextStepBtn" id="nextStepBtn">Next Step</button> <!-- This will take the user to the payment page if there are no errors in the form -->
        </form>
    </section> <!-- End signUpArea section -->
</section> <!-- End mainContent section -->