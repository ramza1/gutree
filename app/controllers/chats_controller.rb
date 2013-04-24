require "ruby_bosh"
class ChatsController < ApplicationController

  def connect
    current_user.ensure_authentication_token!
    begin
      logger.info "authenticating #{current_user.id} with password #{current_user.authentication_token}"
      @session_jid, @session_id, @session_random_id =
      RubyBOSH.initialize_session("#{current_user.id}@antrees.com",current_user.authentication_token, "http://localhost:5280/http-bind")
         # RubyBOSH.initialize_session("paul@rzaartz.local","foo", "http://localhost:5280/http-bind")
      render :json => {
          :jid=>@session_jid,
          :sid=>@session_id,
          :rid=>@session_random_id,
          :user=>{
              :name=>current_user.name,
              :id=>current_user.id
          }
      }, :status => 200
    rescue Exception => e
      logger.info "Error connecting:,#{e.message}"
    logger.warn $!.backtrace.collect { |b| " > #{b}" }.join("\n")
        render :json => {:error=>"failed"}, :status => 404
    end
  end

end
