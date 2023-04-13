import { DynamicTool } from "langchain/tools";
import * as fs from "fs/promises";
import * as path from "path";

export class WriteFileTool extends DynamicTool {
  constructor(workDir: string) {
    super({
      name: "Write file",
      description:
        "Take a relative file path, writes any subsequent content into a file at that path.",
      func: async (input: string) => {
        const [file, data] = /^(\w+)\s+(.?)$/.exec(input) || ["", ""];
        const filePath = getFilePath(workDir, file);
        await fs.writeFile(filePath, data);
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
        const workDirPath = path.join(__dirname, workDir);
        const filePath = path.join(workDirPath, file);
        assertPathInside(filePath, path.join(workDirPath, workDir));
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
  const workDirPath = path.join(__dirname, workDir);
  const filePath = path.join(workDirPath, file);
  assertPathInside(filePath, path.join(workDirPath, workDir));
  return filePath;
}
