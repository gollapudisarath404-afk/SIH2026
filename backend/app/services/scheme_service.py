import json
import logging
import os
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class SchemeService:
    def __init__(self) -> None:
        self._schemes: List[Dict[str, Any]] = []
        self._announcements: List[Dict[str, Any]] = []
        self._categories: List[Dict[str, Any]] = []
        self._states: List[str] = []

    def load_schemes(self, directory_path: str) -> None:
        if not os.path.exists(directory_path):
            raise FileNotFoundError(f"Schemes directory not found at: {directory_path}")

        loaded: List[Dict[str, Any]] = []
        for filename in sorted(os.listdir(directory_path)):
            if not filename.endswith(".json"):
                continue
            file_path = os.path.join(directory_path, filename)
            with open(file_path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if not isinstance(payload, list):
                raise ValueError(f"JSON content in {filename} must be a list of schemes.")
            loaded.extend(payload)
            logger.info("Loaded %s schemes from %s", len(payload), filename)

        self._schemes = loaded
        data_dir = os.path.dirname(directory_path)
        self._announcements = self._load_json_list(os.path.join(data_dir, "announcements.json"))
        self._categories = self._load_json_list(os.path.join(data_dir, "categories.json"))
        states_payload = self._load_json_list(os.path.join(data_dir, "states.json"))
        self._states = [item["name"] if isinstance(item, dict) else str(item) for item in states_payload]
        logger.info("Total schemes loaded: %s", len(self._schemes))

    def _load_json_list(self, path: str) -> List[Any]:
        if not os.path.exists(path):
            return []
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, list) else []

    def get_all_schemes(self) -> List[Dict[str, Any]]:
        return self._schemes

    def get_scheme_by_id(self, scheme_id: int) -> Optional[Dict[str, Any]]:
        for scheme in self._schemes:
            if scheme.get("id") == scheme_id:
                return scheme
        return None

    def get_announcements(self) -> List[Dict[str, Any]]:
        return self._announcements

    def get_categories(self) -> List[Dict[str, Any]]:
        return self._categories

    def get_states(self) -> List[str]:
        return self._states

    def filter_schemes(
        self,
        category: Optional[str] = None,
        state: Optional[str] = None,
        query: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        results = list(self._schemes)
        if category:
            category_lower = category.lower()
            results = [s for s in results if str(s.get("category", "")).lower() == category_lower]
        if state:
            state_lower = state.lower()
            filtered = []
            for scheme in results:
                available = [str(item).lower() for item in scheme.get("availableStates", [])]
                if "all" in available or "all india" in available or state_lower in available:
                    filtered.append(scheme)
            results = filtered
        if query:
            results = self.search_schemes(query, results)
        return results

    def search_schemes(
        self,
        query: str,
        source: Optional[List[Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        if not query:
            return list(source if source is not None else self._schemes)

        query_lower = query.lower()
        pool = source if source is not None else self._schemes
        matching: List[Dict[str, Any]] = []
        string_fields = [
            "name",
            "shortName",
            "category",
            "subCategory",
            "description",
            "ministry",
            "governmentLevel",
        ]
        list_fields = ["beneficiaries", "tags", "searchKeywords"]

        for scheme in pool:
            matched = False
            for field in string_fields:
                value = scheme.get(field)
                if isinstance(value, str) and query_lower in value.lower():
                    matched = True
                    break
            if not matched:
                for field in list_fields:
                    values = scheme.get(field)
                    if isinstance(values, list) and any(
                        isinstance(item, str) and query_lower in item.lower() for item in values
                    ):
                        matched = True
                        break
            if matched:
                matching.append(scheme)
        return matching


scheme_service = SchemeService()
