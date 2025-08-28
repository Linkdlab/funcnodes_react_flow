# SortableTable Component

A high-performance, sortable table component with support for large datasets through pagination, virtual scrolling, and lazy loading.

## Features

- ✅ **Sortable columns** with visual indicators
- ✅ **Pagination** for large datasets
- ✅ **Virtual scrolling** for smooth performance with thousands of rows
- ✅ **Lazy loading** for infinite data sets
- ✅ **Responsive design** with mobile support
- ✅ **Accessibility** with ARIA labels and keyboard navigation
- ✅ **Performance optimizations** for large datasets
- ✅ **Themeable** with CSS variables

## Performance Optimizations

### For Large Tables (>1000 rows):

1. **Chunked Sorting**: Large datasets are sorted in chunks to avoid blocking the main thread
2. **Debounced Sorting**: Sort operations are debounced to prevent excessive re-renders
3. **Virtual Scrolling**: Only renders visible rows, dramatically reducing DOM size
4. **Pagination**: Limits the number of rows rendered at once
5. **Memoization**: Expensive operations are memoized to prevent unnecessary recalculations

## Usage Examples

### Basic Usage
```tsx
import { SortableTable } from "@/shared-components";

const data = {
  columns: ["Name", "Age", "City"],
  index: ["row1", "row2", "row3"],
  data: [
    ["Alice", 25, "New York"],
    ["Bob", 30, "Los Angeles"],
    ["Charlie", 35, "Chicago"],
  ],
};

<SortableTable tabledata={data} />
```

### With Pagination
```tsx
<SortableTable
  tabledata={largeDataset}
  enablePagination={true}
  pageSize={50}
/>
```

### With Virtual Scrolling
```tsx
<SortableTable
  tabledata={veryLargeDataset}
  enableVirtualScrolling={true}
  virtualScrollingHeight={400}
/>
```

### With Lazy Loading
```tsx
const handleLoadMore = async (page: number) => {
  const newData = await fetchData(page);
  // Update your data source
};

<SortableTable
  tabledata={dataset}
  enablePagination={true}
  enableLazyLoading={true}
  onLoadMore={handleLoadMore}
/>
```

### Combined Performance Features
```tsx
<SortableTable
  tabledata={massiveDataset}
  enablePagination={true}
  pageSize={100}
  enableVirtualScrolling={true}
  virtualScrollingHeight={600}
  enableLazyLoading={true}
  onLoadMore={handleLoadMore}
  onSortChange={(column, direction) => {
    console.log(`Sorting by ${column} in ${direction} direction`);
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabledata` | `TableData` | - | The table data to display |
| `className` | `string` | `""` | Additional CSS classes |
| `size` | `"small" \| "medium"` | `"small"` | Table size |
| `onSortChange` | `(column: string, direction: SortDirection) => void` | - | Callback when sorting changes |
| `enablePagination` | `boolean` | `false` | Enable pagination for large datasets |
| `pageSize` | `number` | `50` | Number of rows per page |
| `enableVirtualScrolling` | `boolean` | `false` | Enable virtual scrolling |
| `virtualScrollingHeight` | `number` | `400` | Height of virtual scrolling container |
| `enableLazyLoading` | `boolean` | `false` | Enable lazy loading for infinite data |
| `onLoadMore` | `(page: number) => Promise<void>` | - | Callback to load more data |

## Performance Guidelines

### When to Use Each Feature:

1. **Small tables (<100 rows)**: Use basic component
2. **Medium tables (100-1000 rows)**: Enable pagination
3. **Large tables (1000-10000 rows)**: Use pagination + virtual scrolling
4. **Very large tables (>10000 rows)**: Use all features + lazy loading

### Performance Tips:

1. **Use pagination** for tables with more than 100 rows
2. **Enable virtual scrolling** for tables with more than 1000 rows
3. **Implement lazy loading** for infinite datasets
4. **Debounce sort operations** for very large datasets
5. **Use chunked sorting** automatically for datasets >1000 rows

## CSS Variables

The component uses CSS variables for theming:

```css
.sortable-table-container {
  --sortable-table-bg-color: var(--fn-app-background, white);
  --sortable-table-text-color: var(--fn-primary-color, black);
  --sortable-table-border-color: var(--fn-border-color, #ddd);
  --sortable-table-header-bg-color: var(--fn-app-background, #f5f5f5);
  --sortable-table-index-bg-color: var(--fn-container-background, #f9f9f9);
}
```

## Accessibility

- ARIA labels for sort buttons
- Keyboard navigation support
- Screen reader announcements for sort changes
- Proper semantic HTML structure

## Browser Support

- Modern browsers with ES6+ support
- Virtual scrolling requires CSS `position: sticky` support
- Pagination works in all browsers
