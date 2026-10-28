"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Customer,
  createCustomer,
  getCustomersByCompany,
} from "@/api/customers";

interface CustomerSelectProps {
  companyId?: number;
  value?: number | null;
  onChange: (customerId: number | null) => void;
}

const NO_CUSTOMER = "none";

export function CustomerSelect({
  companyId,
  value,
  onChange,
}: CustomerSelectProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      setCustomers(await getCustomersByCompany(companyId));
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Gagal memuat daftar customer");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!companyId || !newName.trim()) {
      toast.error("Nama customer wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const created = await createCustomer({
        companyId,
        name: newName.trim(),
      });
      setCustomers((prev) => [...prev, created]);
      onChange(created.id);
      setNewName("");
      setAdding(false);
      toast.success("Customer berhasil ditambahkan");
    } catch (error) {
      const message = (
        error as { response?: { data?: { message?: string } } }
      )?.response?.data?.message;
      toast.error(message || "Gagal menambah customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={value ? String(value) : NO_CUSTOMER}
        onValueChange={(v) => onChange(v === NO_CUSTOMER ? null : Number(v))}
        disabled={loading}
      >
        <SelectTrigger className="text-sm bg-white">
          <SelectValue placeholder="Pilih customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CUSTOMER}>Tanpa customer</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={String(customer.id)}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {adding ? (
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="Nama customer baru"
            className="text-sm bg-white"
          />
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={saving}
          >
            {saving ? "..." : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAdding(false);
              setNewName("");
            }}
          >
            Batal
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAdding(true)}
          disabled={!companyId}
        >
          + Customer baru
        </Button>
      )}
    </div>
  );
}

export default CustomerSelect;