import React, { Component } from 'react'

module.exports = function (options) {
  const { appid, agentid, redirectUri } = options;

  const handleLogin = () => {
    let redirectURL = `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${appid}&agentid=${agentid}&redirect_uri=${redirectUri}&state=${(new Date()).valueOf()}`
    location.href = redirectURL;
  }

  const WxComponent = () => {
    return <button onClick={handleLogin} className="btn-home btn-home-normal" >企业微信登录</button>
  }

  this.bindHook('third_login', WxComponent);
};