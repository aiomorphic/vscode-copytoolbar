import ast
import sys
import os
import subprocess
from collections import defaultdict


class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self, filename):
        self.filename = filename
        self.classes = {}
        self.imports = []
        self.functions = []
        self.lines_of_code = 0
        self.docstrings = 0

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        module = node.module or ""
        for alias in node.names:
            full_import = f"{module}.{alias.name}"
            self.imports.append(full_import)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        class_info = {
            "name": node.name,
            "bases": [self._get_base_name(base) for base in node.bases],
            "methods": [],
        }

        for class_body_node in node.body:
            if isinstance(class_body_node, ast.FunctionDef):
                class_info["methods"].append(class_body_node.name)

                if ast.get_docstring(class_body_node):
                    self.docstrings += 1

        self.classes[node.name] = class_info

        if ast.get_docstring(node):
            self.docstrings += 1

        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if not hasattr(node, "is_method") or not node.is_method:
            self.functions.append(node.name)

        if ast.get_docstring(node):
            self.docstrings += 1

        self.generic_visit(node)

    def _get_base_name(self, base):
        if isinstance(base, ast.Name):
            return base.id
        elif isinstance(base, ast.Attribute):
            return f"{base.value.id}.${base.attr}"
        else:
            return "<unknown base>"

    def analyze_lines_of_code(self, source):
        self.lines_of_code = len(source.splitlines())


def analyze_file(file_path):
    try:
        with open(file_path, "r") as source:
            content = source.read()
            tree = ast.parse(content)
        analyzer = CodeAnalyzer(file_path)
        analyzer.analyze_lines_of_code(content)
        analyzer.visit(tree)
        return analyzer
    except Exception as e:
        print(f"Error analyzing file {file_path}: {str(e)}")
        return None


def format_analysis(analyzer, file_path):
    if analyzer is None:
        return f"Error: Could not analyze {file_path}\n"

    output = []
    output.append(
        f"File: {file_path} (Lines: {analyzer.lines_of_code}, Docstrings: {analyzer.docstrings})"
    )
    output.append(f"  Imports: {', '.join(analyzer.imports) or 'None'}")

    for class_name, class_info in analyzer.classes.items():
        output.append(f"  Class: {class_name}")
        output.append(
            f"    Inherits: {', '.join(class_info['bases']) if class_info['bases'] else 'None'}"
        )
        output.append(f"    Methods: {', '.join(class_info['methods'])}")

    for function in analyzer.functions:
        output.append(f"  Function: {function}")

    return "\n".join(output)


def load_gitignore(directory):
    gitignore_path = os.path.join(directory, ".gitignore")
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r") as f:
            patterns = [
                line.strip() for line in f if line.strip() and not line.startswith("#")
            ]
        return patterns
    return None


def is_ignored(path, patterns):
    if patterns:
        rel_path = os.path.relpath(path)
        for pattern in patterns:
            if pattern.endswith("/") and rel_path.startswith(pattern.rstrip("/")):
                return True
            if pattern.startswith("/") and rel_path == pattern.lstrip("/"):
                return True
            if pattern.endswith("*") and rel_path.endswith(pattern.rstrip("*")):
                return True
            if pattern in rel_path:
                return True
    return False


def get_virtual_env_info(directory):
    venv_path = os.path.join(directory, "venv", "bin", "python")
    if os.path.exists(venv_path):
        try:
            version = subprocess.check_output([venv_path, "--version"]).decode().strip()
            packages = (
                subprocess.check_output([venv_path, "-m", "pip", "freeze"])
                .decode()
                .splitlines()
            )
            return version, len(packages)
        except subprocess.CalledProcessError:
            return None, None
    return None, None


def get_git_info(directory):
    try:
        branch = (
            subprocess.check_output(
                ["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=directory
            )
            .strip()
            .decode("utf-8")
        )
        last_commit = (
            subprocess.check_output(["git", "log", "-1", "--pretty=%B"], cwd=directory)
            .strip()
            .decode("utf-8")
        )
        author = (
            subprocess.check_output(["git", "log", "-1", "--pretty=%an"], cwd=directory)
            .strip()
            .decode("utf-8")
        )
        return branch, last_commit, author
    except subprocess.CalledProcessError:
        return None, None, None


def analyze_directory(project_root, patterns=None):
    print(f"Project structure of directory: {project_root}")
    results = []
    total_lines = 0
    total_files = 0
    total_docstrings = 0
    modules = defaultdict(
        lambda: {"files": [], "total_lines": 0, "total_files": 0, "total_docstrings": 0}
    )

    excluded_dirs = {"venv", "node_modules", "__pycache__", "dist", "build"}

    for subdir, _, files in os.walk(project_root):
        if any(excluded_dir in subdir.split(os.sep) for excluded_dir in excluded_dirs):
            continue

        for file in files:
            file_path = os.path.join(subdir, file)

            if is_ignored(file_path, patterns) or is_ignored(subdir, patterns):
                continue

            if file.endswith(".py"):
                analyzer = analyze_file(file_path)
                if analyzer:
                    total_files += 1
                    total_lines += analyzer.lines_of_code
                    total_docstrings += analyzer.docstrings

                    module_name = os.path.relpath(subdir, project_root)
                    modules[module_name]["files"].append(
                        format_analysis(analyzer, file_path)
                    )
                    modules[module_name]["total_lines"] += analyzer.lines_of_code
                    modules[module_name]["total_files"] += 1
                    modules[module_name]["total_docstrings"] += analyzer.docstrings

    if total_files == 0:
        return "No Python files found in the project."

    if total_lines > 0:
        docstring_density = f"{(total_docstrings / total_lines):.2%}"
    else:
        docstring_density = "N/A"

    project_summary = (
        f"Project Summary:\n"
        f"  Total Python Files: {total_files}\n"
        f"  Total Lines of Code: {total_lines}\n"
        f"  Total Docstrings: {total_docstrings}\n"
        f"  Docstring Density: {docstring_density}\n"
    )

    results.append(project_summary)

    for module, info in modules.items():
        if info["total_lines"] > 0:
            module_docstring_density = (
                f"{(info['total_docstrings'] / info['total_lines']):.2%}"
            )
        else:
            module_docstring_density = "N/A"

        results.append(f"## Module: {module}")
        results.append(f"  - Total Files: {info['total_files']}")
        results.append(f"  - Total Lines of Code: {info['total_lines']}")
        results.append(f"  - Total Docstrings: {info['total_docstrings']}")
        results.append(f"  - Docstring Density: {module_docstring_density}")
        results.append("\n".join(info["files"]))

    return "\n".join(results)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 src/python/project_structure.py <project_root>")
        sys.exit(1)

    project_root = sys.argv[1]

    if not os.path.isdir(project_root):
        print(f"Error: {project_root} is not a valid directory.")
        sys.exit(1)

    patterns = load_gitignore(project_root)
    branch, last_commit, author = get_git_info(project_root)
    venv_version, venv_packages = get_virtual_env_info(project_root)

    project_overview = [
        "# Project Overview",
        f"- Project Path: {project_root}",
        "- Programming Languages: Python",
    ]

    if branch and last_commit and author:
        project_overview.append(
            f'- Git Info: Branch: {branch}, Last Commit: "{last_commit}", Author: {author}'
        )

    if venv_version and venv_packages:
        project_overview.append(f"- Virtual Environment: Detected ({venv_version})")
        project_overview.append(f"  - Packages: {venv_packages} installed")

    print("\n".join(project_overview) + "\n")

    result = analyze_directory(project_root, patterns)

    if result == "No Python files found in the project.":
        print(result)
    else:
        print(result)
