
//
//  index.native.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2026 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import { _PlatformSpecType } from './common';

export * from './common';

declare global {

  const SystemFS: {
    // Directory utilities
    readonly home: string;
    readonly temp: string;
    readonly cwd: string;
    chdir(path: string): boolean;

    // MIME type detection
    getMimeType(fileExtension: string): string;

    // Basic file operations
    exists(path: string): boolean;
    isFile(path: string): boolean;
    isDirectory(path: string): boolean;
    isSymbolicLink(path: string): boolean;
    isHardLink(path: string): boolean;
    linkCount(path: string): number;
    
    // File metadata
    stat(path: string): {
      size: number;
      mtime: number;
      modificationDate: number;
      birthtime: number;
      creationDate: number;
      accessDate: number;
      isFile: boolean;
      isDirectory: boolean;
      isSymbolicLink: boolean;
      isCharacterDevice: boolean;
      isBlockDevice: boolean;
      isSocket: boolean;
      mode: number;
      permissions: number;
      nlink: number;
    } | null;
    
    lstat(path: string): {
      size: number;
      creationDate: number;
      modificationDate: number;
      accessDate: number;
      isFile: boolean;
      isDirectory: boolean;
      isSymbolicLink: boolean;
      isCharacterDevice: boolean;
      isBlockDevice: boolean;
      isSocket: boolean;
      permissions: number;
    } | null;

    // File I/O operations
    readFile(path: string, options?: { encoding?: string | null }): string | Uint8Array;
    writeFile(path: string, data: string | Uint8Array | ArrayBuffer | Blob, options?: { 
      encoding?: string; 
      flags?: string; 
    }): boolean | Promise<boolean>;
    
    // Directory operations
    readDir(path: string): string[];
    mkdir(path: string, options?: { recursive?: boolean }): boolean;
    rmdir(path: string, options?: { recursive?: boolean }): boolean;
    
    // File/directory operations
    remove(path: string): boolean;
    copy(src: string, dest: string, options?: { overwrite?: boolean }): boolean;
    move(src: string, dest: string, options?: { overwrite?: boolean }): boolean;
    
    // Link operations
    symlink(target: string, path: string): boolean;
    link(existingPath: string, newPath: string): boolean;
    readlink(path: string): string | null;
    
    // Stream operations
    createReadStream(path: string, options?: {
      encoding?: string | null;
      start?: number;
      end?: number;
      chunkSize?: number;
    }): ReadableStream<Uint8Array | string>;
    
    createWriteStream(path: string, options?: {
      encoding?: string;
      flags?: string;
    }): WritableStream<string | Uint8Array | ArrayBuffer>;
    
    // Directory streaming
    opendir(path: string, options?: {
      recursive?: boolean;
      filter?: ((entry: DirectoryEntry) => boolean) | null;
    }): DirectoryStream;
  }

  class DirectoryEntry {
    readonly name: string;
    readonly path: string;
    readonly isFile: boolean;
    readonly isDirectory: boolean;
    readonly isSymbolicLink: boolean;
    readonly isCharacterDevice: boolean;
    readonly isBlockDevice: boolean;
    readonly isSocket: boolean;
    readonly size: number;
    readonly modified: Date;
    readonly created: Date;
    readonly accessed: Date | null;
    readonly permissions: number;
    
    read(options?: { encoding?: string | null }): Promise<string | Uint8Array>;
    createReadStream(options?: { encoding?: string | null; start?: number; end?: number; chunkSize?: number }): ReadableStream<Uint8Array | string>;
    opendir(options?: { recursive?: boolean; filter?: ((entry: DirectoryEntry) => boolean) | null }): DirectoryStream;
  }

  class DirectoryStream implements AsyncIterable<DirectoryEntry> {
    [Symbol.asyncIterator](): AsyncIterator<DirectoryEntry>;
    close(): void;
  }

  namespace __NS_FROSTY_SPEC__ {

    interface LocalStorage {
      keys(): string[];
      setItem(key: string, value: string): void;
      getItem(key: string): string | undefined;
      removeItem(key: string): void;
      clear(): void;
    }
  }

  const __FROSTY_SPEC__: {
    get SOURCE_URL(): string | undefined;
    get NativeModules(): {
      get localStorage(): __NS_FROSTY_SPEC__.LocalStorage;
      [key: string]: any;
    };
  };
}
