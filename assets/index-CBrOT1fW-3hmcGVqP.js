import{b as ue,u as te,d as S,g as fe,i as pe,h as he,f as we,T as U,U as ge,V as ye,W as ve,t as z,y as J}from"./functions-Bsik6ikd-CD340WZ-.js";import{h as be,l as me,a0 as _e,L,a1 as ne,a2 as xe,t as j,V as P,a3 as D,a4 as He,a5 as Re,a6 as M,a7 as $e,a8 as Ce,a9 as Ie,aa as Be,ab as Oe,ac as ke,N as Se}from"./MilkdownEditor-B0vj-XZn.js";import{a as q,b as T}from"./hooks-C5oewugr.js";import{t as oe}from"./index-Cno5QTL8.js";import{c as E,o as N}from"./floating-ui.dom-DJfcjnnZ.js";import"./index-DgSFE_8T.js";import"./mutex-yV3mxE7x.js";function Le(n,e){const t=customElements.get(n);if(t==null){customElements.define(n,e);return}t!==e&&console.warn(`Custom element ${n} has been defined before.`)}var Ae=Object.defineProperty,K=Object.getOwnPropertySymbols,Pe=Object.prototype.hasOwnProperty,Te=Object.prototype.propertyIsEnumerable,Q=(n,e,t)=>e in n?Ae(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,qe=(n,e)=>{for(var t in e||(e={}))Pe.call(e,t)&&Q(n,t,e[t]);if(K)for(var t of K(e))Te.call(e,t)&&Q(n,t,e[t]);return n};function re(n,e){return Object.assign(n,{meta:qe({package:"@milkdown/components"},e)}),n}var Ee=Object.defineProperty,Z=Object.getOwnPropertySymbols,De=Object.prototype.hasOwnProperty,Me=Object.prototype.propertyIsEnumerable,ee=(n,e,t)=>e in n?Ee(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,je=(n,e)=>{for(var t in e||(e={}))De.call(e,t)&&ee(n,t,e[t]);if(Z)for(var t of Z(e))Me.call(e,t)&&ee(n,t,e[t]);return n};const Ne={renderButton:n=>{switch(n){case"add_row":return"+";case"add_col":return"+";case"delete_row":return"-";case"delete_col":return"-";case"align_col_left":return"left";case"align_col_center":return"center";case"align_col_right":return"right";case"col_drag_handle":return"=";case"row_drag_handle":return"="}}},W=be(je({},Ne),"tableBlockConfigCtx");re(W,{displayName:"Config<table-block>",group:"TableBlock"});function X(n,e){for(let t=0;t<n.childCount;t++)if(n.child(t)===e)return t;return-1}function We(n,e){var t,o,a;if(e)try{const r=e.posAtCoords({left:n.clientX,top:n.clientY});if(!r)return;const i=r==null?void 0:r.inside;if(i==null||i<0)return;const d=e.state.doc.resolve(i),c=e.state.doc.nodeAt(i);if(!c)return;const p=["table_cell","table_header"],f=["table_row","table_header_row"],w=p.includes(c.type.name)?c:(t=j(l=>p.includes(l.type.name))(d))==null?void 0:t.node,b=(o=j(l=>f.includes(l.type.name))(d))==null?void 0:o.node,_=(a=j(l=>l.type.name==="table")(d))==null?void 0:a.node;if(!w||!b||!_)return;const g=X(b,w);return[X(_,b),g]}catch{return}}function V(n,[e,t]){const o=n.current;if(!o)return;const a=o.querySelectorAll("tr"),r=a[e];if(!r)return;const i=a[0];if(!i)return;const d=i.children[t];if(!d)return;const c=r.children[t];if(c)return{row:r,col:c,headerCol:d}}function Ve(n,e,t){if(!e||!t)return;const{selection:o}=e.get(L).state;if(!(o instanceof ne))return;const{$from:a}=o,r=xe(a);if(!(!r||r.node!==t)){if(o.isColSelection()){const{$head:i}=o,d=i.index(i.depth-1);F({refs:n,index:[0,d],before:c=>{var p;(p=c.querySelector(".button-group"))==null||p.setAttribute("data-show","true")}});return}if(o.isRowSelection()){const{$head:i}=o,d=j(p=>p.type.name==="table_row"||p.type.name==="table_header_row")(i);if(!d)return;const c=X(r.node,d.node);G({refs:n,index:[c,0],before:p=>{var f;c>0&&((f=p.querySelector(".button-group"))==null||f.setAttribute("data-show","true"))}})}}}function F({refs:n,index:e,before:t,after:o}){const{contentWrapperRef:a,colHandleRef:r,hoverIndex:i}=n,d=r.current;if(!d)return;i.current=e;const c=V(a,e);if(!c)return;const{headerCol:p}=c;d.dataset.show="true",t&&t(d),E(p,d,{placement:"top"}).then(({x:f,y:w})=>{Object.assign(d.style,{left:`${f}px`,top:`${w}px`}),o&&o(d)})}function G({refs:n,index:e,before:t,after:o}){const{contentWrapperRef:a,rowHandleRef:r,hoverIndex:i}=n,d=r.current;if(!d)return;i.current=e;const c=V(a,e);if(!c)return;const{row:p}=c;d.dataset.show="true",t&&t(d),E(p,d,{placement:"left"}).then(({x:f,y:w})=>{Object.assign(d.style,{left:`${f}px`,top:`${w}px`}),o&&o(d)})}function le(n){const{dragPreviewRef:e,tableWrapperRef:t,contentWrapperRef:o,yLineHandleRef:a,xLineHandleRef:r,colHandleRef:i,rowHandleRef:d}=n,c=e.current;if(!c)return;const p=t.current;if(!p)return;const f=o.current;if(!f)return;const w=f.querySelector("tbody");if(!w)return;const b=c.querySelector("tbody");if(!b)return;const _=a.current;if(!_)return;const g=r.current;if(!g)return;const s=i.current;if(!s)return;const l=d.current;return l?{preview:c,wrapper:p,content:f,contentRoot:w,previewRoot:b,yHandle:_,xHandle:g,colHandle:s,rowHandle:l}:void 0}function ae(n,e,t,o){const a=t==null?void 0:t.get(L);if(!(a!=null&&a.editable))return;e.stopPropagation(),e.dataTransfer&&(e.dataTransfer.effectAllowed="move");const r=le(n);r&&requestAnimationFrame(()=>{o(r)})}function Xe(n,e){return t=>{ae(n,t,e,({preview:o,content:a,previewRoot:r,yHandle:i,xHandle:d,colHandle:c,rowHandle:p})=>{var f;const{hoverIndex:w,dragInfo:b}=n;d.dataset.displayType="indicator",i.dataset.show="false",c.dataset.show="false",(f=p.querySelector(".button-group"))==null||f.setAttribute("data-show","false");const[_]=w.current;b.current={startCoords:[t.clientX,t.clientY],startIndex:_,endIndex:_,type:"row"},o.dataset.direction="vertical";const g=a.querySelectorAll("tr");for(;r.firstChild;)r.removeChild(r.firstChild);const s=g[_];if(!s)return;r.appendChild(s.cloneNode(!0));const l=s.getBoundingClientRect().height,{width:m}=a.querySelector("tbody").getBoundingClientRect();Object.assign(o.style,{width:`${m}px`,height:`${l}px`}),o.dataset.show="true"})}}function Ye(n,e){return t=>{ae(n,t,e,({preview:o,content:a,previewRoot:r,yHandle:i,xHandle:d,colHandle:c,rowHandle:p})=>{var f;const{hoverIndex:w,dragInfo:b}=n;d.dataset.show="false",i.dataset.displayType="indicator",p.dataset.show="false",(f=c.querySelector(".button-group"))==null||f.setAttribute("data-show","false");const[_,g]=w.current;b.current={startCoords:[t.clientX,t.clientY],startIndex:g,endIndex:g,type:"col"},o.dataset.direction="horizontal";const s=a.querySelectorAll("tr");for(;r.firstChild;)r.removeChild(r.firstChild);let l;Array.from(s).forEach(u=>{const h=u.children[g];if(!h)return;l===void 0&&(l=h.getBoundingClientRect().width);const x=h.parentElement.cloneNode(!1),y=h.cloneNode(!0);x.appendChild(y),r.appendChild(x)});const{height:m}=a.querySelector("tbody").getBoundingClientRect();Object.assign(o.style,{width:`${l}px`,height:`${m}px`}),o.dataset.show="true"})}}function Fe(n){return oe(e=>{const t=le(n);if(!t)return;const{preview:o,content:a,contentRoot:r,xHandle:i,yHandle:d}=t,{dragInfo:c,hoverIndex:p}=n;if(o.dataset.show==="false")return;const f=V(n.contentWrapperRef,p.current);if(!f)return;const w=r.querySelector("tr");if(!w)return;const b=c.current;if(!b||!r.offsetParent)return;const _=r.offsetParent.offsetTop,g=r.offsetParent.offsetLeft;if(b.type==="col"){const s=f.col.getBoundingClientRect().width,{left:l,width:m}=r.getBoundingClientRect(),u=g-l,h=e.clientX+u-s/2,x=e.clientX+u+s/2,[y]=b.startCoords,H=y<e.clientX?"right":"left";o.style.top=`${_}px`;const $=h<l+u-20?l+u-20:h>l+m+u-s+20?l+m+u-s+20:h;o.style.left=`${$}px`;const k=Array.from(w.children),O=k.find((B,v)=>{const I=B.getBoundingClientRect();let C=I.left+g-l,R=I.right+g-l;if(H==="right"){if(C=C+I.width/2,R=R+I.width/2,C<=x&&R>=x||v===w.children.length-1&&x>R)return!0}else if(C=C-I.width/2,R=R-I.width/2,C<=h&&R>=h||v===0&&h<C)return!0;return!1});if(O){const B=d.getBoundingClientRect().width,v=a.getBoundingClientRect(),I=k.indexOf(O);b.endIndex=I,E(O,d,{placement:H==="left"?"left":"right",middleware:[N(H==="left"?-1*B:0)]}).then(({x:C})=>{d.dataset.show="true",Object.assign(d.style,{height:`${v.height}px`,left:`${C}px`,top:`${_}px`})})}}else if(b.type==="row"){const s=f.row.getBoundingClientRect().height,{top:l,height:m}=r.getBoundingClientRect(),u=_-l,h=e.clientY+u-s/2,x=e.clientY+u+s/2,[y,H]=b.startCoords,$=H<e.clientY?"down":"up",k=h<l+u-20?l+u-20:h>l+m+u-s+20?l+m+u-s+20:h;o.style.top=`${k}px`,o.style.left=`${g}px`;const O=Array.from(r.querySelectorAll("tr")),B=O.find((v,I)=>{const C=v.getBoundingClientRect();let R=C.top+_-l,A=C.bottom+_-l;if($==="down"){if(R=R+C.height/2,A=A+C.height/2,R<=x&&A>=x||I===O.length-1&&x>A)return!0}else if(R=R-C.height/2,A=A-C.height/2,R<=h&&A>=h||I===0&&h<R)return!0;return!1});if(B){const v=i.getBoundingClientRect().height,I=a.getBoundingClientRect(),C=O.indexOf(B);b.endIndex=C,E(B,i,{placement:$==="up"?"top":"bottom",middleware:[N($==="up"?-1*v:0)]}).then(({y:R})=>{i.dataset.show="true",Object.assign(i.style,{width:`${I.width}px`,top:`${R}px`})})}}},20)}function Ge(n,e,t){const{dragPreviewRef:o,yLineHandleRef:a,xLineHandleRef:r,dragInfo:i}=n,d=te(),c=q(()=>d.current.getRootNode(),[d]),p=q(()=>Xe(n,e),[n]),f=q(()=>Ye(n,e),[n]);return we(()=>{const w=()=>{const g=o.current;if(!g||g.dataset.show==="false")return;const s=g==null?void 0:g.querySelector("tbody");for(;s!=null&&s.firstChild;)s==null||s.removeChild(s.firstChild);g&&(g.dataset.show="false")},b=()=>{var g;const s=o.current;if(!s)return;const l=a.current;if(!l)return;const m=r.current;if(!m)return;const u=i.current;if(!u||!e||s.dataset.show==="false"||!n.colHandleRef.current||!n.rowHandleRef.current||(l.dataset.show="false",m.dataset.show="false",u.startIndex===u.endIndex))return;const y=e.get(P),H={from:u.startIndex,to:u.endIndex,pos:((g=t==null?void 0:t())!=null?g:0)+1};if(u.type==="col"){y.call(M.key,{pos:H.pos,index:u.startIndex}),y.call(Oe.key,H);const $=[0,u.endIndex];F({refs:n,index:$})}else{y.call(D.key,{pos:H.pos,index:u.startIndex}),y.call(ke.key,H);const $=[u.endIndex,0];G({refs:n,index:$})}requestAnimationFrame(()=>{e.get(L).focus()})},_=Fe(n);return c.addEventListener("dragover",_),c.addEventListener("dragend",w),c.addEventListener("drop",b),()=>{c.removeEventListener("dragover",_),c.removeEventListener("dragend",w),c.removeEventListener("drop",b)}},[]),{dragRow:p,dragCol:f}}function Ue(n,e){return oe(t=>{if(!(e!=null&&e.editable))return;const{contentWrapperRef:o,yLineHandleRef:a,xLineHandleRef:r,colHandleRef:i,rowHandleRef:d,hoverIndex:c,lineHoverIndex:p}=n,f=a.current;if(!f)return;const w=r.current;if(!w)return;const b=o.current;if(!b)return;const _=d.current;if(!_)return;const g=i.current;if(!g)return;const s=We(t,e);if(!s)return;const l=V(o,s);if(!l)return;const[m,u]=s,h=l.col.getBoundingClientRect(),x=Math.abs(t.clientX-h.left)<8,y=Math.abs(h.right-t.clientX)<8,H=Math.abs(t.clientY-h.top)<8,$=Math.abs(h.bottom-t.clientY)<8,k=x||y||H||$,O=_.querySelector(".button-group"),B=g.querySelector(".button-group");if(O&&(O.dataset.show="false"),B&&(B.dataset.show="false"),k){const v=b.getBoundingClientRect();_.dataset.show="false",g.dataset.show="false",w.dataset.displayType="tool",f.dataset.displayType="tool";const I=f.getBoundingClientRect().width,C=w.getBoundingClientRect().height;x||y?(p.current[1]=x?u:u+1,E(l.col,f,{placement:x?"left":"right",middleware:[N(x?-1*I:0)]}).then(({x:R})=>{f.dataset.show="true",Object.assign(f.style,{height:`${v.height}px`,left:`${R}px`})})):f.dataset.show="false",s[0]!==0&&(H||$)?(p.current[0]=H?m:m+1,E(l.row,w,{placement:H?"top":"bottom",middleware:[N(H?-1*C:0)]}).then(({y:R})=>{w.dataset.show="true",Object.assign(w.style,{width:`${v.width}px`,top:`${R}px`})})):w.dataset.show="false";return}p.current=[-1,-1],f.dataset.show="false",w.dataset.show="false",_.dataset.show="true",g.dataset.show="true",G({refs:n,index:s}),F({refs:n,index:s}),c.current=s},20)}function ze(n){return()=>{const{rowHandleRef:e,colHandleRef:t,yLineHandleRef:o,xLineHandleRef:a}=n;setTimeout(()=>{const r=e.current;if(!r)return;const i=t.current;if(!i)return;const d=o.current;if(!d)return;const c=a.current;c&&(r.dataset.show="false",i.dataset.show="false",d.dataset.show="false",c.dataset.show="false")},200)}}function Je(n,e){const t=q(()=>Ue(n,e),[]),o=q(()=>ze(n),[]);return{pointerMove:t,pointerLeave:o}}function Ke(n,e,t){const{xLineHandleRef:o,contentWrapperRef:a,colHandleRef:r,rowHandleRef:i,hoverIndex:d,lineHoverIndex:c}=n,p=T(()=>{var s,l,m;if(!e)return;const u=o.current;if(!u)return;const[h]=c.current;if(h<0||!e.get(L).editable)return;const x=Array.from((l=(s=a.current)==null?void 0:s.querySelectorAll("tr"))!=null?l:[]),y=e.get(P),H=((m=t==null?void 0:t())!=null?m:0)+1;x.length===h?(y.call(D.key,{pos:H,index:h-1}),y.call(He.key)):(y.call(D.key,{pos:H,index:h}),y.call(Re.key)),y.call(D.key,{pos:H,index:h}),u.dataset.show="false"},[]),f=T(()=>{var s,l,m,u;if(!e||!o.current)return;const[x,y]=c.current;if(y<0||!e.get(L).editable)return;const H=Array.from((m=(l=(s=a.current)==null?void 0:s.querySelector("tr"))==null?void 0:l.children)!=null?m:[]),$=e.get(P),k=((u=t==null?void 0:t())!=null?u:0)+1;H.length===y?($.call(M.key,{pos:k,index:y-1}),$.call($e.key)):($.call(M.key,{pos:k,index:y}),$.call(Ce.key)),$.call(M.key,{pos:k,index:y})},[]),w=T(()=>{var s,l;if(!e)return;const[m,u]=d.current,h=e.get(P),x=((s=t==null?void 0:t())!=null?s:0)+1;h.call(M.key,{pos:x,index:u});const y=(l=r.current)==null?void 0:l.querySelector(".button-group");y&&(y.dataset.show=y.dataset.show==="true"?"false":"true")},[]),b=T(()=>{var s,l;if(!e)return;const[m,u]=d.current,h=e.get(P),x=((s=t==null?void 0:t())!=null?s:0)+1;h.call(D.key,{pos:x,index:m});const y=(l=i.current)==null?void 0:l.querySelector(".button-group");y&&m>0&&(y.dataset.show=y.dataset.show==="true"?"false":"true")},[]),_=T(s=>{if(!e||!e.get(L).editable)return;s.preventDefault(),s.stopPropagation(),e.get(P).call(Ie.key),requestAnimationFrame(()=>{e.get(L).focus()})},[]),g=T(s=>l=>{if(!e||!e.get(L).editable)return;l.preventDefault(),l.stopPropagation(),e.get(P).call(Be.key,s),requestAnimationFrame(()=>{e.get(L).focus()})},[]);return{onAddRow:p,onAddCol:f,selectCol:w,selectRow:b,deleteSelected:_,onAlign:g}}const se=({view:n,ctx:e,getPos:t,node:o,config:a})=>{const r=te(),i=S(),d=S(),c=S(),p=S(),f=S(),w=S(),b=S(),_=S([0,0]),g=S([-1,-1]),s=S(),l=q(()=>({dragPreviewRef:b,tableWrapperRef:w,contentWrapperRef:i,yLineHandleRef:f,xLineHandleRef:p,colHandleRef:d,rowHandleRef:c,hoverIndex:_,lineHoverIndex:g,dragInfo:s}),[]);fe(()=>{const v=i.current;if(!v)return;const I=r.current.querySelector("[data-content-dom]");I&&v.appendChild(I),n!=null&&n.editable&&Ve(l,e,o)},[]);const{pointerLeave:m,pointerMove:u}=Je(l,n),{dragRow:h,dragCol:x}=Ge(l,e,t),{onAddRow:y,onAddCol:H,selectCol:$,selectRow:k,deleteSelected:O,onAlign:B}=Ke(l,e,t);return he`
    <host
      class=${pe(!(n!=null&&n.editable)&&"readonly")}
      ondragstart=${v=>v.preventDefault()}
      ondragover=${v=>v.preventDefault()}
      ondragleave=${v=>v.preventDefault()}
      onpointermove=${u}
      onpointerleave=${m}
    >
      <button
        type="button"
        data-show="false"
        contenteditable="false"
        draggable="true"
        data-role="col-drag-handle"
        class="handle cell-handle"
        ondragstart=${x}
        onclick=${$}
        onpointerdown=${v=>v.stopPropagation()}
        onpointermove=${v=>v.stopPropagation()}
        ref=${d}
      >
        ${a==null?void 0:a.renderButton("col_drag_handle")}
        <div
          data-show="false"
          class="button-group"
          onpointermove=${v=>v.stopPropagation}
        >
          <button type="button" onpointerdown=${B("left")}>
            ${a==null?void 0:a.renderButton("align_col_left")}
          </button>
          <button type="button" onpointerdown=${B("center")}>
            ${a==null?void 0:a.renderButton("align_col_center")}
          </button>
          <button type="button" onpointerdown=${B("right")}>
            ${a==null?void 0:a.renderButton("align_col_right")}
          </button>
          <button type="button" onpointerdown=${O}>
            ${a==null?void 0:a.renderButton("delete_col")}
          </button>
        </div>
      </button>
      <button
        type="button"
        data-show="false"
        contenteditable="false"
        draggable="true"
        data-role="row-drag-handle"
        class="handle cell-handle"
        ondragstart=${h}
        onclick=${k}
        onpointerdown=${v=>v.stopPropagation()}
        onpointermove=${v=>v.stopPropagation()}
        ref=${c}
      >
        ${a==null?void 0:a.renderButton("row_drag_handle")}
        <div
          data-show="false"
          class="button-group"
          onpointermove=${v=>v.stopPropagation}
        >
          <button type="button" onpointerdown=${O}>
            ${a==null?void 0:a.renderButton("delete_row")}
          </button>
        </div>
      </button>
      <div class="table-wrapper" ref=${w}>
        <div
          data-show="false"
          class="drag-preview"
          data-direction="vertical"
          ref=${b}
        >
          <table>
            <tbody></tbody>
          </table>
        </div>
        <div
          data-show="false"
          contenteditable="false"
          data-display-type="tool"
          data-role="x-line-drag-handle"
          class="handle line-handle"
          onpointermove=${v=>v.stopPropagation}
          ref=${p}
        >
          <button type="button" onclick=${y} class="add-button">
            ${a==null?void 0:a.renderButton("add_row")}
          </button>
        </div>
        <div
          data-show="false"
          contenteditable="false"
          data-display-type="tool"
          data-role="y-line-drag-handle"
          class="handle line-handle"
          onpointermove=${v=>v.stopPropagation}
          ref=${f}
        >
          <button type="button" onclick=${H} class="add-button">
            ${a==null?void 0:a.renderButton("add_col")}
          </button>
        </div>
        <table ref=${i} class="children"></table>
      </div>
    </host>
  `};se.props={getPos:Function,view:Object,ctx:Object,node:Object,config:Object};const Qe=ue(se);var de=n=>{throw TypeError(n)},Ze=(n,e,t)=>e.has(n)||de("Cannot "+t),et=(n,e,t)=>e.has(n)?de("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,t),tt=(n,e,t)=>(Ze(n,e,"access private method"),t),Y,ce;class nt{constructor(e,t,o,a){this.ctx=e,this.node=t,this.view=o,this.getPos=a,et(this,Y);const r=document.createElement("milkdown-table-block");this.dom=r,r.view=o,r.ctx=e,r.getPos=a,r.node=t,r.config=e.get(W.key);const i=document.createElement("tbody");this.contentDOM=i,i.setAttribute("data-content-dom","true"),i.classList.add("content-dom"),r.appendChild(i)}update(e){return e.type!==this.node.type||e.sameMarkup(this.node)&&e.content.eq(this.node.content)?!1:(this.node=e,this.dom.node=e,!0)}stopEvent(e){if(e.type==="drop"||e.type.startsWith("drag"))return!0;if(e.type==="mousedown"){if(e.target instanceof HTMLButtonElement)return!0;const t=e.target;if(t instanceof HTMLElement&&(t.closest("th")||t.closest("td"))){const o=e;return tt(this,Y,ce).call(this,o)}}return!1}ignoreMutation(e){return!this.dom||!this.contentDOM?!0:e.type==="selection"?!1:this.contentDOM===e.target&&e.type==="attributes"?!0:!this.contentDOM.contains(e.target)}}Y=new WeakSet;ce=function(n){const e=this.view;if(!e.editable)return!1;const{state:t,dispatch:o}=e,a=e.posAtCoords({left:n.clientX,top:n.clientY});if(!a)return!1;const r=t.doc.resolve(a.inside),i=j(p=>p.type.name==="table_cell"||p.type.name==="table_header")(r);if(!i)return!1;const{from:d}=i,c=Se.create(t.doc,d+1);return t.selection.eq(c)?!1:(t.selection instanceof ne?setTimeout(()=>{o(t.tr.setSelection(c).scrollIntoView())},20):requestAnimationFrame(()=>{o(t.tr.setSelection(c).scrollIntoView())}),!0)};Le("milkdown-table-block",Qe);const ie=me(_e.node,n=>(e,t,o)=>new nt(n,e,t,o));re(ie,{displayName:"NodeView<table-block>",group:"TableBlock"});const ot=[W,ie],ut=(n,e)=>{n.config(t=>{t.update(W.key,o=>({...o,renderButton:a=>{var r,i,d,c,p,f,w,b,_,g,s,l,m,u,h,x,y,H;switch(a){case"add_row":return(i=(r=e==null?void 0:e.addRowIcon)==null?void 0:r.call(e))!=null?i:J;case"add_col":return(c=(d=e==null?void 0:e.addColIcon)==null?void 0:d.call(e))!=null?c:J;case"delete_row":return(f=(p=e==null?void 0:e.deleteRowIcon)==null?void 0:p.call(e))!=null?f:z;case"delete_col":return(b=(w=e==null?void 0:e.deleteColIcon)==null?void 0:w.call(e))!=null?b:z;case"align_col_left":return(g=(_=e==null?void 0:e.alignLeftIcon)==null?void 0:_.call(e))!=null?g:ve;case"align_col_center":return(l=(s=e==null?void 0:e.alignCenterIcon)==null?void 0:s.call(e))!=null?l:ye;case"align_col_right":return(u=(m=e==null?void 0:e.alignRightIcon)==null?void 0:m.call(e))!=null?u:ge;case"col_drag_handle":return(x=(h=e==null?void 0:e.colDragHandleIcon)==null?void 0:h.call(e))!=null?x:U;case"row_drag_handle":return(H=(y=e==null?void 0:e.rowDragHandleIcon)==null?void 0:y.call(e))!=null?H:U}}}))}).use(ot)};export{ut as defineFeature};
