<?php
$model = $this->model; // Shortcut to the model
$vaildator = $this->model->validator; // Shortcut to the Validator object in the model
$btnPressed = $this->model->btnPressed; // Shortcut to the btnPressed flag var in the model
?>

<section id="mainContent">
    <?php
    // See if the denyAccess error flag in the model is set to true. If so, include the error msg
    if($model->denyAccess)
    {
        $this->loadView('alerts/denyAccess');
    }
    ?>
    <section id="loginBox">
        <form name="loginForm" id="loginForm" method="POST" action="Login">
            <ul>
                <li>
                    <label for="email">E-mail Address: <?php if($btnPressed) $vaildator->valEmail($_POST['email'], true, true); ?></label>
                    <input type="text" name="email" id="email" value="<?php echo $model->emailFieldValue(); ?>" maxlength="50" />
                </li>
                <li>
                    <label for="password">Password: <?php if($btnPressed) $vaildator->valPassword($_POST['password'], true); ?></label>
                    <input type="password" name="password" id="password" maxlength="50" />
                </li>
                <li class="centered">
                    <label for="rememberEmail">Remember E-mail</label>
                    <input type="checkbox" name="rememberEmail" id="rememberEmail" <?php echo $model->checkForCookie(); ?>/>
                </li>
                <li class="centered">
                    <button type="submit" name="loginBtn" id="loginBtn"><img src="public/img/btnDecor.png" />Login</button>
                </li>
                <li class="centered">
                    <a href="ForgotPass" title="Forgot Password">Forgot your password?</a>
                </li>
            </ul>
        </form>
    </section> <!-- End loginBox section -->
</section> <!-- End mainContent section -->