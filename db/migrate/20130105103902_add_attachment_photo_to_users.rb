class AddAttachmentPhotoToUsers < ActiveRecord::Migration
  def self.up
    change_table :users do |t|
      t.attachment :photo_tips
    end
  end

  def self.down
    drop_attached_file :users, :photo_tips
  end
end
