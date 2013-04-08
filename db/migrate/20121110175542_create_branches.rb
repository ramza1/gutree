class CreateBranches < ActiveRecord::Migration
  def change
    create_table :branches do |t|
      t.belongs_to :tree
      t.string :name
      t.text :description
      t.integer :memberships_count, default: 0
      t.integer :administrations_count, default: 0
      t.boolean :private,default:false
      t.string :state
      t.timestamps
    end
    add_index :branches, :tree_id
    add_index :branches, :name
    add_index :branches, [:name,:tree_id],:unique=>true
  end
end
