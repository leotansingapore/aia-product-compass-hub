import type { TrainingVideo } from '@/hooks/useProducts';

/**
 * Converts structured video data to markdown format
 * This is used when migrating from form-based to markdown editor
 */
export function structuredToMarkdown(video: TrainingVideo): string {
  let markdown = '';
  
  // Title as H1
  if (video.title) {
    markdown += `# ${video.title}\n\n`;
  }
  
  // Video link
  if (video.url) {
    markdown += `[🎥 Watch Video](${video.url})\n\n`;
  }
  
  // Description section
  if (video.description) {
    markdown += `## 📋 Description\n\n${video.description}\n\n`;
  }
  
  // Notes section
  if (video.notes) {
    markdown += `## 📝 Learning Notes\n\n${video.notes}\n\n`;
  }
  
  // Transcript is NOT included in markdown - it has its own separate field
  
  // Useful links
  if (video.useful_links && video.useful_links.length > 0) {
    markdown += `## 🔗 Useful Links\n\n`;
    video.useful_links.forEach(link => {
      markdown += `- [${link.name}](${link.url})\n`;
    });
    markdown += '\n';
  }
  
  // Attachments
  if (video.attachments && video.attachments.length > 0) {
    markdown += `## 📎 Attachments\n\n`;
    video.attachments.forEach(attachment => {
      markdown += `- [${attachment.name}](${attachment.url})`;
      if (attachment.file_size) {
        markdown += ` (${formatFileSize(attachment.file_size)})`;
      }
      markdown += '\n';
    });
  }
  
  return markdown.trim();
}

/**
 * Legacy: Converts structured video data to rich HTML format
 * Kept for backwards compatibility with existing HTML content
 */
export function structuredToRichHtml(video: TrainingVideo): string {
  let html = '';
  
  // Title as H1
  if (video.title) {
    html += `<h1>${escapeHtml(video.title)}</h1>\n\n`;
  }
  
  // Embed the video
  if (video.url) {
    html += embedVideoHtml(video.url);
    html += '\n\n';
  }
  
  // Description section
  if (video.description) {
    html += `<h2>📋 Description</h2>\n`;
    html += `<p>${escapeHtml(video.description).replace(/\n/g, '<br>')}</p>\n\n`;
  }
  
  // Notes section
  if (video.notes) {
    html += `<h2>📝 Learning Notes</h2>\n`;
    html += `<p>${escapeHtml(video.notes).replace(/\n/g, '<br>')}</p>\n\n`;
  }
  
  // Transcript is NOT included in rich HTML - it has its own separate field
  
  // Useful links
  if (video.useful_links && video.useful_links.length > 0) {
    html += `<h2>🔗 Useful Links</h2>\n<ul>\n`;
    video.useful_links.forEach(link => {
      html += `  <li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.name)}</a></li>\n`;
    });
    html += `</ul>\n\n`;
  }
  
  // Attachments
  if (video.attachments && video.attachments.length > 0) {
    html += `<h2>📎 Attachments</h2>\n<ul>\n`;
    video.attachments.forEach(attachment => {
      html += `  <li><a href="${escapeHtml(attachment.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(attachment.name)}</a>`;
      if (attachment.file_size) {
        html += ` (${formatFileSize(attachment.file_size)})`;
      }
      html += `</li>\n`;
    });
    html += `</ul>\n`;
  }
  
  return html.trim();
}

/**
 * Embeds a video URL as HTML
 * Supports YouTube, Vimeo, Loom, Wistia
 */
function embedVideoHtml(url: string): string {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }
  }
  
  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    if (videoId) {
      return `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    }
  }
  
  // Loom
  if (url.includes('loom.com')) {
    const videoId = url.split('/').pop();
    if (videoId) {
      return `<div class="video-embed"><iframe src="https://www.loom.com/embed/${videoId}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`;
    }
  }
  
  // Wistia
  if (url.includes('wistia.com')) {
    const videoId = url.split('/').pop();
    if (videoId) {
      return `<div class="video-embed"><iframe src="https://fast.wistia.net/embed/iframe/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    }
  }
  
  // Fallback: just a link
  return `<p><a href="${escapeHtml(url)}">🎥 Watch Video</a></p>`;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Create legacy backup of structured fields before migration
 */
export function createLegacyBackup(video: TrainingVideo) {
  return {
    description: video.description,
    notes: video.notes,
    transcript: video.transcript,
    useful_links: video.useful_links,
    attachments: video.attachments,
    migrated_at: new Date().toISOString()
  };
}
