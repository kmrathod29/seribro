# StudentEarnings Dashboard - Integration Guide

## Quick Start

### 1. Basic Integration

Add the StudentEarnings component to your student dashboard page:

```jsx
// pages/student/Dashboard.jsx
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Earnings Dashboard</h1>
        <StudentEarnings />
      </div>
    </div>
  );
}
```

### 2. Tab Integration

Add as a tab within a larger dashboard:

```jsx
import { useState } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';
import StudentApplications from './StudentApplications';
import StudentProfile from './StudentProfile';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('earnings');

  const tabs = [
    { id: 'earnings', label: 'Earnings', component: StudentEarnings },
    { id: 'applications', label: 'Applications', component: StudentApplications },
    { id: 'profile', label: 'Profile', component: StudentProfile }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
```

### 3. Sidebar Layout

Integrate with a sidebar navigation:

```jsx
import { useState } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';
import { TrendingUp, FileText, User } from 'lucide-react';

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState('earnings');

  const sections = [
    { id: 'earnings', label: 'Earnings', icon: TrendingUp },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="flex gap-6 min-h-screen bg-dark p-6">
      {/* Sidebar */}
      <nav className="w-48 flex-shrink-0">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              {section.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {activeSection === 'earnings' && <StudentEarnings />}
        {/* Other sections... */}
      </div>
    </div>
  );
}
```

### 4. With Suspense Boundary

For better loading state handling:

```jsx
import { Suspense } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">My Earnings</h1>
      <Suspense fallback={<LoadingFallback />}>
        <StudentEarnings />
      </Suspense>
    </div>
  );
}
```

## Customization

### 1. Custom Styling

Override default styles with CSS module or Tailwind:

```jsx
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

export default function CustomEarningsDashboard() {
  return (
    <div className="custom-earnings-wrapper">
      <style>{`
        .custom-earnings-wrapper {
          --color-primary: #3b82f6;
          --color-success: #10b981;
          --color-warning: #f59e0b;
        }
      `}</style>
      <StudentEarnings />
    </div>
  );
}
```

### 2. Data Refresh

Add manual refresh button:

```jsx
import { useState } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';
import { RefreshCw } from 'lucide-react';

export default function RefreshableEarningsDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Earnings</h1>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <StudentEarnings key={refreshKey} />
    </div>
  );
}
```

### 3. With Filter Controls

Add filtering options:

```jsx
import { useState } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

export default function FilteredEarningsDashboard() {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '12m'
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="all">All Payments</option>
          <option value="released">Released</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="12m">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Component */}
      <StudentEarnings key={JSON.stringify(filters)} />
    </div>
  );
}
```

## API Configuration

### Verify Backend Endpoints

Ensure your backend has these endpoints properly configured:

```javascript
// Backend: /routes/paymentRoutes.js
router.get('/student/earnings', protect, roleMiddleware(['student']), getStudentEarnings);
router.get('/:paymentId', protect, getPaymentDetails);
```

### Environment Variables

Add to your `.env.local` or Vite config:

```env
VITE_API_BASE_URL=http://localhost:7000
```

### API Client Setup

Verify `apis/paymentApi.js` has these exports:

```javascript
export const getStudentEarnings = async () => { /* ... */ };
export const getPaymentDetails = async (paymentId) => { /* ... */ };
```

## Real-time Updates (Optional)

Add Socket.io integration for live payment updates:

```jsx
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../../apis/config';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

export default function RealtimeEarningsDashboard() {
  useEffect(() => {
    const socket = io(SOCKET_BASE_URL, {
      transports: ['websocket'],
      withCredentials: true,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('payment:released', (paymentData) => {
      // Trigger refresh or update state
      window.location.reload(); // Simple refresh approach
    });

    return () => socket.disconnect();
  }, []);

  return <StudentEarnings />;
}
```

## Error Handling

### Custom Error Boundary

```jsx
import { Component } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

export class EarningsDashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Earnings Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-4">Failed to load earnings dashboard. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500/30 text-red-300 rounded-lg hover:bg-red-500/40 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return <StudentEarnings />;
  }
}
```

## Performance Optimization

### Memoization

Wrap component with React.memo if not re-rendering:

```jsx
import { memo } from 'react';
import StudentEarnings from '@/components/studentComponent/StudentEarnings';

export default memo(function StudentDashboard() {
  return <StudentEarnings />;
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});
```

### Code Splitting

Lazy load the component:

```jsx
import { lazy, Suspense } from 'react';

const StudentEarnings = lazy(() => import('@/components/studentComponent/StudentEarnings'));

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <StudentEarnings />
    </Suspense>
  );
}
```

## Testing

### Manual Testing Checklist

- [ ] Component loads without errors
- [ ] Summary cards display correct values
- [ ] Table shows recent payments
- [ ] Modal opens when clicking "View Details"
- [ ] Chart toggles between bar and line
- [ ] Empty state displays when no earnings
- [ ] Currency formatting is correct
- [ ] Date formatting shows relative dates
- [ ] Status badges show correct colors
- [ ] Responsive layout works on mobile
- [ ] Toast notifications appear for errors
- [ ] Loading states display properly

### Mock Data Testing

```jsx
// Mock data for testing
const mockEarningsData = {
  success: true,
  data: {
    summary: {
      totalEarned: 150000,
      pendingPayments: 25000,
      completedProjects: 5,
      lastPaymentDate: new Date(),
      availableForWithdrawal: 150000
    },
    recentPayments: [
      {
        _id: '1',
        amount: 30000,
        netAmount: 28500,
        status: 'released',
        projectName: 'Website Design',
        companyName: 'Tech Corp',
        createdAt: new Date()
      }
    ],
    monthlyEarnings: [
      { month: '2025-01', total: 25000, projectCount: 1 }
    ]
  }
};
```

## Common Issues & Solutions

### Issue: Component not rendering
**Solution**: Ensure API routes are properly set up on backend

### Issue: Data not loading
**Solution**: Check browser console for API errors, verify auth token

### Issue: Chart not displaying
**Solution**: Verify monthly earnings data is not empty, check browser console

### Issue: Modal not opening
**Solution**: Ensure getPaymentDetails endpoint is accessible, check network tab

## Support & Documentation

- Refer to `STUDENTEARNINGS_README.md` for detailed feature documentation
- Check component prop types in JSDoc comments
- Review error messages in browser console
- Test API endpoints using Postman or similar tools

## Next Steps

1. Add bank details management feature
2. Implement withdrawal request system
3. Add PDF/CSV export functionality
4. Enable Socket.io real-time updates
5. Add tax document generation
6. Implement advanced filtering and search
