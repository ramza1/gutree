class ChangeCallColumnTypes < ActiveRecord::Migration
  def change
     change_column :calls,:sid, :string
     change_column :calls,:token, :text
   end
end
