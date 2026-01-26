import axios from "@/lib/axios";

export interface CreateCompanyPayload {
  name: string;
  address: string;
  email: string;
  codeConfirm: string;
  phoneNumber: string;
  industryType: string;
  picName: string;
  picPhone: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const getCompaniesApi = async () => {
    const res = await axios.get("/companies");
    return res.data.data;
}

export const createCompanyApi = async (companyData: CreateCompanyPayload) => {
    const res = await axios.post("/companies", companyData);
    return res.data.data;
}

export const updateCompanyApi = async (id: number, companyData: Partial<CreateCompanyPayload>) => {
    const res = await axios.put(`/companies/${id}`, companyData);
    return res.data.data;
}

export const deleteCompanyApi = async (id: number) => {
    const res = await axios.delete(`/companies/${id}`);
    return res.data.data;
}