module Users
  class GoalsController < SessionsController
    load_and_authorize_resource :user
    load_and_authorize_resource :goal, through: :user

    def index
      @goals = @goals.includes(:action_items, :user)
    end

    def create
      if @goal.save
        render :show, status: 201
      else
        render json: @goal.errors, status: 422
      end
    end

    def show
    end

    def update
      if @goal.update(goal_params)
        render :show, status: 200
      else
        render json: @goal.errors, status: 422
      end
    end

    def destroy
      @goal.destroy
      head :no_content
    end

    private

    def goal_params
      params.require(:goal).permit(
        :title,
        :description,
        :is_completed,
        :due_date,
        :user_id,
        action_items_attributes: [
          :description,
          :due_date,
          :id,
          :_destroy
        ]
      )
    end
  end
end
