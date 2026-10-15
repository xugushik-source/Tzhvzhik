import {Problem} from './commerce.mjs';
const deny=(code,status=409)=>{throw new Problem(code,status)};
export const statusRu={CALL_REQUIRED:'Нужен звонок',WEIGHING_REQUIRED:'Подготовка и взвешивание',CUSTOMER_CONFIRMATION_REQUIRED:'Согласование покупателя',AWAITING_PAYMENT:'Ожидается оплата',PAYMENT_REVIEW_REQUIRED:'Проверка оплаты',PROOF_REQUESTED:'Нужен новый чек',CONFIRMED:'Подтверждён',PICKED_UP:'Товары забраны',OUT_FOR_DELIVERY:'В пути',DELIVERED:'Доставлен',CANCELLED:'Отменён',NOT_DUE:'Оплата пока не требуется',UNPAID:'Ожидается оплата',AWAITING_VERIFICATION:'Чек загружен — ожидается проверка',PAID:'Оплата подтверждена',PARTIAL:'Частичная оплата',DEBT:'Долг',REJECTED:'Оплата отклонена',DUE_ON_DELIVERY:'Оплата при доставке',DUE_AT_PICKUP:'Оплата при выдаче',REFUND_REVIEW_REQUIRED:'Возврат на проверке'};
export function groups(o){o.supplier_groups ||= Object.fromEntries([...new Set(o.items.map(l=>l.supplier_id).filter(Boolean))].map(id=>[id,{supplier_id:id,status:'WAITING_CALL'}]));return o.supplier_groups}
export function supplierAction(store,s,o,b,u){if(b.action==='propose_replacement'){if(!['OWNER','ADMIN','SUPPLIER','DRIVER'].includes(u.role))deny('FORBIDDEN',403);if(!['WEIGHING_REQUIRED','CUSTOMER_CONFIRMATION_REQUIRED'].includes(o.status))deny('INVALID_TRANSITION');const line=o.items[b.line_index];if(!line||u.role==='SUPPLIER'&&line.supplier_id!==u.id||u.role==='DRIVER'&&o.driver_id!==u.id)deny('NOT_ASSIGNED',403);const product=s.catalog.find(p=>p.id===b.product_id&&p.active);if(!product||product.unit!==line.unit||u.role==='SUPPLIER'&&product.supplier_id!==u.id)deny('INVALID_REPLACEMENT');o.replacements ||= [];o.replacements.push({id:crypto.randomUUID(),line_index:b.line_index,product_id:product.id,actor:u.id,reason:String(b.reason||'').slice(0,300),status:'PENDING',version:o.version,at:new Date().toISOString()});store.event(s,o,'REPLACEMENT_PROPOSED',u.id,b.reason);return true;}
 if(!['supplier_available','supplier_missing','supplier_prepare','supplier_ready'].includes(b.action))return false;
 const sid=['OWNER','ADMIN'].includes(u.role)?b.supplier_id:u.id;
 const g=groups(o)[sid];if(!g||!['SUPPLIER','OWNER','ADMIN'].includes(u.role))deny('NOT_ASSIGNED',403);
 if(['CALL_REQUIRED','CANCELLED','PICKED_UP','OUT_FOR_DELIVERY','DELIVERED'].includes(o.status))deny('INVALID_TRANSITION');
 if(b.action==='supplier_missing'){if(!b.reason?.trim())deny('REASON_REQUIRED',400);g.status='MISSING';g.note=b.reason.slice(0,300)}
 if(b.action==='supplier_available')g.status='AVAILABLE';
 if(b.action==='supplier_prepare'){if(g.status!=='AVAILABLE')deny('AVAILABILITY_REQUIRED');g.status='PREPARING';if(b.minutes!==undefined){if(!Number.isInteger(b.minutes)||b.minutes<1||b.minutes>1440)deny('INVALID_NUMBER',400);g.minutes=b.minutes}}
 if(b.action==='supplier_ready'){if(g.status!=='PREPARING'||o.accepted_version!==o.version)deny('CUSTOMER_APPROVAL_REQUIRED');g.status='READY'}
 g.updated_at=new Date().toISOString();g.actor=u.id;
 store.event(s,o,b.action.toUpperCase(),u.id,b.reason||'');return true;
}
export function summary(s){
 const orders=Object.values(s.orders),delivered=orders.filter(o=>o.status==='DELIVERED');
 const total=rows=>rows.reduce((a,o)=>a+(o.actual_snapshot?.gel||0),0);
 const dayOf=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tbilisi'}).format(d);
 const today=dayOf(new Date()),todayStart=Date.parse(today+'T00:00:00+04:00'),weekStart=todayStart-6*86400000,month=today.slice(0,7);
 const when=o=>o.events?.findLast(e=>['DELIVER','HANDOVER_PICKUP','COLLECT_CASH'].includes(e.event))?.at||o.created_at;
 const cost=delivered.reduce((a,o)=>a+(o.actual_items||[]).reduce((n,l)=>n+Math.round(l.cost_cents*l.ticks/1000),0),0),products={},suppliers={};
 for(const o of delivered)for(const l of o.actual_items||[]){const p=products[l.id]||={id:l.id,revenue_cents:0,cost_cents:0,quantity:0};p.revenue_cents+=l.line_cents;p.cost_cents+=Math.round(l.cost_cents*l.ticks/1000);p.quantity+=l.ticks;const sid=l.supplier_id||'OWN';suppliers[sid]=(suppliers[sid]||0)+l.line_cents}
 return {mode:'DEMO — закупочные цены и начальные остатки тестовые',orders:orders.length,revenue_cents:total(delivered),cost_cents:cost,gross_profit_cents:total(delivered)-cost,average_cents:delivered.length?Math.round(total(delivered)/delivered.length):0,today_cents:total(delivered.filter(o=>dayOf(new Date(when(o)))===today)),week_cents:total(delivered.filter(o=>Date.parse(when(o))>=weekStart)),month_cents:total(delivered.filter(o=>dayOf(new Date(when(o))).startsWith(month))),cancelled:orders.filter(o=>o.status==='CANCELLED').length,unpaid:delivered.filter(o=>o.payment!=='PAID').length,products:Object.values(products),suppliers:Object.entries(suppliers).map(([supplier_id,revenue_cents])=>({supplier_id,revenue_cents}))};
}
