import os, re, requests
from urllib.parse import urlparse

with open('font-faces.css') as file:
  for line in file:
    if 'src: url(' in line:
      urls = re.findall(r'url\(([a-zA-Z0-9:\/\/.-]*)\)', line)
      for url in urls:
        fn = os.path.basename(urlparse(url).path)
        r = requests.get(url)
        open('./fonts/' + fn, 'wb').write(r.content)