class AddStateToContacts < ActiveRecord::Migration
  def change
    remove_column :contacts, :presence
  end
end
