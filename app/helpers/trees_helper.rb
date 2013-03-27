module TreesHelper
  def current_tree_nav(tab)
    render partial: '/trees/tree_nav', locals: {current_tab: tab}
  end
  def content_for_nav(sidebar,tab)
    if(sidebar=="Branches")
      render partial: 'branches', locals: {current_tab: tab}
    end
  end
end
