// test.js
// Checks if required npm packages are installed. Installs any missing ones automatically.

console.log("Checking for required dependencies...");

const { execSync } = require("child_process");

// List of required npm packages
const requiredPackages = ["axios", "discord.js", "dotenv"];

// Function to check if a package is installed
function isInstalled(pkg) {
  try {
    require.resolve(pkg);
    return true;
  } catch {
    return false;
  }
}

// Check and install missing packages
for (const pkg of requiredPackages) {
  if (isInstalled(pkg)) {
    console.log(`${pkg} is installed.`);
  } else {
    console.warn(`${pkg} is missing. Installing now...`);
    try {
      execSync(`npm install ${pkg} --save`, { stdio: "inherit" });
      console.log(`${pkg} installed successfully.`);
    } catch (err) {
      console.error(`Failed to install ${pkg}:`, err);
    }
  }
}

console.log("Dependency check complete.");
process.exit(0);
