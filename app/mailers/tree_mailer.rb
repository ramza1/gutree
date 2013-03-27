class TreeMailer < ActionMailer::Base
  default from: "from@example.com"

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.tree_mailer.confirmation.subject
  #
  def confirmation(request)
    @request=request
    mail(:to => request.recipient_email, :subject => 'Your Tree Request') do |format|
      format.text
    end
  end
end
