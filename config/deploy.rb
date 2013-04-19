require "bundler/capistrano"

load "config/recipes/base"
load "config/recipes/ejabberd"
load "config/recipes/rbenv"
load "config/recipes/jruby"
load "config/recipes/nginx"
load "config/recipes/unicorn"
load "config/recipes/postgresql"
load "config/recipes/nodejs"
load "config/recipes/check"

server "198.199.75.76", :web, :app, :db, primary: true

set :user, "deployer"
set :application, "antrees"
set :deploy_to, "/home/#{user}/apps/#{application}"
set :deploy_via, :remote_cache
set :use_sudo, false

set :scm, "git"
set :repository, "ssh://sls@slsapp.com:1234/gutrees/gutrees.git"
set :scm_username, "evenmatrix@gmail.com"
set :branch, "master"
set :git_enable_submodules, 1

default_run_options[:pty] = true
ssh_options[:forward_agent] = true



after "deploy", "deploy:cleanup" # keep only the last 5 releases
