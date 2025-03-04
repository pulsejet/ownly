import{d as nt}from"./index-CD8fvrRC-CeGVhQwU.js";import{b as st,m as at,f as lt,h as W,i as y,O as it,P as rt,Q as ct,M as dt,R as ut}from"./todo-list-B78GeGtK-DUrs_5bZ.js";import{m as H}from"./inline-latex-BLd2QrJC-B1Qtcobl.js";import{T as A,I as ht,J as mt,$ as pt,R as ft,Q as vt,U as yt,B as G,L as M,N as J,V,X as bt,Y as wt,Z as _t,_ as kt}from"./MilkdownEditor-DFC-Q1v3.js";import{W as $t,V as It}from"./index.es-8x7JZKWV.js";import{b as X}from"./index.es-CHTl1GKX.js";import"./index-CpUb-cqQ.js";import"./mutex-yV3mxE7x.js";import"./index-EOBYntv8.js";import"./floating-ui.dom-DJfcjnnZ.js";import"./hooks-B2u-J907.js";const gt=W`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M7 19v-.808L13.096 12L7 5.808V5h10v1.25H9.102L14.727 12l-5.625 5.77H17V19z"
    />
  </svg>
`,K=({ctx:t,hide:n,show:s,config:o,selection:c})=>{var d,h,m,_,k,$,I,g,T,E,L,B;const P=at();lt(()=>{P()},[s]);const p=e=>l=>{l.preventDefault(),t&&e(t),P()},f=e=>{if(!t||!c)return!1;const l=t.get(M),{state:{doc:i}}=l;return i.rangeHasMark(c.from,c.to,e)},z=e=>{if(!t||!c)return!1;const l=t.get(M),{state:{doc:i}}=l;if(c instanceof J)return c.node.type===e;const{from:v,to:C}=c;let b=!1;return i.nodesBetween(v,C,S=>S.type===e?(b=!0,!1):!0),b},Q=t==null?void 0:t.get(ht),et=Q==null?void 0:Q.includes(mt.Latex),ot=e=>{const l=z(H.type(e)),i=e.get(M),{selection:v,doc:C,tr:b}=i.state;if(!l){const F=C.textBetween(v.from,v.to);let R=b.replaceSelectionWith(H.type(e).create({value:F}));i.dispatch(R.setSelection(J.create(R.doc,v.from)));return}const{from:S,to:U}=v;let w=-1,N=null;if(C.nodesBetween(S,U,(F,R)=>N?!1:F.type===H.type(e)?(w=R,N=F,!1):!0),!N||w<0)return;let O=b.delete(w,w+1);const D=N.attrs.value;O=O.insertText(D,w),i.dispatch(O.setSelection(A.create(O.doc,S,U+D.length-1)))};return W`<host>
    <button
      type="button"
      class=${y("toolbar-item",t&&f(pt.type(t))&&"active")}
      onmousedown=${p(e=>{e.get(V).call(bt.key)})}
    >
      ${(h=(d=o==null?void 0:o.boldIcon)==null?void 0:d.call(o))!=null?h:it}
    </button>
    <button
      type="button"
      class=${y("toolbar-item",t&&f(ft.type(t))&&"active")}
      onmousedown=${p(e=>{e.get(V).call(wt.key)})}
    >
      ${(_=(m=o==null?void 0:o.italicIcon)==null?void 0:m.call(o))!=null?_:rt}
    </button>
    <button
      type="button"
      class=${y("toolbar-item",t&&f(vt.type(t))&&"active")}
      onmousedown=${p(e=>{e.get(V).call(_t.key)})}
    >
      ${($=(k=o==null?void 0:o.strikethroughIcon)==null?void 0:k.call(o))!=null?$:ct}
    </button>
    <div class="divider"></div>
    <button
      type="button"
      class=${y("toolbar-item",t&&f(yt.type(t))&&"active")}
      onmousedown=${p(e=>{e.get(V).call(kt.key)})}
    >
      ${(g=(I=o==null?void 0:o.codeIcon)==null?void 0:I.call(o))!=null?g:dt}
    </button>
    ${et&&W`<button
      type="button"
      class=${y("toolbar-item",t&&z(H.type(t))&&"active")}
      onmousedown=${p(ot)}
    >
      ${(E=(T=o==null?void 0:o.latexIcon)==null?void 0:T.call(o))!=null?E:gt}
    </button>`}
    <button
      type="button"
      class=${y("toolbar-item",t&&f(G.type(t))&&"active")}
      onmousedown=${p(e=>{const l=e.get(M),{selection:i}=l.state;if(f(G.type(e))){e.get(X.key).removeLink(i.from,i.to);return}e.get(X.key).addLink(i.from,i.to),n==null||n()})}
    >
      ${(B=(L=o==null?void 0:o.linkIcon)==null?void 0:L.call(o))!=null?B:ut}
    </button>
  </host>`};K.props={ctx:Object,hide:Function,show:Boolean,config:Object,selection:Object};const j=st(K);var x=t=>{throw TypeError(t)},tt=(t,n,s)=>n.has(t)||x("Cannot "+s),a=(t,n,s)=>(tt(t,n,"read from private field"),s?s.call(t):n.get(t)),Y=(t,n,s)=>n.has(t)?x("Cannot add the same private member more than once"):n instanceof WeakSet?n.add(t):n.set(t,s),Z=(t,n,s,o)=>(tt(t,n,"write to private field"),n.set(t,s),s),u,r;const q=$t("CREPE_TOOLBAR");class Tt{constructor(n,s,o){Y(this,u),Y(this,r),this.update=(d,h)=>{a(this,u).update(d,h),a(this,r).selection=d.state.selection},this.destroy=()=>{a(this,u).destroy(),a(this,r).remove()},this.hide=()=>{a(this,u).hide()};const c=new j;Z(this,r,c),a(this,r).ctx=n,a(this,r).hide=this.hide,a(this,r).config=o,a(this,r).selection=s.state.selection,Z(this,u,new It({content:a(this,r),debounce:20,offset:10,shouldShow(d){const{doc:h,selection:m}=d.state,{empty:_,from:k,to:$}=m,I=!h.textBetween(k,$).length&&m instanceof A,g=!(m instanceof A),T=d.dom.getRootNode().activeElement,E=c.contains(T),L=!d.hasFocus()&&!E,B=!d.editable;return!(L||g||_||I||B)}})),a(this,u).onShow=()=>{a(this,r).show=!0},a(this,u).onHide=()=>{a(this,r).show=!1},this.update(s)}}u=new WeakMap;r=new WeakMap;nt("milkdown-toolbar",j);const Vt=(t,n)=>{t.config(s=>{s.set(q.key,{view:o=>new Tt(s,o,n)})}).use(q)};export{Vt as defineFeature};
