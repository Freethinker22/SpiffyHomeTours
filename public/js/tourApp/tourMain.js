$(document).ready(function()
{
    var param = new Param(); // *** Parameters obj, will be included after dev is done ***
    
    $.getJSON('tours/' + tourDirectory + '/config.json', function(config)
    {
        document.title = config.pageTitle;
        $('head title').before('<link rel="stylesheet" type="text/css" href="public/css/tourApp/' + config.theme + '" media="screen" />'); // Inject the correct theme stylesheet into the head
        
        var imgArray = config.images; // Array of img data from the JSON file
        
        /*******
        Slide menu object
        *******/
        var SlideMenu =
        {
            el: $('#slideMenu'),
            slideArray: [], // Reference to all of the slides after they're rendered to the screen
            startId: Math.round(imgArray.length / 2 - 1), // The id of the slide in the center that displays first
            currId: 0, // The id of current slide being displayed
            centerY: 0, // The middle of the slide menu along the Y axis
            
            // Set up the slide menu and create place holder imgs with img names in the correct rendering order
            init: function() 
            {
                var parent = this;
                this.centerY = this.el.height() / 2;
                this.currId = this.startId;
                this.createSlides();
                
                $('#nextBtn').click(function() { parent.nextSlide(); }); // Add Events to the next and previous btns
                $('#prevBtn').click(function() { parent.prevSlide(); });                
            },
            // Reorder the imgArray into the render order and create a Slide obj for each of the imgs in the imgArray
            createSlides: function()
            {
                var renderArray = []; // Used like a document fragment to render all of the slides to the screen in one operation
                var topHalf = imgArray.slice(0, Math.floor(imgArray.length / 2 + 1)); // Imgs in the JSON file are listed in the order they are to be cycled, this code takes the top part of that array and puts it on the bottom half so the slide menu renders the imgs in the correct order
                var bottomHalf = imgArray.slice(Math.floor(imgArray.length / 2 + 1), imgArray.length);
                var renderOrder = bottomHalf.concat(topHalf); // Order of the imgs when rendered to the screen
                
                $.each(renderOrder, function(index)
                {
                    var slide = new Slide(index, this.name); // Pass Slide the name of the img that will replace the place holder img when its done loading
                    renderArray.push(slide.render());
                });
                
                this.el.append(renderArray); // Append all of the slides at once to reduce browser reflows
                this.slideArray = this.el.find('div'); // Populate this array with the div elements that represent each Slide obj
                this.centerSlides();
            },
            // Center all of the slides in the middle of the slide menu so they appear to fan out on load
            centerSlides: function()
            {
                var slideStartPosY = this.el.offset().top + (this.el.height() / 2); // The middle of the slide menu along the Y axis, accounting for the offset of the slide menu from the top of the window
                
                $.each(this.slideArray, function()
                {
                    $(this).offset({ top: slideStartPosY - ($(this).height() / 2) });
                });
                
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
                
                $.each(this.slideArray, function(index)
                {
                    var slide = $(this);
                    var slideHeight = slide.height();
                    
                    if(index < id) // Slides rendered above the current slide
                    {
                        offset = id - index;
                        xPos = offset * param.horiSpace;
                        yPos = (parent.centerY - (slideHeight / 2)) - (offset * param.vertSpace) - param.centerGap;
                        zPos = param.topZ - offset;
                        TweenMax.to(slide, param.transLength, { left:xPos, top:yPos, zIndex:zPos });
                    }
                    else if(index > id) // Slides rendered below the current slide
                    {
                        offset = index - id;
                        xPos = offset * param.horiSpace;
                        yPos = (parent.centerY - (slideHeight / 2)) + (offset * param.vertSpace) + param.centerGap;
                        zPos = param.topZ - offset;
                        TweenMax.to(slide, param.transLength, { left:xPos, top:yPos, zIndex:zPos  });
                    }
                    else // The current slide
                    {
                        xPos = 0;
                        yPos = parent.centerY - (slideHeight / 2);
                        zPos = param.topZ
                        TweenMax.to(slide, param.transLength, { left: xPos, top:yPos, zIndex:zPos });
                    }
                });
            },
            // Advance the slide menu by one
            nextSlide: function()
            {
                var parent = this;
                
                if(parent.currId === (imgArray.length - 1)) // If the slide menu is on the last slide and nextSlide() is called again, go to the first slide
                {
                    parent.currId = 0;
                    parent.reorderSlides(parent.currId);
                }
                else
                {
                    parent.currId++;
                    parent.reorderSlides(parent.currId);
                }
            },
            // Reverse the slide menu by one
            prevSlide: function()
            {
                var parent = this;
                
                if(parent.currId === 0) // If the slide menu is at the first slide and prevSlide() is called again, go to the last slide
                {
                    parent.currId = imgArray.length - 1;
                    parent.reorderSlides(parent.currId);
                }
                else
                {
                    parent.currId--;
                    parent.reorderSlides(parent.currId);
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
            // Determine which type of thumb class should be applied to the thumb in setContent()
            createThumb: function(img)
            {
                if(img.height > img.width)
                {
                    this.setContent(img, 'verThumb'); // Img is a vertical panorama, pass verThumb class
                }
                else if((img.height / img.width) < param.maxHoriRatio)
                {
                    this.setContent(img, 'horThumb'); // Img is a horizontal panorama, pass horThumb class
                }
                else
                {
                    this.setContent(img, 'stdThumb'); // Standard ratio image, pass stdThumb class
                }
            },
            // Change the src attr on the img element from the place holder to the src of the preloaded tour img, also set the class of the thumb
            setContent: function(thumb, thumbClass)
            {
                var imgEle = this.el.find('img[alt="' + thumb.alt + '"]');
                imgEle.attr('src', thumb.src);
                imgEle.removeClass().addClass(thumbClass);
            }
        };
        
        /*******
        Sets up a Slide with a placeholder loading gif that is replaced in SlideMenu.setContent() when the img is done downloading
        *******/
        function Slide(id, slideName) 
        {
            var parent = this;
            var el = $('<div class="slide">');
            
            this.id = id;
            this.name = slideName;
            this.path = 'public/img/tourApp/imgLoading.gif';
            this.interactive = false;
            
            this.render = function()
            {
                var template = $('#slideTemp').html();
                var temp = _.template(template);
                return el.html(temp({name: this.name, path: this.path})); // Interpolate the vars into the template
            };
            
            el.click(function()
            {
                SlideMenu.goToSlide(parent.id);
            });
        }
        
        /*******
        Handles the preloading of tour imgs
        *******/
        var Preloader =
        {
            preloadArray: [],
            preloadArraySize: 0,
            loadCount: 0,
            startCount: 0,
            // Create an array that contains the imgs in the order they're to be loaded, this way imgs are loaded starting with the center img and radiating outwards towards the ends of the slide menu
            preloadOrder: function()
            {
                var topHalf = imgArray.slice(0, Math.floor(imgArray.length / 2 + 1));
                var bottomHalf = imgArray.slice(Math.floor(imgArray.length / 2 + 1), imgArray.length).reverse(); 
                
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
                    img.src = this.preloadArray[this.loadCount].path; // Set the attributes on the img obj to the values in the JSON file
                    img.alt = this.preloadArray[this.loadCount].name;
                    
                    var loadTimer = setInterval(function() // Use a setInterval var attached to each img to check every 1/4 second if the img is done downloading yet
                    {
                        if(img.width > 0)
                        {
                            clearInterval(loadTimer);
                            SlideMenu.createThumb(img); // Create the thumbnail img used in the slide menu
                            parent.loadCount++;
                            parent.checkLoading();
                            parent.preload(); // Recursive call to keep loading more imgs
                        }
                    }, 250);
                }
            },
            // After the first five imgs in the load order are downloaded, start the tour
            checkLoading: function()
            {
                this.startCount++;
                
                if(this.startCount === param.amtToLoad)
                {
                    var mask = $('.loadingMask');
                    $('#loading img').remove();
                    TweenMax.to(mask, 3, { width:0, opacity:.75, onComplete:function(){ mask.remove(); } }); // Tween open the loading masks and remove them when done
                }
            }
        };
        SlideMenu.init();
        Preloader.preloadOrder();
    });
});

// *** FIRST: put the tourEX files, js and css, in the experiments folder AND then push to git and make back up copy in version control ***
// *** NEXT: setup templates for text boxes
// *** THEN: start on img display and img transitions