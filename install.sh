#!/bin/sh
# DevRules Installer
# A universal shell script to install DevRules into any project
# Usage: curl -fsSL https://raw.githubusercontent.com/TheSethRose/DevRules/main/install.sh | sh
# or: curl -fsSL https://raw.githubusercontent.com/TheSethRose/DevRules/main/install.sh | sh -s -- --upgrade

set -e
set -x

# Default values
REPO_URL="https://github.com/TheSethRose/DevRules"
TARGET_DIR=".cursor/rules"
BRANCH="main"
TEMP_DIR="/tmp/devrules-$(date +%s)"
METHOD="git"
UPGRADE=false

# Banner
echo "====================================="
echo "DevRules Installer"
echo "A comprehensive collection of AI prompt engineering rules"
echo "====================================="

# Parse arguments
while [ "$#" -gt 0 ]; do
  case "$1" in
    --target=*)
      TARGET_DIR="${1#*=}"
      ;;
    --repo=*)
      REPO_URL="${1#*=}"
      ;;
    --branch=*)
      BRANCH="${1#*=}"
      ;;
    --method=*)
      METHOD="${1#*=}"
      ;;
    --upgrade|--update)
      UPGRADE=true
      echo "⬆️ Upgrade mode: Will preserve 01-* and 02-* files, but update 00-*, modes/, languages/, and technologies/ directories"
      ;;
    --help)
      echo "Usage: ./install.sh [options]"
      echo ""
      echo "Options:"
      echo "  --target=DIR     Install rules to this directory (default: .cursor/rules)"
      echo "  --repo=URL       Use this repository URL (default: https://github.com/TheSethRose/DevRules)"
      echo "  --branch=BRANCH  Use this branch (default: main)"
      echo "  --method=METHOD  Download method: git or curl (default: git)"
      echo "  --upgrade        Preserve 01-* and 02-* files, but update 00-*, modes/, languages/, and technologies/ directories"
      echo "  --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
  shift
done

# Create temp directory
mkdir -p "$TEMP_DIR"
echo "Created temporary directory: $TEMP_DIR"

# Download rules
if [ "$METHOD" = "git" ]; then
  # Check if git is available
  if ! command -v git >/dev/null 2>&1; then
    echo "Error: git not found. Please install git or use --method=curl"
    exit 1
  fi

  echo "Cloning repository using git..."
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TEMP_DIR/repo"
elif [ "$METHOD" = "curl" ]; then
  # Check if curl is available
  if ! command -v curl >/dev/null 2>&1; then
    echo "Error: curl not found. Please install curl or use --method=git"
    exit 1
  fi

  echo "Downloading repository using curl..."
  curl -L "$REPO_URL/archive/$BRANCH.zip" -o "$TEMP_DIR/devrules.zip"

  # Check if unzip is available
  if ! command -v unzip >/dev/null 2>&1; then
    echo "Error: unzip not found. Please install unzip"
    exit 1
  fi

  unzip -q "$TEMP_DIR/devrules.zip" -d "$TEMP_DIR"
  # Find the extracted directory
  EXTRACTED_DIR=$(find "$TEMP_DIR" -type d -name "DevRules-*" | head -n 1)
  if [ -z "$EXTRACTED_DIR" ]; then
    echo "Error: Could not find extracted directory"
    exit 1
  fi
  # Move files to a consistent location
  mkdir -p "$TEMP_DIR/repo"
  mv "$EXTRACTED_DIR"/* "$TEMP_DIR/repo/"
else
  echo "Error: Invalid method. Use 'git' or 'curl'."
  exit 1
fi

# Check if .cursor/rules directory exists in the cloned repo
if [ ! -d "$TEMP_DIR/repo/.cursor/rules" ]; then
  echo "Error: .cursor/rules directory not found in the repository."
  exit 1
fi

# Handle installation/upgrade based on mode
if [ "$UPGRADE" = true ]; then
  # Check if target directory exists
  if [ ! -d "$TARGET_DIR" ]; then
    echo "Warning: Target directory '$TARGET_DIR' doesn't exist. Will perform a full installation instead."
    UPGRADE=false
  fi
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

if [ "$UPGRADE" = true ]; then
  echo "Upgrading 00-*, modes/, languages/, and technologies/ while preserving 01-* and 02-* files..."

  # Remove existing modes, languages, and technologies directories in the target
  echo "Removing existing modes/, languages/, and technologies/ directories in $TARGET_DIR..."
  rm -rf "$TARGET_DIR/modes"
  rm -rf "$TARGET_DIR/languages"
  rm -rf "$TARGET_DIR/technologies"

  # Copy new modes directory if it exists in the repo
  if [ -d "$TEMP_DIR/repo/.cursor/rules/modes" ]; then
    echo "Copying new modes/ directory..."
    cp -r "$TEMP_DIR/repo/.cursor/rules/modes" "$TARGET_DIR/"
  else
    echo "Warning: modes/ directory not found in the repository source. Skipping."
  fi

  # Copy new languages directory if it exists in the repo
  if [ -d "$TEMP_DIR/repo/.cursor/rules/languages" ]; then
    echo "Copying new languages/ directory..."
    cp -r "$TEMP_DIR/repo/.cursor/rules/languages" "$TARGET_DIR/"
  else
    echo "Warning: languages/ directory not found in the repository source. Skipping."
  fi

  # Copy new technologies directory if it exists in the repo
  if [ -d "$TEMP_DIR/repo/.cursor/rules/technologies" ]; then
    echo "Copying new technologies/ directory..."
    cp -r "$TEMP_DIR/repo/.cursor/rules/technologies" "$TARGET_DIR/"
  else
    echo "Warning: technologies/ directory not found in the repository source. Skipping."
  fi

  # Copy the new 00-core-agent.mdc file
  if [ -f "$TEMP_DIR/repo/.cursor/rules/00-core-agent.mdc" ]; then
    echo "Copying new 00-core-agent.mdc..."
    # Remove existing before copying, just in case cp has issues overwriting
    rm -f "$TARGET_DIR/00-core-agent.mdc"
    cp "$TEMP_DIR/repo/.cursor/rules/00-core-agent.mdc" "$TARGET_DIR/"
  else
    echo "Warning: 00-core-agent.mdc not found in the repository source. Skipping update for this file."
  fi

  echo "✅ Core agent, mode, language, and technology files updated successfully!"
else
  # Check if target directory already has files that would be overwritten
  if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
    echo "Warning: Target directory '$TARGET_DIR' is not empty."
    printf "Do you want to overwrite existing files? [y/N] "
    read -r response
    if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
      echo "Installation cancelled."
      rm -rf "$TEMP_DIR"
      exit 0
    fi
  fi

  # Full installation - copy all files
  echo "Installing DevRules..."
  cp -r "$TEMP_DIR/repo/.cursor/rules/"* "$TARGET_DIR/"

  echo "✅ DevRules installed successfully!"
fi

# Cleanup
rm -rf "$TEMP_DIR"
echo "Cleaned up temporary files"

echo ""
echo "====================================="
echo "DevRules location: $TARGET_DIR"
echo ""
echo "Next steps:"
echo "1. Customize 01-project-context.mdc with your project details"
echo "2. Add project-specific anti-patterns to 02-common-errors.mdc"
echo "3. Start using the specialized modes in your development"
echo ""
echo "For updates, run:"
echo "curl -fsSL https://raw.githubusercontent.com/TheSethRose/DevRules/main/install.sh | sh -s -- --upgrade"
echo "====================================="
