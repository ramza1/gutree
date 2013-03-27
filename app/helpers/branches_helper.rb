module BranchesHelper
  def branch_sidebar(tab)
    render partial: 'branches/sidenav', locals: {current_tab: tab}
  end
end
