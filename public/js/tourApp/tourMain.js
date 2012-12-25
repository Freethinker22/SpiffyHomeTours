$(document).ready(function()
{
    $.getJSON('tours/' + tourDirectory + '/config.json', function(json)
    {
        $('body').append('<p>' + json.firstName + '</p>');
        document.title = json.pageTitle;
        
    });
});