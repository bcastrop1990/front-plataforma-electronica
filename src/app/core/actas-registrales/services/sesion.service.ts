import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private token: string | null = null;

  constructor() {
    this.token = this.getToken();
  }

  setToken(token: string): void {
    this.token = token;
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = sessionStorage.getItem('token');
    }
    return this.token;
  }

  clearSession(): void {
    this.token = null;
    sessionStorage.removeItem('token');
  }
}
