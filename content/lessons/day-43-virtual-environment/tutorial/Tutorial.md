# Virtual Environments in python
A virtual environment is an isolated workspace for a Python project. Every project you build will need its own set of third-party packages (flask, requests, numpy and so on), and different projects often need different versions of the same package. If you install everything into one place, those versions start clashing with each other. A virtual environment solves this by giving each project its own folder with its own copy of the Python interpreter and its own installed packages.

Think of it like this: your computer is the house, and every project gets its own locked room. Installing a package inside one room does not affect any other room.

# Creating a virtual environment
Python ships with the built-in `venv` module, so you do not need to install anything extra. Open a terminal inside your project folder and run:

```bash
python -m venv myenv
```

Here `myenv` is the name of the environment folder — you can name it anything (`env` and `.venv` are also common). This command creates a folder that contains a copy of the Python interpreter, the standard library links, and its own `pip`.

# Activating the environment
Creating the environment is not enough — you have to step inside it. The command depends on your operating system:

On **Windows** (Command Prompt or PowerShell):

```bash
myenv\Scripts\activate
```

On **macOS / Linux**:

```bash
source myenv/bin/activate
```

When the environment is active you will see its name in front of your terminal prompt, something like `(myenv) C:\Users\Harry\project>`. From now on, every `python` and `pip` command runs inside this environment.

To leave the environment, simply run:

```bash
deactivate
```

# Installing packages inside the environment
With the environment activated, install packages exactly like you always have — but now they land inside `myenv` instead of your global Python installation:

```bash
pip install flask
pip list
```

`pip list` shows only the packages that belong to this environment. This is the whole point: project A can have flask 2.0 while project B has flask 3.1, on the same machine, without a single conflict.

# requirements.txt
Real projects are shared with teammates and deployed to servers, and those machines need the exact same packages and versions. The standard way to record them is a `requirements.txt` file:

```bash
pip freeze > requirements.txt
```

This writes every installed package with its version into the file. On any other machine, after activating an environment, one command rebuilds the same setup:

```bash
pip install -r requirements.txt
```

# A few ground rules
- Never commit the environment folder to git. It is bulky and machine-specific — only `requirements.txt` should be shared. Add the folder name to your `.gitignore`.
- You can delete an environment whenever you want by deleting its folder; nothing outside that folder is touched.
- The environment folder is not portable between machines — that is what `requirements.txt` is for.

Virtual environments are one of those habits that separate careful developers from frustrated ones. From your very next project onward, make creating and activating a `venv` the first thing you do after making the project folder.
## [Next Lesson>>](https://replit.com/@codewithharry/44-Day44-How-import-works)
