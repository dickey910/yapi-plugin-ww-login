# yapi-plugin-ww-login

安装配置方式，可参考以下地址：
https://www.yuque.com/dongzhikai/el0fkf/fpr4ym

第三方插件，用于企业微信登录，在生成的配置文件中，添加如下配置即可：

```
"plugins": [
    {
        "name": "ww-login",
        "options": {
          "appid": "",
          "agentid": "",
          "secret": "",
          "redirectUri":"http://xxxx/api/plugin/wx/login"
        }
    }
  ]
```


这里面的配置项含义如下：  

- `appid` corpid
- `agentid` agentid
- `secret` 秘钥
- `redirectUri` 重定向路径
