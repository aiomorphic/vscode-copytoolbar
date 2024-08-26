# FastPaste toolbar

**FastPaste** is the Visual Studio Code extension for developers who want to supercharge their productivity when working with AI tools like ChatGPT and Claude. It's not just about copying file paths or content—it's about providing AI with the precise context it needs to give you accurate, relevant, and actionable responses. Whether you're fixing bugs, adding features, or exploring code, FastPaste ensures you're not wasting time or money.

## Why FastPaste is Essential

When you're working on large production projects with complex codebases, providing your AI tools with the right context is crucial. Overly broad context questions to AI often result in generic suggestions that miss the mark, leading to frustration and wasted time. But by using **FastPaste**, you can quickly copy and paste relevant code snippets, entire modules, or project structures directly into your AI chat, making your interactions with tools like ChatGPT or Claude much more efficient.

### Key Benefits:

- **Enhanced AI Responses**: By providing the exact code context, you ensure that AI tools give you targeted, useful answers, improving your coding efficiency.
- **Cost Efficiency**: Use the chat-based version of AI tools, which is often cheaper and better optimized for large context handling compared to API-based solutions that charge per token.
- **Faster Workflow**: Quickly select and copy just the relevant parts of your project, paste them into your AI chat, and get accurate, actionable code changes without the need to sift through irrelevant information.

## Features

- **Instant Copy Commands**:
    - ![File Path & Content](resources/codicon--copy.png) **File Path & Content**: Copy the file path and content of the active file in one click.
    - ![Folder Content](resources/codicon--file-submodule.png) **Folder Content**: Copy all code files within a folder, respecting .gitignore rules, to provide comprehensive context to AI models. Copy entire module contents to provide AI models with the necessary context without sharing the entire codebase.
    - ![Project Structure & Docs](resources/codicon--symbol-structure.png) **Project Structure & Docs**: Generate and copy your project's structure using AST analysis, ensuring AI understands the full scope of your project.
    - ![JS Project Structure](resources/codicon--json.png) **JS Project Structure**: Analyze and copy the structure of JavaScript/TypeScript projects.
    - ![MD Docs & Docstrings](resources/codicon--markdown.png) **MD Docs & Docstrings**: Copy Markdown documentation and Python docstrings.
    
- **Remote Explorer Compatibility**: Fully compatible with SSH-connected remote environments, making it effortless to copy and paste code, even when working on remote servers or virtual machines.
- **File Explorer Context Menu**: Select several files in File Explorer and use the `Copy File Path and Content` command to quickly share relevant code with AI tools.
- **Whitespace Optimization**: Automatically remove unnecessary whitespace to reduce token consumption

### Toolbar screenshot

![Image](resources/fastpaste-toolbar.png)

### Files explorer context menu

![Image](resources/fastpaste-context-menu.png)

### Available Commands

You can access these commands through the command palette (`Ctrl+Shift+P`) or by using the associated toolbar buttons:

- `Copy File Path and Content`: Copies the file path and content of the current file.
- `Copy Folder Content`: Copies the content of the folder containing the current file.
- `Copy Project Structure and Docs`: Analyzes the Python project's structure and documentation and copies it.
- `Copy JS Project Structure`: Analyzes the JavaScript/TypeScript project's structure and copies it.
- `Copy MD Docs and Docstrings`: Copies Markdown documentation and Python docstrings.

### Keybindings

The following keybindings are available by default:

- `Ctrl+Alt+C`: Copy File Path and Content
- `Ctrl+Alt+F`: Copy Folder Content
- `Ctrl+Alt+S`: Copy Project Structure and Docs
- `Ctrl+Alt+J`: Copy JS Project Structure
- `Ctrl+Alt+D`: Copy MD Docs and Docstrings

### Settings

- `FastPaste.enableWhitespaceRemoval`: Enable/disable automatic whitespace optimization (default: false).
- `FastPaste.showNotifications`: Show/hide notifications when copying content (default: true).

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

---

[![Version](https://img.shields.io/visual-studio-marketplace/v/Aiomorphic.fastpaste)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.fastpaste)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Aiomorphic.fastpaste)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.fastpaste)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Aiomorphic.fastpaste)](https://marketplace.visualstudio.com/items?itemName=Aiomorphic.fastpaste)

Happy coding with FastPaste! 🚀