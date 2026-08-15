from pathlib import Path
from bs4 import BeautifulSoup
import json
import re

HTML_FOLDER = Path("html/original")
OUTPUT_FOLDER = Path("data/questions")

OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


def clean(text):
    """Remove extra whitespace."""
    return re.sub(r"\s+", " ", text).strip()


def parse_html(html_file):
    print(f"Processing {html_file.name}")

    with open(html_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "lxml")

    content = soup.find("section", id="content")

    if content is None:
        print("  ERROR: content section not found")
        return

    questions = []

    elements = content.find_all(["p", "ul", "div", "hr"])

    current = None

    for element in elements:

        # ------------------------
        # Question
        # ------------------------
        if element.name == "p":

            text = clean(element.get_text())

            if re.match(r"^(Q?\d+)\.", text):

                if current:
                    questions.append(current)

                current = {
                    "question": text,
                    "answers": [],
                    "correct": ""
                }

        # ------------------------
        # Answers
        # ------------------------
        elif element.name == "ul" and current:

            for li in element.find_all("li"):

                answer = clean(li.get_text())

                if answer:
                    current["answers"].append(answer)

        # ------------------------
        # Correct Answer
        # ------------------------
        elif (
            element.name == "div"
            and "collapse-content" in element.get("class", [])
            and current
        ):

            text = clean(element.get_text())

            match = re.search(r"The Correct Answer is:-\s*([A-Z])", text)

            if match:
                current["correct"] = match.group(1)

    if current:
        questions.append(current)

    output = {
        "chapter": html_file.stem,
        "question_count": len(questions),
        "questions": questions
    }

    outfile = OUTPUT_FOLDER / f"{html_file.stem}.json"

    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4)

    print(f"  Saved {len(questions)} questions")


def main():

    files = sorted(HTML_FOLDER.glob("*.html"))

    print(f"Found {len(files)} HTML files\n")

    for file in files:
        parse_html(file)


if __name__ == "__main__":
    main()