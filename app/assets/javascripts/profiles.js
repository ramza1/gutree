//= require utils
//= require jquery.upload
//= require jquery.tmpl.min
//= require spine/spine
//= require_self
jQuery(function($){
    window.BrowsePhoto= Spine.Controller.create({
        elements:{

        },
        events:{
        },
        proxied: ['activate','deactivate','onMouseOver','change'],
        template:function(data){
        },
        init: function(){
            this.input = $("<input type='file'  multiple accept='image/*'>");
            this.input.css({
                "position":     "fixed",
                "z-index":      1060,
                "cursor":       "pointer",
                "-moz-opacity": "0",
                "filter":       "alpha(opacity: 0)",
                "opacity":      "0"
            });
            this.input.mouseover(this.proxy(function(){
                this.el.addClass("upload_btn-hover")
                this.input.attr("title","")
            }))
            this.input.mouseout(this.proxy(function(){
                this.el.removeClass("upload_btn-hover")
                this.input.detach();
            }));
            this.input.focus(this.proxy(function(){
                this.el.addClass("upload_btn-focus")
            }))
            this.input.blur(this.proxy(function(){
                this.el.removeClass("upload_btn-focus")
            }))
            console.log(this.el)
        } ,
        deActivate:function(){
            this.input.off("change.post_photo");
            this.el.off("mouseover.post_browse")
            console.log("deActivate")
        },
        activate:function(){
            console.log("input",this.input)
            this.input.on("change.post_photo",this.change);
            this.el.on("mouseover.post_browse",this.onMouseOver)
            console.log("activate")
        },
        change:function(ev){
            console.log("change")
            if(this.onChange){
                this.onChange.call(null,ev);
            }
            return false;
        },
        onMouseOver:function(){
            this.input.offset(this.el.offset());
            this.input.width(this.el.outerWidth());
            this.input.height(this.el.outerHeight());
            $("body").append(this.input);
            return false;
        }
    });
})
jQuery(function($){
    window.ProfilePhotoUpload= Spine.Controller.create({
        elements:{
            " .status" :"progressStatus",
            ".progress  .bar" :"progressBar"
        },
        events:{
        },
        proxied: ["upload","onUpload","uploadProgress","uploadError","uploadSuccess"],
        template:function(data){
        },
        init: function(){
        } ,
        show:function(){
            this.el.html(this.render())
            this.status=this.el.find(".status")
            this.progressBar=this.el.find(".bar")
            //this.el.show();
        },
        render:function(){
            return $("#post-upload-progress-tmpl").tmpl("")
        },
        upload:function(url,files,success,error){
            console.log("upload",files[0]);
            this.files=files;
            this.succCallback=success;
            this.errorCallback=error
            this.show();
            $.upload(url,
                {"photo":files[0]},
                {
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
            console.log("success",data)
            if(this.succCallback){
                this.succCallback.call(null,data);
            }
            this.el.empty();
        },
        uploadError:function(data){
            this.showError();
            if(this.errorCallback) {
                this.errorCallback.call(null,data)
            }
        },
        uploadProgress:function(event){
            percentage = Math.round((event.position / event.total) * 100);
            console.log("progress",event)
            if(this.status){
                this.status.text("uploading..."+percentage+"%")
            }
            if(this.progressBar)  {
                this.progressBar.css({width:percentage+"%"})
            }
        },
        onUpload:function(data){
            console.log("load",data)
        },
        uploadPhoto:function(){
            this.uploadPhotos.show();
        },
        showError:function(){
            this.el.html($("#post-upload-error-tmpl").tmpl(""))
        }
    });
})

jQuery(function($){
    window.Application = Spine.Controller.create({
        elements:{
            ".photo_chooser":"photoPicker",
            "#profile_upload_photo_preview":"profileUploadPreview",
            "#profile_upload_photo" :"profileUpload",
            ".tag-input":"tagInput"
        },
        events:{

        },
        proxied: ['uploadPhoto','onUpload','uploadError'],
        template:function(data){
        },
        init: function(){
            this.profilePhotoUpload=ProfilePhotoUpload.init({el:this.profileUpload})
            this.browsePhoto=BrowsePhoto.init({el:this.photoPicker,onChange:this.uploadPhoto})
            this.browsePhoto.activate();
            console.log("init")
            this.uploadUrl=this.profileUpload.data('upload_url')
            console.log("upload url",this.profileUpload)
            if(this.tagInput.length>0){
                this.tagInput.listbuilder({
                    "width":"100%",
                    url:"/tags" ,
                    jsonContainer:"tags",
                    hintText:"type a name and press enter or comma."
                })
            }
        },
        uploadPhoto:function(e){
            event= e.originalEvent;
            this.files=event.target.files
            if(this.files.length>0){
                this.photoPicker.addClass("disabled")
                this.browsePhoto.deActivate();
                this.profilePhotoUpload.upload(this.uploadUrl,this.files,this.onUpload,this.uploadError)
            }
        },
        uploadError:function(data){
            this.photoPicker.removeClass("disabled").removeClass("active")
            this.browsePhoto.activate();
            this.showPhotoPreview();
        },
        onUpload:function(data){
            console.log("data",data)
            this.photoPicker.removeClass("disabled").removeClass("active")
            this.browsePhoto.activate();
            this.showPhotoPreview(data.photo_url);
        },
        showPhotoPreview:function(url){

            var tmpl=$("#post-upload-preview-tmpl").tmpl({src:url})
            var container=this.profileUploadPreview.html(tmpl).find('.image-container');
            var loader=this.profileUploadPreview.find(".loading_pane")
            loader.show()
            this.profileUploadPreview.hide();
            container.imagesLoaded(this.proxy(function(){
                loader.hide()
                container.append('<span class="prev_status">change photo</span>')
                preview=this.profileUploadPreview.find('.preview')
                this.photoPicker.hide().replaceWith(preview);
                this.photoPicker=preview;
                this.photoPicker.show();
                this.browsePhoto.deActivate()
                this.browsePhoto=BrowsePhoto.init({el:this.photoPicker,onChange:this.uploadPhoto})
                this.browsePhoto.activate();
                console.log(this.photoPicker)
                this.profileUploadPreview.empty();
            }))
        }
    });
    Application.init({
        el:$("body")
    })
})