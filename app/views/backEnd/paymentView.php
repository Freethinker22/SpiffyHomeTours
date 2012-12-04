<?php // Note: the session vars are created in the sign up page controller
$model = $this->model; // Shortcut to the model
?>
<section id="mainContent">
    <h1>Pay Here:</h1>
    <p>This is where the payment page will go.</p>
    <p>Remember the user's account is not created in the DB until after payment confirmation.</p>
    <p>*** Will need to buy an outside payment application for use here. ***</p>
    
    <?php // Check to see if the error flag in the model is set to true. If so, include the error msg
    if($model->emailTaken)
    {
        $this->loadView('errors/errorEmailTaken');
    }
    ?>
    
    <table id="userTable"> <!-- *** Remember in final production not to submit the user data to the DB until payment is processed!  After data goes to the DB send thank you email *** -->
        <tr>
            <td class="columnTitle">First Name</td>
            <td class="columnTitle">Last Name</td>
            <td class="columnTitle">Phone</td>
            <td class="columnTitle">Company</td>
            <td class="columnTitle">Website</td>
        </tr>
        <tr>
            <td><?php echo $_SESSION['firstName']; ?></td>
            <td><?php echo $_SESSION['lastName']; ?></td> 
            <td><?php echo $_SESSION['phone']; ?></td>
            <td><?php echo $_SESSION['compName']; ?></td>
            <td><?php echo $_SESSION['website']; ?></td>
        </tr>
        <tr>
            <td class="columnTitle">Email</td>
            <td class="columnTitle">Password</td>
            <td class="columnTitle">Sub Type</td>
            <td class="columnTitle">Found By</td>
            <td class="columnTitle">TOS</td>
        </tr>
        <tr>
            <td><?php echo $_SESSION['email']; ?></td>
            <td><?php echo $_SESSION['password']; ?></td>
            <td><?php echo $_SESSION['subType']; ?></td>
            <td><?php echo $_SESSION['foundBy']; ?></td>
            <td><?php echo $_SESSION['tos']; ?></td>
        </tr>
    </table>
    
    <form name="paymentForm" id="paymentForm" method="post" action="Payment">
        <input type="submit" name="paymentBtn" id="paymentBtn" value="Pay Here" />
    </form> 
</section>