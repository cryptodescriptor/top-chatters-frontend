import re

with open('make-static.html') as file:
  for line in file:
    if 'src="' in line:
      src = line.split('src="')[1].split('"')[0]
      print(line.split('src="')[0] + 'src="{{ url_for(\'static\', filename=\'' + src[1:] + '\') }}"' + re.findall(r'src=\"[^\"]*\"(.*)', line)[0].rstrip())
    else:
      print(line.rstrip())