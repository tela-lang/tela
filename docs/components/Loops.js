
const Loops = Tela.defineComponent({
  name: 'Loops',
  
  
  setup(instance) {
    const state_Loops = Tela.reactive({
      whileCode: "",
      breakContinueCode: "",
      forInCode: "",
      classicForCode: ""
    }, instance.update, {});

    

    

    

    

    

    // onMount
    state_Loops.whileCode = window.TELA_DOCS.whileCode;
      state_Loops.breakContinueCode = window.TELA_DOCS.breakContinueCode;
      state_Loops.forInCode = window.TELA_DOCS.forInCode;
      state_Loops.classicForCode = window.TELA_DOCS.classicForCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-Loops-h1-0" }, ["Loops"]), Tela.element('div', { 'class': "tela-Loops-div-1" }, [""]), Tela.element('p', { 'class': "tela-Loops-p-2" }, ["Tela has three looping constructs in function bodies: while, for-in (range over array), and C-style for. In the view, use for-in to render a list of elements."]), Tela.element('h2', { 'class': "tela-Loops-h2-3" }, ["while"]), Tela.element('div', { 'class': "tela-Loops-div-4" }, [Tela.element('pre', { 'class': "tela-Loops-pre-5" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Loops.whileCode}`])])]), Tela.element('h2', { 'class': "tela-Loops-h2-6" }, ["break and continue"]), Tela.element('p', { 'class': "tela-Loops-p-7" }, ["break exits the nearest loop. continue skips the rest of the current iteration."]), Tela.element('div', { 'class': "tela-Loops-div-8" }, [Tela.element('pre', { 'class': "tela-Loops-pre-9" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Loops.breakContinueCode}`])])]), Tela.element('h2', { 'class': "tela-Loops-h2-10" }, ["for-in (function body)"]), Tela.element('p', { 'class': "tela-Loops-p-11" }, ["Range over an array in function logic — great for aggregations."]), Tela.element('div', { 'class': "tela-Loops-div-12" }, [Tela.element('pre', { 'class': "tela-Loops-pre-13" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Loops.forInCode}`])])]), Tela.element('h2', { 'class': "tela-Loops-h2-14" }, ["C-style for"]), Tela.element('p', { 'class': "tela-Loops-p-15" }, ["When you need an index counter, use the classic three-part for loop."]), Tela.element('div', { 'class': "tela-Loops-div-16" }, [Tela.element('pre', { 'class': "tela-Loops-pre-17" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_Loops.classicForCode}`])])]), Tela.element('div', { 'class': "tela-Loops-div-18" }, [Tela.element('div', { 'class': "tela-Loops-div-19" }, ["for-in in the view"]), Tela.element('div', { 'class': "tela-Loops-div-20" }, ["To render a list of elements in the view, use for (item in array) { element { ... } }. See the Control Flow page for view-specific examples."])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.Loops = Loops;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Loops };
  }
})();