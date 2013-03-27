class BranchNameValidator < ActiveModel::EachValidator
  def validate_each(record,attr,val)
    if record.is_root?
      record.errors[attr] << "is already taken." unless
      !record.tree.branches.where("name = :name",:name => val).exists?
    else
    record.errors[attr] << "is already taken." unless
    record.parent.name!=record.name && !record.parent.children.exists?(:name =>val)
    end
  end
end