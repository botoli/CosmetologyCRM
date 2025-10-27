const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  async login(phoneOrEmail, password) {
    try {
      console.log('🔍 Sending login request to:', `${API_BASE_URL}/auth/login`);
      console.log('📤 Request data:', { phoneOrEmail, password: '***' });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneOrEmail, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);

      const responseText = await response.text();
      console.log('📥 Response text:', responseText);

      if (!responseText) {
        console.error('❌ EMPTY RESPONSE - Server returned no data');
        throw new Error('Empty response from server - check server logs');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('❌ Response that failed to parse:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        console.error('❌ Server error response:', data);
        // Исправлено: правильно обрабатываем ошибку от сервера
        throw new Error(data.error || `HTTP ${response.status}: Login failed`);
      }

      console.log('✅ Login successful:', data);
      return data;
    } catch (error) {
      console.error('💥 Login error details:', {
        name: error.name,
        message: error.message,
      });

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server is not responding');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error(
          `Network error: Cannot connect to server at ${API_BASE_URL}. Check if server is running and CORS is configured.`,
        );
      }

      // Пробрасываем оригинальную ошибку с сообщением от сервера
      throw error;
    }
  },

  async register(userData) {
    try {
      console.log('🔍 Sending register request to:', `${API_BASE_URL}/auth/register`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Register response status:', response.status);

      const responseText = await response.text();
      console.log('📥 Register response text:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async adminLogin(email, password) {
    try {
      console.log('🔍 Sending admin login request to:', `${API_BASE_URL}/auth/admin/login`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Admin login response status:', response.status);

      const responseText = await response.text();
      console.log('📥 Admin login response text:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },
};
