本教程将引导您完成安装和使用 Python 包。

它将向您展示如何安装和使用必要的工具，并就最佳做法做出强烈推荐。请记住， Python 用于许多不同的目的。准确地说，您希望如何管理依赖项可能会根据 您如何决定发布软件而发生变化。这里提供的指导最直接适用于网络服务 （包括 Web 应用程序）的开发和部署，但也非常适合管理任意项目的开发和测试环境。

> 本指南是针对 Python 3 编写。但如果您由于某种原因仍然使用 Python 2.7， 这些指引应该能够正常工作。

### 确保您已经有了 Python 和 pip


在您进一步之前，请确保您有 Python，并且可从您的命令行中获得。 您可以通过简单地运行以下命令来检查：

```zsh
$ python --version
```

您应该得到像 `3.6.2` 之类的一些输出。

另外，您需要确保 [pip](https://pypi.org/project/pip/) 是可用的。您可以通过运行以下命令来检查：

```zsh
$ pip --version
```

如果您使用 [python.org](https://python.org/) 或 [Homebrew](https://brew.sh/) 的安装程序来安装 Python，您应该已经有 pip 了。 如果您使用的是Linux，并使用操作系统的包管理器进行安装，则可能需要单独 [安装 pip](https://pip.pypa.io/en/stable/installing/)。


### 安装 Pipenv

[Pipenv](https://pipenv.kennethreitz.org/) 是 Python 项目的依赖管理器。如果您熟悉 Node.js 的 [npm](https://www.npmjs.com/) 或 Ruby 的 [bundler](http://bundler.io/)，那么它们在思路上与这些工具类似。尽管 [pip](https://pypi.org/project/pip/) 可以安装 Python 包， 但仍推荐使用 Pipenv，因为它是一种更高级的工具，可简化依赖关系管理的常见使用情况。

使用 `pip` 来安装 Pipenv：
```zsh
$ pip install --user pipenv

```

> 这进行了 [用户安装](https://pip.pypa.io/en/stable/user_guide/#user-installs)，以防止破坏任何系统范围的包。如果安装后, shell 中没有 `pipenv`，则需要将 [用户基础目录](https://docs.python.org/3/library/site.html#site.USER_BASE) 的 二进制文件目录添加到 `PATH` 中。

在 Linux 和 macOS 上，您可以通过运行 `python -m site --user-base` 找到 用户基础目录，然后把 `bin` 加到目录末尾。比如，上述命令典型地会打印出 `~/.local` （ `~` 会扩展为您的家目录的绝对路径），然后将 `~/.local/bin` 添加到 `PATH` 中。您可以通过 [修改 ~/.profile](https://stackoverflow.com/a/14638025) 永久地设置 `PATH`。
```zsh
export PATH=~/.local/bin:$PATH
source ~/.bashrc  # 如果你使用的是bash shell
source ~/.zshrc   # 如果你使用的是zsh shell

```

在 Windows 上，您通过运行 `py -m site --user-site` 找到用户基础目录，然后 将 `site-packages` 替换为 `Scripts`。比如，上述命令可能返回为 `C:\Users\Username\AppData\Roaming\Python36\site-packages`，然后您需要在 `PATH` 中包含 `C:\Users\Username\AppData\Roaming\Python36\Scripts`。 您可以在 [控制面板](https://msdn.microsoft.com/en-us/library/windows/desktop/bb776899(v=vs.85).aspx) 中永久设置用户的 `PATH`。您可能需要登出 `PATH` 更改才能生效。

### 为您的项目安装包

Pipenv 管理每个项目的依赖关系。要安装软件包时，请更改到您的项目目录并运行：
```zsh
$ cd project_folder
$ pipenv install requests
```

Pipenv 将在您的项目目录中安装超赞的 [Requests](http://docs.python-requests.org/en/master/) 库并为您创建一个 [Pipfile](https://github.com/pypa/pipfile)。 `Pipfile` 用于跟踪您的项目中需要重新安装的依赖，例如在与他人共享项目时。 您应该得到类似的输出（尽管显示的确切路径会有所不同）：
```zsh
Using default python from /Users/<yourusername>/.pyenv/versions/3.9.16/bin/python3.9 (3.9.16) to create virtualenv...
⠼ Creating virtual environment...created virtual environment CPython3.9.16.final.0-64 in 312ms
  creator CPython3Posix(dest=/Users/<yourusername>/.local/share/virtualenvs/<project_folder>-dBgTcs2D, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, setuptools=bundle, wheel=bundle, via=copy, app_data_dir=/Users/<yourusername>/Library/Application Support/virtualenv)
    added seed packages: pip==24.1, setuptools==70.1.0, wheel==0.43.0
  activators BashActivator,CShellActivator,FishActivator,NushellActivator,PowerShellActivator,PythonActivator

✔ Successfully created virtual environment!
Virtualenv location: /Users/<yourusername>/.local/share/virtualenvs/<project_folder>-dBgTcs2D
Creating a Pipfile for this project...
Installing requests...
Resolving requests...
Added requests to Pipfile's [packages] ...
✔ Installation Succeeded
Pipfile.lock not found, creating...
Locking [packages] dependencies...
Building requirements...
Resolving dependencies...
✔ Success!
Locking [dev-packages] dependencies...
Updated Pipfile.lock (b8c2e1580c53e383cfe4254c1f16560b855d984fde8b2beb3bf6ee8fc2fe5a22)!
To activate this project's virtualenv, run pipenv shell.
Alternatively, run a command inside the virtualenv with pipenv run.
Installing dependencies from Pipfile.lock (fe5a22)...
```

### 使用安装好的包
现在安装了 Requests，您可以创建一个简单的 `main.py` 文件来使用它：
```python 
import requests

response = requests.get('https://httpbin.org/ip')

print('Your IP is {0}'.format(response.json()['origin']))
```

然后您就可以使用 `pipenv run` 运行这段脚本：
```zsh
$ pipenv run python main.py
```

您应该获取到类似的输出：
```zsh
Your IP is 8.8.8.8
```

## 激活虚拟环境

激活进入该环境后默认python执行的命令都是用虚拟环境中的包环境进行执行

```zsh
pipenv shell
```


## 退出虚拟环境

```zsh
exit
```
退出后若是想要用虚拟环境的包环境执行命令需要加`pipenv run`


使用 `$ pipenv run` 可确保您的安装包可用于您的脚本。我们还可以生成一个新的 shell， 确保所有命令都可以使用 `$ pipenv shell` 访问已安装的包。

## 导出requirements.txt
## 
```zsh
pipenv requirements > requirements.txt
```

