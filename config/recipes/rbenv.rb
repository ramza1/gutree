set_default :ruby_version, "2.0.0-rc2"

namespace :rbenv do
  desc "Install rbenv, Ruby, and the Bundler gem"
  task :install, roles: :app do
    run "#{sudo} apt-get -y install vim tmux curl git-core xclip"
    run "#{sudo} apt-get -y install xclip"
    run %q{echo "alias clipboard='xclip -sel clip'" >> ~/.bashrc}
    run "git clone git://github.com/sstephenson/rbenv.git .rbenv"
    run "%q{echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc}"
    run "%q{echo 'eval "$(rbenv init -)"' >> ~/.bashrc}"
    run "exec $SHELL"
    run "mkdir -p ~/.rbenv/plugins"
    run "cd ~/.rbenv/plugins"
    run "git clone git://github.com/sstephenson/ruby-build.git"
    run "%q{echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc}"
    run "exec $SHELL"
    run "#{sudo} apt-get -y install zlib1g-dev build-essential libssl-dev libreadline-dev"
    run "rbenv install #{ruby_version}"
    run "rbenv global #{ruby_version}"
    run "gem install bundler --no-ri --no-rdoc"
  end
  after "deploy:install", "rbenv:install"
end
