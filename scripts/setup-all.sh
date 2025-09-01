#!/bin/bash

# Simple wrapper for the new CLI setup command
echo "🏗️  Tese Marketplace - Complete Setup"
echo "Using new unified CLI..."

cd "$(dirname "$0")"
node tese-cli.js setup
