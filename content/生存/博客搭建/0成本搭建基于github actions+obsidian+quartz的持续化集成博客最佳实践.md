- [Obsidian - Sharpen your thinking](https://obsidian.md/)
- [Welcome to Quartz 4](https://quartz.jzhao.xyz/)
- [GitHub: Let’s build from here · GitHub](https://github.com/)

1. github创建仓库
	![[Pasted image 20231203215451.png]]
	随便创建一个仓库就行
	
	- 接着修改仓库的配置。
	![[Pasted image 20231203221337.png]]
	![[Pasted image 20231203221447.png]]
	
2. 拉取quartz代码
	```bash
	git clone https://github.com/jackyzha0/quartz.git
	cd quartz
	npm i
	```
3. 安装依赖&运行项目。
	- 需要node 18以上版本
	```bash
	npx quartz create
	```
	![[Pasted image 20231203220506.png]]
	![[Pasted image 20231203220550.png]]
4. 编写git actions持续化集成的workflow文件。
	- 在根目录下的.github/workflows中创建[deploy.yml](https://raw.githubusercontent.com/Skedush/skedush.github.io/main/.github/workflows/deploy.yml)文件，内容如下：
	```yaml
	name: Deploy Quartz site to GitHub Pages
	
	on:
	  push:
	    branches:
	      - main
	
	permissions:
	  contents: read
	  pages: write
	  id-token: write
	
	concurrency:
	  group: "pages"
	  cancel-in-progress: false
	
	jobs:
	  build:
	    runs-on: ubuntu-22.04
	    steps:
	      - uses: actions/checkout@v3
	        with:
	          fetch-depth: 0 # Fetch all history for git info
	      - uses: actions/setup-node@v3
	        with:
	          node-version: 18.14
	      - name: Install Dependencies
	        run: npm ci
	      - name: Build Quartz
	        run: npx quartz build
	      - name: Upload artifact
	        uses: actions/upload-pages-artifact@v2
	        with:
	          path: public
	
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
5. 上传到自己的创建的仓库中。
	```
	git remote add origin https://github.com/[用户名]/[仓库名].git
	git branch -M main
	git push -u origin main
	```
	成功后再github的项目中的ancions里面应该就能看到
	![[Pasted image 20231203222304.png]]
	集成完成后打开https://skedush.github.io/\[仓库名\]就能看到自己部署的博客啦！
	
	
6. 使用obsidian打开项目并安装同步等插件
	1. 选择本地仓库文件夹打开
		![[Pasted image 20231203223011.png]]
	2. 安装git插件工具
		![[Pasted image 20231203223232.png]]
		![[Pasted image 20231203223308.png]]
		![[Pasted image 20231203223330.png]]
		![[Pasted image 20231203223344.png]]
		![[Pasted image 20231203223409.png]]
		![[Pasted image 20231203223421.png]]
		
	3. 配置插件
		修改文件后无操作5分钟会自动上传到github
		![[Pasted image 20231203223534.png]]
		配置github账号使用的的用户名与邮箱
		![[Pasted image 20231203223723.png]]
		配置git插件的快捷键
		![[Pasted image 20231203223924.png]]
		![[Pasted image 20231203224014.png]]
		现在可以根据快捷键手动上传了。
		> 不同的电脑环境可能需要配置git账号的用户名密码。或者使用token的形式都行。这些自己去找资料了，是git相关的知识了。
		
	
	

