import React, { Component } from 'react';
import Moment from 'moment';
import ChatLists from './ChatLists';
import background from '../chat.png';


export default class ChatBox extends Component {

  scrollDown = () => {
    const { chat_container } = this.refs;
    chat_container.scrollTop = chat_container.scrollHeight;
  }

  componentDidMount() {
    this.scrollDown();
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollDown();  
  }

  render() {  
    const { id, getUsersConversations, hasToken } = this.props;
  
    return (
        <div className="chatapp__mainchat--container">
          {
            (id)
            ? <ChatLists 
                getUsersConversation={getUsersConversations}
                hasToken={hasToken}
                {...this.props}
                />
              : null
          }
          <div className="chatapp__chatbox">
            <div className="chatapp__chatbox--messages" ref="chat_container">
              <img className="img-good" src={background} alt="not found"/>
            </div>
          </div>
        </div>
    )
  }
}
