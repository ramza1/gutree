class BranchNameValidator < ActiveModel::EachValidator
  def validate_each(record,attr,val)
    if record.is_root?
      if record.new_record?
      record.errors[attr] << "is already taken." unless
          !record.tree.branches.where("name = :name ",:name => val).exists?
      else
        record.errors[attr] << "is already taken." unless
            !record.tree.branches.where("name = :name AND id != :id ",:name => val,:id=>record.id).exists?
      end
    else
      record.errors[attr] << "is already taken." unless
          record.parent.name!=record.name && !record.parent.children.exists?(:name =>val)
    end
  end
end

class Branch < ActiveRecord::Base
  UNINITIALIZED = 0
  INITIALIZING = 1
  INITIALIZED = 2
  attr_accessible :name,:description,:tag_list,:private;
  validates :name,:presence => true
  validates :name,:branch_name=>true
  has_ancestry
  has_many :membership_requests, :dependent => :destroy ,:conditions => :private
  belongs_to :tree
  has_many :affiliations,:dependent => :destroy
  has_many :administrations, :dependent => :destroy ,:as=>:entity
  has_many :memberships, :dependent => :destroy ,:as=>:entity
  has_one  :ownership, :dependent => :destroy  ,:as=>:entity
  has_one  :management, :dependent => :destroy  ,:as=>:entity
  has_many :user_presences,:dependent=>:destroy
  has_many :admins, :through => :administrations, :source => :user
  has_many :members, :through => :memberships, :source => :user
  has_one :owner, :through => :ownership, :source => :user
  has_one :manager, :through => :management, :source => :user

  has_many :taggings , :as=>:taggable
  has_many :tags, :through=>:taggings

  has_many :tips,:dependent=>:destroy,:conditions => { :published => true }

  has_attached_file :photo,:styles => {:icon=>"50x50#",:icon_2x=>"100x100#",:thumb => "200x297>", :croppable => '600x600>'},
                    :path => ":rails_root/public/system/:attachment/:id/:style/:filename",
                    :url => "/system/:attachment/:id/:style/:filename"
  has_one :caption ,:as => :captionable

  after_create :update_state_initializing

  def admin?(user, exclude_global_admins=false)
    if user
      if exclude_global_admins
        admins.include? user
      else
        user.admin?(:manage_branches) or admins.include? user
      end
    end
  end

  def last_admin?(user)
    user and admin?(user, :exclude_global_admins) and admins.length == 1
  end


  def self.tagged_with(name)
    Tag.find_by_name!(name).articles
  end

  def self.tag_counts
    Tag.select("tags.*, count(taggings.tag_id) as count").
        joins(:taggings).group("taggings.tag_id")
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

  def root?
    parent_id.blank?
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
