import React from 'react';
import firebase from 'firebase';
import {hashHistory,Link} from 'react-router';
import {ListGroup, ListGroupItem, FormGroup, FormControl, ButtonToolbar, Button,Row, Col,Grid} from 'react-bootstrap';

class Page extends React.Component{
constructor(props){
  super(props);
  this.state = {
      channelName:'',
      channelsArray:[]
  }

  firebase.database().ref('channel').on('value',(snapshot) => {
    var channelsArray = [];
    snapshot.forEach((singel) => {
      var channelObj = singel.val()
      channelObj.key = singel.key;
      channelsArray.push(channelObj);
    })
    this.setState({
      channelsArray:channelsArray
    });
  });

  this.handleChange = this.handleChange.bind(this);
}

handleChange(event){
  var value = event.target.value;
  var name = event.target.id;
  var changes = {};
  changes[name] = value;
  this.setState(changes);
}

goToChannel(){
  hashHistory.push('/channel/'+ this.state.channelName);
}

render(){

  var info = this.state.channelsArray.map(function(each){
    if(each.key !== "general"){
      return <ListGroupItem key={each.key}><Link to={"/channel/" + each.key}>{"#"+ each.key}</Link></ListGroupItem>
    }
  });
  return (
      <div className="container">
        <Grid>
          <Row className="show-grid">    
          <h3 className="channelName">Welcome to WeTalk </h3>
          <p className="intro">-- a Fun Place to post feelings and chat with friends!</p>
          <Col xs={12} sm={12} md={12}>
              <ListGroup>
                <ListGroupItem><Link to="/channel/general" activeClassName="activeLink">#General</Link></ListGroupItem>
                {info}
              </ListGroup>
                <FormGroup className="create" bsSize="large">
                  <FormControl type="text" id='channelName' placeholder="name for new Channel" onChange={this.handleChange}/>
                </FormGroup>
                <ButtonToolbar className="create" id="button">
                  <Button className='button'onClick={(event) => this.goToChannel(event)}> Create Here </Button>
                </ButtonToolbar>
            </Col>
            </Row>
          </Grid>
              <main className="container">
                <Grid>
                  <Row className="show-grid">
                  <Col xs={12} sm={12}>{this.props.children}</Col>
                  </Row>
                </Grid>
              </main>
      </div>
  )
}
}

export default Page;

