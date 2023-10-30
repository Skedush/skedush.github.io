1. 查看远程的版本库地址
```zsh
 git remote -v                                                            
origin  https://github.com/YourName/code.git (fetch)
origin  https://github.com/YourName/code.git (push)
```
2. 添加原项目 git 地址到本地版本库
```zsh
git remote add upstream https://github.com/Skedush/code.git
```

3. 检查版本库是否添加成功
```zsh
git remote -v
origin  https://github.com/YourName/code.git (fetch)
origin  https://github.com/YourName/code.git (push)
upstream        https://github.com/Skedush/code.git (fetch)
upstream        https://github.com/Skedush/code.git (push)
```
4. 原项目更新内容同步到本地
```zsh
git fetch upstream
remote: Enumerating objects: 28, done.
remote: Counting objects: 100% (28/28), done.
remote: Compressing objects: 100% (27/27), done.
remote: Total 28 (delta 2), reused 0 (delta 0), pack-reused 0
Unpacking objects: 100% (28/28), 291.00 KiB | 4.55 MiB/s, done.
From https://github.com/Skedush/code.git
 * [new branch]      main       -> upstream/main
```
5. 查看本地分支
```zsh
git branch -a 
* feature-20231018-v1.0.0
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/feature-20231018-v1.0.0
  remotes/origin/main
  remotes/upstream/main
```
6. 同步更新内容到本地对应分支
```zsh
git merge upstream/main
```
7. 提交更新内容到 fork 地址
```zsh
git push
```


