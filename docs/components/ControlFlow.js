
const ControlFlow = Tela.defineComponent({
  name: 'ControlFlow',
  
  
  setup(instance) {
    const state_ControlFlow = Tela.reactive({
      ifCode: "",
      forCode: ""
    }, instance.update, {});

    

    

    // onMount
    state_ControlFlow.ifCode = window.TELA_DOCS.ifCode;
      state_ControlFlow.forCode = window.TELA_DOCS.forCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-ControlFlow-h1-0" }, ["Control Flow"]), Tela.element('div', { 'class': "tela-ControlFlow-div-1" }, [""]), Tela.element('p', { 'class': "tela-ControlFlow-p-2" }, ["Tela has first-class control flow built into the view syntax. Use if and for directly inside any element block, no special directive syntax needed."]), Tela.element('h2', { 'class': "tela-ControlFlow-h2-3" }, ["Conditional Rendering"]), Tela.element('p', { 'class': "tela-ControlFlow-p-4" }, ["Use if, else if, and else to conditionally render elements:"]), Tela.element('div', { 'class': "tela-ControlFlow-div-5" }, [Tela.element('pre', { 'class': "tela-ControlFlow-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ControlFlow.ifCode}`])])]), Tela.element('h2', { 'class': "tela-ControlFlow-h2-7" }, ["List Rendering"]), Tela.element('p', { 'class': "tela-ControlFlow-p-8" }, ["Use for (item in list) to render a block for each element in an array state variable:"]), Tela.element('div', { 'class': "tela-ControlFlow-div-9" }, [Tela.element('pre', { 'class': "tela-ControlFlow-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ControlFlow.forCode}`])])]), Tela.element('div', { 'class': "tela-ControlFlow-div-11" }, [Tela.element('p', { 'class': "tela-ControlFlow-p-12" }, ["Both if and for can be nested inside each other. The compiler generates efficient DOM operations — no virtual DOM patching required."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.ControlFlow = ControlFlow;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ControlFlow };
  }
})();