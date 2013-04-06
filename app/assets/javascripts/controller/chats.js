//= require strophe/base64
//= require strophe/md5
//= require strophe/core
//= require webrtc/TB.min
//= require adapter
//= require model/chats
//= require controller/tab
jQuery(function($){
    window.Messages = Spine.Controller.create({
        elements:{
            ".items":"itemsEl",
            ".items .item":'handler'
        },
        events:{
            "click .items li":"doAction"
        },
        proxied:["render","addOne","show","addAll","desc","updateUI","onMessage","prefetchComplete","onError","refresh","scroll"],
        init: function(){
            //ConversationRequest.bind('create',this.addOne)
            this.App.connection.addHandler(this.onMessage,null, "message", "chat");
            $(document).on("resize",this.render)
            this.App.bind("chat:updateUI",this.updateUI)
            this.prefetched=false;
            this.jsp=$(this.el).addScrollExtension()
            this.contentPane=  this.el.find('.jspPane')
        },
        addOne:function(item){
            console.log("item",item)
            try{
                if(this.contentPane.length>0){
                    // console.log("jsp",this.jsp)
                    contentPane=this.jsp.getContentPane()
                    this.itemsEl=contentPane.find('ul.items')
                    var itemEl=MessageItemController.init({
                        item:item,
                        ul:this.itemsEl
                    });
                    this.itemsEl.append(itemEl.render().el);
                    this.jsp.reinitialise()
                    this.jsp.addHoverFunc();
                    return
                }else{
                    var itemEl=MessageItemController.init({
                        item:item,
                        ul:this.itemsEl
                    });
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
                //this.showProgress({message:"loading..."})
                //this.showError({message:"error"})
                //this.prefetch();
                // onPrefetchComplete we would render the container el
                this.conversations=Conversation.all()
                this.latest_messages=[]
               if(this.conversations.length>0){
                   $.each(this.conversations,this.proxy(function(i){
                       var message=this.conversations[i].last_message
                       this.latest_messages.push(message)
                   }) )
               }
            console.log("latest_messages",this.latest_messages)
            if(this.latest_messages.length>0) {
                this.latest_messages.sort(this.desc)
                this.addAll(this.latest_messages)
            }
                //var items=Message.fakeItem()
                //this.jsp.destroy();
                //this.jsp=this.el.addScrollExtension()
            //this.prefetched=true
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
        prefetch:function(){
            if(this.prefetching)return
            this.prefetching=true;
            $.ajax({
                type: "GET",
                url:this.itemCollectionUrl,
                contentType:"application/json",
                data:this.params,
                success: this.prefetchComplete,
                error:this.onError
            });
        },
        prefetchComplete:function(data){
            data=eval(data);
            // this.hideProgress();
            // this.hideLoadProgress();
            console.log(data)
            this.prefetching=false;
            this.params=data.params
            this.remaining=data.remaining//the page set by the server or may me we should maintain state?this.page+=1
            this.empty=data.empty;
            if(this.empty) {
                this.showEmptyMessage();
                return;
            }
            //this.itemsEl.append()
            this.addAll($(data.tips))
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
                this.handleChatMessage(msg,conversation)
            }else{
                var contact=Contact.findByAttribute('user_id',user_id)
                if(contact){
                    this.App.trigger('conversations:show',contact,{show:
                        false,
                        created_by_local_user:false,
                        callback:this.proxy(function(conversation){
                            this.handleChatMessage(msg,conversation)
                        })
                    })
                }
            }
            return true;
        },
        handleChatMessage:function(msg,conversation){
            if($(msg).children("sd").length>0) {
              this.handleSessionMessage(msg,conversation)
            }else{
                var body = $(msg).children("body");
                var html= $(msg).children("html");
                var msg=Message.create({
                    from:conversation.user,
                    to:this.App.user,
                    conversation:conversation,
                    body:body.text(),
                    html:html[0],
                    type:"chat",
                    date:new Date()
                })
                conversation.messages.push(msg)
                conversation.last_message=msg;
                conversation.save()
            }
            this.render()
        },
        handleGroupChatMessage:function(msg){
            var body = $(msg).children("body");
        },
        handleSessionMessage:function(msg,conversation){
            var sessionDescription = $(msg).children("sd");
            this.App.trigger("sessionDescriptionMessage",sessionDescription,conversation)
        },
        desc:function(a,b){
            if(a.date> b.date){
                return -1;
            }else if(a.date< b.date){
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
            action=this.current.data("action");
            console.log("action",action)
            var message=Message.find(this.currentAnchor.attr("id"))
            this.App.trigger(action,message)
            return false;
        }
    })
})
jQuery(function($){
    window.MessageItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#message-item-tmpl").tmpl(data)
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
            "click .items li":"doAction"
        },
        proxied:["render","addOne","show","addAll","updateUI","prefetchComplete","onError","refresh","scroll"],
        init: function(){
            Contact.bind('create',this.addOne)
            $(document).on("resize",this.render)
            this.App.bind("chat:updateUI",this.updateUI)
            this.prefetched=false;
            console.log("connection",this.App.connection)
        },
        addOne:function(item){
            console.log("item",item)
            try{
                var itemsEl
                if(this.el.find('.jspPane').length>0){
                   // console.log("jsp",this.jsp)
                    contentPane=this.jsp.getContentPane()
                    itemsEl=contentPane.find('[data-affiliation-container="'+item.affiliation+'"]')
                    var itemEl=ContactItemController.init({
                        item:item,
                        ul:itemsEl
                    });
                    itemsEl.append(itemEl.render().el);
                    this.jsp.reinitialise()
                    this.jsp.addHoverFunc();
                    return
                }else{
                    itemsEl=this.el.find('[data-role-container="'+item.role+'"]')
                    var itemEl=ContactItemController.init({
                        item:item,
                        ul:itemsEl
                    });
                    itemsEl.append(itemEl.render().el);
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
        emptyList:function(){
          this.contentPane=  this.el.find('.jspPane')
          if(this.contentPane.length>0){
              this.contentPane.empty()
          } else{
              this.el.empty();
          }
        },
        template:function(){
          return $("#chat-tree-tmpl").tmpl()
        },
        render:function(){
            this.emptyList();
            if(this.empty==true){
                this.showEmptyMessage()
                return;
            }
            this.items=Contact.all()
            if(this.items.length>0){
                this.renderTree()
                this.addAll(this.items)
            }else{
               //this.showProgress({message:"loading..."})
                //this.showError({message:"error"})
                //this.prefetch();
                // onPrefetchComplete we would render the container el
                this.renderTree()
                /*8
                var items=Contact.fakeItem()
                $.each(items,this.proxy(function(i){
                    Contact.create(items[i])
                }) )
                **/
                //this.jsp.destroy();
                //this.jsp=this.el.addScrollExtension()
            }
            this.prefetched=true
        },
        renderTree:function(){
            if(this.contentPane.length>0){
                this.contentPane.html(this.template())
            } else{
                this.el.html(this.template());
                this.jsp=$(this.el).addScrollExtension()
                this.contentPane=  this.el.find('.jspPane')
            }
            this.tree=this.el.find('.tree')
            this.tree.accordion({});

            console.log("jsp",this.jsp)
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
        prefetch:function(){
            if(this.prefetching)return
            this.prefetching=true;
            $.ajax({
                type: "GET",
                url:this.itemCollectionUrl,
                contentType:"application/json",
                data:this.params,
                success: this.prefetchComplete,
                error:this.onError
            });
        },
        prefetchComplete:function(data){
            data=eval(data);
            // this.hideProgress();
            // this.hideLoadProgress();
            console.log(data)
            this.prefetching=false;
            this.params=data.params
            this.remaining=data.remaining//the page set by the server or may me we should maintain state?this.page+=1
            this.empty=data.empty;
            if(this.empty) {
                this.showEmptyMessage();
                return;
            }
            //this.itemsEl.append()
            this.addAll($(data.tips))
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
            action=this.current.data("action");
            contact=Contact.find(this.currentAnchor.attr("id"))
            console.log(action,contact)
            this.App.trigger(action,contact,{show:true,created_by_local_user:false})
            return false;
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
        proxied:["render","addOne","show","addAll","updateUI","prefetchComplete","onError","refresh","scroll"],
        init: function(){
            Message.bind('create',this.addOne)
            $(document).on("resize",this.render)
            this.prefetched=false;
            //this.jsp=$(this.el).addScrollExtension()
            //this.contentPane=  this.el.find('.jspPane')
        },
        addOne:function(item){
            if(!this.checkMessage(item))return;
            console.log("adding message item",item)
            if(!this.checkMessage(item))return;
            this.scroll(function(){
                var itemEl=ChatMessageItemController.init({
                    item:item,
                    ul:this.itemsEl
                });
                this.itemsEl.append(itemEl.render().el);
            });
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
            this.itemsEl.empty();
            if(this.empty==true){
                this.showEmptyMessage()
                return;
            }
            this.items=this.conversation.messages
            if(this.items.length>0){
                this.addAll(this.items)
            }
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
        checkMessage:function(message){
           if(message.type==Message.MESSAGE_TYPE.CHAT && message.conversation){
                return (this.conversation.user.user_id==message.conversation.user.user_id)
           } else{
               return false;
           }
        },
        prefetch:function(){
            if(this.prefetching)return
            this.prefetching=true;
            $.ajax({
                type: "GET",
                url:this.itemCollectionUrl,
                contentType:"application/json",
                data:this.params,
                success: this.prefetchComplete,
                error:this.onError
            });
        },
        prefetchComplete:function(data){
            data=eval(data);
            // this.hideProgress();
            // this.hideLoadProgress();
            console.log(data)
            this.prefetching=false;
            this.params=data.params
            this.remaining=data.remaining//the page set by the server or may me we should maintain state?this.page+=1
            this.empty=data.empty;
            if(this.empty) {
                this.showEmptyMessage();
                return;
            }
            //this.itemsEl.append()
            this.addAll($(data.tips))
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
            action=this.current.data("action");
            console.log("action",action)
            message=Message.find(this.currentAnchor.attr("id"))
            this.App.trigger(action,message,this.current)
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
        }
    })
})

jQuery(function($){
    window.ChatMessageItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
           data.isCurrentUser=(this.App.isCurrentUser(data.from))?true:false
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
            '.call':"callBtn",
            '.local':"localWrap",
            '.localVideo':"localVideo",
            ".remote":"remoteWrap",
            '.remote video':"remoteVideoEl",
            '.remote .mini':"miniWrap",
            '.remote .mini video':"miniVideo",
            '.video-call-view':'videoCallView'
        },
        events:{
            'click .call':"startVideoCall"
        },
        proxied:["render","onUserMediaSuccess","onMessage","setLocalAndSendMessage","onUserMediaError","onIceCandidate","onRemoteStreamAdded","onRemoteStreamRemoved"],
        template:function(data){
            data.isCurrentUser=(this.App.isCurrentUser(data.from))?true:false
            console.log("render",data)
            return $("#chat-message-tmpl").tmpl(data)
        },
        init: function(){
          this.sdpConstraints = {'mandatory': {
                'OfferToReceiveAudio':true,
                'OfferToReceiveVideo':true }};
          this.isVideoMuted = false;
          this.isAudioMuted = false;
          this.initiator=false;
          this.started = false;
          this.App.bind("sessionDescriptionMessage",this.onMessage);
        },
        startVideoCall:function(ev){
            this.initiator=true
            this.setStatus("Initializing...");
            var localSession=this.App.localVideoSession
            if(localSession){
                this.publishVideoSession();
            }else{
                this.initLocalVideoSession();
            }
        },
        activate:function(){
            console.log("activate conversation for ",this.conversation)
            this.el.addClass('active')
            var remoteSession=VideoSession.findByAttribute("user_id",this.conversation.user_id)
            if(remoteSession){

            }else{
                this.invite();
            }
        },
        publishVideoSession:function(){

        },
        initLocalVideoSession:function(){
            this.doGetUserMedia();
        },
        invite:function(){
          var invite=$("#video-invite-tmpl").tmpl(this.conversation)
          this.call=invite.find('.call')
          this.videoCallView.html(invite)
        },
        showRemoteView:function(session){

        },
        showLocalView:function(session){

        },
        deActivate:function(){
            this.el.removeClass('active')
        },
        doGetUserMedia:function() {
        // Call into getUserMedia via the polyfill (adapter.js).
         var   constraints = { 'optional': [], 'mandatory': {} }
         try {
            getUserMedia({'audio':true, 'video':constraints}, this.onUserMediaSuccess,
            this.onUserMediaError);
            console.log("Requested access to local media with mediaConstraints:\n" +
            "  \"" + JSON.stringify(constraints) + "\"");
         } catch (e) {
            alert("getUserMedia() failed. Is this a WebRTC capable browser?");
            console.log("getUserMedia failed with exception: " + e.message);
         }
       } ,
        onUserMediaSuccess:function(stream){
            console.log("User has granted access to local media.",this.localVideo[0]);
            // Call the polyfill wrapper to attach the media stream to this element.
            attachMediaStream(this.localVideo[0], stream);
            this.localVideo.css("opacity","1")
            this.localStream = stream;
            // Caller creates PeerConnection.
            if (this.initiator) this.mayBeStart();
        },
        onUserMediaError:function(){
            this.reset();
        },
        mayBeStart:function(){
            if (!this.started && this.localStream) {
                this.setStatus("Connecting...");
                console.log("Creating PeerConnection.");
                this.createPeerConnection();
                console.log("Adding local stream.");
                this.pc.addStream(this.localStream);
                this.started = true;
                // Caller initiates offer to peer.
                if (this.initiator)
                    this.doCall();
            }
        },
        setStatus:function(status){
          this.call.data('loading-text',status)
            this.call.button("loading")
        },
        doCall:function(){
            var constraints = { 'mandatory': {'MozDontOfferDataChannel':true}, 'optional': [] }
        // temporary measure to remove Moz* constraints in Chrome
        if (webrtcDetectedBrowser === "chrome") {
            for (prop in constraints.mandatory) {
                if (prop.indexOf("Moz") != -1) {
                    delete constraints.mandatory[prop];
                }
            }
        }
        constraints = this.mergeConstraints(constraints, this.sdpConstraints);
        console.log("Sending offer to peer, with constraints: \n" +
            "  \"" + JSON.stringify(constraints) + "\".")
        this.pc.createOffer(this.setLocalAndSendMessage, null, constraints);
        },
        createPeerConnection:function(){
          var pc_config = {'iceServers':[{"url":'stun:' + 'stun.l.google.com:19302'}]};
          var pc_constraints = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };
            // Force the use of a number IP STUN server for Firefox.
          if (webrtcDetectedBrowser == "firefox") {
              pc_config = {"iceServers":[{"url":"stun:23.21.150.121"}]};
          }
          try {
              console.log("Creating RTCPeerConnnection with:\n" +
                  "  config: \"" + JSON.stringify(pc_config) + "\";\n" +
                  "  constraints: \"" + JSON.stringify(pc_constraints) + "\".");
                // Create an RTCPeerConnection via the polyfill (adapter.js).
                this.pc = new RTCPeerConnection(pc_config, pc_constraints);
                this.pc.onicecandidate = this.onIceCandidate;
                this.pc.onaddstream = this.onRemoteStreamAdded;
                this.pc.onremovestream = this.onRemoteStreamRemoved;
              } catch (e) {
                console.log("Failed to create PeerConnection, exception: " + e.message);
                alert("Cannot create RTCPeerConnection object; WebRTC is not supported by this browser.");
                return;
              }
            return this.pc;
         },
        onRemoteStreamAdded:function(){

        },
        onRemoteStreamRemoved:function(){

        },
        onIceCandidate:function(){

        },
        setLocalAndSendMessage:function(sessionDescription){
            // Set Opus as the preferred codec in SDP if Opus is present.
           // sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            this.pc.setLocalDescription(sessionDescription);
            console.log("sessionDescriptions",sessionDescription)
            this.sendMessage(sessionDescription);
        },
        sendMessage:function(message){
            var msgString = JSON.stringify(message);
            this.App.connection.send( $msg({
                to: this.App.BRANCH_JID + '/' + this.conversation.user.user_id,type: "chat"})
                .c("sd", {xmlns: "",format:"json"}).t(msgString))
        },
        onMessage:function(sessionDescription,conversation){
            if(this.conversation.user_id===conversation.user_id){
                this.processSignalingMessage($(sessionDescription).text())
            }
            return true;
        },
        processSignalingMessage:function(message){
            var msg = JSON.parse(message);
            console.log("received:",msg)
            if (msg.type === 'offer') {
                // Callee creates PeerConnection
                if (!this.initiator && !this.started)
                this.maybeStart();
                this.pc.setRemoteDescription(new RTCSessionDescription(msg));
                //doAnswer();
            } else if (msg.type === 'answer' && started) {
                //this.pc.setRemoteDescription(new RTCSessionDescription(msg));
            } else if (msg.type === 'candidate' && this.started) {
                var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label,
                    candidate:msg.candidate});
               // this.pc.addIceCandidate(candidate);
            } else if (msg.type === 'bye' && this.started) {
                //onRemoteHangup();
            }
        },
        mergeConstraints:function(cons1, cons2){
            var merged = cons1;
            for (var name in cons2.mandatory) {
                merged.mandatory[name] = cons2.mandatory[name];
            }
            merged.optional.concat(cons2.optional);
            return merged;
        },
        reset:function(){
            if (this.initiator)
            this.call.button("reset");
            this.isVideoMuted = false;
            this.isAudioMuted = false;
            this.initiator=false;
            this.started = false;
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
            '[data-conversation-state="conversation"]':"conversationView",
            '.chat-video-view':'chatVideoView',
            ".footer .chat-input input": "input"
        },
        proxied:["remove","render","updateUI","toggleFaceTimeVideo"],
        events:{
            "click .facetime-video-toggle":"toggleFaceTimeVideo",
            "keydown .footer .chat-input input": "checkCreateMessage"
        },
        template:function(data){
            return $("#conversation-tab-pane-tmpl").tmpl(data)
        },
        init: function(){
            this.updateUI()
            this.chatMessages = ChatMessages.init({el:this.chatMessageView,conversation:this.conversation})
            this.videoController=ChatVideoController.init({el:this.chatVideoView,conversation:this.conversation})
        },
        activate:function(){
            console.log("activating...",this.conversation)
            this.showConversation();
        },
        showConversation:function(){
            this.chatMessages.show()
        },
        deActivate:function(){

        },
        checkCreateMessage:function(e){
            if (e.which == 13 && !e.shiftKey) {
                this.createMessage();
                return false;
            }
        },
        createMessage:function(){
          var value = this.input.val();
          if ( !value ) return false;
          var msg=Message.create({
                from:this.App.user,
                to:this.conversation.user,
                conversation:this.conversation,
                body:value,
                html:null,
                type:"chat",
                date:new Date()
            })
         this.input.val("");
         this.conversation.messages.push(msg)
         this.conversation.last_message=msg;
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
            if(target.hasClass('active')){
                target.removeClass('active')
                this.videoController.deActivate()
            }else{
                target.addClass('active')
                this.videoController.activate()
            }
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
            "#inactive-conversation .dropup-container":"dropUpContainer",
            "#inactive-conversation-tabs":"inActiveConversationTabs"

        },
        events:{
            "click #active-conversation-tabs li":"selectTab",
            "click #inactive-conversation .dropup-container":"dropUp",
            "click #inactive-conversation-tabs  li":"selectInActiveTab"
        },
        proxied:["remove","render","update","updateUI","showConversationWithContact","showConversationFromMessage","asc","desc","templateTab","hideDropUp"],
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
            this.App.bind('conversations:show',this.showConversationWithContact)
            this.App.bind('conversations:show:message',this.showConversationFromMessage)
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
              conversation=this.createConversation(contact,created_by_local_user)
              if(options && options.show) {
                  this.showConversation(conversation)
              }
          }
            if(options && options.callback) {
                options.callback.call(null,conversation)
            }
        },

        showConversationFromMessage:function(message) {
          this.showConversationWithContact(message.from)
        },

        checkConversation:function(conversation){
            if(this.activeConversationMap[conversation.user_id]){
                var conversation=this.activeConversationMap[conversation.user_id]
                this.showConversation(conversation)
                console.log("conversation",conversation)

            }else if(this.inActiveConversationMap[conversation.user_id]){
                var inActiveConversation=this.inActiveConversationMap[conversation.user_id]
                console.log("inActiveConversation",inActiveConversation)
                this.activateInActiveConversation(inActiveConversation)
                console.log("show",inActiveConversation)
                this.showConversation(inActiveConversation)
            }
        },
        showConversation:function(conversation){
           // console.log("show",conversation)
            //this.updateConversationShowTime(conversation)
            this.render()
            if(!this.el.hasClass("active")){
                this.el.addClass("active")
            }
            this.activateConversation(conversation)
        },
        showConversationMessage:function(message){
           try{
               if(message.type && message.type==Message.MESSAGE_TYPE.CHAT){
                  //console.log("found chat message",message)
                  var from=message.from
                  this.showConversationContact(from)
               }
           } catch(e){
               console.log(e)
           }
        },
        updateConversationShowTime:function(conversation) {
            conversation.last_shown_time=new Date()
            conversation.save()
        },
        removeLeastActiveConversation:function(){
            var inActiveConversation=this.activeConversation.shift()
            delete this.activeConversationMap[inActiveConversation.user_id]
            return inActiveConversation
        },
        addToActiveConversation:function(conversation) {
          this.updateConversationShowTime(conversation)
          this.activeConversation.push(conversation)
          this.activeConversation.sort(this.asc)
          this.activeConversationMap[conversation.user_id]=conversation
        },
        addToInActiveConversation:function(inActiveConversation) {
            this.updateConversationShowTime(inActiveConversation)
            this.inActiveConversation.push(inActiveConversation)
            this.inActiveConversationMap[inActiveConversation.user_id]=inActiveConversation
            this.inActiveConversation.sort(this.asc)
        },
        activateInActiveConversation:function(conversation){
            delete this.inActiveConversationMap[conversation.user_id]
            var inActiveConversation=this.removeLeastActiveConversation()
            this.addToActiveConversation(conversation)
            indx=this.inActiveConversation.indexOf(conversation)
            console.log("removeLeastActiveConversation",inActiveConversation)
            this.inActiveConversation.splice(indx,1);
            this.addToInActiveConversation(inActiveConversation)
        },
        activateConversation:function(conversation){
           console.log("activate",conversation)
           id="#active-conversation-tab_"+conversation.id
           this.activeConversationTabs.find('li a.active').removeClass("active").attr('tabindex','-1');
           tab=this.activeConversationTabs.find(id+" a")
           tab.attr('tabindex','0').addClass("active");
           this.tabBody.find(".conversation-tab-pane").attr('aria-hidden',true).removeClass('active')
           this.tabBody.find("#conversation-tab-pane_"+conversation.id).attr('aria-hidden',false).addClass('active')
           if(this.currentConversationController)this.currentConversationController.deActivate()
           this.currentConversationController=this.conversationControllers[conversation.id]
           this.currentConversationController.activate()
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
        createConversation:function(user,initiated_by_local_user){
            conversation=Conversation.create(
                {
                    user_id:user.user_id,
                    user:user,
                    messages:[],
                    last_shown_time:new Date(),
                    initiated_by_local_user:initiated_by_local_user
                    //current_state:Conversation.CONVERSATION_STATE.CONVERSATION
                }
            )
           // this.conversations[user.user_id]=conversation
            if(this.activeConversation.length<this.maxNumActiveConversation) {
                this.addToActiveConversation(conversation)
            }else{
                inActiveconversation=this.removeLeastActiveConversation()
                this.addToInActiveConversation(inActiveconversation)
                this.addToActiveConversation(conversation)
            }
            if(!this.hiddenEmptyView){
                this.tabBody.find(".conversation-empty-view").hide()
                this.hiddenEmptyView=true
            }
            var conversationPane=this.templateConversation(conversation)
            this.tabBody.append(conversationPane);

            var conversationController=ConversationController.init({
                conversation:conversation,
                el:conversationPane
            });

           // conversationController.updateUI()
            this.conversationControllers[conversation.id]=conversationController
            return conversation;
        },
        createChat:function(contact,thread,created_by_local_user){
            thread=(thread)?thread:Math.floor(Math.random() * 4294967295);
            chat=this.createChatWithThread(contact.name,thread,created_by_local_user)
            chat.contact=contact
            console.log("create chat",chat)
            if(this.activeConversation.length<this.maxNumActiveConversation) {
                this.addToActiveChat(chat)
            }else{
                inActiveChat=this.removeLeastActiveChat()
                this.addToInActiveChat(inActiveChat)
                this.addToActiveChat(chat)
            }
            return chat;
        },
        createChatWithThread:function(userId,threadId,created_by_local_user){
           return Chat.create({
              user_id:userId ,
              thread_id:threadId ,
              created_at:new Date(),
               last_shown_time:new Date ,
               created_by_local_user:(created_by_local_user)?true:false
           })
        },
        selectTab:function(ev){
            var target=$(ev.currentTarget);
            var li= target.closest('li');
            var id=li.attr("id").split("_")[1]
            console.log("id",id)
            try{
               this.activateConversation(Conversation.find(id))
            } catch(e) {console.log(e)}

        },
        selectInActiveTab:function(ev){
            var target=$(ev.currentTarget);
            var li= target.closest('li');
            var id=li.attr("id").split("_")[1]
            console.log("inactive id",id)
            try{
                this.checkConversation(Conversation.find(id))
            } catch(e) {console.log(e)}
        },
        getConversationWithUser:function(user_id){
            return Conversation.findByAttribute('user_id',user_id)//this.conversations[user_id]//
        },

        getThreadChat:function(thread){
           return Chat.findByAttribute('thread_id',thread)
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
    window.ContactItemController = Spine.Controller.create({
        proxied:["remove","render","update"],
        template:function(data){
            return $("#contact-item-tmpl").tmpl(data)
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
    Spine.Controller.prototype.App.base_url="http://localhost:3000/"
    Spine.Controller.prototype.App.bosh_addr = "http://localhost:5280/http-bind"
    Spine.Controller.prototype.App.isCurrentUser=function(user){
        if(this.user && user){
            return this.user.jid==user.jid
        }else{
            return false;
        }
    }
    window.ChatApp= Spine.Controller.create({
        elements:{
            "#contacts":"contactsEl",
            "#messages":"MessagesView",
            ".tabView":"tabView",
            ".tabView .chat_tabs":'chatTabs',
            '.tabView .tab-body':'tabBody',
            '.tabView .tab-body .tab-pane':'tabPane',
            "#conversation_direct":"conversationsView",
            ".chat-toggle":"chatToggle"
        },

        events:{
          "click .chat-toggle":"toggleChatView"
        },

        proxied:['showConversations','showContacts','onPresence','onMessage','updateUI','showMessages',"onConnect","onFailure","onAttach"],
        init: function(){
            this.App.bind("show:contacts",this.showContacts)
            this.App.bind("show:messages",this.showMessages)
            this.App.bind("updateUI",this.updateUI)
            this.App.NS_CHECK_IN="http://rzaartz.com/protocol/check_in"
            this.App.NS_MUC= 'http://jabber.org/protocol/muc'
            this.App.BRANCH_SERVICE="branch.rzaartz.local";
            this.App.BRANCH_JID=this.App.branch.id+"@"+this.App.BRANCH_SERVICE
            /****/
            this.connect();
            //this.attempt=0;
            //this.maxAttemp=3;
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
            this.App.user=data.user
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
            this.hideProgress()
            this.chatTabs.removeClass("disabled")
            this.contacts=Contacts.init({el:this.contactsEl})
            this.messages=Messages.init({el:this.MessagesView})
            this.conversationNavController=ConversationNavController.init({el:this.conversationsView})
            this.tabs=TabController.init({
                el:this.tabView,
                options:{
                    activeTabClass:'active',
                    activePanelClass:"tab-pane-active"
                }
            })
            this.App.trigger("chat:updateUI")
            this.App.connection.addHandler(this.onPresence, null, 'presence');

            this.notifyServicePresence()
        } ,
        notifyServicePresence:function(){
           this.App.connection.send($pres().c('priority').t('-1'));
            this.App.user.jid =  this.App.BRANCH_JID+'/'+this.App.user.id
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
        showMessages:function(){
            this.messages.show()
        } ,
        toggleChatView:function(ev){
          if(this.chatToggle.hasClass("open")){
              this.chatToggle.removeClass("open")
              this.conversationsView.addClass("active")
          }else{
              this.chatToggle.addClass("open")
              this.conversationsView.removeClass("active")
          }
        }
    })


})

