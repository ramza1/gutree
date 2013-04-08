class AddAttachmentPhotoToBranches < ActiveRecord::Migration
  def self.up
    change_table :branches do |t|
      t.has_attached_file :photo
    end
  end

  def self.down
    drop_attached_file :branches, :photo
  end
end
