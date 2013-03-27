  json.(@branch,:created_at,:name,:memberships_count)
    json.branch_url branch_url @branch
    json.sub_tree_size @branch.descendants.count
    json.created_time_ago distance_of_time_in_words_to_now(@branch.created_at)
    json.icon_url @branch.photo.url(:icon)
    json.tree_id @branch.tree_id
    json.collection_url   all_branches_tree_url @tree
    if @latest_tip
    json.latest  do|json|
        json.(@latest_tip,:created_at,:title)
        json.icon_url @latest_tip.photo.url(:icon)
        json.human_time @latest_tip.created_at.strftime("%H:%M")
    end
   end