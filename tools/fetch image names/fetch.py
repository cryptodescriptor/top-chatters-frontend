from os import listdir
from os.path import isfile, join

rootFiles = [f.split('.')[0] for f in listdir('../static/images') if isfile(join('../static/images', f))]
starFiles = [f.split('.')[0] for f in listdir('../static/images/stars') if isfile(join('../static/images/stars', f))]

print(rootFiles)
print('\n')
print(starFiles)