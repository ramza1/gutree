//= require date-en-GB
var Contact=Spine.Model.setup("Contact",[
    "id",
    "user_id",
    "name",
    "photo_url",
    "affiliation",
    "online",
    "jid",
    "avatar"
])

Contact.include({
    setAvatar:function(){
        if(!this.avatar){
            this.avatar=$('<img src="'+this.photo_url+'" class="avatar icon little-rounded avatar_shadow"/>').html()
        }
    }
})

Contact.extend({
        base_url:"http://localhost:3000/branches/all",
        get:function(url,succ,err,params){
            $.ajax({
                type: "GET",
                url:url,
                contentType:"application/json",
                data:params,
                success: succ,
                error:err
            });
        } ,
        fakeItem:function(){
            return   [
                 {
                    name:"paul",
                    photo_url:"/assets/image_7.jpg",
                    role:"admin",
                    affiliation:"admin",
                    online:{status:"available"} ,
                    user_id:"1"
                 },
                {
                    name:"James",
                    photo_url:"/assets/image_1.jpg",
                    role:"admin",
                    affiliation:"admin",
                    online:{status:"available"} ,
                    user_id:"2"
                },
                {
                    name:"Crisp Grazia",
                    photo_url:"/assets/image_2.jpg",
                    role:"admin",
                    affiliation:"admin",
                    online:{status:"available"} ,
                    user_id:"3"
                },
                {
                    name:"Adebanjo Grace",
                    photo_url:"/assets/image_4.jpg",
                    role:"admin",
                    affiliation:"admin",
                    online:{status:"available"} ,
                    user_id:"4"
                },
                {
                    name:"Ishola Babatunde",
                    photo_url:"/assets/image_5.jpg",
                    role:"admin",
                    affiliation:"admin",
                    online:{status:"available"} ,
                    user_id:"5"
                },
                {
                    name:"Adebayo Boyega",
                    photo_url:"/assets/image_6.jpg",
                    role:"admin",
                    affiliation:"admin",
                    online:{status:"available"} ,
                    user_id:"6"
                },
                {
                    name:"Augustine Ndule",
                    photo_url:"/assets/image_8.jpg",
                    role:"admin",
                    affiliation:"member",
                    online:{status:"available"} ,
                    user_id:"7"
                },
                {
                    name:"Onyemaechi Okafor",
                    photo_url:"/assets/image_9.jpg",
                    role:"admin",
                    affiliation:"member",
                    online:{status:"available"}  ,
                    user_id:"8"
                } ,
                {
                    name:"Chuba Okanumee",
                    photo_url:"/assets/image_10.jpg",
                    role:"admin",
                    affiliation:"member",
                    online:{status:"available"} ,
                    user_id:"9"
                },
                {
                    name:"Nnamdi Nwobgodo",
                    photo_url:"/assets/avatar.jpg",
                    role:"admin",
                    affiliation:"member",
                    online:{status:"available"}  ,
                    user_id:"10"
                }
            ]
        }
    }
);

var Chat=Spine.Model.setup("Chat",[
    "id",
    "user_id",
    "thread_id",
    "created_at",
    "created_by_local_user",
    "online",
    "last_shown_time",
    "contact"
])

var Conversation=Spine.Model.setup("Conversation",[
    "id",
    "user",
    "messages",
    "user_id",
    "last_shown_time",
    "current_state",
    "notification_counter",
    "initiated_by_local_user",
    "last_active_time",
    "notification",
    "last_activity_time",
    "last_active_formatted_time",
    "last_active_formatted_date",
    "avatar",
	"visible"
])

Conversation.include({
    touch:function(){
        this.last_active_time=new Date()
        this.last_active_formatted_time=this.last_active_time.toString("hh:mm tt")
        this.last_active_formatted_date=this.last_active_time.toString("d-MMM-yyyy")
        this.save()
    },
    touchShow :function(){
        this.last_shown_time=new Date()
        this.save()
    },
    onShow:function(){
        this.notification_counter=0;
        console.log("onshow",this.unread)
		this.visible=true;
        this.touch();
    },
    onHide:function(){
        this.notification_counter=0;
		this.visible=false;
        console.log("onhide",this.unread)
        this.touch();
    },
    onMessage:function(msg){
        this.messages.push(msg)
        var notification={
			content:msg.body,
			type:msg.type,
			date:Date.now()
		}
		this.notify(notification)
        this.touch()
    },
	notify:function(notification){
		this.notification=notification
        if(!this.notification_counter)this.notification_counter=0
		if(this.visible==false){
			this.notification_counter++
			//pay sound
		}else{
			this.notification_counter=0
		}		
	},
    assertUser:function(){
        try{
            if(!this.user){
               this.user=Contact.findByAttribute("user_id",this.user_id)
            }
			 return this.user
        }catch(e){}
    }
})

var Call=Spine.Model.setup("Call",[
    "id",
    "sid",
    "token",
    "initiated_by_local_user",
    "callee_id",
    "caller_id",
    "conversation_id",
    "state",
    "ot_session"
])

Call.include({
    getCaller:function(){
        try{
            if(!this.caller){
                return this.caller=Contact.findByAttribute("user_id",this.caller_id)
            }
        }catch(e){}
    },
    getCallee:function(){
        try{
            if(!this.callee){
                return this.callee=Contact.findByAttribute("user_id",this.callee_id)
            }
        }catch(e){}
    }
})

Call.extend({
    STATE:{
        "OFFER":100,//awaiting an answer from remote peer
        "ANSWER":200,
        "INACTIVE":300,
        "ACTIVE":400
    }
})
var Message=Spine.Model.setup("Message",[
    "id",
    "type",
    "conversation_id",
    "body",
    "from",
    "from_id",
    "to_id",
    "to",
    "html",
    "subject",
    "thread",
    "date",
    "formatted_time"
])

Message.include({
    assertFrom:function(){
        try{
            if(!this.from) {
                return this.from=Contact.findByAttribute("user_id",this.from_id)
            }
        }catch(e){}
    },
    touch:function(){
        this.date=new Date()
        this.save()
    }
})

ConversationRequest=Spine.Model.setup("ConversationRequest",[
    "id",
    "message",
    "from",
    "to",
    "thread",
    "viewed"
])
ConversationRequest.extend({
        fakeItem:function(){
            return   [
                {
                    from:{
                        name:"paul",
                        photo_url:"/assets/image_7.jpg",
                        role:"admin",
                        online:{status:"available"},
                        user_id:"1"
                    },
                    message:'The idea behind this one is to give a very little and subtle shadow'
                },
                {
                    from:{
                        name:"James",
                        photo_url:"/assets/image_1.jpg",
                        role:"admin",
                        online:{status:"available"} ,
                        user_id:"2"
                    },
                    message:'The idea behind this one is to give a very little and subtle shadow'
                },
                {
                    from:{
                        name:"Crisp Grazia",
                        photo_url:"/assets/image_2.jpg",
                        role:"admin",
                        online:{status:"available"} ,
                        user_id:"3"
                    },
                    message:'The idea behind this one is to give a very little and subtle shadow'
                },
                {
                    from:{
                        name:"Adebanjo Grace",
                        photo_url:"/assets/image_4.jpg",
                        role:"admin",
                        online:{status:"available"},
                        user_id:"4"
                    },
                    message:'The idea behind this one is to give a very little and subtle shadow'
                },
                {
                    from:{
                        name:"Ishola Babatunde",
                        photo_url:"/assets/image_5.jpg",
                        role:"admin",
                        online:{status:"available"},
                        user_id:"5"
                    },
                    message:'The idea behind this one is to give a very little and subtle shadow'
                }
            ]
        }
    }
);

Message.extend({
        MESSAGE_TYPE:{
            GROUP_CHAT:"groupchat",
            CHAT:"chat"
        },
        fakeItem:function(){
            return   [
                {
                    from_id:"1",
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"video",
                    date:new Date()
                },
                {
                    from_id:"2",
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat",
                    date:new Date()
                },
                {
                    from_id:"3",
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"video",
                    date:new Date()
                },
                {
                    from_id:"4",
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat",
                    date:new Date()
                },
                {
                    from_id:"5",
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"video",
                    date:new Date()
                },
                {
                    from_id:"6",
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat",
                    date:new Date()
                }
            ]
        }
    }
);