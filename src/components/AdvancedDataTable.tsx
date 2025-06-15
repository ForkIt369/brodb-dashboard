'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table'
import { ChevronDown, Check, Download, Filter, Columns, Search, X, MoreHorizontal } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { useHotkeys } from 'react-hotkeys-hook'

interface AdvancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onLoadMore?: () => void
  hasMore?: boolean
  exportFilename?: string
  enableRowSelection?: boolean
  onRowSelectionChange?: (selection: RowSelectionState) => void
  persistPreferences?: boolean
  preferencesKey?: string
  bulkActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (selectedRows: TData[]) => void
    variant?: 'default' | 'danger'
  }>
  customFilters?: React.ReactNode
  searchPlaceholder?: string
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  onLoadMore,
  hasMore,
  exportFilename = 'export',
  enableRowSelection = false,
  onRowSelectionChange,
  persistPreferences = true,
  preferencesKey = 'dataTablePrefs',
  bulkActions = [],
  customFilters,
  searchPlaceholder = 'Search all columns...',
}: AdvancedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [showColumnPicker, setShowColumnPicker] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    if (persistPreferences && typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem(`${preferencesKey}_columnVisibility`)
      if (savedPrefs) {
        setColumnVisibility(JSON.parse(savedPrefs))
      }
    }
  }, [persistPreferences, preferencesKey])

  // Save preferences to localStorage
  useEffect(() => {
    if (persistPreferences && typeof window !== 'undefined') {
      localStorage.setItem(`${preferencesKey}_columnVisibility`, JSON.stringify(columnVisibility))
    }
  }, [columnVisibility, persistPreferences, preferencesKey])

  // Handle row selection changes
  useEffect(() => {
    onRowSelectionChange?.(rowSelection)
  }, [rowSelection, onRowSelectionChange])

  const table = useReactTable({
    data,
    columns: enableRowSelection ? [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-4 h-4 rounded border-gray-600 bg-transparent"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 rounded border-gray-600 bg-transparent"
          />
        ),
        size: 40,
      },
      ...columns
    ] : columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  // Keyboard shortcuts
  useHotkeys('cmd+a, ctrl+a', (e) => {
    e.preventDefault()
    if (enableRowSelection) {
      table.toggleAllPageRowsSelected()
    }
  })

  useHotkeys('cmd+f, ctrl+f', (e) => {
    e.preventDefault()
    document.getElementById('global-search')?.focus()
  })

  useHotkeys('cmd+shift+e, ctrl+shift+e', (e) => {
    e.preventDefault()
    exportToExcel()
  })

  const exportToCSV = () => {
    const headers = table.getVisibleFlatColumns()
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => col.id)
    
    const rows = table.getFilteredRowModel().rows.map(row => {
      const rowData: any = {}
      headers.forEach(header => {
        const value = row.getValue(header)
        rowData[header] = value
      })
      return rowData
    })

    const csv = Papa.unparse({ fields: headers, data: rows })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}.csv`
    a.click()
  }

  const exportToJSON = () => {
    const rows = table.getFilteredRowModel().rows.map(row => row.original)
    const json = JSON.stringify(rows, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}.json`
    a.click()
  }

  const exportToExcel = () => {
    const headers = table.getVisibleFlatColumns()
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => col.id)
    
    const rows = table.getFilteredRowModel().rows.map(row => {
      const rowData: any = {}
      headers.forEach(header => {
        const value = row.getValue(header)
        rowData[header] = value
      })
      return rowData
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, `${exportFilename}.xlsx`)
  }

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
  const hasSelectedRows = selectedRows.length > 0

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Global Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="global-search"
                type="text"
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-dark-secondary border border-white/10 rounded-lg text-sm focus:border-bro-500 focus:outline-none"
                placeholder={searchPlaceholder}
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bulk Actions */}
            {hasSelectedRows && bulkActions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {selectedRows.length} selected
                </span>
                {bulkActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => action.onClick(selectedRows)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      action.variant === 'danger'
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-bro-500/20 text-bro-500 hover:bg-bro-500/30'
                    }`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-bro-500/20 text-bro-500'
                  : 'bg-dark-secondary text-gray-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {columnFilters.length > 0 && (
                <span className="px-1.5 py-0.5 bg-bro-500 text-white text-xs rounded-full">
                  {columnFilters.length}
                </span>
              )}
            </button>

            {/* Column Visibility */}
            <div className="relative">
              <button
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                className="px-3 py-2 bg-dark-secondary text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Columns className="w-4 h-4" />
                Columns
              </button>

              {showColumnPicker && (
                <div className="absolute right-0 mt-2 w-64 bg-dark-secondary border border-white/10 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-sm font-medium">Toggle Columns</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {table.getAllLeafColumns()
                      .filter(column => column.id !== 'select' && column.id !== 'actions')
                      .map(column => (
                        <label
                          key={column.id}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={column.getIsVisible()}
                            onChange={column.getToggleVisibilityHandler()}
                            className="w-4 h-4 rounded border-gray-600 bg-transparent"
                          />
                          <span className="text-sm">{column.id}</span>
                        </label>
                      ))}
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        table.getAllLeafColumns().forEach(col => col.toggleVisibility(true))
                      }}
                      className="w-full px-3 py-1.5 text-sm text-bro-500 hover:bg-bro-500/10 rounded transition-colors"
                    >
                      Show All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export Menu */}
            <div className="relative group">
              <button className="px-3 py-2 bg-dark-secondary text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-dark-secondary border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                >
                  Export as CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                >
                  Export as JSON
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                >
                  Export as Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column Filters */}
        {showFilters && (
          <div className="bg-dark-secondary border border-white/10 rounded-lg p-4">
            {customFilters || (
              <div className="text-sm text-gray-400">
                Configure column-specific filters here
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-dark-secondary border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-tertiary border-b border-white/10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    row.getIsSelected() ? 'bg-bro-500/10' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1 bg-dark-tertiary border border-white/10 rounded text-sm"
            >
              {[10, 20, 30, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm bg-dark-tertiary rounded disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm bg-dark-tertiary rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm bg-dark-tertiary rounded disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm bg-dark-tertiary rounded disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>

        {/* Load More */}
        {hasMore && onLoadMore && (
          <div className="px-4 py-3 border-t border-white/10">
            <button
              onClick={onLoadMore}
              className="w-full px-4 py-2 bg-bro-500/20 text-bro-500 rounded-lg hover:bg-bro-500/30 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 flex items-center gap-4">
        <span>⌘/Ctrl+F: Search</span>
        <span>⌘/Ctrl+A: Select All</span>
        <span>⌘/Ctrl+Shift+E: Export Excel</span>
      </div>
    </div>
  )
}