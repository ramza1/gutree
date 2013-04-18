class CreateContacts < ActiveRecord::Migration
  def change
    create_table :contacts do |t|
      t.belongs_to :user
      t.belongs_to :branch
      t.string :jid
      t.string :presence
      t.string :show
      t.timestamps
    end
    add_index :contacts, :branch_id
    add_index :contacts, :user_id
    add_index :contacts, :jid
  end
end
