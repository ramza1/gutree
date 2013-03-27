class MembershipRequest < ActiveRecord::Base
  belongs_to :user
  belongs_to :branch
  # attr_accessible :title, :body
end
