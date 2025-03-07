import{h as q,d as J,f as Q,l as X,S as Z,v as ee}from"./MilkdownEditor-xOZn_ihy.js";import{h as B,b as te,d as E,f as C,i as k,u as ne}from"./todo-list-B78GeGtK-DUrs_5bZ.js";import{u as w,a as re}from"./hooks-B2u-J907.js";var oe=Object.defineProperty,F=Object.getOwnPropertySymbols,ae=Object.prototype.hasOwnProperty,ie=Object.prototype.propertyIsEnumerable,S=(e,t,n)=>t in e?oe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,le=(e,t)=>{for(var n in t||(t={}))ae.call(t,n)&&S(e,n,t[n]);if(F)for(var n of F(t))ie.call(t,n)&&S(e,n,t[n]);return e};function _(e,t){return Object.assign(e,{meta:le({package:"@milkdown/components"},t)}),e}var se=Object.defineProperty,M=Object.getOwnPropertySymbols,ce=Object.prototype.hasOwnProperty,ue=Object.prototype.propertyIsEnumerable,H=(e,t,n)=>t in e?se(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,de=(e,t)=>{for(var n in t||(t={}))ce.call(t,n)&&H(e,n,t[n]);if(M)for(var n of M(t))ue.call(t,n)&&H(e,n,t[n]);return e};const L="image-block",O=Q("image-block",()=>({inline:!1,group:"block",selectable:!0,draggable:!0,isolating:!0,marks:"",atom:!0,priority:100,attrs:{src:{default:""},caption:{default:""},ratio:{default:1}},parseDOM:[{tag:`img[data-type="${L}"]`,getAttrs:e=>{var t;if(!(e instanceof HTMLElement))throw Z(e);return{src:e.getAttribute("src")||"",caption:e.getAttribute("caption")||"",ratio:Number((t=e.getAttribute("ratio"))!=null?t:1)}}}],toDOM:e=>["img",de({"data-type":L},e.attrs)],parseMarkdown:{match:({type:e})=>e==="image-block",runner:(e,t,n)=>{const u=t.url,a=t.title;let i=Number(t.alt||1);(Number.isNaN(i)||i===0)&&(i=1),e.addNode(n,{src:u,caption:a,ratio:i})}},toMarkdown:{match:e=>e.type.name==="image-block",runner:(e,t)=>{e.openNode("paragraph"),e.addNode("image",void 0,void 0,{title:t.attrs.caption,url:t.attrs.src,alt:`${Number.parseFloat(t.attrs.ratio).toFixed(2)}`}),e.closeNode()}}}));_(O.node,{displayName:"NodeSchema<image-block>",group:"ImageBlock"});function pe(e){return ee(e,"paragraph",(t,n,u)=>{var a,i;if(((a=t.children)==null?void 0:a.length)!==1)return;const o=(i=t.children)==null?void 0:i[0];if(!o||o.type!=="image")return;const{url:s,alt:r,title:c}=o,d={type:"image-block",url:s,alt:r,title:c};u.children.splice(n,1,d)})}const x=J("remark-image-block",()=>()=>pe);_(x.plugin,{displayName:"Remark<remarkImageBlock>",group:"ImageBlock"});_(x.options,{displayName:"RemarkConfig<remarkImageBlock>",group:"ImageBlock"});const me={imageIcon:()=>"🌌",captionIcon:()=>"💬",uploadButton:()=>B`Upload file`,confirmButton:()=>B`Confirm ⏎`,uploadPlaceholderText:"or paste the image link ...",captionPlaceholderText:"Image caption",onUpload:e=>Promise.resolve(URL.createObjectURL(e))},R=q(me,"imageBlockConfigCtx");_(R,{displayName:"Config<image-block>",group:"ImageBlock"});function fe(e,t){const n=customElements.get(e);if(n==null){customElements.define(e,t);return}n!==t&&console.warn(`Custom element ${e} has been defined before.`)}function ge({image:e,resizeHandle:t,ratio:n,setRatio:u,src:a}){const i=ne(),o=re(()=>i.current.getRootNode(),[i]);C(()=>{const s=e.current;s&&(delete s.dataset.origin,delete s.dataset.height,s.style.height="")},[a]),C(()=>{const s=t.current,r=e.current;if(!s||!r)return;const c=p=>{p.preventDefault();const m=r.getBoundingClientRect().top,f=p.clientY-m,v=Number(f<100?100:f).toFixed(2);r.dataset.height=v,r.style.height=`${v}px`},d=()=>{o.removeEventListener("pointermove",c),o.removeEventListener("pointerup",d);const p=Number(r.dataset.origin),m=Number(r.dataset.height),f=Number.parseFloat(Number(m/p).toFixed(2));Number.isNaN(f)||u(f)},$=p=>{p.preventDefault(),o.addEventListener("pointermove",c),o.addEventListener("pointerup",d)},N=p=>{const m=i.current.getBoundingClientRect().width;if(!m)return;const f=p.target,v=f.height,y=f.width,I=y<m?v:m*(v/y),P=(I*n).toFixed(2);r.dataset.origin=I.toFixed(2),r.dataset.height=P,r.style.height=`${P}px`};return r.addEventListener("load",N),s.addEventListener("pointerdown",$),()=>{r.removeEventListener("load",N),s.removeEventListener("pointerdown",$)}},[])}var he=(e,t,n)=>new Promise((u,a)=>{var i=r=>{try{s(n.next(r))}catch(c){a(c)}},o=r=>{try{s(n.throw(r))}catch(c){a(c)}},s=r=>r.done?u(r.value):Promise.resolve(r.value).then(i,o);s((n=n.apply(e,t)).next())});let b=0;const j=({src:e="",caption:t="",ratio:n=1,selected:u=!1,readonly:a=!1,setAttr:i,config:o})=>{const s=E(),r=E(),c=E(),[d,$]=w(t.length>0),[N,p]=w(e.length!==0),[m]=w(crypto.randomUUID()),[f,v]=w(!1),[y,I]=w(e);ge({image:s,resizeHandle:r,ratio:n,setRatio:l=>i==null?void 0:i("ratio",l),src:e}),C(()=>{u||$(t.length>0)},[u]);const P=l=>{const h=l.target.value;b&&window.clearTimeout(b),b=window.setTimeout(()=>{i==null||i("caption",h)},1e3)},z=l=>{const h=l.target.value;b&&(window.clearTimeout(b),b=0),i==null||i("caption",h)},A=l=>{const h=l.target.value;p(h.length!==0),I(h)},Y=l=>he(void 0,null,function*(){var g;const h=(g=l.target.files)==null?void 0:g[0];if(!h)return;const T=yield o==null?void 0:o.onUpload(h);T&&(i==null||i("src",T),p(!0))}),G=l=>{l.preventDefault(),l.stopPropagation(),!a&&$(g=>!g)},D=()=>{var l,g;i==null||i("src",(g=(l=c.current)==null?void 0:l.value)!=null?g:"")},K=l=>{l.key==="Enter"&&D()},U=l=>{l.preventDefault(),l.stopPropagation()},W=l=>{l.stopPropagation(),l.preventDefault()};return B`<host class=${k(u&&"selected")}>
    <div class=${k("image-edit",e.length>0&&"hidden")}>
      <div class="image-icon">${o==null?void 0:o.imageIcon()}</div>
      <div class=${k("link-importer",f&&"focus")}>
        <input
          ref=${c}
          draggable="true"
          ondragstart=${U}
          disabled=${a}
          class="link-input-area"
          value=${y}
          oninput=${A}
          onkeydown=${K}
          onfocus=${()=>v(!0)}
          onblur=${()=>v(!1)}
        />
        <div class=${k("placeholder",N&&"hidden")}>
          <input
            disabled=${a}
            class="hidden"
            id=${m}
            type="file"
            accept="image/*"
            onchange=${Y}
          />
          <label onpointerdown=${W} class="uploader" for=${m}>
            ${o==null?void 0:o.uploadButton()}
          </label>
          <span class="text" onclick=${()=>{var l;return(l=c.current)==null?void 0:l.focus()}}>
            ${o==null?void 0:o.uploadPlaceholderText}
          </span>
        </div>
      </div>
      <div
        class=${k("confirm",y.length===0&&"hidden")}
        onclick=${()=>D()}
      >
        ${o==null?void 0:o.confirmButton()}
      </div>
    </div>
    <div class=${k("image-wrapper",e.length===0&&"hidden")}>
      <div class="operation">
        <div class="operation-item" onpointerdown=${G}>
          ${o==null?void 0:o.captionIcon()}
        </div>
      </div>
      <img
        ref=${s}
        data-type=${L}
        src=${e}
        alt=${t}
        ratio=${n}
      />
      <div ref=${r} class="image-resize-handle"></div>
    </div>
    <input
      draggable="true"
      ondragstart=${U}
      class=${k("caption-input",!d&&"hidden")}
      placeholder=${o==null?void 0:o.captionPlaceholderText}
      oninput=${P}
      onblur=${z}
      value=${t}
    />
  </host>`};j.props={src:String,caption:String,ratio:Number,selected:Boolean,readonly:Boolean,setAttr:Function,config:Object};const ve=te(j);fe("milkdown-image-block",ve);const V=X(O.node,e=>(t,n,u)=>{const a=document.createElement("milkdown-image-block"),i=e.get(R.key),o=i.proxyDomURL,s=r=>{if(!o)a.src=r.attrs.src;else{const c=o(r.attrs.src);typeof c=="string"?a.src=c:c.then(d=>{a.src=d})}a.ratio=r.attrs.ratio,a.caption=r.attrs.caption,a.readonly=!n.editable};return s(t),a.selected=!1,a.setAttr=(r,c)=>{const d=u();d!=null&&n.dispatch(n.state.tr.setNodeAttribute(d,r,c))},a.config=i,{dom:a,update:r=>r.type!==t.type?!1:(s(r),!0),stopEvent:r=>r.target instanceof HTMLInputElement,selectNode:()=>{a.selected=!0},deselectNode:()=>{a.selected=!1},destroy:()=>{a.remove()}}});_(V,{displayName:"NodeView<image-block>",group:"ImageBlock"});const ye=[x,O,V,R].flat();export{ye as a,O as b,R as i};
