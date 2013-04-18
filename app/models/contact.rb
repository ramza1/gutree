class Contact < ActiveRecord::Base
  attr_accessible :jid, :presence,:show,:affiliation
  belongs_to :user
  belongs_to :branch
  scope :online, where(:presence => "available")
end
