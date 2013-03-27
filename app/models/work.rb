class Work < ActiveRecord::Base
  attr_accessible :job_title,:department
  belongs_to :profile
end
