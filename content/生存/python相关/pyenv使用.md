## 安装
```zsh
brew install pyenv
pyenv -v
```
## bash_profile环境

```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >>~/.bash_profile

echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >>~/.bash_profile

echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n eval "$(pyenv init -)"\nfi'>>~/.bash_profile
```
## zsh环境运行以下环境变量
```zsh
echo 'export PYENV_ROOT="$HOME/.pyenv"' >>~/.zshrc

echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >>~/.zshrc

echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n eval "$(pyenv init -)"\nfi'>>~/.zshrc
```

## 生效环境变量
```zsh
source  ~/.zshrc
```

## 使用
```zsh
pyenv versions
pyenv install --list
pyenv install 3.7.3
pyenv global 3.7.3 # 全局切换

python -V # 验证一下是否切换成功
pyenv local 3.7.3 # 当前目录及其目录切换
python -V # 验证一下是否切换成功

pyenv shell <version> # 当前shell切换版本
```

> 有时设置了pyenv local版本后，再设置global会发现没有生效，可以尝试：
```zsh
pyenv local --unset
```

```
pyevn global system



pyenv uninstall 3.7.3
```