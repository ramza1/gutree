jQuery(function($){
    window.TabController=Spine.Controller.create({
        elements:{
            '[data-tab]':"tabBody"
        },
        proxied:['keydown','selectTabFromHash','popState'],
        tabIDprefix:"tab-",
        init:function(){
            this.tabsNav = this.el.find(' ul:first');
            this.tabsNav.find('li').each(this.proxy(function(i,item){
                $(item)
                .attr('role','tab')
                .attr('id',this.tabIDprefix +$(item).find('a').attr('href').split('#')[1] );
            }));
            this.tabsNav.find('a').attr('tabindex','-1');
            this.tabsNav.find('a').click(this.proxy(this.click));
            this.tabBody.find('>div').each(this.proxy(function(i,item){
                $(item)
                .addClass('tabsPanel')
                .attr('role','tabpanel')
                .attr('aria-hidden', true)
                .attr('aria-labelledby',this.tabIDprefix + $(item).attr('id'));
            }));
            
            this.tabsNav.find('a').keydown(this.keydown)
            this.tabsNav.find('a:first').click();
        },
        selectTab:function(tab,fromHashChange){
            /**if(!fromHashChange){
                $.historyLoad(tab.attr('href').replace('#','') );
            }else{**/
            this.el.find('li a.'+this.options.activeTabClass).removeClass(this.options.activeTabClass).attr('tabindex','-1');
            tab.attr('tabindex','0').addClass(this.options.activeTabClass);
            this.tabBody.find('div.'+this.options.activePanelClass).attr('aria-hidden',true).removeClass(this.options.activePanelClass);
            $( tab.attr('href') ).addClass(this.options.activePanelClass).attr('aria-hidden',false);
            tab[0].focus();
            //this.saveState(tab);
            this.App.trigger("show:tab:"+tab.attr('href').replace('#',''),tab.attr("data-url"))
            
        },
        destroy: function( callback ) {
            this.tabsNav.find('a').unbind('click');
        },
        click:function(event){
            this.selectTab($(event.currentTarget));
            return false;
        },
        keydown:function(event){
            var currentTab = $(event.target).parent();
            switch(event.keyCode){
                case 37: // left arrow
                case 38: // up arrow
                    if(currentTab.prev().size() > 0){
                        this.selectTab( currentTab.prev().find('a'));
                    }
                    break;
                case 39: // right arrow
                case 40: // down arrow
                    if(currentTab.next().size() > 0){
                        this.selectTab( currentTab.next().find('a') );
                    }
                    break;
                case 36: // home key
                    this.selectTab( this.tabsNav.find('li:first a') );
                    break;
                case 35: // end key
                    this.selectTab( this.tabsNav.find('li:last a') );
                    break;
            }
        },
        saveState:function(tab){
            if (!history.pushState) return;
            history.pushState(tab.attr('href'),"","");
        },
        // This is the onpopstate event handler that restores historical states.
        popState:function(event) {
            if(event.state)
                this.selectTabFromHash(event.state)
                
        },
        selectTabFromHash:function(hash){
            var currHash = hash || window.location.hash;
            var hashedTab = this.tabsNav.find('a[href=#'+ currHash.replace('#','') +']');
            if( hashedTab.size() > 0){
                this.selectTab(hashedTab,true);
            }
            else {
                this.selectTab( this.tabsNav.find('a:first'),true);
            }
            //return true/false
            return !!hashedTab.size();
        }

    })

})
