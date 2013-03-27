  json.partial! @tip
  json.update_url tip_url(@tip,:format=>"json")
  json.publish_url publish_tip_url(@tip,:format=>"json")
  json.partial! json_partial_for_tip_type(@tip.type)  if @tip.type