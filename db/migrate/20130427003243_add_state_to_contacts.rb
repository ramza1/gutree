class AddStateToContacts < ActiveRecord::Migration
  def change
    rename_column :contacts, "presence", "state"
    change_column :contacts, "state", :integer
  end
end
