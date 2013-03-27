class CreateAffiliations < ActiveRecord::Migration
  def change
    create_table :affiliations do |t|
      t.belongs_to :entity ,:polymorphic=>true
      t.belongs_to :user
      t.string :type
      t.integer :code
      t.timestamps
    end

    add_index :affiliations, :user_id
    add_index :affiliations, :entity_id
    add_index :affiliations, :entity_type
    add_index :affiliations, :type
  end
end
