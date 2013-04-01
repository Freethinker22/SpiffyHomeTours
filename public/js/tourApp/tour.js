$(function()
{
    var param = new Param(); // *** Parameters obj, will be included after dev is done ***
        
    $.getJSON('tours/' + window.tourDirectory + '/config.json', function(config) // Get the config file for a specific tour, window.tourDirectory is set in the head of mainView.php 
    {
        document.title = config.pageTitle;
        $('head title').before('<link rel="stylesheet" type="text/css" href="public/css/tourApp/' + config.theme + '" media="screen" />'); // Inject the correct theme stylesheet into the head
        
        // References to data arrays in the the config file
        var imgArray = config.images;
        var imgArrLen = imgArray.length;
        var addressBox = config.addressBox;
        var contactBox = config.contactBox;
        var music = config.music;
                
        /*************
        The Preloader obj handles the reordering and preloading of the tour imgs and the preloading of any interactive pics
        *************/
        var Preloader =
        {
            preloadArray: [], // Each preloadArray element is a reference to each of the image objs in the config file
            preloadArraySize: 0,
            loadCount: 0, // The total number of tour imgs downloaded
            startCount: 0, // When a set amount of tour imgs have finished loading, the tour is started
            
            // Populate the preloadArray with the tour imgs in the order they're to be loaded, this way the slides in the slide menu are loaded starting with the center slide and radiating outwards towards the ends of the menu
            init:function()
            {
                var topHalf = imgArray.slice(0, Math.floor(imgArrLen / 2 + 1));
                var bottomHalf = imgArray.slice(Math.floor(imgArrLen / 2 + 1), imgArrLen).reverse(); 
                
                for(var i = 0; i < Math.max(topHalf.length, bottomHalf.length); i++) // 'Zip' the two halfs of the array together into the preloadArray
                {
                    if(i < topHalf.length) { this.preloadArray.push(topHalf[i]); }
                    if(i < bottomHalf.length) { this.preloadArray.push(bottomHalf[i]); }
                }
                this.preloadArraySize = this.preloadArray.length;
                this.preload();
            },
            // Preload the imgs so they're ready to display when the tour starts
            preload:function()
            {
                var parent = this;
                
                if(this.loadCount < this.preloadArraySize)
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
            // *** Note: Native JS for loops are used in most situations instead of jQuery each loops to increase performance
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
                
                if(this.startCount === param.amtToLoad)
                {
                    var mask = $('.loadingMask');
                    
                    $('#loading img').remove();
                    TweenLite.to(mask, param.maskTweenTime, { width:0, opacity:param.maskOpacity, onComplete:function() { mask.remove(); } }); // Tween open the loading masks and remove them when done
                    
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
            currSlideNum: Math.round(imgArrLen / 2 - 1), // The slideNum of current slide being displayed, onload this is the slideNum of the slide in the center that displays first
            centerY: 0, // The middle of the slide menu along the Y axis
            exTest:0,
            
            // Set up the slide menu and create place holder imgs with img names in the correct rendering order
            init:function() 
            {
                var parent = this;
                
                this.centerY = this.el.height() / 2;
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
            // Center all of the slides in the middle of the slide menu so they appear to fan out on load
            centerSlides:function()
            {
                var slideStartPosY = this.el.offset().top + (this.el.height() / 2); // The middle of the slide menu along the Y axis, accounting for the offset of the slide menu from the top of the window
                
                for(var i = 0; i < imgArrLen; i++) // Loop through the slideArray and set the top attr to center each slide in the SlideMenu() obj
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
            reorderSlides:function(slideNum)
            {
                var offset, xPos, yPos, zPos = 0;
                
                for(var i = 0; i < imgArrLen; i++)
                {
                    var slide = this.slideArray[i];
                    var centerSlideY = this.centerY - (slide.el.height() / 2); // The point where the top left corner of the center slide would be to make it exactly centered in the the slide menu
                    
                    if(i < slideNum) // Slides rendered above the current slide
                    {
                        offset = slideNum - i; // Number of slides in between the new current slide, which is the slideNum, and the index of the loop, used as a spacing multiplier
                        xPos = offset * param.horiSpace;
                        yPos = centerSlideY - (offset * param.vertSpace) - param.centerGap;
                        zPos = param.topZ - offset;
                        slide.el[0].style.zIndex = zPos; // The z-index is set here and not in the tween below because it needs to be set instantly to keep the slides from appering to flicker
                        TweenLite.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, ease:Quint.easeOut });
                    }
                    else if(i > slideNum) // Slides rendered below the current slide
                    {
                        offset = i - slideNum;
                        xPos = offset * param.horiSpace;
                        yPos = centerSlideY + (offset * param.vertSpace) + param.centerGap;
                        zPos = param.topZ - offset;
                        slide.el[0].style.zIndex = zPos;
                        TweenLite.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, ease:Quint.easeOut });
                    }
                    else // The current slide
                    {
                        xPos = 0;
                        yPos = centerSlideY;
                        zPos = param.topZ
                        slide.el[0].style.zIndex = zPos;
                        TweenLite.to(slide.el, param.slideTweenTime, { left: xPos, top:yPos, ease:Quint.easeOut });
                    }
                }
                                
                ImgDisplay.changeImg(slideNum); // Change the tourImg to the current slide
            },
            // Advance the slide menu by one if the next slide is loaded
            nextSlide:function()
            {
                var parent = this;
                var currSlideNumCopy = this.currSlideNum; // Temporary slideNum so currSlideNum doesn't change if the next slide is not loaded
                var nextSlide = function() // Calculate the slideNum of the next slide so it can be found in the slideArray and have its loaded property checked
                {
                    if(parent.currSlideNum === (imgArrLen - 1))
                    {
                        currSlideNumCopy = 0;
                        return currSlideNumCopy;
                    }
                    else
                    {
                        currSlideNumCopy++;
                        return currSlideNumCopy;
                    }
                };
                
                if(this.slideArray[nextSlide()].loaded) // If the next slide is not loaded, i.e. it hasn't finished downloading, don't move the slide menu
                {
                    if(parent.currSlideNum === (imgArrLen - 1)) // If the slide menu is on the last slide and nextSlide() is called again, go to the first slide
                    {
                        parent.currSlideNum = 0;
                        parent.reorderSlides(parent.currSlideNum);
                    }
                    else
                    {
                        parent.currSlideNum++;
                        parent.reorderSlides(parent.currSlideNum);
                    }
                }
            },
            // Reverse the slide menu by one if the prev slide is loaded
            prevSlide:function()
            {
                var parent = this;
                var currSlideNumCopy = this.currSlideNum; // Temporary slideNum so currSlideNum doesn't change if the prev slide is not loaded
                var prevSlide = function() // Calculate the slideNum of the prev slide so it can be found in the slideArray and have its loaded property checked
                {
                    if(parent.currSlideNum === 0)
                    {
                        currSlideNumCopy = imgArrLen - 1;
                        return currSlideNumCopy;
                    }
                    else
                    {
                        currSlideNumCopy--;
                        return currSlideNumCopy;
                    }
                };
                
                if(this.slideArray[prevSlide()].loaded) // If the prev slide is not loaded, i.e. it hasn't finished downloading, don't move the slide menu
                {
                    if(parent.currSlideNum === 0) // If the slide menu is at the first slide and prevSlide() is called again, go to the last slide
                    {
                        parent.currSlideNum = imgArrLen - 1;
                        parent.reorderSlides(parent.currSlideNum);
                    }
                    else
                    {
                        parent.currSlideNum--;
                        parent.reorderSlides(parent.currSlideNum);
                    }
                }
            },
            // Advance the slide menu to that of the accompanying slideNum
            goToSlide:function(slideNum)
            {
                var parent = this;
                
                if(slideNum !== this.currSlideNum) // Do nothing if the slideNum is that of the current slide showing
                {
                    parent.currSlideNum = slideNum;
                    parent.reorderSlides(slideNum);
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
                else if((img.height / img.width) <= param.maxHoriRatio)
                {
                    this.setContent(img, 'horiImg', 'horiSlide'); // Img is a horizontal panorama
                }
                else
                {
                    this.setContent(img, 'stdImg', 'stdSlide'); // Standard ratio image
                }
            },
            // Change place holders and set other properties on the Slide obj
            // *** Note: This func basically lines up the img objs in the preloadArray to the slide objs in the slideArray using each img obj's unique id
            setContent:function(img, imgType, slideClass)
            {                
                for(var i = 0; i < imgArrLen; i++)
                {
                    if(this.slideArray[i].uId === img.uId)
                    {
                        var slide = this.slideArray[i];
                        
                        slide.src = img.src;
                        slide.alt = img.alt;
                        slide.interactive = img.interactive
                        slide.height = img.height;
                        slide.width = img.width;
                        slide.type = imgType;
                        slide.img.attr({ 'src': img.src, 'alt': img.alt }).removeClass().addClass(slideClass); // Chained jQuery methods
                        slide.loaded = true;
                        break; // Once the correct slide is found, there is no need to keep looping
                    }
                }
            }
        };
        
        /*************
        The ImgDisplay obj handles the changing, sizing, playing, and tweening of the current tour img
        *** Note: Some instance vars set as empty objs and 0 at runtime and are set later after the tour imgs have downloaded
        *** Note: Methods that use, this.currImg.el multiple times, have a shorthand reference: var currImg = this.currImg.el, while other functions just use this.currImg.el once
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
            playMode: true, // Flag to indicate if the tour is in play mode or not
            tweenMode: false, // Flag to indicate if the tour img has finished tweening
            firstTween: true, // Flag to indicate if the tween is the initial tween
            prevImgTweenedOut: true, // Flag to indicate if the prev TourImg obj is done fading out
            movedByMouse: false, // Flag to indicate if the tour img was panned by the mouse
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
            // Pluck the img element out of the current slide and apply its attributes to the current tour img, size the tourImg if need be using the Slide obj's type property 
            changeImg:function(id)
            {
                this.slide = SlideMenu.slideArray[id]; // Reference to a specific Slide obj
                
                ImgName.changeName(this.slide.alt); // Change the text in the ImgName obj, resets its position if necessary
                this.tweenOut();
                this.setNewImg();
                this.resetTween();
                this.tweenIn();
                
                // If any interactive boxes or alerts are showing when the tour img changes, close them
                if(Interactive.infoBoxShowing) { Interactive.removeInfo(); }
                if(Interactive.iaPicShowing) { Interactive.removePic(); }
                if(Alert.alertShowing) { Alert.alertOff(); }
                
            },
            // Fade out the prev tour img
            tweenOut:function()
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
            removePrevImg:function()
            {
                ImgDisplay.prevImg.remove();
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
            // Handle the movement of the current tour img, assign a random tween based on the type of tour img being tweened
            tweenIn:function()
            {
                var tween = this.tween;
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
                this.tweenMode = true; // Flag used to tell if the tour img is moving or not
            },
            // Calculate the time the tourImg takes to tween across the imgDisplay and set min/max values if needed
            calcTweenLength:function(pixelDif)
            {
                var tweenLength = pixelDif / param.pixelsPerSec;
                
                if(tweenLength > param.maxTweenTime) { tweenLength = param.maxTweenTime; } // Limit the tween length
                if(tweenLength < param.minTweenTime) { tweenLength = param.minTweenTime; } // Set a minimum tween length
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
                if(!this.playMode && !this.tweenMode && !this.movedByMouse) { SlideMenu.nextSlide(); } // If the tour is paused, the tour img is done tweening, the tour img hasn't been panned, and the play btn gets clicked, advance to the next tour img
                
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
                this.mousePanningOff();
            },
            pauseTour:function()
            {
                if(this.playMode) // pauseTour() is called each time the slide menu is used, the logic here keeps excess funcs from being called when the tour is already in pause mode, see note in the Slide obj about refactoring this
                {
                    this.playMode = false;
                    this.togglePlayPause();
                }
                
                this.currImg.pointerOff();
                this.mousePanningOn();
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
            // Setup the listeners for the mouse panning feature when the tour is put in pause mode
            mousePanningOn:function()
            {
                var parent = this;
                var currImg = this.currImg.el; // Reference to the div element that is the TourImg obj
                var leftOffset = this.el.offset().left; // Used to calculate the 0,0 position of the imgDisplay
                var topOffset = this.el.offset().top
                
                currImg.on('mouseover', function()
                {
                    if(parent.tweenMode) // When a slide is clicked in the slide menu, the tour img tweens in as normal. When/if it's moused over while the tour is in pause mode, the tween is stopped in favor of mouse panning
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
            // Turn off the listeners for the mouse panning feature when the tour returns to play mode
            mousePanningOff:function()
            {
                var currImg = this.currImg.el; // This has to reference the current TourImg obj because it might have changed since mouse panning was turned on
                
                currImg.off(); // Remove all event listeners for the currImg
                
                if(this.movedByMouse) // If the tour img was panned by the mouse, advance to the next img when the tour is restarted
                {
                    this.movedByMouse = false;
                    SlideMenu.nextSlide();
                }
            }
        };
        
        /*************
        The Alert obj handles the displaying of messages to the user
        *************/
        var Alert =
        {
            alertMsg: $('#alertMsg'),
            timer: {},
            alertShowing: false, // Flag to indicate if the alert msg box is showing
            
            alertOn:function(msg, duration)
            {
                var parent = this;
                
                if(!this.alertShowing) // Don't show more than one msg at a time
                {
                    this.alertMsg.text(msg); // Add the msg to the p element in the DOM
                    this.alertMsg.removeClass('displayNone'); // Make the msg box visible
                    this.alertMsg.on('click', function() { parent.alertOff(); }); // Allow the user to clear the msg by clicking it
                    this.timer = setTimeout(function(){ parent.alertOff(); }, duration); // Remove the msgBox after a set time if the user doesn't remove it by clicking on it
                    this.alertShowing = true;
                }
            },
            alertOff:function()
            {
                var parent = this;
                
                TweenLite.to(this.alertMsg, .50,
                {
                    opacity:0,
                    onComplete:function()
                    {
                        clearTimeout(parent.timer);
                        parent.alertMsg.addClass('displayNone').text('').off(); // *** Note: jQuery methods, addClass(), text(), and off() are chanied
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
            iaPicBg: $('#iaPicBg'),
            iaPicArray: {}, // Associative array for the interactive pictures
            infoBoxShowing: false, // Flag to indicate if the interactive info box is open
            iaPicShowing: false, // Flag to indicate if the interactive pic is showing
            iaPicCloseMsgShown: false, // Flag to indicate if the close msg has been shown
            
            navigate:function(slide)
            { 
                // *** Note: If the tour img has not fully downloaded yet, alert the user
                slide.loaded ? SlideMenu.goToSlide(slide.slideNum) : Alert.alertOn('The image you\'re trying to navigate to has not fully downloaded yet.  Wait a sec and try again.', 5000);
                if(!ImgDisplay.playMode) { ImgDisplay.pauseTour(); } // If the tour is not in play mode, set up the mouse panning on the current tour img when its navigated to
            },
            info:function(text)
            {
                var parent = this;
                var boxHeight = 0;
                    
                if(!this.infoBoxShowing)
                {
                    ImgDisplay.pauseTween();
                    this.infoBoxText.text(text); // Insert the text into the p element of the info box
                    this.infoBox.removeClass('displayNone');
                    boxHeight = this.infoBoxText.height() + (parseFloat(this.infoBox.css('paddingTop')) * 2); // Calculate the distance to tween open the info box
                    
                    // Tween open the info box and when its open, un-hide the text and add its event listener
                    TweenLite.to(this.infoBox, .50,
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
                else
                {
                    this.removeInfo();
                }
            },
            removeInfo:function()
            {
                var parent = this;
                
                ImgDisplay.playTween();
                this.infoBoxText.text('');
                this.infoBoxText.addClass('hidden');
                
                TweenLite.to(this.infoBox, .50,
                {
                    height:0,
                    onComplete:function()
                    {
                        parent.infoBox.addClass('displayNone');
                        parent.infoBoxShowing = false;
                    }
                });
            },
            iaPic:function(uId)
            {
                var parent = this;
                
                if(this.iaPicArray[uId].loaded)
                {
                    if(!this.iaPicCloseMsgShown) // If it's the first time an iaPic has been opened, alert the user on how to close it
                    {
                        Alert.alertOn('Click anywhere on the image to resume the tour.', 4000);
                        this.iaPicCloseMsgShown = true;
                    }
                    
                    ImgDisplay.pauseTween();
                    this.iaPicBg.html(this.iaPicArray[uId].el); // Add the iaPic img element from the iaPicArray that matches the uId parameter
                    this.iaPicBg.removeClass('displayNone'); // Un-hide the iaPic background element
                    this.iaPicBg.on('click', function() { parent.removePic(); }); // Add a listener so the user can close the iaPic
                    this.iaPicShowing = true;
                    TweenLite.to(this.iaPicBg, .50, { opacity:1 });
                }
                else
                {
                    Alert.alertOn('The image you\'re trying to view has not fully downloaded yet.  Wait a sec and try again.', 5000); // *** Note: If the iaPic has not fully downloaded yet, alert the user
                }
                // *** Revise later: It's not really a problem, but if the tour is in pause mode, an iaPic is opened, and then the play btn is clicked. The tour starts playing with the iaPic open. The iaPic goes away on the next transition though
            },
            removePic:function()
            {
                var parent = this;
                
                ImgDisplay.playTween();
                
                TweenLite.to(this.iaPicBg, .50,
                {
                    opacity:0,
                    onComplete:function()
                    {
                        parent.iaPicBg.addClass('displayNone');
                        parent.iaPicBg.empty(); // Remove the iaPic img element from the DOM and remove its listener
                        parent.iaPicShowing = false;
                    }
                });
            },
            // Create a new interactive picture obj, make its uId a property of the iaPicArray, and the value of that property is the IaPic() obj itself
            createIaPicObj:function(uId, iaPicUrl)
            {
                var iaPic = new IaPic(); // Create new IaPic() obj
                
                iaPic.preloadIaPic(iaPicUrl); // Start the downloading of the iaPic
                this.iaPicArray[uId] = iaPic // Make the uId a property of the iaPicArray and have the iaPic() obj be its value, this way it can be accessed via uId in this.iaPic()
            }
        }
        
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
            // If the tour img is a vertical pano and thiner than the imgDisplay, keep the ImgName obj aligned with the tour img's right side
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
        
        /*************
        Create the audio tag and setup the music feature *after* the tour starts
        *************/
        var Music = 
        {
            musicBtns: $('#musicBtns'),
            playBtn: $('#musicPlayBtn'),
            pauseBtn: $('#musicPauseBtn'),
            audio: {},
            supported: false,
            isPlaying: false,

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
                    else if(window.isOldIe) // If the browser doesn't support HTML5 audio, use a Flash fallback for old IE
                    {
                        this.audio = $('#flashMusicPlayer').get(0);
                        this.checkAutoplay();
                        this.addPlayHandler();
                        this.addPauseHandler();
                        
                        // *** Note: The swf embed, function, and vars are setup in the IE conditional, in mainView.php
                        window.song = music.mp3;
                        window.autoplay = music.autoplay;
                        window.startMusic();
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
            // *** Note: Autoplay is turned off for phones because of possible slow connections and/or bandwidth restrictions
            checkAutoplay:function()
            {
                if(music.autoplay && $(window).width() > 800)
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
        
        /*************
        Builds a new Slide obj using placeholder properties, instantiated in SlideMenu.createSlides()
        *** Note: Placeholder properties are set in SlideMenu.setContent() when the Slide's corresponding tour img has finished downloading
        *************/
        function Slide(uId, slideNum) 
        {
            var parent = this;
            
            this.uId = uId; // A unique id is created for each tour img when it's uploaded during the tour building process, it stays the same even if the img name (alt) is changed or if the imgs are put into a different order 
            this.slideNum = slideNum; // The position of the slide inside the SlideMenu.slideArray
            this.src = 'public/img/tourApp/imgLoading.gif'; // The default values of this.src/alt are changed in SlideMenu.setContent() after its tour img is done downloading
            this.alt = 'Loading...';
            this.interactive = false;
            this.type = ''; // The type of img that the slide holds, e.g. a standard ratio img, horizontal pano, or vertical pano, used as a class name for img sizing in the ImgDisplay obj
            this.height = 0;
            this.width = 0;
            this.loaded = false; // Allow the slide to be viewable and clickable after the img is downloaded
            this.el = $('<div class="slide clickable">');
            this.img = $('<img class="loadingSlide" src="' + this.src + '" alt="' + this.alt + '">');
            this.el.html(this.img);
            
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
            
            this.el = $('<div class="absolute clickable">');
            this.img = $('<img src="' + slide.src + '" alt="' + slide.alt + '">');
            this.el.html(this.img);
            
            // Instance methods for the TourImg obj
            this.pointerOn = function() { this.el.addClass('clickable'); };
            this.pointerOff = function() { this.el.removeClass('clickable'); };
            this.setImgSize = function() // Called from ImgDisplay.setNewImg() to correct the size of the tour imgs *if* they're too large
            {
                // *** Note: The property slide.type is a CSS class that sets the correct height or width of the img
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
            this.img.click(function() { ImgDisplay.pause(); });
        }
        
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
                else if((this.el.height / this.el.width) <= param.maxHoriRatio) // Interactive picture is a horizontal panorama
                {
                    this.el.className = 'horiIaPic';
                }
                else // Standard ratio interactive picture
                {
                    this.el.className = 'stdIaPic';
                }
            }
        }
       
        SlideMenu.init();
        Preloader.init();
        ImgDisplay.init();
        TextBoxes.init();
    });
});
// ************** remember your on an EX branch ****************
// *** slide menu EX ***
// *** if iaText is opened then iaPic is opened tour img tweens if in play mode with the iaText open *** way to close iaText when iaPic is opened???
// *** refactor CSS
// *** before RWD, hard copy version control, commit and push, and push to live server and test on multiple devices *** Watch the network panel and see what order the imgs are downloaded in ***
// *** Look into how to make the tour responsive after the interactivity is done ***