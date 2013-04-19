//= require utils
//= require jquery.upload
//= require jquery.tmpl.min
//= require spine/spine
//= require model/branch_item
//= require controller/browser
//= require controller/new_branch
//= require_self
jQuery(function($){
    window.BranchList= Spine.Controller.create({
        elements:{
            ".items":"itemsEl",
            ".items .item":'handler',
            ".progress":"progress",
            ".load":"load"
        },
        events:{
            'click .items .item a':'click',
            "click .dropdown-toggle":"dropdown"
        },
        proxied:["render","addOne","show","addAll","prefetchComplete","onError","initGrid","update"],
        init: function(){
            this.items=[];
            this.empty=false;
            this.gridOptions = {
                autoResize: true, // This will auto-update the layout when the browser window is resized.
                container: $('#main'), // Optional, used for some extra CSS styling
                offset:20, // Optional, the distance between grid items
                itemWidth: 236 // Optional, the width of a grid item
            };
            this.handler.imagesLoaded(this.initGrid);
            this.handler.each(this.proxy(function(i){
                BranchItemController.init({el:this.handler[i]})
            }))
            $('#branches').bind("branches:create",this.proxy(function(ev,item){
                console.log('create',ev)
                this.addOne(item)}))
            this.App.bind("branches:update",this.update)
        },
        initGrid:function(){
            this.handler = this.itemsEl.find(".item");
            this.handler.wookmark(this.gridOptions);
        },
        clearGrid:function(){
            this.handler.wookmarkClear();
        },
        template: function(items){
        },
        update:function(){
            this.clearGrid();
            this.initGrid();
            console.log('refresh')
        },
        create:function(ev,data){
            this.addOne(data)
        },
        addOne:function(item){
            if(!this.checkItem(item))return;
            console.log('item',item)
            try{
                var itemEl=BranchItemController.init({el:item.el})
                this.itemsEl.prepend(item.el);
                this.clearGrid();
                this.initGrid();
            }catch(e){
                console.log(e)
            }
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
            this.items=BranchItem.findAllByAttribute("collection_url",this.itemCollectionUrl)
            if(this.items.length>0){
                this.addAll()
            }else{
                this.showProgress({message:"loading..."})
                this.prefetch();
            }
        },
        update:function(){
            console.log('update')
            this.clearGrid();
            this.initGrid();
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
        dropdown:function(ev){
            this.dropDown=$(ev.currentTarget);
        } ,
        click:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            this.itemsEl.find('li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            this.current.addClass("active");
            this.currentAnchor.focus()
            console.log('click',this.currentAnchor)
            //this.App.trigger("show:Issue",this.currentAnchor.attr("data-url"))
            //return false

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
    window.BranchItemController = Spine.Controller.create({
        elements:{
            '.dropdown-menu':'dropdownMenu'
        },
        events:{
            'click .ops li':'doAction'
        },
        proxied:["remove","render","update"],
        template:function(data){
            return $("#branch-item-tmpl").tmpl(data)
        },
        init: function(){
           $('#branches').bind("branches:update",this.update)
        },
        update:function(ev,data){
           if($(data.el).attr("id")==this.el.attr("id")){
               this.render($(data.el));
               this.App.trigger("branches:update")
            }

        },
        render: function(el){
            this.el.replaceWith(el);
            return this;
        },
        remove: function(){
            this.el.remove();
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            this.dropdownMenu.find('li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            this.current.addClass("active");
            action=this.current.data("action");
            console.log("action",action)
            this.App.trigger(action,this.current.attr("data-url"),this.current)
            this.currentAnchor.closest(".actions").removeClass("open")
            return false;
        }
    })
})

jQuery(function($){
    window.Trees= Spine.Controller.create({
        elements:{
           "#branches":"branchesEl",
            "#all":"allBranches"
        },

        events:{

        },

        proxied:[],

        init: function(){
            this.items=[];
            this.empty=false;
            this.App.bind("show:tab:latest_issues",this.showLatest);
            this.allBranchesUrl=this.allBranches.data("collection_url")
            console.log("collection_url=>",this.allBranchesUrl)
            this.all=BranchList.init({el: this.allBranches,itemCollectionUrl:this.allBranchesUrl})
            this.editBranch=EditBranch.init({el:$("#editView")})
        },
        showLatest:function(){
            //console.log('showingLatest')
            this.latest.show();
            this.currentController=this.latest
        },
        template: function(items){
        },
        show:function(){
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
        }
    })
})

jQuery(function($){
    Spine.Controller.prototype.App.activate=function(controller){
        this.current=controller;
        console.log("activate",this.current)
    },
     Spine.Controller.prototype.App.deactivate=function(controller){
            this.previous=controller;
        }
    window.Application = Spine.Controller.create({
        elements:{
            "#newBranchTrigger":"newBranchAnchor"
        },
        events:{
            "click #newBranchTrigger":"showNewBranch"
        },
        proxied: ['activate','deactivate','scroll',"onConnect","onFailure","onAttach"],
        template:function(data){
        },
        init: function(){
            this.App.bind('activate',this.activate);
            this.App.bind('deactivate',this.deactivate);
            this.newBranch=NewBranch.init({el:$('#newBranchDialog')});
            //this.editTipBranch=EditBranch.init({el:$('#edit_view')});
            this.trees=Trees.init({el:$("#app")})
            this.current=this.newBranch
            this.current.show();
        },
        showNewBranch:function(){
            this.newBranch.activate();
            this.current=this.newBranch
        }
    });
    Application.init({
        el:$("body")
    })
})