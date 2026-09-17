"""Download originals from the registered official URLs; reject HTML responses."""
import argparse
from urllib.request import Request, urlopen
from authentic_pipeline import ROOT, SOURCES

def fetch(overwrite=False):
    for _, name, url, _, _ in SOURCES:
        path = ROOT / 'data/raw' / name
        if path.exists() and not overwrite:
            if not path.read_bytes().startswith(b'%PDF-'):
                raise ValueError(f'Existing file is not PDF: {name}')
            print(f'Kept {name}')
            continue
        with urlopen(Request(url, headers={'User-Agent': 'BISynapse-source-collection/1.0'}), timeout=45) as response:
            data = response.read()
        if not data.startswith(b'%PDF-'):
            raise ValueError(f'Official server returned non-PDF content: {url}')
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix('.download')
        temporary.write_bytes(data)
        temporary.replace(path)
        print(f'Downloaded {name}: {len(data)} bytes')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--overwrite', action='store_true')
    fetch(parser.parse_args().overwrite)
