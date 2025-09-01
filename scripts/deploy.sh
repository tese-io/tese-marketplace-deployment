#!/bin/bash

# Simple wrapper for the new CLI deploy command
echo "🚀 Deploying Tese Marketplace to Kubernetes..."
echo "Using new unified CLI..."

cd "$(dirname "$0")"
node tese-cli.js deploy
