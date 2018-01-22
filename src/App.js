import React from 'react';
import firebase from 'firebase';
import {hashHistory, Link} from 'react-router';
import {Layout, Header, Drawer, Navigation} from 'react-mdl';
import {Row, Col,Grid} from 'react-bootstrap';

//a "root" component
class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userId:'',
      channelsArray:[]
    };

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
}

  componentDidMount() {
    /* Add a listener and callback for authentication events */
    this.unregister = firebase.auth().onAuthStateChanged(user => {
      if(user) {
        console.log('Auth state changed: logged in as', user.email);
        this.setState({userId:user.uid});
        hashHistory.push('/channels');
      }
      else{
        console.log('Auth state changed: logged out');
        this.setState({userId: null}); //null out the saved state
        hashHistory.push('/login');
      }
    })
  }

  componentWillUnMount(){
    if(this.unregister){
      this.unregister();
    }
  }

  //A callback function for logging out the current user
  signOut(){
    /* Sign out the user, and update the state */
    firebase.auth().signOut();
  }
  
  //how to display this component
  render() {
    if(!this.state){
      return null
    }else if(this.state.userId){
      var info = this.state.channelsArray.map(function(each){
        return <li key={each.key}><Link to={"/channel/" + each.key} activeClassName="activeLink">{"#"+ each.key}</Link></li>
      })
    }
    return (
      <div>
          <div style={{height: '900px', position: 'relative'}}> 
              <Layout fixedHeader className="nav">
                  <Header transparent title="WeTalk" style={{color: 'white'}}>
                    {this.state.userId &&  /*inline conditional rendering*/
                      <div className="logout">
                        <button className="btn btn-warning" onClick={()=>this.signOut()}>Sign out {firebase.auth().currentUser.displayName}
                          {/* Show user name on sign out button */}
                        </button>
                      </div>
                    }
                  </Header>
                  <Drawer title="Channels We Have">
                      <Navigation>   
                        {info}
                        {this.state.userId &&
                        <Link to={"/channels"} activeClassName="activeLink">HomePage</Link>
                        }
                      </Navigation>
                  </Drawer>

                  <main>
                    <Grid>
                      <Row className="show-grid">
                        <Col sm={12} md={12} lg={12}>{this.props.children}</Col>
                      </Row>
                    </Grid>
                  </main>    
              </Layout>
          </div>

      </div>
    );
  }
}

//more Components can go here!


export default App; //make this class available to other files (e.g., index.js)