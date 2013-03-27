class UsersController < ApplicationController
  before_filter :authenticate_user!
  before_filter :check_state ,:only=>[:home,:show]
  def home
  end

  def edit

  end

  def change_photo
    logger.info "successful upload..."
    respond_to do |format|
      if current_user.update_attribute("photo",params["photo"])
        format.html { redirect_to user_root_url, notice: 'Profile updated.' }
        format.json { render json: { :photo_url => current_user.photo.url(:thumb)}.to_json }
      else
        format.html { render action: "edit" }
        format.json { render json: current_user.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    current_user.current_state=User::INITIALIZED
    respond_to do |format|
      if current_user.update_attributes(params[:user])
        format.html { redirect_to user_root_url, notice: 'Profile updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: current_user.errors, status: :unprocessable_entity }
      end
    end
  end

  def check_state
    if current_user.initializing?
      redirect_to edit_user_path(current_user)
    end
  end
end
