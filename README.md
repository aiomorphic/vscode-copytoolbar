# CodeCopyToolbar

**CodeCopyToolbar** is a Visual Studio Code extension designed to enhance your productivity by providing a customizable toolbar with advanced copy features. With this extension, you can easily copy file paths, content, and project structures directly from the editor.

## Features

- **Customizable Toolbar:** Configure buttons on the toolbar to fit your workflow.
- **Copy File Path and Content:** Quickly copy the file path and content of the current file.
- **Copy Folder Content:** Copy the content of an entire folder, including nested files.
- **Copy Project Structure and Docs:** Generate and copy a structural overview of your project, including documentation.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view (`Ctrl+Shift+X`).
3. Search for "CodeCopyToolbar".
4. Click **Install**.

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