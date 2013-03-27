class Comment < ActiveRecord::Base
  belongs_to :user
  belongs_to :broadcast, :counter_cache => true
  attr_accessible :body
  validates :user_id, :broadcast_id, :body, :presence => true
end
