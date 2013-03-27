class Tip < ActiveRecord::Base
  belongs_to :branch
  belongs_to :user
  TYPES=["photo_tips","link"]
  attr_accessible :categories_list, :content,:categories,:type
  #validates :content,:presence => true
  #validates_inclusion_of :type, :in =>TYPES, :message => 'unsupported type'

  has_many :comments

  scope :latest, limit(1).order("created_at desc").includes(:user)
  has_many :taggings , :as=>:taggable
  has_many :categories,:class_name=>"Tag",:foreign_key=>"tag_id",:source=>:tag,:through=>:taggings

  def categories_list
    if(!categories.empty?)
      categories.map(&:name).join(",")
    else
      ""
    end
  end

  def categories_list=(names)
    self.categories = names.split(",").map do |n|
      logger.info"tag:#{n.strip}"
      Tag.where(name: n.strip).first_or_create!
    end
  end


end

class PhotoTip < Tip
  has_one :photo,:as=>:media,:dependent=>:destroy
end

class LinkTip < Tip
  has_one :link,:as=>:media,:dependent=>:destroy
end