import { DynamicTool } from "langchain/tools";
import * as fs from "fs/promises";
import * as path from "path";

export class WriteFileTool extends DynamicTool {
  constructor(workDir: string) {
    super({
      name: "Write file",
      description:
        "Input must be in the format <file> <content>, e.g. file.txt 'Hello world!' Said the Giraffe.",
      func: async (input: string) => {
        const [file, data] = /^(\w+)\s+(.?)$/.exec(input) || ["", ""];
        const filePath = getFilePath(workDir, file);
        await fs.writeFile(filePath, data || "");
        return "";
      },
    });
  }
}

export class ReadFileTool extends DynamicTool {
  constructor(workDir: string) {
    super({
      name: "Read file",
      description: "Read the contents from a file path.",
      func: async (file: string) => {
        const filePath = getFilePath(workDir, file);
        const buffer = await fs.readFile(filePath);
        return buffer.toString();
      },
    });
  }
}

export class RemoveFileTool extends DynamicTool {
  constructor(workDir: string) {
    super({
      name: "Remove file",
      description: "Removes the file at the given path.",
      func: async (file: string) => {
        const filePath = getFilePath(workDir, file);
        await fs.rm(filePath);
        return "";
      },
    });
  }
}

export class CreateDirectoryTool extends DynamicTool {
  constructor(workDir: string) {
    super({
      name: "Create directory",
      description: "Creates a directory at a given path",
      func: async (dirname: string) => {
        const dirPath = getFilePath(workDir, dirname);
        await fs.mkdir(dirname);
        return "";
      },
    });
  }
}

export class RemoveDirectoryTool extends DynamicTool {
  constructor(workDir: string) {
    super({
      name: "Remove file",
      description: "Removes the file at the given path.",
      func: async (file: string) => {
        const filePath = getFilePath(workDir, file);
        await fs.rmdir(filePath);
        return "";
      },
    });
  }
}

export function createFsTools(workDir: string) {
  return [
    new WriteFileTool(workDir),
    new ReadFileTool(workDir),
    new RemoveFileTool(workDir),
    new CreateDirectoryTool(workDir),
    new RemoveDirectoryTool(workDir),
  ];
}

function isPathInside(childPath: string, parentPath: string) {
  // Normalize the paths to remove any extra "." or ".." segments
  const relativePath = path.relative(
    path.resolve(parentPath),
    path.resolve(childPath)
  );

  // If the relative path starts with "..", the path is not inside the directory
  return !relativePath.startsWith("..");
}

function assertPathInside(childPath: string, parentPath: string) {
  if (!isPathInside(childPath, parentPath)) {
    throw new Error(
      `Cannot perform file system action for path ${childPath} that is outside ${parentPath}`
    );
  }
}

function getFilePath(workDir: string, file: string): string {
  const filePath = path.join(workDir, file);
  assertPathInside(filePath, workDir);
  return filePath;
}
