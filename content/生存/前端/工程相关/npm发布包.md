设置npm registry不能使用镜像
```
npm config set registry https://registry.npmjs.org/

或者

nrm use npm
```
登录npm账号
```
npm login
或者
yarn login
```

发布
```
npm publish

或者
yarn publish

```

注意包的名称不能重复package.json中的name不能与线上已有的包重复