import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl = "https://javachatbot.onrender.com/chat"

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string> {
    return this.http.post(this.apiUrl, message, { responseType: "text" })
  }
}

