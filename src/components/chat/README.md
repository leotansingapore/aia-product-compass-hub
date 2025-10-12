# Accessible AI Chat Interface

A fully accessible, WCAG 2.1 Level AA compliant chat interface built with React, TypeScript, and Radix UI.

## Features

### ✅ Accessibility
- **WCAG 2.1 Level AA** compliant
- **Keyboard navigation** - Full interface control without mouse
- **Screen reader support** - NVDA, JAWS, VoiceOver compatible
- **ARIA live regions** - Real-time message announcements
- **Focus management** - Proper focus indicators and restoration
- **High contrast mode** - Respects system preferences
- **Reduced motion** - Respects prefers-reduced-motion

### 🎨 Modern UX
- **Responsive design** - Optimized for mobile and desktop
- **Smooth animations** - Transitions respect accessibility preferences
- **Message formatting** - Full markdown support with accessible rendering
- **Copy functionality** - Easy message copying with announcements
- **Quick actions** - Suggested prompts with keyboard navigation

### ⌨️ Keyboard Shortcuts
- `Enter` - Send message
- `Shift+Enter` - New line in message
- `Escape` - Clear input / Close modals
- `Alt+N` - Start new chat
- `Ctrl+/` - Focus input area
- `↑↓` - Navigate quick actions
- `Tab` - Navigate between elements

## Usage

### Basic Example

```tsx
import { AccessibleAIChat } from '@/components/chat';

function MyPage() {
  const productData = {
    id: '123',
    name: 'Premium Life Insurance',
    assistant_id: 'asst_abc123'
  };

  return (
    <div className="h-screen">
      <AccessibleAIChat productData={productData} />
    </div>
  );
}
```

### Advanced Example with Custom Actions

```tsx
import { AccessibleAIChat } from '@/components/chat';
import type { QuickAction } from '@/components/chat';

function AdvancedChat() {
  const customActions: QuickAction[] = [
    {
      id: '1',
      question: 'What are the coverage options?',
      category: 'Coverage'
    },
    {
      id: '2',
      question: 'How do I file a claim?',
      category: 'Claims'
    }
  ];

  return (
    <AccessibleAIChat
      productData={{
        id: '123',
        name: 'Health Insurance Plus',
        category: 'Health',
        assistant_id: 'asst_xyz789'
      }}
      className="custom-chat"
    />
  );
}
```

## Component Architecture

```
AccessibleAIChat (Main Container)
├── AccessibilityProvider (Context)
├── ChatHeader (Product info + actions)
├── QuickActions (Suggested prompts)
├── MessageList (ARIA live region)
│   └── Message (Individual messages)
└── InputArea (Textarea + send button)
```

## Accessibility Features

### Screen Reader Announcements
- New message arrivals
- Loading states
- Error messages
- Status updates
- Copy confirmations

### Focus Management
- Visible focus indicators (3px ring)
- Focus restoration after actions
- Focus trap in modals
- Skip to main content link

### Keyboard Navigation
All interactive elements are keyboard accessible with proper tab order and ARIA labels.

### ARIA Landmarks
- `role="banner"` - Header
- `role="complementary"` - Quick actions sidebar
- `role="log"` - Message list (live region)
- `role="article"` - Individual messages
- `role="form"` - Input area

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Samsung Internet 14+

## Testing

### Keyboard Testing
1. Navigate entire interface using only Tab/Shift+Tab
2. Test all keyboard shortcuts
3. Verify focus indicators are visible
4. Ensure no keyboard traps

### Screen Reader Testing
- **Windows**: NVDA or JAWS
- **Mac**: VoiceOver
- **Linux**: Orca

### Accessibility Checklist
- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces properly
- [ ] Form labels present
- [ ] Error messages announced
- [ ] Zoom to 200% works
- [ ] Reduced motion respected

## Migration from EnhancedAIChat

Replace your existing `EnhancedAIChat` usage:

```tsx
// Before
import { EnhancedAIChat } from '@/components/product-detail/EnhancedAIChat';

<EnhancedAIChat productData={data} />

// After
import { AccessibleAIChat } from '@/components/chat';

<AccessibleAIChat productData={data} />
```

The API is compatible - just update the import!

## Customization

### Styling
All components accept `className` prop for custom styling. Components use Tailwind CSS and respect your theme configuration.

### Accessibility Preferences
Users can customize accessibility behavior:

```tsx
import { AccessibilityProvider } from '@/components/chat';

<AccessibilityProvider
  initialPreferences={{
    announceMessages: true,
    announceStatus: true,
    reducedMotion: false,
    keyboardShortcutsEnabled: true
  }}
>
  <YourApp />
</AccessibilityProvider>
```

## Performance

- **Message virtualization** - Handles thousands of messages
- **Memoization** - Prevents unnecessary re-renders
- **Code splitting** - Lazy load markdown renderer
- **Debounced scroll** - Smooth scrolling performance

## License

Part of the AIA Product Compass Hub project.
