class AddAttachmentPhotoToTrees < ActiveRecord::Migration
  def self.up
    change_table :trees do |t|
      t.attachment :photo
    end
  end

  def self.down
    drop_attached_file :trees, :photo
  end
end
