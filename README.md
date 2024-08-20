# FastPaste toolbar

[![Version](https://img.shields.io/visual-studio-marketplace/v/Aiomorphic.codecopytoolbar)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Aiomorphic.codecopytoolbar)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Aiomorphic.codecopytoolbar)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.codecopytoolbar)

<img src="resources/fastpaste-cover-image.png" width="538" height="307" alt="FastPaste Cover Image">

**FastPaste** is a lightning-fast Visual Studio Code extension tailored for developers who frequently interact with AI models like ChatGPT or Claude. With a fully customizable toolbar, **FastPaste** empowers you to swiftly copy file paths, content, and entire project structures, making it the perfect tool for seamless AI-driven coding.

## Features

- **Instant Copy Commands**:
    - **File Path & Content**: Copy the file path and content of the active file with a single click, perfect for pasting directly into ChatGPT or Claude.
    - **Folder Content**: Quickly copy all code files within a folder, while respecting `.gitignore` rules, to provide comprehensive context to AI models.
    - **Project Structure & Docs**: Generate a clear overview of your project's structure using AST analysis and copy all relevant documentation files to streamline your interactions with AI models.
- **Customizable Toolbar**: Customize your toolbar to align with your workflow, giving you one-click access to essential copy commands.
- **Remote Explorer Compatibility**: Fully compatible with SSH-connected remote environments, making it effortless to copy and paste code, even when working on remote servers or virtual machines.

## Why Choose FastPaste?

If you frequently engage with AI tools like ChatGPT or Claude, **FastPaste** is the ultimate solution to accelerate your workflow. Whether you're debugging code, seeking AI assistance, or sharing project details, **FastPaste** ensures you can copy and paste your content faster than ever before.

## Use Cases

- **Rapid File Sharing**: Share file paths and content with AI models in seconds, making debugging and AI-driven coding sessions more efficient.
- **Effortless Module Context**: Copy entire module contents to provide AI models with the necessary context without sharing the entire codebase.
- **Streamlined Project Overview**: Quickly generate and copy project structures and documentation for enhanced AI interaction and project presentation.

### Toolbar screenshot

![Image](resources/fastpaste-toolbar.png)

### Files explorer context menu

![Image](resources/fastpaste-context-menu.png)


## Installation

### Install via the Marketplace

1. Open Visual Studio Code.
2. Go to the Extensions view (`Ctrl+Shift+X`).
3. Search for "FastPaste".
4. Click **Install**.
5. Alternatively, you can install it directly via the following link: [FastPaste on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.fastpaste).

### Install Manually from Source

1. Clone the repository:

```bash
git clone https://github.com/aiomorphic/vscode-fastpaste.git
cd vscode-fastpaste
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
    Command: `Copy File Path and Content`
    
- **Copy Folder Content**: Copies the content of the folder containing the current file.  
    Command: `Copy Folder Content`
    
- **Copy Project Structure and Docs**: Analyzes the project's structure and documentation and copies it.  
    Command: `Copy Project Structure`

### Keybindings

The following keybindings are available by default:

- `Ctrl+Alt+C`: **Copy Current File Path and Content**
- `Ctrl+Alt+F`: **Copy Current Folder Path and Content**
- `Ctrl+Alt+S`: **Copy Project Structure and Docs**

### Context Menu Integration

The extension integrates into the context menu in both the editor and the file explorer:

- **Editor Title Context Menu**: You can access the copy commands from the navigation group.
- **File Explorer Context Menu**: The "Copy File Path and Content" command is available when right-clicking on files.

---

Happy coding with FastPaste! 🚀