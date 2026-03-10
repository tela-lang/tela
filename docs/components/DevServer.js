
const DevServer = Tela.defineComponent({
  name: 'DevServer',
  
  
  setup(instance) {
    const state_DevServer = Tela.reactive({
      devServerCode: ""
    }, instance.update, {});

    

    

    

    

    // onMount
    state_DevServer.devServerCode = window.TELA_DOCS.devServerCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-DevServer-h1-0" }, ["Dev Server"]), Tela.element('div', { 'class': "tela-DevServer-div-1" }, [""]), Tela.element('p', { 'class': "tela-DevServer-p-2" }, ["tela dev starts a local HTTP server that watches your .tela files, recompiles them on every save, and live-reloads any open browser tab instantly."]), Tela.element('h2', { 'class': "tela-DevServer-h2-3" }, ["Usage"]), Tela.element('div', { 'class': "tela-DevServer-div-4" }, [Tela.element('pre', { 'class': "tela-DevServer-pre-5" }, [Tela.element('code', { 'class': "language-bash" }, [`${state_DevServer.devServerCode}`])])]), Tela.element('h2', { 'class': "tela-DevServer-h2-6" }, ["How it works"]), Tela.element('div', { 'class': "tela-DevServer-div-7" }, [Tela.element('div', { 'class': "tela-DevServer-div-8" }, [Tela.element('div', { 'class': "tela-DevServer-div-9" }, ["1"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-DevServer-div-10" }, ["File watcher"]), Tela.element('div', { 'class': "tela-DevServer-div-11" }, ["Every .tela file in your components directory is watched. On save, it recompiles to .js and .css automatically — no manual compile step."])])]), Tela.element('div', { 'class': "tela-DevServer-div-12" }, [Tela.element('div', { 'class': "tela-DevServer-div-13" }, ["2"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-DevServer-div-14" }, ["Server-Sent Events"]), Tela.element('div', { 'class': "tela-DevServer-div-15" }, ["A tiny script is injected into every served HTML page. It connects to /__tela_hmr and calls location.reload() when a change is broadcast. No WebSocket setup, no extra config."])])]), Tela.element('div', { 'class': "tela-DevServer-div-16" }, [Tela.element('div', { 'class': "tela-DevServer-div-17" }, ["3"]), Tela.element('div', {  }, [Tela.element('div', { 'class': "tela-DevServer-div-18" }, ["Debounced reloads"]), Tela.element('div', { 'class': "tela-DevServer-div-19" }, ["Rapid saves are debounced to a 50ms window, so editor auto-save never triggers duplicate reloads."])])])]), Tela.element('h2', { 'class': "tela-DevServer-h2-20" }, ["Options"]), Tela.element('div', { 'class': "tela-DevServer-div-21" }, [Tela.element('div', { 'class': "tela-DevServer-div-22" }, [Tela.element('span', {  }, ["Flag"]), Tela.element('span', {  }, ["Default"]), Tela.element('span', {  }, ["Description"])]), Tela.element('div', { 'class': "tela-DevServer-div-23" }, [Tela.element('code', { 'class': "tela-DevServer-code-24" }, ["--global"]), Tela.element('span', { 'class': "tela-DevServer-span-25" }, ["—"]), Tela.element('span', {  }, ["Expose components on window (required for plain HTML use)"])]), Tela.element('div', { 'class': "tela-DevServer-div-26" }, [Tela.element('code', { 'class': "tela-DevServer-code-27" }, ["--port N"]), Tela.element('span', { 'class': "tela-DevServer-span-28" }, ["3000"]), Tela.element('span', {  }, ["Port to listen on"])]), Tela.element('div', { 'class': "tela-DevServer-div-29" }, [Tela.element('code', { 'class': "tela-DevServer-code-30" }, ["--root dir"]), Tela.element('span', { 'class': "tela-DevServer-span-31" }, ["."]), Tela.element('span', {  }, ["Directory to serve static files from"])])]), Tela.element('div', { 'class': "tela-DevServer-div-32" }, [Tela.element('div', { 'class': "tela-DevServer-div-33" }, ["Development only"]), Tela.element('div', { 'class': "tela-DevServer-div-34" }, ["tela dev is for local development only. For production, use tela compile-all and serve the generated .js and .css files from your backend or CDN."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.DevServer = DevServer;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DevServer };
  }
})();