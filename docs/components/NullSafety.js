
const NullSafety = Tela.defineComponent({
  name: 'NullSafety',
  
  
  setup(instance) {
    const state_NullSafety = Tela.reactive({
      optionalChainCode: "",
      nullCoalesceCode: ""
    }, instance.update, {});

    

    

    

    // onMount
    state_NullSafety.optionalChainCode = window.TELA_DOCS.optionalChainCode;
      state_NullSafety.nullCoalesceCode = window.TELA_DOCS.nullCoalesceCode;

    return () => {
      
      return Tela.element('div', {  }, [Tela.element('h1', { 'class': "tela-NullSafety-h1-0" }, ["Null Safety"]), Tela.element('div', { 'class': "tela-NullSafety-div-1" }, [""]), Tela.element('p', { 'class': "tela-NullSafety-p-2" }, ["Tela supports optional chaining (?.) and null coalescing (??) to write safe, concise expressions without nested null checks."]), Tela.element('h2', { 'class': "tela-NullSafety-h2-3" }, ["Optional chaining (?.)"]), Tela.element('p', { 'class': "tela-NullSafety-p-4" }, ["Use ?. to safely access a property or call a method on a value that might be null or undefined. The expression short-circuits and returns undefined instead of throwing."]), Tela.element('div', { 'class': "tela-NullSafety-div-5" }, [Tela.element('pre', { 'class': "tela-NullSafety-pre-6" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_NullSafety.optionalChainCode}`])])]), Tela.element('h2', { 'class': "tela-NullSafety-h2-7" }, ["Null coalescing (??)"]), Tela.element('p', { 'class': "tela-NullSafety-p-8" }, ["?? returns the right-hand side when the left is null or undefined — but not when it is 0, false, or an empty string. Use || when you also want to handle empty strings."]), Tela.element('div', { 'class': "tela-NullSafety-div-9" }, [Tela.element('pre', { 'class': "tela-NullSafety-pre-10" }, [Tela.element('code', { 'class': "language-tela" }, [`${state_NullSafety.nullCoalesceCode}`])])]), Tela.element('div', { 'class': "tela-NullSafety-div-11" }, [Tela.element('div', { 'class': "tela-NullSafety-div-12" }, [Tela.element('div', { 'class': "tela-NullSafety-div-13" }, ["?? — null/undefined only"]), Tela.element('div', { 'class': "tela-NullSafety-div-14" }, ["0 ?? 'x'    → 0
false ?? 'x' → false
"" ?? 'x'   → """])]), Tela.element('div', { 'class': "tela-NullSafety-div-15" }, [Tela.element('div', { 'class': "tela-NullSafety-div-16" }, ["|| — any falsy value"]), Tela.element('div', { 'class': "tela-NullSafety-div-17" }, ["0 || 'x'    → 'x'
false || 'x' → 'x'
"" || 'x'   → 'x'"])])])]);
    };
  }
});

(function(){
  if (typeof window !== 'undefined') {
    window.NullSafety = NullSafety;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NullSafety };
  }
})();