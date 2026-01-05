// react
import { useState } from "react";

// ui
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="ml-auto text-sm text-blue-700 underline p-0 h-auto"
        >
          Lupa password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            Jika anda mengalami kesulitan mengakses akun, silahkan hubungi
            kontak dibawah ini untuk bantuan lebih lanjut.
          </DialogTitle>
          <DialogDescription className="py-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/social-media/whatsapp.png"
                alt="whatsapp"
                className="w-6"
              />
              <p className="text-base font-medium text-gray-900">
                +62 861-5423-6754
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/social-media/gmail.png"
                alt="whatsapp"
                className="w-6"
              />
              <p className="text-base font-medium text-gray-900">
                widyamatadortracker@gmail.com
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img
                src="/src/assets/social-media/instagram.png"
                alt="whatsapp"
                className="w-6"
              />
              <p className="text-base font-medium text-gray-900">
                @widyamatador
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
