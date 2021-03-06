class UsersController < SessionsController
  load_and_authorize_resource

  def index
    @users = @users.students
    @highlight_sidebar = 'Dashboard'
    @users = @users.default_search(params[:q]) if params[:q].present?
    @users = @users.reorder('archive asc, first_name asc')
    respond_to do |format|
      format.json
      format.html
    end
  end

  def action_plan
    @highlight_sidebar = 'Action Plan'
    @draft_meeting = active_user.meetings.where(draft: true).first
  end

  def show
  end

  def new
    @highlight_sidebar = 'Dashboard'
  end

  def edit
    @highlight_sidebar = 'Dashboard'
  end

  def create
    if @user.save
      @user.children.create(student_id: params[:user][:student_id]) if @user.parent?
      redirect_to redirect_to_path, notice: "#{@user.role.capitalize} account successfully created."
    else
      render 'new'
    end
  end

  def update
    respond_to do |format|
      if @user.update(user_params.except(:password, :password_confirmation))
          @user.pword = params[:user][:password] if params[:user][:password].present?
          @user.save
          format.html { redirect_to redirect_to_path, flash: { notice: 'Account successfully updated!' } }
          format.json { render :show }
      else
        @highlight_sidebar = 'Dashboard'
        format.html { render :edit }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    name = @user.full_name.capitalize
    @user.destroy
    respond_to do |format|
      format.html { redirect_to redirect_to_path, flash: { notice: "#{name} account was successfully deleted." } }
      format.json { head :no_content }
    end
  end

  private

    def redirect_to_path
      return admin_dashboard_path if @user.admin?
      return users_path if @user.parent? || @user.student?
    end

    def user_params
      @user_params ||= params.require(:user).permit(
        :first_name,
        :last_name,
        :meeting_time,
        :role,
        :email,
        :password,
        :password_confirmation,
        :username,
        :archive,
        social_mediums_attributes: [
          :link,
          :name,
          :_destroy,
          :id
        ]
      )
    end

end
