#!/bin/sh
#
#  environment.sh
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

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

export PROJECT_ROOT="${PROJECT_ROOT:-$( realpath "$PROJECT_DIR/.." )}"

cd $PROJECT_ROOT

export ENTRY_FILE="${ENTRY_FILE:-$(ls -1 index.* | head -1)}"
export OUTPUT_DIR="${OUTPUT_DIR:-"$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH"}"
export OUTPUT_FILE="${OUTPUT_FILE:-"main.jsbundle"}"

export BUILD_PLATFORM="apple"

source "$PROJECT_DIR/.xcode.env"

NODE_BIN_DIR="$( dirname "$( which $NODE_BINARY )" )"
export PATH=$NODE_BIN_DIR:$PATH

# Execute argument, if present
if [ -n "$PROJECT_DIR/$1" ]; then
  source "$PROJECT_DIR/$1"
fi
