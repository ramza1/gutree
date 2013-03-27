jQuery(function($){
    window.Chats= Spine.Controller.create({
        elements:{
            '.chat_container':'chatContainer',
            '.chat_anchor .btn':'anchorBtn'
        },

        events:{
            'click .chat_anchor .btn':'openChat',
            "keydown .chat_input textarea": "checkCreate"
        },

        proxied: ["render","onConnect" ],

        template:function(){

        },

        init: function(){
           // this.messages=[];
            //Message.bind("create", this.addNew);
            this.App.bind('connected',this.onConnect) ;
            this.NS_MUC="http://jabber.org/protocol/muc"
            this.maxAttemp=0;
            this.joined=null;
            this.participants=null;
            this.attempt=0;
            this.initUI();
            //this.connect();
        },
        onConnect:function(connection){
            console.log("connection",this.App.connection)
        },
        initUI:function(){
        },

        show:function(){

        },
        openChat:function(ev){
            if(this.anchorBtn.hasClass('active')){
                this.anchorBtn.removeClass('active')
                this.chatContainer.hide();
            }else{
            this.anchorBtn.addClass('active')
                this.chatContainer.show();
            }
        },
        createConversation:function(place){
            return Conversation.create({
                place_id:place.id,
                place_name:place.name,
                place_icon:place.icon,
                total:0
            })
        },

        checkChat:function(){
            this.conversation=Conversation.findByAttribute('place_id',this.place.id)
            if(!this.conversation){
                this.conversation =  this.createConversation(this.place)
            }
            if(!this.chat){
                //var thread=Math.floor(Math.random() * 4294967295);
                this.chat=this.createChat(this.user,this.conversation,this.place);

            }
        },

        createChat:function(user,conversation,place){
            var chat=Chat.create({
                user_id:user.user_id,
                user_name:user.user_name,
                user_avatar:user.user_avatar,
                place_id:place.id,
                conversation_id:conversation.id
            })
            conversation.total++;
            conversation.save();
            return chat;
        },


        changeChat:function(chat){
            this.chat=chat;
            this.render();
        },

        render:function(){
            console.log("render")
            $.mobile.changePage("#"+this.el.attr('id'),'slide',false,true);
            this.addAll();
        },

        create: function(){
            var value = this.input.val();
            if ( !value ) return false;
            this.checkChat();
            var msg=this.createMessage(this.App.current_user.id,this.chat.user_id,this.chat,value)
            this.sendMessage(msg)
            this.input.val("");
            this.input.focus();
            return false;
        },

        createMessage:function(sender_id,recipient_id,chat,text){
            var msg= Message.create({
                chat_id:chat.id,
                sender_id:sender_id,
                recipient_id:recipient_id,//this.to.id,
                text: text,
                thread:chat.thread,
                created_at:Date.now()
            });

            if(!(this.App.current_user.id===sender_id)){
                chat.latest_message=text;
                chat.save()
            }
            return msg;
        },

        addNew: function(item){
            if(!this.checkItem(item))return;
            this.scroll(function(){
                this.addOne(item, false);
            });
        },

        addOne: function(item, audio){
            var msgItem = MessagesItem.init({
                item: item
            });
            this.items.append(msgItem.render().el);
            if (audio) $.playAudio("/audio/new.mp3");
        },

        addAll: function(){
            this.items.empty();
            if(this.chat){
                this.messages=Message.findAllByAttribute("chat_id",this.chat.id);
                console.log(this.messages)
                ;
                $.each(this.messages,this.proxy(function(i){
                    this.addOne(this.messages[i],false)
                }) )
            }
        },

        checkCreate:function(e){
            if (e.which == 13 && !e.shiftKey) {
                this.create();
                return false;
            }
        },

        sendMessage:function(msg){
            var userJid=msg.recipient_id+"@"+this.App.CHECK_IN_SERVICE;
            msg=$msg({
                to: userJid,
                "type": "chat",
                "thread":msg.thread,
                "place_id":this.place.id
            }).c('body').t(msg.text)
            console.log("sending message",msg)
            this.App.connection.send(msg);
            return false;
        },
        onMessage:function(msg){
            console.log('received',msg)
            var user_id = Strophe.getNodeFromJid($(msg).attr('from'));
            console.log('user_id',user_id)
            var body = $(msg).find('html > body');
            if (body.length === 0) {
                body = $(msg).find('body');
                if (body.length > 0) {
                    body = body.text()
                } else {
                    body = null;
                }
            } else {
                body = body.contents();
                var span = $('<span></span>');
                body.each(function () {
                    if (document.importNode) {
                        $(document.importNode(this, true)).appendTo(span);
                    } else {
                        // IE workaround
                        span.append(this.xml);
                    }
                });
                body = span;
            }
            if (body) {
                var place_id=$(msg).attr('place_id')
                var users=CheckinUser.findAllByAttribute('user_id',user_id)
                var user=null;
                if(users.length>0){
                    user=($.grep(users,function(user){
                        return (user.friend==true)
                    }))[0]
                }
                console.log('user',user)
                var place=null;
                try{
                    place=Place.find(place_id)
                    console.log('place',place)
                }catch(e){
                    return true;
                }

                if(user&& place){
                    var chat=this.createUserChat(user,place);
                    this.createMessage(user_id,this.App.current_user.id,chat,body)
                }
            }
            return true;
        },
        createUserChat:function(user,place){
                    var chat=null;
                    var conversation=Conversation.findByAttribute('place_id',place.id)
                    if(!conversation){
                        conversation=this.createConversation(place)
                    }
                    var chats=Chat.findAllByAttribute('user_id',user.user_id)
                    console.log('chats',chats)
                    if(chats.length>0){
                        var chats$=$.grep(chats,function(chat){
                            console.log('chat.place_id',chat.place_id)
                            console.log('place_id',place.id)
                            return (chat.place_id==place.id)
                        })
                        chat=chats$[0]
                        console.log('chat.grep',chats$)
                    }
                    if(!chat){
                        chat=this.createChat(user,conversation,place)
                    }
                    console.log('chat',chat)
                    console.log('current_user_id',this.App.current_user.id)
                    console.log('chat_id',chat.id)
                    console.log('user',user.user_id)
                    return chat
        },
        onPresence: function (pres) {
            console.log(pres)
            var from = $(pres).attr('from');
            var type = $(pres).attr('type');
            var place=""
            if ((!type || type === 'unavailable')) {
                place=$(pres).find('place[xmlns="' +  this.App.NS_PLACE + '"]')
                var user=$(pres).find('user[xmlns="' +  this.App.NS_USER + '"]')
                if(user){
                    user=CheckinUser.create({
                       user_id:user.attr('id'),
                       user_name:user.attr('name'),
                       user_avatar:user.attr('image'),
                       friend:user.attr('friend'),
                       place_id: place.attr('id'),
                       options:{prepend:true}
                    })
                } /**
                console.log('user',user)
                var place_id=$(place).attr('id');
                try{
                    place=Place.find(place_id)
                    console.log('place',place)
                }catch(e){
                    return true;
                }
                if(user && place) {
                    if (type === 'unavailable' ) {

                    } else {
                        this.createUserChat(user,place);
                    }
                }**/
            }
            return true;
        },
        success:function(data){
            this.hideProgress();
        },

        error:function(data){
            this.hideProgress()
            showNotification({
                message: "sending failed,please try again",
                type: "error"
            });
            console.log(data)
        },

        showProgress:function(){
            this.hideProgress()
            var progress=$("#progress-tmpl").tmpl({
                message:"please wait..."
            });
            progress.appendTo(this.content);
        },

        hideProgress:function(){
            this.content.find('.progress').remove();
        },

        shouldScroll: function(){
            return ((this.el[0].scrollHeight - this.el.height()-this.el.scrollTop())<=0);

        },

        scrollToBottom: function(){
            this.document.scrollTop(
                this.el[0].scrollHeight
                );
        },

        scroll: function(callback){
            var shouldScroll = this.shouldScroll();
            console.log(shouldScroll)
            callback.apply(this);
            if (shouldScroll)
                this.scrollToBottom();
        },
        checkItem:function(item){
            if ( !this.chat) return false;
            return (item.chat_id===this.chat.id)
        },
        isCheckedIn:function(){
            var checkin=false
            if(Checkin.findByAttribute('spot_id',this.place.id)){
                checkin=true
            }
            return checkin
        }
    })
})


jQuery(function($){
    window.MessagesItem= Spine.Controller.create({
        proxied:["template","render", "remove"],
        template:function(data){
            return $("#chat-message-tmpl").tmpl({
                'message':data,
                current_user:this.current_user()
                })
        },
        init: function(){
            this.item.bind("update", this.render);
            this.item.bind("destroy", this.remove);
        },
        render:function(item){
            if (item) this.item = item;
            var elements = this.template(this.item )
            this.el.replaceWith(elements);
            this.el = elements;
            this.el.autolink();
            this.el.mailto();
            return this;
        },
        current_user:function(){
            if(this.App.current_user){
                return (this.App.current_user.id===this.item.sender_id)
            }
            else return false;
        },
        remove: function(){
            this.el.remove();
        }
    })
})


jQuery(function($){
    window.ChatReqController = Spine.Controller.create({
        elements:{
            '[data-role="content"]':'content'
        },
        events:{
            'submit .req-form':"sendRequest",
            'click .accept':'acceptReq' ,
            'click .decline':'declineReq',
            'click .cancel':'close'
        },
        proxied: ["render","template","showChatReq","showChatAccept","onDecline","onReq","onError","showProgress","hideProgress"],
        templateChatReq:function(){
            return $("#req-form-tmpl").tmpl(this.user)
        },
        templateChatAccept:function(){
            return $("#checkout-tmpl").tmpl(this.place)
        },
        init: function(){
            this.App.bind('show:Chat:Req',this.showChatReq);
            this.App.bind('show:Chat:Accept',this.showChatAccept);
        },
        showChatReq:function(user,place,succ,err){
            if(user.options){
                if(user.options.chat_request_pending )return;
            }
            this.place=place;
            this.user=user
            this.content.html(this.templateChatReq());
            this.submitBtn=this.content.find('.pry-btn')
            this.succ=succ;
            this.err=err;
            this.form=this.content.find('.req-form').trigger("create" );
            $.mobile.changePage("#"+this.el.attr('id'),'slide',false,true);
        },
        showChatAccept:function(user,succ,err,dec){
            this.user=user
            this.content.html(this.templateChatAccept());
            this.submitBtn=this.content.find('.pry-btn')
            this.declineBtn=this.content.find('.decline')
            this.btns=this.content.find('.btn')
            this.succ=succ;
            this.err=err;
            this.decline=dec;
            this.form=this.content.find('.req-acc-form').trigger("create" );
            $.mobile.changePage("#"+this.el.attr('id'),'pop',false,true);
        },
        sendRequest:function(){
            var user =this.user
            var place=this.place
            this.submitBtn.button('disable');
            this.showProgress("please wait...");
            this.onReq(user,place)
            return false;
            console.log(user)
        },

        onError:function(user){
            showNotification({
                message: "Failed,Please try again",
                type: "error"
            });
            if(this.err){
                this.err.call(null,user)
            }
            if(!this.checkUser(user))return
            this.hideProgress();
            this.btns.button('enable');

        },

        onReq:function(user,place,req){
            if(this.succ){
                this.succ.call(null,user,req)
            }
            user.options.chat_request_pending=true; //create chat request object
            this.App.trigger('update:item',user)
            if(!this.checkUser(user))return;
            this.hideProgress();
            this.close();
        },

        acceptReq:function(){
            var user =this.user
            this.submitBtn.button('disable');
            this.showProgress("please wait...");
            return false;
        },
        declineReq:function(){
            this.btns.button('disable');
            this.showProgress("please wait...");
            return false;
        },
        onDecline:function(user){
            if(this.decline){
                this.decline.call(null,user)
            }
            if(!this.checkUser(user))return
            this.hideProgress();
            this.btns.button('enable');
        },
        close:function(){
            this.el.dialog('close');
            return false;
        },
        showProgress:function(){
            this.hideProgress()
            var progress=$("#progress-tmpl").tmpl({
                message:"please wait..."
            });
            progress.appendTo(this.content);
        },
        hideProgress:function(){
            this.content.find('.progress').remove();
        },
        checkUser:function(user){
            if ( !this.user) return false;
            return this.user.id===user.id;
        }
        ,
        checkPlace:function(item){
            if ( !this.place ) return false;
            return this.place.id===item.id;
        }
    })
})



jQuery(function($){
    window.ChatReqItemController = Spine.Controller.create({
        proxied:["template","render","remove"],
        template:function(data){
            return $("#friend-req-item-tmpl").tmpl(data)
        },
        init: function(){
            this.item.bind("update", this.update);
            this.item.bind("destroy", this.remove);
        },
        update:function(){
            this.render();
            console.log('update')
            this.ul.listview('refresh');
        },
        render: function(item){
            if (item) this.item = item;
            console.log('friend_req',this.item)
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
    window.ConversationItem = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#conversation-tmpl").tmpl(data)
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
    window.ChatItem = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#chat-item-tmpl").tmpl(data)
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
    window.ChatList= Spine.Controller.create({
        elements:{
            ".fieldcontain.search":"searchEl",
            ".items":"itemsEl",
            ".items li.item":'item',
            ".progress":"progress",
            ".load":"load"
        },
        events:{
            'click .items li a':"click"
        },
        proxied:["render","addOne","show","addAll","change"],
        init: function(){
            Chat.bind("create",this.addOne)
            this.items=[];
            this.empty=false;
            this.App.bind('change:Conversation',this.change)
            this.App.bind('show:Conversation',this.show)
        },
        template: function(items){
        },
        addOne:function(item){
            if(!this.checkItem(item))return;
            try{
                var itemEl=ChatItem.init({
                    item:item,
                    ul:this.itemsEl
                    });
                this.itemsEl.append(itemEl.render().el).listview('refresh');
            }catch(e){}
        },
        change:function(conversation,callback){
            //console.log('conv',conversation)
            this.conversation=conversation
            this.render();
            if(callback)callback.call(null)

        },
        show:function(conversation){
            this.change(conversation,this.render);
        },
        showProgress:function(obj){
            this.hideProgress();
            var progress=$("#progress-tmpl").tmpl(obj);
            progress.appendTo(this.el);
        },

        hideProgress:function(){
            this.el.find('.progress').remove();
        },

        render:function(){
            this.showProgress();
            $.mobile.changePage("#"+this.el.attr('id'),'slide',false,true);
            this.searchEl.hide();
            this.itemsEl.empty();
            this.items=Chat.findAllByAttribute('conversation_id',this.conversation.id);
            this.addAll()
            this.hideProgress();
        },
        addAll:function(){
            $.each(this.items,this.proxy(function(i){
                this.addOne(this.items[i])
            }) )

        },

        click:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            this.itemsEl.find('li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            this.current.addClass("active");
            this.currentAnchor.focus()
            var id= this.current.attr("id")
            var item=null;
            try{
                item= this.model.find(id)
            }catch(e){
                item = this.items[this.current.index()]
            }
            this.App.trigger(this.currentAnchor.attr("data-action"),item)
            return false;
        },
        checkItem:function(item){
            if ( !this.conversation ) return false;
            return this.conversation.id===item.conversation_id;
        }
    })
})