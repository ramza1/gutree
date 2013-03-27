module TipsHelper

  def json_partial_for_tip_type(type)
    logger.info "type: #{type}"
    case type
      when "PhotoTip"
        'tips/photo_tips/photo_tip'
    end
  end
end
