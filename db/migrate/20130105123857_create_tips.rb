class CreateTips < ActiveRecord::Migration
  def change
    create_table :tips do |t|
      t.belongs_to :branch
      t.belongs_to :user
      t.text :content
      t.string :link
      t.string :type
      t.boolean :published,:default=>false
      t.timestamps
    end
    add_index :tips, :branch_id
    add_index :tips, :user_id
  end
end
