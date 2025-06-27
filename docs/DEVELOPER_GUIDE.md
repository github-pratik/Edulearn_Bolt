# 🛠️ EduLearn Developer Guide

## Overview

This guide provides comprehensive information for developers who want to contribute to EduLearn, integrate with our platform, or deploy their own instance.

## 🏗️ Architecture Overview

### Tech Stack

```
Frontend:
├── React 18 + TypeScript
├── Tailwind CSS + DaisyUI
├── Vite (Build Tool)
├── React Router DOM
└── Lucide React (Icons)

Backend:
├── Supabase (Database + Auth + Storage)
├── PostgreSQL (Database)
├── Row Level Security (RLS)
└── Real-time Subscriptions

AI Integrations:
├── OpenRouter (DeepSeek Chat V3)
├── ElevenLabs (Voice AI)
└── Custom AI Tutoring System

Other Integrations:
├── RevenueCat (Payments)
├── Algorand (Blockchain)
├── Reddit (Community)
└── Netlify (Deployment)
```

### Project Structure

```
edulearn-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AI/             # AI-related components
│   │   ├── Auth/           # Authentication components
│   │   ├── Demo/           # Demo feature components
│   │   ├── Layout/         # Layout components
│   │   ├── Premium/        # Premium feature components
│   │   ├── Profile/        # Profile management
│   │   ├── Trial/          # Trial system components
│   │   ├── Upload/         # Video upload system
│   │   └── Video/          # Video-related components
│   ├── contexts/           # React contexts
│   ├── data/              # Static data and dummy content
│   ├── lib/               # Utility libraries
│   │   └── integrations/  # Third-party integrations
│   ├── pages/             # Page components
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
├── public/               # Static assets
└── dist/                 # Build output
```

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git (for version control)
- Supabase account
- API keys for integrations (optional for basic development)

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/edulearn-platform.git
   cd edulearn-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run migrations in order from `supabase/migrations/`
   - Update `.env` with your Supabase credentials

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open http://localhost:5173
   - The app will hot-reload as you make changes

### Environment Variables

```env
# Required for basic functionality
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for AI features
VITE_OPENROUTER_API_KEY=your_openrouter_key

# Optional integrations
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
VITE_REVENUECAT_API_KEY=your_revenuecat_key
VITE_APP_DOMAIN=your_custom_domain
```

## 🗄️ Database Schema

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')),
  subscription_status TEXT DEFAULT 'free',
  is_trial BOOLEAN DEFAULT FALSE,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  trial_type TEXT CHECK (trial_type IN ('teacher', 'student')),
  upload_count_this_month INTEGER DEFAULT 0,
  reddit_username TEXT,
  revenuecat_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### videos
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  uploader_id UUID REFERENCES profiles(id),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_price DECIMAL(10,2),
  algorand_txn_id TEXT,
  reddit_discussion_url TEXT,
  voice_summary_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

All tables use RLS for security:

```sql
-- Example: Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Example: Anyone can read public videos
CREATE POLICY "Anyone can read videos"
  ON videos
  FOR SELECT
  TO public
  USING (true);

-- Example: Only authorized users can upload videos
CREATE POLICY "Authenticated users can insert videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploader_id AND 
    can_upload_videos(auth.uid())
  );
```

### Database Functions

#### Upload Management
```sql
-- Check if user can upload videos
CREATE OR REPLACE FUNCTION can_upload_videos(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_subscription TEXT;
  user_trial BOOLEAN;
BEGIN
  SELECT role, subscription_status, COALESCE(is_trial, FALSE)
  INTO user_role, user_subscription, user_trial
  FROM profiles
  WHERE id = user_id;

  -- Teachers can always upload
  IF user_role = 'teacher' THEN
    RETURN TRUE;
  END IF;

  -- Creator subscription holders can upload
  IF user_subscription = 'creator' THEN
    RETURN TRUE;
  END IF;

  -- Trial users can upload
  IF user_trial = TRUE THEN
    RETURN TRUE;
  END IF;

  -- Premium students can upload (limited)
  IF user_subscription = 'premium' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

#### Trial Management
```sql
-- Start a trial for a user
CREATE OR REPLACE FUNCTION start_trial(
  user_id UUID,
  trial_type_param TEXT
)
RETURNS VOID AS $$
DECLARE
  trial_duration INTERVAL;
BEGIN
  -- Set trial duration based on type
  IF trial_type_param = 'teacher' THEN
    trial_duration := INTERVAL '30 days';
  ELSE
    trial_duration := INTERVAL '14 days';
  END IF;

  -- Update user profile with trial information
  UPDATE profiles
  SET 
    is_trial = TRUE,
    trial_start_date = NOW(),
    trial_end_date = NOW() + trial_duration,
    trial_type = trial_type_param,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### Database Migrations

Create new migrations in `supabase/migrations/`:

```sql
/*
  # Migration Title
  
  1. Description of changes
  2. New tables/columns
  3. Security policies
  4. Functions and triggers
*/

-- Your SQL here
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- columns
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "policy_name"
  ON new_table
  FOR SELECT
  TO authenticated
  USING (condition);
```

## 🎨 Component Development

### Component Structure

```typescript
// components/Example/ExampleComponent.tsx
import React, { useState, useEffect } from 'react';
import { Icon } from 'lucide-react';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onAction,
  children
}) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Component logic
  }, []);

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-gradient mb-4">{title}</h2>
      {children}
      <button 
        onClick={onAction}
        className="glass-button btn-glass-primary"
      >
        <Icon size={16} className="mr-2" />
        Action
      </button>
    </div>
  );
};

export default ExampleComponent;
```

### Design System

#### Glass Morphism Classes

```css
/* Core glass components */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.glass-button {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

#### Color System

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
```

#### Responsive Breakpoints

```css
/* Mobile First Approach */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

## 🔌 Integration Development

### Adding New AI Integrations

1. **Create Integration File**
   ```typescript
   // src/lib/integrations/newai.ts
   const API_KEY = import.meta.env.VITE_NEWAI_API_KEY;
   const BASE_URL = 'https://api.newai.com/v1';

   export const generateResponse = async (prompt: string): Promise<string | null> => {
     if (!API_KEY) {
       console.warn('NewAI API key not configured');
       return null;
     }

     try {
       const response = await fetch(`${BASE_URL}/chat/completions`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${API_KEY}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           model: 'newai-model',
           messages: [{ role: 'user', content: prompt }],
           max_tokens: 1000,
         }),
       });

       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }

       const data = await response.json();
       return data.choices[0]?.message?.content || null;
     } catch (error) {
       console.error('NewAI error:', error);
       return null;
     }
   };
   ```

2. **Add Environment Variable**
   ```env
   VITE_NEWAI_API_KEY=your_api_key_here
   ```

3. **Use in Components**
   ```typescript
   import { generateResponse } from '../lib/integrations/newai';

   const handleAIRequest = async () => {
     const result = await generateResponse(userInput);
     if (result) {
       setAIResponse(result);
     }
   };
   ```

### Error Handling Best Practices

```typescript
// Graceful degradation
const useOptionalFeature = () => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    checkFeatureAvailability()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);

  return available;
};

// Component with fallback
const FeatureComponent = () => {
  const isAvailable = useOptionalFeature();

  if (!isAvailable) {
    return <div>Feature unavailable</div>;
  }

  return <AdvancedFeature />;
};
```

## 🧪 Testing

### Unit Testing

```typescript
// components/__tests__/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ExampleComponent from '../ExampleComponent';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockAction = jest.fn();
    render(<ExampleComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// tests/integration/video.test.ts
import { supabase } from '../../src/lib/supabase';

describe('Video Integration', () => {
  it('fetches videos correctly', async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it('checks upload permissions', async () => {
    const { data, error } = await supabase
      .rpc('can_upload_videos', { user_id: 'test-user-id' });

    expect(error).toBeNull();
    expect(typeof data).toBe('boolean');
  });
});
```

### E2E Testing

```typescript
// e2e/video-upload.spec.ts
import { test, expect } from '@playwright/test';

test('video upload workflow', async ({ page }) => {
  await page.goto('/upload');
  
  // Login first
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="submit"]');
  
  // Upload video
  await page.setInputFiles('[data-testid="video-input"]', 'test-video.mp4');
  await page.fill('[data-testid="title"]', 'Test Video');
  await page.click('[data-testid="upload-button"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## 📦 Build and Deployment

### Build Process

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Deployment Options

#### Netlify (Recommended)

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   - Add all required environment variables in Netlify dashboard
   - Ensure sensitive keys are properly secured

3. **Deploy Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

#### Self-Hosting with Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t edulearn .
docker run -p 80:80 edulearn
```

## 🔧 Performance Optimization

### Code Splitting

```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const VideoPlayer = lazy(() => import('./VideoPlayer'));
const AITutorChat = lazy(() => import('./AITutorChat'));
const DeepSeekChat = lazy(() => import('./DeepSeekChat'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <VideoPlayer />
    <AITutorChat />
    <DeepSeekChat />
  </Suspense>
);
```

### Image Optimization

```typescript
// Responsive images with lazy loading
const OptimizedImage = ({ src, alt, ...props }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    {...props}
  />
);
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Audit for vulnerabilities
npm audit
```

## 🐛 Debugging

### Development Tools

```typescript
// Debug logging
const debug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### Common Issues

1. **Supabase Connection Issues**
   ```typescript
   // Check connection
   const testConnection = async () => {
     try {
       const { data, error } = await supabase.from('profiles').select('count');
       console.log('Connection test:', { data, error });
     } catch (error) {
       console.error('Connection failed:', error);
     }
   };
   ```

2. **Upload Permission Issues**
   ```typescript
   // Debug upload permissions
   const debugUploadPermissions = async (userId: string) => {
     const { data: canUpload } = await supabase
       .rpc('can_upload_videos', { user_id: userId });
     
     const { data: limits } = await supabase
       .rpc('get_upload_limits', { user_id: userId });
     
     console.log('Upload permissions:', { canUpload, limits });
   };
   ```

3. **Environment Variable Issues**
   ```typescript
   // Validate environment
   const validateEnv = () => {
     const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
     const missing = required.filter(key => !import.meta.env[key]);
     
     if (missing.length > 0) {
       console.error('Missing environment variables:', missing);
     }
   };
   ```

## 🤝 Contributing

### Code Style

```typescript
// Use TypeScript for all new code
interface ComponentProps {
  title: string;
  optional?: boolean;
}

// Use functional components with hooks
const Component: React.FC<ComponentProps> = ({ title, optional = false }) => {
  const [state, setState] = useState<string>('');
  
  // Use meaningful variable names
  const handleUserAction = useCallback(() => {
    // Implementation
  }, []);

  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  );
};
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Pull Request Guidelines

1. **Clear Description**: Explain what the PR does and why
2. **Test Coverage**: Include tests for new functionality
3. **Documentation**: Update docs if needed
4. **Screenshots**: Include screenshots for UI changes
5. **Breaking Changes**: Clearly mark any breaking changes

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)

### Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Supabase CLI](https://supabase.com/docs/reference/cli)

### Community
- [GitHub Discussions](https://github.com/yourusername/edulearn-platform/discussions)
- [Discord Server](https://discord.gg/edulearn)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/edulearn)

---

**Happy coding! 🚀**

*Need help? Join our Discord community or open an issue on GitHub.*