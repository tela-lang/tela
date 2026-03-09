
const TemplateSyntax = Tela.defineComponent({
  name: 'TemplateSyntax',
  
  
  setup(instance) {
    const state_TemplateSyntax = Tela.reactive({
      templateCode: "",
      styleCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_TemplateSyntax.templateCode = window.TELA_DOCS.templateCode;
      state_TemplateSyntax.styleCode = window.TELA_DOCS.styleCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-TemplateSyntax-h1-0" }, ["Template Syntax"]), Tela.element('div', { 'class': "tela-TemplateSyntax-div-1" }, [""]), Tela.element('p', { 'class': "tela-TemplateSyntax-p-2" }, ["The view block describes your component's DOM using a simple declarative syntax. Elements are written as tag name followed by a block of attributes, styles, and children."]), Tela.element('h2', { 'class': "tela-TemplateSyntax-h2-3" }, ["Elements and Interpolation"]), Tela.element('p', { 'class': "tela-TemplateSyntax-p-4" }, ["Use content: to set text content. Interpolate state with the dollar-brace syntax:"]), Tela.element('div', { 'class': "tela-TemplateSyntax-div-5" }, [Tela.element('pre', { 'class': "tela-TemplateSyntax-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_TemplateSyntax.templateCode}`])])]), Tela.element('h2', { 'class': "tela-TemplateSyntax-h2-7" }, ["Styles"]), Tela.element('p', { 'class': "tela-TemplateSyntax-p-8" }, ["The style block supports three kinds of values: bare numbers (compiled to CSS pixels), string literals (compiled as static CSS), and identifiers (bound as reactive inline styles):"]), Tela.element('div', { 'class': "tela-TemplateSyntax-div-9" }, [Tela.element('pre', { 'class': "tela-TemplateSyntax-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_TemplateSyntax.styleCode}`])])]), Tela.element('h2', { 'class': "tela-TemplateSyntax-h2-11" }, ["Scoped CSS"]), Tela.element('p', { 'class': "tela-TemplateSyntax-p-12" }, ["All static styles are compiled to scoped CSS class names unique to each component. Styles never leak to child or sibling components — no BEM, no CSS modules needed."])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.TemplateSyntax = TemplateSyntax;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TemplateSyntax };
  }
})();