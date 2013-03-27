//= require spine/spine
//= require spine/spine.model.local
//= require strophe/base64
//= require strophe/md5
//= require strophe/core
//= require chat/controller/chats

jQuery(function($){
    Spine.Controller.prototype.App.SIGN_IN=100;
    Spine.Controller.prototype.App.SIGNING_IN=200;
    Spine.Controller.prototype.App.SIGNED_IN=300;
    Spine.Controller.prototype.App.SIGNED_OUT=400;
    Spine.Controller.prototype.App.CURRENT_SIGN_IN_STATE=Spine.Controller.prototype.App.SIGN_IN;
    Spine.Controller.prototype.App.base_url="http://localhost:3000/"
    Spine.Controller.prototype.App.bosh_addr = "http://localhost:5280/http-bind"
    Spine.Controller.prototype.App.currentUser=null
    Spine.Controller.prototype.App.isCurrentUser=function(user){
        if(this.currentUser && user){
            return this.currentUser.id==user.id
        }else{
            return false;
        }
    }
    Spine.Controller.prototype.App.activate=function(controller){
        this.current=controller;
        console.log("activate",this.current)
    },
        Spine.Controller.prototype.App.deactivate=function(controller){
        this.previous=controller;
    }

    window.Application = Spine.Controller.create({
        elements:{
        },
        events:{
        },
        proxied: ['activate','deactivate','scroll',"onConnect","onFailure","onAttach"],
        template:function(data){
        },
        init: function(){
         this.App.bind('activate',this.activate);
         this.App.bind('deactivate',this.deactivate);
         this.chats=Chats.init({el:$('#chat')});
         this.current=this.chats
         this.current.show();
         this.connect();
        },
        scroll:function(){
         this.current.checkScroll();
         console.log("scroll",this.current)
        },
        connect:function(){
            console.log("attempting to connect")
            $.ajax({
                type: "GET",
                url: this.App.base_url+"connect",
                contentType:"application/json",
                error: this.onFailure,
                success: this.onConnect
            })
        },
        onConnect:function(data){
            console.log("Successfull ",data)
            this.sid=data.sid;
            this.rid=data.rid;
            this.userJid=data.jid;
            console.log("jid ",this.userJid)
            this.App.connection= new Strophe.Connection(this.App.bosh_addr);
            console.log("Attaching",this.App.connection);
            this.App.connection.attach(this.userJid,this.sid,this.rid,this.onAttach)

        },
        onAttach:function(status){
            switch(status){
                case   Strophe.Status.ATTACHED:
                    this.App.trigger('connected',this.App.connection)
            }
            return false;

        },
        onFailure:function(data){
            console.log(data.responseText)
            if(this.attempt++ < this.maxAttemp) {
                this.connect()
            } else{

            }
            return false;
        }
    });
    Application.init({
        el:$("body")
    })
})





