const fs = require("fs");
const { parse } = require("@yarnpkg/lockfile");

const packageJsonPath = "./package.json";
const yarnLockPath = "./yarn.lock";

// Read and parse package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Read and parse yarn.lock
const yarnLockFile = fs.readFileSync(yarnLockPath, "utf8");
const parsedLock = parse(yarnLockFile);

if (parsedLock.type !== "success") {
  console.error("Error parsing yarn.lock");
  process.exit(1);
}

const lockData = parsedLock.object;

// Function to find the exact version of a dependency from yarn.lock.
// It looks for a key starting with "depName@".
function getExactVersion(depName) {
  for (const key in lockData) {
    if (key.startsWith(`${depName}@`)) {
      return lockData[key].version;
    }
  }
  return null;
}

// Update dependencies in package.json (if any)
if (packageJson.dependencies) {
  for (const depName of Object.keys(packageJson.dependencies)) {
    const exactVersion = getExactVersion(depName);
    if (exactVersion) {
      packageJson.dependencies[depName] = exactVersion;
      console.log(`Updated ${depName} to version ${exactVersion}`);
    } else {
      console.warn(`No locked version found for ${depName}`);
    }
  }
}

// Update devDependencies in package.json (if any)
if (packageJson.devDependencies) {
  for (const depName of Object.keys(packageJson.devDependencies)) {
    const exactVersion = getExactVersion(depName);
    if (exactVersion) {
      packageJson.devDependencies[depName] = exactVersion;
      console.log(
        `Updated devDependency ${depName} to version ${exactVersion}`
      );
    } else {
      console.warn(`No locked version found for devDependency ${depName}`);
    }
  }
}

// Write back the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(
  "package.json has been updated with exact versions from yarn.lock."
);
