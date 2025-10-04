// AR Recipes Page - Level 303 implementation
// Web-compatible AR using TensorFlow.js and camera integration

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  ChefHat, 
  Target, 
  Star, 
  CheckCircle, 
  Zap,
  ArrowLeft,
  Play,
  Square
} from 'lucide-react';
import { useNutriStore } from '../store/nutriStore';
import { WebARService, ARFoodItem, ARScene } from '../services/webAR';
import { grokApi } from '../services/grokApi';
import '../styles/components.css';

const ARRecipesPage: React.FC = () => {
  const [isARActive, setIsARActive] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<ARFoodItem[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [arScene, setArScene] = useState<ARScene>({
    foodItems: [],
    background: 'natural',
    lighting: 'natural'
  });
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arServiceRef = useRef<WebARService | null>(null);
  const { userProfile, completeTask } = useNutriStore();

  useEffect(() => {
    // Initialize AR service
    arServiceRef.current = new WebARService();
    
    return () => {
      if (arServiceRef.current) {
        arServiceRef.current.cleanup();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startAR = async () => {
    try {
      if (!canvasRef.current || !videoRef.current) return;

      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });

      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      // Wait for video to load
      videoRef.current.onloadedmetadata = async () => {
        await videoRef.current?.play();
        
        // Initialize AR service
        await arServiceRef.current?.initialize(canvasRef.current!, videoRef.current!);
        setIsARActive(true);
      };

    } catch (error) {
      console.error('Failed to start AR:', error);
      alert('Camera access denied. Please allow camera permissions to use AR features.');
    }
  };

  const stopAR = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsARActive(false);
    setDetectedFoods([]);
    setCurrentRecipe(null);
  };

  const captureAndAnalyze = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    setIsAnalyzing(true);
    
    try {
      // Capture frame from video
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Recognize foods using AR service
      const foods = await arServiceRef.current?.recognizeFood(imageData) || [];
      setDetectedFoods(foods);

      if (foods.length > 0) {
        // Generate recipe using Grok AI
        const recipe = await generateRecipeFromFoods(foods);
        setCurrentRecipe(recipe);

        // Generate AR scene
        const scene: ARScene = {
          foodItems: foods,
          background: 'natural',
          lighting: 'natural'
        };
        setArScene(scene);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRecipeFromFoods = async (foods: ARFoodItem[]) => {
    const foodNames = foods.map(f => f.name).join(', ');
    const query = `Create a healthy recipe using these ingredients: ${foodNames}. Make it suitable for ${userProfile.dietType}. Include cooking instructions and nutritional benefits.`;
    
    try {
      const grokResponse = await grokApi.generatePlan({
        profile: userProfile,
        query,
        context: {
          currentMeals: [],
          recentActivity: [],
          goals: {}
        }
      });

      const totalNutrition = arServiceRef.current?.calculateTotalNutrition(foods) || {
        calories: 0, protein: 0, carbs: 0, fat: 0
      };

      return {
        name: `AR Recipe with ${foodNames}`,
        description: grokResponse.plan,
        ingredients: foods,
        instructions: [
          '1. Prepare your ingredients in the AR workspace',
          '2. Follow the cooking instructions below',
          '3. Use AR guidance for proper measurements',
          '4. Enjoy your personalized meal!'
        ],
        nutrition: totalNutrition,
        confidence: grokResponse.confidence,
        xpReward: 20 + (foods.length * 5) // Bonus XP for more ingredients
      };
    } catch (error) {
      console.error('Recipe generation error:', error);
      return {
        name: `Simple Recipe with ${foodNames}`,
        description: `A healthy combination of ${foodNames} perfect for your ${userProfile.dietType} diet.`,
        ingredients: foods,
        instructions: ['Combine ingredients', 'Cook as desired', 'Enjoy!'],
        nutrition: arServiceRef.current?.calculateTotalNutrition(foods) || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        confidence: 75,
        xpReward: 15
      };
    }
  };

  const confirmCooking = async () => {
    try {
      // Award XP for AR cooking (Level 303)
      await completeTask(Date.now(), 'COOKING', 0);
      
      // Award bonus XP for AR usage
      if (currentRecipe?.xpReward) {
        await completeTask(Date.now(), 'AR_CHEF', 0);
      }
      
      setCurrentRecipe(null);
      setDetectedFoods([]);
      
      // Show success message
      alert('🎉 Recipe completed! You earned bonus XP for using AR cooking!');
    } catch (error) {
      console.error('Error completing recipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title="Go back"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">AR Recipe Quest</h1>
                <p className="text-blue-200 text-sm">
                  Scan ingredients and create magical recipes in AR!
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">Welcome, {userProfile.userName}</p>
              <p className="text-sm">{userProfile.dietType}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!isARActive ? (
          /* AR Setup */
          <div className="text-center space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Ready for AR Magic?
              </h2>
              <p className="text-gray-600 mb-6">
                Point your camera at ingredients to create personalized recipes in augmented reality!
              </p>
              <button
                onClick={startAR}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Start AR Camera</span>
              </button>
            </div>

            {/* AR Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Target className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Food Recognition</h3>
                <p className="text-sm text-gray-600">
                  AI-powered ingredient detection and nutrition analysis
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <ChefHat className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">AR Cooking</h3>
                <p className="text-sm text-gray-600">
                  Interactive 3D recipe visualization and cooking guidance
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <Star className="w-8 h-8 text-yellow-600 mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">XP Rewards</h3>
                <p className="text-sm text-gray-600">
                  Earn bonus XP for AR cooking and recipe creation
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* AR Interface */
          <div className="space-y-6">
            {/* Camera View */}
            <div className="relative bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              <canvas
                ref={canvasRef}
                className="ar-canvas-hidden absolute inset-0 w-full h-full"
              />
              
              {/* AR Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {detectedFoods.map((food, index) => (
                  <div
                    key={food.id}
                    className={`ar-overlay-item ar-overlay-item-${Math.min(index, 4)}`}
                  >
                    <div className="ar-overlay-item-name">{food.name}</div>
                    <div className="ar-overlay-item-calories">{food.nutritionInfo.calories} cal</div>
                    <div className="ar-overlay-item-confidence">
                      {Math.round(food.confidence * 100)}% match
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex space-x-3">
                <button
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Scan Ingredients</span>
                    </>
                  )}
                </button>
                <button
                  onClick={stopAR}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold flex items-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </div>
            </div>

            {/* Detected Foods */}
            {detectedFoods.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Detected Ingredients ({detectedFoods.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {detectedFoods.map((food) => (
                    <div key={food.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-800 capitalize">{food.name}</div>
                      <div className="text-sm text-gray-600">
                        {food.nutritionInfo.calories} cal
                      </div>
                      <div className="text-xs text-green-600">
                        {Math.round(food.confidence * 100)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Recipe */}
            {currentRecipe && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {currentRecipe.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {currentRecipe.confidence}% match
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{currentRecipe.description}</p>

                {/* Nutrition Info */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {currentRecipe.nutrition.calories}
                    </div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentRecipe.nutrition.protein}g
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentRecipe.nutrition.carbs}g
                    </div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentRecipe.nutrition.fat}g
                    </div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-2">AR Cooking Instructions</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    {currentRecipe.instructions.map((instruction: string, index: number) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <button
                  onClick={confirmCooking}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Cook & Earn +{currentRecipe.xpReward} XP! 🍳</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ARRecipesPage;
