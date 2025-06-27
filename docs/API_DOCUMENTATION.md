# 📚 EduLearn API Documentation

## Overview

EduLearn provides a comprehensive REST API built on Supabase that allows developers to integrate educational content, user management, and premium features into their applications.

## Base URL

```
https://your-project-id.supabase.co/rest/v1/
```

## Authentication

All API requests require authentication using Supabase's authentication system.

### Headers

```http
Authorization: Bearer YOUR_JWT_TOKEN
apikey: YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

## Endpoints

### 🎥 Videos

#### Get All Videos

```http
GET /videos
```

**Query Parameters:**
- `subject` (optional): Filter by subject
- `grade_level` (optional): Filter by grade level
- `is_premium` (optional): Filter premium content
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Introduction to Algebra",
      "description": "Learn basic algebra concepts...",
      "subject": "Mathematics",
      "grade_level": "High School (9-12)",
      "duration": 1200,
      "view_count": 15420,
      "is_premium": false,
      "premium_price": null,
      "video_url": "https://...",
      "thumbnail_url": "https://...",
      "voice_summary_url": "https://...",
      "algorand_txn_id": "ALGO123...",
      "reddit_discussion_url": "https://reddit.com/...",
      "created_at": "2024-01-15T10:30:00Z",
      "uploader": {
        "full_name": "Prof. Sarah Johnson",
        "role": "teacher"
      }
    }
  ]
}
```

#### Get Single Video

```http
GET /videos/{id}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Introduction to Algebra",
    "description": "Learn basic algebra concepts...",
    "subject": "Mathematics",
    "grade_level": "High School (9-12)",
    "duration": 1200,
    "view_count": 15420,
    "is_premium": false,
    "premium_price": null,
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "voice_summary_url": "https://...",
    "algorand_txn_id": "ALGO123...",
    "reddit_discussion_url": "https://reddit.com/...",
    "created_at": "2024-01-15T10:30:00Z",
    "uploader": {
      "full_name": "Prof. Sarah Johnson",
      "role": "teacher"
    }
  }
}
```

#### Create Video (Authenticated Users Only)

```http
POST /videos
```

**Request Body:**
```json
{
  "title": "New Video Title",
  "description": "Video description...",
  "subject": "Mathematics",
  "grade_level": "High School (9-12)",
  "video_url": "https://...",
  "thumbnail_url": "https://...",
  "duration": 1200,
  "is_premium": false,
  "premium_price": null
}
```

**Upload Requirements:**
- User must be authenticated
- User must have upload permissions (checked via `can_upload_videos()` function)
- File size limits based on subscription tier
- Monthly upload limits enforced

#### Update Video

```http
PATCH /videos/{id}
```

**Authorization:** Only video uploader can update their own videos

#### Delete Video

```http
DELETE /videos/{id}
```

**Authorization:** Only video uploader can delete their own videos

### 👤 User Profiles

#### Get Current User Profile

```http
GET /profiles?id=eq.{user_id}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "student",
      "subscription_status": "free",
      "is_trial": false,
      "trial_start_date": null,
      "trial_end_date": null,
      "trial_type": null,
      "upload_count_this_month": 2,
      "reddit_username": "johndoe",
      "revenuecat_user_id": "rc_user_123",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Update Profile

```http
PATCH /profiles?id=eq.{user_id}
```

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "reddit_username": "new_username"
}
```

### 💬 Comments

#### Get Video Comments

```http
GET /comments?video_id=eq.{video_id}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "video_id": "uuid",
      "user_id": "uuid",
      "content": "Great video!",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "user": {
        "full_name": "Student Name"
      }
    }
  ]
}
```

#### Create Comment

```http
POST /comments
```

**Request Body:**
```json
{
  "video_id": "uuid",
  "content": "This is a great video!"
}
```

### 🏫 Classrooms

#### Get User's Classrooms

```http
GET /classrooms?teacher_id=eq.{user_id}
```

#### Create Classroom (Teachers Only)

```http
POST /classrooms
```

**Request Body:**
```json
{
  "name": "Algebra 101",
  "code": "ALG101"
}
```

#### Join Classroom (Students)

```http
POST /classroom_students
```

**Request Body:**
```json
{
  "classroom_id": "uuid"
}
```

### ⏰ Video Timestamps

#### Get Video Timestamps

```http
GET /video_timestamps?video_id=eq.{video_id}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "video_id": "uuid",
      "title": "Introduction",
      "time_seconds": 0,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Database Functions

### Upload Management

#### Check Upload Permissions
```sql
SELECT can_upload_videos('user_id');
```

#### Get Upload Limits
```sql
SELECT get_upload_limits('user_id');
```

#### Check Monthly Upload Limit
```sql
SELECT check_upload_limit('user_id');
```

### Trial Management

#### Start Trial
```sql
SELECT start_trial('user_id', 'teacher'); -- or 'student'
```

#### Check Trial Status
```sql
SELECT is_trial_expired('user_id');
```

#### End Trial
```sql
SELECT end_trial('user_id');
```

### Subscription Management

#### Promote to Creator
```sql
SELECT promote_to_creator('user_id');
```

## Real-time Subscriptions

EduLearn supports real-time subscriptions using Supabase's real-time features.

### Subscribe to Comments

```javascript
const subscription = supabase
  .channel('comments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'comments',
    filter: `video_id=eq.${videoId}`
  }, (payload) => {
    console.log('New comment:', payload.new);
  })
  .subscribe();
```

### Subscribe to Video Updates

```javascript
const subscription = supabase
  .channel('videos')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'videos'
  }, (payload) => {
    console.log('Video updated:', payload.new);
  })
  .subscribe();
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (often due to RLS policies)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": {
    "message": "Error description",
    "details": "Additional error details",
    "hint": "Suggestion for fixing the error"
  }
}
```

### Common Upload Errors

- `Monthly upload limit exceeded` - User has reached their monthly upload quota
- `new row violates row-level security policy` - User doesn't have permission to upload
- `File too large` - File exceeds size limit for user's subscription tier

## Rate Limiting

API requests are rate-limited based on subscription tier:

- **Free tier**: 100 requests per minute
- **Premium tier**: 1000 requests per minute
- **Creator tier**: 5000 requests per minute

## Upload Limits by Subscription

### Free Users
- **Monthly Uploads**: 5 videos
- **Max File Size**: 100MB
- **Formats**: MP4, AVI, MOV
- **Quality**: SD (480p)

### Premium Users ($9.99/month)
- **Monthly Uploads**: 15 videos
- **Max File Size**: 250MB
- **Formats**: MP4, AVI, MOV, MKV, WebM
- **Quality**: HD (720p)

### Creator/Teacher Users ($19.99/month or Teacher role)
- **Monthly Uploads**: Unlimited
- **Max File Size**: 500MB
- **Formats**: All supported formats
- **Quality**: Full HD+ (1080p+)
- **Monetization**: Enabled

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project-id.supabase.co',
  'your-anon-key'
);

// Get videos with upload permission check
const { data, error } = await supabase
  .from('videos')
  .select('*')
  .eq('subject', 'Mathematics');

// Check if user can upload
const { data: canUpload } = await supabase
  .rpc('can_upload_videos', { user_id: userId });
```

### Python

```bash
pip install supabase
```

```python
from supabase import create_client, Client

url = "https://your-project-id.supabase.co"
key = "your-anon-key"
supabase: Client = create_client(url, key)

# Get videos
response = supabase.table('videos').select('*').eq('subject', 'Mathematics').execute()

# Check upload permissions
can_upload = supabase.rpc('can_upload_videos', {'user_id': user_id}).execute()
```

## Integration Examples

### Voice AI Integration

```javascript
// Generate voice summary for a video
const generateVoiceSummary = async (videoId) => {
  const { data: video } = await supabase
    .from('videos')
    .select('title, description')
    .eq('id', videoId)
    .single();
    
  const audioUrl = await generateSpeech(
    `${video.title}: ${video.description}`,
    'voice-id'
  );
  
  // Update video with voice summary URL
  await supabase
    .from('videos')
    .update({ voice_summary_url: audioUrl })
    .eq('id', videoId);
};
```

### Premium Content Check

```javascript
// Check if user has access to premium content
const checkPremiumAccess = async (userId, videoId) => {
  const { data: video } = await supabase
    .from('videos')
    .select('is_premium')
    .eq('id', videoId)
    .single();
    
  if (!video.is_premium) return true;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, is_trial')
    .eq('id', userId)
    .single();
    
  return ['premium', 'creator'].includes(profile.subscription_status) || 
         profile.is_trial;
};
```

### Upload with Validation

```javascript
// Upload video with proper validation
const uploadVideo = async (videoData, userId) => {
  // Check upload permissions
  const { data: canUpload } = await supabase
    .rpc('can_upload_videos', { user_id: userId });
    
  if (!canUpload) {
    throw new Error('Upload permission denied');
  }
  
  // Check upload limits
  const { data: withinLimits } = await supabase
    .rpc('check_upload_limit', { user_id: userId });
    
  if (!withinLimits) {
    throw new Error('Monthly upload limit exceeded');
  }
  
  // Upload video
  const { data, error } = await supabase
    .from('videos')
    .insert({
      ...videoData,
      uploader_id: userId
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};
```

## Webhooks

EduLearn supports webhooks for real-time notifications:

### Video Upload Webhook

```http
POST /webhooks/video-upload
```

**Payload:**
```json
{
  "event": "video.uploaded",
  "data": {
    "video_id": "uuid",
    "uploader_id": "uuid",
    "title": "New Video Title",
    "subject": "Mathematics",
    "is_premium": false
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Subscription Change Webhook

```http
POST /webhooks/subscription-change
```

**Payload:**
```json
{
  "event": "subscription.updated",
  "data": {
    "user_id": "uuid",
    "old_status": "free",
    "new_status": "premium"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Testing

### Postman Collection

Download our [Postman collection](./postman/edulearn-api.json) for easy API testing.

### cURL Examples

```bash
# Get all videos
curl -X GET "https://your-project-id.supabase.co/rest/v1/videos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY"

# Create a comment
curl -X POST "https://your-project-id.supabase.co/rest/v1/comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"video_id": "uuid", "content": "Great video!"}'

# Check upload permissions
curl -X POST "https://your-project-id.supabase.co/rest/v1/rpc/can_upload_videos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "uuid"}'
```

## Support

For API support and questions:

- **Documentation**: [https://docs.edulearn.app](https://docs.edulearn.app)
- **GitHub Issues**: [https://github.com/yourusername/edulearn-platform/issues](https://github.com/yourusername/edulearn-platform/issues)
- **Discord**: [https://discord.gg/edulearn](https://discord.gg/edulearn)
- **Email**: api-support@edulearn.app

---

**Happy coding! 🚀**