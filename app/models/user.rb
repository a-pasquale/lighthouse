class User < ActiveRecord::Base
  include BCrypt
  include PgSearch
  pg_search_scope :default_search, :against => [:first_name, :last_name, :username], :using => {:tsearch => {:prefix => true} }
  default_scope { order(first_name: :asc) }

  scope :students, -> { where(role: 'student' ) }
  has_one :portfolio, dependent: :destroy
  has_many :feedbacks, dependent: :destroy
  has_many :resources, dependent: :destroy
  has_many :meetings, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :enrolls, dependent: :destroy
  has_many :klasses, through: :enrolls
  has_many :completed_klasses, -> { joins(:enrolls).where(enrolls: { completed: true}).uniq }, through: :enrolls, source: :klass
  has_many :uncompleted_klasses, -> { joins(:enrolls).where(enrolls: { completed: [false, nil]}).uniq }, through: :enrolls, source: :klass
  has_many :all_action_items, through: :meetings, source: :action_items
  has_many :action_items, -> { joins(:meeting).where(user_id: [nil, ''], meetings: { draft: false }) }, through: :meetings
  has_many :social_mediums, dependent: :destroy
  has_many :admin_action_items, foreign_key: 'user_id', class_name: 'ActionItem'
  has_many :resume_entries, dependent: :destroy
  has_many :projects, dependent: :destroy
  has_many :tags, through: :projects
  has_many :children, class_name: 'Parent'
  has_many :students, through: :children
  has_many :guardians, foreign_key: 'student_id', class_name: 'Parent'
  has_many :parents, through: :guardians, source: :user
  after_create :create_portfolio

  validates :first_name, presence: { message: 'First name is required' }
  validates :last_name, presence: { message: 'Last name is required' }
  validates :username,
    presence: { message: 'Username is required' },
    uniqueness: { message: 'Username is already in use.', case_sensitive: false },
    format: { with: /\A[\w]+\z/, message: 'Letters and numbers only' }
  validates :email,
    presence: { message: 'Email is required.' },
    uniqueness: { message: 'Email is already in use.', case_sensitive: false }
  validates :password,
    presence: { message: 'Password is required.', on: :create },
    confirmation: {message: 'Passwords do not match.'}
  validates :role, presence: { message: 'Role is required.' }

  has_attached_file :profile_background, :default_url => 'tibetan-mountains.jpg'
  validates_attachment_content_type :profile_background, :content_type => /\Aimage\/.*\Z/

  delegate :avatar, :thumb_avatar_url, to: :portfolio, allow_nil: true


  def self.authenticate(username_email, password)
    username_email.downcase!
    user = User.where('email = ? or username = ?', username_email, username_email).first
    user if user && user.pword == password
  end

  def draft_meeting
    meetings.where(draft: true).first
  end

  def full_name
    "#{self.first_name} #{self.last_name}"
  end

  def admin?
    role == 'admin'
  end

  def parent?
    role == 'parent'
  end

  def student?
    role == 'student'
  end

  def pword
    @pword ||= Password.new(password)
  end

  def pword=(new_password)
    @pword = Password.create(new_password)
    self.password = @pword
    self.password_confirmation = @pword
  end

  def enroll_id(klass)
    Enroll.find_by(klass_id: klass.id, user_id: id).try(:id)
  end

  def reset_password
    new_password = ('a'..'z').to_a.shuffle[0,12].join
    self.pword= new_password
    self.save
    UserMailer.reset_password(self, new_password).deliver_now
  end

  before_save do
    self.email.downcase! if self.email.present?
    self.username.downcase! if self.username.present?
    if self.archive && self.archive_changed?
      self.all_action_items.where('action_items.user_id is not null').destroy_all
      self.enrolls.update_all(completed: true)
    end
  end

  before_create do
    if valid?
      @pword = Password.create(password)
      self.password = @pword
      self.password_confirmation = @pword
    end
  end

end
