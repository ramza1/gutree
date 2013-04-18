class AddAffiliationToContacts < ActiveRecord::Migration
  def change
    add_column :contacts, :affiliation, :string
  end
end
