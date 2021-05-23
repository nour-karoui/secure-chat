import React, { Component } from 'react';
import AddChannelBtn from './AddChannelBtn';
import AddDMBtn from './AddDMBtn';

export default class ChatLists extends Component {

  componentDidMount() {
    // Gets most recent conversations
    this.props.getUsersConversations();
  }

  render() {
    const { usersChannels, handleChange, handleSubmit, createChannel, removeChannel, joinChannel, usersDirectMessages, leaveConversation, choosePrivateMessageRecipient } = this.props;
  
    return (
      <div className="chatapp__userpanel--container">
        <div className="userpanel__channels--container">
          <div className="userpanel__channels--add">
            <p>Private Messages</p>
            <AddDMBtn 
            {...this.props}
            />
          </div>
          <div className="userpanel__channels--list">
            {
                (usersDirectMessages)
                  ? <ul>
                      {usersDirectMessages.map((conversation, index) => {
                        return(
                          <li onClick={() => { choosePrivateMessageRecipient(conversation) }} key={`convoId-${index}`}>
                              <p>
                                {conversation.username}
                              </p>
                              <div onClick={(e) =>{e.stopPropagation()}}>
                                <button onClick={() => {leaveConversation(conversation._id, conversation.username)}}>&#xf014;</button>
                              </div>
                          </li>
                        )
                      })}
                    </ul>
                  : <p>No Active Conversations</p>
              }
          </div>
        </div>
      </div>
    )
  }
}
