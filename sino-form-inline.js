var s=Object.defineProperty;var a=(i,e,n)=>e in i?s(i,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):i[e]=n;var o=(i,e,n)=>a(i,typeof e!="symbol"?e+"":e,n);class l{constructor(){o(this,"container",null);o(this,"isInjectedFlag",!1);this.init()}init(){this.addStyles()}addStyles(){if(document.getElementById("sino-form-inline-styles"))return;const e=document.createElement("style");e.id="sino-form-inline-styles",e.textContent=`
      .sino-form-inline {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: transparent;
        width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        position: relative;
      }
      
      .sino-form-inline * {
        box-sizing: border-box;
      }
      
      /* Styles pour masquer les éléments de page wrapper */
      .sino-form-inline .page-header,
      .sino-form-inline .page-footer,
      .sino-form-inline .navigation,
      .sino-form-inline .progress-bar,
      .sino-form-inline .timeline {
        display: none !important;
      }
      
      /* Assurer que le formulaire prend toute la place disponible */
      .sino-form-inline .quote-form {
        width: 100%;
        background: transparent;
        border: none;
        margin: 0;
        padding: 0;
      }
      
      /* Styles pour les étapes du formulaire */
      .sino-form-inline .form-step {
        width: 100%;
        background: transparent;
        border: none;
        margin: 0;
        padding: 20px;
      }
      
      /* Masquer les éléments de navigation de page */
      .sino-form-inline .step-navigation,
      .sino-form-inline .page-controls {
        display: none !important;
      }
    `,document.head.appendChild(e)}inject(e){let n;if(typeof e=="string"){if(n=document.querySelector(e),!n){console.error(`SinoForm: Element "${e}" not found`);return}}else n=e;n.innerHTML="",n.className="sino-form-inline";const t=document.createElement("iframe");t.src="https://lucasarlot.github.io/sino-form/widget.html",t.style.cssText=`
      width: 100%;
      height: 600px;
      border: none;
      background: transparent;
    `,t.setAttribute("frameborder","0"),t.setAttribute("allowfullscreen","true"),n.appendChild(t),this.container=n,this.isInjectedFlag=!0}remove(){this.container&&(this.container.innerHTML="",this.container=null),this.isInjectedFlag=!1}isInjected(){return this.isInjectedFlag}}const r=new l;window.SinoFormInline={inject:i=>r.inject(i),remove:()=>r.remove(),isInjected:()=>r.isInjected()};document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",()=>{});
