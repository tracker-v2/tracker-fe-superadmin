import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ConfirmCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (code: string) => Promise<void>;
  action: "PROCESS_ON" | "PROCESS_OFF";
  isLoading: boolean;
}

export const ConfirmCodeDialog = ({
  open,
  onOpenChange,
  onConfirm,
  action,
  isLoading,
}: ConfirmCodeDialogProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Kode konfirmasi tidak boleh kosong");
      return;
    }

    setError("");
    await onConfirm(code);
  };

  const handleClose = () => {
    setCode("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {action === "PROCESS_ON" 
              ? "Aktifkan Kendaraan" 
              : "Nonaktifkan Kendaraan"}
          </DialogTitle>
          <DialogDescription>
            Masukkan kode konfirmasi untuk{" "}
            {action === "PROCESS_ON" ? "mengaktifkan" : "menonaktifkan"} kendaraan.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Kode Konfirmasi</Label>
              <Input
                id="code"
                type="text"
                placeholder="Masukkan kode konfirmasi"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                disabled={isLoading}
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={
                action === "PROCESS_ON"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Konfirmasi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};