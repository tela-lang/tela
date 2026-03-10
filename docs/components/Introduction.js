
const Introduction = Tela.defineComponent({
  name: 'Introduction',
  
  
  setup(instance) {
    const state_Introduction = Tela.reactive({
      featText: ""
    }, instance.update, {});

    

    

    

    

    // onMount
    state_Introduction.featText = window.TELA_DOCS.introFeatures;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-Introduction-h1-0" }, ["Introduction"]), Tela.element('div', { 'class': "tela-Introduction-div-1" }, [""]), Tela.element('p', { 'class': "tela-Introduction-p-2" }, ["Write frontend like you write backend."]), Tela.element('p', { 'class': "tela-Introduction-p-3" }, ["If you work in Java, Go, or Python, switching to a JavaScript framework feels like moving to a different world — a new build system, new idioms, new mental model for things you already know how to do. Tela is a UI language designed to close that gap."]), Tela.element('p', { 'class': "tela-Introduction-p-4" }, ["Brace syntax, explicit type annotations, familiar control flow. Write .tela components and the compiler outputs plain JS and CSS — no framework at runtime, no bundler required."]), Tela.element('h2', { 'class': "tela-Introduction-h2-5" }, ["Key Features"]), Tela.element('div', { 'class': "tela-Introduction-div-6" }, [Tela.element('pre', { 'class': "tela-Introduction-pre-7" }, [`${state_Introduction.featText}`])]), Tela.element('h2', { 'class': "tela-Introduction-h2-8" }, ["Philosophy"]), Tela.element('p', { 'class': "tela-Introduction-p-9" }, ["Tela follows the principle that the browser already has everything you need. Rather than shipping a large runtime framework, Tela compiles your components to efficient JavaScript that communicates with a minimal reactive runtime."])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.Introduction = Introduction;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Introduction };
  }
})();