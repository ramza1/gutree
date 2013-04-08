jQuery(function($){
    window.TipList= Spine.Controller.create({
        elements:{
            ".items":"itemsEl",
            ".items .item":'handler',
            ".grid-item":"gridHandler",
            ".progress":"progress",
            ".load":"load"
        },
        events:{
        },
        proxied:["render","addOne","show","addAll","prefetchComplete","onError","refresh","scroll","initGrid","update"],
        init: function(){
            this.items=[];
            this.params=this.params||{}
            console.log("params",this.params)
            this.handler.each(this.proxy(function(i){
                TipItemController.init({el:this.handler[i]})
            }))
            $(document).on("scroll",this.scroll)
            $("#tips").on("tips:refresh",this.refresh)
            $("#tips").on("tips:addOne",this.addOne)
            /**
            this.gridOptions = {
                autoResize: true, // This will auto-update the layout when the browser window is resized.
                container: $('#tipView'), // Optional, used for some extra CSS styling
                offset:0, // Optional, the distance between grid items
                itemWidth:this.el.width()/2, // Optional, the width of a grid item
                animate:true
            };
            this.gridHandler.imagesLoaded(this.initGrid);
            $('#tips').on("tips:create",this.proxy(function(ev,item){
                console.log('create',ev)
            this.addOne(item)}))
            this.App.bind("tips:update",this.update)
             **/
        },
        initGrid:function(){
            this.gridHandler = this.el.find(".grid-item");
            this.gridHandler.wookmark(this.gridOptions);

        },
        clearGrid:function(){
            this.gridHandler.wookmarkClear();
        },
        update:function(){
            this.clearGrid();
            this.initGrid();
            console.log('refresh')
        },
        addOne:function(item){
            console.log('item',item.data('collection_url'))
            try{
                url=item.data('collection_url')
                if(!this.checkUrl(url))return;
                console.log('item',item)
                var itemEl= TipItemController.init({el:item})
                this.itemsEl.append(item);
                this.refresh();
            } catch(e) {
                console.log(e)
            }
        },

        refresh:function(){
           this.handler= this.itemsEl.find(".item")
            console.log('refresh')
        },
        hideProgress:function(){
            if(this.progress)this.progress.remove();
        },
        showProgress:function(obj){
            this.hideProgress();
            this.progress=$("#progress-tmpl").tmpl(obj);
            this.progress.appendTo(this.el);
        },
        loadMore:function(){
            if(!this.prefetching){
                //this.showLoadProgress();
                this.prefetch();
            }
        },
        addAll:function(items){
            $.each(items,this.proxy(function(i){
                this.addOne($(items[i]))
            }) )
        },
        prefetch:function(){
            if(this.prefetching)return
            this.prefetching=true;
            $.ajax({
                type: "GET",
                url:this.itemCollectionUrl,
                contentType:"application/json",
                data:this.params,
                success: this.prefetchComplete,
                error:this.onError
            });
        },
        prefetchComplete:function(data){
            data=eval(data);
           // this.hideProgress();
           // this.hideLoadProgress();
            console.log(data)
            this.prefetching=false;
            this.params=data.params
            this.remaining=data.remaining//the page set by the server or may me we should maintain state?this.page+=1
            this.empty=data.empty;
            if(this.empty) {
                this.showEmptyMessage();
                return;
            }
            //this.itemsEl.append()
            this.addAll($(data.tips))
        },
        checkUrl:function(url){
            return this.itemCollectionUrl === url;
        },
        onError:function(error){
            console.log('error',error)
            this.hideProgress();
            this.hideLoadProgress();
            this.prefetching=false;
        },
        shouldScroll: function(){
            return ($(window).scrollTop() + $(window).height() > $(document).height() - 100);
        },
        scroll: function(vp){
            var shouldScroll = this.shouldScroll();
            console.log("shouldScroll",shouldScroll);
            if(shouldScroll){
                this.loadMore();
            }
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            this.itemsEl.find('li.item .actions li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            this.current.addClass("active");
            action=this.currentAnchor.data("action");
            console.log("action",action)
            this.App.trigger(action,this.currentAnchor.attr("data-url"),this.current)
            this.currentAnchor.closest(".actions").removeClass("open")
            return false;
        }
    })
})

jQuery(function($){
    window.TipItemController = Spine.Controller.create({
        elements:{
            '.ops-trigger':"opsTrigger"
        },
        events:{
            'click .ops-trigger':"onOpsTrigger",
            'click .op':"doAction"
        },
        proxied:["remove","render","update"],
        template:function(data){
            return $("#tip-item-tmpl").tmpl(data)
        },
        init: function(){
            //this.el.bind("update", this.update);
            //this.el.bind("destroy", this.remove);
        },
        update:function(){
            this.render();
        },
        render: function(item){
            if (item) this.item = item;
            var elements = this.template(this.item);
            this.el.replaceWith(elements);
            this.el = elements;
            return this;
        },
        remove: function(){
            this.el.remove();
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            this.current= $(ev.currentTarget).closest('li');
            //this.current.addClass("active");
            action=this.currentAnchor.data("action");
            console.log("action",action)
            //this.App.trigger(action,this.currentAnchor.attr("data-url"),this.current)
            //this.currentAnchor.closest(".actions").removeClass("open")
        },
        onOpsTrigger:function(){
            console.log("onOpsTrigger")
           if(this.opsTrigger.hasClass('loading')) return false;
            parent= this.opsTrigger.parent()
            if(parent.hasClass('open')) {
                parent.removeClass('open')
            } else{
                parent.addClass('open')
            }
           //this.opsTrigger.addClass('disabled')
            return false;
        }
    })
})

jQuery(function($){
    window.Tips= Spine.Controller.create({
        elements:{
            "#tips":"tipsEl"
        },

        events:{

        },

        proxied:[],

        init: function(){
            this.tipsUrl=this.tipsEl.data("collection_url")
            this.params={
                page:this.tipsEl.data("page"),
                per_page:this.tipsEl.data("per_page")
            }
            console.log("collection_url",this.tipsUrl)
            this.tips=TipList.init({el:this.tipsEl,itemCollectionUrl:this.tipsUrl,params:this.params,
                empty:this.tipsEl.data("empty"),
                remaining:this.tipsEl.data("remaining")})
            this.currentController=this.tips
        }
    })
})
