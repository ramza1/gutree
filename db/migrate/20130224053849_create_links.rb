class CreateLinks < ActiveRecord::Migration
  def change
    create_table :links do |t|
      t.string :url
      t.belongs_to :media ,:polymorphic=>true
      t.timestamps
    end
  end
end
