import json, sys, urllib.request, urllib.parse, re, concurrent.futures as cf
out=sys.argv[1]
Q={
 'panelcare':'solar panels technician','memorybook':'old photo album open','baraem':'mosque interior light','leila':'camera lens studio',
 'catalog':'library card catalog drawers','ventureforge':'sticky notes whiteboard','roomiesplit':'receipts coins table','ecommerce':'shopping cart supermarket',
 'mealplanner':'vegetables market stall','controlnet':'pencil sketch hand drawing','qwen':'laboratory flasks','cs197':'chalkboard formulas',
 'edges':'spiral staircase from above','speech':'vintage microphone','pills':'medicine tablets','ipcourse':'human eye iris macro',
 'saida':'Sidon Sea Castle','sea':'Saida Lebanon sea','stars':'milky way night sky','books':'old books stack','circuit':'printed circuit board macro','gpu':'graphics card'}
def run(k,q):
  u='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','format':'json','generator':'search','gsrsearch':q+' filetype:bitmap','gsrnamespace':6,'gsrlimit':8,'prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':480})
  r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'portfolio-image-search/1.0 (personal static site)'}),timeout=40))
  L=[]
  for p in sorted(r.get('query',{}).get('pages',{}).values(),key=lambda p:p.get('index',0)):
    ii=p['imageinfo'][0]; m=ii.get('extmetadata',{})
    lic=m.get('LicenseShortName',{}).get('value','')
    art=re.sub('<[^>]+>','',m.get('Artist',{}).get('value',''))[:80]
    L.append({'title':p['title'],'url':ii['url'],'thumb':ii.get('thumburl'),'w':ii['width'],'h':ii['height'],'license':lic,'artist':art,'page':ii.get('descriptionurl')})
  return k,L
import os,time
res=json.load(open(out)) if os.path.exists(out) else {}
for k,q in Q.items():
  if k in res: continue
  for a in range(3):
    try: k,L=run(k,q); res[k]=L; print(k,len(L)); break
    except Exception as e: print('ERR',k,e); time.sleep(5)
  time.sleep(2)
json.dump(res,open(out,'w'),indent=1)
