

## Add "Create Category" Button to Product Categories Sidebar

**What it does**: When an admin hovers over the "Product Categories" section header in the sidebar, a "+" button appears. Clicking it opens a dialog to create a new category -- consistent with the existing rename/delete category flows.

---

### UI/UX Flow

1. Admin hovers over "Product Categories" label in the sidebar
2. A small "+" icon appears next to the label (before the chevron), using a subtle hover transition (300ms ease-in-out, bg-muted on hover)
3. Clicking the "+" opens a Dialog (matching the existing rename dialog style) with:
   - Title: "Create New Category"
   - Input field for category name (50-character limit, matching rename dialog)
   - Cancel and Create buttons (default size, matching existing patterns)
4. On submit, inserts a new row into the `categories` table with the name
5. Shows success toast, invalidates cache, and reloads to reflect the new category

---

### Technical Details

**File**: `src/components/layout/AppSidebar.tsx`

1. **Import** `Plus` icon from lucide-react

2. **Add state** for the create dialog:
   - `creatingCategory` (boolean) to control dialog visibility
   - `newCategoryCreateName` (string) for the input value

3. **Update the CollapsibleTrigger** area to show a "+" button on hover for admins:
   ```tsx
   <SidebarGroupLabel asChild>
     <CollapsibleTrigger className="group/catHeader flex items-center justify-between w-full">
       <span>Product Categories</span>
       {!isCollapsed && isAdminUser && (
         <button
           onClick={(e) => { e.stopPropagation(); setCreatingCategory(true); }}
           className="opacity-0 group-hover/catHeader:opacity-100 h-5 w-5 rounded hover:bg-muted flex items-center justify-center transition-all duration-300 ease-in-out"
         >
           <Plus className="h-3.5 w-3.5" />
         </button>
       )}
       {!isCollapsed && (
         <ChevronDown className="h-4 w-4 transition-transform ..." />
       )}
     </CollapsibleTrigger>
   </SidebarGroupLabel>
   ```

4. **Add a handleCreateCategory function**:
   - Inserts into `categories` table with `name` field
   - Invalidates cache, shows toast, reloads

5. **Add a Create Category Dialog** (matching the existing rename dialog pattern):
   - Input with 50-char limit
   - Enter key to submit
   - Character counter
   - Cancel/Create buttons (default size per style guidelines)

