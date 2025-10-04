# Deployment Guide

This guide provides comprehensive instructions for deploying the E-Book Assistant Frontend application to various platforms.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] All environment variables configured
- [ ] Backend API server deployed and accessible
- [ ] Domain name ready (if using custom domain)
- [ ] SSL certificate (handled automatically by most platforms)
- [ ] Database connections tested
- [ ] Build process tested locally (`npm run build`)

## 🌐 Deployment Platforms

### 1. Vercel (Recommended)

Vercel is the optimal choice for Next.js applications with built-in optimizations.

#### Setup Steps:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from CLI**
   ```bash
   vercel
   ```

4. **Or deploy via GitHub Integration**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Enable automatic deployments

#### Environment Variables for Vercel:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Vercel Configuration (`vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### 2. Netlify

#### Setup Steps:

1. **Build Configuration**
   Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=.next
   ```

3. **Or connect GitHub repository**
   - Connect repository in Netlify dashboard
   - Set build command: `npm run build`
   - Set publish directory: `.next`

### 3. AWS Amplify

#### Setup Steps:

1. **Create `amplify.yml`**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

2. **Deploy via AWS Console**
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

### 4. Railway

#### Setup Steps:

1. **Create `railway.json`**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy via Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

### 5. DigitalOcean App Platform

#### Setup Steps:

1. **Create `.do/app.yaml`**
   ```yaml
   name: e-book-assistant-fe
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/e-book-assistant-fe
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     routes:
     - path: /
     envs:
     - key: NODE_ENV
       value: production
   ```

### 6. Docker Deployment

#### Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Update `next.config.js` for Docker:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone', // Add this for Docker
};

module.exports = nextConfig;
```

#### Build and Run Docker Container:
```bash
# Build image
docker build -t e-book-assistant-fe .

# Run container
docker run -p 3000:3000 e-book-assistant-fe
```

## 🔧 Environment Variables

### Required Variables:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables:
```env
NEXT_PUBLIC_APP_NAME=E-Book Assistant
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=production
```

## 🚀 Build Optimization

### 1. Enable Static Export (if applicable):
```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

### 2. Bundle Analysis:
```bash
npm install --save-dev @next/bundle-analyzer
```

### 3. Performance Monitoring:
```bash
npm install --save-dev @vercel/analytics
```

## 🔍 Health Checks

### Create Health Check Endpoint:
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  });
}
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics:
```bash
npm install @vercel/analytics
```

### 2. Error Tracking with Sentry:
```bash
npm install @sentry/nextjs
```

### 3. Performance Monitoring:
```bash
npm install @vercel/speed-insights
```

## 🔒 Security Considerations

### 1. Content Security Policy:
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 2. Environment Variable Security:
- Never commit `.env` files
- Use platform-specific secret management
- Rotate API keys regularly
- Use HTTPS in production

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Environment Variables**:
   - Ensure all required variables are set
   - Check variable naming (case-sensitive)
   - Verify API endpoints are accessible

3. **Performance Issues**:
   - Enable compression
   - Optimize images
   - Use CDN for static assets
   - Implement caching strategies

4. **CORS Issues**:
   - Configure backend CORS settings
   - Check API URL configuration
   - Verify domain whitelist

### Debug Commands:
```bash
# Check build locally
npm run build

# Analyze bundle size
npm run build && npm run analyze

# Test production build
npm run build && npm run start
```

## 📈 Post-Deployment

### 1. Verify Deployment:
- [ ] Application loads correctly
- [ ] All routes are accessible
- [ ] API connections work
- [ ] Authentication functions properly
- [ ] File uploads work
- [ ] Chat functionality operates

### 2. Performance Testing:
- [ ] Page load times are acceptable
- [ ] Mobile responsiveness works
- [ ] Cross-browser compatibility
- [ ] Error handling functions

### 3. Monitoring Setup:
- [ ] Analytics tracking active
- [ ] Error monitoring configured
- [ ] Performance metrics collected
- [ ] Uptime monitoring enabled

## 🔄 CI/CD Pipeline

### GitHub Actions Example:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

**For additional support, refer to the platform-specific documentation or create an issue in the repository.**
