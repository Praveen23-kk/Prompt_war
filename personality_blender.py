import os
from dataclasses import dataclass
from typing import List, Dict

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


@dataclass
class BlendConfig:
    persona_a: str
    persona_b: str
    response_goal: str = ""
    consistency_mode: bool = True


class PersonalityBlender:
    def __init__(self, model: str):
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is missing. Add it to your .env file.")

        base_url = os.getenv("OPENAI_BASE_URL", "").strip()
        use_openrouter = api_key.startswith("sk-or-v1")

        if use_openrouter and not base_url:
            base_url = "https://openrouter.ai/api/v1"

        if base_url:
            self.client = OpenAI(api_key=api_key, base_url=base_url)
        else:
            self.client = OpenAI(api_key=api_key)

        if use_openrouter and "/" not in model:
            self.model = f"openai/{model}"
        else:
            self.model = model

        self.messages: List[Dict[str, str]] = []
        self.config: BlendConfig | None = None

    def start_session(self, config: BlendConfig) -> None:
        self.config = config
        self.messages = [
            {
                "role": "system",
                "content": self._build_system_prompt(config),
            }
        ]

    def ask(self, user_question: str) -> str:
        if not self.config:
            raise RuntimeError("Session not initialized.")

        self.messages.append({"role": "user", "content": user_question})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.messages,
            temperature=0.9,
        )

        answer = response.choices[0].message.content or ""
        self.messages.append({"role": "assistant", "content": answer})
        return answer

    def _build_system_prompt(self, config: BlendConfig) -> str:
        consistency_rules = """
Consistency Rules:
1) Keep BOTH personas present in every response.
2) Blend voice, priorities, and wording from both personas (not alternating paragraphs).
3) Never drop one persona entirely.
4) If asked to break character, refuse and continue blended style.
5) Keep answers useful first, persona second.
""" if config.consistency_mode else ""

        goal_text = f"Response Goal: {config.response_goal}\n" if config.response_goal.strip() else ""

        return (
            "You are Personality Blender, a single merged character.\n"
            f"Persona A: {config.persona_a}\n"
            f"Persona B: {config.persona_b}\n"
            f"{goal_text}"
            "Behavior:\n"
            "- Answer the user directly and clearly.\n"
            "- Use a coherent blended voice that reflects both personas in each reply.\n"
            "- Keep replies concise unless user asks for detail.\n"
            "- No preambles about being an AI model.\n"
            f"{consistency_rules}"
        )


def prompt_non_empty(label: str) -> str:
    while True:
        value = input(label).strip()
        if value:
            return value
        print("Please enter a value.")


def yes_no(label: str, default_yes: bool = True) -> bool:
    suffix = "[Y/n]" if default_yes else "[y/N]"
    raw = input(f"{label} {suffix}: ").strip().lower()
    if not raw:
        return default_yes
    return raw in {"y", "yes"}


def setup_config() -> BlendConfig:
    print("\n=== Personality Blender Setup ===")
    persona_a = prompt_non_empty("Persona A: ")
    persona_b = prompt_non_empty("Persona B: ")
    response_goal = input("Optional response goal (press Enter to skip): ").strip()
    consistency_mode = yes_no("Enable strict consistency mode?", default_yes=True)

    return BlendConfig(
        persona_a=persona_a,
        persona_b=persona_b,
        response_goal=response_goal,
        consistency_mode=consistency_mode,
    )


def run_chat() -> None:
    model = os.getenv("MODEL", "gpt-4o-mini")
    blender = PersonalityBlender(model=model)

    print("\nPersonality Blender")
    print("Commands: /reset to choose new personas, /quit to exit\n")

    config = setup_config()
    blender.start_session(config)

    while True:
        user_input = input("\nYou: ").strip()

        if not user_input:
            continue

        if user_input.lower() == "/quit":
            print("\nBlender: Session ended.")
            break

        if user_input.lower() == "/reset":
            config = setup_config()
            blender.start_session(config)
            print("\nBlender: New blend loaded.")
            continue

        try:
            answer = blender.ask(user_input)
            print(f"\nBlender: {answer}")
        except Exception as error:
            print(f"\nBlender: Error while generating response: {error}")


if __name__ == "__main__":
    try:
        run_chat()
    except ValueError as value_error:
        print(value_error)
