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

以我本机macOs系统为例

```zsh
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 会在/Users/username/.ssh目录下生成私钥与公钥，默认文件名为id_rsa
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/xuli/.ssh/id_rsa):[输入生成秘钥的文件名，默认为id_rsa]
Enter passphrase (empty for no passphrase):
Enter same passphrase again:

#查看文件
/Users/username/.ssh$ ls 
id_rsa          id_rsa.pub

# 复制id_rsa.pub的内容到服务器的 /root/.ssh/authorized_keys中
cat ~/.ssh/id_rsa.pub | ssh username@remote_host 'cat >> ~/.ssh/authorized_keys'
# 或者
ssh username@remote_host
echo "your-public-key-content" >> ~/.ssh/authorized_keys


```

## 确保 ==**服务器的**==~/.ssh 目录及其内容的权限正确。通常 ~/.ssh 目录的权限为 700，authorized_keys 文件的权限为 600。

```zsh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

现在就可以用私钥远程连接服务器了
```zsh
ssh -i /path/to/private_key username@remote_host

```

如果你的私钥文件是 ~/.ssh/id_rsa，你可以直接使用：
```zsh
ssh username@remote_host
```


如果你的私钥文件路径是 ~/.ssh/my_custom_key，你可以使用：
```zsh
ssh -i ~/.ssh/my_custom_key username@remote_host
```

## 额外配置

如果你不想每次都指定私钥文件，可以通过 `~/.ssh/config` 文件来配置 SSH 客户端：

1. 编辑或创建 `~/.ssh/config` 文件：
    ```sh
    nano ~/.ssh/config
    ```

2. 添加以下配置：
    ```sh
    Host myserver
        HostName 192.168.1.100
        User user
        IdentityFile ~/.ssh/my_custom_key
    ```

3. 保存并关闭文件。现在你可以使用以下命令连接到远程服务器：
    ```sh
    ssh myserver
    ```

通过上述步骤，你可以使用本地的私钥文件连接到远程服务器。