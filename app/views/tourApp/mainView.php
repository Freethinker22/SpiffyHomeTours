<?php
$tourDirectory = $this->tourDirectory; // Used in tour.js to fetch the correct JSON config file
?>
<!DOCTYPE html> <!--This is a special view that doesn't use the framework's regular header or footer views -->
<html>
    <head lang="en-US">
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta name="author" content="Spiffy Home Tours" />
        <meta name="description" content="Spiffy Home Tours provides interactive virtual tours to real estate agents to better market their properties.  With a simple straight forward tour building process and competitive prices, Spify Home Tours saves time and money!" />
        <meta name="keywords" content="Virtual Tours, Home Tours, Real Estate, Interactive Tours, Real Estate Virtual Tour, Realtor, Internet Marketing, Online Marketing, Online Real Estate Marketing, Homes For Sale, Slideshow" />
        <link rel="icon" href="public/img/favicon.ico" />
        <link rel="stylesheet" type="text/css" href="public/css/tourApp/tour.css" media="screen" />
        <title>Spiffy Home Tours</title>
        
        <script type="text/javascript">var tourDirectory = '<?php echo rawurlencode($tourDirectory); ?>';</script>
        <script type="text/javascript" src="public/js/jsLibraries/fullSize/jQuery.js"></script>
        <script type="text/javascript" src="public/js/jsLibraries/fullSize/underscore.js"></script>
        <script type="text/javascript" src="public/js/jsLibraries/fullSize/TweenMax.js"></script>
        <script type="text/javascript" src="public/js/tourApp/param.js"></script>
        <script type="text/javascript" src="public/js/tourApp/tour.js"></script> <!-- *** Merge JS files and libraries after dev is complete *** -->
        
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="public/css/tourApp/ieAddendum.css" media="screen" />
            <script type="text/javascript" src="public/js/html5shim.js"></script>
        <![endif]-->

        <!--[if lt IE 8]>
            <div id="tooOld" style='clear: both; height: 59px; padding:0 0 0 15px; position: relative;'>
                <a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home?ocid=ie6_countdown_bannercode"><img src="http://storage.ie6countdown.com/assets/100/images/banners/warning_bar_0000_us.jpg" border="0" height="42" width="820" alt="You are using an outdated browser. For a faster, safer browsing experience, upgrade for free today." /></a>
            </div>
        <![endif]-->
    </head>
    <body>
        <noscript>
            <p id="jsWarning">It seems you have JavaScript disabled.  Please enable JavaScript for this page to function properly.</p>
        </noscript>
        
        <section id="tourWrapper" class="tourBg dropShadow">
            <section id="loading" class="displayNone">
<!--            <section id="loading">-->
                <img src="public/img/tourApp/tourLoading.gif" alt="Loading..." />
                <div class="loadingMask"></div>
                <div class="loadingMask"></div>
            </section>
            
            <section id="slideMenu"></section>
            
            <section id="tabMenu" class="tabText">
                <ul>
                    <li id="photoGal" class="topLeftRightBorder">Photo Gallery</li>
                    <li id="propInfo">Property Information</li>
                    <li id="propMap">Property Map</li>
                    <li id="agentInfo">Agent Information</li>
                    <li id="calc">Mortgage Calculator</li>
                </ul>
            </section>
            
            <section id="imgDisplay" class="topLeftBorder">
                <div id="infoBox" class="msgText eightyFivePctBg displayNone"><p class="hidden"></p></div>
                <div id="iaPicBg" class="tourBg zeroOpacity displayNone"></div>
                <p id="alertMsg" class="msgText eightyFivePctBg topLeftBorder displayNone"></p>
            </section>
            
            <section id="imgName" class="btnBarText sixtyPctBg topLeftBorder">
                <p id="imgNameText">Image Label</p>
            </section>
                        
            <section id="btnBar" class="btnBarText sixtyPctBg">
                <div id="musicBtns">
                    <p>Music:</p>
                    <p id="musicPlayBtn">Play</p>
                    <p>/</p>
                    <p id="musicPauseBtn">Pause</p>
                </div>
                <div id="tourBtns">
                    <p>Slideshow:</p>
                    <p id="tourPlayBtn">Play</p>
                    <p>/</p>
                    <p id="tourPauseBtn">Pause</p>
                </div>
            </section>
            
            <section id="addressBox" class="dropShadow topLeftBorder"></section>
            
            <section id="contactBox" class="dropShadow topLeftBorder"></section>
            
            <section id="shtLogo" class="twoThirdsOpacity">
                <a href="https://spiffyhometours.com" title="Spiffy Home Tours" target="_blank"><p class="logoText">Powered By:</p><img src="public/img/tourApp/logo.png" alt="Spiffy Home Tours" /></a>
            </section>
            
            <img id="prevBtn" class="fourFifthsOpacity clickable" src="public/img/tourApp/slideMenuPrevBtn.png" alt="Previous" />
            <img id="nextBtn" class="fourFifthsOpacity clickable" src="public/img/tourApp/slideMenuNextBtn.png" alt="Next" />
        </section> <!-- End tourWrapper section -->   
        
        <!-- ******* Underscore.js templates ******* -->
        <script id="addressBoxTemp" type="text/template">
            <div class="infoText">
                <ul>
                    <% _.each(address.data, function(input) { %>
                        <li> 
                            <%- input %>
                        </li>
                    <% }); %>
                </ul>
            </div>
        </script>
        
        <script id="contactBoxTemp" type="text/template">
            <% if(contact.data.agentPic) { %>
                <img src="<%- contact.data.agentPic %>" alt="Agent Pic" />
            <% } %>
            
            <div class="infoText">
                <ul>
                    <% _.each(contact.data.inputs, function(input) { %>
                        <li> 
                            <%- input %>
                        </li>
                    <% }); %>
                </ul>
            </div>
        </script>
                
        <!-- ******* Flash music player for old IE ******* -->
        <!--[if lt IE 9]>
            <script type="text/javascript">
                var isOldIe = true;
                var song = '';
                var autoplay = '';
                
                function songForOldIe() { return song; } // These first two functions are called by the FlashMusicPlayer from inside the AS3 
                function autoplayForOldIe() { return autoplay; }
                function startMusic() { document.getElementById("flashMusicPlayer").start(); } // This is called from the Music obj to setup the FlashMusicPlayer by calling a function inside the AS3
            </script>
            <object id="flashMusicPlayer" type="application/x-shockwave-flash" data="public/js/tourApp/swf/FlashMusicPlayer.swf" style="margin-left:-9999px; float:left;"> 
                <param name="movie" value="public/js/tourApp/swf/FlashMusicPlayer.swf" />
                <param name="quality" value="high" />
                <embed src="public/js/tourApp/swf/FlashMusicPlayer.swf" quality="high" />
            </object>
        <![endif]-->
    </body>
</html>

<!-- *** put some PHP here that updates the tours DB entry and updates the number of views it gets so that can be displayed to the client in the user panel *** -->
<!-- *** remember text input box length limits. addressBox: Max 30 chars, contactBox: Max 30 chars *** -->