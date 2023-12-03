- [Obsidian - Sharpen your thinking](https://obsidian.md/)
- [Welcome to Quartz 4](https://quartz.jzhao.xyz/)
- [GitHub: Let’s build from here · GitHub](https://github.com/)

1. github创建仓库
	![[Pasted image 20231203215451.png]]
	随便创建一个仓库就行
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
	- 在根目录下的.github/workflows中创建deploy.yml文件
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
1. 上传到自己的创建的仓库中。
	```
	git remote add origin https://github.com/[用户名]/[仓库名].git
	git branch -M main
	git push -u origin main
	```
5. 使用obsidian打开项目并安装同步等插件
	