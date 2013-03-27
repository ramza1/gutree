module NavigationHelper
def current_aux_nav(tab)
  render partial: 'layouts/aux_nav', locals: {current_tab: tab}
end
def current_main_nav(tab)
  render partial: '/home/main_nav', locals: {current_tab: tab}
end
end