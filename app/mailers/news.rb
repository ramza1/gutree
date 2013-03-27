class News < ActionMailer::Base
  default from: "from@example.com"

  def news_info(user, broadcast)
    @broadcast = broadcast
    mail to: user.email, subject: "#{broadcast.title}", from: "#{broadcast.branch.name}-GUTREES"
  end
end
