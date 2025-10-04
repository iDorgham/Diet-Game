#!/bin/bash

# Installation script for AR dependencies
# Run this script to install all required packages for Level 303 AR features

echo "🚀 Installing AR dependencies for NutriQuest Level 303..."

# Install web AR packages
echo "📦 Installing TensorFlow.js and MediaPipe packages..."
npm install @mediapipe/camera_utils @mediapipe/selfie_segmentation @tensorflow/tfjs @tensorflow/tfjs-models @tensorflow/tfjs-backend-webgl --legacy-peer-deps

# Install Three.js with compatible versions
echo "📦 Installing Three.js packages..."
npm install three@^0.158.0 @react-three/fiber@8.15.19 @react-three/drei@9.88.13 --legacy-peer-deps

# Install camera utilities
echo "📦 Installing camera utilities..."
npm install react-webcam --legacy-peer-deps

# Install Firebase (if not already installed)
echo "📦 Installing Firebase..."
npm install firebase@^10.7.1 --legacy-peer-deps

echo "✅ AR dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local"
echo "2. Add your Firebase and Grok API keys"
echo "3. Run 'npm run dev' to start development server"
echo "4. Navigate to /ar-recipes to test AR features"
echo ""
echo "🎯 Level 303 AR implementation ready!"
