# Supabase Storage Verification & Configuration

## ✅ Storage Buckets Verified

Using MCP Supabase tools, I've verified the following buckets exist in your Supabase project:

### Existing Buckets:
1. **IMAGES** - Public bucket for image uploads
2. **VIDEOS** - Public bucket for video uploads

Both buckets are configured as **public** (no authentication required to access files).

## 🔧 Changes Made

### 1. Fixed Image Upload Route (`app/api/upload/route.ts`)
- **Before**: Used non-existent `uploads` bucket (default)
- **After**: Uses `IMAGES` bucket (matches Supabase configuration)
- **Organization**: Files are now organized by type:
  - `articles/` - Article featured images
  - `products/` - Product images
  - `courses/` - Course images
  - `gallery/` - Gallery images
  - `general/` - Default fallback

### 2. Fixed Video Upload Route (`app/api/upload/video/route.ts`)
- **Before**: Used local filesystem storage
- **After**: Uses Supabase `VIDEOS` bucket
- **Organization**: Videos are organized by type:
  - `videos/` - Video uploads
  - `courses/` - Course videos
  - `general/` - Default fallback

### 3. Updated Admin Pages
All admin upload pages now pass the correct `type` parameter:
- `app/admin/articles/new/page.tsx` → `?type=articles`
- `app/admin/products/new/page.tsx` → `?type=products`
- `app/admin/courses/new/page.tsx` → `?type=courses`
- `app/admin/gallery/new/page.tsx` → `?type=gallery`
- `app/admin/videos/new/page.tsx` → `?type=videos`

## 📁 File Organization Structure

### IMAGES Bucket:
```
IMAGES/
├── articles/
│   └── [timestamp]_[filename]
├── products/
│   └── [timestamp]_[filename]
├── courses/
│   └── [timestamp]_[filename]
├── gallery/
│   └── [timestamp]_[filename]
└── general/
    └── [timestamp]_[filename]
```

### VIDEOS Bucket:
```
VIDEOS/
├── videos/
│   └── [timestamp]_[filename]
├── courses/
│   └── [timestamp]_[filename]
└── general/
    └── [timestamp]_[filename]
```

## 🔐 Environment Variables Required

Make sure these are set in your `.env` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tmhtljxhmtkrwpmyneal.supabase.co
SUPABASE_URL=https://tmhtljxhmtkrwpmyneal.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Override bucket names (defaults to IMAGES and VIDEOS)
SUPABASE_STORAGE_BUCKET=IMAGES
```

## ✅ Verification Checklist

- [x] Verified `IMAGES` bucket exists and is public
- [x] Verified `VIDEOS` bucket exists and is public
- [x] Updated image upload route to use `IMAGES` bucket
- [x] Updated video upload route to use `VIDEOS` bucket
- [x] Added type-based folder organization
- [x] Updated all admin pages to pass correct type parameters
- [x] Maintained fallback to local storage if Supabase not configured

## 🧪 Testing

To verify uploads are working correctly:

1. **Test Image Upload**:
   - Go to `/admin/articles/new`
   - Upload an image
   - Check Supabase Storage → `IMAGES` bucket → `articles/` folder
   - Verify the URL is accessible

2. **Test Video Upload**:
   - Go to `/admin/videos/new`
   - Upload a video
   - Check Supabase Storage → `VIDEOS` bucket → `videos/` folder
   - Verify the URL is accessible

3. **Check Prisma Database**:
   - Verify that URLs stored in Prisma point to Supabase Storage URLs
   - Format: `https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]`

## 📝 Notes

- **Prisma Integration**: Prisma stores the full Supabase Storage URL in the database (e.g., `featuredImage`, `image`, `images`, `thumbnail`, `uploadUrl` fields)
- **Public Access**: Both buckets are public, so URLs are directly accessible without authentication
- **Fallback**: If Supabase credentials are not configured, the system falls back to local filesystem storage (`public/uploads/`)
- **File Naming**: Files are named with timestamp prefix to ensure uniqueness: `[timestamp]_[sanitized-filename]`

## 🚨 Important

If you see errors about bucket not existing:
1. The code will attempt to create the bucket automatically (if using service role key)
2. Make sure `SUPABASE_SERVICE_ROLE_KEY` has storage admin permissions
3. Check Supabase dashboard → Storage → Buckets to verify buckets exist

