// UI Components Demo
// Demonstrates all the core UI components we've created

import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
  ProgressBar,
  CircularProgressBar,
  StepProgressBar,
  Badge,
  StatusBadge,
  NotificationBadge,
  AchievementBadge,
  Loader,
  Skeleton,
  LoadingOverlay,
  LoadingButton
} from './index';
import { CheckCircle, Star, Trophy, User } from 'lucide-react';

const UIDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Diet Game UI Components Demo
          </h1>
          <p className="text-lg text-gray-600">
            Phase 1: Core UI Components Implementation
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button variants and states</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>Form input components with validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Text Input"
                placeholder="Enter text here"
                value={inputValue}
                onChange={setInputValue}
                helperText="This is helper text"
              />
              <Input
                label="Email Input"
                type="email"
                placeholder="Enter email"
                value=""
                onChange={() => {}}
                error="Invalid email format"
              />
              <Input
                label="Password Input"
                type="password"
                placeholder="Enter password"
                value=""
                onChange={() => {}}
              />
              <Input
                label="Search Input"
                type="search"
                placeholder="Search..."
                value=""
                onChange={() => {}}
                clearable
              />
            </div>
          </CardContent>
        </Card>

        {/* Progress Bars Section */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Bars</CardTitle>
            <CardDescription>Various progress indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Linear Progress</h4>
                <ProgressBar
                  value={progress}
                  showLabel
                  showPercentage
                  label="Daily Goal"
                  animated
                />
              </div>
              
              <div className="flex items-center space-x-8">
                <div>
                  <h4 className="text-sm font-medium mb-2">Circular Progress</h4>
                  <CircularProgressBar
                    value={progress}
                    showPercentage
                    label="XP Progress"
                    animated
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Step Progress</h4>
                  <StepProgressBar
                    steps={['Setup', 'Profile', 'Goals', 'Complete']}
                    currentStep={2}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Basic Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Status Badges</h4>
                <div className="flex flex-wrap gap-4">
                  <StatusBadge status="online" showLabel />
                  <StatusBadge status="away" showLabel />
                  <StatusBadge status="busy" showLabel />
                  <StatusBadge status="offline" showLabel />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Notification Badges</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <User className="w-6 h-6" />
                    <NotificationBadge count={3} />
                  </div>
                  <div className="relative">
                    <Star className="w-6 h-6" />
                    <NotificationBadge count={99} />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Achievement Badges</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AchievementBadge
                    title="First Steps"
                    description="Complete your first task"
                    rarity="common"
                    isUnlocked={true}
                    icon={<CheckCircle className="w-8 h-8 text-green-500" />}
                  />
                  <AchievementBadge
                    title="Streak Master"
                    description="Maintain a 7-day streak"
                    rarity="rare"
                    isUnlocked={false}
                    progress={60}
                    icon={<Trophy className="w-8 h-8 text-yellow-500" />}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loaders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loaders</CardTitle>
            <CardDescription>Loading indicators and skeletons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Spinner Variants</h4>
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <Loader variant="spinner" size="lg" />
                    <p className="text-xs mt-2">Spinner</p>
                  </div>
                  <div className="text-center">
                    <Loader variant="dots" size="lg" />
                    <p className="text-xs mt-2">Dots</p>
                  </div>
                  <div className="text-center">
                    <Loader variant="pulse" size="lg" />
                    <p className="text-xs mt-2">Pulse</p>
                  </div>
                  <div className="text-center">
                    <Loader variant="bars" size="lg" />
                    <p className="text-xs mt-2">Bars</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Skeleton Loaders</h4>
                <div className="space-y-2">
                  <Skeleton height="1rem" width="100%" />
                  <Skeleton height="1rem" width="80%" />
                  <Skeleton height="1rem" width="60%" />
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Loading Button</h4>
                <LoadingButton
                  isLoading={isLoading}
                  loadingText="Processing..."
                  onClick={handleLoadingTest}
                >
                  Test Loading
                </LoadingButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>Modal dialog component</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleButtonClick}>
              Open Modal
            </Button>
          </CardContent>
        </Card>

        {/* Loading Overlay Demo */}
        <LoadingOverlay isLoading={isLoading} message="Processing your request...">
          <Card>
            <CardHeader>
              <CardTitle>Loading Overlay Demo</CardTitle>
              <CardDescription>This card can be overlaid with a loading state</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Click the "Test Loading" button above to see the loading overlay in action.</p>
            </CardContent>
          </Card>
        </LoadingOverlay>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        description="This is a demonstration of the modal component"
        size="md"
      >
        <ModalContent>
          <p className="text-gray-600 mb-4">
            This modal demonstrates the modal component with all its features including
            proper focus management, keyboard navigation, and accessibility.
          </p>
          <div className="space-y-4">
            <Input
              label="Modal Input"
              placeholder="Type something..."
              value=""
              onChange={() => {}}
            />
            <ProgressBar
              value={75}
              showLabel
              showPercentage
              label="Modal Progress"
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UIDemo;
