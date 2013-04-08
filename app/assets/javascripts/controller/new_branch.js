jQuery(function($){
    window.NewBranch = Spine.Controller.create({
        elements:{
           "#name_el":"nameEl",
            "#branch_name":"branchName",
            "#branch_private" :"type" ,
            '#new_branch_form':"newBranchForm",
            '#branch_tree_id':'treeId',
            ".create":"createButton" ,
            ".cancel":"cancel" ,
            '.ui-btn':'btns',
            '.new_branch_form_container':'newBranchFormContainer'
        },
        events:{
            "submit #new_branch_form" :"create",
            "click .ui-btn":"click" ,
            "click .cancel":"cancel" ,
            "keyup #branch_name": "checkAvailability"
        },
        proxied: ["render",'activate','deActivate','success','failure'],
        template:function(data){
        },
        init: function(){
          this.minChars=this.minChars||1
          $("#newBranchDialog").bind("branch:new",this.proxy(function(ev,el){
              console.log("error el",el)
              this.render(el)
          }))
        } ,
        show:function(){
           console.log("show tip branch",this.newBranchForm)
        },
        click:function(ev){
           var target=$(ev.currentTarget)
            this.btns.removeClass("active") ;
            target.addClass("active");
            if(target.hasClass("private")) {
                this.type.val("true") ;
            } else{
                this.type.val("false") ;
            }
            this.nameEl.hide().show();
            console.log(this.type)
        },
        checkAvailability:function(ev){
             query=$(ev.target).val()
             console.log("query",query)
            var query = query.toLowerCase();
            var url='/branches/check_availability'
            if(query && query.length) {
                if(query.length >= this.minChars) {
                    this.createButton.removeClass('disabled')
                    this.showHint("checking availability");
                    data={}
                    data['tree_id']=this.treeId.val()
                    data['q']=query
                    $.ajax({
                        type: "GET",
                        url: "/branches_available.json",
                        data:data,//JSON.stringify(data)
                        error:this.proxy(function(data){
                             console.log(data)
                            this.showHint(data.error);
                            this.nameEl.find('.control-group').addClass("error")
                        }),
                        success:this.proxy(function(data){
                          console.log(data)
                          if(data.available){
                              this.showHint('<i class="icon-ok"></i> available');
                              this.nameEl.find('.control-group').addClass("success")
                          } else{
                              this.showHint("unavailable");
                              this.nameEl.find('.control-group').addClass("warning")
                          }


                        })
                    })
                }
                else{
                    this.createButton.addClass('disabled')
                }
            }
            else{
                this.createButton.addClass('disabled')
                this.hideHint();
                this.nameEl.find('.control-group').removeClass("success").removeClass("error").removeClass("warning")
            }

        },
        showHint:function(hint){
            this.hideHint();
           $('<span class="help-inline hint">'+hint+'</span>').insertAfter(this.branchName)
        },
        hideHint:function(){
           this.nameEl.find('.hint').remove();
        },
        activate:function(){
          this.el.modal();
        },
        deActivate:function(){
            this.el.modal('hide');
        },
        create:function(ev){
            if(this.createButton.hasClass("disabled")) return false;
            url=$(ev.target).attr('action');

            console.log("target",$(ev))
            console.log("submit",url)
            data=$(ev.target).serialize()
            $.ajax({
                    type: "POST",
                    url: url+".js",
                    data:data,
                    error:this.failure,
                    success:this.success
            })

            this.createButton.button('loading')
            return false;
        },
        render:function(el){
          this.newBranchFormContainer.html(el)
          this.newBranchForm=this.el.find('#new_branch_form')
          this.nameEl=this.newBranchForm.find("#name_el")
          this.type=this.newBranchForm.find("#branch_private")
          this.treeId=this.newBranchForm.find("#branch_tree_id")
          this.createButton=this.newBranchForm.find(".create")
          this.cancel=this.newBranchForm.find(".cancel")
          this.btns=this.newBranchForm.find(".ui-btn")
        },
        success:function(data){
            //console.log(data)
            this.el.modal('hide');
            this.createButton.addClass("disabled")
            this.createButton.button('complete')
            this.hideHint();
            this.nameEl.find('.control-group').removeClass("success error warning")
        },
        failure:function(data){
            console.log("error",data.responseText)
            //eval(data.responseText)
            this.createButton.button('complete')
            this.createButton.addClass("disabled")
            this.nameEl.find('.control-group').addClass("error")
            //this.showHint('<i class="icon-warning"></i> '+data.name);
        },
        cancel:function(){
          if(this.xhr && this.xhr.readystate!=4){
                this.xhr.abort()
           }
          this.createButton.button('complete')
          this.el.modal('hide');
           this.hideHint();
          return false
        }
    });
})

jQuery(function($){
    window.UploadPhotos= Spine.Controller.create({
        elements:{
            "#name_el":"nameEl",
            "#tip_branch_private" :"type" ,
            '.ui-btn':'btns'
        },
        events:{
            "click .ui-btn":"click" ,
            "keyup #tip_branch_name": "checkAvailability"
        },
        proxied: ['activate','deactivate'],
        template:function(data){
        },
        init: function(){

        } ,
        show:function(){
            this.el.show();
        },
        uploadPhoto:function(){

        }
    });
})

jQuery(function($){
    window.EditBranch= Spine.Controller.create({
        elements:{
            "#edit_modal":"modalView",
            "#pick":"pick" ,
            "#edit_modal_body":"modalBody",
            "#edit_photo_preview":"photoTrigger",
            ".prev_status":"prevStatus",
            ".save":"saveBtn"
        },
        events:{
            "click #edit_photo_preview.enable":"showPhoto",
            "click .close_edit_pane":"hide",
            "click .skip_welcome":"skipWelcome",
            "click .loading-dialog":'hideProgress',
            "submit form.edit_branch":"save",
            "dragenter #pick" :"dragEnter" ,
            "dragover #pick":"dragOver",
            "dragleave #pick":"dragLeave",
            "drop #pick":"drop"
        },
        proxied: ['activate','deactivate',"show","getEditView","change",'uploadPhoto','onUpload','uploadError','save'],
        template:function(data){
        },
        init: function(){
            console.log("init edit",this.pick)
            this.App.bind("branch:edit",this.getEditView)
        },
        show:function(){
            this.el.show();
        },
        hideProgress:function(){
          if(this.progress){
              this.progress.modal("hide")
              this.progress.remove();
              this.progress=null;
          }
        },
        showProgress:function(message){
            //this.hideProgress();
            this.progress=$("#loading-dialog-tmpl").tmpl({message:message}).appendTo(this.el.parent())//
            this.progress.modal({backdrop:"static",keyboard:false});
            this.progress.addClass("loading")
        },
        getEditView:function(url,elem){
            this.elem=elem
            this.showProgress("loading...");
            $.ajax({
                type: "GET",
                url: url,
                error:this.proxy(function(data){
                    console.log(eval(data))
                    this.progress.removeClass("success warning loading").addClass("error").find(".message").html('<i class="icon-warning-sign"></i>  Error Loading data')
                }),
                success:this.proxy(function(data){
                    this.hideProgress();
                    this.render(data)
                })
            })
        },
        render:function(data){
            this.el=eval(data);
            this.el.find(".modal-header").html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>')
            this.profileUpload=this.el.find("#profile_upload_photo")
            this.photoPicker=this.el.find(".photo_chooser")
            this.profileUploadPreview=this.el.find("#profile_upload_photo_preview")
            console.log("profileUpload",this.profileUpload)
            this.profilePhotoUpload =ProfilePhotoUpload.init({el:this.profileUpload})
            this.browsePhoto=BrowsePhoto.init({el:this.photoPicker,onChange:this.uploadPhoto})
            this.browsePhoto.activate();
            this.uploadUrl=this.profileUpload.data('upload_url')
            this.dialog=this.el.find(".modal-form").addClass("modal hide fade").removeClass("no-shadow").modal()
            this.saveBtn=this.dialog.find(".save")
            this.dialog.find(".listbuilderinput ").listbuilder({
                "width":"100%",
                url:"/tags" ,
                jsonContainer:"tags",
                hintText:"type a name and press enter or comma."
            })
            this.dialog.find(".popover_trigger").popover({trigger:"hover"}) ;
        },
        save:function(ev){
            if(this.saveBtn.hasClass("disabled")) return;
            url=$(ev.target).data('url');

            console.log("target",$(ev))
            console.log("submit",url)
            data=$(ev.target).serialize()
            $.ajax({
                type: "PUT",
                url: url,
                data:data,
            error:this.proxy(function(data){
                this.saveBtn.removeClass("disabled")
                console.log(eval(data))
                this.render(data)
            }),
           success:this.proxy(function(data){
              this.saveBtn.removeClass("disabled")
               eval(data)
               this.close()
            })
        })
            this.saveBtn.addClass("disabled")
            return false;
        } ,
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
                container.append('<span class="prev_status">change photo_tips</span>')
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
        },
        dragOver:function(e){
            e.stopPropagation();
            e.preventDefault();
            this.pick.addClass("active")
        },
        drop:function(e){
            e.stopPropagation();
            e.preventDefault();
            event= e.originalEvent;
            console.log("e",event.dataTransfer);
            var dt= event.dataTransfer;
            var files=dt.files;
            console.log("drop",files);
            this.pick.addClass("active")
        } ,
        dragLeave:function(e){
            e.stopPropagation();
            e.preventDefault();
            this.pick.removeClass("active")
        },
        dragEnter:function(e){
            e.stopPropagation();
            e.preventDefault();
            this.pick.addClass("active")
        } ,
        close:function(){
            if(this.dialog)this.dialog.modal("hide") ;
            //this.el.hide();
        },
        skipWelcome:function(){
            this.close();
        }
    });
})