1. 查看远程的版本库地址
```zsh
git remote -v
```
2. 添加原项目 git 地址到本地版本库
```zsh
git remote add upstream https://github.com/WuYunlong/code.git
```

3. 检查版本库是否添加成功
```zsh
git remote -v
origin  https://github.com/YourName/code.git (fetch)
origin  https://github.com/YourName/code.git (push)
upstream        https://github.com/WuYunlong/code.git (fetch)
upstream        https://github.com/WuYunlong/code.git (push)
```
4. 原项目更新内容同步到本地
```zsh
git fetch upstream
```
5. 查看本地分支
```zsh
git branch -a 
* v4-master 
remotes/origin/HEAD -> origin/v4-master 
remotes/origin/v4-dev 
remotes/origin/v4-master 
remotes/upstream/v4-dev 
remotes/upstream/v4-master
```
6. 同步更新内容到本地对应分支
```zsh
git merge upstream/v4-master
```
7. 提交更新内容到 fork 地址
```zsh
git push
```


