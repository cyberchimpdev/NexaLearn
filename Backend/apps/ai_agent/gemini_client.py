from __future__ import annotations

import json
import time
from typing import Any

from django.conf import settings


class GeminiClient:
    def __init__(self) -> None:
        self.last_error = ""
        self.last_model = ""
        self.last_tried_models: list[str] = []
        self.last_available_models: list[str] = []
        self._client = None

    @property
    def api_key(self) -> str:
        return str(getattr(settings, "GEMINI_API_KEY", "") or "").strip()

    @property
    def primary_model(self) -> str:
        return str(
            getattr(settings, "GEMINI_MODEL", "gemini-flash-lite-latest")
            or "gemini-flash-lite-latest"
        ).strip()

    @property
    def max_output_tokens(self) -> int:
        return int(getattr(settings, "GEMINI_MAX_OUTPUT_TOKENS", 700) or 700)

    @property
    def temperature(self) -> float:
        return float(getattr(settings, "GEMINI_TEMPERATURE", 0.2) or 0.2)

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def get_client(self):
        if self._client is not None:
            return self._client

        from google import genai

        self._client = genai.Client(api_key=self.api_key)
        return self._client

    def model_candidates(self) -> list[str]:
        candidates = [
            self.primary_model,
            "gemini-flash-lite-latest",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash",
        ]

        unique: list[str] = []
        seen: set[str] = set()

        for model in candidates:
            if model and model not in seen:
                seen.add(model)
                unique.append(model)

        return unique

    def list_available_models(self) -> list[str]:
        self.last_available_models = []

        if not self.is_configured():
            self.last_error = "GEMINI_API_KEY is missing or not loaded."
            return []

        try:
            client = self.get_client()
            models = client.models.list()

            available: list[str] = []

            for model in models:
                model_name = getattr(model, "name", "") or ""

                if not model_name:
                    continue

                model_text = str(model)

                if "generateContent" in model_text:
                    available.append(model_name.replace("models/", ""))

            self.last_available_models = available
            return available

        except Exception as exc:
            self.last_error = f"Gemini model listing failed: {exc}"
            return []

    def generate_text(
        self,
        prompt: str,
        *,
        max_output_tokens: int | None = None,
        response_mime_type: str | None = None,
    ) -> dict[str, Any]:
        self.last_error = ""
        self.last_model = ""
        self.last_tried_models = []

        if not self.is_configured():
            self.last_error = "GEMINI_API_KEY is missing or not loaded."
            return self._failed()

        try:
            from google.genai import types
        except Exception as exc:
            self.last_error = f"google-genai import failed: {exc}"
            return self._failed()

        client = self.get_client()

        output_limit = max_output_tokens or self.max_output_tokens

        config_kwargs: dict[str, Any] = {
            "temperature": self.temperature,
            "max_output_tokens": output_limit,
        }

        if response_mime_type:
            config_kwargs["response_mime_type"] = response_mime_type

        config = types.GenerateContentConfig(**config_kwargs)

        last_error = ""

        for model_name in self.model_candidates():
            self.last_tried_models.append(model_name)

            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )

                text = getattr(response, "text", "") or ""
                text = text.strip()

                if text:
                    self.last_model = model_name
                    return {
                        "ok": True,
                        "text": text,
                        "model": model_name,
                        "error": "",
                        "tried_models": self.last_tried_models,
                        "available_models": self.last_available_models,
                    }

                last_error = "Gemini returned an empty response."

            except Exception as exc:
                last_error = str(exc)

                if "429" in last_error or "RESOURCE_EXHAUSTED" in last_error:
                    time.sleep(0.5)
                    continue

                if "404" in last_error or "NOT_FOUND" in last_error:
                    continue

                continue

        self.last_error = last_error or "Gemini request failed."
        return self._failed()

    def generate_json_object(
        self,
        prompt: str,
        *,
        max_output_tokens: int = 1200,
    ) -> dict[str, Any] | None:
        result = self.generate_text(
            prompt,
            max_output_tokens=max_output_tokens,
            response_mime_type="application/json",
        )

        if not result["ok"]:
            return None

        return self._parse_json_object(result["text"])

    def generate_json_list(
        self,
        prompt: str,
        *,
        max_output_tokens: int = 1800,
    ) -> list[dict[str, Any]] | None:
        result = self.generate_text(
            prompt,
            max_output_tokens=max_output_tokens,
            response_mime_type="application/json",
        )

        if not result["ok"]:
            return None

        return self._parse_json_list(result["text"])

    def _failed(self) -> dict[str, Any]:
        return {
            "ok": False,
            "text": "",
            "model": "",
            "error": self.last_error,
            "tried_models": self.last_tried_models,
            "available_models": self.last_available_models,
        }

    def _clean_json_text(self, text: str) -> str:
        cleaned = text.strip()
        cleaned = cleaned.removeprefix("```json").strip()
        cleaned = cleaned.removeprefix("```").strip()
        cleaned = cleaned.removesuffix("```").strip()
        return cleaned

    def _parse_json_object(self, text: str) -> dict[str, Any] | None:
        cleaned = self._clean_json_text(text)

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            start = cleaned.find("{")
            end = cleaned.rfind("}")

            if start == -1 or end == -1 or end <= start:
                self.last_error = "Gemini returned text, but no valid JSON object was found."
                return None

            try:
                parsed = json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError as exc:
                self.last_error = f"Gemini JSON object parse failed: {exc}"
                return None

        if not isinstance(parsed, dict):
            self.last_error = "Gemini JSON was not an object."
            return None

        return parsed

    def _parse_json_list(self, text: str) -> list[dict[str, Any]] | None:
        cleaned = self._clean_json_text(text)

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            start = cleaned.find("[")
            end = cleaned.rfind("]")

            if start == -1 or end == -1 or end <= start:
                self.last_error = "Gemini returned text, but no valid JSON array was found."
                return None

            try:
                parsed = json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError as exc:
                self.last_error = f"Gemini JSON array parse failed: {exc}"
                return None

        if not isinstance(parsed, list):
            self.last_error = "Gemini JSON was not an array."
            return None

        cleaned_items = [item for item in parsed if isinstance(item, dict)]

        if not cleaned_items:
            self.last_error = "Gemini JSON array did not contain valid objects."
            return None

        return cleaned_items


gemini_client = GeminiClient()
