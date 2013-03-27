class Category < ActiveRecord::Base
  attr_accessible :description, :name
  has_many :category_branches
  has_many :branches, :through =>  :category_branches
end
