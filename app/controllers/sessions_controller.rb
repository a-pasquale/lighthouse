class SessionsController < ApplicationController
  before_action :session_expiry, except: [:login_authentication]
  before_action :update_activity_time
  before_action :current_user

  def login_authentication

    email = params[:user][:email]
    password = params[:user][:password]

    @user = User.authenticate(email, password)

    

    if @user
      session[:user_id] = @user.id
      @user.admin? ? redirect_to(admin_dashboard_path) : redirect_to(projects_path)
    else
      flash[:alert] = "Your email or password were incorrect."
      redirect_to root_path
    end

    rescue
      flash[:alert] = "Oops, something went wrong. Try again."
      redirect_to root_path
  end

  def access_student
    session[:admin_id] = session[:user_id]
    session[:user_id] = params[:student_id]

    redirect_to action_plan_path
  end

  def access_admin
    session[:user_id] = session[:admin_id]
    session[:admin_id] = nil
    current_user

    redirect_to admin_dashboard_path
  end

  def login
    @background = BackgroundImage.first
    if signed_in?
      return @user.admin? ? redirect_to(admin_dashboard_path) : redirect_to(projects_path)
    end
    render layout: "public"
  end

  def signed_in
    return redirect_to root_path unless signed_in?
  end

  def logout
    disconnect_user
    redirect_to root_path
  end

  def disconnect_user
    session[:user_id] = nil
  end

  def session_expiry
    get_session_time_left
    disconnect_user if @session_time_left <= 0
  end

  def update_activity_time
    session[:expires_at] = 24.hours.from_now
  end

private

  def get_session_time_left
    expire_time = session[:expires_at] || Time.now
    @session_time_left = (expire_time.to_time - Time.now).to_i
  end

end
