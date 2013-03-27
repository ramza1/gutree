class TagsController < ApplicationController
  def index
    if(params[:q])
    @tags=Tag.where("name like ?","%#{params[:q]}%")
    else
     @tags=Tag.all
    end
    respond_to do |format|
      format.html # home.html.erb
      format.json
    end
  end
end
