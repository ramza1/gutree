class UserPresence < ActiveRecord::Base
  attr_accessible :presence_type
  belongs_to :entity ,:polymorphic=>true
  belongs_to :user
  validates_uniqueness_of :entity_id, :scope => [:user_id,:type]
end
