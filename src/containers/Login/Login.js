import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import Dropzone from 'react-dropzone';
import * as authActions from 'redux/modules/auth';

@connect(
  state => ({user: state.auth.user}),
  {...authActions})
export default class Login extends Component {
  static propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    register: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      files: [],
      base: ''
    };
  }

  onDrop = (files) => {
    this.setState({files});
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = this.completeBase64;
  };

  upLoad = () => {
    this.refs.dropZone.open();
  };

  completeBase64 = (event) => {
    this.setState({base: event.target.result});
  };

  showBack = () => {
    const againEle = this.refs['pass-again'];
    const goEle = this.refs['chat-submit'];
    const registerEle = this.refs['chat-register'];
    const contentEle = this.refs['name-write'];
    const backEle = this.refs['go-back'];
    const {base} = this.state;

    if ($(againEle).css('display') === 'none') {
      $(againEle).slideDown(300);
      $(goEle).animate({width: 0, opacity: 0}, 300);
      $(registerEle).animate({width: '60%'}, 300);
      $(contentEle).animate({height: 310});
      $(backEle).show();
    } else if ($(againEle).css('display') === 'block') {
      const name = this.refs['chat-name'].value;
      const password = this.refs['chat-password'].value;
      const passwordAgain = this.refs['chat-again'].value;
      if ((password !== passwordAgain) || password === '') {
        alert('密码不一致或不能为空');
      } else if (!base) {
        alert('请上传头像');
      } else {
        this.props.register({name, password, file: base}, () => {
        });
      }
    }
  };

  goBack = () => {
    const goEle = this.refs['chat-submit'];
    const registerEle = this.refs['chat-register'];
    const contentEle = this.refs['name-write'];
    const againEle = this.refs['pass-again'];
    const backEle = this.refs['go-back'];
    $(againEle).slideUp(300);
    $(backEle).hide();
    $(goEle).animate({width: '60%', opacity: 0.8}, 300);
    $(registerEle).animate({width: 40}, 300);
    $(contentEle).animate({height: 280});
  };

  goLogin = () => {
    const name = this.refs['chat-name'].value;
    const password = this.refs['chat-password'].value;
    this.props.login({name, password}, () => {
    });
  };

  render() {
    const {files} = this.state;
    const preview = files.length > 0 ? files[files.length - 1].preview : '';
    return (
      <div ref="name-write" className="chat-login">
        <Helmet title="Login"/>
        <div className="chat-l-head">
          欢迎登录聊天系统
        </div>
        <div className="chat-l-upload">
          {preview && <img src={preview}/>}
          <div style={{display: 'none'}}>
            <Dropzone ref="dropZone" onDrop={this.onDrop}/>
          </div>
          <span onClick={this.upLoad}>{preview ? '' : '点击上传'}</span>
        </div>
        <input className="upload" ref="upload" type="file"/>
        <div className="chat-l-name">
          <input placeholder="昵称" type="text" ref="chat-name"/>
        </div>
        <div className="chat-l-name">
          <input placeholder="密码" ref="chat-password" type="password"/>
        </div>
        <div className="chat-l-name pass-again" ref="pass-again">
          <input placeholder="确认密码" ref="chat-again" type="password"/>
        </div>
        <div className="chat-l-name">
          <button onClick={this.goBack} className="go-back" ref="go-back">{'<'}</button>
          <button onClick={this.goLogin} className="chat-go" ref="chat-submit">GO</button>
          <button onClick={this.showBack} ref="chat-register" className="chat-register">注册</button>
        </div>
      </div>
    );
  }
}
