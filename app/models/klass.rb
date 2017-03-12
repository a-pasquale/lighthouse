class Klass < ActiveRecord::Base

  include PgSearch
  pg_search_scope :default_search, :against => [:name, :description, :instructor, :weekday, :time, :year, :season], :using => {:tsearch => {:prefix => true}}
  default_scope { order(created_at: :desc) }

  VALID_WEEKDAYS_TYPES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  VALID_SEASON_TYPES = ['Fall', 'Winter', 'Spring', 'Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5']

  has_many :enrolls, dependent: :destroy
  has_many :users, through: :enrolls
  accepts_nested_attributes_for :enrolls, allow_destroy: true

  validates :name, presence: { message: 'Title is required' }

  def enrolled_count
    self.enrolls.count
  end

  def is_enrolled?(user)
    enrolls.find_by(user_id: user.id).present?
  end

  def enroll_id(user)
    enrolls.find_by(user_id: user.id).try(:id)
  end

  def completed?(user)
    enrolls.find_by(user_id: user.id, completed: true).present?
  end

end
