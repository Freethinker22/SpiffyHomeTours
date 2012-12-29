$(document).ready(function()
{
    $.getJSON('tours/' + tourDirectory + '/config.json', function(config)
    {
        $('body').append('<p>' + config.firstName + '</p>');
        document.title = config.pageTitle;
        
    });
});