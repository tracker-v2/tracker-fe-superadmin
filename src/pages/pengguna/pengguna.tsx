// ui components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// lib
import { useEffect, useState, ChangeEvent } from "react";

// types
import { User } from "@/types/user";

// api
import { getUserByCompanyApi } from "@/api/auth";

//icon
import { ChevronDown, Plus, Search } from "lucide-react";
import DialogPengguna from "./dialog-pengguna";

export default function Pengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>("Pengguna Aktif");
  const [dialogPengguna, setDialogPengguna] = useState<"tambah" | "edit" | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const usersData = await getUserByCompanyApi(token);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Gagal fetch pengguna:", error);
      }
    };

    fetchUsers();
  }, []);

  function handleReportSelect(report: string) {
    setSelectedReport(report);
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  // Filter data berdasarkan search dan status
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phoneNumber || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchStatus =
      selectedReport === "Pengguna Aktif" ? user.isVerified : !user.isVerified;

    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="h-full max-h-screen overflow-y-auto flex flex-col">
        <h1 className="p-2 text-sidebar-foreground text-xl font-semibold">
          PENGGUNA
        </h1>
        <div className="bg-white rounded-xl h-screen p-6 mt-4 flex flex-col w-full">
          {/* HEADER */}
          <div className="flex items-center gap-2">
            {/* FILTER STATUS DROPDOWN */}
            <div className="md:w-1/4 min-w-[284px] w-full max-w-[300px]">
              <p className="mb-2 font-medium">Filter Status</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-muted-foreground justify-between"
                  >
                    {selectedReport}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="min-w-[284px] max-w-[300px]"
                  align="start"
                >
                  {["Pengguna Aktif", "Pengguna Nonaktif"].map((report) => (
                    <DropdownMenuItem
                      key={report}
                      onClick={() => handleReportSelect(report)}
                    >
                      {report}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* SEARCH */}
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2.5 relative">
                <label htmlFor="search">Cari Pengguna</label>
                <Search
                  size={16}
                  className="absolute left-3 top-11 text-gray-400"
                />
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="border rounded-md h-10 pl-10 pr-4 w-full placeholder:text-gray-500"
                  placeholder="Cari Pengguna"
                />
              </div>
            </form>

            {/* BUTTON TAMBAH */}
            <Button
              asChild
              onClick={() => setDialogPengguna("tambah")}
              className="bg-blue-900 px-2 cursor-pointer gap-x-1 hover:bg-blue-600 ms-auto"
            >
              <div>
                <Plus size={16} />
                <span className="text-primary-foreground text-sm font-medium">
                  Tambah Pengguna
                </span>
              </div>
            </Button>
          </div>
          {/* HEADER */}

          {/* TABLE */}
          <Table className="mt-10">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-primary text-base">
                  Nama Pengguna
                </TableHead>
                <TableHead className="font-semibold text-primary text-base">
                  Nomor Telepon
                </TableHead>
                <TableHead className="font-semibold text-primary text-base">
                  Alamat Email
                </TableHead>
                <TableHead className="font-semibold text-primary text-base">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="font-medium text-sm">
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.phoneNumber || "Tidak ada nomor telepon"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Button
                        className={`text-center px-2.5 rounded-full py-0.5 text-primary-foreground h-5 min-w-12 flex items-center justify-center text-xs ${
                          user.isVerified ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {user.isVerified ? "Aktif" : "Nonaktif"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Tidak ada pengguna ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DialogPengguna
        dialogPengguna={dialogPengguna}
        setDialogPengguna={setDialogPengguna}
      />
    </>
  );
}
