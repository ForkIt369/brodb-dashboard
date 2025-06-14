'use client'

import { useState, useMemo } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Eye, EyeOff, Search, Filter } from 'lucide-react'
import Papa from 'papaparse'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onLoadMore?: () => void
  hasMore?: boolean
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  showColumnVisibility?: boolean
  showExport?: boolean
  exportFilename?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onLoadMore,
  hasMore,
  globalFilter = '',
  onGlobalFilterChange,
  showColumnVisibility = true,
  showExport = true,
  exportFilename = 'export',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showFilters, setShowFilters] = useState(false)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onGlobalFilterChange,
  })

  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows
    const csvData = rows.map(row => {
      const rowData: any = {}
      columns.forEach((column: any) => {
        if (column.accessorKey) {
          rowData[column.header] = row.getValue(column.accessorKey)
        }
      })
      return rowData
    })

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFilename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange?.(e.target.value)}
              placeholder="Search all columns..."
              className="w-full pl-10 pr-4 py-2 glass rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 glass rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showColumnVisibility && (
            <div className="relative">
              <button
                className="px-4 py-2 glass rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
                onClick={() => {
                  const menu = document.getElementById('column-visibility-menu')
                  menu?.classList.toggle('hidden')
                }}
              >
                <Eye className="w-4 h-4" />
                Columns
              </button>
              <div
                id="column-visibility-menu"
                className="hidden absolute right-0 mt-2 w-48 glass rounded-lg p-2 z-50"
              >
                {table.getAllColumns().map((column) => {
                  if (!column.getCanHide()) return null
                  return (
                    <label
                      key={column.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="rounded"
                      />
                      <span className="text-sm">{column.id}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
          
          {showExport && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 glass rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Column Filters */}
      {showFilters && (
        <div className="glass rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {table.getAllColumns().map((column) => {
              if (!column.getCanFilter()) return null
              return (
                <div key={column.id} className="space-y-1">
                  <label className="text-sm text-gray-400">{column.id}</label>
                  <input
                    type="text"
                    value={(column.getFilterValue() ?? '') as string}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder={`Filter ${column.id}...`}
                    className="w-full px-3 py-1.5 glass rounded text-sm"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center gap-1 hover:text-white transition-colors'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <>
                              {header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronsUpDown className="w-4 h-4 opacity-50" />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-400"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 glass rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 glass rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1 glass rounded text-sm"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}