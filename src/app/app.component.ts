import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet } from "@angular/router"
import { ChatComponent } from "./components/chat/chat.component"
import { HttpClientModule } from "@angular/common/http"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, ChatComponent, HttpClientModule],
  template: `<app-chat></app-chat>`,
})
export class AppComponent {
  title = "angular-chatbot"
}

