
const GettingStarted = Tela.defineComponent({
  name: 'GettingStarted',
  
  
  setup(instance) {
    const state_GettingStarted = Tela.reactive({
      installCode: "",
      cliCode: "",
      mountCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_GettingStarted.installCode = window.TELA_DOCS.installCode;
      state_GettingStarted.cliCode = window.TELA_DOCS.cliCode;
      state_GettingStarted.mountCode = window.TELA_DOCS.mountCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-GettingStarted-h1-0" }, ["Getting Started"]), Tela.element('div', { 'class': "tela-GettingStarted-div-1" }, [""]), Tela.element('h2', { 'class': "tela-GettingStarted-h2-2" }, ["Installation"]), Tela.element('p', { 'class': "tela-GettingStarted-p-3" }, ["Install globally from npm or run directly with npx:"]), Tela.element('div', { 'class': "tela-GettingStarted-div-4" }, [Tela.element('pre', { 'class': "tela-GettingStarted-pre-5" }, [Tela.element('code', { 'class': "language-bash" }, [`${state_GettingStarted.installCode}`])])]), Tela.element('h2', { 'class': "tela-GettingStarted-h2-6" }, ["CLI Usage"]), Tela.element('p', { 'class': "tela-GettingStarted-p-7" }, ["Use the tela CLI to compile .tela files into JS and CSS:"]), Tela.element('div', { 'class': "tela-GettingStarted-div-8" }, [Tela.element('pre', { 'class': "tela-GettingStarted-pre-9" }, [Tela.element('code', { 'class': "language-bash" }, [`${state_GettingStarted.cliCode}`])])]), Tela.element('p', { 'class': "tela-GettingStarted-p-10" }, ["The --global flag exposes the component on window, enabling use from plain HTML script tags."]), Tela.element('h2', { 'class': "tela-GettingStarted-h2-11" }, ["Mount in HTML"]), Tela.element('p', { 'class': "tela-GettingStarted-p-12" }, ["Include the compiled assets and mount your root component:"]), Tela.element('div', { 'class': "tela-GettingStarted-div-13" }, [Tela.element('pre', { 'class': "tela-GettingStarted-pre-14" }, [Tela.element('code', { 'class': "language-html" }, [`${state_GettingStarted.mountCode}`])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.GettingStarted = GettingStarted;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GettingStarted };
  }
})();