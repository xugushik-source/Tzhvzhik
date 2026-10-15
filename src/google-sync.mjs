/** D1 remains authoritative. RAW stable ranges make retries idempotent. */
import {summary,statusRu} from './operations.mjs';
export function mirror(s){const orders=Object.values(s.orders);return {
 'Заказы':[['ID','Создан','Статус','Оплата','Сумма, тетри'],...orders.map(o=>[o.id,o.created_at,statusRu[o.status]||o.status,statusRu[o.payment]||o.payment,o.actual_snapshot?.gel??o.snapshot.gel])],
 'Позиции заказов':[['ID','Заказ','Товар','Поставщик','Количество'],...orders.flatMap(o=>(o.actual_items||o.items).map(l=>[o.id+':'+l.line_index,o.id,l.id,l.supplier_id||'',l.qty]))],
 'Статусы':[['Заказ','Время','Действие','Сотрудник'],...s.audit.map(e=>[e.id,e.at,e.event,e.actor])],
 'Поставщики':[['ID','Роль'],...s.grants.filter(g=>g.role==='SUPPLIER').map(g=>[g.user_id,g.role])],
 'Замены':[['ID','Заказ','Товар','Статус','Время','Причина'],...orders.flatMap(o=>(o.replacements||[]).map(r=>[r.id,o.id,r.product_id,({PENDING:'Ожидает согласования',APPROVED:'Согласована',REJECTED:'Отклонена'})[r.status],r.at,r.reason]))],
 'Курьеры':[['ID'],...s.grants.filter(g=>g.role==='DRIVER').map(g=>[g.user_id])],
 'Доставки':[['Заказ','Курьер','Статус'],...orders.map(o=>[o.id,o.driver_id||'',o.status])],
 'Оплаты':[['Заказ','Метод','Статус','Сумма, тетри'],...orders.map(o=>[o.id,o.snapshot.method,o.payment,o.actual_snapshot?.gel||0])],
 'Расчёты':[['Заказ / операция','Поставщик','Себестоимость / выплата, тетри'],...(s.supplier_payments||[]).map(r=>[r.id,r.supplier_id,-r.amount_cents]),...orders.filter(o=>o.status==='DELIVERED').flatMap(o=>(o.actual_items||[]).map(l=>[o.id,l.supplier_id||'Свой склад',Math.round(l.cost_cents*l.ticks/1000)]))],
 'Склад':[['Товар','Остаток','Резерв','Тестовые данные'],...s.catalog.map(p=>[p.id,p.stock,p.reserved,'DEMO'])],
 'Финансы':[['Показатель','Тетри'],...Object.entries(summary(s)).filter(([k])=>k.endsWith('_cents')),...(s.expenses||[]).map(r=>['Расход '+r.id,r.amount_cents])],
 'Аналитика':[['Показатель','Значение'],...Object.entries(summary(s)).map(([k,v])=>[k,typeof v==='object'?JSON.stringify(v):v])]
};}
async function accessToken(env){if(env.GOOGLE_ACCESS_TOKEN)return env.GOOGLE_ACCESS_TOKEN;if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.GOOGLE_REFRESH_TOKEN)throw Error('GOOGLE_AUTH_REQUIRED');const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('GOOGLE_AUTH_REQUIRED');const b=await r.json();if(!b.access_token)throw Error('GOOGLE_AUTH_REQUIRED');return b.access_token}
async function google(env,path,body){const r=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(env.GOOGLE_SPREADSHEET_ID)+path,{method:'POST',headers:{Authorization:'Bearer '+env.GOOGLE_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('GOOGLE_HTTP_'+r.status);return r.json()}
export async function syncGoogle(store){if(!store.env.GOOGLE_SPREADSHEET_ID||!(store.env.GOOGLE_ACCESS_TOKEN||store.env.GOOGLE_REFRESH_TOKEN))return;
 let claim=false;await store.mutate(s=>{claim=false;s.google_sync ||= {};if(s.google_sync.lease>Date.now()||s.google_sync.retry_at>Date.now())return;s.google_sync.lease=Date.now()+60000;claim=true});if(!claim)return;
 try{const authEnv={...store.env,GOOGLE_ACCESS_TOKEN:await accessToken(store.env)};const {state,revision}=await store.read(),tabs=mirror(state);const row_counts=Object.fromEntries(Object.entries(tabs).map(([k,v])=>[k,v.length]));for(const [k,v] of Object.entries(tabs)){const length=state.google_sync.row_counts?.[k]||0;while(v.length<length)v.push(Array(v[0].length).fill(''))}if(!state.google_sync.initialized){
 const r=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(store.env.GOOGLE_SPREADSHEET_ID)+'?fields=sheets.properties.title',{headers:{Authorization:'Bearer '+authEnv.GOOGLE_ACCESS_TOKEN},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('GOOGLE_HTTP_'+r.status);const b=await r.json(),known=b.sheets.map(s=>s.properties.title);const missing=Object.keys(tabs).filter(t=>!known.includes(t));if(missing.length)await google(authEnv,':batchUpdate',{requests:missing.map(title=>({addSheet:{properties:{title}}}))});}
 await google(authEnv,'/values:batchUpdate',{valueInputOption:'RAW',data:Object.entries(tabs).map(([title,values])=>({range:"'"+title+"'!A1",values}))});
 await store.mutate(s=>{s.google_sync={status:'SYNCED',initialized:true,row_counts,last_success:new Date().toISOString(),source_revision:revision,attempts:0}});
 }catch(e){await store.mutate(s=>{const g=s.google_sync;g.status='ERROR';g.error=/^GOOGLE_(HTTP_\d+|AUTH_REQUIRED)$/.test(e.message)?e.message:'GOOGLE_UNAVAILABLE';g.attempts=(g.attempts||0)+1;g.lease=0;g.retry_at=Date.now()+Math.min(3600000,1000*2**Math.min(g.attempts,12))})}
}
