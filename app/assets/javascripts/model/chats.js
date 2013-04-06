var Contact=Spine.Model.setup("Contact",[
    "id",
    "user_id",
    "name",
    "photo_url",
    "affiliation",
    "online",
    "jid"
])


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
                    online:{status:"available"} ,
                    user_id:"1"
                 },
                {
                    name:"James",
                    photo_url:"/assets/image_1.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"2"
                },
                {
                    name:"Crisp Grazia",
                    photo_url:"/assets/image_2.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"3"
                },
                {
                    name:"Adebanjo Grace",
                    photo_url:"/assets/image_4.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"4"
                },
                {
                    name:"Ishola Babatunde",
                    photo_url:"/assets/image_5.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"5"
                },
                {
                    name:"Adebayo Boyega",
                    photo_url:"/assets/image_6.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"6"
                },
                {
                    name:"Augustine Ndule",
                    photo_url:"/assets/image_8.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"7"
                },
                {
                    name:"Onyemaechi Okafor",
                    photo_url:"/assets/image_9.jpg",
                    role:"admin",
                    online:{status:"available"}  ,
                    user_id:"8"
                } ,
                {
                    name:"Chuba Okanumee",
                    photo_url:"/assets/image_10.jpg",
                    role:"admin",
                    online:{status:"available"} ,
                    user_id:"9"
                },
                {
                    name:"Nnamdi Nwobgodo",
                    photo_url:"/assets/avatar.jpg",
                    role:"admin",
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
    "last_activity_time",
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
    "last_message",
    "user_id",
    "last_shown_time",
    "current_state",
    "initiated_by_local_user"
])

var VideoSession=Spine.Model.setup("VideoSession",[
    "id",
    "initiated_by_local_user",
    "user_id",
    "state"
])

VideoSession.extend({
    STATE:{
        "UNINITIALIZED":100,
        "WAITING":200,
        "ANSWER":300,
        "INITIALIZED":400
    }
})
var Message=Spine.Model.setup("Message",[
    "id",
    "type",
    "conversation",
    "body",
    "from",
    "to",
    "html",
    "subject",
    "thread",
    "date"
])
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
            "CHAT":"chat"
        },
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
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat"
                },
                {
                    from:{
                        name:"James",
                        photo_url:"/assets/image_1.jpg",
                        role:"admin",
                        online:{status:"available"} ,
                        user_id:"2"
                    },
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat"
                },
                {
                    from:{
                        name:"Crisp Grazia",
                        photo_url:"/assets/image_2.jpg",
                        role:"admin",
                        online:{status:"available"} ,
                        user_id:"3"
                    },
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat"
                },
                {
                    from:{
                        name:"Adebanjo Grace",
                        photo_url:"/assets/image_4.jpg",
                        role:"admin",
                        online:{status:"available"},
                        user_id:"4"
                    },
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat"
                },
                {
                    from:{
                        name:"Ishola Babatunde",
                        photo_url:"/assets/image_5.jpg",
                        role:"admin",
                        online:{status:"available"},
                        user_id:"5"
                    },
                    body:'The idea behind this one is to give a very little and subtle shadow',
                    html:"The idea behind this one is to give a very little and subtle shadow",
                    subject:"",
                    type:"chat"
                }
            ]
        }
    }
);