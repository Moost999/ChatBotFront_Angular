import { Component, type ElementRef, type OnInit, ViewChild, signal, effect, model } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { HttpClientModule } from "@angular/common/http"
import { trigger, style, animate, transition } from "@angular/animations"
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"
import type { Message } from "../../models/chat.model"
import { ChatService } from "../../services/chat.service"

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
  animations: [
    trigger("messageAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(20px)" }),
        animate("300ms ease-out", style({ opacity: 1, transform: "translateY(0)" })),
      ]),
    ]),
  ],
})
export class ChatComponent implements OnInit {
  @ViewChild("messagesContainer") messagesContainer!: ElementRef
  @ViewChild("messageInput") messageInput!: ElementRef

  messages = signal<Message[]>([])
  inputMessage = model<string>("")
  isLoading = signal<boolean>(false)

  // Regular property for two-way binding
  messageText = ""

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
  ) {
    // Auto-scroll when messages change
    effect(() => {
      const messagesValue = this.messages()
      if (messagesValue.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100)
      }
    })
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus()
    }, 0)
  }

  sendMessage(): void {
    const message = this.messageText.trim()
    if (!message) return

    // Add user message
    this.messages.update((msgs) => [...msgs, { role: "user", content: message }])

    // Clear input and set loading
    this.messageText = ""
    this.isLoading.set(true)

    // Send to backend
    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        this.messages.update((msgs) => [...msgs, { role: "assistant", content: response }])
        this.isLoading.set(false)
      },
      error: (error) => {
        console.error("Error sending message:", error)
        this.messages.update((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content: "Sorry, I couldn't process that request. Please try again later.",
          },
        ])
        this.isLoading.set(false)
      },
    })
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      this.sendMessage()
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight
    } catch (err) {}
  }

  // Method to handle pre-prompt buttons
  usePrompt(prompt: string): void {
    this.messageText = prompt

    // Focus the input field after setting the text
    setTimeout(() => {
      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.focus()

        // Place cursor at the end of the text
        const length = this.messageText.length
        this.messageInput.nativeElement.setSelectionRange(length, length)
      }
    }, 0)
  }

  // Method to clear chat history
  clearChat(): void {
    // Only clear if there are messages
    if (this.messages().length > 0) {
      // You could add a confirmation dialog here if desired
      this.messages.set([])

      // Focus the input field after clearing
      setTimeout(() => {
        this.messageInput?.nativeElement?.focus()
      }, 0)
    }
  }

  // Format message content with Markdown-like syntax
  formatMessage(content: string): SafeHtml {
    if (!content) return ""

    // Process headers
    let formatted = content
      // H1 headers (with equals signs underneath)
      .replace(/^(.+)\n=+\s*$/gm, "<h1>$1</h1>")
      // H2 headers (with dashes underneath)
      .replace(/^(.+)\n-+\s*$/gm, "<h2>$1</h2>")
      // Alternative H1 and H2 with # syntax
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")

      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

      // Lists (simple implementation)
      .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")

      // Horizontal rules
      .replace(/^-{3,}$/gm, "<hr>")

      // Paragraphs (ensure double line breaks create paragraphs)
      .replace(/\n\n/g, "</p><p>")

      // Preserve line breaks within paragraphs
      .replace(/\n/g, "<br>")

    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith("<h1>") && !formatted.startsWith("<h2>") && !formatted.startsWith("<p>")) {
      formatted = "<p>" + formatted + "</p>"
    }

    // Process lists (wrap consecutive <li> elements in <ol> or <ul>)
    formatted = formatted.replace(/(<li>.*?<\/li>)+/g, (match) => "<ol>" + match + "</ol>")

    // Return sanitized HTML
    return this.sanitizer.bypassSecurityTrustHtml(formatted)
  }
}

