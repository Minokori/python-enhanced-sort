# Python Enhanced Sort

make your python codes more elegant ~~(maybe)~~ 

## Features

This extension will be involved when you save your source code files manually (*e.g.*, press <kbd>Ctrl</kbd> + <kbd>S</kbd> on Windows or <kbd>Command</kbd> + <kbd>S</kbd> on Mac). It will sort your methods, properties and dunder methods in your Class.

> **NOTE**: Cause it's still a extension in development ~~maybe~~, it may have ~~lots of~~ bugs. please use it with an peaceful state mind and in `insert` mode in settings.

### Demo

we have an demo.py like this:

```python
"""demo for Python Enhanced Sort"""
import logging
from typing import TYPE_CHECKING

from numpy import ndarray


logging.basicConfig("./log.log")


class A(object):
    """A

    Args:
        object : _description_
    """
    if TYPE_CHECKING:
        def __call__(self, para1: int) -> int:
            """call 1"""
            pass

        def __call__(self, para1: int, para2: int) -> int:
            """call 2"""
            pass

    def to_json() -> str:
        pass

    def as_ndarray() -> ndarray:
        pass

    def method_1() -> None:
        pass

    def _init() -> None:
        pass

    def init(self, para1: int,) -> None:
        pass

    @property
    def name(self) -> str:
        pass

    def __init__(self):
        pass
```

Obviously, it works but makes us confused. It even put the `__init__` method at last.

It's always ok for you to sort your class manually. But as your codes grows long, and classes becomes complex, it's been expected to sort it **automatically**. Let this extension do it for you. Just save it manually, your source code will be analyzed, and be replaced like this:

```python
#"""demo for Python Enhanced Sort"""
#import logging
#from typing import TYPE_CHECKING

#from numpy import ndarray
...
#    def __init__(self):
#        pass
"""demo for Python Enhanced Sort"""
import logging
from typing import TYPE_CHECKING

from numpy import ndarray


logging.basicConfig("./log.log")


class A(object):
    """A

    Args:
        object : _description_
    """
    if TYPE_CHECKING:
        def __call__(self, para1: int) -> int:
            """call 1"""
            pass

        def __call__(self, para1: int, para2: int) -> int:
            """call 2"""
            pass

    def __init__(self):
        pass

    @property
    def name(self) -> str:
        pass

    def init(self, para1: int,) -> None:
        pass

    def to_json() -> str:
        pass

    def as_ndarray() -> ndarray:
        pass

    def method_1() -> None:
        pass

    def _init() -> None:
        pass
```

### More

these features can be edit in your `setting.json` of vscode.

+   you can tell extension that you want to ignore some files like `__init__.py` or `main.py`. In fact, these two files are ignored by default. In time, we will ignored files commented `# isort: skip_file` at beginning. It's OK to create our own ignore commands, but nobody wants to add too much comment commands, so we borrow from [isort](https://marketplace.visualstudio.com/items?itemName=ms-python.isort) .
+   you may want to specify your method sorting order. For example, when you create a custom data structure. You may have many methods to convert it to other structures like `numpy.Ndarray`, `torch.Tensor`, `dict` or json strings. these methods are signed like `to_ndarray()`, `to_tensor()`, `to_dict()` and `to_json()`. By adding keyword `"to"` into `weights` configuration, you can make them at top when sortting your class.

## Requirements

there is no requirements needed by this extension. But we recommend you to install `isort`, `autopep8` and `pylance` to make your codes clearly.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `PythonEnhancedSort.Mode`: edit mode. we recommend to use `insert` mode, making you have a chance to check how extension works. 
* `ignoreFiles`: file names to ignore sorting.
* `Weights`: your customed sorting order.

## Known Issues

>   **⚠️NOTE⚠️**: Cause it's still a extension in development ~~maybe~~, it may have ~~lots of~~ bugs. Please use it with an peaceful state mind and in `insert` mode in settings.

## Release Notes

### 0.0.1

♿*After three years of self-taught Python and Csharp, I finally wrote the first open source program in Typescript*♿

---

