
### 1. 更新系统（可以忽略）

首先，确保系统包是最新的：

```bash
sudo apt update
sudo apt upgrade
```

### 2. 安装 Nginx

安装 Nginx 的步骤如下：

```bash
sudo apt install nginx
```

### 3. 启动 Nginx

安装完成后，可以启动 Nginx 服务：

```bash
sudo systemctl start nginx
```

### 4. 配置 Nginx 启动时自动启动

确保 Nginx 在系统启动时自动启动：

```bash
sudo systemctl enable nginx
```

### 5. 验证 Nginx 安装

打开浏览器，访问 `http://localhost` 或 `http://<你的服务器IP>`，你应该看到 Nginx 默认的欢迎页面。

### 6. 配置 Nginx

Nginx 的配置文件通常位于 `/etc/nginx/nginx.conf`，而虚拟主机配置文件通常在 `/etc/nginx/sites-available/` 目录下。可以创建新的虚拟主机配置或修改现有配置。

#### 创建新的虚拟主机配置

1. 创建一个新的配置文件：

   ```bash
   sudo nano /etc/nginx/sites-available/my_site
   ```

2. 添加如下内容，配置一个基本的虚拟主机（假设你有一个静态网站）：

   ```nginx
   server {
       listen 80;
       server_name example.com;

       root /var/www/my_site;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

   - `server_name`：你的域名或服务器 IP。
   - `root`：网站文件存放的目录。

3. 创建 `my_site` 的目录，并放置你的网页文件：

   ```bash
   sudo mkdir -p /var/www/my_site
   sudo nano /var/www/my_site/index.html
   ```

4. 将配置文件链接到 `sites-enabled` 目录：

   ```bash
   sudo ln -s /etc/nginx/sites-available/my_site /etc/nginx/sites-enabled/
   ```

5. 检查 Nginx 配置是否正确：

   ```bash
   sudo nginx -t
   ```

6. 重新加载 Nginx 使配置生效：

   ```bash
   sudo systemctl reload nginx
   ```

### 7. 防火墙设置（如果有）

如果你启用了防火墙，确保允许 HTTP 和 HTTPS 流量：

```bash
sudo ufw allow 'Nginx Full'
```

### 8. 使用 SSL/TLS（可选）

为了增强安全性，你可能需要配置 HTTPS。可以使用 Let's Encrypt 提供免费的 SSL 证书。首先安装 Certbot：

```bash
sudo apt install certbot python3-certbot-nginx
```

然后使用 Certbot 自动配置 Nginx：

```bash
sudo certbot --nginx
```

按照提示完成证书的生成和安装。Certbot 会自动更新你的 Nginx 配置，以便启用 HTTPS。

### 9. 维护和日志

- **查看 Nginx 状态：**

  ```bash
  sudo systemctl status nginx
  ```

- **查看日志文件：**

  - 访问日志：`/var/log/nginx/access.log`
  - 错误日志：`/var/log/nginx/error.log`

通过上述步骤，你可以在 Ubuntu 上成功安装和配置 Nginx，并根据需要进行基本的虚拟主机配置。