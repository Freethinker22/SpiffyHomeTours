$(function()
{        
	$.getJSON('tours/' + window.tourDirectory + '/config.json', function(config) // Get the config file for a specific tour, window.tourDirectory is set in mainView.php
	{
		document.title = config.pageTitle;
		$('head title').before('<link rel="stylesheet" href="public/css/tourApp/' + config.theme + '" media="screen" />'); // Inject the correct theme stylesheet into the head
				
		// References to data arrays in the the config file
		var imgArray = config.images;
		var imgArrLen = imgArray.length;
		var agentInfo = config.agentInfo;
		var propMap = config.propMap;
		var propInfo = config.propInfo;
		var addressBox = config.addressBox;
		var contactBox = config.contactBox;
		var music = config.music;
		
		/*************
		The Param object holds all of the configurable variables for the tour application
		*************/
		var Param =
		{
			// SlideMenu obj
			centerGap: 15, // centerGap pushes the top and bottom halves of slide array away from the center so the two slides neighboring the center slide show more
			horiSpace: 10, // Space between slides on the X axis
			vertSpace: 63, // Space between slides on the Y axis
			topZ: 200, // Z-index of the upper most slide, this number must be greater than the number of slides to display
			maxHoriRatio: .60, // Imgs with a height to width ratio less than this are considered horizontal panos and tweened as such
			slideTweenTime: 1.25, // Slide menu animation length
			scrollHandleTime: .50, // Slide menu scrollbar animation length

			// Preloader obj
			amtToLoad: 6, // Number of imgs to load before the tour starts
			maskTweenTime: 4, // Number of seconds the preloader mask takes to open
			maskOpacity: .75, // Opacity percentage preloader mask fade too when opening

			// ImageDisplay obj
			pixelsPerSec: 25, // Used to calculate the tour img's tween time
			fadeDelay: 1.25, // The amount of time it takes a tour img to fade in or out during a transition
			maxTweenTime: 17, // Max number of seconds that a tour img will take to tween in one direction
			minTweenTime: 10, // Min number of seconds that a tour img will be tweening in one direction
			
			// Scrollbar ojb
			pixelsPerClick: 16, // Amount of pixels the scroll handle is moved each time the up/down arrow is clicked
			
			// Utilities
			stdFadeTime: .50, // Standard fade in/out time 
			isTouchCapable: false,
			
			init:function()
			{                
				if(('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) // Detect browsers with either touch events or pointer events running on touch capable devices
				{
					this.isTouchCapable = true;
				}                
			}
		}
				
		/*************
		The WindowSize object listens for a change to the browser's size and calls the functions necessary to update the tour's objs
		*** Note: The timer is used because the resize event is fired anytime the browser resizes, the timer only goes off once the resizing has finished
		*************/
		var WindowSize =
		{            
			init:function()
			{
				var currFontSize = parseFloat($('body').css('font-size'));
				var newFontSize = 0;
				var timer;
				
				$(window).resize(function()
				{
					clearTimeout(timer);
					timer = setTimeout(function() // Update all parts of the tour app that need to be reset when the browser resizes
					{
						newFontSize = parseFloat($('body').css('font-size')); // The font-size of the body tag is changed in the media queries at certain browser sizes
						
						if(newFontSize !== currFontSize) // If the media queries changed the size of the tour, update the tour's objs
						{
							ImgName.resetPos();
							ImgDisplay.resetSize();
							SlideMenu.resetSize();
							SlideScrollbar.resetSize();
							currFontSize = newFontSize;
						}
					}, 600);
				});
			}
		}
								
		/*************
		The Preloader obj handles the reordering and preloading of the tour imgs and the preloading of any interactive pics
		*************/
		var Preloader =
		{
			preloadArray: [], // Each preloadArray element is a reference to each of the img objs in the config file
			loadCount: 0, // The total number of tour imgs downloaded
			startCount: 0, // When a set amount of tour imgs have finished loading, the tour is started
			
			// Populate the preloadArray with the tour imgs in the order they're to be loaded, this way the slides in the slide menu are loaded starting with the center slide and radiating outwards towards the ends of the menu
			init:function()
			{
				var topHalf = imgArray.slice(0, Math.floor(imgArrLen / 2 + 1));
				var bottomHalf = imgArray.slice(Math.floor(imgArrLen / 2 + 1), imgArrLen).reverse();
				var topLen = topHalf.length;
				var botLen = bottomHalf.length;
				
				// *** Note: Native JS for loops are used in most situations instead of jQuery each loops to increase performance
				for(var i = 0; i < Math.max(topLen, botLen); i++) // 'Zip' the two halfs of the array together into the preloadArray
				{
					if(i < topLen) { this.preloadArray.push(topHalf[i]); }
					if(i < botLen) { this.preloadArray.push(bottomHalf[i]); }
				}
				this.preload();
			},
			// Preload the imgs so they're ready to display when the tour starts
			preload:function()
			{
				var parent = this;
				
				if(this.loadCount < imgArrLen)
				{
					var img = new Image();                    
					var loadTimer = setInterval(function() // Use a setInterval var attached to each img to check every 1/4 second if the img is done downloading yet
					{
						if(img.width > 0)
						{
							clearInterval(loadTimer);
							SlideMenu.calcImgType(img); // When each tour img has finished downloading, set the content of the slide that matches the uId of the tour img
							parent.loadCount++;
							parent.checkLoading();
							
							// This checks to see if the tour img's has any interactive pics that need to be preloaded
							!!img.interactive ? parent.preloadIaPics(img) : parent.preload(); // *** Note: parent.preload() is a recursive call to keep loading imgs
						}
					}, 250);
					
					// Set the properties of img var so they can be accessed in SlideMenu.calcImgType() and SlideMenu.setContent()
					img.uId = this.preloadArray[this.loadCount].uId;
					img.src = this.preloadArray[this.loadCount].src;
					img.alt = this.preloadArray[this.loadCount].alt;
					img.interactive = this.preloadArray[this.loadCount].interactive; // If the img is interactive, assign it the array of data from the config file, the TourImg obj uses it to setup interactivity features
				}
			},
			// Interactive pics are preloaded at the same time as their parent tour imgs so they're viewable when the tour img is on the screen
			// *** Revise later: IaPic preloading causes the iaPics to download after their parent tour imgs, but at the same time as other tour imgs. Downloading multiple imgs at the same time might be bad for preformance?
			preloadIaPics:function(img)
			{
				var iaArrLen = img.interactive.length;
				
				for(var i = 0; i < iaArrLen; i++)
				{
					var iaObj = img.interactive[i]; // iaObj is a reference to each of the interactive array's elements, each iaObj contains properties used to setup each interactive btn
					
					if(iaObj.type === 'pic') { Interactive.createIaPicObj(iaObj.uId, iaObj.data); }
				}
				
				this.preload(); // Recursive call to keep loading imgs
			},
			// Check to see how many tour imgs have finished downloading and handle the mask removal when the tour starts
			checkLoading:function()
			{
				this.startCount++;
				
				if(this.startCount === Param.amtToLoad)
				{
					var mask = $('.loadingMask');
					
					$('#loading img').remove();
					TweenLite.to(mask, Param.maskTweenTime, { width:0, opacity:Param.maskOpacity, onComplete:function() { mask.remove(); } }); // Tween open the loading masks and remove them when done
					
					SlideMenu.startTour();// After the first several imgs in the load order are downloaded, start the tour
					Music.init(); // Start the music when the tour starts
				}
			}
		};
		 
		/*************
		The SlideMenu obj handles the setup and animations of the slide menu
		*** Note: Any instance vars that are dependant on the browser size are set in this.setMenuVars()
		*************/
		var SlideMenu =
		{
			el: $('#slideMenu'),
			slideArray: [], // Reference to all of the Slide objs
			currSlideNum: Math.round(imgArrLen / 2 - 1), // The slideNum of current slide being displayed, onload this is the slideNum of the slide in the center that displays first
			centerY: 0, // The middle of the slide menu along the Y axis
			centerGap: 0, // centerGap pushes the top and bottom halves of slide array away from the center so the two slides neighboring the center slide show more
			horiSpace: 0, // Space between slides on the X axis
			vertSpace: 0, // Space between slides on the Y axis
			
			init:function() 
			{
				var parent = this;
				
				this.setMenuVars();
				this.createSlides();
				this.centerSlides();
				
				// Event listeners for the next and previous btns
				$('#nextBtn').click(function()
				{
					parent.nextSlide();
					ImgDisplay.pauseTour();
				});
				
				$('#prevBtn').click(function()
				{
					parent.prevSlide();
					ImgDisplay.pauseTour();
				});       
			},
			// Set the default value of the dynamic instance vars that change when the window resizes
			// *** Note: The value of these instance vars must be reset each time the browser is resized, otherwise their cumulative resetting messes up slide menu positioning
			// *** These instance vars are for positioning and relative to the browser height/width
			setMenuVars:function()
			{
				this.centerY = this.el.height() / 2;
				this.centerGap = Param.centerGap;
				this.horiSpace = Param.horiSpace;
				this.vertSpace = Param.vertSpace;
				this.resetMenuVars();                
			},
			// Reset the default values of the dynamic instance vars minus a certain percentage based on the sizeMod value
			resetMenuVars:function()
			{
				var sizeMod = (1 / 16) * (16 - parseFloat($('body').css('font-size'))); // Assuming a default font-size of 16px
				
				this.centerGap -= (this.centerGap * sizeMod);
				this.horiSpace -= (this.horiSpace * sizeMod);
				this.vertSpace -= (this.vertSpace * sizeMod);
			},
			// Reorder the imgArray into the render order and create a Slide obj for each of the imgs in the imgArray
			createSlides:function()
			{
				var parent = this;
				var renderArray = []; // Used like a document fragment to render all of the slides to the screen in one operation
				var topHalf = imgArray.slice(0, Math.floor(imgArrLen / 2 + 1)); // Imgs in the config file are listed in the order they are to be cycled, this code takes the top part of that array and puts it on the bottom half so the slide menu renders the imgs in the correct order
				var bottomHalf = imgArray.slice(Math.floor(imgArrLen / 2 + 1), imgArrLen);
				var renderOrder = bottomHalf.concat(topHalf); // Order of the imgs when rendered to the screen
				
				for(var i = 0; i < imgArrLen; i++)
				{
					var slide = new Slide(renderOrder[i].uId, i); // Pass a new Slide obj its unique id and its position in the slideArray (slideNum)
					parent.slideArray.push(slide); // Populate the slideArray with references to the Slide Objs
					renderArray.push(slide.el); // Populate the renderArray with references to the Slide obj's html
				}
				
				this.el.html(renderArray); // Append all of the slides at once to reduce browser reflows
			},
			// Center all of the slides in the middle of the slide menu so they appear to fan out onload
			centerSlides:function()
			{
				var slideStartPosY = this.el.offset().top + (this.el.height() / 2); // The middle of the slide menu along the Y axis, accounting for the offset of the slide menu from the top of the window
								
				for(var i = imgArrLen; i--;) // Loop through the slideArray and set the top attr to center each slide in the SlideMenu() obj
				{
					var slide = this.slideArray[i];
					slide.el.offset({ top: slideStartPosY - (slide.el.height() / 2) });
				}                
			},
			// After the first several imgs in the load order are downloaded, this is called from checkLoading in the Preloader
			startTour:function()
			{
				this.reorderSlides(this.currSlideNum);
			},
			// Loop through the slideArray and calculate the position of each slide anytime an event happens to move the slide menu
			// *** Revise later: Could use the scaling slide menu, need to test different kinds of devices using live server first, if that menu version is used, build the menu scrollbar like in the AS3 version
			reorderSlides:function(slideNum)
			{
				var slideArray = this.slideArray; // Local var references used to speed up for loop and cut down on scope chain transversal
				var arrLen = imgArrLen;
				var param = Param;
				var slide = slideArray[0];
				var centerSlideY = this.centerY - (slide.el.height() / 2); // The point where the top left corner of the center slide would be to make it exactly centered in the the slide menu
				var horiSpace = this.horiSpace;
				var vertSpace = this.vertSpace;
				var offset, absOffset, xPos, yPos, zPos = 0;
																				
				for(var i = arrLen; i--;) // Decrement for loop for preformance
				{
					slide = slideArray[i];
					offset = i - slideNum; // Number of slides in between the new current slide, which is the slideNum, and the index of the loop, used as a spacing multiplier
					absOffset = Math.abs(offset); // Flip any negative offsets to positive integers using absolute value
					xPos = absOffset * horiSpace;
					yPos = centerSlideY + (offset * vertSpace);
					zPos = param.topZ - absOffset; // Set the correct zPos so the slides appear to overlap one another, with the center slide on top of all other slides
					slide.el[0].style.zIndex = zPos; // The z-index is set here and not in the tween below because it needs to be set instantly to keep the slides from appering to flicker
					TweenLite.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, ease:Quint.easeOut });
				}
												
				ImgDisplay.changeImg(slideNum); // Change the tourImg to the current slide
				SlideScrollbar.setHandlePos(slideNum); // Update the position of the slide menu's scrollbar
			},
			// Advance the slide menu by one if the next slide is loaded
			nextSlide:function()
			{
				var slideNum = 0;
				
				if(this.currSlideNum === (imgArrLen - 1)) // If the slide menu is on the last slide and nextSlide() is called again, go to the first slide
				{
					slideNum = 0;
					
					if(this.slideArray[slideNum].loaded) // If the next slide is not loaded, i.e. it hasn't finished downloading, don't move the slide menu
					{
						this.currSlideNum = 0;
						this.reorderSlides(this.currSlideNum);
					}                    
				}
				else
				{
					slideNum = this.currSlideNum + 1;
					
					if(this.slideArray[slideNum].loaded)
					{
						this.currSlideNum++;
						this.reorderSlides(this.currSlideNum);
					}                    
				}
			},
			// Reverse the slide menu by one if the prev slide is loaded
			prevSlide:function()
			{
				var slideNum = 0;
				
				if(this.currSlideNum === 0) // If the slide menu is at the first slide and prevSlide() is called again, go to the last slide
				{
					slideNum = imgArrLen - 1;
						
					if(this.slideArray[slideNum].loaded)
					{
						this.currSlideNum = imgArrLen - 1;
						this.reorderSlides(this.currSlideNum);
					}                    
				}
				else
				{
					slideNum = this.currSlideNum - 1;
					
					if(this.slideArray[slideNum].loaded)
					{
						this.currSlideNum--;
						this.reorderSlides(this.currSlideNum);
					}                    
				}
			},
			// Advance the slide menu to that of the accompanying slideNum
			goToSlide:function(slideNum)
			{                
				if(slideNum !== this.currSlideNum && this.slideArray[slideNum].loaded) // Do nothing if the slideNum is that of the current slide showing or if the tour img isn't downloaded yet
				{
					this.currSlideNum = slideNum;
					this.reorderSlides(slideNum);
				}
			},
			// Called from Preloader.preload() once the img is done downloading, determine what type of tour img it is and apply the right classes in this.setContent()
			// *** Note: vertImg, vertSlide, etc are the names of classes in tour.css
			calcImgType:function(img)
			{
				if(img.height >= img.width)
				{
					this.setContent(img, 'vertImg', 'vertSlide'); // Img is a vertical panorama
				}
				else if((img.height / img.width) <= Param.maxHoriRatio)
				{
					this.setContent(img, 'horiImg', 'horiSlide'); // Img is a horizontal panorama
				}
				else
				{
					this.setContent(img, 'stdImg', 'stdSlide'); // Standard ratio img
				}
			},
			// Sets properties on the Slide obj and changes out the placeholder loading gif on each of the Slide() objs 
			// *** Note: The for loop used to line up the img objs in the preloadArray to the slide objs in the slideArray using each img obj's unique id
			setContent:function(img, imgType, slideClass)
			{                
				for(var i = imgArrLen; i--;)
				{
					if(this.slideArray[i].uId === img.uId)
					{
						var slide = this.slideArray[i];
						
						slide.src = img.src;
						slide.alt = img.alt;
						slide.interactive = img.interactive
						slide.height = img.height;
						slide.width = img.width;
						slide.slideClass = slideClass;
						slide.type = imgType;
						slide.addImg();
						break; // Once the correct Slide() obj is found, there is no need to keep looping
					}
				}
			},
			// Reset the vars used for positioning of the Slide objs when the browser resizes
			// *** Note: Calling this.reorderSlides() causes the slide menu to reposition itself and the tour img to restart which will update any other vars that need to be reset when the browser size changes
			resetSize:function()
			{
				this.setMenuVars();
				this.reorderSlides(this.currSlideNum);
			}
		};				

		/*************
		The SlideScrollbar allows the user to scroll through the tour imgs quickly without needing to click or touch the slide menu multiple times
		*** Note: The scrollbar is only shown on non-touch devices, it's buggy on touch screens because of the handle's size
		*************/
		var SlideScrollbar = 
		{
			el: $('#slideScrollbar'),
			handle: $('#slideScrollHandle'),
			doc: $(document), // Reference to the global document var, used to cut down on scope chain transversal
			isDragging: false, // Flag to indicate if the scrollbar handle is being dragged
			elHeight: 0, // Height of the scrollbar track
			elWidth: 0, // Width of the scrollbar track
			handleSize: 0, // Diameter of the scroll handle
			topOffset: 0, // Used to calculate the 0,0 position of the scrollbar track
						
			init:function()
			{                
				if(!Param.isTouchCapable)
				{
					var parent = this;
					var yPos, percent, slideNum = 0;
					
					// Eliminate multiple calls to jQuery's height/width functions
					this.elHeight = this.el.height();
					this.elWidth = this.el.width();
					this.handleSize = this.handle.width();
					this.topOffset = this.el.offset().top                    
					
					this.handle.on('mousedown', function(e)
					{
						if(e.which === 1)
						{
							parent.isDragging = true;

							parent.doc.on('mousemove', function(e)
							{
								yPos = e.pageY - parent.topOffset - (parent.handleSize / 2);
								percent = (yPos / parent.elHeight); // Percentage that the handle is along the scrollbar track
								slideNum = Math.round(((imgArrLen - 1) * percent)); // Based on where the handle is at, calculate which slide in the slide menu should be showing

								if(yPos > 0 && yPos < parent.elHeight - (parent.handleSize / 2)) // Prevent the handle from being dragged off the scrollbar track
								{
									parent.handle.css({ 'top':yPos });
									if(slideNum !== SlideMenu.currSlideNum) { SlideMenu.goToSlide(slideNum); }
								}
								return false; // Only needed in IE7/8 otherwise the scrollbar doesn't drag?
							});

							parent.doc.on('mouseup', function()
							{
								parent.doc.off('mousemove mouseup');
								parent.isDragging = false;
								parent.setHandlePos(SlideMenu.currSlideNum); // Set the positon after mouse up, it makes the handle seem elastic when the tour img doesn't change
							});
						}
						
						ImgDisplay.pauseTour();
						return false; // Prevent mousedown event from bubbling
					});                    
				}
				else
				{      
					this.el.addClass('displayNone'); // Hide the scrollbar from touch screen devices
				}
			},
			// Update the Y position of the scrollbar handle, called from SlideMenu.reorderSlides() and from the mouseup event in this obj
			// *** Note: If the handle is being dragged, the call from the SlideMenu is ignored because the yPos is already being updated by the move listener
			setHandlePos:function(slideNum)
			{
				if(!this.isDragging)
				{
					var percent = (slideNum / (imgArrLen - 1));
					var yPos = percent * this.elHeight - (this.handleSize / 2);
					
					// If the slide menu is displaying the center slide, center the scrollbar handle on the track, this is needed because when there are a even number of imgs, the handle is not centered due to percent not equaling 50%
					if(slideNum === Math.round(imgArrLen / 2 - 1)) { yPos = (this.elHeight / 2) - (this.handleSize / 2); }
			
					TweenLite.to(this.handle, Param.scrollHandleTime, { top:yPos });
				}
			},
			// Reset the vars used for positioning of the scrollbar handle when the browser resizes
			resetSize:function()
			{
				this.elHeight = this.el.height();
				this.elWidth = this.el.width();
				this.handleSize = this.handle.width();
				this.topOffset = this.el.offset().top
				this.setHandlePos(SlideMenu.currSlideNum);
			}
		}
				
		/*************
		The ImgDisplay obj handles the changing, sizing, playing, tweening, and panning of the current tour img
		*** Note: Some instance vars set as empty objs and 0 at runtime and are set later after the tour imgs have downloaded
		*** Note: Methods that use, this.currImg.el multiple times, have a shorthand reference: var currImg = this.currImg.el, while other functions just use this.currImg.el once
		*************/
		var ImgDisplay =
		{
			el: $('#imgDisplay'),
			tourPlayBtn: $('#tourPlayBtn'),
			tourPauseBtn: $('#tourPauseBtn'),
			tourImgMask: $('#tourImgMask'),
			slide: {}, // Reference to the current Slide obj
			currImg: {}, // The TourImg obj currently showing
			prevImg: {}, // Reference to the prev TourImg obj
			elHeight: 0, // Height of the imgDisplay
			elWidth: 0, // Width of the imgDisplay
			currImgHeight: 0, // Height of the tour img
			currImgWidth: 0, // Width of the tour img
			playMode: true, // Flag to indicate if the tour is in play mode or not
			tweenMode: false, // Flag to indicate if the tour img has finished tweening
			firstTween: true, // Flag to indicate if the tween is the initial tween
			prevImgTweenedOut: true, // Flag to indicate if the prev TourImg obj is done fading out
			panned: false, // Flag to indicate if the tour img was panned
			tween: new TimelineLite(), // Timeline obj that all tweens occur upon
						
			init:function()
			{
				var parent = this;
				
				// Set the initial state of the play/pause btns
				this.togglePlayPause();
				
				// Eliminate multiple calls to jQuery's height/width functions
				this.elHeight = this.el.height();
				this.elWidth = this.el.width();
				
				// Add event listeners to the play/pause btns
				this.tourPlayBtn.click(function() { if(!parent.playMode) { parent.play(); } });
				this.tourPauseBtn.click(function() { if(parent.playMode || parent.tweenMode) { parent.pause(); } });
			},
			// Change out the current tour img and reset the ImgDisplay() obj
			changeImg:function(id)
			{
				this.slide = SlideMenu.slideArray[id]; // Reference to a specific Slide obj
				
				TabMenu.hideTab(); // If any of the tabs are showing when the tour img changes, return to the photo gallery
				Interactive.resetIa(); // If any interactive boxes or alerts are showing when the tour img changes, close them
				ImgName.changeName(this.slide.alt); // Change the text in the ImgName obj, resets its position if necessary
				this.tweenOut();
				this.setNewImg();
				this.resetTween();
				this.tweenIn();
				
				if(!this.playMode) { this.pauseTour(); } // *** Note: This is needed because when tour imgs are reset on resize or the SlideScrollbar() is used, they default to play mode and tween in w/o the panning being enabled
			},
			// Fade out the prev tour img
			tweenOut:function()
			{
				if(!this.firstTween) // There is no prevImg to tween out on the initial load
				{
					if(!this.prevImgTweenedOut) { this.removePrevImg(); } // If a new tour img is selected before the prevImg has finished being tweened out, remove it immediately so they don't stack up in the DOM
					
					this.prevImg = this.currImg.el; // Referance the prev tourImg as the curr tourImg so the prev tourImg can be tweened out and then removed
					this.prevImgTweenedOut = false;
					TweenLite.to(this.prevImg, Param.fadeDelay, { opacity:0, onComplete:this.removePrevImg });
				}
			},
			// Remove the prev tour img from the DOM
			removePrevImg:function()
			{
				ImgDisplay.prevImg.remove(); // *** Note: Not sure why, but obj properties in this func have to be accessed through the ImgDisplay obj and not 'this'. Maybe an issue with being a TweenLite callback?
				ImgDisplay.prevImgTweenedOut = true;
			},
			// Setup a new TourImg obj based on the current slide in the SlideMenu and add it to the DOM
			setNewImg:function()
			{
				this.currImg = new TourImg(this.slide); // New TourImg obj using the current slides info
				this.currImg.setImgSize(); // Size the tour imgs
				this.el.append(this.currImg.el); // Add the current img to the ImdDisplay obj
				this.currImgHeight = this.currImg.img.height(); // Set height of the tour img
				this.currImgWidth = this.currImg.img.width(); // Set width of the tour img
																				
				if(!!this.slide.interactive) { this.currImg.setupInteractivity(this.currImgWidth, this.currImgHeight); } // If slide.interactive is an array and not set to false, setup the tour img's interactivity
			},
		 	// Clear the tween's timeline, clear any tween.stop() calls, and restart the timeline
			resetTween:function()
			{
				this.tween.clear();
				this.tween.restart();
			},
			// Handle the movement of the current tour img by calculating the start and finish points of the img tween and assign it a random tween based on the type of tour img it is
			tweenIn:function()
			{
				var currImg = this.currImg.el; // Reference to the div element that is the TourImg obj
				var heightDif = this.currImgHeight - this.elHeight; // Used for coordinates and the number of pixels the img is tweened up and down
				var widthDif = this.currImgWidth - this.elWidth; // Used for coordinates and the number of pixels the img is tweened left and right 
				var topStop = this.elHeight - this.currImgHeight // Coordinate at which a stdImg stops tweening up
				var leftStop = this.elWidth - this.currImgWidth; // Coordinate at which a stdImg stops tweening left
				var horiCenter = this.elHeight / 2 - this.currImgHeight / 2 // Coordinate at which horizontal panos are positioned
				var vertCenter = this.elWidth / 2 - this.currImgWidth / 2 // Coordinate at which vertical panos are positioned
				var tweenNum, tweenLength = 0; // Random number that corresponds to a tween in the logic statements -> Number of seconds the tour img takes to tween
								
				if(this.slide.type === 'stdImg')
				{
					tweenNum = this.setTweenNum(4); // 4 is the number of options in the switch
					tweenLength = this.calcTweenLength(widthDif);

					switch(tweenNum)
					{
						case 1: // Moves img into upper left corner and back
							this.tweenImg(currImg, tweenLength, 0, 0, -heightDif, -widthDif);
						break;
						case 2: // Moves img into upper right corner and back
							this.tweenImg(currImg, tweenLength, 0, leftStop, -heightDif, 0);
						break;
						case 3: // Moves img into lower right corner and back
							this.tweenImg(currImg, tweenLength, topStop, leftStop, 0, 0);
						break;
						case 4: // Moves img into lower left corner and back
							this.tweenImg(currImg, tweenLength, topStop, 0, 0, -widthDif);
						break;					
					}
				}
				else if(this.slide.type === 'horiImg')
				{
					tweenNum = this.setTweenNum(2);
					tweenLength = this.calcTweenLength(widthDif);
					
				 	// When tweenNum equals 1, move the pano to the left else move it right
				 	// *** Note: For hoizontal panos, topOri and topDes are the same because they don't move vertically
					tweenNum === 1 ? this.tweenImg(currImg, tweenLength, horiCenter, 0, horiCenter, -widthDif) : this.tweenImg(currImg, tweenLength, horiCenter, -widthDif, horiCenter, 0);
				}
				else if(this.slide.type === 'vertImg')
				{
					tweenNum = this.setTweenNum(2);
					tweenLength = this.calcTweenLength(heightDif);
					
					// When tweenNum equals 1, move the pano up, else move the pano down
					// *** Note: For vertical panos, leftOri and leftDes are the same because they don't move horizontally
					tweenNum === 1 ? this.tweenImg(currImg, tweenLength, 0, vertCenter, -heightDif, vertCenter) : this.tweenImg(currImg, tweenLength, -heightDif, vertCenter, 0, vertCenter);
				}
				this.tweenMode = true; // Flag used to tell if the tour img is moving or not
			},
			// Calculate the time the tourImg takes to tween across the imgDisplay and set min/max values if needed
			calcTweenLength:function(pixelDif)
			{
				var tweenLength = pixelDif / Param.pixelsPerSec;
				
				if(tweenLength > Param.maxTweenTime) { tweenLength = Param.maxTweenTime; } // Limit the tween length
				if(tweenLength < Param.minTweenTime) { tweenLength = Param.minTweenTime; } // Set a minimum tween length
				return tweenLength;
			},
			// Calculate a random number that is used to choose a particular tween algorithm
			setTweenNum:function(limit)
			{
				var tweenNum = Math.ceil(Math.random() * limit);
				
				if(this.firstTween)
				{
					tweenNum = 1;
					this.firstTween = false;
				}
				return tweenNum;
			},
			// Tween the current tour img using the supplied arguments
			// *** Note: top/leftOri is the point at which the tour img starts and finishes, top/leftDes is the halfway point of the tween
			tweenImg:function(currImg, tweenLength, topOri, leftOri, topDes, leftDes)
			{
				var tween = this.tween;
				
				currImg.css({ 'top':topOri, 'left':leftOri, 'opacity':0 });
				tween.to(currImg, Param.fadeDelay, { opacity:1 });
				tween.to(currImg, tweenLength, { top:topDes, left:leftDes, ease:Linear.easeNone }, '-=' + Param.fadeDelay); // '-=' + Param.fadeDelay moves this tween back on the timeline so it starts at the same time as the opacity fade
				tween.to(currImg, tweenLength, { top:topOri, left:leftOri, ease:Linear.easeNone, onComplete:this.tweenDone });
			},
			// Proceed to the next tour img after the previous one has finished tweening if tour is in play mode
			tweenDone:function()
			{
				ImgDisplay.tweenMode = false; // *** Note: Not sure why, but obj properties in this func have to be accessed through the ImgDisplay obj and not 'this'. Maybe an issue with being a TimelineLite callback?
				
				if(ImgDisplay.playMode) { SlideMenu.nextSlide(); } // If the tour is in play mode, advance to the next tour img
			},
			// These functions handle the stopping and playing of the tour and tweening of the tour imgs
			// *** Note: The play/pauseTween and play/pauseTour funcs on separated out because they're used in different situations throughout the tour program
			play:function()
			{
				if(!this.playMode && !this.tweenMode && !this.panned) { SlideMenu.nextSlide(); } // If the tour is paused, the tour img is done tweening, the tour img hasn't been panned, and the play btn gets clicked, advance to the next tour img
				
				this.playTour();
				this.playTween();
			},
			pause:function()
			{
				this.pauseTween();
				this.pauseTour();
			},
			playTween:function()
			{
				if(this.playMode) { this.tween.play() } // Play the tween only if the tour is in play mode
			},
			pauseTween:function()
			{
				this.currImg.el.css({ 'opacity':1 }); // Make sure the tour img is at full opacity before stopping the tween
				this.tween.stop();
			},
			playTour:function()
			{
				this.playMode = true;
				this.togglePlayPause();
				this.currImg.pointerOn();
				this.panningOff();
					
				if(this.panned) // If the tour img was panned, advance to the next img when the tour is restarted
				{
					this.panned = false;
					SlideMenu.nextSlide();
				}
			},
			pauseTour:function()
			{
				if(this.playMode) // *** Revise later: pauseTour() is called each time the slide menu is used, the logic here keeps excess funcs from being called when the tour is already in pause mode, see note in the Slide obj about refactoring this
				{
					this.playMode = false;
					this.togglePlayPause();
				}
				
				this.currImg.pointerOff();
				this.panningOn();
			},
			// Add or remove underlining depending on the state of play/pause
			togglePlayPause:function()
			{
				if(this.playMode)
				{
					this.tourPlayBtn[0].className = 'underline'; // [0] is used to access the DOM element inside the jQuery obj
					this.tourPauseBtn[0].className = '';
				}
				else
				{
					this.tourPlayBtn[0].className = '';
					this.tourPauseBtn[0].className = 'underline';
				}
			},
			// Setup the listeners for the panning feature when the tour is put in pause mode
			panningOn:function()
			{
				var parent = this;
				var currImg = this.currImg.el; // Reference to the div element that is the TourImg obj
				var tourImg = this.currImg.img; // Reference to the img element that is the tour img itself
				var leftOffset = this.el.offset().left; // Used to calculate the 0,0 position of the imgDisplay
				var topOffset = this.el.offset().top
				var xPos, yPos = 0;
								
				// *** Note: Listeners for the panning have to be attached to the tour img element and not the TourImg obj, otherwise these listeners interfere with the interactive btn listeners 
				tourImg.on('mouseover touchstart', function(e)
				{   
					if(e.type === 'touchstart') { e.preventDefault(); }
					if(parent.tweenMode) { parent.pauseTween(); } // When a slide is clicked in the slide menu, the tour img tweens in as normal. When/if it's moused over or touched while the tour is in pause mode, the tween is stopped in favor of panning
				});
								
				tourImg.on('mousemove touchmove', function(e) // *** Need to test touch events on Windows 8/IE10 machine, might need to add MSPointerMove *** 
				{
					var evt = e;
					
					if(e.type === 'touchmove')
					{
						e.preventDefault();
						evt = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					}
										
					// Calculate new X and Y positions based on where the mouse or touch is at and apply those to the TourImg obj's position
					xPos = ((evt.pageX - leftOffset) / parent.elWidth) * (parent.currImgWidth - parent.elWidth) * -1;
					yPos = ((evt.pageY - topOffset) / parent.elHeight) * (parent.currImgHeight - parent.elHeight) * -1;

					if(parent.slide.type === 'stdImg')
					{
						if(evt.pageX > leftOffset && evt.pageX < (leftOffset + parent.elWidth)) // Keeps the TourImg obj from panning too far on touchmove, un-needed if just using mousemove 
						{
							if(evt.pageY > topOffset && evt.pageY < (topOffset + parent.elHeight))
							{
								currImg.css({ 'left':xPos, 'top':yPos });
							}
						}
					}
					else if(parent.slide.type === 'horiImg')
					{
						if(evt.pageX > leftOffset && evt.pageX < (leftOffset + parent.elWidth))
						{
							currImg.css({ 'left':xPos });
						}
					}
					else if(parent.slide.type === 'vertImg')
					{
						if(evt.pageY > topOffset && evt.pageY < (topOffset + parent.elHeight))
						{
							currImg.css({ 'top':yPos });
						}
					}

					if(!parent.panned) { parent.panned = true; } // Set the flag to notify this.playTour() to advance to the next img when the tour is restarted
				});
			},
			// Turn off the listeners for the panning feature when the tour returns to play mode
			panningOff:function()
			{
				this.currImg.img.off(); // *** Note: This turns off the panning listeners on the tour img and not the TourImg obj
			},
			// The tour img mask is put on top of the tour img and serves as a container for the tab menu pages and iaPics 
			tourImgMaskOn:function(content)
			{
				this.pauseTween();
				this.tourImgMask.removeClass('displayNone'); // Un-hide the tourImgMask element
				this.tourImgMask.html(content);
				TweenLite.to(this.tourImgMask, Param.stdFadeTime, { opacity:1 });
			},
			// Clear the content from the DOM but keep its data and listeners intact if keepData is true
			tourImgMaskOff:function(keepData)
			{
				var parent = this;
					
				TweenLite.to(this.tourImgMask, Param.stdFadeTime,
				{
					opacity:0,
					onComplete:function()
					{
						parent.tourImgMask.addClass('displayNone');
						keepData ? parent.tourImgMask.children().detach() : parent.tourImgMask.empty();
					}
				});
				
				this.playTween();
			},
			// Reset the vars used for positioning of the TourImg obj when the window resizes
			resetSize:function()
			{
				this.elHeight = this.el.height();
				this.elWidth = this.el.width();
			}
		};
				
		/*************
		The ImgName obj handles the changing and displaying of the current tour img name
		*************/
		var ImgName =
		{
			el: $('#imgName'),
			text: $('#imgNameText'),
			alteredPos: false,
						
			// Swap out the name of the previous tour img for the current one
			changeName:function(imgName)
			{
				this.text.html(imgName);
				if(this.alteredPos) { this.resetPos(); }
			},
			// Called from TourImg.setImgSize() if the tour img is a vertical pano and thiner than the imgDisplay, keep the ImgName obj aligned with the tour img's right side
			changePos:function(elWidth, imgWidth)
			{
				var currPos = parseFloat(this.el.css('right'));
				var offset = (elWidth - imgWidth) / 2; // Distance to move the ImgName obj
				
				this.el.css('right', currPos + offset); // Move the ImgName obj to its new position
				this.alteredPos = true;
			},
			// Reset the ImgName to its origanal position if it was altered
			resetPos:function()
			{
				// *** Note: The css() method has to be used here b/c jQuery's width() method returns the computed width which subtracts the border width due to the box-sizing being set to border-box
				var reset = $('#tourWrapper').width() - (parseFloat(ImgDisplay.el.css('left')) + parseFloat(ImgDisplay.el.css('width'))); // Calculate the reset position
				
				this.el.css({ 'right':reset }); // This is set from the right because the ImgName obj's changing width would mess up positioning it from the left
				this.alteredPos = false;
			}
		};
				
		/*************
		The Alert obj handles the displaying of messages to the user
		*************/
		var Alert =
		{
			alertMsg: $('#alertMsg'),
			alertMsgText: $('#alertMsg p'),
			timer: {},
			alertShowing: false, // Flag to indicate if the alert msg box is showing
			
			alertOn:function(msg, duration)
			{
				var parent = this;
				
				if(!this.alertShowing) // Don't show more than one msg at a time
				{
					this.alertMsgText.text(msg); // Add the msg to the p element in the DOM
					this.alertMsg.removeClass('displayNone'); // Make the msg box visible
					this.alertMsg.on('click', function() { parent.alertOff(); }); // Allow the user to clear the msg by clicking it
					this.timer = setTimeout(function(){ parent.alertOff(); }, duration); // Remove the msgBox after a set time if the user doesn't remove it by clicking on it
					this.alertShowing = true;
				}
			},
			alertOff:function()
			{
				var parent = this;
				
				TweenLite.to(this.alertMsg, Param.stdFadeTime,
				{
					opacity:0,
					onComplete:function()
					{
						clearTimeout(parent.timer);
						parent.alertMsgText.text('');
						parent.alertMsg.addClass('displayNone').off(); // *** Note: jQuery methods, addClass() and off() are chanied
						parent.alertMsg.css({ 'opacity':1 }); // This is necessary because alertOn() doesn't tween alertMsg open, the opacity has to be reset so alertMsg is visible the next time it's shown
						parent.alertShowing = false;
					}
				});
			}
		}
				
		/*************
		The Interactive obj handles the info box, interactive pics, and interactive navigation
		*************/
		var Interactive = 
		{
			infoBox: $('#infoBox'),
			infoBoxText: $('#infoBox p'),
			iaPicArray: {}, // Associative array for the interactive pictures
			infoBoxShowing: false, // Flag to indicate if the interactive info box is open
			iaPicShowing: false, // Flag to indicate if the interactive pic is showing
			iaPicCloseMsgShown: false, // Flag to indicate if the close msg has been shown
			infoText: '', // Compared against the incoming text string of this.info() to see if the same iaInfo btn was clicked
			
			navigate:function(slide)
			{ 
				// *** Note: If the tour img has not fully downloaded yet, alert the user
				slide.loaded ? SlideMenu.goToSlide(slide.slideNum) : Alert.alertOn('The image you\'re trying to navigate to has not fully downloaded yet.  Wait a sec and try again.', 5000);
				if(!ImgDisplay.playMode) { ImgDisplay.pauseTour(); } // If the tour is not in play mode, set up the panning on the current tour img when its navigated to
			},
			info:function(text)
			{
				var parent = this;
				var boxHeight = 0;
				
				// *** Note: If the info box is open and an iaInfo btn is clicked, check to see if it's the same btn that opened that info box.
				// If it's the same btn, close the info box, if it's a different iaInfo btn, swap the the old text for the new
				if(this.infoText === text)
				{
					this.removeInfo();
				}
				else    
				{
					ImgDisplay.pauseTween();
					this.infoText = text;
					this.infoBoxText.text(text); // Insert the text into the p element of the info box
					this.infoBox.removeClass('displayNone');
					boxHeight = this.infoBoxText.height() + (parseFloat(this.infoBox.css('paddingTop')) * 2); // Calculate the distance to tween open the info box
					
					// Tween open the info box and when its open, un-hide the text and add its event listener
					TweenLite.to(this.infoBox, Param.stdFadeTime,
					{ 
						height:boxHeight,
						onComplete:function()
						{
							parent.infoBoxText.removeClass('hidden');
							parent.infoBox.one('click', function() { parent.removeInfo(); }); // Event listener removes itself since it only needs to be used once
							parent.infoBoxShowing = true;
						}
					});
				}
			},
			removeInfo:function()
			{
				var parent = this;
				
				ImgDisplay.playTween();
				this.infoText = '';
				this.infoBoxText.text('');
				this.infoBoxText.addClass('hidden');
				
				TweenLite.to(this.infoBox, Param.stdFadeTime,
				{
					height:0,
					onComplete:function()
					{
						parent.infoBox.addClass('displayNone');
						parent.infoBoxShowing = false;
					}
				});
			},
			// *** Note: The iaPic feature and the tab menu share the tourImgMask element that's in the ImgDisplay obj and use it as a container for inserted content
			iaPic:function(uId)
			{
				var parent = this;
				var iaPicWrapper = $('<div class="iaPicWrapper">'); // Used to center iaPics if they're dimensions are smaller than the ImgDisplay obj dimensions
				
				this.resetIa();
				
				if(this.iaPicArray[uId].loaded)
				{
					if(!this.iaPicCloseMsgShown) // If it's the first time an iaPic has been opened, alert the user on how to close it
					{
						Alert.alertOn('Click anywhere on the image to resume the tour.', 4000);
						this.iaPicCloseMsgShown = true;
					}
					
					iaPicWrapper.html(this.iaPicArray[uId].el); // Add the iaPic img element from the iaPicArray that matches the uId parameter
					iaPicWrapper.one('click', function() { parent.removePic(); });
					ImgDisplay.tourImgMaskOn(iaPicWrapper);
					this.iaPicShowing = true;
				}
				else
				{
					Alert.alertOn('The image you\'re trying to view has not fully downloaded yet.  Wait a sec and try again.', 5000); // *** Note: If the iaPic has not fully downloaded yet, alert the user
				}
			},
		 	// Remove the iaPic img element from the DOM and remove any listeners by passing false
			removePic:function()
			{
				ImgDisplay.tourImgMaskOff(false);
				this.iaPicShowing = false
			},
			// Create a new interactive picture obj, make its uId a property of the iaPicArray, and the value of that property is the IaPic() obj itself, called from Preloader.preloadIaPics()
			createIaPicObj:function(uId, iaPicUrl)
			{
				var iaPic = new IaPic(); // Create new IaPic() obj
				
				iaPic.preloadIaPic(iaPicUrl); // Start the downloading of the iaPic
				this.iaPicArray[uId] = iaPic // Make the uId a property of the iaPicArray and have the iaPic() obj be its value, this way it can be accessed via uId in this.iaPic()
			},
		 	// If any interactive boxes or alerts are showing when the tour img changes or when another interactive event happens, close them
			resetIa:function()
			{
				if(this.infoBoxShowing) { this.removeInfo(); }
				if(this.iaPicShowing) { this.removePic(); }
				if(Alert.alertShowing) { Alert.alertOff(); }
			}
		}
								
		/*************
		The TextBoxes obj handles the setup of the info boxes on the bottom of the tourWrapper
		*************/
		var TextBoxes = 
		{
			init:function()
			{
				this.addressBox();
				this.contactBox();
			},
			 // Fetch the template and interpolate the data. Use: variable.data inside the template to access the data in the config file
			addressBox:function()
			{
				var el = $('#addressBox');
				var template = _.template($('#addressBoxTemp').html(), { data:addressBox }, { variable:'address' });
				el.html(template);
			},
			contactBox:function()
			{
				var el = $('#contactBox');
				var template = _.template($('#contactBoxTemp').html(), { data:contactBox }, { variable:'contact' });
				el.html(template);
			}
		};


		// The tour img mask is put on top of the tour img and serves as a container for the tab menu pages and iaPics 
		// tourImgMaskOn:function(content)
		// {
		// 	this.pauseTween();
		// 	this.tourImgMask.removeClass('displayNone'); // Un-hide the tourImgMask element
		// 	this.tourImgMask.html(content);
		// 	TweenLite.to(this.tourImgMask, Param.stdFadeTime, { opacity:1 });
		// },
		// // Clear the content from the DOM but keep its data and listeners intact if keepData is true
		// tourImgMaskOff:function(keepData)
		// {
		// 	var parent = this;
				
		// 	TweenLite.to(this.tourImgMask, Param.stdFadeTime,
		// 	{
		// 		opacity:0,
		// 		onComplete:function()
		// 		{
		// 			parent.tourImgMask.addClass('displayNone');
		// 			keepData ? parent.tourImgMask.children().detach() : parent.tourImgMask.empty();
		// 		}
		// 	});
			
		// 	this.playTween();
		// }




		// inside tourImgMaskOff()
		// if keepData is true - var objToStore = parent.tourImgMask.children().html()
		// send that obj back to the specific tab obj from where the call came from - how to pass return obj? pass 'this' in arguments then this.ojbToStore???
		// store that as a var and set a flag
		// next call to that tab checks the flag and if the stored DOM obj is already there, pass that to tourImgMaskOn()
		// inside tourImgMaskOn(), will need to fade out old DOM obj while fading in new DOM obj - make sure not to mess up iaPics




								
		/*************
		The TabMenu obj sets up and controls all of the tab navigation
		*** Note: The TabMenu obj only sets up the tabs and handles the displaying of the tab menu pages, the tab pages themselves are separate self contained objs
		*************/
		var TabMenu = 
		{
			el: $('#tabMenu'),
			photoGal: $('#photoGal'),
			propInfo: $('#propInfo'),
			propMap: $('#propMap'),
			agentInfo: $('#agentInfo'),
			calc: $('#calc'),
			tabShowing: false, // Flag to indicate if a tab is in use
									
			init:function()
			{
				var parent = this;
				
				if(config.fsbo) { this.agentInfo.remove(); } // If the tour was built as a 'For sale by owner' tour, don't show the Agent Info tab
								
				// Event listeners for the tabs
				this.photoGal.click(function()
				{
					parent.hideTab();
				});
				this.propInfo.click(function()
				{
					parent.showTab(PropInfo.el);
					parent.swapBorder($(this));
					PropInfo.init();
					PropInfo.needScrollbar();
				});
				this.propMap.click(function()
				{
					parent.showTab(PropMap.el);
					parent.swapBorder($(this));
					PropMap.showMap();
				});
				this.agentInfo.click(function()
				{
					parent.showTab(AgentInfo.el);
					parent.swapBorder($(this));
				});
				this.calc.click(function()
				{
					parent.showTab(Calc.el);
					parent.swapBorder($(this));
					Calc.init();
				});
			},
			// Send the html content of the chosen tab menu page to the tourImgMask for display
			// *** Note: The tab menu and the iaPic feature share the tourImgMask element that's in the ImgDisplay obj and use it as a container for inserted content
			showTab:function(content)
			{
				Interactive.resetIa(); // Close any of the interactive features that might be showing when a tab is selected
				ImgDisplay.tourImgMaskOn(content);
				this.tabShowing = true;
			},
			// Tell the tourImgMask to remove the tab menu content from the DOM and return to the photo gallery
			hideTab:function()
			{                
				if(this.tabShowing)
				{
					ImgDisplay.tourImgMaskOff(true);
					this.swapBorder(this.photoGal);
					this.tabShowing = false;
				}
			},
			// Change the border to the current active tab
			swapBorder:function(activeTab)
			{
				this.photoGal.removeClass('tabBorder');
				this.propInfo.removeClass('tabBorder');
				this.propMap.removeClass('tabBorder');
				this.calc.removeClass('tabBorder');
				
				if(!config.fsbo) { this.agentInfo.removeClass('tabBorder'); }
				
				activeTab.addClass('tabBorder');
			}
		}
				
		/*************
		The PropInfo obj is a tab menu page and gets its property info from the config file, it displays that info in a underscore.js template
		*************/
		var PropInfo = 
		{
			el: _.template($('#propInfoTemp').html(), { data:propInfo }, { variable:'prop' }),
			aboutText: {},
			
			init:function()
			{
		 		this.aboutText = $('#aboutText'); // Paragraph element containing the about text
			},
			// Determine if the height of the about text is too tall for its parent container and add a scrollbar if it needs one
			needScrollbar:function()
			{
				var aboutTextHeight = this.aboutText.height(); // How tall the about text paragraph is
				var aboutTextParentHeight = this.aboutText.parent().height(); // Height of the about text's parent container, equal to the height of the scrollbar if it's needed
				var scrollbarOffset = $('#leftCol .tabHeaderAlt').height(); // Distance from the top of the left column to the top of the scrollbar
																												
				if(aboutTextHeight > aboutTextParentHeight) // If the height of the about text paragraph is too tall for its container, add the scrollbar
				{
					var scrollbarObj = new Scrollbar(this.aboutText, aboutTextHeight, aboutTextParentHeight, scrollbarOffset);
					
					if(!Param.isTouchCapable) // Only use a visible scrollbar for non-touch devices
					{
						this.aboutText.after(scrollbarObj.el);
						scrollbarObj.init();
					}
					else
					{
						scrollbarObj.touchScroll();
					}
				}                                
			}
		}
				
		/*************
		The PropMap obj is a tab menu page and is used to display a Google map obj in a underscore.js template
		*************/
		var PropMap =
		{
			el: _.template($('#propMapTemp').html()),            
			
			// Setup the Google maps API for the address of the property
			showMap:function()
			{
				var mapOptions =
				{
					zoom: 16,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				var map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);                
				var geocoder = new google.maps.Geocoder();
				var address = propMap.mapAddress; // *** Note: The address used here is put together is the tour building process and put in the config file as one single string
				
				geocoder.geocode({ 'address': address }, function(results, status)
				{
					if(status === google.maps.GeocoderStatus.OK)
					{                        
						map.setCenter(results[0].geometry.location);
						var marker = new google.maps.Marker(
						{
							map: map,
							position: results[0].geometry.location
						});
					}
					else
					{
						Alert.alertOn('It seems there was an issue with the map for the following reason: ' + status, 5000);
					}
				});
			}
		}
				
		/*************
		The AgentInfo obj is a tab menu page and gets its agent info from the config file, it displays that info in a underscore.js template
		*************/
		var AgentInfo = 
		{
			el: _.template($('#agentInfoTemp').html(), { data:agentInfo }, { variable:'agent' })
		}
				





		/*************
		The Calc obj is a tab menu page and sets up a mortgage calculator in a underscore.js template
		*** Note: Some instance vars set as empty objs at runtime and are set later after the Calc obj is loaded into the DOM
		*************/
		var Calc =
		{
			el: _.template($('#calcTemp').html()),
			inputsArr: [], // All of the number input fields in the mortgage calculator
			inputsArrLen: {},
				
			init:function()
			{
				var parent = this;

				this.inputsArr = $('.tabCalc input');
				this.inputsArrLen = this.inputsArr.length;
				this.inputsArr[0].focus();

				$('#calculateBtn').on('click', function() { parent.startCalc(); });
				$('#amortizeBtn').on('click', function() { parent.amortize(); });
				$('#clearBtn').on('click', function() { parent.clearCalc(); });
			},
			// Clean up the user input numbers
			startCalc:function()
			{
				for(var i = this.inputsArrLen; i--;) // Loop through the calc inputs to validate and clean out their values
				{ 
					if(i < 4) // The first 4 inputs of the calculator are required
					{
						if(this.inputsArr.eq(i).val() === '')
						{
							this.inputsArr.eq(i).css({ 'outline':'2px solid #ff0000' }); // Apply highlighting to the input field if nothing is entered
							this.inputsArr.eq(i).data('error', 'on'); // Set a data attribute to flag the error
						}
						else
						{
							if(this.inputsArr.eq(i).data('error', 'on')) 
							{
								this.inputsArr.eq(i).css({ 'outline':'none' }); // Reset the input field and error flag
								this.inputsArr.eq(i).css('error', 'off');
							}
							this.inputsArr.eq(i).val(this.cleanOut(this.inputsArr.eq(i).val())); // Clean up the input values
						}
					}
					else
					{
						if(this.inputsArr.eq(i).val() === '' || this.inputsArr.eq(i).val() === 0)
						{
							this.inputsArr.eq(i).val(0); // If optional fields are left blank, make them equal to zero because of the mortgage algorithm 
						}
						else
						{
							this.inputsArr.eq(i).val(this.cleanOut(this.inputsArr.eq(i).val()));
						}
					}
				}
				this.calculate();
			},
			// Calculate the totals to display, and reformat numbers for display
			calculate:function()
			{
				var price = parseFloat($('#price').val());
				var downPmt = parseFloat($('#downPmt').val());
				var interestRate = parseFloat($('#interestRate').val());
				var loanTerm = parseFloat($('#loanTerm').val());
				var propTax = parseFloat($('#propTax').val());
				var propInsur = parseFloat($('#propInsur').val());
				var pmi = parseFloat($('#pmi').val());
				var pmtFreq = 12;
				var loanAmount, numOfMonths, effIntRate, annuityFactor, loanPayment, totalMortgagePayment = 0;

				// Calculator algorithm
				loanAmount = price - downPmt;
				numOfMonths = pmtFreq * loanTerm;
				effIntRate = Math.pow((1 + (interestRate / 100) / pmtFreq), (12 / pmtFreq)) - 1;
				annuityFactor = (1 - (Math.pow((1 / (1 + effIntRate)), numOfMonths))) / effIntRate;
				loanPayment = (loanAmount / annuityFactor);
				totalMortgagePayment = (loanPayment + ((propTax + propInsur + pmi) / 12));

				this.outputCalc(price, downPmt, propTax, propInsur, pmi, loanAmount, loanPayment, totalMortgagePayment);
			},
			// Format the input numbers and display them to the user
			outputCalc:function(price, downPmt, propTax, propInsur, pmi, loanAmount, loanPayment, totalMortgagePayment)
			{				
				$('#price').val(this.numFormat(price));
				$('#downPmt').val(this.numFormat(downPmt));
				$('#propTax').val(this.numFormat(propTax));
				$('#propInsur').val(this.numFormat(propInsur));
				$('#pmi').val(this.numFormat(pmi));
				$('#loanAmt').html(this.numFormat(loanAmount));
				$('#loanPmt').html(this.numFormat(loanPayment));
				$('#mortgagePmt').html(this.numFormat(totalMortgagePayment));
			},
			// Remove any extra characters from the input numbers
			cleanOut:function(number)
			{
				var cleanOutPattern = /\,|\$|\%|\+|\-|\*|\/|[a-z]|[A-Z]/g;

				return number.replace(cleanOutPattern, '');
			},
			// Change the numbers to the correct currency format
			numFormat:function(number)
			{
				var precision = 2;
				var decimalDelimiter = '.';
				var commaDelimiter = ',';
				var prefix = '$';
				var str = number.toString();
				var numSides = str.split(decimalDelimiter)
				var leftSide = numSides[0];
				var leftSideLen = leftSide.length;
				var leftSideNew = '';
				var rightSide = '00';

				if(numSides.length > 1) { rightSide = numSides[1].substr(0, precision); }

				for(var i = 0; i < leftSideLen; i++)
				{
					if(i > 0 && (i % 3 === 0)) { leftSideNew = commaDelimiter + leftSideNew; }

					leftSideNew = leftSide.substr(-i - 1, 1) + leftSideNew;
				}

				return parseInt(leftSideNew) === 0 ? prefix + '0.00' : prefix + leftSideNew + decimalDelimiter + rightSide;
			},
			// Create the amortization chart
			amortize:function()
			{
				console.log('amortize');
			},
			// Reset the calculator
			clearCalc:function()
			{
				$('#loanAmt').html('$0.00');
				$('#loanPmt').html('$0.00');
				$('#mortgagePmt').html('$0.00');

				for(var i = this.inputsArrLen; i--;) { this.inputsArr[i].value = ''; }
				this.inputsArr[0].focus();
			}
		}
				
		// better error msg, no NAN crap
		// maintain state of calc when going to other tabs
		// fade in/out between tabs
		// amortization chart






		/*************
		Create the audio tag and setup the music feature *after* the tour starts
		*************/
		var Music = 
		{
			musicBtns: $('#musicBtns'),
			playBtn: $('#musicPlayBtn'),
			pauseBtn: $('#musicPauseBtn'),
			win: window, // Reference to the global window var, used to cut down on scope chain transversal
			audio: {}, // The html5 audio obj
			supported: false, // Flag used to indicate if html5 audio is supported
			isPlaying: false, // Flag used to indicate if the music is playing or not

			init:function()
			{
				if(!music.includeMusic) // Remove the music btns from the DOM if there wasn't supposed to be any music included
				{
					this.musicBtns.remove();
				}
				else // Else, setup the audio element for modern browsers
				{
					this.supported = !!(document.createElement('audio').canPlayType); // Detect if old IE
					
					if(this.supported) // If the browser supports HTML5 audio, setup the audio tag and its sources
					{
						this.audio = $('<audio loop="true">');
						this.addSource(this.audio, music.ogg, 'audio/ogg'); // Adds a source elements and appends it to the audio element
						this.addSource(this.audio, music.mp3, 'audio/mp3'); // *** Note: music.ogg/mp3 are file paths in the config file
						this.musicBtns.append(this.audio);
						this.checkAutoplay();
						this.addPlayHandler();
						this.addPauseHandler();
					}
					else if(this.win.isOldIe) // If the browser doesn't support HTML5 audio, use a Flash fallback for old IE
					{
						this.audio = $('#flashMusicPlayer').get(0);
						this.checkAutoplay();
						this.addPlayHandler();
						this.addPauseHandler();
						
						// *** Note: The swf embed, function, and vars are setup in the IE conditional, in mainView.php
						this.win.song = music.mp3;
						this.win.autoplay = music.autoplay;
						this.win.startMusic();
					}
					else // If the browser doesn't support HTML5 audio and is not old IE, remove the music btns
					{
						this.musicBtns.remove();
					}
				}
			},
			addSource:function(el, path, type)
			{
				el.append($('<source>').attr({ 'src':path, 'type':type }));  
			},
			// If music is supposed to autoplay and the device is not a phone, autoplay the music
			// *** Note: Autoplay is turned off for touch devices because of possible slow connections and/or bandwidth restrictions
			checkAutoplay:function()
			{
				if(music.autoplay && !Param.isTouchCapable)
				{
					if(this.supported) { this.audio.attr('autoplay', 'autoplay'); }
					this.isPlaying = true;
					this.togglePlayPause();
				}
				else
				{
					this.togglePlayPause();
				}
			},
			// Add or remove underlining depending on the state of play/pause
			togglePlayPause:function()
			{
				if(this.isPlaying)
				{
					this.playBtn.addClass('underline');
					this.pauseBtn.removeClass('underline');
				}
				else
				{
					this.playBtn.removeClass('underline');
					this.pauseBtn.addClass('underline');
				}
			},
			// Add event listeners for the play/pause btns
			addPlayHandler:function()
			{
				var parent = this;
				
				this.playBtn.click(function()
				{
					parent.supported ? parent.audio.trigger('play') : parent.audio.playMusic();
					parent.isPlaying = true;
					parent.togglePlayPause();
				});
			},
			addPauseHandler:function()
			{
				var parent = this;
				
				this.pauseBtn.click(function()
				{
					parent.supported ? parent.audio.trigger('pause') : parent.audio.pauseMusic();
					parent.isPlaying = false;
					parent.togglePlayPause();
				});
			}
		}
				
		/********************************************************************
		Constructor objects (In alphabetical order)
		These objects are used multiple times throughout the tour application
		********************************************************************/
			 
	  /*************
		Builds a new interactive picture obj, instantiated in Interactive.createIaPicObj()
		// *** Note: Interactive pics are preloaded at the same time as their parent tour imgs so they're viewable when the tour img is on the screen
		*************/
		function IaPic()
		{
			var parent = this;
			
			this.el = new Image();
			this.height = 0;
			this.width = 0;
			this.loaded = false;
			// Start the download of the iaPics and check every 1/4 second to see if its finished
			this.preloadIaPic = function(iaPicUrl)
			{
				var loadTimer = setInterval(function()
				{
					if(parent.el.width > 0)
					{
						clearInterval(loadTimer);
						parent.loaded = true;
						parent.setSize();
					}
				}, 250);
				
				parent.el.src = iaPicUrl;
				parent.el.alt = 'Interactive picture';
			}
			// Set the size of the iaPic using CSS classes that have style rules based on the dimensions of the imgDisplay
			this.setSize = function()
			{
				if(this.el.height >= this.el.width) // Interactive picture is a vertical panorama
				{
					this.el.className = 'vertIaPic';
				}
				else if((this.el.height / this.el.width) <= Param.maxHoriRatio) // Interactive picture is a horizontal panorama
				{
					this.el.className = 'horiIaPic';
				}
				else // Standard ratio interactive picture
				{
					this.el.className = 'stdIaPic';
				}
			}
		}
				
		// The Scollbar obj creates a customized scrollbar for content that is too tall for its parent container
		// *** Note: The Scrollbar obj uses a template that has to be appended to the DOM before anything else can happen
		function Scrollbar(content, contentHeight, contentParentHeight, scrollbarOffset)
		{
			this.el = _.template($('#scrollbarTemp').html());
						
			// Scrollbar instance vars are created here *after* this.el is added to the DOM, otherwise all CSS values return undefined
			this.init = function()
			{
				this.track = $('#scrollTrack'); 
				this.handle = $('#scrollHandle');
				this.upArrow = $('#scrollUpArrow');
				this.downArrow = $('#scrollDownArrow');
				this.handleSize = this.handle.height(); // Diameter of the scroll handle
				this.upArrowHeight = this.upArrow.height(); // Height of the up and down arrow btns, *assuming* both btns are the same size
				this.trackHeight = contentParentHeight - (this.upArrowHeight * 2); // Height of the scroll track
				this.topLimit = scrollbarOffset + this.upArrowHeight; // Top most point the handle can be moved to
				this.botLimit = (this.topLimit + this.trackHeight) - this.handleSize; // Bottom most point the handle can be moved to
				this.scrollAmt = contentHeight - contentParentHeight + (parseInt(content.css('paddingTop')) * 2); // The height differance between the content and its parent container, accounts for top padding
				this.doc = $(document); // Reference to the global document var, used to cut down on scope chain transversal
				this.isDragging = false; // Flag to indicate if the scrollbar handle is being dragged  
				this.setParams();
				this.setListeners();
			}
			// Set the initial positions of the scrollbar elements
			this.setParams = function()
			{
				var trackY = scrollbarOffset + this.upArrowHeight;
				var handleY = scrollbarOffset + this.upArrowHeight;
				var downArrowY = scrollbarOffset + this.trackHeight + this.upArrowHeight;
						
				this.track.css({ 'height':this.trackHeight, 'top':trackY });
				this.handle.css({ 'top':handleY });
				this.downArrow.css({ 'top':downArrowY });                
			}
			// Assign event listeners to the scrollbar elements         
			this.setListeners = function()
			{       
				var parent = this;
				var handleOffset = this.upArrow.offset().top - scrollbarOffset; // Used in calculating the yPos for the scrollhandle
				var yPos = 0;
						
				this.upArrow.on('click', function(e) { parent.arrowBtns('up', e, yPos); });
				this.downArrow.on('click', function(e) { parent.arrowBtns('down', e, yPos); });
				this.handle.on('mousedown', function(e)
				{
					if(e.which === 1)
					{
						parent.isDragging = true;
						parent.doc.on('mousemove', function(e)
						{
							yPos = e.pageY - handleOffset - (parent.handleSize / 2); // Location of the handle based on the location of the mouse pointer
							parent.setHandlePos(yPos);        

							return false; // Only needed in IE7/8 otherwise the scrollbar doesn't drag?
						});
						parent.doc.on('mouseup', function()
						{
							parent.doc.off('mousemove mouseup');
							parent.isDragging = false;
						});
					}

					return false; // Prevent mousedown event from bubbling
				});
			}
			// Move the handle either up or down depending on which arrow was clicked
			this.arrowBtns = function(upDown, e, yPos)
			{
				if(e.which === 1)
				{
					yPos = parseInt(this.handle.css('top')); // Get the current top position of the handle
					upDown === 'up' ? yPos = yPos -= Param.pixelsPerClick : yPos = yPos += Param.pixelsPerClick; // Add to the current top position depending on which arrow was clicked
					this.setHandlePos(yPos);
				}
			}
			// Update the top position of the handle
			this.setHandlePos = function(yPos)
			{
				if(yPos > this.topLimit && yPos < this.botLimit) // Prevent the handle from moving off the scrollbar track
				{
					this.handle.css({ 'top':yPos });
					this.setContentPos(yPos);
				}
				else if(yPos <= this.topLimit) // If the handle's yPos is set to go past the top/bot limits in either this.arrowBtns() or by the drag listener, set the handle to its top/bot limit and do the same with the content
				{
					this.handle.css({ 'top':this.topLimit });
					this.setContentPos(yPos, 'top');
				}
				else if(yPos >= this.botLimit)
				{
					this.handle.css({ 'top':this.botLimit });
					this.setContentPos(yPos, 'bot');
				}
			}
			// Scroll the content
			// *** Note: When the scroll handle is told to go past the limits, set the content to its top or bottom most position
			this.setContentPos = function(handleY, hitLimit)
			{
				var percent = (handleY - this.topLimit) / this.trackHeight; // The percentage amount of how far the handle is down the track
				var yPos = -(this.scrollAmt * percent); // The content yPos is moved the same percentage as the handle yPos
				
				if(!hitLimit) { content.css({ 'top':yPos }); }
				else { hitLimit === 'top' ? content.css({ 'top':0 }) : content.css({ 'top':-(this.scrollAmt) }); }
			}
						
			// If the device has a touch screen, use touch scrolling instead of a scrollbar
			// *** Revise later: A second touchmove after content is scrolled once returns the content to the top position, this is due to the recalculation of moveAmt
			// *** Revise later: Touch scrolling is kinda buggy on smart phones and Nook tablet. Content scrolls too far down, but only sometimes, and is not very responsive
			this.touchScroll = function() 
			{
				var evt;
				
				content.css({ 'top':0 }); // Changes the top value from 'auto' to a numeric value, otherwise Nan is returned in touchmove handler

				content.on('touchstart', function(e)
				{
					e.preventDefault();
					evt = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					
					var scrollAmt = contentHeight - contentParentHeight + (parseInt(content.css('paddingTop')) * 2); // Amount of pixels to scroll
					var touchPoint = evt.pageY; // Initial point of contact
					var moveAmt, contentYPos = 0;
	 	
					content.on('touchmove', function(e)
					{
						e.preventDefault();
						evt = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						moveAmt = evt.pageY - touchPoint; // moveAmt is the distance to move the content based on where the initial contact point was
						contentYPos = parseInt(content.css('top')) + moveAmt; // contentYPos is the current y position of the content

						if(contentYPos <= 0 && contentYPos > - (scrollAmt * 2)) // *** scrollAmt * 2 is needed only for the iPad? ***
						{
							content.css({ 'top':moveAmt });
						}
					});
				});
				content.on('touchend', function()
				{
					content.off('touchmove');
				});
			}            
		}
				
		/*************
		Builds a new Slide obj, instantiated in SlideMenu.createSlides()
		*** Note: Empty properties are set in SlideMenu.setContent() when the Slide's corresponding tour img has finished downloading
		*************/
		function Slide(uId, slideNum) 
		{
			var parent = this;
			
			this.el = $('<div class="slide clickable"><img class="loadingSlide" src="public/img/tourApp/imgLoading.gif" alt="Loading...">'); // The loading gif is swapped out for the slide's tour img in this.addImg()
			this.uId = uId; // A unique id is created for each tour img when it's uploaded during the tour building process, it stays the same even if the img name (alt) is changed or if the imgs are put into a different order 
			this.slideNum = slideNum; // The position of the slide inside the SlideMenu.slideArray
			this.src = '';
			this.alt = '';
			this.slideClass = ''; // The CSS class used to resize the tour img down to slide size
			this.type = ''; // The type of img that the slide holds, e.g. a standard ratio img, horizontal pano, or vertical pano, used as a class name for img sizing in the ImgDisplay obj
			this.height = 0; // Height of the tour img, not the slide obj itself
			this.width = 0; // Width of the tour img, not the slide obj itself
			this.interactive = false; // Flag used to indicate if the Slide's corresponding tour img has interactivity
			this.loaded = false; // Allow the slide to be viewable and clickable after the img is downloaded
			
			// Create the Slide's corresponding tour img and swap out the loading gif
			// *** Note: Called from SlideMenu.setContent() once the Slide's tour img has finished downloading
			this.addImg = function()
			{
				var slideImg = $('<img class="' + this.slideClass + '" src="' + this.src + '" alt="' + this.alt + '">');
				
				this.el.html(slideImg);
				this.loaded = true;
			};

			// When a slide is clicked on, pass its slideNum to SlideMenu.goToSlide() so it can advance the slide menu to the chosen slide, also pause the tour
			this.el.click(function()
			{
				if(parent.loaded)
				{
					SlideMenu.goToSlide(parent.slideNum);
					ImgDisplay.pauseTour(); // *** Revise later: This gets called everytime a slide is clicked even if the tour is paused, the play/pause funcs in the ImgDisplay obj could be refactored to avoid excess calls
				}
			});
		}
								
		/*************
		Builds a new TourImg obj, instantiated in ImgDisplay.setNewImg()
		*** Note: All of the properties of a TourImg obj are based off of the accompanying Slide obj's properties passed in on init
		*************/
		function TourImg(slide)
		{
			var parent = this;
						
			this.el = $('<div class="clickable">');
			this.img = $('<img src="' + slide.src + '" alt="' + slide.alt + '">');
			this.el.html(this.img);
									
			// Instance methods for the TourImg obj
			this.pointerOn = function() { this.el.addClass('clickable'); };
			this.pointerOff = function() { this.el.removeClass('clickable'); };
			this.setImgSize = function() // Called from ImgDisplay.setNewImg() to correct the size of the tour imgs *if* they're too large
			{
				// *** Note: The property slide.type is a CSS class that sets the correct height or width of the img
				// *** The dimensions set in the classes are equal to the dimensions of the imgDisplay for panoramas, dimensions for standard imgs are 20% larger than the imgDisplay so standard imgs have room to tween
				if(slide.type === 'stdImg')
				{
					this.img.addClass(slide.type);
				}
				else if(slide.type === 'horiImg' && slide.height > ImgDisplay.elHeight)
				{
					this.img.addClass(slide.type);
				}
				else if(slide.type === 'vertImg')
				{
					if(slide.width > ImgDisplay.elWidth)
					{
						this.img.addClass(slide.type); // If the img is a vertical pano and wider than the imgDisplay, apply a class to it to reduce its size
					}
					else if(slide.width < ImgDisplay.elWidth)
					{
						ImgName.changePos(ImgDisplay.elWidth, slide.width); // If the img is a vertical pano and thiner than the imgDisplay, move the ImgName obj to keep it lined up on the right side of the img
					}
				}
			}
			this.setupInteractivity = function(imgWidth, imgHeight) // Called from ImgDisplay.setNewImg() *only* if the TourImg obj has interactivity that needs to be setup
			{
				// Each tour img in the config file can have an array called 'interactive.' This array is made of iaObjs that contain the values needed to setup each interactive btn, iaType, iaData, etc
				$.each(slide.interactive, function(index, iaObj)
				{
					if(iaObj.type === 'txt') // Pop up text box interactivity
					{
						var infoBtn = $('<img class="iaBtns" src="public/img/tourApp/infoBtn.png" alt="Info button">');
						
						infoBtn.click(function() { Interactive.info(iaObj.data); });
						positionBtn(infoBtn, iaObj.xPct, iaObj.yPct);
					}
					else if(iaObj.type === 'pic') // Pop up interactive picture
					{
						var picBtn = $('<img class="iaBtns" src="public/img/tourApp/picBtn.png" alt="Interactive picture button">');
						
						picBtn.click(function() { Interactive.iaPic(iaObj.uId); });
						positionBtn(picBtn, iaObj.xPct, iaObj.yPct);
					}
					else if(iaObj.type === 'nav') // Navigation interactivity
					{
						// Loop through the slideArray and find the slide that matches the uId value of the img to navigate to, then setup the btn and its listener
						// *** Note: The value of iaObj.data, in this condition, is the uId of the img to be navigated to
						// *** Note: If the img to be navigated to doesn't exist because it got deleted, the nav btn won't be setup
						$.each(SlideMenu.slideArray, function(index, slide)
						{
							if(slide.uId === iaObj.data)
							{
								var navBtn = $('<img class="iaBtns" src="public/img/tourApp/navBtn.png" alt="Navigate button">');
					
								navBtn.click(function() { Interactive.navigate(slide); });
								positionBtn(navBtn, iaObj.xPct, iaObj.yPct);
							}
						});
					}
				});
				
				function positionBtn(btn, xPct, yPct)
				{
					var xPos = Math.round(imgWidth * (xPct / 100)) + 'px'; // Calculate the X/Y positions of the btn on the tour img
					var yPos = Math.round(imgHeight * (yPct / 100)) + 'px'; // value.xPos/yPos are percentages set in the config file to calculate the left/top position of the btn 
					btn.css({ 'left':xPos, 'top':yPos }); // Position the btn on the tour img
					parent.el.append(btn); // Add the btn to the TourImg obj
				}
			}
						
			// Add event listeners for the TourImg obj
			this.img.on('click touchstart', function() { ImgDisplay.pause(); });
		}
							 
		Param.init();
		WindowSize.init();
		SlideMenu.init();
		SlideScrollbar.init();
		Preloader.init();
		ImgDisplay.init();
		TextBoxes.init();
		TabMenu.init(); 
	});
});

// ************** remember your on an EX branch ****************
// *** Finish tab menu ***
// calculator and map not maintaining state when navigated away from, this is because the content is detached from the tourImgMask. How to fix that???
// tab page is not fully overlapping on iPad?
// Look into using sprites for all of the small jpegs and pngs...
// Might have issue with the music not auto playing on new touch capable windows machines, find way to detect only mobile devices like how Param.isTouchCapable is found?
// IDEA: could use new touch scrolling idea for panning to prevent the ugly picture jumping, basically get the current mouse point and subtract that from the current pageY, use that number to move the tour img
// IDEA: what about having an executive obj that acts as an API between objs?  Calls from one obj to another would go through the exObj or anytime something needs to happen and things need to be reset, the exObj is used?
// IDEA: float the img name in the upper right corner with no attachment?? also make a little bigger? gets rid of needing to be perfect issues and extra lines in media queries
// Test Windows 8 touch screens at Best Buy when tab menu is done