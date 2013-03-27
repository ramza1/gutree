source 'https://rubygems.org'

gem 'rails', '3.2.8'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'


# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'

  gem 'therubyrhino' , :platforms => :jruby
  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyracer', :platforms => :ruby
  gem 'twitter-bootstrap-rails'
  gem 'less-rails' , :platforms => :ruby
  gem 'uglifier', '>= 1.0.3'
end


platform :jruby do
  gem 'jruby-openssl'
  gem 'activerecord-jdbcmysql-adapter'
  #gem 'twitter-bootstrap-rails', :github => 'seyhunak/twitter-bootstrap-rails'
end

platform :ruby do
  gem 'mysql2'
  gem "typhoeus", "~> 0.5.3"
  gem 'yajl-ruby', :require => 'yajl'

end

gem 'jquery-rails'
gem 'jquery-ui-rails'
gem 'attr_encrypted'
gem 'cancan'
gem 'devise'
gem 'similus'
gem 'ancestry'
gem 'paperclip'
gem 'omniauth-google-oauth2'
gem 'chosen-rails'
gem 'remotipart'
gem 'delayed_job_active_record'
gem 'simple_form'
gem 'rest-client'
gem 'state_machine'
gem 'hpricot'
gem 'valid_email'
gem 'validate_url'
gem 'will_paginate'
# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
#gem 'capistrano'

# To use debugger
# gem 'debugger'
