   json.(link_tip,:id,:created_at,:content,:type)
     json.created_time_ago distance_of_time_in_words_to_now(link_tip.created_at)
     json.user_id link_tip.user_id
     json.branch_id link_tip.branch_id
     json.delete_url delete_link_tip_tip_url(link_tip,:format=>"json")
     json.url link_tip.link.url