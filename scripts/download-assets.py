"""Vendor the imagery supplied in code.html and the site's fonts."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin
import re
import subprocess

def urlretrieve(url, destination):
    subprocess.run(['curl', '-fsSL', url, '-o', str(destination)], check=True)

class Response:
    def __init__(self, url): self.url = url
    def read(self): return subprocess.check_output(['curl', '-fsSL', self.url])

def urlopen(url): return Response(url)

ROOT = Path(__file__).resolve().parent.parent

class Images(HTMLParser):
    urls = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'img' and 'Logo' not in attrs.get('alt', ''):
            self.urls.append(attrs['src'])

parser = Images()
parser.feed((ROOT / 'code.html').read_text())
for name, url in zip(['field-dispatch', 'shrimp-farm', 'biofloc-research'], dict.fromkeys(parser.urls)):
    try:
        urlretrieve(url, ROOT / f'public/assets/images/{name}.jpg')
    except Exception:
        photo = {'field-dispatch': '34744021', 'shrimp-farm': '37198845', 'biofloc-research': '2131904'}[name]
        urlretrieve(f'https://images.pexels.com/photos/{photo}/pexels-photo-{photo}.jpeg?auto=compress&cs=tinysrgb&w=1600', ROOT / f'public/assets/images/{name}.jpg')
    print(f'Vendored {name}')

css = urlopen('https://fonts.maateen.me/kalpurush/font.css').read().decode()
url = re.search(r'url\([\'\"]?([^\)\'\"]+\.ttf)[\'\"]?\)', css)
if not url:
    raise RuntimeError('Kalpurush TTF not found in font stylesheet')
font_url = urljoin('https://fonts.maateen.me/kalpurush/font.css', url.group(1))
if font_url.startswith('//'):
    font_url = 'https:' + font_url
elif font_url.startswith('/'):
    font_url = 'https://fonts.maateen.me' + font_url
urlretrieve(font_url, ROOT / 'public/assets/fonts/kalpurush.ttf')
print('Vendored Kalpurush')

font_css = urlopen('https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap').read().decode()
for index, font_url in enumerate(dict.fromkeys(re.findall(r'url\(([^)]+)\)', font_css))):
    suffix = font_url.rsplit('.', 1)[-1]
    filename = f'editorial-{index}.{suffix}'
    urlretrieve(font_url, ROOT / 'public/assets/fonts' / filename)
    font_css = font_css.replace(font_url, '/assets/fonts/' + filename)
(ROOT / 'public/assets/fonts/editorial.css').write_text(font_css)
print('Vendored editorial fonts')
