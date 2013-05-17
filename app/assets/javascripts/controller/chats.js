//= require strophe/base64
//= require strophe/md5
//= require strophe/core
//= require model/chat
//= require controller/tab
jQuery(function($){
    window.Chats = Spine.Controller.create({
        elements:{
            ".items":"itemsEl",
            ".items .item":'handler'
        },
        events:{
            "click .items li":"doAction"
        },
        proxied:["render","addOne","show","addAll","desc","updateUI","onError","refresh","scroll","onCreate"],
        init: function(){
            Conversation.bind('create',this.onCreate)
            $(document).on("resize",this.render)
            this.App.bind("chat:updateUI",this.updateUI)
            this.App.bind("chats:show",this.show)
            this.prefetched=false;
            this.jsp=$(this.el).addScrollExtension()
            this.contentPane=  this.el.find('.jspPane')
            this.conversations=[]
            this.chatControllers={}
        },
		onCreate:function(conversation){
			this.conversations.push(conversation)
			this.conversations.sort(this.desc)
            //this.addAll(this.conversations)
		},
        addOne:function(conversation){
            console.log("conversation",conversation)
			try{
			  if(this.contentPane.length>0){
                        // console.log("jsp",this.jsp)
                        var contentPane=this.jsp.getContentPane()
                        this.itemsEl=contentPane.find('ul.items')
                        var itemEl=this.getChatController(conversation)
                        if(!itemEl){
                            itemEl=this.createController(conversation);
                        }
                        this.itemsEl.append(itemEl.render().el);
                        this.jsp.reinitialise()
                        this.jsp.addHoverFunc();
                        return
                    }else{
                        var itemEl=this.getChatController(conversation)
                        if(!itemEl){
                            itemEl=this.createController(conversation);
                        }
                        this.itemsEl.append(itemEl.render().el);
                        return
                    }
             }catch(e){
				console.log(e)
			}   

        },
        show:function(){
            this.render();
        },
        updateUI:function(){
            if(this.jsp){
                this.jsp.reinitialise()
                this.jsp.addHoverFunc();
            }
            console.log("updated messageAlertUI")
        },
        emptyList:function(){
            this.contentPane=this.el.find('.jspPane')
            if(this.contentPane.length>0){
                this.contentPane.empty()
            } else{
                this.el.empty();
            }
        },
        template:function(){
        },
        render:function(){
            this.itemsEl.empty();
            this.conversations=Conversation.all()
            console.log("latest_messages",this.conversations)
            if(this.conversations.length>0) {
                this.conversations.sort(this.desc)
                this.addAll(this.conversations)
            }
        },
        showProgress:function(msg){
            this.hideProgress();
            this.progress=$("#chat-load-tmpl").tmpl(msg)
            this.progress.appendTo(this.el);
        },
        showError:function(msg){
            this.hideError();
            this.errorMessage= $("#chat-error-alert-tmpl").tmpl(msg)
            this.errorMessage.appendTo(this.el);
        },
        hideError:function(){
            if(this.errorMessage)this.errorMessage.remove();
        },
        addAll:function(items){
            $.each(items,this.proxy(function(i){
                this.addOne(items[i])
            }) )
        },
        desc:function(a,b){
            if(a.last_active_time> b.last_active_time){
                return -1;
            }else if(a.last_active_time< b.last_active_time){
                return 1
            }else{
                return 0
            }
        },
        onError:function(error){
            console.log('error',error)
            this.hideProgress();
            this.hideLoadProgress();
            this.prefetching=false;
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            //this.itemsEl.find('li.item .actions li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            //this.current.addClass("active");
            var action=this.current.data("action");
            var conversation=Conversation.find(this.currentAnchor.attr("id"))
            console.log("action",action)
            this.App.trigger(action,conversation)
            return false;
        },
        getChatController:function(conversation){
            return this.chatControllers[conversation.id]
        },
        createController:function(conversation){
            var controller=ChatItemController.init({item:conversation});
            this.chatControllers[conversation.id]=controller
            return controller
        },
		getConversation:function(user_id,created_by_local_user){
			var conversation = Conversation.findByAttribute("user_id",user_id)
			if(conversation){
				return conversation
			}else{	
				return conversation=Conversation.create(
	                {
	                    user_id:user_id,
	                    messages:[],
	                    last_shown_time:new Date(),
	                    initiated_by_local_user:created_by_local_user,
	                    visible:false
	                }
	            )	
			}
		}
    })
})

jQuery(function($){
    window.ChatItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
           return $("#chat-item-tmpl").tmpl(data)
        },
		templateInfoBody:function(data){
           return $("#chat-info-tmpl").tmpl(data)
        },
        templateIndicator:function(data){
           return $("#indicator-tmpl").tmpl(data)
        },
        init: function(){
            this.item.bind("update", this.update);
            this.item.bind("destroy", this.remove);
            this.cached=false;
        },
        update:function(item){
            if(this.item.id==item.id){
            this.item =item
		    if(this.item.notification){
			this.setDateTime(this.item)
			this.infoBodyEl=this.el.find(".info-body")
			this.infoBodyEl.html(this.templateInfoBody(this.item))
            this.indicatorEl=this.infoBodyEl.find(".indicator")
            this.indicatorEl.html(this.templateIndicator(this.item))
		    }
            }
            //this.times.text(this.item.last_active_formatted_time)
            //this.render();
        },

        render: function(item){
            if (item) this.item = item;
            if(!this.cached){
                var elements = this.template(this.item);
                this.el.replaceWith(elements);
                this.el = elements;
		        this.setDateTime(this.item)
				this.infoBodyEl=this.el.find(".info-body")
				this.infoBodyEl.html(this.templateInfoBody(this.item))
                this.indicatorEl=this.infoBodyEl.find(".indicator")
                this.indicatorEl.html(this.templateIndicator(this.item))
                this.cached=true
            }
            return this;
        },
        remove: function(){
            this.el.remove();
        },
		setDateTime:function(data){
			console.log("data to set time",data)
           data.notification.formattedTime=data.notification.date.toString("hh:mm tt")
           data.notification.formattedDate=data.notification.date.toString("d-MMM-yyyy")			
		}
    })
})

jQuery(function($){
    window.Contacts= Spine.Controller.create({
        elements:{
            ".items":"itemsEl",
            ".items .item":'handler',
            ".progress":"progress",
            ".load":"load",
            ".tree":'tree',
            ".tree .admins":"adminsEl",
            ".tree .members":"membersEl",
            ".tree li .toggle-admin":"toggleAdmin"
        },
        events:{
            "click .alert-container .alert .close":"hideError",
            "click .items li":"doAction",
            "toggle a.tree-parent":"updateUI"
        },
        proxied:["render","addOne","show","addAll","updateUI","prefetchComplete","onError","refresh","scroll","onCreate"],
        init: function(){
            Contact.bind('create',this.onCreate)
            $(document).on("resize",this.render)
            this.App.bind("chat:updateUI",this.updateUI)
            this.prefetched=false;
            console.log("connection",this.App.connection)
            this.jsp=$(this.el).addScrollExtension()
            this.contentPane=  this.el.find('.jspPane')
            this.contacts=[]
            this.contactControllers={}
        },
        onCreate:function(contact){
           contact.setAvatar()
           this.contacts.push(contact)
           this.addOne(contact)
        },
        addOne:function(contact){
            console.log("contact",contact)
            try{
                if(this.contentPane.length>0){
                    // console.log("jsp",this.jsp)
                    var contentPane=this.jsp.getContentPane()
                    this.itemsEl=contentPane.find('ul.items')
                    var itemEl=this.getContactController(contact)
                    if(!itemEl){
                        itemEl=this.createController(contact);
                    }
                    this.itemsEl.append(itemEl.render().el);
                    this.jsp.reinitialise()
                    this.jsp.addHoverFunc();
                    return
                }else{
                    var itemEl=this.getContactController(contact)
                    if(!itemEl){
                        itemEl=this.createController(contact);
                    }
                    this.itemsEl.append(itemEl.render().el);
                    return
                }
            }catch(e){
                console.log(e)
            }
        },
        show:function(){
            console.log("render")
            if(!this.prefetched){
                 this.render();
            }
        },
        updateUI:function(){
           if(this.jsp){
               this.jsp.reinitialise()
               this.jsp.addHoverFunc();
           }
            console.log("updated contactUI")
        },
        template:function(){
          return $("#chat-tree-tmpl").tmpl()
        },
        emptyList:function(){
            this.contentPane=this.el.find('.jspPane')
            if(this.contentPane.length>0){
                this.contentPane.empty()
            } else{
                this.el.empty();
            }
        },
        template:function(){
        },
        render:function(){
            this.itemsEl.empty();
            if(this.contacts.length>0) {
                this.addAll(this.contacts)
            }else{
                this.contacts=Contact.all()
                if(this.contacts.length>0) {
                    this.addAll(this.contacts)
                }
            }
        },
        test:function(){
            var items=Contact.fakeItem()
            $.each(items,this.proxy(function(i){
                Contact.create(items[i])
            }) )
        },
        hideProgress:function(){
            if(this.progress)this.progress.remove();
        },
        showProgress:function(msg){
            this.hideProgress();
            this.progress=$("#chat-load-tmpl").tmpl(msg)
            this.progress.appendTo(this.el);
        },
        showError:function(msg){
               this.hideError();
               this.errorMessage= $("#chat-error-alert-tmpl").tmpl(msg)
               this.errorMessage.appendTo(this.el);
        },
        hideError:function(){
            if(this.errorMessage)this.errorMessage.remove();
        },
        loadMore:function(){
            if(!this.prefetching){
                //this.showLoadProgress();
                this.prefetch();
            }
        },
        addAll:function(items){
            $.each(items,this.proxy(function(i){
                this.addOne(items[i])
            }) )
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            //this.itemsEl.find('li.item .actions li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            //this.current.addClass("active");
            action=this.current.data("action");
            contact=Contact.find(this.currentAnchor.attr("id"))
            console.log(action,contact)
            this.App.trigger(action,contact,{show:true,created_by_local_user:false})
            return false;
        },
        getContactController:function(contact){
            return this.contactControllers[contact.id]
        },
        createController:function(contact){
            var controller=ContactItemController.init({item:contact});
            this.contactControllers[contact.id]=controller
            return controller
        }
    })
})

jQuery(function($){
    window.ContactItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#contact-item-tmpl").tmpl(data)
        },
        init: function(){
            this.item.bind("update", this.update);
            this.item.bind("destroy", this.remove);
            this.cached=false;
        },
        update:function(){
            this.render();
        },
        render: function(item){
            if(!this.cached){
                if (item) this.item = item;
                var elements = this.template(this.item);
                this.el.replaceWith(elements);
                this.el = elements;
                this.cached=true
            }
            return this;
        },
        remove: function(){
            this.el.remove();
        }
    })
})

jQuery(function($){
    window.ConferenceController= Spine.Controller.create({
        elements:{
            '.header':'header',
            '.content':"content",
            '.footer':'footer',
            '.chat-message-view':'chatMessageView',
            ".footer .chat-input input": "input",
            ".items":"itemsEl",
            ".items .item":'handler'
        },
        events:{
            "click .send":"send",
            "keydown .footer .chat-input input": "checkCreateMessage"

        },
        proxied:["render","addOne","show","addAll","updateUI","prefetchComplete","onError","refresh","scroll","onNewMessage","onMessage","updateUI"],
        init: function(){
            this.App.connection.addHandler(this.onMessage,null, "message","groupchat");
			Message.bind("create",this.onNewMessage)
			this.App.bind("chat:updateUI",this.updateUI)
            this.App.bind("message:group:new",this.onNewMessage)
            $(document).on("resize",this.render)
            this.prefetched=false;
            this.messages=[]
            this.messageControllers={}
			this.updateUI()
        },
        onNewMessage:function(message){
            if(message.type!=Message.MESSAGE_TYPE.GROUP_CHAT)return
			message.assertFrom();
            if(!this.App.isCurrentUser(message.from)){
                //this.conversation.onMessage(message)
            }
            this.addOne(message)
        },
        addOne:function(message){
            if(!this.checkMessage(message))return;
	       	this.messages.push(message)
            this.scroll(function(){
	            var itemEl=this.getMessageController(message)
                 if(!itemEl){
                     itemEl=this.createController(message);
                 }
                this.itemsEl.append(itemEl.render().el);
            });
            console.log("this.itemsEl",this.itemsEl)
        },
        show:function(){
            this.render()
        },
        template:function(){
        },
        render:function(){
            this.itemsEl.empty();
            if(this.messages.length>0) {
                this.addAll(this.messages)
            }
        },
        addAll:function(items){
            $.each(items,this.proxy(function(i){
                this.addOne(items[i])
            }) )
        },
        checkMessage:function(message){
            if(message.type==Message.MESSAGE_TYPE.GROUP_CHAT){
                return true
            } else{
                return false;
            }
        },
        onMessage:function(msg){
            console.log('received group',msg)
            var from=$(msg).attr('from')
            var branch_id = Strophe.getNodeFromJid(from);
			console.log('branch_id',branch_id)
			console.log('this.App.branch.id',(this.App.branch==branch_id))
            if(branch_id==this.App.branch.id){
                var user_id=Strophe.getResourceFromJid(from)
                console.log('user_id',user_id)
                var body = $(msg).children("body");
                var msg=Message.create({
                    from_id:user_id,
                    to_id:this.App.user.user_id,
                    to:this.App.user,
                    body:body.text(),
                    html:null,
                    type:Message.MESSAGE_TYPE.GROUP_CHAT,
                    date:new Date()
                })
            }
            $('#chatAudio')[0].play();
            return true;
        },
        checkCreateMessage:function(e){
            if (e.which == 13 && !e.shiftKey) {
                this.createMessage();
                return false;
            }
        },
        send:function(){
			this.createMessage();
		},
        createMessage:function(){
            var value = this.input.val().trim();
            if ( !value ) return false;
            var msg=Message.create({
                from_id:this.App.user.user_id,
                from:this.App.user,
                to_id:this.App.branch.id,
                body:value,
                html:null,
                type:Message.MESSAGE_TYPE.GROUP_CHAT,
                date:new Date()
            })
            this.input.val("");
            this.scroll()
            this.sendMessage(msg)
        },
        sendMessage:function(msg){
            this.App.connection.send( $msg({
                to: this.App.BRANCH_JID,
                type: "groupchat"}).c("body").t(msg.body));
                 console.log("sendMessage",msg)
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            //this.itemsEl.find('li.item .actions li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            //this.current.addClass("active");
            var  action=this.current.data("action");
            console.log("action",action)
            var message=Message.find(this.currentAnchor.attr("id"))
            this.App.trigger(action,message,this.current)
            return false;
        } ,
        isScrolledToBottom: function(){
            var scrollBottom  =this.chatMessageView[0].scrollHeight -
                this.chatMessageView.scrollTop() -
                this.chatMessageView.outerHeight();
            return scrollBottom == 0;
        },

        scrollToBottom: function(){
		  this.chatMessageView.animate({"scrollTop": this.chatMessageView[0].scrollHeight}, "slow");
			/**
            this.chatMessageView.scrollTop(
                this.chatMessageView[0].scrollHeight
            );**/
        },
        scroll: function(callback){
            var shouldScroll = this.isScrolledToBottom();
            console.log("shouldScroll",shouldScroll)
            if(callback)callback.apply(this);
            if (shouldScroll)
                this.scrollToBottom();
        },
        getMessageController:function(message){
            return this.messageControllers[message.id]
        },
        createController:function(message){
            var controller=ChatMessageItemController.init({
                item:message
            });
            this.messageControllers[message.id]=controller
            return controller
        },
        activate:function(){
            console.log("activating...Group Conversation")
			this.scrollToBottom()
        },
        deActivate:function(){
            console.log("de-activating...Group Conversation")
        },    
		updateUI:function(){
	            console.log("updateConversationItemUI")
	            this.headerH=this.header.outerHeight();
	            this.footerH=this.footer.outerHeight();
	            var elH=this.el.parent().height()
	            var paddingTop=this.headerH+1;
	            this.contentH=elH-paddingTop-this.footerH
	            console.log("updateConversationItemUI",elH)
	            this.content.css({
	                'height':this.contentH+"px",
	                "padding-top":paddingTop+"px",
	                "padding-bottom":this.footerH+"px"
	            })
                this.chatMessageView.css({
                    'height':this.contentH+"px"
                })
	        }
    })
})

jQuery(function($){
    window.ChatMessages= Spine.Controller.create({
        elements:{
            ".items":"itemsEl",
            ".items .item":'handler'
        },
        events:{
            "click .items li":"doAction"
        },
        proxied:["render","addOne","show","addAll","updateUI","prefetchComplete","onError","refresh","scroll","onNewMessage"],
        init: function(){
            this.App.bind("message:chat:new",this.onNewMessage)
			Message.bind("create",this.onNewMessage)
            $(document).on("resize",this.render)
            this.prefetched=false;
            //this.jsp=$(this.el).addScrollExtension()
            //this.contentPane=  this.el.find('.jspPane')
            this.messages=[]
			this.messageControllers={}
        },
		onNewMessage:function(message){
            if(message.type!=Message.MESSAGE_TYPE.CHAT) return;
			message.assertFrom();
            if(!this.App.isCurrentUser(message.from)){
                this.conversation.onMessage(message)
            }
       		this.addOne(message)
        },
        addOne:function(message){
            if(!this.checkMessage(message))return;
	       	this.messages.push(message)
            this.scroll(function(){
	            var itemEl=this.getMessageController(message)
                 if(!itemEl){
                     itemEl=this.createController(message);
                 }
                this.itemsEl.append(itemEl.render().el);
            });
            console.log("this.itemsEl",this.itemsEl)
        },
        show:function(){
            console.log("showChatMessages")
            this.render()
        },
        updateUI:function(){
            console.log("update chatui")
            this.scrollToBottom();
        },
        template:function(){
        },
        render:function(){
            /**
            this.itemsEl.empty();
            if(this.messages.length>0) {
                this.addAll(this.messages)
            }else{
                this.messages=Message.all()
                if(this.messages.length>0) {
                    this.addAll(this.messages)
                }
            }
             ***/
        },
        addAll:function(items){
		   $.each(items,this.proxy(function(i){
                this.addOne(items[i])
            }) )
        },
        checkMessage:function(message){
           if(message.type==Message.MESSAGE_TYPE.CHAT){
                return (this.conversation.id==message.conversation_id)
           } else{
               return false;
           }
        },
        doAction:function(ev){
            this.currentAnchor=$(ev.currentTarget);
            //this.itemsEl.find('li.item .actions li.active').removeClass('active')
            this.current= $(ev.currentTarget).closest('li');
            //this.current.addClass("active");
            var action=this.current.data("action");
            console.log("action",action)
            return false;
        } ,
        isScrolledToBottom: function(){
            var scrollBottom  =this.el[0].scrollHeight -
                this.el.scrollTop() -
                this.el.outerHeight();
            return scrollBottom == 0;
        },

        scrollToBottom: function(){
            this.el.scrollTop(
                this.el[0].scrollHeight
            );
        },
        scroll: function(callback){
            var shouldScroll = this.isScrolledToBottom();
            console.log("shouldScroll",shouldScroll)
            if(callback)callback.apply(this);
            if (shouldScroll)
                this.scrollToBottom();
        },
        getMessageController:function(message){
            return this.messageControllers[message.id]
        },
        createController:function(message){
	        var controller=ChatMessageItemController.init({
                 item:message
             });
            this.messageControllers[message.id]=controller
            return controller
        }
    })
})

jQuery(function($){
    window.ChatMessageItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
           data.isCurrentUser=(this.App.isCurrentUser(data.from))?true:false
           data.formattedTime=data.date.toString("hh:mm tt")
           data.formattedDate=data.date.toString("d-MMM-yyyy")
            console.log("render",data)
            return $("#chat-message-tmpl").tmpl(data)
        },
        init: function(){
            this.item.bind("update", this.update);
            this.item.bind("destroy", this.remove);
        },
        update:function(){
            this.render();
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
    window.ChatVideoController = Spine.Controller.create({
        elements:{
            '.call':"call",
            '.local':"localWrap",
            '.localVideo':"localVideo",
            ".remote":"remoteWrap",
            '.remote video':"remoteVideoEl",
            '.remote .mini':"miniWrap",
            '.remote .mini video':"miniVideo",
            '.video-call-view':'videoCallView',
            ".video-call-state":"callViewStates",
            ".video-call-state.invite":"callInviteView",
            ".video-call-state.offer":"callOfferView",
            ".video-call-state.answer":"callAnswerView",
            ".video-call-state.live":"callLiveView",
            ".video-status-bar .message":"statusMessageEl",
			".video-status-bar .error_container":"errorContainer",
			".accept":"acceptBtn",
			".reject":"rejectBtn",
			".cancel":"cancelBtn"
        },
        events:{
            'click .call':"startVideoCall",
            "click .accept":"acceptCall",
            "click .reject":"rejectCall",
            "click .cancel":"cancelCall",
			"click .hang-up":"hangUp"
        },
        proxied:["render","onUserMediaSuccess","streamCreatedHandler","sessionConnectedHandler","connectionDestroyedHandler","connectionCreatedHandler","streamDestroyedHandler","onCallInit","onCallInitUpError","exceptionHandler","onNewCall","onAccept","onReject","onTerminate"],
        template:function(data){
            data.isCurrentUser=(this.App.isCurrentUser(data.from))?true:false
            console.log("render",data)
            return $("#chat-message-tmpl").tmpl(data)
        },
        init: function(){
          this.isVideoMuted = false;
          this.isAudioMuted = false;
          this.initiator=false;
          this.started = false;
          this.UNINITIALIZED=0;
          this.INITIALIZING=1;
          this.INITIALIZED=2;
          this.CONNECTING=3;
          this.CONNECTED=4;
          this.state=this.UNINITIALIZED
          this.App.bind("call:new",this.onNewCall);
          this.App.bind("call:accept",this.onAccept);
          this.App.bind("call:reject",this.onReject);
          this.App.bind("call:terminate",this.onTerminate);
		  TB.addEventListener("exception", this.exceptionHandler);
        },
        activate:function(){
            console.log("activate conversation for ",this.conversation)
            this.el.addClass('active')
            if(this.conversation.call){

            }else{
                 this.showInvite()
            }
        },
        shouldShow:function(){
          var  shouldShow=false;
          if(this.conversation.call){
              shouldShow=true;
          }else{
              shouldShow=false;
          }
          return  shouldShow
        },
        startVideoCall:function(ev){
            this.initiator=true
            this.doInitialize();
        },
        doInitialize:function(){
        	this.state=this.INITIALIZING;
			this.setStatus($("#_status-tmp").tmpl({message:"Please wait..."}));
			this.App.connection.sendIQ( $iq({
                to: this.App.BRANCH_JID ,type:"set"})
                .c("call-init", {xmlns:this.App.NS_CALL_SETUP,caller_id:this.App.user.user_id,callee_id:this.conversation.user_id}),
                this.proxy(function(iq){
                    var callSetUP = $(iq).children("call-setup");
                    this.sid=callSetUP.attr("sid")
                    this.token=callSetUP.attr("token")
                    this.doOffer();
                    console.log("sid",this.sid)
                    console.log("token",this.token)
                }),
                this.proxy(function(iq){
                    this.reset();
                    this.showError("failed to initialize stream")
                })
            );
            //this.showOffer();
            //this.testCallSetup();
        },
        testCallSetup:function(){
            this.sid="9999999"
            var token="ubjgjbjgbkgkbkgkbkg"
            this.opentokSession = TB.initSession(this.sid);
            console.log("test session",this.opentokSession)
            this.opentokSession.connect(this.App.OPENTOK_API_KEY, token);
        },
        initTB:function(sid,token){
            this.state=this.CONNECTING;
            this.opentokSession = TB.initSession(sid);
            this.opentokSession.addEventListener('sessionConnected',this.sessionConnectedHandler);
            this.opentokSession.addEventListener('streamCreated',this.streamCreatedHandler);
            this.opentokSession.addEventListener('streamDestroyed',this.streamDestroyedHandler);
			this.opentokSession.addEventListener("connectionCreated", this.connectionCreatedHandler);
			this.opentokSession.addEventListener("connectionDestroyed",this.connectionDestroyedHandler);
            this.opentokSession.connect(this.App.OPENTOK_API_KEY,token);
        },
        doOffer:function(){
			//this.setStatus("waiting...");
            this.conversation.call=Call.init(
                {
                 sid:this.sid,
                 token:this.token,
                 initiated_by_local_user:true,
                 callee_id:this.conversation.user_id,
                 ot_session:this.opentokSession,
                 state:Call.STATE.OFFER,
                 conversation_id:this.conversation.id
                })
        },
        onNewCall:function(call){
			console.log("new-call",call)
			if(!this.el.hasClass("active"))
			this.conversationController.showVideo()
            this.state=this.INITIALIZING;
            if(call.caller_id===this.conversation.user_id){
                this.conversation.call=call
	            var msg=Message.create({
	                    from_id:this.conversation.user_id,
						from:this.conversation.user,
						to_id:this.App.user.user_id,
						conversation_id:this.conversation.id,
	                    to:this.App.user,
	                    body:"new video call",
						html:null,
	                    type:"video",
	                    date:new Date()
	             })
	            this.conversation.onMessage(msg)
				this.App.trigger("chats:show")
				console.log("onNewCall",this.conversation)
                this.sid=call.sid
                this.token=call.token
                this.videoCallView.empty();
                this.showAnswer();
            }
        },
        showInvite:function(){
            //this.videoCallView.html($("#invite-tmpl").tmpl())
			this.setStatus($("#invite-tmpl").tmpl());
        },
        showAnswer:function(){
           //this.videoCallView.html($("#answer-tmpl").tmpl())
			this.setStatus($("#answer-tmpl").tmpl());
        },
        showOffer:function(){
            this.callViewStates.hide();
            this.callOfferView.show();
        },
        showLive:function(){
            this.videoCallView.html($("#live-tmpl").tmpl());

        },
        showError:function(message){
           var tmpl= $("#error-tmpl").tmpl({message:message})
           this.errorContainer.html(tmpl)
        },
        acceptCall:function(){
        	//if(this.acceptBtn.hasClass("disabled"))return;
			//console.log("this.acceptBtn",this.acceptBtn)
			//this.disableAnswerButtons();
			this.setStatus($("#_status-tmp").tmpl({message:"Please wait..."}));
            this.App.connection.sendIQ( $iq({
                to: this.App.BRANCH_JID ,type:"set"})
                .c("call-accept", {xmlns:this.App.NS_CALL_SETUP,sid:this.sid}),
                this.proxy(function(iq){
                    //SHOW CALL
				    console.log("onAccept",this.App.user.id)
                    this.state=this.INITIALIZED;
                    this.initTB(this.sid,this.token)
					this.setStatus("");
                    this.showLive()
                }),
                this.proxy(function(iq){
					console.log("accept error",iq)
                    this.reset();
                    this.showError("failed to connect")
                 })
            );
            console.log("acceptCall")
        },
        rejectCall:function(){
		    this.setStatus("Rejecting...");
            this.App.connection.sendIQ( $iq({
                to: this.App.BRANCH_JID ,type:"set"})
                .c("call-reject", {xmlns:this.App.NS_CALL_SETUP,sid:this.sid}),
                this.proxy(function(iq){
					this.reset();
                }),
                this.proxy(function(iq){
					console.log("error reject",iq)
					this.reset();
                })
            );
        },
        cancelCall:function(){
            console.log("cancelCall")
            this.el.find('.cancel').button('loading')
			this.terminateCall();
        },
        terminateCall:function(){
            this.App.connection.sendIQ( $iq({
                to: this.App.BRANCH_JID ,type:"set"})
                .c("call-terminate", {xmlns:this.App.NS_CALL_SETUP,sid:this.sid}),
                this.proxy(function(iq){
					this.reset();
                }),
                this.proxy(function(iq){
					console.log("error terminate",iq)
					this.reset();
                })
            );

            
        },
        onAccept:function(sid){
            if(this.sid===sid){
				console.log("onAccept",this.App.user.id)
                this.state=this.INITIALIZED;
                this.initTB(this.sid,this.token)
                this.showLive()
            }
        },
        onReject:function(sid){
            if(this.sid===sid){
				console.log("onReject",this.App.user.id)
				this.reset();
                this.showError("call cancelled")
            }
        },
        onTerminate:function(sid){
            if(this.sid===sid){
				console.log("onTerminate",this.App.user.id)
				this.reset();
                this.showError("call Terminated")
            }
        },
        sessionConnectedHandler:function(event){
            this.state=this.CONNECTED;
	        this.showLive();
			var publisher = TB.initPublisher(this.App.OPENTOK_API_KEY, 'mirror',{
				height:"40%",
				width:"40%"
			});
            this.opentokSession.publish(publisher);
			this.subscribeToStreams(event.streams);
			//send invitaion to remote peer
	    },
        streamCreatedHandler:function(event){
	      // Subscribe to any new streams that are created
		  this.subscribeToStreams(event.streams);
        },
		sessionDisconnected :function(event){
			console.log("local peer hung up by disconnecting, need to clean up, notify server")
			this.terminateCall();
			this.reset();
		},
		connectionCreatedHandler:function(event){
			
		},
		connectionDestroyedHandler:function(event){
			var reason=event.reason;
			console.log("Reason",reason)
		},
		streamDestroyedHandler:function(event){
            this.reset();
            this.showError("Remote peer hung up")
			this.terminateCall()			
		},
		connectionDestroyed:function(event){
			console.log("remote peer hung up,just reset, remote peer notifies the server")
			this.reset();
		},
		exceptionHandler:function(event){
            var target=event.target
            if(target.sessions[this.sid]){
                switch(this.state) {
                    case this.CONNECTING:
                        this.reset();
                        this.showError("Connection failed")
						this.terminateCall()
                        break;
                }
            };
		},
		subscribeToStreams:function(streams){
			for (var i = 0; i < streams.length; i++) {
			    // Make sure we don't subscribe to ourself
			    if (streams[i].connection.connectionId == this.opentokSession.connection.connectionId) {
			      return;
			    }

			    // Create the div to put the subscriber element in to
			    // Subscribe to the stream
			    console.log("Subscribe to the stream")
			    this.opentokSession.subscribe(streams[i],"remote",
					{
						height:"100%",
						width:"100%"
					}	
			    );
			  }
			console.log("at this point it is believed that both peers are connected")
			this.setStatus("");	
		},
		hangUp:function(){
            this.el.find('.hang-up').button('loading')
			if(this.opentokSession.connection){
				this.opentokSession.disconnect();
			}
            this.terminateCall()
		},
        setStatus:function(status){
            this.statusMessageEl.html(status)
        },
        deActivate:function(){
            this.el.removeClass('active')
        },
        reset:function(){
            this.isVideoMuted = false;
            this.isAudioMuted = false;
            this.initiator=false;
            this.started = false;
            this.state=this.UNINITIALIZED;
			this.sid=null
            this.call.button("reset")
			this.cancelBtn.button("reset")
            this.conversation.call=null
			this.enableAnswerButtons()
			this.setStatus("");
			this.videoCallView.empty();
			this.showInvite()
			this.opentokSession=null
        },
		disableAnswerButtons:function(){
			this.acceptBtn.addClass('disabled')
			this.rejectBtn.addClass('disabled')	
		},
		enableAnswerButtons:function(){
			this.acceptBtn.removeClass('disabled')
			this.rejectBtn.removeClass('disabled')	
		}
    })
})

jQuery(function($){
    window.ConversationController = Spine.Controller.create({
        elements:{
            '.header':'header',
            '.content':"content",
            '.footer':'footer',
            '.chat-message-view':'chatMessageView',
            '.chat-video-view':'chatVideoView',
            ".footer .chat-input input": "input",
            ".videoOp":"videoToggle"
        },
        proxied:["remove","render","updateUI","toggleFaceTimeVideo"],
        events:{
            "click .facetime-video-toggle":"toggleFaceTimeVideo",
            "keydown .footer .chat-input input": "checkCreateMessage",
            "click .send":"send"
        },
        template:function(data){
            return $("#conversation-tab-pane-tmpl").tmpl(data)
        },
        init: function(){
            this.updateUI()
            this.chatMessages = ChatMessages.init({el:this.chatMessageView,conversationController:this,conversation:this.conversation})
            this.videoController=ChatVideoController.init({el:this.chatVideoView,conversationController:this,conversation:this.conversation})
            //this.App.bind("deactivate")
        },
        activate:function(){
            console.log("activating...",this.conversation)
            this.showConversation();
            this.conversation.onShow()
        },
        deActivate:function(){
            this.conversation.onHide()
        },
        showConversation:function(){
            this.chatMessages.show()
            if(this.videoController.shouldShow()){
				this.showVideo();
            }
        },
        checkCreateMessage:function(e){
            if (e.which == 13 && !e.shiftKey) {
                this.createMessage();
                return false;
            }
        },
        send:function(){
			this.createMessage();
		},
        createMessage:function(){
          var value = this.input.val().trim();
          if ( !value ) return false;
          var msg=Message.create({
                from_id:this.App.user.user_id,
				from:this.App.user,
				to_id:this.conversation.user_id,
                to:this.conversation.user,
                conversation_id:this.conversation.id,
                body:value,
                html:null,
                type:"chat",
                date:new Date()
            })
         this.input.val("");
         this.sendMessage(msg)
        },
        sendMessage:function(msg){
            this.App.connection.send( $msg({
                to: this.App.BRANCH_JID + '/' + this.conversation.user.user_id,
            type: "chat"}).c("body").t(msg.body));
           console.log("sendMessage",msg)
        },
        updateUI:function(){
            console.log("updateConversationItemUI")
            this.headerH=this.header.outerHeight();
            this.footerH=this.footer.outerHeight();
            var elH=this.el.parent().height()
            var paddingTop=this.headerH+1;
            this.contentH=elH-paddingTop-this.footerH
            console.log("updateConversationItemUI",elH)
            this.content.css({
                'height':this.contentH+"px",
                "padding-top":paddingTop+"px",
                "padding-bottom":this.footerH+"px"
            })
            this.updateContentPane()
        },
        updateContentPane:function(){
          if(this.chatVideoView.hasClass('active')){
                var videoHeight=180
                var messageHeight=this.contentH-videoHeight
                this.chatVideoView.css({
                    'height':videoHeight+"px"
                })
                this.chatMessageView.css({
                    'height':messageHeight+"px"
                })
            }else{
                this.chatMessageView.css({
                    'height':this.contentH+"px"
                })
            }
            if(this.chatMessages)
                this.chatMessages.updateUI()
        },
        toggleFaceTimeVideo:function(ev){
            console.log("toggleFaceTimeVideo",ev)
            var target=$(ev.currentTarget).closest("li");
            //this.itemsEl.find('li.item .actions li.active').removeClass('active')
            if(this.videoToggle.hasClass('active')){
                this.videoToggle.removeClass('active')
                this.videoController.deActivate()
            }else{
                this.videoToggle.addClass('active')
                this.videoController.activate()
            }
            this.updateContentPane()
        },
		showVideo:function(){
            this.videoToggle.addClass('active')
            this.videoController.activate() ;
            this.updateContentPane()
		}
    })
})
jQuery(function($){
    window.ConversationNavController = Spine.Controller.create({
        elements:{
            ".conversation-tab-view":"tabView",
            ".conversation-tab-view .conversation-tab-nav":'conversationNav',
            '.conversation-tab-view .conversation-tab-body':'tabBody',
            "#active-conversation-tabs":"activeConversationTabs",
            "#connversation-side-nav .dropup-container":"dropUpContainer",
            "#inactive-conversation-tabs":"inActiveConversationTabs",
            "#conference-tab":"conferenceTab"

        },
        events:{
            "click #active-conversation-tabs li":"selectTab",
            "click #connversation-side-nav .dropup-container":"dropUp",
            "click #inactive-conversation-tabs  li":"selectInActiveTab",
            "click #inactive-conversation-tabs  li .close":"removeInactiveConversation",
			"click#active-conversation-tabs   li .close":"removeActiveConversation",
            "click #conference-tab a":"activateConference"
        },
        proxied:["remove","render","update","updateUI","onUpdateConversation","onDestroyConversation","checkConversation","showConversationWithContact","onConversation","asc","desc","templateTab","hideDropUp","showConversation"],
        templateTab:function(data){
            return $("#conversation-tab-tmpl").tmpl(data)
        },
        templateInActiveTab:function(data){
            return $("#inactive-conversation-tab-tmpl").tmpl(data)
        },
        templateConversation:function(data){
            return $("#conversation-tab-pane-tmpl").tmpl(data)
        },
        init: function(){
	        Conversation.bind("update", this.onUpdateConversation);
        	Conversation.bind("destroy", this.onDestroyConversation);
            this.App.bind('conversations:show',this.onConversation)
            this.App.bind('conversations:show:contact',this.showConversationWithContact)
            this.maxNumActiveConversation=3
            this.activeConversation=[]
            this.activeConversationMap={}
            this.inActiveConversationMap={}
            this.inActiveConversation=[]
            this.conversationControllers={}
            this.currentConversationController=null
            this.hiddenEmptyView=false;
            $(document).on("click",this.hideDropUp)
            this.App.bind("chat:updateUI",this.updateUI)
        },

        showConversationWithContact:function(contact,options){
          var conversation=this.getConversationWithUser(contact.user_id)
          if(conversation){
                this.checkConversation(conversation)
          }else{
              var created_by_local_user=(options && options.created_by_local_user)?options.created_by_local_user:false
              conversation=this.getConversation(contact.user_id,created_by_local_user)
              if(options && options.show) {
                  this.showConversation(conversation)
              }
          }
            if(options && options.callback) {
                options.callback.call(null,conversation)
            }
        },


        checkConversation:function(conversation){
            if(this.activeConversationMap[conversation.id]){
                var conversation=this.activeConversationMap[conversation.id]
                this.showConversation(conversation)
                console.log("conversation",conversation)

            }else if(this.inActiveConversationMap[conversation.id]){
                var inActiveConversation=this.inActiveConversationMap[conversation.id]
                console.log("inActiveConversation",inActiveConversation)
                this.activateInActiveConversation(inActiveConversation)
                console.log("show",inActiveConversation)
                this.showConversation(inActiveConversation)
            }
        },
        showConversation:function(conversation){
            //this.updateConversationShowTime(conversation)
            this.render()
            if(!this.el.hasClass("active")){
                this.el.addClass("active")
            }
            this.activateConversation(conversation)
        },
        onConversation:function(conversation){
           this.showConversationWithContact(conversation.user)
        },
        updateConversationShowTime:function(conversation) {
            conversation.last_shown_time=new Date()
        },
        removeLeastActiveConversation:function(){
            var inActiveConversation=this.activeConversation.shift()
            delete this.activeConversationMap[inActiveConversation.id]
            return inActiveConversation
        },
        removeMostActiveInactiveConversation:function(){
            var inActiveConversation=this.inActiveConversation.pop()
			if(inActiveConversation){
            	delete this.inActiveConversationMap[inActiveConversation.id]
			}
            return inActiveConversation
        },
        addToActiveConversation:function(conversation,toggleTouch) {
		  if(toggleTouch===true){
			 conversation.touchShow()
		  }
          this.activeConversation.push(conversation)
          this.activeConversation.sort(this.asc)
          this.activeConversationMap[conversation.id]=conversation
        },
        addToInActiveConversation:function(inActiveConversation,toggleTouch) {
		if(toggleTouch===true){
			 inActiveConversation.touchShow()
		 }
            this.inActiveConversation.push(inActiveConversation)
            this.inActiveConversationMap[inActiveConversation.id]=inActiveConversation
            this.inActiveConversation.sort(this.asc)
			inActiveConversation.onHide()
        },
        activateInActiveConversation:function(conversation){
            delete this.inActiveConversationMap[conversation.id]
            var inActiveConversation=this.removeLeastActiveConversation()
            this.addToActiveConversation(conversation,true)
            var indx=this.inActiveConversation.indexOf(conversation)
            console.log("removeLeastActiveConversation",inActiveConversation)
            this.inActiveConversation.splice(indx,1);
            this.addToInActiveConversation(inActiveConversation,true)
        },
        activateConversation:function(conversation){
           var id="#active-conversation-tab_"+conversation.id
           this.activeConversationTabs.find('li a.active').removeClass("active").attr('tabindex','-1');
           this.conferenceTab.removeClass("active").attr('tabindex','-1');
           var tab=this.activeConversationTabs.find(id+" a")
           tab.attr('tabindex','0').addClass("active");
           this.tabBody.find(".conversation-tab-pane").attr('aria-hidden',true).removeClass('active')
           this.tabBody.find("#conversation-tab-pane_"+conversation.id).attr('aria-hidden',false).addClass('active')
           if(this.currentConversationController)this.currentConversationController.deActivate()
           this.currentConversationController=this.conversationControllers[conversation.id]
           this.currentConversationController.activate()

        },
        activateConference:function(){
            this.activeConversationTabs.find('li a.active').removeClass("active").attr('tabindex','-1');
            this.tabBody.find(".conversation-tab-pane").attr('aria-hidden',true).removeClass('active')
            this.conferenceTab.attr('tabindex','0').addClass("active");
            this.tabBody.find("#conversation-tab-pane_conference").attr('aria-hidden',false).addClass('active')
            if(this.currentConversationController)this.currentConversationController.deActivate()
            this.currentConversationController=this.conferenceController
            this.currentConversationController.activate()
            return false;
        },
        render:function(){
            this.renderInActiveConversationTabs()
            this.renderActiveConversationTabs()
        },
        renderActiveConversationTabs:function(){
            this.activeConversationTabs.empty()
            $.each(this.activeConversation,this.proxy(function(i){
                //console.log("active conversation",this.templateTab(this.activeConversation[i]))
                this.activeConversationTabs.append(this.templateTab(this.activeConversation[i]))
            }) )
            this.activeConversationTabs.find('li').each(this.proxy(function(i,item){
                //console.log("item",$(item).find('a'))
                $(item).attr('role','tab')
                    //.attr('id',this.tabIDprefix +$(item).find('a').attr('href').split('#')[1] );
            }));
            this.activeConversationTabs.find('a').attr('tabindex','-1');
            if(this.inActiveConversation.length>0){
                this.dropUpContainer.show()
            }else{
                this.dropUpContainer.hide()
            }
        },
        renderInActiveConversationTabs:function(){
            this.inActiveConversationTabs.empty()
            $.each(this.inActiveConversation,this.proxy(function(i){
                this.inActiveConversationTabs.append(this.templateInActiveTab(this.inActiveConversation[i]))
            }) )
        },
        getConversation:function(user_id,created_by_local_user){
            var conversation=this.chats.getConversation(user_id,created_by_local_user)
            if(conversation.assertUser()){
                if(this.activeConversation.length<this.maxNumActiveConversation) {
                    this.addToActiveConversation(conversation,true)
                }else{
                    var inActiveconversation=this.removeLeastActiveConversation()
                    this.addToInActiveConversation(inActiveconversation,true)
                    this.addToActiveConversation(conversation,true)
                }
                var conversationPane=this.templateConversation(conversation)
                this.tabBody.append(conversationPane);

                var conversationController=ConversationController.init({
                    conversation:conversation,
                    el:conversationPane
                }); // conversationController.updateUI()
                this.conversationControllers[conversation.id]=conversationController
                return conversation;
            }
		},
		
       onUpdateConversation:function(conversation){
		console.log("UPDATE CONVERSATION",conversation)
        if(this.activeConversationMap[conversation.id]){
			var old=this.activeConversationMap[conversation.id]
			var oldIndx=this.activeConversation.indexOf(old)
			if(oldIndx>0){
				this.activeConversation.splice(oldIndx,1,conversation)
			}
            this.activeConversationMap[conversation.id]=conversation

        }else if(this.inActiveConversationMap[conversation.id]){
			var old=this.inActiveConversationMap[conversation.id]
			var oldIndx=this.inActiveConversation.indexOf(old)
			if(oldIndx>0){
				this.inActiveConversation.splice(oldIndx,1,conversation)
			}
            this.inActiveConversationMap[conversation.id]=conversation
        }
        },
		onDestroyConversation:function(){
	
		},
        selectTab:function(ev){
            var target=$(ev.currentTarget);
            var li= target.closest('li');
            var id=li.attr("id").split("_")[1]
            try{
               this.activateConversation(this.activeConversationMap[id])
            } catch(e) {console.log(e)}
        },
        selectInActiveTab:function(ev){
            var target=$(ev.currentTarget);
            var li= target.closest('li');
            var id=li.attr("id").split("_")[1]
            try{
                this.checkConversation(this.inActiveConversationMap[id])
            } catch(e) {console.log(e)}
        },
        getConversationWithUser:function(user_id){
           var conversation=Conversation.findByAttribute('user_id',user_id)
           if(conversation && (this.activeConversationMap[conversation.id]||this.inActiveConversationMap[conversation.id])){
              return conversation
           }else{
			return null
			}
        },
		removeInactiveConversation:function(ev){
            var target=$(ev.currentTarget);
            var li= target.closest('li');
			var id=li.attr("id").split("_")[1]
            //this.tabBody.find(".conversation-tab-pane").attr('aria-hidden',true).removeClass('active')
            this.tabBody.find("#conversation-tab-pane_"+id).remove()
			li.remove()
			var conversation=this.inActiveConversationMap[id]
            var indx=this.inActiveConversation.indexOf(conversation)
            this.inActiveConversation.splice(indx,1);
            delete this.inActiveConversationMap[conversation.id]
            delete this.conversationControllers[conversation.id]
            if(this.inActiveConversation.length>0){
                this.dropUpContainer.show()
            }else{
                this.dropUpContainer.hide()
            }
			return false
		},
		removeActiveConversation:function(ev){
            var target=$(ev.currentTarget);
            var li= target.closest('li');
			var id=li.attr("id").split("_")[1]
            this.tabBody.find(".conversation-tab-pane").attr('aria-hidden',true).removeClass('active')
            this.tabBody.find("#conversation-tab-pane_"+id).remove()
			li.remove()
			var conversation=this.activeConversationMap[id]
            var indx=this.activeConversation.indexOf(conversation)
            this.activeConversation.splice(indx,1);
            delete this.activeConversationMap[conversation.id]
            delete this.conversationControllers[conversation.id]
			var inActiveConversation=this.removeMostActiveInactiveConversation()
			if(inActiveConversation){
				this.addToActiveConversation(inActiveConversation,false);
				this.render()
			}
			return false		
		},
        dropUp:function(ev){
            var target=$(ev.currentTarget);
            var dropUpContainer = target.closest('.ops');
            if(dropUpContainer.hasClass("open")){
                dropUpContainer.removeClass("open")
            }else{
                dropUpContainer.addClass("open")
            }
            return false;
        },
        hideDropUp:function(){
            if(this.dropUpContainer.hasClass("open")){
                this.dropUpContainer.removeClass("open active")
            }
        },
        updateUI:function(){
            console.log("updateUI")
            var cH=this.conversationNav.outerHeight();
            var elH=this.el.height()
            tabH=elH-cH
            this.tabBody.css({
                'height':tabH+"px"
            })
        },
        asc:function(a,b){
            if(a.last_shown_time> b.last_shown_time){
                return 1;
            }else if(a.last_shown_time< b.last_shown_time){
                return -1
            }else{
                return 0
            }
        },
        desc:function(a,b){
            if(a.last_shown_time> b.last_shown_time){
                return -1;
            }else if(a.last_shown_time< b.last_shown_time){
                return 1
            }else{
                return 0
            }
        }
    })
})



jQuery(function($){
    Spine.Controller.prototype.App.base_url="http://localhost:3000/" //"http://antrees.com/"//
    Spine.Controller.prototype.App.bosh_addr = "http://localhost:5280/http-bind"//"http://antrees.com/http-bind"//
	Spine.Controller.prototype.App.OPENTOK_API_KEY='23037872'
    Spine.Controller.prototype.App.BRANCH_SERVICE="branch.rzaartz.local" //"branch.antrees.com"//
    Spine.Controller.prototype.App.isCurrentUser=function(user){
        if(this.user && user){
            return this.user.user_id===user.user_id
        }else{
            return false;
        }
    }
    Spine.Controller.prototype.App.isVideoCallSupported=TB.checkSystemRequirements();
    window.ChatApp= Spine.Controller.create({
        elements:{
            "#contacts":"contactsEl",
            "#chats":"chatsView",
            ".tabView":"tabView",
            ".tabView .chat_tabs":'chatTabs',
            '.tabView .tab-body':'tabBody',
            '.tabView .tab-body .tab-pane':'tabPane',
            "#conversation_direct":"conversationsView",
            ".chat-toggle":"chatToggle",
            "#conversation-tab-pane_conference" :"conferenceView"
        },

        events:{
          "click .chat-toggle":"toggleChatView"
        },

        proxied:['showConversations','showContacts','onPresence','onMessage','updateUI','showChats',"onConnect","onFailure","onAttach","onContactsError","onContacts","onIq"],
        init: function(){
            this.App.bind("show:contacts",this.showContacts)
            this.App.bind("show:chats",this.showChats)
            this.App.bind("updateUI",this.updateUI)
            this.App.NS_CHECK_IN="http://rzaartz.com/protocol/check_in"
            this.App.NS_MUC= 'http://jabber.org/protocol/muc'
			this.App.NS_RTC_SESSION_INIT='http://antrees.com/rtc/session_init'
			this.App.NS_CALL_SETUP='http://antrees.com/call_setup'
            this.App.NS_ANTREES='http://antrees.com'
			this.App.NS_ROSTER="jabber:iq:roster"
            this.App.BRANCH_JID=this.App.branch.id+"@"+this.App.BRANCH_SERVICE
            //this.doInit();
            //this.runTests()
			this.setUpAudio();
            this.connect();
            //this.attempt=0;
            //this.maxAttemp=3;
        },
        setUpAudio:function(){
	      $('<audio id="chatAudio"><source src="/assets/notify.ogg" type="audio/ogg"><source src="/assets/notify.mp3" type="audio/mpeg"><source src="/assets/notify.wav" type="audio/wav"></audio>')
		  .appendTo('body');
		},
        doInit:function(){
            this.chatTabs.removeClass("disabled")
            this.contacts=Contacts.init({el:this.contactsEl})
            this.chats=Chats.init({el:this.chatsView})
            this.conferenceController=ConferenceController.init({el:this.conferenceView})
            this.conversationNavController=ConversationNavController.init({
                el:this.conversationsView,
                chats:this.chats,
                conferenceController:this.conferenceController
            })
            this.chatMessageHandler=ChatMessageHandler.init()
            this.tabs=TabController.init({
                el:this.tabView,
                options:{
                    activeTabClass:'active',
                    activePanelClass:"tab-pane-active"
                }
            })
			this.App.trigger("chat:updateUI")
        },
        runTests:function(){
            this.App.user=Contact.init({
                name:"paul",
                user_id:"567"
            })
            this.contacts.show()
            this.contacts.test()
            this.chatMessageHandler.test()
        },
        connect:function(){
            this.showProgress({message:"initializing..."})
            this.chatTabs.addClass("disabled")
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
            this.App.user=Contact.init({
                name:data.user.name,
                user_id:data.user.id
            })
            console.log("jid ",this.userJid)
            this.App.connection= new Strophe.Connection(this.App.bosh_addr);
            console.log("Attaching",this.App.connection);
            this.App.connection.attach(this.userJid,this.sid,this.rid,this.onAttach)
        },
        onAttach:function(status){
            switch(status){
                case   Strophe.Status.ATTACHED:
                    this.onAttached()
            }
            return false;

        },
        onAttached:function(){
	           this.App.connection.sendIQ( $iq({
	                to: this.App.BRANCH_JID ,type:"get"})
	            .c("query", {xmlns: this.App.NS_ROSTER}),
	            this.onContacts,this.onContactsError);
        },
		onContacts:function(iq){
			console.log("response iq",iq)
		    this.hideProgress()
            this.doInit();
            $(iq).find('item').each(function () {
				var jid = $(this).attr('jid');
				var name = $(this).attr('name') || jid; 
				var photo_url=$(this).attr('photo_url');
				var affiliation = $(this).attr('affiliation');
                Contact.create(
                    {
                        name:name,
                        photo_url:photo_url,
                        affiliation:affiliation,
                        online:{status:"available"} ,
                        user_id:Strophe.getResourceFromJid(jid),
                        jid:jid
                    }
                )
			});
            this.App.trigger("chat:updateUI")
            this.App.connection.addHandler(this.onPresence, null, 'presence');
			this.App.connection.addHandler(this.onIq, null, "iq");
            this.notifyServicePresence()	
		},
		onContactsError:function(iq){
			console.log("error",iq)
			this.showError({message:"Failed to retrieve contacts please refresh this page"})
		},
		onIq:function(iq){
			console.log("iq received",iq)
            var child = $(iq).find('*[xmlns="' + this.App.NS_CALL_SETUP + '"]:first');
            if (child.length > 0) {
                this.handleVideoCall(iq,child)
            } else {
                this.sendError(iq, 'cancel','feature-not-implemented');
            }
			return true;
		},
        handleVideoCall:function(iq,elem){
            var id = $(iq).attr('id');
            var from = $(iq).attr('from');
            var type = $(iq).attr("type");
            if (type === 'get') {
                this.send_error(iq,'cancel','bad-request');
                return true;
            } else if (type !== 'set') {
                // ignore IQ-error and IQ-result
                return true;
            }
            switch (elem[0].tagName) {
                case 'call-invite':
                    this.doCallInvite(id, from, elem); break;
                case 'call-accept':
                    this.doCallAccept(id, from, elem); break;
	            case 'call-reject':
	                this.doCallReject(id, from, elem); break;
	 			case 'call-terminate':
					this.doCallTerminate(id, from, elem); break;
                default:
                    this.sendError(iq, 'cancel', 'bad-request');
            }
        },
        doCallInvite:function(id,from, elem){
           //send ack
           this.App.connection.send($iq({to: from, id: id, type: 'result'}));
           var caller_id=Strophe.getResourceFromJid($(elem).attr('from'))
           var sid=$(elem).attr('sid');
           var token=$(elem).attr('token');
           var call= Call.init(
                {
                    sid:sid,
                    token:token,
                    initiated_by_local_user:false,
                    caller_id:caller_id,
                    callee_id:this.App.user.user_id,
                    state:Call.STATE.ANSWER
                })
                var conversation=Conversation.findByAttribute('user_id',caller_id)
                if(conversation){
	            	this.App.trigger("call:new",call)
                }else{
                    var contact=Contact.findByAttribute('user_id',caller_id)
                    if(contact){
                        this.App.trigger('conversations:show:contact',contact,{show:
                            false,
                            created_by_local_user:false,
                            callback:this.proxy(function(conversation){
				            this.App.trigger("call:new",call)
				 			})
                        })
                    }
                }
			//console.log("call-new",call)
           //show notification/ringing
        },
        doCallAccept:function(id,from, elem){
            //send ack
            this.App.connection.send($iq({to: from, id: id, type: 'result'}));
            var sid=$(elem).attr('sid');
            this.App.trigger("call:accept",sid)
            //show notification/ringing
        },
        doCallReject:function(id,from, elem){
            //send ack
            this.App.connection.send($iq({to: from, id: id, type: 'result'}));
            var sid=$(elem).attr('sid');
            this.App.trigger("call:reject",sid)
            //show notification/ringing
        },
        doCallTerminate:function(id,from, elem){
            //send ack
            this.App.connection.send($iq({to: from, id: id, type: 'result'}));
            var sid=$(elem).attr('sid');
            this.App.trigger("call:terminate",sid)
            //show notification/ringing
        },
        notifyServicePresence:function(){
           this.App.connection.send($pres().c('priority').t('-1'));
           this.App.user.jid =  this.App.BRANCH_JID+'/'+this.App.user.user_id
            console.log("user",this.App.user)
            this.App.connection.send(
                $pres({
                    to: this.App.user.jid
                }).c('x', {xmlns: this.App.NS_MUC}));
            console.log('sending pres to branch component',this.App.user.jid )
        },
        onFailure:function(data){
            console.log(data.responseText)
            if(this.attempt++ < this.maxAttemp) {
                this.connect()
            } else{
                this.hideProgress()
                this.showError({message:"could not connect to server"})
            }
            return false;
        },
        onPresence:function(presence){
            console.log(presence)
            var from = $(presence).attr('from');
            var type = $(presence).attr('type');
            var branch_jid = Strophe.getBareJidFromJid(from);
            var user_id=Strophe.getResourceFromJid(from)
            console.log("branch_jid",branch_jid)
                // make sure this presence is for the right room
          if (branch_jid ===this.App.BRANCH_JID) {
            var contact=Contact.findByAttribute('user_id',user_id)
            if (type === 'error' && !this.joined) {
                // error joining room; reset app Groupie.connection.disconnect();
            } else if (!contact && type !== 'unavailable') {
            // add to participant list
                var item=$(presence).find('item')
                var affiliation = item.attr('affiliation');
                var name = item.attr('name');
                var photo_url = item.attr('photo_url');
               contact= Contact.create(
                    {
                        name:name,
                        photo_url:photo_url,
                        affiliation:affiliation,
                        online:{status:"available"} ,
                        user_id:user_id,
                        jid:from
                    }
                )
            }
            if (type !== 'error' && !this.joined) {
                // check for status 110 to see if it’s our own presence
               if ($(presence).find('status[code="110"]').length > 0) {
               // check if server changed our nick
                if ($(presence).find('status[code="210"]').length > 0) {
                   // Groupie.nickname = Strophe.getResourceFromJid(from);
                }
               }
            }
          }
            return true
        },
        showProgress:function(msg){
            this.hideProgress();
            this.progress=$("#chat-load-tmpl").tmpl(msg)
            this.progress.appendTo(this.tabBody);
        },
        showError:function(msg){
            this.hideError();
            this.errorMessage= $("#chat-error-alert-tmpl").tmpl(msg)
            this.errorMessage.appendTo(this.tabBody);
        },
        hideProgress:function(){
            if(this.progress)this.progress.remove();
        },
        hideError:function(){
            if(this.errorMessage)this.errorMessage.remove();
        },
        updateUI:function(){
           console.log("updateUI")
            var cH=this.chatTabs.outerHeight();
            var elH=this.el.height()
            tabH=elH-cH
            this.tabBody.css({
                'height':tabH+"px"
            })
            this.tabPane.css({
                'height':tabH+"px"
            })
            this.App.trigger("chat:updateUI")
        },
        showContacts:function(){
            this.contacts.show();
        },
        showChats:function(){
            this.chats.show()
        } ,
        toggleChatView:function(ev){
          if(this.chatToggle.hasClass("open")){
              this.chatToggle.removeClass("open")
              this.conversationsView.addClass("active")
          }else{
              this.chatToggle.addClass("open")
              this.conversationsView.removeClass("active")
          }
        } ,
        sendError: function (iq, etype, ename, app_error) {
            var error = $iq({to: $(iq).attr("from"),
            id: $(iq).attr("id"),
            type:"error"})
            .cnode(iq.cloneNode(true)).up()
           .c("error", {type: etype})
           .c(ename, {xmlns: Strophe.NS.STANZAS}).up();
           if (app_error) {
           error.c(app_error, {xmlns: this.App.NS_ANTREES});
       }
       this.App.connection.send(error); }
    })


})

jQuery(function($){
    window.ChatMessageHandler = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#contact-item-tmpl").tmpl(data)
        },
        proxied:["onMessage"],
        init: function(){
            this.App.connection.addHandler(this.onMessage,null, "message","chat");
        },
        test:function(){
            var messages=Message.fakeItem()
            $.each(messages,this.proxy(function(i){
                var conversation=Conversation.findByAttribute('user_id',messages[i].from_id)
                if(conversation){
                    var msg=Message.create(messages[i])
                    conversation.onMessage(msg)
                    this.App.trigger("chats:show")
                }else{
                    var contact=Contact.findByAttribute('user_id',messages[i].from_id)
                    if(contact){
                        console.log("contact",contact)
                        this.App.trigger('conversations:show:contact',contact,{show:
                            false,
                            created_by_local_user:false,
                            callback:this.proxy(function(conversation){
                                var msg=Message.create(messages[i])
                                if(msg.assertFrom()){
                                    console.log("asserted")
                                    conversation.onMessage(msg)
                                    this.App.trigger("chats:show")
                                } else{
                                    msg.destroy()
                                }
                            })
                        })
                    }
                }
            }) )
        },
        onMessage:function(msg){
            console.log('received',msg)
            var from=$(msg).attr('from')
            var branch_id = Strophe.getNodeFromJid(from);
            var branch_jid = Strophe.getBareJidFromJid(from);
            var user_id=Strophe.getResourceFromJid(from)
            console.log('user_id',user_id)
            //this.App.connection.bind("sessionDescriptionMessage",this.onMessage);
            var conversation=Conversation.findByAttribute('user_id',user_id)
            if(conversation){
                this.handleMessage(msg,conversation)
            }else{
                var contact=Contact.findByAttribute('user_id',user_id)
                if(contact){
                    this.App.trigger('conversations:show:contact',contact,{show:
                        false,
                        created_by_local_user:false,
                        callback:this.proxy(function(conversation){
                            this.handleMessage(msg,conversation)
                        })
                    })
                }
            }
            return true;
        },
        handleMessage:function(msg,conversation){
            var body = $(msg).children("body");
            var msg=Message.create({
                    from_id:conversation.user_id,
					from:conversation.user,
					to_id:this.App.user.user_id,
					conversation_id:conversation.id,
                    to:this.App.user,
                    body:body.text(),
					html:null,
                    type:Message.MESSAGE_TYPE.CHAT,
                    date:new Date()
             })
            $('#chatAudio')[0].play();
             this.App.trigger("chats:show")
        }
    })
})

