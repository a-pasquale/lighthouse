const ToDo = React.createClass({
  getInitialState() {
    return { actionItems: [], archivedActionItems: [], loading: true, showArchived: false }
  },
  componentDidMount() {
    this.loadActionItems()
    EventSystem.subscribe('action_items:update', this.loadActionItems)
  },
  loadActionItems() {
    if(this.isMounted()){
      $.ajax({
        url: `/users/${this.props.userId}/action_items`,
        success: data => {
          this.setState({ actionItems: data.action_items, archivedActionItems: data.archived_action_items, loading: false })
        }
      })
    }
  },
  toggleShowArchive(e) {
    e.preventDefault();
    this.setState({ showArchived: !this.state.showArchived });
  },
  render() {
    const { actionItems, loading, showArchived, archivedActionItems } = this.state;
    return(
      <div id='to-do'>
        <div className='row'>
          <div className='card blue darken-1 no-margin'>
            <div className='card-content white-text center-align'>
              <small style={{fontWeight: 300, fontSize: 13, display: 'block' }} >Meeting Time</small>
              <h6>{this.props.meetingTime ? this.props.meetingTime : 'Anytime - Be Ready'}</h6>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-content'>
            <h6 className='center-align blue-grey-text text-lighten-1'>Action Items</h6>
            {
              loading &&
              <div className='center-align'><i className='fa fa-spinner fa-pulse fa-3x fa-fw no-padding'></i></div>
            }
            {
              !loading && actionItems.length === 0 &&
              <h5 className='center-align'>You currently have no action items to complete.</h5>
            }
            {
              actionItems.map(actionItem => {
                return <ToDo.ActionItem {...this.props} key={actionItem.id} actionItem={actionItem} parent={this} />
              })
            }
          </div>
        </div>

        {
          showArchived &&
            <div className='card'>
              <div className='card-content'>
                <h6 className='center-align blue-grey-text text-lighten-1'>Archived</h6>
                {
                  archivedActionItems.map(actionItem => {
                    return <ToDo.ActionItem {...this.props} key={actionItem.id} actionItem={actionItem} parent={this} />
                  })
                }
              </div>
            </div>
        }
        {
          archivedActionItems.length > 0 &&
            <a href='#' className='btn btn-flat' onClick={this.toggleShowArchive}>
              { showArchived ? 'Hide archived action items...' : 'View archived action items...' }
            </a>
        }
      </div>
    );
  }
});


ToDo.ActionItem = React.createClass({
  toggleComplete(e) {
    const { actionItem, userId } = this.props;
    $.ajax({
      url: `/users/${this.props.userId}/action_items/${actionItem.id}`,
      type: 'PATCH',
      data: { action_item: { completed: !actionItem.completed } },
      success: () => {
        this.props.parent.loadActionItems();
        EventSystem.publish('meetings:update');
      },
      error: () => {
        if(this.props.editable) {
          Materialize.toast('Something went wrong, try reloading the page.', 3500, 'red darken-3');
        } else {
          Materialize.toast('You have viewing privilege only.', 3500, 'red darken-1');
        }
      }
    });
  },
  archive(e) {
    e.preventDefault();
    const { actionItem } = this.props;
    $.ajax({
      url: `/users/${this.props.userId}/action_items/${actionItem.id}`,
      type: 'PATCH',
      data: { action_item: { archive: !actionItem.archive } },
      success: () => {
        this.props.parent.loadActionItems();
      },
      error: () => {
        if(this.props.editable) {
          Materialize.toast('Something went wrong, try reloading the page.', 3500, 'red darken-3');
        } else {
          Materialize.toast('You have viewing privilege only.', 3500, 'red darken-1');
        }
      }
    });
  },
  render() {
    const { id, completed, description, due_date, archive } = this.props.actionItem;
    return(
      <div className='item'>
        <div className='text'>
          <input type='checkbox' disabled={this.props.userArchived} className='blue-check filled-in' id={`check-${id}`} onChange={this.toggleComplete} checked={completed}/>
          <label htmlFor={`check-${id}`}>
            {due_date && <span className='blue-text text-darken-1' >Due {moment(due_date).add(1, 'days').fromNow()}: </span>}
            {description}
          </label>
        </div>
        {
          !archive && !this.props.userArchived &&
          <a href='#' onClick={this.archive} className='secondary-icons'><i className='material-icons tiny'>close</i> </a>
        }
      </div>
    );
  }
});
