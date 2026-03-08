
const Introduction = Tela.defineComponent({
  name: 'Introduction',
  
  
  setup(instance) {
    const state_Introduction = Tela.reactive({
      featText: ""
    }, instance.update, {});

    

    

    // onMount
    state_Introduction.featText = window.TELA_DOCS.introFeatures;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-Introduction-h1-0" }, ["Introduction"]), Tela.element('div', { 'class': "tela-Introduction-div-1" }, [""]), Tela.element('p', { 'class': "tela-Introduction-p-2" }, ["Tela is a compiled, component-based UI language. Write components in .tela files with a unified syntax for structure, style, and logic."]), Tela.element('p', { 'class': "tela-Introduction-p-3" }, ["The compiler outputs plain JS and CSS with no framework dependency at runtime. Drop the output into any web project with no build tool configuration required."]), Tela.element('h2', { 'class': "tela-Introduction-h2-4" }, ["Key Features"]), Tela.element('div', { 'class': "tela-Introduction-div-5" }, [Tela.element('pre', { 'class': "tela-Introduction-pre-6" }, [`${state_Introduction.featText}`])]), Tela.element('h2', { 'class': "tela-Introduction-h2-7" }, ["Philosophy"]), Tela.element('p', { 'class': "tela-Introduction-p-8" }, ["Tela follows the principle that the browser already has everything you need. Rather than shipping a large runtime framework, Tela compiles your components to efficient JavaScript that communicates with a minimal reactive runtime."])]);
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