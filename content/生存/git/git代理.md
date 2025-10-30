由于obsidian中没有可以设置软件代理的地方，所以需要设置系统中git的全局代理，以下命令设置git请求github的仓库时的代理：


```
git config --global http.https://github.com.proxy socks5://127.0.0.1:7890
```
> 本地7890端口是我的clashx的代理，大家看自己的代理是什么端口自己修改
> 公司或者本地就不会走代理

## 只针对github做代理
```
git config --global http.https://github.com.proxy http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890

```

