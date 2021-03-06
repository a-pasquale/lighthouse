collection @klasses

attributes  :id,
            :description,
            :time,
            :name,
            :instructor,
            :created_at,
            :google_drive_url,
            :weekdays,
            :seasons,
            :years,
            :instructor_email,
            :instructor_phone,
            :one_on_one,
            :location,
            :archive

node :enroll_id do |klass|
  klass.enroll_id(@user)
end

node :is_enrolled do |klass|
  klass.is_enrolled?(@user)
end

node :completed do |klass|
  klass.completed?(@user)
end
