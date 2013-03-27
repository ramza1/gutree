class CreateTreeRequests < ActiveRecord::Migration
  def change
    create_table :tree_requests do |t|
      t.string :token
      t.string :recipient_email
      t.integer :user_id
      t.timestamps
    end
    add_index :tree_requests, :token,:unique=>true
    add_index :tree_requests, :user_id
    add_index :tree_requests, :recipient_email
  end
end
