//= require utils
//= require jquery.upload
//= require jquery.tmpl.min
//= require spine/spine
//= require model/branch_item
//= require webrtc/TB.min
//= require controller/browser
//= require controller/tips
//= require controller/chats
//= require_self
jQuery(function($){
    window.TipLink= Spine.Controller.create({
        elements:{
            '.content':"content",
            '.input':"input",
            '.save':"saveBtn",
            '.tip-alert':'alertEl',
            '.tip-link-preview':"linkPreview",
            '.update-btns':"updateBtns",
            '.tip-link-input':"linkInput",
            '.linkEl':"linkEl",
            '.change':"changeBtn",
            '.delete':"deleteBtn"
        },
        events:{
            'click .remove':'removeLink',
            'click .remove-error':"hideError",
            'click #post-upload-preview-wrap .change':"changePhoto",
            'click .save':"saveLink",
            'click .change':"changeLink",
            'click .delete':"deleteLink"
        },
        proxied: ["show","render"],
        template:function(data){
        },
        init: function(){
            this.browsePhoto=BrowsePhoto.init({el:this.uploadBtn,onChange:this.uploadPhoto})
            this.browsePhoto.activate();
            this.App.bind("show:tip:link",this.show)
        } ,
        show:function(tip){
            this.tip=tip;
            this.tip.type="LinkTip"
            console.log("tiplink",this.tip)
        },
        showError:function(message){
            this.alertEl.show().html($("#tip-upload-error-tmpl").tmpl(message))
        },
        hide:function(){
            this.progressEl.hide()
            this.previewEl.hide()
            this.uploadBtn.hide()
        },
        removeLink:function(){
            if(this.xhr && this.xhr.readystate != 4) {
                this.delete_url=null;
                this.photo_url=null;
                this.xhr.abort()
                this.reset()
                this.tipController.deActivateTabs()
                this.tip.type=""
            }
            this.tipController.deActivateTabs()
            this.tip.type=""
        },
        saveLink:function(){
            if(this.saveBtn.hasClass("disabled"))   return
            this.url=this.input.val()
            console.log("url",this.url)
            this.saveBtn.button('loading')
            $.ajax({
                type: "PUT",
                data:{"link[url]":this.url,"tip[type]":"LinkTip"
                },
                url:this.tip.update_url,
                error:this.proxy(function(data){
                    var errorString=JSON.parse(data.responseText).url.join(" , ")
                    console.log("data",errorString)
                    this.saveBtn.button('reset')
                    this.el.find('.help-inline').remove()
                    this.input.closest('.control-group').addClass("error")
                    $('<span class="help-inline"><i class="icon-warning"></i> '+errorString+'</span>').insertAfter(this.input.parent())
                    this.showError({message:"could not save link"})
                    this.input.val("")
                }),
                success:this.proxy(function(data){
                    this.link_url=data.url
                    this.delete_url=data.delete_url
                    this.saveBtn.button('reset')
                    if(this.input.closest('.control-group').hasClass("error")){
                        this.input.closest('.control-group').removeClass("error")
                        this.input.closest('.control-group').find('.help-inline').remove()
                    }
                    this.input.val("")
                    this.hideAll()
                    this.render()
                })
            })
        },
        render:function(){
           console.log("linkel",this.LinkEl)
           this.linkPreview.show()
           this.linkEl.html($('#link-tmpl').tmpl({url:this.link_url}))
        },
        hideAll:function() {
           this.linkInput.hide()
           this.linkPreview.hide()
        },
        changeLink:function(){
          this.hideAll()
          this.linkInput.show()
        },
        deleteLink:function() {
           if(this.link_url && this.delete_url){
               this.changeBtn.addClass('disabled')
               this.deleteBtn.button("loading")
                $.ajax({
                    type: "POST",
                    url: this.delete_url,
                    error:this.proxy(function(data){
                        this.changeBtn.removeClass('disabled')
                        this.deleteBtn.button("reset")
                        this.showError({message:"could not delete photo"})
                    }),
                    success:this.proxy(function(data){
                        this.delete_url=null;
                        this.photo_url=null;
                        this.changeBtn.removeClass('disabled')
                        this.deleteBtn.button("reset")
                        this.hideAll()
                        this.linkInput.show()
                    })
                })
            }
        }
    });
})

jQuery(function($){
    window.TipPhotoUpload= Spine.Controller.create({
        elements:{
            '.content':"content",
            '#tip-photo-upload-btn':"uploadBtn",
            '.tip-alert':'alertEl',
            '#post-upload-preview-wrap':'previewEl',
            '.photo-upload-progress':"progressEl",
            ".status" :"progressStatus",
            " .bar" :"progressBar",
            '#post-upload-preview-wrap .change':"changeBtn",
            '.delete':'delete',
            '.delete_tip':'deleteTipBtn',
            '.update-btns .btn':"updateButtons"
        },
        events:{
            'click .delete':'hideView',
            'click .delete_tip':"deletePhoto",
            'click .remove-error':"hideError",
            'click #post-upload-preview-wrap .change':"changePhoto"
        },
        proxied: ["upload","onUpload","uploadProgress","uploadError","uploadSuccess","show","uploadPhoto"],
        template:function(data){
        },
        init: function(){
           this.browsePhoto=BrowsePhoto.init({el:this.uploadBtn,onChange:this.uploadPhoto})
           this.browsePhoto.activate();
           this.App.bind("show:tip:photo",this.show)
        } ,
        showProgress:function(){
            this.progressEl.show()
            this.delete.hide()
        },
        hideProgress:function(){
            this.progressEl.hide()
            this.delete.show()
        },
        show:function(tip){
         this.tip=tip;
         this.tip.type="PhotoTip"
         console.log('tip',tip)
        },
        hide:function(){
            this.progressEl.hide()
            this.previewEl.hide()
            this.uploadBtn.hide()
        },
        upload:function(url,files){
            console.log("upload",files[0]);
            this.files=files;
            this.hide();
            this.showProgress()
            this.xhr=$.upload(url,
                {"photo[image]":files[0],
                 "tip[type]":"PhotoTip"
                },

                {
                    type: "PUT",
                    contentType:"JSON",
                    upload:{
                        progress:this.uploadProgress,
                        load:this.onUpload
                    },
                    error:this.uploadError ,
                    success:this.uploadSuccess
                })
        },
        uploadSuccess:function(data){
            this.photo_url=data.photo_url
            this.delete_url=data.delete_url
            this.hideProgress()
            this.reset()
            console.log("data",data)
            this.previewEl.find('img').attr('src',this.photo_url)
            console.log("success",data)
            this.xhr=null;
        },
        uploadError:function(data){
            this.showError({message:"upload failed !"});
            this.hideProgress()
            this.reset()
            this.xhr=null;
        },
        reset:function(){
            this.hide()
            this.progressStatus.text("")
            this.progressBar.css({width:"0"})
            this.uploadBtn.removeClass("disabled")
            this.browsePhoto=BrowsePhoto.init({el:this.uploadBtn,onChange:this.uploadPhoto})
            this.browsePhoto.activate();
            if(this.photo_url){
                this.previewEl.show()
            }else{
                this.uploadBtn.show()
            }
        } ,
        uploadProgress:function(event){
            percentage = Math.round((event.position / event.total) * 100);
            console.log("progress",event)
            if(this.progressStatus){
                this.progressStatus.text("uploading..."+percentage+"%")
            }
            if(this.progressBar)  {
                this.progressBar.css({width:percentage+"%"})
            }
        },
            onUpload:function(data){
                console.log("load",data)
            },
            showError:function(message){
                this.alertEl.show().html($("#tip-upload-error-tmpl").tmpl(message))
            },
            showDeleteInfo:function(message){
                this.alertEl.show().html($("#tip-delete-info-tmpl").tmpl(message))
            },
           hideDeleteInfo:function(){
            this.alertEl.empty().hide()
            } ,
            hideError:function(){
                this.content.show()
                this.alertEl.empty().hide()
                return false;
            },
            uploadPhoto:function(e){
                console.log("upload",e)
                event= e.originalEvent;
                this.files=event.target.files
                if(this.files.length>0){
                    this.uploadBtn.addClass("disabled")
                    this.browsePhoto.deActivate();
                    this.upload(this.tip.update_url,this.files)
                }
            } ,
        hideView:function(){
            if(this.xhr && this.xhr.readystate != 4) {
                this.delete_url=null;
                this.photo_url=null;
                this.xhr.abort()
                this.reset()
            }
                this.tipController.deActivateTabs()
                //this.tip.type=""
        },
            deletePhoto:function() {
              if(this.photo_url && this.delete_url){
                    this.deleteTipBtn.button('loading')//this.showDeleteInfo({message:"deleting..."})
                    this.updateButtons.addClass("disabled")
                    $.ajax({
                        type: "POST",
                        url: this.delete_url,
                        error:this.proxy(function(data){
                            this.hideDeleteInfo()
                            this.deleteTipBtn.button('reset')
                            this.updateButtons.removeClass("disabled")
                            this.showError({message:"could not delete photo"})
                        }),
                        success:this.proxy(function(data){
                            this.deleteTipBtn.button('reset')
                            this.updateButtons.removeClass("disabled")
                            this.delete_url=null;
                            this.photo_url=null;
                            this.hideDeleteInfo()
                            this.reset()
                        })
                    })
                }
           } ,
            changePhoto:function(){
            if(this.photo_url){
               this.delete.show()
            }
            this.hide()
            this.uploadBtn.show()
        }
    });
})

jQuery(function($){
    window.NewTip = Spine.Controller.create({
        elements:{
            ".input-btn":"postTrigger",
            ".input-btn .status":"openStatus",
            "#input-controls .btn":"controlButtons",
            ".attachment":"toolBar",
            ".tip-input":"input" ,
            "#tip-categories":"postCategories",
            ".categoryOp" :"categoryEl",
            ".linkOp" : "linkEl",
            ".photoOp" :"photoEl",
            "#tip-btn":"postBtnEl",
            "#tip-btn .tip":"postBtn",
            ".tip-main-container":"mainContainer",
            ".tab-body":"tabBody",
            '.tab-pane':"tabPane",
            "#input-controls .dropdown-menu":"tabs",
            '#tip-photo':"tipPhoto",
            '#tip-link':"tipLink" ,
            '#tip-title':"titleEl",
            "#tip-input .input-wrap":"bodyEl"
        },
        events:{
            "click .input-btn":"openPost",
            "click .categoryOp":"toggleCategories",
            "click .titleOp":"toggleTitle",
            //"click .post-upload-preview .close":"closePreview",
            "click #input-controls .dropdown-menu li a":"changeTip",
            "keydown .tip-input":"checkInput",
            "keyup .tip-input":"checkInput",
            "click #tip-btn .tip":"post",
            "click .close-tip":'closeTip'
        },
        proxied: ['uploadPhoto','onUpload','uploadError','postError','postSuccess','reset'],
        template:function(data){
        },
        init: function(){
            this.tipPhotoUpload=TipPhotoUpload.init({el:this.tipPhoto,tipController:this})
            this.tipLink=TipLink.init({el:this.tipLink,tipController:this})
        },
        openPost:function(ev){
            if(this.postTrigger.hasClass('disabled'))return
            this.postTrigger.removeClass("error").addClass("disabled")
            this.openStatus.text("opening...")
            url=this.postTrigger.data("url")
            branch_id=this.postTrigger.data("branch")
            data={branch_id:branch_id}
            $.ajax({
                type: "POST",
                url: url,
                data:data,
                error:this.proxy(function(data){
                    console.log(data)
                    this.postTrigger.removeClass("disabled").addClass("error");
                    this.openStatus.text("error loading data!")
                 }),
                success:this.proxy(function(data){
                    console.log(data)
                    this.tip=data
                    this.postTrigger.removeClass("disabled error");
                    this.postTrigger.hide();
                    this.toolBar.removeClass("disabled")
                    this.bodyEl.html($("#tip-input-title-tmpl").tmpl())
                    this.input=this.bodyEl.find(".tip-input")
                    this.input.on("resize",this.proxy(function(){
                        console.log("resize")
                        this.App.trigger("tips:update")
                    }))
                    this.bodyEl.show();
                    //this.browsePhoto.activate();
                    this.postBtnEl.show();
                    this.postBtn.addClass("disabled")
                    this.mainContainer.show();
                    this.App.trigger("tips:update")
                    /**
                    this.mainContainer.slideDown("fast",this.proxy(function(){
                        this.App.trigger("tips:update")
                    }));  **/
                })
            })
        },
        closePost:function(callback){
            this.mainContainer.hide();
            this.postCategories.empty();
            this.tabPane.attr('aria-hidden',true).removeClass('active')
            this.titleEl.empty();
            this.bodyEl.empty();
            this.postTrigger.show();
            this.toolBar.addClass("disabled")
            if(callback)callback.call(null)
            this.App.trigger("tips:update")
            /**
            this.mainContainer.slideUp("fast",this.proxy(function(){
                this.postCategories.empty();
                this.tabPane.attr('aria-hidden',true).removeClass('active')
                this.titleEl.empty();
                this.bodyEl.empty();
                this.postTrigger.show();
                this.toolBar.addClass("disabled")
                if(callback)callback.call(null)
                this.App.trigger("tips:update")
            })); **/
        },
        toggleCategories:function(ev){
            var el= $(ev.currentTarget)
            if(el.hasClass("disabled") || this.toolBar.hasClass("disabled"))return;
            if(el.hasClass("open")) {
                el.removeClass("open")
                this.postCategories.show();
                $(this).empty();
            } else{
                el.addClass("open")
                var tmpl=$("#tip-category-tmpl").tmpl("")
                this.postCategories.html(tmpl)
                    .find(".listbuilderinput ").listbuilder({
                        "width":"100%",
                        url:"/tags" ,
                        jsonContainer:"tags",
                        hintText:"type a name and press enter or comma."
                    })
                this.postCategories.hide()
                this.categories=this.postCategories.find("textarea")
                //this.categoryEl.find(".ui-text").text("Remove Categories")
            }
            this.App.trigger("tips:update")
        } ,
        toggleTitle:function(ev){
            var el= $(ev.currentTarget)
            if(el.hasClass("disabled") || this.toolBar.hasClass("disabled"))return;
            if(el.hasClass("open")) {
                el.removeClass("open")
                this.titleEl.hide();
                $(this).empty()
                this.categoryEl.find(".ui-text").text("Add Categories")
            } else{
                el.addClass("open")
                this.titleEl.html($("#tip-title-tmpl").tmpl(""))
                this.titleEl.hide().show()
                this.title=this.titleEl.find("input")
                //this.categoryEl.find(".ui-text").text("Remove Categories")
            }
            this.App.trigger("tips:update")
        } ,
        checkInput:function(){
            var value = this.input.val();
            if ( value=="" ){
                this.postBtn.addClass("disabled")
            }else{
                this.postBtn.removeClass("disabled")
            }
        },
        post:function(){
            if(this.postBtn.hasClass("disabled")) return;
            this.tip.content=this.input.val();
            if(this.categories) {
                this.tip.categories=this.categories.val()
            }
            console.log("input",this.input)
            if(!this.tip.content)return;
            if(this.tip){
                var fd = {};
                fd['tip[content]']=this.tip.content;
                if(this.tip.link){
                    fd['link[url]']=this.tip.link
                }
                /**
                if(this.tip.type){
                    fd['tip[type]']=this.tip.type
                } **/
                if(this.tip.categories){
                    fd['tip[categories_list]']=this.tip.categories;
                }
                this.postBtn.button('loading')

                this.xhr=$.upload(this.tip.publish_url,fd,
                    {
                        type: "POST",
                        contentType:"JSON",
                        error:this.postError ,
                        success:this.postSuccess
                    })
                //this.openStatus.text("posting...")
               this.postTrigger.removeClass("error").addClass("disabled");
                //this.postTrigger.show();
            }

        },
        postError:function(data){
            console.log("error",data)
            this.closePost(this.proxy(function(){
                this.postBtn.button('reset');
                this.input.addClass('error');
                this.openStatus.text("error posting")
                this.postTrigger.removeClass("disabled").addClass("error");
            }));
        },
        postSuccess:function(data){
            console.log("post",data)
            this.closeTip()
        },
        closeTip:function(){
            this.closePost(this.reset);
            return false;
        },
        reset:function(){
            this.postBtn.button('reset');
            this.openStatus.text("click to open")
            this.postTrigger.removeClass("disabled error");
            this.postTrigger.show();
        },
        changeTip:function(ev){
           var target= $(ev.target)
           if(!target.is("a")){
             target=target.closest("a")
           }

           this.tabs.find('li a').removeClass("active").attr('tabindex','-1');
           target.attr('tabindex','0').addClass("active");
           this.tabPane.attr('aria-hidden',true).removeClass('active')
           this.tabBody.find(target.data("target")).attr('aria-hidden',false).addClass('active')
           this.currentType=target.data("type")
           this.App.trigger(target.data('action'),this.tip)
        },
        deActivateTabs:function(){
            this.tabPane.attr('aria-hidden',true).removeClass('active')
            this.tabs.find('li a').removeClass("active").attr('tabindex','-1');
        }
    });

})

jQuery(function($){
    window.Application = Spine.Controller.create({
        elements:{
          '#main_navbar':'mainNavBar',
           '#left_panel':'leftPanel' ,
            '#left_panel .left_panel_wrap':'leftPanelWrap',
            '#conversation_all':"conversationEl"
        },

        events:{

        },

        proxied:['updateUI'],

        init: function(){

            this.tips=Tips.init({el:$('#tipView')})
            this.newTip=NewTip.init({el:$('#upost')})
            this.App.branch={
                id:this.conversationEl.data('branch-id'),
                name:this.conversationEl.data('branch-name')
            }
            console.log("branch",this.App.branch)
            this.chatApp=ChatApp.init({el:this.conversationEl})
            $(window).on("resize",this.updateUI)
            this.updateUI();
        },
        updateUI:function(){
            var mH=this.mainNavBar.outerHeight();
            var vpH=$(window).height()
            var leftPane=this.leftPanel.css({
                "height":"100%"
            })
            this.leftPanelWrap.css({
               "height":vpH-mH+"px"
            })
            this.App.trigger("updateUI")
        }
    })

    Application.init({
        el:$("body")
    })
})
