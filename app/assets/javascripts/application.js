// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require twitter/bootstrap
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require utils
//= require twitter/bootstrap
//= require jQuery.fileinput
//= require jQuery.selectmenu
//= require jQuery.listbuilder
//= require jQuery.tree
//= require jquery.tokeninput
//= require jquery.wookmark.min
//= require jquery.elastic.source
//= require chosen-jquery
//= require_self
<!-- Once the page is loaded, initalize the plug-in. -->
$(document).ready(
    new function() {

$(".post_input textarea").elastic()
        $(".popover_trigger").popover({trigger:"hover"}) ;
        $("#privacy .ui-btn").popover({trigger:"hover"}) ;
        /**
        $(".chzn-select").chosen();// $('select').selectmenu();
        $('.xfile').customFileInput();
        /**
        $("#branch_tag_list").tokenInput("/tags", {
            jsonContainer:"tags",
            hintText:'Type a name',
            tokenValue:'name'
        });  **/
        $(".chzn-select").chosen();

    });