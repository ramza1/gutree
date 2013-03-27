var Issue=Spine.Model.setup("Issue",[
    "id",
    "issue_url",
    "issue_number",
    "publication_date",
    "publisher_name",
    "publisher_url",
    "title",
    "description",
    "icon_url",
    "thumb_data",
    "content_url",
    "created_at",
    "updated_at",
    "contents",
    "current_page",
    "content_type"
])

Issue.extend({
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
