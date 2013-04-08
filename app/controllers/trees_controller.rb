class TreesController < ApplicationController
  before_filter :authenticate_user!
  before_filter :check_state ,:only=>[:show]
  def index
    @request = TreeRequest.new()
    respond_to do |format|
      format.html # home.html.erb
      format.json
    end
  end

  def show
    @tree=Tree.find(params[:id])
    if(@tree)
      @can_edit = current_user.can_edit?(@tree) if current_user
      @branches=@tree.branches
      if @can_edit
        @branch=Branch.new
        @branch.tree=@tree
      end

      respond_to do |format|
        format.html
        format.json
      end
      else
      redirect_to user_root_path
    end
  end

  def all_branches

  end

  def edit
    @tree=current_user.tree
  end

  def new
       @tree=current_user.tree
  end

  def new_from_request
    @request = TreeRequest.find_by_token(params[:id])

    if @request.nil?
      redirect_to root_path, :notice => "Sorry, you need to make a request to create a tree"
    end

    @user = Tree.new(:email => @request.recipient_email)
  end

  def create
    @request  = TreeRequest.find_by_token(params[:token])

    if @request.nil?
      redirect_to root_path, :notice => "Sorry, you need to make a request to create a tree"
    end

    begin
      @request.nil.transaction do
        @request.nil.destroy!
        @tree = Tree.create(params[:tree])
      end

      #redirect_to my_dashboard_path, :notice => "Yay!"

    rescue ActiveRecord::RecordInvalid => invalid
      render :new, :alert => "Validation errors"
    end
  end

  def create_request
    @request=TreeRequest.new params[:request]
    @request.user = current_user
    respond_to do |format|
      flash.now.notice = "request sent"
      if @request.valid
        format.html  {render action: "index"}
        format.json
      else
        flash.now.alert = "Error sending request"
        format.html { render action: "index" }
        format.json { render json: @request.errors, status: :unprocessable_entity }
      end
    end
  end

  def change_photo
    @tree = Tree.find(params[:id])
    logger.info "successful upload..."
    respond_to do |format|
      if @tree.update_attribute("photo",params["photo"])
        format.html { redirect_to user_root_url, notice: 'Profile updated.' }
        format.json { render json: { :photo_url => @tree.photo.url(:thumb)}.to_json }
      else
        format.html { render action: "new" }
        format.json { render json: @tree.errors, status: :unprocessable_entity }
      end
    end
  end

  def tags
    @tree = Tree.find(params[:id])

  end

  def update
    @tree = Tree.find(params[:id])
    respond_to do |format|
      if @tree.update_attributes(params[:tree])
        @tree.initialized
        format.html { redirect_to @tree, notice: 'Tree was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json:@tree.errors, status: :unprocessable_entity }
      end
    end
    end

  def check_state
    @tree=Tree.find(params[:id])
    if @tree.initializing?
      redirect_to edit_tree_path
    end
  end
end
