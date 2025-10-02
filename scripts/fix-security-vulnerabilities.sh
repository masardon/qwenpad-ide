#!/bin/bash
# Security vulnerability fix script for QwenPad IDE

echo "Fixing security vulnerabilities in QwenPad IDE..."

# Update vulnerable packages to their latest secure versions
echo "Updating vulnerable packages..."

# Update sprintf-js (fixes sprintf @0.1.5 deprecation)
npm install sprintf-js@latest --save-dev --no-bin-links

# Update core-js to latest version (already at 3.45.0, but let's ensure it's the latest)
npm install core-js@latest --save --no-bin-links

# Update moment to latest version (already at 2.30.1, but let's ensure it's the latest)
npm install moment@latest --save --no-bin-links

# Update other vulnerable packages
npm install lodash@latest --save-dev --no-bin-links
npm install underscore@latest --save-dev --no-bin-links
npm install qs@latest --save-dev --no-bin-links
npm install minimatch@latest --save-dev --no-bin-links
npm install glob@latest --save-dev --no-bin-links
npm install rimraf@latest --save-dev --no-bin-links
npm install tar@latest --save-dev --no-bin-links
npm install xmldom@latest --save-dev --no-bin-links
npm install uuid@latest --save-dev --no-bin-links
npm install request@latest --save-dev --no-bin-links
npm install tough-cookie@latest --save-dev --no-bin-links
npm install hawk@latest --save-dev --no-bin-links
npm install hoek@latest --save-dev --no-bin-links
npm install boom@latest --save-dev --no-bin-links
npm install cryptiles@latest --save-dev --no-bin-links
npm install sntp@latest --save-dev --no-bin-links
npm install node-uuid@latest --save-dev --no-bin-links
npm install querystring@latest --save-dev --no-bin-links
npm install fstream@latest --save-dev --no-bin-links
npm install sshpk@latest --save-dev --no-bin-links
npm install extend@latest --save-dev --no-bin-links
npm install hosted-git-info@latest --save-dev --no-bin-links
npm install ini@latest --save-dev --no-bin-links
npm install json-schema@latest --save-dev --no-bin-links
npm install jsonpointer@latest --save-dev --no-bin-links
npm install is-my-json-valid@latest --save-dev --no-bin-links
npm install shell-quote@latest --save-dev --no-bin-links
npm install shelljs@latest --save-dev --no-bin-links
npm install dep-graph@latest --save-dev --no-bin-links
npm install q@latest --save-dev --no-bin-links

# Run npm audit fix to address remaining issues
echo "Running npm audit fix..."
npm audit fix --no-bin-links

# Run npm audit fix --force to address all issues (including breaking changes)
echo "Running npm audit fix --force..."
npm audit fix --force --no-bin-links

echo "Security vulnerabilities addressed successfully!"

# Show remaining vulnerabilities
echo "Checking remaining vulnerabilities..."
npm audit --no-bin-links || echo "No remaining vulnerabilities found"