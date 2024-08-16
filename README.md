# CodeCopyToolbar

[![Version](https://img.shields.io/visual-studio-marketplace/v/Aiomorphic.codecopytoolbar)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Aiomorphic.codecopytoolbar)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Aiomorphic.codecopytoolbar)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar)

<img src="resources/vs-code-extension-marketplace-cover-image.png" width="538" height="307" alt="CodeCopyToolbar Cover Image">

**CodeCopyToolbar** is a Visual Studio Code extension designed to enhance your productivity by providing a customizable toolbar with advanced copy features. With this extension, you can easily copy file paths, content, and project structures directly from the editor.

## Features

- **Customizable Toolbar:** Configure buttons on the toolbar to fit your workflow.
- **Copy File Path and Content:** Quickly copy the file path and content of the current file.
- **Copy Folder Content:** Copy the content of an entire folder, including nested files, while respecting `.gitignore` rules.
- **Copy Project Structure and Docs:** Generate and copy a structural overview of your project, including documentation, while filtering out files and folders ignored by `.gitignore`.

### Toolbar screenshot

![Image](resources/copytoolbar-toolbar.png)

### Files explorer context menu

![Image](resources/copytoolbar-context-menu.png)


## Use cases

1. **Copy File Path and Content**

For any active file opened in VS Code, you can use the `Copy File Path and Content` command (`copyCurrentFilePathAndContent`) from the toolbar or command palette. This command copies the content of the **selected file**.

This feature is especially useful when you need to provide context about a specific file in your project to a language model (LLM).

[Example of Copy File Path and Content](examples/single_file_copy.md)

2. **Copy Folder Content**

When navigating in the Files Explorer, you can select any file within a folder and use the `Copy Folder Content` command (`copyCurrentFolderPathAndContent`) from the toolbar or command palette. This command copies the content of **all code files in the selected folder and its subfolders**.

This feature is particularly useful when you want to provide context about a specific module of your project to a language model (LLM) without including the entire project codebase.

[Example of Copy Folder Content](examples/folder_copy.md)

3. **Copy Project Structure and Docs**

When you use the `Copy Project Structure and Docs` command (`copyProjectStructureAST`), the extension analyzes the Python project using Abstract Syntax Tree (AST) to generate a concise overview of the project's structure. Additionally, it copies the contents of all `.md` files, such as README and other documentation files.

This feature is especially useful when you need to provide a detailed project context to a language model (LLM).

[Example of Copy Project Structure and Docs](examples/project_structure.md)

## Install via the Marketplace

1. Open Visual Studio Code.
2. Go to the Extensions view (`Ctrl+Shift+X`).
3. Search for "CodeCopyToolbar".
4. Click **Install**.
5. Alternatively, you can install it directly via the following link: [CodeCopyToolbar on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar).

### Install Manually from Source

1. Clone the repository:

```bash
git clone https://github.com/aiomorphic/vscode-copytoolbar.git
cd vscode-copytoolbar
```

2. Install the necessary dependencies:

```bash
npm install
```

3. Package the extension:

```bash
npx vsce package
```

4. Install the extension in Visual Studio Code:

- Open the Extensions view (Ctrl+Shift+X).
- Click on the three dots (...) in the top-right corner and select Install from VSIX....
- Browse to the .vsix file generated in the previous step and install it.

## Usage

After installation, you'll see a new toolbar in the editor title area with the default buttons:

1. **Copy File Path and Content**
2. **Copy Folder Content**
3. **Copy Project Structure and Docs**

Click on any button to execute the corresponding action.

### Available Commands

You can access these commands through the command palette (`Ctrl+Shift+P`) or by using the associated toolbar buttons:

- **Copy File Path and Content**: Copies the file path and content of the current file.  
    Command: `extension.copyFilePathAndContent`
    
- **Copy Folder Content**: Copies the content of the folder containing the current file.  
    Command: `extension.copyCurrentFolderPathAndContent`
    
- **Copy Project Structure and Docs**: Analyzes the project's structure and documentation and copies it.  
    Command: `extension.copyProjectStructureAST`
    

### Keybindings

The following keybindings are available by default:

- `Ctrl+Alt+C`: **Copy Current File Path and Content**
- `Ctrl+Alt+F`: **Copy Current Folder Path and Content**
- `Ctrl+Alt+S`: **Copy Project Structure and Docs**

### Context Menu Integration

The extension integrates into the context menu in both the editor and the file explorer:

- **Editor Title Context Menu**: You can access the copy commands from the navigation group.
- **File Explorer Context Menu**: The "Copy File Path and Content" command is available when right-clicking on files.

## Configuration

You can customize the toolbar buttons by modifying the `CodeCopyToolbar.buttonConfig` setting in your `settings.json` file:

```json
"CodeCopyToolbar.buttonConfig": [
    {
        "name": "Copy File Path and Content",
        "icon": "copy",
        "command_vscode": "extension.copyCurrentFilePathAndContent"
    },
    {
        "name": "Copy Folder Content",
        "icon": "file-code",
        "command_vscode": "extension.copyCurrentFolderPathAndContent"
    },
    {
        "name": "Copy Project Structure",
        "icon": "code",
        "command_vscode": "extension.copyProjectStructureAST"
    }
]
```