module ApplicationHelper
  def nav_tab(title, url, options = {})
    current_tab = options.delete(:current)
    options[:class] = (current_tab == title) ? 'active' : ''
    label=nil
    icon=nil
    link=""
    if options[:icon]
       icon= content_tag(:i, "",class:"#{options[:icon][:class]}")
    end
    if options[:label]
      label = content_tag(:span,options[:label][:value],class:" #{options[:label][:class]}")
    end
    link= link_to url do
      content_tag(:span,icon.concat(title).concat(label),class:" ui-btn-inner")
    end
    content_tag(:li,link, options)
  end

  def format_date_a(t)
    t.strftime("%A, %B %d")
  end
       def format_date_b(t)
         t.strftime("%A, %B %d %Y")
       end

       def format_date_c(t)
         t.strftime("%H:%M")
       end

  def admin_sidebar(tab)
    render partial: 'layouts/admin_sidebar', locals: {current_tab: tab}
  end



  def admin_navbar(sidebar,tab)
    if(sidebar=="Categories")
      render partial: '/categories/navbar', locals: {current_tab: tab}
    end
  end

  def tag_cloud(tags, classes)
    max = tags.sort_by(&:count).last
    tags.each do |tag|
      index = tag.count.to_f / max.count * (classes.size - 1)
      yield(tag, classes[index.round])
    end
  end

      def with_format(format,&block)
        old_formats=formats
       begin
       self.formats=[format]
         return block.call
       ensure
         self.formats=old_formats
       end
      end

      def breadcrumb(branch)
        tree=branch.tree
        link= link_to tree.name,tree_url(tree)
        tag=content_tag(:li,{}) do
            link.concat(content_tag(:span, "/",class:"divider"))
        end
        ancestors=branch.ancestors
        ancestors.each do|branch|
          link= link_to branch.name,tree_branch_url(branch)
          tag1=content_tag(:li,{}) do
            link.concat(content_tag(:span, "/",class:"divider"))
          end
          link= link_to "branches",sub_branches_tree_branch_url(branch)
          tag2=content_tag(:li,{}) do
              link.concat(content_tag(:span, "/",class:"divider"))
              end
           tag.concat(tag1).concat(tag2)
          end
        tag.concat(content_tag(:li,branch.name,class:"active"))
      end
end
