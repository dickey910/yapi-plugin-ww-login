const controller = require('./controller.js');

module.exports = function (options) {
  this.bindHook('third_login', async (ctx) => {
    let { email, username } = ctx.request.query;
    return {
      email,
      username
    }
  });

  // 登录接口
  this.bindHook('add_router', function (addRouter) {
    addRouter({
      controller: controller,
      action: 'loginWw',
      path: 'wx/login',
      method: 'get'
    });

  })
}