"use client";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/ui";
import type { AdminUser } from "@/lib/api/types";
import { AdminUserIdentity, AdminUserStatus, LastLogin, RoleBadge } from "./AdminUserParts";

// The table is for large screens only (below `lg` the screen shows cards).
const COLUMNS = 5;
const cell = "px-3";

function Head() {
  return (
    <TableHead>
      <tr>
        <TableHeaderCell className={cell}>الحساب</TableHeaderCell>
        <TableHeaderCell className={cell}>الدور</TableHeaderCell>
        <TableHeaderCell className={cell}>الحالة</TableHeaderCell>
        <TableHeaderCell className={cell}>آخر دخول</TableHeaderCell>
        <TableHeaderCell className={cell}>
          <span className="sr-only">إجراءات</span>
        </TableHeaderCell>
      </tr>
    </TableHead>
  );
}

export function AdminUsersTableSkeleton() {
  return (
    <Table>
      <Head />
      <TableBody>
        <TableSkeletonRows rows={4} columns={COLUMNS} />
      </TableBody>
    </Table>
  );
}

type AdminUsersTableProps = {
  users: AdminUser[];
  /** The signed-in account. */
  selfId: number;
  onOpen: (user: AdminUser) => void;
};

export function AdminUsersTable({ users, selfId, onOpen }: AdminUsersTableProps) {
  return (
    <Table>
      <Head />
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className={cell}>
              <AdminUserIdentity user={user} isSelf={user.id === selfId} className="max-w-80" />
            </TableCell>
            <TableCell className={cell}>
              <RoleBadge user={user} />
            </TableCell>
            <TableCell className={cell}>
              <AdminUserStatus user={user} />
            </TableCell>
            <TableCell className={cell}>
              <LastLogin user={user} />
            </TableCell>
            <TableCell className={`${cell} text-end`}>
              <Button size="sm" variant="secondary" onClick={() => onOpen(user)}>
                تعديل
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
