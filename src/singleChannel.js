
import React from 'react';
import Time from  'react-time';
import firebase from 'firebase';
import {Button,Row, Col,Grid,Modal,FormGroup, FormControl} from 'react-bootstrap';

// this is class function will render all of component in a single channel
class ChannelPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      channel: ''
    }
  }

  componentWillMount() {
    var channelname = this.props.params.channelName;
    this.unregister = firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.setState({
          user:user,
          channel:channelname
        });
      }
    })
  }
  
  componentWillReceiveProps(nextProps) {
    var channelname = this.props.params.channelName;
    this.unregister = firebase.auth().onAuthStateChanged(user => {
      if(user){
        this.setState({
          user:user,
          channel:channelname
        });
      }
    })
  }

  componentWillUnmount() {
    if(this.unregister){
      this.unregister();
    }
  }

  render(){
    if(!this.state.user){
      return null;
    } 
    return(
      <div>
        <MessageBox user={this.state.user} channelS={this.state.channel} />
        <MessageList user={this.state.user} channelS={this.state.channel} />
      </div>
    )
  }
}

// create the box and user can put their chat content 
class MessageBox extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        post: ''
    };
  }

   //when the text in the form changes
  updatePost(event) {
    this.setState({post: event.target.value});
  }


  //post a new chat to the database
  postChat(event){
    event.preventDefault(); //don't submit
    //this.updatePost;

    this.unregister = firebase.auth().onAuthStateChanged((user) => {
      if(user){
        if(user.emailVerified){
          console.log('Email is verified!');
          var newChat = {
            text: this.state.post,
            userId: firebase.auth().currentUser.uid, //to look up chater info
            time: firebase.database.ServerValue.TIMESTAMP //MAGIC
          };  
          var chatsRef = firebase.database().ref("channel/" + this.props.channelS); //the chats in the JOITC
          var recentPostsRef = firebase.database().ref("channel/" + this.props.channelS).limitToFirst(2);
          chatsRef.push(newChat); //upload
          this.setState({post:''}); //empty out post (controlled input)
        }else{
          alert('Please sign out and click your verification email before posting.');
        }
      }
    });
  }

  render() {
    return (
      <Grid>
        <Row className="show-grid">   
        <div className="chirp-box write-chirp">
        <h3 className="channelName"> {this.props.channelS} Channel </h3>
          {/* Show image of current user, who must be logged in */}
          <Col xs={12} sm={12} md={12}>
          <div className="input">
          <img className="image" src={this.props.user.photoURL} alt="user gravatar"/>
          <form className="chirp-input" role="form">
            <textarea placeholder="What's Happening..." name="text" value={this.state.post} className="form-control" onChange={(e) => this.updatePost(e)}></textarea>
            {/* Only show this if the post length is > 140 */}
            {this.state.post.length > 140 &&
              <p className="help-block">140 character limit!</p>
            }
            <div className="form-group send-chirp">
              {/* Disable if invalid post length */}
              <Col xs={12} sm={12} md={12} lg={12}>
              <button className="btn btn-primary" 
                      disabled={this.state.post.length === 0 || this.state.post.length > 140}
                      onClick={(e) => this.postChat(e)} >
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i> Share
              </button> 		
              </Col>			
            </div>
          </form></div></Col>
        </div>
        </Row>
      </Grid>
    );
  }
}

//A list of chats that have been posted
class MessageList extends React.Component {
  constructor(props){
    super(props);
    this.state = {chats:[]};
  }

  //Lifecycle callback executed when the component appears on the screen.
  //It is cleaner to use this than the constructor for fetching data
  componentDidMount() {
    /* Add a listener for changes to the user details object, and save in the state */
    var usersRef = firebase.database().ref('users');
    usersRef.on('value', (snapshot) => {
      this.setState({users:snapshot.val()});
    });

    /* Add a listener for changes to the chats object, and save in the state */
    var chatsRef = firebase.database().ref("channel/"+this.props.channelS);
    
    chatsRef.on('value', (snapshot) => {
      var chatArray = []; //could also do this processing in render
      snapshot.forEach(function(child){
        var chat = child.val();
        chat.key = child.key; //save the unique id for later
        chatArray.push(chat); //make into an array
      });
      chatArray.sort((a,b) => b.time - a.time); //reverse order
      this.setState({chats:chatArray});
    });
  }


  //When component will be removed
  componentWillUnmount() {
    //unregister listeners
    firebase.database().ref('users').off();
    firebase.database().ref("channel/" + this.props.channelS).off();
  }

  componentWillReceiveProps(nextProps) {
    var usersRef = firebase.database().ref('users');
    usersRef.on('value', (snapshot) => {
      this.setState({users:snapshot.val()});
    });

    /* Add a listener for changes to the chats object, and save in the state */
    var chatsRef = firebase.database().ref("channel/"+this.props.channelS);
    
    chatsRef.on('value', (snapshot) => {
      var chatArray = []; //could also do this processing in render
      snapshot.forEach(function(child){
        var chat = child.val();
        chat.key = child.key; //save the unique id for later
        chatArray.push(chat); //make into an array
      });
      chatArray.sort((a,b) => b.time - a.time); //reverse order
      this.setState({chats:chatArray});
    });
  }

  componentWillUnmount() {
    //unregister listeners
    firebase.database().ref('users').off();
    firebase.database().ref("channel/" + this.props.channelS).off();
  }

  render() {
    //don't show if don't have user data yet (to avoid partial loads)
    if(!this.props.user){
      return null;
    } 
    /* Create a list of <chatItem /> objects */
    
    var messageItems = this.state.chats.map((chat) => {
      return <MessageItem chat={chat} 
                        user={this.state.users[chat.userId]} 
                        check={this.props.user.displayName}
                        key={chat.key} 
                        channel={this.props.channelS}
                        id={this.props.user.uid}/>
    })

    return <div>{messageItems}</div>;
  }  
}

//A single chat
class MessageItem extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      show:false,
      text:this.props.chat.text
    }
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event){
    var value = event.target.value;
    var name = event.target.id;
    var changes = {};
    changes[name] = value;
    this.setState(changes);
  }

  handleDelete(){
    var adaRef = firebase.database().ref('channel/'+this.props.channel +'/'+ this.props.chat.key);
    adaRef.remove()
    .then(function() {
      console.log("Remove succeeded.")
    })
    .catch(function(error) {
      console.log("Remove failed: " + error.message)
    });
  }

  handleEdit(){
    var editRef = firebase.database().ref('channel/'+this.props.channel +'/'+ this.props.chat.key + '/text');
    editRef.set(this.state.text);
  }

  render() {
    var avatar = this.props.user.avatar;
    let close = () => this.setState({ show: false});
    
    
    return (
      <Grid>
        <Row className="show-grid"> 
        <Col xs={12} sm={12} md={12}>  
        <div className="chirp-box ">
          <div>
            {/* This image's src should be the user's avatar */}
            <img className="image" src={avatar} role="presentation" />
            
            {/* Show the user's handle */}
            <span className="handle">{this.props.user.handle} {/*space*/}</span>

            {/* Show the time of the chat (use a Time component!) */}
            <span className="time"><Time value={this.props.chat.time} relative/></span>
          </div>
          {/* Show the text of the chat */}
          <div className="chirp">{this.props.chat.text}</div>
          {/* Show the delete and edit button*/} 
          {this.props.check === this.props.user.handle &&
          <div className='btn'>
            <div className="modal-container" style={{height: 50}}>
              <Button
                bsStyle="danger"
                bsSize="small"
                onClick={() => this.setState({ show: true})}
              >
                Delete
              </Button>
              <Modal
                show={this.state.show}
                onHide={close}
                container={this}
                aria-labelledby="contained-modal-title"
              >
                <Modal.Header closeButton>
                  <Modal.Title id="contained-modal-title">Delete this message:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Since deleting content cannot be undone, are you sure?
                </Modal.Body>
                <Modal.Footer>
                  <Button onClick={close}>Close</Button>
                  <Button bsStyle="danger" bsSize="small" className="delete" onClick={this.handleDelete}>Delete</Button>
                </Modal.Footer>
              </Modal>
            </div> 
            <div className="modal-container" style={{height: 50}}>
              <Button
                bsStyle="danger"
                bsSize="small"
                onClick={() => this.setState({ show: true})}
              >
                Edit
              </Button>
              <Modal
                show={this.state.show}
                onHide={close}
                container={this}
                aria-labelledby="contained-modal-title"
              >
                <Modal.Header closeButton>
                  <Modal.Title id="contained-modal-title">Delete this message:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <FormGroup className="create" bsSize="large">
                    <FormControl type="text" id='text' placeholder="new content" onChange={this.handleChange}/>
                  </FormGroup>
                </Modal.Body>
                <Modal.Footer>
                  <Button onClick={close}>Close</Button>
                  <Button bsStyle="danger" bsSize="small" className="delete" onClick={this.handleEdit}>Done</Button>
                </Modal.Footer>
              </Modal>
            </div> 
          </div>
          }
        </div>  
        </Col>
        </Row>
      </Grid>    
    );
  }
}

export default ChannelPage;