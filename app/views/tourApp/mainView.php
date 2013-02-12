<?php
$tourDirectory = $this->tourDirectory; // Used in tourMain.js to fetch the correct JSON config file
?>
<!DOCTYPE html> <!--This is a special view that doesn't use the regular header or footer views -->
<html>
    <head lang="en-US">
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta name="author" content="Spiffy Home Tours" />
        <meta name="description" content="Spiffy Home Tours provides interactive virtual tours to real estate agents to better market their properties.  With a simple straight forward tour building process and competitive prices, Spify Home Tours saves time and money!" />
        <meta name="keywords" content="Virtual Tours, Home Tours, Real Estate, Interactive Tours, Real Estate Virtual Tour, Realtor, Internet Marketing, Online Marketing, Online Real Estate Marketing, Homes For Sale, Slideshow" />
        <link rel="icon" href="public/img/favicon.ico" />
        <link rel="stylesheet" type="text/css" href="public/css/tourApp/tourMain.css" media="screen" />
        <title>Spiffy Home Tours</title>
        
        <script type="text/javascript">var tourDirectory = '<?php echo rawurlencode($tourDirectory); ?>';</script>
        <script type="text/javascript" src="public/js/jsLibraries/fullSize/jQuery.js"></script>
        <script type="text/javascript" src="public/js/jsLibraries/fullSize/underscore.js"></script>
        <!--<script type="text/javascript" src="public/js/jsLibraries/fullSize/backbone.js"></script>-->
        <script type="text/javascript" src="public/js/jsLibraries/fullSize/TweenMax.js"></script>
        <script type="text/javascript" src="public/js/tourApp/param.js"></script>
        <script type="text/javascript" src="public/js/tourApp/tourMain.js"></script> <!-- *** Merge js files and libraries after dev is complete *** -->
        
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="public/css/tourApp/ieAddendum.css" media="screen" />
            <script type="text/javascript" src="public/js/html5shim.js"></script>
        <![endif]-->

        <!--[if lt IE 8]>
            <div id="tooOld" style='clear: both; height: 59px; padding:0 0 0 15px; position: relative;'> <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home?ocid=ie6_countdown_bannercode"><img src="http://storage.ie6countdown.com/assets/100/images/banners/warning_bar_0000_us.jpg" border="0" height="42" width="820" alt="You are using an outdated browser. For a faster, safer browsing experience, upgrade for free today." /></a></div>
        <![endif]-->
    </head>
    <body>
<!--        <button id="prevSlide">Prev</button>
        <button id="nextSlide">Next</button>-->
        <section id="viewport" class="dropShadow">
            <section id="loading" class="displayNone">
                <img src="public/img/tourApp/tourLoading.gif" alt="Loading..." />
                <div class="loadingMask"></div>
                <div class="loadingMask"></div>
            </section>
            
            <section id="slideMenu"></section>
            
            <section id="imgDisplay" class="dropShadow"></section>
            
            <section id="propInfo" class="dropShadow oneThirdOpacity"></section>
            
            <section id="agentInfo" class="dropShadow oneThirdOpacity"></section>
            
            <section id="shtLogo" class="twoThirdsOpacity"><a href="https://spiffyhometours.com" title="Spiffy Home Tours" target="_blank"><p class="logoText">Powered By:</p><img src="public/img/tourApp/logo.png" alt="Spiffy Home Tours" /></a></section>
            
            <img id="prevBtn" class="fourFifthsOpacity" src="public/img/tourApp/slideMenuPrevBtn.png" alt="Previous" />
            <img id="nextBtn" class="fourFifthsOpacity" src="public/img/tourApp/slideMenuNextBtn.png" alt="Next" />
        </section>        
        
        <!-- Templates -->
        <script id="slideTemp" type="text/template">
            <img src="<%= path %>" alt="<%= name %>" class="loadingThumb" />
        </script>
        
        <!-- *** put some PHP here that updates the tours DB entry and updates the number of views it gets so that can be displayed to the client in the user panel *** -->
    </body>
</html>