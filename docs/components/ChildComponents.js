
const ChildComponents = Tela.defineComponent({
  name: 'ChildComponents',
  
  
  setup(instance) {
    const state_ChildComponents = Tela.reactive({
      childCode: "",
      childNavCode: ""
    }, instance.update, {});

    

    

    const navigate = (dest) => {
      window.history.pushState(null, '', dest);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    

    

    

    // onMount
    state_ChildComponents.childCode = window.TELA_DOCS.childCode;
      state_ChildComponents.childNavCode = window.TELA_DOCS.childNavCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-ChildComponents-h1-0" }, ["Child Components"]), Tela.element('div', { 'class': "tela-ChildComponents-div-1" }, [""]), Tela.element('p', { 'class': "tela-ChildComponents-p-2" }, ["Compose your UI from smaller, focused components. Include a child component by using its name as a tag (capitalized) inside any view block."]), Tela.element('h2', { 'class': "tela-ChildComponents-h2-3" }, ["Parent Component"]), Tela.element('p', { 'class': "tela-ChildComponents-p-4" }, ["The App component passes callback functions down to Nav:"]), Tela.element('div', { 'class': "tela-ChildComponents-div-5" }, [Tela.element('pre', { 'class': "tela-ChildComponents-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ChildComponents.childCode}`])])]), Tela.element('h2', { 'class': "tela-ChildComponents-h2-7" }, ["Child Component"]), Tela.element('p', { 'class': "tela-ChildComponents-p-8" }, ["The Nav component declares the callbacks as Function props and calls them on click:"]), Tela.element('div', { 'class': "tela-ChildComponents-div-9" }, [Tela.element('pre', { 'class': "tela-ChildComponents-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_ChildComponents.childNavCode}`])])]), Tela.element('div', { 'class': "tela-ChildComponents-div-11" }, [Tela.element('p', { 'class': "tela-ChildComponents-p-12" }, ["Components must be loaded before their parents. In the HTML, include child component scripts before the parent's script tag."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.ChildComponents = ChildComponents;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChildComponents };
  }
})();