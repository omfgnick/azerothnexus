from collections.abc import Iterable


class AggregationService:
    source_priority = ["blizzard", "raiderio", "warcraftlogs"]

    def merge_records(self, records: Iterable[dict]) -> dict:
        merged: dict = {}
        for source_name in self.source_priority:
            for record in records:
                if record.get("source") == source_name:
                    merged.update({k: v for k, v in record.items() if v is not None})
        return merged

    def deduplicate_labels(self, values: list[str]) -> list[str]:
        seen = set()
        output = []
        for value in values:
            if value in seen:
                continue
            seen.add(value)
            output.append(value)
        return output
