<!DOCTYPE html>
<html>
    <head lang="en-US">
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta name="author" content="Spiffy Home Tours" />
        <meta name="description" content="Spiffy Home Tours provides interactive virtual tours to real estate agents to better market their properties.  With a simple straight forward tour building process and competitive prices, Spify Home Tours saves time and money!" />
        <meta name="keywords" content="Virtual Tours, Home Tours, Real Estate, Interactive Tours, Real Estate Virtual Tour, Realtor, Internet Marketing, Online Marketing, Online Real Estate Marketing, Homes For Sale, Slideshow" />
        <link rel="icon" href="public/img/favicon.ico" />
        <title><?php echo $this->controller->title; ?></title>
        <script type="text/javascript" src="public/js/jsLibraries/jQuery.js"></script>
        <script type="text/javascript" src="public/js/navMenu.js"></script>
        
        <?php
        // Loop through the CSS and Javascript arrays from the page controller and build the link and script tags needed for page rendering
        foreach($this->controller->cssArray as $urlMedia)
        {
            echo '<link rel="stylesheet" type="text/css" href="' . $urlMedia[0] . '" media="' . $urlMedia[1] . '" />';
        }
        foreach($this->controller->jsArray as $scriptPath)
        {
            echo '<script type="text/javascript" src="' . $scriptPath . '"></script>';
        }
        ?>
        
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="public/css/ieAddendum.css" media="screen" />
            <script type="text/javascript" src="public/js/html5shim.js"></script>
        <![endif]-->

        <!--[if lt IE 8]>
            <div id="tooOld" style='clear: both; height: 59px; padding:0 0 0 15px; position: relative;'>
                <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home?ocid=ie6_countdown_bannercode"><img src="http://storage.ie6countdown.com/assets/100/images/banners/warning_bar_0000_us.jpg" border="0" height="42" width="820" alt="You are using an outdated browser. For a faster, safer browsing experience, upgrade for free today." /></a>
            </div>
        <![endif]-->
    </head>
    <body id="<?php echo $this->controller->pageId; ?>">
        <noscript>
            <p id="jsWarning">It seems you have JavaScript disabled.  Please enable JavaScript for this site to function properly.</p>
        </noscript>
        
        <header> 
            <?php if(!isset($_SESSION['allowAccess'])) echo '<a href="Login" title="Login"><img src="public/img/login.png" alt="Login Page" /></a>'; // Show the login graphic if no user is logged in ?>

            <section>
                <p><a href="UserPanel" title="My Account">My Account</a> | <?php if(isset($_SESSION['allowAccess'])) echo '<a href="UserPanel-logout" title="Log Out">Log Out</a>';  else echo '<a href="Login" title="Login">Login</a>'; ?> | <a href="SignUp" title="Sign Up">Sign Up</a></p>
                <img src="public/img/logo.png" alt="Spiffy Home Tours Logo" />
            </section>
        </header>

        <nav>
            <ul id="navigation"> <!-- *** Remember: The btn img ids have to be the same as the file names *** -->
                <li><a href="Home" title="Home"><img src="public/img/navImgs/home.png" id="home" alt="Home Button" /></a></li>
                <li><a href="Samples" title="Samples"><img src="public/img/navImgs/samples.png" id="samples" alt="Samples Button" /></a></li>
                <li><a href="Pricing" title="Pricing"><img src="public/img/navImgs/pricing.png" id="pricing" alt="Pricing Button" /></a></li>
                <li><a href="SignUp" title="Sign Up"><img src="public/img/navImgs/signUp.png" id="signUp" alt="Sign Up Button" /></a></li>
                <li><a href="Tutorials" title="Tutorials"><img src="public/img/navImgs/tutorials.png" id="tutorials" alt="Tutorials Button" /></a></li>
                <li><a href="About" title="About"><img src="public/img/navImgs/about.png" id="about" alt="About Button" /></a></li>
                <li><a href="Contact" title="Contact"><img src="public/img/navImgs/contact.png" id="contact" alt="Contact Button" /></a></li>
            </ul>
        </nav>