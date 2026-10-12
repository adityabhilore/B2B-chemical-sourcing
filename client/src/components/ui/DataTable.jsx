// src/components/ui/DataTable.jsx
// Props: columns, data, loading, emptyTitle, emptyDesc, onSearch, searchValue,
//        sortKey, sortDir, onSort, page, totalPages, onPageChange, totalItems, rowActions
import { cn } from '../../lib/utils';
import Pagination from './Pagination';
import SearchBar from './SearchBar';
import { Skeleton, EmptyState } from './States';

/**
 * DataTable
 * @param {Array<{key, label, render?, sortable?, className?}>} columns
 * @param {Array<object>} data
 * @param {boolean} loading
 * @param {(row)=>ReactNode} rowActions
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  searchValue,
  onSearch,
  searchPlaceholder = 'Search…',
  sortKey,
  sortDir = 'asc',
  onSort,
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  rowActions,
  filters,
  className,
}) {
  const handleSort = (key) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search */}
      {onSearch && (
        <SearchBar
          value={searchValue}
          onChange={onSearch}
          placeholder={searchPlaceholder}
          className="max-w-xs"
        />
      )}
      {filters && <div className="flex flex-wrap items-center gap-3">{filters}</div>}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
        <table className="data-table w-full">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(col.className)}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.sortable ? <button type="button" onClick={() => handleSort(col.key)} className="inline-flex items-center gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
                    {col.label}<span aria-hidden="true" className="text-slate-400">{sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </button> : col.label}
                </th>
              ))}
              {rowActions && <th className="w-12" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <tr key={i} aria-hidden="true">{columns.map(col => <td key={col.key}><Skeleton height={16} /></td>)}{rowActions && <td><Skeleton height={16} /></td>}</tr>)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="border-0 p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, ri) => (
                <tr key={row.id || ri}>
                  {columns.map(col => (
                    <td key={col.key} className={cn(col.className)}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="text-right pr-2">
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
