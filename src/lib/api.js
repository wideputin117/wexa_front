const BASE_URL = '/api';

// Safe checking for localStorage since Next.js runs on server during SSR
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wexa_token');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('wexa_token', token);
    } else {
      localStorage.removeItem('wexa_token');
    }
  }
};

export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('wexa_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setStoredUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('wexa_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wexa_user');
    }
  }
};

export const getStoredTenant = () => {
  if (typeof window !== 'undefined') {
    const tenant = localStorage.getItem('wexa_tenant');
    return tenant ? JSON.parse(tenant) : null;
  }
  return null;
};

export const setStoredTenant = (tenant) => {
  if (typeof window !== 'undefined') {
    if (tenant) {
      localStorage.setItem('wexa_tenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('wexa_tenant');
    }
  }
};

export const logout = () => {
  setAuthToken(null);
  setStoredUser(null);
  setStoredTenant(null);
};

const request = async (method, path, body = null) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong.');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${method} ${path}:`, error.message);
    throw error;
  }
};

export const api = {
  // Authentication
  auth: {
    signup: async (name, email, password, organizationName, role) => {
      const data = await request('POST', '/auth/signup', { name, email, password, organizationName, role });
      setAuthToken(data.token);
      setStoredUser(data.user);
      setStoredTenant(data.tenant);
      return data;
    },
    login: async (email, password) => {
      const data = await request('POST', '/auth/login', { email, password });
      setAuthToken(data.token);
      setStoredUser(data.user);
      setStoredTenant(data.tenant);
      return data;
    },
    me: async () => {
      const data = await request('GET', '/auth/me');
      setStoredUser(data.user);
      setStoredTenant(data.tenant);
      return data;
    }
  },

  // Products Catalog
  products: {
    list: async (search = '', status = '') => {
      let path = '/products';
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const queryStr = params.toString();
      if (queryStr) path += `?${queryStr}`;
      
      return request('GET', path);
    },
    getManufacturerProducts: async (tenantId) => {
      return request('GET', `/products/manufacturer/${tenantId}`);
    },
    create: async (productData) => {
      return request('POST', '/products', productData);
    },
    update: async (id, productData) => {
      return request('PUT', `/products/${id}`, productData);
    },
    delete: async (id) => {
      return request('DELETE', `/products/${id}`);
    }
  },

  // Purchase Orders
  orders: {
    list: async () => {
      return request('GET', '/orders');
    },
    get: async (id) => {
      return request('GET', `/orders/${id}`);
    },
    create: async (manufacturerId, items) => {
      return request('POST', '/orders', { manufacturerId, items });
    },
    updateStatus: async (id, status) => {
      return request('PUT', `/orders/${id}/status`, { status });
    }
  },

  // Analytics
  analytics: {
    get: async () => {
      return request('GET', '/analytics');
    },
    manufacturers: async () => {
      return request('GET', '/analytics/manufacturers');
    }
  }
};
