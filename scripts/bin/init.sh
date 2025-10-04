#!/bin/sh
#
#  init.sh
#
#  The MIT License
#  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
#
#  Permission is hereby granted, free of charge, to any person obtaining a copy
#  of this software and associated documentation files (the "Software"), to deal
#  in the Software without restriction, including without limitation the rights
#  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#  copies of the Software, and to permit persons to whom the Software is
#  furnished to do so, subject to the following conditions:
#
#  The above copyright notice and this permission notice shall be included in
#  all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#  THE SOFTWARE.
#

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get the frosty-native root directory (two levels up from scripts/bin)
FROSTY_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATE_APP_DIR="$FROSTY_ROOT/template/TemplateApp"

# Check if template directory exists
if [ ! -d "$TEMPLATE_APP_DIR" ]; then
    echo "Error: Template directory not found at $TEMPLATE_APP_DIR"
    exit 1
fi

# Ask user for project name
echo "🚀 Frosty Native Project Initializer"
echo "====================================="
echo ""
printf "Enter your project name: "
read PROJECT_NAME

# Validate project name
if [ -z "$PROJECT_NAME" ]; then
    echo "Error: Project name cannot be empty"
    exit 1
fi

# Check if project name contains only valid characters (alphanumeric and basic symbols)
if ! echo "$PROJECT_NAME" | grep -q '^[a-zA-Z0-9_-]*$'; then
    echo "Warning: Project name contains special characters. This might cause issues in some platforms."
    printf "Continue anyway? (y/N): "
    read CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "Aborted."
        exit 1
    fi
fi

INIT_CWD="${INIT_CWD:-$(pwd)}"
PROJECT_PATH="$INIT_CWD/$PROJECT_NAME"

# Check if target directory already exists
if [ -d "$PROJECT_PATH" ]; then
    echo "Error: Directory '$PROJECT_NAME' already exists in current location"
    exit 1
fi

echo ""
echo "📂 Creating project at: $PROJECT_PATH"

# Copy template directory to target location
echo "📋 Copying template files..."
cp -R "$TEMPLATE_APP_DIR" "$PROJECT_PATH"

# Navigate to project directory
cd "$PROJECT_PATH"

echo "🔄 Renaming project files and updating content..."

# Function to replace content in files
replace_content_in_file() {
    local file="$1"
    # Skip binary files and certain directories/files
    if [ -d "$file" ] || [ ! -f "$file" ]; then
        return
    fi
    
    # Skip certain file types that are likely binary or should not be modified
    case "$file" in
        *.png|*.jpg|*.jpeg|*.gif|*.ico|*.keystore|*.so|*.dylib|*.jar|*.zip|*.gradle-wrapper.jar)
            return
            ;;
        */node_modules/*|*/.git/*|*/.gradle/*|*/build/*|*/.idea/*|*/.xcode.env)
            return
            ;;
    esac
    
    # Use 'file' command for more reliable binary detection if available
    # Otherwise fall back to checking file extension
    if command -v file >/dev/null 2>&1; then
        local file_type=$(file -b "$file" 2>/dev/null)
        case "$file_type" in
            *"executable"*|*"binary"*|*"archive"*|*"compressed"*)
                return
                ;;
        esac
    fi
    
    # Replace TemplateApp with the new project name (case-sensitive)
    if grep -q "TemplateApp" "$file" 2>/dev/null; then
        # Use different sed syntax for macOS vs Linux
        if command -v gsed >/dev/null 2>&1; then
            gsed -i "s/TemplateApp/$PROJECT_NAME/g" "$file"
        else
            sed -i '' "s/TemplateApp/$PROJECT_NAME/g" "$file"
        fi
        echo "  ✅ Updated content in: $file"
    fi
    
    # Also replace the lowercase version for package names and bundle identifiers
    local LOWERCASE_TEMPLATE=$(echo "templateapp" | tr '[:upper:]' '[:lower:]')
    local LOWERCASE_PROJECT=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
    
    if grep -q "$LOWERCASE_TEMPLATE" "$file" 2>/dev/null; then
        if command -v gsed >/dev/null 2>&1; then
            gsed -i "s/$LOWERCASE_TEMPLATE/$LOWERCASE_PROJECT/g" "$file"
        else
            sed -i '' "s/$LOWERCASE_TEMPLATE/$LOWERCASE_PROJECT/g" "$file"
        fi
        echo "  ✅ Updated lowercase content in: $file"
    fi
}

# Function to rename files and directories
rename_files_and_dirs() {
    # Find and rename directories first (deepest first to avoid path issues)
    find . -type d -name "*TemplateApp*" -not -path "*/node_modules/*" | sort -r | while read -r dir; do
        if [ -d "$dir" ]; then
            new_dir=$(echo "$dir" | sed "s/TemplateApp/$PROJECT_NAME/g")
            if [ "$dir" != "$new_dir" ]; then
                mv "$dir" "$new_dir"
                echo "  📁 Renamed directory: $dir → $new_dir"
            fi
        fi
    done
    
    # Find and rename files
    find . -type f -name "*TemplateApp*" -not -path "*/node_modules/*" | while read -r file; do
        if [ -f "$file" ]; then
            new_file=$(echo "$file" | sed "s/TemplateApp/$PROJECT_NAME/g")
            if [ "$file" != "$new_file" ]; then
                mv "$file" "$new_file"
                echo "  📄 Renamed file: $file → $new_file"
            fi
        fi
    done
}

# First, rename files and directories
rename_files_and_dirs

# Then, update content in all files
find . -type f | while read -r file; do
    replace_content_in_file "$file"
done

# Clean up unwanted files and directories
echo "🧹 Cleaning up..."
rm -rf node_modules yarn.lock package-lock.json .DS_Store
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -type d -name "build" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name ".gradle" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name ".idea" -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "✨ Project '$PROJECT_NAME' has been successfully created!"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. npm install (or yarn install)"
echo "  3. Follow the platform-specific setup instructions in the generated project"
echo ""
echo "Happy coding! 🎉"
