
## Hide Chat Assistance & Add Floating NotebookLM Chat Button

### Overview
Remove the inline "Chat Assistance" section from the product detail page and replace it with a floating chat button in the bottom-right corner. When clicked, this button will open a slide-out chat panel that embeds the NotebookLM link in an iframe.

---

### Current State
- `ProductChatbots` component displays 2 chatbot cards (chatbot2: "Chat with Chatbot", chatbot3: "Chat with Notebook")
- These are shown in the "Chat Assistance" section on the product detail page
- User wants to keep ONLY the NotebookLM/Notebook chat option
- User wants it accessible via a floating button rather than inline cards

---

### Implementation Plan

#### 1. Create New FloatingNotebookChat Component

Create `src/components/product-detail/FloatingNotebookChat.tsx`:

- Fixed position button in bottom-right corner (bottom-6 right-6)
- Uses the `MessageCircle` icon with a pulsing indicator when available
- Clicking opens a slide-out sheet/drawer from the right side
- The sheet contains an iframe that loads the NotebookLM link
- Shows "Chat not available" tooltip if no link is configured
- Includes close button and header with product name

**Component Structure:**
```text
+--------------------------------------------+
|                                            |
|                              [Chat Button] | <- Fixed bottom-right
|                                            |
+--------------------------------------------+

When clicked:
+--------------------------------------------+
|                              +------------+|
|                              | Sheet      ||
|                              | +--------+ ||
|                              | |Header  | ||
|                              | |--------| ||
|                              | |NotebookLM||
|                              | |iframe  | ||
|                              | |        | ||
|                              | +--------+ ||
|                              +------------+|
+--------------------------------------------+
```

#### 2. Update ProductDetail.tsx

Remove from the page:
- The entire "Chat Assistance Section" (`<ProtectedSection sectionId="product_chat_assistance">`)
- The `ProductChatbots` component import
- The `isChatEditing` state (no longer needed for inline editing)

Add to the page:
- Import `FloatingNotebookChat`
- Render the floating button component, passing:
  - `notebookLink={product.chatbot_link_3}` (the Notebook LM link)
  - `productName={product.title}`

#### 3. Keep Admin Edit Capability (Optional)

The admin can still edit the NotebookLM link through:
- A small edit icon on the floating button (only visible to admins)
- Or through a dedicated settings section

---

### Technical Details

**FloatingNotebookChat Component Props:**
```typescript
interface FloatingNotebookChatProps {
  notebookLink?: string;
  productName?: string;
}
```

**Sheet/Drawer Sizing:**
- Width: 400px on desktop, full-width on mobile
- Height: 70vh (viewport height)
- Positioned on the right side

**Iframe Configuration:**
```typescript
<iframe
  src={notebookLink}
  className="w-full h-full border-0"
  allow="microphone; camera"
  title={`Chat about ${productName}`}
/>
```

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/product-detail/FloatingNotebookChat.tsx` | **CREATE** - New floating button + sheet component |
| `src/pages/ProductDetail.tsx` | Remove Chat Assistance section, add FloatingNotebookChat |

---

### Visual Design

**Floating Button:**
- Circular button with chat icon
- Primary color background with shadow
- Hover effect (scale up slightly)
- Pulse animation dot when link is available

**Chat Panel:**
- Clean header with product name and close button
- Full-height iframe for NotebookLM
- Smooth slide-in animation from right

---

### Testing Checklist

After implementation:
- [ ] Verify the Chat Assistance section is no longer visible on product pages
- [ ] Check that the floating chat button appears in the bottom-right corner
- [ ] Click the button to open the NotebookLM panel
- [ ] Verify the iframe loads the NotebookLM link correctly
- [ ] Test on mobile to ensure the panel is usable
- [ ] Check that pages without a NotebookLM link show a disabled state
