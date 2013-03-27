module UsersHelper
  def user_sidebar(tab)
    render partial: 'users/sidenav', locals: {current_tab: tab}
  end
end
