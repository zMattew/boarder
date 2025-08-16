"use client";

import {
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableFooter,
  TableRow,
} from "@/components/shadcn/table";
import { useFetcher } from "./component/fetch-context";
import { Button } from "./shadcn/button";




export function DataTable() {
  const { data: d, pagination, setPagination } = useFetcher()
  const table = useReactTable({
    data: d.rows,
    columns: d.type,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: (pagination.skip / pagination.limit),
        pageSize: pagination.limit
      },
    },
    pageCount: -1
  });
  const rows = (state: PaginationState) => {
   //trying skipping memo from compiler
    return table.getCoreRowModel().rows
  }
  return (
    <div className="relative w-full h-full overflow-auto touch-none">
      <Table>
        <TableHeader className="sticky top-0 z-[1] bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody className="relative">
          {rows({
            pageIndex: (pagination.skip / pagination.limit),
            pageSize: pagination.limit
          }).map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="sticky bottom-0 z-[1] bg-background">
          <TableRow  >
            <TableCell colSpan={d.type.length} className="p-0.5">
              <div className="flex items-center justify-end gap-2 px-1  ">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ skip: pagination.skip - pagination.limit, limit: pagination.limit })}
                  disabled={pagination.skip == 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ skip: pagination.skip + pagination.limit, limit: pagination.limit })}
                  disabled={d.rows.length == 0}
                >
                  Next
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div >
  );
}
