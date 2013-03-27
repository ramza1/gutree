var Page=Spine.Model.setup("Page",[
    "id",
    "url",
    "prefix",
    "width",
    "height",
    "tileSize",
    "no"
])

Page.extend({
        createPage:function(){
              return Page.create(
                  {
                      url:"pg1",
                      prefix:"pg1_",
                      width: 3604,
                      height:5104,
                      tileSize:256
                  }
              );
        }
    }

);
