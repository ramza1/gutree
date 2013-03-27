if @user
json.user do|json|
  json.(@user,:phone_number,:account_balance)
end
json.recharge_units do|json|
  json.mtn @mtn_credit do|json,credit|
      json.(credit,:name,:price)
  end

  json.glo @glo_credit do|json,credit|
       json.(credit,:name,:price)
  end

  json.etisalat @etisalat_credit do|json,credit|
       json.(credit,:name,:price)
  end

  json.airtel @airtel_credit do|json,credit|
      json.(credit,:name,:price)
  end
end
else
json.message "invalid token"
end
