$(document).ready(function()
{
    var param = new Param(); // *** Parameters obj, will be included after dev is done ***
        
    $.getJSON('tours/' + tourDirectory + '/config.json', function(config)
    {
        document.title = config.pageTitle;
        $('head title').before('<link rel="stylesheet" type="text/css" href="public/css/tourApp/' + config.theme + '" media="screen" />'); // Inject the correct theme stylesheet into the head
        
        // References to data arrays in the the JSON file
        var imgArray = config.images;
        var imgArrLen = imgArray.length;
        var addressBox = config.addressBox;
        var contactBox = config.contactBox;
        var music = config.music;
        
        /*************
        The Preloader obj handles the reordering and preloading of the tour imgs 
        *************/
        var Preloader =
        {
            preloadArray: [],
            preloadArraySize: 0,
            loadCount: 0,
            startCount: 0,
            
            // Create an array that contains the imgs in the order they're to be loaded, this way imgs are loaded starting with the center img and radiating outwards towards the ends of the slide menu
            init: function()
            {
                var topHalf = imgArray.slice(0, Math.floor(imgArrLen / 2 + 1));
                var bottomHalf = imgArray.slice(Math.floor(imgArrLen / 2 + 1), imgArrLen).reverse(); 
                
                for(var i = 0; i < Math.max(topHalf.length, bottomHalf.length); i++) // 'Zip' the two halfs of the array together into the preloadArray
                {
                    if(i < topHalf.length) { this.preloadArray.push(topHalf[i]); }
                    if(i < bottomHalf.length){ this.preloadArray.push(bottomHalf[i]); }
                }
                this.preloadArraySize = this.preloadArray.length;
                this.preload();
            },
            // Preload the imgs so they're ready to display when the tour starts
            preload: function()
            {
                var parent = this;
                
                if(this.loadCount < this.preloadArraySize)
                {
                    var img = new Image();
                    img.src = this.preloadArray[this.loadCount].src; // Set the attributes on the img obj to the values in the JSON file
                    img.alt = this.preloadArray[this.loadCount].alt;
                    
                    var loadTimer = setInterval(function() // Use a setInterval var attached to each img to check every 1/4 second if the img is done downloading yet
                    {
                        if(img.width > 0)
                        {
                            clearInterval(loadTimer);
                            SlideMenu.calcImgType(img);
                            parent.loadCount++;
                            parent.checkLoading();
                            parent.preload(); // Recursive call to keep loading more imgs
                        }
                    }, 250);
                }
            },
            // Check to see how many imgs have fully downloaded and handle the mask tweening when the tour starts
            checkLoading: function()
            {
                this.startCount++;
                
                if(this.startCount === param.amtToLoad)
                {
                    var mask = $('.loadingMask');
                    $('#loading img').remove();
                    TweenLite.to(mask, param.maskTweenTime, { width:0, opacity:param.maskOpacity, onComplete:function(){ mask.remove(); } }); // Tween open the loading masks and remove them when done
                    
                    SlideMenu.startTour();// After the first several imgs in the load order are downloaded, start the tour
                    Music.init(); // Start the music when the tour starts
                }
            }
        };
        
        /*************
        The SlideMenu obj handles the setup and animations of the slide menu
        *************/
        var SlideMenu =
        {
            el: $('#slideMenu'),
            slideArray: [], // Reference to all of the Slide objs
            startId: Math.round(imgArrLen / 2 - 1), // The id of the slide in the center that displays first
            currId: 0, // The id of current slide being displayed
            centerY: 0, // The middle of the slide menu along the Y axis
            
            // Set up the slide menu and create place holder imgs with img names in the correct rendering order
            init: function() 
            {
                var parent = this;
                this.centerY = this.el.height() / 2;
                this.currId = this.startId;
                this.createSlides();
                this.centerSlides();
                
                // Add event listeners to the next and previous btns
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
            // Reorder the imgArray into the render order and create a Slide obj for each of the imgs in the imgArray
            createSlides: function()
            {
                var parent = this;
                var renderArray = []; // Used like a document fragment to render all of the slides to the screen in one operation
                var topHalf = imgArray.slice(0, Math.floor(imgArrLen / 2 + 1)); // Imgs in the JSON file are listed in the order they are to be cycled, this code takes the top part of that array and puts it on the bottom half so the slide menu renders the imgs in the correct order
                var bottomHalf = imgArray.slice(Math.floor(imgArrLen / 2 + 1), imgArrLen);
                var renderOrder = bottomHalf.concat(topHalf); // Order of the imgs when rendered to the screen
                
                $.each(renderOrder, function(index)
                {
                    var slide = new Slide(index, this.alt); // Pass Slide the name of the img that will replace the place holder img when its done loading
                    parent.slideArray.push(slide); // Populate the slideArray with references to the Slide Objs
                    renderArray.push(slide.el); // Populate the renderArray with references to the Slide obj's html
                });
                
                this.el.html(renderArray); // Append all of the slides at once to reduce browser reflows
            },
            // Center all of the slides in the middle of the slide menu so they appear to fan out on load
            centerSlides: function()
            {
                var slideStartPosY = this.el.offset().top + (this.el.height() / 2); // The middle of the slide menu along the Y axis, accounting for the offset of the slide menu from the top of the window
                
                $.each(this.slideArray, function(index, slide)
                {
                    slide.el.offset({ top: slideStartPosY - (slide.el.height() / 2) });
                });
            },
            // After the first several imgs in the load order are downloaded, this is called from checkLoading in the Preloader
            startTour: function()
            {
                this.reorderSlides(this.startId);
            },
            // Loop through the slideArray and calculate the position of each slide anytime an event happens to move the slide menu
            reorderSlides: function(id)
            {
                var parent = this;
                var offset = 0;
                var xPos = 0;
                var yPos = 0;
                var zPos = 0;
                
                // All vars with the syntax of param.varName are set in the Param object
                $.each(this.slideArray, function(index, slide)
                {
                    var slideHeight = slide.el.height();
                    
                    if(index < id) // Slides rendered above the current slide
                    {
                        offset = id - index;
                        xPos = offset * param.horiSpace;
                        yPos = (parent.centerY - (slideHeight / 2)) - (offset * param.vertSpace) - param.centerGap;
                        zPos = param.topZ - offset;
                        TweenLite.to(slide.el, 0, { zIndex:zPos }); // The z-index is set here and not in the tween below because it needs to be set instantly to keep the slides from appering to flicker
                        TweenLite.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, ease:Quint.easeOut });
                    }
                    else if(index > id) // Slides rendered below the current slide
                    {
                        offset = index - id;
                        xPos = offset * param.horiSpace;
                        yPos = (parent.centerY - (slideHeight / 2)) + (offset * param.vertSpace) + param.centerGap;
                        zPos = param.topZ - offset;
                        TweenLite.to(slide.el, 0, { zIndex:zPos });
                        TweenLite.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, ease:Quint.easeOut });
                    }
                    else // The current slide
                    {
                        xPos = 0;
                        yPos = parent.centerY - (slideHeight / 2);
                        zPos = param.topZ
                        TweenLite.to(slide.el, 0, { zIndex:zPos });
                        TweenLite.to(slide.el, param.slideTweenTime, { left: xPos, top:yPos, ease:Quint.easeOut });
                    }
                });
                
                ImgDisplay.changeImg(); // Change the tourImg to the current slide
            },
            // Advance the slide menu by one if the next slide is active
            nextSlide: function()
            {
                var parent = this;
                var currIdCopy = this.currId; // Temporary id so currId doesn't change if the next slide is inactive
                var nextSlide = function() // Calculate the id of the next slide so it can be found in the slideArray and have its active property checked
                {
                    if(parent.currId === (imgArrLen - 1))
                    {
                        currIdCopy = 0;
                        return currIdCopy;
                    }
                    else
                    {
                        currIdCopy++;
                        return currIdCopy;
                    }
                };
                
                if(this.slideArray[nextSlide()].active) // If the next slide is not active, i.e. it hasn't finished downloading, don't move the slide menu
                {
                    if(parent.currId === (imgArrLen - 1)) // If the slide menu is on the last slide and nextSlide() is called again, go to the first slide
                    {
                        parent.currId = 0;
                        parent.reorderSlides(parent.currId);
                    }
                    else
                    {
                        parent.currId++;
                        parent.reorderSlides(parent.currId);
                    }
                }
            },
            // Reverse the slide menu by one if the prev slide is active
            prevSlide: function()
            {
                var parent = this;
                var currIdCopy = this.currId; // Temporary id so currId doesn't change if the prev slide is inactive
                var prevSlide = function() // Calculate the id of the prev slide so it can be found in the slideArray and have its active property checked
                {
                    if(parent.currId === 0)
                    {
                        currIdCopy = imgArrLen - 1;
                        return currIdCopy;
                    }
                    else
                    {
                        currIdCopy--;
                        return currIdCopy;
                    }
                };
                
                if(this.slideArray[prevSlide()].active) // If the prev slide is not active, i.e. it hasn't finished downloading, don't move the slide menu
                {
                    if(parent.currId === 0) // If the slide menu is at the first slide and prevSlide() is called again, go to the last slide
                    {
                        parent.currId = imgArrLen - 1;
                        parent.reorderSlides(parent.currId);
                    }
                    else
                    {
                        parent.currId--;
                        parent.reorderSlides(parent.currId);
                    }
                }
            },
            // Advance the slide menu to that of the accompanying id
            goToSlide: function(id)
            {
                var parent = this;
                
                if(id !== this.currId) // Do nothing if the id is that of the current slide showing
                {
                    parent.currId = id;
                    parent.reorderSlides(id);
                }
            },
            // Called from preload() once the img is done downloading, determine what type of img it is and apply the right classes in setContent()
            calcImgType: function(img)
            {
                if(img.height > img.width)
                {
                    this.setContent(img, 'vertImg', 'vertSlide'); // Img is a vertical panorama
                }
                else if((img.height / img.width) < param.maxHoriRatio)
                {
                    this.setContent(img, 'horiImg', 'horiSlide'); // Img is a horizontal panorama
                }
                else
                {
                    this.setContent(img, 'stdImg', 'stdSlide'); // Standard ratio image
                }
            },
            // Change the src attr on the img element from the place holder to the src of the preloaded tour img, set other properties on the Slide obj that are used in the ImgDisplay
            setContent: function(img, imgType, slideClass)
            {
                $.each(this.slideArray, function(index, slide)
                {
                    if(slide.alt === img.alt)
                    {
                        slide.src = img.src;
                        slide.height = img.height;
                        slide.width = img.width;
                        slide.type = imgType;
                        slide.el.find('img').attr('src', img.src).removeClass().addClass(slideClass);
                        slide.active = true;
                    }
                });
            }
        };
                
        /*************
        The ImgDisplay obj handles the changing, sizing, playing, and tweening of the current tour img
        *** Note: Some instance vars set as empty objs and 0 at runtime and are set later after the tour imgs have downloaded
        *** Note: Functions that would repeat, this.currImg.el, have a shorthand reference: var currImg = this.currImg.el, while other functions just use this.currImg.el once
        *************/
        var ImgDisplay =
        {
            el: $('#imgDisplay'),
            tourPlayBtn: $('#tourPlayBtn'),
            tourPauseBtn: $('#tourPauseBtn'),
            slide: {}, // Reference to the current Slide obj
            currImg: {}, // The TourImg obj currently showing
            prevImg: {}, // Reference to the prev TourImg obj
            elHeight: 0, // Height of the imgDisplay
            elWidth: 0, // Width of the imgDisplay
            currImgHeight: 0, // Height of the tour img
            currImgWidth: 0, // Width of the tour img
            isPlaying: true, // Flag to indicate if the tour is playing or not
            isTweening: false, // Flag to indicate if the tour img is moving or not
            firstTween: true, // Flag to indicate if the tween is the initial tween
            prevImgTweenedOut: true, // Flag to indicate if the prev TourImg obj is done fading out
            movedByMouse: false, // Flag to indicate if the tour img was panned by the mouse
            tween: new TimelineLite(), // Timeline obj that all tweens occur upon            
            
            init: function()
            {
                var parent = this;
                
                this.togglePlayPause();
                
                // Eliminate multiple calls to jQuery's height/width functions
                this.elHeight = this.el.height();
                this.elWidth = this.el.width();
                
                // Add event listeners to the play/pause btns
                this.tourPlayBtn.click(function() { if(!parent.isPlaying) { parent.play(); } });
                this.tourPauseBtn.click(function() { if(parent.isPlaying || parent.isTweening) { parent.pause(); } });
            },
            // Pluck the img element out of the current slide and apply its attributes to the current tour img, size the tourImg if need be using the Slide obj's type property 
            changeImg: function()
            {
                this.slide = SlideMenu.slideArray[SlideMenu.currId]; // Reference to a specific Slide obj
                
                ImgName.changeName(this.slide.alt); // Change the text in the ImgName obj, resets its position if necessary
                this.tweenOut();
                this.setNewImg();
                this.resetTween();
                this.tweenIn();
            },
            // Fade out the prev tour img
            tweenOut: function()
            {
                if(!this.firstTween) // There is no prevImg to tween out on the initial load
                {
                    if(!this.prevImgTweenedOut) { this.removePrevImg(); } // If a new tour img is selected before the prevImg has finished being tweened out, remove it immediately so they don't stack up in the DOM
                    
                    this.prevImg = this.currImg.el; // Referance the prev tourImg as the curr tourImg so the prev tourImg can be tweened out and then removed
                    this.prevImgTweenedOut = false;
                    TweenLite.to(this.prevImg, param.fadeDelay, { opacity:0, onComplete:this.removePrevImg });
                }
            },
            // Remove the prev tour img from the DOM
            removePrevImg: function()
            {
                ImgDisplay.prevImg.remove();
                ImgDisplay.prevImgTweenedOut = true;
            },
             // Clear the tween's timeline, clear any tween.stop() calls, and restart the timeline
            resetTween: function()
            {
                this.tween.clear();
                this.tween.restart();
            },
            // Setup a new TourImg obj based on the current slide in the SlideMenu and add it to the DOM
            setNewImg: function()
            {
                this.currImg = new TourImg(this.slide); // New TourImg obj using the current slides info
                this.el.append(this.currImg.el); // Add the current img to the ImdDisplay obj
                this.currImgHeight = this.currImg.img.height(); // Set height of the tour img
                this.currImgWidth = this.currImg.img.width(); // Set width of the tour img
            },            
            // Handle the movement of the current tour img, assign a random tween based on the type of tour img being tweened
            tweenIn: function()
            {                
                var tween = this.tween;
                var currImg = this.currImg.el; // Reference to the div element that is the TourImg obj
                var heightDif = this.currImgHeight - this.elHeight; // Used for coordinates and the number of pixels the img is tweened up and down
                var widthDif = this.currImgWidth - this.elWidth; // Used for coordinates and the number of pixels the img is tweened left and right 
                var topStop = this.elHeight - this.currImgHeight // Coordinate at which a stdImg stops tweening up
                var leftStop = this.elWidth - this.currImgWidth; // Coordinate at which a stdImg stops tweening left
                var horiCenter = this.elHeight / 2 - this.currImgHeight / 2 // Coordinate at which horizontal panos are positioned
                var vertCenter = this.elWidth / 2 - this.currImgWidth / 2 // Coordinate at which vertical panos are positioned
                var tweenNum = 0; // Random number that corresponds to a tween in the logic statements
                var tweenLength = 0; // Number of seconds the tour img takes to tween
                                
                if(this.slide.type === 'stdImg')
                {
                    tweenNum = this.setTweenNum(4);
                    tweenLength = this.calcTweenLength(widthDif);

                    switch(tweenNum)
                    {
                        case 1: // Moves image into upper left corner and back
                            currImg.css({ 'top':0, 'left':0, 'opacity':0 });
                            tween.to(currImg, param.fadeDelay, { opacity:1 });
                            tween.to(currImg, tweenLength, { top:-heightDif, left:-widthDif, ease:Linear.easeNone }, '-=' + param.fadeDelay); // '-=' + param.fadeDelay moves this tween back on the timeline so it starts at the same time as the opacity fade
                            tween.to(currImg, tweenLength, { top:0, left:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;
                        case 2: // Moves image into upper right corner and back
                            currImg.css({ 'top':0, 'left':leftStop, 'opacity':0 });
                            tween.to(currImg, param.fadeDelay, { opacity:1 });
                            tween.to(currImg, tweenLength, { top:-heightDif, left:0, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                            tween.to(currImg, tweenLength, { top:0, left:leftStop, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;
                        case 3: // Moves image into lower right corner and back
                            currImg.css({ 'top':topStop, 'left':leftStop, 'opacity':0 });
                            tween.to(currImg, param.fadeDelay, { opacity:1 });
                            tween.to(currImg, tweenLength, { top:0, left:0, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                            tween.to(currImg, tweenLength, { top:topStop, left:leftStop, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;
                        case 4: // Moves image into lower left corner and back
                            currImg.css({ 'top':topStop, 'left':0, 'opacity':0 });
                            tween.to(currImg, param.fadeDelay, { opacity:1 });
                            tween.to(currImg, tweenLength, { top:0, left:-widthDif, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                            tween.to(currImg, tweenLength, { top:topStop, left:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;					
                    }
                }
                else if(this.slide.type === 'horiImg')
                {
                    tweenNum = this.setTweenNum(2);
                    tweenLength = this.calcTweenLength(widthDif);
                    
                    if(tweenNum === 1) // When leftOrRight equals 1, move the pano to the left
                    {
                        currImg.css({ 'top':horiCenter, 'left':0, 'opacity':0 });
                        tween.to(currImg, param.fadeDelay, { opacity:1 });
                        tween.to(currImg, tweenLength, { left:-widthDif, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                        tween.to(currImg, tweenLength, { left:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                    else // When leftOrRight equals 2, move the pano to the right
                    {
                        currImg.css({ 'top':horiCenter, 'left':-widthDif, 'opacity':0 });
                        tween.to(currImg, param.fadeDelay, { opacity:1 });
                        tween.to(currImg, tweenLength, { left:0, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                        tween.to(currImg, tweenLength, { left:-widthDif, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                }
                else if(this.slide.type === 'vertImg')
                {
                    tweenNum = this.setTweenNum(2);
                    tweenLength = this.calcTweenLength(heightDif);
                    
                    if(tweenNum === 1) // When upOrDown equals 1, move the pano up
                    {
                        currImg.css({ 'top':0, 'left':vertCenter, 'opacity':0 });
                        tween.to(currImg, param.fadeDelay, { opacity:1 });
                        tween.to(currImg, tweenLength, { top:-heightDif, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                        tween.to(currImg, tweenLength, { top:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                    else // When upOrDown equals 2, move the pano down
                    {
                        currImg.css({ 'top':-heightDif, 'left':vertCenter, 'opacity':0 });
                        tween.to(currImg, param.fadeDelay, { opacity:1 });
                        tween.to(currImg, tweenLength, { top:0, ease:Linear.easeNone }, '-=' + param.fadeDelay);
                        tween.to(currImg, tweenLength, { top:-heightDif, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                }
                this.isTweening = true; // Flag used to tell if the tour img is moving or not
            },
            // Calculate the time the tourImg takes to tween across the imgDisplay and set min/max values if needed
            calcTweenLength: function(pixelDif)
            {
                var tweenLength = pixelDif / param.pixelsPerSec;
                
                if(tweenLength > param.maxTweenTime) { tweenLength = param.maxTweenTime; } // Limit the tween length
                if(tweenLength < param.minTweenTime) { tweenLength = param.minTweenTime; } // Set a minimum tween length
                return tweenLength;
            },
            // Calculate a random number that is used to choose a particular tween algorithm
            setTweenNum: function(limit)
            {
                var tweenNum = Math.ceil(Math.random() * limit);
                
                if(this.firstTween)
                {
                    tweenNum = 1;
                    this.firstTween = false;
                }
                return tweenNum;
            },
            // Proceed to the next tour img after the previous one has finished tweening if tour is set to play
            tweenDone: function()
            {
                ImgDisplay.isTweening = false; // *** Note: Not sure why, but obj properties in this func have to be accessed through the ImgDisplay obj and not 'this'. Maybe an issue with being a TimelineLite callback?
                
                if(ImgDisplay.isPlaying) { SlideMenu.nextSlide(); } // If the tour is playing, advance to the next tour img
            },
            // These functions handle the stopping and playing of the tour and tweening of the tour imgs
            // *** Note: The play/pauseTween and play/pauseTour funcs on separated out because pauseTour() is used in Slide objs and doesn't need to stop the tweening when used
            play: function()
            {
                if(!this.isPlaying && !this.isTweening && !this.movedByMouse) { SlideMenu.nextSlide(); } // If the tour is paused, the tour img is done tweening, the tour img hasn't been panned, and the play btn gets clicked, advance to the next tour img
                
                this.playTween();
                this.playTour();
            },
            pause: function()
            {
                this.pauseTween();
                this.pauseTour();
            },
            playTween: function()
            {
                this.tween.play();
            },
            pauseTween: function()
            {
                this.currImg.el.css({ 'opacity':1 }); // Make sure the tour img is at full opacity before stopping the tween
                this.tween.stop();
            },
            playTour: function()
            {
                this.isPlaying = true;
                this.togglePlayPause();
                this.currImg.pointerOn();
                this.mousePanningOff();
            },
            pauseTour: function()
            {
                this.isPlaying = false;
                this.togglePlayPause();
                this.currImg.pointerOff();
                this.mousePanningOn();
            },
            // Add or remove underlining depending on the state of play/pause
            togglePlayPause: function()
            {
                if(this.isPlaying)
                {
                    this.tourPlayBtn.addClass('underline');
                    this.tourPauseBtn.removeClass('underline');
                }
                else
                {
                    this.tourPlayBtn.removeClass('underline');
                    this.tourPauseBtn.addClass('underline');
                }
            },
            // Setup the listeners for the mouse panning feature when the tour is paused
            mousePanningOn: function()
            {
                var parent = this;
                var currImg = this.currImg.el; // Reference to the div element that is the TourImg obj
                var leftOffset = this.el.offset().left; // Used to calculate the 0,0 position of the imgDisplay
                var topOffset = this.el.offset().top
                
                currImg.on('mouseover', function()
                {
                    if(parent.isTweening) // When a slide is clicked in the slide menu, the tour img tweens in as normal. When/if it's moused over while the tour is paused, the tween is stopped in favor of mouse panning
                    {
                        parent.pauseTween();
                    }
                });
                
                // Calculate new X and Y positions based on where the mouse is at and apply those to the TourImg obj's position
                currImg.on('mousemove', function(e)
                {
                    var xPos = ((e.pageX - leftOffset) / parent.elWidth) * (parent.currImgWidth - parent.elWidth) * -1; // (e.pageX/Y - left/topOffset) calculates 0,0 of the imgDisplay
                    var yPos = ((e.pageY - topOffset) / parent.elHeight) * (parent.currImgHeight - parent.elHeight) * -1;
                    
                    if(parent.slide.type === 'stdImg')
                    {
                        currImg.css({ 'left':xPos, 'top':yPos });
                    }
                    else if(parent.slide.type === 'horiImg')
                    {
                        currImg.css({ 'left':xPos });
                    }
                    else if(parent.slide.type === 'vertImg')
                    {
                        currImg.css({ 'top':yPos });
                    }
                    
                    if(!parent.movedByMouse) { parent.movedByMouse = true; } // Set the flag to notify mousePanningOff() to advance to the next img when tour is restarted
                });
            },
            // Turn off the listeners for the mouse panning feature when the tour is turn back on
            mousePanningOff:function()
            {
                var currImg = this.currImg.el; // Reference to the div element that is the TourImg obj
                
                currImg.off('mouseover');
                currImg.off('mousemove');
                
                if(this.movedByMouse) // If the tour img was panned by the mouse, advance to the next img when the tour is restarted
                {
                    this.movedByMouse = false;
                    SlideMenu.nextSlide();
                }
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
            changeName: function(imgName)
            {
                this.text.html(imgName);
                
                if(this.alteredPos) { this.resetPos(); }
            },
            // If the tour img is a vertical pano and thiner than the imgDisplay, keep the ImgName obj aligned with the tour img's right side
            changePos: function(elWidth, imgWidth)
            {
                var currPos = parseFloat(this.el.css('right'));
                var offset = (elWidth - imgWidth) / 2; // Distance to move the ImgName obj
                
                this.el.css('right', currPos + offset); // Move the ImgName obj to its new position
                this.alteredPos = true;
            },
            // Reset the ImgName to its origanal position if it was altered
            resetPos: function()
            {
                var reset = $('#tourWrapper').width() - (parseFloat(ImgDisplay.el.css('left')) + parseFloat(ImgDisplay.el.css('width'))); // Calculate the reset position
                // *** Note: The css() method has to be used here b/c jQuery's width() method returns the computed width which subtracts the border width due to the box-sizing being set to border-box
                    
                this.el.css({ 'right':reset }); // This is set from the right because the ImgName obj's changing width would mess up positioning it from the left
                this.alteredPos = false;
            }
        };
        
        /*************
        The TextBoxes obj handles the setup of the info boxes on the bottom of the tourWrapper
        *************/
        var TextBoxes = 
        {
            init: function()
            {
                this.addressBox();
                this.contactBox();
            },
             // Fetch the template and interpolate the data. Use: variable.data inside the template to access the data in the JSON file
            addressBox: function()
            {
                var el = $('#addressBox');
                var template = _.template($('#addressBoxTemp').html(), { data:addressBox }, { variable:'address' });
                el.html(template);
            },
            contactBox: function()
            {
                var el = $('#contactBox');
                var template = _.template($('#contactBoxTemp').html(), { data:contactBox }, { variable:'contact' });
                el.html(template);
            }
        };
        
        /*************
        Create the audio tag and setup the music feature *after* the tour starts
        *************/
        var Music = 
        {
            musicBtns: $('#musicBtns'),
            playBtn: $('#musicPlayBtn'),
            pauseBtn: $('#musicPauseBtn'),
            isPlaying: false,

            init: function()
            {
                var parent = this;
                                                
                if(!music.includeMusic) // If the user didn't want any music in the tour app, remove the music btns from the DOM
                {
                    this.musicBtns.remove();
                }
                else // Else, setup the audio element
                {
                    var supported = !!(document.createElement('audio').canPlayType); // Detect if old IE
                    
                    if(supported) // If the browser supports HTML5 audio, setup the audio tag and its sources
                    {
                        var audio = $('<audio loop="true">');

                        // If the user wants the music to autoplay and the device is not a phone, autoplay the music
                        // *** Note: Autoplay is turned off for phones because of possible slow connections and/or bandwidth restrictions
                        if(music.autoplay && $(window).width() > 800)
                        {
                            audio.attr('autoplay', 'autoplay');
                            this.isPlaying = true;
                            this.togglePlayPause();
                        }
                        else
                        {
                            this.togglePlayPause();
                        }

                        // Add a source elements and appends them to the audio element
                        this.addSource(audio, music.ogg, 'audio/ogg');
                        this.addSource(audio, music.mp3, 'audio/mp3');
                        this.musicBtns.append(audio);

                        // Add event listeners for the play/pause btns
                        this.playBtn.click(function()
                        {
                            audio.trigger('play');
                            parent.isPlaying = true;
                            parent.togglePlayPause();
                        });

                        this.pauseBtn.click(function()
                        {
                            audio.trigger('pause');
                            parent.isPlaying = false;
                            parent.togglePlayPause();
                        });
                    }
                    else if(window.isIE8) // If the browser doesn't support HTML5 audio, use a Flash fallback for old IE
                    {
                        var musicPlayer = $('#flashMusicPlayer').get(0);
                        
                        // *** Note: The swf embed, function, and vars are setup in the IE conditional in the mainView.php
                        window.song = music.mp3;
                        window.autoplay = music.autoplay;
                        window.startMusic();
                                                                        
                        if(music.autoplay && $(window).width() > 800)
                        {
                            this.isPlaying = true;
                            this.togglePlayPause();
                        }
                        else
                        {
                            this.togglePlayPause();
                        }
                        
                        this.playBtn.click(function()
                        {
                            musicPlayer.playMusic();
                            parent.isPlaying = true;
                            parent.togglePlayPause();
                        });

                        this.pauseBtn.click(function()
                        {
                            musicPlayer.pauseMusic();
                            parent.isPlaying = false;
                            parent.togglePlayPause();
                        });
                    }
                    else // If the browser doesn't support HTML5 audio and is not old IE, remove the music btns
                    {
                        this.musicBtns.remove();
                    }
                }
            },
            addSource: function(el, path, type)
            {                
                el.append($('<source>').attr({ 'src':path, 'type':type }));  
            },
            // Add or remove underlining depending on the state of play/pause
            togglePlayPause: function()
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
            }
        }
        
        /*************
        Builds a Slide with a placeholder loading gif that is replaced when the tour img is done downloading
        *************/
        function Slide(id, alt) 
        {
            var parent = this;
            
            this.id = id;
            this.alt = alt;
            this.src = 'public/img/tourApp/imgLoading.gif'; // Default loading gif
            this.type = ''; // The type of img that the slide holds, e.g. a standard ratio img, horizontal pano, or vertical pano, used as a class name for img sizing in the ImgDisplay obj
            this.height = 0;
            this.width = 0;
            this.interactive = false;
            this.active = false; // Allow the slide to be viewable and clickable after the img is downloaded            
            this.el = $('<div class="slide clickable"><img class="loadingSlide" src="' + this.src + '" alt="' + this.alt + '">'); // DOM elements of the Slide obj
            
            // When a slide is clicked on, pass its id to goToSlide() so it can advance the slide menu to the chosen slide, also pause the tour
            this.el.click(function()
            {
                if(parent.active)
                {
                    SlideMenu.goToSlide(parent.id);
                    ImgDisplay.pauseTour();
                }
            });
        }
        
        /*************
        Builds a TourImg obj using a Slide obj's info to create an img tag that is shown in the ImgDisplay obj
        *************/
        function TourImg(slide)
        {
            this.el = $('<div class="absolute clickable">');
            this.img = $('<img src="' + slide.src + '" alt="' + slide.alt + '">');
            this.el.html(this.img);
            
            // Instance methods for the TourImg obj
            this.pointerOn = function() { this.el.addClass('clickable'); };
            this.pointerOff = function() { this.el.removeClass('clickable'); };
                        
            // Add event listeners for the TourImg obj
            this.el.click(function() { ImgDisplay.pause(); });
            
            // slide.type is a CSS class that sets the correct height or width of the img *if* it's too large
            // *** Note: The dimensions set in the classes are equal to the dimensions of the imgDisplay for panoramas, dimensions for standard imgs are 20% larger than the imgDisplay so standard imgs have room to tween
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
       
        SlideMenu.init();
        Preloader.init();
        ImgDisplay.init();
        TextBoxes.init();
    });
});
// *** add interactivity feature ***
// *** before RWD, hard copy version control, commit and push, and push to live server and test on multiple devices ***
// *** Look into how to make the tour responsive after the interactivity is done ***