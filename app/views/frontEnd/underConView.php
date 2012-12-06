<!DOCTYPE html>  <!--This is a special view that doesn't use the regular header or footer views -->
<html>
    <head lang="en-US">
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <link rel="stylesheet" type="text/css" href="public/css/reset.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="public/css/theme.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="public/css/underCon.css" media="screen" />
        <link rel="icon" href="public/img/favicon.ico" />
        <script type="text/javascript" src="public/js/utils.js"></script>
        <script type="text/javascript" src="public/js/frontEnd/underConPage.js"></script>
        <title>Under construction</title>
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="public/css/ieAddendum.css" media="screen" />
            <script type="text/javascript" src="public/js/html5shim.js"></script>
        <![endif]-->

        <!--[if lt IE 8]>
            <div style=' clear: both; height: 59px; padding:0 0 0 15px; position: relative;'> <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home?ocid=ie6_countdown_bannercode"><img src="http://storage.ie6countdown.com/assets/100/images/banners/warning_bar_0000_us.jpg" border="0" height="42" width="820" alt="You are using an outdated browser. For a faster, safer browsing experience, upgrade for free today." /></a></div>
        <![endif]-->
    </head>
    
    <body>
        <noscript><p id="jsWarning">It seems you have JavaScript disabled.  Please enable JavaScript for this site to function properly.</p></noscript>
        <header>
            <section>
                <img src="public/img/logo.png" alt="Spiffy Home Tours Logo" />
            </section>
        </header>
        
        <nav>
            <p>Under Construction</p>
        </nav>
        <section id="mainContent">
            <p class="msgBox">Welcome to Spiffy Home Tours!  The site is currently still being built but if you would like to be notified when it goes live, please send me your email address.  You'll be sent a message when the site is about to launch.  To see what's done so far, follow the home page link below.</p>
            <?php
            if($this->model->tooFast)
            {
                $this->loadView('alerts/tooFast');
            }
            ?>
            <section id="notifyBox">
                <?php
                $this->model->underConThanksMsg ? $this->loadView('alerts/beInTouch') : $this->loadView('frontEnd/notifyMeView'); // Show the thank you msg if the flag is true, otherwise show the default page
                ?>
                <aside id="links"><a href="Home">Home Page</a> | <a href="mattsResume">Matt's Resume</a></aside>
            </section>
        </section>
        <footer>
            <p>Copyright 2012 &copy; Spiffy Home Tours. All rights reserved<br />Programmed in the USA</p>
        </footer>
    </body>
</html>