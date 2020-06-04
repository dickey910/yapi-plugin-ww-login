const yapi = require('yapi.js');
const baseController = require('controllers/base.js');
const axios = require('axios');
const fs = require('fs');
const qs = require('qs');
const path = require('path');

const tokenJsonPath = path.resolve(__dirname, './access_token.json')
const tokenJson = require(tokenJsonPath);

let access_token = "";
let secret = "";
let code = "";
let state = "";
let appid = "";

class interfaceWxController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.$auth = true
  }

  /**
 * 企业微信登录
 * @interface /wx/login
 * @method Get
 * @param {String} code
 * @param {String} state
 * @param {String} appid
 * @returns {Object}
 * @example ./api/wx/login.json
 */
  async loginWw(ctx) {
    let data = null;
    const query = ctx.request.query || ctx.request.body;

    [code, state, appid] = [query.code, query.state, query.appid]
    secret = yapi.WEBCONFIG.plugins.filter(({ name }) => name === "ww-login")[0].options.secret;
    if (!code) {
      return (ctx.body = yapi.commons.resReturn(null, 400, 'code不能为空'));
    }
    if (!appid) {
      return (ctx.body = yapi.commons.resReturn(null, 400, 'appid不能为空'));
    }
    if ((new Date()).valueOf() - parseInt(state) > 600000) {
      return (ctx.body = yapi.commons.resReturn(null, 401, 'state已过期'));
    }
    try {
      // 获取access_token
      data = await this.getWxToken({ corpid: appid, corpsecret: secret })
      if (data.errcode !== 0) return (ctx.body = yapi.commons.resReturn(null, 400, data.errmsg));
      access_token = data.access_token;

      //获取UserId
      data = await this.invokApi(this.fetchGetUserId, { access_token, code }, ctx)
      const userid = data.UserId;

      // 获取用户信息
      data = await this.invokApi(this.fetchGetUserInfo, { access_token, userid }, ctx)
      const email = data.email;

      // 第三方登录逻辑
      ctx.redirect('/api/user/login_by_token?' + qs.stringify({ email, username: userid }));
      return (ctx.body = yapi.commons.resReturn('ok'));
    }
    catch (err) {
      return (ctx.body = yapi.commons.resReturn(null, 400, err.message))
    }
  }

  // 获取Token
  async getWxToken({ corpid, corpsecret, force = false }) {
    var currentTime = new Date().getTime();
    const { access_token, expires_time } = tokenJson;

    try {
      // 缓存失效，重新获取
      if (access_token === "" || expires_time < currentTime || force) {
        const result = await this.fetchGetWxToken({ corpid, corpsecret })
        if (result.data.errcode === 0) {
          tokenJson.access_token = result.data.access_token;
          tokenJson.expires_time = new Date().getTime() + (parseInt(result.data.expires_in) - 200) * 1000;
          fs.writeFile(tokenJsonPath, JSON.stringify(tokenJson), (err) => {
            console.log(err)
          });
        }
        return result.data;
      } else {
        return { errcode: 0, access_token };
      }
    } catch (error) {
      return { errcode: 400, errmsg: error.message }
    }
  }

  // 接口调用
  async invokApi(fun, params, ctx) {
    const result = await fun(params)
    const data = result.data;
    if (data.errcode !== 0) {
      // token失效时，重新获取
      if (data.errmsg.indexOf("access_token") != -1) {
        let tokenData = await this.getWxToken({ corpid: appid, corpsecret: secret, force: true })
        access_token = tokenData.access_token
        return this.invokApi(fun, params, ctx);
      } else {
        return (ctx.body = yapi.commons.resReturn(null, 400, data.errmsg));
      }
    }
    return data;
  }

  fetchGetWxToken({ corpid, corpsecret }) {
    const url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
    return axios.get(url, {
      params: {
        corpid, corpsecret
      }
    });
  }

  fetchGetUserId({ access_token, code }) {
    const url = 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo';
    return axios.get(url, {
      params: {
        access_token, code
      }
    });
  }

  fetchGetUserInfo({ access_token, userid }) {
    const url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get';
    return axios.get(url, {
      params: {
        access_token, userid
      }
    });
  }

}
module.exports = interfaceWxController;
