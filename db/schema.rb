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
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150606201124) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "courses", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "name"
    t.string   "description"
    t.string   "category"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "courses", ["user_id"], name: "index_courses_on_user_id", using: :btree

  create_table "experiences", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "topic_id"
    t.string   "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "experiences", ["topic_id"], name: "index_experiences_on_topic_id", using: :btree
  add_index "experiences", ["user_id"], name: "index_experiences_on_user_id", using: :btree

  create_table "portfolio2_courses", force: :cascade do |t|
    t.integer  "portfolio_id"
    t.integer  "course_id"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  add_index "portfolio2_courses", ["course_id"], name: "index_portfolio2_courses_on_course_id", using: :btree
  add_index "portfolio2_courses", ["portfolio_id"], name: "index_portfolio2_courses_on_portfolio_id", using: :btree

  create_table "portfolio2_experiences", force: :cascade do |t|
    t.integer  "portfolio_id"
    t.integer  "experience_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  add_index "portfolio2_experiences", ["experience_id"], name: "index_portfolio2_experiences_on_experience_id", using: :btree
  add_index "portfolio2_experiences", ["portfolio_id"], name: "index_portfolio2_experiences_on_portfolio_id", using: :btree

  create_table "portfolios", force: :cascade do |t|
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "portfolios", ["user_id"], name: "index_portfolios_on_user_id", using: :btree

  create_table "student2_courses", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "course_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "student2_courses", ["course_id"], name: "index_student2_courses_on_course_id", using: :btree
  add_index "student2_courses", ["user_id"], name: "index_student2_courses_on_user_id", using: :btree

  create_table "topic2_courses", force: :cascade do |t|
    t.integer  "topic_id"
    t.integer  "course_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "topic2_courses", ["course_id"], name: "index_topic2_courses_on_course_id", using: :btree
  add_index "topic2_courses", ["topic_id"], name: "index_topic2_courses_on_topic_id", using: :btree

  create_table "topics", force: :cascade do |t|
    t.string   "description"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.string   "title"
  end

  create_table "user2_topics", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "topic_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "user2_topics", ["topic_id"], name: "index_user2_topics_on_topic_id", using: :btree
  add_index "user2_topics", ["user_id"], name: "index_user2_topics_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "username"
    t.string   "email"
    t.string   "password"
    t.string   "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "courses", "users"
  add_foreign_key "experiences", "topics"
  add_foreign_key "experiences", "users"
  add_foreign_key "portfolio2_courses", "courses"
  add_foreign_key "portfolio2_courses", "portfolios"
  add_foreign_key "portfolio2_experiences", "experiences"
  add_foreign_key "portfolio2_experiences", "portfolios"
  add_foreign_key "portfolios", "users"
  add_foreign_key "student2_courses", "courses"
  add_foreign_key "student2_courses", "users"
  add_foreign_key "topic2_courses", "courses"
  add_foreign_key "topic2_courses", "topics"
  add_foreign_key "user2_topics", "topics"
  add_foreign_key "user2_topics", "users"
end
