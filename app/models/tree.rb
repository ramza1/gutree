class Tree < ActiveRecord::Base
  attr_accessible :about,:established,:tag_list
  validates :domain,:presence => true

  has_many :affiliations,:dependent => :destroy ,:as=>:entity
  has_many :users, :through => :affiliations, :order => 'name'
  has_many :administrations,:dependent => :destroy ,:as=>:entity

  has_many :admins, :through => :administrations, :source => :user, :order => 'name'

  has_many :memberships, :dependent => :destroy ,:as=>:entity
  has_many :members, :through => :memberships, :source => :user
  has_many :branches,:dependent => :destroy

  has_attached_file :photo,:styles => {:icon=>"50x50#",:thumb => "200x297>", :croppable => '600x600>'}

  after_create :update_state_initializing

  has_many :taggings , :as=>:taggable
  has_many :tags, :through=>:taggings

  state_machine initial: :uninitialized   do

    event :initialized do
      transition :initializing => :initialized
    end

    event :initializing do
      transition :uninitialized => :initializing
      transition :initialized => :initializing
    end

    event :uninitialized do
      transition :initializing => :uninitialized
      transition :initialized => :uninitialized
    end
  end

  def admin?(user, exclude_global_admins=false)
    Affiliation::Administration.new
    if user
      if exclude_global_admins
        admins.include? user
      else
        user.admin?(:manage_branches) or admins.include? user
      end
    end
  end

  def tag_list
    if(!tags.empty?)
      tags.map(&:name).join(",")
    else
      ""
    end
  end

  def tag_list=(names)
    self.tags = names.split(",").map do |n|
      logger.info"tag:#{n.strip}"
      Tag.where(name: n.strip).first_or_create!
    end
  end

  def domain_from_email(domain)
      domain.split("@").last
  end

  def initializing?
    self.state == "initializing"
  end

  def initialized?
    self.state == "initialized"
  end

  def update_state_initializing
    self.initializing
  end
end
