var IssueItem=Spine.Model.setup("IssueItem",[
    "id",
    "issue_url",
    "publisher",
    "created_at",
    "title",
    "icon_url",
    "issue_number",
    "collection_url"
])


IssueItem.extend({
        base_url:"http://localhost:3000/issues/all",
        get:function(url,succ,err,params){
            $.ajax({
                type: "GET",
                url:url,
                contentType:"application/json",
                data:params,
                success: succ,
                error:err
            });
        }
    }
);
