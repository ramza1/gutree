jQuery(function($){
    window.IssueController = Spine.Controller.create({
        elements:{'[data-role="content"]':'content'} ,
        proxied:["remove","render","show","prefetchComplete","onError","onPageShow",'onOrientationChange','beforePageHide','beforePageShow'],
        template:function(data){
            return $("#issue-show-tmpl").tmpl(data)
        },
        init: function(){
            this.el.live('pageshow',this.onPageShow);
            this.el.live('pagebeforeshow',this.beforePageShow);
            this.el.live('pagebeforehide',this.beforePageHide);
            this.el.bind('orientationchange',this.onOrientationChange);
            this.App.bind("show:Issue",this.show)
            this.prefetching=false;
        },
        show:function(url){
            if(this.url==url && this.prefetching){
                return;
            }
            this.url=url;
        },
        empty:function(){
            this.content.empty();
        },
        render:function(){
            this.empty();
            this.showProgress();
            this.prefetch();
        },
        hideProgress:function(){
            if(this.progress)this.progress.remove();
        },
        showProgress:function(obj){
            this.hideProgress();
            this.progress=$("#progress-tmpl").tmpl(obj);
            this.progress.appendTo(this.el);
        },
        checkScroll:function(){},
        prefetch:function(){
            if(this.prefetching)return
            this.prefetching=true;
            console.log("url",this.url)
            Issue.get(
                this.url,
                this.prefetchComplete,
                this.onError,
                {}
            )
        },
        prefetchComplete:function(data){
            console.log(data);
            this.hideProgress();
            this.prefetching=false;
            this.content.html(this.template(Issue.init(data.issue)))
            this.content.find('[data-role="button"],button').button();
        },
        onPageShow:function(){
            //console.log('pageshow','showing')

        },
        beforePageShow:function(){
            this.App.trigger('activate',this);
            if(!this.prefetching){
                this.render();
            }
        },
        beforePageHide:function(){
            this.App.trigger('deactivate',this);
        },
        onOrientationChange:function(){
            this.el.css("width",window.innerWidth+"px")
            this.render()
        },
        onError:function(data){
            this.hideProgress();
        }
    })
})