// Extended UI Demo Component showcasing all UI components
// Demonstrates the new Notification, Form, and Table components

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  User,
  Mail,
  Calendar,
  Upload,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

// Import all UI components
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  ProgressBar,
  Badge,
  Loader,
  ToastNotification,
  InAppNotification,
  NotificationBadge,
  NotificationCenter,
  ToastContainer,
  Form,
  InputField,
  SelectField,
  DatePicker,
  FileUpload,
  Table,
  Pagination
} from './index';

// Demo data
const demoUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Pending', joinDate: '2024-01-14' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Active', joinDate: '2024-01-13' },
  { id: 4, name: 'Alice Johnson', email: 'alice@example.com', role: 'Moderator', status: 'Inactive', joinDate: '2024-01-12' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Active', joinDate: '2024-01-11' }
];

const demoNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Task Completed',
    message: 'You have successfully completed your daily workout!',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    isRead: false,
    priority: 'medium' as const,
    actions: [
      { label: 'View Details', onClick: () => console.log('View details') },
      { label: 'Dismiss', onClick: () => console.log('Dismiss') }
    ]
  },
  {
    id: '2',
    type: 'achievement' as const,
    title: 'New Achievement Unlocked!',
    message: 'Congratulations! You\'ve reached Level 5!',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    priority: 'high' as const,
    actions: [
      { label: 'Claim Reward', onClick: () => console.log('Claim reward') },
      { label: 'Dismiss', onClick: () => console.log('Dismiss') }
    ]
  },
  {
    id: '3',
    type: 'warning' as const,
    title: 'Low Water Intake',
    message: 'You haven\'t logged water intake today. Stay hydrated!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: true,
    priority: 'low' as const,
    actions: [
      { label: 'Log Water', onClick: () => console.log('Log water') }
    ]
  }
];

const tableColumns = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sortable: true,
    filterable: true
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    sortable: true,
    filterable: true
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
    sortable: true,
    filterable: true,
    render: (value: string) => (
      <Badge variant={value === 'Admin' ? 'primary' : value === 'Moderator' ? 'secondary' : 'default'}>
        {value}
      </Badge>
    )
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sortable: true,
    filterable: true,
    render: (value: string) => (
      <Badge 
        variant={value === 'Active' ? 'success' : value === 'Pending' ? 'warning' : 'danger'}
        dot
      >
        {value}
      </Badge>
    )
  },
  {
    key: 'joinDate',
    title: 'Join Date',
    dataIndex: 'joinDate',
    sortable: true
  }
];

const UIDemoExtended: React.FC = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [toasts, setToasts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    date: null as Date | null,
    files: [] as File[]
  });
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);

  // Toast management
  const addToast = (toast: any) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Notification management
  const [notifications, setNotifications] = useState(demoNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  // Form handling
  const handleFormSubmit = async (data: any) => {
    console.log('Form submitted:', data);
    addToast({
      type: 'success',
      title: 'Form Submitted',
      message: 'User data has been saved successfully!',
      duration: 3000
    });
    setIsModalOpen(false);
  };

  const handleFileUpload = async (files: File[]) => {
    console.log('Files uploaded:', files);
    setFormData(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const handleFileRemove = (file: File) => {
    setFormData(prev => ({ 
      ...prev, 
      files: prev.files.filter(f => f !== file) 
    }));
  };

  // Table handling
  const handleUserSelection = (users: any[]) => {
    setSelectedUsers(users);
  };

  const handleTableSort = (column: string, direction: 'asc' | 'desc') => {
    console.log('Sort:', column, direction);
  };

  const handleTableFilter = (filters: Record<string, any>) => {
    console.log('Filter:', filters);
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'forms', label: 'Forms', icon: User },
    { id: 'tables', label: 'Tables', icon: Edit }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Extended UI Components Demo
          </h1>
          <p className="text-gray-600">
            Comprehensive showcase of all UI components including Notifications, Forms, and Tables
          </p>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Toast Container */}
        <ToastContainer
          toasts={toasts}
          onRemove={removeToast}
          position="top-right"
        />

        {/* Content */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Toast Notifications Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Toast Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => addToast({
                      type: 'success',
                      title: 'Success!',
                      message: 'Operation completed successfully.',
                      duration: 3000
                    })}
                    variant="primary"
                    className="w-full"
                  >
                    Success Toast
                  </Button>
                  <Button
                    onClick={() => addToast({
                      type: 'error',
                      title: 'Error!',
                      message: 'Something went wrong. Please try again.',
                      duration: 5000
                    })}
                    variant="danger"
                    className="w-full"
                  >
                    Error Toast
                  </Button>
                  <Button
                    onClick={() => addToast({
                      type: 'warning',
                      title: 'Warning!',
                      message: 'Please review your input before proceeding.',
                      duration: 4000
                    })}
                    variant="secondary"
                    className="w-full"
                  >
                    Warning Toast
                  </Button>
                  <Button
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Information',
                      message: 'Here is some useful information for you.',
                      duration: 3000
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Info Toast
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Center Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Center</CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDismiss={dismissNotification}
                  onDismissAll={dismissAllNotifications}
                  filter="all"
                  groupBy="date"
                  maxHeight="400px"
                />
              </CardContent>
            </Card>

            {/* Notification Badge Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    <NotificationBadge count={3} />
                  </div>
                  <div className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    <NotificationBadge count={99} maxCount={99} />
                  </div>
                  <div className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    <NotificationBadge count={150} maxCount={99} />
                  </div>
                  <div className="relative">
                    <Bell className="w-6 h-6 text-gray-600" />
                    <NotificationBadge count={0} showZero />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="space-y-6">
            {/* Form Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
              </CardHeader>
              <CardContent>
                <Form
                  onSubmit={handleFormSubmit}
                  initialValues={formData}
                  submitLabel="Create User"
                  cancelLabel="Cancel"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      name="name"
                      label="Full Name"
                      placeholder="Enter full name"
                      required
                      icon={User}
                      value={formData.name}
                      onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    />
                    <InputField
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="Enter email address"
                      required
                      icon={Mail}
                      value={formData.email}
                      onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    />
                    <SelectField
                      name="role"
                      label="Role"
                      placeholder="Select a role"
                      required
                      value={formData.role}
                      onChange={(value) => setFormData(prev => ({ ...prev, role: value as string }))}
                      options={[
                        { value: 'admin', label: 'Administrator' },
                        { value: 'moderator', label: 'Moderator' },
                        { value: 'user', label: 'User' }
                      ]}
                    />
                    <DatePicker
                      name="joinDate"
                      label="Join Date"
                      value={formData.date}
                      onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                      showTime={false}
                    />
                  </div>
                  <FileUpload
                    name="avatar"
                    label="Profile Picture"
                    accept="image/*"
                    multiple={false}
                    maxSize={5 * 1024 * 1024} // 5MB
                    onUpload={handleFileUpload}
                    onRemove={handleFileRemove}
                    files={formData.files}
                  />
                </Form>
              </CardContent>
            </Card>

            {/* Form in Modal Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Form in Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsModalOpen(true)}>
                  Open Form Modal
                </Button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title="Create New User"
                  size="lg"
                >
                  <ModalContent>
                    <Form
                      onSubmit={handleFormSubmit}
                      showCancel={false}
                      submitLabel="Create User"
                    >
                      <div className="space-y-4">
                        <InputField
                          name="modalName"
                          label="Full Name"
                          placeholder="Enter full name"
                          required
                        />
                        <InputField
                          name="modalEmail"
                          label="Email Address"
                          type="email"
                          placeholder="Enter email address"
                          required
                        />
                        <SelectField
                          name="modalRole"
                          label="Role"
                          placeholder="Select a role"
                          required
                          options={[
                            { value: 'admin', label: 'Administrator' },
                            { value: 'moderator', label: 'Moderator' },
                            { value: 'user', label: 'User' }
                          ]}
                        />
                      </div>
                    </Form>
                  </ModalContent>
                </Modal>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-6">
            {/* Table Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Data Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table
                  data={demoUsers}
                  columns={tableColumns}
                  selectable
                  sortable
                  filterable
                  onSelectionChange={handleUserSelection}
                  onSort={handleTableSort}
                  onFilter={handleTableFilter}
                  pagination={{
                    current: tablePage,
                    pageSize: tablePageSize,
                    total: demoUsers.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (page, pageSize) => {
                      setTablePage(page);
                      setTablePageSize(pageSize);
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected Users Display */}
            {selectedUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Users ({selectedUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="primary">
                        {user.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Table Actions Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Table Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Bulk Action',
                      message: `Performing action on ${selectedUsers.length} selected users.`,
                      duration: 3000
                    })}
                    disabled={selectedUsers.length === 0}
                  >
                    Bulk Edit ({selectedUsers.length})
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => addToast({
                      type: 'warning',
                      title: 'Delete Confirmation',
                      message: `Are you sure you want to delete ${selectedUsers.length} users?`,
                      duration: 0,
                      persistent: true,
                      actions: [
                        { label: 'Confirm', onClick: () => console.log('Delete confirmed') },
                        { label: 'Cancel', onClick: () => console.log('Delete cancelled') }
                      ]
                    })}
                    disabled={selectedUsers.length === 0}
                  >
                    Bulk Delete ({selectedUsers.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Component Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Component Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Toast Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">In-App Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Notification Center</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Notification Badges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Form Components</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Input Fields</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Select Fields</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Date Pickers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">File Upload</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Data Tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Pagination</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Sorting & Filtering</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UIDemoExtended;
