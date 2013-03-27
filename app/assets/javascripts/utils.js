//= require jquery.mousewheel
//= require mwheelIntent
//= require jquery.jscrollpane.min

(function($){
                    if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function (callback) {
return window.setTimeout(callback, 1000/60);
});
}
    $.fn.item = function(){
        var item = $(this).tmplItem().data;
        return($.isFunction(item.reload) ? item.reload() : null);
    };

    $.fn.forItem = function(item){
        return this.filter(function(){
            var compare = $(this).tmplItem().data;
            if (item.eql && item.eql(compare) || item === compare)
                return true;
        });
    };

    $.fn.autolink = function () {
        return this.each( function(){
            var re = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
            $(this).html( $(this).html().replace(re, '<a href="$1">$1</a> ') );
        });
    };

    $.fn.mailto = function () {
        return this.each( function() {
            var re = /(([a-z0-9*._+]){1,}\@(([a-z0-9]+[-]?){1,}[a-z0-9]+\.){1,}([a-z]{2,4}|museum)(?![\w\s?&.\/;#~%"=-]*>))/g
            $(this).html( $(this).html().replace( re, '<a href="mailto:$1">$1</a>' ) );
        });
    };

    	// ======================= imagesLoaded Plugin ===============================
	// https://github.com/desandro/imagesloaded

	// $('#my-container').imagesLoaded(myFunction)
	// execute a callback when all images have loaded.
	// needed because .load() doesn't work on cached images

	// callback function gets image collection as argument
	//  this is the container

	// original: mit license. paul irish. 2010.
	// contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

	$.fn.imagesLoaded 		= function( callback ) {
	var $images = this.find('img'),
		len 	= $images.length,
		_this 	= this,
		blank 	= 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

	function triggerCallback() {
		callback.call( _this, $images );
	}

	function imgLoaded() {
		if ( --len <= 0 && this.src !== blank ){
			setTimeout( triggerCallback );
			$images.unbind( 'load error', imgLoaded );
		}
	}

	if ( !len ) {
		triggerCallback();
	}

	$images.bind( 'load error',  imgLoaded ).each( function() {
		// cached images don't fire load sometimes, so we reset src.
		if (this.complete || this.complete === undefined){
			var src = this.src;
			// webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
			// data uri bypasses webkit log warning (thx doug jones)
			this.src = blank;
			this.src = src;
		}
	});

	return this;
	};

    $.fn.addScrollExtension=function(){
        var $el	= this.jScrollPane({
            verticalGutter 	: -9
        })
        var extensionPlugin 	= {

            extPluginOpts	: {
                // speed for the fadeOut animation
                mouseLeaveFadeSpeed	: 500,
                // scrollbar fades out after hovertimeout_t milliseconds
                hovertimeout_t		: 1000,
                // if set to false, the scrollbar will be shown on mouseenter and hidden on mouseleave
                // if set to true, the same will happen, but the scrollbar will be also hidden on mouseenter after "hovertimeout_t" ms
                // also, it will be shown when we start to scroll and hidden when stopping
                useTimeout			: false,
                // the extension only applies for devices with width > deviceWidth
                deviceWidth			: 980
            },
            hovertimeout	: null, // timeout to hide the scrollbar
            isScrollbarHover: false,// true if the mouse is over the scrollbar
            elementtimeout	: null,	// avoids showing the scrollbar when moving from inside the element to outside, passing over the scrollbar
            isScrolling		: false,// true if scrolling
            addHoverFunc	: function() {

                // run only if the window has a width bigger than deviceWidth
                if( $(window).width() <= this.extPluginOpts.deviceWidth ) return false;

                var instance		= this;

                // functions to show1 / hide the scrollbar
                $.fn.jspmouseenter 	= $.fn.show;
                $.fn.jspmouseleave 	= $.fn.fadeOut;

                // hide the jScrollPane vertical bar
                var $vBar			= this.getContentPane().siblings('.jspVerticalBar').hide();

                /*
							 * mouseenter / mouseleave events on the main element
							 * also scrollstart / scrollstop - @James Padolsey : http://james.padolsey.com/javascript/special-scroll-events-for-jquery/
							 */
                $el.bind('mouseenter.jsp',function() {

                    // show1 the scrollbar
                    $vBar.stop( true, true ).jspmouseenter();

                    if( !instance.extPluginOpts.useTimeout ) return false;

                    // hide the scrollbar after hovertimeout_t ms
                    clearTimeout( instance.hovertimeout );
                    instance.hovertimeout 	= setTimeout(function() {
                        // if scrolling at the moment don't hide it
                        if( !instance.isScrolling )
                            $vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
                    }, instance.extPluginOpts.hovertimeout_t );


                }).bind('mouseleave.jsp',function() {

                    // hide the scrollbar
                    if( !instance.extPluginOpts.useTimeout )
                        $vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
                    else {
                        clearTimeout( instance.elementtimeout );
                        if( !instance.isScrolling )
                            $vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
                    }

                });

                if( this.extPluginOpts.useTimeout ) {

                    $el.bind('scrollstart.jsp', function() {

                        // when scrolling show1 the scrollbar
                        clearTimeout( instance.hovertimeout );
                        instance.isScrolling	= true;
                        $vBar.stop( true, true ).jspmouseenter();

                    }).bind('scrollstop.jsp', function() {

                        // when stop scrolling hide the scrollbar (if not hovering it at the moment)
                        clearTimeout( instance.hovertimeout );
                        instance.isScrolling	= false;
                        instance.hovertimeout 	= setTimeout(function() {
                            if( !instance.isScrollbarHover )
                                $vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
                        }, instance.extPluginOpts.hovertimeout_t );

                    });

                    // wrap the scrollbar
                    // we need this to be able to add the mouseenter / mouseleave events to the scrollbar
                    var $vBarWrapper	= $('<div/>').css({
                        position	: 'absolute',
                        left		: $vBar.css('left'),
                        top			: $vBar.css('top'),
                        right		: $vBar.css('right'),
                        bottom		: $vBar.css('bottom'),
                        width		: $vBar.width(),
                        height		: $vBar.height()
                    }).bind('mouseenter.jsp',function() {

                        clearTimeout( instance.hovertimeout );
                        clearTimeout( instance.elementtimeout );

                        instance.isScrollbarHover	= true;

                        // show1 the scrollbar after 100 ms.
                        // avoids showing the scrollbar when moving from inside the element to outside, passing over the scrollbar
                        instance.elementtimeout	= setTimeout(function() {
                            $vBar.stop( true, true ).jspmouseenter();
                        }, 100 );

                    }).bind('mouseleave.jsp',function() {

                        // hide the scrollbar after hovertimeout_t
                        clearTimeout( instance.hovertimeout );
                        instance.isScrollbarHover	= false;
                        instance.hovertimeout = setTimeout(function() {
                            // if scrolling at the moment don't hide it
                            if( !instance.isScrolling )
                                $vBar.stop( true, true ).jspmouseleave( instance.extPluginOpts.mouseLeaveFadeSpeed || 0 );
                        }, instance.extPluginOpts.hovertimeout_t );

                    });

                // $vBar.wrap( $vBarWrapper );

                }

            }

        }
        var jspapi = $el.data().jsp;
        $el.find('.jspVerticalBar').css({
            'opacity':'0.8'
        })
        // extend the jScollPane by merging
        $.extend( true, jspapi, extensionPlugin );
        jspapi.addHoverFunc();
        return jspapi;
    }

})(jQuery);