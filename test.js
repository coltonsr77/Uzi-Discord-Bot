// test.js
console.log("🔍 Starting project sanity check...");

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// --------------------
// Dependencies to check
// --------------------
const dependencies = [
  { name: "axios", test: async () => {
      console.log("🌐 Testing axios request to GitHub API...");
      const axios = require("axios");
      const res = await axios.get("https://api.github.com");
      if (res.status === 200) console.log("✅ Axios test request succeeded!");
      else console.log(`⚠️ Axios responded with status ${res.status}`);
    } 
  },
  { name: "dotenv", test: () => {
      const dotenv = require("dotenv");
      console.log("✅ dotenv is available");
    } 
  },
  { name: "discord.js", test: () => {
      const { Client } = require("discord.js");
      console.log("✅ discord.js is available (Client class loaded)");
    } 
  },
  // Add more dependencies here if needed
];

// --------------------
// Project files to check
// --------------------
const projectFiles = [
  "index.js",
  "server.js",
  ".env",
  // Add more important files here
];

async function checkDependencies() {
  for (const dep of dependencies) {
    try {
      require(dep.name);
      console.log(`✅ ${dep.name} is installed.`);
    } catch (err) {
      console.warn(`❌ ${dep.name} is missing. Installing...`);
      try {
        execSync(`npm install ${dep.name}`, { stdio: "inherit" });
        console.log(`✅ ${dep.name} installed successfully.`);
      } catch (installErr) {
        console.error(`❌ Failed to install ${dep.name}: ${installErr.message}`);
        continue;
      }
    }

    // Run the test function if exists
    if (dep.test) {
      try {
        await dep.test();
      } catch (testErr) {
        console.error(`❌ Test for ${dep.name} failed: ${testErr.message}`);
      }
    }
  }
}

function checkProjectFiles() {
  console.log("\n📂 Checking project files...");

  for (const file of projectFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ File exists: ${file}`);
      try {
        // Optional: attempt to require the file if it's a .js file
        if (file.endsWith(".js")) {
          require(filePath);
          console.log(`   🔹 Successfully loaded ${file}`);
        }
      } catch (err) {
        console.error(`❌ Failed to load ${file}: ${err.message}`);
      }
    } else {
      console.error(`❌ File missing: ${file}`);
    }
  }
}

// --------------------
// Run sanity check
// --------------------
(async () => {
  await checkDependencies();
  checkProjectFiles();
  console.log("\n🔹 Project sanity check complete!");
})();
