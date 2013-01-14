$(document).ready(function()
{
    $.getJSON('tours/' + tourDirectory + '/config.json', function(config)
    {
        $('body').append('<p>' + config.firstName + '</p>');
        document.title = config.pageTitle;
        
    });
});

// *** use code similar to the jsFrameworks page in the expieriments folder ***
// the slideMenu would be a collection of image models
// image models would contain a url to the image that is inside of the JSON file
// image models would be displayed by an imageView and then the imageViews would be inside one master slideMenuView
// the slideMenuView is where the code for the movement of the slide menu would be I think?
// the imageCollection would be used by the preloader first and then the imageViewer and the slideMenu