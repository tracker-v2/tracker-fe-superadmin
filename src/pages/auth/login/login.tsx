import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { getProfileApi, loginApi } from "@/api/auth";
import { Eye, EyeOff } from "lucide-react";

// Components
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Assets
import excashantui from "@/assets/excashantui.webp";
import matador from "@/assets/matador.png";
import { AxiosError } from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const token = await loginApi(email, password);
      setToken(token);
      const userProfile = await getProfileApi(token);

      // ✅ VALIDASI ROLE SUPER_ADMIN
      if (userProfile.role !== 'super_admin') {
        setErrorMessage("Akses ditolak. Anda bukan Super Admin.");
        setToken("");
        return;
      }

      useAuthStore.getState().setUser(userProfile);
      navigate("/dashboard");
    } catch (err: unknown) {
      let msg = "Login gagal, periksa kembali data Anda.";

      if (err instanceof AxiosError && err.response?.data?.message) {
        msg = err.response.data.message;
      }

      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-2 h-screen flex bg-white'>
      {/* Kiri - Form */}
      <div className='w-[704px] h-full flex flex-col justify-center'>
        <div className='flex justify-center'>
          <img src={matador} alt='matador' className='w-[168px] pt-6' />
        </div>

        <div className='my-auto'>
          <div className='flex flex-col items-center gap-2 text-center mt-10 mb-16'>
            <h1 className='text-4xl font-semibold'>Selamat Datang di Matador Super Admin</h1>
            <p className='text-balance text-base text-muted-foreground'>Masukkan email dan password untuk mengakses akun Anda</p>
          </div>

          <div className='flex justify-center'>
            <form onSubmit={handleLogin} className='w-[568px] space-y-6'>
              <div className='space-y-4'>
                <div className='flex flex-col gap-4 '>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' placeholder='Email' required className='bg-white' value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className='relative flex flex-col gap-4'>
                  <Label htmlFor='email' >Kata sandi</Label>
                  <Input id='password' type={showPassword ? "text" : "password"} placeholder='Kata sandi' required className='bg-white pr-10' value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type='button' className='absolute   right-3 top-12 -translate-y-1/2 text-gray-500' onClick={() => setShowPassword((prev) => !prev)} aria-label='Toggle password visibility'>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className='flex items-center justify-between'>
                  <label className='text-sm flex items-center text-gray-400'>
                    <input type='checkbox' className='mr-2 ' /> Tetap Masuk
                  </label>
                  <ForgotPasswordDialog />
                </div>
              </div>

              {errorMessage && <div className='text-sm text-red-600'>{errorMessage}</div>}

              <Button type='submit' className='w-full hover:bg-blue-700 bg-blue-900' disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <p className='text-base text-muted-foreground text-start'>Situs ini menggunakan cookie. Dengan melanjutkan, Anda menyetujui penggunaan cookie.</p>
            </form>
          </div>
        </div>
      </div>

      {/* Kanan - Gambar */}
      <div className='relative flex-1 h-full w-full'>
        <img src={excashantui} alt='excavator' className='h-full rounded-3xl w-full object-cover' />
      </div>
    </div>
  );
}