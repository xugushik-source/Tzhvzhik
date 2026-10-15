import html from './src/storefront.json';
import {handle} from './src/commerce.mjs';
export default {async fetch(request,env){
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/')){
  const headers=new Headers(request.headers);
  for(const k of [...headers.keys()])if(k.startsWith('oai-authenticated-'))headers.delete(k);
  if(env.SERVICE_ADMIN_TOKEN && headers.get('authorization')==='Bearer '+env.SERVICE_ADMIN_TOKEN)headers.set('oai-authenticated-user-id','service-qa');
  return handle(new Request(request,{headers}),env);
 }
 if(path==='/')return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
 return env.ASSETS.fetch(request);
}};
