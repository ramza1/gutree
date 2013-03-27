var BranchItem=Spine.Model.setup("IssueItem",[
    "id",
    "Branch_url",
    "created_time_ago",
    "created_at",
    "name",
    "icon_url",
    "memberships_count",
    "sub_tree_size",
    "tree_id",
    "latest",
    "collection_url"
])


BranchItem.extend({
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
            return {
                Branch_url:"",
                created_time_ago:"1 minute ago",
                memberships_count:"40",
                sub_tree_size:"0",
                latest_tip:"The Beginning of time",
                icon_url:"/assets/image_7.jpg",
                collection_url:"http://localhost:3000/trees/2/all_branches"
            }
        }
    }
);
