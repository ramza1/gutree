class Photo < ActiveRecord::Base
  attr_accessible :image
  has_attached_file :image,:styles => {:icon=>"50x50#",:thumb => "200x297>", :croppable => '600x600>'},
                    :path => ":rails_root/public/system/:attachment/:id/:style/:filename",
                    :url => "/system/:attachment/:id/:style/:filename"
  belongs_to :media ,:polymorphic=>true
end
