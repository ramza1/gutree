set_default :jruby_version, "jruby-1.7.3"

namespace :jruby do
  desc "Install jruby"
  task :install, roles: :web do
    run "rbenv install #{ruby_version}"
    run "jruby -S gem install bundler --no-ri --no-rdoc"
  end
  after "java:install", "jruby:install"
end
