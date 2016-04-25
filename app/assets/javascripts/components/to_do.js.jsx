var ToDo = React.createClass({
  getInitialState: function() {
    return { actionItems: [] };
  },
  componentDidMount: function() {
    this.loadActionItems();
    EventSystem.subscribe('action.items.updated', this.loadActionItems);
  },
  loadActionItems: function(){
    if(this.isMounted()){
      $.getJSON("/action_items", function(data){
        this.setState({ actionItems: data.all })
      }.bind(this));
    }
    EventSystem.publish('meetings.updated', null);
  },
  actionItems: function(){
    var actionItemNodes = this.state.actionItems.map(function(actionItem){
      return <ToDo.ActionItem key={actionItem.id} actionItem={actionItem} updateActionItems={this.loadActionItems} />;
    }.bind(this));
    return actionItemNodes;
  },
  render: function(){

    var noActionItems;

    if(this.state.actionItems.length === 0){
      noActionItems = <h4 className="center-align">You currently have no action items to complete.</h4>
    }

    return  <div id="to-do" className="row">
              <div className="col s12">

              <div className="row">
                <div className="card blue darken-1 no-margin">
                  <div className="card-content white-text center-align">
                    <small style={{fontWeight: 300, fontSize: 13 }} >Meeting Time</small><br/>
                    <h6>{this.props.meetingTime ? this.props.meetingTime : "Anytime - Be Ready"}</h6>
                  </div>
                </div>
              </div>

                <div className="card">
                  <div className="card-content">
                    {noActionItems}
                    {this.actionItems()}
                  </div>
                </div>
              </div>

            </div>
  }
});


ToDo.ActionItem = React.createClass({
  toggleComplete: function(){
    $.ajax({
      url: "/action_items/" + this.props.actionItem.id,
      dataType: "JSON",
      type: "PATCH",
      data: { action_item: { completed: !this.props.actionItem.completed } },
      success: function() {
        this.props.updateActionItems();
      }.bind(this),
      error: function() {
        console.log("ERROR - UPDATING ACTION ITEM");
      }
    });
  },
  archive: function(e) {
    e.preventDefault();
    $.ajax({
      url: "/action_items/" + this.props.actionItem.id,
      dataType: "JSON",
      type: "PATCH",
      data: { action_item: { archive: true } },
      success: function() {
        this.props.updateActionItems();
      }.bind(this)
    });
  },
  render: function(){
      return  <div className="item">
                <div className="text">
                  <input type="checkbox" className="blue-check" id={"check-" + this.props.actionItem.id} onChange={this.toggleComplete} checked={this.props.actionItem.completed ? "checked" : false }/>
                  <label htmlFor={"check-" + this.props.actionItem.id}>{this.props.actionItem.description}</label>
                </div>
                <div className="secondary-icons">
                  <i className="fa fa-times-circle" onClick={this.archive}/>
                </div>
              </div>;
  }
});

