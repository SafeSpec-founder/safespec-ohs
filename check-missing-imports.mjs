// check-missing-imports.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Enable __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base project directory
const projectRoot = path.resolve(__dirname, "src");

// Supported file extensions
const fileExtensions = [".js", ".ts", ".jsx", ".tsx"];

// Your alias mappings (customize as needed)
const aliasMap = {
  "@components": "src/components",
  "@store": "src/store",
  "@contexts": "src/contexts",
  "@utils": "src/utils",
  "@pages": "src/pages",
};

// Regex to match `from "..."` or `from '...'` imports
const importRegex = /from\s+["']([^"']+)["']/g;

/**
 * Recursively collects all files from a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (fileExtensions.includes(path.extname(entry.name))) {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

/**
 * Resolves relative and aliased import paths to absolute file paths
 */
function resolveImportPath(importPath, fromFile) {
  if (importPath.startsWith(".")) {
    return path.resolve(path.dirname(fromFile), importPath);
  }

  for (const alias in aliasMap) {
    if (importPath.startsWith(alias)) {
      const relativePath = importPath.replace(alias, aliasMap[alias]);
      return path.resolve(__dirname, relativePath);
    }
  }

  return null; // likely a node_module import
}

/**
 * Check for missing files
 */
function checkMissingImports() {
  const files = getAllFiles(projectRoot);
  const missing = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const matches = content.matchAll(importRegex);

    for (const match of matches) {
      const importPath = match[1];
      const resolvedPath = resolveImportPath(importPath, file);

      if (
        !resolvedPath ||
        importPath.startsWith("http") ||
        importPath.startsWith("@mui/") ||
        importPath.startsWith("react")
      ) {
        continue;
      }

      // Check if actual file exists (try common extensions)
      const found = fileExtensions.some(
        (ext) =>
          fs.existsSync(`${resolvedPath}${ext}`) ||
          fs.existsSync(path.join(resolvedPath, `index${ext}`)),
      );

      if (!found) {
        missing.push({
          file,
          importPath,
        });
      }
    }
  }

  if (missing.length === 0) {
    console.log("✅ No missing imports found.");
  } else {
    console.log("❌ Missing imports detected:\n");
    missing.forEach(({ file, importPath }) => {
      console.log(`Missing: "${importPath}" in ${file}`);
    });
    process.exitCode = 1;
  }
}

checkMissingImports();
