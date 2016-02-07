require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Compass
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Do not swallow errors in after_commit/after_rollback callbacks.
    config.active_record.raise_in_transactional_callbacks = true

    config.assets.paths << Rails.root.join('vendor', 'assets', 'components')

    config.action_view.field_error_proc = Proc.new { |html_tag, instance| 

      if(instance.class.to_s.eql?("ActionView::Helpers::Tags::Label"))
        html_tag << "<span class=\"error-message\">#{instance.error_message.join(" and ")}</span>".html_safe
      else
        field = html_tag.split(" ")
        pos = field.count - 1
        field.insert(pos, "class=\"invalid\"")
        html_tag = field.join(" ")
      end

      html_tag.html_safe

    }

  end
end
