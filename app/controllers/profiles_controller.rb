class ProfilesController < ApplicationController
 before_filter :authenticate_user!

  def new
  end

  def change_photo
    @profile =current_user.profile

    logger.info "successful upload..."
    respond_to do |format|
      if @profile.update_attribute("photo_tips",params["photo_tips"])
        format.html { redirect_to user_root_url, notice: 'Profile updated.' }
        format.json { render json: { :photo_url => @profile.photo.url(:thumb)}.to_json }
      else
        format.html { render action: "new" }
        format.json { render json: @profile.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @profile = Profile.find(params[:id])
    @profile.current_state=Profile::INITIALIZED
    respond_to do |format|
      if @profile.update_attributes(params[:profile])
        format.html { redirect_to user_root_url, notice: 'Profile updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "new" }
        format.json { render json: @profile.errors, status: :unprocessable_entity }
      end
    end
  end
end
