# Diet Game UI Components

This directory contains the core UI components for the Diet Game application, implementing Phase 1 of the development roadmap. All components follow the specifications defined in `docs/ui-components/` and are built with TypeScript, React, Framer Motion, and Tailwind CSS.

## 🎯 Phase 1 Implementation Status

✅ **COMPLETED** - Core UI Components (Week 1-2)

- [x] Button component with variants and states
- [x] Input component with validation and accessibility
- [x] Card component with sub-components
- [x] Modal component with focus management
- [x] ProgressBar component with multiple variants
- [x] Badge component with status and achievement variants
- [x] Loader component with skeleton and overlay variants
- [x] Utility helpers for common functions

✅ **COMPLETED** - Extended UI Components (Week 2-3)

- [x] Notification components (Toast, In-App, Badge, Center)
- [x] Form components (Form, InputField, SelectField, DatePicker, FileUpload)
- [x] Table components (Table, TableRow, TableCell, Pagination)
- [x] Comprehensive demo and documentation

## 📦 Components Overview

### Button (`Button.tsx`)

**EARS-UI-031 through EARS-UI-035**

Primary action component with multiple variants, sizes, and states.

```tsx
import { Button } from './ui';

// Basic usage
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// With loading state
<Button loading>Processing...</Button>

// With icon
<Button icon={Plus} iconPosition="left">
  Add Item
</Button>
```

**Features:**

- 5 variants: primary, secondary, outline, ghost, danger
- 4 sizes: sm, md, lg, xl
- Loading states with spinner
- Icon support with positioning
- Full accessibility support
- Framer Motion animations

### Input (`Input.tsx`)

**EARS-UI-046 through EARS-UI-050**

Form input component with validation, icons, and accessibility.

```tsx
import { Input } from './ui';

// Basic text input
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
  helperText="Enter your email address"
/>

// Search input with clear button
<Input
  type="search"
  placeholder="Search recipes..."
  value={searchQuery}
  onChange={setSearchQuery}
  clearable
/>
```

**Features:**

- Multiple input types: text, email, password, search, etc.
- Validation states with error messages
- Icon support (left/right positioning)
- Clear button for search inputs
- Password visibility toggle
- Character counting
- Full accessibility support

### Card (`Card.tsx`)

**EARS-UI-011 through EARS-UI-015**

Container component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui';

<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Features:**
- 4 variants: default, elevated, outlined, filled
- 4 padding sizes: none, sm, md, lg
- Hover and clickable states
- Loading skeleton support
- Sub-components for structured layout

### Modal (`Modal.tsx`)
**EARS-UI-021 through EARS-UI-025**

Modal dialog component with focus management and accessibility.

```tsx
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
>
  <ModalContent>
    <p>Are you sure you want to proceed?</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>
```

**Features:**
- 5 sizes: sm, md, lg, xl, full
- 3 variants: default, centered, bottom-sheet
- Focus trap and keyboard navigation
- Escape key and overlay click to close
- Body scroll prevention
- Full accessibility support

### ProgressBar (`ProgressBar.tsx`)
**EARS-UI-041 through EARS-UI-045**

Progress indicator component with multiple variants.

```tsx
import { ProgressBar, CircularProgressBar, StepProgressBar } from './ui';

// Linear progress bar
<ProgressBar
  value={75}
  showLabel
  showPercentage
  label="Daily Goal"
  animated
/>

// Circular progress bar
<CircularProgressBar
  value={65}
  size={120}
  showPercentage
  label="XP Progress"
/>

// Step progress bar
<StepProgressBar
  steps={['Setup', 'Profile', 'Goals', 'Complete']}
  currentStep={2}
/>
```

**Features:**
- Linear, circular, and step variants
- Multiple sizes and colors
- Animation support
- Label and percentage display
- Accessibility with ARIA attributes

### Badge (`Badge.tsx`)
**EARS-UI-036 through EARS-UI-040**

Status indicator component with multiple variants.

```tsx
import { Badge, StatusBadge, NotificationBadge, AchievementBadge } from './ui';

// Basic badges
<Badge variant="success">Completed</Badge>
<Badge variant="warning" dot>In Progress</Badge>

// Status badges
<StatusBadge status="online" showLabel />

// Notification badges
<NotificationBadge count={5} max={99} />

// Achievement badges
<AchievementBadge
  title="First Steps"
  description="Complete your first task"
  rarity="common"
  isUnlocked={true}
  progress={100}
/>
```

**Features:**
- 7 variants: default, primary, secondary, success, warning, danger, info
- 3 sizes: sm, md, lg
- 3 shapes: rounded, pill, square
- Status, notification, and achievement variants
- Animation support
- Rarity-based styling for achievements

### Loader (`Loader.tsx`)
**EARS-UI-041 through EARS-UI-045**

Loading indicator component with multiple variants.

```tsx
import { Loader, Skeleton, LoadingOverlay, LoadingButton } from './ui';

// Spinner variants
<Loader variant="spinner" size="lg" />
<Loader variant="dots" size="md" />
<Loader variant="pulse" size="sm" />
<Loader variant="bars" size="lg" />

// Skeleton loader
<Skeleton height="1rem" width="100%" variant="text" />

// Loading overlay
<LoadingOverlay isLoading={loading} message="Loading...">
  <div>Content to be overlaid</div>
</LoadingOverlay>

// Loading button
<LoadingButton
  isLoading={isLoading}
  loadingText="Processing..."
  onClick={handleClick}
>
  Submit
</LoadingButton>
```

**Features:**
- 4 spinner variants: spinner, dots, pulse, bars
- 4 sizes: sm, md, lg, xl
- 4 colors: primary, secondary, white, gray
- Skeleton loaders with animation
- Loading overlay with backdrop
- Loading button with state management

### Notification (`Notification.tsx`)

**EARS-UI-026 through EARS-UI-030**

Comprehensive notification system with toast notifications, in-app notifications, badges, and notification center.

```tsx
import { 
  ToastNotification, 
  InAppNotification, 
  NotificationBadge, 
  NotificationCenter, 
  ToastContainer 
} from './ui';

// Toast notification
<ToastNotification
  id="1"
  type="success"
  title="Success!"
  message="Operation completed successfully."
  duration={3000}
  position="top-right"
/>

// In-app notification
<InAppNotification
  id="1"
  type="achievement"
  title="New Achievement!"
  message="You've reached Level 5!"
  timestamp={new Date()}
  isRead={false}
  priority="high"
  actions={[
    { label: 'Claim Reward', onClick: () => console.log('Claimed') }
  ]}
/>

// Notification badge
<NotificationBadge count={5} maxCount={99} animated />

// Notification center
<NotificationCenter
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onDismiss={dismissNotification}
  onDismissAll={dismissAllNotifications}
/>
```

**Features:**
- 4 notification types: success, error, warning, info
- 4 priority levels: low, medium, high, urgent
- Auto-dismiss with progress bar
- Manual dismissal and action buttons
- Notification center with filtering and grouping
- Animated badges with count indicators
- Full accessibility support

### Form (`Form.tsx`)

**EARS-UI-016 through EARS-UI-020**

Complete form system with validation, file upload, and date picker components.

```tsx
import { 
  Form, 
  InputField, 
  SelectField, 
  DatePicker, 
  FileUpload 
} from './ui';

// Complete form
<Form
  onSubmit={handleSubmit}
  initialValues={formData}
  validationSchema={schema}
  submitLabel="Create User"
>
  <InputField
    name="name"
    label="Full Name"
    placeholder="Enter full name"
    required
    icon={User}
    validation={{
      required: true,
      minLength: 2
    }}
  />
  
  <SelectField
    name="role"
    label="Role"
    placeholder="Select a role"
    required
    options={[
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'User' }
    ]}
  />
  
  <DatePicker
    name="joinDate"
    label="Join Date"
    showTime={false}
    minDate={new Date()}
  />
  
  <FileUpload
    name="avatar"
    label="Profile Picture"
    accept="image/*"
    maxSize={5 * 1024 * 1024}
    onUpload={handleFileUpload}
  />
</Form>
```

**Features:**
- Real-time validation with error messages
- Multiple input types with icons
- Searchable and multi-select dropdowns
- Date/time picker with constraints
- Drag-and-drop file upload with progress
- Form state management and submission handling
- Full accessibility support

### Table (`Table.tsx`)

**EARS-UI-036 through EARS-UI-040**

Advanced data table with sorting, filtering, pagination, and selection capabilities.

```tsx
import { Table, Pagination } from './ui';

const columns = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sortable: true,
    filterable: true
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (value) => (
      <Badge variant={value === 'Active' ? 'success' : 'danger'}>
        {value}
      </Badge>
    )
  }
];

<Table
  data={users}
  columns={columns}
  selectable
  sortable
  filterable
  onSelectionChange={handleSelection}
  onSort={handleSort}
  onFilter={handleFilter}
  pagination={{
    current: 1,
    pageSize: 10,
    total: 100,
    showSizeChanger: true,
    showQuickJumper: true,
    onChange: (page, pageSize) => console.log(page, pageSize)
  }}
/>
```

**Features:**
- Sortable columns with visual indicators
- Global search and column-specific filters
- Row selection (single and multiple)
- Pagination with page size options
- Custom cell rendering
- Responsive design with mobile layout
- Export and bulk action capabilities
- Full accessibility support

## 🛠️ Utility Functions

### Helpers (`../../utils/helpers.ts`)

Common utility functions used across components:

```tsx
import { cn, formatNumber, formatCurrency, debounce } from '../../utils/helpers';

// Class name utility
const className = cn('base-class', condition && 'conditional-class');

// Number formatting
const formatted = formatNumber(1234567); // "1,234,567"
const currency = formatCurrency(99.99); // "$99.99"

// Debounced function
const debouncedSearch = debounce(searchFunction, 300);
```

**Available Functions:**
- `cn()` - Class name utility
- `formatNumber()` - Number formatting
- `formatCurrency()` - Currency formatting
- `formatPercentage()` - Percentage formatting
- `debounce()` - Function debouncing
- `throttle()` - Function throttling
- `generateId()` - Random ID generation
- `clamp()` - Number clamping
- `calculatePercentage()` - Percentage calculation
- `formatDate()` - Date formatting
- `formatTime()` - Time formatting
- `getRelativeTime()` - Relative time
- `isValidEmail()` - Email validation
- `isValidUrl()` - URL validation
- `truncateText()` - Text truncation
- `stripHtml()` - HTML tag removal
- `formatBytes()` - Byte formatting
- `getRandomColor()` - Random color generation
- `calculateDistance()` - Distance calculation
- `sleep()` - Async delay
- `retryWithBackoff()` - Retry with exponential backoff
- `deepClone()` - Deep object cloning
- `deepEqual()` - Deep object comparison
- `groupBy()` - Array grouping
- `sortBy()` - Array sorting
- `unique()` - Array deduplication
- `chunk()` - Array chunking
- `shuffle()` - Array shuffling
- `randomItem()` - Random array item
- `randomItems()` - Multiple random array items

## 🎨 Design System

### Color Palette
```typescript
const colors = {
  primary: '#085492',      // Ocean Blue
  secondary: '#71E6DE',    // Mint Green
  success: '#10B981',      // Emerald 500
  warning: '#F59E0B',      // Amber 500
  error: '#EF4444',        // Red 500
  info: '#06B6D4',         // Cyan 500
  background: '#FFFFFF',   // White
  surface: '#F9FAFB',      // Gray 50
  border: '#E5E7EB',       // Gray 200
  text: {
    primary: '#111827',    // Gray 900
    secondary: '#6B7280',  // Gray 500
    disabled: '#9CA3AF'    // Gray 400
  }
};
```

### Typography Scale
```typescript
const typography = {
  title: 'text-3xl font-extrabold',
  heading: 'text-2xl font-bold',
  subheading: 'text-xl font-semibold',
  body: 'text-base font-normal',
  caption: 'text-sm font-medium',
  small: 'text-xs font-normal'
};
```

### Spacing System
```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem'    // 64px
};
```

## ♿ Accessibility Features

All components include comprehensive accessibility support:

- **WCAG 2.1 AA Compliance**: Color contrast, keyboard navigation, screen reader support
- **ARIA Labels**: Proper landmarks, descriptions, and state indicators
- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Focus Management**: Visible focus indicators and logical tab order
- **Touch Targets**: Minimum 44px touch targets for mobile devices

## 🚀 Usage Examples

### Basic Component Usage
```tsx
import { Button, Input, Card } from './components/ui';

function MyComponent() {
  const [value, setValue] = useState('');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          label="Name"
          value={value}
          onChange={setValue}
          placeholder="Enter your name"
        />
        <Button onClick={() => console.log(value)}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Advanced Component Composition
```tsx
import { 
  Modal, 
  ModalHeader, 
  ModalTitle, 
  ModalContent, 
  ModalFooter,
  ProgressBar,
  Badge,
  Button 
} from './components/ui';

function TaskModal({ task, isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>{task.title}</ModalTitle>
        <Badge variant={task.priority === 'high' ? 'danger' : 'primary'}>
          {task.priority}
        </Badge>
      </ModalHeader>
      <ModalContent>
        <ProgressBar
          value={task.progress}
          showLabel
          showPercentage
          label="Progress"
        />
        <p>{task.description}</p>
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={task.onComplete}>
          Complete Task
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

## 🧪 Testing

### Demo Components
Use the demo components to test all UI components:

```tsx
import UIDemo from './components/ui/UIDemo';
import UIDemoExtended from './components/ui/UIDemoExtended';

// Basic UI components demo
<UIDemo />

// Extended UI components demo (Notifications, Forms, Tables)
<UIDemoExtended />
```

### Testing Checklist
- [ ] All components render without errors
- [ ] Props are properly typed and validated
- [ ] Accessibility features work correctly
- [ ] Animations are smooth and performant
- [ ] Responsive design works on all screen sizes
- [ ] Dark mode support (when implemented)
- [ ] Keyboard navigation works properly
- [ ] Screen reader compatibility

## 🔄 Future Enhancements

### Phase 2: Advanced Components (Week 3-4)
- [ ] DataTable component with sorting and filtering
- [ ] Chart components for data visualization
- [ ] Form components with validation
- [ ] Navigation components
- [ ] Calendar and date picker components

### Phase 3: Specialized Components (Week 5-6)
- [ ] Gamification-specific components
- [ ] Nutrition tracking components
- [ ] Social community components
- [ ] AI coach interface components

### Long-term Improvements
- [ ] Storybook integration for component documentation
- [ ] Automated accessibility testing
- [ ] Performance monitoring and optimization
- [ ] Theme customization system
- [ ] Component library NPM package

## 📚 Resources

- [Component Specifications](../docs/ui-components/)
- [Design System Guidelines](../docs/ui-components/overview.md)
- [Accessibility Standards](../docs/ui-components/overview.md#accessibility-standards)
- [Testing Guidelines](../docs/TESTING_GUIDE.md)
- [Development Workflow](../docs/DEVELOPER_GUIDE.md)

## 🤝 Contributing

When adding new components:

1. Follow the existing component patterns
2. Include comprehensive TypeScript types
3. Add accessibility features
4. Include Framer Motion animations
5. Write component documentation
6. Add to the UIDemo component
7. Update this README

## 📝 Notes

- All components use Tailwind CSS for styling
- Framer Motion is used for animations
- Lucide React provides icons
- Components are fully typed with TypeScript
- Accessibility is built-in, not an afterthought
- Performance is optimized with React.memo where appropriate
- Components follow the established design system
