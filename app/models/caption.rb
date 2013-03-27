class Caption < ActiveRecord::Base
  attr_accessible :photo_tips
  has_attached_file :photo_tips,:styles => {:icon_32 =>"32x32",:icon_48 =>"48x48", :thumb => "200x297>"}
  belongs_to :captionable, :polymorphic => true
end
