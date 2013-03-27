jQuery(function($){
    window.Latest= Spine.Controller.create({
        elements:{
            ".fieldcontain.search":"searchEl",
            ".items":"itemsEl",
            ".items li":'item',
            ".progress":"progress",
            ".load":"load"
        },
        events:{
            'click .items li a':'click'
        },
        proxied:["render","addOne","show","addAll","prefetchComplete","onError"],
        init: function(){
            IssueItem.bind('create',this.addOne)
            this.items=[];
            this.empty=false;
            this.itemCollectionUrl="http://localhost:3000/issues/all_latest.json"
        },
        template: function(items){
        },
        addOne:function(item){
            if(!this.checkItem(item))return;
            //console.log('item',item)
            try{
                var itemEl=IssueItemController.init({
                    item:item,
                    ul:this.itemsEl
                });
                this.itemsEl.append(itemEl.render().el).listview('refresh');
            }catch(e){}
        },

        show:function(){
            if(!this.prefetching){
                this.render();
            }
        },

        render:function(){
            //console.log("render")
            this.itemsEl.empty();
            if(this.empty==true){
                this.showEmptyMessage()
                return;
            }
            this.items=IssueItem.findAllByAttribute("collection_url",this.itemCollectionUrl)
            if(this.items.length>0){
                this.addAll()
            }else{
                this.showProgress({message:"loading..."})
                this.prefetch();
            }
        },
        hideProgress:function(){
            if(this.progress)this.progress.remove();
        },
        showProgress:function(obj){
            this.hideProgress();
            this.progress=$("#progress-tmpl").tmpl(obj);
            this.progress.appendTo(this.el);
        },
        showLoadProgress:function(obj){
            this.hideLoadProgress();
            this.loadProgress=$("#load-progress-tmpl").tmpl(obj);
            this.loadProgress.appendTo(this.el);
        },
        hideLoadProgress:function(){
            if(this.loadProgress)this.loadProgress.remove();
        },
        loadMore:function(){
            if(!this.prefetching){
                this.showLoadProgress();
                this.prefetch();
            }
        },
        addAll:function(){
            $.each(this.items,this.proxy(function(i){
                this.addOne(this.items[i])
            }) )
        },
        prefetch:function(){
            if(this.prefetching)return
            this.prefetching=true;
            IssueItem.get(
                this.itemCollectionUrl,
                this.prefetchComplete,
                this.onError,
                this.params
            )
        },

        prefetchComplete:function(data){
            console.log(data);
            this.hideProgress();
            this.hideLoadProgress();
            this.prefetching=false;
            this.params=data.params
            this.remaining=data.remaining//the page set by the server or may me we should maintain state?this.page+=1
            this.empty=data.empty;
            if(this.empty) {
                this.showEmptyMessage();
                return;
            }
            this.createItems(data.issues)
        },
        click:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            this.itemsEl.find('li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            this.current.addClass("active");
            this.currentAnchor.focus()
            console.log('click',this.currentAnchor)
            this.App.trigger("show:Issue",this.currentAnchor.attr("data-url"))

        },
        checkItem:function(item){
            return this.itemCollectionUrl === item.collection_url;
        },
        createItems:function(items){
            $.each(items,this.proxy(function(i){
              item=IssueItem.create(items[i])
            }) )

        },
        onError:function(error){
            console.log('error',error)
            this.hideProgress();
            this.hideLoadProgress();
            this.prefetching=false;
        },
        shouldScroll: function(vp){
        var scroll=false;
        if(this.el[0].scrollHeight>0){
            //console.log("el.scrollHeight",this.el[0].scrollHeight)
            //console.log("view.height",vp)
            //console.log("el.scrollTop",$(document).scrollTop())
           scroll=((this.el[0].scrollHeight -vp-$(document).scrollTop())<=0);
        }
        return scroll;
    },
    scroll: function(vp){
        var shouldScroll = this.shouldScroll(vp);
        console.log("shouldScroll",shouldScroll);
         if(shouldScroll){
             this.loadMore();
         }
    }
    })
})
jQuery(function($){
    window.IssueItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#Issue-item-tmpl").tmpl(data)
        },
        init: function(){
            this.item.bind("update", this.update);
            this.item.bind("destroy", this.remove);
        },
        update:function(){
            this.render();
            try{
                this.ul.listview('refresh');
            }catch(e){}
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
        }
    })
})

jQuery(function($){
    window.Issues= Spine.Controller.create({
        elements:{
            ".fieldcontain.search":"searchEl",
            ".items":"itemsEl",
            ".items li.item":'item',
            ".progress":"progress",
            ".load":"load",
            '.tab' :'tabs',
            ".latestOp":'latestOp',
            '.featuredOp':'featuredOp',
            "#latest_issues" :"latestEl",
            "#featured_issues":'featuredEl',
            '.tab_panel':'tabPanels',
            '[data-role="header"]':'header',
            '[data-role="footer"]':'footer'
        },

        events:{
            'click [href="#latest_issues"]':"showLatest",
            'click [href="#featured_issues"]':"showFeatured"
        },

        proxied:["render","show",'onOrientationChange','beforePageHide','beforePageShow',"change","showFeatured","scrollStop","showLatest"],

        init: function(){
            this.items=[];
            this.empty=false;
            this.el.live('pagebeforeshow',this.beforePageShow);
            this.el.live('pagebeforehide',this.beforePageHide);
            this.el.bind('orientationchange',this.onOrientationChange);
            this.el.live('pageshow',this.show);
            this.App.bind("show:tab:latest_issues",this.showLatest);
            this.App.bind("show:tab:showFeatured",this.showLatest);
            this.latest=Latest.init({
                el: this.latestEl
            })
            this.currentController=this.latest
        },
        onOrientationChange:function(){
            //alert('orientationChange')
            this.el.css("width",window.innerWidth+"px")
            this.render()
        } ,
        showLatest:function(){
            //console.log('showingLatest')
            this.latest.show();
            this.currentController=this.latest
        },
        showFeatured:function(){
        },
        template: function(items){
        },
        beforePageShow:function(){
            this.tab=TabController.init({el:this.el,options:
            {
                activeTabClass:'tab_active',
                activePanelClass:'tab_panel_active'
            }})
            // console.log("issue_pageshow")
            this.App.trigger('activate',this);
        },
        beforePageHide:function(){
            //console.log("issue_page_hide")
            this.tab.destroy();
            this.App.trigger('deactivate',this);
        },
        show:function(){
            this.viewPort=this.getViewPortHeight()
        },
        showProgress:function(obj){
            this.hideProgress();
            this.progress=$("#progress-tmpl").tmpl(obj);
            this.progress.appendTo(this.content);
        },
        hideProgress:function(){
            this.progress.remove();
        },
        checkScroll:function(){
            //alert("scroll")
            this.currentController.scroll(this.viewPort);
        },
        getViewPortHeight:function(){
            var headerHeight=this.header.outerHeight(true) ;
            var footerHeight=this.footer.outerHeight(true) ;
            return window.innerHeight - (footerHeight+headerHeight);
       }
    })
})

