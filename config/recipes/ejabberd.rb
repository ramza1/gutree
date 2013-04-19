namespace :ejabberd do
  desc "Setting up ejabbered."
  task :setup, roles: :app do
    run "mkdir -p #{shared_path}/ejabberd"
    template "ejabberd.cfg.erb", "/tmp/ejabberd.cfg"
    run "#{sudo} mv /tmp/ejabberd.cfg /etc/ejabberd/ejabberd.cfg"
    template "ejabberd_auth.rb.erb", "#{shared_path}/ejabberd/ejabberd_auth.rb"
    run "#{sudo} chmod +x #{shared_path}/ejabberd/ejabberd_auth.rb"
  end
  
  after "deploy:setup", "ejabberd:setup"
  
  %w[start stop restart].each do |command|
    desc "#{command} ejabberd"
    task command, roles: :app do
      run "#{sudo} /etc/init.d/ejabberd #{command}"
    end
  end
end
