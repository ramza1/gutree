namespace :java do
  desc "Install java"
  task :install, roles: :app do
    #run "#{sudo} add-apt-repository ppa:webupd8team/java"
    #run "#{sudo} apt-get -y update"
    #run "#{sudo} apt-get -y install oracle-java7-installer"   
  end
  after "deploy:install", "java:install"
end
