// import{tomSelectInstances as o}from"./c-select.js";function u(){function i(){const t=document.querySelectorAll(".filters__left__secondary .ts-control");t&&t.forEach(n=>{n==null||n.classList.remove("show")})}function l(t){const n=document.getElementById(`${t}-ts-control`);if(!n)return;n.classList.add("show");const e=o.find(s=>s.input.id===t);e==null||e.focus()}function c(){const t=o.find(e=>e.input.ariaLabel==="Filters");t==null||t.setValue(""),document.querySelectorAll(".filters__left__secondary select").forEach(e=>{const s=o.find(d=>d.input.id===e.id);s==null||s.setValue("")}),i()}function a(){document.querySelectorAll(".filters__left__secondary .ts-wrapper").forEach(n=>{const e=document.createElement("span");e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M4 1 1 4l3 3" stroke="#2A2A2D" stroke-width=".5"/></svg>',e.className="reset-btn",e.addEventListener("click",c),n.appendChild(e)})}const r=o.find(t=>t.input.ariaLabel="Filters");r==null||r.on("change",function(t){i(),l(t)}),a()}export{u as default};

import {
    tomSelectInstances as o
} from "./c-select.js";

function u() {
    function i() {
        const t = document.querySelectorAll(".filters__left__secondary .ts-control");
        t && t.forEach(n => {
            n == null || n.classList.remove("show")
        })
    }

    function l(t) {
        const n = document.getElementById(`${t}-ts-control`);
        if (!n) return;
        n.classList.add("show");
        const e = o.find(s => s.input.id === t);
        e == null || e.focus()
    }

    function c() {
        const t = o.find(e => e.input.ariaLabel === "Filters");
        t == null || t.setValue(""), document.querySelectorAll(".filters__left__secondary select").forEach(e => {
            const s = o.find(d => d.input.id === e.id);
            s == null || s.setValue("")
        }), i()
    }

    function a() {
        document.querySelectorAll(".filters__left__secondary .ts-wrapper").forEach(n => {
            const e = document.createElement("span");
            e.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="5" height="8" viewBox="0 0 5 8" fill="none"><path d="M4 1 1 4l3 3" stroke="#2A2A2D" stroke-width=".5"/></svg>', e.className = "reset-btn", e.addEventListener("click", c), n.appendChild(e)
        })
    }
    const r = o.find(t => t.input.ariaLabel = "Filters");
    r == null || r.on("change", function(t) {
        i(), l(t)
    }), a()
}
export {
    u as
    default
};