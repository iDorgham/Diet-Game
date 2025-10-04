// Table component following docs/ui-components/tables.md
// EARS-UI-036 through EARS-UI-040 implementation

import React, { forwardRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  X
} from 'lucide-react';
import { cn } from '../../utils/helpers';

// Types
export interface Column {
  key: string;
  title: string;
  dataIndex: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
  sorter?: (a: any, b: any) => number;
  filterDropdown?: React.ReactNode;
  onCell?: (record: any, index: number) => any;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  pageSizeOptions?: string[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface TableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  className?: string;
}

export interface TableRowProps {
  record: any;
  index: number;
  columns: Column[];
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (record: any, selected: boolean) => void;
  onRowClick?: (record: any, index: number) => void;
  className?: string;
}

export interface TableCellProps {
  value: any;
  record: any;
  column: Column;
  index: number;
  editable?: boolean;
  onEdit?: (value: any, record: any, column: string) => void;
  className?: string;
}

// Main Table Component
export const Table = forwardRef<HTMLDivElement, TableProps>(
  (
    {
      data,
      columns,
      loading = false,
      error,
      emptyMessage = 'No data available',
      selectable = false,
      sortable = true,
      filterable = true,
      pagination,
      onRowClick,
      onSelectionChange,
      onSort,
      onFilter,
      className
    },
    ref
  ) => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Filter and search data
    const filteredData = useMemo(() => {
      let result = data;

      // Apply search
      if (searchTerm) {
        result = result.filter(record =>
          columns.some(column => {
            const value = record[column.dataIndex];
            return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
          })
        );
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          result = result.filter(record => {
            const recordValue = record[key];
            if (typeof value === 'string') {
              return recordValue && recordValue.toString().toLowerCase().includes(value.toLowerCase());
            }
            return recordValue === value;
          });
        }
      });

      return result;
    }, [data, searchTerm, filters, columns]);

    // Sort data
    const sortedData = useMemo(() => {
      if (!sortConfig) return filteredData;

      return [...filteredData].sort((a, b) => {
        const column = columns.find(col => col.key === sortConfig.key);
        if (column?.sorter) {
          return column.sorter(a, b);
        }

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }, [filteredData, sortConfig, columns]);

    // Handle selection
    const handleSelectAll = useCallback((checked: boolean) => {
      if (checked) {
        setSelectedRows(sortedData);
        onSelectionChange?.(sortedData);
      } else {
        setSelectedRows([]);
        onSelectionChange?.([]);
      }
    }, [sortedData, onSelectionChange]);

    const handleSelectRow = useCallback((record: any, checked: boolean) => {
      let newSelectedRows;
      if (checked) {
        newSelectedRows = [...selectedRows, record];
      } else {
        newSelectedRows = selectedRows.filter(row => row !== record);
      }
      setSelectedRows(newSelectedRows);
      onSelectionChange?.(newSelectedRows);
    }, [selectedRows, onSelectionChange]);

    // Handle sorting
    const handleSort = useCallback((columnKey: string) => {
      if (!sortable) return;

      const newDirection = sortConfig?.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
      const newSortConfig = { key: columnKey, direction: newDirection };
      
      setSortConfig(newSortConfig);
      onSort?.(columnKey, newDirection);
    }, [sortConfig, sortable, onSort]);

    // Handle filtering
    const handleFilter = useCallback((columnKey: string, value: any) => {
      const newFilters = { ...filters, [columnKey]: value };
      setFilters(newFilters);
      onFilter?.(newFilters);
    }, [filters, onFilter]);

    const clearFilters = useCallback(() => {
      setFilters({});
      setSearchTerm('');
      onFilter?.({});
    }, [onFilter]);

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading data</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search table data"
              />
            </div>

            {/* Filters */}
            {filterable && (
              <div className="flex gap-2">
                {columns
                  .filter(col => col.filterable)
                  .map(column => (
                    <select
                      key={column.key}
                      value={filters[column.key] || ''}
                      onChange={(e) => handleFilter(column.key, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label={`Filter by ${column.title}`}
                    >
                      <option value="">All {column.title}</option>
                      {Array.from(new Set(data.map(item => item[column.dataIndex])))
                        .filter(Boolean)
                        .map(value => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                    </select>
                  ))}
              </div>
            )}

            {/* Clear Filters */}
            {(Object.keys(filters).length > 0 || searchTerm) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
              aria-label="Export table data"
              title="Export table data"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button 
              className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              aria-label="Add new item"
              title="Add new item"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Header */}
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && sortable && 'cursor-pointer hover:bg-gray-100'
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.title}</span>
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              'h-3 w-3',
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'h-3 w-3 -mt-1',
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selectable ? 2 : 1)}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-500">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selectable ? 2 : 1)}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((record, index) => (
                    <TableRow
                      key={index}
                      record={record}
                      index={index}
                      columns={columns}
                      selected={selectedRows.includes(record)}
                      selectable={selectable}
                      onSelect={handleSelectRow}
                      onRowClick={onRowClick}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination
            {...pagination}
            total={filteredData.length}
          />
        )}
      </div>
    );
  }
);

Table.displayName = 'Table';

// Table Row Component
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      record,
      index,
      columns,
      selected = false,
      selectable = false,
      onSelect,
      onRowClick,
      className
    },
    ref
  ) => {
    const handleRowClick = () => {
      onRowClick?.(record, index);
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onSelect?.(record, e.target.checked);
    };

    return (
      <motion.tr
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          'hover:bg-gray-50 transition-colors',
          selected && 'bg-blue-50',
          onRowClick && 'cursor-pointer',
          className
        )}
        onClick={handleRowClick}
      >
        {selectable && (
          <td className="px-6 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              checked={selected}
              onChange={handleSelect}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </td>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.key}
            value={record[column.dataIndex]}
            record={record}
            column={column}
            index={index}
          />
        ))}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button className="text-blue-600 hover:text-blue-900">
              <Edit className="h-4 w-4" />
            </button>
            <button className="text-red-600 hover:text-red-900">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </td>
      </motion.tr>
    );
  }
);

TableRow.displayName = 'TableRow';

// Table Cell Component
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      value,
      record,
      column,
      index,
      editable = false,
      onEdit,
      className
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const handleEdit = () => {
      if (editable) {
        setIsEditing(true);
        setEditValue(value);
      }
    };

    const handleSave = () => {
      onEdit?.(editValue, record, column.key);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    const cellContent = column.render ? column.render(value, record, index) : value;

    return (
      <td
        ref={ref}
        className={cn(
          'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
          column.align === 'center' && 'text-center',
          column.align === 'right' && 'text-right',
          column.ellipsis && 'truncate max-w-xs',
          editable && 'cursor-pointer hover:bg-gray-100',
          className
        )}
        onClick={handleEdit}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          cellContent
        )}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

// Pagination Component
export interface PaginationProps extends PaginationConfig {
  className?: string;
}

export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      current,
      pageSize,
      total,
      showSizeChanger = true,
      showQuickJumper = false,
      showTotal,
      pageSizeOptions = ['10', '20', '50', '100'],
      onChange,
      onShowSizeChange,
      className
    },
    ref
  ) => {
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== current) {
        onChange?.(page, pageSize);
      }
    };

    const handleSizeChange = (size: number) => {
      onShowSizeChange?.(current, size);
    };

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 7;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        
        if (current > 4) {
          pages.push('...');
        }
        
        const start = Math.max(2, current - 1);
        const end = Math.min(totalPages - 1, current + 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (current < totalPages - 3) {
          pages.push('...');
        }
        
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200', className)}
      >
        {/* Info */}
        <div className="flex items-center text-sm text-gray-700">
          {showTotal ? (
            showTotal(total, [startItem, endItem])
          ) : (
            <>
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Page Size Changer */}
          {showSizeChanger && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select page size"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Jumper */}
          {showQuickJumper && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Go to page number"
                placeholder="Page"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = Number((e.target as HTMLInputElement).value);
                    handlePageChange(page);
                  }
                }}
              />
            </div>
          )}

          {/* Page Navigation */}
          <div className="flex items-center space-x-1">
            {/* Previous */}
            <button
              onClick={() => handlePageChange(current - 1)}
              disabled={current === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to previous page"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={cn(
                  'px-3 py-1 text-sm border rounded',
                  page === current
                    ? 'bg-blue-600 text-white border-blue-600'
                    : page === '...'
                    ? 'border-gray-300 text-gray-500 cursor-default'
                    : 'border-gray-300 hover:bg-gray-50'
                )}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => handlePageChange(current + 1)}
              disabled={current === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Table;
