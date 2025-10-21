var r=Object.defineProperty;var p=(o,e,t)=>e in o?r(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var s=(o,e,t)=>p(o,typeof e!="symbol"?e+"":e,t);class a{constructor(){s(this,"popup",null);s(this,"iframe",null);s(this,"isPopupOpen",!1);this.init()}init(){this.createPopupHTML(),this.bindEvents()}createPopupHTML(){var i;if(document.getElementById("sino-form-popup")){this.popup=document.getElementById("sino-form-popup"),this.iframe=((i=this.popup)==null?void 0:i.querySelector("iframe"))||null;return}this.popup=document.createElement("div"),this.popup.id="sino-form-popup",this.popup.className="sino-form-overlay";const e=document.createElement("div");e.className="sino-form-container";const t=document.createElement("button");t.className="sino-form-close",t.innerHTML="×",t.setAttribute("aria-label","Fermer le formulaire"),this.iframe=document.createElement("iframe"),this.iframe.className="sino-form-iframe",this.iframe.src="https://lucasarlot.github.io/sino-form/widget.html",this.iframe.title="Formulaire de devis SINOFORM",this.iframe.setAttribute("frameborder","0"),this.iframe.setAttribute("allowfullscreen","true"),e.appendChild(t),e.appendChild(this.iframe),this.popup.appendChild(e),document.body.appendChild(this.popup),this.addStyles()}addStyles(){if(document.getElementById("sino-form-styles"))return;const e=document.createElement("style");e.id="sino-form-styles",e.textContent=`
      .sino-form-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .sino-form-overlay.active {
        display: flex;
      }
      
      .sino-form-container {
        position: relative;
        width: 90%;
        max-width: 1200px;
        height: 90vh;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: sino-form-fade-in 0.3s ease-out;
      }
      
      .sino-form-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s ease;
        font-weight: bold;
      }
      
      .sino-form-close:hover {
        background: rgba(0, 0, 0, 0.9);
      }
      
      .sino-form-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      
      @keyframes sino-form-fade-in {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .sino-form-container {
          width: 95%;
          height: 95vh;
          border-radius: 8px;
        }
        
        .sino-form-close {
          top: 10px;
          right: 10px;
          width: 35px;
          height: 35px;
          font-size: 18px;
        }
      }
    `,document.head.appendChild(e)}bindEvents(){if(!this.popup)return;const e=this.popup.querySelector(".sino-form-close");e==null||e.addEventListener("click",()=>this.close()),this.popup.addEventListener("click",t=>{t.target===this.popup&&this.close()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&this.isPopupOpen&&this.close()}),this.iframe&&this.iframe.addEventListener("load",()=>{var t,i;(i=(t=this.iframe)==null?void 0:t.contentWindow)==null||i.postMessage({type:"resize"},"*")})}open(){if(!this.popup||this.isPopupOpen)return;this.isPopupOpen=!0,this.popup.classList.add("active"),document.body.style.overflow="hidden";const e=this.popup.querySelector(".sino-form-close");e==null||e.focus()}close(){!this.popup||!this.isPopupOpen||(this.isPopupOpen=!1,this.popup.classList.remove("active"),document.body.style.overflow="auto")}isOpen(){return this.isPopupOpen}}const n=new a;window.SinoForm={open:()=>n.open(),close:()=>n.close(),isOpen:()=>n.isOpen()};document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",()=>{});
