import{$ as M,g as q,h as j}from"./MilkdownEditor-BItiUuSt.js";import{r as m,g as V,c as S,a as A,i as _,h}from"./index-C5Q1Okh6.js";import{c as b,p as H}from"./purify.es-CUZqrfXr.js";import"./index.dom-C3-224fz.js";import"./mutex-yV3mxE7x.js";var E=Object.defineProperty,k=Object.getOwnPropertySymbols,F=Object.prototype.hasOwnProperty,T=Object.prototype.propertyIsEnumerable,I=(r,e,t)=>e in r?E(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,Z=(r,e)=>{for(var t in e||(e={}))F.call(e,t)&&I(r,t,e[t]);if(k)for(var t of k(e))T.call(e,t)&&I(r,t,e[t]);return r};function L(r,e){return Object.assign(r,{meta:Z({package:"@milkdown/components"},e)}),r}const $={renderLabel:({label:r,listType:e,checked:t})=>t==null?e==="bullet"?"⦿":r:t?"☑":"□"},v=M($,"listItemBlockConfigCtx");L(v,{displayName:"Config<list-item-block>",group:"ListItemBlock"});function P({icon:r,class:e,onClick:t}){return h("span",{class:b("milkdown-icon",e),onPointerdown:t,ref:c=>{c&&r&&(c.innerHTML=H.sanitize(r.trim()))}})}P.props={icon:{type:String,required:!1},class:{type:String,required:!1},onClick:{type:Function,required:!1}};const D=A({props:{label:{type:Object,required:!0},checked:{type:Object,required:!0},listType:{type:Object,required:!0},config:{type:Object,required:!0},readonly:{type:Object,required:!0},selected:{type:Object,required:!0},setAttr:{type:Function,required:!0},onMount:{type:Function,required:!0}},setup({label:r,checked:e,listType:t,config:c,readonly:n,setAttr:s,onMount:i,selected:a}){const u=o=>{o!=null&&o instanceof Element&&i(o)},p=o=>{o.stopPropagation(),o.preventDefault(),e.value!=null&&s("checked",!e.value)},d=_(()=>c.renderLabel({label:r.value,listType:t.value,checked:e.value,readonly:n.value})),f=_(()=>e.value==null?t.value==="bullet"?"bullet":"ordered":e.value?"checked":"unchecked");return()=>h("li",{class:b("list-item",a.value&&"ProseMirror-selectednode")},h("div",{class:"label-wrapper",onPointerdown:p,contenteditable:!1},h(P,{class:b("label",n.value&&"readonly",f.value),icon:d.value})),h("div",{class:"children",ref:u}))}}),O=q(j.node,r=>(e,t,c)=>{const n=document.createElement("div");n.className="milkdown-list-item-block";const s=document.createElement("div");s.setAttribute("data-content-dom","true"),s.classList.add("content-dom");const i=m(e.attrs.label),a=m(e.attrs.checked),u=m(e.attrs.listType),p=m(!t.editable),d=r.get(v.key),f=m(!1),o=(l,B)=>{const C=c();C!=null&&t.dispatch(t.state.tr.setNodeAttribute(C,l,B))},x=V(()=>{f.value?n.classList.add("selected"):n.classList.remove("selected")}),y=S(D,{label:i,checked:a,listType:u,readonly:p,config:d,selected:f,setAttr:o,onMount:l=>{l.appendChild(s)}});y.mount(n);const w=l=>{u.value=l.attrs.listType,i.value=l.attrs.label,a.value=l.attrs.checked,p.value=!t.editable};w(e);let g=e;return{dom:n,contentDOM:s,update:l=>l.type!==e.type?!1:(l.sameMarkup(g)&&l.content.eq(g.content)||(g=l,w(l)),!0),ignoreMutation:l=>!n||!s?!0:l.type==="selection"?!1:s===l.target&&l.type==="attributes"?!0:!s.contains(l.target),selectNode:()=>{f.value=!0},deselectNode:()=>{f.value=!1},destroy:()=>{x(),y.unmount(),n.remove(),s.remove()}}});L(O,{displayName:"NodeView<list-item-block>",group:"ListItemBlock"});const U=[v,O],W=`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_952_6527)">
      <circle cx="12" cy="12" r="3" />
    </g>
    <defs>
      <clipPath id="clip0_952_6527">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`,z=`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_1803_1151)">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10.71 16.29C10.32 16.68 9.69 16.68 9.3 16.29L5.71 12.7C5.32 12.31 5.32 11.68 5.71 11.29C6.1 10.9 6.73 10.9 7.12 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.71 16.29Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_1803_1151">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`,R=`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_1803_535)">
      <path
        d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H18C18.55 5 19 5.45 19 6V18C19 18.55 18.55 19 18 19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_1803_535">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;function G(r,e){r.set(v.key,{renderLabel:({label:t,listType:c,checked:n})=>{var s,i,a,u,p,d;return n==null?c==="bullet"?(i=(s=e?.bulletIcon)==null?void 0:s.call(e))!=null?i:W:t:n?(u=(a=e?.checkBoxCheckedIcon)==null?void 0:a.call(e))!=null?u:z:(d=(p=e?.checkBoxUncheckedIcon)==null?void 0:p.call(e))!=null?d:R}})}const ee=(r,e)=>{r.config(t=>G(t,e)).use(U)};export{ee as defineFeature};
