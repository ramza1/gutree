Gutrees::Application.routes.draw do
  get "comments/create"

  get "users/show"

  resources :comments

  resources :categories

  resources :tips do
    resources :comments
    member do
      post :publish
      post :delete_photo_tip
      post :delete_link_tip
    end
  end

  resources :trees  do
    member do
      post :change_photo
      get :all_branches
      get :admins
    end
    collection do
      post :create_request
    end

    resources :branches  do
      member do
        post :change_photo
        get :sub_branches
        get :admins
        get :settings
        get :chat
      end
      member do
        post :create_caption
        get  :tips
      end
      collection do
        get :tree
        get :branch
      end
      resources :memberships do
        collection do
          get  :batch
          post :batch
        end
      end
      resources :broadcasts
    end
  end




  devise_for :users, path_prefix: "account", path_names: {sign_in: "login", sign_out: "logout" }, controllers: {omniauth_callbacks: "omniauth_callbacks"}

  as :user do
    match "account/users/sign_out", :to => "devise/sessions#destroy" ,:as=>"user_sign_out"
    match '/user/home', :to => 'users#home',:as=> "user_root"

  end

  resources :memberships do
    collection do
      get  :batch
      post :batch
    end
  end

  resources :users   do
    collection do
      post :change_photo
    end
  end

  namespace :api do
    namespace :v1 do
      resources :tokens,:only => [:create, :destroy]
      controller :tokens do
      end
    end
  end

  resources :tags ,:only=>["index"]
  match '/show', :to => 'home#show',:as=>"show"
  get 'tags/search', to: 'tags#index',:as=>"tags"
  get '/branches_available', to: 'branches#check_availability',:as=>"branches_available"
  match '/connect', :to => 'chats#connect',:as=>"chat"
  root :to => "home#index"
end
