class CategoryBranch < ActiveRecord::Base
  belongs_to :category
  belongs_to :branch
  # attr_accessible :title, :body
end
