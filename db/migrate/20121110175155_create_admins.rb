class CreateAdmins < ActiveRecord::Migration
  def change
    create_table :admins do |t|
      t.boolean :manage_branches, default: false

      t.timestamps
    end
  end
end
