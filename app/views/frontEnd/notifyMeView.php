<?php
$loadTime = time();
$vaildator = $this->model->validator; // Shortcut to the Validator object in the model
$btnPressed = $this->model->btnPressed; // Shortcut to the btnPressed flag var in the model
?>
<form name ="notifyForm" id="notifyForm" action="Under" method="POST">
    <input type="text" name="notifyEmail" id="notifyEmail" title="Enter your email address" value="<?php echo htmlspecialchars($btnPressed ? $_POST['notifyEmail'] : 'Enter your email address'); ?>" maxlength="50" />
    <?php if($btnPressed) $vaildator->valEmail($_POST['notifyEmail'], true, true, 'Enter your email address'); ?>
    
    <div class="center"><button type="submit" name="notifyBtn" id="notifyBtn"><img src="public/img/btnDecor.png" />Notify Me</button></div>
    <input type="hidden" name="loadTime" id="loadTime" value="<?php echo $loadTime ?>" maxlenght="50" />
</form>