"""
Scrape design-related assets from a list of reference sites.

This script fetches each URL in the `URLS` list, parses the HTML for
images and linked CSS stylesheets, and downloads them into a local
`assets` directory named after the domain. It uses the requests and
BeautifulSoup libraries. The user can run this script locally to
collect color palettes, background images, or other design inspiration
from fantasy‑themed websites.

Note: Always respect a website's terms of service and robots.txt rules
before scraping. Many commercial sites disallow automated scraping. This
code is provided for educational purposes only and may not work on
sites protected by Cloudflare or other anti-bot technologies.
"""

import os
import re
from urllib.parse import urljoin, urlparse
from pathlib import Path
import requests
from bs4 import BeautifulSoup

# List of reference URLs to scrape. You can add more URLs here.
URLS = [
    "https://www.leagueoflegends.com/pt-br/champions/",  # LoL Universe champions
    "https://www.thewitcher.com/en/witcher-universe",  # The Witcher universe
    "https://d4.wowhead.com/guide/diablo-4/world-lore",  # Example Diablo lore page
    "https://roll20.net/help/center/roll20/tabletop",  # Roll20 help center (tabletop overview)
]

# Base directory for downloaded assets
ASSETS_DIR = Path("assets")

def sanitize_filename(name: str) -> str:
    """Sanitize a filename by removing invalid characters."""
    return re.sub(r"[^a-zA-Z0-9-_\.]+", "_", name)


def download_file(url: str, dest: Path):
    """Download a file from `url` to `dest` if it doesn't already exist."""
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            return
        print(f"Downloading {url} -> {dest}")
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        dest.write_bytes(resp.content)
    except Exception as e:
        print(f"Failed to download {url}: {e}")


def scrape_site(url: str):
    """Scrape images and stylesheets from a single website."""
    print(f"Scraping {url}")
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return

    soup = BeautifulSoup(response.text, "html.parser")
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace(".", "_")
    base_path = ASSETS_DIR / sanitize_filename(domain)

    # Scrape images
    for img in soup.find_all("img"):
        src = img.get("src")
        if not src:
            continue
        # Convert relative to absolute URL
        img_url = urljoin(url, src)
        # Skip data URIs
        if img_url.startswith("data:"):
            continue
        # Determine filename
        filename = sanitize_filename(os.path.basename(urlparse(img_url).path))
        if not filename:
            continue
        dest = base_path / "images" / filename
        download_file(img_url, dest)

    # Scrape linked stylesheets
    for link in soup.find_all("link", rel=lambda x: x and "stylesheet" in x):
        href = link.get("href")
        if not href:
            continue
        css_url = urljoin(url, href)
        filename = sanitize_filename(os.path.basename(urlparse(css_url).path) or "style.css")
        dest = base_path / "css" / filename
        download_file(css_url, dest)


def main():
    for url in URLS:
        scrape_site(url)
    print("Scraping completed.")


if __name__ == "__main__":
    main()