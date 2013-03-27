class Link < ActiveRecord::Base
  attr_accessible :url
  validates :url,:url => {:allow_nil=>false,:allow_blank=>false}
  belongs_to :media ,:polymorphic=>true
end
