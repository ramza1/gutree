class TipBranchesController < ApplicationController
  #before_filter :authenticate_user!, :except => [:index, :show]

  def tree
    @branch = TipBranch.new()
    respond_to do |format|
      format.html # home.html.erb
      format.json
    end
  end

  def branch
    @branch =TipBranch.new()
    respond_to do |format|
      format.html # home.html.erb
      format.json
    end
  end

  def sub_branches
    @branch = TipBranch.find(params[:id])
    @sub_branches = @branch.children.all
    @branches = Branch.all
    @branch_details = @branch
  end

  def admins
    @branch = TipBranch.find(params[:id])
    @can_edit = current_user.can_edit?(@branch) if current_user
    @branch_details = @branch
  end

  def settings
    @branch = TipBranch.find(params[:id])
    @branch_details = @branch
    @broadcast = @branch.broadcasts.new
  end

  # GET /branches/1
  # GET /branches/1.json
  def show
    @branch = TipBranch.find(params[:id])
    @branch_details = @branch
    @members = @branch.users.thumbnails
    @broadcasts = @branch.broadcasts.order("created_at desc").includes(:comments)
    @member_of = current_user.member_of?(@branch)  if current_user
    @broadcast = @branch.broadcasts.new
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @branch }
    end
  end

  # GET /branches/new
  # GET /branches/new.json
  def new
    @branch = TipBranch.new(parent_id: params[:branch_id])
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
    @branch = Branch.find(params[:id])
    @title = "Edit #{@branch.name}"
    @branch_details = @branch
  end
  # POST /branches
  # POST /branches.json
  def create
    @branch=TipBranch.new(params[:branch])
    @branch.user = current_user
    respond_to do |format|
      if @branch.save
        @branch.memberships.create({:user => current_user, :admin => true}, :as => :admin)
        format.html { redirect_to @branch, notice: 'Branch was successfully created.' }
        format.json { render json: @branch, status: :created, location: @branch }
      else
        format.html { render action: "new" }
        format.json { render json: @branch.errors, status: :unprocessable_entity }
      end
    end
  end


  # PUT /branches/1
  # PUT /branches/1.json
  def update
    @branch = TipBranch.find(params[:id])

    respond_to do |format|
      if @branch.update_attributes(params[:branch])
        format.html { redirect_to @branch, notice: 'Branch was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @branch.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /branches/1
  # DELETE /branches/1.json
  def destroy
    @branch = TipBranch.find(params[:caption])
    @branch.destroy

    respond_to do |format|
      format.html { redirect_to branches_url }
      format.json { head :no_content }
    end
  end

end
