require 'valid_email'
class TreeRequest < ActiveRecord::Base
  include ActiveModel::Validations
  attr_accessible :recipient_email,:token
  validates :email, :presence => true, :email => true
  belongs_to :user


  before_create :generate_token
  after_create :send_mail


  def send_confirmation
    mail = TreeMailer.confirmation(self)
    mail.deliver
  end
  private
  def generate_token
    self.token = Digest::SHA1.hexdigest([Time.now, rand].join)
  end
end
