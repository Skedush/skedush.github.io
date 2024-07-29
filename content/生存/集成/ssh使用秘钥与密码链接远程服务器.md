## 在==**服务器**==编辑ssh配置并重启ssh服务
```zsh
vim /etc/ssh/sshd_config


# 针对腾讯云ubuntu24的ssh配置，在最下面额外加入
PubkeyAcceptedKeyTypes=+ssh-rsa  # 指定 SSH 服务器接受的公钥类型
PubkeyAuthentication yes # 启用或禁用基于公钥的身份验证方式
AuthorizedKeysFile .ssh/authorized_keys # 公钥存储的文件路径
PasswordAuthentication yes # 允许ssh的密码认证登录
CASignatureAlgorithms +ssh-rsa # 指定受信任的证书授权签名算法
PermitRootLogin yes  # 允许ssh的root用户登录

# 重启ssh
sudo service ssh restart

```

## 在==**本地客户端生成**==私钥与公钥

```zsh


```