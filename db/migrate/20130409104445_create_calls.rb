class CreateCalls < ActiveRecord::Migration
  def change
    create_table :calls do |t|
      t.integer :caller_id
      t.integer :callee_id
      t.belongs_to :branch
      t.string  :token
      t.integer :sid
      t.string  :state
      t.timestamps
    end
    add_index :calls, :caller_id
    add_index :calls, :callee_id
    add_index :calls, :sid
    add_index :calls, :branch_id
    add_index :calls, [:caller_id,:callee_id,:branch_id],:unique=>true
  end
end
