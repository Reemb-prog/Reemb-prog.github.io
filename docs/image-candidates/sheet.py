import json,sys,os,time,urllib.request,io
from PIL import Image,ImageDraw
d=sys.argv[1]; r=json.load(open(os.path.join(d,'wm.json')))
os.makedirs(os.path.join(d,'th'),exist_ok=True)
for k,L in r.items():
  tiles=[]
  for i,x in enumerate(L):
    p=os.path.join(d,'th',f'{k}_{i}.jpg')
    if not os.path.exists(p):
      try:
        b=urllib.request.urlopen(urllib.request.Request(x['thumb'],headers={'User-Agent':'portfolio-image-search/1.0'}),timeout=30).read(); open(p,'wb').write(b); time.sleep(0.4)
      except Exception as e: print('ERR',k,i,e); continue
    try: im=Image.open(p).convert('RGB'); im.thumbnail((300,220)); tiles.append((i,im))
    except: pass
  S=Image.new('RGB',(4*310,2*250),'white'); D=ImageDraw.Draw(S)
  for n,(i,im) in enumerate(tiles):
    x,y=(n%4)*310,(n//4)*250; S.paste(im,(x,y)); D.text((x+4,y+224),f"{i} {L[i]['license'][:14]} {L[i]['w']}x{L[i]['h']}",fill='black')
  S.save(os.path.join(d,f'sheet_{k}.jpg'))
print('done')
