var MeetingItem = React.createClass({
  getInitialState: function() {
    return { action_items: this.props.meeting.action_items,
             editing: this.props.meeting.editing,
             notes: this.props.meeting.notes,
             created_at: this.props.meeting.created_at };
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({ action_items: nextProps.meeting.action_items,
                    notes: nextProps.meeting.notes,
                    editing: nextProps.meeting.editing,
                    created_at: nextProps.meeting.created_at });
  },
  handleClickEdit: function(e){
    e.preventDefault();
    this.props.closeAllMeetings(this.props.reactKey);
  },
  handleClickDestroy: function(e){
    e.preventDefault();
    $.ajax({
      url: "/meetings/" + this.props.meeting.id,
      dataType: "JSON",
      type: "DELETE",
      success: function(data) {
        this.props.updateMeetings();
      }.bind(this)
    });
  },
  actionItems: function(){
    var actionItemNodes = this.state.action_items.map(function(action_item, i){
      return (
        <MeetingItem.ActionItem {...this.props} action_item={action_item} key={i} reactKey={i} />
      );
    }.bind(this));

    if(this.state.action_items.length > 0){
      return  ( <div className="action-items">
                  <div className="row title">
                    <div className="col s2 center-align">ACTION ITEMS</div>
                    <div className="col s6 push-s4">DUE</div>
                  </div>
                  {actionItemNodes}
                </div> );
    }
  },
  closeNewMeeting: function(){
    this.setState({ editing: false });
  },
  render: function(){

    var mainContent;

    if(!this.state.editing){
      mainContent = <div className="row">
                      <div className="col s12">
                        <div className="card">
                          <div className="card-date">
                            {moment(this.state.created_at).format("MMMM D YYYY")}
                            <a href="#" className="right white-text" onClick={this.handleClickDestroy} data-confirm="Are you sure that you want to delete the meetings notes?" rel="nofollow" ><i className="fa fa-times"></i></a>
                            <a href="#" className="right white-text hide-on-small-only" onClick={this.handleClickEdit} ><i className="fa fa-edit"></i></a>
                          </div>
                          <div className="card-content">

                            <div dangerouslySetInnerHTML={{ __html: this.state.notes }} />
                            {this.actionItems()}
                          </div>
                        </div>
                      </div>
                    </div>;
    }else{
      mainContent = <EditMeeting {...this.props} closeNewMeeting={this.closeNewMeeting} />;
    }

    return (

      <div>
        {mainContent}
      </div>

    );

  }
});

MeetingItem.ActionItem = React.createClass({
  toggleCheck: function(){
    $.ajax({
      url: "/action_items/" + this.props.action_item.id,
      dataType: "JSON",
      type: "PATCH",
      data: { action_item: { completed: !this.props.action_item.completed } },
      success: function() {
        this.props.updateMeetings();
      }.bind(this),
      error: function() {
        console.log("ERROR - UPDATING ACTION ITEM");
      }
    });
  },
  render: function(){
    return (
      <div className="row body">
        <div className="col s9 m10">
          <input type="checkbox" className="blue-check" id={"meeting-check-" + this.props.action_item.id} onChange={this.toggleCheck} checked={this.props.action_item.completed ? "checked" : false }/>
          <label htmlFor={"meeting-check-" + this.props.action_item.id}><span className="blue-text text-lighten-2">{this.props.action_item.user_id ? "Teacher task: " : ""}</span>{this.props.action_item.description}</label>
        </div>
        <div className="col s3 m2 capitalize">{ this.props.action_item.due_date ? moment(this.props.action_item.due_date).fromNow() : "∞" }</div>
      </div>
    );
  }
});
