json.params @data[:params]
json.count  @data[:count]
json.remaining @data[:remaining]
json.empty  @data[:empty]
json.tips @tips do|json,tip|
    json.partial! tip
end
