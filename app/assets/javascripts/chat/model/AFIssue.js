var AFIssue=Spine.Model.setup("AFIssue",[
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

AFIssue.include({
    getContents:function(succ,err){
        console.log(this.content_url)
        $.ajax({
            type: "GET",
            url: this.content_url,
            processData:"false",
            contentType:"application/json",
            success: succ
        })
    },
    saveInDb:function(){
        var photo=this;
        this.db.transaction(
            function(tx) {
                console.log(Photo.MetaData.insert());
                //TEST FOR PHOTO MODEL

                tx.executeSql(
                    Photo.MetaData.create(),[],function(tx,result){
                        console.log('dateCreated: ',photo.dateCreated);
                        tx.executeSql(
                            Photo.MetaData.insert(),
                            [photo.apspotId,photo.name,photo.thumb_data,photo.data,photo.description,photo.longitude,photo.latitude,photo.dateCreated,photo.lastModified],
                            function(tx,result){
                                console.log('success');
                                this.id=result.insertId;
                                console.log('id:',this.id);
                                $(document).trigger('onNewPhoto',this);
                                succ.call(null,photo);
                            },function(tx,e){
                                console.log('failed');
                                err.call(photo,e);
                            }

                        );


                    },function(){
                        console.log('error')
                    }
                );



            });
    }
});

AFIssue.extend({
          shortName:'AFIssue',
          version : '1.0',
          displayName :'AFIssue',
          maxSize : 2*1024*1024,
         db:(function(){
           return window.openDatabase(this.shortName,this.version,this.displayName,this.maxSize);

         })(),
           TABLE_NAME:'AFIssue',
           COLUMN_NAMES:{
                ID:'id',
                ISSUE_URL:'issue_url',
                ISSUE_NUMBER:'issue_number',
                PUBLICATION_DATE:"publication_date",
                PUBLISHER_NAME:'publisher_name',
                PUBLISHER_URL:"publisher_url",
                CONTENT_TYPE:"content_type",
                TITLE:'title',
                DESCRIPTION:'description',
                ICON_URL:'icon_url',
                THUMB_DATA:'thumb_data',
                CONTENT_URL:'content_url',
                CREATED_AT:'created_at',
                UPDATED_AT:'updated_at'
        },
        createTable:function(){
            return "CREATE TABLE IF NOT EXISTS "+this.TABLE_NAME+" ("+this.COLUMN_NAMES.ID+ " INTEGER PRIMARY KEY AUTOINCREMENT, "+
                this.COLUMN_NAMES.ISSUE_URL+ " STRING," +
                this.COLUMN_NAMES.ISSUE_NUMBER+ " INTEGER," +
                this.COLUMN_NAMES.PUBLICATION_DATE+ " DATE,"+
                this.COLUMN_NAMES.PUBLISHER_NAME+ " STRING , " +
                this.COLUMN_NAMES.PUBLISHER_URL+ " STRING , " +
                this.COLUMN_NAMES.CONTENT_TYPE+ " STRING , " +
                this.COLUMN_NAMES.TITLE+ " STRING , " +
                this.COLUMN_NAMES.DESCRIPTION+ " TEXT ," +
                this.COLUMN_NAMES.ICON_URL+ " STRING, " +
                this.COLUMN_NAMES.THUMB_DATA+ " TEXT ," +
                this.COLUMN_NAMES.CONTENT_URL+ " STRING, " +
                this.COLUMN_NAMES.CREATED_AT+ " DATE ," +
                this.COLUMN_NAMES.UPDATED_AT+ " DATE );"
        },
        dropTable:function(){
            return "DROP TABLE IF  EXISTS "+this.TABLE_NAME
        },
        insert:function(){
            return 'INSERT INTO '+ this.TABLE_NAME+' ('
                +this.COLUMN_NAMES.ISSUE_URL+','
                +this.COLUMN_NAMES.ISSUE_NUMBER+','
                +this.COLUMN_NAMES.PUBLICATION_DATE+','
                +this.COLUMN_NAMES.PUBLISHER_NAME+','
                +this.COLUMN_NAMES.PUBLISHER_URL+','
                +this.COLUMN_NAMES.CONTENT_TYPE+','
                +this.COLUMN_NAMES.TITLE+','
                +this.COLUMN_NAMES.DESCRIPTION+','
                +this.COLUMN_NAMES.ICON_URL+','
                +this.COLUMN_NAMES.THUMB_DATA+','
                +this.COLUMN_NAMES.CONTENT_URL+','
                +this.COLUMN_NAMES.CREATED_AT+','
                +this.COLUMN_NAMES.UPDATED_AT
                +') VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);'
        },
        count:function(tx,succ,err){
            tx.executeSql(
                    'SELECT COUNT(*) FROM '+ AFIssue.TABLE_NAME,
                    [],function(tx,rset){
                    var count=rset.rows.item(0)["COUNT(*)"]
                    succ.call(null,count)
                },err)
        },
        listAll:function(params,querySuccess,errorCB){
            var issues=[];
            this.db.transaction(
                function(transaction) {
                    params.offset=params.offset>=0?params.offset:0;
                    console.log('offset: ',params.offset)
                    params.max=params.max>=0 && params.max< 100 ?params.max:10;
                    console.log('max: ',params.max)
                    var paginate="LIMIT "+params.max+" OFFSET "+params.offset
                    transaction.executeSql(
                        'SELECT * FROM '+ AFIssue.TABLE_NAME,
                        [],
                        function (tx, result) {
                            var total=result.rows.length;
                            console.log("total",total)
                            for (i=0 ;i < result.rows.length;i++) {
                                var row = result.rows.item(i);
                                var issue={}
                                issue.id=row[AFIssue.COLUMN_NAMES.ID];
                                issue.issue_number=row[AFIssue.COLUMN_NAMES.ISSUE_NUMBER];
                                issue.thumb_data=row[AFIssue.COLUMN_NAMES.THUMB_DATA];
                                issue.issue_url=row[AFIssue.COLUMN_NAMES.ISSUE_URL];
                                issue.publication_date=row[AFIssue.COLUMN_NAMES.PUBLICATION_DATE];
                                issue.publisher_name=row[AFIssue.COLUMN_NAMES.PUBLISHER_NAME];
                                issue.publisher_url=row[AFIssue.COLUMN_NAMES.PUBLISHER_URL];
                                issue.content_type=row[AFIssue.COLUMN_NAMES.CONTENT_TYPE];
                                issue.title=row[AFIssue.COLUMN_NAMES.TITLE];
                                issue.description =row[AFIssue.COLUMN_NAMES.DESCRIPTION];
                                issue.created_at =row[AFIssue.COLUMN_NAMES.CREATED_AT];
                                issue.updated_at  =row[AFIssue.COLUMN_NAMES.UPDATED_AT];
                                issue.content_url =row[AFIssue.COLUMN_NAMES.CONTENT_URL];
                                issue.icon_url =row[AFIssue.COLUMN_NAMES.ICON_URL];
                                issues.push(issue)
                            }
                            params.offset+=total;
                            AFIssue.count(tx,function(count){
                                params.total=count;
                                var data=
                                {
                                 'issues':issues,
                                  params:params
                                }
                                console.log('data',data)
                                querySuccess.call(null,data);
                            },errorCB)

                        },
                        function(){
                            errorCB.call(null)
                        }
                    );
        })},
        populateDB:function(tx){
              var val1=[
                  "http://localhost:3000/issues/1.json",
                  127,
                  "2012-09-24T03:13:26Z",
                  "CompleteFashion",
                  "http://localhost:3000/publishers/1.json",
                  "Image",
                  "Complete Fashion",
                  "The Best Fashion Website",
                  "http://localhost:3000/system/issues/icons/000/000/003/medium/PG1.jpg?1348456405",
                  null,
                  "http://localhost:3000/issues/1/contents/34.json",
                  "2012-09-24T03:13:26Z",
                  "2012-09-24T03:13:26Z"
              ]
              tx.executeSql(AFIssue.dropTable());
              tx.executeSql(AFIssue.createTable(),[],function(tx,result){
                  console.log(AFIssue.insert());
                  console.log("successfully created table")
                  tx.executeSql(AFIssue.insert(),val1,function(tx, result){
                      console.log("success_insert",tx)
                      AFIssue.listAll({},function(data){
                          console.log("list data",data)
                      },function(e){
                          console.log("e",e)
                      })
                  },function(tx,e){
                      console.log("error",e)
                  });
              },function(tx,e){
                  console.log("error creating table",e)
              });

        },
        base_url:"http://localhost:3000/issues/all",
        get:function(succ,err,id,params){
            $.ajax({
                type: "GET",
                url: this.base_url+'.json',
                contentType:"application/json",
                data:params,
                success: succ,
                error:err
            });
        }
    }
);

AFIssue.db.transaction(AFIssue.populateDB,function(e){
    console.log("error",e)
}, function(){
});
