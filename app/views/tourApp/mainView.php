<?php
$tourDirectory = $this->tourDirectory; // Used in tour.js to fetch the correct JSON config file
?>

<!-- ===============================================================================================
This is a special view that doesn't use the framework's regular header or footer views
================================================================================================ -->

<!DOCTYPE html>
<html>
	<head lang="en-US">
		<meta charset="utf-8">
		<meta name="author" content="Spiffy Home Tours" />
		<meta name="description" content="Spiffy Home Tours provides interactive virtual tours to real estate agents to better market their properties.  With a simple straight forward tour building process and competitive prices, Spify Home Tours saves time and money!" />
		<meta name="keywords" content="Virtual Tours, Home Tours, Real Estate, Interactive Tours, Real Estate Virtual Tour, Realtor, Internet Marketing, Online Marketing, Online Real Estate Marketing, Homes For Sale, Slideshow" />
		<link rel="icon" href="public/img/favicon.ico" />
		<link rel="stylesheet" href="public/css/font-awesome/font-awesome.css" media="screen" />
		<link rel="stylesheet" href="public/css/tourApp/tour.css" media="screen" />
		<title>Spiffy Home Tours</title>
		<!--[if lt IE 9]>
			<link rel="stylesheet" href="public/css/tourApp/ieAddendum.css" media="screen" />
			<script src="public/js/html5shim.js"></script>
			<script src="public/js/css3-mediaqueries.js"></script>
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
			  <!--<section id="loading">-->
				<img src="public/img/tourApp/tourLoading.gif" alt="Loading..." />
				<div class="loadingMask"></div>
				<div class="loadingMask"></div>
			</section>
			
			<section id="tabMenu">
				<ul class="pt85em">
					<li id="photoGal" class="tabBorder dropShadowSm">Photo Gallery</li>
					<li id="propInfo" class="dropShadowSm">Property Information</li>
					<li id="propMap" class="dropShadowSm">Property Map</li>
					<li id="agentInfo" class="dropShadowSm">Agent Information</li>
					<li id="calc" class="dropShadowSm">Mortgage Calculator</li>
				</ul>
			</section>
			
			<section id="slideMenu"></section>
							
			<section id="slideScrollbar" class="scrollTrack">
				<div id="slideScrollHandle" class="scrollHandle">
					<img class="fluid" src="public/img/tourApp/scrollbarHandle.png" alt="Scrollbar handle" />
				</div>
			</section>
			
			<section id="prevBtn">
				<img class="fluid opacity80" src="public/img/tourApp/slideMenuPrevBtn.png" alt="Previous" />
			</section>
			
			<section id="nextBtn">
				<img class="fluid opacity80" src="public/img/tourApp/slideMenuNextBtn.png" alt="Next" />
			</section>
			
			<section id="imgDisplay" class="borderTL">
				<div id="tourImgMask" class="tourBg opacity0 displayNone"></div>
				<div id="infoBox" class="bg85Pct displayNone"><p class="pt85em hidden"></p></div>
				<div id="alertMsg" class="bg85Pct borderTL displayNone"><p class="pt85em"></p></div>
			</section>
			
			<section id="imgName" class="bg60Pct borderTL">
				<p id="imgNameText">Image Label</p>
			</section>
			
			<section id="btnBar" class="bg60Pct">
				<div id="musicBtns" class="pt85em">
					<p>Music:</p>
					<p id="musicPlayBtn">Play</p>
					<p>/</p>
					<p id="musicPauseBtn">Pause</p>
				</div>
				<div id="tourBtns" class="pt85em">
					<p>Slideshow:</p>
					<p id="tourPlayBtn">Play</p>
					<p>/</p>
					<p id="tourPauseBtn">Pause</p>
				</div>
			</section>
			
			<section id="addressBox" class="dropShadow borderTL"></section>
			
			<section id="contactBox" class="dropShadow borderTL"></section>
			
			<section id="shtLogo" class="opacity66">
				<a href="https://spiffyhometours.com" title="Spiffy Home Tours" target="_blank"><p class="pt85em">Powered By:</p><img class="fluid" src="public/img/tourApp/logo.png" alt="Spiffy Home Tours" /></a>
			</section>
		</section> <!-- End tourWrapper section -->
		
		<!-- ===========================================================================================
		Underscore.js templates
		============================================================================================ -->
		
		<!-- *** Scrollbar *** -->
		<script id="scrollbarTemp" type="text/template">
			<section id="scrollbar">
				<div id="scrollTrack" class="scrollTrack"></div>
				<div id="scrollUpArrow" class="scrollArrows">
					<img class="fluid" src="public/img/tourApp/scrollbarUpArrow.png" alt="Up arrow" />
				</div>
				<div id="scrollDownArrow"class="scrollArrows">
					<img class="fluid" src="public/img/tourApp/scrollbarDownArrow.png" alt="Down arrow" />
				</div>
				<div id="scrollHandle"class="scrollHandle">
					<img class="fluid" src="public/img/tourApp/scrollbarHandle.png" alt="Scrollbar handle" />
				</div>
			</section>
		</script>
		
		<!-- *** Property information tab page *** -->
		<script id="propInfoTemp" type="text/template">
			<section class="tabContentBox">
				<div id="leftCol" class="tabLeftCol">
					<h1 class="tabHeaderAlt">About</h1>
					<article class="borderTLBlk">
						<p id="aboutText">
						<%- prop.data.about %>
						</p>
					</article>                    
				</div>
		    
				<div class="tabRightCol">
					<h1 class="tabHeaderAlt">Details</h1>
					<ul class="borderTopBlk">
						<% _.each(prop.data.inputs, function(input) { %>
							<li class="tabBotBorder tabInfoLines">
								<%= input %>
								<% /* Any JSON data that is a string of HTML needs to use <%= instead of <%- because the second one escapes HTML special chars and will mess up any HTML with double quotes in the data */ %>
							</li>
						<% }); %>
					</ul>
					<div class="borderTLBlk">
						<% /* Test to make sure the two info links are in the data */ %>
						<% if(prop.data.neighborhoodInfoUrl) { %>
						<p>
							<a href="<%- prop.data.neighborhoodInfoUrl %>" target="_blank">Neighborhood Information &gt;</a>
						</p>
						<% } %>
						<% if(prop.data.schoolInfoUrl) { %>
						<p>
							<a href="<%- prop.data.schoolInfoUrl %>" target="_blank">School Information &gt;</a>
						</p>
						<% } %>
					</div>
				</div>
			</section>
		</script>
		
		<!-- *** Property map tab page *** -->
		<script id="propMapTemp" type="text/template">
			<section id="mapCanvas" class="tabContentBox"></section>
		</script>
		
		<!-- *** Agent information tab page *** -->
		<script id="agentInfoTemp" type="text/template">
			<section class="tabContentBox">
				<h1 class="tabHeader">
					<%- agent.data.name %>
				</h1>
				
				<div class="tabImgs">
					<% if(agent.data.agentPic) { %>
						<div id="agentPic">
							<img class="fluid" src="<%- agent.data.agentPic %>" alt="Agent Pic" />
						</div>
						<% } %>
						<br />
						<% if(agent.data.logo) { %>
						<div id="agentLogo">
							<img class="fluid" src="<%- agent.data.logo %>" alt="Agency Logo" />
						</div>
					<% } %>
				</div>
				
				<div class="tabInfo">
					<ul>
						<% _.each(agent.data.inputs, function(input) { %>
							<li class="tabBotBorder tabInfoLines">
								<%= input %>
							</li>
						<% }); %>
					</ul>
				</div>
			</section>
		</script>
		
		<!-- *** Calculator tab page *** -->
		<script id="calcTemp" type="text/template">
			<section class="tabContentBox">
				<h1 class="tabHeader">
					Mortgage Calculator
				</h1>
				<ul class="tabCalc">
					<li class="tabBotBorder">
						<label for="price">Purchase Price</label>
						<input id="price" class="tabCalcRightCol" type="text" />
					</li>
					
					<li class="tabBotBorder">
						<label for="downPmt">Down Payment</label>
						<input id="downPmt" class="tabCalcRightCol" type="text" />
					</li>
					
					<li class="tabBotBorder">
						<label for="interestRate">Interest Rate</label>
						<input id="interestRate" class="short tabCalcRightCol" type="text" />
						<span class="tabCalcRightCol">%</span>
					</li>

					<li class="tabBotBorder">
						<label for="loanTerm">Loan Term</label>
						<input id="loanTerm" class="short tabCalcRightCol" type="text" />
						<span class="tabCalcRightCol">Years</span>
					</li>
					
					<li class="tabBotBorder">
						<label for="propTax">Property Taxes (1Yr)</label>
						<input id="propTax" class="tabCalcRightCol" type="text" />
					</li>
					
					<li class="tabBotBorder">
						<label for="propInsur">Property Insurance (1Yr)</label>
						<input id="propInsur" class="tabCalcRightCol" type="text" />
					</li>

					<li class="tabBotBorder">
						<label for="pmi">PMI (1Yr)</label>
						<input id="pmi" class="tabCalcRightCol" type="text" />
					</li>
					
					<li class="tabBotBorder">
						<p>Loan Amount</p>
						<span id="loanAmt" class="tabCalcRightCol">$0.00</span>
						<div id="calculateBtn" class="tabCalcRightCol tabCalcBtn dropShadowSm">Calculate</div>
					</li>
					<li class="tabBotBorder">
						<p>Loan Payment</p>
						<span id="loanPmt" class="tabCalcRightCol">$0.00</span>
						<div id="amortizeBtn" class="tabCalcRightCol tabCalcBtn dropShadowSm">Amortize</div>
					</li>

					<li class="tabBotBorder">
						<p>Mortgage Payment</p>
						<span id="mortgagePmt" class="tabCalcRightCol">$0.00</span>
						<div id="clearBtn" class="tabCalcRightCol tabCalcBtn dropShadowSm">Clear</div>
					</li>
				</ul>
			</section>
		</script>

		<!-- *** Amortization chart *** -->
		<script id="amortizeTemp" type="text/template">
			<section class="tabContentBox">
				<h1 class="tabHeader">
					Amortization Chart
				</h1>

				<ul id="amorLabels">
					<li>Payment Number</li>
					<li>Payment Amount</li>
					<li>Interest Portion</li>
					<li>Principal Portion</li>
					<li>Interest <br /> Paid</li>
					<li>Principal Balance</li>
				</ul>
					
				<div id="amorWrapper"></div>
			</section>
		</script>

		<!-- *** Address information box *** -->
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
		
		<!-- *** Contact information box *** -->
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
		
		<!-- ===========================================================================================
		Flash music player for old IE
		============================================================================================ -->
		<!--[if lt IE 9]>
			<script>
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
		
		<!-- ===========================================================================================
		JavaScript
		============================================================================================ -->
		<script>var tourDirectory = '<?php echo rawurlencode($tourDirectory); ?>';</script>
		<script src="public/js/jsLibraries/fullSize/jQuery-1.10.2.js"></script>
		<script src="public/js/jsLibraries/fullSize/underscore-1.5.2.js"></script>
		<script src="public/js/jsLibraries/fullSize/TweenMax-1.11.2.js"></script>
		<script src="public/js/vendor/mousewheel.js"></script>
		<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDkz_Wk9GyccNY42pGI3VH1kIIgcABz7uA&sensor=false"></script>
		<script src="public/js/tourApp/tour.js"></script> <!-- *** Merge minified versions of the JS libraries into one file after dev is complete *** -->
	</body>
</html>

<!-- ******* Notes for the tour building application ******* -->
<!-- *** put some PHP here that updates the tours DB entry and updates the number of views it gets so that can be displayed to the client in the user panel, could use Ajax too? *** -->
<!-- *** text input box length limits. addressBox: Max 30 chars, contactBox: Max 30 chars *** -->
<!-- *** text input box length limits. agent email: Max 50 chars, website: 100 chars for the agent info tab page
<!-- *** text input box length limits. agent email: Max 40 chars for the property info tab page details, including label *** limit of 11 total inputs ***
<!-- *** size limits for agent pic and logo agent pic: height:250, width:150  logo: height:150, width:250 maybe do some kind of size check on the server side? *** -->
<!-- *** HTML hyperlinks put into the tab pages from the JSON file will need to be created using PHP *** -->
<!-- *** use conditional type loading for jquery 1 and 2 *** -->