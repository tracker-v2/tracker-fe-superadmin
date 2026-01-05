// ui components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// icon
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getProfileDashboardApi } from "@/api/auth";

export default function Profil() {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await getProfileDashboardApi(token);

        setData({
          username: response.user.username,
          email: response.user.email,
          noTelepon: response.user.phoneNumber || "tidak ada no telepon",
        });

        setDataCompany({
          companyName: response.company.name,
          companyEmail: response.company.email,
          companyNotelepon: response.company.phoneNumber,
          industry: response.company.industry || "tidak ada industri",
          companyAddress: response.company.address,
        });

        setOriginalCompanyData({
          companyName: response.company.name,
          companyEmail: response.company.email,
          companyNotelepon: response.company.phoneNumber,
          industry: response.company.industry,
          companyAddress: response.company.address,
        });
      } catch (error) {
        console.error("Gagal fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const [data, setData] = useState({
    username: "",
    email: "",
    noTelepon: "",
  });

  const [dataCompany, setDataCompany] = useState({
    companyName: "",
    companyEmail: "",
    companyNotelepon: "",
    industry: "",
    companyAddress: "",
  });

  const [edit, setEdit] = useState<{
    companyEdit: boolean;
  }>({
    companyEdit: false,
  });

  const [originalCompanyData, setOriginalCompanyData] = useState(dataCompany);

  function handleOnChangeUser(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleOnChangeCompany(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setDataCompany((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleOnEdit() {
    setEdit((prev) => ({ companyEdit: !prev.companyEdit }));
  }

  function handleOnSave() {
    setOriginalCompanyData(dataCompany);
    setEdit({ companyEdit: false });
  }

  const isCompanyDataChanged =
    dataCompany.companyName !== originalCompanyData.companyName ||
    dataCompany.industry !== originalCompanyData.industry;

  return (
    <div className="h-full max-h-screen overflow-y-auto flex flex-col space-y-4 p-4">
      <h1 className="text-sidebar-foreground text-xl font-semibold">
        PROFIL
      </h1>
      <div className="bg-white rounded-xl p-6 flex flex-col min-h-fit w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="text-lg text-foreground font-medium">
              {data.username}
            </h1>
          </div>
        </div>
        {/* HEADER */}

        <div className="w-full flex flex-col">
          <h1 className="text-lg font-medium text-foreground">Akun Pengguna</h1>
          {/* <p className="text-gray-600 text-sm font-normal mb-5">
            Informasi akun pengguna tidak dapat diubah. Silakan hubungi administrator untuk perubahan data.
          </p> */}
          <form className="flex gap-4 mt-5 flex-col items-start">
            {/* NAMA PENGGUNA */}
            <div className="flex flex-col space-y-2 w-full">
              <Label htmlFor="username" className="text-gray-600 text-base">
                Nama Pengguna
              </Label>

              <Input
                readOnly={true}
                type="text"
                id="username"
                name="username"
                value={data.username}
                onChange={handleOnChangeUser}
                className="bg-gray-50 w-full text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* EMAIL & NO TELEPON */}
            <div className="flex gap-5 w-full">
              <div className="flex flex-col space-y-2 w-full">
                <Label htmlFor="email" className="text-gray-600 text-base">
                  E-mail
                </Label>
                <Input
                  readOnly={true}
                  type="email"
                  id="email"
                  name="email"
                  value={data.email}
                  className="bg-gray-50 w-full text-gray-500 cursor-not-allowed"
                  onChange={handleOnChangeUser}
                />
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <Label htmlFor="noTelepon" className="text-gray-600 text-base">
                  Nomor Telepon
                </Label>
                <Input
                  readOnly={true}
                  type="text"
                  id="noTelepon"
                  name="noTelepon"
                  value={data.noTelepon}
                  className="bg-gray-50 w-full text-gray-500 cursor-not-allowed"
                  onChange={handleOnChangeUser}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 flex flex-col min-h-fit w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col space-y-2">
            <h1 className="text-foreground text-lg font-medium">
              Info Perusahaan
            </h1>
            <p className="text-gray-600 text-sm font-normal">
              Anda hanya dapat mengedit nama perusahaan dan industri. Untuk informasi lainnya, 
              silakan hubungi tim Widya Matador Tracker.
            </p>
          </div>

          {edit.companyEdit ? (
            <div className="space-x-2 flex items-center">
              <Button
                type="button"
                className="bg-transparent border border-gray-950 text-stone-950 hover:bg-gray-200 text-sm text-primary font-medium cursor-pointer"
                onClick={() => handleOnEdit()}
              >
                Batal
              </Button>

              <Button
                type="button"
                disabled={!isCompanyDataChanged}
                className={`border border-border text-primary-foreground text-sm font-medium cursor-pointer ${
                  isCompanyDataChanged
                    ? "bg-blue-900 hover:bg-blue-800"
                    : "bg-gray-500 hover:bg-gray-500"
                }`}
                onClick={() => handleOnSave()}
              >
                Simpan
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="bg-transparent border border-border text-stone-950 hover:bg-gray-200 text-sm text-primary font-medium cursor-pointer"
              onClick={() => handleOnEdit()}
            >
              <Pencil size={16} className="mr-2" />
              Edit
            </Button>
          )}
        </div>
        {/* HEADER */}

        <div className="w-full flex flex-col">
          <form className="flex flex-col items-start">
            {/* NAMA PENGGUNA */}

            {/* EMAIL & NO TELEPON */}
            <div className="flex gap-5 w-full">
              <div className="flex flex-col space-y-2 w-full">
                <Label
                  htmlFor="companyName"
                  className="text-gray-600 text-base"
                >
                  Nama
                </Label>
                <Input
                  readOnly={!edit.companyEdit}
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={dataCompany.companyName}
                  className={`w-full text-stone-950 ${
                    edit.companyEdit 
                      ? "bg-white border-gray-300 focus:border-blue-500" 
                      : "bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  onChange={handleOnChangeCompany}
                />
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <Label
                  htmlFor="companyEmail"
                  className="text-gray-600 text-base"
                >
                  E-mail
                </Label>
                <Input
                  readOnly={true}
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  value={dataCompany.companyEmail}
                  className="bg-gray-50 w-full text-gray-500 cursor-not-allowed"
                  onChange={handleOnChangeCompany}
                />
              </div>
            </div>

            {/* NO TELEPON & INDUSTRI */}
            <div className="flex gap-5 w-full">
              <div className="flex flex-col space-y-2 w-full">
                <Label
                  htmlFor="companyNotelepon"
                  className="text-gray-600 text-base"
                >
                  Nomor Telepon
                </Label>
                <Input
                  readOnly={true}
                  type="text"
                  id="companyNotelepon"
                  name="companyNotelepon"
                  value={dataCompany.companyNotelepon}
                  className="bg-gray-50 w-full text-gray-500 cursor-not-allowed"
                  onChange={handleOnChangeCompany}
                />
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <Label htmlFor="industry" className="text-gray-600 text-base">
                  Pilih Industri Anda
                </Label>
                <Input
                  readOnly={!edit.companyEdit}
                  type="text"
                  id="industry"
                  name="industry"
                  value={dataCompany.industry}
                  className={`w-full text-stone-950 ${
                    edit.companyEdit 
                      ? "bg-white border-gray-300 focus:border-blue-500" 
                      : "bg-gray-50 text-gray-500 cursor-not-allowed"
                  }`}
                  onChange={handleOnChangeCompany}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <Label
                htmlFor="companyAddress"
                className="text-gray-600 text-base"
              >
                Alamat Perusahaan
              </Label>

              <Input
                readOnly={true}
                type="text"
                id="companyAddress"
                name="companyAddress"
                value={dataCompany.companyAddress}
                onChange={handleOnChangeCompany}
                className="bg-gray-50 w-full text-gray-500 cursor-not-allowed"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
