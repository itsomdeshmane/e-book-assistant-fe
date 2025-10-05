# E-Book Assistant Frontend

A modern Next.js application that provides an intelligent e-book assistant with document upload, chat functionality, summarization, and interview question generation capabilities.

## 🚀 Features

- **Document Management**: Upload and manage PDF documents
- **AI-Powered Chat**: Interactive chat with uploaded documents using RAG (Retrieval-Augmented Generation)
- **Document Summarization**: Generate summaries of uploaded documents
- **Interview Questions**: Generate interview questions based on document content at different difficulty levels
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components
- **Real-time Updates**: Live status updates for document processing

## 🛠️ Tech Stack

- **Framework**: Next.js 13.5.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Authentication**: Custom JWT-based auth with Supabase
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
e-book-assistant-fe/
├── app/                          # Next.js App Router pages
│   ├── chat/[doc_id]/           # Document chat interface
│   ├── dashboard/               # Main dashboard
│   ├── interview-history/       # Interview session history
│   ├── interview-questions/     # Interview questions page
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   └── layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── ChatBox.tsx              # Chat interface component
│   ├── FileUploader.tsx         # File upload component
│   ├── PdfUploader.tsx          # PDF-specific uploader
│   └── Navbar.tsx               # Navigation component
├── contexts/                    # React contexts
│   └── AuthContext.tsx          # Authentication context
├── hooks/                       # Custom React hooks
│   ├── use-api.ts               # API integration hook
│   └── use-toast.ts             # Toast notifications hook
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client configuration
│   ├── cache.ts                 # Caching utilities
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # General utilities
└── pages/                       # Legacy pages (if any)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-book-assistant-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🔧 Configuration

### Next.js Configuration

The application uses a custom Next.js configuration (`next.config.js`) with:
- ESLint disabled during builds for faster deployment
- TypeScript build errors ignored for development flexibility

### Tailwind CSS

Configured with:
- Custom color palette
- Responsive design utilities
- Animation support via `tailwindcss-animate`

### API Configuration

The API client is configured in `lib/api.ts` with:
- Base URL configuration
- Request/response interceptors
- Authentication token handling
- Error handling

## 🔐 Authentication

The application uses JWT-based authentication with:
- Login/Register forms with validation
- Protected routes
- Token storage in localStorage
- Automatic token refresh handling

## 📱 Key Components

### ChatBox
- Real-time chat interface
- Message history
- Document context integration
- Typing indicators

### FileUploader
- Drag-and-drop file upload
- Progress tracking
- File validation
- Multiple file support

### PdfUploader
- PDF-specific upload handling
- OCR processing status
- Document preview

## 🌐 API Integration

The application integrates with a backend API providing:
- User authentication endpoints
- Document upload and management
- RAG-based chat functionality
- Document summarization
- Interview question generation

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant components
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Other Platforms

The application can be deployed to:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform
- Any Node.js hosting service

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## 📊 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: React Query for API response caching
- **Lazy Loading**: Component lazy loading where appropriate

## 🧪 Testing

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production (includes type checking)
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Version History

- **v0.1.0** - Initial release with core functionality
  - Document upload and management
  - Chat interface
  - User authentication
  - Basic UI components

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
