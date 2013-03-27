class CreateTrees < ActiveRecord::Migration
  def change
    create_table :trees do |t|
      t.string :domain
      t.string :name
      t.string :about
      t.date :established
      t.integer :memberships_count, default: 0
      t.integer :administrations_count, default: 0
      t.integer :current_state,:default=>0
      t.boolean :private,:default=>false
      t.timestamps
    end
    add_index :trees, :domain,:unique=>true
  end
end
