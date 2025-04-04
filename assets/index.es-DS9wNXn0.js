import{h as q,d as J,f as Q,l as X,S as Z,g as ee}from"./MilkdownEditor-paFqdAOJ.js";import{h as B,b as te,d as E,f as C,i as b,u as oe}from"./functions-Bsik6ikd-CD340WZ-.js";import{u as w,a as ne}from"./hooks-C5oewugr.js";import{j as re}from"./index-Bjd4USAm.js";var ae=Object.defineProperty,S=Object.getOwnPropertySymbols,ie=Object.prototype.hasOwnProperty,le=Object.prototype.propertyIsEnumerable,U=(e,t,o)=>t in e?ae(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,se=(e,t)=>{for(var o in t||(t={}))ie.call(t,o)&&U(e,o,t[o]);if(S)for(var o of S(t))le.call(t,o)&&U(e,o,t[o]);return e};function _(e,t){return Object.assign(e,{meta:se({package:"@milkdown/components"},t)}),e}var ce=Object.defineProperty,M=Object.getOwnPropertySymbols,ue=Object.prototype.hasOwnProperty,de=Object.prototype.propertyIsEnumerable,H=(e,t,o)=>t in e?ce(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,pe=(e,t)=>{for(var o in t||(t={}))ue.call(t,o)&&H(e,o,t[o]);if(M)for(var o of M(t))de.call(t,o)&&H(e,o,t[o]);return e};const L="image-block",O=Q("image-block",()=>({inline:!1,group:"block",selectable:!0,draggable:!0,isolating:!0,marks:"",atom:!0,priority:100,attrs:{src:{default:""},caption:{default:""},ratio:{default:1}},parseDOM:[{tag:`img[data-type="${L}"]`,getAttrs:e=>{var t;if(!(e instanceof HTMLElement))throw Z(e);return{src:e.getAttribute("src")||"",caption:e.getAttribute("caption")||"",ratio:Number((t=e.getAttribute("ratio"))!=null?t:1)}}}],toDOM:e=>["img",pe({"data-type":L},e.attrs)],parseMarkdown:{match:({type:e})=>e==="image-block",runner:(e,t,o)=>{const u=t.url,a=t.title;let i=Number(t.alt||1);(Number.isNaN(i)||i===0)&&(i=1),e.addNode(o,{src:u,caption:a,ratio:i})}},toMarkdown:{match:e=>e.type.name==="image-block",runner:(e,t)=>{e.openNode("paragraph"),e.addNode("image",void 0,void 0,{title:t.attrs.caption,url:t.attrs.src,alt:`${Number.parseFloat(t.attrs.ratio).toFixed(2)}`}),e.closeNode()}}}));_(O.node,{displayName:"NodeSchema<image-block>",group:"ImageBlock"});function me(e){return ee(e,"paragraph",(t,o,u)=>{var a,i;if(((a=t.children)==null?void 0:a.length)!==1)return;const r=(i=t.children)==null?void 0:i[0];if(!r||r.type!=="image")return;const{url:s,alt:n,title:c}=r,d={type:"image-block",url:s,alt:n,title:c};u.children.splice(o,1,d)})}const x=J("remark-image-block",()=>()=>me);_(x.plugin,{displayName:"Remark<remarkImageBlock>",group:"ImageBlock"});_(x.options,{displayName:"RemarkConfig<remarkImageBlock>",group:"ImageBlock"});const ge={imageIcon:()=>"🌌",captionIcon:()=>"💬",uploadButton:()=>B`Upload file`,confirmButton:()=>B`Confirm ⏎`,uploadPlaceholderText:"or paste the image link ...",captionPlaceholderText:"Image caption",onUpload:e=>Promise.resolve(URL.createObjectURL(e))},R=q(ge,"imageBlockConfigCtx");_(R,{displayName:"Config<image-block>",group:"ImageBlock"});function fe(e,t){const o=customElements.get(e);if(o==null){customElements.define(e,t);return}o!==t&&console.warn(`Custom element ${e} has been defined before.`)}function ve({image:e,resizeHandle:t,ratio:o,setRatio:u,src:a}){const i=oe(),r=ne(()=>i.current.getRootNode(),[i]);C(()=>{const s=e.current;s&&(delete s.dataset.origin,delete s.dataset.height,s.style.height="")},[a]),C(()=>{const s=t.current,n=e.current;if(!s||!n)return;const c=p=>{p.preventDefault();const m=n.getBoundingClientRect().top,g=p.clientY-m,h=Number(g<100?100:g).toFixed(2);n.dataset.height=h,n.style.height=`${h}px`},d=()=>{r.removeEventListener("pointermove",c),r.removeEventListener("pointerup",d);const p=Number(n.dataset.origin),m=Number(n.dataset.height),g=Number.parseFloat(Number(m/p).toFixed(2));Number.isNaN(g)||u(g)},$=p=>{p.preventDefault(),r.addEventListener("pointermove",c),r.addEventListener("pointerup",d)},N=p=>{const m=i.current.getBoundingClientRect().width;if(!m)return;const g=p.target,h=g.height,y=g.width,I=y<m?h:m*(h/y),P=(I*o).toFixed(2);n.dataset.origin=I.toFixed(2),n.dataset.height=P,n.style.height=`${P}px`};return n.addEventListener("load",N),s.addEventListener("pointerdown",$),()=>{n.removeEventListener("load",N),s.removeEventListener("pointerdown",$)}},[])}var he=(e,t,o)=>new Promise((u,a)=>{var i=n=>{try{s(o.next(n))}catch(c){a(c)}},r=n=>{try{s(o.throw(n))}catch(c){a(c)}},s=n=>n.done?u(n.value):Promise.resolve(n.value).then(i,r);s((o=o.apply(e,t)).next())});let k=0;const be=re("abcdefg",8),j=({src:e="",caption:t="",ratio:o=1,selected:u=!1,readonly:a=!1,setAttr:i,config:r})=>{const s=E(),n=E(),c=E(),[d,$]=w(t.length>0),[N,p]=w(e.length!==0),[m]=w(be()),[g,h]=w(!1),[y,I]=w(e);ve({image:s,resizeHandle:n,ratio:o,setRatio:l=>i==null?void 0:i("ratio",l),src:e}),C(()=>{u||$(t.length>0)},[u]);const P=l=>{const v=l.target.value;k&&window.clearTimeout(k),k=window.setTimeout(()=>{i==null||i("caption",v)},1e3)},V=l=>{const v=l.target.value;k&&(window.clearTimeout(k),k=0),i==null||i("caption",v)},z=l=>{const v=l.target.value;p(v.length!==0),I(v)},Y=l=>he(void 0,null,function*(){var f;const v=(f=l.target.files)==null?void 0:f[0];if(!v)return;const F=yield r==null?void 0:r.onUpload(v);F&&(i==null||i("src",F),p(!0))}),G=l=>{l.preventDefault(),l.stopPropagation(),!a&&$(f=>!f)},D=()=>{var l,f;i==null||i("src",(f=(l=c.current)==null?void 0:l.value)!=null?f:"")},K=l=>{l.key==="Enter"&&D()},T=l=>{l.preventDefault(),l.stopPropagation()},W=l=>{l.stopPropagation(),l.preventDefault()};return B`<host class=${b(u&&"selected")}>
    <div class=${b("image-edit",e.length>0&&"hidden")}>
      <div class="image-icon">${r==null?void 0:r.imageIcon()}</div>
      <div class=${b("link-importer",g&&"focus")}>
        <input
          ref=${c}
          draggable="true"
          ondragstart=${T}
          disabled=${a}
          class="link-input-area"
          value=${y}
          oninput=${z}
          onkeydown=${K}
          onfocus=${()=>h(!0)}
          onblur=${()=>h(!1)}
        />
        <div class=${b("placeholder",N&&"hidden")}>
          <input
            disabled=${a}
            class="hidden"
            id=${m}
            type="file"
            accept="image/*"
            onchange=${Y}
          />
          <label onpointerdown=${W} class="uploader" for=${m}>
            ${r==null?void 0:r.uploadButton()}
          </label>
          <span class="text" onclick=${()=>{var l;return(l=c.current)==null?void 0:l.focus()}}>
            ${r==null?void 0:r.uploadPlaceholderText}
          </span>
        </div>
      </div>
      <div
        class=${b("confirm",y.length===0&&"hidden")}
        onclick=${()=>D()}
      >
        ${r==null?void 0:r.confirmButton()}
      </div>
    </div>
    <div class=${b("image-wrapper",e.length===0&&"hidden")}>
      <div class="operation">
        <div class="operation-item" onpointerdown=${G}>
          ${r==null?void 0:r.captionIcon()}
        </div>
      </div>
      <img
        ref=${s}
        data-type=${L}
        src=${e}
        alt=${t}
        ratio=${o}
      />
      <div ref=${n} class="image-resize-handle"></div>
    </div>
    <input
      draggable="true"
      ondragstart=${T}
      class=${b("caption-input",!d&&"hidden")}
      placeholder=${r==null?void 0:r.captionPlaceholderText}
      oninput=${P}
      onblur=${V}
      value=${t}
    />
  </host>`};j.props={src:String,caption:String,ratio:Number,selected:Boolean,readonly:Boolean,setAttr:Function,config:Object};const ke=te(j);fe("milkdown-image-block",ke);const A=X(O.node,e=>(t,o,u)=>{const a=document.createElement("milkdown-image-block"),i=e.get(R.key),r=i.proxyDomURL,s=n=>{if(!r)a.src=n.attrs.src;else{const c=r(n.attrs.src);typeof c=="string"?a.src=c:c.then(d=>{a.src=d})}a.ratio=n.attrs.ratio,a.caption=n.attrs.caption,a.readonly=!o.editable};return s(t),a.selected=!1,a.setAttr=(n,c)=>{const d=u();d!=null&&o.dispatch(o.state.tr.setNodeAttribute(d,n,c))},a.config=i,{dom:a,update:n=>n.type!==t.type?!1:(s(n),!0),stopEvent:n=>n.target instanceof HTMLInputElement,selectNode:()=>{a.selected=!0},deselectNode:()=>{a.selected=!1},destroy:()=>{a.remove()}}});_(A,{displayName:"NodeView<image-block>",group:"ImageBlock"});const Ne=[x,O,A,R].flat();export{Ne as a,O as b,R as i};
