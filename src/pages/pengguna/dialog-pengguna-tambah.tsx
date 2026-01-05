import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useState } from "react";

function DialogPenggunaTambah({ open, setDialogPengguna }: { open: boolean; setDialogPengguna: (value: "tambah" | "edit" | null) => void }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const isFormValid = form.username && form.email && form.password && form.confirmPassword && form.phoneNumber && form.password === form.confirmPassword;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <Dialog open={open} onOpenChange={() => setDialogPengguna(null)}>
      <DialogContent aria-description="new-user-content" className="max-w-[868px] bg-white" type="right">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Data Pengingat Service</DialogDescription>
        <form className="grid gap-4 mt-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-5">
            {/* USER NAME */}
            <div className="flex flex-col space-y-2 relative">
              <Label htmlFor="username" className="text-gray-600">
                Nama Pengguna
              </Label>
              <div className="relative">
                <Input id="username" type="name" placeholder="Nama Pengguna" value={form.username} onChange={handleChange} className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col space-y-2 relative">
              <Label htmlFor="password" className="text-gray-600">
                Password
              </Label>
              <div className="relative">
                <Input id="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* EMAIL */}
            <div className="flex flex-col space-y-2 relative">
              <Label htmlFor="email" className="text-gray-600">
                E-mail
              </Label>
              <div className="relative">
                <Input id="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col space-y-2 relative">
              <Label htmlFor="confirmPassword" className="text-gray-600">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Konfirmasi Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className=" relative space-y-2">
              <Label htmlFor="phoneNumber" className="text-gray-600">
                Nomor Telepon
              </Label>
              <div className="relative">
                <Input id="phoneNumber" type="text" placeholder="Nomor Telepon" value={form.phoneNumber} onChange={handleChange} className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
            </div>
          </div>

          <div className=" w-full flex justify-between">
            <Button type="button" variant={"outline"} onClick={() => setDialogPengguna(null)} className="bg-transparent ">
              Batal
            </Button>

            <Button type="submit" onClick={() => setDialogPengguna(null)} className="bg-blue-900 disabled:bg-gray-600" disabled={!isFormValid}>
              Tambah Pengguna
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default DialogPenggunaTambah;
