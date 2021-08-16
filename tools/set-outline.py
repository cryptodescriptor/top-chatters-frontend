from os import listdir

path = '../static/images/stars/'

for filename in listdir(path):
  if filename.endswith('.svg'):
    print(path + filename)
    buff = ''
    done = False
    fp = False
    with open(path + filename, 'r') as svg:
      for line in svg:
        if '<path' in line:
          fp = True
        elif '0.57512022;' in line and not done and fp:
          line = line.replace('0.57512022;', '0.47512022;') # outline
          lint = line.replace('50.79999924;', '49.79999924;') # mitre
          buff += line
          done = True
          continue
        buff += line
    out = open(path + filename.split('.')[0] + '.svg', 'w')
    out.write(buff)