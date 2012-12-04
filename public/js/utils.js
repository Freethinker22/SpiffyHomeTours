// Use this to add event listeners to objects
function addEvent(object, eventType, func, useCapture)
{
    if(object.addEventListener)
    {
        object.addEventListener(eventType, func, useCapture);
        return true;
    }
    else if(object.attachEvent)
    {
        var ie = object.attachEvent('on' + eventType, func);
        return ie;
    }
}

// Use this to remove event listeners from objects
function removeEvent(object, eventType, func, useCapture)
{
    if(object.removeEventListener)
    {
        object.removeEventListener(eventType, func, useCapture);
        return true;
    }
    else if(object.detachEvent)
    {
        var r = object.detachEvent('on' + eventType, func);
        return r;
    }
}

// Use this to create Ajax request objects
function createRequest()
{
    try
    {
        request = new XMLHttpRequest();
    }
    catch(tryMS)
    {
        try
        {
            request = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch(otherMS)
        {
            try
            {
                request = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch(failed)
            {
                request = null;
            }
        }
    }
    return request;
}

// Used to check if an element is in the document
function elementInDoc(element)
{
    var html = document.body.parentNode;
	
    while(element)
    {
        if(element === html)
        {
            return true;
        }
        element = element.parentNode;
    }
    return false;
}