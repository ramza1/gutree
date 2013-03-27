class CreateBranches < ActiveRecord::Migration
  def change
    create_table :branches do |t|
      t.belongs_to :tree
      t.string :name
      t.text :description
      t.integer :memberships_count, default: 0
      t.integer :administrations_count, default: 0
      t.boolean :private,default:false
      t.integer :current_state,:default=>0
      t.string :ancestry
      t.timestamps
    end
    add_index :branches, :ancestry
    add_index :branches, :name
  end
end
