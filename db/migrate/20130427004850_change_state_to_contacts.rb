class ChangeStateToContacts < ActiveRecord::Migration
  def change
    add_column :contacts,  :state , :integer
  end
end
