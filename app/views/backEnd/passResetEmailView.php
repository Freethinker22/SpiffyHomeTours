<?php
$model = $this->model; // Shortcut to the model
$vaildator = $this->model->validator; // Shortcut to the Validator object in the model
$btnPressed = $this->model->btnPressed; // Shortcut to the btnPressed flag var in the model
?>

<section id="mainContent">
    <section id="resetBox">
        <?php
        if($model->passResetConfirm) // Confirmation msg that the user's password was reset
        {
            $this->loadView('alerts/passResetConfirm');
        }
        else // Revise later: maybe put the html below into its own view? But then, why bother having three view files for one page? Maybe redesign contoller to use just two views?
        {
        ?>
        <form name="passResetForm" id="passResetForm" method="post" action="PassReset" onSubmit="return checkFormStatus();">
            <ul>
                <li>
                    <label for="newPass">New Password:</label>
                    <input type="password" name="newPass" id="newPass" title="Min. 8 characters" value="<?php echo htmlspecialchars($btnPressed ? $_POST['newPass'] : ''); ?>" maxlength="50" />
                    <input type="text" name="txtNewPass" id="txtNewPass" title="Min. 8 characters" value="Min. 8 characters" maxlength="50" /> <!-- Text typed password fields are turned on and off onfocus by JS so default text is readable -->
                    <?php if($btnPressed) $vaildator->valPassword($_POST['newPass'], true); ?>
                </li>
                <li>
                    <label for="newPassConf">Confirm Password:</label>
                    <input type="password" name="newPassConf" id="newPassConf" title="Retype your password" value="<?php echo htmlspecialchars($btnPressed ? $_POST['newPassConf'] : ''); ?>" maxlength="50" />
                    <input type="text" name="txtNewPassConf" id="txtNewPassConf" title="Retype your password" value="Retype your password" maxlength="50" />
                    <?php if($btnPressed) $vaildator->confirmMatch($_POST['newPass'], $_POST['newPassConf'], true, 'Retype your password'); ?>
                </li>
            </ul>
            <button type="submit" name="passResetBtn" id="passResetBtn"><img src="public/img/btnDecor.png" />Reset Password</button>
        </form>
        <?php
        }
        ?>
    </section> <!-- End resetBox section -->
</section> <!-- End mainContent section -->