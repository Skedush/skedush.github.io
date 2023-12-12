# yapi系统部署笔记

## YApi 简介

YApi 是去哪儿网开源的一个`高效`、`易用`、`功能强大`的 API 管理平台，它拥有接口管理，接口调试，接口测试，Mock 等等一系列特性，并且支持导入和自动同步`swagger`文档，可以直接将现有的所有项目`swagger`文档无缝迁移到 YApi 上统一管理，真的是不讲武德！

官方已经部署了一套公有服务进行演示，直接访问[GitHub - YMFE/yapi: YApi 是一个可本地部署的、打通前后端及QA的、可视化的接口管理平台](https://github.com/ymfe/yapi)即可快速体验。

## 部署

有docker部署和本地命令行部署,由于环境原因,本次使用手动编译部署.docker部署可以在自己测试服务器进行学习使用.

### 1.安装MongoDB

- 配置yum源

  ```sh
  # 1.创建yum源文件
  vim /etc/yum.repos.d/mongodb-org-4.2.repo
  
  # 2.在文件中填入以下内容,并保存
  [mongodb-org-4.2]
  name=MongoDB Repository
  baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.2/x86_64/
  gpgcheck=1
  enabled=1
  gpgkey=https://www.mongodb.org/static/pgp/server-4.2.asc
  
  # 3.退出后就可以使用yum进行安装MongoDB
  yum -y install mongodb-org
  ```

- MongoDB启动相关的基本命令

  ```sh
  systemctl start mongod.service        # 开启 MongoDB
  systemctl enable mongod               # 开机自启
  systemctl list-unit-files|grep mongod # 查看 MongoDB 是不是开机自启
  
  service mongod restart          # 重启
  service mongod stop             # 停止
  service mongod start            # 运行
  
  rpm -ql mongodb-org-server      # 查看 MongoDB 相关文件
  ```

- MongoDB配置

  ```sh
  # 修改配置文件,让mongodb可以让外部访问
  # 修改 MongoDB 配置文件
  vim /etc/mongod.conf
  
  # 找到这里，修改后 :wq
  net:
    port: 27017
    bindIp: 0.0.0.0    # 原来是 127.0.0.1，只允许本地连接，改成 0.0.0.0 允许外部连接，如果只需要本地连接就不用改
    
  #security:            # 为了安全，启用身份验证
  #  authorization: "enabled"   # disable or enabled
  
  # 保存后重启服务
  systemctl restart mongod
  ```

- 卸载MongoDB

  ```sh
  systemctl disable mongod # 停止开机自启
  service mongod stop      # 停止服务
  sudo yum erase $(rpm -qa | grep mongodb-org)   # 删除安装包
  
  sudo rm -r /var/log/mongodb     # 删除日志文件
  sudo rm -r /var/lib/mongo       # 删除数据文件
  ```

  

### 2.安装node.js环境

不建议使用过高版本的nodejs

:warning:请注意 : 使用node12版本.不要使用node10版本,也不推荐使用更高版本.

#### 下载安装包

```cpp
//下载node编译好的安装包
 wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.xz
```



#### 解压缩安装包

```css
tar xvJf node-v10.15.3-linux-x64.tar.xz 
```



#### 移动解压后文件到用户目录

```bash
mv node-v10.15.3-linux-x64 /usr/local/node-v10
```



#### 配置 `node` 软链接到 /bin 目录

```bash
ln -s /usr/local/node-v10/bin/node /bin/node
```



#### 配合`npm`软链接到 /bin 目录

```bash
ln -s /usr/local/node-v10/bin/npm /bin/npm
```



#### 安装完毕,可以使用node -v查看版本

```sh
[root@test bin]# node -v
v10.24.1
```



### 3.安装yapi

选好一个安装目录，在目录下打开终端执行命令：

```
npm install -g yapi-cli --registry https://registry.npm.taobao.org
cd /usr/local/node-v10/lib/node_modules/yapi-cli/bin
yapi-cli server
```

运行成功之后终端会提示访问地址，通过浏览器访问`http://127.0.0.1:9090`进行安装，如图：

![img](http://monkeywie.cn/2021/01/04/yapi-setup/2021-01-05-15-25-26.png)

填写好对应的配置信息，然后点击开始部署，接着等待一段时间就部署完成了，然后按ctrl+c退出。

再根据安装提示在终端中启动 yapi 服务：

```
cd <部署路径>
node vendors/server/app.js
```

启动成功后就可以访问了。