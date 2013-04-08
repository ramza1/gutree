# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130224053950) do

  create_table "admins", :force => true do |t|
    t.boolean  "manage_branches", :default => false
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
  end

  create_table "affiliations", :force => true do |t|
    t.integer  "entity_id"
    t.string   "entity_type"
    t.integer  "user_id"
    t.string   "type"
    t.integer  "code"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "affiliations", ["entity_id"], :name => "index_affiliations_on_entity_id"
  add_index "affiliations", ["entity_type"], :name => "index_affiliations_on_entity_type"
  add_index "affiliations", ["type"], :name => "index_affiliations_on_type"
  add_index "affiliations", ["user_id"], :name => "index_affiliations_on_user_id"

  create_table "branches", :force => true do |t|
    t.integer  "tree_id"
    t.string   "name"
    t.text     "description"
    t.integer  "memberships_count",     :default => 0
    t.integer  "administrations_count", :default => 0
    t.boolean  "private",               :default => false
    t.string   "state"
    t.datetime "created_at",                               :null => false
    t.datetime "updated_at",                               :null => false
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  add_index "branches", ["name", "tree_id"], :name => "index_branches_on_name_and_tree_id", :unique => true
  add_index "branches", ["name"], :name => "index_branches_on_name"
  add_index "branches", ["tree_id"], :name => "index_branches_on_tree_id"

  create_table "comments", :force => true do |t|
    t.text     "body"
    t.integer  "user_id"
    t.integer  "tip_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "comments", ["tip_id"], :name => "index_comments_on_tip_id"
  add_index "comments", ["user_id"], :name => "index_comments_on_user_id"

  create_table "delayed_jobs", :force => true do |t|
    t.integer  "priority",   :default => 0
    t.integer  "attempts",   :default => 0
    t.text     "handler"
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  add_index "delayed_jobs", ["priority", "run_at"], :name => "delayed_jobs_priority"

  create_table "links", :force => true do |t|
    t.string   "url"
    t.integer  "media_id"
    t.string   "media_type"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "membership_requests", :force => true do |t|
    t.integer  "user_id"
    t.integer  "branch_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "membership_requests", ["branch_id"], :name => "index_membership_requests_on_branch_id"
  add_index "membership_requests", ["user_id", "branch_id"], :name => "index_membership_requests_on_user_id_and_branch_id", :unique => true
  add_index "membership_requests", ["user_id"], :name => "index_membership_requests_on_user_id"

  create_table "messages", :force => true do |t|
    t.integer  "sender_id"
    t.integer  "recipient_id"
    t.string   "recipient_type"
    t.boolean  "read",           :default => false
    t.string   "thread"
    t.string   "type"
    t.text     "body"
    t.string   "subject"
    t.datetime "created_at",                        :null => false
    t.datetime "updated_at",                        :null => false
  end

  add_index "messages", ["recipient_id"], :name => "index_messages_on_recipient_id"
  add_index "messages", ["sender_id"], :name => "index_messages_on_sender_id"

  create_table "photos", :force => true do |t|
    t.integer  "media_id"
    t.string   "media_type"
    t.datetime "created_at",         :null => false
    t.datetime "updated_at",         :null => false
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
  end

  create_table "taggings", :force => true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  add_index "taggings", ["tag_id"], :name => "index_taggings_on_tag_id"
  add_index "taggings", ["taggable_id"], :name => "index_taggings_on_taggable_id"

  create_table "tags", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "tips", :force => true do |t|
    t.integer  "branch_id"
    t.integer  "user_id"
    t.text     "content"
    t.string   "link"
    t.string   "type"
    t.boolean  "published",  :default => false
    t.datetime "created_at",                    :null => false
    t.datetime "updated_at",                    :null => false
  end

  add_index "tips", ["branch_id"], :name => "index_tips_on_branch_id"
  add_index "tips", ["user_id"], :name => "index_tips_on_user_id"

  create_table "tree_requests", :force => true do |t|
    t.string   "token"
    t.string   "recipient_email"
    t.integer  "user_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "tree_requests", ["recipient_email"], :name => "index_tree_requests_on_recipient_email"
  add_index "tree_requests", ["token"], :name => "index_tree_requests_on_token", :unique => true
  add_index "tree_requests", ["user_id"], :name => "index_tree_requests_on_user_id"

  create_table "trees", :force => true do |t|
    t.string   "domain"
    t.string   "about"
    t.date     "established"
    t.integer  "memberships_count",     :default => 0
    t.integer  "administrations_count", :default => 0
    t.string   "state"
    t.boolean  "private",               :default => false
    t.datetime "created_at",                               :null => false
    t.datetime "updated_at",                               :null => false
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  add_index "trees", ["domain"], :name => "index_trees_on_domain", :unique => true

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "state"
    t.string   "authentication_token"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
