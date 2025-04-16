import{d as st}from"./index-D6fLMv29-COUJrQhB.js";import{b as nt,m as at,f as lt,i as y,P as it,Q as rt,R as ct,M as dt,S as ut,O as mt,h as D}from"./functions-Bsik6ikd-CD340WZ-.js";import{m as A}from"./inline-latex-C9IGAXXQ-DcPwu8ti.js";import{T as P,A as pt,C as ht,$ as vt,R as ft,Q as yt,U as bt,B as G,L as W,N as X,V as M,X as _t,Y as kt,Z as wt,_ as $t}from"./MilkdownEditor-PM_qIeBP.js";import{W as It,V as Tt}from"./index.es-CkEOF4UZ.js";import{b as Y}from"./index.es-C7olYDqM.js";import"./index-BMZ-2pQL.js";import"./mutex-yV3mxE7x.js";import"./index-Bk2Dp_pL.js";import"./floating-ui.dom-DJfcjnnZ.js";import"./hooks-C5oewugr.js";const K=({ctx:t,hide:s,show:n,config:o,selection:c})=>{var d,m,p,k,w,$,I,T,E,S,C,B;const H=at();lt(()=>{H()},[n]);const h=e=>l=>{l.preventDefault(),t&&e(t),H()},v=e=>{if(!t||!c)return!1;const l=t.get(W),{state:{doc:i}}=l;return i.rangeHasMark(c.from,c.to,e)},V=e=>{if(!t||!c)return!1;const l=t.get(W),{state:{doc:i}}=l;if(c instanceof X)return c.node.type===e;const{from:f,to:L}=c;let b=!1;return i.nodesBetween(f,L,g=>g.type===e?(b=!0,!1):!0),b},Q=t==null?void 0:t.get(pt),et=Q==null?void 0:Q.includes(ht.Latex),ot=e=>{const l=V(A.type(e)),i=e.get(W),{selection:f,doc:L,tr:b}=i.state;if(!l){const F=L.textBetween(f.from,f.to);let R=b.replaceSelectionWith(A.type(e).create({value:F}));i.dispatch(R.setSelection(X.create(R.doc,f.from)));return}const{from:g,to:U}=f;let _=-1,N=null;if(L.nodesBetween(g,U,(F,R)=>N?!1:F.type===A.type(e)?(_=R,N=F,!1):!0),!N||_<0)return;let O=b.delete(_,_+1);const z=N.attrs.value;O=O.insertText(z,_),i.dispatch(O.setSelection(P.create(O.doc,g,U+z.length-1)))};return D`<host>
    <button
      type="button"
      class=${y("toolbar-item",t&&v(vt.type(t))&&"active")}
      onmousedown=${h(e=>{e.get(M).call(_t.key)})}
    >
      ${(m=(d=o==null?void 0:o.boldIcon)==null?void 0:d.call(o))!=null?m:it}
    </button>
    <button
      type="button"
      class=${y("toolbar-item",t&&v(ft.type(t))&&"active")}
      onmousedown=${h(e=>{e.get(M).call(kt.key)})}
    >
      ${(k=(p=o==null?void 0:o.italicIcon)==null?void 0:p.call(o))!=null?k:rt}
    </button>
    <button
      type="button"
      class=${y("toolbar-item",t&&v(yt.type(t))&&"active")}
      onmousedown=${h(e=>{e.get(M).call(wt.key)})}
    >
      ${($=(w=o==null?void 0:o.strikethroughIcon)==null?void 0:w.call(o))!=null?$:ct}
    </button>
    <div class="divider"></div>
    <button
      type="button"
      class=${y("toolbar-item",t&&v(bt.type(t))&&"active")}
      onmousedown=${h(e=>{e.get(M).call($t.key)})}
    >
      ${(T=(I=o==null?void 0:o.codeIcon)==null?void 0:I.call(o))!=null?T:dt}
    </button>
    ${et&&D`<button
      type="button"
      class=${y("toolbar-item",t&&V(A.type(t))&&"active")}
      onmousedown=${h(ot)}
    >
      ${(S=(E=o==null?void 0:o.latexIcon)==null?void 0:E.call(o))!=null?S:mt}
    </button>`}
    <button
      type="button"
      class=${y("toolbar-item",t&&v(G.type(t))&&"active")}
      onmousedown=${h(e=>{const l=e.get(W),{selection:i}=l.state;if(v(G.type(e))){e.get(Y.key).removeLink(i.from,i.to);return}e.get(Y.key).addLink(i.from,i.to),s==null||s()})}
    >
      ${(B=(C=o==null?void 0:o.linkIcon)==null?void 0:C.call(o))!=null?B:ut}
    </button>
  </host>`};K.props={ctx:Object,hide:Function,show:Boolean,config:Object,selection:Object};const j=nt(K);var x=t=>{throw TypeError(t)},tt=(t,s,n)=>s.has(t)||x("Cannot "+n),a=(t,s,n)=>(tt(t,s,"read from private field"),n?n.call(t):s.get(t)),Z=(t,s,n)=>s.has(t)?x("Cannot add the same private member more than once"):s instanceof WeakSet?s.add(t):s.set(t,n),q=(t,s,n,o)=>(tt(t,s,"write to private field"),s.set(t,n),n),u,r;const J=It("CREPE_TOOLBAR");class Et{constructor(s,n,o){Z(this,u),Z(this,r),this.update=(d,m)=>{a(this,u).update(d,m),a(this,r).selection=d.state.selection},this.destroy=()=>{a(this,u).destroy(),a(this,r).remove()},this.hide=()=>{a(this,u).hide()};const c=new j;q(this,r,c),a(this,r).ctx=s,a(this,r).hide=this.hide,a(this,r).config=o,a(this,r).selection=n.state.selection,q(this,u,new Tt({content:a(this,r),debounce:20,offset:10,shouldShow(d){const{doc:m,selection:p}=d.state,{empty:k,from:w,to:$}=p,I=!m.textBetween(w,$).length&&p instanceof P,T=!(p instanceof P),E=d.dom.getRootNode().activeElement,S=c.contains(E),C=!d.hasFocus()&&!S,B=!d.editable;return!(C||T||k||I||B)}})),a(this,u).onShow=()=>{a(this,r).show=!0},a(this,u).onHide=()=>{a(this,r).show=!1},this.update(n)}}u=new WeakMap;r=new WeakMap;st("milkdown-toolbar",j);const Mt=(t,s)=>{t.config(n=>{n.set(J.key,{view:o=>new Et(n,o,s)})}).use(J)};export{Mt as defineFeature};
