#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up spodownbeta application...${NC}"

# Step 1: Clone the repository
echo -e "${GREEN}Step 1: Cloning the repository from GitHub...${NC}"
git clone https://github.com/Ber906/spodownbeta

# Check if clone was successful
if [ ! -d "spodownbeta" ]; then
    echo -e "${RED}Failed to clone the repository. Please check your internet connection and try again.${NC}"
    exit 1
fi

# Step 2: Move contents from the spodownbeta folder to the current directory
echo -e "${GREEN}Step 2: Moving contents to the current directory...${NC}"
mv spodownbeta/* .
mv spodownbeta/.* . 2>/dev/null || true  # Move hidden files too, ignoring errors

# Remove the empty directory
rm -rf spodownbeta

# Step 3: Install dependencies
echo -e "${GREEN}Step 3: Installing dependencies...${NC}"
npm install

# Step 4: Run the application
echo -e "${GREEN}Step 4: Starting the application...${NC}"
echo -e "${YELLOW}The application will now start. Press Ctrl+C to stop it.${NC}"
npm start

# If npm start doesn't work, try node index.js or node app.js
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}npm start failed, trying to run with node directly...${NC}"
    
    if [ -f "index.js" ]; then
        node index.js
    elif [ -f "app.js" ]; then
        node app.js
    elif [ -f "server.js" ]; then
        node server.js
    else
        echo -e "${RED}Could not determine the main file to run. Please check the repository documentation.${NC}"
        exit 1
    fi
fi
