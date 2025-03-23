#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up spodownbeta application...${NC}"

# Set Spotify API credentials as environment variables
export SPOTIFY_CLIENT_ID="974318a580f84bdf90adb2b9b7f2b660"
export SPOTIFY_CLIENT_SECRET="ca3435eb9422482f846874ea47a23643"

echo -e "${GREEN}Spotify API credentials set${NC}"

# Step 1: Create required directories
echo -e "${GREEN}Step 1: Creating required directories...${NC}"
mkdir -p downloads
mkdir -p static/uploads/profile_images
mkdir -p static/uploads/chat_media
mkdir -p data

# Step 2: Ensure data files exist
echo -e "${GREEN}Step 2: Setting up data files...${NC}"
if [ ! -f "data/users.json" ]; then
    echo "{}" > data/users.json
    echo "Created users.json"
fi

if [ ! -f "data/downloads.json" ]; then
    echo "{}" > data/downloads.json
    echo "Created downloads.json"
fi

if [ ! -f "data/messages.json" ]; then
    echo "{}" > data/messages.json
    echo "Created messages.json"
fi

# Step 3: Set up Python virtual environment and install dependencies
echo -e "${GREEN}Step 4: Starting the application...${NC}"
echo -e "${YELLOW}The application will now start on port 5000. Press Ctrl+C to stop it.${NC}"

# Run the application
python main.py