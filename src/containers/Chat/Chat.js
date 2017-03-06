/**
 * Created by jiang on 2017/3/4.
 */

import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import io from 'socket.io-client';

@connect(
  state => ({user: state.auth.user}), {}
)
export default class Chat extends Component {
  static propTypes = {
    user: PropTypes.object
  };

  componentDidMount() {
    this.setSocket(this.props.user);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  setSocket = (user) => {
    let selfName = '';
    let selfId = '';
    let currentUser = null;
    const nameValue = user.name;
    selfName = nameValue;
    const socket = io('', {path: '/ws'});
    socket.on('connect', () => {
      console.log('连上了');
      socket.emit('name', nameValue);
    });

    socket.on('info', (data) => {
      selfId = data.id;
      $('#me').text(selfName + '(' + data.id + ')');
    });

    function bindClick() {
      $(this)
        .addClass('active')
        .siblings()
        .removeClass('active');

      const id = $(this).attr('id');
      const name = $(this).find('h2').text();
      currentUser = {id: id, name: name};
      const ele = $('#message' + id);
      ele.show(() => {
        const eleD = ele.find('div').last()[0];
        if (eleD) eleD.scrollIntoView();
      });
      ele.siblings().hide();
    }

    socket.on('nameList', (data) => {
      const userList = $('#user-list')[0];
      let htmlStr = '';
      data.forEach((item) => {
        htmlStr += '<li id="' + item.id + '">' +
          '<div class="user-avatar">' +
          '</div>' +
          '<div class="user-info">' +
          '<h2>' + item.name + '</h2>' +
          '</div>' +
          '</li>';
        userList.innerHTML = htmlStr;

        const messageEle = $('#message-list');
        const ele = $('<div id="message' + item.id + '"></div>');
        messageEle.append(ele);
      });

      $('#user-list').delegate('li', 'click', bindClick);
      $('#user-list li').eq(0).click();
    });

    function writeServer(message) {
      const id = message.self;
      const name = message.name;
      const conotentEle = $('#message' + id);
      const htmlStr = '<div class="chat-other">' +
        '<div class="other-left">' +
        '<div class="other-small">' +

        '</div>' +
        '</div>' +
        '<div class="other-right">' +
        '<h3>' + name + '</h3>' +
        '<div class="other-message">' +
        '<span>' +
        message.value +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
      const ele = $(htmlStr);
      conotentEle.append(ele);
      conotentEle.find('div').last()[0].scrollIntoView();
    }

    function writeMyself(message) {
      const id = currentUser.id;
      const conotentEle = $('#message' + id);
      const htmlStr = '<div class="chat-self">' +
        '<div class="self-right">' +
        '<div class="self-small">' +
        '</div>' +
        '</div>' +
        '<div class="self-left">' +
        '<h3>' + selfName + '</h3>' +
        '<div class="self-message">' +
        '<span>' + message + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
      const ele = $(htmlStr);
      conotentEle.append(ele);
      conotentEle.find('div').last()[0].scrollIntoView();
    }

    socket.on('addUser', (data) => {
      const userList = $('#user-list')[0];
      const li = document.createElement('li');
      li.id = data.id;
      li.innerHTML = '<div class="user-avatar">' +
        '</div>' +
        '<div class="user-info">' +
        '<h2>' + data.name + '</h2>' +
        '</div>';
      userList.appendChild(li);

      const messageEle = $('#message-list');
      const ele = $('<div style="display: none;" id="message' + data.id + '"></div>');
      messageEle.append(ele);
    });

    socket.on('removeUser', (data) => {
      const id = data.id;
      $('#' + id).remove();
      $('#message' + id).remove();
    });

    socket.on('message', (data) => {
      writeServer(data);
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.keyCode === 13) {
        const ele = $('#send-text');
        let value = ele.val();
        value = value.replace(/[\r\n]/g, '<br/>');
        socket.emit('message', {id: currentUser.id, value: value, name: selfName, self: selfId});
        ele.val('');
        writeMyself(value);
      }
    });
  };

  render() {
    return (
      <div className="chat-home">
        <Helmet title="CHat"/>
        <div className="chat-head">
          <span className="me" id="me"></span>
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
              <ul id="user-list">
              </ul>
            </div>
          </div>
          <div className="chat-right">
            <div className="chat-message" id="message-list">
            </div>
            <div className="chat-send">
                <textarea className="text-area" autoFocus id="send-text">

                </textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
