```
sudo vim /etc/ssh/sshd_config

# Port 9022 //修改ssh端口
# PermitRootLogin yes // 允许root登录


sudo systemctl restart ssh //重启ssh
```