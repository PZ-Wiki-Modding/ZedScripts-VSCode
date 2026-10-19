# ZedScripts-VSCode

[![License](https://img.shields.io/github/license/PZ-Wiki-Modding/ZedScripts-VSCode?label=License)](LICENSE)
![Code Size](https://img.shields.io/github/languages/code-size/PZ-Wiki-Modding/ZedScripts-VSCode?label=Code%20Size)
[![ZedScripts LSP Version](https://img.shields.io/badge/ZedScripts%20LSP-1.0.0-orange?logo=pypi)](https://pypi.org/project/ZedScripts/1.0.0/)

A Visual Studio Code extension which implements the [ZedScripts Language Server Protocol](https://github.com/PZ-Wiki-Modding/ZedScripts-LSP).

## Features and configuration

See the [ZedScripts-LSP](https://github.com/PZ-Wiki-Modding/ZedScripts-LSP) repository for detailed documentation of the LSP capabilities.

## Development
You can develop the[ZedScripts-LSP](https://github.com/PZ-Wiki-Modding/ZedScripts-LSP) project actively alongside this extension by setting up a `.venv` environment in the root of the repository, and launching "Run Extension (Python Debug)" from [launch.json](.vscode/launch.json).

To that, use the following to have an active linking to the package containing the ZedScripts-LSP source files:

```bash
uv venv .venv
source .venv/bin/activate # linux specific
uv pip install /path/to/ZedScripts-LSP[debug,debug,build,test,pygments] -e /path/to/ZedScripts-LSP
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.