import json
from urllib import error, request

from app.core.config import settings
from app.domain.models import Recipe


class OpenAIReasonProvider:
    API_URL = "https://api.openai.com/v1/responses"

    def is_enabled(self) -> bool:
        return settings.ai_reason_enabled and bool(settings.openai_api_key)

    def generate_reason(
        self,
        recipe: Recipe,
        owned: list[str],
        missing: list[str],
        theme: str | None,
    ) -> str | None:
        if not self.is_enabled():
            return None

        prompt = {
            "recipe_title": recipe.title,
            "theme": theme,
            "owned_ingredients": owned,
            "missing_ingredients": missing,
            "cooking_time": recipe.cooking_time,
        }
        payload = {
            "model": settings.openai_model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You write one short Korean sentence explaining why a recipe fits the user's ingredients. "
                        "Be concrete, avoid hype, and mention missing ingredients only if needed."
                    ),
                },
                {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
            ],
            "max_output_tokens": 60,
        }
        req = request.Request(
            self.API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.openai_api_key}",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=10) as response:
                body = json.loads(response.read().decode("utf-8"))
        except (error.URLError, error.HTTPError, TimeoutError, json.JSONDecodeError):
            return None

        return body.get("output_text")
