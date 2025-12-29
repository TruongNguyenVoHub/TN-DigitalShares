'use client';

import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from 'react';

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className = '', ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={`w-full text-sm text-left ${className}`}
        {...props}
      />
    </div>
  )
);

Table.displayName = 'Table';

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <thead ref={ref} className={`bg-gray-50 ${className}`} {...props} />
  )
);

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <tbody ref={ref} className={`divide-y divide-gray-200 ${className}`} {...props} />
  )
);

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => (
    <tr ref={ref} className={`hover:bg-gray-50 transition-colors ${className}`} {...props} />
  )
);

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <th
      ref={ref}
      className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`}
      {...props}
    />
  )
);

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <td ref={ref} className={`px-6 py-4 whitespace-nowrap ${className}`} {...props} />
  )
);

TableCell.displayName = 'TableCell';
