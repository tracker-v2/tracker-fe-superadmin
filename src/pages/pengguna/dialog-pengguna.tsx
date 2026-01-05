import { DialogPenggunaEdit } from "./dialog-pengguna-edit";
import DialogPenggunaTambah from "./dialog-pengguna-tambah";

type PropsDialogPengguna = {
  dialogPengguna: "tambah" | "edit" | null;
  setDialogPengguna: (value: "tambah" | "edit" | null) => void;
};

export default function DialogPengguna({ dialogPengguna, setDialogPengguna }: PropsDialogPengguna) {
  if (dialogPengguna === "edit") {
    return <DialogPenggunaEdit open={!!dialogPengguna} setDialogPengguna={setDialogPengguna} />;
  }

  return <DialogPenggunaTambah open={!!dialogPengguna} setDialogPengguna={setDialogPengguna} />;
}
