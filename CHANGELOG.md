# Change Log

## 1.1.0

- **Whitespace Optimization:** Added automatic whitespace removal feature to reduce token consumption.
    - Trims leading/trailing whitespace from each line
    - Removes empty lines at start and end of content
    - Reduces multiple consecutive empty lines to a single empty line
- **Configuration Option:** New `FastPaste.enableWhitespaceRemoval` setting to toggle whitespace optimization
- **Keybinding Updates:** Added keyboard shortcuts for new commands
- **Project Structure:** Improved JavaScript and Python project structure analysis
- **Performance:** Optimized file reading and processing for better performance
- **Dependencies:** Updated and cleaned up project dependencies

## 1.0.9

### New Features

- **JavaScript Project Structure:** Added support for copying the structure of JavaScript projects.
- **Markdown and Docstring Support:** You can now copy both Markdown documentation files and Python docstrings together.
- **Toolbar Enhancements:** New toolbar buttons have been added for copying JavaScript project structures and Markdown documentation with Python docstrings.
- **Python Project Structure:** The Python project structure now includes only Python code-related information, along with the details of the last Git commit.

## 1.0.8

The list of supported code file extensions for copying has been extended to include:

```
    '.py',    # Python
    '.yaml',  # YAML
    '.yml',   # YAML (alternative extension)
    '.ini',   # INI configuration files
    '.cfg',   # Configuration files
    '.html',  # HTML
    '.js',    # JavaScript
    '.jsx',   # JavaScript JSX
    '.css',   # CSS
    '.scss',  # SASS/SCSS
    '.md',    # Markdown
    '.txt',   # Text files
    '.php',   # PHP
    '.java',  # Java
    '.c',     # C
    '.cpp',   # C++
    '.cs',    # C#
    '.rb',    # Ruby
    '.go',    # Go
    '.rs',    # Rust
    '.ts',    # TypeScript
    '.tsx',   # TypeScript JSX
    '.sh',    # Shell scripts
    '.xml',   # XML
    '.json',  # JSON
    '.swift', # Swift
    '.kt',    # Kotlin
```

## 1.0.2

### Improvements and Enhancements

- **New Toolbar Icons:** Updated the toolbar with new icons for better visual clarity and user experience.
- **Keyboard Shortcuts:** Added keyboard shortcuts for faster and more efficient access to key features.

## 1.0.1

### New Feature: `.gitignore` Compliance

**Respect `.gitignore`:** The extension now respects the `.gitignore` file, automatically filtering out any files and folders specified within it. If you find that the copy operation includes files you don’t want to be included, simply add those files or directories to your `.gitignore`, and they will be excluded from future copies.