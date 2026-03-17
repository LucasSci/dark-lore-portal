from __future__ import annotations

import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG_SOURCE = ROOT / "src" / "lib" / "in-game-shop.ts"
SOURCE_ROOT = Path(r"C:\Users\Lucas\Downloads\icones_tw3\Monti Icon Pack The Witcher 3 v1.0")
DESTINATION_DIR = ROOT / "public" / "shop-icons" / "tw3" / "sheets"
SHEET_NAMES = ["tw3_icon_1.png", "tw3_icon_2.png", "tw3_icon_3.png"]


def validate_catalog_has_sprite_mappings() -> None:
    source = CATALOG_SOURCE.read_text(encoding="utf-8")
    icon_assets = set(re.findall(r'iconAsset:\s*"([^"]+)"', source))
    mapped_assets = set(re.findall(r'^\s*(icon_tw3_[a-z0-9_]+):\s*\{', source, re.MULTILINE))
    missing = sorted(icon_assets - mapped_assets)

    if missing:
        raise RuntimeError(
            "Os itens abaixo nao possuem sprite mapeado em src/lib/in-game-shop.ts:\n"
            + "\n".join(missing)
        )


def sync_sheets() -> None:
    DESTINATION_DIR.mkdir(parents=True, exist_ok=True)

    for sheet_name in SHEET_NAMES:
        source_path = SOURCE_ROOT / sheet_name

        if not source_path.exists():
            raise FileNotFoundError(f"Folha de icones nao encontrada: {source_path}")

        shutil.copy2(source_path, DESTINATION_DIR / sheet_name)


def main() -> None:
    validate_catalog_has_sprite_mappings()
    sync_sheets()
    print(f"{len(SHEET_NAMES)} folhas de icones sincronizadas em {DESTINATION_DIR}")


if __name__ == "__main__":
    main()
