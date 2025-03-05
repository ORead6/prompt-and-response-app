"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "lucide-react"

const LowPriority = 1;

interface ToolbarsProps {
  currPromptId?: string;
}

// TableSizeDialog Component
function TableSizeDialog({ onSizeConfirm } : { onSizeConfirm: (rows: number, columns: number) => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSizeConfirm(Number(rows), Number(columns));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-muted`}
          title="Table"
        >
          <Table size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table Dimensions</DialogTitle>
          <DialogDescription>
            Enter the number of rows and columns for your table.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rows" className="text-right">
                Rows
              </Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="50"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="columns" className="text-right">
                Columns
              </Label>
              <Input
                id="columns"
                type="number"
                min="1"
                max="50"
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TableSizeDialog;