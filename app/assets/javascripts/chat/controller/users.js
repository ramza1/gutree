jQuery(function($){
    window.SignInController = Spine.Controller.create({
        elements:{
            '#signIn-email':"email",
            "#signIn-password":"password",
            ".sign_in_btn":"signInBtn"
        },
        events:{
            "click .sign_in_btn":"signIn"
        },
        proxied:["success","failure","signIn"],
        template:function(){
            return $("#signIn-form-tmpl").tmpl(this.data)
        },
        init: function(){
            this.currentState=this.App.SIGN_IN;
            this.el.submit(this.signIn)
            this.data={}
        },
        signIn:function(form){
            this.data['user[email]']=this.email.val()
            this.data['user[password]']=this.password.val()
            this.showProgress();

            $.ajax({
                type: "POST",
                url: this.App.base_url+"/users/sign_in.json",
                data:this.data,//JSON.stringify(data)
                error:this.failure,
                success:this.success
            })
            this.signInBtn.button('disable');
            this.App.CURRENT_SIGN_IN_STATE=this.App.SIGNING_IN;
            return false;
        },
        show:function(){
            this.render();
        },
        render:function(){
            this.el.html(this.template());
            this.form=this.el.find('#signIn-form')
            this.signInBtn=this.form.find('.sign_in_btn')
            this.email=this.form.find('#signIn-email')
            this.password=this.form.find('#signIn-password')
            this.form.trigger('create');
            switch(this.App.CURRENT_SIGN_IN_STATE){
                case this.App.SIGN_IN :
                    this.data={};
                    break ;
                case this.App.SIGNING_IN :
                    this.showProgress();
                    this.signInBtn.button('disable');
                 break ;

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
        success:function(data){
            this.hideProgress();
            console.log(data)
            this.App.CURRENT_SIGN_IN_STATE=this.App.SIGNED_IN;
            //user=User.create(data)
            this.App.trigger("signInStateChange",data)

        },
        failure:function(data){
            this.signInBtn.button('enable');
            this.hideProgress();
            console.log(JSON.parse(data.responseText))//JSON.parse(data.responseText))//handle proper error display
        }
    })
})
jQuery(function($){
    window.UsersController = Spine.Controller.create({
        elements:{
            '[data-role="content"]':'content'
        },
        events:{
        },
        proxied: ["render","prefetchComplete","onSignInStateChange","showUser","onError","showProgress","hideProgress",'onOrientationChange','beforePageHide','beforePageShow'],
        templateUser:function(){
            return $("#user-tmpl").tmpl(this.user)
        },

        renderSignInForm:function(){
            this.signInController.show();
         },
        init: function(){
            this.el.live('pagebeforeshow',this.beforePageShow);
            this.el.live('pagebeforehide',this.beforePageHide);
            this.el.bind('orientationchange',this.onOrientationChange);
            this.App.bind("signInStateChange",this.onSignInStateChange)
            this.signInController=SignInController.init({el:this.content})
        },
        onSignInStateChange:function(data){
            switch(this.App.CURRENT_SIGN_IN_STATE){
                case this.App.SIGNED_IN :
                    this.App.currentUser=data;
                    this.render();
                    break ;

            }
        },
        checkScroll:function(){},
        render:function(){
            this.empty();
            if(this.App.currentUser){
                console.log('current_user',this.App.currentUser)
            }else{
               this.renderSignInForm();
            }
        },
        empty:function(){
            this.content.empty();
        },
        beforePageShow:function(){
            this.App.trigger('activate',this);
            this.render();
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
