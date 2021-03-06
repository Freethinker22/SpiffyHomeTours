<?php
$model = $this->model; // Shortcut to the model
$vaildator = $this->model->validator; // Shortcut to the Validator object in the model
$btnPressed = $this->model->btnPressed; // Shortcut to the btnPressed flag var in the model
?>

<section id="mainContent">
    <?php
    if($model->passNoMatch) // Alert telling the user their old password doesn't match what's on file
    {
        $this->loadView('alerts/passNoMatch');
    }
    ?>
    <section id="resetBox">
        <?php
        if($model->passResetConfirm) // Confirmation msg that the user's password was reset
        {
            $this->loadView('alerts/passResetConfirm');
        }
        else // Revise later: Maybe put the html below into its own view? But then, why bother having three view files for one page? Maybe redesign contoller to use just two views?
        {
        ?>
        <form name="passResetForm" id="passResetForm" method="POST" action="PassReset">
            <ul>
                <li>
                    <label for="oldPass">Old Password:</label>
                    <input type="password" name="oldPass" id="oldPass" title="Your old password" value="<?php echo htmlspecialchars($btnPressed ? $_POST['oldPass'] : ''); ?>" maxlength="50" />
                    <input type="text" name="txtOldPass" id="txtOldPass" class="lightGrayText displayNone" title="Your old password" value="Your old password" maxlength="50" /> <!-- Text typed password fields are toggled by JS so default text is readable -->
                    <?php if($btnPressed) $vaildator->valPassword($_POST['oldPass'], true); ?>
                </li>
                <li>
                    <label for="newPass">New Password:</label>
                    <input type="password" name="newPass" id="newPass" title="Min. 8 characters" value="<?php echo htmlspecialchars($btnPressed ? $_POST['newPass'] : ''); ?>" maxlength="50" />
                    <input type="text" name="txtNewPass" id="txtNewPass" class="lightGrayText displayNone" title="Min. 8 characters" value="Min. 8 characters" maxlength="50" />
                    <?php if($btnPressed) $vaildator->valPassword($_POST['newPass'], true); ?>
                </li>
                <li>
                    <label for="newPassConf">Retype Password:</label>
                    <input type="password" name="newPassConf" id="newPassConf" title="Retype your password" value="<?php echo htmlspecialchars($btnPressed ? $_POST['newPassConf'] : ''); ?>" maxlength="50" />
                    <input type="text" name="txtNewPassConf" id="txtNewPassConf" class="lightGrayText displayNone" title="Retype your password" value="Retype your password" maxlength="50" />
                    <?php if($btnPressed) $vaildator->confirmMatch($_POST['newPass'], $_POST['newPassConf'], true); ?>
                </li>
            </ul>
            <button type="submit" name="passResetBtn" id="passResetBtn"><img src="public/img/btnDecor.png" />Reset Password</button>
        </form>
        <?php
        }
        ?>
    </section> <!-- End resetBox section -->
</section> <!-- End mainContent section -->