import html from './src/storefront.json' with {type:'json'};
import {Store} from './src/commerce.mjs';
import {flush} from './src/telegram.mjs';
import {syncGoogle} from './src/google-sync.mjs';
import {handle} from './src/commerce.mjs';
export default {async scheduled(event,env,ctx){ctx.waitUntil(flush(new Store(env)));ctx.waitUntil(syncGoogle(new Store(env)))},async fetch(request,env,ctx){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/')){
  const headers=new Headers(request.headers);
  for(const k of [...headers.keys()])if(k.startsWith('oai-authenticated-'))headers.delete(k);
  if(env.SERVICE_ADMIN_TOKEN && headers.get('authorization')==='Bearer '+env.SERVICE_ADMIN_TOKEN)headers.set('oai-authenticated-user-id','service-qa');
  const result=await handle(new Request(request,{headers}),env);if(request.method==='POST'&&result.ok&&!['/api/order-statuses','/api/quote','/api/admin/telegram/test','/api/admin/telegram/invite'].includes(path)){ctx?.waitUntil(flush(new Store(env)));ctx?.waitUntil(syncGoogle(new Store(env)))}return result;
 }
 if(path==='/')return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
 return env.ASSETS.fetch(request);
}};
