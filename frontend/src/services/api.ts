import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  Canvas, 
  CanvasState, 
  CanvasStateResponse,
  FieldAnswer, 
  Job
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('API_BASE_URL:', API_BASE_URL);

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private getFormHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'ngrok-skip-browser-warning': 'true',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('handleResponse - Status:', response.status, 'OK:', response.ok);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('Erro da resposta:', errorData);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      
      // Verificar se é erro de autenticação (401 ou mensagens relacionadas)
      if (response.status === 401 || 
          errorMessage.includes('Could not validate credentials') ||
          errorMessage.includes('Not authenticated') ||
          errorMessage.includes('Invalid authentication credentials')) {
        console.log('Token expirado, removendo credenciais e redirecionando para login');
        this.logout();
        // Redirecionar para login
        window.location.href = '/login';
        return Promise.reject(new ApiError(response.status, 'Sessão expirada. Redirecionando para login...'));
      }
      
      console.log('Lançando erro:', errorMessage);
      throw new ApiError(response.status, errorMessage);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('JSON parseado:', jsonData);
      return jsonData;
    }
    const textData = response.text() as any;
    console.log('Retornando como texto:', textData);
    return textData;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Iniciando login para:', credentials.username);
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    console.log('Fazendo requisição para:', `${API_BASE_URL}/token`);
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });

    console.log('Resposta recebida:', response.status, response.statusText);
    const result = await this.handleResponse<AuthResponse>(response);
    console.log('Resultado parseado:', result);
    
    // Store token in localStorage
    localStorage.setItem('access_token', result.access_token);
    localStorage.setItem('user_email', credentials.username);
    
    return result;
  }

  async register(data: RegisterData): Promise<boolean> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData
    });

    return this.handleResponse<boolean>(response);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  // Canvas endpoints
  async createCanvas(name: string): Promise<Canvas> {
    const response = await fetch(`${API_BASE_URL}/create_canvas?name=${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Canvas>(response);
  }

  async listCanvases(): Promise<Canvas[]> {
    const response = await fetch(`${API_BASE_URL}/list_canvas`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Canvas[]>(response);
  }

  async deleteCanvas(canvasId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<boolean>(response);
  }

  async editCanvas(canvasId: string, name: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/canvas/edit/${canvasId}?name=${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<boolean>(response);
  }

  async getCanvasState(canvasId: string): Promise<CanvasStateResponse> {
    const response = await fetch(`${API_BASE_URL}/canvas/state/${canvasId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<CanvasStateResponse>(response);
  }

  async inviteUser(canvasId: string, email: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/canvas/invite/${canvasId}?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<boolean>(response);
  }

  // Field endpoints
  async updateFieldSync(canvasId: string, fieldId: string, answer: FieldAnswer): Promise<CanvasStateResponse> {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/field/${fieldId}/sync`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(answer)
    });

    return this.handleResponse<CanvasStateResponse>(response);
  }

  async updateFieldAsync(canvasId: string, fieldId: string, answer: FieldAnswer): Promise<{ job_id: string; name: string; canvas_state: CanvasState }> {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/field/${fieldId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(answer)
    });

    return this.handleResponse<{ job_id: string; name: string; canvas_state: CanvasState }>(response);
  }

  async getJobStatus(canvasId: string, jobId: string): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/job/${jobId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Job>(response);
  }

  // Utility method for polling job status
  async pollJobUntilComplete(canvasId: string, jobId: string, intervalMs: number = 2000): Promise<Job> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getJobStatus(canvasId, jobId);
          
          if (job.status === 'completed' || job.status === 'failed') {
            resolve(job);
          } else {
            setTimeout(poll, intervalMs);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

export const apiClient = new ApiClient();
export { ApiError };
