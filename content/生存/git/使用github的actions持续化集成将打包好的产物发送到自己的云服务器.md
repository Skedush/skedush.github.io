
# 在服务器上配置ssh秘钥登录
[[ssh使用秘钥与密码链接远程服务器]]

# 在项目中配置工作流（持续化集成）

1. 在项目新建.github/workflows/ci.yaml文件
2. 编写配置文件
```yaml
name: Deploy Quartz site to GitHub Pages
on:
  push:
    branches:
      - main # 当main分支有push动作时触发流程
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  build:
	# 指定了运行环境。在这个例子中，任务运行在 ubuntu-latest 虚拟机上。
    runs-on: ubuntu-latest 
    steps:
	  #使用 actions/checkout 动作从仓库中签出代码
      - uses: actions/checkout@v3 
        with:
          fetch-depth: 0 # Fetch all history for git info
	  # 使用 actions/setup-node 动作设置 Node.js 环境。
      - uses: actions/setup-node@v3 
	    # with: 块指定了 Node.js 的版本为 14。
        with:
          node-version: 18.14 
		# 运行 npm install 命令安装项目的依赖。
      - name: Install Dependencies
        run: npm install
        # 运行 npm run build 命令构建项目。
      - name: Build # 打包步骤
        run: npm run build  # 打包项目命令
        # 使用 actions/upload-pages-artifact@v2 动作设置产物。
      - name: Upload artifact 
        uses: actions/upload-pages-artifact@v2
        with:
          path: dist
        # 使用 actions/scp-action@v0.1.7 动作将产物发送到远程服务器。
      - name: copy file to server
        uses: appleboy/scp-action@v0.1.7
        with:
	      # 服务器host
          host: ${{ secrets.SERVER_HOST }} 
          # 服务器远程登录名
          username: ${{ secrets.SERVER_USERNAME }} 
          # 服务器authorized_keys文件中公钥对应的私钥
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          # 服务器远程连接端口
          port: ${{ secrets.SERVER_PORT }}
          # 需要拷贝的文件列表
          source: public/*
          # 拷贝到服务器的位置
          target: ${{ secrets.SERVER_PATH }}
          # 覆盖文件
          overwrite: true
          # remove the specified number of leading path elements.
          strip_components: 1
          
	  # 使用 actions/ssh-action 动作链接云服务器执行脚本。
      - name: executing remote ssh commands using ssh key
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SERVER_PORT }}
          # 脚本执行命令
          script: ll

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```
