$(document).ready(function()
{
    var param = new Param(); // *** Parameters obj, will be included after dev is done ***
    
    $.getJSON('tours/' + tourDirectory + '/config.json', function(config)
    {
        document.title = config.pageTitle;
        $('head title').before('<link rel="stylesheet" type="text/css" href="public/css/tourApp/' + config.theme + '" media="screen" />'); // Inject the correct theme stylesheet into the head
        
        var imgArray = config.images;
        
        // Master view of the slide menu
        var SlideMenu =
        {
            el: $('#slideMenu'),
            
            init: function() // Set up the slide menu and create place holder imgs with img names in the correct rendering order 
            {
                var topHalf = imgArray.slice(0, Math.floor(imgArray.length / 2 + 1)); // Imgs in the JSON file are listed in the order they are to be cycled, this code takes the top part of that array and puts it on the bottom half so the slide menu displays the imgs correctly
                var bottomHalf = imgArray.slice(Math.floor(imgArray.length / 2 + 1), imgArray.length);
                var renderOrder = bottomHalf.concat(topHalf); // Order of the displayed imgs on the screen from top to bottom
                var slideArray = [];
                
                $.each(renderOrder, function(index)
                {
                    var slide = new Slide(index, this.name); // Pass Slide the name of the img that will replace the place holder when its done loading
                    slideArray.push(slide.render()) // Create the slide and add it to the array of slides
                });
                
                this.el.append(slideArray); // Append all of the slides at once to reduce browser reflows
            },
            createThumb: function(img)
            {
                if(img.height > img.width)
                {
                    this.setContent(img, 'verThumb'); // Img is a vertical panorama, pass verThumb class
                }
                else if(img.height / img.width < param.maxHorRatio)
                {
                    this.setContent(img, 'horThumb'); // Img is a horizontal panorama, pass horThumb class
                }
                else
                {
                    this.setContent(img, 'stdThumb'); // Standard ratio image, pass stdThumb class
                }
            },
            setContent: function(thumb, thumbClass)
            {
                var imgEle = this.el.find('img[alt="' + thumb.alt + '"]');
                imgEle.attr('src', thumb.src); // Change the src attr on the img element from the place holder to the src of the preloaded tour img
                imgEle.removeClass().addClass(thumbClass); // Remove the loadingThumb class and add the new class
            }
        };
        
        // Sets up a Slide with a placeholder loading gif that is replaced in SlideMenu.setContent() when the img is done downloading
        function Slide(id, slideName) 
        {
            var parentObj = this;
            var el = $('<div class="slide">');
            
            this.id = id;
            this.name = slideName;
            this.path = 'public/img/tourApp/imgLoading.gif';
            this.interactive = false;
            
            this.render = function()
            {
                var template = $('#slideTemp').html();
                var temp = _.template(template);
                return el.html(temp({name: this.name, path: this.path})); // Insert the vars into the template
            };
            
            el.click(function()
            {
                console.log(parentObj.id);
            });
        }
        
        // Handles the preloading of tour imgs
        var Preloader =
        {
            preloadArray: [],
            preloadArraySize: 0,
            loadCount: 0,
            startCount: 0,
            
            preloadOrder: function() // Create an array that contains the imgs in the order they're to be loaded, this way imgs are loaded starting with the center img and radiating outwards towards the ends of the slide menu
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
            preload: function() // Preload the imgs so they're ready to display when the tour starts
            {
                var parentObj = this;
                
                if(this.loadCount < this.preloadArraySize)
                {
                    var img = new Image();
                    img.src = this.preloadArray[this.loadCount].path; // Set the attributes on the img obj to the values in the JSON file
                    img.alt = this.preloadArray[this.loadCount].name;
                    
                    var loadTimer = setInterval(function() // Use a setInterval var attached to each img to check every 1/4 second if the img is done downloading yet
                    {
                        if(img.width > 0)
                        {
                            SlideMenu.createThumb(img); // Create the thumbnail img used in the slide menu
                            clearInterval(loadTimer);
                            parentObj.loadCount++;
                            parentObj.checkLoading();
                            parentObj.preload(); // Recursive call to keep loading more imgs
                        }
                    }, 250);
                }
            },
            checkLoading: function() // After the first five imgs in the load order are downloaded, start the tour
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