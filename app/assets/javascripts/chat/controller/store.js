jQuery(function($){
    window.Store= Spine.Controller.create({
        elements:{
            '[data-role="navbar"] li':'navbar'
        },
        events:{
           'click [data-role="navbar"] li a':'click'
        },
        proxied: [],
        template:function(data){
        },
        init: function(){
            console.log("Store_inited")
        },
        click:function(item){
           console.log(item)
            //return false;
        }

    });

})