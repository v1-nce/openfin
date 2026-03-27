import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  username: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export type AuthResponse = { 
  message: string;
  user: User;
};

export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', data);
  return response.data;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export async function streamScrapeEvents(
  url: string,
  goal: string,
  onData: (data: any) => void,
  onComplete: () => void,
  onError: (err: any) => void
) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scrape?url=${encodeURIComponent(url)}&goal=${encodeURIComponent(goal)}`, {
            method: "POST",
            headers: {
                "Accept": "text/event-stream",
            },
            credentials: "include" // strictly required for persistent authenticated sessions via cookies
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let done = false;
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            onData(data);
                        } catch (err) {
                            console.error("Could not parse JSON event", line);
                        }
                    }
                }
            }
        }
        onComplete();
    } catch (err) {
        onError(err);
    }
}
