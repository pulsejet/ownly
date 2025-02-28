import{b as ue,u as te,d as S,g as fe,h as pe,i as he,f as we,S as U,T as ge,U as ye,V as be,t as z,y as J}from"./todo-list-B78GeGtK-DUrs_5bZ.js";import{h as me,l as _e,a0 as ve,L,a1 as ne,a2 as xe,o as j,V as P,a3 as D,a4 as He,a5 as Re,a6 as M,a7 as $e,a8 as Ce,a9 as Ie,aa as Be,ab as Oe,ac as ke,N as Se}from"./MilkdownEditor-CAUwesU3.js";import{a as q,b as T}from"./hooks-B2u-J907.js";import{t as re}from"./index-nu05uOOf.js";import{c as E,o as N}from"./floating-ui.dom-DJfcjnnZ.js";import"./index-Bta6kAKx.js";import"./mutex-yV3mxE7x.js";function Le(n,e){const t=customElements.get(n);if(t==null){customElements.define(n,e);return}t!==e&&console.warn(`Custom element ${n} has been defined before.`)}var Ae=Object.defineProperty,K=Object.getOwnPropertySymbols,Pe=Object.prototype.hasOwnProperty,Te=Object.prototype.propertyIsEnumerable,Q=(n,e,t)=>e in n?Ae(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,qe=(n,e)=>{for(var t in e||(e={}))Pe.call(e,t)&&Q(n,t,e[t]);if(K)for(var t of K(e))Te.call(e,t)&&Q(n,t,e[t]);return n};function oe(n,e){return Object.assign(n,{meta:qe({package:"@milkdown/components"},e)}),n}var Ee=Object.defineProperty,Z=Object.getOwnPropertySymbols,De=Object.prototype.hasOwnProperty,Me=Object.prototype.propertyIsEnumerable,ee=(n,e,t)=>e in n?Ee(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,je=(n,e)=>{for(var t in e)De.call(e,t)&&ee(n,t,e[t]);if(Z)for(var t of Z(e))Me.call(e,t)&&ee(n,t,e[t]);return n};const Ne={renderButton:n=>{switch(n){case"add_row":return"+";case"add_col":return"+";case"delete_row":return"-";case"delete_col":return"-";case"align_col_left":return"left";case"align_col_center":return"center";case"align_col_right":return"right";case"col_drag_handle":return"=";case"row_drag_handle":return"="}}},W=me(je({},Ne),"tableBlockConfigCtx");oe(W,{displayName:"Config<table-block>",group:"TableBlock"});function X(n,e){for(let t=0;t<n.childCount;t++)if(n.child(t)===e)return t;return-1}function We(n,e){var t,r,a;if(e)try{const o=e.posAtCoords({left:n.clientX,top:n.clientY});if(!o)return;const i=o==null?void 0:o.inside;if(i==null||i<0)return;const d=e.state.doc.resolve(i),c=e.state.doc.nodeAt(i);if(!c)return;const p=["table_cell","table_header"],f=["table_row","table_header_row"],w=p.includes(c.type.name)?c:(t=j(l=>p.includes(l.type.name))(d))==null?void 0:t.node,m=(r=j(l=>f.includes(l.type.name))(d))==null?void 0:r.node,v=(a=j(l=>l.type.name==="table")(d))==null?void 0:a.node;if(!w||!m||!v)return;const g=X(m,w);return[X(v,m),g]}catch{return}}function V(n,[e,t]){const r=n.current;if(!r)return;const a=r.querySelectorAll("tr"),o=a[e];if(!o)return;const i=a[0];if(!i)return;const d=i.children[t];if(!d)return;const c=o.children[t];if(c)return{row:o,col:c,headerCol:d}}function Ve(n,e,t){if(!e||!t)return;const{selection:r}=e.get(L).state;if(!(r instanceof ne))return;const{$from:a}=r,o=xe(a);if(!(!o||o.node!==t)){if(r.isColSelection()){const{$head:i}=r,d=i.index(i.depth-1);F({refs:n,index:[0,d],before:c=>{var p;(p=c.querySelector(".button-group"))==null||p.setAttribute("data-show","true")}});return}if(r.isRowSelection()){const{$head:i}=r,d=j(p=>p.type.name==="table_row"||p.type.name==="table_header_row")(i);if(!d)return;const c=X(o.node,d.node);G({refs:n,index:[c,0],before:p=>{var f;c>0&&((f=p.querySelector(".button-group"))==null||f.setAttribute("data-show","true"))}})}}}function F({refs:n,index:e,before:t,after:r}){const{contentWrapperRef:a,colHandleRef:o,hoverIndex:i}=n,d=o.current;if(!d)return;i.current=e;const c=V(a,e);if(!c)return;const{headerCol:p}=c;d.dataset.show="true",t&&t(d),E(p,d,{placement:"top"}).then(({x:f,y:w})=>{Object.assign(d.style,{left:`${f}px`,top:`${w}px`}),r&&r(d)})}function G({refs:n,index:e,before:t,after:r}){const{contentWrapperRef:a,rowHandleRef:o,hoverIndex:i}=n,d=o.current;if(!d)return;i.current=e;const c=V(a,e);if(!c)return;const{row:p}=c;d.dataset.show="true",t&&t(d),E(p,d,{placement:"left"}).then(({x:f,y:w})=>{Object.assign(d.style,{left:`${f}px`,top:`${w}px`}),r&&r(d)})}function le(n){const{dragPreviewRef:e,tableWrapperRef:t,contentWrapperRef:r,yLineHandleRef:a,xLineHandleRef:o,colHandleRef:i,rowHandleRef:d}=n,c=e.current;if(!c)return;const p=t.current;if(!p)return;const f=r.current;if(!f)return;const w=f.querySelector("tbody");if(!w)return;const m=c.querySelector("tbody");if(!m)return;const v=a.current;if(!v)return;const g=o.current;if(!g)return;const s=i.current;if(!s)return;const l=d.current;return l?{preview:c,wrapper:p,content:f,contentRoot:w,previewRoot:m,yHandle:v,xHandle:g,colHandle:s,rowHandle:l}:void 0}function ae(n,e,t,r){const a=t==null?void 0:t.get(L);if(!(a!=null&&a.editable))return;e.stopPropagation(),e.dataTransfer&&(e.dataTransfer.effectAllowed="move");const o=le(n);o&&requestAnimationFrame(()=>{r(o)})}function Xe(n,e){return t=>{ae(n,t,e,({preview:r,content:a,previewRoot:o,yHandle:i,xHandle:d,colHandle:c,rowHandle:p})=>{var f;const{hoverIndex:w,dragInfo:m}=n;d.dataset.displayType="indicator",i.dataset.show="false",c.dataset.show="false",(f=p.querySelector(".button-group"))==null||f.setAttribute("data-show","false");const[v]=w.current;m.current={startCoords:[t.clientX,t.clientY],startIndex:v,endIndex:v,type:"row"},r.dataset.direction="vertical";const g=a.querySelectorAll("tr");for(;o.firstChild;)o.removeChild(o.firstChild);const s=g[v];if(!s)return;o.appendChild(s.cloneNode(!0));const l=s.getBoundingClientRect().height,{width:_}=a.querySelector("tbody").getBoundingClientRect();Object.assign(r.style,{width:`${_}px`,height:`${l}px`}),r.dataset.show="true"})}}function Ye(n,e){return t=>{ae(n,t,e,({preview:r,content:a,previewRoot:o,yHandle:i,xHandle:d,colHandle:c,rowHandle:p})=>{var f;const{hoverIndex:w,dragInfo:m}=n;d.dataset.show="false",i.dataset.displayType="indicator",p.dataset.show="false",(f=c.querySelector(".button-group"))==null||f.setAttribute("data-show","false");const[v,g]=w.current;m.current={startCoords:[t.clientX,t.clientY],startIndex:g,endIndex:g,type:"col"},r.dataset.direction="horizontal";const s=a.querySelectorAll("tr");for(;o.firstChild;)o.removeChild(o.firstChild);let l;Array.from(s).forEach(u=>{const h=u.children[g];if(!h)return;l===void 0&&(l=h.getBoundingClientRect().width);const x=h.parentElement.cloneNode(!1),y=h.cloneNode(!0);x.appendChild(y),o.appendChild(x)});const{height:_}=a.querySelector("tbody").getBoundingClientRect();Object.assign(r.style,{width:`${l}px`,height:`${_}px`}),r.dataset.show="true"})}}function Fe(n){return re(e=>{const t=le(n);if(!t)return;const{preview:r,content:a,contentRoot:o,xHandle:i,yHandle:d}=t,{dragInfo:c,hoverIndex:p}=n;if(r.dataset.show==="false")return;const f=V(n.contentWrapperRef,p.current);if(!f)return;const w=o.querySelector("tr");if(!w)return;const m=c.current;if(!m||!o.offsetParent)return;const v=o.offsetParent.offsetTop,g=o.offsetParent.offsetLeft;if(m.type==="col"){const s=f.col.getBoundingClientRect().width,{left:l,width:_}=o.getBoundingClientRect(),u=g-l,h=e.clientX+u-s/2,x=e.clientX+u+s/2,[y]=m.startCoords,H=y<e.clientX?"right":"left";r.style.top=`${v}px`;const $=h<l+u-20?l+u-20:h>l+_+u-s+20?l+_+u-s+20:h;r.style.left=`${$}px`;const k=Array.from(w.children),O=k.find((B,b)=>{const I=B.getBoundingClientRect();let C=I.left+g-l,R=I.right+g-l;if(H==="right"){if(C=C+I.width/2,R=R+I.width/2,C<=x&&R>=x||b===w.children.length-1&&x>R)return!0}else if(C=C-I.width/2,R=R-I.width/2,C<=h&&R>=h||b===0&&h<C)return!0;return!1});if(O){const B=d.getBoundingClientRect().width,b=a.getBoundingClientRect(),I=k.indexOf(O);m.endIndex=I,E(O,d,{placement:H==="left"?"left":"right",middleware:[N(H==="left"?-1*B:0)]}).then(({x:C})=>{d.dataset.show="true",Object.assign(d.style,{height:`${b.height}px`,left:`${C}px`,top:`${v}px`})})}}else if(m.type==="row"){const s=f.row.getBoundingClientRect().height,{top:l,height:_}=o.getBoundingClientRect(),u=v-l,h=e.clientY+u-s/2,x=e.clientY+u+s/2,[y,H]=m.startCoords,$=H<e.clientY?"down":"up",k=h<l+u-20?l+u-20:h>l+_+u-s+20?l+_+u-s+20:h;r.style.top=`${k}px`,r.style.left=`${g}px`;const O=Array.from(o.querySelectorAll("tr")),B=O.find((b,I)=>{const C=b.getBoundingClientRect();let R=C.top+v-l,A=C.bottom+v-l;if($==="down"){if(R=R+C.height/2,A=A+C.height/2,R<=x&&A>=x||I===O.length-1&&x>A)return!0}else if(R=R-C.height/2,A=A-C.height/2,R<=h&&A>=h||I===0&&h<R)return!0;return!1});if(B){const b=i.getBoundingClientRect().height,I=a.getBoundingClientRect(),C=O.indexOf(B);m.endIndex=C,E(B,i,{placement:$==="up"?"top":"bottom",middleware:[N($==="up"?-1*b:0)]}).then(({y:R})=>{i.dataset.show="true",Object.assign(i.style,{width:`${I.width}px`,top:`${R}px`})})}}},20)}function Ge(n,e,t){const{dragPreviewRef:r,yLineHandleRef:a,xLineHandleRef:o,dragInfo:i}=n,d=te(),c=q(()=>d.current.getRootNode(),[d]),p=q(()=>Xe(n,e),[n]),f=q(()=>Ye(n,e),[n]);return we(()=>{const w=()=>{const g=r.current;if(!g||g.dataset.show==="false")return;const s=g==null?void 0:g.querySelector("tbody");for(;s!=null&&s.firstChild;)s==null||s.removeChild(s.firstChild);g&&(g.dataset.show="false")},m=()=>{var g;const s=r.current;if(!s)return;const l=a.current;if(!l)return;const _=o.current;if(!_)return;const u=i.current;if(!u||!e||s.dataset.show==="false"||!n.colHandleRef.current||!n.rowHandleRef.current||(l.dataset.show="false",_.dataset.show="false",u.startIndex===u.endIndex))return;const y=e.get(P),H={from:u.startIndex,to:u.endIndex,pos:((g=t==null?void 0:t())!=null?g:0)+1};if(u.type==="col"){y.call(M.key,{pos:H.pos,index:u.startIndex}),y.call(Oe.key,H);const $=[0,u.endIndex];F({refs:n,index:$})}else{y.call(D.key,{pos:H.pos,index:u.startIndex}),y.call(ke.key,H);const $=[u.endIndex,0];G({refs:n,index:$})}requestAnimationFrame(()=>{e.get(L).focus()})},v=Fe(n);return c.addEventListener("dragover",v),c.addEventListener("dragend",w),c.addEventListener("drop",m),()=>{c.removeEventListener("dragover",v),c.removeEventListener("dragend",w),c.removeEventListener("drop",m)}},[]),{dragRow:p,dragCol:f}}function Ue(n,e){return re(t=>{if(!(e!=null&&e.editable))return;const{contentWrapperRef:r,yLineHandleRef:a,xLineHandleRef:o,colHandleRef:i,rowHandleRef:d,hoverIndex:c,lineHoverIndex:p}=n,f=a.current;if(!f)return;const w=o.current;if(!w)return;const m=r.current;if(!m)return;const v=d.current;if(!v)return;const g=i.current;if(!g)return;const s=We(t,e);if(!s)return;const l=V(r,s);if(!l)return;const[_,u]=s,h=l.col.getBoundingClientRect(),x=Math.abs(t.clientX-h.left)<8,y=Math.abs(h.right-t.clientX)<8,H=Math.abs(t.clientY-h.top)<8,$=Math.abs(h.bottom-t.clientY)<8,k=x||y||H||$,O=v.querySelector(".button-group"),B=g.querySelector(".button-group");if(O&&(O.dataset.show="false"),B&&(B.dataset.show="false"),k){const b=m.getBoundingClientRect();v.dataset.show="false",g.dataset.show="false",w.dataset.displayType="tool",f.dataset.displayType="tool";const I=f.getBoundingClientRect().width,C=w.getBoundingClientRect().height;x||y?(p.current[1]=x?u:u+1,E(l.col,f,{placement:x?"left":"right",middleware:[N(x?-1*I:0)]}).then(({x:R})=>{f.dataset.show="true",Object.assign(f.style,{height:`${b.height}px`,left:`${R}px`})})):f.dataset.show="false",s[0]!==0&&(H||$)?(p.current[0]=H?_:_+1,E(l.row,w,{placement:H?"top":"bottom",middleware:[N(H?-1*C:0)]}).then(({y:R})=>{w.dataset.show="true",Object.assign(w.style,{width:`${b.width}px`,top:`${R}px`})})):w.dataset.show="false";return}p.current=[-1,-1],f.dataset.show="false",w.dataset.show="false",v.dataset.show="true",g.dataset.show="true",G({refs:n,index:s}),F({refs:n,index:s}),c.current=s},20)}function ze(n){return()=>{const{rowHandleRef:e,colHandleRef:t,yLineHandleRef:r,xLineHandleRef:a}=n;setTimeout(()=>{const o=e.current;if(!o)return;const i=t.current;if(!i)return;const d=r.current;if(!d)return;const c=a.current;c&&(o.dataset.show="false",i.dataset.show="false",d.dataset.show="false",c.dataset.show="false")},200)}}function Je(n,e){const t=q(()=>Ue(n,e),[]),r=q(()=>ze(n),[]);return{pointerMove:t,pointerLeave:r}}function Ke(n,e,t){const{xLineHandleRef:r,contentWrapperRef:a,colHandleRef:o,rowHandleRef:i,hoverIndex:d,lineHoverIndex:c}=n,p=T(()=>{var s,l,_;if(!e)return;const u=r.current;if(!u)return;const[h]=c.current;if(h<0||!e.get(L).editable)return;const x=Array.from((l=(s=a.current)==null?void 0:s.querySelectorAll("tr"))!=null?l:[]),y=e.get(P),H=((_=t==null?void 0:t())!=null?_:0)+1;x.length===h?(y.call(D.key,{pos:H,index:h-1}),y.call(He.key)):(y.call(D.key,{pos:H,index:h}),y.call(Re.key)),y.call(D.key,{pos:H,index:h}),u.dataset.show="false"},[]),f=T(()=>{var s,l,_,u;if(!e||!r.current)return;const[x,y]=c.current;if(y<0||!e.get(L).editable)return;const H=Array.from((_=(l=(s=a.current)==null?void 0:s.querySelector("tr"))==null?void 0:l.children)!=null?_:[]),$=e.get(P),k=((u=t==null?void 0:t())!=null?u:0)+1;H.length===y?($.call(M.key,{pos:k,index:y-1}),$.call($e.key)):($.call(M.key,{pos:k,index:y}),$.call(Ce.key)),$.call(M.key,{pos:k,index:y})},[]),w=T(()=>{var s,l;if(!e)return;const[_,u]=d.current,h=e.get(P),x=((s=t==null?void 0:t())!=null?s:0)+1;h.call(M.key,{pos:x,index:u});const y=(l=o.current)==null?void 0:l.querySelector(".button-group");y&&(y.dataset.show=y.dataset.show==="true"?"false":"true")},[]),m=T(()=>{var s,l;if(!e)return;const[_,u]=d.current,h=e.get(P),x=((s=t==null?void 0:t())!=null?s:0)+1;h.call(D.key,{pos:x,index:_});const y=(l=i.current)==null?void 0:l.querySelector(".button-group");y&&_>0&&(y.dataset.show=y.dataset.show==="true"?"false":"true")},[]),v=T(s=>{if(!e||!e.get(L).editable)return;s.preventDefault(),s.stopPropagation(),e.get(P).call(Ie.key),requestAnimationFrame(()=>{e.get(L).focus()})},[]),g=T(s=>l=>{if(!e||!e.get(L).editable)return;l.preventDefault(),l.stopPropagation(),e.get(P).call(Be.key,s),requestAnimationFrame(()=>{e.get(L).focus()})},[]);return{onAddRow:p,onAddCol:f,selectCol:w,selectRow:m,deleteSelected:v,onAlign:g}}const se=({view:n,ctx:e,getPos:t,node:r,config:a})=>{const o=te(),i=S(),d=S(),c=S(),p=S(),f=S(),w=S(),m=S(),v=S([0,0]),g=S([-1,-1]),s=S(),l=q(()=>({dragPreviewRef:m,tableWrapperRef:w,contentWrapperRef:i,yLineHandleRef:f,xLineHandleRef:p,colHandleRef:d,rowHandleRef:c,hoverIndex:v,lineHoverIndex:g,dragInfo:s}),[]);fe(()=>{const b=i.current;if(!b)return;const I=o.current.querySelector("[data-content-dom]");I&&b.appendChild(I),n!=null&&n.editable&&Ve(l,e,r)},[]);const{pointerLeave:_,pointerMove:u}=Je(l,n),{dragRow:h,dragCol:x}=Ge(l,e,t),{onAddRow:y,onAddCol:H,selectCol:$,selectRow:k,deleteSelected:O,onAlign:B}=Ke(l,e,t);return pe`
    <host
      class=${he(!(n!=null&&n.editable)&&"readonly")}
      ondragstart=${b=>b.preventDefault()}
      ondragover=${b=>b.preventDefault()}
      ondragleave=${b=>b.preventDefault()}
      onpointermove=${u}
      onpointerleave=${_}
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
        onpointerdown=${b=>b.stopPropagation()}
        onpointermove=${b=>b.stopPropagation()}
        ref=${d}
      >
        ${a==null?void 0:a.renderButton("col_drag_handle")}
        <div
          data-show="false"
          class="button-group"
          onpointermove=${b=>b.stopPropagation}
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
        onpointerdown=${b=>b.stopPropagation()}
        onpointermove=${b=>b.stopPropagation()}
        ref=${c}
      >
        ${a==null?void 0:a.renderButton("row_drag_handle")}
        <div
          data-show="false"
          class="button-group"
          onpointermove=${b=>b.stopPropagation}
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
          ref=${m}
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
          onpointermove=${b=>b.stopPropagation}
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
          onpointermove=${b=>b.stopPropagation}
          ref=${f}
        >
          <button type="button" onclick=${H} class="add-button">
            ${a==null?void 0:a.renderButton("add_col")}
          </button>
        </div>
        <table ref=${i} class="children"></table>
      </div>
    </host>
  `};se.props={getPos:Function,view:Object,ctx:Object,node:Object,config:Object};const Qe=ue(se);var de=n=>{throw TypeError(n)},Ze=(n,e,t)=>e.has(n)||de("Cannot "+t),et=(n,e,t)=>e.has(n)?de("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,t),tt=(n,e,t)=>(Ze(n,e,"access private method"),t),Y,ce;class nt{constructor(e,t,r,a){this.ctx=e,this.node=t,this.view=r,this.getPos=a,et(this,Y);const o=document.createElement("milkdown-table-block");this.dom=o,o.view=r,o.ctx=e,o.getPos=a,o.node=t,o.config=e.get(W.key);const i=document.createElement("tbody");this.contentDOM=i,i.setAttribute("data-content-dom","true"),i.classList.add("content-dom"),o.appendChild(i)}update(e){return e.type!==this.node.type||e.sameMarkup(this.node)&&e.content.eq(this.node.content)?!1:(this.node=e,this.dom.node=e,!0)}stopEvent(e){if(e.type==="drop"||e.type.startsWith("drag"))return!0;if(e.type==="mousedown"){if(e.target instanceof HTMLButtonElement)return!0;const t=e.target;if(t instanceof HTMLElement&&(t.closest("th")||t.closest("td"))){const r=e;return tt(this,Y,ce).call(this,r)}}return!1}ignoreMutation(e){return!this.dom||!this.contentDOM?!0:e.type==="selection"?!1:this.contentDOM===e.target&&e.type==="attributes"?!0:!this.contentDOM.contains(e.target)}}Y=new WeakSet;ce=function(n){const e=this.view;if(!e.editable)return!1;const{state:t,dispatch:r}=e,a=e.posAtCoords({left:n.clientX,top:n.clientY});if(!a)return!1;const o=t.doc.resolve(a.inside),i=j(p=>p.type.name==="table_cell"||p.type.name==="table_header")(o);if(!i)return!1;const{from:d}=i,c=Se.create(t.doc,d+1);return t.selection.eq(c)?!1:(t.selection instanceof ne?setTimeout(()=>{r(t.tr.setSelection(c).scrollIntoView())},20):requestAnimationFrame(()=>{r(t.tr.setSelection(c).scrollIntoView())}),!0)};Le("milkdown-table-block",Qe);const ie=_e(ve.node,n=>(e,t,r)=>new nt(n,e,t,r));oe(ie,{displayName:"NodeView<table-block>",group:"TableBlock"});const rt=[W,ie],ut=(n,e)=>{n.config(t=>{t.update(W.key,r=>({...r,renderButton:a=>{var o,i,d,c,p,f,w,m,v,g,s,l,_,u,h,x,y,H;switch(a){case"add_row":return(i=(o=e==null?void 0:e.addRowIcon)==null?void 0:o.call(e))!=null?i:J;case"add_col":return(c=(d=e==null?void 0:e.addColIcon)==null?void 0:d.call(e))!=null?c:J;case"delete_row":return(f=(p=e==null?void 0:e.deleteRowIcon)==null?void 0:p.call(e))!=null?f:z;case"delete_col":return(m=(w=e==null?void 0:e.deleteColIcon)==null?void 0:w.call(e))!=null?m:z;case"align_col_left":return(g=(v=e==null?void 0:e.alignLeftIcon)==null?void 0:v.call(e))!=null?g:be;case"align_col_center":return(l=(s=e==null?void 0:e.alignCenterIcon)==null?void 0:s.call(e))!=null?l:ye;case"align_col_right":return(u=(_=e==null?void 0:e.alignRightIcon)==null?void 0:_.call(e))!=null?u:ge;case"col_drag_handle":return(x=(h=e==null?void 0:e.colDragHandleIcon)==null?void 0:h.call(e))!=null?x:U;case"row_drag_handle":return(H=(y=e==null?void 0:e.rowDragHandleIcon)==null?void 0:y.call(e))!=null?H:U}}}))}).use(rt)};export{ut as defineFeature};
