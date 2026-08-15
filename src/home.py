import customtkinter as ctk


class HomePage(ctk.CTkFrame):
    """Home page for the CEH Practice App."""

    def __init__(self, parent):
        super().__init__(parent)

        self.parent = parent

        self.build_ui()

    def build_ui(self):
        # -----------------------------
        # Title
        # -----------------------------

        title = ctk.CTkLabel(
            self,
            text="CEH Practice App",
            font=("Segoe UI", 34, "bold")
        )
        title.pack(pady=(50, 10))

        subtitle = ctk.CTkLabel(
            self,
            text="Certified Ethical Hacker Study Suite",
            font=("Segoe UI", 18)
        )
        subtitle.pack(pady=(0, 40))

        # -----------------------------
        # Buttons
        # -----------------------------

        button_frame = ctk.CTkFrame(
            self,
            corner_radius=15
        )
        button_frame.pack(pady=20)

        buttons = [

            ("📚 Browse Chapters", self.parent.show_chapters),

            ("📝 Practice Exam (125 Questions)",
             self.parent.show_exam),

            ("🎲 Random Quiz",
             lambda: self.parent.show_random_quiz(20)),

            ("❌ Exit", self.parent.destroy)

        ]

        for text, command in buttons:

            button = ctk.CTkButton(
                button_frame,
                text=text,
                command=command,
                width=320,
                height=55,
                font=("Segoe UI", 18)
            )

            button.pack(
                padx=25,
                pady=15
            )

        # -----------------------------
        # Footer
        # -----------------------------

        footer = ctk.CTkLabel(
            self,
            text="Version 1.0",
            font=("Segoe UI", 12)
        )

        footer.pack(
            side="bottom",
            pady=20
        )