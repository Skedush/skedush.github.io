### 报错信息
```zsh
Run actions/deploy-pages@v4
Fetching artifact metadata for "github-pages" in this workflow run
Found 2 artifact(s)
Error: Fetching artifact metadata failed. Is githubstatus.com reporting issues with API requests, Pages, or Actions? Please re-run the deployment at a later time.
Error: Error: Multiple artifacts named "github-pages" were unexpectedly found for this workflow run. Artifact count is 2.
```

<mark style="background: #ADCCFFA6;">不知道什么问题，也许是build与deploy时间相差太久了？这次怎么重试都没用。没改什么东西重新上传后就成功了。</mark>
