  json.(tip,:id,:created_at,:content,:type,:link)
    json.created_time_ago distance_of_time_in_words_to_now(tip.created_at)
    json.user_id tip.user_id
    json.branch_id tip.branch_id