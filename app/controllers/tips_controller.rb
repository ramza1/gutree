class TipsController < ApplicationController
  def create
    @branch=Branch.find(params[:branch_id])
    if @branch
      @tip = Tip.new()
      @tip.user = current_user
      @tip.branch=@branch
      respond_to do |format|
        if @tip.save
          #@branch.memberships.create({:user => current_user, :admin => true}, :as => :admin)
          format.html { redirect_to @tip, notice: 'Branch was successfully created.' }
          format.json
        else
          format.html { render action: "new" }
          format.json { render json: @tip.errors, status: :unprocessable_entity }
        end
      end
    else
      render :json => {:error=>"not found"},:status => 404
    end
  end


 def update
    @tip=Tip.find(params[:id])
    if @tip
      respond_to do |format|
        if @tip.update_attributes(params[:tip])
          if params[:tip][:type] ="PhotoTip" && params[:photo].present?
            @tip=PhotoTip.find(params[:id])
            @photo= Photo.new(params[:photo])
            @tip.photo=@photo
            @tip.save
            format.html { redirect_to @tip.branch, notice: 'Branch was successfully updated.' }
            format.json
            format.js
          elsif params[:tip][:type] = "LinkTip"
            @tip=LinkTip.find(params[:id])
            @link= Link.new(params[:link])
            if @link.valid?
              @tip.link=@link
              @tip.save
              format.html { redirect_to @tip.branch, notice: 'Branch was successfully updated.' }
              format.json
              format.js
            else
              format.html { render action: "edit" }
              format.js{ render action: "edit" }
              format.json { render json: @link.errors.to_json, status: :unprocessable_entity }
            end
          else
            format.html { redirect_to @tip.branch, notice: 'Branch was successfully updated.' }
            format.json
            format.js
          end
        else
          format.html { render action: "edit" }
          format.js{ render action: "edit" }
          format.json { render json: @tip.errors, status: :unprocessable_entity }
        end
      end
    else
      format.html { render action: "edit" }
      format.js{ render action: "edit" }
      format.json { render :json => {:error=>"not found"},:status => 404}
    end
  end

  def publish
    @tip=Tip.find(params[:id])
    if @tip
      @tip.published=true
      respond_to do |format|
        if @tip.update_attributes(params[:tip])
          format.html { redirect_to @tip.branch, notice: 'Branch was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: @tip.errors, status: :unprocessable_entity }
        end
      end
    else
      format.html { render action: "edit" }
      format.js{ render action: "edit" }
      format.json { render :json => {:error=>"not found"},:status => 404}
    end
  end

  def delete_link_tip
    @tip=LinkTip.find(params[:id])
    if @tip
      @tip.link.delete if @tip.link
      @tip.type=""
      respond_to do |format|
        if @tip.save
          format.html { redirect_to @tip.branch, notice: 'Photo was successfully deleted' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: {:message=>"failed to delete"}.to_json, status: :unprocessable_entity }
        end
      end
    else
      format.html { render action: "edit" }
      format.js{ render action: "edit" }
      format.json { render :json => {:error=>"not found"},:status => 404}
    end
  end
  def delete_photo_tip
    @tip=PhotoTip.find(params[:id])
    if @tip
      @tip.photo.delete if @tip.photo
      @tip.type=""
      respond_to do |format|
        if @tip.save
          format.html { redirect_to @tip.branch, notice: 'Photo was successfully deleted' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: {:message=>"failed to delete"}.to_json, status: :unprocessable_entity }
        end
      end
    else
      format.html { render action: "edit" }
      format.js{ render action: "edit" }
      format.json { render :json => {:error=>"not found"},:status => 404}
    end
  end
end
