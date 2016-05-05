class ActionItem < ActiveRecord::Base

  default_scope { order(due_date: :asc, created_at: :asc) }

  belongs_to :meeting
  belongs_to :goal
  belongs_to :user # Advisor
  has_one :owner, through: :meeting, source: :user # Student

  def owner_name
    owner.full_name
  end

end
