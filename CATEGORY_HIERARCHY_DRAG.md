# Category Hierarchy Drag-and-Drop Implementation

## Overview
Enhanced the category ordering page to move child categories together with their parent categories when dragging and dropping. This maintains the category hierarchy during reordering.

## Changes Made

### 1. Extended Item State
**Location**: `src/sections/category/view/category-order-view.tsx`

Added `parentId` to the items state to track parent-child relationships:

```typescript
// Before
const [items, setItems] = useState<Array<{ id: number; name: string; parentPath?: string }>>([]);

// After
const [items, setItems] = useState<Array<{ id: number; name: string; parentPath?: string; parentId: number | null }>>([]);
```

### 2. New Helper Function: `getAllDescendants`

Added a recursive function to find all descendants (children, grandchildren, etc.) of a category:

```typescript
const getAllDescendants = useCallback((categoryId: number, itemsList): number[] => {
    const descendants: number[] = [];
    const directChildren = itemsList.filter((item) => item.parentId === categoryId);
    
    directChildren.forEach((child) => {
        descendants.push(child.id);
        // Recursively get descendants of this child
        const childDescendants = getAllDescendants(child.id, itemsList);
        descendants.push(...childDescendants);
    });
    
    return descendants;
}, []);
```

### 3. Enhanced Drag Logic

Updated `handleDragEnd` to move parent categories with all their children:

**Key Logic**:
1. When a category is dragged, identify all its descendants
2. Create a group of items to move (parent + all descendants)
3. Calculate the correct insertion point:
   - **Moving down**: Insert after the target category and its descendants
   - **Moving up**: Insert before the target category
4. Maintain relative order within the moved group

**Example Behavior**:

Original order:
```
1. Fruits
2.   └─ Apples
3.      └─ Red Apples
4. Vegetables
5.   └─ Carrots
```

Dragging "Fruits" below "Vegetables":
```
1. Vegetables
2.   └─ Carrots
3. Fruits          ← Moved with all children
4.   └─ Apples
5.      └─ Red Apples
```

### 4. Removed Unused Import

Removed `arrayMove` from imports as we now use custom logic:

```typescript
// Removed: arrayMove
import {
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
```

## Technical Details

### Descendant Detection
The `getAllDescendants` function:
- Works recursively to handle any level of nesting
- Returns a flat array of all descendant IDs
- Handles complex hierarchies (grandchildren, great-grandchildren, etc.)

### Move Algorithm
1. **Identify items to move**: Parent + all descendants
2. **Separate arrays**: 
   - `movingItems`: Items in the hierarchy being moved
   - `staticItems`: All other items (excluding those being moved)
3. **Calculate insertion point**:
   - For downward moves: Find the last item in target's hierarchy
   - For upward moves: Use target's position
4. **Reconstruct array**: Insert moving items at the calculated position

### Performance
- **Time Complexity**: O(n²) in worst case (deep nesting)
- **Space Complexity**: O(n) for temporary arrays
- Acceptable for typical category counts (< 1000 categories)

## User Experience

### Before
- Moving a parent category left children in original positions
- Required manually moving each child
- Hierarchy could become disconnected

### After
- Dragging a parent automatically moves all children
- Hierarchy stays intact during reordering
- Single drag operation for entire category tree

## Visual Feedback

The UI provides clear feedback:
- Parent path shown above each category name
- Drag handle (dots icon) on every item
- Hover state highlights draggable areas
- Drag overlay shows what's being moved (parent only, but children move too)

## Edge Cases Handled

1. **Root-level categories**: No parent, moves independently
2. **Leaf categories**: No children, moves alone
3. **Multi-level hierarchies**: All descendants at any depth move together
4. **Moving within same parent**: Children follow parent
5. **Moving to different parent level**: Hierarchy maintained

## Testing Checklist

- [ ] Move parent category with single child
- [ ] Move parent category with multiple children
- [ ] Move parent with nested children (3+ levels)
- [ ] Move root-level category
- [ ] Move leaf category (no children)
- [ ] Drag between different parents
- [ ] Verify order persists after save
- [ ] Check visual feedback during drag
- [ ] Test keyboard navigation (accessibility)

## Future Enhancements

1. **Visual indicator**: Show number of items being moved
2. **Expand/collapse**: Allow collapsing category groups visually
3. **Indent visualization**: Show hierarchy depth with indentation
4. **Drag preview**: Show all children in drag overlay
5. **Prevent invalid drops**: Don't allow parent to drop inside its own children

## Related Files

- `src/sections/category/view/category-order-view.tsx` - Main implementation
- `src/actions/category-order.ts` - Category order data fetching
- `src/utils/category-order.ts` - Sorting utilities
- `database/migrations/004_add_category_order_option.sql` - Database schema

## Dependencies

- `@dnd-kit/core` v6.3.1 - Core drag and drop functionality
- `@dnd-kit/sortable` v10.0.0 - Sortable list utilities
- React hooks: `useState`, `useEffect`, `useCallback`
