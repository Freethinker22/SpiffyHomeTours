<?php
$model = $this->model; // Shortcut to the model
$vaildator = $this->model->validator; // Shortcut to the Validator object in the model
$btnPressed = $this->model->btnPressed; // Shortcut to the btnPressed flag var in the model
?>

<section id="mainContent">
    <section id="loginBox">
        <?php
        if($model->forgotPassConfirm) // Confirm that an email with their password was sent to them
        {
            $this->loadView('alerts/forgotPassConfirm');
        }
        else
        {
            ?>
            <form name="forgotPassForm" id="forgotPassForm" method="post" action="ForgotPass" onSubmit="return checkFormStatus();">
                <ul>
                    <li>
                        <label for="email">E-mail Address: <?php if($btnPressed) $vaildator->valEmail($_POST['email'], true, true); ?></label>
                        <input type="text" name="email" id="email" value="<?php if($btnPressed) echo htmlspecialchars($_POST['email']); ?>" maxlength="50" />
                    </li>
                    <li class="centered">
                        <button type="submit" name="forgotBtn" id="forgotBtn"><img src="public/img/btnDecor.png" />Send</button>
                    </li>
                </ul>
            </form>
            <?php
            if($model->emailNotIdDb) // If the user's email isn't in the DB, this error msg box will be displayed
            {
                $this->loadView('alerts/emailNotInDb');
            }
            else
            {
                ?>
                <p class="alertTextBg">Kindly provide your e-mail address and instructions on reseting your password will be e-mailed to you.</p>
                <?php
            }
        }
        ?>
    </section> <!-- End loginBox section -->
</section> <!-- End mainContent section -->