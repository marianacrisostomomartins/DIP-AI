export interface User {
  id: string;
  email: string;
}

export interface Canvas {
  id: string;
  name: string;
  owner: User;
  users: User[];
  canvas_state: CanvasState;
}

export interface CanvasState {
  fields: FieldState[];
  suggestion_error?: string;
}

export interface CanvasStateResponse {
  name: string;
  canvas_state: CanvasState;
}

export interface FieldState {
  id: number;
  title: string;
  question: string;
  question_suggestion?: string;
  answer_suggestion?: string;
  answer?: string;
}

export interface FieldAnswer {
  answer: string;
}

export interface Job {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface ApiError {
  detail: string;
}
