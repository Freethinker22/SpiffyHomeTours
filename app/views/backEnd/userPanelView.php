<?php
$model = $this->model; // Shortcut to the model
?>
<section id="mainContent">
    <h1>User Panel:</h1>
    <p>Welcome to the tour management panel! This is where the user will be able to see, create, edit, and delete their tours as well as edit their profile.</p>
    
    <table id="dbResults">
        <tr>
            <td class="columnTitle">User ID</td>
            <td class="columnTitle">First Name</td>
            <td class="columnTitle">Last Name</td>
            <td class="columnTitle">Phone</td>
            <td class="columnTitle">Company</td>
            <td class="columnTitle">Website</td>
            <td class="columnTitle">Email</td>
        </tr>
        <tr>
            <td><?php echo $_SESSION['userId']; ?></td>
            <td><?php echo $model->userDataArray['firstName']; ?></td>
            <td><?php echo $model->userDataArray['lastName']; ?></td>
            <td><?php echo $model->userDataArray['phone']; ?></td>
            <td><?php echo $model->userDataArray['compName']; ?></td>
            <td><?php echo $model->userDataArray['website']; ?></td>
            <td><?php echo $model->userDataArray['email']; ?></td>
        </tr>
        <tr>
            <td class="columnTitle">Sub Type</td>
            <td class="columnTitle">Found By</td>
            <td class="columnTitle">TOS</td>
            <td class="columnTitle">Sign Up Date</td>
            <td class="columnTitle">Sub Ex Date</td>
            <td class="columnTitle">Last Login</td>
            <td class="columnTitle">Active</td>
        </tr>
        <tr>
            <td><?php echo $model->userDataArray['subType']; ?></td>
            <td><?php echo $model->userDataArray['foundBy']; ?></td>
            <td><?php echo $model->userDataArray['tos']; ?></td>
            <td><?php echo $model->userDataArray['signUpDate']; ?></td>
            <td><?php echo $model->userDataArray['subExDate']; ?></td>
            <td><?php echo $model->userDataArray['lastLogin']; ?></td>
            <td><?php echo $model->userDataArray['active']; ?></td>
        </tr>
    </table>
    <p class="columnTitle">Password: <?php echo $model->userDataArray['password']; ?></p>
    <p><a href="UserPanel-logout" title="Log Out">Log Out</a></p>
    <p><a href="PassReset" tile="Password Reset">Password Reset</a></p>
</section>