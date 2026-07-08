var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);
CustomEase.create("custom", ".83,0,.18,1");
gsap.defaults({
    ease: "ease",
    duration: 1,
});
gsap.config({
    nullTargetWarn: false,
    force3D: true,
    autoSleep: 60,
});
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // if (window.hasRunInitScripts) return;
        // window.hasRunInitScripts = true;
        const module = yield import("./init-scripts");
        if (module.default)
            module.default();
        // Prevent first load CSS transiton trigger
        document.body.classList.remove("preload");
    });
}
if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else
    init();
//# sourceMappingURL=main.js.map