/**
 * Created by jiang on 2017/3/4.
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import io from 'socket.io-client';
import {getAllAdmin} from 'redux/modules/auth';
import store from 'store';

@connect(
  state => ({
    user: state.auth.user,
    allAdmin: state.auth.allAdmin
  }),
  {
    getAllAdmin
  }
)
export default class Chat extends Component {
  static propTypes = {
    user: PropTypes.object,
    getAllAdmin: PropTypes.func,
    allAdmin: PropTypes.array
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      socket: {},
      userList: [],
      currentUser: {},
      adminList: [],
      message: store.get('message') || {},
      editMessage: '',
      newMessageObj: {}
    };
  }

  componentWillMount() {
    this._getAllAdmin();
  }

  componentDidMount() {
    Notification.requestPermission();
  }

  componentWillReceiveProps(nextProps) {
    const {allAdmin} = nextProps;
    this.setState({
      adminList: allAdmin
    });
    this.socketInit();
  }

  componentDidUpdate() {
    const eles = this.refs['message-list'].querySelectorAll('.line');
    if (eles.length > 0) eles[eles.length - 1].scrollIntoView();
  }

  _getAllAdmin = () => {
    this.props.getAllAdmin(() => {
    });
  };

  receiveMsg = (data) => {
    const notification = new Notification(data.name, {body: data.val});
    console.log(notification);
    data.type = 'server';
    const {message, adminList, newMessageObj} = this.state;
    if (message[data._id]) {
      if (message[data._id].length > 100) message[data._id].shift();
      message[data._id].push(data);
    } else {
      message[data._id] = [];
      message[data._id].push(data);
    }
    store.set('message', message);
    // if (currentUser.userId !== data._id)
    newMessageObj[data._id] = data;
    this.setState({
      newMessageObj,
      adminList,
      message
    });
  };

  socketInit = () => {
    const socket = io('', {path: '/ws'});
    const {name, _id} = this.props.user;

    socket.on('connect', () => {
      this.setState({socket});
      socket.emit('name', {
        name,
        id: _id
      });
    });

    socket.on('info', (data) => {
      console.log(data);
    });

    socket.on('userList', (data) => {
      const {adminList} = this.state;
      this.setState({
        currentUser: data[0]
      });
      this.checkOnline(adminList, data);
    });

    socket.on('addUser', (data) => {
      const {adminList, userList} = this.state;
      userList.push(data);
      this.checkOnline(adminList, userList);
    });

    socket.on('removeUser', (data) => {
      let {userList} = this.state;
      const {adminList} = this.state;
      userList = userList.filter((item) => {
        return item.id !== data.id;
      });
      this.checkOnline(adminList, userList);
    });

    socket.on('message', (dataServer) => {
      if (dataServer instanceof Array) {
        dataServer.forEach((item) => {
          this.receiveMsg(item);
        });
      } else {
        this.receiveMsg(dataServer);
      }
    });
  };

  checkOnline = (allAdmin, userList) => {
    const adminList = allAdmin.map((item) => {
      const result = {...item};
      for (let index = 0, len = userList.length; index < len; index++) {
        if (item._id === userList[index].userId) {
          result.online = true;
          result.socketId = userList[index].id;
          break;
        } else {
          result.online = false;
          result.socketId = '';
        }
      }
      return result;
    }).sort((one, two) => {
      if (one.online && two.online) return 0;
      if (one.online && !two.online) return -1;
      if (!one.online && two.online) return 1;
      if (!one.online && !two.online) return 0;
    });

    this.setState({
      adminList,
      userList
    });
  };

  changeCurrentUser = (userId, name, id) => {
    const {newMessageObj} = this.state;
    delete newMessageObj[userId];
    this.setState({
      newMessageObj,
      currentUser: {userId, name, id}
    });
  };

  sendMessage = (event) => {
    if (event.ctrlKey && event.keyCode === 13) {
      const {currentUser, socket, editMessage, message} = this.state;
      const {name, _id} = this.props.user;
      const val = editMessage.replace(/[\r\n]/g, '<br/>');
      const sendMsg = {id: currentUser.id, val, name, _id, type: 'self', to: currentUser.userId};
      socket.emit('message', sendMsg);

      if (message[currentUser.userId]) {
        if (message[currentUser.userId].length > 100) message[currentUser.userId].shift();
        message[currentUser.userId].push(sendMsg);
      } else {
        message[currentUser.userId] = [];
        message[currentUser.userId].push(sendMsg);
      }
      store.set('message', message);
      this.setState({
        message,
        editMessage: ''
      });
    }
  };

  editMessage = (event) => {
    const editMessage = event.target.value;
    this.setState({
      editMessage
    });
  };

  rendMessage = () => {
    const {message, currentUser} = this.state;
    const messageArray = message[currentUser.userId] || [];
    return messageArray.map((item, index) => {
      if (item.type === 'server') {
        return (
          <div className="chat-other line" key={`server${index}`}>
            <div className="other-left">
              <div className="other-small">

              </div>
            </div>
            <div className="other-right">
              <h3>{item.name}</h3>
              <div className="other-message">
                <span>{item.val}</span>
              </div>
            </div>
          </div>
        );
      } else if (item.type === 'self') {
        return (
          <div className="chat-self line" key={`self${index}`}>
            <div className="self-right">
              <div className="self-small">

              </div>
            </div>
            <div className="self-left">
              <h3>{item.name}</h3>
              <div className="self-message">
                <span>{item.val}</span>
              </div>
            </div>
          </div>
        );
      }
    });
  };

  renderUserList = () => {
    const {currentUser, adminList, newMessageObj, message} = this.state;

    function checkClass(item) {
      let className = '';
      if ((item._id === currentUser.userId) && !newMessageObj[item._id]) {
        className = 'active';
      } else if ((item._id === currentUser.userId) && newMessageObj[item._id]) {
        className = 'active new-message';
      } else if (!(item._id === currentUser.userId) && newMessageObj[item._id]) {
        className = 'new-message';
      }
      return className;
    }

    return adminList.map((item, index) => {
      const messageArray = message[item._id];
      const lastMessage = messageArray ? messageArray[messageArray.length - 1].val : ' - - - ';
      return (
        <li key={`admins${index}`}
            className={checkClass(item)}
            onClick={this.changeCurrentUser.bind(this, item._id, item.name, item.socketId)}>
          <div className={item.online ? 'user-avatar online' : 'user-avatar'}>
          </div>
          <div className="user-info">
            <h2>{item.name}</h2>
            {lastMessage}
          </div>
        </li>
      );
    });
  };

  renderTitle = () => {
    const {name} = this.props.user;
    const {socket} = this.state;
    const {id = ' 连接中。。。 '} = socket;
    return (
      <span className="me">{name + '(socket:' + id + ')'}</span>
    );
  };

  render() {
    console.log('chat state -->', this.state);
    const {editMessage} = this.state;
    return (
      <div className="chat-home">
        <Helmet title="Chat"/>
        <div className="chat-head">
          {this.renderTitle()}
          <ul>
            <li className="close"></li>
            <li className="small"></li>
            <li className="big"></li>
          </ul>
        </div>
        <div className="chat-content">
          <div className="chat-left">
            <div className="chat-info">

            </div>
            <div className="user">
              <ul id="user-list" ref="user-list">
                {this.renderUserList()}
              </ul>
            </div>
          </div>
          <div className="chat-right">
            <div className="chat-message" id="message-list" ref="message-list">
              {this.rendMessage()}
            </div>
            <div className="chat-send">
                <textarea onChange={this.editMessage} onKeyDown={this.sendMessage} className="text-area" autoFocus
                          id="send-text" ref="send-text" value={editMessage}>
                </textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
