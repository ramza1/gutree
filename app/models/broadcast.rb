class Broadcast < ActiveRecord::Base
  belongs_to :branch
  belongs_to :user
  attr_accessible :message, :title, :photo_tips
  has_many :comments
  has_attached_file :photo_tips, :styles => {:thumb => "400x400>"}

  after_create :send_mail_to_members


  def send_mail_to_members
    broadcast = self
    self.branch.users.find_each do |user|
       News.delay.news_info(user, broadcast)
    end
  end
end
