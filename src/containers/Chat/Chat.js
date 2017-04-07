/**
 * Created by jiang on 2017/3/4.
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import io from 'socket.io-client';
import { getAllAdmin, getAllMsg } from 'redux/modules/auth';
// import store from 'store';
import Dropzone from 'react-dropzone';

@connect(
  state => ({
    allAdmin: state.auth.allAdmin, user: state.auth.user,
  }),
  {
    getAllAdmin, getAllMsg
  }
)
export default class Chat extends Component {
  static propTypes = {
    user       : PropTypes.object,
    getAllAdmin: PropTypes.func,
    getAllMsg  : PropTypes.func,
    allAdmin   : PropTypes.array,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      socket       : {},
      userList     : [],
      currentUser  : {},
      adminList    : [],
      message      : {},
      editMessage  : '',
      newMessageObj: {},
      files        : [],
      base         : '',
      fileName     : '',
      onlineSum    : 0
    };
  }

  componentWillMount() {
    this._getAllAdmin();
  }

  componentDidMount() {
    if (window.Notification && Notification.permission !== 'granted') Notification.requestPermission();
  }

  componentWillReceiveProps(nextProps) {
    const {allAdmin} = nextProps;
    if (allAdmin) {
      this.socketInit();
      this.setState({adminList: allAdmin});
    }
  }

  componentDidUpdate() {
    const eles = this.refs['message-list'].querySelectorAll('.line');
    if (eles.length > 0) eles[eles.length - 1].scrollIntoView();
  }

  onDrop = (files) => {
    this.setState({files, fileName: files[0].name});
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = this.completeBase64;
  };

  _getAllAdmin = () => {
    this.props.getAllAdmin(() => {
    });
  };

  upLoad = () => {
    this.refs.dropZone.open();
  };

  completeBase64 = (event) => {
    this.setState({base: event.target.result});
    this.sendMessage();
  };

  receiveMsg = (data) => {
    if (window.Notification) {
      const notify = new Notification(data.name, {body: data.val});
      notify.onclick = function windowFocus() {
        window.focus();
      };
      setTimeout(() => notify.close(), 3000);
    }

    data.type = 'server';
    const {message, adminList, newMessageObj} = this.state;

    if (!message[data._id]) message[data._id] = [];
    if (message[data._id].length > 99) message[data._id].shift();

    message[data._id].push(data);
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
        _id
      });
    });

    socket.on('info', (data = {}) => {
      const {onlineSum} = data;
      this.setState({onlineSum});
    });

    socket.on('userList', (data) => {
      const {adminList} = this.state;
      this.checkOnline(adminList, data);
    });

    socket.on('addUser', (data) => {
      const {adminList, userList, currentUser} = this.state;
      userList.push(data);
      if (currentUser._id === data._id) this.setState({currentUser: {...currentUser, id: data.id}});
      this.checkOnline(adminList, userList);
    });

    socket.on('removeUser', (data) => {
      const {adminList, userList} = this.state;
      this.checkOnline(adminList, userList.filter(item => (item.id !== data.id)));
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
    const {currentUser, message} = this.state;
    const adminList = allAdmin.map((item) => {
      const result = {...item};
      for (let index = 0, len = userList.length; index < len; index++) {
        if (item._id === userList[index]._id) {
          result.online = true;
          result.id = userList[index].id;
          break;
        } else {
          result.online = false;
          result.id = '';
        }
      }
      return result;
    }).sort((one, two) => {
      if (one.online && !two.online) return -1;
      if (!one.online && two.online) return 1;
      if ((!one.online && !two.online) || (one.online && two.online)) return 0;
    });

    if (!currentUser._id) {
      this.props.getAllMsg({come: adminList[0]._id, to: this.props.user._id}, ({msg}) => {
        if (msg) {
          message[adminList[0]._id] = msg.map((item) => {
            return {
              ...item.msg,
              type: item.come === this.props.user._id ? 'self' : 'server'
            };
          });
        } else {
          message[adminList[0]._id] = [];
        }

        this.setState({
          currentUser: adminList[0],
          message
        });
      });
    }

    this.setState({
      adminList,
      userList
    });
  };

  changeCurrentUser = (item) => {
    const {_id} = item;
    const {newMessageObj, message} = this.state;
    delete newMessageObj[_id];

    if (!message[_id]) {
      this.props.getAllMsg({come: _id, to: this.props.user._id}, ({msg}) => {
        if (msg) {
          message[_id] = msg.map((ditem) => {
            return {
              ...ditem.msg,
              type: ditem.come === this.props.user._id ? 'self' : 'server'
            };
          });
        } else {
          message[_id] = [];
        }

        this.setState({
          message
        });
      });
    }

    this.setState({
      newMessageObj,
      currentUser: item
    });
  };

  sendMessage = () => {
    const {currentUser, socket, editMessage, message, base, fileName = ''} = this.state;
    const {name, _id} = this.props.user;
    const val = editMessage.replace(/[\r\n]/g, '<br/>');
    const sendMsg = {id: currentUser.id, val, name, _id, type: 'self', to: currentUser._id, base, fileName};
    socket.emit('message', sendMsg);

    if (message[currentUser._id] && message[currentUser._id].length > 99) message[currentUser._id].shift();
    if (!message[currentUser._id]) message[currentUser._id] = [];

    message[currentUser._id].push(sendMsg);
    this.setState({
      message,
      base       : '',
      editMessage: '',
      fileName   : ''
    });
  };

  sendKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.sendMessage();
    }
  };

  editMessage = (event) => {
    const editMessage = event.target.value;
    this.setState({
      editMessage
    });
  };

  checkMsgLine = (val = '') => {
    if (!val) return '';
    const valSplit = val.split('<br/>');
    return valSplit.map((item, index) => {
      return (
        <span key={`msg${index}`}>
          {item}<br/>
        </span>
      );
    });
  };

  rendMessage = () => {
    const {user} = this.props;
    const {message, currentUser} = this.state;
    const messageArray = message[currentUser._id] || [];
    return messageArray.map((item, index) => {
      const {name, fileName, val, base} = item;
      if (item.type === 'server') {
        return (
          <div className="chat-other line" key={`server${index}`}>
            <div className="other-left">
              <div className="other-small">
                {currentUser.avatar_url && <img src={currentUser.avatar_url}/>}
              </div>
            </div>
            <div className="other-right">
              <h3>{name}</h3>
              <div className="other-message">
                <span>
                  {this.checkMsgLine(val)}
                  {fileName && (fileName.indexOf('jpg') > -1 || fileName.indexOf('png') > -1 || fileName.indexOf('jpeg') > -1) &&
                  <span><img src={base || fileName}/></span>}
                  {fileName && !(fileName.indexOf('jpg') > -1 || fileName.indexOf('png') > -1 || fileName.indexOf('jpeg') > -1) &&
                  <span><a download={fileName} href={fileName}>{fileName}</a></span>}
                </span>
              </div>
            </div>
          </div>
        );
      } else if (item.type === 'self') {
        return (
          <div className="chat-self line" key={`self${index}`}>
            <div className="self-right">
              <div className="self-small">
                {user.avatar_url && <img src={user.avatar_url}/>}
              </div>
            </div>
            <div className="self-left">
              <h3>{name}</h3>
              <div className="self-message">
                <span>
                  {this.checkMsgLine(val)}
                  {fileName && (fileName.indexOf('jpg') > -1 || fileName.indexOf('png') > -1 || fileName.indexOf('jpeg') > -1) &&
                  <span><img src={base || fileName}/></span>}
                  {fileName && !(fileName.indexOf('jpg') > -1 || fileName.indexOf('png') > -1 || fileName.indexOf('jpeg') > -1) &&
                  <span><a download={fileName} href={fileName}>{fileName}</a></span>}
                </span>
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
      if ((item._id === currentUser._id) && !newMessageObj[item._id]) {
        className = 'active';
      } else if ((item._id === currentUser._id) && newMessageObj[item._id]) {
        className = 'active new-message';
      } else if (!(item._id === currentUser._id) && newMessageObj[item._id]) {
        className = 'new-message';
      }
      return className;
    }

    return (adminList || []).map((item, index) => {
      const messageArray = message[item._id];
      const lastMessage = (messageArray && messageArray.length > 0)
        ? messageArray[messageArray.length - 1].val : '';
      return (
        <li key={`admins${index}`}
            className={checkClass(item)}
            onClick={this.changeCurrentUser.bind(this, item)}>
          <div className={item.online ? 'user-avatar online' : 'user-avatar'}>
            {item.avatar_url && <img src={item.avatar_url} style={item.online ? {} : {filter: 'grayscale(100%)'}}/>}
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
    const {socket, onlineSum} = this.state;
    const {id = ' 连接中。。。 '} = socket;
    return (
      <span className="me">{name + '(socket:' + id + ')'}<span>{`(在线人数: ${onlineSum}人 )`}</span></span>
    );
  };

  render() {
    console.log('chat state ----->', this.state);
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
              <div style={{display: 'none'}}>
                <Dropzone ref="dropZone" onDrop={this.onDrop}/>
              </div>
              <div onClick={this.upLoad} className="send-image">发送图片</div>
              <textarea onChange={this.editMessage} onKeyDown={this.sendKeyDown} className="text-area" autoFocus
                        id="send-text" ref="send-text" value={editMessage}>
              </textarea>
              <div onClick={this.sendMessage} className="send-btn">发送</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
