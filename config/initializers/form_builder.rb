ActionView::Base.default_form_builder = ApplicationFormBuilder
ActionView::Base.field_error_proc = ->(field, instance) { field }
Cocaine::CommandLine.runner = Cocaine::CommandLine::BackticksRunner.new

