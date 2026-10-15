import sqlite3,sys,json
v=json.load(sys.stdin)
db=sqlite3.connect(v['path'],timeout=10);db.row_factory=sqlite3.Row
if v.get('migration'):
 db.executescript(v['migration']);print('{}')
else:
 c=db.execute(v['sql'],v.get('params',[]))
 if v['op']=='first':
  r=c.fetchone();print(json.dumps(dict(r) if r else None))
 else:
  db.commit();print(json.dumps({'meta':{'changes':max(0,c.rowcount)}}))
