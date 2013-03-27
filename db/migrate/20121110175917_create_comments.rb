class CreateComments < ActiveRecord::Migration
  def change
    create_table :comments do |t|
      t.text :body
      t.belongs_to :user
      t.belongs_to :tip

      t.timestamps
    end
    add_index :comments, :user_id
    add_index :comments, :tip_id
  end
end
