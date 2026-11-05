const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
(async () => {
 const handlers = {}, requests = [];
 const config = {url:'https://test.supabase.co',key:'public-key',labels:{hero_signup:'Inscrição'}};
 const context = {window:{CURSO_ANALYTICS:config},location:{pathname:'/curso-vendas-online/'},document:{addEventListener:(name,cb)=>handlers[name]=cb},crypto:{randomUUID:()=> '2d10b799-281e-4e39-aee6-3367cbbd826f'},fetch:(url,opts)=>{requests.push({url,opts});return Promise.reject(new Error('offline'));},Map,Date,Object};
 vm.runInNewContext(fs.readFileSync('scripts/track-clicks.js','utf8'),context);
 const event = {isTrusted:true,target:{closest:()=>({dataset:{track:'hero_signup'}})}};
 handlers.click(event); handlers.click(event);
 handlers.click({isTrusted:false,target:event.target});
 handlers.click({isTrusted:true,target:{closest:()=>null}});
 await Promise.resolve();
 assert.equal(requests.length,1,'one click; rapid duplicates and synthetic events ignored');
 assert.equal(requests[0].opts.keepalive,true);
 assert.deepEqual(JSON.parse(requests[0].opts.body),{event_id:'2d10b799-281e-4e39-aee6-3367cbbd826f',link_id:'hero_signup'});
 assert.equal('preventDefault' in event,false,'navigation never intercepted');
 const elements = new Map();
 function el(id){if(!elements.has(id))elements.set(id,{id,hidden:false,value:id==='period'?'all':'',textContent:'',children:[],style:{setProperty(){}},classList:{toggle(){}},addEventListener(name,cb){this[name]=cb;},replaceChildren(){this.children=[];},append(...items){this.children.push(...items);},setAttribute(){},focus(){}});return elements.get(id);}
 const admin = {window:{CURSO_ANALYTICS:{...config,adminEmail:'admin@example.com',labels:{hero_signup:'Inscrição',venue_map:'Mapa'}}},document:{getElementById:el,createElement:()=>el(Math.random())},sessionStorage:{getItem:()=>JSON.stringify({access_token:'test-session',expires_at:Math.floor(Date.now()/1000)+3600}),setItem(){},removeItem(){}},Intl,Date,Map,URL,JSON,setTimeout,fetch:async(url,opts)=>({ok:true,status:200,json:async()=>url.includes('/user')?{email:'admin@example.com',email_confirmed_at:'2026-01-01'}:[{link_id:'hero_signup',clicks:3,last_click:'2026-11-05T12:00:00Z'}]})};
 vm.runInNewContext(fs.readFileSync('admin/admin.js','utf8'),admin);
 for(let i=0;i<20;i++)await Promise.resolve();
 assert.equal(el('total').textContent,'3');assert.equal(el('signups').textContent,'3');assert.equal(el('questions').textContent,'0');assert.equal(el('rows').children.length,2);assert.equal(el('dashboard').hidden,false);
 console.log('PASS: click tracking, duplicate suppression, offline handling, admin summary and zero-count links.');
})();

