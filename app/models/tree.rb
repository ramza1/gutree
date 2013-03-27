class Tree < ActiveRecord::Base
  UNINITIALIZED = 0
  INITIALIZING = 1
  INITIALIZED = 2
  attr_accessible :name,:about,:established,:tag_list
  validates :domain,:presence => true
  validates :name, :presence => true , :if=>:initialized?

  has_many :affiliations,:dependent => :destroy ,:as=>:entity
  has_many :users, :through => :affiliations, :order => 'name'
  has_many :administrations,:dependent => :destroy ,:as=>:entity

  has_many :admins, :through => :administrations, :source => :user, :order => 'name'

  has_many :memberships, :dependent => :destroy ,:as=>:entity
  has_many :members, :through => :memberships, :source => :user
  has_many :branches,:dependent => :destroy

  has_attached_file :photo,:styles => {:icon=>"50x50#",:thumb => "200x297>", :croppable => '600x600>'},
                    :path => ":rails_root/public/system/:attachment/:id/:style/:filename",
                    :url => "/system/:attachment/:id/:style/:filename"

  after_create :update_state_initializing

  has_many :taggings , :as=>:taggable
  has_many :tags, :through=>:taggings

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
    self.current_state == INITIALIZING
  end
  def initialized?
    self.current_state == INITIALIZED
  end

  def update_state_initializing
    self.current_state = INITIALIZING
    self.save
  end
end
