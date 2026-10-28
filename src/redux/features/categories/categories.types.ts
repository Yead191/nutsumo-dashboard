export interface CatalogService {
  _id: string;
  name: string;
  slug: string;
  category: ServiceCategory | string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  servicesCount?: number;
  services?: string[];
  serviceList?: CatalogService[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: ServiceCategory[];
}

export interface SingleCategoryResponse {
  success: boolean;
  message: string;
  data: ServiceCategory & { services?: CatalogService[] };
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
  imageFile?: File | null;
}

export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  imageFile?: File | null;
}

export interface ServicesResponse {
  success: boolean;
  message: string;
  data: CatalogService[];
}

export interface SingleServiceResponse {
  success: boolean;
  message: string;
  data: CatalogService;
}

export interface CreateServicePayload {
  name: string;
  category: string;
  description?: string;
  isActive?: boolean;
  imageFile?: File | null;
}

export interface UpdateServicePayload {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  imageFile?: File | null;
}
