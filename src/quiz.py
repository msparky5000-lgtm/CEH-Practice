
import customtkinter as ctk


class QuizPage(ctk.CTkFrame):
    """
    Clean replacement for the original QuizPage.

    This version removes bookmarks and embedded results widgets.
    It is intended as a stable base to build on.
    """

    def __init__(self, parent, quiz_data):
        super().__init__(parent)

        self.parent = parent
        self.quiz_data = quiz_data
        self.chapter = quiz_data["chapter"]
        self.questions = quiz_data["questions"]

        self.current = 0
        self.answers = {}
        self.checked = False
        self.score = 0

        self.results = []

        self.selected = ctk.StringVar(value="")

        self.build_ui()
        self.load_question()

    def build_ui(self):
        self.pack(fill="both", expand=True)

        self.title = ctk.CTkLabel(
            self,
            text=self.chapter,
            font=("Segoe UI", 26, "bold")
        )
        self.title.pack(pady=15)

        self.progress = ctk.CTkLabel(self, text="")
        self.progress.pack()

        self.question = ctk.CTkLabel(
            self,
            text="",
            wraplength=900,
            justify="left",
            font=("Segoe UI", 20, "bold"),
        )
        self.question.pack(fill="x", padx=30, pady=20)

        self.answers_frame = ctk.CTkFrame(self)
        self.answers_frame.pack(fill="x", padx=30)

        nav = ctk.CTkFrame(self)
        nav.pack(fill="x", padx=30, pady=20)

        self.prev_btn = ctk.CTkButton(
            nav,
            text="◀ Previous",
            command=self.previous_question
        )
        self.prev_btn.pack(side="left")

        self.check_btn = ctk.CTkButton(
            nav,
            text="Check",
            command=self.check_answer
        )
        self.check_btn.pack(side="left", padx=10)

        self.next_btn = ctk.CTkButton(
            nav,
            text="Next ▶",
            command=self.next_question
        )
        self.next_btn.pack(side="right")

        self.finish_btn = ctk.CTkButton(
            nav,
            text="Finish",
            command=self.finish_quiz
        )
        self.finish_btn.pack(side="right", padx=10)

    def load_question(self):
        self.checked = False

        q = self.questions[self.current]

        self.progress.configure(
            text=f"Question {self.current + 1} of {len(self.questions)}"
        )

        self.question.configure(text=q["question"])

        for w in self.answers_frame.winfo_children():
            w.destroy()

        self.selected.set(self.answers.get(self.current, ""))

        self.radio_buttons = []

        for answer in q["answers"]:
            rb = ctk.CTkRadioButton(
                self.answers_frame,
                text=answer,
                value=answer[0],
                variable=self.selected,
            )
            rb.pack(anchor="w", pady=6)

            self.radio_buttons.append(rb)

        self.prev_btn.configure(
            state="disabled" if self.current == 0 else "normal"
        )

        self.next_btn.configure(state="disabled")

    def check_answer(self):
        if self.checked:
            return

        choice = self.selected.get()

        if not choice:
            return

        self.answers[self.current] = choice

        question = self.questions[self.current]
        correct = question["correct"]

        selected_text = ""
        correct_text = ""

        # Find the full answer text
        for answer in question["answers"]:

            if answer.startswith(choice):
                selected_text = answer

            if answer.startswith(correct):
                correct_text = answer

        # Update score ONCE
        if choice == correct:
            self.score += 1

        # Save result ONCE
        self.results.append({
            "chapter": question.get("chapter", "Unknown"),
            "question": question["question"],
            "selected": selected_text,
            "correct": correct_text,
            "is_correct": choice == correct
        })

        # Highlight answers
        for rb in self.radio_buttons:

            letter = rb.cget("text")[0]

            if letter == correct:
                rb.configure(fg_color="green")

            elif letter == choice:
                rb.configure(fg_color="red")

            rb.configure(state="disabled")

        self.checked = True
        self.next_btn.configure(state="normal")

    def next_question(self):
        if self.current < len(self.questions) - 1:
            self.current += 1
            self.load_question()

    def previous_question(self):
        if self.current > 0:
            self.current -= 1
            self.load_question()

    def finish_quiz(self):
                """Display the quiz results."""
    
                for widget in self.winfo_children():
                    widget.destroy()
    
                total = len(self.questions)
                score = self.score
                percent = (score / total * 100) if total else 0
                incorrect = total - score
    
                if percent >= 90:
                    rating = "🏆 Outstanding"
                    colour = "#2ECC71"
                elif percent >= 75:
                    rating = "✅ Good"
                    colour = "#F1C40F"
                elif percent >= 50:
                    rating = "📚 Needs Revision"
                    colour = "#E67E22"
                else:
                    rating = "❌ Keep Practising"
                    colour = "#E74C3C"
    
                ctk.CTkLabel(
                    self,
                    text="🎉 Quiz Complete",
                    font=("Segoe UI", 34, "bold")
                ).pack(pady=(30, 15))
    
                ctk.CTkLabel(
                    self,
                    text=self.chapter,
                    font=("Segoe UI", 18)
                ).pack()
    
                card = ctk.CTkFrame(self, corner_radius=15)
                card.pack(padx=30, pady=25)
    
                ctk.CTkLabel(
                    card,
                    text=f"Score: {score}/{total}",
                    font=("Segoe UI", 28, "bold")
                ).pack(pady=(20, 10))
    
                ctk.CTkLabel(
                    card,
                    text=f"{percent:.1f}%",
                    font=("Segoe UI", 24)
                ).pack()
    
                progress = ctk.CTkProgressBar(card, width=350)
                progress.pack(pady=20)
                progress.set(percent / 100)
    
                ctk.CTkLabel(
                    card,
                    text=f"Correct: {score}"
                ).pack()
    
                ctk.CTkLabel(
                    card,
                    text=f"Incorrect: {incorrect}"
                ).pack()
    
                ctk.CTkLabel(
                    card,
                    text=rating,
                    text_color=colour,
                    font=("Segoe UI", 22, "bold")
                ).pack(pady=20)

                analytics = self.build_analytics()

                stats = ctk.CTkScrollableFrame(
                    self,
                    width=700,
                    height=250
                )
                stats.pack(padx=25, pady=20, fill="both")

                ctk.CTkLabel(
                    stats,
                    text="Performance by Chapter",
                    font=("Segoe UI", 22, "bold")
                ).pack(pady=(10, 20))

                best = None
                worst = None

                for chapter in sorted(analytics):

                    correct = analytics[chapter]["correct"]
                    total = analytics[chapter]["total"]

                    percent = correct / total * 100

                    if best is None or percent > best[1]:
                        best = (chapter, percent)

                    if worst is None or percent < worst[1]:
                        worst = (chapter, percent)

                    ctk.CTkLabel(
                        stats,
                        text=f"{chapter:<35} {correct}/{total} ({percent:.0f}%)",
                        anchor="w",
                        justify="left",
                        font=("Consolas", 15)
                    ).pack(fill="x", padx=15)

                ctk.CTkLabel(
                    stats,
                    text=f"\n🏆 Strongest: {best[0]} ({best[1]:.0f}%)",
                    font=("Segoe UI", 18, "bold")
                ).pack(pady=(20, 5))

                ctk.CTkLabel(
                    stats,
                    text=f"📚 Needs Revision: {worst[0]} ({worst[1]:.0f}%)",
                    font=("Segoe UI", 18, "bold")
                ).pack(pady=(0, 20))
    
                # -----------------------------
                # Navigation Buttons
                # -----------------------------

                buttons = ctk.CTkFrame(self)
                buttons.pack(pady=20)

                ctk.CTkButton(
                    buttons,
                    text="🔍 Review Incorrect Answers",
                    width=220,
                    command=self.review_incorrect
                ).grid(row=0, column=0, padx=8, pady=8)

                # Chapter quiz
                if self.quiz_data.get("chapter_file"):

                    ctk.CTkButton(
                        buttons,
                        text="🔄 Retry Chapter",
                        width=180,
                        command=lambda: self.parent.show_quiz(
                            self.quiz_data["chapter_file"]
                        )
                    ).grid(row=0, column=1, padx=8, pady=8)

                    ctk.CTkButton(
                        buttons,
                        text="📚 Chapters",
                        width=180,
                        command=self.parent.show_chapters
                    ).grid(row=0, column=2, padx=8, pady=8)

                # Practice Exam
                elif self.chapter == "CEH Practice Exam":

                    ctk.CTkButton(
                        buttons,
                        text="📝 New Practice Exam",
                        width=220,
                        command=self.parent.show_exam
                    ).grid(row=0, column=1, padx=8, pady=8)

                # Random Quiz
                else:

                    ctk.CTkButton(
                        buttons,
                        text="🎲 New Random Quiz",
                        width=220,
                        command=lambda: self.parent.show_random_quiz(20)
                    ).grid(row=0, column=1, padx=8, pady=8)

                ctk.CTkButton(
                    buttons,
                    text="🏠 Home",
                    width=180,
                    command=self.parent.show_home
                ).grid(row=0, column=3, padx=8, pady=8)


    def build_analytics(self):
        """
        Build analytics using every quiz question.

        Unanswered questions are counted as incorrect.
        """

        analytics = {}

        for index, question in enumerate(self.questions):

            chapter = question.get("chapter", "Unknown")

            if chapter not in analytics:
                analytics[chapter] = {
                    "correct": 0,
                    "total": 0
                }

            analytics[chapter]["total"] += 1

            selected = self.answers.get(index)

            if selected == question["correct"]:
                analytics[chapter]["correct"] += 1

        return analytics

    def review_incorrect(self):

        for widget in self.winfo_children():
            widget.destroy()

        title = ctk.CTkLabel(
            self,
            text="Review Incorrect Answers",
            font=("Segoe UI", 30, "bold")
        )
        title.pack(pady=20)

        frame = ctk.CTkScrollableFrame(self)
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        wrong = 0

        for result in self.results:

            if result["is_correct"]:
                continue

            wrong += 1

            card = ctk.CTkFrame(frame)
            card.pack(fill="x", pady=10)

            ctk.CTkLabel(
                card,
                text=result["question"],
                font=("Segoe UI", 18, "bold"),
                wraplength=850,
                justify="left"
            ).pack(anchor="w", padx=15, pady=(15,5))

            ctk.CTkLabel(
                card,
                text="❌ Your Answer",
                font=("Segoe UI",16,"bold")
            ).pack(anchor="w", padx=15)

            ctk.CTkLabel(
                card,
                text=result["selected"]
            ).pack(anchor="w", padx=35)

            ctk.CTkLabel(
                card,
                text="✅ Correct Answer",
                font=("Segoe UI",16,"bold")
            ).pack(anchor="w", padx=15, pady=(10,0))

            ctk.CTkLabel(
                card,
                text=result["correct"]
            ).pack(anchor="w", padx=35, pady=(0,15))

        if wrong == 0:
            ctk.CTkLabel(
                frame,
                text="🎉 Perfect Score! Nothing to review.",
                font=("Segoe UI",22,"bold")
            ).pack(pady=30)

        ctk.CTkButton(
            self,
            text="← Back to Results",
            command=self.finish_quiz
        ).pack(pady=20)

        