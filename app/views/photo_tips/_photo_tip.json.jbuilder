   json.(photo_tip,:id,:created_at,:content,:type)
     json.created_time_ago distance_of_time_in_words_to_now(photo_tip.created_at)
     json.user_id photo_tip.user_id
     json.branch_id photo_tip.branch_id
     json.delete_url delete_photo_tip_tip_url(@tip,:format=>"json")
 json.thumbnail_url photo_tip.photo.image.url(:thumb)
 json.photo_url photo_tip.photo.image.url(:croppable)