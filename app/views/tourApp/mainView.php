<?php
$tourDirectory = $this->tourDirectory;
?>
<!DOCTYPE html>
<html>
    <head lang="en-US">
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta name="author" content="Spiffy Home Tours" />
        <meta name="description" content="Spiffy Home Tours provides interactive virtual tours to real estate agents to better market their properties.  With a simple straight forward tour building process and competitive prices, Spify Home Tours saves time and money!" />
        <meta name="keywords" content="Virtual Tours, Home Tours, Real Estate, Interactive Tours, Real Estate Virtual Tour, Realtor, Internet Marketing, Online Marketing, Online Real Estate Marketing, Homes For Sale, Slideshow" />
        <link rel="icon" href="public/img/favicon.ico" />
        <title>Spiffy Home Tours</title>
        
        <script type="text/javascript">var tourDirectory = '<?php echo rawurlencode($tourDirectory); ?>';</script> <!-- Used in tourMain.js to fetch the correct JSON config file -->
        <script type="text/javascript" src="public/js/jQuery/jquery-1.8.3.min.js"></script>
        <script type="text/javascript" src="public/js/tourApp/tourMain.js"></script>
        
    </head>
    <body>
        <p>Tour goes here!</p>
    </body>
</html>