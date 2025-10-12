# Supabase Database Schema Documentation

> **Project**: AIA Product Compass Hub
> **Database Type**: PostgreSQL (Supabase)
> **Last Updated**: 2025-10-06
> **Purpose**: Comprehensive schema documentation for shared database access

---

## 🎯 Important: Shared Database Architecture

This Supabase database is designed to be accessed by **multiple codebases**:
1. **Current Codebase**: AIA Product Compass Hub (React/TypeScript frontend)
2. **Additional Codebase**: [To be created] - will connect to the same database

### Key Considerations for Shared Access:
- Both codebases will use the **same Supabase project** and connection credentials
- Tables are shared across applications - changes in one affect the other
- Use Row Level Security (RLS) policies for data isolation where needed
- Coordinate schema migrations across all connected codebases
- Consider using application-level prefixes or namespacing for app-specific tables (if needed)

### Connection Configuration:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 📊 Database Overview

**Total Tables**: 31
**Total Functions**: 15
**Total Storage Buckets**: 1 (knowledge-files)

### Table Categories:
1. **User Management** (7 tables)
2. **Products & Content** (4 tables)
3. **Learning & Gamification** (5 tables)
4. **User Interactions** (2 tables)
5. **Roleplay System** (6 tables)
6. **Mentor System** (2 tables)
7. **Booking System** (2 tables)
8. **App Structure** (3 tables)

---

## 🗄️ Table Definitions

### 1. User Management Tables

#### `profiles`
User profile information and gamification data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `email` | text | Yes | - | User email |
| `first_name` | text | Yes | - | First name |
| `last_name` | text | Yes | - | Last name |
| `display_name` | text | Yes | - | Display name |
| `avatar_url` | text | Yes | - | Profile avatar URL |
| `address_line_1` | text | Yes | - | Address line 1 |
| `address_line_2` | text | Yes | - | Address line 2 |
| `city` | text | Yes | - | City |
| `postcode` | text | Yes | - | Postal code |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |
| `first_login` | boolean | Yes | true | First login flag |
| `last_active_date` | timestamp | Yes | - | Last activity date |
| `password_changed_at` | timestamp | Yes | - | Password change timestamp |
| `total_xp` | integer | Yes | 0 | Total experience points |
| `current_level` | integer | Yes | 1 | Current gamification level |
| `streak_days` | integer | Yes | 0 | Consecutive login days |

**Relationships**: Links to auth.users via `user_id`

---

#### `user_roles`
User role assignments (for basic role-based access).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `role` | text | No | 'user' | Role name (user, admin, etc.) |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Common Roles**: `user`, `admin`, `mentor`

---

#### `user_admin_roles`
Administrative role assignments for elevated permissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `admin_role` | text | No | 'user' | Admin role level |
| `granted_by` | uuid | Yes | - | User who granted the role |
| `granted_at` | timestamp | No | now() | When role was granted |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Admin Roles**: `user`, `admin`, `super_admin` (master admin)

---

#### `user_access_tiers`
User tier assignments for content access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `tier_level` | text | No | 'basic' | Tier level |
| `granted_by` | uuid | Yes | - | User who granted the tier |
| `granted_at` | timestamp | No | now() | When tier was granted |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Tier Levels**: `basic`, `premium`, `enterprise`

---

#### `user_tiers`
Legacy tier table (being phased out in favor of user_access_tiers).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `tier_level` | text | No | 'basic' | Tier level |
| `granted_by` | uuid | Yes | - | User who granted the tier |
| `granted_at` | timestamp | No | now() | When tier was granted |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

---

#### `user_approval_requests`
Pending user registration requests requiring admin approval.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `email` | text | No | - | Requested email |
| `first_name` | text | Yes | - | First name |
| `last_name` | text | Yes | - | Last name |
| `company` | text | Yes | - | Company name |
| `reason` | text | Yes | - | Registration reason |
| `status` | text | No | 'pending' | Request status |
| `stored_password` | text | Yes | - | Encrypted password |
| `clerk_user_id` | text | Yes | - | Legacy Clerk ID |
| `requested_at` | timestamp | No | now() | Request timestamp |
| `reviewed_at` | timestamp | Yes | - | Review timestamp |
| `reviewed_by` | uuid | Yes | - | Admin who reviewed |
| `notes` | text | Yes | - | Admin notes |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Status Values**: `pending`, `approved`, `rejected`

---

#### `tier_permissions`
Defines what resources each tier level can access.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `tier_level` | text | No | - | Tier level |
| `access_type` | text | No | - | Type of access (page, section, tab) |
| `resource_id` | text | No | - | Resource identifier |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Access Types**: `page`, `section`, `tab`

---

### 2. Products & Content Tables

#### `categories`
Product categories/modules organization.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Category name |
| `description` | text | Yes | - | Category description |
| `useful_links` | jsonb | Yes | - | Category-level useful links |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Examples**: "CMFAS", "Learning Modules", "Insurance Products"

---

#### `products`
Product information and training content.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | - | Primary key (custom ID) |
| `category_id` | uuid | No | - | References categories |
| `title` | text | No | - | Product title |
| `description` | text | Yes | - | Product description |
| `tags` | text[] | Yes | - | Searchable tags |
| `highlights` | text[] | Yes | - | Key highlights |
| `useful_links` | jsonb | Yes | - | Product useful links |
| `training_videos` | jsonb | Yes | - | Training video data |
| `assistant_id` | text | Yes | - | OpenAI Assistant ID |
| `assistant_instructions` | text | Yes | - | AI assistant system prompt |
| `custom_gpt_link` | text | Yes | - | Custom GPT link |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Relationships**: Foreign key to `categories(id)`

**Training Videos JSON Structure**:
```json
[
  {
    "id": "video-1",
    "title": "Introduction",
    "url": "https://...",
    "duration": "10:30",
    "order": 1
  }
]
```

**Useful Links JSON Structure**:
```json
{
  "folders": [
    {
      "id": "folder-1",
      "name": "Documentation",
      "links": [
        {"title": "Guide", "url": "https://..."}
      ]
    }
  ]
}
```

---

#### `files`
Uploaded files and documents.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `category_id` | uuid | No | - | References categories |
| `name` | text | No | - | File name |
| `file_path` | text | No | - | Storage path |
| `file_type` | text | No | - | MIME type |
| `file_size` | integer | No | - | File size in bytes |
| `created_at` | timestamp | No | now() | Upload timestamp |

**Relationships**: Foreign key to `categories(id)`

---

#### `file_embeddings`
Vector embeddings for semantic search (AI-powered search).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `file_id` | uuid | No | - | References files |
| `content` | text | No | - | Text content chunk |
| `embedding` | jsonb | No | - | Vector embedding |
| `processed_at` | timestamp | No | now() | Processing timestamp |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Relationships**: Foreign key to `files(id)`

---

### 3. Learning & Gamification Tables

#### `learning_progress`
Tracks user learning achievements and XP earned.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `category_id` | uuid | No | - | Category completed |
| `product_id` | uuid | Yes | - | Product completed |
| `progress_type` | text | No | - | Type of progress |
| `xp_earned` | integer | Yes | 0 | XP earned |
| `completed_at` | timestamp | No | now() | Completion timestamp |

**Progress Types**: `video_watched`, `quiz_completed`, `module_finished`

---

#### `quiz_attempts`
User quiz completion records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `product_id` | uuid | No | - | Product quiz |
| `score` | integer | No | - | Quiz score |
| `total_questions` | integer | No | - | Total questions |
| `xp_earned` | integer | Yes | 0 | XP earned |
| `completed_at` | timestamp | No | now() | Completion timestamp |

---

#### `achievements`
Available achievements and badges.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Achievement name |
| `description` | text | No | - | Achievement description |
| `icon` | text | No | - | Icon identifier |
| `category` | text | No | - | Achievement category |
| `requirement_type` | text | No | - | Type of requirement |
| `requirement_value` | integer | No | - | Required value |
| `xp_reward` | integer | Yes | 0 | XP reward |
| `badge_color` | text | Yes | - | Badge color |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Requirement Types**: `videos_watched`, `quizzes_completed`, `total_xp`, `streak_days`

---

#### `user_achievements`
User-earned achievements tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `achievement_id` | uuid | No | - | References achievements |
| `earned_at` | timestamp | No | now() | When earned |

**Relationships**: Foreign key to `achievements(id)`

---

#### `video_progress`
Tracks user video watch progress.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `product_id` | uuid | No | - | Product ID |
| `video_id` | text | No | - | Video identifier |
| `watch_time_seconds` | integer | Yes | 0 | Time watched |
| `completion_percentage` | integer | Yes | 0 | Completion % |
| `completed` | boolean | No | false | Completed flag |
| `completed_at` | timestamp | Yes | - | Completion timestamp |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

---

### 4. User Interactions Tables

#### `user_bookmarks`
User-saved product bookmarks.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `product_id` | uuid | No | - | Bookmarked product |
| `created_at` | timestamp | No | now() | Bookmark timestamp |

---

#### `user_notes`
User personal notes on products.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `product_id` | uuid | No | - | Product ID |
| `content` | text | No | - | Note content |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

---

### 5. Roleplay System Tables

#### `roleplay_sessions`
Video roleplay practice sessions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `scenario_title` | text | No | - | Scenario title |
| `scenario_category` | text | No | - | Scenario category |
| `scenario_difficulty` | text | No | - | Difficulty level |
| `tavus_conversation_id` | text | Yes | - | Tavus API conversation ID |
| `started_at` | timestamp | No | now() | Session start |
| `ended_at` | timestamp | Yes | - | Session end |
| `duration_seconds` | integer | Yes | - | Total duration |
| `recording_status` | text | Yes | - | Recording status |
| `recording_started_at` | timestamp | Yes | - | Recording start |
| `recording_completed_at` | timestamp | Yes | - | Recording completion |
| `video_url` | text | Yes | - | Recorded video URL |
| `video_duration_seconds` | integer | Yes | - | Video duration |
| `transcript` | jsonb | Yes | - | Full transcript |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Difficulty Levels**: `beginner`, `intermediate`, `advanced`

---

#### `roleplay_feedback`
AI-generated feedback on roleplay sessions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `session_id` | uuid | No | - | References roleplay_sessions |
| `overall_score` | integer | No | - | Overall score (0-100) |
| `communication_score` | integer | No | - | Communication score |
| `product_knowledge_score` | integer | No | - | Product knowledge score |
| `active_listening_score` | integer | No | - | Active listening score |
| `objection_handling_score` | integer | No | - | Objection handling score |
| `small_talk_score` | integer | Yes | - | Small talk score |
| `pain_point_identification_score` | integer | Yes | - | Pain point identification |
| `practice_score` | integer | Yes | - | Practice effectiveness |
| `specific_feedback` | text | No | - | Detailed feedback text |
| `conversation_summary` | text | Yes | - | Session summary |
| `strengths` | text[] | Yes | - | Identified strengths |
| `improvement_areas` | text[] | Yes | - | Areas for improvement |
| `coaching_points` | text[] | Yes | - | Coaching recommendations |
| `follow_up_questions` | text[] | Yes | - | Suggested follow-ups |
| `tone_analysis` | text[] | Yes | - | Tone observations |
| `tone_detailed_analysis` | text | Yes | - | Detailed tone analysis |
| `body_language_analysis` | text | Yes | - | Body language notes |
| `visual_presence_analysis` | text[] | Yes | - | Visual presence notes |
| `pronunciation_feedback` | text | Yes | - | Pronunciation notes |
| `conversation_flow_summary` | jsonb | Yes | - | Flow analysis |
| `detailed_rubric_feedback` | jsonb | Yes | - | Rubric breakdown |
| `previous_attempt_comparison` | text | Yes | - | Comparison to previous |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Relationships**: Foreign key to `roleplay_sessions(id)`

---

#### `roleplay_performance_metrics`
Granular performance metrics for sessions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `session_id` | uuid | No | - | References roleplay_sessions |
| `metric_name` | text | No | - | Metric name |
| `metric_value` | numeric | No | - | Metric value |
| `metric_description` | text | Yes | - | Metric description |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Relationships**: Foreign key to `roleplay_sessions(id)`

---

#### `conversation_transcripts`
Real-time conversation transcripts from roleplay.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `session_id` | uuid | No | - | References roleplay_sessions |
| `speaker` | text | No | - | Speaker (user/ai) |
| `text` | text | No | - | Spoken text |
| `timestamp_offset` | integer | No | - | Offset in milliseconds |
| `confidence` | numeric | Yes | - | Transcription confidence |
| `filler_words` | text[] | Yes | - | Detected filler words |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Relationships**: Foreign key to `roleplay_sessions(id)`

---

#### `coaching_events`
Coaching interventions during roleplay.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `session_id` | uuid | No | - | References roleplay_sessions |
| `event_type` | text | No | - | Event type |
| `message` | text | No | - | Coaching message |
| `timestamp_offset` | integer | No | - | Offset in milliseconds |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Event Types**: `tip`, `warning`, `encouragement`, `correction`

**Relationships**: Foreign key to `roleplay_sessions(id)`

---

#### `speech_metrics`
Speech analysis metrics for roleplay sessions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `session_id` | uuid | No | - | References roleplay_sessions |
| `timestamp_offset` | integer | No | - | Offset in milliseconds |
| `speaking_time_ms` | integer | Yes | - | Speaking duration |
| `pause_duration_ms` | integer | Yes | - | Pause duration |
| `words_per_minute` | integer | Yes | - | Speaking pace |
| `filler_word_count` | integer | Yes | - | Filler word count |
| `energy_level` | numeric | Yes | - | Voice energy level |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Relationships**: Foreign key to `roleplay_sessions(id)`

---

### 6. Mentor System Tables

#### `mentor_reviews`
Mentor review assignments and feedback.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `session_id` | uuid | No | - | References roleplay_sessions |
| `mentor_id` | uuid | No | - | Assigned mentor user ID |
| `status` | text | No | 'pending' | Review status |
| `assigned_at` | timestamp | No | now() | Assignment timestamp |
| `started_at` | timestamp | Yes | - | Review start |
| `completed_at` | timestamp | Yes | - | Review completion |
| `mentor_score` | integer | Yes | - | Mentor's score |
| `mentor_feedback` | text | Yes | - | Written feedback |
| `mentor_notes` | jsonb | Yes | - | Structured notes |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Status Values**: `pending`, `in_progress`, `completed`

**Relationships**: Foreign key to `roleplay_sessions(id)`

---

#### `mentor_annotations`
Time-coded annotations from mentors on videos.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `review_id` | uuid | No | - | References mentor_reviews |
| `timestamp_seconds` | integer | No | - | Video timestamp |
| `annotation_type` | text | No | - | Annotation type |
| `content` | text | No | - | Annotation content |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Annotation Types**: `positive`, `negative`, `suggestion`, `note`

**Relationships**: Foreign key to `mentor_reviews(id)`

---

### 7. Booking System Tables

#### `bookings`
Service booking records (cleaning service example).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | References auth.users |
| `selected_plan` | text | No | - | Selected plan |
| `frequency` | text | No | - | Booking frequency |
| `duration` | text | No | - | Service duration |
| `bedrooms` | text | Yes | - | Number of bedrooms |
| `bathrooms` | text | Yes | - | Number of bathrooms |
| `cleaning_date` | date | No | - | Scheduled date |
| `start_time` | text | No | - | Start time |
| `has_pet` | boolean | Yes | - | Has pets |
| `need_ironing` | boolean | Yes | - | Needs ironing |
| `need_decluttering` | boolean | Yes | - | Needs decluttering |
| `help_needed` | boolean | Yes | - | Help needed flag |
| `language` | text | No | 'en' | Language preference |
| `amount_cents` | integer | Yes | - | Amount in cents |
| `currency` | text | Yes | 'SGD' | Currency |
| `payment_status` | text | Yes | - | Payment status |
| `stripe_payment_intent_id` | text | Yes | - | Stripe payment ID |
| `booking_source` | text | Yes | - | Booking source |
| `completed_at` | timestamp | Yes | - | Completion timestamp |
| `client_ip` | inet | Yes | - | Client IP address |
| `user_agent` | text | Yes | - | User agent string |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

---

#### `booking_audit_log`
Audit trail for booking changes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `booking_id` | uuid | Yes | - | References bookings |
| `user_id` | uuid | Yes | - | User who made change |
| `action` | text | No | - | Action performed |
| `old_values` | jsonb | Yes | - | Previous values |
| `new_values` | jsonb | Yes | - | New values |
| `client_ip` | inet | Yes | - | Client IP address |
| `user_agent` | text | Yes | - | User agent string |
| `created_at` | timestamp | No | now() | Creation timestamp |

**Relationships**: Foreign key to `bookings(id)`

---

### 8. App Structure Tables

#### `app_pages`
Application page definitions for dynamic routing.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | - | Primary key (custom ID) |
| `name` | text | No | - | Page name |
| `category` | text | No | - | Page category |
| `path` | text | No | - | URL path |
| `description` | text | Yes | - | Page description |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

---

#### `app_tabs`
Tab definitions within pages.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | - | Primary key (custom ID) |
| `page_id` | uuid | No | - | References app_pages |
| `name` | text | No | - | Tab name |
| `tab_order` | integer | Yes | - | Display order |
| `description` | text | Yes | - | Tab description |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

**Relationships**: Foreign key to `app_pages(id)`

---

#### `app_sections`
Section definitions for content organization.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | - | Primary key (custom ID) |
| `name` | text | No | - | Section name |
| `category` | text | No | - | Section category |
| `description` | text | Yes | - | Section description |
| `created_at` | timestamp | No | now() | Creation timestamp |
| `updated_at` | timestamp | No | now() | Last update timestamp |

---

## 🔧 Database Functions (RPC)

### User Management Functions

#### `get_user_access_tier(user_id uuid)`
Returns the access tier for a user.

**Returns**: `text` - Tier level (basic, premium, enterprise)

**Usage**:
```typescript
const { data } = await supabase.rpc('get_user_access_tier', { user_id: userId })
```

---

#### `get_user_admin_role(user_id uuid)`
Returns the admin role for a user.

**Returns**: `text` - Admin role (user, admin, super_admin)

**Usage**:
```typescript
const { data } = await supabase.rpc('get_user_admin_role', { user_id: userId })
```

---

#### `get_user_tier(user_id uuid)`
Legacy function - returns user tier.

**Returns**: `text` - Tier level

---

#### `has_admin_role(user_id uuid, required_role text)`
Checks if user has specific admin role.

**Returns**: `boolean`

**Usage**:
```typescript
const { data } = await supabase.rpc('has_admin_role', {
  user_id: userId,
  required_role: 'admin'
})
```

---

#### `has_role(_user_id uuid, _role text)`
Checks if user has specific role.

**Returns**: `boolean`

---

#### `has_tier_access(user_id uuid, required_tier text)`
Checks if user has access tier or checks resource access.

**Overloads**:
1. `(user_id uuid, required_tier text)` - Simple tier check
2. `(user_id uuid, resource_id text, access_type text)` - Resource access check

**Returns**: `boolean`

---

#### `user_has_any_role(user_id uuid)`
Checks if user has any role assigned.

**Returns**: `boolean`

---

### User Approval Functions

#### `approve_user_request(request_id uuid)`
Legacy approval function.

**Returns**: `void`

---

#### `approve_user_request_simple(request_id uuid, new_user_id uuid, approving_user_id uuid?)`
Approves user signup request and provisions account.

**Returns**: `void`

---

#### `reset_approval_request(_email text)`
Resets approval request for re-submission.

**Returns**: `json` - Status object

---

#### `verify_user_account_status(_email text)`
Checks account status for email.

**Returns**: `json` - Account status information

---

### User Provisioning Functions

#### `assign_master_admin(user_email text)`
Assigns master admin role to user by email.

**Returns**: `void`

---

#### `assign_master_admin_to_clerk_user(clerk_user_id text, user_email text)`
Legacy Clerk-based admin assignment.

**Returns**: `void`

---

#### `upgrade_user_to_master_admin(target_user_id uuid)`
Upgrades user to master admin role.

**Returns**: `void`

---

### Password Management Functions

#### `get_signup_password(user_email text)`
Retrieves stored signup password for user.

**Returns**: `text` - Encrypted password

---

#### `store_signup_password(user_email text, user_password text)`
Stores password during signup process.

**Returns**: `void`

---

### Roleplay Functions

#### `create_roleplay_session(scenario_title text, scenario_category text, scenario_difficulty text, tavus_conversation_id text)`
Creates new roleplay session.

**Returns**: `uuid` - Session ID

**Usage**:
```typescript
const { data: sessionId } = await supabase.rpc('create_roleplay_session', {
  scenario_title: 'Client Objection Handling',
  scenario_category: 'sales',
  scenario_difficulty: 'intermediate',
  tavus_conversation_id: 'tavus_conv_123'
})
```

---

#### `update_roleplay_session(session_id uuid, end_time text, duration integer)`
Updates roleplay session with completion data.

**Returns**: `void`

---

## 📦 Storage Buckets

### `knowledge-files`
Storage bucket for user-uploaded knowledge base files.

**Configuration**:
- Public: No
- File Size Limit: 50MB
- Allowed MIME Types: PDF, DOCX, TXT, MD

**Usage**:
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('knowledge-files')
  .upload(`${userId}/${fileName}`, file)

// Download file
const { data } = await supabase.storage
  .from('knowledge-files')
  .download(filePath)
```

---

## 🔐 Row Level Security (RLS) Policies

Most tables have RLS enabled with policies for:
- **Users**: Can read/write their own data
- **Admins**: Can read/write all data
- **Public**: Limited read access to certain tables

**Example Policies**:
- `user_bookmarks`: Users can only see/modify their own bookmarks
- `profiles`: Users can read all profiles but only update their own
- `products`: All authenticated users can read, only admins can modify
- `roleplay_sessions`: Users can only see their own sessions, mentors can see assigned reviews

---

## 🔄 Common Query Patterns

### Fetch User Profile with Tier and Role
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*, user_access_tiers(*), user_admin_roles(*)')
  .eq('user_id', userId)
  .single()
```

### Get Products with Categories
```typescript
const { data: products } = await supabase
  .from('products')
  .select('*, categories(name, description)')
  .order('title')
```

### Get Roleplay Session with Feedback
```typescript
const { data: session } = await supabase
  .from('roleplay_sessions')
  .select(`
    *,
    roleplay_feedback(*),
    conversation_transcripts(*)
  `)
  .eq('id', sessionId)
  .single()
```

### Check User Permissions
```typescript
const { data: canAccess } = await supabase.rpc('has_tier_access', {
  user_id: userId,
  access_type: 'page',
  resource_id: 'admin-panel'
})
```

### Get User's Learning Progress
```typescript
const { data: progress } = await supabase
  .from('learning_progress')
  .select('*, products(title), categories(name)')
  .eq('user_id', userId)
  .order('completed_at', { ascending: false })
```

---

## 📝 Migration Notes

### Running Migrations
Migrations are stored in `/supabase/migrations/` directory.

**Migration Naming**: `YYYYMMDDHHMMSS-uuid.sql`

**Apply Migrations**:
```bash
supabase db push
```

**Generate TypeScript Types**:
```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

---

## 🚨 Important Considerations for Multiple Codebases

### 1. **Schema Migrations**
- Coordinate migrations across both codebases
- Test migrations in staging before production
- Use migration locks to prevent concurrent migrations

### 2. **Data Isolation**
- Consider using `user_id` filtering for multi-tenant data
- Implement RLS policies to prevent cross-application data leakage
- Use separate schemas or table prefixes if needed for app-specific tables

### 3. **Connection Pooling**
- Use connection pooling (Supavisor) for better performance
- Set appropriate pool sizes based on both applications' needs

### 4. **Environment Variables**
Both codebases should use:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

### 5. **API Rate Limits**
- Monitor API usage across both applications
- Implement caching strategies to reduce database calls
- Use realtime subscriptions wisely

### 6. **Type Safety**
- Keep TypeScript types synchronized across codebases
- Consider sharing a common types package
- Regenerate types after each migration

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions Guide](https://supabase.com/docs/guides/database/functions)

---

## 🔄 Schema Version

**Current Version**: 1.0.0
**Last Migration**: 20250920161410_2b396425-99d7-4ad1-99c0-f0aed4e4c3fd.sql
**Database Compatibility**: PostgreSQL 14+

---

## ✅ Checklist for New Codebase Integration

- [ ] Set up Supabase environment variables
- [ ] Install `@supabase/supabase-js` package
- [ ] Copy TypeScript types from `src/integrations/supabase/types.ts`
- [ ] Implement authentication flow
- [ ] Set up RLS policies for new app-specific tables (if any)
- [ ] Test read/write access to shared tables
- [ ] Implement error handling for database operations
- [ ] Set up real-time subscriptions (if needed)
- [ ] Configure storage bucket access
- [ ] Test connection pooling and performance

---

**End of Documentation**
