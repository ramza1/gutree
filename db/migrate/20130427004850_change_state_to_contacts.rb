class ChangeStateToContacts < ActiveRecord::Migration
  def change
    remove_column :contacts,  :state , :integer
  end
end
