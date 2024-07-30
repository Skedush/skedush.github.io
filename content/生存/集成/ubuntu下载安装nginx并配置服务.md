
## 下载安装
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

## 访问错误

如果 Nginx 出现 "Permission denied" 错误，通常是由于权限设置问题导致的。以下是可能的原因和解决方案：

### 1. **Nginx 用户没有权限访问文件或目录**

Nginx 默认以 `www-data` 用户运行（在一些系统中可能是 `nginx`），该用户需要对配置文件中指定的目录和文件具有适当的访问权限。

#### 解决方法：
- **检查文件和目录的所有权和权限**：
  确保 Nginx 有权读取配置文件和内容文件（例如网页、静态文件等）。

  ```bash
  sudo chown -R www-data:www-data /path/to/your/web/root
  sudo chmod -R 755 /path/to/your/web/root
  ```

  其中 `/path/to/your/web/root` 是你的 Web 根目录或文件所在路径。

- **检查 Nginx 配置文件**：
  确保 Nginx 配置文件中没有指向不存在的文件或没有权限访问的路径。

```bash
	sudo nginx -t
```

  这条命令可以检查 Nginx 配置文件的语法错误，并报告问题。
### 2. **Nginx 运行用户的问题**

Nginx 可能尝试以 root 用户启动，但配置文件中设置了不同的用户。

#### 解决方法：
- **检查 Nginx 配置文件中的 `user` 指令**：

  确保 `user` 指令中指定的用户与系统中的用户匹配，并且该用户有足够的权限。
  配置文件中查看修改用户：

```nginx
user www-data; #可以改成root或者你自己使用的账户然后重启nginx
```

```bash
	sudo nginx -t
	sudo nginx -s reload
```
### 总结

请根据具体的错误日志和环境设置逐步排查问题，通常可以通过查看 `/var/log/nginx/error.log` 文件中的详细错误信息来确定问题的根本原因。