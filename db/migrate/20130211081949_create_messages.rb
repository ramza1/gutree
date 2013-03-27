class CreateMessages < ActiveRecord::Migration
  def change
    create_table :messages do |t|
      t.integer :sender_id
      t.belongs_to :recipient ,:polymorphic=>true
      t.boolean :read,:default =>false
      t.string :thread
      t.string :type
      t.text :body
      t.string :subject
      t.timestamps
    end
    add_index :messages, :sender_id
    add_index :messages, :recipient_id
  end
end
