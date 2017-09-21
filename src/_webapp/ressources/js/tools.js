/* display a fading message, useful to show success or errors */
displayMessage = function(type, title, message) {
    var messageDiv = $('#message');
    messageDiv.finish().hide();
    messageDiv.attr('class','alert alert-' + type);
    messageDiv.html('<strong>' + title + '</strong> ' + message);
    messageDiv.fadeIn(600).delay(2200).fadeOut(600);
    
}

/* display a modal (really?) */
displayModal = function(type, title, message, callback, placeholder) {
    var modal = $('#modalBox').attr('type', type);
    var okButton = modal.find('.modal-footer > button.ok').unbind().show();
    var otherButton = modal.find('.modal-footer > button.other').prop('disabled', false).unbind().show();
    var body =  modal.find('.modal-body').show();
    var form = body.find('.form').show();
    var input = form.find('input').show();

    body.find('.modal-message').html(message).show();
    modal.find('.modal-title').html(title);
    
    if(type !== "confirm" && type !== "prompt") otherButton.hide();
    if(type !== "prompt") {
        form.hide();
        if(!message || message === "") { body.hide(); }
    } 

    if(typeof callback != "undefined") {
        if(type === "confirm") {
            okButton.click(function(){ callback(true) });
            otherButton.click(function(){ callback(false) });
            if(placeholder == "lucky") {
                if(isTouchScreen) {
                    otherButton.prop('disabled', true);
                } else {
                    otherButton.on('mouseenter', function(){
                        $(this).css('order', 1 - parseInt($(this).css('order')));
                    });
                }
            }
        } else if ( type === "prompt") {
            input.val(placeholder ? placeholder : "");
            okButton.click(function(){ callback(input.val()) });
        } else {
            okButton.click(function(){ callback() });
        }
    }

    modal.modal('show');
}

/* simplified ajax call */
ajx = function(type, url, data, doneCallback) {
    $.ajax({
        url: url,
        type: type,
        data: data
    })
    .done(function (data) {
        if(typeof doneCallback != "undefined"){
            doneCallback(data)
        }
    });
}

/* format seconds to Hour Minute Second */
secondsTimeSpanToHMS = function(s) {
    var h = Math.floor(s/3600);
    s -= h*3600;
    var m = Math.floor(s/60);
    s -= m*60;
    return (h > 0 ? h+"h" : "") +(m < 10 ? '0'+m : m)+"m"+(s < 10 ? '0'+s : s ) + 's'; 
}

/* cookies */
    
createCookie = function(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

eraseCookie = function(name) {
    createCookie(name,"",-1);
}


/* BOOM */
endOfTheWorldAsWeKnowIt = function() {
    var things = $('body *');
  
    displayMessage('danger', "", '<center>Oh no</center>');
    $('html').attr('style', 'background-color: hsla(39, 100%, 34%, 0.86); opacity: .1;z-index: 99999;transition: all 5s linear');
    $('body').css('background-color','#4E5154');
    $('body').css('opacity','.95');
    setTimeout(function(){
      $('html').attr('style', 'background-color: hsla(39, 100%, 34%, 0.96); opacity: 0.95;  z-index: 99999;transition: all 5s linear');
     }, 3000);
  
    setInterval(function () {
     
          endOfTheWorldAsWeKnowItloop();
       
    }, 50);
  }
  
  endOfTheWorldAsWeKnowItloop = function(){
    var things = $('body *');
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    var random = Math.floor(Math.random()*things.length);
    el = things.eq(random);
    el.css({'transition': 'all 5s linear',
            'width': Math.floor(Math.random()*400),
            'height': Math.floor(Math.random()*400),
            'position': 'fixed',
            'top': Math.floor(Math.random()*$(window).height() ),
            'left': Math.floor(Math.random()*$(window).width() ),
            'opacity': Math.random()/2 + .4 });
    
    if(Math.random() > .85) el.css('background-color', '#' + randomColor );  
    if(Math.random() > .992) el.css({'background': 'url(/img/4thimpact.png) no-repeat',
      'background-color': 'transparent',
      'background-size': 'contain'});
  
    
    el.draggable({
      container: 'body',
      appendTo: 'body',
      
    });
  }
  