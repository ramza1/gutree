class BranchesController < ApplicationController
  before_filter :authenticate_user!, :except => [:index]
  before_filter :check_state ,:only=>[:show]

  def index
    if params[:tag]
      @branches = Branch.tagged_with(params[:tag])
    else
      @branches = Branch.all
    end
    @branch=Branch.new
    respond_to do |format|
      format.html # home.html.erb
      format.json { render json: @branches }
    end
  end

  def tips
    @branch = Branch.find(params[:id])
    @tree=@branch.tree
    if @branch
      @page=(params[:page]||1).to_i
      @per_page = (params[:per_page] || 10).to_i
      @per_page=@per_page<100?@per_page:100
      @count=@branch.tips.count
      @tips= @branch.tips.includes([:user,:comments]).page(@page).per_page(@per_page).order("created_at desc")
      @data={}
      @data[:count]=@count
      @data[:params]={:page=>@page+1 , :per_page=>@per_page}
      @data[:remaining]=((@page*@per_page) < @count) ? true : false
      @data[:empty]=(@count==0 ) ? true : false
      respond_to do |format|
        format.json
        format.js
      end
    else
      respond_to do |format|
        format.json {render :json => {:error=>"not found"},:status => 404}
      end
    end
  end

  def sub_branches
    @branch = Branch.find(params[:id])
    @sub_branches = @branch.children.all
    @branches = Branch.all
    @branch_details = @branch
  end

  def admins
    @branch = Branch.find(params[:id])
    @can_edit = current_user.can_edit?(@branch) if current_user
    @branch_details = @branch
  end

  def settings
    @branch = Branch.find(params[:id])
    @branch_details = @branch
    @broadcast = @branch.broadcasts.new
  end

  def chat
    @branch = Branch.find(params[:id])
  end

  # GET /branches/1
  # GET /branches/1.json
  def show
    @branch = Branch.find(params[:id])
    @tree=@branch.tree
    @page=(params[:page]||1).to_i
    @per_page = (params[:per_page] ||1).to_i
    @per_page=@per_page<100?@per_page:100
    @count=@branch.tips.count
    @tips= @branch.tips.includes([:comments]).page(@page).per_page(@per_page).order("created_at desc")
    @data={}
    @data[:count]=@count
    @data[:params]={:page=>@page+1 , :per_page=>@per_page}
    @data[:remaining]=((@page*@per_page) < @count) ? true : false
    @data[:empty]=(@count==0 ) ? true : false
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @branch }
    end
  end

  # GET /branches/new
  # GET /branches/new.json
  def new
    @branch = Branch.new(parent_id: params[:branch_id])
    if params[:branch_id]
      @branch_details = Branch.find(params[:branch_id])
      @title = "Create a branch under #{@branch_details.name}"
    end
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @branch }
    end
  end

  # GET /branches/1/edit
  def edit
    @tree=Tree.find(params[:tree_id])
    @branch = Branch.find(params[:id])
  end

  # POST /branches
  # POST /branches.json
  def create
    @tree=Tree.find(params[:branch][:tree_id])
    if @tree
      @branch = Branch.new()
      @branch.private=params[:branch][:private]
      @branch.parent_id = params[:branch][:parent_id]
      @branch.name=params[:branch][:name]
      @branch.tree=@tree
      @latest_tip=@branch.tips.latest.first
      respond_to do |format|
        if @branch.save
          admin=Affiliation::Administration.new
          admin.user=current_user
          admin.entity=@branch
          admin.save
          #@branch.memberships.create({:user => current_user, :admin => true}, :as => :admin)
          format.html { redirect_to tree_branch_url @tree,@branch, notice: 'Branch was successfully created.' }
          format.json
          format.js
        else
          format.html { render action: "new" }
          format.json { render json: @branch.errors, status: :unprocessable_entity }
          format.js  { render action: "new",status: :unprocessable_entity  }
        end
      end
    else
      render :json => {:error=>"not found"},:status => 404
    end
  end


  # PUT /branches/1
  # PUT /branches/1.json
  def update
    @tree=Tree.find(params[:tree_id])
    @branch = Branch.find(params[:id])
    @branch.current_state=Tree::INITIALIZED
    respond_to do |format|
      if @branch.update_attributes(params[:branch])
        format.html { redirect_to tree_branch_url @tree,@branch, notice: 'Branch was successfully updated.' }
        format.json { head :no_content }
        format.js
      else
        format.html { render action: "edit" }
        format.js{ render action: "edit" }
        format.json { render json: @branch.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /branches/1
  # DELETE /branches/1.json
  def destroy
    @branch = Branch.find(params[:id])
    @branch.destroy

    respond_to do |format|
      format.html { redirect_to branches_url }
      format.json { head :no_content }
    end
  end

  def change_photo
    @branch = Branch.find(params[:id])
    logger.info "successful upload..."
    respond_to do |format|
      if @branch.update_attribute("photo_tips",params["photo_tips"])
        format.html { redirect_to user_root_url, notice: 'Branch updated.' }
        format.json { render json: { :photo_url => @branch.photo.url(:thumb)}.to_json }
      else
        format.html { render action: "new" }
        format.json { render json: @branch.errors, status: :unprocessable_entity }
      end
    end
  end

  def check_availability
    #remember to auth
    @tree=Tree.find(params[:tree_id])
    if @tree
      if params[:parent_id].present?
        parent=Branch.find(params[:parent_id])
        if !parent.children.exists?(:name =>params[:q]) && parent.name!=params[:q]
          render :json =>{:available=>true}.to_json, :status => 200
        else
          render :json =>{:available=>false}.to_json, :status => 200
        end
      else
        if !@tree.branches.where("name = :name",:name => params[:q]).exists?
          render :json =>{:available=>true}.to_json, :status => 200
        else
          render :json =>{:available=>false}.to_json, :status => 200
        end
      end
    else
      render :json => {:error=>"not found"},:status => 404
    end
  end

  def check_state
    @branch=Branch.find(params[:id])
    logger.info"current_state #{@branch.current_state}"
    if @branch.initializing?
      redirect_to edit_tree_branch_url(@branch.tree,@branch)
    end
  end
end
