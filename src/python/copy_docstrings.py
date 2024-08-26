import ast
import os


class DocstringExtractor(ast.NodeVisitor):
    def __init__(self):
        self.docstrings = {"module": None, "classes": {}, "functions": []}
        self.current_file = None
        self.module_name = None

    def visit_Module(self, node):
        self.docstrings["module"] = ast.get_docstring(node)
        self.module_name = os.path.splitext(os.path.basename(self.current_file))[0]
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        class_docstring = ast.get_docstring(node)
        methods = []

        for class_body_node in node.body:
            if isinstance(class_body_node, ast.FunctionDef):
                method_docstring = ast.get_docstring(class_body_node)
                if method_docstring:
                    methods.append((class_body_node.name, method_docstring))

        if class_docstring or methods:
            self.docstrings["classes"][node.name] = {
                "docstring": class_docstring,
                "methods": methods,
            }

        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if (
            isinstance(node, ast.FunctionDef)
            and node.name not in self.docstrings["classes"]
        ):
            func_docstring = ast.get_docstring(node)
            if func_docstring:
                self.docstrings["functions"].append((node.name, func_docstring))
        self.generic_visit(node)

    def extract_docstrings(self, file_path):
        self.current_file = file_path
        try:
            with open(file_path, "r", encoding="utf-8") as source:
                content = source.read()
                tree = ast.parse(content)
                self.visit(tree)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    def has_docstrings(self):
        return any(
            [
                self.docstrings["module"],
                self.docstrings["classes"],
                self.docstrings["functions"],
            ]
        )

    def get_formatted_docstrings(self):
        output = []

        if self.current_file:
            output.append(f"# File: {self.current_file}")

        if self.module_name:
            output.append(f"# Module: {self.module_name}")
        if self.docstrings["module"]:
            output.append(
                f"# Module-Level Documentation\n\n{self.docstrings['module']}\n"
            )

        for class_name, details in self.docstrings["classes"].items():
            output.append(f"# Class: {class_name}\n\n{details['docstring']}\n")
            if details["methods"]:
                output.append("## Functions:")
                for method_name, method_docstring in details["methods"]:
                    output.append(
                        f"- Function: {method_name}\n\n  {method_docstring}\n"
                    )

        if self.docstrings["functions"]:
            output.append("# Module Functions:")
            for func_name, func_docstring in self.docstrings["functions"]:
                output.append(f"- Function: {func_name}\n\n  {func_docstring}\n")

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


def extract_project_docstrings(directory, patterns=None):
    all_docstrings = []
    excluded_dirs = {"venv", "node_modules", "__pycache__", "dist", "build"}

    for root, _, files in os.walk(directory):
        if any(excluded_dir in root.split(os.sep) for excluded_dir in excluded_dirs):
            continue

        if is_ignored(root, patterns):
            continue

        for file in files:
            file_path = os.path.join(root, file)
            if is_ignored(file_path, patterns):
                continue

            if file.endswith(".py"):
                extractor = DocstringExtractor()
                extractor.extract_docstrings(file_path)
                if extractor.has_docstrings():
                    formatted_docstrings = extractor.get_formatted_docstrings()
                    if formatted_docstrings.strip():
                        all_docstrings.append(formatted_docstrings)

    return "# Python Docstrings\n\n" + "\n\n".join(all_docstrings) if all_docstrings else ""


def save_docstrings_to_file(docstrings, output_file):
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(docstrings)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 3:
        print("Usage: python3 extract_docstrings.py <directory> <output_file>")
        sys.exit(1)

    directory = sys.argv[1]
    output_file = sys.argv[2]

    patterns = load_gitignore(directory)
    docstrings = extract_project_docstrings(directory, patterns)
    
    save_docstrings_to_file(docstrings, output_file)
    
    if docstrings:
        print(f"Extracted and formatted docstrings to {output_file}")
    else:
        print("No docstrings found in the project.")