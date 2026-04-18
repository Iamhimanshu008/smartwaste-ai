import client from './client';

export const getBins = async () => {
    const res = await client.get('/public/bins');
    return res.data;
};

export const submitPublicReport = async (formData) => {
  try {
    const response = await client.post('/public/report', formData, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        // Remove Content-Type so axios sets it with correct boundary
        delete headers['Content-Type'];
        return data;
      },
      timeout: 120000,
    });
    return response.data;
  } catch (error) {
    console.log('Upload error details:', JSON.stringify(error));
    if (error.response) {
      console.log('Server response:', error.response.status, error.response.data);
      throw new Error(error.response?.data?.detail || 'Server rejected the upload');
    } else if (error.request) {
      console.log('No response received:', error.request);
      throw new Error('No response from server — check internet connection');
    } else {
      throw new Error(error.message || 'Network Error');
    }
  }
};

export const getReportStatus = async (id) => {
    const res = await client.get(`/public/report/${id}/status`);
    return res.data;
};

export const getLiveStatus = async () => {
    const res = await client.get('/public/live-status');
    return res.data;
};
