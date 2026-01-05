import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Pencil } from "lucide-react";
import { currentUser } from "@/lib/constant";
import { Label } from "@/components/ui/label";

export function DialogPenggunaEdit({ open, setDialogPengguna }: { open: boolean; setDialogPengguna: (value: "tambah" | "edit" | null) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    username: currentUser.username,
    email: currentUser.email,
    phone: currentUser.phone,
    password: currentUser.password,
    confirmPassword: currentUser.password,
  });
  const [dialogConfirm, setDialogConfirm] = useState(false);
  const [isActive, setIsActive] = useState(currentUser.isActive);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormChanged = form.username !== currentUser.username || form.email !== currentUser.email || form.phone !== currentUser.phone || form.password !== currentUser.password || form.confirmPassword !== currentUser.password;

  return (
    <>
      <Dialog open={open} onOpenChange={() => setDialogPengguna(null)}>
        <DialogContent aria-description="edit-user-content" className="max-w-[932px] bg-white gap-0 rounded-2xl">
          <DialogHeader className="mb-2 py-[11px]">
            <DialogTitle>Profile Pengguna</DialogTitle>
          </DialogHeader>
          <DialogDescription className="hidden">Edit Pengguna Form</DialogDescription>

          <form className="grid gap-4  border border-slate-300 p-6 rounded-[18px]">
            <div className="flex items-center justify-between">
              <h1 className="text-foreground font-medium text-lg">Akun Pengguna</h1>

              <div className="flex justify-end gap-2 ">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)} variant="outline" className="bg-white">
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button type="submit" variant={"outline"} onClick={() => setDialogPengguna(null)} className="bg-transparent ">
                      Batal
                    </Button>
                    <Button type="button" onClick={() => setIsEditing(false)} disabled={!isFormChanged} className="bg-blue-900 disabled:bg-gray-600">
                      Simpan
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {/* USER NAME */}
              <div className="flex flex-col space-y-2 relative">
                <Label htmlFor="username" className="text-gray-600">
                  Nama Pengguna
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="name"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Nama Pengguna"
                    className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col space-y-2 relative">
                <Label htmlFor="password" className="text-gray-600">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Password"
                    className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
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
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
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
                    name="confirmPassword"
                    disabled={!isEditing}
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
                  <Input
                    id="phoneNumber"
                    type="text"
                    placeholder="Nomor Telepon"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border border-border bg-white pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="mt-4 border rounded-xl p-4 space-y-2">
            <p className="font-medium">Nonaktifkan Pengguna</p>
            <p className="text-sm text-muted-foreground">Silahkan klik button dibawah ini untuk menonaktifkan pengguna</p>
            {currentUser.isActive ? (
              <Button variant="outline" onClick={() => setDialogConfirm(true)} className=" text-red-500 bg-white border-red-500 hover:bg-slate-200 hover:text-red-500">
                <span className="flex items-center gap-1">
                  <Lock />
                  Nonaktifkan Pengguna
                </span>
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setDialogConfirm(true)} className=" text-green-500 bg-white border-green-500 hover:bg-slate-200 hover:text-green-500">
                <span className="flex items-center gap-1">
                  <LockOpen />
                  Aktifkan Pengguna
                </span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogConfirm} onOpenChange={setDialogConfirm}>
        <DialogContent aria-description="active-user-content" className="w-[640px] ">
          <DialogHeader>
            <DialogTitle>Nonaktifkan Pengguna</DialogTitle>
          </DialogHeader>
          <DialogDescription className="hidden">
            Apakah anda yakin akan {isActive ? "menonaktifkan" : "mengaktifkan"} <strong>{currentUser.username}</strong>?
          </DialogDescription>
          <p className="text-sm mb-4">
            Apakah anda yakin akan {isActive ? "menonaktifkan" : "mengaktifkan"} <strong>{currentUser.username}</strong>?
          </p>
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={() => setDialogConfirm(false)} className="border border-slate-300">
              Batal
            </Button>

            <Button
              className="bg-blue-900 hover:bg-blue-800 text-white"
              onClick={() => {
                setIsActive(!isActive);
                setDialogConfirm(false);
              }}
            >
              Konfirmasi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
