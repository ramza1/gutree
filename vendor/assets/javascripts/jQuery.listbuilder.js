/**
 * --------------------------------------------------------------------
 * jQuery listbuilder plugin
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
 */
$.fn.listbuilder = function(settings){
//add body role
	if( !$('body').is('[role]') ){ $('body').attr('role','application'); }
	//cache reference to textarea
	var el = $(this);
    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    // Default classes to use when theming
    var DEFAULT_CLASSES = {
        highlightedToken: "token-input-highlighted-token",
        dropdown: "token-input-dropdown",
        dropdownItem: "token-input-dropdown-item",
        dropdownItem2: "token-input-dropdown-item2",
        selectedDropdownItem: "token-input-selected-dropdown-item"
    };
    // Keys "enum"
    var KEY = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        NUMPAD_ENTER: 108,
        COMMA: 188
    };
	//overrideable defaults	
	var options = $.extend({
			delimChar: /[,\n]/, //character used to split textarea content into items
			width: el.width(), //width of listBuilder container. defaults to width of textarea
			completeChars: [188,13], //keyCodes for item completion
			userDirections: 'To add an item to this list, type a name and press enter or comma.', //directions that will tooltip on the input
			labelReplacement: false,
            placeHolder:'type a name and press enter or comma.',
            searchDelay: 300,
            minChars: 1,
            method: "GET",
            contentType: "json",
            queryParam: "q",
            propertyToSearch: "name",
            jsonContainer: null,
            classes:DEFAULT_CLASSES,
            resultsFormatter: function(item){ return "<li>" + item[this.propertyToSearch]+ "</li>" },
            tokenFormatter: function(item) { return "<li><p>" + item[this.propertyToSearch] + "</p></li>" },
            hintText: "Type in a search term",
            noResultsText: "No results",
            searchingText: "Searching..."
	},settings);


	//create component container
	var listbuilder = $('<ul class="listbuilder"></ul>')
							.width(options.width);
    var input_box=listbuilder.find('input');
    var dropdown = $("<div>")
        .addClass(options.classes.dropdown)
        .appendTo("body")
        .hide();
    var selected_dropdown_item = null;
	//function to return a new listbuilder entry
	function listUnit( val ){ 
		return $('<li class="listbuilder-entry"><span class="listbuilder-entry-text">'+val+'</span><a href="#" class="listbuilder-entry-remove" title="Remove '+val+' from the list." role="button"></a></li>')
			.hover(
				function(){ $(this).addClass('listbuilder-entry-hover'); }, 
				function(){ $(this).removeClass('listbuilder-entry-hover'); }
			)
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none');
	}

	//function to populate listbuilder from textarea
	function populateList(){
		listbuilder.empty();
		$.each(el.val().split(options.delimChar), function(){
			if(this != ''){ listbuilder.append( listUnit(this) ); }
		});
		//append typeable component
		listbuilder.append('<li class="listbuilder-entry-add"><input type="text" value="" title="'+ options.userDirections +'" /></li>');
	}
		
	//run proxy on every keyup in textarea (for development)
	el.keyup(populateList);


	//set focus/blur states from input state and focus on input
	listbuilder.add('input')
	
	//insert listbuilder after textarea (and hide textarea)
	listbuilder.insertAfter( el );

	//set label to direct to new input
	var assocLabel = $('label[for='+ el.attr('id') +']');
	if(assocLabel.length && options.labelReplacement){
		var newLabel = $(options.labelReplacement);
		assocLabel.replaceWith(newLabel);
		newLabel.text(assocLabel.html());
	}

    //function to populate textarea from current listbuilder
    function updateValue(){
        taval = [];
        listbuilder.find('span.listbuilder-entry-text').each(function(){
            taval.push($(this).text());
        });
        taval.push( listbuilder.find('input').val() );
        el.val( taval.join(",") );
    };

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    }

    function find_value_and_highlight_term(template, value, term) {
        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + value + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));
    }

    // Hide and clear the results dropdown
    function hide_dropdown () {
        dropdown.hide().empty();
        selected_dropdown_item = null;
    }

    function show_dropdown() {
        dropdown
            .css({
                position: "absolute",
                top:listbuilder.offset().top + listbuilder.outerHeight(),
                left: listbuilder.offset().left,
                width:listbuilder.width(),
                zindex: 999
            })
            .show();
    }

    function show_dropdown_searching () {
        if(options.searchingText) {
            dropdown.html("<p>"+options.searchingText+"</p>");
            show_dropdown();
        }
    }

    function show_dropdown_hint () {
        if(options.hintText) {
            dropdown.html("<p>"+options.hintText+"</p>");
            show_dropdown();
        }
    }

   function add_token(val){
       input_box.parent().before( listUnit(val[options.propertyToSearch]) );
       input_box.val('');

       updateValue();
   }

    // Populate the results dropdown with some results
    function populate_dropdown (query, results) {
        if(results && results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    select_dropdown_item($(event.target).closest("li"));
                })
                .mousedown(function (event) {
                    var val=$(event.target).closest("li").data("tokeninput");
                    add_token(val)
                    return false;
                })
                .hide();

            $.each(results, function(index, value) {
                var this_li = options.resultsFormatter(value);

                this_li = find_value_and_highlight_term(this_li ,value[options.propertyToSearch], query);

                this_li = $(this_li).appendTo(dropdown_ul);

                if(index % 2) {
                    this_li.addClass(options.classes.dropdownItem);
                } else {
                    this_li.addClass(options.classes.dropdownItem2);
                }

                if(index === 0) {
                    select_dropdown_item(this_li);
                }

                $.data(this_li.get(0), "tokeninput", value);
            });

            show_dropdown();

            if(options.animateDropdown) {
                dropdown_ul.slideDown("fast");
            } else {
                dropdown_ul.show();
            }
        } else {
            if(options.noResultsText) {
                dropdown.html("<p>"+options.noResultsText+"</p>");
                show_dropdown();
            }
        }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                deselect_dropdown_item($(selected_dropdown_item));
            }

            item.addClass(options.classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item (item) {
        item.removeClass(options.classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than settings.minChars
    function do_search(q) {
        var query = q.toLowerCase();

        if(query && query.length) {

            if(query.length >= options.minChars) {
                show_dropdown_searching();
                clearTimeout(timeout);

                timeout = setTimeout(function(){
                    run_search(query);
                }, options.searchDelay);
            } else {
                hide_dropdown();
            }
        }
    }

    // Do the actual search
    function run_search(query) {
        var cache_key = query + computeURL();
        var cached_results = cache.get(cache_key);
        if(cached_results) {
            populate_dropdown(query, cached_results);
        } else {
            // Are we doing an ajax search or local data search?
            if(options.url) {
                var url = computeURL();
                // Extract exisiting get params
                var ajax_params = {};
                ajax_params.data = {};
                if(url.indexOf("?") > -1) {
                    var parts = url.split("?");
                    ajax_params.url = parts[0];

                    var param_array = parts[1].split("&");
                    $.each(param_array, function (index, value) {
                        var kv = value.split("=");
                        ajax_params.data[kv[0]] = kv[1];
                    });
                } else {
                    ajax_params.url = url;
                }

                // Prepare the request
                ajax_params.data[options.queryParam] = query;
                ajax_params.type = options.method;
                ajax_params.dataType = options.contentType;
                if(options.crossDomain) {
                    ajax_params.dataType = "jsonp";
                }

                // Attach the success callback
                ajax_params.success = function(results) {
                    if($.isFunction(options.onResult)) {
                        //results = options.onResult.call(hidden_input, results);
                    }
                    cache.add(cache_key, options.jsonContainer ? results[options.jsonContainer] : results);
                    console.log(results)
                    // only populate the dropdown if the results are associated with the active search query
                    if(input_box.val().toLowerCase() === query) {
                        populate_dropdown(query,options.jsonContainer ? results[options.jsonContainer] : results);
                    }
                };

                // Make the request
                $.ajax(ajax_params);
            } else if(options.local_data) {
                // Do the search through local data
                var results = $.grep(options.local_data, function (row) {
                    return row[options.propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                });

                if($.isFunction(options.onResult)) {
                    results = settings.onResult.call(hidden_input, results);
                }
                cache.add(cache_key, results);
                populate_dropdown(query, results);
            }
        }
    }

    // compute the dynamic URL
    function computeURL() {
        var url =options.url;
        if(typeof options.url == 'function') {
            url = options.url.call();
        }
        return url;
    }

//populate initial listbuilderfrom textarea
    populateList();

    //add key behavior to input
    input_box=listbuilder.find('input')
        .keydown(function(ev){
            var input = $(this);
            //check if key was one of the completeChars, if so, create a new item and empty the field
            $.each(options.completeChars,function(){
                if(ev.keyCode == this && input.val() != '' && input.val() != options.delimChar ){
                    var val = input.val().split(options.delimChar)[0];
                    input.parent().before( listUnit(val) );
                    input.val('');
                }
                if(ev.keyCode == this){
                    ev.preventDefault();
                }
            });
            switch(ev.keyCode) {
                case KEY.LEFT:
                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    if(!input.val()){

                    }else{
                        var dropdown_item = null;

                        if(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                            dropdown_item = $(selected_dropdown_item).next();
                        } else {
                            dropdown_item = $(selected_dropdown_item).prev();
                        }

                        if(dropdown_item.length) {
                            select_dropdown_item(dropdown_item);
                        }
                        return false;
                    }
                break;
                case KEY.BACKSPACE:
                 var prevUnit = input.parent().prev();
                    if(input.val() == ''){
                        ev.stopPropagation();
                        if(prevUnit.is('.listbuilder-entry-selected')){
                            prevUnit.remove();
                        }
                        else {
                            prevUnit.addClass('listbuilder-entry-selected');
                        }
                    } else{
                        prevUnit.removeClass('listbuilder-entry-selected');
                    }
                if(input.val().length === 1) {
                    hide_dropdown();
                } else {
                    // set a timeout just long enough to let this function finish.
                    setTimeout(function(){do_search(input.val());}, 5);
                }
                break;
                case KEY.TAB:
                case KEY.NUMPAD_ENTER:

                 if(selected_dropdown_item) {
                     add_token($(selected_dropdown_item).data("tokeninput"));
                     hide_dropdown();
                     ev.preventDefault();
                 }
                break;
                case KEY.ESCAPE:
                    hide_dropdown();
                    return true;
                default:
                   if(input.val() != '' && input.val() != options.delimChar){
                                    // set a timeout just long enough to let this function finish.
                         setTimeout(function(){do_search(input.val());}, 5);
                      }
                 break;
            }

        })
        .keyup(function(){
            updateValue();
            //approx width for input
            var testWidth = $('<span style="visibility: hidden; position: absolute; left: -9999px;">'+ $(this).val() +'</span>').css('font-size', $(this).css('font-size')).appendTo('body');
            $(this).width( testWidth.width() + 20 );
            testWidth.remove();
        })
        .focus(function(){
            $(this).addClass('listbuilder-input-focus');
            listbuilder.addClass('listbuilder-focus');
        })
        .blur(function(){
            $(this).removeClass('listbuilder-input-focus');
            listbuilder.removeClass('listbuilder-focus');
            hide_dropdown();
        });
    //apply delete key event at document level
    $(document)
        .click(function(){
            listbuilder.find('.listbuilder-entry-selected').removeClass('listbuilder-entry-selected');
            listbuilder.removeClass('listbuilder-focus');
            hide_dropdown();
        })
        .keydown(function(ev){
            if(ev.keyCode == 8){
                listbuilder.find('.listbuilder-entry-selected').remove();
                updateValue();
                hide_dropdown();
            }
        });

    dropdown.bind("click",function(){
        listbuilder.addClass('listbuilder-focus');
        hide_dropdown();
        return false;
    })

    //click events for delete buttons and focus
    listbuilder.click(function(ev){
        $(this).addClass('listbuilder-focus');

        var clickedElement = $(ev.target);
        if( clickedElement.is('a.listbuilder-entry-remove') ){
            clickedElement.parent().remove();
            return false;
        }
        else if( clickedElement.is('li.listbuilder-entry, span')){
            if(clickedElement.is('span')){
                clickedElement = clickedElement.parent();
            }
            if( !ev.shiftKey && !ev.ctrlKey && !ev.metaKey){
                listbuilder.find('.listbuilder-entry-selected').removeClass('listbuilder-entry-selected');
            }
            if( (ev.shiftKey || ev.ctrlKey || ev.metaKey) && clickedElement.is('.listbuilder-entry-selected') ){
                clickedElement.removeClass('listbuilder-entry-selected');
            }
            else{
                clickedElement.addClass('listbuilder-entry-selected');
            }
            return false;
        }
        else {
            $(this).find('.listbuilder-entry-selected').removeClass('listbuilder-entry-selected');
            listbuilder.find('input').eq(0).focus();
            return false;
        }

    });
	//keep textarea chainable
	return this;
}
// Really basic cache for the results
$.fn.Cache = function (options) {
    var settings = $.extend({
        max_size: 500
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size += 1;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};