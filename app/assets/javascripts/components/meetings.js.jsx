const update = React.addons.update;

const Meetings = React.createClass({
  getInitialState() {
    return { newMeeting: false, meetings: [] };
  },
  componentDidMount() {
    this.loadMeetings();
    EventSystem.subscribe('meetings.updated', this.loadMeetings);
  },
  loadMeetings(){
    if(this.isMounted()) {
      $.getJSON(`/users/${this.props.userId}/meetings`, meetings => {
        EventSystem.publish('action_items_updated');
        this.setState({ meetings });
      });
    }
  },
  handleNewMeeting(e) {
    e.preventDefault();
    this.setState({ newMeeting: true, activeMeeting: 'newMeeting' });
  },
  render() {
    const { newMeeting, meetings, activeMeeting } = this.state;
    const { adminId, editable, meetingTime } = this.props;
    return (
      <div id='meetings'>
        {
          !adminId && editable &&
          <div className='row'>
            <div className='card blue darken-1 no-margin'>
              <div className='card-content white-text center-align'>
                <small style={{fontWeight: 300, fontSize: 13, display: 'block' }} >Meeting Time</small>
                <h6>{ meetingTime || 'Anytime - Be Ready' }</h6>
              </div>
            </div>
          </div>
        }
        {
          adminId && !newMeeting && editable &&
          <a href='#' onClick={this.handleNewMeeting} className='hide-on-small-only'>
            <div className='row'>
              <div className='card blue darken-1 no-margin hoverable'>
                <div className='card-content white-text center-align'>
                  <h6>START MEETING</h6>
                </div>
              </div>
            </div>
          </a>
        }
        { newMeeting && activeMeeting == 'newMeeting' && <Meetings.MeetingForm {...this.props} parent={this} meeting={{action_items: []}} newMeeting={newMeeting} /> }
        {
          meetings.map(meeting => {
            return <Meetings.Meeting {...this.props} parent={this} key={meeting.id} meeting={meeting} />
          })
        }
      </div>
    );
  }
});

Meetings.Meeting = React.createClass({
  getInitialState() {
    return { editing: false }
  },
  toggleEdit(e) {
    e && e.preventDefault();
    this.props.parent.setState({ activeMeeting: this.props.meeting.id, newMeeting: false });
    this.setState({ editing: !this.state.editing });
  },
  render(){
    const { editing } = this.state;
    const { meeting, parent } = this.props;
    return(
      <div>
        {
          editing && parent.state.activeMeeting == meeting.id
          ? <Meetings.MeetingForm {...this.props} toggleEdit={this.toggleEdit} />
          : <Meetings.MeetingShow {...this.props} toggleEdit={this.toggleEdit} />
        }
      </div>
    );
  }
});

Meetings.MeetingShow = React.createClass({
  componentDidMount() {
    $(ReactDOM.findDOMNode(this)).velocity('transition.expandIn');
  },
  deleteMeeting(e) {
    e.preventDefault();
    const { userId, meeting, parent } = this.props;

    if(!confirm('Are you sure you would like to delete this meeting?')){
      return false;
    }

    $.ajax({
      url: `/users/${userId}/meetings/${meeting.id}`,
      dataType: 'JSON',
      type: 'DELETE',
      success: () => {
        Materialize.toast('Meeting successfully deleted!', 3500, 'teal');
        parent.loadMeetings();
      },
      error: () => {
        Materialize.toast('Failed to delete meeting', 3500, 'red darken-4');
      }
    });
  },
  toggleCheck(e) {
    const { userId, meeting, parent } = this.props;
    $.ajax({
      url: `/users/${userId}/action_items/${e.currentTarget.dataset.id}`,
      type: 'PATCH',
      dataType: 'JSON',
      data: { action_item: { completed: e.currentTarget.checked } },
      success: () => {
        parent.loadMeetings();
      },
      error: () => {
        if(this.props.editable) {
          Materialize.toast('Something went wrong, try reloading the page.', 3500, 'red darken-4');
        } else {
          Materialize.toast('You have viewing privilege only.', 3500, 'red darken-1');
        }
      }
    });
  },
  render() {
    const { created_at, action_items, notes } = this.props.meeting;
    const { editable } = this.props;
    return(
      <div className='row'>
        <div className='card'>
          <div className='card-date'>
            {moment(created_at).format('MMMM D YYYY')}
            {editable && <a href='#' className='right white-text' onClick={this.deleteMeeting}><i className='fa fa-times'></i></a>}
            {editable && <a href='#' className='right white-text hide-on-small-only' onClick={this.props.toggleEdit} ><i className='fa fa-edit'></i></a>}
          </div>
          <div className='card-content action-items'>

            <div className='row'>
              <div dangerouslySetInnerHTML={{ __html: notes }} />
            </div>

            {
              action_items.length > 0 &&
              <div>
                <div className='row title'>
                  <div className='col s4'>ACTION ITEMS</div>
                  <div className='col s6 push-s2'>DUE</div>
                </div>

                {action_items.map(actionItem => {
                  return(
                    <div className='row body' key={actionItem.id}>
                      <div className='col s9 m10'>
                        <input type='checkbox' className='blue-check filled-in' data-id={actionItem.id} id={`meeting-check-${actionItem.id}`} onChange={this.toggleCheck} checked={actionItem.completed && 'checked'}/>
                        <label htmlFor={`meeting-check-${actionItem.id}`}><span className='blue-text text-lighten-2'>{actionItem.user_id && 'Advisor task: ' }</span>{actionItem.description}</label>
                      </div>
                      <div className='col s3 m2 capitalize'>{ actionItem.due_date ? moment(actionItem.due_date).fromNow() : '∞' }</div>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
});

Meetings.MeetingForm = React.createClass({
  getInitialState() {
    return { meeting: this.props.meeting };
  },
  componentDidMount() {
    if(this.props.newMeeting) {
      this.setState({ meeting: update(this.state.meeting, { action_items: { $push: [this.defaultActionItem()] } }) });
    }
    tinymce.remove();
    $(ReactDOM.findDOMNode(this)).velocity('transition.expandIn', { complete: (el) => $(el).css('transform', 'initial') });
    window.initTiny(`#meeting-notes-${this.props.meeting.id}`);
  },
  defaultActionItem() {
    return { id: Materialize.guid(), description: '', due_date: '', completed: '', user_id: '', newActionItem: true };
  },
  addActionItem(e) {
    e.preventDefault();
    this.setState({ meeting: update(this.state.meeting, { action_items: { $push: [this.defaultActionItem()] } }) });
  },
  closeMeeting(e) {
    e && e.preventDefault();
    const { parent, newMeeting } = this.props;
    if(newMeeting) {
      parent.setState({ newMeeting: false });
    }else {
      this.props.toggleEdit();
    }
  },
  submitForm(e) {
    e.preventDefault();
    const { newMeeting, userId, meeting, parent } = this.props;
    tinymce.get(`meeting-notes-${this.props.meeting.id}`).save();

    let url, type;

    if(newMeeting){
        url = `/users/${userId}/meetings`;
        type = 'POST';
    } else {
        url = `/users/${userId}/meetings/${meeting.id}`;
        type = 'PATCH';
    }

    $.ajax({
      url,
      type,
      dataType: 'JSON',
      cache: false,
      contentType: false,
      processData: false,
      data: new FormData(e.currentTarget),
      success: data => {
        Materialize.toast('Meeting successfully saved!', 3500, 'teal');
        this.setState({ sendingForm: false, error: false });
        this.closeMeeting();
        parent.loadMeetings();
      },
      error: error => {
        Materialize.toast('Failed to save meeting.', 3500, 'red darken-4');
        if(error.status === 422){
          this.setState({ error: true, errorMessages: error.responseJSON });
        }else{
          this.setState({ error: true });
        }
      }
    });
  },
  render() {
    const { error, errorMessages } = this.state;
    const { created_at, notes, action_items, id } = this.state.meeting;
    const { userId, adminId, newMeeting } = this.props;
    return(
      <div className='row'>
        <div className='card'>
          <div className='card-date blue darken-1 white-text'>
            {created_at ? moment(created_at).format('MMMM D YYYY') : 'New Meeting'}
            <a className='right white-text' href='#' onClick={this.closeMeeting}><i className='fa fa-times'></i></a>
          </div>
          <div className='card-content'>
            <form onSubmit={this.submitForm} >
              <div className='row'>
                <h6 className='bold grey-text text-darken-2'>Notes</h6>
              </div>

              <div className='row'>
                <textarea name='meeting[notes]' id={`meeting-notes-${id}`} defaultValue={notes}></textarea>
                {(error && errorMessages.notes) && <div className='error-message'>{errorMessages.notes}</div>}
              </div>

              {
                action_items.length > 0 &&
                <div>
                  <div className='row'>
                    <h6 className='bold grey-text text-darken-2'>Action Items</h6>
                  </div>

                  <div className='row action-items'>
                    <ul className='collection with-header'>
                      <li className='collection-header grey lighten-3'>
                        <div className='row no-margin grey-text text-darken-2'>
                          <div className='col s9'>Description</div>
                          <div className='col s3'>Due Date</div>
                        </div>
                      </li>
                      {
                        action_items.map((actionItem, i) => {
                          return <Meetings.ActionItem {...this.props} {...actionItem} index={i} key={actionItem.id} parent={this} />
                        })
                      }
                    </ul>
                    {(error && errorMessages['action_items.description']) && <div className='error-message'>{errorMessages['action_items.description']}</div>}
                  </div>
                </div>
              }

              <div className='row'>
                <button name='button' type='button' style={{marginRight: 10}} className='btn waves-effect waves-light blue darken-1' onClick={this.addActionItem}>
                  Add Action Item
                </button>
                <button name='button' type='submit' className='btn waves-effect waves-light'>
                  { newMeeting ? 'Meeting Finished' : 'Save' }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
});

Meetings.ActionItem = React.createClass({
  getInitialState() {
    return { adminAssigned: !!this.props.user_id };
  },
  componentDidMount() {
    $(ReactDOM.findDOMNode(this)).find('.datepicker').pickadate();
    $(ReactDOM.findDOMNode(this)).find('.tooltipped').tooltip();
    $(ReactDOM.findDOMNode(this)).velocity('transition.slideDownIn', { complete: (el) => $(el).css('transform', 'initial') });
  },
  toggleAssignedAdmin(e) {
    e.preventDefault();
    this.setState({ adminAssigned: !this.state.adminAssigned });
  },
  handleClose(e) {
    e.preventDefault();
    const { newActionItem, parent, index } = this.props;
    if(newActionItem) {
      parent.setState({ meeting: update(parent.state.meeting, { action_items: { $splice: [[index, 1]] } }) });
    } else {
      this.setState({ removed: true });
    }
  },
  render() {
    const { id, description, due_date, completed, user_id, index, adminId, newActionItem } = this.props;
    const { adminAssigned, removed } = this.state;
    return(
      <li className='collection-item' style={removed ? { display: 'none' } : {}}>
        {!newActionItem && <input type='hidden' value={id} name={`meeting[action_items_attributes][${index}][id]`} />}
        {removed && <input type='hidden' value='1' name={`meeting[action_items_attributes][${index}][_destroy]`} />}
        <div className='row'>
          {adminId && <i data-position='top' data-delay='50' data-tooltip={adminAssigned ? 'Unassign advisor' : 'Assign advisor' } className={`fa fa-user advisor-btn tooltipped ${adminAssigned ? 'blue-text' : 'grey-text text-darken-2'}`} onClick={this.toggleAssignedAdmin}></i>}
          <a className='action-item close grey-text text-darken-2' onClick={this.handleClose}>×</a>
          <input type='hidden' value={adminAssigned ? (adminId || user_id) : ''} name={`meeting[action_items_attributes][${index}][user_id]`} />
          <div className='input-field col s9'>
            <input type='text' name={`meeting[action_items_attributes][${index}][description]`} placeholder='Description' defaultValue={description} />
          </div>
          <div className='input-field col s3'>
             <input type='text' className='datepicker' name={`meeting[action_items_attributes][${index}][due_date]`} placeholder='Due Date' defaultValue={due_date ? moment(due_date).format('D MMMM, YYYY') : ''} />
          </div>
        </div>
      </li>
    );
  }
});
