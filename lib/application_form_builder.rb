class ApplicationFormBuilder < ActionView::Helpers::FormBuilder

  def field_item_wrap(attribute, text=nil, &block)
    if @object.errors[attribute].any?
      @template.content_tag(:div, class: 'control-group error') do
        yield
       end
    else
      @template.content_tag(:div, class: 'control-group') do
        yield
      end
    end
  end

  def date_picker(attribute, date,format, &block)
      @template.content_tag(:div, class: 'datepicker','data-date'=>date,"data-date-format"=>format) do
        yield
      end
  end

  def field_item(attribute={},help=nil, &block)
    @template.content_tag(:div, class: 'controls') do
    yield
     @template.concat errors_on(attribute,help)
    end
  end

  def field_label(attribute,text)
     @template.label(attribute, text,class:'control-label')
  end

  def errors_on(attribute,text=nil)
    if @object.errors[attribute].any?
      @template.content_tag(:span, @object.errors[attribute].to_sentence, class: 'help-inline')
    else
      @template.content_tag(:span,text, class: 'help-inline')
    end
  end

end