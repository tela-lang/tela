
const SwitchCase = Tela.defineComponent({
  name: 'SwitchCase',
  
  
  setup(instance) {
    const state_SwitchCase = Tela.reactive({
      switchFunctionCode: "",
      switchViewCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_SwitchCase.switchFunctionCode = window.TELA_DOCS.switchFunctionCode;
      state_SwitchCase.switchViewCode = window.TELA_DOCS.switchViewCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-SwitchCase-h1-0" }, ["Switch / Case"]), Tela.element('div', { 'class': "tela-SwitchCase-div-1" }, [""]), Tela.element('p', { 'class': "tela-SwitchCase-p-2" }, ["switch / case works in both function bodies and in the view block. In the view it acts as a conditional router — only the matching branch is rendered."]), Tela.element('h2', { 'class': "tela-SwitchCase-h2-3" }, ["In a function body"]), Tela.element('p', { 'class': "tela-SwitchCase-p-4" }, ["Use switch to map a value to a result without a chain of if/else if. Each case body is a single statement — use a block { } for multiple."]), Tela.element('div', { 'class': "tela-SwitchCase-div-5" }, [Tela.element('pre', { 'class': "tela-SwitchCase-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_SwitchCase.switchFunctionCode}`])])]), Tela.element('h2', { 'class': "tela-SwitchCase-h2-7" }, ["In the view"]), Tela.element('p', { 'class': "tela-SwitchCase-p-8" }, ["switch in a view block renders exactly one child element — the first case that matches, or the default if none match. This is the recommended pattern for component routing."]), Tela.element('div', { 'class': "tela-SwitchCase-div-9" }, [Tela.element('pre', { 'class': "tela-SwitchCase-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_SwitchCase.switchViewCode}`])])]), Tela.element('div', { 'class': "tela-SwitchCase-div-11" }, [Tela.element('div', { 'class': "tela-SwitchCase-div-12" }, ["No fall-through"]), Tela.element('div', { 'class': "tela-SwitchCase-div-13" }, ["Tela switch cases do not fall through. You never need a break statement inside a case."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.SwitchCase = SwitchCase;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SwitchCase };
  }
})();