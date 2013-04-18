namespace :ejabberd do
  desc "Install ejabberd"
  task :install, roles: :app do
    run "#{sudo} apt-get -y install ejabberd"
    #"198.199.75.76  antrees.com  antrees"
  end
  after "deploy:install", "ejabberd:install"
end
