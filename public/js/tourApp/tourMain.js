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
            // After the first several imgs in the load order are downloaded, start the tour
            checkLoading: function()
            {
                this.startCount++;
                
                if(this.startCount === param.amtToLoad)
                {
                    var mask = $('.loadingMask');
                    $('#loading img').remove();
                    TweenMax.to(mask, param.maskTweenTime, { width:0, opacity:param.maskOpacity, onComplete:function(){ mask.remove(); } }); // Tween open the loading masks and remove them when done
                    
                    SlideMenu.startTour();
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
            // Center all of the slides in the middle of the slide menu so they appear to fan out on start
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
                        TweenMax.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, zIndex:zPos, ease:Quint.easeOut });
                    }
                    else if(index > id) // Slides rendered below the current slide
                    {
                        offset = index - id;
                        xPos = offset * param.horiSpace;
                        yPos = (parent.centerY - (slideHeight / 2)) + (offset * param.vertSpace) + param.centerGap;
                        zPos = param.topZ - offset;
                        TweenMax.to(slide.el, param.slideTweenTime, { left:xPos, top:yPos, zIndex:zPos, ease:Quint.easeOut });
                    }
                    else // The current slide
                    {
                        xPos = 0;
                        yPos = parent.centerY - (slideHeight / 2);
                        zPos = param.topZ
                        TweenMax.to(slide.el, param.slideTweenTime, { left: xPos, top:yPos, zIndex:zPos, ease:Quint.easeOut });
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
            this.el = $('<div class="slide clickable">'); // DOM element for the Slide obj
            this.el.html(_.template($('#slideTemp').html(), { alt: this.alt, src: this.src }, { variable: 'img' })); // Interpolate the vars into the underscore.js slide template and add it to el
            
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
        The ImgDisplay obj handles the changing, sizing, display, and tweening of the current tour img
        *************/
        var ImgDisplay =
        {
            el: $('#imgDisplay'),
            tourImgDiv: $('#tourImgDiv'),
            tourImg: $('#tourImg'),
            tourPlayBtn: $('#tourPlayBtn'),
            tourPauseBtn: $('#tourPauseBtn'),
            elHeight: 0, // Height and width of the imgDisplay
            elWidth: 0,
            isPlaying: true, // Flag used to tell if the tour is playing or not
            isTweening: false, // Flag used to tell if the tour img is moving or not
            firstTween: true, // Flag used to tell if the tween is the initial one
            tween: new TimelineLite(), // Timeline obj that all tweens occur upon
            
            init: function()
            {
                var parent = this;
                this.elHeight = this.el.height(); // Eliminate multiple calls to jQuery's height/width functions
                this.elWidth = this.el.width();
                
                // Add event listeners to the play and pause btns
                this.tourPlayBtn.click(function() { if(!parent.isPlaying) { parent.playBtn(); } });
                this.tourPauseBtn.click(function() { if(parent.isPlaying || parent.isTweening) { parent.pauseBtn(); } });
                this.tourImgDiv.click(function() { parent.pauseTour(); }); // ********************************** might need to modify this to stop or clear the tween for mouse panning? **************************
            },
            // Pluck the img element out of the current slide and apply its attributes to the current tour img, size the tourImg if need be using the Slide obj's type property 
            changeImg: function()
            {
                var slide = SlideMenu.slideArray[SlideMenu.currId]; // Reference to a specific Slide obj
                
                ImgName.changeName(slide.alt); // Change the text in the ImgName obj, reset its position if necessary
                this.tourImg.removeClass(); // Remove any previously applied class
                this.tourImg.attr({ 'alt': slide.alt, 'src': slide.src });
                this.tween.progress(0); // Reset the tween's timeline
                this.tween.clear(); // Clear the tween's timeline
                this.tween.restart(); // Clear any tween.stop() calls and restart the timeline
                this.checkSize(slide); // Apply a class to size the tour img if need be
                this.startTween(slide); // Apply new tween to current tour img
            },
            // Size the tour imgs to fit in the imgDisplay window and reposition the ImgName obj if necessary
            checkSize: function(slide)
            {
                // slide.type is a CSS class that sets the correct height or width of the img *if* its too large
                // *** Note: The dimensions set in the classes are equal to the dimensions of the imgDisplay for panoramas, dimensions for standard imgs are 20% larger than the imgDisplay so standard imgs have room to tween
                if(slide.type === 'stdImg')
                {
                    this.tourImg.addClass(slide.type);
                }
                else if(slide.type === 'horiImg' && slide.height > this.elHeight)
                {
                    this.tourImg.addClass(slide.type);
                }
                else if(slide.type === 'vertImg')
                {
                    if(slide.width > this.elWidth)
                    {
                        this.tourImg.addClass(slide.type); // If the img is a vertical pano and wider than the imgDisplay, apply a class to it to reduce its size
                    }
                    else if(slide.width < this.elWidth)
                    {
                        ImgName.changePos(this.elWidth, slide.width); // If the img is a vertical pano and thiner than the imgDisplay, move the ImgName obj to keep it lined up on the right side of the img
                    }
                }
            },
            // Handle the movement of the current tour img, and the timing of the img transitions 
            startTween: function(slide)
            {
                var tween = this.tween;
                var tourImgHeight = this.tourImg.height();
                var tourImgWidth = this.tourImg.width();
                var heightDif = tourImgHeight - this.elHeight; // The number of pixels the img is tweened
                var widthDif = tourImgWidth - this.elWidth;
                                
                if(slide.type === 'stdImg')
                {
                    var stdTweenLength = this.calcTweenLength(widthDif); // Number of seconds the tour img takes to tween
                    var tweenNum = Math.ceil(Math.random() * 4); // Random tween in the switch statement

                    // Make the first tween move the tour img into the upper left corner and back
                    if(this.firstTween)
                    {
                        tweenNum = 1;
                        this.firstTween = false;
                    }
                    switch(tweenNum)
                    {
                        case 1: // Moves image into upper left corner and back
                            this.tourImgDiv.css({ 'top':0, 'left':0 });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:-heightDif, left:-widthDif, ease:Linear.easeNone });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:0, left:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;
                        case 2: // Moves image into upper right corner and back
                            this.tourImgDiv.css({ 'top':0, 'left':this.elWidth - tourImgWidth });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:-heightDif, left:0, ease:Linear.easeNone });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:0, left:this.elWidth - tourImgWidth, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;
                        case 3: // Moves image into lower right corner and back
                            this.tourImgDiv.css({ 'top':this.elHeight - tourImgHeight, 'left':this.elWidth - tourImgWidth });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:0, left:0, ease:Linear.easeNone });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:this.elHeight - tourImgHeight, left:this.elWidth - tourImgWidth, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;
                        case 4: // Moves image into lower left corner and back
                            this.tourImgDiv.css({ 'top':this.elHeight - tourImgHeight, 'left':0 });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:0, left:-widthDif, ease:Linear.easeNone });
                            tween.to(this.tourImgDiv, stdTweenLength, { top:this.elHeight - tourImgHeight, left:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                        break;					
                    }
                }
                else if(slide.type === 'horiImg')
                {
                    var horiTweenLength = this.calcTweenLength(widthDif); // Set time for horizontal panos
                    var leftOrRight = Math.ceil(Math.random() * 2);
                    
                    if(leftOrRight === 1) // When leftOrRight equals 1, move the pano to the left
                    {
                        this.tourImgDiv.css({ 'top':(this.elHeight / 2) - (tourImgHeight / 2), 'left':0 });
                        tween.to(this.tourImgDiv, (horiTweenLength / 2), { left:-widthDif, ease:Linear.easeNone });
                        tween.to(this.tourImgDiv, (horiTweenLength / 2), { left:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                    else // When leftOrRight equals 2, move the pano to the right
                    {
                        this.tourImgDiv.css({ 'top':(this.elHeight / 2) - (tourImgHeight / 2), 'left':-widthDif });
                        tween.to(this.tourImgDiv, (horiTweenLength / 2), { left:0, ease:Linear.easeNone });
                        tween.to(this.tourImgDiv, (horiTweenLength / 2), { left:-widthDif, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                }
                else if(slide.type === 'vertImg')
                {
                    var vertTweenLength = this.calcTweenLength(heightDif); // Set time for vertical panos
                    var upOrDown = Math.ceil(Math.random() * 2);

                    if(upOrDown === 1) // When upOrDown equals 1, move the pano up
                    {
                        this.tourImgDiv.css({ 'top':0, 'left':(this.elWidth / 2) - (tourImgWidth / 2) });
                        tween.to(this.tourImgDiv, vertTweenLength, { top:-heightDif, ease:Linear.easeNone });
                        tween.to(this.tourImgDiv, vertTweenLength, { top:0, ease:Linear.easeNone, onComplete:this.tweenDone });
                    }
                    else // When upOrDown equals 2, move the pano down
                    {
                        this.tourImgDiv.css({ 'top':-heightDif, 'left':(this.elWidth / 2) - (tourImgWidth / 2) });
                        tween.to(this.tourImgDiv, vertTweenLength, { top:0, ease:Linear.easeNone });
                        tween.to(this.tourImgDiv, vertTweenLength, { top:-heightDif, ease:Linear.easeNone, onComplete:this.tweenDone });
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
            // Proceed to the next tour img after the previous one has finished tweening if tour is set to play
            tweenDone: function()
            {
                // *** Note: Not sure why, but obj properties in this func have to be accessed through the ImgDisplay obj and not 'this'. Maybe an issue with being a TimelineLite callback?
                ImgDisplay.isTweening = false;
                
                if(ImgDisplay.isPlaying) // If the tour is playing, advance to the next tour img
                {
                    SlideMenu.nextSlide();
                }
            },
            // These functions handle the stopping and playing of the tour and tweening of the tour imgs
            // *** Note: The play/pauseTween and play/pauseTour funcs on separated out because pauseTour() is used in the SlideMenu obj and doesn't need to stop the tweening when used
            playBtn: function()
            {
                if(!this.isPlaying && !this.isTweening) { SlideMenu.nextSlide(); } // If the tour is paused, the tour img is done tweening, and the play btn gets clicked, advance to the next tour img
                
                this.playTween();
                this.playTour();
            },
            pauseBtn: function()
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
                this.tween.stop();
            },
            playTour: function()
            {
                this.isPlaying = true;
                this.togglePlayPause();
            },
            pauseTour: function()
            {
                this.isPlaying = false;
                this.togglePlayPause();
            },
            // Add or remove classes depending on the state of play/pause
            togglePlayPause: function()
            {
                if(this.isPlaying)
                {
                    this.tourPlayBtn.addClass('underline');
                    this.tourPauseBtn.removeClass('underline');
                    this.tourImgDiv.removeClass('clickable');
                }
                else
                {
                    this.tourPlayBtn.removeClass('underline');
                    this.tourPauseBtn.addClass('underline');
                    this.tourImgDiv.addClass('clickable');
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
                var reset = $('#viewport').width() - (parseFloat(ImgDisplay.el.css('left')) + parseFloat(ImgDisplay.el.css('width'))); // Calculate the reset position
                // *** Note: The css() method is used here b/c jQuery's width() method returns the computed width which subtracts the border width due to the box-sizing being set to border-box
                    
                this.el.css('right', reset); // This is set from the right because the ImgName obj's changing width would mess up positioning it from the left
                this.alteredPos = false;
            }
        };
        
        /*************
        The TextBoxes obj handles the setup of the info boxes on the bottom of the tour viewport
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
                var template = _.template($('#addressBoxTemp').html(), { data: addressBox }, { variable: 'address' });
                el.html(template);
            },
            contactBox: function()
            {
                var el = $('#contactBox');
                var template = _.template($('#contactBoxTemp').html(), { data: contactBox }, { variable: 'contact' });
                el.html(template);
            }
        };
       
        SlideMenu.init();
        Preloader.init();
        ImgDisplay.init();
        TextBoxes.init();
    });
});
// *** tourImg object for fading out tourImgs ***
// *** mouse panning features, click on tour img pauses tour and pans ***
// *** Look into how to make the tour responsive after the ImgDisplay is done? ***