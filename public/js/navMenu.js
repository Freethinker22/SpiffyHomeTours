//  Navigation menu for spiffyhometours.com
$(document).ready(function()
{
    var pageId = $('body').attr('id'); // The page id is set inside every page controller for use in 'You are here navigation'
    var path = 'public/img/navImgs/'; // Path to the directory with the btn imgs
    
    $('#navigation img').mouseover(function()
    {
        $(this).attr('src', path + $(this).attr('id') + 'Over.png');
    });
    
    $('#navigation img').mouseout(function()
    {
        if(pageId != $(this).attr('id') + 'Pg')
        {
            $(this).attr('src', path + $(this).attr('id') + '.png');
        } 
    });

    // Switchs out appropriate nav btn depending on the page's id for 'you are here' navigation
    $('#navigation').find('img').each(function()
    {
        if($(this).attr('id') + 'Pg' === pageId)
        {
            $(this).attr('src', path + $(this).attr('id') + 'Over.png');
        }
    });
});