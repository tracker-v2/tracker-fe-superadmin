import axios from "@/lib/axios";

export interface Customer {
  id: number;
  companyId: number;
  name: string;
  address?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  picName?: string | null;
  picPhone?: string | null;
  isActive?: boolean;
}

export const getCustomersByCompany = async (
  companyId: number,
): Promise<Customer[]> => {
  const res = await axios.get("customers", {
    params: { companyId, limit: 100 },
  });
  return res.data.data;
};

export const createCustomer = async (data: {
  companyId: number;
  name: string;
}): Promise<Customer> => {
  const res = await axios.post("customers", data);
  return res.data.data;
};