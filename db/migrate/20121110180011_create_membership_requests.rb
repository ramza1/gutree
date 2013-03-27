class CreateMembershipRequests < ActiveRecord::Migration
  def change
    create_table :membership_requests do |t|
      t.belongs_to :user
      t.belongs_to :branch

      t.timestamps
    end
    add_index :membership_requests, [:user_id,:branch_id],:unique => true
    add_index :membership_requests, :user_id
    add_index :membership_requests, :branch_id
  end
end
