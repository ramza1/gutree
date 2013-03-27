class CommentsController < ApplicationController
  def create
    @broadcast = Broadcast.find(params[:broadcast_id])
    @comment = @broadcast.comments.create(params[:comment])
    @comment.user = current_user

    respond_to do |format|
      if @comment.save
        format.html { redirect_to branch_path(@broadcast.branch), notice: 'Comment was successfully created.' }
        format.js
      else
        format.html { render action: branch_path(@broadcast.branch) }
        format.js
      end
    end

  end
end
