(function($){
  $.fn.browseElement = function(){
    var input = $("<input type='file' multiple>");
    
    input.css({
      "position":     "absolute",
			"z-index":      1040,
			"cursor":       "pointer",
      "-moz-opacity": "0",
      "filter":       "alpha(opacity: 0)",
      "opacity":      "0"
    });
    
    input.mouseout(function(){
      input.detach();
    });
    
    var element = $(this);
    
    element.mouseover(function(){
      input.offset(element.offset());
      input.width(element.outerWidth());
      input.height(element.outerHeight());
      $("body").append(input);
    });
    
    return input;
  };
})(jQuery);

(function($){
    $.fn.browseImages= function(){
        var input = $("<input type='file' multiple accept='image/*'>");
        input.css({
            "position":     "absolute",
            "z-index":      1060,
            "cursor":       "pointer",
            "-moz-opacity": "0",
            "filter":       "alpha(opacity: 0)",
            "opacity":      "0"
        });

        input.mouseout(function(){
            input.detach();
        });

        var element = $(this);


        input.mouseover(function(){ element.addClass('active')})
            .mouseout(function(){element.removeClass('active')})
        element.mouseover(function(){
            input.offset(element.offset());
            input.width(element.outerWidth());
            input.height(element.outerHeight());
            $("body").append(input);
        });


        return input;
    };
})(jQuery);