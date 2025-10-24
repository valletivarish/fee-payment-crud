# Fee Management System - Frontend

A React + Vite frontend application for the Fee Management System.

## Features

### Student Interface
- **Student Management**: Add new students with personal and academic information
- **Fee Viewing**: View assigned fees, payment status, and balances
- **Payment Processing**: Make payments with different methods (Cash, Card, UPI, Net Banking)
- **Payment History**: View all payment transactions

### Admin Interface
- **Fee Plan Management**: Create and manage fee plans for different courses and academic years
- **Student Management**: View and manage all students
- **Fee Assignment**: Assign fee plans to specific students with due dates
- **Payment Overview**: View all payments across the system
- **Student Fee Tracking**: Monitor payment status and balances for all students

## Technology Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern CSS features

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running on http://localhost:8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── StudentInterface.jsx    # Student dashboard and functionality
│   └── AdminInterface.jsx      # Admin dashboard and functionality
├── App.jsx                     # Main application component
├── App.css                     # Global styles and component styles
├── index.css                   # Base styles and resets
└── main.jsx                    # Application entry point
```

## API Integration

The frontend integrates with the Spring Boot backend API:

- **Base URL**: `http://localhost:8080/api`
- **Students**: `/students` - CRUD operations for student management
- **Fee Plans**: `/fee-plans` - Fee plan creation and management
- **Student Fees**: `/student-fees` - Fee assignment and tracking
- **Payments**: `/payments` - Payment processing and history

## Key Features

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface

### User Experience
- Clean, modern UI design
- Intuitive navigation
- Real-time feedback and error handling
- Loading states and success messages

### Data Management
- Real-time data fetching
- Form validation
- Error handling and user feedback
- Currency formatting (INR)

## Usage

### For Students
1. Click "Continue as Student"
2. Add student information
3. View assigned fees and payment status
4. Make payments using preferred method
5. View payment history

### For Administrators
1. Click "Continue as Admin"
2. Create fee plans for different courses
3. Assign fees to students
4. Monitor payment status across all students
5. View comprehensive payment reports

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- JavaScript (no TypeScript)
- Functional components with hooks
- Modern ES6+ syntax
- Consistent naming conventions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use functional components and hooks
3. Maintain responsive design principles
4. Test across different browsers
5. Ensure API integration works correctly